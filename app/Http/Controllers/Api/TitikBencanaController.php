<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Laporan;
use Illuminate\Http\Request;

class TitikBencanaController extends Controller
{
    /**
     * Display a listing of all disaster points for the map.
     */    public function index(Request $request)
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
            'created_at',
            'kota_kabupaten',
            'tingkat_bahaya' // Include risk level field if it exists
        )
            ->whereNotNull('latitude')
            ->whereNotNull('longitude');

        // Filter by disaster type if provided
        if ($request->has('jenis_bencana')) {
            // Handle multiple types as array or comma-separated string
            $jenisBencana = $request->jenis_bencana;
            if (is_string($jenisBencana) && strpos($jenisBencana, ',') !== false) {
                $types = explode(',', $jenisBencana);
                $query->whereIn('jenis_bencana', $types);
            } else {
                $query->where('jenis_bencana', $jenisBencana);
            }
        }

        // Filter by status if provided
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by risk level if provided
        if ($request->has('tingkat_bahaya') && $request->tingkat_bahaya !== 'semua') {
            $query->where('tingkat_bahaya', $request->tingkat_bahaya);
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
