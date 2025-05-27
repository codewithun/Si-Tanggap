<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RolePermissionSeeder::class, // Run this first to create roles
            UsersTableSeeder::class,
            LaporansTableSeeder::class,
            JalurEvakuasisTableSeeder::class,
            PoskosTableSeeder::class,
        ]);
    }
}
