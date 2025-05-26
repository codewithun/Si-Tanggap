import { Link } from '@inertiajs/react';
import React from 'react';

const HeroSection: React.FC = () => {
    return (
        <section className="relative bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 py-16 text-white md:py-24">
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute inset-0 bg-black opacity-40"></div>
                {/* Background pattern or image could be added here */}
            </div>

            <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-3xl text-center">
                    <h1 className="mb-6 text-4xl font-bold md:text-5xl lg:text-6xl">Sistem Informasi Geospasial Bencana</h1>

                    <p className="mb-8 text-lg text-gray-200 md:text-xl">
                        Pantau, laporkan, dan tanggapi bencana alam secara real-time. Bersama kita wujudkan Indonesia yang tanggap bencana.
                    </p>

                    <div className="flex flex-col justify-center gap-4 sm:flex-row">
                        <Link href="/map" className="rounded-lg bg-blue-600 px-6 py-3 font-medium shadow-lg transition-colors hover:bg-blue-700">
                            Lihat Peta Risiko
                        </Link>

                        <Link
                            href="/laporan-bencana/create"
                            className="rounded-lg bg-white px-6 py-3 font-medium text-blue-900 shadow-lg transition-colors hover:bg-gray-100"
                        >
                            Laporkan Bencana
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
