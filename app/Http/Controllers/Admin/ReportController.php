<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BalanceTopup;
use App\Models\Product;
use App\Models\Transaction;
use App\Models\TransactionDetail;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportController extends Controller
{
    /**
     * Display the Admin Reports dashboard with financial, topup, and inventory analytics.
     */
    public function index(Request $request): Response
    {
        $startDate = $request->input('start_date', now()->subDays(29)->toDateString());
        $endDate = $request->input('end_date', now()->toDateString());

        $startDateTime = Carbon::parse($startDate)->startOfDay();
        $endDateTime = Carbon::parse($endDate)->endOfDay();

        // 1. Transaction aggregations within date range
        $transactionsQuery = Transaction::whereBetween('created_at', [$startDateTime, $endDateTime]);

        $totalRevenue = (float) (clone $transactionsQuery)->where('status', 'completed')->sum('total_amount');
        $cashSales = (float) (clone $transactionsQuery)->where('status', 'completed')->where('payment_method', 'cash')->sum('total_amount');
        $cashlessSales = (float) (clone $transactionsQuery)->where('status', 'completed')->where('payment_method', 'cashless')->sum('total_amount');
        $completedCount = (int) (clone $transactionsQuery)->where('status', 'completed')->count();
        $voidedCount = (int) (clone $transactionsQuery)->where('status', 'voided')->count();

        $recentTransactions = (clone $transactionsQuery)
            ->with([
                'cashier:id,full_name,username',
                'studentAccount:id,student_id_number,first_name,last_name,grade_level,section',
            ])
            ->latest()
            ->limit(100)
            ->get();

        // 2. Balance top-up aggregations within date range
        $topupsQuery = BalanceTopup::whereBetween('created_at', [$startDateTime, $endDateTime]);

        $totalTopupsAmount = (float) (clone $topupsQuery)->sum('amount');
        $totalTopupsCount = (int) (clone $topupsQuery)->count();

        $recentTopups = (clone $topupsQuery)
            ->with([
                'cashier:id,full_name,username',
                'studentAccount:id,student_id_number,first_name,last_name,grade_level,section',
            ])
            ->latest()
            ->limit(100)
            ->get();

        // 3. Top-selling products within date range
        $topProducts = TransactionDetail::query()
            ->whereHas('transaction', function ($q) use ($startDateTime, $endDateTime) {
                $q->where('status', 'completed')
                    ->whereBetween('created_at', [$startDateTime, $endDateTime]);
            })
            ->select('product_id', DB::raw('SUM(quantity) as total_quantity'), DB::raw('SUM(subtotal) as total_subtotal'))
            ->groupBy('product_id')
            ->orderByDesc('total_quantity')
            ->with(['product' => fn ($q) => $q->withTrashed()->with('category')])
            ->limit(10)
            ->get();

        // 4. Product inventory summary
        $totalValuation = (float) (Product::selectRaw('SUM(price * stock_quantity) as total')->value('total') ?? 0);
        $lowStockProducts = Product::whereColumn('stock_quantity', '<=', 'reorder_level')
            ->with('category')
            ->orderBy('stock_quantity')
            ->get();
        $lowStockCount = $lowStockProducts->count();

        return Inertia::render('Admin/Reports/Index', [
            'metrics' => [
                'totalRevenue' => $totalRevenue,
                'cashSales' => $cashSales,
                'cashlessSales' => $cashlessSales,
                'completedCount' => $completedCount,
                'voidedCount' => $voidedCount,
                'totalTopupsAmount' => $totalTopupsAmount,
                'totalTopupsCount' => $totalTopupsCount,
                'totalValuation' => $totalValuation,
                'lowStockCount' => $lowStockCount,
            ],
            'transactions' => $recentTransactions,
            'topProducts' => $topProducts,
            'topups' => $recentTopups,
            'lowStockProducts' => $lowStockProducts,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
        ]);
    }

    /**
     * Export reports as streaming CSV file.
     */
    public function export(Request $request): StreamedResponse
    {
        $validated = $request->validate([
            'type' => ['required', 'string', 'in:sales,topups,inventory'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date'],
        ]);

        $type = $validated['type'];
        $startDate = $request->input('start_date', now()->subDays(29)->toDateString());
        $endDate = $request->input('end_date', now()->toDateString());

        $startDateTime = Carbon::parse($startDate)->startOfDay();
        $endDateTime = Carbon::parse($endDate)->endOfDay();

        $timestamp = now()->format('Ymd_His');

        return match ($type) {
            'sales' => $this->exportSales($startDateTime, $endDateTime, "stct_sales_report_{$startDate}_to_{$endDate}_{$timestamp}.csv"),
            'topups' => $this->exportTopups($startDateTime, $endDateTime, "stct_topups_report_{$startDate}_to_{$endDate}_{$timestamp}.csv"),
            'inventory' => $this->exportInventory("stct_inventory_report_{$timestamp}.csv"),
        };
    }

    /**
     * Stream sales transactions CSV.
     */
    protected function exportSales(Carbon $startDateTime, Carbon $endDateTime, string $filename): StreamedResponse
    {
        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        return response()->streamDownload(function () use ($startDateTime, $endDateTime) {
            $handle = fopen('php://output', 'w');

            // Write UTF-8 BOM for Microsoft Excel compatibility
            fprintf($handle, chr(0xEF).chr(0xBB).chr(0xBF));

            // Write CSV Header
            fputcsv($handle, [
                'Receipt Number',
                'Date & Time',
                'Cashier',
                'Student ID',
                'Student Name',
                'Payment Method',
                'Total Amount (PHP)',
                'Amount Tendered (PHP)',
                'Change Amount (PHP)',
                'Status',
            ]);

            Transaction::whereBetween('created_at', [$startDateTime, $endDateTime])
                ->with(['cashier', 'studentAccount'])
                ->latest()
                ->chunk(200, function ($transactions) use ($handle) {
                    foreach ($transactions as $tx) {
                        $cashierName = $tx->cashier?->full_name ?? $tx->cashier?->username ?? 'N/A';
                        $studentId = $tx->studentAccount?->student_id_number ?? 'N/A';
                        $studentName = $tx->studentAccount
                            ? trim("{$tx->studentAccount->first_name} {$tx->studentAccount->last_name}")
                            : 'Walk-in Customer';

                        fputcsv($handle, [
                            $tx->receipt_number,
                            $tx->created_at->format('Y-m-d H:i:s'),
                            $cashierName,
                            $studentId,
                            $studentName,
                            strtoupper($tx->payment_method),
                            number_format((float) $tx->total_amount, 2, '.', ''),
                            number_format((float) $tx->amount_tendered, 2, '.', ''),
                            number_format((float) $tx->change_amount, 2, '.', ''),
                            strtoupper($tx->status),
                        ]);
                    }
                });

            fclose($handle);
        }, $filename, $headers);
    }

    /**
     * Stream RFID balance top-ups CSV.
     */
    protected function exportTopups(Carbon $startDateTime, Carbon $endDateTime, string $filename): StreamedResponse
    {
        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        return response()->streamDownload(function () use ($startDateTime, $endDateTime) {
            $handle = fopen('php://output', 'w');

            // Write UTF-8 BOM
            fprintf($handle, chr(0xEF).chr(0xBB).chr(0xBF));

            // Write CSV Header
            fputcsv($handle, [
                'Reference Number',
                'Date & Time',
                'Cashier / Processed By',
                'Student ID',
                'Student Name',
                'Reload Amount (PHP)',
                'Previous Balance (PHP)',
                'New Balance (PHP)',
            ]);

            BalanceTopup::whereBetween('created_at', [$startDateTime, $endDateTime])
                ->with(['cashier', 'studentAccount'])
                ->latest()
                ->chunk(200, function ($topups) use ($handle) {
                    foreach ($topups as $topup) {
                        $cashierName = $topup->cashier?->full_name ?? $topup->cashier?->username ?? 'N/A';
                        $studentId = $topup->studentAccount?->student_id_number ?? 'N/A';
                        $studentName = $topup->studentAccount
                            ? trim("{$topup->studentAccount->first_name} {$topup->studentAccount->last_name}")
                            : 'N/A';

                        fputcsv($handle, [
                            $topup->reference_number,
                            $topup->created_at->format('Y-m-d H:i:s'),
                            $cashierName,
                            $studentId,
                            $studentName,
                            number_format((float) $topup->amount, 2, '.', ''),
                            number_format((float) $topup->previous_balance, 2, '.', ''),
                            number_format((float) $topup->new_balance, 2, '.', ''),
                        ]);
                    }
                });

            fclose($handle);
        }, $filename, $headers);
    }

    /**
     * Stream products inventory CSV.
     */
    protected function exportInventory(string $filename): StreamedResponse
    {
        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        return response()->streamDownload(function () {
            $handle = fopen('php://output', 'w');

            // Write UTF-8 BOM
            fprintf($handle, chr(0xEF).chr(0xBB).chr(0xBF));

            // Write CSV Header
            fputcsv($handle, [
                'Barcode',
                'Product Name',
                'Category',
                'Price (PHP)',
                'Cost (PHP)',
                'Stock Quantity',
                'Reorder Level',
                'Total Valuation (PHP)',
                'Status',
            ]);

            Product::with('category')
                ->orderBy('name')
                ->chunk(200, function ($products) use ($handle) {
                    foreach ($products as $prod) {
                        $categoryName = $prod->category?->name ?? 'Uncategorized';
                        $valuation = (float) $prod->price * (int) $prod->stock_quantity;

                        $stockStatus = 'Normal';
                        if ($prod->stock_quantity <= 0) {
                            $stockStatus = 'Out of Stock';
                        } elseif ($prod->stock_quantity <= $prod->reorder_level) {
                            $stockStatus = 'Low Stock';
                        }

                        fputcsv($handle, [
                            $prod->barcode ?? 'N/A',
                            $prod->name,
                            $categoryName,
                            number_format((float) $prod->price, 2, '.', ''),
                            number_format((float) $prod->cost, 2, '.', ''),
                            $prod->stock_quantity,
                            $prod->reorder_level,
                            number_format($valuation, 2, '.', ''),
                            $stockStatus,
                        ]);
                    }
                });

            fclose($handle);
        }, $filename, $headers);
    }
}
