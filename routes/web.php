<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\UserController;
use App\Http\Controllers\Api\{
    JalurEvakuasiController,
    PoskoController,
    LaporanController,
    StatistikController,
    TitikBencanaController,
    NotifikasiController,
    RegionController,
};
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Auth\{
    AuthenticatedSessionController,
    RegisteredUserController,
};

// ------------------------
// 🔓 Public Web Routes
// ------------------------

Route::get('/', fn () => Inertia::render('LandingPage'))->name('home');
Route::get('/map', fn () => Inertia::render('map/MapKeseluruhan'))->name('map');

Route::prefix('jalur-evakuasi')->name('jalur-evakuasi.')->group(function () {
    Route::get('/', [JalurEvakuasiController::class, 'index'])->name('index');
    Route::get('/{jalurEvakuasi}', [JalurEvakuasiController::class, 'show'])->name('show');
});

Route::prefix('poskos')->name('poskos.')->group(function () {
    Route::get('/', [PoskoController::class, 'index'])->name('index');
    Route::get('/{posko}', [PoskoController::class, 'show'])->name('show');
});

Route::get('/titik-bencana', [TitikBencanaController::class, 'index'])->name('titik-bencana.index');
Route::get('/statistik-bencana', [StatistikController::class, 'index'])->name('statistik.index');

Route::prefix('laporans')->name('laporans.')->group(function () {
    Route::get('/', [LaporanController::class, 'index'])->name('index');
    Route::get('/{laporan}', [LaporanController::class, 'show'])->name('show');
});

// ------------------------
// 🔒 Protected Web Routes
// ------------------------

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', fn () => Inertia::render('dashboard'))->name('dashboard');

    // Submit laporan
    Route::post('/laporans', [LaporanController::class, 'store'])->name('laporans.store');

    // Masyarakat routes
    Route::prefix('akun-saya')->name('masyarakat.')->group(function () {
        Route::get('/', fn () => Inertia::render('masyarakat/AkunSaya'))->name('akun-saya');
        Route::get('/laporan-saya', fn () => Inertia::render('masyarakat/MasyarakatDashboard'))->name('laporan-saya');
        Route::get('/buat-laporan', fn () => Inertia::render('masyarakat/BuatLaporan'))->name('laporan-bencana.create');
    });

    // Relawan routes
    Route::middleware(['role:relawan'])->prefix('relawan')->as('relawan.')->group(function () {
        Route::get('/dashboard', fn () => Inertia::render('relawan/RelawanDashboard'))->name('dashboard');
        Route::get('/bencana-map', fn () => Inertia::render('relawan/BencanaMap'))->name('bencana-map');
        Route::get('/evacuation-and-shelter-map', fn () => Inertia::render('relawan/EvacuationAndShelterMap'))->name('evacuation-map');
        Route::get('/add-evacuation-and-shelter', fn () => Inertia::render('relawan/AddEvacuationAndShelter'))->name('add-evacuation');
        Route::get('/disaster-report-verification', fn () => Inertia::render('relawan/DisasterReportVerification'))->name('report-verification');
    });

    // Shared Relawan & Admin
    Route::middleware(['role:relawan|admin'])->group(function () {
        Route::apiResource('jalur-evakuasi', JalurEvakuasiController::class)->except(['index', 'show']);
        Route::apiResource('poskos', PoskoController::class)->except(['index', 'show']);
    });

    // Admin-only routes
    Route::middleware(['role:admin'])->group(function () {
        Route::resource('users', UserController::class);
        Route::put('laporans/{laporan}/verify', [LaporanController::class, 'verify'])->name('laporans.verify');
        Route::put('laporans/{laporan}/reject', [LaporanController::class, 'reject'])->name('laporans.reject');
        Route::delete('laporans/{laporan}', [LaporanController::class, 'destroy'])->name('laporans.destroy');
        Route::post('notifikasi', [NotifikasiController::class, 'send'])->name('notifikasi.send');
    });
});

// ------------------------
// 🔒 Authenticated API Routes
// ------------------------

Route::prefix('api')->middleware('auth:sanctum')->group(function () {
    Route::get('/laporan-saya', [LaporanController::class, 'getMyReports'])->name('api.laporan-saya');
    Route::put('/profile', [ProfileController::class, 'update'])->name('api.profile.update');
});

// ------------------------
// 🔓 Public API Routes (no auth required)
// ------------------------

Route::prefix('api')->group(function () {
    Route::post('/login', [AuthenticatedSessionController::class, 'store'])->name('api.login');
    Route::post('/register', [RegisteredUserController::class, 'store'])->name('api.register');
    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])->name('api.logout');
    Route::get('/regions', [RegionController::class, 'index'])->name('api.regions');
});

// ------------------------
// 📄 Include Additional Route Files
// ------------------------

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
