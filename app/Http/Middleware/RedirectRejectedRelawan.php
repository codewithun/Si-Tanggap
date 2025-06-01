<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class RedirectRejectedRelawan
{
    /**
     * Handle an incoming request.
     * Redirect relawan users with rejected status to the rejected page.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        if (Auth::check()) {
            $user = Auth::user();

            // Debug logging
            Log::debug('RedirectRejectedRelawan middleware check', [
                'user_id' => $user->id,
                'email' => $user->email,
                'path' => $request->path(),
                'has_role_relawan' => $user->hasRole('relawan'),
                'status' => $user->status,
            ]);

            // Only redirect if:
            // 1. User has relawan role
            // 2. User has rejected status
            // 3. User is not already on the rejected page
            // 4. User is trying to access relawan-specific pages
            if (
                $user->hasRole('relawan') &&
                $user->status === 'rejected' &&
                $request->route()->getName() !== 'registration.rejected' &&
                strpos($request->path(), 'relawan') !== false
            ) {

                return redirect()->route('registration.rejected');
            }
        }

        return $next($request);
    }
}
