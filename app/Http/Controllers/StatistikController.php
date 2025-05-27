<?php

namespace App\Http\Controllers;

use App\Models\Laporan;
use App\Models\Posko;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StatistikController extends Controller
{
    /**
     * Display a listing of statistics.
     */
    public function index()
    {
        try {
            // Count total disaster reports
            $totalLaporan = Laporan::count();

            // Count verified reports
            $totalLaporanVerified = Laporan::where('status', 'diverifikasi')->count();

            // Count distinct disaster locations (considering verified reports as disasters)
            $totalBencana = Laporan::where('status', 'diverifikasi')
                ->distinct('latitude', 'longitude')
                ->count();

            // Count total shelters
            $totalPosko = Posko::count();

            // Count disasters by type
            $bencanaBerdasarkanJenis = Laporan::where('status', 'diverifikasi')
                ->select('jenis_bencana', DB::raw('count(*) as total'))
                ->groupBy('jenis_bencana')
                ->pluck('total', 'jenis_bencana')
                ->toArray();

            // Get monthly report counts for the current year
            $laporanBulanan = Laporan::select(
                DB::raw('DATE_FORMAT(created_at, "%Y-%m") as month'),
                DB::raw('count(*) as total')
            )
                ->whereYear('created_at', date('Y'))
                ->groupBy('month')
                ->pluck('total', 'month')
                ->toArray();

            // Format the month names
            $formattedLaporanBulanan = [];
            foreach ($laporanBulanan as $month => $count) {
                $date = \Carbon\Carbon::createFromFormat('Y-m', $month);
                $formattedLaporanBulanan[$date->format('F')] = $count;
            }

            return response()->json([
                'totalBencana' => $totalBencana,
                'totalLaporan' => $totalLaporan,
                'totalLaporanVerified' => $totalLaporanVerified,
                'totalPosko' => $totalPosko,
                'bencanaBerdasarkanJenis' => $bencanaBerdasarkanJenis,
                'laporanBulanan' => $formattedLaporanBulanan,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to retrieve statistics',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mendapatkan data statistik untuk dashboard relawan
     */
    public function relawanDashboardStats()
    {
        // Hitung total laporan dari tabel laporans
        $totalLaporan = Laporan::count();

        // Hitung laporan dengan status "diverifikasi"
        $laporanDiverifikasi = Laporan::where('status', 'diverifikasi')->count();

        // Hitung posko aktif dari tabel poskos
        $poskoAktif = Posko::where('status', 'aktif')->count();

        // Ambil 5 laporan terbaru yang masih berstatus menunggu
        $laporanTerbaru = Laporan::where('status', 'menunggu')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get(['id', 'judul', 'jenis_bencana', 'lokasi', 'created_at']);

        // Kembalikan data dalam format JSON
        return response()->json([
            'totalLaporan' => $totalLaporan,
            'laporanDiverifikasi' => $laporanDiverifikasi,
            'poskoAktif' => $poskoAktif,
            'laporanTerbaru' => $laporanTerbaru
        ]);
    }
}
