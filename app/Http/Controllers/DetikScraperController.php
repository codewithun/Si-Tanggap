<?php

namespace App\Http\Controllers;

use App\Models\Berita;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Symfony\Component\DomCrawler\Crawler;

class DetikScraperController extends Controller
{
    public function index()
    {
        try {
            // Get pagination parameter (default to 1 page)
            $pagesToScrape = request()->get('pages', 1);
            $pagesToScrape = min(max((int)$pagesToScrape, 1), 3); // Limit between 1 and 3 pages

            // Caching selama 30 menit dengan key yang menyertakan jumlah halaman
            $cacheKey = 'berita_detik_bencana_' . $pagesToScrape;

            // Uncomment for testing
            // Cache::forget($cacheKey);

            $berita = Cache::remember($cacheKey, now()->addMinutes(30), function () use ($pagesToScrape) {
                // Log the scraping attempt
                Log::info("Attempting to scrape Detik BNPB news - {$pagesToScrape} pages");

                $allBerita = [];

                for ($page = 1; $page <= $pagesToScrape; $page++) {
                    $pageBerita = $this->scrapePage($page);
                    if (empty($pageBerita)) {
                        Log::info("No more news found on page {$page}, stopping pagination");
                        break;
                    }

                    $allBerita = array_merge($allBerita, $pageBerita);
                    Log::info("Scraped Detik page {$page}, got " . count($pageBerita) . " items");

                    // Add small delay between pages
                    if ($page < $pagesToScrape) {
                        sleep(1);
                    }
                }

                // Save to database
                $this->saveToDatabase($allBerita);

                Log::info('Detik scraping complete, found ' . count($allBerita) . ' items across ' . ($page - 1) . ' pages');
                return $allBerita;
            });

            // Return JSON with proper content type and status
            return response()->json([
                'berita' => $berita,
                'total' => count($berita),
                'pages_scraped' => $pagesToScrape,
                'source' => 'detik'
            ], 200, [
                'Content-Type' => 'application/json',
                'Cache-Control' => 'public, max-age=1800' // 30 minutes
            ]);
        } catch (\Exception $e) {
            Log::error('DetikScraperController exception: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch Detik news data', 'message' => $e->getMessage()], 500);
        }
    }

    private function saveToDatabase($articles)
    {
        foreach ($articles as $article) {
            // Check if article with this title already exists
            $exists = Berita::where('title', $article['title'])->exists();

            if (!$exists) {
                Berita::create([
                    'title' => $article['title'],
                    'description' => $article['description'],
                    'link' => $article['link'],
                    'image' => $article['image'],
                    'source' => 'detik-bencana',  // Changed from 'detik' to 'detik-bencana'
                    'published_date' => $article['date']
                ]);

                Log::info("Saved to database: {$article['title']}");
            }
        }
    }

    private function scrapePage($page)
    {
        $url = "https://www.detik.com/tag/bencana-alam/?sortby=time&page={$page}";

        try {
            // Add a user-friendly user agent
            $response = Http::withHeaders([
                'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
                'Accept' => 'text/html,application/xhtml+xml,application/xml',
                'Accept-Language' => 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
            ])->timeout(20)->get($url);

            if (!$response->successful()) {
                Log::warning("Failed to fetch Detik BNPB news page {$page}: " . $response->status());
                return [];
            }

            $html = $response->body();
            $crawler = new Crawler($html);
            $newsItems = [];

            // Extract articles from the page
            $crawler->filter('article')->each(function (Crawler $node) use (&$newsItems) {
                try {
                    $title = $node->filter('h2.title')->text('');

                    // Skip if empty title
                    if (empty($title)) {
                        return;
                    }

                    // Get description
                    $description = $node->filter('p')->text('');
                    if (empty($description)) {
                        $description = "Berita dari Detik terkait BNPB: " . $title;
                    }

                    // Get link
                    $link = $node->filter('a')->attr('href', '');

                    // Get image
                    $imageSrc = '';
                    try {
                        // Look for lazy-loaded images
                        $img = $node->filter('img.lazy-image');
                        if ($img->count() > 0) {
                            $imageSrc = $img->attr('data-src', '');
                        }

                        // If no lazy image, try regular image
                        if (empty($imageSrc)) {
                            $img = $node->filter('img');
                            if ($img->count() > 0) {
                                $imageSrc = $img->attr('src', '');
                            }
                        }
                    } catch (\Exception $e) {
                        $imageSrc = '';
                    }

                    // Get date from the format: "detikNews | Sabtu, 24 Mei 2025 22:54 WIB"
                    $dateText = $node->filter('.date')->text('');
                    $date = date('Y-m-d H:i:s'); // Default to current date

                    if (!empty($dateText)) {
                        preg_match('/(\d{1,2}\s+\w+\s+\d{4}\s+\d{1,2}:\d{2})/', $dateText, $matches);
                        if (!empty($matches[1])) {
                            $indonesianDate = $matches[1];
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
                                $indonesianDate = str_replace($indo, $eng, $indonesianDate);
                            }

                            try {
                                $date = date('Y-m-d H:i:s', strtotime($indonesianDate));
                            } catch (\Exception $e) {
                                // Use current date if parsing fails
                            }
                        }
                    }

                    // Add to our news items array
                    $newsItems[] = [
                        'title' => trim($title),
                        'description' => trim($description),
                        'link' => $link,
                        'image' => $imageSrc,
                        'date' => $date
                    ];
                } catch (\Exception $e) {
                    Log::warning("Error parsing a Detik article: " . $e->getMessage());
                }
            });

            return $newsItems;
        } catch (\Exception $e) {
            Log::error("Error scraping Detik page {$page}: " . $e->getMessage());
            Log::error($e->getTraceAsString());
            return [];
        }
    }
}
