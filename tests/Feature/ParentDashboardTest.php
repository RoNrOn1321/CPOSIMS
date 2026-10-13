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

it('allows parents to view their own linked student accounts', function () {
    $parent = User::factory()->parent()->create();
    $child = StudentAccount::factory()->create([
        'parent_id' => $parent->id,
        'first_name' => 'Juan',
        'last_name' => 'Dela Cruz',
        'current_balance' => 450.00,
        'daily_spending_limit' => 120.00,
    ]);

    $response = $this->actingAs($parent)->get(route('parent.dashboard'));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('ParentDashboard/Index')
        ->has('students', 1)
        ->where('students.0.id', $child->id)
        ->where('students.0.name', 'Juan Dela Cruz')
        ->where('students.0.balance', 450)
        ->where('students.0.dailyLimit', 120)
    );
});

it('prevents parents from viewing student accounts linked to other parents', function () {
    $parentA = User::factory()->parent()->create();
    $parentB = User::factory()->parent()->create();

    $childA = StudentAccount::factory()->create([
        'parent_id' => $parentA->id,
        'first_name' => 'Child',
        'last_name' => 'Alpha',
    ]);

    $childB = StudentAccount::factory()->create([
        'parent_id' => $parentB->id,
        'first_name' => 'Child',
        'last_name' => 'Beta',
    ]);

    $response = $this->actingAs($parentA)->get(route('parent.dashboard'));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('ParentDashboard/Index')
        ->has('students', 1)
        ->where('students.0.id', $childA->id)
        ->where('students.0.name', 'Child Alpha')
    );
});

it('allows parents to update the daily spending limit of their child', function () {
    $parent = User::factory()->parent()->create();
    $child = StudentAccount::factory()->create([
        'parent_id' => $parent->id,
        'daily_spending_limit' => 100.00,
    ]);

    $response = $this->actingAs($parent)->patch(
        route('parent.student-limits.update', $child),
        ['daily_limit' => 250.00]
    );

    $response->assertRedirect();
    $response->assertSessionHas('success');

    expect($child->fresh()->daily_spending_limit)->toBe('250.00');
});

it('prevents parents from updating the limit of a child that is not theirs', function () {
    $parentA = User::factory()->parent()->create();
    $parentB = User::factory()->parent()->create();

    $childB = StudentAccount::factory()->create([
        'parent_id' => $parentB->id,
        'daily_spending_limit' => 100.00,
    ]);

    $response = $this->actingAs($parentA)->patch(
        route('parent.student-limits.update', $childB),
        ['daily_limit' => 500.00]
    );

    $response->assertForbidden();

    expect($childB->fresh()->daily_spending_limit)->toBe('100.00');
});

it('validates daily spending limit input', function () {
    $parent = User::factory()->parent()->create();
    $child = StudentAccount::factory()->create([
        'parent_id' => $parent->id,
        'daily_spending_limit' => 100.00,
    ]);

    $response = $this->actingAs($parent)->patch(
        route('parent.student-limits.update', $child),
        ['daily_limit' => -50]
    );

    $response->assertSessionHasErrors('daily_limit');
    expect($child->fresh()->daily_spending_limit)->toBe('100.00');
});

it('prevents unauthenticated guests or non-parents from updating student limits', function () {
    $child = StudentAccount::factory()->create([
        'daily_spending_limit' => 100.00,
    ]);
    $cashier = User::factory()->cashier()->create();

    // Guest redirected to login
    $this->patch(route('parent.student-limits.update', $child), ['daily_limit' => 200.00])
        ->assertRedirect('/login');

    // Cashier forbidden
    $this->actingAs($cashier)
        ->patch(route('parent.student-limits.update', $child), ['daily_limit' => 200.00])
        ->assertForbidden();

    expect($child->fresh()->daily_spending_limit)->toBe('100.00');
});

it('includes itemized transaction history and products in the dashboard prop', function () {
    $parent = User::factory()->parent()->create();
    $child = StudentAccount::factory()->create(['parent_id' => $parent->id]);
    $cashier = User::factory()->cashier()->create();
    $category = Category::factory()->create(['name' => 'Rice Meals']);
    $product = Product::factory()->create([
        'name' => 'Chicken Adobo Rice Bowl',
        'category_id' => $category->id,
    ]);

    $transaction = Transaction::factory()->create([
        'student_account_id' => $child->id,
        'cashier_id' => $cashier->id,
        'total_amount' => 85.00,
        'payment_method' => 'cashless',
        'status' => 'completed',
    ]);

    TransactionDetail::factory()->create([
        'transaction_id' => $transaction->id,
        'product_id' => $product->id,
        'quantity' => 1,
        'unit_price' => 85.00,
        'subtotal' => 85.00,
    ]);

    $response = $this->actingAs($parent)->get(route('parent.dashboard'));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('ParentDashboard/Index')
        ->has('students.0.transactions', 1)
        ->where('students.0.transactions.0.id', $transaction->receipt_number)
        ->where('students.0.transactions.0.items.0.name', 'Chicken Adobo Rice Bowl')
        ->where('students.0.transactions.0.items.0.category', 'Rice Meals')
    );
});
