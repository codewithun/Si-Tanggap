<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Symfony\Component\DomCrawler\Crawler;

class BeritaScraperController extends Controller
{
    public function index()
    {
        try {
            // Get pagination parameter (default to 5 pages)
            $pagesToScrape = request()->get('pages', 5);
            $pagesToScrape = min(max((int)$pagesToScrape, 1), 10); // Limit between 1 and 10 pages
            
            // Caching selama 30 menit dengan key yang menyertakan jumlah halaman
            $cacheKey = 'berita_bnpb_' . $pagesToScrape;
            
            // Uncomment for testing
            // Cache::forget($cacheKey);
            
            $berita = Cache::remember($cacheKey, now()->addMinutes(30), function () use ($pagesToScrape) {
                // Log the scraping attempt
                Log::info("Attempting to scrape BNPB news - {$pagesToScrape} pages");
                
                $allBerita = [];
                
                for ($page = 1; $page <= $pagesToScrape; $page++) {
                    $pageBerita = $this->scrapePage($page);
                    if (empty($pageBerita)) {
                        Log::info("No more news found on page {$page}, stopping pagination");
                        break;
                    }
                    
                    $allBerita = array_merge($allBerita, $pageBerita);
                    Log::info("Scraped page {$page}, got " . count($pageBerita) . " items");
                    
                    // Add small delay between pages
                    if ($page < $pagesToScrape) {
                        sleep(1);
                    }
                }

                Log::info('BNPB scraping complete, found ' . count($allBerita) . ' items across ' . ($page - 1) . ' pages');
                return $allBerita;
            });

            // Return JSON with proper content type and status
            return response()->json([
                'berita' => $berita,
                'total' => count($berita),
                'pages_scraped' => $pagesToScrape
            ], 200, [
                'Content-Type' => 'application/json',
                'Cache-Control' => 'public, max-age=1800' // 30 minutes
            ]);
        } catch (\Exception $e) {
            Log::error('BeritaScraperController exception: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch news data', 'message' => $e->getMessage()], 500);
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
                Log::warning("Failed to fetch BNPB news page {$page}: " . $response->status());
                return [];
            }

            $html = $response->body();

            // Simpan HTML untuk debugging jika diperlukan
            if ($page == 1) {
                // Uncomment untuk debugging
                // Storage::disk('local')->put('bnpb_page_1.html', $html);
            }

            $crawler = new Crawler($html);
            $beritaList = [];

            // Cek apakah kita sudah mencapai halaman terakhir
            $pageCheck = $crawler->filter('.pagination');
            if ($pageCheck->count() === 0 && $page > 1) {
                Log::info("Page {$page} has no pagination control, might be the last page");
            }

            // Coba semua selector yang mungkin dalam satu pendekatan
            Log::info("Scraping articles from page {$page} with all possible selectors");

            // Selector 1: .berita-terkini .block
            $crawler->filter('.berita-terkini .block')->each(function ($node) use (&$beritaList) {
                $this->extractArticle($node, $beritaList, 'primary selector');
            });

            // Selector 2: Article items in grid layout
            $crawler->filter('.col-lg-4.col-md-4.col-12 .block, .col-lg-4.col-12 .block, .col-md-4.col-12 .block')->each(function ($node) use (&$beritaList) {
                $this->extractArticle($node, $beritaList, 'grid selector');
            });

            // Selector 3: Generic article blocks
            $crawler->filter('.data .block')->each(function ($node) use (&$beritaList) {
                $this->extractArticle($node, $beritaList, 'data block selector');
            });

            // Selector 4: Absolute last resort - any block with title and content
            $crawler->filter('.block')->each(function ($node) use (&$beritaList) {
                // Skip if this node doesn't have a title element
                if ($node->filter('.title a')->count() == 0) {
                    return;
                }
                
                // Skip duplicates (prevent duplicates from different selectors)
                $title = $node->filter('.title a')->text('');
                $isDuplicate = false;
                
                foreach ($beritaList as $existingItem) {
                    if ($existingItem['title'] === trim($title)) {
                        $isDuplicate = true;
                        break;
                    }
                }
                
                if (!$isDuplicate) {
                    $this->extractArticle($node, $beritaList, 'fallback selector');
                }
            });

            Log::info("Found " . count($beritaList) . " unique articles on page {$page}");
            Log::info("Page {$page} HTML length: " . strlen($html) . " bytes");
            return $beritaList;
        } catch (\Exception $e) {
            Log::error("Error scraping page {$page}: " . $e->getMessage());
            Log::error($e->getTraceAsString());
            return [];
        }
    }

    // Extract date from format like "10 Mei 2025 | 13:13 WIB" to ISO date
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

    // Generate a brief description from the title when no description is available
    private function generateDescription($title)
    {
        return "Berita dari BNPB terkait: " . $title;
    }

    // Helper to normalize URLs
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

    // Helper method to extract article data and avoid duplicate code
    private function extractArticle($node, &$beritaList, $selectorType)
    {
        try {
            $title = $node->filter('.title a')->text('');

            // Skip empty titles
            if (empty($title)) {
                return;
            }

            // Skip if this article is already in our list (avoid duplicates)
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
                'description' => $this->generateDescription($title),
                'link' => $this->normalizeUrl($link, 'https://bnpb.go.id'),
                'image' => $this->normalizeUrl($image, 'https://bnpb.go.id'),
                'date' => $dateStr,
                'source' => $selectorType, // For debugging
            ];

            Log::debug("Found news item ({$selectorType}): {$title}");
        } catch (\Exception $e) {
            Log::warning("Error parsing an article: " . $e->getMessage());
        }
    }
}
