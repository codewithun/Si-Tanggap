<?php

namespace Database\Seeders;

use App\Models\Laporan;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class LaporanDummySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all user IDs (make sure users exist first)
        $userIds = User::pluck('id')->toArray();

        // Create a user if none exists
        if (empty($userIds)) {
            $user = User::factory()->create([
                'name' => 'Test User',
                'email' => 'test@example.com',
            ]);
            $userIds = [$user->id];
        }

        // Example disaster data
        $disasters = [
            [
                'judul' => 'Banjir di Jakarta Selatan',
                'jenis_bencana' => 'banjir',
                'deskripsi' => 'Banjir setinggi 1 meter telah merendam kawasan Jakarta Selatan',
                'latitude' => -6.2607,
                'longitude' => 106.8105,
                'lokasi' => 'Kemang, Jakarta Selatan',
                'status' => 'diverifikasi',
            ],
            [
                'judul' => 'Longsor di Puncak Bogor',
                'jenis_bencana' => 'longsor',
                'deskripsi' => 'Longsor telah terjadi di kawasan Puncak, menutup jalan utama',
                'latitude' => -6.7033,
                'longitude' => 106.9894,
                'lokasi' => 'Puncak, Bogor',
                'status' => 'diverifikasi',
            ],
            [
                'judul' => 'Kebakaran di Pasar Minggu',
                'jenis_bencana' => 'kebakaran',
                'deskripsi' => 'Kebakaran besar telah menghanguskan sebagian pasar tradisional',
                'latitude' => -6.2954,
                'longitude' => 106.8372,
                'lokasi' => 'Pasar Minggu, Jakarta Selatan',
                'status' => 'menunggu',
            ],
            [
                'judul' => 'Gempa di Sukabumi',
                'jenis_bencana' => 'gempa',
                'deskripsi' => 'Gempa berkekuatan 5.2 SR telah mengguncang wilayah Sukabumi',
                'latitude' => -7.0059,
                'longitude' => 106.5492,
                'lokasi' => 'Sukabumi, Jawa Barat',
                'status' => 'diverifikasi',
            ],
            [
                'judul' => 'Angin Topan di Pangandaran',
                'jenis_bencana' => 'angin_topan',
                'deskripsi' => 'Angin topan telah merusak puluhan rumah warga di pesisir Pangandaran',
                'latitude' => -7.6970,
                'longitude' => 108.6559,
                'lokasi' => 'Pangandaran, Jawa Barat',
                'status' => 'diverifikasi',
            ],
        ];

        foreach ($disasters as $disaster) {
            // Randomly pick a user
            $userId = $userIds[array_rand($userIds)];

            Laporan::create([
                'user_id' => $userId,
                'judul' => $disaster['judul'],
                'jenis_bencana' => $disaster['jenis_bencana'],
                'deskripsi' => $disaster['deskripsi'],
                'latitude' => $disaster['latitude'],
                'longitude' => $disaster['longitude'],
                'lokasi' => $disaster['lokasi'],
                'status' => $disaster['status'],
            ]);
        }

        $this->command->info('Sample disaster reports created successfully.');
    }
}
