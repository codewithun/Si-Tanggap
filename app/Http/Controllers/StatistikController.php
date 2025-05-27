<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Laporan;
use App\Models\Posko;
use App\Models\JalurEvakuasi;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class StatistikController extends Controller
{
    /**
     * Display a listing of statistics.
     */
    public function index()
    {
        // Statistik laporan berdasarkan jenis bencana
        $laporanByJenis = Laporan::select('jenis_bencana', DB::raw('count(*) as total'))
            ->groupBy('jenis_bencana')
            ->get();

        // Statistik laporan berdasarkan status
        $laporanByStatus = Laporan::select('status', DB::raw('count(*) as total'))
            ->groupBy('status')
            ->get();

        // Statistik laporan per bulan (12 bulan terakhir)
        $laporanPerBulan = Laporan::select(
            DB::raw('YEAR(created_at) as tahun'),
            DB::raw('MONTH(created_at) as bulan'),
            DB::raw('count(*) as total')
        )
            ->where('created_at', '>=', now()->subMonths(12))
            ->groupBy('tahun', 'bulan')
            ->orderBy('tahun')
            ->orderBy('bulan')
            ->get();

        // Statistik posko berdasarkan jenis
        $poskoByJenis = Posko::select('jenis_posko', DB::raw('count(*) as total'))
            ->groupBy('jenis_posko')
            ->get();

        // Statistik jalur evakuasi berdasarkan jenis bencana
        $jalurByJenis = JalurEvakuasi::select('jenis_bencana', DB::raw('count(*) as total'))
            ->groupBy('jenis_bencana')
            ->get();

        // Statistik user berdasarkan role
        $usersByRole = User::select('role', DB::raw('count(*) as total'))
            ->groupBy('role')
            ->get();

        // Statistik total
        $totalLaporan = Laporan::count();
        $totalPosko = Posko::count();
        $totalJalurEvakuasi = JalurEvakuasi::count();
        $totalUsers = User::count();

        return response()->json([
            'laporan_by_jenis' => $laporanByJenis,
            'laporan_by_status' => $laporanByStatus,
            'laporan_per_bulan' => $laporanPerBulan,
            'posko_by_jenis' => $poskoByJenis,
            'jalur_by_jenis' => $jalurByJenis,
            'users_by_role' => $usersByRole,
            'totals' => [
                'laporan' => $totalLaporan,
                'posko' => $totalPosko,
                'jalur_evakuasi' => $totalJalurEvakuasi,
                'users' => $totalUsers,
            ]
        ])
            ->header('Access-Control-Allow-Origin', '*')
            ->header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
            ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }
}
