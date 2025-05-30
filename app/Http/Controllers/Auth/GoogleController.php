<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class GoogleController extends Controller
{
    // Redirect ke Google
    public function redirectToGoogle()
    {
        return Socialite::driver('google')->redirect();
    }

    // Callback dari Google
    public function handleGoogleCallback()
    {
        try {
            $googleUser = Socialite::driver('google')->user();

            // Cari user berdasarkan email
            $user = User::where('email', $googleUser->getEmail())->first();

            if (!$user) {
                // Jika user belum ada, buat user baru
                $user = User::create([
                    'name' => $googleUser->getName(),
                    'email' => $googleUser->getEmail(),
                    'google_id' => $googleUser->getId(),
                    'avatar' => $googleUser->getAvatar(),
                    'password' => bcrypt(Str::random(16)), // password random
                    'email_verified_at' => now(),
                ]);
                // Assign default role, misal 'masyarakat'
                $user->assignRole('masyarakat');
            }

            Auth::login($user);
            Log::info('User logged in:', ['id' => Auth::id()]);

            // Redirect sesuai role
            if ($user->isAdmin()) {
                return redirect()->route('admin.dashboard');
            } elseif ($user->isRelawan()) {
                return redirect()->route('relawan.dashboard');
            } else {
                return redirect()->route('masyarakat.dashboard');
            }
        } catch (\Exception $e) {
            return redirect()->route('login')->with('error', 'Gagal login dengan Google.');
        }
    }
}
