<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\{
    UserController,
    JalurEvakuasiController,
    PoskoController,
    LaporanController,
    StatistikController,
    TitikBencanaController,
    NotifikasiController,
    RegionController
};
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Auth\{
    AuthenticatedSessionController,
    RegisteredUserController
};

// ------------------------
// 🌐 Public Web Routes
// ------------------------
Route::get('/', fn() => Inertia::render('LandingPage'))->name('home');
Route::get('/map', fn() => Inertia::render('map/MapKeseluruhan'))->name('map');

Route::name('jalur-evakuasi.')->prefix('jalur-evakuasi')->group(function () {
    Route::get('/', [JalurEvakuasiController::class, 'index'])->name('index');
    Route::get('/{jalurEvakuasi}', [JalurEvakuasiController::class, 'show'])->name('show');
});

Route::name('poskos.')->prefix('poskos')->group(function () {
    Route::get('/', [PoskoController::class, 'index'])->name('index');
    Route::get('/{posko}', [PoskoController::class, 'show'])->name('show');
});

Route::get('/titik-bencana', [TitikBencanaController::class, 'index'])->name('titik-bencana.index');
Route::get('/statistik-bencana', [StatistikController::class, 'index'])->name('statistik.index');

Route::name('laporans.')->prefix('laporans')->group(function () {
    Route::get('/', [LaporanController::class, 'index'])->name('index');
    Route::get('/{laporan}', [LaporanController::class, 'show'])->name('show');
});

// Add this route to the public routes section
Route::get('/news', function () {
    return Inertia::render('NewsPage');
})->name('news');

// ------------------------
// 🔐 Protected Web Routes
// ------------------------
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', fn() => Inertia::render('dashboard'))->name('dashboard');

    // Laporan oleh pengguna
    Route::post('/laporans', [LaporanController::class, 'store'])->name('laporans.store');

    // 👤 Masyarakat
    Route::name('masyarakat.')->prefix('akun-saya')->group(function () {
        Route::get('/', fn() => Inertia::render('masyarakat/AkunSaya'))->name('index');
        Route::get('/dashboard', fn() => Inertia::render('masyarakat/MasyarakatDashboard'))->name('dashboard');
        Route::get('/laporan-saya', fn() => Inertia::render('masyarakat/MasyarakatDashboard'))->name('laporan');
        Route::get('/buat-laporan', fn() => Inertia::render('masyarakat/BuatLaporan'))->name('buat-laporan');
    });

    // 🦺 Relawan
    Route::middleware(['auth'])->prefix('relawan')->name('relawan.')->group(function () {
        Route::get('/dashboard', fn() => Inertia::render('relawan/RelawanDashboard'))->name('dashboard');
        Route::get('/bencana-map', fn() => Inertia::render('relawan/BencanaMap'))->name('bencana-map');
        Route::get('/evacuation-and-shelter-map', fn() => Inertia::render('relawan/EvacuationAndShelterMap'))->name('evacuation-map');
        Route::get('/add-evacuation-and-shelter', fn() => Inertia::render('relawan/AddEvacuationAndShelter'))->name('add-evacuation');
        Route::get('/disaster-report-verification', fn() => Inertia::render('relawan/DisasterReportVerification'))->name('report-verification');
    });

    // 🔄 Shared (Relawan + Admin)
    Route::middleware(['auth'])->group(function () {
        Route::apiResource('jalur-evakuasi', JalurEvakuasiController::class)->except(['index', 'show']);
        Route::apiResource('poskos', PoskoController::class)->except(['index', 'show']);
    });

    // 🛡️ Admin Only
    Route::middleware(['auth'])->prefix('admin')->name('admin.')->group(function () {
        Route::get('/dashboard', fn() => Inertia::render('admin/AdminDashboard'))->name('dashboard');

        // New admin routes
        Route::get('/statistics', fn() => Inertia::render('admin/DisasterStatistics'))->name('statistics');
        Route::get('/disaster-map', fn() => Inertia::render('admin/DisasterMap'))->name('disaster-map');
        Route::get('/evacuation-routes', fn() => Inertia::render('admin/EvacuationRouteForm'))->name('evacuation-routes');
        Route::get('/shelters', fn() => Inertia::render('admin/PoskoForm'))->name('shelters');
        Route::get('/reports', fn() => Inertia::render('admin/ReportManagement'))->name('reports');
        Route::get('/notifications', fn() => Inertia::render('admin/SendNotification'))->name('notifications');

        // Modified users route to avoid conflict
        Route::get('/users', fn() => Inertia::render('admin/UserManagement'))->name('users.index');

        // Resource routes - keep them after the explicit routes to avoid conflicts
        Route::resource('users', UserController::class)->except(['index']);
        Route::put('laporans/{laporan}/verify', [LaporanController::class, 'verify'])->name('laporans.verify');
        Route::put('laporans/{laporan}/reject', [LaporanController::class, 'reject'])->name('laporans.reject');
        Route::delete('laporans/{laporan}', [LaporanController::class, 'destroy'])->name('laporans.destroy');
        Route::post('notifikasi', [NotifikasiController::class, 'send'])->name('notifikasi.send');
    });
});

// ------------------------
// 🔐 API Routes - Authenticated
// ------------------------
Route::prefix('api')->middleware(['auth', 'verified'])->group(function () {
    Route::get('/laporan-saya', [LaporanController::class, 'getMyReports'])->name('api.laporan-saya');
    Route::put('/profile', [ProfileController::class, 'update'])->name('api.profile.update');
});

// ------------------------
// 🌐 API Routes - Public
// ------------------------
Route::prefix('api')->group(function () {
    Route::post('/login', [AuthenticatedSessionController::class, 'store'])->name('api.login');
    Route::post('/register', [RegisteredUserController::class, 'store'])->name('api.register');
    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])->name('api.logout');
    Route::get('/regions', [RegionController::class, 'index'])->name('api.regions');
});

// ------------------------
// 🔗 Include Additional Routes
// ------------------------
require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
