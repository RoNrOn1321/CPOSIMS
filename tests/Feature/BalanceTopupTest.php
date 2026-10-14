<?php

use App\Models\BalanceTopup;
use App\Models\StudentAccount;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;

beforeEach(function () {
    $this->seed(RolesAndPermissionsSeeder::class);
});

it('allows a parent to reload their linked child via simulated e-wallet and records a balance_topups entry', function () {
    $parent = User::factory()->parent()->create();
    $child = StudentAccount::factory()->create([
        'parent_id' => $parent->id,
        'current_balance' => 200.00,
        'status' => 'active',
        'first_name' => 'Juan',
        'last_name' => 'Dela Cruz',
    ]);

    $response = $this->actingAs($parent)->post(route('parent.student-accounts.topup', $child), [
        'amount' => 300.00,
        'payment_method' => 'gcash',
        'account_number' => '0917-882-1049',
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('success', 'RFID balance reloaded successfully.');
    $response->assertSessionHas('reference_number');

    expect((float) $child->fresh()->current_balance)->toBe(500.00);

    $topup = BalanceTopup::where('student_account_id', $child->id)->first();
    expect($topup)->not->toBeNull()
        ->and((int) $topup->cashier_id)->toBe($parent->id)
        ->and((float) $topup->amount)->toBe(300.00)
        ->and((float) $topup->previous_balance)->toBe(200.00)
        ->and((float) $topup->new_balance)->toBe(500.00)
        ->and($topup->reference_number)->toStartWith('GCASH-');
});

it('prevents a parent from reloading a student account belonging to another parent', function () {
    $parentA = User::factory()->parent()->create();
    $parentB = User::factory()->parent()->create();

    $childB = StudentAccount::factory()->create([
        'parent_id' => $parentB->id,
        'current_balance' => 150.00,
        'status' => 'active',
    ]);

    $response = $this->actingAs($parentA)->post(route('parent.student-accounts.topup', $childB), [
        'amount' => 200.00,
        'payment_method' => 'maya',
        'account_number' => '0917-882-1049',
    ]);

    $response->assertStatus(403);
    expect((float) $childB->fresh()->current_balance)->toBe(150.00)
        ->and(BalanceTopup::count())->toBe(0);
});

it('allows a cashier to process a walk-in cash reload via RFID UID at the POS', function () {
    $cashier = User::factory()->cashier()->create();
    $student = StudentAccount::factory()->create([
        'rfid_uid' => 'E0040150CAFE01',
        'student_id_number' => '2026-0042',
        'first_name' => 'Maria',
        'last_name' => 'Clara',
        'current_balance' => 100.00,
        'status' => 'active',
    ]);

    $response = $this->actingAs($cashier)->postJson(route('pos.topup'), [
        'rfid_uid' => 'E0040150CAFE01',
        'amount' => 250.00,
    ]);

    $response->assertStatus(201);
    $response->assertJsonStructure([
        'message',
        'reference_number',
        'student_name',
        'amount',
        'previous_balance',
        'new_balance',
    ]);

    $responseData = $response->json();
    expect($responseData['reference_number'])->toStartWith('CASH-')
        ->and($responseData['student_name'])->toBe('Maria Clara')
        ->and((float) $responseData['amount'])->toBe(250.00)
        ->and((float) $responseData['previous_balance'])->toBe(100.00)
        ->and((float) $responseData['new_balance'])->toBe(350.00)
        ->and((float) $student->fresh()->current_balance)->toBe(350.00);

    $topup = BalanceTopup::where('student_account_id', $student->id)->first();
    expect($topup)->not->toBeNull()
        ->and((int) $topup->cashier_id)->toBe($cashier->id)
        ->and((float) $topup->amount)->toBe(250.00)
        ->and((float) $topup->previous_balance)->toBe(100.00)
        ->and((float) $topup->new_balance)->toBe(350.00);

    // Also verify that lookup by student_id_number works
    $secondResponse = $this->actingAs($cashier)->postJson(route('pos.topup'), [
        'rfid_uid' => '2026-0042',
        'amount' => 50.00,
    ]);

    $secondResponse->assertStatus(201);
    expect((float) $student->fresh()->current_balance)->toBe(400.00);
});

it('blocks POS walk-in reload if the student RFID card is marked as lost_card', function () {
    $cashier = User::factory()->cashier()->create();
    $student = StudentAccount::factory()->lostCard()->create([
        'rfid_uid' => 'LOST-CARD-999',
        'current_balance' => 75.00,
    ]);

    $response = $this->actingAs($cashier)->postJson(route('pos.topup'), [
        'rfid_uid' => 'LOST-CARD-999',
        'amount' => 100.00,
    ]);

    $response->assertStatus(403);
    expect((float) $student->fresh()->current_balance)->toBe(75.00)
        ->and(BalanceTopup::count())->toBe(0);
});

it('validates reload amount bounds and payment methods', function () {
    $parent = User::factory()->parent()->create();
    $child = StudentAccount::factory()->create([
        'parent_id' => $parent->id,
        'current_balance' => 100.00,
    ]);

    // Parent reload: below min (50)
    $this->actingAs($parent)
        ->post(route('parent.student-accounts.topup', $child), [
            'amount' => 20.00,
            'payment_method' => 'gcash',
        ])
        ->assertSessionHasErrors('amount');

    // Parent reload: above max (10000)
    $this->actingAs($parent)
        ->post(route('parent.student-accounts.topup', $child), [
            'amount' => 15000.00,
            'payment_method' => 'gcash',
        ])
        ->assertSessionHasErrors('amount');

    // Parent reload: invalid payment method
    $this->actingAs($parent)
        ->post(route('parent.student-accounts.topup', $child), [
            'amount' => 200.00,
            'payment_method' => 'crypto',
        ])
        ->assertSessionHasErrors('payment_method');

    $cashier = User::factory()->cashier()->create();

    // POS reload: below min (10)
    $this->actingAs($cashier)
        ->postJson(route('pos.topup'), [
            'rfid_uid' => $child->rfid_uid,
            'amount' => 5.00,
        ])
        ->assertStatus(422)
        ->assertJsonValidationErrors('amount');

    // POS reload: above max (10000)
    $this->actingAs($cashier)
        ->postJson(route('pos.topup'), [
            'rfid_uid' => $child->rfid_uid,
            'amount' => 15000.00,
        ])
        ->assertStatus(422)
        ->assertJsonValidationErrors('amount');

    // POS reload: missing rfid_uid
    $this->actingAs($cashier)
        ->postJson(route('pos.topup'), [
            'amount' => 100.00,
        ])
        ->assertStatus(422)
        ->assertJsonValidationErrors('rfid_uid');
});
