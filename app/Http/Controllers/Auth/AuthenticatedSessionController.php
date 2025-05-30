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
use Illuminate\Validation\ValidationException;

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
    public function store(LoginRequest $request): \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse|\Illuminate\Http\JsonResponse
    {
        try {
            $request->authenticate();
            $request->session()->regenerate();

            /** @var \App\Models\User */
            $user = Auth::user();
            
            // For API requests
            if ($request->wantsJson()) {
                // Double-check status for API requests too
                if ($user->hasRole('relawan') && $user->status !== 'active') {
                    Auth::logout();
                    return response()->json([
                        'message' => 'Akun relawan belum diverifikasi oleh admin'
                    ], 403);
                }
                
                $token = $user->createToken('auth-token');
                return response()->json([
                    'token' => $token->plainTextToken,
                    'user' => $user,
                    'message' => 'Login berhasil'
                ]);
            }
            
            // Check where to redirect based on role
            if ($user->hasRole('admin')) {
                return redirect()->intended(route('admin.dashboard'));
            } elseif ($user->hasRole('relawan')) {
                return redirect()->intended(route('relawan.dashboard'));
            } else {
                return redirect()->intended(route('masyarakat.dashboard'));
            }
        } catch (ValidationException $e) {
            if ($request->wantsJson()) {
                return response()->json([
                    'message' => $e->getMessage()
                ], 422);
            }
            
            throw $e;
        }
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
