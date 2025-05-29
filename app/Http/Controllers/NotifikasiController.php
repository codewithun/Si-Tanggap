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
