<?php
// filepath: d:\laragon\www\PROJECT\Si-Tanggap\database\seeders\PoskosTableSeeder.php
namespace Database\Seeders;

use App\Models\Posko;
use App\Models\User;
use Illuminate\Database\Seeder;

class PoskosTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ambil semua user yang punya role 'relawan' via Spatie Role
        $relawanIds = User::role('relawan')->pluck('id')->toArray();

        if (empty($relawanIds)) {
            $this->command->error('Seeder Poskos gagal: Tidak ada user dengan role relawan ditemukan.');
            return;
        }

        // Data sample posko
        $poskos = [
            [
                'nama' => 'Posko Kesehatan Sukamaju',
                'deskripsi' => 'Posko kesehatan untuk korban banjir. Menyediakan layanan kesehatan dasar dan obat-obatan.',
                'jenis_posko' => 'Kesehatan',
                'alamat' => 'Jalan Bukit No. 15, Kelurahan Sukamaju',
                'kontak' => '08123456789',
                'status' => 'aktif',
                'latitude' => -6.2065,
                'longitude' => 106.8475,
                'foto' => null,
                'created_at' => now()->subDays(14),
                'updated_at' => now()->subDays(14),
            ],
            [
                'nama' => 'Posko Logistik Bumi Indah',
                'deskripsi' => 'Pusat distribusi bantuan logistik untuk korban bencana. Menerima dan menyalurkan bantuan.',
                'jenis_posko' => 'Logistik',
                'alamat' => 'Jalan Bumi Indah No. 27, Kecamatan Selamat',
                'kontak' => '08987654321',
                'status' => 'aktif',
                'latitude' => -6.9020,
                'longitude' => 107.6100,
                'foto' => null,
                'created_at' => now()->subDays(12),
                'updated_at' => now()->subDays(12),
            ],
            [
                'nama' => 'Posko Pengungsian Sejahtera',
                'deskripsi' => 'Tempat pengungsian sementara untuk korban gempa. Menyediakan tempat tinggal dan makanan.',
                'jenis_posko' => 'Pengungsian',
                'alamat' => 'Lapangan Besar, Kota Selamat',
                'kontak' => '08567891234',
                'status' => 'aktif',
                'latitude' => -7.2555,
                'longitude' => 112.7540,
                'foto' => null,
                'created_at' => now()->subDays(7),
                'updated_at' => now()->subDays(7),
            ],
            [
                'nama' => 'Posko Darurat Pantai Indah',
                'deskripsi' => 'Posko darurat untuk korban tsunami. Menyediakan bantuan pertama dan evakuasi.',
                'jenis_posko' => 'Darurat',
                'alamat' => 'Bukit Aman, Kabupaten Pesisir',
                'kontak' => '08765432198',
                'status' => 'aktif',
                'latitude' => -8.6705,
                'longitude' => 115.2145,
                'foto' => null,
                'created_at' => now()->subDays(6),
                'updated_at' => now()->subDays(6),
            ],
            [
                'nama' => 'Posko Makanan Kampung Baru',
                'deskripsi' => 'Posko penyediaan makanan untuk korban angin puting beliung. Beroperasi 24 jam.',
                'jenis_posko' => 'Logistik',
                'alamat' => 'Balai Warga Kampung Baru, RT 03/RW 04',
                'kontak' => '08543219876',
                'status' => 'aktif',
                'latitude' => -7.1510,
                'longitude' => 110.4229,
                'foto' => null,
                'created_at' => now()->subDays(2),
                'updated_at' => now()->subDays(2),
            ],
        ];

        // Simpan data posko dengan assign user relawan random sebagai pembuat
        foreach ($poskos as $poskoData) {
            $userId = $relawanIds[array_rand($relawanIds)];

            Posko::create(array_merge($poskoData, ['user_id' => $userId]));
        }

        $this->command->info('Seeder Poskos berhasil dijalankan.');
    }
}
