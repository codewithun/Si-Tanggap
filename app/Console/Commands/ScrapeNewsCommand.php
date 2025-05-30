<?php

namespace App\Console\Commands;

use App\Http\Controllers\BeritaScraperController;
use App\Http\Controllers\DetikScraperController;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ScrapeNewsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'scrape:news {source=all} {--pages=1} {--clear-cache}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Scrape news from BNPB and Detik';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $source = $this->argument('source');
        $pages = $this->option('pages');
        $clearCache = $this->option('clear-cache');

        $this->info("Starting news scraping for source: {$source}, pages: {$pages}");

        // Clear cache if requested
        if ($clearCache) {
            $this->info("Clearing news cache...");
            Cache::forget('berita_bnpb_' . $pages);
            Cache::forget('berita_detik_bencana_' . $pages);
            Cache::forget('berita_merged');
            $this->info("Cache cleared.");
        }

        try {
            // Create a proper request with pages parameter
            $request = new Request();
            $request->merge(['pages' => $pages]);

            if ($source === 'all' || $source === 'bnpb') {
                $this->info("Scraping BNPB news...");
                $bnpbScraper = new BeritaScraperController();
                $response = $bnpbScraper->index($request);
                $data = json_decode($response->getContent(), true);
                $this->info("BNPB scraping complete. Found {$data['total']} articles.");
            }

            if ($source === 'all' || $source === 'detik') {
                $this->info("Scraping Detik news...");
                $detikScraper = new DetikScraperController();
                $response = $detikScraper->index($request); 
                $data = json_decode($response->getContent(), true);
                $this->info("Detik scraping complete. Found {$data['total']} articles.");
            }

            // Force update merged news cache
            if ($source === 'all') {
                $this->info("Updating merged news cache...");
                Cache::forget('berita_merged');
                // Create request with merged=true flag
                $mergeRequest = new Request();
                $mergeRequest->merge(['merged' => true]);
                $bnpbScraper = new BeritaScraperController();
                $response = $bnpbScraper->index($mergeRequest);
                $data = json_decode($response->getContent(), true);
                $this->info("Merged news cache updated. Total articles: {$data['total']}");
            }

            $this->info("News scraping completed successfully!");
            return Command::SUCCESS;
        } catch (\Exception $e) {
            Log::error("Error in ScrapeNewsCommand: " . $e->getMessage());
            $this->error("Error scraping news: " . $e->getMessage());
            return Command::FAILURE;
        }
    }
}
