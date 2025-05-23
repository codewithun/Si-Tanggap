<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Posko;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PoskoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Posko::with('user:id,name,email')
            ->orderBy('created_at', 'desc');

        // Filter berdasarkan jenis posko jika parameter ada
        if ($request->has('jenis_posko')) {
            $query->where('jenis_posko', $request->jenis_posko);
        }

        // Filter berdasarkan status jika parameter ada
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Pencarian berdasarkan nama atau alamat
        if ($request->has('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('nama', 'like', '%' . $request->search . '%')
                    ->orWhere('alamat', 'like', '%' . $request->search . '%');
            });
        }

        $poskos = $query->get();
        return response()->json($poskos);
    }

    /**
     * Store a newly created resource in storage.
     */    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'deskripsi' => 'required|string',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'alamat' => 'required|string|max:255',
            'kontak' => 'nullable|string|max:255',
            'jenis_posko' => 'required|string|max:255',
            'foto' => 'nullable|image|max:2048', // max 2MB
            'status' => 'nullable|in:aktif,tidak_aktif',
            'kapasitas' => 'required|integer|min:1',
        ]);

        if ($request->hasFile('foto')) {
            $path = $request->file('foto')->store('public/poskos');
            $validated['foto'] = Storage::url($path);
        }

        $validated['user_id'] = $request->user()->id;

        if (!isset($validated['status'])) {
            $validated['status'] = 'aktif';
        }

        $posko = Posko::create($validated);

        return response()->json([
            'message' => 'Posko berhasil dibuat',
            'data' => $posko
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Posko $posko)
    {
        $posko->load('user:id,name,email');
        return response()->json($posko);
    }

    /**
     * Update the specified resource.
     */
    public function update(Request $request, Posko $posko)
    {
        // Cek apakah user adalah pemilik posko atau admin
        if ($request->user()->id !== $posko->user_id && !$request->user()->isAdmin()) {
            return response()->json([
                'message' => 'Anda tidak diizinkan untuk mengubah posko ini'
            ], 403);
        }
        $validated = $request->validate([
            'nama' => 'sometimes|required|string|max:255',
            'deskripsi' => 'sometimes|required|string',
            'latitude' => 'sometimes|required|numeric|between:-90,90',
            'longitude' => 'sometimes|required|numeric|between:-180,180',
            'alamat' => 'sometimes|required|string|max:255',
            'kontak' => 'nullable|string|max:255',
            'jenis_posko' => 'sometimes|required|string|max:255',
            'foto' => 'nullable|image|max:2048', // max 2MB
            'status' => 'nullable|in:aktif,tidak_aktif',
            'kapasitas' => 'sometimes|required|integer|min:1',
        ]);

        if ($request->hasFile('foto')) {
            // Hapus foto lama jika ada
            if ($posko->foto) {
                $oldPath = str_replace('/storage', 'public', $posko->foto);
                Storage::delete($oldPath);
            }

            $path = $request->file('foto')->store('public/poskos');
            $validated['foto'] = Storage::url($path);
        }

        $posko->update($validated);

        return response()->json([
            'message' => 'Posko berhasil diperbarui',
            'data' => $posko
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Posko $posko)
    {
        // Cek apakah user adalah pemilik posko atau admin
        if ($request->user()->id !== $posko->user_id && !$request->user()->isAdmin()) {
            return response()->json([
                'message' => 'Anda tidak diizinkan untuk menghapus posko ini'
            ], 403);
        }

        // Hapus foto jika ada
        if ($posko->foto) {
            $path = str_replace('/storage', 'public', $posko->foto);
            Storage::delete($path);
        }

        $posko->delete();

        return response()->json([
            'message' => 'Posko berhasil dihapus'
        ]);
    }
}
