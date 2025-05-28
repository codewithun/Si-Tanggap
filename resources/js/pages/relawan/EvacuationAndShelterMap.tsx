import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/useToast';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import L from 'leaflet';
import { useCallback, useEffect, useState } from 'react';
import { MapContainer, Marker, Polyline, Popup, TileLayer } from 'react-leaflet';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard Relawan',
        href: '/relawan/dashboard',
    },
    {
        title: 'Jalur & Posko Evakuasi',
        href: '/relawan/evacuation-and-shelter-map',
    },
];

interface JalurEvakuasi {
    id: number;
    nama: string;
    deskripsi: string;
    koordinat: Array<{ lat: number; lng: number }>;
    jenis_bencana: string;
    warna: string;
}

interface Posko {
    id: number;
    nama: string;
    deskripsi: string;
    alamat: string;
    kontak: string;
    jenis_posko: string;
    status: string;
    latitude: number;
    longitude: number;
}

const shelterIcon = L.icon({
    iconUrl: '/icons/posko.png', // Make sure this icon exists or replace with appropriate icon
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
});

export default function EvacuationAndShelterMap() {
    const [jalurEvakuasi, setJalurEvakuasi] = useState<JalurEvakuasi[]>([]);
    const [posko, setPosko] = useState<Posko[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const fetchJalurEvakuasi = useCallback(async () => {
        try {
            const response = await axios.get('/jalur-evakuasi');
            // Extract data from response
            setJalurEvakuasi(response.data.data); // Change this line
            return response.data.data; // Change this line
        } catch (error: unknown) {
            console.error('Failed to fetch evacuation routes:', error);
            const errorMessage = error instanceof Error ? error.message : 'Gagal memuat data jalur evakuasi';

            toast({
                title: 'Error',
                description: errorMessage,
                variant: 'destructive',
            });
            return [];
        }
    }, [toast]);

    const fetchPosko = useCallback(async () => {
        try {
            const response = await axios.get('/poskos');
            const poskoData = Array.isArray(response.data) ? response.data : response.data.data;
            setPosko(poskoData || []);
            return poskoData || [];
        } catch (error: unknown) {
            console.error('Failed to fetch evacuation shelters:', error);
            const errorMessage = error instanceof Error ? error.message : 'Gagal memuat data posko evakuasi';
            toast({
                title: 'Error',
                description: errorMessage,
                variant: 'destructive',
            });
            setPosko([]);
            return [];
        }
    }, [toast]);

    useEffect(() => {
        Promise.all([fetchJalurEvakuasi(), fetchPosko()])
            .then(() => setLoading(false))
            .catch(() => setLoading(false));
    }, [fetchJalurEvakuasi, fetchPosko]);

    // We'll use the paths and markers logic but adapt it for direct use with Leaflet
    const validPaths = jalurEvakuasi.filter((jalur) => {
        // More thorough validation
        return (
            jalur.koordinat &&
            Array.isArray(jalur.koordinat) &&
            jalur.koordinat.length >= 2 && // Ensure at least 2 points for a line
            jalur.koordinat.every((point) => point && typeof point.lat === 'number' && typeof point.lng === 'number')
        );
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Jalur & Posko Evakuasi" />
            <div className="space-y-4 p-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold sm:text-2xl">Peta Jalur Evakuasi & Posko</h2>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            Promise.all([fetchJalurEvakuasi(), fetchPosko()])
                                .then(() => setLoading(false))
                                .catch(() => setLoading(false));
                        }}
                        disabled={loading}
                    >
                        {loading ? 'Memuat...' : 'Refresh'}
                    </Button>
                </div>
                {loading ? (
                    <div className="h-[400px] w-full animate-pulse rounded-lg bg-gray-200 sm:h-[550px]"></div>
                ) : jalurEvakuasi.length === 0 && posko.length === 0 ? (
                    <div className="flex h-[400px] w-full items-center justify-center rounded-lg border border-dashed sm:h-[550px]">
                        <div className="text-center">
                            <p className="text-lg font-medium text-gray-600">Belum ada data</p>
                            <p className="text-sm text-gray-500">Belum ada jalur evakuasi atau posko yang tersedia</p>
                        </div>
                    </div>
                ) : (
                    <div className="h-[300px] overflow-hidden rounded-lg sm:h-[550px]">
                        <MapContainer center={[-7.150975, 110.140259]} zoom={6} style={{ height: '100%', width: '100%' }}>
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />

                            {/* Render Posko markers */}
                            {posko.map((p) => (
                                <Marker key={`posko-${p.id}`} position={[p.latitude, p.longitude]} icon={shelterIcon}>
                                    <Popup>
                                        <div className="font-bold">{p.nama}</div>
                                        <div className="text-xs">{p.deskripsi}</div>
                                        <div className="mt-2 text-xs">
                                            <div>
                                                <span className="font-semibold">Alamat:</span> {p.alamat || 'Tidak tersedia'}
                                            </div>
                                            <div>
                                                <span className="font-semibold">Kontak:</span> {p.kontak || 'Tidak tersedia'}
                                            </div>
                                            <div>
                                                <span className="font-semibold">Jenis:</span> {p.jenis_posko || 'Tidak tersedia'}
                                            </div>
                                            <div>
                                                <span className="font-semibold">Status:</span> {p.status || 'Aktif'}
                                            </div>
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}

                            {/* Render Jalur Evakuasi polylines */}
                            {validPaths.map((jalur) => (
                                <Polyline
                                    key={`jalur-${jalur.id}`}
                                    positions={jalur.koordinat.map((point) => [point.lat, point.lng])}
                                    pathOptions={{
                                        color: jalur.warna || '#3B82F6',
                                        weight: 4,
                                        opacity: 0.7,
                                    }}
                                >
                                    <Popup>
                                        <div className="font-bold">{jalur.nama}</div>
                                        <div className="text-xs">{jalur.deskripsi}</div>
                                        <div className="mt-2 text-xs">
                                            <span className="font-semibold">Jenis Bencana:</span> {jalur.jenis_bencana || 'Umum'}
                                        </div>
                                    </Popup>
                                </Polyline>
                            ))}
                        </MapContainer>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
