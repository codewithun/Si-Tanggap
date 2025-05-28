import axios from 'axios';
import { motion } from 'framer-motion';
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

    const formatNumber = (num: number): string => {
        return new Intl.NumberFormat('id-ID').format(num);
    };

    const statItems = [
        {
            title: 'Total Bencana',
            value: stats.totalBencana,
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            ),
            color: 'from-red-400 to-red-600',
            textColor: 'text-red-600',
        },
        {
            title: 'Laporan Terverifikasi',
            value: stats.laporanTerverifikasi,
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            color: 'from-green-400 to-green-600',
            textColor: 'text-green-600',
        },
        {
            title: 'Posko Evakuasi',
            value: stats.jumlahPosko,
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                </svg>
            ),
            color: 'from-blue-400 to-blue-600',
            textColor: 'text-blue-600',
        },
    ];

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                when: 'beforeChildren',
                staggerChildren: 0.3,
                delayChildren: 0.3,
            },
        },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: 'spring', stiffness: 100 },
        },
    };

    const countAnimation = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.8,
                ease: 'easeOut',
            },
        },
    };

    return (
        <section className="bg-white py-20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    className="mb-16 text-center"
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="text-4xl font-bold tracking-tight text-gray-900">Statistik Bencana</h2>
                    <motion.div
                        className="mx-auto mt-2 h-1 w-16 rounded-full bg-blue-600"
                        initial={{ width: 0 }}
                        whileInView={{ width: '4rem' }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                    ></motion.div>
                </motion.div>

                {loading && (
                    <motion.div className="flex justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
                    </motion.div>
                )}

                {error && <div className="mb-10 rounded-lg bg-red-50 p-4 text-center text-red-600">{error}</div>}

                {!loading && !error && (
                    <motion.div
                        className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.3 }}
                    >
                        {statItems.map((item, index) => (
                            <motion.div
                                key={index}
                                className="group overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-300 hover:shadow-xl"
                                variants={itemVariants}
                                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                            >
                                <div className={`h-2 w-full bg-gradient-to-r ${item.color}`}></div>
                                <div className="p-8">
                                    <div className="mb-6 flex items-center">
                                        <motion.div
                                            className={`mr-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-50 ${item.textColor}`}
                                            whileHover={{ rotate: 360 }}
                                            transition={{ duration: 0.6 }}
                                        >
                                            {item.icon}
                                        </motion.div>
                                        <h3 className="text-xl font-semibold text-gray-700">{item.title}</h3>
                                    </div>
                                    <div className="flex items-baseline">
                                        <motion.span
                                            className={`text-4xl font-bold ${item.textColor}`}
                                            variants={countAnimation}
                                            initial={{ opacity: 0, scale: 0.5 }}
                                            whileInView={{
                                                opacity: 1,
                                                scale: 1,
                                                transition: {
                                                    type: 'spring',
                                                    stiffness: 200,
                                                    delay: 0.2 + index * 0.1,
                                                },
                                            }}
                                            viewport={{ once: true }}
                                        >
                                            {formatNumber(item.value)}
                                        </motion.span>
                                        <span className="ml-2 text-gray-500">kejadian</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>
        </section>
    );
};

export default Statistics;
