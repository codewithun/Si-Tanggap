<?php

namespace App\Http\Controllers;

use App\Models\Laporan;
use App\Models\Posko;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class StatistikController extends Controller
{
    public function index()
    {
        $totalBencana = Laporan::distinct('jenis_bencana')->count('jenis_bencana');

        $totalLaporan = Laporan::count();

        $totalLaporanVerified = Laporan::where('status', 'diverifikasi')->count();

        $totalPosko = Posko::count();

        $bencanaBerdasarkanJenis = Laporan::select('jenis_bencana', DB::raw('count(*) as total'))
            ->groupBy('jenis_bencana')
            ->pluck('total', 'jenis_bencana')
            ->toArray();

        $laporanBulananRaw = Laporan::select(
            DB::raw("DATE_FORMAT(created_at, '%Y-%m') as bulan"),
            DB::raw('count(*) as total')
        )
            ->groupBy('bulan')
            ->orderBy('bulan', 'desc')
            ->take(12)
            ->pluck('total', 'bulan')
            ->toArray();

        $laporanBulananFormatted = [];
        foreach ($laporanBulananRaw as $bulan => $total) {
            $namaBulan = Carbon::createFromFormat('Y-m', $bulan)->locale('id')->isoFormat('MMMM YYYY');
            $laporanBulananFormatted[$bulan] = $total;
        }

        return response()->json([
            'totalBencana' => $totalBencana,
            'totalLaporan' => $totalLaporan,
            'totalLaporanVerified' => $totalLaporanVerified,
            'totalPosko' => $totalPosko,
            'bencanaBerdasarkanJenis' => $bencanaBerdasarkanJenis,
            'laporanBulanan' => $laporanBulananFormatted,
        ]);
    }
}
