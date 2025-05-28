import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';

const AboutSection: React.FC = () => {
    const [showBackToTop, setShowBackToTop] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            // Show button when user scrolls down 500px
            if (window.scrollY > 500) {
                setShowBackToTop(true);
            } else {
                setShowBackToTop(false);
            }
        };

        window.addEventListener('scroll', handleScroll);

        // Clean up the event listener
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    // Animation variants
    const fadeInUp = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
            },
        },
    };

    return (
        <section className="relative overflow-hidden bg-gradient-to-tr from-blue-50 to-white py-24">
            {/* Background decorative elements with animation */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <motion.div
                    className="absolute top-10 -left-10 h-64 w-64 rounded-full bg-blue-100 opacity-20"
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
                    className="absolute -right-20 -bottom-20 h-96 w-96 rounded-full bg-green-100 opacity-20"
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
                <motion.svg
                    className="absolute top-1/4 right-0 h-auto w-96 text-blue-50"
                    fill="currentColor"
                    viewBox="0 0 200 200"
                    animate={{
                        rotate: [0, 5, 0, -5, 0],
                    }}
                    transition={{
                        repeat: Infinity,
                        duration: 20,
                        ease: 'easeInOut',
                    }}
                >
                    <path
                        d="M47.1,-57.8C59,-43.4,65,-26.1,70.7,-6.5C76.5,13,82,34.8,73.9,48.5C65.7,62.3,43.9,68.1,23.1,73.5C2.4,79,-17.5,84.1,-35.3,78.5C-53,72.9,-68.8,56.7,-75.8,37.9C-82.8,19,-81,-2.5,-75.1,-22.8C-69.2,-43,-59.2,-62,-44.2,-75.8C-29.2,-89.5,-9.2,-97.9,5,-93.7C19.1,-89.6,35.2,-72.1,47.1,-57.8Z"
                        transform="translate(100 100)"
                    />
                </motion.svg>
            </div>

            <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section header with animation */}
                <motion.div
                    className="mx-auto mb-16 max-w-lg text-center"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    variants={fadeInUp}
                >
                    <motion.span
                        className="mb-3 inline-flex items-center rounded-full bg-blue-100 px-4 py-1.5 text-xs font-semibold tracking-wider text-blue-700 uppercase"
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="mr-1.5 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                clipRule="evenodd"
                            />
                        </svg>
                        Tentang Kami
                    </motion.span>
                    <motion.h2
                        className="mt-2 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                    >
                        Membangun Indonesia yang <span className="text-blue-600">Tanggap Bencana</span>
                    </motion.h2>
                </motion.div>

                {/* Two-column layout with animations */}
                <motion.div
                    className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2"
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.1 }}
                >
                    {/* Left column - About text */}
                    <motion.div className="relative" variants={fadeInUp} transition={{ duration: 0.6 }}>
                        <motion.div
                            className="absolute -top-8 -left-8 h-20 w-20 rounded-full bg-yellow-200 opacity-20"
                            animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.2, 0.3, 0.2],
                            }}
                            transition={{
                                repeat: Infinity,
                                duration: 4,
                            }}
                        ></motion.div>
                        <motion.div
                            className="relative space-y-6 rounded-2xl bg-white p-8 shadow-lg sm:p-10"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3, duration: 0.6 }}
                            whileHover={{ y: -5 }}
                        >
                            <div className="flex items-center">
                                <motion.div
                                    className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600"
                                    whileHover={{ rotate: 360 }}
                                    transition={{ duration: 0.6 }}
                                >
                                    <svg
                                        className="h-6 w-6 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
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
                                </motion.div>
                                <h3 className="text-2xl font-bold text-gray-900">GeoSiga</h3>
                            </div>

                            {/* Content with staggered fade in */}
                            <motion.p
                                className="text-lg leading-relaxed text-gray-700"
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.4 }}
                            >
                                <span className="font-bold text-blue-700">GeoSiaga</span> adalah platform Sistem Informasi Geospasial Bencana yang
                                bertujuan untuk membantu masyarakat dan lembaga terkait dalam memantau, melaporkan, dan menangani bencana alam di
                                seluruh Indonesia secara real-time.
                            </motion.p>

                            <motion.p
                                className="text-lg leading-relaxed text-gray-700"
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.5 }}
                            >
                                Aplikasi ini menyediakan data spasial berupa peta interaktif yang menampilkan titik-titik bencana, jalur evakuasi, dan
                                lokasi posko bantuan.
                            </motion.p>

                            <motion.div
                                className="rounded-lg bg-blue-50 p-4"
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.6 }}
                            >
                                <p className="text-sm font-medium text-blue-700">
                                    "Dengan adanya GeoSiaga, diharapkan dapat mempercepat proses penanganan bencana dan meningkatkan kesadaran
                                    masyarakat terhadap mitigasi bencana."
                                </p>
                            </motion.div>

                            <motion.div
                                className="flex gap-4"
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.7 }}
                            >
                                {/* Social media icons with hover effects */}
                                <motion.a
                                    href="#"
                                    className="flex items-center justify-center rounded-full bg-gray-100 p-3 text-gray-600 transition-colors hover:bg-blue-600 hover:text-white"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                                    </svg>
                                </motion.a>
                                <motion.a
                                    href="#"
                                    className="flex items-center justify-center rounded-full bg-gray-100 p-3 text-gray-600 transition-colors hover:bg-blue-600 hover:text-white"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                                    </svg>
                                </motion.a>
                                <motion.a
                                    href="#"
                                    className="flex items-center justify-center rounded-full bg-gray-100 p-3 text-gray-600 transition-colors hover:bg-blue-600 hover:text-white"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
                                    </svg>
                                </motion.a>
                            </motion.div>
                        </motion.div>
                    </motion.div>

                    {/* Right column - Stats and contact */}
                    <motion.div className="space-y-6" variants={staggerContainer}>
                        {/* Staggered cards with contact info */}
                        <motion.div
                            className="relative ml-0 rounded-2xl bg-white p-6 shadow-lg lg:ml-6"
                            variants={fadeInUp}
                            transition={{ duration: 0.5 }}
                            whileHover={{ y: -5 }}
                        >
                            <div className="flex items-start space-x-4">
                                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Kontak Kami</h3>
                                    <p className="mt-1 text-gray-600">info@sitanggap.id</p>
                                    <p className="text-gray-600">+62 21 1234 5678</p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            className="relative ml-0 rounded-2xl bg-white p-6 shadow-lg lg:ml-12"
                            variants={fadeInUp}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            whileHover={{ y: -5 }}
                        >
                            <div className="flex items-start space-x-4">
                                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                        />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Alamat Kantor</h3>
                                    <p className="mt-1 text-gray-600">Jl. Tanggap Bencana No. 15</p>
                                    <p className="text-gray-600">Jakarta, Indonesia 12345</p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            className="relative ml-0 rounded-2xl bg-white p-6 shadow-lg lg:ml-6"
                            variants={fadeInUp}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            whileHover={{ y: -5 }}
                        >
                            <div className="flex items-start space-x-4">
                                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Bantuan 24/7</h3>
                                    <p className="mt-1 text-gray-600">Support: support@sitanggap.id</p>
                                    <p className="text-gray-600">Darurat: 119</p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Stats in a card with number counter animation */}
                        <motion.div
                            className="relative ml-0 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 p-6 text-white shadow-lg lg:ml-0"
                            variants={fadeInUp}
                            transition={{ duration: 0.5, delay: 0.6 }}
                            whileHover={{ scale: 1.02 }}
                        >
                            <h3 className="mb-4 text-lg font-semibold">Dampak GeoSiaga</h3>
                            <div className="grid grid-cols-2 gap-4">
                                {/* Animated stats */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.7 }}
                                >
                                    <motion.div
                                        className="text-2xl font-bold"
                                        initial={{ opacity: 0 }}
                                        whileInView={{ opacity: 1 }}
                                        viewport={{ once: true }}
                                        transition={{
                                            delay: 0.8,
                                            type: 'spring',
                                            stiffness: 100,
                                        }}
                                    >
                                        100+
                                    </motion.div>
                                    <div className="text-sm text-blue-100">Titik Bencana</div>
                                </motion.div>
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.7 }}
                                >
                                    <motion.div
                                        className="text-2xl font-bold"
                                        initial={{ opacity: 0 }}
                                        whileInView={{ opacity: 1 }}
                                        viewport={{ once: true }}
                                        transition={{
                                            delay: 0.8,
                                            type: 'spring',
                                            stiffness: 100,
                                        }}
                                    >
                                        24/7
                                    </motion.div>
                                    <div className="text-sm text-blue-100">Respons dan Data</div>
                                </motion.div>
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.7 }}
                                >
                                    <motion.div
                                        className="text-2xl font-bold"
                                        initial={{ opacity: 0 }}
                                        whileInView={{ opacity: 1 }}
                                        viewport={{ once: true }}
                                        transition={{
                                            delay: 0.8,
                                            type: 'spring',
                                            stiffness: 100,
                                        }}
                                    >
                                        80%
                                    </motion.div>
                                    <div className="text-sm text-blue-100">Real Time Monitoring</div>
                                </motion.div>
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.7 }}
                                >
                                    <motion.div
                                        className="text-2xl font-bold"
                                        initial={{ opacity: 0 }}
                                        whileInView={{ opacity: 1 }}
                                        viewport={{ once: true }}
                                        transition={{
                                            delay: 0.8,
                                            type: 'spring',
                                            stiffness: 100,
                                        }}
                                    >
                                        100+
                                    </motion.div>
                                    <div className="text-sm text-blue-100">Pengguna</div>
                                </motion.div>
                            </div>
                        </motion.div>
                    </motion.div>
                </motion.div>

                {/* Call to action banner */}
                <motion.div
                    className="mx-auto mt-24 max-w-5xl overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 shadow-xl"
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                >
                    <div className="px-8 py-12 text-center sm:px-12">
                        <motion.h2
                            className="text-3xl font-bold text-white sm:text-4xl"
                            initial={{ opacity: 0, y: -20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                        >
                            Siap Bergabung Dengan GeoSiaga?
                        </motion.h2>
                        <motion.p
                            className="mx-auto mt-4 max-w-xl text-lg text-blue-100"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                        >
                            Jadilah bagian dari komunitas yang peduli terhadap penanggulangan bencana di Indonesia.
                        </motion.p>
                        <motion.div
                            className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4 }}
                        >
                            <motion.a
                                href="#"
                                className="rounded-lg border-2 border-white bg-white px-6 py-3 font-medium text-blue-600 transition-colors hover:bg-transparent hover:text-white"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Daftar Sekarang
                            </motion.a>
                        </motion.div>
                    </div>
                </motion.div>
            </div>

            <footer className="relative mt-24 border-t border-gray-200 bg-white">
                <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
                    <div className="flex flex-wrap justify-between">
                        {/* Company info */}
                        <div className="mb-8 w-full md:mb-0 md:w-1/4">
                            <div className="flex items-center gap-2 mb-4">
                                <img src="/img/logo.png" alt="GeoSiaga Logo" className="h-8 w-auto" />
                                <h3 className="text-lg font-bold">
                                    <span className="text-black">Geo</span>
                                    <span className="text-blue-400">Siaga</span>
                                </h3>
                            </div>
                            <p className="text-gray-600">Platform digital untuk monitoring, pelaporan, dan koordinasi tanggap bencana.</p>
                        </div>

                        {/* Space between first and second column */}
                        <div className="hidden w-1/12 md:block"></div>

                        {/* Platform links */}
                        <div className="mb-8 w-1/2 md:mb-0 md:w-1/6">
                            <h3 className="mb-4 text-sm font-bold text-gray-500 uppercase">PLATFORM</h3>
                            <ul className="space-y-2">
                                <li>
                                    <a href="#" className="text-gray-600 hover:text-blue-600">
                                        Beranda
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-gray-600 hover:text-blue-600">
                                        Fitur
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-gray-600 hover:text-blue-600">
                                        Pengguna
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-gray-600 hover:text-blue-600">
                                        Statistik
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-gray-600 hover:text-blue-600">
                                        Berita
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-gray-600 hover:text-blue-600">
                                        Tentang Kami
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* Social links */}
                        <div className="mb-8 w-1/2 md:mb-0 md:w-1/6">
                            <h3 className="mb-4 text-sm font-bold text-gray-500 uppercase">IKUTI KAMI</h3>
                            <div className="flex space-x-4">
                                <a href="#" className="text-gray-500 hover:text-blue-600">
                                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                                    </svg>
                                </a>
                                <a href="#" className="text-gray-500 hover:text-blue-600">
                                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                                    </svg>
                                </a>
                                <a href="#" className="text-gray-500 hover:text-blue-600">
                                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
                                    </svg>
                                </a>
                            </div>
                        </div>

                        {/* Image column */}
                        <div className="hidden md:block md:w-1/4">
                            <div className="flex justify-end">
                                <img src="/img/image1.png" alt="Person working on laptop" className="h-60 scale-130 object-contain" />
                            </div>
                        </div>
                    </div>

                    <div className="mt-10 border-t border-gray-100 pt-8">
                        <p className="text-center text-sm text-gray-500">© 2025 GeoSiaga. Hak Cipta Dilindungi.</p>
                    </div>
                </div>
            </footer>

            {/* Back to Top Button with animation */}
            <AnimatePresence>
                {showBackToTop && (
                    <motion.button
                        onClick={scrollToTop}
                        className="fixed right-8 bottom-8 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-blue-500/25 focus:outline-none"
                        aria-label="Back to top"
                        initial={{ opacity: 0, scale: 0, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0, y: 20 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                        </svg>
                    </motion.button>
                )}
            </AnimatePresence>
        </section>
    );
};

export default AboutSection;
