<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create roles
        $adminRole = Role::create(['name' => 'admin']);
        $relawanRole = Role::create(['name' => 'relawan']);
        $masyarakatRole = Role::create(['name' => 'masyarakat']);

        // Create permissions
        // Admin permissions
        $manageUsers = Permission::create(['name' => 'manage users']);
        $verifyReports = Permission::create(['name' => 'verify reports']);
        $sendNotifications = Permission::create(['name' => 'send notifications']);

        // Relawan permissions
        $addEvacuationRoutes = Permission::create(['name' => 'add evacuation routes']);
        $addShelters = Permission::create(['name' => 'add shelters']);
        $viewDisasterMap = Permission::create(['name' => 'view disaster map']);

        // Masyarakat permissions
        $createReports = Permission::create(['name' => 'create reports']);
        $viewReports = Permission::create(['name' => 'view reports']);

        // Common permissions
        $viewProfile = Permission::create(['name' => 'view profile']);
        $editProfile = Permission::create(['name' => 'edit profile']);

        // Assign permissions to roles
        $adminRole->givePermissionTo([
            $manageUsers,
            $verifyReports,
            $sendNotifications,
            $addEvacuationRoutes,
            $addShelters,
            $viewDisasterMap,
            $viewProfile,
            $editProfile,
        ]);

        $relawanRole->givePermissionTo([
            $addEvacuationRoutes,
            $addShelters,
            $viewDisasterMap,
            $viewProfile,
            $editProfile,
        ]);

        $masyarakatRole->givePermissionTo([
            $createReports,
            $viewReports,
            $viewProfile,
            $editProfile,
        ]);

        // Update existing users to have correct roles
        // Find users with direct role column and assign Spatie roles
        $users = User::all();
        foreach ($users as $user) {
            if ($user->role) {
                $user->assignRole($user->role);
            }
        }
    }
}
