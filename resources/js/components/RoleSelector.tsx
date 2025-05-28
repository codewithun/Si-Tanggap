import { motion } from 'framer-motion';
import React, { useState } from 'react';

interface RoleSelectorProps {
    className?: string;
}

const RoleSelector: React.FC<RoleSelectorProps> = ({ className = '' }) => {
    const [selectedRole, setSelectedRole] = useState<string | null>(null);

    const roles = [
        {
            id: 'masyarakat',
            name: 'Masyarakat',
            description: 'Dapatkan informasi bencana terbaru',
            capabilities: [
                'Melihat informasi bencana secara real-time',
                'Melaporkan kejadian bencana di sekitar',
                'Menerima notifikasi peringatan dini',
                'Mengakses informasi lokasi pengungsian',
                'Melihat rute evakuasi terdekat',
            ],
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="mx-auto h-8 w-8 text-blue-700">
                    <path
                        fillRule="evenodd"
                        d="M8.25 6.75a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0zM15.75 9.75a3 3 0 116 0 3 3 0 01-6 0zM2.25 9.75a3 3 0 116 0 3 3 0 01-6 0zM6.31 15.117A6.745 6.745 0 0112 12a6.745 6.745 0 016.709 7.498.75.75 0 01-.372.568A12.696 12.696 0 0112 21.75c-2.305 0-4.47-.612-6.337-1.684a.75.75 0 01-.372-.568 6.787 6.787 0 011.019-4.38z"
                        clipRule="evenodd"
                    />
                    <path d="M5.082 14.254a8.287 8.287 0 00-1.308 5.135 9.687 9.687 0 01-1.764-.44l-.115-.04a.563.563 0 01-.373-.487l-.01-.121a3.75 3.75 0 013.57-4.047zM20.226 19.389a8.287 8.287 0 00-1.308-5.135 3.75 3.75 0 013.57 4.047l-.01.121a.563.563 0 01-.373.486l-.115.04c-.567.2-1.156.349-1.764.441z" />
                </svg>
            ),
        },
        {
            id: 'relawan',
            name: 'Relawan',
            description: 'Ambil keputusan cepat dengan informasi real-time',
            capabilities: [
                'Berkoordinasi dengan tim tanggap bencana',
                'Memberikan bantuan langsung di lokasi bencana',
                'Mengelola distribusi bantuan dan logistik',
                'Melakukan verifikasi laporan bencana',
                'Membantu evakuasi korban bencana',
            ],
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="mx-auto h-8 w-8 text-blue-700">
                    <path d="M4.5 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM14.25 8.625a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0zM1.5 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM17.25 19.128l-.001.144a2.25 2.25 0 01-.233.96 10.088 10.088 0 005.06-1.01.75.75 0 00.42-.643 4.875 4.875 0 00-6.957-4.611 8.586 8.586 0 011.71 5.157v.003z" />
                </svg>
            ),
        },
    ];

    return (
        <section className={`bg-white py-20 ${className}`}>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    className="mb-16 text-center"
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-4xl font-bold text-gray-900">
                        <motion.span
                            className="relative inline-block"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            viewport={{ once: true }}
                        >
                            Pilih Peran Anda
                            <motion.span
                                className="absolute bottom-0 left-0 h-1 w-full origin-left bg-blue-500"
                                style={{ bottom: '-9px' }}
                                initial={{ scaleX: 0 }}
                                whileInView={{ scaleX: 1 }}
                                transition={{ delay: 0.5, duration: 0.5 }}
                                viewport={{ once: true }}
                            ></motion.span>
                        </motion.span>
                    </h2>
                    <motion.p
                        className="mx-auto mt-3 max-w-2xl text-lg text-gray-600"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        viewport={{ once: true }}
                    >
                        Akses fitur yang disesuaikan untuk kebutuhan Anda
                    </motion.p>
                </motion.div>

                <motion.div
                    className="mx-auto max-w-6xl"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
                        {roles.map((role, index) => (
                            <motion.div
                                key={role.id}
                                className={`group relative cursor-pointer overflow-hidden rounded-lg border-2 bg-white p-8 transition-all duration-300 ${
                                    selectedRole === role.id
                                        ? 'border-blue-500 shadow-lg shadow-blue-100'
                                        : 'border-gray-100 shadow-sm hover:border-blue-200 hover:shadow-md'
                                }`}
                                onClick={() => setSelectedRole(role.id)}
                                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.3 + index * 0.2 }}
                                whileHover={{
                                    scale: 1.02,
                                    transition: { duration: 0.2 },
                                }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {/* Minimalist corner accent */}
                                <div className="absolute top-0 right-0 h-16 w-16">
                                    <div className="absolute top-0 right-0 h-full w-full overflow-hidden">
                                        <motion.div
                                            className={`absolute top-0 right-0 h-2 w-2 translate-x-1/2 -translate-y-1/2 transform rounded-full ${
                                                selectedRole === role.id ? 'bg-blue-500' : 'bg-blue-200'
                                            } transition-all duration-300`}
                                            animate={
                                                selectedRole === role.id ? { scale: [1, 1.5, 1], opacity: [1, 0.8, 1] } : { scale: 1, opacity: 1 }
                                            }
                                            transition={{
                                                repeat: selectedRole === role.id ? Infinity : 0,
                                                duration: 2,
                                            }}
                                        ></motion.div>
                                    </div>
                                </div>

                                <div className="relative mb-6 flex items-start space-x-5">
                                    <motion.div
                                        className={`flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                                            selectedRole === role.id ? 'bg-blue-100 ring-4 ring-blue-50' : 'bg-gray-50 group-hover:bg-blue-50'
                                        }`}
                                        whileHover={{ rotate: 10 }}
                                        animate={selectedRole === role.id ? { scale: [1, 1.1, 1] } : { scale: 1 }}
                                        transition={{ duration: 0.5 }}
                                    >
                                        {role.icon}
                                    </motion.div>
                                    <div>
                                        <h3 className="mb-0.5 text-xl font-bold text-gray-900">{role.name}</h3>
                                        <p className="text-gray-600">{role.description}</p>
                                    </div>
                                </div>

                                <motion.div
                                    className="my-6 h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent"
                                    initial={{ width: '0%' }}
                                    whileInView={{ width: '100%' }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.5, duration: 0.8 }}
                                ></motion.div>

                                <div className="mb-3 font-medium text-gray-800">Fitur Utama:</div>
                                <ul className="space-y-2.5">
                                    {role.capabilities.map((capability, capIndex) => (
                                        <motion.li
                                            key={capIndex}
                                            className="flex items-center text-gray-700 transition-all duration-200 ease-in-out group-hover:translate-x-0.5"
                                            initial={{ opacity: 0, x: -10 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: 0.6 + capIndex * 0.1 }}
                                        >
                                            <motion.span
                                                className={`mr-2.5 h-1.5 w-1.5 rounded-full ${
                                                    selectedRole === role.id ? 'bg-blue-500' : 'bg-blue-300'
                                                }`}
                                                animate={selectedRole === role.id ? { scale: [1, 1.5, 1] } : { scale: 1 }}
                                                transition={{ duration: 0.5 }}
                                            ></motion.span>
                                            <span>{capability}</span>
                                        </motion.li>
                                    ))}
                                </ul>

                                {selectedRole === role.id && (
                                    <motion.div
                                        className="absolute right-4 bottom-4 flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-white"
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0, opacity: 0 }}
                                        transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                            <path
                                                fillRule="evenodd"
                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </motion.div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default RoleSelector;
