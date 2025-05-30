<?php

namespace App\Http\Controllers;

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

    // Helper function to assess risk level based on disaster type and description
    private function assessRiskLevel($jenisBencana, $deskripsi)
    {
        $deskripsi = strtolower($deskripsi);

        // Keywords indicating high risk
        $highRiskKeywords = ['parah', 'besar', 'darurat', 'kritis', 'evakuasi', 'korban', 'luka'];

        // High risk types
        $highRiskTypes = ['gempa', 'tsunami'];

        // Medium risk types
        $mediumRiskTypes = ['banjir', 'kebakaran', 'longsor'];

        // Check for high risk indicators
        if (in_array($jenisBencana, $highRiskTypes)) {
            return 'tinggi';
        }

        foreach ($highRiskKeywords as $keyword) {
            if (strpos($deskripsi, $keyword) !== false) {
                return 'tinggi';
            }
        }

        // Check for medium risk
        if (in_array($jenisBencana, $mediumRiskTypes)) {
            return 'sedang';
        }

        // Default to low risk
        return 'rendah';
    }

    public function index(Request $request)
    {
        $query = Laporan::with('user:id,name,email')
            ->select([
                'id',
                'user_id',
                'judul',
                'jenis_bencana',
                'deskripsi',
                'latitude',
                'longitude',
                'lokasi',
                'foto',
                'status',
                'catatan_admin',
                'created_at',
                'updated_at'
            ])
            ->orderBy('created_at', 'desc');
            
        // Filter by status if provided
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        
        // Filter by search query if provided
        if ($request->has('search')) {
            $query->where(function($q) use ($request) {
                $q->where('judul', 'like', '%' . $request->search . '%')
                  ->orWhere('deskripsi', 'like', '%' . $request->search . '%')
                  ->orWhere('lokasi', 'like', '%' . $request->search . '%');
            });
        }
        
        // Get per_page from request or use default
        $perPage = $request->input('per_page', 10);
        
        // Return paginated results
        $laporans = $query->paginate($perPage);
        
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
            // Store the path without the '/storage/' prefix for consistency
            $validated['foto'] = str_replace('public/', '', $path);
        }

        $validated['user_id'] = $request->user()->id;
        $validated['status'] = 'menunggu';

        // Auto-assess risk level
        $validated['tingkat_bahaya'] = $this->assessRiskLevel(
            $validated['jenis_bencana'],
            $validated['deskripsi']
        );

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
                // Handle different path formats
                if (strpos($laporan->foto, 'public/') === 0) {
                    Storage::delete($laporan->foto);
                } else {
                    // If it doesn't start with public/, add it
                    Storage::delete('public/' . $laporan->foto);
                }
            }

            $path = $request->file('foto')->store('public/laporans');
            // Store the path without the 'public/' prefix for consistency
            $validated['foto'] = str_replace('public/', '', $path);
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
            'data' => $laporan->load('user:id,name,email')
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

        $laporan->update([
            'status' => Laporan::STATUS_DITOLAK,
            'catatan_admin' => $validated['catatan_admin'],
        ]);

        return response()->json([
            'message' => 'Laporan berhasil ditolak',
            'data' => $laporan->load('user:id,name,email')
        ]);
    }

    /**
     * Get reports belonging to current user
     */
    public function getMyReports(Request $request)
    {
        $user = $request->user();
        $query = Laporan::where('user_id', $user->id)
            ->orderBy('created_at', 'desc');

        // Filter berdasarkan status jika parameter ada
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $laporans = $query->get();

        // Statistik
        $all = Laporan::where('user_id', $user->id);
        $statistics = [
            'totalLaporan' => $all->count(),
            'menunggu' => (clone $all)->where('status', 'menunggu')->count(),
            'diverifikasi' => (clone $all)->where('status', 'diverifikasi')->count(),
            'ditolak' => (clone $all)->where('status', 'ditolak')->count(),
            'tingkatResiko' => [
                'rendah' => (clone $all)->where('tingkat_bahaya', 'rendah')->count(),
                'sedang' => (clone $all)->where('tingkat_bahaya', 'sedang')->count(),
                'tinggi' => (clone $all)->where('tingkat_bahaya', 'tinggi')->count(),
            ],
        ];

        return response()->json([
            'data' => $laporans,
            'statistics' => $statistics,
        ]);
    }

    /**
     * Get unverified reports (admin only)
     */
    public function getUnverifiedReports()
    {
        // Get all laporans with status 'menunggu'
        $laporans = Laporan::with('user')
                          ->where('status', 'menunggu')
                          ->latest()
                          ->get();
        
        return response()->json(['data' => $laporans]);
    }
}
