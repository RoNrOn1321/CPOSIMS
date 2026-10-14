<?php

use App\Models\StudentAccount;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed(RolesAndPermissionsSeeder::class);
});

it('allows admins to view the student accounts directory', function () {
    $admin = User::factory()->admin()->create();
    $parent = User::factory()->parent()->create(['full_name' => 'Mrs. Maria Santos']);

    StudentAccount::factory()->count(3)->create([
        'parent_id' => $parent->id,
    ]);

    $response = $this->actingAs($admin)->get(route('admin.students.index'));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Students/Index')
            ->has('students.data', 4)
            ->has('parents')
            ->has('metrics')
            ->where('metrics.totalStudents', 4)
        );
});

it('allows admins to enroll a new student and link them to a parent account', function () {
    $admin = User::factory()->admin()->create();
    $parent = User::factory()->parent()->create();

    $response = $this->actingAs($admin)->post(route('admin.students.store'), [
        'student_id_number' => '2026-9999',
        'rfid_uid' => 'E004015099999999',
        'first_name' => 'Carlos',
        'last_name' => 'Rivera',
        'grade_level' => 'Grade 7',
        'section' => 'St. Francis',
        'parent_id' => $parent->id,
        'daily_spending_limit' => 250.00,
        'is_spending_limited' => true,
        'status' => 'active',
    ]);

    $response->assertRedirect(route('admin.students.index'));
    $response->assertSessionHas('success');

    $this->assertDatabaseHas('student_accounts', [
        'student_id_number' => '2026-9999',
        'rfid_uid' => 'E004015099999999',
        'first_name' => 'Carlos',
        'last_name' => 'Rivera',
        'grade_level' => 'Grade 7',
        'section' => 'St. Francis',
        'parent_id' => $parent->id,
        'current_balance' => 0.00,
        'daily_spending_limit' => 250.00,
        'is_spending_limited' => true,
        'status' => 'active',
    ]);
});

it('allows admins to replace a lost RFID card UID and reactivate the student account', function () {
    $admin = User::factory()->admin()->create();
    $student = StudentAccount::factory()->lostCard()->create([
        'rfid_uid' => 'OLD-COMPROMISED-TAG',
        'status' => 'lost_card',
    ]);

    $response = $this->actingAs($admin)->put(route('admin.students.update', $student), [
        'student_id_number' => $student->student_id_number,
        'rfid_uid' => 'NEW-REPLACEMENT-TAG',
        'first_name' => $student->first_name,
        'last_name' => $student->last_name,
        'grade_level' => $student->grade_level,
        'section' => $student->section,
        'parent_id' => $student->parent_id,
        'daily_spending_limit' => $student->daily_spending_limit,
        'is_spending_limited' => $student->is_spending_limited,
        'status' => 'active',
    ]);

    $response->assertRedirect(route('admin.students.index'));
    $response->assertSessionHas('success');

    $this->assertDatabaseHas('student_accounts', [
        'id' => $student->id,
        'rfid_uid' => 'NEW-REPLACEMENT-TAG',
        'status' => 'active',
    ]);
});

it('prevents duplicate RFID UIDs or student ID numbers', function () {
    $admin = User::factory()->admin()->create();

    $studentA = StudentAccount::factory()->create([
        'student_id_number' => '2026-1111',
        'rfid_uid' => 'RFID-CARD-1111',
    ]);

    $studentB = StudentAccount::factory()->create([
        'student_id_number' => '2026-2222',
        'rfid_uid' => 'RFID-CARD-2222',
    ]);

    // Attempt to store with existing student_id_number and rfid_uid
    $response = $this->actingAs($admin)->post(route('admin.students.store'), [
        'student_id_number' => '2026-1111',
        'rfid_uid' => 'RFID-CARD-1111',
        'first_name' => 'Duplicate',
        'last_name' => 'Student',
        'grade_level' => 'Grade 8',
        'section' => 'St. Jude',
        'parent_id' => null,
        'daily_spending_limit' => 200,
        'is_spending_limited' => true,
        'status' => 'active',
    ]);

    $response->assertSessionHasErrors(['student_id_number', 'rfid_uid']);

    // Attempt to update Student B to Student A's RFID
    $updateResponse = $this->actingAs($admin)->put(route('admin.students.update', $studentB), [
        'student_id_number' => $studentB->student_id_number,
        'rfid_uid' => 'RFID-CARD-1111', // belongs to Student A
        'first_name' => $studentB->first_name,
        'last_name' => $studentB->last_name,
        'grade_level' => $studentB->grade_level,
        'section' => $studentB->section,
        'parent_id' => $studentB->parent_id,
        'daily_spending_limit' => 200,
        'is_spending_limited' => true,
        'status' => 'active',
    ]);

    $updateResponse->assertSessionHasErrors(['rfid_uid']);
});

it('forbids non-admins from accessing student management routes', function () {
    $cashier = User::factory()->cashier()->create();
    $parent = User::factory()->parent()->create();
    $student = StudentAccount::factory()->create();

    // Guests redirected to login
    $this->get(route('admin.students.index'))->assertRedirect(route('login'));
    $this->post(route('admin.students.store'), [])->assertRedirect(route('login'));
    $this->put(route('admin.students.update', $student), [])->assertRedirect(route('login'));

    // Cashier forbidden
    $this->actingAs($cashier)->get(route('admin.students.index'))->assertForbidden();
    $this->actingAs($cashier)->post(route('admin.students.store'), [
        'student_id_number' => '2026-0001',
        'first_name' => 'Unauthorized',
        'last_name' => 'Cashier-Action',
        'grade_level' => 'Grade 1',
        'section' => 'A',
        'daily_spending_limit' => 100,
        'is_spending_limited' => true,
        'status' => 'active',
    ])->assertForbidden();
    $this->actingAs($cashier)->put(route('admin.students.update', $student), [])->assertForbidden();

    // Parent forbidden
    $this->actingAs($parent)->get(route('admin.students.index'))->assertForbidden();
    $this->actingAs($parent)->post(route('admin.students.store'), [])->assertForbidden();
    $this->actingAs($parent)->put(route('admin.students.update', $student), [])->assertForbidden();
});
