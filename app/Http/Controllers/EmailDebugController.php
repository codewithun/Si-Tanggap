<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Mail\Message;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Config;

class EmailDebugController extends Controller
{
    public function debug()
    {
        // Log konfigurasi mail
        $mailConfig = Config::get('mail');
        // Hapus password dari log untuk keamanan
        if (isset($mailConfig['mailers']['smtp']['password'])) {
            $mailConfig['mailers']['smtp']['password'] = '******';
        }
        
        Log::info('Konfigurasi Mail: ' . print_r($mailConfig, true));

        try {
            // Test dengan mail helper standar
            $result = Mail::raw('Ini adalah email test debug dari aplikasi Si-Tanggap pada ' . now(), function (Message $message) {
                $message->to('test@example.com')
                    ->subject('Debug Email Si-Tanggap')
                    ->from(config('mail.from.address'), config('mail.from.name'));
            });

            return response()->json([
                'success' => true,
                'message' => 'Email debugging terkirim. Cek log untuk detailnya.',
                'mail_config' => $mailConfig,
                'queue_connection' => config('queue.default'),
                'mail_result' => $result,
            ]);
        } catch (\Exception $e) {
            Log::error('Debug email error: ' . $e->getMessage());
            Log::error($e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'message' => 'Error saat debug email: ' . $e->getMessage(),
                'mail_config' => $mailConfig,
                'queue_connection' => config('queue.default'),
                'trace' => $e->getTraceAsString(),
            ], 500);
        }
    }

    public function checkSmtp()
    {
        $host = config('mail.mailers.smtp.host');
        $port = config('mail.mailers.smtp.port');
        
        try {
            // Coba koneksi ke SMTP server
            $socket = @fsockopen($host, $port, $errno, $errstr, 5);
            
            if (!$socket) {
                return response()->json([
                    'success' => false,
                    'message' => "Tidak dapat terhubung ke SMTP server $host:$port - $errno : $errstr",
                ]);
            }
            
            fclose($socket);
            
            return response()->json([
                'success' => true,
                'message' => "Berhasil terhubung ke SMTP server $host:$port",
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => "Error memeriksa SMTP server: " . $e->getMessage(),
            ]);
        }
    }
}
