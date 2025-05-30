<?php

namespace App\Http\Controllers;

use App\Models\Berita;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class BeritaController extends Controller
{
    public function getBeritaMerged()
    {
        try {
            // Set proper cache headers to prevent browser caching
            header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
            header('Cache-Control: post-check=0, pre-check=0', false);
            header('Pragma: no-cache');
            
            // Get news from database directly without caching on server
            $berita = Berita::orderBy('published_date', 'desc')
                ->limit(10)
                ->get([
                    'id', 
                    'title', 
                    'description', 
                    'link', 
                    'image', 
                    'source',
                    'published_date as date'
                ]);

            // Return in expected format with detailed information
            return response()->json([
                'berita' => $berita,
                'total' => $berita->count(),
                'status' => 'success',
                'time' => now()->toDateTimeString() // Add timestamp for debugging
            ]);
        } catch (\Exception $e) {
            // Log the error
            Log::error('Error in getBeritaMerged: ' . $e->getMessage());
            
            return response()->json([
                'message' => 'Failed to retrieve news: ' . $e->getMessage(),
                'berita' => [],
                'total' => 0,
                'status' => 'error'
            ], 500);
        }
    }
}
