import { Link } from '@inertiajs/react';
import axios from 'axios';
import React, { useEffect, useState } from 'react';

interface Report {
    id: number;
    jenis_bencana: string;
    created_at: string;
    lokasi: string;
    status: 'menunggu' | 'diverifikasi' | 'ditolak';
    kota_kabupaten: string;
}

const RecentReports: React.FC = () => {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                setLoading(true);
                const response = await axios.get('/laporans');
                // Extract the data array from the response and get the first 5 items
                setReports(response.data.data?.slice(0, 5) || []);
                setError(null);
            } catch (err) {
                console.error('Failed to fetch reports:', err);
                setError('Gagal memuat data laporan bencana');
                // Fallback data for development/preview
                setReports([
                    {
                        id: 1,
                        jenis_bencana: 'banjir',
                        created_at: '2025-05-20',
                        lokasi: 'Jl. Kebon Jeruk No. 10',
                        status: 'diverifikasi',
                        kota_kabupaten: 'Jakarta Barat',
                    },
                    {
                        id: 2,
                        jenis_bencana: 'longsor',
                        created_at: '2025-05-19',
                        lokasi: 'Desa Sukamaju',
                        status: 'diverifikasi',
                        kota_kabupaten: 'Bogor',
                    },
                    {
                        id: 3,
                        jenis_bencana: 'kebakaran',
                        created_at: '2025-05-18',
                        lokasi: 'Kawasan Industri Pulogadung',
                        status: 'menunggu',
                        kota_kabupaten: 'Jakarta Timur',
                    },
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, []);

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'diverifikasi':
                return 'bg-green-100 text-green-800';
            case 'menunggu':
                return 'bg-yellow-100 text-yellow-800';
            case 'ditolak':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'diverifikasi':
                return 'Terverifikasi';
            case 'menunggu':
                return 'Menunggu Verifikasi';
            case 'ditolak':
                return 'Ditolak';
            default:
                return status;
        }
    };

    return (
        <section className="bg-gray-50 py-20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-16 text-center">
                    <span className="mb-2 inline-block rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-600">Laporan Terkini</span>
                    <h2 className="text-4xl font-bold tracking-tight text-gray-900">Laporan Bencana</h2>
                    <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-blue-600"></div>
                </div>

                {loading && (
                    <div className="flex justify-center">
                        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
                    </div>
                )}

                {error && <div className="mb-10 rounded-lg bg-red-50 p-4 text-center text-red-600">{error}</div>}

                <div className="mx-auto max-w-5xl overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Jenis Bencana</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Tanggal</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Lokasi</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-4 text-right text-xs font-medium tracking-wider text-gray-500 uppercase">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {reports.length > 0 ? (
                                    reports.map((report) => (
                                        <tr key={report.id} className="transition-colors hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div
                                                        className={`mr-3 h-3 w-3 rounded-full ${
                                                            report.jenis_bencana === 'banjir'
                                                                ? 'bg-blue-500'
                                                                : report.jenis_bencana === 'kebakaran'
                                                                  ? 'bg-red-500'
                                                                  : 'bg-yellow-500'
                                                        }`}
                                                    ></div>
                                                    <div className="font-medium text-gray-900 capitalize">{report.jenis_bencana}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-600">
                                                    {new Date(report.created_at).toLocaleDateString('id-ID', {
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric',
                                                    })}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-600">{report.kota_kabupaten}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(
                                                        report.status,
                                                    )}`}
                                                >
                                                    <span
                                                        className={`mr-1 h-1.5 w-1.5 rounded-full ${
                                                            report.status === 'diverifikasi'
                                                                ? 'bg-green-500'
                                                                : report.status === 'menunggu'
                                                                  ? 'bg-yellow-500'
                                                                  : 'bg-red-500'
                                                        }`}
                                                    ></span>
                                                    {getStatusLabel(report.status)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                                                <Link
                                                    href={`/laporan/${report.id}`}
                                                    className="rounded-md px-2 py-1 font-medium text-blue-600 hover:text-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:outline-none"
                                                >
                                                    Lihat Detail
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="mx-auto h-12 w-12 text-gray-300"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={1}
                                                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                                                />
                                            </svg>
                                            <p className="mt-2 font-medium">Tidak ada laporan bencana terbaru</p>
                                            <p className="mt-1 text-sm">Laporan bencana akan muncul di sini ketika ada data baru</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="mt-12 text-center">
                    <Link
                        href="/laporan"
                        className="inline-flex items-center rounded-lg bg-blue-600 px-6 py-3 font-medium text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/25"
                    >
                        Lihat Semua Laporan
                        <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path
                                fillRule="evenodd"
                                d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default RecentReports;
