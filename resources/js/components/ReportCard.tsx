import { Link } from '@inertiajs/react';
import React from 'react';

interface ReportCardProps {
    id: number;
    title: string;
    type: string;
    location: string;
    date: string;
    description: string;
    status: 'pending' | 'verified' | 'rejected';
    imageUrl?: string;
    userRole?: 'masyarakat' | 'relawan' | 'admin';
    onVerify?: (id: number) => void;
    onReject?: (id: number) => void;
}

const ReportCard: React.FC<ReportCardProps> = ({ id, title, type, location, date, description, status, imageUrl, userRole, onVerify, onReject }) => {
    const getStatusBadge = () => {
        switch (status) {
            case 'verified':
                return <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">Terverifikasi</span>;
            case 'rejected':
                return <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-800">Ditolak</span>;
            default:
                return <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800">Menunggu</span>;
        }
    };

    const getBencanaIcon = () => {
        switch (type.toLowerCase()) {
            case 'banjir':
                return (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                            />
                        </svg>
                    </div>
                );
            case 'gempa':
                return (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                            />
                        </svg>
                    </div>
                );
            case 'longsor':
                return (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 text-yellow-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 13h8c0 4.418-3.582 8-8 8H5c-4.418 0-8-3.582-8-8 0-4.418 3.582-8 8-8h8c4.418 0 8 3.582 8 8z"
                            />
                        </svg>
                    </div>
                );
            case 'kebakaran':
                return (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
                            />
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"
                            />
                        </svg>
                    </div>
                );
            default:
                return (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                    </div>
                );
        }
    };

    return (
        <div className="overflow-hidden rounded-lg bg-white shadow-md">
            <div className="p-5">
                <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                        {getBencanaIcon()}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
                            <p className="text-sm text-gray-600">
                                <span className="font-medium capitalize">{type}</span> di {location}
                            </p>
                            <p className="mt-1 text-xs text-gray-500">Dilaporkan pada: {date}</p>
                        </div>
                    </div>
                    <div>{getStatusBadge()}</div>
                </div>

                {imageUrl && (
                    <div className="mt-4">
                        <img src={imageUrl} alt={title} className="h-40 w-full rounded-md object-cover" />
                    </div>
                )}

                <p className="mt-4 text-gray-700">{description}</p>

                <div className="mt-5 flex items-center justify-between">
                    <Link href={`/reports/${id}`} className="text-sm font-medium text-blue-600 hover:text-blue-800">
                        Lihat Detail
                    </Link>

                    {(userRole === 'relawan' || userRole === 'admin') && status === 'pending' && (
                        <div className="flex space-x-2">
                            <button
                                onClick={() => onVerify && onVerify(id)}
                                className="rounded bg-green-100 px-3 py-1 text-xs font-medium text-green-800 hover:bg-green-200"
                            >
                                Verifikasi
                            </button>
                            <button
                                onClick={() => onReject && onReject(id)}
                                className="rounded bg-red-100 px-3 py-1 text-xs font-medium text-red-800 hover:bg-red-200"
                            >
                                Tolak
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReportCard;
