<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Laporan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class TitikBencanaController extends Controller
{
    /**
     * Display a listing of all disaster points for the map.
     */
    public function index(Request $request)
    {
        try {
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
                'tingkat_bahaya'
            )
                ->whereNotNull('latitude')
                ->whereNotNull('longitude');

            // Only show verified reports by default
            if (!$request->has('status')) {
                $query->where('status', 'diverifikasi');
            } else if ($request->status !== 'semua') {
                $query->where('status', $request->status);
            }

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

            return response()->json([
                'data' => $titikBencana,
                'message' => 'Data titik bencana berhasil diambil'
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error in TitikBencanaController@index: ' . $e->getMessage());
            return response()->json([
                'message' => 'Terjadi kesalahan saat mengambil data titik bencana',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
