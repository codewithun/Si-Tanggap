<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Show the registration page.
     */
    public function create(): Response
    {
        return Inertia::render('auth/register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:' . User::class,
            'password' => ['required', 'confirmed', 'min:8'],
            'phone' => 'nullable|string|max:20',
            'role' => 'required|string|in:masyarakat,relawan',
            'id_card' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:2048',
            'organization' => 'nullable|string|max:255',
            'experience' => 'nullable|string|max:255',
            'motivation' => 'nullable|string|max:255',
        ]);

        $isRelawan = $request->role === 'relawan';

        $userData = [
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone' => $request->phone,
        ];

        if ($isRelawan) {
            // Handle file upload jika ada
            if ($request->hasFile('id_card')) {
                $path = $request->file('id_card')->store('public/id-cards');
                $userData['id_card_path'] = \Illuminate\Support\Facades\Storage::url($path);
            }
            $userData['organization'] = $request->organization;
            $userData['experience'] = $request->experience;
            $userData['motivation'] = $request->motivation;
        }

        $user = User::create($userData);

        // Assign role sesuai request
        $user->assignRole($request->role ?? 'masyarakat');

        event(new Registered($user));

        if ($request->wantsJson()) {
            Auth::login($user);
            $token = $user->createToken('api-token');
            return response()->json([
                'user' => $user,
                'token' => $token->plainTextToken,
                'message' => 'Registrasi berhasil'
            ], 201);
        }

        Auth::login($user);

        return redirect(route('masyarakat.dashboard'));
    }
}
