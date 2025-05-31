<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class EnsureActiveRelawan
{
    /**
     * Handle an incoming request.
     * Ensure only active relawan users can access relawan routes.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        if (!Auth::check()) {
            return redirect()->route('login');
        }

        $user = Auth::user();

        // Debug logging
        Log::debug('EnsureActiveRelawan middleware check', [
            'user_id' => $user->id,
            'email' => $user->email,
            'path' => $request->path(),
            'has_role_relawan' => $user->hasRole('relawan'),
            'status' => $user->status,
        ]);

        // Check if user has relawan role
        if (!$user->hasRole('relawan')) {
            return redirect()->route('dashboard')->with('error', 'Akses ditolak. Anda bukan relawan.');
        }

        // Check user status
        if ($user->status === 'rejected') {
            return redirect()->route('registration.rejected');
        }

        if ($user->status === 'pending') {
            return redirect()->route('registration.pending');
        }

        if ($user->status !== 'active') {
            return redirect()->route('dashboard')->with('error', 'Akun relawan Anda belum aktif.');
        }

        return $next($request);
    }
}
