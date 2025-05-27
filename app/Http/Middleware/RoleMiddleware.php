<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class RoleMiddleware
{
    /**
     * Handle an incoming request and check user roles using Spatie.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  mixed  ...$roles
     * @return mixed
     */
    public function handle(Request $request, Closure $next, ...$roles)
    {
        // Pastikan user sudah login
        if (!$request->user()) {
            abort(403, 'Unauthorized');
        }

        // Gunakan hasRole untuk cek apakah user punya salah satu role yg diperbolehkan
        if (!$request->user()->hasRole($roles)) {
            abort(403, 'Unauthorized');
        }

        return $next($request);
    }
}
