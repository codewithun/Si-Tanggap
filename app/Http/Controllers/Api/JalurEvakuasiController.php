<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\JalurEvakuasi;
use Illuminate\Http\Request;

class JalurEvakuasiController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
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

        $jalurEvakuasis = $query->get();
        return response()->json($jalurEvakuasis);
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

        $validated['user_id'] = $request->user()->id;
        $validated['koordinat'] = json_encode($validated['koordinat']);

        if (!isset($validated['warna'])) {
            $validated['warna'] = '#FF0000'; // Warna default merah
        }

        $jalurEvakuasi = JalurEvakuasi::create($validated);

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
