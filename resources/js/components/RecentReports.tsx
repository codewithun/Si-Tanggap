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
        <section className="bg-white py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-12 text-center">
                    <h2 className="text-3xl font-bold text-gray-900">Laporan Bencana Terbaru</h2>
                    <p className="mt-4 text-lg text-gray-600">Informasi terkini mengenai kejadian bencana di Indonesia</p>
                </div>

                {loading && (
                    <div className="flex justify-center">
                        <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                )}

                {error && <div className="mb-6 text-center text-red-500">{error}</div>}

                <div className="overflow-x-auto">
                    <table className="min-w-full overflow-hidden rounded-lg border border-gray-200 bg-white">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Jenis Bencana</th>
                                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Tanggal</th>
                                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Lokasi</th>
                                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {reports.length > 0 ? (
                                reports.map((report) => (
                                    <tr key={report.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-medium text-gray-900">{report.jenis_bencana}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">
                                                {new Date(report.created_at).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric',
                                                })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">{report.kota_kabupaten}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`inline-flex rounded-full px-2 text-xs leading-5 font-semibold ${getStatusBadgeClass(report.status)}`}
                                            >
                                                {getStatusLabel(report.status)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                                            <Link href={`/laporan/${report.id}`} className="text-blue-600 hover:text-blue-900">
                                                Detail
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                                        Tidak ada laporan bencana terbaru
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="mt-8 text-center">
                    <Link
                        href="/laporan"
                        className="inline-flex items-center rounded-md border border-blue-600 px-4 py-2 text-blue-600 transition-colors hover:bg-blue-600 hover:text-white"
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
