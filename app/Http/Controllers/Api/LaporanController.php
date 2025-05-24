<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Laporan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class LaporanController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Laporan::with('user:id,name,email')
            ->orderBy('created_at', 'desc');

        // Filter berdasarkan jenis bencana jika parameter ada
        if ($request->has('jenis_bencana')) {
            $query->where('jenis_bencana', $request->jenis_bencana);
        }

        // Filter berdasarkan status jika parameter ada
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Pencarian berdasarkan judul atau lokasi
        if ($request->has('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('judul', 'like', '%' . $request->search . '%')
                    ->orWhere('lokasi', 'like', '%' . $request->search . '%');
            });
        }

        $laporans = $query->paginate(15);
        return response()->json($laporans);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'judul' => 'required|string|max:255',
            'jenis_bencana' => ['required', Rule::in(['banjir', 'longsor', 'gempa', 'tsunami', 'kebakaran', 'angin_topan', 'kekeringan', 'lainnya'])],
            'deskripsi' => 'required|string',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'lokasi' => 'required|string|max:255',
            'foto' => 'nullable|image|max:2048', // max 2MB
        ]);

        if ($request->hasFile('foto')) {
            $path = $request->file('foto')->store('public/laporans');
            $validated['foto'] = Storage::url($path);
        }

        $validated['user_id'] = $request->user()->id;
        $validated['status'] = 'menunggu';

        $laporan = Laporan::create($validated);

        return response()->json([
            'message' => 'Laporan berhasil dibuat',
            'data' => $laporan
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Laporan $laporan)
    {
        $laporan->load('user:id,name,email');
        return response()->json($laporan);
    }

    /**
     * Update the specified resource.
     */
    public function update(Request $request, Laporan $laporan)
    {
        // Cek apakah user adalah pemilik laporan atau admin
        if ($request->user()->id !== $laporan->user_id && !$request->user()->isAdmin()) {
            return response()->json([
                'message' => 'Anda tidak diizinkan untuk mengubah laporan ini'
            ], 403);
        }

        $validated = $request->validate([
            'judul' => 'sometimes|required|string|max:255',
            'jenis_bencana' => ['sometimes', 'required', Rule::in(['banjir', 'longsor', 'gempa', 'tsunami', 'kebakaran', 'angin_topan', 'kekeringan', 'lainnya'])],
            'deskripsi' => 'sometimes|required|string',
            'latitude' => 'sometimes|required|numeric|between:-90,90',
            'longitude' => 'sometimes|required|numeric|between:-180,180',
            'lokasi' => 'sometimes|required|string|max:255',
            'foto' => 'nullable|image|max:2048', // max 2MB
        ]);

        if ($request->hasFile('foto')) {
            // Hapus foto lama jika ada
            if ($laporan->foto) {
                $oldPath = str_replace('/storage', 'public', $laporan->foto);
                Storage::delete($oldPath);
            }

            $path = $request->file('foto')->store('public/laporans');
            $validated['foto'] = Storage::url($path);
        }

        $laporan->update($validated);

        return response()->json([
            'message' => 'Laporan berhasil diperbarui',
            'data' => $laporan
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Laporan $laporan)
    {
        // Hapus foto jika ada
        if ($laporan->foto) {
            $path = str_replace('/storage', 'public', $laporan->foto);
            Storage::delete($path);
        }

        $laporan->delete();

        return response()->json([
            'message' => 'Laporan berhasil dihapus'
        ]);
    }

    /**
     * Verifikasi laporan (hanya admin)
     */
    public function verify(Request $request, Laporan $laporan)
    {
        $validated = $request->validate([
            'catatan_admin' => 'nullable|string',
        ]);

        $laporan->status = 'diverifikasi';
        $laporan->catatan_admin = $validated['catatan_admin'] ?? null;
        $laporan->save();

        return response()->json([
            'message' => 'Laporan berhasil diverifikasi',
            'data' => $laporan
        ]);
    }

    /**
     * Tolak laporan (hanya admin)
     */
    public function reject(Request $request, Laporan $laporan)
    {
        $validated = $request->validate([
            'catatan_admin' => 'required|string',
        ]);

        $laporan->status = 'ditolak';
        $laporan->catatan_admin = $validated['catatan_admin'];
        $laporan->save();

        return response()->json([
            'message' => 'Laporan berhasil ditolak',
            'data' => $laporan
        ]);
    }

    /**
     * Get reports belonging to current user
     */
    public function getMyReports(Request $request)
    {
        $query = Laporan::where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc');

        // Filter berdasarkan status jika parameter ada
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $laporans = $query->paginate(10);
        return response()->json($laporans);
    }
}
