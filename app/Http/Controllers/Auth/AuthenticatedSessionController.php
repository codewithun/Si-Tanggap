<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Show the login page.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('auth/login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request)
    {
        $request->authenticate();
        $request->session()->regenerate();

        if ($request->wantsJson()) {
            $token = $request->user()->createToken('api-token');
            return response()->json([
                'user' => $request->user(),
                'token' => $token->plainTextToken,
                'message' => 'Login successful'
            ]);
        }

        // Validasi role opsional
        $user = $request->user();
        $allowedRoles = ['admin', 'relawan', 'masyarakat'];
        if (!in_array($user->role, $allowedRoles)) {
            Auth::logout();
            return redirect('/')
                ->with('error', 'Role tidak diizinkan.');
        }

        // Arahkan semua ke dashboard umum
        return redirect()->route('dashboard');
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request)
    {
        if ($request->wantsJson()) {
            // For API requests, revoke the user's current token
            $request->user()->currentAccessToken()->delete();
            return response()->json(['message' => 'Berhasil logout']);
        }

        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
