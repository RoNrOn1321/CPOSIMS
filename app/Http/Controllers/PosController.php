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
                $categoryName = strtolower($product->category?->name ?? '');

                $image = match (true) {
                    str_contains($categoryName, 'supply') ||
                    str_contains($categoryName, 'supplies') ||
                    str_contains($categoryName, 'stationery') ||
                    str_contains($categoryName, 'school') => 'https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=400&q=80',
                    str_contains($categoryName, 'beverage') ||
                    str_contains($categoryName, 'drink') ||
                    str_contains($categoryName, 'juice') => 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&q=80',
                    str_contains($categoryName, 'snack') ||
                    str_contains($categoryName, 'bread') ||
                    str_contains($categoryName, 'sandwich') => 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80',
                    default => 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80',
                };

                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'category' => $product->category?->name ?? 'General',
                    'price' => (float) $product->price,
                    'stock' => (int) $product->stock_quantity,
                    'barcode' => $product->barcode,
                    'image' => $product->image_url ?: $image,
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
        $printerName = 'XP-58';
        $printerPort = 'USB020';
        $printerStatus = 'Normal';

        try {
            if ($osFamily === 'Windows' && function_exists('shell_exec') && ! app()->runningUnitTests()) {
                $scOutput = @shell_exec('sc.exe query Spooler 2>nul');
                if ($scOutput && str_contains($scOutput, 'RUNNING')) {
                    $spoolerStatus = 'running';
                } elseif ($scOutput && str_contains($scOutput, 'STOPPED')) {
                    $spoolerStatus = 'stopped';
                }

                $hidOutput = @shell_exec('pnputil /enum-devices /class HIDClass /connected 2>nul');
                if ($hidOutput) {
                    $hidDevicesCount = substr_count($hidOutput, 'Instance ID:');
                }

                $printerOutput = @shell_exec('pnputil /enum-devices /class PrintQueue /connected 2>nul');
                if ($printerOutput && preg_match('/XP[-_ ]?58|POS[-_ ]?58|Thermal|Xprinter/i', $printerOutput)) {
                    $thermalPrinterDetected = true;
                }
            } elseif ($osFamily === 'Linux' && function_exists('shell_exec') && ! app()->runningUnitTests()) {
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
            'printer_name' => $printerName,
            'printer_port' => $printerPort,
            'printer_status' => $printerStatus,
        ], 200);
    }

    /**
     * Dispatch a formatted 58mm ESC/POS thermal receipt directly to the host XP-58 printer queue.
     */
    public function printReceipt(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type' => ['required', 'string', 'in:sale,topup,diagnostic'],
            'receipt_number' => ['required', 'string', 'max:100'],
            'created_at' => ['nullable', 'string', 'max:100'],
            'cashier_name' => ['nullable', 'string', 'max:100'],
            'customer_name' => ['nullable', 'string', 'max:150'],
            'student_id_number' => ['nullable', 'string', 'max:100'],
            'payment_method' => ['nullable', 'string', 'max:50'],
            'items' => ['nullable', 'array'],
            'items.*.name' => ['required_with:items', 'string', 'max:150'],
            'items.*.quantity' => ['required_with:items', 'integer', 'min:1'],
            'items.*.unit_price' => ['nullable', 'numeric'],
            'items.*.subtotal' => ['required_with:items', 'numeric'],
            'total_amount' => ['required', 'numeric'],
            'amount_tendered' => ['nullable', 'numeric'],
            'change_amount' => ['nullable', 'numeric'],
            'previous_balance' => ['nullable', 'numeric'],
            'new_balance' => ['nullable', 'numeric'],
            'kick_drawer' => ['nullable', 'boolean'],
        ]);

        $rawBytes = $this->buildEscPosReceipt($validated);
        $dispatchResult = $this->sendRawBytesToWindowsPrinter($rawBytes);

        return response()->json([
            'printed' => $dispatchResult['printed'],
            'method' => $dispatchResult['method'],
            'printer' => $dispatchResult['printer'],
            'port' => $dispatchResult['port'],
            'receipt_number' => $validated['receipt_number'],
            'message' => $dispatchResult['printed']
                ? "Receipt #{$validated['receipt_number']} sent to {$dispatchResult['printer']} ({$dispatchResult['port']})."
                : 'Local RAW spooler unavailable; falling back to browser 58mm print.',
        ], 200);
    }

    /**
     * Build a 32-column (58mm Font A) ESC/POS byte stream for the Xprinter XP-58IIH.
     *
     * @param  array<string, mixed>  $data
     */
    private function buildEscPosReceipt(array $data): string
    {
        $esc = "\x1B";
        $init = $esc.'@';
        $alignCenter = $esc.'a'."\x01";
        $alignLeft = $esc.'a'."\x00";
        $boldOn = $esc.'E'."\x01";
        $boldOff = $esc.'E'."\x00";
        // Trigger RJ11 cash drawer solenoid before printing (256ms pulse on both Pin 2 and Pin 5 for full hardware compatibility)
        $drawerKick = ($data['kick_drawer'] ?? true)
            ? ($esc."p\x00\x80\x80".$esc."p\x01\x80\x80")
            : '';

        $divider = str_repeat('-', 32)."\n";
        $type = (string) ($data['type'] ?? 'sale');
        $title = match ($type) {
            'topup' => 'RFID RELOAD RECEIPT',
            'diagnostic' => 'HARDWARE DIAGNOSTIC SLIP',
            default => 'OFFICIAL CANTEEN RECEIPT',
        };

        $timestamp = (string) ($data['created_at'] ?? now()->format('m/d/Y h:i:s A'));
        $cashier = (string) ($data['cashier_name'] ?? (Auth::user()?->full_name ?? Auth::user()?->username ?? 'Cashier'));
        $customer = (string) ($data['customer_name'] ?? 'Walk-in Customer');
        $studentId = (string) ($data['student_id_number'] ?? '');
        $paymentMethod = strtoupper((string) ($data['payment_method'] ?? 'cash')) === 'CASHLESS'
            ? 'RFID CASHLESS'
            : strtoupper((string) ($data['payment_method'] ?? 'CASH'));

        $out = $init.$drawerKick;
        $out .= $alignCenter.$boldOn."SAINT THERESA COLLEGE\n";
        $out .= "OF TANDAG, INC.\n".$boldOff;
        $out .= "Canteen POS & Inventory\n";
        $out .= "Quezon St., Tandag City\n";
        $out .= "TIN: 001-234-567-000 Non-VAT\n";
        $out .= $divider;
        $out .= $boldOn.$title."\n".$boldOff;
        $out .= $divider;

        $out .= $alignLeft;
        $out .= $this->formatEscPosRow('Rcpt No:', (string) $data['receipt_number']);
        $out .= $this->formatEscPosRow('Date:', substr($timestamp, 0, 24));
        $out .= $this->formatEscPosRow('Cashier:', substr($cashier, 0, 22));
        if ($customer !== '') {
            $out .= $this->formatEscPosRow('Customer:', substr($customer, 0, 21));
        }
        if ($studentId !== '') {
            $out .= $this->formatEscPosRow('Student ID:', substr($studentId, 0, 19));
        }

        $out .= $divider;

        $items = is_array($data['items'] ?? null) ? $data['items'] : [];
        if ($type !== 'topup' && count($items) > 0) {
            $out .= $boldOn.$this->formatEscPosRow('ITEM (QTY)', 'AMOUNT').$boldOff;
            foreach ($items as $item) {
                $qty = (int) ($item['quantity'] ?? 1);
                $name = preg_replace('/[^\x20-\x7E]/', '', (string) ($item['name'] ?? 'Item')) ?? 'Item';
                $subtotal = 'P'.number_format((float) ($item['subtotal'] ?? 0), 2);
                $leftLabel = substr($name, 0, 17)." x{$qty}";
                $out .= $this->formatEscPosRow($leftLabel, $subtotal);
            }
            $out .= $divider;
        }

        $totalFormatted = 'P'.number_format((float) ($data['total_amount'] ?? 0), 2);
        $out .= $boldOn.$this->formatEscPosRow('TOTAL AMOUNT:', $totalFormatted).$boldOff;
        $out .= $this->formatEscPosRow('Payment:', $paymentMethod);

        if (isset($data['amount_tendered'])) {
            $tenderedFormatted = 'P'.number_format((float) $data['amount_tendered'], 2);
            $out .= $this->formatEscPosRow('Tendered:', $tenderedFormatted);
        }

        if (isset($data['change_amount']) && (float) $data['change_amount'] > 0) {
            $changeFormatted = 'P'.number_format((float) $data['change_amount'], 2);
            $out .= $boldOn.$this->formatEscPosRow('Change Due:', $changeFormatted).$boldOff;
        }

        if (isset($data['previous_balance']) || isset($data['new_balance'])) {
            $out .= $divider;
            $out .= $alignCenter.$boldOn."[ STUDENT RFID CARD BALANCE ]\n".$boldOff.$alignLeft;
            if (isset($data['previous_balance'])) {
                $out .= $this->formatEscPosRow('Prev Balance:', 'P'.number_format((float) $data['previous_balance'], 2));
            }
            if ($type === 'topup') {
                $out .= $this->formatEscPosRow('Cash Reloaded:', '+P'.number_format((float) ($data['total_amount'] ?? 0), 2));
            } else {
                $out .= $this->formatEscPosRow('Deduction:', '-P'.number_format((float) ($data['total_amount'] ?? 0), 2));
            }
            if (isset($data['new_balance'])) {
                $out .= $boldOn.$this->formatEscPosRow('New Balance:', 'P'.number_format((float) $data['new_balance'], 2)).$boldOff;
            }
        }

        $out .= $divider;
        $out .= $alignCenter;
        $out .= "Thank you for dining at\nSTCT Canteen!\n";
        $out .= "Please keep this receipt.\n\n\n\n";

        return $out;
    }

    /**
     * Format a two-column 32-character line for 58mm thermal paper.
     */
    private function formatEscPosRow(string $left, string $right, int $width = 32): string
    {
        $cleanLeft = preg_replace('/[^\x20-\x7E]/', '', $left) ?? $left;
        $cleanRight = preg_replace('/[^\x20-\x7E]/', '', $right) ?? $right;
        $maxLeft = max(1, $width - strlen($cleanRight) - 1);
        if (strlen($cleanLeft) > $maxLeft) {
            $cleanLeft = substr($cleanLeft, 0, $maxLeft);
        }
        $spaces = max(1, $width - strlen($cleanLeft) - strlen($cleanRight));

        return $cleanLeft.str_repeat(' ', $spaces).$cleanRight."\n";
    }

    /**
     * Send raw ESC/POS bytes to the Windows XP-58 / POS-58 printer queue via winspool.drv,
     * auto-healing the printer port binding if it was assigned to LPT1:.
     *
     * @return array{printed: bool, method: string, printer: string, port: string}
     */
    private function sendRawBytesToWindowsPrinter(string $rawBytes): array
    {
        if (PHP_OS_FAMILY !== 'Windows' || ! function_exists('shell_exec') || app()->runningUnitTests()) {
            return [
                'printed' => false,
                'method' => 'browser_fallback',
                'printer' => 'XP-58',
                'port' => 'USB020',
            ];
        }

        try {
            $base64Payload = base64_encode($rawBytes);
            $psScript = <<<'PS'
$ErrorActionPreference = 'SilentlyContinue'
$printer = Get-Printer | Where-Object { $_.Name -match '^(XP-58|POS-58)' } | Select-Object -First 1
if (-not $printer) {
    Write-Output "ERR|NONE|NONE"
    exit 0
}
$pName = $printer.Name
$portName = $printer.PortName
$usbPort = Get-PrinterPort | Where-Object { $_.Description -match 'POS-58|XP-58' -and $_.Name -match '^USB\d+' } | Select-Object -First 1
if (-not $usbPort) {
    $usbPort = Get-PrinterPort | Where-Object { $_.Name -match '^USB\d+' } | Sort-Object Name -Descending | Select-Object -First 1
}
if ($usbPort -and ($portName -match '^LPT' -or $printer.PrinterStatus -ne 'Normal')) {
    Get-PrintJob -PrinterName $pName | Remove-PrintJob
    Set-Printer -Name $pName -PortName $usbPort.Name
    $portName = $usbPort.Name
}
$code = @"
using System;
using System.Runtime.InteropServices;
public class PosRawPrinter {
    [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
    public class DOCINFOW {
        [MarshalAs(UnmanagedType.LPWStr)] public string pDocName;
        [MarshalAs(UnmanagedType.LPWStr)] public string pOutputFile;
        [MarshalAs(UnmanagedType.LPWStr)] public string pDataType;
    }
    [DllImport("winspool.Drv", EntryPoint = "OpenPrinterW", SetLastError = true, CharSet = CharSet.Unicode, ExactSpelling = true)]
    public static extern bool OpenPrinter(string szPrinter, out IntPtr hPrinter, IntPtr pd);
    [DllImport("winspool.Drv", EntryPoint = "ClosePrinter", SetLastError = true, ExactSpelling = true)]
    public static extern bool ClosePrinter(IntPtr hPrinter);
    [DllImport("winspool.Drv", EntryPoint = "StartDocPrinterW", SetLastError = true, CharSet = CharSet.Unicode, ExactSpelling = true)]
    public static extern bool StartDocPrinter(IntPtr hPrinter, int level, [In, MarshalAs(UnmanagedType.LPStruct)] DOCINFOW di);
    [DllImport("winspool.Drv", EntryPoint = "EndDocPrinter", SetLastError = true, ExactSpelling = true)]
    public static extern bool EndDocPrinter(IntPtr hPrinter);
    [DllImport("winspool.Drv", EntryPoint = "StartPagePrinter", SetLastError = true, ExactSpelling = true)]
    public static extern bool StartPagePrinter(IntPtr hPrinter);
    [DllImport("winspool.Drv", EntryPoint = "EndPagePrinter", SetLastError = true, ExactSpelling = true)]
    public static extern bool EndPagePrinter(IntPtr hPrinter);
    [DllImport("winspool.Drv", EntryPoint = "WritePrinter", SetLastError = true, ExactSpelling = true)]
    public static extern bool WritePrinter(IntPtr hPrinter, IntPtr pBytes, int dwCount, out int dwWritten);
    public static bool Send(string printerName, byte[] bytes) {
        IntPtr hPrinter = IntPtr.Zero;
        DOCINFOW di = new DOCINFOW { pDocName = "CPOSIMS 58mm Receipt", pDataType = "RAW" };
        bool ok = false;
        if (OpenPrinter(printerName, out hPrinter, IntPtr.Zero)) {
            if (StartDocPrinter(hPrinter, 1, di)) {
                if (StartPagePrinter(hPrinter)) {
                    IntPtr ptr = Marshal.AllocCoTaskMem(bytes.Length);
                    Marshal.Copy(bytes, 0, ptr, bytes.Length);
                    int written = 0;
                    ok = WritePrinter(hPrinter, ptr, bytes.Length, out written);
                    Marshal.FreeCoTaskMem(ptr);
                    EndPagePrinter(hPrinter);
                }
                EndDocPrinter(hPrinter);
            }
            ClosePrinter(hPrinter);
        }
        return ok;
    }
}
"@
Add-Type -TypeDefinition $code
$bytes = [Convert]::FromBase64String('__BASE64_PAYLOAD__')
$sent = [PosRawPrinter]::Send($pName, $bytes)
if ($sent) {
    Write-Output "OK|$pName|$portName"
} else {
    Write-Output "ERR|$pName|$portName"
}
PS;
            $psScript = str_replace('__BASE64_PAYLOAD__', $base64Payload, $psScript);
            $encodedCommand = base64_encode(mb_convert_encoding($psScript, 'UTF-16LE', 'UTF-8'));
            $output = trim((string) @shell_exec("powershell -NoProfile -NonInteractive -EncodedCommand {$encodedCommand} 2>nul"));

            if (str_starts_with($output, 'OK|')) {
                $parts = explode('|', $output);

                return [
                    'printed' => true,
                    'method' => 'escpos_raw',
                    'printer' => $parts[1] ?? 'XP-58',
                    'port' => $parts[2] ?? 'USB020',
                ];
            }
        } catch (\Throwable $e) {
            // Fall back to browser printing
        }

        return [
            'printed' => false,
            'method' => 'browser_fallback',
            'printer' => 'XP-58',
            'port' => 'USB020',
        ];
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
