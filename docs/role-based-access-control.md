# Role-Based Access Control di Si-Tanggap

## Pengantar

Aplikasi Si-Tanggap menggunakan [Spatie Laravel Permission](https://spatie.be/docs/laravel-permission) untuk mengelola peran (roles) dan hak akses (permissions).

## Struktur Peran

Sistem memiliki 3 peran dasar:

1. **Admin** - Akses penuh untuk mengelola sistem
2. **Relawan** - Akses untuk mengelola jalur evakuasi, posko, dan verifikasi laporan
3. **Masyarakat** - Akses dasar untuk membuat dan melihat laporan

## Cara Mengakses Peran User

### Backend (PHP)

```php
// Mengecek role
if ($user->hasRole('admin')) {
    // Lakukan sesuatu untuk admin
}

// Mengecek permission
if ($user->can('verify reports')) {
    // Lakukan sesuatu jika user bisa verifikasi laporan
}

// Memberikan role
$user->assignRole('relawan');

// Menghapus role
$user->removeRole('relawan');
```

### Frontend (React)

Role sudah dimasukkan ke dalam prop auth.user:

```tsx
const { auth } = usePage().props;
const user = auth?.user;

if (user?.role === 'admin') {
    // Tampilkan sesuatu untuk admin
}
```

## Mengamankan Route

Ada 2 cara untuk mengamankan route:

### 1. Menggunakan Middleware Role

```php
Route::middleware(['auth', 'role:admin'])->group(function () {
    // Route hanya untuk admin
});

// Untuk multiple roles
Route::middleware(['auth', 'role:admin|relawan'])->group(function () {
    // Route untuk admin ATAU relawan
});
```

### 2. Menggunakan Middleware Permission

```php
Route::middleware(['auth', 'permission:manage users'])->group(function () {
    // Route untuk user dengan permission 'manage users'
});
```

## Seeding Roles dan Permissions

Untuk menambahkan role atau permission baru, edit file:
`database/seeders/RolePermissionSeeder.php`

Kemudian jalankan:

```bash
php artisan db:seed --class=RolePermissionSeeder
```

## Best Practices

1. Gunakan permission daripada role untuk pemeriksaan akses yang spesifik
2. Pastikan semua route terlindungi dengan middleware yang sesuai
3. Frontend hanya untuk tampilan, validasi akses tetap dilakukan di backend
4. Jangan simpan permission di localStorage/sessionStorage client-side
