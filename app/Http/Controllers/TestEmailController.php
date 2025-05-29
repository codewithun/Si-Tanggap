<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Mail\EmergencyMail;
use Illuminate\Support\Facades\Log;

class TestEmailController extends Controller
{
    public function sendTestEmail(Request $request)
    {
        $email = $request->input('email', 'test@example.com');
        $title = 'Test Notifikasi Darurat';
        $content = 'Ini adalah email pengujian sistem notifikasi darurat. Jika Anda menerima email ini, berarti sistem sudah berfungsi dengan baik.';
        $name = 'Pengguna Test';

        Log::info('Mengirim email test ke: ' . $email);        try {
            Mail::to($email)
                ->send(new EmergencyMail($title, $content, $name));

            Log::info('Email test berhasil dikirim ke: ' . $email);
            
            return response()->json([
                'success' => true,
                'message' => 'Email test berhasil dikirim ke ' . $email,
            ]);
        } catch (\Exception $e) {
            Log::error('Gagal mengirim email test. Error: ' . $e->getMessage());
            Log::error($e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengirim email: ' . $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ], 500);
        }
    }
    
    /**
     * Kirim email pengujian ke alamat tertentu
     */
    public function sendToAddress(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);
        
        $email = $request->input('email');
        $title = 'Test Notifikasi Darurat Si-Tanggap';
        $content = 'Ini adalah email pengujian manual sistem notifikasi darurat Si-Tanggap. Jika Anda menerima email ini, berarti sistem email sudah berfungsi dengan baik.';
        $name = 'Pengguna Test';

        Log::info('Mengirim email pengujian manual ke: ' . $email);

        try {
            // Gunakan setting email yang benar
            config(['mail.mailers.smtp.encryption' => 'tls']);
            
            Mail::to($email)
                ->send(new EmergencyMail($title, $content, $name));

            Log::info('Email pengujian manual berhasil dikirim ke: ' . $email);
            
            return response()->json([
                'success' => true,
                'message' => 'Email pengujian berhasil dikirim ke ' . $email,
            ]);
        } catch (\Exception $e) {
            Log::error('Gagal mengirim email pengujian manual. Error: ' . $e->getMessage());
            Log::error($e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengirim email: ' . $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ], 500);
        }
    }
}
