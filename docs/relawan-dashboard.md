# Panel Relawan (Volunteer Dashboard)

Dokumen ini menjelaskan implementasi Panel Relawan untuk sistem WebGIS kebencanaan Si-Tanggap.

## Struktur Komponen

Semua komponen untuk Panel Relawan berada di direktori `resources/js/pages/relawan/`:

1. **BencanaMap.tsx** - Komponen untuk menampilkan peta titik bencana menggunakan React Leaflet
2. **EvacuationAndShelterMap.tsx** - Komponen untuk menampilkan peta jalur evakuasi dan posko
3. **AddEvacuationAndShelter.tsx** - Komponen form interaktif untuk menambahkan jalur evakuasi dan posko baru
4. **DisasterReportVerification.tsx** - Komponen untuk verifikasi laporan bencana dari masyarakat
5. **RelawanDashboard.tsx** - Komponen utama yang mengintegrasikan semua fitur relawan
6. **index.ts** - File indeks untuk mengekspor semua komponen relawan

## Fitur Utama

### 1. Peta Titik Bencana

- Menampilkan marker dari API `/api/laporans`
- Info window berisi jenis bencana, tanggal, dan tingkat risiko

### 2. Peta Jalur Evakuasi & Posko

- Menampilkan polyline jalur evakuasi dan marker lokasi posko
- Data diambil dari API `/api/jalur-evakuasi` dan `/api/poskos`
- Info window berisi nama posko, kapasitas, dan ketersediaan

### 3. Form Penambahan Jalur Evakuasi & Posko

- Form interaktif peta untuk menandai titik jalur evakuasi
- Form untuk menambahkan data posko evakuasi
- Submit data ke API `/api/jalur-evakuasi` dan `/api/poskos`
- Validasi input dan notifikasi untuk sukses/gagal

### 4. Verifikasi Laporan Bencana

- Menampilkan daftar laporan yang belum diverifikasi dari API `/api/laporans`
- Detail laporan berisi gambar, lokasi, dan deskripsi
- Tombol untuk verifikasi/tolak laporan yang mengirim request ke API `/api/laporans/:id/verify` atau `/api/laporans/:id/reject`

## Teknologi yang Digunakan

- ReactJS untuk komponen UI
- TailwindCSS untuk styling
- Axios untuk request API
- React Leaflet untuk peta interaktif
- React-Hot-Toast untuk notifikasi

## Penggunaan

Relawan dapat mengakses Panel Relawan melalui route `/relawan/dashboard` setelah login.

## Catatan Implementasi

- Navigasi dan akses menu Panel Relawan hanya tersedia untuk pengguna dengan role 'relawan'
- Semua komponen menggunakan API yang sudah ada di backend Laravel
- Semua form memiliki validasi dan memberikan feedback kepada pengguna
