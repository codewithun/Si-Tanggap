<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schema;

class SetupBeritaDatabase extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'setup:berita';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Set up the berita database table with necessary columns and sample data';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Setting up berita database...');

        // Check if beritas table exists
        if (!Schema::hasTable('beritas')) {
            $this->info('Creating beritas table...');
            Artisan::call('migrate', ['--path' => 'database/migrations/2025_05_29_201634_create_beritas_table.php']);
            $this->info(Artisan::output());
        }

        // Check if source and published_date columns exist
        if (!Schema::hasColumns('beritas', ['source', 'published_date'])) {
            $this->info('Adding source and published_date columns to beritas table...');
            Artisan::call('migrate', ['--path' => 'database/migrations/2025_05_29_204151_add_sumber_to_beritas_table.php']);
            $this->info(Artisan::output());
        }

        // Seed some sample data
        $this->info('Seeding berita data...');
        Artisan::call('db:seed', ['--class' => 'Database\Seeders\BeritaSeeder']);
        $this->info(Artisan::output());

        $this->info('Berita database setup completed!');

        return Command::SUCCESS;
    }
}
