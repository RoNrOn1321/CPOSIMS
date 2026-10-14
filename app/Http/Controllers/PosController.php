<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\InventoryLog;
use App\Models\Product;
use App\Models\StudentAccount;
use App\Models\Transaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class PosController extends Controller
{
    /**
     * Display the POS cashier register view with active products, categories, and recent transactions.
     */
    public function index(): Response
    {
        $products = Product::with('category')
            ->where('status', 'active')
            ->orderBy('name')
            ->get()
            ->map(function (Product $product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'category' => $product->category?->name ?? 'General',
                    'price' => (float) $product->price,
                    'stock' => (int) $product->stock_quantity,
                    'barcode' => $product->barcode,
                    'image' => 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80',
                ];
            })
            ->values()
            ->all();

        $categories = Category::orderBy('name')->pluck('name')->values()->all();

        $recentTransactions = Transaction::with(['details.product', 'studentAccount', 'cashier'])
            ->latest()
            ->take(20)
            ->get()
            ->map(function (Transaction $transaction) {
                return [
                    'id' => $transaction->id,
                    'receipt_number' => $transaction->receipt_number,
                    'total_amount' => (float) $transaction->total_amount,
                    'payment_method' => $transaction->payment_method,
                    'amount_tendered' => (float) $transaction->amount_tendered,
                    'change_amount' => (float) $transaction->change_amount,
                    'status' => $transaction->status,
                    'created_at' => $transaction->created_at->format('M d, Y h:i A'),
                    'raw_created_at' => $transaction->created_at->toISOString(),
                    'cashier_name' => $transaction->cashier?->full_name ?? $transaction->cashier?->username ?? 'Cashier',
                    'student_name' => $transaction->studentAccount
                        ? trim("{$transaction->studentAccount->first_name} {$transaction->studentAccount->last_name}")
                        : 'Walk-in Customer',
                    'items' => $transaction->details->map(fn ($detail) => [
                        'name' => $detail->product?->name ?? 'Cafeteria Item',
                        'quantity' => (int) $detail->quantity,
                        'unit_price' => (float) $detail->unit_price,
                        'subtotal' => (float) $detail->subtotal,
                    ])->values()->all(),
                ];
            })
            ->values()
            ->all();

        return Inertia::render('POS/Index', [
            'products' => $products,
            'categories' => $categories,
            'recentTransactions' => $recentTransactions,
        ]);
    }

    /**
     * Look up student account details by RFID UID or student ID number.
     */
    public function lookupStudent(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'identifier' => ['required', 'string'],
        ]);

        $identifier = trim($validated['identifier']);

        /** @var StudentAccount|null $student */
        $student = StudentAccount::where(function ($query) use ($identifier) {
            $query->where('rfid_uid', $identifier)
                ->orWhere('student_id_number', $identifier);
        })->first();

        if (! $student) {
            return response()->json([
                'message' => 'No student account found for this RFID / ID.',
            ], 404);
        }

        $spentToday = (float) Transaction::where('student_account_id', $student->id)
            ->where('status', 'completed')
            ->whereDate('created_at', today())
            ->sum('total_amount');

        $remainingDailyLimit = $student->is_spending_limited
            ? max(0.00, round((float) $student->daily_spending_limit - $spentToday, 2))
            : null;

        return response()->json([
            'id' => $student->id,
            'student_id_number' => $student->student_id_number,
            'rfid_uid' => $student->rfid_uid,
            'name' => trim("{$student->first_name} {$student->last_name}"),
            'first_name' => $student->first_name,
            'last_name' => $student->last_name,
            'grade_level' => $student->grade_level,
            'section' => $student->section,
            'current_balance' => (float) $student->current_balance,
            'daily_spending_limit' => (float) $student->daily_spending_limit,
            'is_spending_limited' => (bool) $student->is_spending_limited,
            'spent_today' => round($spentToday, 2),
            'remaining_daily_limit' => $remainingDailyLimit,
            'status' => $student->status,
        ], 200);
    }

    /**
     * Safely inspect host operating system hardware status for POS peripherals.
     */
    public function hardwareStatus(): JsonResponse
    {
        $osFamily = PHP_OS_FAMILY;
        $spoolerStatus = 'unknown';
        $hidDevicesCount = 0;
        $thermalPrinterDetected = false;

        try {
            if ($osFamily === 'Windows' && function_exists('shell_exec')) {
                // Check Windows Print Spooler service
                $scOutput = @shell_exec('sc.exe query Spooler 2>nul');
                if ($scOutput && str_contains($scOutput, 'RUNNING')) {
                    $spoolerStatus = 'running';
                } elseif ($scOutput && str_contains($scOutput, 'STOPPED')) {
                    $spoolerStatus = 'stopped';
                }

                // Check connected HID devices
                $hidOutput = @shell_exec('pnputil /enum-devices /class HIDClass /connected 2>nul');
                if ($hidOutput) {
                    $hidDevicesCount = substr_count($hidOutput, 'Instance ID:');
                }

                // Check connected printer queues
                $printerOutput = @shell_exec('pnputil /enum-devices /class PrintQueue /connected 2>nul');
                if ($printerOutput && preg_match('/XP[-_ ]?58|POS[-_ ]?58|Thermal|Xprinter/i', $printerOutput)) {
                    $thermalPrinterDetected = true;
                }
            } elseif ($osFamily === 'Linux' && function_exists('shell_exec')) {
                $cupsOutput = @shell_exec('systemctl is-active cups 2>/dev/null');
                if ($cupsOutput && trim($cupsOutput) === 'active') {
                    $spoolerStatus = 'running';
                }
                $lsusbOutput = @shell_exec('lsusb 2>/dev/null');
                if ($lsusbOutput) {
                    $hidDevicesCount = substr_count($lsusbOutput, 'Bus ');
                    if (preg_match('/printer|XP[-_ ]?58|POS[-_ ]?58/i', $lsusbOutput)) {
                        $thermalPrinterDetected = true;
                    }
                }
            }
        } catch (\Throwable $e) {
            // Silently fall back to default values in restricted or test environments
        }

        return response()->json([
            'server_online' => true,
            'checked_at' => now()->toIso8601String(),
            'os_family' => $osFamily,
            'spooler_status' => $spoolerStatus,
            'hid_devices_count' => $hidDevicesCount,
            'thermal_printer_detected' => $thermalPrinterDetected,
        ], 200);
    }

    /**
     * Void a completed POS transaction, restoring product inventory and refunding student balance if cashless.
     */
    public function voidTransaction(Request $request, Transaction $transaction): JsonResponse|RedirectResponse
    {
        return DB::transaction(function () use ($request, $transaction) {
            /** @var Transaction $lockedTransaction */
            $lockedTransaction = Transaction::where('id', $transaction->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($lockedTransaction->status === 'voided') {
                abort(422, 'Transaction is already voided.');
            }

            $lockedTransaction->load('details.product');

            foreach ($lockedTransaction->details as $detail) {
                /** @var Product|null $product */
                $product = Product::where('id', $detail->product_id)
                    ->lockForUpdate()
                    ->first();

                if ($product) {
                    $previousStock = $product->stock_quantity;
                    $quantity = (int) $detail->quantity;
                    $newStock = $previousStock + $quantity;

                    $product->increment('stock_quantity', $quantity);
                    $product->stock_quantity = $newStock;

                    InventoryLog::create([
                        'product_id' => $product->id,
                        'user_id' => Auth::id(),
                        'action' => 'void',
                        'quantity_changed' => $quantity,
                        'previous_stock' => $previousStock,
                        'new_stock' => $newStock,
                        'remarks' => "Voided POS Receipt #{$lockedTransaction->receipt_number}",
                    ]);
                }
            }

            if ($lockedTransaction->payment_method === 'cashless' && $lockedTransaction->student_account_id) {
                /** @var StudentAccount|null $student */
                $student = StudentAccount::where('id', $lockedTransaction->student_account_id)
                    ->lockForUpdate()
                    ->first();

                if ($student) {
                    $student->increment('current_balance', $lockedTransaction->total_amount);
                }
            }

            $lockedTransaction->update([
                'status' => 'voided',
            ]);

            if ($request->wantsJson() && ! $request->header('X-Inertia')) {
                return response()->json([
                    'message' => "Transaction #{$lockedTransaction->receipt_number} has been voided.",
                    'transaction_id' => $lockedTransaction->id,
                    'status' => 'voided',
                ], 200);
            }

            return redirect()->back()->with('success', "Transaction #{$lockedTransaction->receipt_number} has been voided successfully.");
        });
    }
}
