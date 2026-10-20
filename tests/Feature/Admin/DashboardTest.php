<?php

use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed(RolesAndPermissionsSeeder::class);
});

it('allows admins to view the admin dashboard', function () {
    $admin = User::factory()->admin()->create();

    $response = $this->actingAs($admin)->get(route('admin.dashboard'));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Dashboard/Index')
            ->has('metrics')
            ->has('recentTransactions')
            ->has('lowStockProducts')
            ->has('recentAuditLogs')
            ->has('categoryBreakdown')
        );
});

it('prevents non-admins from accessing the admin dashboard', function () {
    $cashier = User::factory()->cashier()->create();
    $parent = User::factory()->parent()->create();

    // Guests redirected to login
    $this->get(route('admin.dashboard'))->assertRedirect(route('login'));

    // Cashier and parent forbidden
    $this->actingAs($cashier)->get(route('admin.dashboard'))->assertForbidden();
    $this->actingAs($parent)->get(route('admin.dashboard'))->assertForbidden();
});
