<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
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

        // 5. Seed Default Product Categories
        $riceMeals = Category::firstOrCreate(
            ['name' => 'Rice Meals'],
            ['description' => 'Hearty cafeteria rice bowls and warm lunch plates']
        );

        $snacks = Category::firstOrCreate(
            ['name' => 'Snacks & Sandwiches'],
            ['description' => 'Quick bites, toasted sandwiches, and light canteen snacks']
        );

        $beverages = Category::firstOrCreate(
            ['name' => 'Beverages'],
            ['description' => 'Chilled drinks, mineral water, and fruit refreshments']
        );

        $schoolSupplies = Category::firstOrCreate(
            ['name' => 'School Supplies'],
            ['description' => 'Essential classroom supplies, writing tools, and student paper items']
        );

        // 6. Seed Default Barcoded Products (Food & School Supplies)
        // Food & Drinks:
        Product::firstOrCreate(
            ['barcode' => 'STCT-1001'],
            [
                'name' => 'Chicken Adobo Rice Bowl',
                'category_id' => $riceMeals->id,
                'price' => 65.00,
                'cost' => 40.00,
                'stock_quantity' => 40,
                'reorder_level' => 10,
                'status' => 'active',
            ]
        );

        Product::firstOrCreate(
            ['barcode' => 'STCT-1002'],
            [
                'name' => 'Ham & Cheese Sandwich',
                'category_id' => $snacks->id,
                'price' => 35.00,
                'cost' => 20.00,
                'stock_quantity' => 50,
                'reorder_level' => 10,
                'status' => 'active',
            ]
        );

        Product::firstOrCreate(
            ['barcode' => 'STCT-1003'],
            [
                'name' => 'Bottled Mineral Water 500ml',
                'category_id' => $beverages->id,
                'price' => 15.00,
                'cost' => 8.00,
                'stock_quantity' => 80,
                'reorder_level' => 15,
                'status' => 'active',
            ]
        );

        // School Supplies:
        Product::firstOrCreate(
            ['barcode' => 'STCT-2001'],
            [
                'name' => 'HBW Matrix Ballpen (Black)',
                'category_id' => $schoolSupplies->id,
                'price' => 12.00,
                'cost' => 7.00,
                'stock_quantity' => 100,
                'reorder_level' => 20,
                'status' => 'active',
            ]
        );

        Product::firstOrCreate(
            ['barcode' => 'STCT-2002'],
            [
                'name' => 'Whole Intermediate Pad Paper',
                'category_id' => $schoolSupplies->id,
                'price' => 30.00,
                'cost' => 18.00,
                'stock_quantity' => 60,
                'reorder_level' => 15,
                'status' => 'active',
            ]
        );

        Product::firstOrCreate(
            ['barcode' => 'STCT-2003'],
            [
                'name' => 'Cattleya Spiral Notebook',
                'category_id' => $schoolSupplies->id,
                'price' => 45.00,
                'cost' => 28.00,
                'stock_quantity' => 40,
                'reorder_level' => 10,
                'status' => 'active',
            ]
        );

        // Seeded as low-stock (stock 8 <= reorder 15) for low-stock alerts
        Product::firstOrCreate(
            ['barcode' => 'STCT-2004'],
            [
                'name' => 'Long Brown Envelope',
                'category_id' => $schoolSupplies->id,
                'price' => 8.00,
                'cost' => 4.00,
                'stock_quantity' => 8,
                'reorder_level' => 15,
                'status' => 'active',
            ]
        );
    }
}
