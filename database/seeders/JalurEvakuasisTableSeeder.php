<?php
namespace Database\Seeders;

use App\Models\JalurEvakuasi;
use App\Models\User;
use Illuminate\Database\Seeder;

class JalurEvakuasisTableSeeder extends Seeder
{
    public function run(): void
    {
        // Cari user yang punya role relawan (pakai Spatie)
        $relawanIds = User::role('relawan')->pluck('id')->toArray();

        if (empty($relawanIds)) {
            $this->command->error('Seeder JalurEvakuasis gagal: Tidak ada user dengan role relawan ditemukan.');
            return;
        }

        $jalurEvakuasis = [
            [
                'nama' => 'Jalur Evakuasi Banjir Kelurahan Sukamaju',
                'deskripsi' => 'Jalur evakuasi menuju tempat pengungsian di bukit. Jalur ini memiliki jalan yang cukup lebar untuk dilewati kendaraan roda empat.',
                'jenis_bencana' => 'banjir',
                'koordinat' => json_encode([
                    [-6.2088, 106.8456],
                    [-6.2080, 106.8460],
                    [-6.2075, 106.8465],
                    [-6.2070, 106.8470],
                    [-6.2065, 106.8475],
                ]),
                'warna' => '#3498db',
                'created_at' => now()->subDays(15),
                'updated_at' => now()->subDays(15),
            ],
            [
                'nama' => 'Jalur Evakuasi Longsor Bukit Tinggi',
                'deskripsi' => 'Jalur evakuasi menuju desa terdekat yang aman dari longsor. Sebagian jalur hanya bisa dilewati dengan jalan kaki.',
                'jenis_bencana' => 'longsor',
                'koordinat' => json_encode([
                    [-6.9032, 107.6079],
                    [-6.9030, 107.6085],
                    [-6.9028, 107.6090],
                    [-6.9025, 107.6095],
                    [-6.9020, 107.6100],
                ]),
                'warna' => '#e67e22',
                'created_at' => now()->subDays(10),
                'updated_at' => now()->subDays(10),
            ],
            [
                'nama' => 'Jalur Evakuasi Gempa Kecamatan Selamat',
                'deskripsi' => 'Jalur evakuasi menuju lapangan terbuka yang aman dari reruntuhan bangunan.',
                'jenis_bencana' => 'gempa',
                'koordinat' => json_encode([
                    [-7.2575, 112.7521],
                    [-7.2570, 112.7525],
                    [-7.2565, 112.7530],
                    [-7.2560, 112.7535],
                    [-7.2555, 112.7540],
                ]),
                'warna' => '#f39c12',
                'created_at' => now()->subDays(5),
                'updated_at' => now()->subDays(5),
            ],
            [
                'nama' => 'Jalur Evakuasi Tsunami Pantai Indah',
                'deskripsi' => 'Jalur evakuasi dari pantai menuju bukit terdekat. Dilengkapi dengan papan petunjuk arah.',
                'jenis_bencana' => 'tsunami',
                'koordinat' => json_encode([
                    [-8.6725, 115.2126],
                    [-8.6720, 115.2130],
                    [-8.6715, 115.2135],
                    [-8.6710, 115.2140],
                    [-8.6705, 115.2145],
                ]),
                'warna' => '#1abc9c',
                'created_at' => now()->subDays(8),
                'updated_at' => now()->subDays(8),
            ],
        ];

        foreach ($jalurEvakuasis as $jalurData) {
            $userId = $relawanIds[array_rand($relawanIds)];

            JalurEvakuasi::create(array_merge($jalurData, ['user_id' => $userId]));
        }

        $this->command->info('Jalur Evakuasi berhasil di-seed.');
    }
}
