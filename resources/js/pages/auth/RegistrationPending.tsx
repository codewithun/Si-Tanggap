import React from 'react';
import { motion } from 'framer-motion';
import PageTitle from '@/components/PageTitle';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, Mail } from 'lucide-react';

export default function RegistrationPending() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
            <PageTitle title="Pendaftaran Sedang Diproses" />
            
            <div className="container max-w-4xl px-4 py-16 mx-auto">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="bg-white rounded-xl shadow-lg p-8 text-center"
                >
                    <div className="mb-6 flex justify-center">
                        <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
                            <Clock className="w-10 h-10 text-blue-600" />
                        </div>
                    </div>
                    
                    <h1 className="text-3xl font-bold text-blue-900 mb-4">Pendaftaran Relawan Sedang Diproses</h1>
                    
                    <div className="text-gray-600 space-y-4 mb-8">
                        <p>
                            Terima kasih telah mendaftar sebagai relawan GeoSiaga. Akun Anda saat ini sedang 
                            dalam proses verifikasi oleh admin.
                        </p>
                        <p>
                            Anda akan menerima email notifikasi setelah akun Anda diverifikasi dan dapat login 
                            ke dalam aplikasi.
                        </p>
                        <p className="flex items-center justify-center gap-2 text-blue-600">
                            <Mail className="w-5 h-5" />
                            <span>Silakan periksa email Anda secara berkala.</span>
                        </p>
                    </div>
                    
                    <div className="flex justify-center gap-4">
                        <Button 
                            variant="ghost" 
                            onClick={() => window.location.href = '/'}
                            className="flex items-center gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Kembali ke Beranda
                        </Button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}