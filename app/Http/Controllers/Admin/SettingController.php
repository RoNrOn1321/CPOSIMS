<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class SettingController extends Controller
{
    /**
     * Display the administrative settings page with user accounts and categories.
     */
    public function index(Request $request): Response
    {
        $userQuery = User::query();

        if ($request->filled('user_search')) {
            $search = trim($request->input('user_search'));
            $userQuery->where(function ($q) use ($search) {
                $q->where('username', 'like', "%{$search}%")
                    ->orWhere('full_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->filled('role') && $request->input('role') !== 'all') {
            $userQuery->where('role', $request->input('role'));
        }

        $users = $userQuery->orderBy('full_name')
            ->paginate(15)
            ->withQueryString();

        $categories = Category::withCount('products')
            ->orderBy('name')
            ->get();

        $metrics = [
            'totalUsers' => User::count(),
            'activeUsers' => User::where('status', 'active')->count(),
            'totalCategories' => Category::count(),
            'totalProducts' => Product::count(),
        ];

        return Inertia::render('Admin/Settings/Index', [
            'users' => $users,
            'categories' => $categories,
            'metrics' => $metrics,
            'filters' => [
                'user_search' => $request->input('user_search', ''),
                'role' => $request->input('role', 'all'),
            ],
        ]);
    }

    /**
     * Store a newly created system user account and synchronize Spatie role.
     */
    public function storeUser(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'username' => ['required', 'string', 'max:50', 'unique:users,username'],
            'full_name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'string', 'email', 'max:100', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'max:20'],
            'role' => ['required', 'string', 'in:admin,cashier,parent,faculty,student'],
            'status' => ['required', 'string', 'in:active,inactive'],
            'password' => ['required', 'string', 'min:8'],
        ]);

        $validated['password'] = Hash::make($validated['password']);

        $user = User::create($validated);

        // Synchronize Spatie role
        $role = Role::firstOrCreate(['name' => $validated['role'], 'guard_name' => 'web']);
        $user->syncRoles([$role]);

        return redirect()->route('admin.settings.index')
            ->with('success', "User account {$user->full_name} (@{$user->username}) created successfully.");
    }

    /**
     * Update an existing user's details and synchronize Spatie role.
     */
    public function updateUser(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'username' => ['required', 'string', 'max:50', Rule::unique('users', 'username')->ignore($user->id)],
            'full_name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'string', 'email', 'max:100', Rule::unique('users', 'email')->ignore($user->id)],
            'phone' => ['nullable', 'string', 'max:20'],
            'role' => ['required', 'string', 'in:admin,cashier,parent,faculty,student'],
            'status' => ['required', 'string', 'in:active,inactive'],
            'password' => ['nullable', 'string', 'min:8'],
        ]);

        // Prevent self-deactivation
        if ($user->id === Auth::id() && $validated['status'] === 'inactive') {
            return redirect()->back()->withErrors([
                'status' => 'You cannot deactivate your own administrative account.',
            ]);
        }

        if (! empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);

        // Synchronize Spatie role
        $role = Role::firstOrCreate(['name' => $validated['role'], 'guard_name' => 'web']);
        $user->syncRoles([$role]);

        return redirect()->route('admin.settings.index')
            ->with('success', "User account {$user->full_name} updated successfully.");
    }

    /**
     * Store a new product category.
     */
    public function storeCategory(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:50', 'unique:categories,name'],
            'description' => ['nullable', 'string', 'max:255'],
        ]);

        $category = Category::create($validated);

        return redirect()->route('admin.settings.index')
            ->with('success', "Category '{$category->name}' created successfully.");
    }

    /**
     * Update an existing product category.
     */
    public function updateCategory(Request $request, Category $category): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:50', Rule::unique('categories', 'name')->ignore($category->id)],
            'description' => ['nullable', 'string', 'max:255'],
        ]);

        $category->update($validated);

        return redirect()->route('admin.settings.index')
            ->with('success', "Category '{$category->name}' updated successfully.");
    }

    /**
     * Soft-delete a product category.
     */
    public function destroyCategory(Category $category): RedirectResponse
    {
        $name = $category->name;
        $category->delete();

        return redirect()->route('admin.settings.index')
            ->with('success', "Category '{$name}' removed successfully.");
    }
}
