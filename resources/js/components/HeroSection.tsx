import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import React from 'react';

const HeroSection: React.FC = () => {
    // Use relative path for better hosting compatibility
    const reportLink = '/login';

    return (
        <section className="relative overflow-hidden bg-gradient-to-r from-blue-800 to-indigo-900 py-12 sm:py-16 md:py-20 lg:py-32">
            {/* Animated Background Geometric Elements */}
            <div className="absolute inset-0 z-0">
                <motion.div
                    className="absolute -top-20 -right-10 h-72 w-72 rounded-full bg-blue-400 opacity-20 blur-3xl"
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.2, 0.3, 0.2],
                    }}
                    transition={{
                        repeat: Infinity,
                        duration: 8,
                        ease: 'easeInOut',
                    }}
                ></motion.div>
                <motion.div
                    className="absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-indigo-500 opacity-20 blur-3xl"
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.2, 0.25, 0.2],
                    }}
                    transition={{
                        repeat: Infinity,
                        duration: 10,
                        ease: 'easeInOut',
                        repeatType: 'reverse',
                    }}
                ></motion.div>
                <motion.div
                    className="absolute top-1/3 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-blue-300 opacity-20 blur-3xl"
                    animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.2, 0.15, 0.2],
                    }}
                    transition={{
                        repeat: Infinity,
                        duration: 12,
                        ease: 'easeInOut',
                    }}
                ></motion.div>
                <div className="absolute inset-0 bg-[url('/img/grid-pattern.svg')] opacity-10"></div>
            </div>

            <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center justify-between gap-6 lg:flex-row">
                    <motion.div
                        className="mx-auto w-full max-w-lg text-center lg:mx-0 lg:w-1/2 lg:text-left"
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                            duration: 0.8,
                            type: 'spring',
                            stiffness: 100,
                        }}
                    >
                        <motion.div
                            className="bg-opacity-20 mb-4 inline-block rounded-full bg-blue-400 px-3 py-1 text-xs font-semibold text-blue-100 sm:mb-6 sm:px-4 sm:text-sm"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.6 }}
                        >
                            Sistem Informasi Tanggap Bencana
                        </motion.div>

                        <motion.h1
                            className="mb-4 text-3xl leading-tight font-bold tracking-tight text-white sm:mb-8 sm:text-4xl lg:text-5xl xl:text-6xl"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4, duration: 0.8 }}
                        >
                            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.8 }}>
                                Pantau dan Tanggapi Bencana Secara
                            </motion.span>
                            <motion.span
                                className="relative ml-2 block whitespace-nowrap text-blue-300 sm:ml-3 sm:inline"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.9, duration: 0.8 }}
                            >
                                <svg
                                    aria-hidden="true"
                                    viewBox="0 0 418 42"
                                    className="absolute -bottom-1 left-0 h-[0.6em] w-full fill-blue-400/30 sm:-bottom-2 md:-bottom-3"
                                >
                                    <motion.path
                                        d="M203.371.916c-26.013-2.078-76.686 1.963-124.73 9.946L67.3 12.749C35.421 18.062 18.2 21.766 6.004 25.934 1.244 27.561.828 27.778.874 28.61c.07 1.214.828 1.121 9.595-1.176 9.072-2.377 17.15-3.92 39.246-7.496C123.565 7.986 157.869 4.492 195.942 5.046c7.461.108 19.25 1.696 19.17 2.582-.107 1.183-7.874 4.31-25.75 10.366-21.992 7.45-35.43 12.534-36.701 13.884-2.173 2.308-.202 4.407 4.442 4.734 2.654.187 3.263.157 15.593-.78 35.401-2.686 57.944-3.488 88.365-3.143 46.327.526 75.721 2.23 130.788 7.584 19.787 1.924 20.814 1.98 24.557 1.332l.066-.011c1.201-.203 1.53-1.825.399-2.335-2.911-1.31-4.893-1.604-22.048-3.261-57.509-5.556-87.871-7.36-132.059-7.842-23.239-.254-33.617-.116-50.627.674-11.629.54-42.371 2.494-46.696 2.967-2.359.259 8.133-3.625 26.504-9.81 23.239-7.825 27.934-10.149 28.304-14.005.417-4.348-3.529-6-16.878-7.066Z"
                                        initial={{ pathLength: 0 }}
                                        animate={{ pathLength: 1 }}
                                        transition={{ delay: 1.1, duration: 1.5, ease: 'easeInOut' }}
                                    ></motion.path>
                                </svg>
                                <span className="relative">Real-Time</span>
                            </motion.span>
                        </motion.h1>

                        <motion.p
                            className="mb-6 text-base leading-relaxed text-blue-100 sm:mb-10 sm:text-lg md:text-xl"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.0, duration: 0.6 }}
                        >
                            Platform digital untuk monitoring, pelaporan, dan koordinasi tanggap bencana. Wujudkan Indonesia yang lebih siap dan
                            tanggap terhadap bencana.
                        </motion.p>

                        <motion.div
                            className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.2, duration: 0.6 }}
                        >
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                                <Link
                                    href="/map"
                                    className="block w-full rounded-lg bg-blue-500 px-5 py-2.5 text-center font-medium text-white shadow-lg transition-all hover:bg-blue-600 hover:shadow-blue-500/25 sm:px-6 sm:py-3"
                                >
                                    Lihat Peta Bencana
                                </Link>
                            </motion.div>

                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                                <Link
                                    href={reportLink}
                                    className="block w-full rounded-lg border border-white/30 bg-white/10 px-5 py-2.5 text-center font-medium text-white backdrop-blur-sm transition-all hover:bg-white/20 sm:px-6 sm:py-3"
                                >
                                    Laporkan Bencana
                                </Link>
                            </motion.div>
                        </motion.div>
                    </motion.div>

                    <motion.div
                        className="mt-8 w-full lg:mt-0 lg:w-1/2"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                            duration: 0.8,
                            delay: 0.3,
                            type: 'spring',
                            stiffness: 100,
                        }}
                    >
                        <div className="relative mx-auto w-full max-w-md lg:max-w-full">
                            <motion.div className="overflow-hidden rounded-lg shadow-lg" whileHover={{ y: -5 }} transition={{ duration: 0.3 }}>
                                <motion.img
                                    src="/img/white-world-map.png"
                                    alt="Peta Dunia"
                                    className="mx-auto h-auto w-full rounded-lg object-contain transition-transform duration-500 hover:scale-105 md:object-cover"
                                    initial={{ scale: 0.9 }}
                                    animate={{ scale: 1 }}
                                    transition={{
                                        duration: 0.8,
                                        delay: 0.5,
                                        ease: 'easeOut',
                                    }}
                                    whileHover={{ scale: 1.05 }}
                                />
                            </motion.div>

                            {/* Enhanced Animated Map Markers */}
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
