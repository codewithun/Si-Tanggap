<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Laporan;
use Illuminate\Http\Request;

class TitikBencanaController extends Controller
{
    /**
     * Display a listing of all disaster points for the map.
     */
    public function index(Request $request)
    {
        $query = Laporan::select(
            'id',
            'judul',
            'jenis_bencana',
            'lokasi',
            'latitude',
            'longitude',
            'deskripsi',
            'status',
            'created_at as tanggal',
            'kota_kabupaten'
        )
            ->whereNotNull('latitude')
            ->whereNotNull('longitude');

        // Filter by disaster type if provided
        if ($request->has('jenis_bencana')) {
            $query->where('jenis_bencana', $request->jenis_bencana);
        }

        // Filter by status if provided
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by date range if provided
        if ($request->has('date_from')) {
            $query->where('created_at', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $query->where('created_at', '<=', $request->date_to);
        }

        $titikBencana = $query->get();

        return response()->json($titikBencana);
    }
}
