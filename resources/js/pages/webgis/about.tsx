import { Head, Link } from '@inertiajs/react';

export default function About() {
    return (
        <>
            <Head title="Tentang Kami - Si Tanggap" />

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
                            <Link href="/webgis/data" className="text-gray-700 hover:text-blue-600">
                                Data
                            </Link>
                            <Link href="/webgis/about" className="text-blue-600">
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

                <main className="flex-1">
                    {/* Hero Section */}
                    <section className="bg-blue-600 py-20 text-white">
                        <div className="container mx-auto px-4 text-center">
                            <h1 className="mb-4 text-4xl font-bold">Tentang Si Tanggap</h1>
                            <p className="mx-auto max-w-3xl text-xl">
                                Platform informasi dan koordinasi tanggap bencana berbasis lokasi untuk Indonesia
                            </p>
                        </div>
                    </section>

                    {/* Mission Section */}
                    <section className="bg-white py-16">
                        <div className="container mx-auto px-4">
                            <div className="mx-auto max-w-3xl">
                                <h2 className="mb-6 text-center text-2xl font-bold">Misi Kami</h2>
                                <p className="mb-8 text-center text-lg text-gray-700">
                                    Menyediakan informasi bencana yang akurat dan real-time untuk meningkatkan kesadaran dan respons terhadap bencana
                                    alam di Indonesia.
                                </p>

                                <div className="mt-12 grid gap-8 md:grid-cols-3">
                                    <div className="text-center">
                                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-8 w-8"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            </svg>
                                        </div>
                                        <h3 className="mb-2 text-lg font-semibold">Informasi Akurat</h3>
                                        <p className="text-gray-600">Menyediakan data dan informasi bencana yang terverifikasi dan aktual</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-8 w-8"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                                                />
                                            </svg>
                                        </div>
                                        <h3 className="mb-2 text-lg font-semibold">Respons Cepat</h3>
                                        <p className="text-gray-600">Mendukung koordinasi respons bencana yang efektif dan efisien</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-8 w-8"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                                />
                                            </svg>
                                        </div>
                                        <h3 className="mb-2 text-lg font-semibold">Partisipasi Masyarakat</h3>
                                        <p className="text-gray-600">Melibatkan masyarakat dalam pelaporan dan penanganan bencana</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* About System Section */}
                    <section className="bg-gray-50 py-16">
                        <div className="container mx-auto px-4">
                            <div className="mx-auto max-w-3xl">
                                <h2 className="mb-6 text-2xl font-bold">Tentang Sistem</h2>
                                <p className="mb-6 text-gray-700">
                                    Si Tanggap adalah sistem informasi geografis (WebGIS) yang dikembangkan untuk memantau, melaporkan, dan
                                    menganalisis kejadian bencana alam di Indonesia. Platform ini menggabungkan teknologi pemetaan interaktif,
                                    analitik data, dan sistem pelaporan masyarakat untuk memberikan solusi komprehensif dalam penanganan bencana.
                                </p>
                                <p className="mb-6 text-gray-700">
                                    Dengan memanfaatkan data dari berbagai sumber resmi seperti BNPB, BMKG, dan BPBD, serta laporan dari masyarakat
                                    yang terverifikasi, Si Tanggap menyajikan informasi bencana yang akurat dan terkini. Fitur visualisasi data dan
                                    analitik memungkinkan para pemangku kepentingan untuk memahami pola dan tren bencana, sehingga dapat menyusun
                                    strategi mitigasi dan respons yang lebih efektif.
                                </p>
                                <p className="text-gray-700">
                                    Si Tanggap terus berkomitmen untuk mengembangkan platform yang dapat meningkatkan kesiapsiagaan dan ketahanan
                                    masyarakat Indonesia dalam menghadapi bencana alam.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Team Section */}
                    <section className="bg-white py-16">
                        <div className="container mx-auto px-4">
                            <h2 className="mb-12 text-center text-2xl font-bold">Tim Pengembang</h2>

                            <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-4">
                                {/* Team Member 1 */}
                                <div className="text-center">
                                    <div className="mx-auto mb-4 h-32 w-32 overflow-hidden rounded-full">
                                        <img
                                            src="https://randomuser.me/api/portraits/men/32.jpg"
                                            alt="Team Member"
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                    <h3 className="text-lg font-semibold">Budi Santoso</h3>
                                    <p className="text-gray-600">Project Manager</p>
                                </div>

                                {/* Team Member 2 */}
                                <div className="text-center">
                                    <div className="mx-auto mb-4 h-32 w-32 overflow-hidden rounded-full">
                                        <img
                                            src="https://randomuser.me/api/portraits/women/44.jpg"
                                            alt="Team Member"
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                    <h3 className="text-lg font-semibold">Dewi Anggraini</h3>
                                    <p className="text-gray-600">GIS Specialist</p>
                                </div>

                                {/* Team Member 3 */}
                                <div className="text-center">
                                    <div className="mx-auto mb-4 h-32 w-32 overflow-hidden rounded-full">
                                        <img
                                            src="https://randomuser.me/api/portraits/men/62.jpg"
                                            alt="Team Member"
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                    <h3 className="text-lg font-semibold">Adi Nugroho</h3>
                                    <p className="text-gray-600">Full-stack Developer</p>
                                </div>

                                {/* Team Member 4 */}
                                <div className="text-center">
                                    <div className="mx-auto mb-4 h-32 w-32 overflow-hidden rounded-full">
                                        <img
                                            src="https://randomuser.me/api/portraits/women/58.jpg"
                                            alt="Team Member"
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                    <h3 className="text-lg font-semibold">Siti Rahayu</h3>
                                    <p className="text-gray-600">Data Analyst</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Partners & Sponsors Section */}
                    <section className="bg-gray-50 py-16">
                        <div className="container mx-auto px-4">
                            <h2 className="mb-12 text-center text-2xl font-bold">Mitra & Sponsor</h2>

                            <div className="mx-auto grid max-w-3xl grid-cols-2 gap-8 md:grid-cols-4">
                                <div className="flex items-center justify-center rounded-lg bg-white p-4 shadow-sm">
                                    <span className="text-xl font-semibold text-gray-400">BNPB</span>
                                </div>
                                <div className="flex items-center justify-center rounded-lg bg-white p-4 shadow-sm">
                                    <span className="text-xl font-semibold text-gray-400">BMKG</span>
                                </div>
                                <div className="flex items-center justify-center rounded-lg bg-white p-4 shadow-sm">
                                    <span className="text-xl font-semibold text-gray-400">Kemendagri</span>
                                </div>
                                <div className="flex items-center justify-center rounded-lg bg-white p-4 shadow-sm">
                                    <span className="text-xl font-semibold text-gray-400">BIG</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* CTA Section */}
                    <section className="bg-blue-600 py-16 text-white">
                        <div className="container mx-auto px-4 text-center">
                            <h2 className="mb-6 text-2xl font-bold">Bergabunglah Bersama Kami</h2>
                            <p className="mx-auto mb-8 max-w-2xl text-lg">
                                Mari bersama-sama membangun ketahanan dan kesiapsiagaan dalam menghadapi bencana alam di Indonesia
                            </p>
                            <div className="flex justify-center space-x-4">
                                <Link
                                    href="/webgis/map"
                                    className="rounded-md bg-white px-6 py-3 font-medium text-blue-600 transition-colors duration-300 hover:bg-gray-100"
                                >
                                    Jelajahi Peta
                                </Link>
                                <Link
                                    href="/webgis/reports/create"
                                    className="rounded-md bg-red-600 px-6 py-3 font-medium text-white transition-colors duration-300 hover:bg-red-700"
                                >
                                    Laporkan Bencana
                                </Link>
                            </div>
                        </div>
                    </section>
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
