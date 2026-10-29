<?php

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

it('renders POS register with live active products, categories, and recent transactions', function () {
    $cashier = User::factory()->cashier()->create();
    $category = Category::firstOrCreate(['name' => 'Rice Meals']);
    $activeProduct = Product::factory()->create([
        'category_id' => $category->id,
        'name' => 'Chicken Adobo Bowl',
        'price' => 75.00,
        'stock_quantity' => 20,
        'status' => 'active',
    ]);
    $inactiveProduct = Product::factory()->create([
        'category_id' => $category->id,
        'name' => 'Discontinued Item',
        'status' => 'inactive',
    ]);

    $student = StudentAccount::factory()->create([
        'first_name' => 'Juan',
        'last_name' => 'Dela Cruz',
    ]);

    $transaction = Transaction::factory()->create([
        'cashier_id' => $cashier->id,
        'student_account_id' => $student->id,
        'total_amount' => 75.00,
        'payment_method' => 'cashless',
        'status' => 'completed',
    ]);

    TransactionDetail::factory()->create([
        'transaction_id' => $transaction->id,
        'product_id' => $activeProduct->id,
        'quantity' => 1,
        'unit_price' => 75.00,
        'subtotal' => 75.00,
    ]);

    $response = $this->actingAs($cashier)->get(route('pos.index'));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('POS/Index')
        ->has('products', 8)
        ->where('products', function ($products) use ($activeProduct) {
            $items = collect($products);

            $ballpen = $items->firstWhere('barcode', 'STCT-2001');
            $water = $items->firstWhere('barcode', 'STCT-1003');
            $sandwich = $items->firstWhere('barcode', 'STCT-1002');
            $meal = $items->firstWhere('id', $activeProduct->id);

            return $items->contains('id', $activeProduct->id)
                && $ballpen !== null
                && $ballpen['image'] === null
                && $water !== null
                && $sandwich !== null
                && $meal !== null;
        })
        ->has('categories')
        ->has('recentTransactions', 1)
        ->where('recentTransactions.0.receipt_number', $transaction->receipt_number)
        ->where('recentTransactions.0.student_name', 'Juan Dela Cruz')
    );
});

it('blocks unauthorized users from viewing the POS portal', function () {
    $parent = User::factory()->parent()->create();

    // Guests redirected to login
    $this->get(route('pos.index'))->assertRedirect('/login');

    // Parents forbidden
    $this->actingAs($parent)->get(route('pos.index'))->assertForbidden();
});

it('looks up a student account by RFID UID or student ID number', function () {
    $cashier = User::factory()->cashier()->create();
    $student = StudentAccount::factory()->create([
        'rfid_uid' => 'CARD-123456',
        'student_id_number' => 'STU-2026-0099',
        'first_name' => 'Pedro',
        'last_name' => 'Penduko',
        'current_balance' => 450.00,
        'daily_spending_limit' => 150.00,
        'is_spending_limited' => true,
        'status' => 'active',
    ]);

    // Create earlier completed transaction of 50 today
    Transaction::factory()->create([
        'cashier_id' => $cashier->id,
        'student_account_id' => $student->id,
        'total_amount' => 50.00,
        'status' => 'completed',
        'created_at' => now(),
    ]);

    // 1. Lookup by RFID UID
    $response = $this->actingAs($cashier)->getJson(route('pos.student.lookup', ['identifier' => 'CARD-123456']));

    $response->assertOk()
        ->assertJsonPath('id', $student->id)
        ->assertJsonPath('name', 'Pedro Penduko')
        ->assertJsonPath('current_balance', 450)
        ->assertJsonPath('daily_spending_limit', 150)
        ->assertJsonPath('spent_today', 50)
        ->assertJsonPath('remaining_daily_limit', 100)
        ->assertJsonPath('status', 'active');

    // 2. Lookup by Student ID Number
    $idResponse = $this->actingAs($cashier)->getJson(route('pos.student.lookup', ['identifier' => 'STU-2026-0099']));

    $idResponse->assertOk()
        ->assertJsonPath('id', $student->id)
        ->assertJsonPath('name', 'Pedro Penduko');
});

it('returns 404 when student lookup identifier is not found', function () {
    $cashier = User::factory()->cashier()->create();

    $response = $this->actingAs($cashier)->getJson(route('pos.student.lookup', ['identifier' => 'UNKNOWN-CARD']));

    $response->assertStatus(404)
        ->assertJsonPath('message', 'No student account found for this RFID / ID.');
});

it('voids a completed cashless transaction, restores product stock, creates void inventory log, and refunds balance', function () {
    $cashier = User::factory()->cashier()->create();
    $student = StudentAccount::factory()->create([
        'current_balance' => 200.00,
        'status' => 'active',
    ]);
    $product = Product::factory()->create([
        'price' => 50.00,
        'stock_quantity' => 15,
    ]);

    $transaction = Transaction::factory()->create([
        'cashier_id' => $cashier->id,
        'student_account_id' => $student->id,
        'total_amount' => 100.00,
        'payment_method' => 'cashless',
        'status' => 'completed',
    ]);

    TransactionDetail::factory()->create([
        'transaction_id' => $transaction->id,
        'product_id' => $product->id,
        'quantity' => 2,
        'unit_price' => 50.00,
        'subtotal' => 100.00,
    ]);

    $response = $this->actingAs($cashier)->postJson(route('pos.transactions.void', $transaction));

    $response->assertOk()
        ->assertJsonPath('status', 'voided');

    expect($transaction->fresh()->status)->toBe('voided')
        ->and($product->fresh()->stock_quantity)->toBe(17) // 15 + 2 restored
        ->and((float) $student->fresh()->current_balance)->toBe(300.00); // 200 + 100 refunded

    $this->assertDatabaseHas('inventory_logs', [
        'product_id' => $product->id,
        'user_id' => $cashier->id,
        'action' => 'void',
        'quantity_changed' => 2,
        'previous_stock' => 15,
        'new_stock' => 17,
        'remarks' => "Voided POS Receipt #{$transaction->receipt_number}",
    ]);
});

it('prevents voiding an already voided transaction', function () {
    $cashier = User::factory()->cashier()->create();
    $transaction = Transaction::factory()->create([
        'cashier_id' => $cashier->id,
        'status' => 'voided',
    ]);

    $response = $this->actingAs($cashier)->postJson(route('pos.transactions.void', $transaction));

    $response->assertStatus(422);
});

it('allows a parent to freeze and reactivate their child card status', function () {
    $parent = User::factory()->parent()->create();
    $child = StudentAccount::factory()->create([
        'parent_id' => $parent->id,
        'status' => 'active',
    ]);

    // Freeze card as lost_card
    $freezeResponse = $this->actingAs($parent)->patch(
        route('parent.student-accounts.status', $child),
        ['status' => 'lost_card']
    );

    $freezeResponse->assertRedirect();
    expect($child->fresh()->status)->toBe('lost_card');

    // Reactivate card to active
    $reactivateResponse = $this->actingAs($parent)->patch(
        route('parent.student-accounts.status', $child),
        ['status' => 'active']
    );

    $reactivateResponse->assertRedirect();
    expect($child->fresh()->status)->toBe('active');
});

it('prevents a parent from toggling card status of another parent child', function () {
    $parentA = User::factory()->parent()->create();
    $parentB = User::factory()->parent()->create();

    $childB = StudentAccount::factory()->create([
        'parent_id' => $parentB->id,
        'status' => 'active',
    ]);

    $response = $this->actingAs($parentA)->patch(
        route('parent.student-accounts.status', $childB),
        ['status' => 'lost_card']
    );

    $response->assertForbidden();
    expect($childB->fresh()->status)->toBe('active');
});

it('immediately blocks POS purchases and reloads when card is frozen as lost_card', function () {
    $parent = User::factory()->parent()->create();
    $cashier = User::factory()->cashier()->create();
    $product = Product::factory()->create([
        'price' => 50.00,
        'stock_quantity' => 10,
    ]);

    $child = StudentAccount::factory()->create([
        'parent_id' => $parent->id,
        'current_balance' => 200.00,
        'daily_spending_limit' => 200.00,
        'status' => 'active',
    ]);

    // Parent freezes card
    $this->actingAs($parent)->patch(
        route('parent.student-accounts.status', $child),
        ['status' => 'lost_card']
    )->assertRedirect();

    expect($child->fresh()->status)->toBe('lost_card');

    // POS Checkout attempt: must be blocked with 403
    $checkoutPayload = [
        'payment_method' => 'cashless',
        'rfid_uid' => $child->rfid_uid,
        'amount_tendered' => 50.00,
        'items' => [
            [
                'product_id' => $product->id,
                'quantity' => 1,
                'unit_price' => 50.00,
            ],
        ],
    ];

    $this->actingAs($cashier)
        ->postJson(route('pos.checkout'), $checkoutPayload)
        ->assertStatus(403);

    // POS Reload attempt: must be blocked with 403
    $this->actingAs($cashier)
        ->postJson(route('pos.topup'), [
            'rfid_uid' => $child->rfid_uid,
            'amount' => 100.00,
        ])
        ->assertStatus(403);

    // Verify balance & stock remained unchanged
    expect((float) $child->fresh()->current_balance)->toBe(200.00)
        ->and($product->fresh()->stock_quantity)->toBe(10);
});

it('returns server hardware status for authenticated cashiers', function () {
    $cashier = User::factory()->cashier()->create();

    $response = $this->actingAs($cashier)->getJson(route('pos.hardware.status'));

    $response->assertOk()
        ->assertJsonPath('server_online', true)
        ->assertJsonStructure([
            'server_online',
            'checked_at',
            'os_family',
            'spooler_status',
            'hid_devices_count',
            'thermal_printer_detected',
        ]);
});

it('blocks unauthenticated or unauthorized users from hardware status endpoint', function () {
    $parent = User::factory()->parent()->create();

    // Guests redirected to login
    $this->get(route('pos.hardware.status'))->assertRedirect('/login');

    // Parents forbidden
    $this->actingAs($parent)->get(route('pos.hardware.status'))->assertForbidden();
});

it('processes a 58mm thermal receipt print payload for authenticated cashiers', function () {
    $cashier = User::factory()->cashier()->create();

    $response = $this->actingAs($cashier)->postJson(route('pos.hardware.print'), [
        'type' => 'sale',
        'receipt_number' => 'RCPT-20261017-TEST',
        'cashier_name' => 'Canteen Staff',
        'customer_name' => 'Juan Dela Cruz',
        'payment_method' => 'cash',
        'items' => [
            [
                'name' => 'Chicken Adobo Bowl',
                'quantity' => 1,
                'unit_price' => 75.00,
                'subtotal' => 75.00,
            ],
        ],
        'total_amount' => 75.00,
        'amount_tendered' => 100.00,
        'change_amount' => 25.00,
        'kick_drawer' => true,
    ]);

    $response->assertOk()
        ->assertJsonPath('receipt_number', 'RCPT-20261017-TEST')
        ->assertJsonStructure([
            'printed',
            'method',
            'printer',
            'port',
            'receipt_number',
            'message',
        ]);
});
