<?php

namespace App\Providers;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;
use App\Models\User;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot()
    {
        Inertia::share([
            'auth' => function () {
                /** @var User|null $user */
                $user = Auth::user();
                if (!$user) {
                    return null;
                }

                $roles = $user->getRoleNames();

                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'roles' => $roles,
                    'role' => $roles->first() ?? null,
                ];
            }
        ]);
    }
}
