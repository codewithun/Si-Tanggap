import axios from 'axios';
import React, { useEffect, useState } from 'react';

interface StatisticsData {
    totalBencana: number;
    laporanTerverifikasi: number;
    jumlahPosko: number;
}

const Statistics: React.FC = () => {
    const [stats, setStats] = useState<StatisticsData>({
        totalBencana: 0,
        laporanTerverifikasi: 0,
        jumlahPosko: 0,
    });
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStatistics = async () => {
            try {
                setLoading(true);
                const response = await axios.get('/statistik-bencana');

                // Transform API response to match the interface
                setStats({
                    totalBencana: response.data.totalBencana || 0,
                    laporanTerverifikasi: response.data.totalLaporanVerified || 0,
                    jumlahPosko: response.data.totalPosko || 0,
                });

                setError(null);
            } catch (err) {
                console.error('Failed to fetch statistics:', err);
                setError('Gagal memuat data statistik');
                // Fallback data for development/preview
                setStats({
                    totalBencana: 125,
                    laporanTerverifikasi: 98,
                    jumlahPosko: 43,
                });
            } finally {
                setLoading(false);
            }
        };

        fetchStatistics();
    }, []);

    const statItems = [
        {
            title: 'Total Bencana',
            value: stats.totalBencana,
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            ),
        },
        {
            title: 'Laporan Terverifikasi',
            value: stats.laporanTerverifikasi,
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
        },
        {
            title: 'Posko Evakuasi',
            value: stats.jumlahPosko,
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                </svg>
            ),
        },
    ];

    return (
        <section className="bg-gray-50 py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-12 text-center">
                    <h2 className="text-3xl font-bold text-gray-900">Statistik Bencana</h2>
                    <p className="mt-4 text-lg text-gray-600">Data bencana terkini di seluruh Indonesia</p>
                </div>

                {loading && (
                    <div className="flex justify-center">
                        <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                )}

                {error && <div className="mb-6 text-center text-red-500">{error}</div>}

                <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                    {statItems.map((item, index) => (
                        <div key={index} className="rounded-xl bg-white p-6 shadow-md transition-transform hover:scale-105">
                            <div className="mb-4 flex items-center justify-between">
                                <div className="rounded-full bg-gray-100 p-3">{item.icon}</div>
                                <span className="text-4xl font-bold text-gray-800">{item.value}</span>
                            </div>
                            <h3 className="text-xl font-medium text-gray-700">{item.title}</h3>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Statistics;
