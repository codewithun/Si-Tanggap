import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard Relawan',
        href: '/relawan/dashboard',
    },
];

export default function RelawanDashboard() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard Relawan" />

            <div className="p-6">
                <h1 className="mb-4 text-3xl font-semibold text-gray-800">Dashboard Relawan</h1>
                <p className="mb-6 text-gray-600">
                    Selamat datang di dashboard relawan. Gunakan fitur yang tersedia untuk memantau dan memverifikasi laporan kebencanaan.
                </p>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* Statistik Ringkas */}
                    <div className="rounded-xl border bg-white p-5 shadow">
                        <h2 className="text-lg font-semibold text-gray-700">Total Laporan Masuk</h2>
                        <p className="mt-2 text-2xl font-bold text-blue-600">56</p>
                    </div>

                    <div className="rounded-xl border bg-white p-5 shadow">
                        <h2 className="text-lg font-semibold text-gray-700">Laporan Diverifikasi</h2>
                        <p className="mt-2 text-2xl font-bold text-green-600">35</p>
                    </div>

                    <div className="rounded-xl border bg-white p-5 shadow">
                        <h2 className="text-lg font-semibold text-gray-700">Posko Aktif</h2>
                        <p className="mt-2 text-2xl font-bold text-purple-600">12</p>
                    </div>
                </div>

                {/* Tombol Navigasi Cepat */}
                <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <a href="/relawan/bencana-map" className="block rounded-lg bg-blue-100 p-4 font-medium text-blue-800 shadow hover:bg-blue-200">
                        🔍 Lihat Peta Bencana
                    </a>
                    <a
                        href="/relawan/evacuation-and-shelter-map"
                        className="block rounded-lg bg-green-100 p-4 font-medium text-green-800 shadow hover:bg-green-200"
                    >
                        🛣️ Jalur & Posko Evakuasi
                    </a>
                    <a
                        href="/relawan/disaster-report-verification"
                        className="block rounded-lg bg-yellow-100 p-4 font-medium text-yellow-800 shadow hover:bg-yellow-200"
                    >
                        ✅ Verifikasi Laporan
                    </a>
                </div>
            </div>
        </AppLayout>
    );
}
