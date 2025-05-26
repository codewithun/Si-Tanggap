<?php

namespace Database\Seeders; 
use Illuminate\Database\Seeder;
use App\Models\User;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Hash;

class UsersTableSeeder extends Seeder
{
    public function run(): void
    {
        // Buat role jika belum ada
        Role::firstOrCreate(['name' => 'admin']);
        Role::firstOrCreate(['name' => 'relawan']);
        Role::firstOrCreate(['name' => 'masyarakat']);

        // Admin
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'email_verified_at' => now(),
            'password' => Hash::make('password'),
            'role' => 'admin', // optional, jika tetap ingin simpan di kolom
        ]);
        $admin->assignRole('admin');

        // Relawan
        $relawan1 = User::create([
            'name' => 'Relawan Satu',
            'email' => 'relawan1@example.com',
            'email_verified_at' => now(),
            'password' => Hash::make('password'),
            'role' => 'relawan',
        ]);
        $relawan1->assignRole('relawan');

        $relawan2 = User::create([
            'name' => 'Relawan Dua',
            'email' => 'relawan2@example.com',
            'email_verified_at' => now(),
            'password' => Hash::make('password'),
            'role' => 'relawan',
        ]);
        $relawan2->assignRole('relawan');

        // Masyarakat
        $warga1 = User::create([
            'name' => 'Warga Satu',
            'email' => 'warga1@example.com',
            'email_verified_at' => now(),
            'password' => Hash::make('password'),
            'role' => 'masyarakat',
        ]);
        $warga1->assignRole('masyarakat');

        // Tambah user masyarakat lain jika perlu...
    }
}
