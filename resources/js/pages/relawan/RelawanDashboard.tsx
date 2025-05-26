import React from 'react';
import { Head } from '@inertiajs/react';

export default function RelawanDashboard() {
    return (
        <>
            <Head title="Dashboard Relawan" />

            <div className="p-6">
                <h1 className="text-3xl font-semibold text-gray-800 mb-4">Dashboard Relawan</h1>
                <p className="text-gray-600 mb-6">Selamat datang di dashboard relawan. Gunakan fitur yang tersedia untuk memantau dan memverifikasi laporan kebencanaan.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Statistik Ringkas */}
                    <div className="bg-white p-5 rounded-xl shadow border">
                        <h2 className="text-lg font-semibold text-gray-700">Total Laporan Masuk</h2>
                        <p className="text-2xl font-bold text-blue-600 mt-2">56</p>
                    </div>

                    <div className="bg-white p-5 rounded-xl shadow border">
                        <h2 className="text-lg font-semibold text-gray-700">Laporan Diverifikasi</h2>
                        <p className="text-2xl font-bold text-green-600 mt-2">35</p>
                    </div>

                    <div className="bg-white p-5 rounded-xl shadow border">
                        <h2 className="text-lg font-semibold text-gray-700">Posko Aktif</h2>
                        <p className="text-2xl font-bold text-purple-600 mt-2">12</p>
                    </div>
                </div>

                {/* Tombol Navigasi Cepat */}
                <div className="mt-8 grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    <a
                        href="/relawan/bencana-map"
                        className="block p-4 bg-blue-100 hover:bg-blue-200 rounded-lg shadow text-blue-800 font-medium"
                    >
                        🔍 Lihat Peta Bencana
                    </a>
                    <a
                        href="/relawan/evacuation-and-shelter-map"
                        className="block p-4 bg-green-100 hover:bg-green-200 rounded-lg shadow text-green-800 font-medium"
                    >
                        🛣️ Jalur & Posko Evakuasi
                    </a>
                    <a
                        href="/relawan/disaster-report-verification"
                        className="block p-4 bg-yellow-100 hover:bg-yellow-200 rounded-lg shadow text-yellow-800 font-medium"
                    >
                        ✅ Verifikasi Laporan
                    </a>
                </div>
            </div>
        </>
    );
}
