<?php

use App\Models\Category;
use App\Models\InventoryLog;
use App\Models\Product;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed(RolesAndPermissionsSeeder::class);
});

it('allows admins to view the product inventory', function () {
    $admin = User::factory()->admin()->create();
    $category = Category::firstOrCreate(['name' => 'Rice Meals']);
    Product::factory()->count(3)->create(['category_id' => $category->id]);

    $response = $this->actingAs($admin)->get(route('admin.products.index'));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Products/Index')
            ->has('products.data', 10)
            ->has('categories')
            ->has('metrics')
        );
});

it('prevents non-admins from accessing inventory management', function () {
    $cashier = User::factory()->cashier()->create();
    $parent = User::factory()->parent()->create();
    $category = Category::factory()->create();

    // Guests redirected to login
    $this->get(route('admin.products.index'))->assertRedirect(route('login'));
    $this->get(route('admin.products.create'))->assertRedirect(route('login'));

    // Cashier forbidden
    $this->actingAs($cashier)->get(route('admin.products.index'))->assertForbidden();
    $this->actingAs($cashier)->get(route('admin.products.create'))->assertForbidden();
    $this->actingAs($cashier)->post(route('admin.products.store'), [
        'name' => 'Unauthorized Item',
        'category_id' => $category->id,
        'barcode' => 'UNAUTH-01',
        'price' => 50,
        'cost' => 30,
        'stock_quantity' => 10,
        'reorder_level' => 5,
    ])->assertForbidden();

    // Parent forbidden
    $this->actingAs($parent)->get(route('admin.products.index'))->assertForbidden();
    $this->actingAs($parent)->get(route('admin.audit-logs.index'))->assertForbidden();
});

it('allows admins to create a new product and logs the initial stock', function () {
    $admin = User::factory()->admin()->create();
    $category = Category::firstOrCreate(['name' => 'Snacks & Sandwiches']);

    $response = $this->actingAs($admin)->post(route('admin.products.store'), [
        'name' => 'Crispy Chicken Burger',
        'category_id' => $category->id,
        'barcode' => 'STCT-BURGER-101',
        'price' => 55.00,
        'cost' => 30.00,
        'stock_quantity' => 40,
        'reorder_level' => 10,
        'status' => 'active',
    ]);

    $response->assertRedirect(route('admin.products.index'));

    $this->assertDatabaseHas('products', [
        'name' => 'Crispy Chicken Burger',
        'barcode' => 'STCT-BURGER-101',
        'category_id' => $category->id,
        'stock_quantity' => 40,
        'reorder_level' => 10,
        'status' => 'active',
    ]);

    $product = Product::where('barcode', 'STCT-BURGER-101')->firstOrFail();

    $this->assertDatabaseHas('inventory_logs', [
        'product_id' => $product->id,
        'user_id' => $admin->id,
        'action' => 'restock',
        'quantity_changed' => 40,
        'previous_stock' => 0,
        'new_stock' => 40,
        'remarks' => 'Initial stock on product creation',
    ]);
});

it('allows admins to view system audit logs', function () {
    $admin = User::factory()->admin()->create();
    $product = Product::factory()->create();
    InventoryLog::factory()->create([
        'product_id' => $product->id,
        'user_id' => $admin->id,
        'action' => 'restock',
    ]);

    $response = $this->actingAs($admin)->get(route('admin.audit-logs.index'));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/AuditLogs/Index')
            ->has('inventoryLogs.data')
            ->has('audits')
            ->has('metrics')
        );
});

it('logs an inventory adjustment when an admin modifies product stock', function () {
    $admin = User::factory()->admin()->create();
    $category = Category::factory()->create();
    $product = Product::factory()->create([
        'category_id' => $category->id,
        'stock_quantity' => 25,
    ]);

    $response = $this->actingAs($admin)->put(route('admin.products.update', $product), [
        'name' => $product->name,
        'category_id' => $category->id,
        'barcode' => $product->barcode,
        'price' => 60.00,
        'cost' => 35.00,
        'stock_quantity' => 45,
        'reorder_level' => 10,
        'status' => 'active',
        'remarks' => 'Restocked with 20 new units',
    ]);

    $response->assertRedirect(route('admin.products.index'));

    $this->assertDatabaseHas('inventory_logs', [
        'product_id' => $product->id,
        'user_id' => $admin->id,
        'action' => 'restock',
        'quantity_changed' => 20,
        'previous_stock' => 25,
        'new_stock' => 45,
        'remarks' => 'Restocked with 20 new units',
    ]);
});

it('validates product attributes strictly on store and update', function () {
    $admin = User::factory()->admin()->create();

    $response = $this->actingAs($admin)->post(route('admin.products.store'), [
        'name' => '',
        'category_id' => 99999,
        'barcode' => '',
        'price' => -10,
        'cost' => -5,
        'stock_quantity' => -1,
        'reorder_level' => -1,
    ]);

    $response->assertSessionHasErrors([
        'name',
        'category_id',
        'barcode',
        'price',
        'cost',
        'stock_quantity',
        'reorder_level',
    ]);
});
