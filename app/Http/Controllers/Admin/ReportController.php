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
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
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
     * Export reports as formatted Excel (.xlsx) or streaming CSV file.
     */
    public function export(Request $request): StreamedResponse
    {
        $validated = $request->validate([
            'type' => ['required', 'string', 'in:sales,topups,inventory'],
            'format' => ['nullable', 'string', 'in:xlsx,csv'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date'],
        ]);

        $type = $validated['type'];
        $format = $validated['format'] ?? 'xlsx';
        $startDate = $request->input('start_date', now()->subDays(29)->toDateString());
        $endDate = $request->input('end_date', now()->toDateString());

        $startDateTime = Carbon::parse($startDate)->startOfDay();
        $endDateTime = Carbon::parse($endDate)->endOfDay();

        $timestamp = now()->format('Ymd_His');

        if ($format === 'csv') {
            return match ($type) {
                'sales' => $this->exportSalesCsv($startDateTime, $endDateTime, "stct_sales_report_{$startDate}_to_{$endDate}_{$timestamp}.csv"),
                'topups' => $this->exportTopupsCsv($startDateTime, $endDateTime, "stct_topups_report_{$startDate}_to_{$endDate}_{$timestamp}.csv"),
                'inventory' => $this->exportInventoryCsv("stct_inventory_report_{$timestamp}.csv"),
            };
        }

        return match ($type) {
            'sales' => $this->exportSalesXlsx($startDateTime, $endDateTime, "stct_sales_report_{$startDate}_to_{$endDate}_{$timestamp}.xlsx"),
            'topups' => $this->exportTopupsXlsx($startDateTime, $endDateTime, "stct_topups_report_{$startDate}_to_{$endDate}_{$timestamp}.xlsx"),
            'inventory' => $this->exportInventoryXlsx("stct_inventory_report_{$timestamp}.xlsx"),
        };
    }

    /**
     * Export sales transactions as formatted Excel (.xlsx).
     */
    protected function exportSalesXlsx(Carbon $startDateTime, Carbon $endDateTime, string $filename): StreamedResponse
    {
        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();

        $headers = [
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
        ];

        $sheet->fromArray($headers, null, 'A1');

        $rowNumber = 2;
        Transaction::whereBetween('created_at', [$startDateTime, $endDateTime])
            ->with(['cashier', 'studentAccount'])
            ->latest()
            ->chunk(200, function ($transactions) use ($sheet, &$rowNumber) {
                foreach ($transactions as $tx) {
                    $cashierName = $tx->cashier?->full_name ?? $tx->cashier?->username ?? 'N/A';
                    $studentId = $tx->studentAccount?->student_id_number ?? 'N/A';
                    $studentName = $tx->studentAccount
                        ? trim("{$tx->studentAccount->first_name} {$tx->studentAccount->last_name}")
                        : 'Walk-in Customer';

                    $sheet->fromArray([
                        $tx->receipt_number,
                        $tx->created_at->format('Y-m-d H:i:s'),
                        $cashierName,
                        $studentId,
                        $studentName,
                        strtoupper($tx->payment_method),
                        (float) $tx->total_amount,
                        (float) $tx->amount_tendered,
                        (float) $tx->change_amount,
                        strtoupper($tx->status),
                    ], null, "A{$rowNumber}");

                    $rowNumber++;
                }
            });

        $lastRow = max(1, $rowNumber - 1);
        $this->styleReportSheet($sheet, 'Sales Report', $headers, $lastRow);

        if ($lastRow > 1) {
            $sheet->getStyle("A2:A{$lastRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("B2:B{$lastRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("D2:D{$lastRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("F2:F{$lastRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("J2:J{$lastRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

            $sheet->getStyle("G2:I{$lastRow}")
                ->getNumberFormat()
                ->setFormatCode(NumberFormat::FORMAT_NUMBER_COMMA_SEPARATED1);
        }

        return $this->streamSpreadsheet($spreadsheet, $filename);
    }

    /**
     * Export RFID balance top-ups as formatted Excel (.xlsx).
     */
    protected function exportTopupsXlsx(Carbon $startDateTime, Carbon $endDateTime, string $filename): StreamedResponse
    {
        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();

        $headers = [
            'Reference Number',
            'Date & Time',
            'Cashier / Processed By',
            'Student ID',
            'Student Name',
            'Reload Amount (PHP)',
            'Previous Balance (PHP)',
            'New Balance (PHP)',
        ];

        $sheet->fromArray($headers, null, 'A1');

        $rowNumber = 2;
        BalanceTopup::whereBetween('created_at', [$startDateTime, $endDateTime])
            ->with(['cashier', 'studentAccount'])
            ->latest()
            ->chunk(200, function ($topups) use ($sheet, &$rowNumber) {
                foreach ($topups as $topup) {
                    $cashierName = $topup->cashier?->full_name ?? $topup->cashier?->username ?? 'N/A';
                    $studentId = $topup->studentAccount?->student_id_number ?? 'N/A';
                    $studentName = $topup->studentAccount
                        ? trim("{$topup->studentAccount->first_name} {$topup->studentAccount->last_name}")
                        : 'N/A';

                    $sheet->fromArray([
                        $topup->reference_number,
                        $topup->created_at->format('Y-m-d H:i:s'),
                        $cashierName,
                        $studentId,
                        $studentName,
                        (float) $topup->amount,
                        (float) $topup->previous_balance,
                        (float) $topup->new_balance,
                    ], null, "A{$rowNumber}");

                    $rowNumber++;
                }
            });

        $lastRow = max(1, $rowNumber - 1);
        $this->styleReportSheet($sheet, 'RFID Top-Ups Report', $headers, $lastRow);

        if ($lastRow > 1) {
            $sheet->getStyle("A2:A{$lastRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("B2:B{$lastRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("D2:D{$lastRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

            $sheet->getStyle("F2:H{$lastRow}")
                ->getNumberFormat()
                ->setFormatCode(NumberFormat::FORMAT_NUMBER_COMMA_SEPARATED1);
        }

        return $this->streamSpreadsheet($spreadsheet, $filename);
    }

    /**
     * Export products inventory as formatted Excel (.xlsx).
     */
    protected function exportInventoryXlsx(string $filename): StreamedResponse
    {
        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();

        $headers = [
            'Barcode',
            'Product Name',
            'Category',
            'Price (PHP)',
            'Cost (PHP)',
            'Stock Quantity',
            'Reorder Level',
            'Total Valuation (PHP)',
            'Status',
        ];

        $sheet->fromArray($headers, null, 'A1');

        $rowNumber = 2;
        Product::with('category')
            ->orderBy('name')
            ->chunk(200, function ($products) use ($sheet, &$rowNumber) {
                foreach ($products as $prod) {
                    $categoryName = $prod->category?->name ?? 'Uncategorized';
                    $valuation = (float) $prod->price * (int) $prod->stock_quantity;

                    $stockStatus = 'Normal';
                    if ($prod->stock_quantity <= 0) {
                        $stockStatus = 'Out of Stock';
                    } elseif ($prod->stock_quantity <= $prod->reorder_level) {
                        $stockStatus = 'Low Stock';
                    }

                    $sheet->fromArray([
                        $prod->barcode ?? 'N/A',
                        $prod->name,
                        $categoryName,
                        (float) $prod->price,
                        (float) $prod->cost,
                        (int) $prod->stock_quantity,
                        (int) $prod->reorder_level,
                        $valuation,
                        $stockStatus,
                    ], null, "A{$rowNumber}");

                    $rowNumber++;
                }
            });

        $lastRow = max(1, $rowNumber - 1);
        $this->styleReportSheet($sheet, 'Inventory Report', $headers, $lastRow);

        if ($lastRow > 1) {
            $sheet->getStyle("A2:A{$lastRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("I2:I{$lastRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

            $sheet->getStyle("D2:E{$lastRow}")
                ->getNumberFormat()
                ->setFormatCode(NumberFormat::FORMAT_NUMBER_COMMA_SEPARATED1);
            $sheet->getStyle("H2:H{$lastRow}")
                ->getNumberFormat()
                ->setFormatCode(NumberFormat::FORMAT_NUMBER_COMMA_SEPARATED1);

            $sheet->getStyle("F2:G{$lastRow}")
                ->getNumberFormat()
                ->setFormatCode(NumberFormat::FORMAT_NUMBER);
        }

        return $this->streamSpreadsheet($spreadsheet, $filename);
    }

    /**
     * Apply professional styling, brand header colors, and column auto-sizing.
     *
     * @param  array<int, string>  $headers
     */
    protected function styleReportSheet(Worksheet $sheet, string $title, array $headers, int $lastRow): void
    {
        $sheet->setTitle(substr($title, 0, 31));

        $headerCount = count($headers);
        $lastColumn = Coordinate::stringFromColumnIndex($headerCount);
        $headerRange = "A1:{$lastColumn}1";

        // Brand Maroon header styling
        $sheet->getStyle($headerRange)->applyFromArray([
            'font' => [
                'bold' => true,
                'color' => ['rgb' => 'FFFFFF'],
                'size' => 10,
                'name' => 'Calibri',
            ],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => '5C1516'],
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER,
                'wrapText' => false,
            ],
        ]);
        $sheet->getRowDimension(1)->setRowHeight(26);

        // Subtle borders and alternating zebra rows
        if ($lastRow > 1) {
            $sheet->getStyle("A2:{$lastColumn}{$lastRow}")->applyFromArray([
                'font' => [
                    'size' => 10,
                    'name' => 'Calibri',
                ],
                'alignment' => [
                    'vertical' => Alignment::VERTICAL_CENTER,
                ],
                'borders' => [
                    'allBorders' => [
                        'borderStyle' => Border::BORDER_THIN,
                        'color' => ['rgb' => 'E2E8F0'],
                    ],
                ],
            ]);

            for ($row = 2; $row <= $lastRow; $row++) {
                $sheet->getRowDimension($row)->setRowHeight(20);
                if ($row % 2 === 1) {
                    $sheet->getStyle("A{$row}:{$lastColumn}{$row}")->applyFromArray([
                        'fill' => [
                            'fillType' => Fill::FILL_SOLID,
                            'startColor' => ['rgb' => 'F8FAFC'],
                        ],
                    ]);
                }
            }
        }

        // Auto-fit all columns so no cell shows '########' or truncated text
        for ($i = 1; $i <= $headerCount; $i++) {
            $colLetter = Coordinate::stringFromColumnIndex($i);
            $sheet->getColumnDimension($colLetter)->setAutoSize(true);
        }

        // Freeze top header row so it stays visible while scrolling
        $sheet->freezePane('A2');

        // Enable auto-filtering
        $sheet->setAutoFilter($headerRange);
    }

    /**
     * Stream a PhpSpreadsheet instance as an attachment.
     */
    protected function streamSpreadsheet(Spreadsheet $spreadsheet, string $filename): StreamedResponse
    {
        $headers = [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            'Cache-Control' => 'max-age=0, no-cache, no-store, must-revalidate',
            'Pragma' => 'public',
        ];

        return response()->streamDownload(function () use ($spreadsheet) {
            $writer = new Xlsx($spreadsheet);
            $writer->save('php://output');
        }, $filename, $headers);
    }

    /**
     * Stream sales transactions CSV (alias for backward compatibility).
     */
    protected function exportSales(Carbon $startDateTime, Carbon $endDateTime, string $filename): StreamedResponse
    {
        return $this->exportSalesCsv($startDateTime, $endDateTime, $filename);
    }

    /**
     * Stream sales transactions CSV.
     */
    protected function exportSalesCsv(Carbon $startDateTime, Carbon $endDateTime, string $filename): StreamedResponse
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
     * Stream RFID balance top-ups CSV (alias for backward compatibility).
     */
    protected function exportTopups(Carbon $startDateTime, Carbon $endDateTime, string $filename): StreamedResponse
    {
        return $this->exportTopupsCsv($startDateTime, $endDateTime, $filename);
    }

    /**
     * Stream RFID balance top-ups CSV.
     */
    protected function exportTopupsCsv(Carbon $startDateTime, Carbon $endDateTime, string $filename): StreamedResponse
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
     * Stream products inventory CSV (alias for backward compatibility).
     */
    protected function exportInventory(string $filename): StreamedResponse
    {
        return $this->exportInventoryCsv($filename);
    }

    /**
     * Stream products inventory CSV.
     */
    protected function exportInventoryCsv(string $filename): StreamedResponse
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
