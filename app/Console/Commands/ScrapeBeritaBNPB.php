<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Symfony\Component\DomCrawler\Crawler;

class ScrapeBeritaBNPB extends Command
{
    protected $signature = 'scrape:berita-bnpb {pages=3 : Number of pages to scrape}';
    protected $description = 'Scrape berita terbaru dari BNPB dan simpan di cache';

    public function handle()
    {
        $this->info('Mulai scraping berita BNPB...');
        $pagesToScrape = (int)$this->argument('pages');
        
        if ($pagesToScrape < 1) {
            $pagesToScrape = 1;
        }
        
        $allBerita = [];
        
        try {
            for ($page = 1; $page <= $pagesToScrape; $page++) {
                $this->info("Scraping page {$page} of {$pagesToScrape}...");
                $beritaList = $this->scrapePage($page);
                
                if (empty($beritaList)) {
                    $this->warn("No news found on page {$page}, stopping pagination");
                    break;
                }
                
                $this->info("Found " . count($beritaList) . " items on page {$page}");
                $allBerita = array_merge($allBerita, $beritaList);
                
                // Slight delay to avoid overwhelming the server
                if ($page < $pagesToScrape) {
                    $this->info("Waiting before fetching next page...");
                    sleep(2);
                }
            }
            
            if (count($allBerita) > 0) {
                Cache::put('berita_bnpb', $allBerita, now()->addMinutes(30));
                $this->info('Berhasil scrape ' . count($allBerita) . ' berita BNPB dari ' . $page - 1 . ' halaman!');
                return 0;
            } else {
                $this->error('Tidak dapat menemukan berita di situs BNPB dengan selector yang ada');
                return 1;
            }
        } catch (\Exception $e) {
            $this->error('Error: ' . $e->getMessage());
            return 1;
        }
    }
    
    private function scrapePage($page)
    {
        $url = $page > 1 
            ? "https://bnpb.go.id/berita/page/{$page}" 
            : "https://bnpb.go.id/berita/";
            
        try {
            // Tambahkan user agent yang lebih bersahabat
            $response = Http::withHeaders([
                'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
                'Accept' => 'text/html,application/xhtml+xml,application/xml',
                'Accept-Language' => 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
            ])->timeout(20)->get($url);
            
            if (!$response->successful()) {
                $this->error("Failed to fetch BNPB news page {$page}: " . $response->status());
                return [];
            }
            
            $html = $response->body();
            $crawler = new Crawler($html);
            $beritaList = [];
            
            // Cek apakah kita sudah mencapai halaman terakhir
            $pageCheck = $crawler->filter('.pagination');
            if ($pageCheck->count() === 0 && $page > 1) {
                $this->warn("Page {$page} has no pagination control, might be the last page");
            }
            
            // Coba semua selector yang mungkin
            $this->info("Mencoba dengan semua selector pada halaman {$page}...");
            
            // Selector 1: .berita-terkini .block
            $crawler->filter('.berita-terkini .block')->each(function ($node) use (&$beritaList) {
                $this->extractNewsItemFromBlock($node, $beritaList, 'primary');
            });
            
            // Selector 2: Article items in grid layout
            $crawler->filter('.col-lg-4.col-md-4.col-12 .block, .col-lg-4.col-12 .block, .col-md-4.col-12 .block')->each(function ($node) use (&$beritaList) {
                $this->extractNewsItemFromBlock($node, $beritaList, 'grid');
            });
            
            // Selector 3: Generic article blocks
            $crawler->filter('.data .block')->each(function ($node) use (&$beritaList) {
                $this->extractNewsItemFromBlock($node, $beritaList, 'data');
            });
            
            // Remove duplicate articles by title
            $uniqueArticles = [];
            $titles = [];
            
            foreach ($beritaList as $article) {
                if (!in_array($article['title'], $titles)) {
                    $titles[] = $article['title'];
                    $uniqueArticles[] = $article;
                }
            }
            
            $this->info("Found " . count($uniqueArticles) . " unique articles on page {$page}");
            return $uniqueArticles;
        } catch (\Exception $e) {
            $this->error("Error fetching page {$page}: " . $e->getMessage());
            return [];
        }
    }

    private function extractNewsItemFromBlock($node, &$beritaList, $source = '')
    {
        try {
            $title = $node->filter('.title a')->text('');
            
            // Skip empty titles or already existing articles
            if (empty($title)) {
                return;
            }
            
            // Check for duplicates
            foreach ($beritaList as $existingItem) {
                if ($existingItem['title'] === trim($title)) {
                    return;
                }
            }
            
            // Extract image
            $image = null;
            try {
                $imgNode = $node->filter('.img img');
                $image = $imgNode->attr('src', '');
            } catch (\Exception $e) {
                // Try alternative image selector
                try {
                    $imgNode = $node->filter('img');
                    $image = $imgNode->attr('src', '');
                } catch (\Exception $e2) {
                    // No image found
                }
            }
            
            // Extract date
            $dateText = '';
            try {
                $dateText = $node->filter('.date')->text('');
            } catch (\Exception $e) {
                // Date not found, will use current date
            }
            
            // Extract link
            $link = $node->filter('.title a')->attr('href', '');

            // Process date
            $dateStr = $this->extractDateFromText($dateText);

            $beritaList[] = [
                'title' => trim($title),
                'description' => "Berita dari BNPB terkait: " . $title,
                'link' => $this->normalizeUrl($link, 'https://bnpb.go.id'),
                'image' => $this->normalizeUrl($image, 'https://bnpb.go.id'),
                'date' => $dateStr,
            ];
            
            $this->line("<info>[{$source}]</info> Found: " . $title);
        } catch (\Exception $e) {
            $this->warn('Error extracting item: ' . $e->getMessage());
        }
    }

    private function extractDateFromText($dateText)
    {
        $dateText = trim($dateText);
        if (empty($dateText)) {
            return date('Y-m-d H:i:s');
        }

        // Remove icon if present
        $dateText = preg_replace('/\bi class=".*?"\s*>\s*/', '', $dateText);

        // Try to extract the date part
        if (preg_match('/(\d{1,2}\s+[A-Za-z]+\s+\d{4})/', $dateText, $matches)) {
            $dateStr = $matches[1];
            
            // Convert Indonesian month names to English
            $monthMapping = [
                'Januari' => 'January',
                'Februari' => 'February',
                'Maret' => 'March',
                'April' => 'April',
                'Mei' => 'May',
                'Juni' => 'June',
                'Juli' => 'July',
                'Agustus' => 'August',
                'September' => 'September',
                'Oktober' => 'October',
                'November' => 'November',
                'Desember' => 'December'
            ];
            
            foreach ($monthMapping as $indo => $eng) {
                $dateStr = str_replace($indo, $eng, $dateStr);
            }
            
            try {
                $date = new \DateTime($dateStr);
                return $date->format('Y-m-d H:i:s');
            } catch (\Exception $e) {
                return date('Y-m-d H:i:s');
            }
        }

        return date('Y-m-d H:i:s');
    }

    private function normalizeUrl($url, $baseUrl)
    {
        if (empty($url)) {
            return null;
        }
        
        // If URL already absolute
        if (strpos($url, 'http') === 0) {
            return $url;
        }
        
        // If URL starts with //
        if (strpos($url, '//') === 0) {
            return 'https:' . $url;
        }
        
        // If URL is relative
        return rtrim($baseUrl, '/') . '/' . ltrim($url, '/');
    }
}
