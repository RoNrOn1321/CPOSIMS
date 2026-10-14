<?php

use App\Models\Category;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed(RolesAndPermissionsSeeder::class);
});

it('allows admins to view the settings page with users and categories', function () {
    $admin = User::factory()->admin()->create();
    Category::factory()->count(3)->create();

    $response = $this->actingAs($admin)->get(route('admin.settings.index'));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Settings/Index')
            ->has('users.data')
            ->has('categories')
            ->has('metrics')
            ->has('filters')
        );
});

it('allows admins to create a new parent or faculty user and assigns the Spatie role', function () {
    $admin = User::factory()->admin()->create();

    $response = $this->actingAs($admin)->post(route('admin.settings.users.store'), [
        'username' => 'parent_clara',
        'full_name' => 'Clara Del Rosario',
        'email' => 'clara@example.com',
        'phone' => '09123456789',
        'role' => 'parent',
        'status' => 'active',
        'password' => 'SecurePass123!',
    ]);

    $response->assertRedirect(route('admin.settings.index'));
    $response->assertSessionHas('success');

    $this->assertDatabaseHas('users', [
        'username' => 'parent_clara',
        'full_name' => 'Clara Del Rosario',
        'email' => 'clara@example.com',
        'role' => 'parent',
        'status' => 'active',
    ]);

    $user = User::where('username', 'parent_clara')->firstOrFail();
    expect($user->hasRole('parent'))->toBeTrue();
});

it('prevents an admin from deactivating their own account', function () {
    $admin = User::factory()->admin()->create();

    $response = $this->actingAs($admin)->put(route('admin.settings.users.update', $admin), [
        'username' => $admin->username,
        'full_name' => $admin->full_name,
        'email' => $admin->email,
        'phone' => $admin->phone,
        'role' => 'admin',
        'status' => 'inactive', // Attempting to deactivate self
    ]);

    $response->assertSessionHasErrors(['status']);
    expect($admin->fresh()->status)->toBe('active');
});

it('allows admins to create, update, and soft-delete menu categories', function () {
    $admin = User::factory()->admin()->create();

    // 1. Create Category
    $createResponse = $this->actingAs($admin)->post(route('admin.settings.categories.store'), [
        'name' => 'Desserts & Sweets',
        'description' => 'Cakes, pastries, and sweet treats',
    ]);

    $createResponse->assertRedirect(route('admin.settings.index'));
    $createResponse->assertSessionHas('success');

    $this->assertDatabaseHas('categories', [
        'name' => 'Desserts & Sweets',
        'description' => 'Cakes, pastries, and sweet treats',
    ]);

    $category = Category::where('name', 'Desserts & Sweets')->firstOrFail();

    // 2. Update Category
    $updateResponse = $this->actingAs($admin)->put(route('admin.settings.categories.update', $category), [
        'name' => 'Artisan Pastries',
        'description' => 'Fresh baked croissants and rolls',
    ]);

    $updateResponse->assertRedirect(route('admin.settings.index'));
    $updateResponse->assertSessionHas('success');

    $this->assertDatabaseHas('categories', [
        'id' => $category->id,
        'name' => 'Artisan Pastries',
        'description' => 'Fresh baked croissants and rolls',
    ]);

    // 3. Soft-delete Category
    $deleteResponse = $this->actingAs($admin)->delete(route('admin.settings.categories.destroy', $category));

    $deleteResponse->assertRedirect(route('admin.settings.index'));
    $deleteResponse->assertSessionHas('success');

    $this->assertSoftDeleted('categories', [
        'id' => $category->id,
    ]);
});

it('forbids non-admins from accessing admin settings routes', function () {
    $cashier = User::factory()->cashier()->create();
    $parent = User::factory()->parent()->create();
    $targetUser = User::factory()->create();
    $category = Category::factory()->create();

    // Guests redirected to login
    $this->get(route('admin.settings.index'))->assertRedirect(route('login'));
    $this->post(route('admin.settings.users.store'), [])->assertRedirect(route('login'));
    $this->put(route('admin.settings.users.update', $targetUser), [])->assertRedirect(route('login'));
    $this->post(route('admin.settings.categories.store'), [])->assertRedirect(route('login'));
    $this->put(route('admin.settings.categories.update', $category), [])->assertRedirect(route('login'));
    $this->delete(route('admin.settings.categories.destroy', $category))->assertRedirect(route('login'));

    // Cashier forbidden
    $this->actingAs($cashier)->get(route('admin.settings.index'))->assertForbidden();
    $this->actingAs($cashier)->post(route('admin.settings.users.store'), [])->assertForbidden();
    $this->actingAs($cashier)->put(route('admin.settings.users.update', $targetUser), [])->assertForbidden();
    $this->actingAs($cashier)->post(route('admin.settings.categories.store'), [])->assertForbidden();
    $this->actingAs($cashier)->put(route('admin.settings.categories.update', $category), [])->assertForbidden();
    $this->actingAs($cashier)->delete(route('admin.settings.categories.destroy', $category))->assertForbidden();

    // Parent forbidden
    $this->actingAs($parent)->get(route('admin.settings.index'))->assertForbidden();
    $this->actingAs($parent)->post(route('admin.settings.users.store'), [])->assertForbidden();
    $this->actingAs($parent)->put(route('admin.settings.users.update', $targetUser), [])->assertForbidden();
    $this->actingAs($parent)->post(route('admin.settings.categories.store'), [])->assertForbidden();
    $this->actingAs($parent)->put(route('admin.settings.categories.update', $category), [])->assertForbidden();
    $this->actingAs($parent)->delete(route('admin.settings.categories.destroy', $category))->assertForbidden();
});
