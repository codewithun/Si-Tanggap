<?php

namespace App\Http\Controllers;

use App\Models\Laporan;
use App\Models\Posko;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Carbon\Carbon;

class StatistikController extends Controller
{
    /**
     * Display a listing of statistics.
     */
    public function index()
    {
        try {
            // Hitung total bencana dengan status yang benar (diverifikasi)
            $totalBencana = Laporan::where('status', 'diverifikasi')->count();

            // Hitung total laporan terverifikasi
            $totalLaporanVerified = Laporan::where('status', 'diverifikasi')->count();

            // Hitung total laporan keseluruhan
            $totalLaporan = Laporan::count();

            // Hitung total posko
            $totalPosko = Posko::count();

            // Periksa apakah kolom 'role' ada di tabel users
            $totalUsers = User::count();
            $totalMasyarakat = 0;
            $totalRelawan = 0;
            $totalAdmin = 0;

            // Periksa terlebih dahulu apakah kolom role ada
            if (Schema::hasColumn('users', 'role')) {
                $totalMasyarakat = User::where('role', 'masyarakat')->count();
                $totalRelawan = User::where('role', 'relawan')->count();
                $totalAdmin = User::where('role', 'admin')->count();
            }
            // Coba dengan 'user_role' sebagai alternatif
            else if (Schema::hasColumn('users', 'user_role')) {
                $totalMasyarakat = User::where('user_role', 'masyarakat')->count();
                $totalRelawan = User::where('user_role', 'relawan')->count();
                $totalAdmin = User::where('user_role', 'admin')->count();
            }
            // Coba dengan 'type' sebagai alternatif
            else if (Schema::hasColumn('users', 'type')) {
                $totalMasyarakat = User::where('type', 'masyarakat')->count();
                $totalRelawan = User::where('type', 'relawan')->count();
                $totalAdmin = User::where('type', 'admin')->count();
            }
            // Cek apakah menggunakan Spatie permission
            else {
                try {
                    $totalMasyarakat = User::role('masyarakat')->count();
                    $totalRelawan = User::role('relawan')->count();
                    $totalAdmin = User::role('admin')->count();
                } catch (\Exception $e) {
                    // Jika gagal, gunakan default
                    $totalMasyarakat = 0;
                    $totalRelawan = 0;
                    $totalAdmin = 0;
                }
            }

            // Hitung bencana berdasarkan jenis
            $bencanaBerdasarkanJenis = Laporan::where('status', 'diverifikasi')
                ->select('jenis_bencana', DB::raw('count(*) as total'))
                ->groupBy('jenis_bencana')
                ->pluck('total', 'jenis_bencana')
                ->toArray();

            // Hitung laporan bulanan untuk 6 bulan terakhir
            $laporanBulanan = [];
            for ($i = 5; $i >= 0; $i--) {
                $month = Carbon::now()->subMonths($i);
                $count = Laporan::whereYear('created_at', $month->year)
                    ->whereMonth('created_at', $month->month)
                    ->count();
                $laporanBulanan[$month->format('M Y')] = $count;
            }

            return response()->json([
                'totalBencana' => $totalBencana,
                'totalLaporan' => $totalLaporan,
                'totalLaporanVerified' => $totalLaporanVerified,
                'totalPosko' => $totalPosko,
                'totalUsers' => $totalUsers,
                'totalMasyarakat' => $totalMasyarakat,
                'totalRelawan' => $totalRelawan,
                'totalAdmin' => $totalAdmin,
                'bencanaBerdasarkanJenis' => $bencanaBerdasarkanJenis,
                'laporanBulanan' => $laporanBulanan
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Terjadi kesalahan saat mengambil data statistik',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mendapatkan data statistik untuk dashboard relawan
     */
    public function relawanDashboardStats()
    {
        try {
            // Dapatkan 5 laporan terbaru yang menunggu verifikasi
            $laporanTerbaru = \App\Models\Laporan::with('user')
                ->where('status', 'menunggu')
                ->orderBy('created_at', 'desc')
                ->take(5)
                ->get()
                ->map(function ($laporan) {
                    return [
                        'id' => $laporan->id,
                        'judul' => $laporan->judul,
                        'jenis_bencana' => $laporan->jenis_bencana,
                        'lokasi' => $laporan->lokasi,
                        'created_at' => $laporan->created_at,
                    ];
                });

            // Hitung statistik yang diperlukan
            $totalLaporan = \App\Models\Laporan::count();
            $laporanDiverifikasi = \App\Models\Laporan::where('status', 'diverifikasi')->count();
            $poskoAktif = \App\Models\Posko::where('status', 'aktif')->count();

            return response()->json([
                'totalLaporan' => $totalLaporan,
                'laporanDiverifikasi' => $laporanDiverifikasi,
                'poskoAktif' => $poskoAktif,
                'laporanTerbaru' => $laporanTerbaru
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Terjadi kesalahan saat mengambil data statistik',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
