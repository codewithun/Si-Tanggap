<?php
// filepath: d:\laragon\www\PROJECT\Si-Tanggap\database\seeders\LaporansTableSeeder.php
namespace Database\Seeders;

use App\Models\Laporan;
use App\Models\User;
use Illuminate\Database\Seeder;

class LaporansTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get IDs of users with 'masyarakat' role
        $masyarakatIds = User::where('role', 'masyarakat')->pluck('id')->toArray();
        // Sample disaster reports
        $laporans = [
            [
                'judul' => 'Banjir di Kelurahan Sukamaju',
                'deskripsi' => 'Banjir setinggi 1 meter merendam pemukiman warga sejak pukul 02.00 dini hari. Diperkirakan ada 20 rumah yang terdampak.',
                'jenis_bencana' => 'banjir',
                'lokasi' => 'Kelurahan Sukamaju, RT 05/RW 02',
                'latitude' => -6.2088,
                'longitude' => 106.8456,
                'status' => 'diverifikasi',
                'foto' => null, // To be updated
                'created_at' => now()->subDays(2),
                'updated_at' => now()->subDays(1),
            ],
            [
                'judul' => 'Longsor di Bukit Tinggi',
                'deskripsi' => 'Longsor menimpa 3 rumah warga setelah hujan deras selama 2 hari berturut-turut. Belum ada korban jiwa yang dilaporkan.',
                'jenis_bencana' => 'longsor',
                'lokasi' => 'Desa Bukit Tinggi, Kecamatan Selamat',
                'latitude' => -6.9032,
                'longitude' => 107.6079,
                'status' => 'diverifikasi',
                'foto' => null,
                'created_at' => now()->subDays(5),
                'updated_at' => now()->subDays(4),
            ],
            [
                'judul' => 'Kebakaran di Pasar Lama',
                'deskripsi' => 'Kebakaran di area pasar tradisional, 15 kios terbakar. Api diduga berasal dari korsleting listrik.',
                'jenis_bencana' => 'kebakaran',
                'lokasi' => 'Pasar Lama, Jalan Sudirman No. 23',
                'latitude' => -7.7971,
                'longitude' => 110.3688,
                'status' => 'menunggu',
                'foto' => null,
                'created_at' => now()->subHours(12),
                'updated_at' => now()->subHours(12),
            ],
            [
                'judul' => 'Gempa di Kota Selamat',
                'deskripsi' => 'Gempa berkekuatan 5.6 SR mengguncang kota. Beberapa bangunan mengalami keretakan.',
                'jenis_bencana' => 'gempa',
                'lokasi' => 'Kota Selamat',
                'latitude' => -7.2575,
                'longitude' => 112.7521,
                'status' => 'diverifikasi',
                'foto' => null,
                'created_at' => now()->subDays(8),
                'updated_at' => now()->subDays(7),
            ],
            [
                'judul' => 'Tsunami di Pantai Indah',
                'deskripsi' => 'Tsunami kecil akibat gempa di laut. Gelombang setinggi 50 cm mencapai pantai.',
                'jenis_bencana' => 'tsunami',
                'lokasi' => 'Pantai Indah, Kabupaten Pesisir',
                'latitude' => -8.6725,
                'longitude' => 115.2126,
                'status' => 'ditolak',
                'foto' => null,
                'created_at' => now()->subDays(10),
                'updated_at' => now()->subDays(9),
            ],
            [
                'judul' => 'Banjir Bandang di Desa Sungai',
                'deskripsi' => 'Banjir bandang melanda desa setelah hujan lebat selama 3 jam. Ketinggian air mencapai 1,5 meter.',
                'jenis_bencana' => 'banjir',
                'lokasi' => 'Desa Sungai, Kecamatan Hilir',
                'latitude' => -6.3564,
                'longitude' => 106.8266,
                'status' => 'diverifikasi',
                'foto' => null,
                'created_at' => now()->subDays(3),
                'updated_at' => now()->subDays(2),
            ],
            [
                'judul' => 'Angin Puting Beliung di Kampung Baru',
                'deskripsi' => 'Angin puting beliung merusak 5 rumah warga dan menumbangkan beberapa pohon.',
                'jenis_bencana' => 'angin_topan',
                'lokasi' => 'Kampung Baru, RT 03/RW 04',
                'latitude' => -7.1510,
                'longitude' => 110.4229,
                'status' => 'menunggu',
                'foto' => null,
                'created_at' => now()->subDay(),
                'updated_at' => now()->subDay(),
            ],
        ];

        // Create the laporan records
        foreach ($laporans as $index => $laporanData) {
            // Assign a random masyarakat user as the creator
            $userId = $masyarakatIds[array_rand($masyarakatIds)];

            Laporan::create(array_merge($laporanData, ['user_id' => $userId]));
        }
    }
}
