<?php

namespace App\Console\Commands;

use App\Mail\EmergencyMail;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class VerifyEmailSystem extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'email:verify {role? : The role to test (all, masyarakat, relawan, admin)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Verifikasi sistem email untuk user dengan role tertentu';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $role = $this->argument('role') ?? 'all';
        
        if (!in_array($role, ['all', 'masyarakat', 'relawan', 'admin'])) {
            $this->error('Role tidak valid. Gunakan: all, masyarakat, relawan, atau admin');
            return 1;
        }
        
        $this->info('Memulai verifikasi sistem email untuk role: ' . $role);
        
        // Query user berdasarkan role
        $query = User::query();
        
        // Filter berdasarkan role jika tidak 'all'
        if ($role !== 'all') {
            $query->role($role);
        }
        
        // Hanya user dengan email terverifikasi
        $users = $query->whereNotNull('email_verified_at')->get();
        
        if ($users->isEmpty()) {
            $this->error('Tidak ada user dengan role ' . $role . ' yang memiliki email terverifikasi');
            return 1;
        }
        
        $this->info('Menemukan ' . $users->count() . ' user dengan role ' . $role);

        $bar = $this->output->createProgressBar($users->count());
        $bar->start();
        
        $success = 0;
        $failed = 0;
        
        foreach ($users as $user) {
            $this->newLine();
            $this->info('Mengirim email pengujian ke ' . $user->email . ' (' . $user->name . ')');
            
            try {
                // Kirim email pengujian
                $title = 'Uji Coba Email Untuk ' . ucfirst($role);
                $content = 'Ini adalah email pengujian sistem untuk verifikasi bahwa email Anda dapat menerima pemberitahuan dari aplikasi GeoSiaga. Jika Anda menerima email ini, berarti sistem pengiriman email sudah berfungsi dengan baik untuk role ' . $user->getRoleNames()->first() . '.';
            
                Mail::to($user->email)
                    ->send(new EmergencyMail($title, $content, $user->name));
                
                Log::info('Email pengujian berhasil dikirim ke: ' . $user->email);
                $this->info('✅ Email berhasil dikirim');
                $success++;
            } catch (\Exception $e) {
                Log::error('Gagal mengirim email pengujian. Error: ' . $e->getMessage());
                $this->error('❌ Gagal: ' . $e->getMessage());
                $failed++;
            }
            
            $bar->advance();
            sleep(1); // Delay 1 detik antara email untuk menghindari throttling
        }
        
        $bar->finish();
        $this->newLine(2);
        
        $this->info('Verifikasi email selesai:');
        $this->info('✅ Berhasil: ' . $success);
        $this->info('❌ Gagal: ' . $failed);
        
        return 0;
    }
}
