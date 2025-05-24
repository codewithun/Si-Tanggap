import React, { useState } from 'react';

interface NotificationFormProps {
    onSubmit: (data: NotificationData) => void;
}

interface NotificationData {
    title: string;
    message: string;
    type: 'info' | 'warning' | 'emergency';
    target: 'all' | 'masyarakat' | 'relawan';
}

const NotificationForm: React.FC<NotificationFormProps> = ({ onSubmit }) => {
    const [formData, setFormData] = useState<NotificationData>({
        title: '',
        message: '',
        type: 'info',
        target: 'all',
    });

    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate API call
        setTimeout(() => {
            onSubmit(formData);
            setIsLoading(false);
            setFormData({
                title: '',
                message: '',
                type: 'info',
                target: 'all',
            });
        }, 1000);
    };

    return (
        <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-6 text-xl font-semibold text-gray-800">Kirim Notifikasi</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label htmlFor="title" className="mb-2 block text-sm font-medium text-gray-700">
                        Judul Notifikasi
                    </label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                        placeholder="Masukkan judul notifikasi"
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="message" className="mb-2 block text-sm font-medium text-gray-700">
                        Pesan Notifikasi
                    </label>
                    <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={4}
                        className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                        placeholder="Masukkan pesan notifikasi"
                    ></textarea>
                </div>

                <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                        <label htmlFor="type" className="mb-2 block text-sm font-medium text-gray-700">
                            Jenis Notifikasi
                        </label>
                        <select
                            id="type"
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            required
                            className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                        >
                            <option value="info">Informasi</option>
                            <option value="warning">Peringatan</option>
                            <option value="emergency">Darurat</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="target" className="mb-2 block text-sm font-medium text-gray-700">
                            Target Pengguna
                        </label>
                        <select
                            id="target"
                            name="target"
                            value={formData.target}
                            onChange={handleChange}
                            required
                            className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                        >
                            <option value="all">Semua Pengguna</option>
                            <option value="masyarakat">Masyarakat</option>
                            <option value="relawan">Relawan</option>
                        </select>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <button
                        type="button"
                        onClick={() => {
                            setFormData({
                                title: '',
                                message: '',
                                type: 'info',
                                target: 'all',
                            });
                        }}
                        className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
                    >
                        Reset
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none ${
                            isLoading ? 'cursor-not-allowed opacity-70' : ''
                        }`}
                    >
                        {isLoading && (
                            <svg className="mr-2 h-4 w-4 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                            </svg>
                        )}
                        Kirim Notifikasi
                    </button>
                </div>
            </form>
        </div>
    );
};

export default NotificationForm;
