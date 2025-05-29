<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Mail\EmergencyMail;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Notification;
use App\Notifications\EmergencyNotification;

class NotifikasiController extends Controller
{
    /**
     * Send a notification to all users
     */
    public function send(Request $request)
    {
        $request->validate([
            'judul' => 'required|string|max:255',
            'isi' => 'required|string',
            'type' => 'sometimes|string|in:info,warning,emergency',
            'target' => 'sometimes|string|in:all,masyarakat,relawan',
        ]);

        $title = $request->judul;
        $content = $request->isi;
        $type = $request->type ?? 'info';
        $target = $request->target ?? 'all';
        
        // Log details of the notification being sent
        \Illuminate\Support\Facades\Log::info('Sending notification', [
            'title' => $title,
            'type' => $type,
            'target' => $target,
        ]);
        
        // Query users based on target/role
        $query = User::query();
        
        // Filter by role if needed
        if ($target === 'masyarakat') {
            $query->role('masyarakat');
        } elseif ($target === 'relawan') {
            $query->role('relawan');
        }
        
        // Get users with verified email addresses
        $users = $query->whereNotNull('email_verified_at')->get();
        
        \Illuminate\Support\Facades\Log::info('Found users for notification', [
            'count' => $users->count(),
            'target' => $target
        ]);
        
        // For emergency notifications use EmergencyMail, otherwise use EmailNotification
        if ($type === 'emergency') {
            foreach ($users as $user) {
                try {
                    // Explicitly force TLS encryption for emergency emails
                    config(['mail.mailers.smtp.encryption' => 'tls']);
                    
                    \Illuminate\Support\Facades\Mail::to($user->email)
                        ->send(new EmergencyMail($title, $content, $user->name));
                    
                    \Illuminate\Support\Facades\Log::info('Emergency email sent to user', [
                        'user_id' => $user->id,
                        'email' => $user->email
                    ]);
                } catch (\Exception $e) {
                    \Illuminate\Support\Facades\Log::error('Failed to send emergency email', [
                        'user_id' => $user->id,
                        'email' => $user->email,
                        'error' => $e->getMessage(),
                        'trace' => $e->getTraceAsString()
                    ]);
                }
            }
        } else {
            // Untuk semua jenis notifikasi, gunakan EmergencyMail dengan template yang sama
            foreach ($users as $user) {
                try {
                    // Force TLS encryption untuk semua email
                    config(['mail.mailers.smtp.encryption' => 'tls']);
                    
                    \Illuminate\Support\Facades\Mail::to($user->email)
                        ->send(new EmergencyMail($title, $content, $user->name));
                    
                    \Illuminate\Support\Facades\Log::info('Email notification sent to user using emergency template', [
                        'user_id' => $user->id,
                        'email' => $user->email,
                        'type' => $type
                    ]);
                } catch (\Exception $e) {
                    \Illuminate\Support\Facades\Log::error('Failed to send notification using emergency template', [
                        'user_id' => $user->id,
                        'email' => $user->email,
                        'error' => $e->getMessage(),
                        'trace' => $e->getTraceAsString()
                    ]);
                }
            }
        }
        
        // Process queue immediately for testing purposes
        $this->processQueue();
        
        return response()->json([
            'success' => true,
            'message' => 'Notifikasi berhasil dikirim ke ' . $users->count() . ' pengguna',
            'target' => $target,
            'type' => $type
        ]);
    }
    
    /**
     * Proses queue secara langsung untuk pengujian
     */
    private function processQueue()
    {
        try {
            // Jika kita menggunakan driver database untuk queue
            $connection = config('queue.default');
            if ($connection === 'database') {
                // Ambil dan proses job dari queue
                $jobs = \Illuminate\Support\Facades\DB::table('jobs')->orderBy('id')->limit(10)->get();
                
                if ($jobs->count() > 0) {
                    // Log informasi tentang jumlah job yang ditemukan
                    \Illuminate\Support\Facades\Log::info('Found ' . $jobs->count() . ' jobs in the queue');
                    
                    // Jalankan queue worker untuk memproses job-job tersebut
                    \Illuminate\Support\Facades\Artisan::call('queue:work', [
                        '--once' => true,
                    ]);
                    
                    // Log hasil eksekusi
                    \Illuminate\Support\Facades\Log::info('Queue worker executed: ' . \Illuminate\Support\Facades\Artisan::output());
                }
            }
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Error processing queue: ' . $e->getMessage());
        }
    }
}
