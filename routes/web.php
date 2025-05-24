<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Controllers\UserController;
use App\Http\Controllers\Api\JalurEvakuasiController;
use App\Http\Controllers\Api\PoskoController;
use App\Http\Controllers\Api\LaporanController;
use App\Http\Controllers\Api\StatistikController;
use App\Http\Controllers\Api\TitikBencanaController;
use App\Http\Controllers\Api\NotifikasiController;

Route::get('/', function () {
    return Inertia::render('LandingPage');
})->name('home');

// Public routes
Route::get('jalur-evakuasi', [JalurEvakuasiController::class, 'index']);
Route::get('jalur-evakuasi/{jalurEvakuasi}', [JalurEvakuasiController::class, 'show']);
Route::get('poskos', [PoskoController::class, 'index']);
Route::get('poskos/{posko}', [PoskoController::class, 'show']);
Route::get('statistik', [StatistikController::class, 'index']);
Route::get('titik-bencana', [TitikBencanaController::class, 'index']);
Route::get('laporan-bencana', [LaporanController::class, 'index']);
Route::get('statistik-bencana', [StatistikController::class, 'index']);
Route::get('laporans', [LaporanController::class, 'index']);
Route::get('laporans/{laporan}', [LaporanController::class, 'show']);

// API routes with Sanctum authentication
Route::prefix('api')->middleware(['auth:sanctum'])->group(function () {
    Route::get('laporan-saya', [LaporanController::class, 'getMyReports']);
    Route::put('profile', [App\Http\Controllers\Settings\ProfileController::class, 'update'])->name('profile.api.update');

    // User API Routes
    Route::post('login', [App\Http\Controllers\Auth\AuthenticatedSessionController::class, 'store']);
    Route::post('register', [App\Http\Controllers\Auth\RegisteredUserController::class, 'store']);
    Route::post('logout', [App\Http\Controllers\Auth\AuthenticatedSessionController::class, 'destroy']);
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // Routes for all authenticated users
    Route::post('laporans', [LaporanController::class, 'store']);

    // Masyarakat routes
    Route::get('akun-saya', function () {
        return Inertia::render('masyarakat/AkunSaya');
    })->name('akun-saya');

    Route::get('laporan-saya', function () {
        return Inertia::render('masyarakat/MasyarakatDashboard');
    })->name('laporan-saya');

    Route::get('laporan-bencana/create', function () {
        return Inertia::render('masyarakat/BuatLaporan');
    })->name('laporan-bencana.create');

    // Relawan Dashboard
    Route::middleware('role:relawan')->group(function () {
        Route::get('relawan/dashboard', function () {
            return Inertia::render('relawan/RelawanDashboard');
        })->name('relawan.dashboard');
    });

    // Endpoint untuk relawan & admin
    Route::middleware(['auth'])->group(function () {
        Route::apiResource('jalur-evakuasi', JalurEvakuasiController::class)->except(['index', 'show']);
        Route::apiResource('poskos', PoskoController::class)->except(['index', 'show']);
    });

    // Admin routes
    Route::middleware(['auth'])->group(function () {
        Route::resource('users', UserController::class);
        Route::put('laporans/{laporan}/verify', [LaporanController::class, 'verify']);
        Route::put('laporans/{laporan}/reject', [LaporanController::class, 'reject']);
        Route::delete('laporans/{laporan}', [LaporanController::class, 'destroy']);
        Route::put('laporan-bencana/{laporan}/verifikasi', [LaporanController::class, 'verify']);
        Route::post('notifikasi', [NotifikasiController::class, 'send']);
    });
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
