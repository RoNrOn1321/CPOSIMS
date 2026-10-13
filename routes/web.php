<?php

use App\Http\Controllers\PosCheckoutController;
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
    Route::get('/', function () {
        return Inertia::render('POS/Index');
    })->name('index');

    Route::post('/checkout', PosCheckoutController::class)->name('checkout');
});

// Parent Dashboard - Parent & Admin Access
Route::middleware(['auth', 'active', 'role:parent|admin'])->group(function () {
    Route::get('/parent/dashboard', function () {
        return Inertia::render('ParentDashboard/Index');
    })->name('parent.dashboard');
});

// Admin Panel Routes - Admin Access
Route::middleware(['auth', 'active', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', function () {
        return redirect()->route('admin.products.index');
    });

    Route::get('/products', function () {
        return Inertia::render('Admin/Products/Index');
    })->name('products.index');

    Route::get('/products/create', function () {
        return Inertia::render('Admin/Products/Create');
    })->name('products.create');

    Route::get('/products/edit', function () {
        return Inertia::render('Admin/Products/Edit');
    })->name('products.edit');

    Route::get('/audit-logs', function () {
        return Inertia::render('Admin/AuditLogs/Index');
    })->name('audit-logs.index');
});

// Profile Management
Route::middleware(['auth', 'active'])->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
