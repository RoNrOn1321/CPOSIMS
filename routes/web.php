<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Root redirect to POS portal for easy previewing
Route::get('/', function () {
    return redirect()->route('pos.index');
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

/*
|--------------------------------------------------------------------------
| Temporary Routes for New File Structure
|--------------------------------------------------------------------------
*/

// POS Portal
Route::get('/pos', function () {
    return Inertia::render('POS/Index');
})->name('pos.index');

// Parent Dashboard
Route::get('/parent/dashboard', function () {
    return Inertia::render('ParentDashboard/Index');
})->name('parent.dashboard');

// Admin Panel Routes
Route::prefix('admin')->name('admin.')->group(function () {
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
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
