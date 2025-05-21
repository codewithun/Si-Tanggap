import { Head, Link } from '@inertiajs/react';
import { ArcElement, BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, LineElement, PointElement, Title, Tooltip } from 'chart.js';
import { useState } from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

export default function Data() {
    const [activeTab, setActiveTab] = useState('statistics');

    // Chart data - Statistics
    const disasterByTypeData = {
        labels: ['Banjir', 'Gempa', 'Tanah Longsor', 'Kebakaran Hutan', 'Angin Topan', 'Tsunami'],
        datasets: [
            {
                label: 'Jumlah Kejadian',
                data: [120, 38, 65, 42, 25, 10],
                backgroundColor: [
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(255, 159, 64, 0.7)',
                    'rgba(175, 35, 35, 0.7)',
                    'rgba(153, 102, 255, 0.7)',
                    'rgba(0, 128, 128, 0.7)',
                ],
                borderWidth: 1,
            },
        ],
    };

    const monthlyTrendData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'],
        datasets: [
            {
                label: '2023',
                data: [18, 25, 30, 22, 16, 12, 10, 15, 20, 24, 32, 28],
                borderColor: 'rgba(54, 162, 235, 1)',
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                tension: 0.3,
                fill: true,
            },
            {
                label: '2022',
                data: [15, 20, 25, 18, 12, 10, 8, 12, 18, 22, 28, 24],
                borderColor: 'rgba(255, 99, 132, 1)',
                backgroundColor: 'rgba(255, 99, 132, 0.1)',
                tension: 0.3,
                fill: true,
            },
        ],
    };

    const impactDistributionData = {
        labels: ['Infrastruktur', 'Perumahan', 'Pertanian', 'Kesehatan', 'Pendidikan'],
        datasets: [
            {
                data: [35, 25, 20, 10, 10],
                backgroundColor: [
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(255, 206, 86, 0.7)',
                    'rgba(75, 192, 192, 0.7)',
                    'rgba(153, 102, 255, 0.7)',
                ],
                borderWidth: 1,
            },
        ],
    };

    // Summary data
    const summaryData = [
        { id: 1, title: 'Total Kejadian', value: '300', trend: '+15%', color: 'blue' },
        { id: 2, title: 'Korban Jiwa', value: '520', trend: '+5%', color: 'red' },
        { id: 3, title: 'Rumah Rusak', value: '1,250', trend: '+8%', color: 'orange' },
        { id: 4, title: 'Kerugian Ekonomi', value: 'Rp 2.5 T', trend: '+12%', color: 'green' },
    ];

    // Download table data
    const downloadableData = [
        { id: 1, name: 'Laporan Bencana 2023 (PDF)', size: '3.5 MB', date: '2023-12-10', format: 'PDF' },
        { id: 2, name: 'Data Statistik Bencana per Provinsi', size: '2.1 MB', date: '2023-11-28', format: 'XLSX' },
        { id: 3, name: 'Peta Risiko Bencana Indonesia', size: '8.2 MB', date: '2023-10-15', format: 'SHP' },
        { id: 4, name: 'Datasheet Titik Evakuasi', size: '1.8 MB', date: '2023-09-22', format: 'CSV' },
        { id: 5, name: 'Panduan Mitigasi Bencana', size: '4.3 MB', date: '2023-08-07', format: 'PDF' },
    ];

    // API access data
    const apiDocs = [
        {
            id: 1,
            title: 'Endpoint Titik Bencana',
            url: 'api/v1/disasters',
            description: 'Mengambil data titik bencana dengan filter berdasarkan jenis, lokasi, dan waktu',
        },
        {
            id: 2,
            title: 'Endpoint Statistik',
            url: 'api/v1/statistics',
            description: 'Mengambil data statistik bencana seperti jumlah kejadian, korban, dan dampak',
        },
        {
            id: 3,
            title: 'Endpoint Zona Risiko',
            url: 'api/v1/risk-zones',
            description: 'Mengambil data zona risiko bencana berdasarkan jenis bencana dan lokasi',
        },
    ];

    return (
        <>
            <Head title="Data & Statistik - Si Tanggap" />

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
                            <Link href="/webgis/reports" className="text-gray-700 hover:text-blue-600">
                                Laporan
                            </Link>
                            <Link href="/webgis/data" className="text-blue-600">
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
                    <h1 className="mb-6 text-2xl font-bold">Data & Statistik Bencana</h1>

                    {/* Tabs */}
                    <div className="mb-6 border-b border-gray-200">
                        <ul className="-mb-px flex flex-wrap">
                            <li className="mr-2">
                                <button
                                    onClick={() => setActiveTab('statistics')}
                                    className={`inline-block px-4 py-2 text-sm font-medium ${
                                        activeTab === 'statistics'
                                            ? 'border-b-2 border-blue-600 text-blue-600'
                                            : 'text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                    }`}
                                >
                                    Statistik & Visualisasi
                                </button>
                            </li>
                            <li className="mr-2">
                                <button
                                    onClick={() => setActiveTab('download')}
                                    className={`inline-block px-4 py-2 text-sm font-medium ${
                                        activeTab === 'download'
                                            ? 'border-b-2 border-blue-600 text-blue-600'
                                            : 'text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                    }`}
                                >
                                    Unduh Data
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => setActiveTab('api')}
                                    className={`inline-block px-4 py-2 text-sm font-medium ${
                                        activeTab === 'api'
                                            ? 'border-b-2 border-blue-600 text-blue-600'
                                            : 'text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                    }`}
                                >
                                    API & Integrasi
                                </button>
                            </li>
                        </ul>
                    </div>

                    {/* Tab Content */}
                    <div className="mb-8">
                        {/* Statistics Tab */}
                        {activeTab === 'statistics' && (
                            <>
                                {/* Summary Cards */}
                                <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
                                    {summaryData.map((item) => (
                                        <div key={item.id} className="rounded-lg bg-white p-4 shadow">
                                            <h3 className="mb-1 text-sm text-gray-500">{item.title}</h3>
                                            <p className="text-2xl font-bold">{item.value}</p>
                                            <span className={`text-xs text-${item.color}-600`}>{item.trend} dari tahun lalu</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Chart Row 1 */}
                                <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <div className="rounded-lg bg-white p-4 shadow">
                                        <h3 className="mb-4 text-lg font-medium">Jumlah Bencana Berdasarkan Jenis</h3>
                                        <div className="h-80">
                                            <Bar
                                                data={disasterByTypeData}
                                                options={{
                                                    responsive: true,
                                                    maintainAspectRatio: false,
                                                    scales: {
                                                        y: {
                                                            beginAtZero: true,
                                                            title: {
                                                                display: true,
                                                                text: 'Jumlah Kejadian',
                                                            },
                                                        },
                                                    },
                                                    plugins: {
                                                        legend: { display: false },
                                                        title: { display: false },
                                                    },
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div className="rounded-lg bg-white p-4 shadow">
                                        <h3 className="mb-4 text-lg font-medium">Trend Bulanan Kejadian Bencana</h3>
                                        <div className="h-80">
                                            <Line
                                                data={monthlyTrendData}
                                                options={{
                                                    responsive: true,
                                                    maintainAspectRatio: false,
                                                    scales: {
                                                        y: {
                                                            beginAtZero: true,
                                                            title: {
                                                                display: true,
                                                                text: 'Jumlah Kejadian',
                                                            },
                                                        },
                                                    },
                                                    plugins: {
                                                        legend: { position: 'top' },
                                                        title: { display: false },
                                                    },
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Chart Row 2 */}
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                                    <div className="rounded-lg bg-white p-4 shadow">
                                        <h3 className="mb-4 text-lg font-medium">Distribusi Dampak Bencana</h3>
                                        <div className="flex h-64 items-center justify-center">
                                            <Doughnut
                                                data={impactDistributionData}
                                                options={{
                                                    responsive: true,
                                                    maintainAspectRatio: false,
                                                    plugins: {
                                                        legend: { position: 'bottom' },
                                                    },
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-span-2 rounded-lg bg-white p-4 shadow">
                                        <h3 className="mb-4 text-lg font-medium">Provinsi dengan Kejadian Bencana Tertinggi</h3>
                                        <div className="overflow-hidden">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th
                                                            scope="col"
                                                            className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
                                                        >
                                                            No
                                                        </th>
                                                        <th
                                                            scope="col"
                                                            className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
                                                        >
                                                            Provinsi
                                                        </th>
                                                        <th
                                                            scope="col"
                                                            className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
                                                        >
                                                            Jumlah Kejadian
                                                        </th>
                                                        <th
                                                            scope="col"
                                                            className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
                                                        >
                                                            Bencana Dominan
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200 bg-white">
                                                    <tr>
                                                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">1</td>
                                                        <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900">Jawa Barat</td>
                                                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">42</td>
                                                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">Banjir</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">2</td>
                                                        <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900">Jawa Tengah</td>
                                                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">38</td>
                                                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">Tanah Longsor</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">3</td>
                                                        <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900">Jawa Timur</td>
                                                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">35</td>
                                                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">Banjir</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">4</td>
                                                        <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900">
                                                            Sulawesi Selatan
                                                        </td>
                                                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">30</td>
                                                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">Banjir</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">5</td>
                                                        <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900">
                                                            Sumatera Barat
                                                        </td>
                                                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">25</td>
                                                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">Gempa</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Download Tab */}
                        {activeTab === 'download' && (
                            <div className="rounded-lg bg-white p-6 shadow">
                                <h2 className="mb-4 text-xl font-semibold">Unduh Data Bencana</h2>
                                <p className="mb-6 text-gray-600">
                                    Download data dan laporan terkait bencana dalam berbagai format untuk keperluan analisis dan penelitian.
                                </p>

                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th
                                                    scope="col"
                                                    className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
                                                >
                                                    Nama File
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
                                                >
                                                    Format
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
                                                >
                                                    Ukuran
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
                                                >
                                                    Tanggal
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="px-6 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase"
                                                >
                                                    Aksi
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 bg-white">
                                            {downloadableData.map((item) => (
                                                <tr key={item.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900">{item.name}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span
                                                            className={`inline-flex rounded-full px-2 text-xs leading-5 font-semibold ${
                                                                item.format === 'PDF'
                                                                    ? 'bg-red-100 text-red-800'
                                                                    : item.format === 'XLSX'
                                                                      ? 'bg-green-100 text-green-800'
                                                                      : item.format === 'SHP'
                                                                        ? 'bg-blue-100 text-blue-800'
                                                                        : 'bg-gray-100 text-gray-800'
                                                            }`}
                                                        >
                                                            {item.format}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">{item.size}</td>
                                                    <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">{item.date}</td>
                                                    <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                                                        <button className="flex items-center justify-end text-blue-600 hover:text-blue-900">
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                className="mr-1 h-5 w-5"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                stroke="currentColor"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                                                />
                                                            </svg>
                                                            Unduh
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="mt-8 rounded-lg bg-gray-50 p-4">
                                    <h3 className="mb-2 text-lg font-medium">Permintaan Data Khusus</h3>
                                    <p className="mb-4 text-gray-600">
                                        Jika Anda membutuhkan data yang tidak tersedia di sini, silakan ajukan permintaan data khusus.
                                    </p>
                                    <button className="rounded bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700">
                                        Ajukan Permintaan Data
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* API Tab */}
                        {activeTab === 'api' && (
                            <div className="rounded-lg bg-white p-6 shadow">
                                <h2 className="mb-4 text-xl font-semibold">API & Integrasi</h2>
                                <p className="mb-6 text-gray-600">
                                    Gunakan API Si Tanggap untuk mengintegrasikan data bencana ke dalam aplikasi atau platform Anda.
                                </p>

                                <div className="mb-8">
                                    <h3 className="mb-4 text-lg font-medium">Endpoint API</h3>
                                    <div className="space-y-4">
                                        {apiDocs.map((item) => (
                                            <div key={item.id} className="rounded-lg border border-gray-200 p-4">
                                                <h4 className="mb-1 font-medium text-blue-600">{item.title}</h4>
                                                <div className="mb-2 rounded bg-gray-100 p-2 font-mono text-sm">
                                                    https://api.sitanggap.id/{item.url}
                                                </div>
                                                <p className="text-sm text-gray-600">{item.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <div className="rounded-lg bg-gray-50 p-4">
                                        <h3 className="mb-2 text-lg font-medium">Dokumentasi API</h3>
                                        <p className="mb-4 text-gray-600">
                                            Akses dokumentasi lengkap tentang API Si Tanggap untuk integrasi yang mudah.
                                        </p>
                                        <button className="rounded bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700">
                                            Lihat Dokumentasi
                                        </button>
                                    </div>
                                    <div className="rounded-lg bg-gray-50 p-4">
                                        <h3 className="mb-2 text-lg font-medium">Dapatkan API Key</h3>
                                        <p className="mb-4 text-gray-600">
                                            Daftar untuk mendapatkan API key dan mulai mengintegrasikan data bencana.
                                        </p>
                                        <button className="rounded bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700">
                                            Daftar API Key
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
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
