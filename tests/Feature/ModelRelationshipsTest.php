<?php

use App\Models\Category;
use App\Models\InventoryLog;
use App\Models\Product;
use App\Models\StudentAccount;
use App\Models\Transaction;
use App\Models\TransactionDetail;
use App\Models\User;
use Illuminate\Database\Eloquent\SoftDeletes;
use OwenIt\Auditing\Auditable;
use Spatie\Permission\Traits\HasRoles;

test('category has many products and supports soft deletes', function () {
    $category = Category::factory()->create();
    $product = Product::factory()->create([
        'category_id' => $category->id,
    ]);

    expect($category->products)->toHaveCount(1)
        ->and($category->products->first()->id)->toBe($product->id)
        ->and($product->category->id)->toBe($category->id);

    $category->delete();
    expect(Category::find($category->id))->toBeNull()
        ->and(Category::withTrashed()->find($category->id))->not->toBeNull();
});

test('transaction detail belongs to transaction and product with disabled timestamps', function () {
    $transaction = Transaction::factory()->create();
    $product = Product::factory()->create();

    $detail = TransactionDetail::factory()->create([
        'transaction_id' => $transaction->id,
        'product_id' => $product->id,
        'quantity' => 3,
        'unit_price' => 15.50,
        'subtotal' => 46.50,
    ]);

    expect($detail->timestamps)->toBeFalse()
        ->and($detail->transaction->id)->toBe($transaction->id)
        ->and($detail->product->id)->toBe($product->id)
        ->and($transaction->details)->toHaveCount(1)
        ->and($transaction->details->first()->id)->toBe($detail->id)
        ->and($product->transactionDetails)->toHaveCount(1)
        ->and($product->transactionDetails->first()->id)->toBe($detail->id);
});

test('inventory log belongs to product and user and connects to inverse relations', function () {
    $user = User::factory()->create();
    $product = Product::factory()->create();

    $log = InventoryLog::factory()->create([
        'product_id' => $product->id,
        'user_id' => $user->id,
        'action' => 'restock',
        'quantity_changed' => 10,
        'previous_stock' => 5,
        'new_stock' => 15,
    ]);

    expect($log->product->id)->toBe($product->id)
        ->and($log->user->id)->toBe($user->id)
        ->and($product->inventoryLogs)->toHaveCount(1)
        ->and($product->inventoryLogs->first()->id)->toBe($log->id)
        ->and($user->inventoryLogs)->toHaveCount(1)
        ->and($user->inventoryLogs->first()->id)->toBe($log->id);
});

test('user model implements auditable, uses expected traits, has fillables, and links to student accounts', function () {
    $parent = User::factory()->create([
        'role' => 'parent',
    ]);

    expect($parent)->toBeInstanceOf(OwenIt\Auditing\Contracts\Auditable::class)
        ->and(in_array(SoftDeletes::class, class_uses_recursive(User::class)))->toBeTrue()
        ->and(in_array(HasRoles::class, class_uses_recursive(User::class)))->toBeTrue()
        ->and(in_array(Auditable::class, class_uses_recursive(User::class)))->toBeTrue()
        ->and($parent->getFillable())->toEqualCanonicalizing([
            'username', 'password', 'full_name', 'email', 'phone', 'role', 'status',
        ]);

    $student = StudentAccount::create([
        'student_id_number' => 'STU-12345',
        'first_name' => 'John',
        'last_name' => 'Doe',
        'grade_level' => 'Grade 10',
        'section' => 'St. Francis',
        'parent_id' => $parent->id,
        'current_balance' => 150.00,
        'daily_spending_limit' => 200.00,
        'is_spending_limited' => true,
        'status' => 'active',
    ]);

    expect($parent->studentAccounts)->toHaveCount(1)
        ->and($parent->studentAccounts->first()->id)->toBe($student->id)
        ->and($student->parent->id)->toBe($parent->id);
});
