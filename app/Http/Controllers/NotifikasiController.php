<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Mail\EmergencyMail;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Notification;
use App\Notifications\EmergencyNotification;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Artisan;

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
        ]);

        // Get all users
        $users = User::all();
        $userCount = $users->count();
        $sentCount = 0;

        // Log email sending
        Log::info('Mengirim email notifikasi darurat ke ' . $userCount . ' pengguna');
        
        // Tambahkan log sebelum memulai
        Log::info('Mulai proses pengiriman email ke ' . $userCount . ' pengguna');

        // Pastikan konfigurasi email benar
        config(['mail.mailers.smtp.encryption' => 'tls']);
        
        foreach ($users as $user) {
            if (empty($user->email) || !filter_var($user->email, FILTER_VALIDATE_EMAIL)) {
                Log::warning('Alamat email tidak valid: ' . ($user->email ?? 'kosong') . ' untuk user ID: ' . $user->id);
                continue;
            }
            
            try {
                Log::info('Mencoba mengirim email ke: ' . $user->email);
                
                // Kirim email langsung tanpa queue
                $mail = new EmergencyMail(
                    $request->judul,
                    $request->isi,
                    $user->name ?? 'Pengguna'
                );
                
                // Tambah kontak untuk whitelist
                Mail::to($user->email)
                    ->bcc('archive@geosiaga.com') // Untuk keperluan arsip dan whitelist
                    ->send($mail);
                
                Log::info('Email berhasil dikirim ke: ' . $user->email);
                $sentCount++;
                
                // Simpan notifikasi di database tanpa mengirim email lagi
                // (karena sudah dikirim dengan Mail::send di atas)
                $notification = new EmergencyNotification(
                    $request->judul,
                    $request->isi
                );
                
                $user->notifications()->create([
                    'id' => \Illuminate\Support\Str::uuid()->toString(),
                    'type' => get_class($notification),
                    'data' => $notification->toArray($user),
                    'read_at' => null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                
            } catch (\Exception $e) {
                Log::error('Gagal mengirim email ke: ' . $user->email . '. Error: ' . $e->getMessage());
                // Tampilkan error lengkap untuk debug
                Log::error($e->getTraceAsString());
            }
        }

        return response()->json([
            'success' => true,
            'message' => "Berhasil mengirim notifikasi ke $sentCount dari $userCount pengguna",
        ]);
    }
    
    /**
     * Proses queue secara langsung untuk pengujian
     */
    private function processQueue()
    {
        // Jika kita menggunakan driver database untuk queue
        $connection = config('queue.default');
        if ($connection === 'database') {
            // Ambil dan proses job dari queue
            $jobs = DB::table('jobs')->orderBy('id')->limit(10)->get();
            
            if ($jobs->count() > 0) {
                // Log informasi tentang jumlah job yang ditemukan
                Log::info('Found ' . $jobs->count() . ' jobs in the queue');
                
                // Jalankan queue worker untuk memproses job-job tersebut
                Artisan::call('queue:work', [
                    '--once' => true,
                ]);
                
                // Log hasil eksekusi
                Log::info('Queue worker executed: ' . Artisan::output());
            }
        }
    }
}
