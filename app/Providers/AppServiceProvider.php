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
        // Fix for running tests in CI environment where Vite manifest may not exist
        if ($this->app->environment('testing') || env('VITE_MANIFEST_FALLBACK')) {
            $this->app->bind(\Illuminate\Foundation\Vite::class, function () {
                return new class extends \Illuminate\Foundation\Vite {
                    public function __invoke($entrypoints, $buildDirectory = null)
                    {
                        if (!file_exists(public_path('build/manifest.json'))) {
                            $manifest = public_path('build/manifest.json');
                            $dir = dirname($manifest);
                            
                            if (!is_dir($dir)) {
                                mkdir($dir, 0755, true);
                            }
                            
                            $fallbackManifest = [
                                'resources/js/app.tsx' => [
                                    'file' => 'assets/app.js',
                                    'isEntry' => true,
                                    'src' => 'resources/js/app.tsx'
                                ],
                                'resources/css/app.css' => [
                                    'file' => 'assets/app.css',
                                    'isEntry' => true,
                                    'src' => 'resources/css/app.css'
                                ]
                            ];
                            
                            file_put_contents($manifest, json_encode($fallbackManifest));
                            
                            // Also ensure the asset files exist
                            $assetsDir = public_path('build/assets');
                            if (!is_dir($assetsDir)) {
                                mkdir($assetsDir, 0755, true);
                            }
                            
                            touch($assetsDir . '/app.js');
                            touch($assetsDir . '/app.css');
                        }
                        
                        return parent::__invoke($entrypoints);
                    }
                };
            });
        }
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
