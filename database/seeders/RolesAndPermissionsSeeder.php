<?php

namespace Database\Seeders;

use App\Models\StudentAccount;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // 1. Define Permissions
        $permissions = [
            // Admin permissions
            'access-admin',
            'manage-products',
            'manage-users',
            'manage-inventory',
            'view-audit-logs',
            'view-reports',

            // POS / Cashier permissions
            'access-pos',
            'process-sales',
            'topup-balance',
            'view-products',

            // Parent Portal permissions
            'access-parent-portal',
            'view-student-accounts',
            'manage-student-limits',

            // General / Student / Faculty permissions
            'access-portal',
            'view-own-balance',
        ];

        foreach ($permissions as $permission) {
            Permission::findOrCreate($permission, 'web');
        }

        // 2. Define Roles and Assign Permissions
        $adminRole = Role::findOrCreate('admin', 'web');
        $adminRole->syncPermissions(Permission::all());

        $cashierRole = Role::findOrCreate('cashier', 'web');
        $cashierRole->syncPermissions([
            'access-pos',
            'process-sales',
            'topup-balance',
            'view-products',
        ]);

        $parentRole = Role::findOrCreate('parent', 'web');
        $parentRole->syncPermissions([
            'access-parent-portal',
            'view-student-accounts',
            'manage-student-limits',
            'topup-balance',
        ]);

        $facultyRole = Role::findOrCreate('faculty', 'web');
        $facultyRole->syncPermissions([
            'access-portal',
            'view-own-balance',
        ]);

        $studentRole = Role::findOrCreate('student', 'web');
        $studentRole->syncPermissions([
            'access-portal',
            'view-own-balance',
        ]);

        // 3. Seed Default System Users
        $admin = User::firstOrCreate(
            ['username' => 'admin'],
            [
                'full_name' => 'System Administrator',
                'email' => 'admin@stct.edu.ph',
                'phone' => '09123456780',
                'role' => 'admin',
                'status' => 'active',
                'password' => Hash::make('password'),
            ]
        );
        $admin->syncRoles([$adminRole]);

        $cashier = User::firstOrCreate(
            ['username' => 'cashier'],
            [
                'full_name' => 'Canteen Cashier',
                'email' => 'cashier@stct.edu.ph',
                'phone' => '09123456781',
                'role' => 'cashier',
                'status' => 'active',
                'password' => Hash::make('password'),
            ]
        );
        $cashier->syncRoles([$cashierRole]);

        $parent = User::firstOrCreate(
            ['username' => 'parent'],
            [
                'full_name' => 'Parent Guardian',
                'email' => 'parent@stct.edu.ph',
                'phone' => '09123456782',
                'role' => 'parent',
                'status' => 'active',
                'password' => Hash::make('password'),
            ]
        );
        $parent->syncRoles([$parentRole]);

        $faculty = User::firstOrCreate(
            ['username' => 'faculty'],
            [
                'full_name' => 'Faculty Member',
                'email' => 'faculty@stct.edu.ph',
                'phone' => '09123456783',
                'role' => 'faculty',
                'status' => 'active',
                'password' => Hash::make('password'),
            ]
        );
        $faculty->syncRoles([$facultyRole]);

        $student = User::firstOrCreate(
            ['username' => 'student'],
            [
                'full_name' => 'Student User',
                'email' => 'student@stct.edu.ph',
                'phone' => '09123456784',
                'role' => 'student',
                'status' => 'active',
                'password' => Hash::make('password'),
            ]
        );
        $student->syncRoles([$studentRole]);

        // 4. Seed a linked student account for the parent
        StudentAccount::firstOrCreate(
            ['student_id_number' => '2026-0001'],
            [
                'rfid_uid' => 'E28011700000020',
                'first_name' => 'Theresian',
                'last_name' => 'Student',
                'grade_level' => 'Grade 10',
                'section' => 'St. Theresa',
                'parent_id' => $parent->id,
                'current_balance' => 350.00,
                'daily_spending_limit' => 200.00,
                'is_spending_limited' => true,
                'status' => 'active',
            ]
        );
    }
}
