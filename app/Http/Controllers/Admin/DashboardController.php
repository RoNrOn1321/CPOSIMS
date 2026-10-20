<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BalanceTopup;
use App\Models\Category;
use App\Models\InventoryLog;
use App\Models\Product;
use App\Models\StudentAccount;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the Executive Admin Dashboard.
     */
    public function index(Request $request): Response
    {
        $todayStart = Carbon::today()->startOfDay();
        $todayEnd = Carbon::today()->endOfDay();

        // 1. Today's Revenue and Sales
        $todayTransactionsQuery = Transaction::whereBetween('created_at', [$todayStart, $todayEnd])
            ->where('status', 'completed');

        $todayRevenue = (float) (clone $todayTransactionsQuery)->sum('total_amount');
        $cashSalesToday = (float) (clone $todayTransactionsQuery)->where('payment_method', 'cash')->sum('total_amount');
        $cashlessSalesToday = (float) (clone $todayTransactionsQuery)->where('payment_method', 'cashless')->sum('total_amount');
        $todayCompletedCount = (int) (clone $todayTransactionsQuery)->count();

        // 2. Student & RFID Accounts
        $totalStudents = StudentAccount::count();
        $activeStudents = StudentAccount::where('status', 'active')->count();
        $totalBalancePool = (float) StudentAccount::sum('current_balance');

        // 3. Inventory & Menu Health
        $totalProducts = Product::count();
        $lowStockQuery = Product::whereColumn('stock_quantity', '<=', 'reorder_level');
        $lowStockCount = (int) (clone $lowStockQuery)->count();
        $outOfStockCount = (int) Product::where('stock_quantity', '<=', 0)->count();

        // 4. Today's Balance Topups
        $todayTopupsAmount = (float) BalanceTopup::whereBetween('created_at', [$todayStart, $todayEnd])->sum('amount');
        $todayTopupsCount = (int) BalanceTopup::whereBetween('created_at', [$todayStart, $todayEnd])->count();

        // 5. Recent completed sales
        $recentTransactions = Transaction::with([
            'cashier:id,full_name,username',
            'studentAccount:id,student_id_number,first_name,last_name,grade_level,section',
        ])
            ->latest()
            ->limit(7)
            ->get();

        // 6. Low stock products needing attention
        $lowStockProducts = Product::with('category')
            ->whereColumn('stock_quantity', '<=', 'reorder_level')
            ->orderBy('stock_quantity', 'asc')
            ->limit(6)
            ->get();

        // 7. Recent Inventory / Audit Events
        $recentAuditLogs = InventoryLog::with([
            'product' => fn ($q) => $q->withTrashed(),
            'user:id,full_name,username',
        ])
            ->latest()
            ->limit(6)
            ->get();

        // 8. Categories summary
        $categoryBreakdown = Category::withCount('products')
            ->get()
            ->map(fn ($cat) => [
                'id' => $cat->id,
                'name' => $cat->name,
                'products_count' => $cat->products_count,
            ]);

        return Inertia::render('Admin/Dashboard/Index', [
            'metrics' => [
                'todayRevenue' => $todayRevenue,
                'cashSalesToday' => $cashSalesToday,
                'cashlessSalesToday' => $cashlessSalesToday,
                'todayCompletedCount' => $todayCompletedCount,
                'totalStudents' => $totalStudents,
                'activeStudents' => $activeStudents,
                'totalBalancePool' => $totalBalancePool,
                'totalProducts' => $totalProducts,
                'lowStockCount' => $lowStockCount,
                'outOfStockCount' => $outOfStockCount,
                'todayTopupsAmount' => $todayTopupsAmount,
                'todayTopupsCount' => $todayTopupsCount,
            ],
            'recentTransactions' => $recentTransactions,
            'lowStockProducts' => $lowStockProducts,
            'recentAuditLogs' => $recentAuditLogs,
            'categoryBreakdown' => $categoryBreakdown,
        ]);
    }
}
