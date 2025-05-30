<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * The Artisan commands provided by your application.
     *
     * @var array
     */
    protected $commands = [
        \App\Console\Commands\VerifyEmailSystem::class,
    ];

    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
        // Jalankan perintah scrape:berita-bnpb setiap 30 menit
        $schedule->command('scrape:berita-bnpb')->everyThirtyMinutes();

        // Jalankan scraping setiap 3 jam dengan 2 halaman dan clear cache
        $schedule->command('scrape:news all --pages=2 --clear-cache')
                ->everyThreeHours()
                ->appendOutputTo(storage_path('logs/scraper.log'));
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__ . '/Commands');

        require base_path('routes/console.php');
    }
}
