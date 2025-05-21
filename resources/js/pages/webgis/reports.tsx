import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';

export default function Reports() {
    const [reports] = useState([
        { id: 1, disasterType: 'Banjir', location: 'Jakarta Pusat, DKI Jakarta', date: '2023-01-15', status: 'Terverifikasi' },
        { id: 2, disasterType: 'Gempa', location: 'Sleman, DI Yogyakarta', date: '2023-02-22', status: 'Menunggu Verifikasi' },
        { id: 3, disasterType: 'Tanah Longsor', location: 'Bandung, Jawa Barat', date: '2023-03-10', status: 'Terverifikasi' },
        { id: 4, disasterType: 'Kebakaran Hutan', location: 'Palangka Raya, Kalimantan Tengah', date: '2023-08-05', status: 'Terverifikasi' },
        { id: 5, disasterType: 'Banjir', location: 'Surabaya, Jawa Timur', date: '2023-02-10', status: 'Ditolak' },
    ]);

    const [filters, setFilters] = useState({
        disasterType: '',
        status: '',
        search: '',
    });

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const filteredReports = reports.filter((report) => {
        const matchesType = filters.disasterType ? report.disasterType === filters.disasterType : true;
        const matchesStatus = filters.status ? report.status === filters.status : true;
        const matchesSearch = filters.search
            ? report.location.toLowerCase().includes(filters.search.toLowerCase()) ||
              report.disasterType.toLowerCase().includes(filters.search.toLowerCase())
            : true;

        return matchesType && matchesStatus && matchesSearch;
    });

    return (
        <>
            <Head title="Laporan Bencana - Si Tanggap" />

            <div className="flex min-h-screen flex-col">
                {/* Header */}
                <header className="z-10 bg-white px-4 py-2 shadow-sm">
                    <div className="container mx-auto flex items-center justify-between">
                        <div className="flex items-center">
                            <Link href="/webgis" className="flex items-center">
                                <img src="/logo.svg" alt="Si Tanggap Logo" className="mr-2 h-8 w-8" />
                                <span className="text-xl font-bold text-blue-600">Si Tanggap</span>
                            </Link>
                        </div>

                        <div className="hidden items-center space-x-4 md:flex">
                            {/* Navigation links */}
                            <Link href="/webgis" className="text-gray-700 hover:text-blue-600">
                                Beranda
                            </Link>
                            <Link href="/webgis/map" className="text-gray-700 hover:text-blue-600">
                                Peta
                            </Link>
                            <Link href="/webgis/reports" className="text-blue-600">
                                Laporan
                            </Link>
                            <Link href="/webgis/data" className="text-gray-700 hover:text-blue-600">
                                Data
                            </Link>
                            <Link href="/webgis/about" className="text-gray-700 hover:text-blue-600">
                                Tentang
                            </Link>
                        </div>

                        {/* Mobile menu button */}
                        <button className="text-gray-500 md:hidden">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </header>

                <main className="container mx-auto flex-1 px-4 py-8">
                    <div className="mb-6 flex items-center justify-between">
                        <h1 className="text-2xl font-bold">Laporan Bencana</h1>
                        <Link
                            href="/webgis/reports/create"
                            className="flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-300 hover:bg-blue-700"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Laporkan Bencana
                        </Link>
                    </div>

                    {/* Filters */}
                    <div className="mb-6 rounded-lg bg-white p-4 shadow">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Jenis Bencana</label>
                                <select
                                    name="disasterType"
                                    value={filters.disasterType}
                                    onChange={handleFilterChange}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                >
                                    <option value="">Semua Jenis</option>
                                    <option value="Banjir">Banjir</option>
                                    <option value="Gempa">Gempa</option>
                                    <option value="Tanah Longsor">Tanah Longsor</option>
                                    <option value="Kebakaran Hutan">Kebakaran Hutan</option>
                                </select>
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
                                <select
                                    name="status"
                                    value={filters.status}
                                    onChange={handleFilterChange}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                >
                                    <option value="">Semua Status</option>
                                    <option value="Terverifikasi">Terverifikasi</option>
                                    <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
                                    <option value="Ditolak">Ditolak</option>
                                </select>
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Cari</label>
                                <input
                                    type="text"
                                    name="search"
                                    value={filters.search}
                                    onChange={handleFilterChange}
                                    placeholder="Cari lokasi atau jenis bencana..."
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Reports Table */}
                    <div className="overflow-hidden rounded-lg bg-white shadow">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                        No.
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                        Jenis Bencana
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                        Lokasi
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                        Tanggal
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                        Status
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {filteredReports.length > 0 ? (
                                    filteredReports.map((report, index) => (
                                        <tr key={report.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">{index + 1}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <span
                                                        className="mr-2 inline-block h-3 w-3 rounded-full"
                                                        style={{
                                                            backgroundColor:
                                                                report.disasterType === 'Banjir'
                                                                    ? 'blue'
                                                                    : report.disasterType === 'Gempa'
                                                                      ? 'red'
                                                                      : report.disasterType === 'Tanah Longsor'
                                                                        ? 'orange'
                                                                        : 'darkred',
                                                        }}
                                                    ></span>
                                                    <span className="text-sm font-medium text-gray-900">{report.disasterType}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">{report.location}</td>
                                            <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">{report.date}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`inline-flex rounded-full px-2 text-xs leading-5 font-semibold ${
                                                        report.status === 'Terverifikasi'
                                                            ? 'bg-green-100 text-green-800'
                                                            : report.status === 'Menunggu Verifikasi'
                                                              ? 'bg-yellow-100 text-yellow-800'
                                                              : 'bg-red-100 text-red-800'
                                                    }`}
                                                >
                                                    {report.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                                                <Link href={`/webgis/reports/${report.id}`} className="mr-3 text-blue-600 hover:text-blue-900">
                                                    Detail
                                                </Link>
                                                <Link href={`/webgis/map?report=${report.id}`} className="text-green-600 hover:text-green-900">
                                                    Lihat di Peta
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                                            Tidak ada laporan yang ditemukan
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </main>

                {/* Footer */}
                <footer className="bg-gray-900 py-8 text-white">
                    <div className="container mx-auto px-4">
                        <div className="flex flex-col justify-between md:flex-row">
                            <div className="mb-4 md:mb-0">
                                <h3 className="mb-2 text-lg font-semibold">Si Tanggap</h3>
                                <p className="text-sm text-gray-400">Sistem Informasi Tanggap Bencana</p>
                            </div>
                            <div className="flex space-x-4">
                                <Link href="/webgis" className="text-gray-400 hover:text-white">
                                    Beranda
                                </Link>
                                <Link href="/webgis/map" className="text-gray-400 hover:text-white">
                                    Peta
                                </Link>
                                <Link href="/webgis/reports" className="text-gray-400 hover:text-white">
                                    Laporan
                                </Link>
                                <Link href="/webgis/data" className="text-gray-400 hover:text-white">
                                    Data
                                </Link>
                                <Link href="/webgis/about" className="text-gray-400 hover:text-white">
                                    Tentang Kami
                                </Link>
                            </div>
                        </div>
                        <div className="mt-8 border-t border-gray-800 pt-6 text-center text-sm text-gray-500">
                            <p>&copy; {new Date().getFullYear()} Si Tanggap - Sistem Informasi Tanggap Bencana. All rights reserved.</p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
