<?php

use App\Models\InventoryLog;
use App\Models\Product;
use App\Models\StudentAccount;
use App\Models\Transaction;
use App\Models\TransactionDetail;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;

beforeEach(function () {
    $this->seed(RolesAndPermissionsSeeder::class);
});

it('processes a valid cashless transaction and deducts balance', function () {
    $cashier = User::factory()->cashier()->create();
    $student = StudentAccount::factory()->create([
        'current_balance' => 500.00,
        'daily_spending_limit' => 200.00,
        'is_spending_limited' => true,
        'status' => 'active',
    ]);
    $product = Product::factory()->create([
        'price' => 50.00,
        'stock_quantity' => 10,
    ]);

    $payload = [
        'payment_method' => 'cashless',
        'rfid_uid' => $student->rfid_uid,
        'amount_tendered' => 100.00,
        'items' => [
            [
                'product_id' => $product->id,
                'quantity' => 2,
                'unit_price' => 50.00,
            ],
        ],
    ];

    $response = $this->actingAs($cashier)->postJson(route('pos.checkout'), $payload);

    $response->assertStatus(201)
        ->assertJsonPath('message', 'Checkout completed successfully.')
        ->assertJsonPath('receipt.total_amount', 100)
        ->assertJsonPath('receipt.payment_method', 'cashless')
        ->assertJsonPath('receipt.student.remaining_balance', 400);

    expect($student->fresh()->current_balance)->toBe('400.00')
        ->and($product->fresh()->stock_quantity)->toBe(8);

    $this->assertDatabaseHas('transactions', [
        'cashier_id' => $cashier->id,
        'student_account_id' => $student->id,
        'total_amount' => 100.00,
        'payment_method' => 'cashless',
        'amount_tendered' => 100.00,
        'change_amount' => 0.00,
        'status' => 'completed',
    ]);

    $this->assertDatabaseHas('transaction_details', [
        'product_id' => $product->id,
        'quantity' => 2,
        'unit_price' => 50.00,
        'subtotal' => 100.00,
    ]);
});

it('blocks cashless transaction if rfid card is marked as lost_card', function () {
    $cashier = User::factory()->cashier()->create();
    $student = StudentAccount::factory()->lostCard()->create([
        'current_balance' => 500.00,
        'daily_spending_limit' => 200.00,
    ]);
    $product = Product::factory()->create([
        'price' => 50.00,
        'stock_quantity' => 10,
    ]);

    $payload = [
        'payment_method' => 'cashless',
        'rfid_uid' => $student->rfid_uid,
        'amount_tendered' => 50.00,
        'items' => [
            [
                'product_id' => $product->id,
                'quantity' => 1,
                'unit_price' => 50.00,
            ],
        ],
    ];

    $response = $this->actingAs($cashier)->postJson(route('pos.checkout'), $payload);

    $response->assertStatus(403);

    expect($student->fresh()->current_balance)->toBe('500.00')
        ->and($product->fresh()->stock_quantity)->toBe(10)
        ->and(Transaction::count())->toBe(0);
});

it('blocks cashless transaction if balance is insufficient', function () {
    $cashier = User::factory()->cashier()->create();
    $student = StudentAccount::factory()->create([
        'current_balance' => 30.00,
        'daily_spending_limit' => 200.00,
        'status' => 'active',
    ]);
    $product = Product::factory()->create([
        'price' => 50.00,
        'stock_quantity' => 10,
    ]);

    $payload = [
        'payment_method' => 'cashless',
        'rfid_uid' => $student->rfid_uid,
        'amount_tendered' => 50.00,
        'items' => [
            [
                'product_id' => $product->id,
                'quantity' => 1,
                'unit_price' => 50.00,
            ],
        ],
    ];

    $response = $this->actingAs($cashier)->postJson(route('pos.checkout'), $payload);

    $response->assertStatus(403);

    expect($student->fresh()->current_balance)->toBe('30.00')
        ->and($product->fresh()->stock_quantity)->toBe(10)
        ->and(Transaction::count())->toBe(0);
});

it('blocks cashless transaction if daily spending limit is exceeded', function () {
    $cashier = User::factory()->cashier()->create();
    $student = StudentAccount::factory()->create([
        'current_balance' => 500.00,
        'daily_spending_limit' => 100.00,
        'is_spending_limited' => true,
        'status' => 'active',
    ]);

    // Create prior transaction of 80.00 today
    Transaction::factory()->create([
        'cashier_id' => $cashier->id,
        'student_account_id' => $student->id,
        'total_amount' => 80.00,
        'payment_method' => 'cashless',
        'status' => 'completed',
        'created_at' => now(),
    ]);

    $product = Product::factory()->create([
        'price' => 30.00,
        'stock_quantity' => 10,
    ]);

    // 80.00 + 30.00 = 110.00, which exceeds 100.00 daily limit
    $payload = [
        'payment_method' => 'cashless',
        'rfid_uid' => $student->rfid_uid,
        'amount_tendered' => 30.00,
        'items' => [
            [
                'product_id' => $product->id,
                'quantity' => 1,
                'unit_price' => 30.00,
            ],
        ],
    ];

    $response = $this->actingAs($cashier)->postJson(route('pos.checkout'), $payload);

    $response->assertStatus(403);

    expect($student->fresh()->current_balance)->toBe('500.00')
        ->and($product->fresh()->stock_quantity)->toBe(10)
        ->and(Transaction::count())->toBe(1);
});

it('decrements product stock and generates an inventory log on successful sale', function () {
    $cashier = User::factory()->cashier()->create();
    $student = StudentAccount::factory()->create([
        'current_balance' => 300.00,
        'daily_spending_limit' => 300.00,
        'is_spending_limited' => true,
        'status' => 'active',
    ]);
    $product = Product::factory()->create([
        'price' => 20.00,
        'stock_quantity' => 25,
    ]);

    $payload = [
        'payment_method' => 'cashless',
        'rfid_uid' => $student->rfid_uid,
        'amount_tendered' => 60.00,
        'items' => [
            [
                'product_id' => $product->id,
                'quantity' => 3,
                'unit_price' => 20.00,
            ],
        ],
    ];

    $response = $this->actingAs($cashier)->postJson(route('pos.checkout'), $payload);

    $response->assertStatus(201);

    expect($product->fresh()->stock_quantity)->toBe(22);

    $this->assertDatabaseHas('inventory_logs', [
        'product_id' => $product->id,
        'user_id' => $cashier->id,
        'action' => 'sale',
        'quantity_changed' => 3,
        'previous_stock' => 25,
        'new_stock' => 22,
    ]);
});

it('rolls back the entire transaction if a product is out of stock', function () {
    $cashier = User::factory()->cashier()->create();
    $student = StudentAccount::factory()->create([
        'current_balance' => 500.00,
        'daily_spending_limit' => 500.00,
        'is_spending_limited' => true,
        'status' => 'active',
    ]);
    $productA = Product::factory()->create([
        'price' => 20.00,
        'stock_quantity' => 10,
    ]);
    $productB = Product::factory()->create([
        'price' => 30.00,
        'stock_quantity' => 2,
    ]);

    // Request 2 of Product A and 5 of Product B (Product B has only 2 in stock!)
    $payload = [
        'payment_method' => 'cashless',
        'rfid_uid' => $student->rfid_uid,
        'amount_tendered' => 190.00,
        'items' => [
            [
                'product_id' => $productA->id,
                'quantity' => 2,
                'unit_price' => 20.00,
            ],
            [
                'product_id' => $productB->id,
                'quantity' => 5,
                'unit_price' => 30.00,
            ],
        ],
    ];

    $response = $this->actingAs($cashier)->postJson(route('pos.checkout'), $payload);

    $response->assertStatus(422);

    // Verify atomic rollback across all affected entities
    expect($productA->fresh()->stock_quantity)->toBe(10)
        ->and($productB->fresh()->stock_quantity)->toBe(2)
        ->and($student->fresh()->current_balance)->toBe('500.00')
        ->and(Transaction::count())->toBe(0)
        ->and(TransactionDetail::count())->toBe(0)
        ->and(InventoryLog::count())->toBe(0);
});

it('processes a valid cash transaction and computes change', function () {
    $cashier = User::factory()->cashier()->create();
    $product = Product::factory()->create([
        'price' => 45.00,
        'stock_quantity' => 15,
    ]);

    $payload = [
        'payment_method' => 'cash',
        'amount_tendered' => 100.00,
        'items' => [
            [
                'product_id' => $product->id,
                'quantity' => 2,
                'unit_price' => 45.00,
            ],
        ],
    ];

    $response = $this->actingAs($cashier)->postJson(route('pos.checkout'), $payload);

    $response->assertStatus(201)
        ->assertJsonPath('receipt.total_amount', 90)
        ->assertJsonPath('receipt.amount_tendered', 100)
        ->assertJsonPath('receipt.change_amount', 10);

    expect($product->fresh()->stock_quantity)->toBe(13);

    $this->assertDatabaseHas('transactions', [
        'cashier_id' => $cashier->id,
        'student_account_id' => null,
        'total_amount' => 90.00,
        'payment_method' => 'cash',
        'amount_tendered' => 100.00,
        'change_amount' => 10.00,
        'status' => 'completed',
    ]);
});

it('blocks unauthorized access for users without cashier or admin role', function () {
    $parent = User::factory()->parent()->create();
    $product = Product::factory()->create();

    $payload = [
        'payment_method' => 'cash',
        'amount_tendered' => 100.00,
        'items' => [
            [
                'product_id' => $product->id,
                'quantity' => 1,
                'unit_price' => (float) $product->price,
            ],
        ],
    ];

    $response = $this->actingAs($parent)->postJson(route('pos.checkout'), $payload);

    $response->assertStatus(403);
});
