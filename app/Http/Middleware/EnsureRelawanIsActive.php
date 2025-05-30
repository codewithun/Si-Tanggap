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

        if ($user->hasRole('relawan') && $user->status !== 'active') {
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
