import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/useToast';
import AppLayout from '@/layouts/app-layout';
import axios from '@/lib/axios';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useCallback, useEffect, useState } from 'react';
import { MapContainer, Marker, Polyline, Popup, TileLayer } from 'react-leaflet';

// Define breadcrumbs for consistent navigation
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard Admin',
        href: '/admin/dashboard',
    },
    {
        title: 'Peta Jalur & Posko Evakuasi',
        href: '/admin/map',
    },
];

// --- Interfaces ---
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

// --- Icons ---
const shelterIcon = icon({
    iconUrl: '/icons/posko.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
});

// --- CustomMap Component with all overlays ---
function CustomMap({
    height,
    className,
    poskos = [],
    jalurEvakuasi = [],
    zoom = 13,
    center = [-7.797068, 110.370529],
}: {
    height?: string;
    className?: string;
    poskos?: Posko[];
    jalurEvakuasi?: JalurEvakuasi[];
    zoom?: number;
    center?: [number, number];
}) {
    useEffect(() => {
        // Add custom style for map z-index
        const style = document.createElement('style');
        style.textContent = `
            /* Control map z-index */
            .leaflet-container {
                z-index: 1 !important;
            }
            .leaflet-pane,
            .leaflet-control,
            .leaflet-top,
            .leaflet-bottom {
                z-index: 400 !important;
            }
        `;
        document.head.appendChild(style);

        return () => {
            document.head.removeChild(style);
        };
    }, []);

    return (
        <div style={{ height }} className={className}>
            <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
                {/* Posko Markers */}
                {poskos.map((marker) => (
                    <Marker key={`posko-${marker.id}`} position={[marker.latitude, marker.longitude]} icon={shelterIcon}>
                        <Popup>
                            <div style={{ minWidth: 270, minHeight: 110, display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: 16 }}>
                                <div style={{ flex: 1 }}>
                                    <div className="mb-1 text-base font-bold">{marker.nama}</div>
                                    <div className="mb-1 text-sm">{marker.deskripsi}</div>
                                    <div className="mt-2 text-xs text-gray-600">
                                        <div>
                                            <span className="font-semibold">Alamat:</span> {marker.alamat || 'Tidak tersedia'}
                                        </div>
                                        <div>
                                            <span className="font-semibold">Kontak:</span> {marker.kontak || 'Tidak tersedia'}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ flex: 0.7 }}>
                                    <div className="text-xs">
                                        <div>
                                            <span className="font-semibold">Jenis:</span> {marker.jenis_posko || 'Tidak tersedia'}
                                        </div>
                                        <div>
                                            <span className="font-semibold">Status:</span> {marker.status || 'Aktif'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
                {/* Jalur Evakuasi Polylines */}
                {jalurEvakuasi
                    .filter((jalur) => {
                        // More thorough validation of coordinates
                        return (
                            jalur.koordinat &&
                            Array.isArray(jalur.koordinat) &&
                            jalur.koordinat.length > 1 && // Need at least 2 points for a line
                            jalur.koordinat.every((point) => point && typeof point.lat === 'number' && typeof point.lng === 'number')
                        );
                    })
                    .map((jalur) => (
                        <Polyline
                            key={`jalur-${jalur.id}`}
                            positions={jalur.koordinat.map((point) => [point.lat, point.lng] as [number, number])}
                            pathOptions={{ color: jalur.warna || '#3B82F6', weight: 3, opacity: 0.8 }}
                        >
                            <Popup>
                                <div>
                                    <div className="font-bold">{jalur.nama}</div>
                                    <div className="text-xs text-gray-600">jalur evakuasi</div>
                                </div>
                            </Popup>
                        </Polyline>
                    ))}
            </MapContainer>
        </div>
    );
}

export default function AdminMap() {
    const [jalurEvakuasi, setJalurEvakuasi] = useState<JalurEvakuasi[]>([]);
    const [posko, setPosko] = useState<Posko[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    // --- Fetchers ---
    const fetchJalurEvakuasi = useCallback(async () => {
        try {
            const response = await axios.get('/jalur-evakuasi');
            setJalurEvakuasi(response.data.data);
            return response.data.data;
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

    // --- Data Loader ---
    useEffect(() => {
        Promise.all([fetchJalurEvakuasi(), fetchPosko()])
            .then(() => setLoading(false))
            .catch(() => setLoading(false));
    }, [fetchJalurEvakuasi, fetchPosko]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Peta Jalur & Posko Evakuasi" />

            <div className="p-6">
                <h1 className="mb-4 text-2xl font-semibold text-gray-800">Peta Jalur & Posko Evakuasi</h1>
                <p className="mb-6 text-gray-600">Visualisasi jalur evakuasi dan posko pengungsian dalam bentuk peta interaktif.</p>

                <div className="space-y-2 sm:space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold sm:text-2xl">Peta Jalur Evakuasi & Posko</h2>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setLoading(true);
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
                        <div className="h-[400px] w-full animate-pulse rounded-lg bg-gray-200 sm:h-[600px]"></div>
                    ) : jalurEvakuasi.length === 0 && posko.length === 0 ? (
                        <div className="flex h-[400px] w-full items-center justify-center rounded-lg border border-dashed sm:h-[600px]">
                            <div className="text-center">
                                <p className="text-lg font-medium text-gray-600">Belum ada data</p>
                                <p className="text-sm text-gray-500">Belum ada jalur evakuasi atau posko yang tersedia</p>
                            </div>
                        </div>
                    ) : (
                        <div className="h-[450px] w-full overflow-hidden rounded-lg sm:h-[600px]">
                            <CustomMap
                                height="100%"
                                className="h-full w-full"
                                poskos={posko}
                                jalurEvakuasi={jalurEvakuasi}
                                zoom={6}
                                center={[-7.150975, 110.140259]}
                            />
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
