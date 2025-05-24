<?php
// filepath: d:\laragon\www\PROJECT\Si-Tanggap\database\seeders\UsersTableSeeder.php
namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UsersTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create admin user
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'email_verified_at' => now(),
        ]);

        // Create relawan users
        User::create([
            'name' => 'Relawan Satu',
            'email' => 'relawan1@example.com',
            'password' => Hash::make('password'),
            'role' => 'relawan',
            'email_verified_at' => now(),
        ]);

        User::create([
            'name' => 'Relawan Dua',
            'email' => 'relawan2@example.com',
            'password' => Hash::make('password'),
            'role' => 'relawan',
            'email_verified_at' => now(),
        ]);

        // Create masyarakat users
        User::create([
            'name' => 'Warga Satu',
            'email' => 'warga1@example.com',
            'password' => Hash::make('password'),
            'role' => 'masyarakat',
            'email_verified_at' => now(),
        ]);

        User::create([
            'name' => 'Warga Dua',
            'email' => 'warga2@example.com',
            'password' => Hash::make('password'),
            'role' => 'masyarakat',
            'email_verified_at' => now(),
        ]);

        User::create([
            'name' => 'Warga Tiga',
            'email' => 'warga3@example.com',
            'password' => Hash::make('password'),
            'role' => 'masyarakat',
            'email_verified_at' => now(),
        ]);
    }
}
