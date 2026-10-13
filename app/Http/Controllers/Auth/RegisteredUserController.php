<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => ['sometimes', 'nullable', 'string', 'max:100'],
            'full_name' => ['sometimes', 'nullable', 'string', 'max:100'],
            'username' => ['sometimes', 'nullable', 'string', 'max:50', 'unique:'.User::class],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:100', 'unique:'.User::class],
            'phone' => ['sometimes', 'nullable', 'string', 'max:20'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $fullName = $request->full_name ?? $request->name ?? 'User';

        $username = $request->username;
        if (! $username) {
            $baseUsername = Str::slug(explode('@', (string) $request->email)[0] ?? $fullName, '_');
            if (empty($baseUsername)) {
                $baseUsername = 'user';
            }
            $username = $baseUsername;
            $counter = 1;
            while (User::where('username', $username)->exists()) {
                $username = $baseUsername.$counter;
                $counter++;
            }
        }

        $user = User::create([
            'username' => $username,
            'full_name' => $fullName,
            'email' => $request->email,
            'phone' => $request->phone,
            'role' => 'parent',
            'status' => 'active',
            'password' => Hash::make($request->password),
        ]);

        event(new Registered($user));

        Auth::login($user);

        return redirect()->intended(route('parent.dashboard', absolute: false));
    }
}
