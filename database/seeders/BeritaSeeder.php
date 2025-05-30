<?php

namespace Database\Seeders;

use App\Models\Berita;
use Illuminate\Database\Seeder;

class BeritaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Sample news from BNPB
        Berita::create([
            'title' => 'BMKG: Peringatan Dini Potensi Banjir di Wilayah Jakarta',
            'description' => 'Badan Meteorologi Klimatologi dan Geofisika (BMKG) mengeluarkan peringatan dini terkait potensi banjir di wilayah Jakarta dan sekitarnya akibat curah hujan tinggi.',
            'link' => 'https://bnpb.go.id/berita/bmkg-peringatan-dini-banjir-jakarta',
            'image' => 'https://source.unsplash.com/random/300x200?weather',
            'source' => 'bnpb',
            'published_date' => now()->subDays(2)->format('Y-m-d H:i:s')
        ]);

        Berita::create([
            'title' => 'Latihan Evakuasi Bencana di 5 Provinsi Rawan Gempa',
            'description' => 'BNPB dan Pemerintah Daerah menggelar simulasi evakuasi bencana gempa bumi di lima provinsi yang rawan gempa untuk meningkatkan kesiapsiagaan masyarakat.',
            'link' => 'https://bnpb.go.id/berita/latihan-evakuasi-bencana-5-provinsi',
            'image' => 'https://source.unsplash.com/random/300x200?earthquake',
            'source' => 'bnpb',
            'published_date' => now()->subDays(4)->format('Y-m-d H:i:s')
        ]);

        // Sample news from Detik
        Berita::create([
            'title' => '255 Rumah di Bengkulu Rusak Akibat Gempa M 6, 255 Keluarga Terdampak',
            'description' => 'Sebanyak 255 rumah warga Bengkulu rusak setelah diguncang gempa dengan magnitudo (M) 6. Ratusan keluarga terdampak usai terjadi gempa tersebut.',
            'link' => 'https://news.detik.com/berita/d-7931004/255-rumah-di-bengkulu-rusak-akibat-gempa-m-6-255-keluarga-terdampak',
            'image' => 'https://akcdn.detik.net.id/community/media/visual/2025/05/23/rumah-rusak-dampak-gempa-m-63-di-bengkulu-dok-istimewabpbd-1747983407669_43.jpeg',
            'source' => 'detik',
            'published_date' => now()->subDays(1)->format('Y-m-d H:i:s')
        ]);

        Berita::create([
            'title' => 'BNPB Kucurkan Dana Stimulan untuk Korban Terdampak Gempa Bengkulu',
            'description' => 'Gubernur Bengkulu Helmi Hasan menyebut pihaknya sudah menyiapkan anggaran Rp 4,7 miliar untuk pemulihan pascagempa Bengkulu.',
            'link' => 'https://www.detik.com/sumbagsel/berita/d-7932425/bnpb-kucurkan-dana-stimulan-untuk-korban-terdampak-gempa-bengkulu',
            'image' => 'https://akcdn.detik.net.id/community/media/visual/2025/05/26/rumah-rusak-akibat-gempa-bengkulu-1748218238680_43.jpeg',
            'source' => 'detik',
            'published_date' => now()->format('Y-m-d H:i:s')
        ]);
    }
}
