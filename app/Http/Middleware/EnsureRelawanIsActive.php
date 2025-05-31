<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureRelawanIsActive
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();

        // First check if user has relawan role
        if (!$user->hasRole('relawan')) {
            if ($request->wantsJson()) {
                return response()->json([
                    'message' => 'Akses ditolak. Anda bukan relawan.'
                ], 403);
            }
            return redirect()->route('dashboard')->with('error', 'Akses ditolak. Anda bukan relawan.');
        }

        // Then check if relawan is active
        if ($user->status !== 'active') {
            // If the user is rejected, redirect to the rejected page
            if ($user->status === 'rejected') {
                return redirect()->route('registration.rejected');
            }

            // If the user is pending, redirect to the pending page
            if ($user->status === 'pending') {
                return redirect()->route('registration.pending');
            }

            // Otherwise logout and redirect to login page
            Auth::logout();

            if ($request->wantsJson()) {
                return response()->json([
                    'message' => 'Akun relawan Anda belum diverifikasi oleh admin.'
                ], 403);
            }

            return redirect()->route('login')
                ->with('status', 'Akun relawan Anda belum diverifikasi oleh admin.');
        }

        return $next($request);
    }
}
