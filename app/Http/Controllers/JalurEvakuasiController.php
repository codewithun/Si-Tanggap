<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\JalurEvakuasi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class JalurEvakuasiController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $query = JalurEvakuasi::with('user:id,name,email')
                ->orderBy('created_at', 'desc');

            // Filter berdasarkan jenis bencana jika parameter ada
            if ($request->has('jenis_bencana')) {
                $query->where('jenis_bencana', $request->jenis_bencana);
            }

            // Pencarian berdasarkan nama
            if ($request->has('search')) {
                $query->where('nama', 'like', '%' . $request->search . '%');
            }

            // Paginate the results
            $perPage = $request->input('per_page', 10);
            $jalurEvakuasis = $query->paginate($perPage);

            // Set no-cache headers untuk mencegah caching response
            $headers = [
                'Cache-Control' => 'no-store, no-cache, must-revalidate, max-age=0', 
                'Pragma' => 'no-cache',
                'Expires' => '0'
            ];

            // Return basic data if there's an issue with transformation
            return response()->json($jalurEvakuasis, 200, $headers);
        } catch (\Exception $e) {
            Log::error('JalurEvakuasi index error: ' . $e->getMessage());
            Log::error('Error trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'message' => 'Terjadi kesalahan saat memuat data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'deskripsi' => 'required|string',
            'koordinat' => 'required|array|min:2',
            'koordinat.*' => 'required|array',
            'koordinat.*.lat' => 'required|numeric|between:-90,90',
            'koordinat.*.lng' => 'required|numeric|between:-180,180',
            'jenis_bencana' => 'required|string|max:255',
            'warna' => 'nullable|string|max:255',
        ]);
        
        // Debug log koordinat format
        Log::info('Received koordinat format:', [
            'type' => gettype($validated['koordinat']),
            'sample' => isset($validated['koordinat'][0]) ? $validated['koordinat'][0] : null
        ]);
        
        // Ensure coordinates are in object format with lat/lng properties
        $normalizedKoordinat = [];
        foreach ($validated['koordinat'] as $point) {
            if (isset($point['lat']) && isset($point['lng'])) {
                $normalizedKoordinat[] = [
                    'lat' => (float) $point['lat'],
                    'lng' => (float) $point['lng']
                ];
            }
        }
        
        // Store coordinates directly as array of objects to maintain consistent format
        // Using this format directly which is what the AdminMap component expects
        $jalurEvakuasi = JalurEvakuasi::create([
            'user_id' => $request->user()->id,
            'nama' => $validated['nama'],
            'deskripsi' => $validated['deskripsi'],
            'koordinat' => $normalizedKoordinat, // Use normalized coordinates
            'jenis_bencana' => $validated['jenis_bencana'],
            'warna' => $validated['warna'] ?? '#FF0000',
        ]);

        // Invalidasi cache dengan headers
        $headers = [
            'Cache-Control' => 'no-store, no-cache, must-revalidate, max-age=0', 
            'Pragma' => 'no-cache',
            'Expires' => '0'
        ];

        return response()->json([
            'message' => 'Jalur evakuasi berhasil dibuat',
            'data' => $jalurEvakuasi
        ], 201, $headers);
    }

    /**
     * Display the specified resource.
     */
    public function show(JalurEvakuasi $jalurEvakuasi)
    {
        $jalurEvakuasi->load('user:id,name,email');
        
        // Set no-cache headers untuk mencegah caching response
        $headers = [
            'Cache-Control' => 'no-store, no-cache, must-revalidate, max-age=0', 
            'Pragma' => 'no-cache',
            'Expires' => '0'
        ];
        
        return response()->json($jalurEvakuasi, 200, $headers);
    }

    /**
     * Update the specified resource.
     */
    public function update(Request $request, JalurEvakuasi $jalurEvakuasi)
    {
        // Cek apakah user adalah pemilik jalur evakuasi atau admin
        if ($request->user()->id !== $jalurEvakuasi->user_id && !$request->user()->isAdmin()) {
            return response()->json([
                'message' => 'Anda tidak diizinkan untuk mengubah jalur evakuasi ini'
            ], 403);
        }

        $validated = $request->validate([
            'nama' => 'sometimes|required|string|max:255',
            'deskripsi' => 'sometimes|required|string',
            'koordinat' => 'sometimes|required|array|min:2',
            'koordinat.*' => 'sometimes|required|array',
            'koordinat.*.lat' => 'required_with:koordinat|numeric|between:-90,90',
            'koordinat.*.lng' => 'required_with:koordinat|numeric|between:-180,180',
            'jenis_bencana' => 'sometimes|required|string|max:255',
            'warna' => 'nullable|string|max:255',
        ]);

        // Log incoming koordinat format for debugging
        if (isset($validated['koordinat'])) {
            Log::info('Update - Received koordinat format:', [
                'type' => gettype($validated['koordinat']),
                'sample' => isset($validated['koordinat'][0]) ? $validated['koordinat'][0] : null
            ]);

            // Ensure coordinates are consistently formatted as objects with lat/lng properties
            $normalizedKoordinat = [];
            foreach ($validated['koordinat'] as $point) {
                if (isset($point['lat']) && isset($point['lng'])) {
                    $normalizedKoordinat[] = [
                        'lat' => (float) $point['lat'],
                        'lng' => (float) $point['lng']
                    ];
                }
            }
            
            // Replace with normalized version
            $validated['koordinat'] = $normalizedKoordinat;
            
            // Debug log koordinat after normalization
            Log::info('Update - Normalized koordinat:', [
                'count' => count($normalizedKoordinat), 
                'sample' => $normalizedKoordinat[0] ?? null
            ]);
        }

        $jalurEvakuasi->update($validated);

        // Set no-cache headers untuk mencegah caching response
        $headers = [
            'Cache-Control' => 'no-store, no-cache, must-revalidate, max-age=0', 
            'Pragma' => 'no-cache',
            'Expires' => '0'
        ];

        return response()->json([
            'message' => 'Jalur evakuasi berhasil diperbarui',
            'data' => $jalurEvakuasi
        ], 200, $headers);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, JalurEvakuasi $jalurEvakuasi)
    {
        // Cek apakah user adalah pemilik jalur evakuasi atau admin
        if ($request->user()->id !== $jalurEvakuasi->user_id && !$request->user()->isAdmin()) {
            return response()->json([
                'message' => 'Anda tidak diizinkan untuk menghapus jalur evakuasi ini'
            ], 403);
        }

        $jalurEvakuasi->delete();

        // Set no-cache headers untuk mencegah caching response
        $headers = [
            'Cache-Control' => 'no-store, no-cache, must-revalidate, max-age=0', 
            'Pragma' => 'no-cache',
            'Expires' => '0'
        ];

        return response()->json([
            'message' => 'Jalur evakuasi berhasil dihapus'
        ], 200, $headers);
    }
}
