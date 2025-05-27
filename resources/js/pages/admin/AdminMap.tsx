import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/useToast';
import axios from 'axios';
import { icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useCallback, useEffect, useState } from 'react';
import { MapContainer, Marker, Polyline, Popup, TileLayer } from 'react-leaflet';

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

interface Bencana {
    id: number;
    judul: string;
    jenis_bencana: string;
    created_at: string;
    latitude: number;
    longitude: number;
    lokasi: string;
    status: 'menunggu' | 'diverifikasi' | 'ditolak';
    deskripsi: string;
}

// --- Icons ---
const shelterIcon = icon({
    iconUrl: '/icons/shelter-marker.svg',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
});
const disasterIcon = icon({
    iconUrl: '/icons/disaster-marker.svg',
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
    bencanaPoints = [],
    zoom = 13,
    center = [-7.797068, 110.370529],
}: {
    height?: string;
    className?: string;
    poskos?: Posko[];
    jalurEvakuasi?: JalurEvakuasi[];
    bencanaPoints?: Bencana[];
    zoom?: number;
    center?: [number, number];
}) {
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
                {/* Titik Bencana Markers */}
                {bencanaPoints.map((bencana) => (
                    <Marker key={`bencana-${bencana.id}`} position={[bencana.latitude, bencana.longitude]} icon={disasterIcon}>
                        <Popup>
                            <div style={{ minWidth: 220, display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                                <div style={{ flex: 1 }}>
                                    <div className="mb-1 text-base font-bold">{bencana.judul || bencana.jenis_bencana || '(Tanpa judul)'}</div>
                                    <div className="mb-1 text-xs">{bencana.deskripsi}</div>
                                    <div className="mt-2 text-xs">
                                        <div>
                                            <span className="font-semibold">Jenis:</span> {bencana.jenis_bencana || 'Tidak diketahui'}
                                        </div>
                                        <div>
                                            <span className="font-semibold">Tanggal:</span> {new Date(bencana.created_at).toLocaleDateString('id-ID')}
                                        </div>
                                        <div>
                                            <span className="font-semibold">Lokasi:</span> {bencana.lokasi || 'Tidak diketahui'}
                                        </div>
                                        <div>
                                            <span className="font-semibold">Status:</span> {bencana.status || 'Belum diverifikasi'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}

export default function AdminMap() {
    const [jalurEvakuasi, setJalurEvakuasi] = useState<JalurEvakuasi[]>([]);
    const [posko, setPosko] = useState<Posko[]>([]);
    const [bencanaPoints, setBencanaPoints] = useState<Bencana[]>([]);
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

    const fetchBencanaPoints = useCallback(async () => {
        try {
            const response = await axios.get('/laporans');
            const data = response.data.data || response.data;
            if (Array.isArray(data)) {
                // Only use verified
                const verifiedReports = data.filter((report) => report.status === 'diverifikasi');
                setBencanaPoints(verifiedReports);
                return verifiedReports;
            } else {
                setBencanaPoints([]);
                return [];
            }
        } catch (error: unknown) {
            console.error('Failed to fetch disaster points:', error);
            const errorMessage = error instanceof Error ? error.message : 'Gagal memuat data titik bencana';
            toast({
                title: 'Error',
                description: errorMessage,
                variant: 'destructive',
            });
            setBencanaPoints([]);
            return [];
        }
    }, [toast]);

    // --- Data Loader ---
    useEffect(() => {
        Promise.all([fetchJalurEvakuasi(), fetchPosko(), fetchBencanaPoints()])
            .then(() => setLoading(false))
            .catch(() => setLoading(false));
    }, [fetchJalurEvakuasi, fetchPosko, fetchBencanaPoints]);

    return (
        <div className="space-y-2 sm:space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold sm:text-2xl">Peta Jalur Evakuasi, Posko & Titik Bencana</h2>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                        setLoading(true);
                        Promise.all([fetchJalurEvakuasi(), fetchPosko(), fetchBencanaPoints()])
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
            ) : jalurEvakuasi.length === 0 && posko.length === 0 && bencanaPoints.length === 0 ? (
                <div className="flex h-[400px] w-full items-center justify-center rounded-lg border border-dashed sm:h-[600px]">
                    <div className="text-center">
                        <p className="text-lg font-medium text-gray-600">Belum ada data</p>
                        <p className="text-sm text-gray-500">Belum ada jalur evakuasi, posko, atau titik bencana yang tersedia</p>
                    </div>
                </div>
            ) : (
                <CustomMap
                    height="400px"
                    className="sm:h-[600px]"
                    poskos={posko}
                    jalurEvakuasi={jalurEvakuasi}
                    bencanaPoints={bencanaPoints}
                    zoom={6}
                    center={[-7.150975, 110.140259]}
                />
            )}
        </div>
    );
}
