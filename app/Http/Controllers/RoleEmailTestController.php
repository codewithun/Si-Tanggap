<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Mail\EmergencyMail;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class RoleEmailTestController extends Controller
{
    /**
     * Kirim email test ke user berdasarkan role
     */
    public function testByRole(Request $request)
    {
        $request->validate([
            'role' => 'required|string|in:masyarakat,relawan,admin,all',
        ]);

        $role = $request->input('role');
        $title = 'Test Email untuk Role ' . ucfirst($role);
        $content = 'Ini adalah email pengujian untuk user dengan role ' . $role . '. Jika Anda menerima email ini, berarti sistem pengiriman email untuk role ' . $role . ' sudah berfungsi dengan baik.';

        // Query user berdasarkan role
        $query = User::query();
        
        // Filter berdasarkan role jika tidak 'all'
        if ($role !== 'all') {
            $query->role($role);
        }
        
        // Ambil user dengan email terverifikasi
        $users = $query->whereNotNull('email_verified_at')->get();
        
        if ($users->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak ada user dengan role ' . $role . ' yang memiliki email terverifikasi'
            ]);
        }

        Log::info('Mengirim test email ke ' . $users->count() . ' user dengan role ' . $role);
        
        $successCount = 0;
        $failCount = 0;
        
        foreach ($users as $user) {
            try {
                Mail::to($user->email)
                    ->send(new EmergencyMail($title, $content, $user->name));
                
                Log::info('Email pengujian untuk role berhasil dikirim ke: ' . $user->email);
                $successCount++;
            } catch (\Exception $e) {
                Log::error('Gagal mengirim email pengujian untuk role. Error: ' . $e->getMessage());
                $failCount++;
            }
        }
        
        return response()->json([
            'success' => true,
            'message' => 'Email pengujian telah dikirim ke ' . $successCount . ' user dengan role ' . $role,
            'total_users' => $users->count(),
            'success_count' => $successCount,
            'failed_count' => $failCount
        ]);
    }
}
