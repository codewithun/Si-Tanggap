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
    RegionController,
    TestEmailController,
    EmailDebugController,
    BeritaScraperController,
    DetikScraperController
};
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Auth\{
    AuthenticatedSessionController,
    RegisteredUserController
};
use App\Http\Controllers\Auth\GoogleController; // ← Tambahkan di sini
use App\Http\Controllers\Api\MasyarakatDashboardController;

// ------------------------
// 🌐 Public Web Routes
// ------------------------
Route::get('/', fn() => Inertia::render('LandingPage'))->name('home');
Route::get('/map', fn() => Inertia::render('map/MapKeseluruhan'))->name('map');
Route::get('/peta-bencana', fn() => Inertia::render('masyarakat/BencanaMaps'))->name('bencana-maps');

// Rute pengujian email
Route::get('/test-email', [TestEmailController::class, 'sendTestEmail'])->name('test.email');
Route::get('/send-test-email', [TestEmailController::class, 'sendToAddress'])->name('send.test.email');
Route::get('/test-email-by-role', [\App\Http\Controllers\RoleEmailTestController::class, 'testByRole'])->name('test.email.role');
Route::get('/debug-email', [EmailDebugController::class, 'debug'])->name('debug.email');
Route::get('/check-smtp', [EmailDebugController::class, 'checkSmtp'])->name('check.smtp');
Route::get('/email-tester', function () {
    return view('email-tester');
})->name('email.tester');

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

// Berita routes
Route::get('/berita-bnpb', [App\Http\Controllers\BeritaScraperController::class, 'index']);
Route::get('/berita-detik', [App\Http\Controllers\DetikScraperController::class, 'index']);
Route::get('/berita-merged', [App\Http\Controllers\BeritaController::class, 'getBeritaMerged']);

// ------------------------
// 🔐 Protected Web Routes
// ------------------------
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', fn() => Inertia::render('dashboard'))->name('dashboard');

    // Laporan oleh pengguna
    Route::post('/laporans', [LaporanController::class, 'store'])->name('laporans.store');

    // 👤 Masyarakat
    Route::name('masyarakat.')->prefix('masyarakat')->group(function () {
        Route::get('/', fn() => Inertia::render('masyarakat/AkunSaya'))->name('index');
        Route::get('/dashboard', fn() => Inertia::render('masyarakat/MasyarakatDashboard'))->name('dashboard');
        Route::get('/laporan-saya', fn() => Inertia::render('masyarakat/MasyarakatDashboard'))->name('laporan');
        // Alias agar route('masyarakat.dashboard') mengarah ke /masyarakat/laporan-saya
        Route::get('/laporan-saya', fn() => Inertia::render('masyarakat/MasyarakatDashboard'))->name('dashboard');
        Route::get('/buat-laporan', fn() => Inertia::render('masyarakat/BuatLaporan'))->name('buat-laporan');
        Route::get('/peta-bencana', fn() => Inertia::render('masyarakat/BencanaMaps'))->name('peta-bencana');
    });

    // 🦺 Relawan
    Route::middleware(['auth'])->prefix('relawan')->name('relawan.')->group(function () {
        Route::get('/dashboard', fn() => Inertia::render('relawan/RelawanDashboard'))->name('dashboard');
        Route::get('/bencana-map', fn() => Inertia::render('relawan/BencanaMap'))->name('bencana-map');
        Route::get('/evacuation-and-shelter-map', fn() => Inertia::render('relawan/EvacuationAndShelterMap'))->name('evacuation-map');
        Route::get('/add-evacuation-and-shelter', fn() => Inertia::render('relawan/AddEvacuationAndShelter'))->name('add-evacuation');
        Route::get('/disaster-report-verification', fn() => Inertia::render('relawan/DisasterReportVerification'))->name('report-verification');

        // Add these routes for laporan verification in relawan section
        Route::get('/laporans', [LaporanController::class, 'getUnverifiedReports'])->name('laporans.index');
        Route::put('/laporans/{laporan}/verify', [LaporanController::class, 'verify'])->name('laporans.verify');
        Route::put('/laporans/{laporan}/reject', [LaporanController::class, 'reject'])->name('laporans.reject');
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
        Route::get('/map', fn() => Inertia::render('admin/AdminMap'))->name('map');

        // PERBAIKAN: Gunakan satu route definition yang jelas untuk halaman manajemen user
        Route::get('/users', fn() => Inertia::render('admin/UserManagement'))->name('users.index');

        // CRUD operations untuk users
        Route::post('/users', [UserController::class, 'store'])->name('users.store');
        Route::get('/users/{user}/edit', [UserController::class, 'edit'])->name('users.edit');
        Route::put('/users/{user}', [UserController::class, 'update'])->name('users.update');
        Route::patch('/users/{user}', [UserController::class, 'update'])->name('users.update');
        Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('users.destroy');

        // API endpoint untuk mengambil data user
        Route::get('/users/data', [UserController::class, 'getUsers'])->name('users.data');

        // Laporans
        Route::put('laporans/{laporan}/verify', [LaporanController::class, 'verify'])->name('laporans.verify');
        Route::put('laporans/{laporan}/reject', [LaporanController::class, 'reject'])->name('laporans.reject');
        Route::delete('laporans/{laporan}', [LaporanController::class, 'destroy'])->name('laporans.destroy');

        // Add these new routes for update functionality
        Route::put('laporans/{laporan}', [LaporanController::class, 'update'])->name('laporans.update');
        Route::patch('laporans/{laporan}', [LaporanController::class, 'update'])->name('laporans.update');

        // Notifikasi
        Route::post('notifikasi', [NotifikasiController::class, 'send'])->name('notifikasi.send');
    });

    // Masyarakat Dashboard routes
    Route::get('/masyarakat/laporan-saya/data', [MasyarakatDashboardController::class, 'getLaporanSaya'])
        ->name('masyarakat.laporan-saya.data');
});

// ------------------------
// 🔐 API Routes - Authenticated
// ------------------------
Route::prefix('api')->middleware(['auth', 'verified'])->group(function () {
    // Change this route to use MasyarakatDashboardController instead of LaporanController
    Route::get('/laporan-saya', [MasyarakatDashboardController::class, 'getLaporanSaya'])->name('api.laporan-saya');
    Route::put('/profile', [ProfileController::class, 'update'])->name('api.profile.update');
    Route::get('/users', [UserController::class, 'index'])->name('api.users.index');

    // Tambahkan endpoint baru untuk dashboard relawan
    Route::get('/relawan/dashboard-stats', [StatistikController::class, 'relawanDashboardStats'])
        ->name('api.relawan.dashboard-stats');

    // Add this route to fix the 404 error when sending notifications
    Route::post('/notifikasi', [NotifikasiController::class, 'send'])->name('api.notifikasi.send');

    // Add API endpoint for relawan to get unverified reports
    Route::get('/relawan/laporans', [LaporanController::class, 'getUnverifiedReports'])->name('api.relawan.laporans');
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

Route::get('auth/google', [GoogleController::class, 'redirectToGoogle'])->name('google.login');
Route::get('auth/google/callback', [GoogleController::class, 'handleGoogleCallback']);

// ------------------------
// 🔗 Include Additional Routes
// ------------------------
require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';

// Add this debugging route to check the API response directly
Route::get('/debug-bnpb-api', function () {
    $client = new \GuzzleHttp\Client();
    $response = $client->get('URL_OF_YOUR_BNPB_API_HERE');
    $data = json_decode($response->getBody(), true);

    // Return sample data with image URLs
    return response()->json([
        'status' => 'success',
        'data' => array_map(function ($item) {
            return [
                'title' => $item['title'],
                'image' => $item['image'],
                'processed_image' => (!empty($item['image']) && !str_starts_with($item['image'], 'http'))
                    ? "https://bnpb.go.id" . (str_starts_with($item['image'], '/') ? '' : '/') . $item['image']
                    : $item['image']
            ];
        }, array_slice($data['berita'], 0, 3))
    ]);
});
