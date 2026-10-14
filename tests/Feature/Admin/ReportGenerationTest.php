<?php

use App\Models\BalanceTopup;
use App\Models\Category;
use App\Models\Product;
use App\Models\StudentAccount;
use App\Models\Transaction;
use App\Models\TransactionDetail;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed(RolesAndPermissionsSeeder::class);
});

it('allows admins to view the reports dashboard with accurate sales and topup metrics', function () {
    $admin = User::factory()->admin()->create();
    $cashier = User::factory()->cashier()->create();
    $student = StudentAccount::factory()->create();

    // 1. Completed Cash Transaction
    $cashTx = Transaction::factory()->create([
        'cashier_id' => $cashier->id,
        'student_account_id' => null,
        'total_amount' => 150.00,
        'payment_method' => 'cash',
        'status' => 'completed',
        'created_at' => now()->subDays(2),
    ]);

    // 2. Completed Cashless Transaction
    $cashlessTx = Transaction::factory()->create([
        'cashier_id' => $cashier->id,
        'student_account_id' => $student->id,
        'total_amount' => 200.00,
        'payment_method' => 'cashless',
        'status' => 'completed',
        'created_at' => now()->subDays(1),
    ]);

    // 3. Voided Transaction (should not be in revenue)
    Transaction::factory()->create([
        'cashier_id' => $cashier->id,
        'total_amount' => 80.00,
        'payment_method' => 'cash',
        'status' => 'voided',
        'created_at' => now()->subDays(1),
    ]);

    // 4. Top-Up
    BalanceTopup::factory()->create([
        'student_account_id' => $student->id,
        'cashier_id' => $cashier->id,
        'amount' => 500.00,
        'created_at' => now()->subDays(1),
    ]);

    // 5. Products & Inventory
    $category = Category::factory()->create(['name' => 'Meals']);
    $lowStockProd = Product::factory()->create([
        'category_id' => $category->id,
        'price' => 50.00,
        'stock_quantity' => 3,
        'reorder_level' => 10,
    ]);
    Product::factory()->create([
        'category_id' => $category->id,
        'price' => 20.00,
        'stock_quantity' => 50,
        'reorder_level' => 10,
    ]);

    // Details for top-selling
    TransactionDetail::factory()->create([
        'transaction_id' => $cashTx->id,
        'product_id' => $lowStockProd->id,
        'quantity' => 3,
        'unit_price' => 50.00,
        'subtotal' => 150.00,
    ]);

    $response = $this->actingAs($admin)->get(route('admin.reports.index'));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Reports/Index')
            ->where('metrics.totalRevenue', 350)
            ->where('metrics.cashSales', 150)
            ->where('metrics.cashlessSales', 200)
            ->where('metrics.completedCount', 2)
            ->where('metrics.voidedCount', 1)
            ->where('metrics.totalTopupsAmount', 500)
            ->where('metrics.totalTopupsCount', 1)
            ->where('metrics.lowStockCount', 1)
            ->has('transactions')
            ->has('topProducts')
            ->has('topups')
            ->has('lowStockProducts')
            ->has('filters')
        );
});

it('filters report metrics accurately by date range', function () {
    $admin = User::factory()->admin()->create();

    // Transaction 45 days ago (outside default 30-day window)
    Transaction::factory()->create([
        'total_amount' => 500.00,
        'payment_method' => 'cash',
        'status' => 'completed',
        'created_at' => now()->subDays(45),
    ]);

    // Transaction 3 days ago (inside window)
    Transaction::factory()->create([
        'total_amount' => 120.00,
        'payment_method' => 'cash',
        'status' => 'completed',
        'created_at' => now()->subDays(3),
    ]);

    // Query for last 7 days only
    $startDate = now()->subDays(7)->toDateString();
    $endDate = now()->toDateString();

    $response = $this->actingAs($admin)->get(route('admin.reports.index', [
        'start_date' => $startDate,
        'end_date' => $endDate,
    ]));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Reports/Index')
            ->where('metrics.totalRevenue', 120)
            ->where('metrics.completedCount', 1)
        );
});

it('allows admins to export sales, topups, and inventory reports as CSV', function () {
    $admin = User::factory()->admin()->create();
    $cashier = User::factory()->cashier()->create();
    $student = StudentAccount::factory()->create([
        'first_name' => 'Juan',
        'last_name' => 'Dela Cruz',
        'student_id_number' => 'STCT-2026-0001',
    ]);

    Transaction::factory()->create([
        'receipt_number' => 'RCPT-EXPORT-999',
        'cashier_id' => $cashier->id,
        'student_account_id' => $student->id,
        'total_amount' => 250.00,
        'payment_method' => 'cashless',
        'amount_tendered' => 250.00,
        'change_amount' => 0.00,
        'status' => 'completed',
        'created_at' => now(),
    ]);

    BalanceTopup::factory()->create([
        'reference_number' => 'TOPUP-REF-888',
        'student_account_id' => $student->id,
        'cashier_id' => $cashier->id,
        'amount' => 300.00,
        'previous_balance' => 100.00,
        'new_balance' => 400.00,
        'created_at' => now(),
    ]);

    Product::factory()->create([
        'name' => 'Export Special Sandwich',
        'barcode' => 'STCT-SANDWICH-01',
        'price' => 45.00,
        'cost' => 25.00,
        'stock_quantity' => 15,
        'reorder_level' => 5,
    ]);

    // 1. Sales CSV Export
    $salesResponse = $this->actingAs($admin)->get(route('admin.reports.export', ['type' => 'sales']));
    $salesResponse->assertOk();
    $salesResponse->assertHeader('Content-Type', 'text/csv; charset=UTF-8');
    $salesContent = $salesResponse->streamedContent();
    expect($salesContent)->toContain('Receipt Number')
        ->toContain('RCPT-EXPORT-999')
        ->toContain('Juan Dela Cruz')
        ->toContain('250.00');

    // 2. Top-ups CSV Export
    $topupResponse = $this->actingAs($admin)->get(route('admin.reports.export', ['type' => 'topups']));
    $topupResponse->assertOk();
    $topupResponse->assertHeader('Content-Type', 'text/csv; charset=UTF-8');
    $topupContent = $topupResponse->streamedContent();
    expect($topupContent)->toContain('Reference Number')
        ->toContain('TOPUP-REF-888')
        ->toContain('Juan Dela Cruz')
        ->toContain('300.00');

    // 3. Inventory CSV Export
    $inventoryResponse = $this->actingAs($admin)->get(route('admin.reports.export', ['type' => 'inventory']));
    $inventoryResponse->assertOk();
    $inventoryResponse->assertHeader('Content-Type', 'text/csv; charset=UTF-8');
    $inventoryContent = $inventoryResponse->streamedContent();
    expect($inventoryContent)->toContain('Product Name')
        ->toContain('Export Special Sandwich')
        ->toContain('STCT-SANDWICH-01')
        ->toContain('45.00');
});

it('prevents non-admins from accessing or exporting admin reports', function () {
    $cashier = User::factory()->cashier()->create();
    $parent = User::factory()->parent()->create();

    // Guests redirected to login
    $this->get(route('admin.reports.index'))->assertRedirect(route('login'));
    $this->get(route('admin.reports.export', ['type' => 'sales']))->assertRedirect(route('login'));

    // Cashiers forbidden
    $this->actingAs($cashier)->get(route('admin.reports.index'))->assertForbidden();
    $this->actingAs($cashier)->get(route('admin.reports.export', ['type' => 'sales']))->assertForbidden();

    // Parents forbidden
    $this->actingAs($parent)->get(route('admin.reports.index'))->assertForbidden();
    $this->actingAs($parent)->get(route('admin.reports.export', ['type' => 'sales']))->assertForbidden();
});
