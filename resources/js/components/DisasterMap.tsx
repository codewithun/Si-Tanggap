import axios from 'axios';
import L from 'leaflet';
import React, { useEffect, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';

interface DisasterPoint {
    id: number;
    latitude: number;
    longitude: number;
    jenis_bencana: string;
    tanggal: string;
    deskripsi: string;
    status: string;
    kota_kabupaten: string;
}

const DisasterMap: React.FC = () => {
    const [disasterPoints, setDisasterPoints] = useState<DisasterPoint[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Default center of Indonesia
    const defaultCenter: [number, number] = [-2.5489, 118.0149];
    const defaultZoom = 5;

    useEffect(() => {
        const fetchDisasterPoints = async () => {
            try {
                setLoading(true);
                const response = await axios.get('/api/laporans');
                setDisasterPoints(response.data);
                setError(null);
            } catch (err) {
                console.error('Failed to fetch disaster points:', err);
                setError('Gagal memuat data titik bencana');
                // Fallback data for development/preview
                setDisasterPoints([
                    {
                        id: 1,
                        latitude: -6.2088,
                        longitude: 106.8456,
                        jenis_bencana: 'Banjir',
                        tanggal: '2025-05-20',
                        deskripsi: 'Banjir setinggi 1 meter',
                        status: 'terverifikasi',
                        kota_kabupaten: 'Jakarta Pusat',
                    },
                    {
                        id: 2,
                        latitude: -7.7956,
                        longitude: 110.3695,
                        jenis_bencana: 'Gempa Bumi',
                        tanggal: '2025-05-18',
                        deskripsi: 'Gempa dengan kekuatan 5.6 SR',
                        status: 'terverifikasi',
                        kota_kabupaten: 'Yogyakarta',
                    },
                    {
                        id: 3,
                        latitude: -8.4095,
                        longitude: 115.1889,
                        jenis_bencana: 'Kebakaran Hutan',
                        tanggal: '2025-05-15',
                        deskripsi: 'Kebakaran hutan di kawasan hutan lindung',
                        status: 'belum_terverifikasi',
                        kota_kabupaten: 'Bali',
                    },
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchDisasterPoints();
    }, []); // Create custom icons for different disaster types
    const getMarkerIcon = (disasterType: string) => {
        let iconFileName;

        // Map disaster types to icon filenames
        switch (disasterType.toLowerCase()) {
            case 'banjir':
                iconFileName = 'banjir.svg';
                break;
            case 'tanah longsor':
            case 'longsor':
                iconFileName = 'longsor.svg';
                break;
            case 'gempa bumi':
            case 'gempa':
                iconFileName = 'gempa.svg';
                break;
            case 'tsunami':
                iconFileName = 'tsunami.svg';
                break;
            case 'kebakaran':
            case 'kebakaran hutan':
                iconFileName = 'kebakaran.svg';
                break;
            case 'angin topan':
            case 'angin':
                iconFileName = 'angin-topan.svg';
                break;
            case 'kekeringan':
                iconFileName = 'kekeringan.svg';
                break;
            default:
                iconFileName = 'lainnya.svg';
        }

        // Create icon with the specific disaster icon or default
        return new L.Icon({
            iconUrl: `/icons/${iconFileName}`,
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32],
        });
    };

    return (
        <section className="bg-gray-50 py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-12 text-center">
                    <h2 className="text-3xl font-bold text-gray-900">Peta Bencana</h2>
                    <p className="mt-4 text-lg text-gray-600">Sebaran titik bencana di seluruh Indonesia</p>
                </div>

                {loading && (
                    <div className="flex justify-center">
                        <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                )}

                {error && <div className="mb-6 text-center text-red-500">{error}</div>}

                <div className="h-[500px] w-full overflow-hidden rounded-xl shadow-lg">
                    <MapContainer center={defaultCenter} zoom={defaultZoom} style={{ height: '100%', width: '100%' }} className="z-0">
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        {disasterPoints.map((point) => (
                            <Marker key={point.id} position={[point.latitude, point.longitude]} icon={getMarkerIcon(point.jenis_bencana)}>
                                <Popup>
                                    <div>
                                        <h3 className="text-lg font-bold">{point.jenis_bencana}</h3>
                                        <p className="text-sm text-gray-600">
                                            {new Date(point.tanggal).toLocaleDateString('id-ID', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric',
                                            })}
                                        </p>
                                        <p className="mt-1">{point.deskripsi}</p>
                                        <p className="mt-1 font-medium">{point.kota_kabupaten}</p>
                                        <div className="mt-2">
                                            <a
                                                href={`/laporan/${point.id}`}
                                                className="text-blue-600 hover:underline"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                Lihat Detail
                                            </a>
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>

                <div className="mt-8 text-center">
                    <a
                        href="/map"
                        className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                    >
                        Buka Peta Lengkap
                        <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path
                                fillRule="evenodd"
                                d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </a>
                </div>
            </div>
        </section>
    );
};

export default DisasterMap;
