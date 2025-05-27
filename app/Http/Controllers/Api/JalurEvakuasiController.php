<?php

namespace App\Http\Controllers\Api;

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

            // Transform the data
            $jalurEvakuasis->through(function ($jalur) {
                $koordinat = [];
                
                if (!empty($jalur->koordinat)) {
                    if (is_string($jalur->koordinat)) {
                        $decoded = json_decode($jalur->koordinat, true);
                        if (json_last_error() === JSON_ERROR_NONE) {
                            $koordinat = $decoded;
                        }
                    } else if (is_array($jalur->koordinat)) {
                        $koordinat = $jalur->koordinat;
                    }
                }

                $koordinat = collect($koordinat)->map(function ($coord) {
                    if (is_array($coord)) {
                        if (count($coord) === 2 && is_numeric($coord[0]) && is_numeric($coord[1])) {
                            return [
                                'lat' => (float)$coord[0],
                                'lng' => (float)$coord[1]
                            ];
                        }
                        else if (isset($coord['lat']) && isset($coord['lng'])) {
                            return [
                                'lat' => (float)$coord['lat'],
                                'lng' => (float)$coord['lng']
                            ];
                        }
                    }
                    return null;
                })->filter()->values()->all();

                $jalur->koordinat = $koordinat;
                return $jalur;
            });
            
            return response()->json($jalurEvakuasis);
        } catch (\Exception $e) {
            Log::error('JalurEvakuasi index error: ' . $e->getMessage());
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

        // Format coordinates for storage
        $coordinates = collect($validated['koordinat'])->map(function ($coord) {
            return [$coord['lat'], $coord['lng']];
        })->toArray();

        $jalurEvakuasi = JalurEvakuasi::create([
            'user_id' => $request->user()->id,
            'nama' => $validated['nama'],
            'deskripsi' => $validated['deskripsi'],
            'koordinat' => json_encode($coordinates),
            'jenis_bencana' => $validated['jenis_bencana'],
            'warna' => $validated['warna'] ?? '#FF0000',
        ]);

        return response()->json([
            'message' => 'Jalur evakuasi berhasil dibuat',
            'data' => $jalurEvakuasi
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(JalurEvakuasi $jalurEvakuasi)
    {
        $jalurEvakuasi->load('user:id,name,email');
        return response()->json($jalurEvakuasi);
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

        $jalurEvakuasi->update($validated);

        return response()->json([
            'message' => 'Jalur evakuasi berhasil diperbarui',
            'data' => $jalurEvakuasi
        ]);
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

        return response()->json([
            'message' => 'Jalur evakuasi berhasil dihapus'
        ]);
    }
}
