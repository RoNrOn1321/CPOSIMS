<?php

use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;

beforeEach(function () {
    $this->seed(RolesAndPermissionsSeeder::class);
});

test('roles and permissions are automatically assigned to users matching their role enum', function () {
    $admin = User::factory()->admin()->create();
    $cashier = User::factory()->cashier()->create();
    $parent = User::factory()->parent()->create();
    $faculty = User::factory()->faculty()->create();
    $student = User::factory()->student()->create();

    expect($admin->hasRole('admin'))->toBeTrue()
        ->and($admin->can('access-admin'))->toBeTrue()
        ->and($cashier->hasRole('cashier'))->toBeTrue()
        ->and($cashier->can('access-pos'))->toBeTrue()
        ->and($cashier->can('access-admin'))->toBeFalse()
        ->and($parent->hasRole('parent'))->toBeTrue()
        ->and($parent->can('access-parent-portal'))->toBeTrue()
        ->and($faculty->hasRole('faculty'))->toBeTrue()
        ->and($student->hasRole('student'))->toBeTrue();
});

test('users are redirected to their respective role dashboards on login', function () {
    $admin = User::factory()->admin()->create();
    $cashier = User::factory()->cashier()->create();
    $parent = User::factory()->parent()->create();

    $adminResponse = $this->post('/login', [
        'email' => $admin->email,
        'password' => 'password',
    ]);
    $adminResponse->assertRedirect(route('admin.products.index', absolute: false));
    $this->post('/logout');

    $cashierResponse = $this->post('/login', [
        'email' => $cashier->username,
        'password' => 'password',
    ]);
    $cashierResponse->assertRedirect(route('pos.index', absolute: false));
    $this->post('/logout');

    $parentResponse = $this->post('/login', [
        'email' => $parent->email,
        'password' => 'password',
    ]);
    $parentResponse->assertRedirect(route('parent.dashboard', absolute: false));
});

test('inactive users cannot authenticate', function () {
    $inactiveUser = User::factory()->inactive()->create();

    $response = $this->post('/login', [
        'email' => $inactiveUser->email,
        'password' => 'password',
    ]);

    $this->assertGuest();
    $response->assertSessionHasErrors('email');
});

test('unauthenticated guests are redirected to login for protected routes', function () {
    $this->get('/admin/products')->assertRedirect('/login');
    $this->get('/pos')->assertRedirect('/login');
    $this->get('/parent/dashboard')->assertRedirect('/login');
    $this->get('/')->assertRedirect('/login');
});

test('cashier can access pos but cannot access admin or parent portals', function () {
    $cashier = User::factory()->cashier()->create();

    $this->actingAs($cashier)->get('/pos')->assertOk();
    $this->actingAs($cashier)->get('/admin/products')->assertForbidden();
    $this->actingAs($cashier)->get('/parent/dashboard')->assertForbidden();
});

test('parent can access parent dashboard but cannot access pos or admin panel', function () {
    $parent = User::factory()->parent()->create();

    $this->actingAs($parent)->get('/parent/dashboard')->assertOk();
    $this->actingAs($parent)->get('/pos')->assertForbidden();
    $this->actingAs($parent)->get('/admin/products')->assertForbidden();
});

test('admin can access admin panel, pos portal, and parent dashboard', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)->get('/admin/products')->assertOk();
    $this->actingAs($admin)->get('/pos')->assertOk();
    $this->actingAs($admin)->get('/parent/dashboard')->assertOk();
});

test('authenticated active user who becomes inactive is blocked by middleware', function () {
    $user = User::factory()->cashier()->create();

    $this->actingAs($user)->get('/pos')->assertOk();

    // Deactivate user
    $user->update(['status' => 'inactive']);

    $response = $this->actingAs($user)->get('/pos');
    $response->assertRedirect('/login');
    $this->assertGuest();
});
