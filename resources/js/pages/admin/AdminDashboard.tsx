import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import AdminMap from './AdminMap';
import DisasterStatistics from './DisasterStatistics';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard Admin',
        href: '/admin/dashboard',
    },
];

export default function AdminDashboard() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard Admin" />

            <div className="p-6">
                <div className="mb-6">
                    <h1 className="text-3xl font-semibold text-gray-800">Dashboard Admin</h1>
                    <p className="mt-1 text-gray-600">Kelola aplikasi WebGIS untuk tanggap bencana</p>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* Statistik Ringkas */}
                    <div className="rounded-xl border bg-white p-5 shadow">
                        <h2 className="text-lg font-semibold text-gray-700">Total Pengguna</h2>
                        <p className="mt-2 text-2xl font-bold text-blue-600">125</p>
                    </div>

                    <div className="rounded-xl border bg-white p-5 shadow">
                        <h2 className="text-lg font-semibold text-gray-700">Laporan Bencana</h2>
                        <p className="mt-2 text-2xl font-bold text-green-600">56</p>
                    </div>

                    <div className="rounded-xl border bg-white p-5 shadow">
                        <h2 className="text-lg font-semibold text-gray-700">Posko Aktif</h2>
                        <p className="mt-2 text-2xl font-bold text-purple-600">12</p>
                    </div>
                </div>

                {/* Statistik */}
                <div className="mt-8">
                    <DisasterStatistics />
                </div>

                {/* Peta */}
                <div className="mt-8">
                    <AdminMap />
                </div>

                {/* Tombol Navigasi Cepat */}
                <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    <a
                        href="/admin/evacuation-routes"
                        className="block rounded-lg bg-blue-100 p-4 font-medium text-blue-800 shadow hover:bg-blue-200"
                    >
                        🗺️ Kelola Jalur Evakuasi
                    </a>
                    <a href="/admin/shelters" className="block rounded-lg bg-green-100 p-4 font-medium text-green-800 shadow hover:bg-green-200">
                        🏠 Kelola Posko
                    </a>
                    <a href="/admin/reports" className="block rounded-lg bg-yellow-100 p-4 font-medium text-yellow-800 shadow hover:bg-yellow-200">
                        📑 Kelola Laporan Bencana
                    </a>
                    <a href="/admin/users" className="block rounded-lg bg-purple-100 p-4 font-medium text-purple-800 shadow hover:bg-purple-200">
                        👥 Manajemen Pengguna
                    </a>
                    <a href="/admin/notifications" className="block rounded-lg bg-red-100 p-4 font-medium text-red-800 shadow hover:bg-red-200">
                        🔔 Kirim Notifikasi
                    </a>
                </div>
            </div>
        </AppLayout>
    );
}
