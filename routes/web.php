<?php

use App\Http\Controllers\Admin\AuditLogController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\Admin\SettingController;
use App\Http\Controllers\Admin\StudentAccountController;
use App\Http\Controllers\BalanceTopupController;
use App\Http\Controllers\ParentDashboardController;
use App\Http\Controllers\ParentStudentLimitController;
use App\Http\Controllers\ParentStudentStatusController;
use App\Http\Controllers\PosCheckoutController;
use App\Http\Controllers\PosController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Root redirect based on role or to login
Route::get('/', function () {
    if (auth()->check()) {
        return match (auth()->user()->role) {
            'admin' => redirect()->route('admin.products.index'),
            'cashier' => redirect()->route('pos.index'),
            'parent' => redirect()->route('parent.dashboard'),
            default => redirect()->route('dashboard'),
        };
    }

    return redirect()->route('login');
});

// Central Dashboard redirector
Route::get('/dashboard', function () {
    return match (auth()->user()->role) {
        'admin' => redirect()->route('admin.products.index'),
        'cashier' => redirect()->route('pos.index'),
        'parent' => redirect()->route('parent.dashboard'),
        default => Inertia::render('Dashboard'),
    };
})->middleware(['auth', 'active'])->name('dashboard');

// POS Portal - Cashier & Admin Access
Route::middleware(['auth', 'active', 'role:admin|cashier'])->prefix('pos')->name('pos.')->group(function () {
    Route::get('/', [PosController::class, 'index'])->name('index');
    Route::get('/student-lookup', [PosController::class, 'lookupStudent'])->name('student.lookup');
    Route::post('/checkout', PosCheckoutController::class)->name('checkout');
    Route::post('/topup', [BalanceTopupController::class, 'posStore'])->name('topup');
    Route::post('/transactions/{transaction}/void', [PosController::class, 'voidTransaction'])->name('transactions.void');
});

// Parent Dashboard - Parent & Admin Access
Route::middleware(['auth', 'active', 'role:parent|admin'])->prefix('parent')->name('parent.')->group(function () {
    Route::get('/dashboard', [ParentDashboardController::class, 'index'])->name('dashboard');
    Route::patch('/student-limits/{student}', [ParentStudentLimitController::class, 'update'])->name('student-limits.update');
    Route::patch('/student-accounts/{student}/status', [ParentStudentStatusController::class, 'update'])->name('student-accounts.status');
    Route::post('/student-accounts/{student}/topup', [BalanceTopupController::class, 'parentStore'])->name('student-accounts.topup');
});

// Admin Panel Routes - Admin Access
Route::middleware(['auth', 'active', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', function () {
        return redirect()->route('admin.products.index');
    });

    Route::resource('products', ProductController::class);
    Route::get('/audit-logs', [AuditLogController::class, 'index'])->name('audit-logs.index');
    Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');
    Route::get('/reports/export', [ReportController::class, 'export'])->name('reports.export');
    Route::get('/students', [StudentAccountController::class, 'index'])->name('students.index');
    Route::post('/students', [StudentAccountController::class, 'store'])->name('students.store');
    Route::put('/students/{student}', [StudentAccountController::class, 'update'])->name('students.update');
    Route::get('/settings', [SettingController::class, 'index'])->name('settings.index');
    Route::post('/settings/users', [SettingController::class, 'storeUser'])->name('settings.users.store');
    Route::put('/settings/users/{user}', [SettingController::class, 'updateUser'])->name('settings.users.update');
    Route::post('/settings/categories', [SettingController::class, 'storeCategory'])->name('settings.categories.store');
    Route::put('/settings/categories/{category}', [SettingController::class, 'updateCategory'])->name('settings.categories.update');
    Route::delete('/settings/categories/{category}', [SettingController::class, 'destroyCategory'])->name('settings.categories.destroy');
});

// Profile Management
Route::middleware(['auth', 'active'])->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
