import { Head, Link } from '@inertiajs/react';

export default function Landing() {
    return (
        <>
            <Head title="Si Tanggap - Sistem Informasi Tanggap Bencana">
                <link
                    rel="stylesheet"
                    href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
                    integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
                    crossOrigin=""
                />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
            </Head>

            <div className="flex min-h-screen flex-col">
                {/* Header */}
                <header className="fixed top-0 right-0 left-0 z-50 bg-white px-4 py-2 shadow-sm">
                    <div className="container mx-auto flex items-center justify-between">
                        <div className="flex items-center">
                            <Link href="/" className="flex items-center">
                                <img src="/logo.svg" alt="Si Tanggap Logo" className="mr-2 h-10 w-10" />
                                <span className="text-2xl font-bold text-blue-600">Si Tanggap</span>
                            </Link>
                        </div>

                        {/* Navigation Menu */}
                        <nav className="hidden md:flex">
                            <ul className="flex space-x-6">
                                {' '}
                                <li>
                                    <Link href="/" className="px-2 py-1 font-medium text-gray-700 hover:text-blue-600">
                                        Beranda
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/webgis/map" className="px-2 py-1 font-medium text-gray-700 hover:text-blue-600">
                                        Peta
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/webgis/reports" className="px-2 py-1 font-medium text-gray-700 hover:text-blue-600">
                                        Laporan
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/webgis/data" className="px-2 py-1 font-medium text-gray-700 hover:text-blue-600">
                                        Data
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/webgis/about" className="px-2 py-1 font-medium text-gray-700 hover:text-blue-600">
                                        Tentang Kami
                                    </Link>
                                </li>
                            </ul>
                        </nav>

                        {/* Mobile Menu Button */}
                        <div className="md:hidden">
                            <button className="flex items-center p-2 text-gray-500" aria-label="Toggle Menu">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </header>

                {/* Hero Section */}
                <section className="relative flex min-h-[90vh] items-center justify-center bg-gray-900 pt-20">
                    <div className="absolute inset-0 z-0 overflow-hidden">
                        <img
                            src="https://images.unsplash.com/photo-1602425864267-a07fe0857aba?q=80&w=1920&auto=format&fit=crop"
                            alt="Bencana Alam"
                            className="h-full w-full object-cover opacity-40"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/70 to-gray-900/90"></div>
                    </div>

                    <div className="z-10 container mx-auto px-4 text-center">
                        <h1 className="mb-6 text-4xl font-bold text-white md:text-6xl">Sistem Informasi Tanggap Bencana</h1>
                        <p className="mx-auto mb-8 max-w-3xl text-xl text-gray-300 md:text-2xl">
                            Platform pemetaan interaktif untuk pemantauan, pelaporan, dan koordinasi tanggap bencana di Indonesia
                        </p>
                        <div className="flex justify-center space-x-4">
                            <Link
                                href="/webgis/map"
                                className="flex items-center rounded-md bg-blue-600 px-8 py-3 text-lg font-medium text-white transition-colors duration-300 hover:bg-blue-700"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="mr-2 h-6 w-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                                    />
                                </svg>
                                Lihat Peta
                            </Link>
                            <Link
                                href="/webgis/reports/create"
                                className="flex items-center rounded-md bg-red-600 px-8 py-3 text-lg font-medium text-white transition-colors duration-300 hover:bg-red-700"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="mr-2 h-6 w-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                                Laporkan Bencana
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Feature Section */}
                <section className="bg-gray-50 py-20">
                    <div className="container mx-auto px-4">
                        <h2 className="mb-16 text-center text-3xl font-bold text-gray-800">Fitur Utama</h2>

                        <div className="grid gap-8 md:grid-cols-3">
                            {/* Feature 1 */}
                            <div className="transform rounded-lg bg-white p-6 shadow-lg transition duration-300 hover:scale-105">
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4"
                                        />
                                    </svg>
                                </div>
                                <h3 className="mb-2 text-center text-xl font-semibold text-gray-800">Pemetaan Interaktif</h3>
                                <p className="text-center text-gray-600">
                                    Visualisasi data bencana dengan peta interaktif lengkap dengan filter berdasarkan jenis bencana, waktu kejadian,
                                    dan lokasi.
                                </p>
                            </div>

                            {/* Feature 2 */}
                            <div className="transform rounded-lg bg-white p-6 shadow-lg transition duration-300 hover:scale-105">
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="mb-2 text-center text-xl font-semibold text-gray-800">Pelaporan Bencana</h3>
                                <p className="text-center text-gray-600">
                                    Sistem pelaporan yang memungkinkan masyarakat dan petugas untuk melaporkan kejadian bencana secara real-time.
                                </p>
                            </div>

                            {/* Feature 3 */}
                            <div className="transform rounded-lg bg-white p-6 shadow-lg transition duration-300 hover:scale-105">
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="mb-2 text-center text-xl font-semibold text-gray-800">Analitik & Statistik</h3>
                                <p className="text-center text-gray-600">
                                    Dashboard analitik yang menampilkan tren dan statistik bencana untuk membantu pengambilan keputusan.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Stats Section */}
                <section className="bg-blue-600 py-16 text-white">
                    <div className="container mx-auto px-4">
                        <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
                            <div>
                                <div className="mb-2 text-4xl font-bold">500+</div>
                                <div className="text-blue-200">Titik Bencana</div>
                            </div>
                            <div>
                                <div className="mb-2 text-4xl font-bold">34</div>
                                <div className="text-blue-200">Provinsi</div>
                            </div>
                            <div>
                                <div className="mb-2 text-4xl font-bold">10+</div>
                                <div className="text-blue-200">Jenis Bencana</div>
                            </div>
                            <div>
                                <div className="mb-2 text-4xl font-bold">24/7</div>
                                <div className="text-blue-200">Pemantauan</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="bg-gray-100 py-20">
                    <div className="container mx-auto px-4 text-center">
                        <h2 className="mb-6 text-3xl font-bold text-gray-800">Siap Menghadapi Bencana</h2>
                        <p className="mx-auto mb-8 max-w-2xl text-xl text-gray-600">
                            Akses peta bencana untuk mendapatkan informasi terkini tentang kejadian dan risiko bencana di sekitar Anda.
                        </p>
                        <Link
                            href="/webgis/map"
                            className="inline-block rounded-md bg-blue-600 px-8 py-3 text-lg font-medium text-white transition-colors duration-300 hover:bg-blue-700"
                        >
                            Jelajahi Peta Sekarang
                        </Link>
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-gray-900 py-12 text-white">
                    <div className="container mx-auto px-4">
                        <div className="grid gap-8 md:grid-cols-4">
                            <div>
                                <h3 className="mb-4 text-xl font-bold">Si Tanggap</h3>
                                <p className="text-gray-400">
                                    Sistem Informasi Tanggap Bencana yang dikembangkan untuk meningkatkan kesiapsiagaan dan respon terhadap bencana di
                                    Indonesia.
                                </p>
                            </div>
                            <div>
                                <h3 className="mb-4 text-lg font-semibold">Navigasi</h3>
                                <ul className="space-y-2">
                                    <li>
                                        {' '}
                                        <Link href="/" className="text-gray-400 hover:text-white">
                                            Beranda
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/webgis/map" className="text-gray-400 hover:text-white">
                                            Peta
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/webgis/reports" className="text-gray-400 hover:text-white">
                                            Laporan
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/webgis/data" className="text-gray-400 hover:text-white">
                                            Data
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/webgis/about" className="text-gray-400 hover:text-white">
                                            Tentang Kami
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="mb-4 text-lg font-semibold">Sumber Data</h3>
                                <ul className="space-y-2">
                                    <li>
                                        <a
                                            href="https://bnpb.go.id"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-gray-400 hover:text-white"
                                        >
                                            BNPB
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="https://bmkg.go.id"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-gray-400 hover:text-white"
                                        >
                                            BMKG
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="https://bpbd.go.id"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-gray-400 hover:text-white"
                                        >
                                            BPBD
                                        </a>
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="mb-4 text-lg font-semibold">Kontak</h3>
                                <ul className="space-y-2 text-gray-400">
                                    <li className="flex items-center">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="mr-2 h-5 w-5"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                            />
                                        </svg>
                                        info@sitanggap.id
                                    </li>
                                    <li className="flex items-center">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="mr-2 h-5 w-5"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                            />
                                        </svg>
                                        (021) 123-4567
                                    </li>
                                    <li className="flex items-center">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="mr-2 h-5 w-5"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                            />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        Jakarta, Indonesia
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className="mt-12 border-t border-gray-800 pt-8 text-center text-gray-500">
                            <p>&copy; {new Date().getFullYear()} Si Tanggap - Sistem Informasi Tanggap Bencana. All rights reserved.</p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
