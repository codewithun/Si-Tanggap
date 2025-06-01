import { useToast } from '@/hooks/useToast';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { AlertCircleIcon, CheckCircleIcon, SendIcon } from 'lucide-react';
import { useState } from 'react';

export default function RegistrationRejected() {
    const [userData, setUserData] = useState({
        name: '',
        email: '',
        phone: '',
        organization: '',
        experience: '',
        motivation: '',
        id_card_path: '',
    });

    const [submitting, setSubmitting] = useState(false);
    const [idCardFile, setIdCardFile] = useState<File | null>(null);
    const [success, setSuccess] = useState(false);
    const { toast } = useToast();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setUserData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setIdCardFile(e.target.files[0]);
        }
    };
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            // Create FormData for file upload
            const formData = new FormData();

            // Add all the form fields to FormData
            (Object.keys(userData) as Array<keyof typeof userData>).forEach((key) => {
                formData.append(key, userData[key] || '');
            });

            // Add the ID card file if one was selected
            if (idCardFile) {
                formData.append('id_card', idCardFile);
            }

            await axios.post('/api/rejected-relawan-public/resubmit', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setSuccess(true);
            toast({
                title: 'Berhasil',
                description: 'Permohonan relawan berhasil diajukan ulang',
            });
        } catch (error) {
            console.error('Error resubmitting application:', error);

            let errorMessage = 'Gagal mengajukan ulang permohonan relawan';

            if (axios.isAxiosError(error) && error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }

            toast({
                title: 'Error',
                description: errorMessage,
                variant: 'destructive',
            });
        } finally {
            setSubmitting(false);
        }
    }; // Success state shows a different view
    if (success) {
        return (
            <>
                <Head title="Permohonan Diajukan Ulang" />
                <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
                    <div className="w-full max-w-md space-y-6 rounded-lg border bg-white p-8 shadow-md">
                        <div className="flex justify-center">
                            <div className="rounded-full bg-green-100 p-3">
                                <CheckCircleIcon className="h-10 w-10 text-green-600" />
                            </div>
                        </div>

                        <div className="text-center">
                            <h1 className="text-2xl font-bold text-gray-800">Permohonan Berhasil Diajukan</h1>
                            <p className="mt-2 text-gray-600">
                                Permohonan relawan Anda telah berhasil diajukan ulang dan sedang dalam proses peninjauan.
                            </p>
                        </div>

                        <div className="text-center text-sm text-gray-600">
                            <p>Kami akan mengevaluasi permohonan Anda dan mengirimkan notifikasi hasilnya.</p>
                        </div>

                        <div className="flex justify-center">
                            <a
                                href="/"
                                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
                            >
                                Kembali ke Beranda
                            </a>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Head title="Pendaftaran Relawan Ditolak" />
            <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
                <div className="w-full max-w-2xl space-y-6 rounded-lg border bg-white p-8 shadow-md">
                    <div className="flex justify-center">
                        <div className="rounded-full bg-red-100 p-3">
                            <AlertCircleIcon className="h-10 w-10 text-red-600" />
                        </div>
                    </div>

                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-800">Pendaftaran Relawan Ditolak</h1>
                        <p className="mt-2 text-gray-600">
                            Mohon maaf, pendaftaran Anda sebagai relawan tidak disetujui. Silakan perbaiki data Anda dan ajukan kembali.
                        </p>
                    </div>

                    <div className="rounded-md bg-red-50 p-4 text-sm">
                        <p className="mb-2">Beberapa alasan umum penolakan meliputi:</p>
                        <ul className="list-inside list-disc space-y-1">
                            <li>Data atau dokumen yang kurang lengkap</li>
                            <li>Tidak memenuhi kriteria yang diperlukan</li>
                            <li>Kuota relawan untuk area Anda telah terpenuhi</li>
                        </ul>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                Nama Lengkap
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={userData.name || ''}
                                onChange={handleInputChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={userData.email || ''}
                                onChange={handleInputChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                                Nomor Telepon
                            </label>
                            <input
                                type="text"
                                id="phone"
                                name="phone"
                                value={userData.phone || ''}
                                onChange={handleInputChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="organization" className="block text-sm font-medium text-gray-700">
                                Organisasi (opsional)
                            </label>
                            <input
                                type="text"
                                id="organization"
                                name="organization"
                                value={userData.organization || ''}
                                onChange={handleInputChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="experience" className="block text-sm font-medium text-gray-700">
                                Pengalaman
                            </label>
                            <textarea
                                id="experience"
                                name="experience"
                                value={userData.experience || ''}
                                onChange={handleInputChange}
                                rows={3}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="motivation" className="block text-sm font-medium text-gray-700">
                                Motivasi
                            </label>
                            <textarea
                                id="motivation"
                                name="motivation"
                                value={userData.motivation || ''}
                                onChange={handleInputChange}
                                rows={3}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="id_card" className="block text-sm font-medium text-gray-700">
                                KTP
                            </label>
                            <input
                                type="file"
                                id="id_card"
                                name="id_card"
                                onChange={handleFileChange}
                                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
                                accept="image/png, image/jpeg, image/jpg, application/pdf"
                                required
                            />
                            <p className="mt-1 text-xs text-gray-500">Format: JPG, PNG, atau PDF (Maks. 5MB)</p>
                        </div>

                        <div className="flex flex-col space-y-2 pt-4">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="inline-flex w-full justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50"
                            >
                                {submitting ? (
                                    <>
                                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                        Mengirim...
                                    </>
                                ) : (
                                    <>
                                        <SendIcon className="mr-2 h-4 w-4" />
                                        Ajukan Ulang Permohonan
                                    </>
                                )}
                            </button>

                            <a
                                href="/"
                                className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
                            >
                                Kembali ke Beranda
                            </a>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
