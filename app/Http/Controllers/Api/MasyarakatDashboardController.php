<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Laporan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class MasyarakatDashboardController extends Controller
{
    /**
     * Get user reports with pagination
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getLaporanSaya(Request $request)
    {
        try {
            $userId = $request->user_id ?? Auth::id();
            
            if (!$userId) {
                return response()->json([
                    'message' => 'User ID tidak ditemukan',
                    'data' => []
                ], 400);
            }
            
            $query = Laporan::where('user_id', $userId);
            
            // Filter by status if provided
            if ($request->has('status') && $request->status !== 'semua') {
                $query->where('status', $request->status);
            }
            
            // Set default per page
            $perPage = $request->input('per_page', 10);
            
            // Get paginated results
            $laporans = $query->orderBy('created_at', 'desc')
                              ->paginate($perPage);
            
            // Get statistics for this user
            $statistics = $this->getUserStatistics($userId);
            
            // Format the response to match what the frontend expects
            return response()->json([
                'data' => $laporans->items(),
                'current_page' => $laporans->currentPage(),
                'last_page' => $laporans->lastPage(),
                'per_page' => $laporans->perPage(),
                'total' => $laporans->total(),
                'statistics' => $statistics
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Terjadi kesalahan: ' . $e->getMessage(),
                'data' => []
            ], 500);
        }
    }
    
    /**
     * Get user report statistics
     * 
     * @param int $userId
     * @return array
     */
    private function getUserStatistics($userId)
    {
        // Count by status
        $statusCounts = Laporan::where('user_id', $userId)
            ->select('status', DB::raw('count(*) as total'))
            ->groupBy('status')
            ->pluck('total', 'status')
            ->toArray();
        
        // Count by tingkat_bahaya
        $riskCounts = Laporan::where('user_id', $userId)
            ->select('tingkat_bahaya', DB::raw('count(*) as total'))
            ->whereNotNull('tingkat_bahaya')
            ->groupBy('tingkat_bahaya')
            ->pluck('total', 'tingkat_bahaya')
            ->toArray();
        
        // Total reports count
        $totalLaporan = Laporan::where('user_id', $userId)->count();
        
        return [
            'totalLaporan' => $totalLaporan,
            'menunggu' => $statusCounts['menunggu'] ?? 0,
            'diverifikasi' => $statusCounts['diverifikasi'] ?? 0,
            'ditolak' => $statusCounts['ditolak'] ?? 0,
            'tingkatResiko' => [
                'rendah' => $riskCounts['rendah'] ?? 0,
                'sedang' => $riskCounts['sedang'] ?? 0,
                'tinggi' => $riskCounts['tinggi'] ?? 0,
            ]
        ];
    }
}
