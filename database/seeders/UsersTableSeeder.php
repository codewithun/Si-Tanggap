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
        // Roles are already created in RolePermissionSeeder

        // Admin
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'email_verified_at' => now(),
            'password' => Hash::make('password'),
        ]);
        $admin->assignRole('admin');

        // Relawan
        $relawan1 = User::create([
            'name' => 'Relawan Satu',
            'email' => 'relawan1@example.com',
            'email_verified_at' => now(),
            'password' => Hash::make('password'),
        ]);
        $relawan1->assignRole('relawan');

        $relawan2 = User::create([
            'name' => 'Relawan Dua',
            'email' => 'relawan2@example.com',
            'email_verified_at' => now(),
            'password' => Hash::make('password'),
        ]);
        $relawan2->assignRole('relawan');

        // Masyarakat
        $warga1 = User::create([
            'name' => 'Warga Satu',
            'email' => 'warga1@example.com',
            'email_verified_at' => now(),
            'password' => Hash::make('password'),
        ]);
        $warga1->assignRole('masyarakat');

        // Tambah user masyarakat lain jika perlu...
    }
}
