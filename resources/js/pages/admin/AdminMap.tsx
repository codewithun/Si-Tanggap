import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/useToast';
import axios from 'axios';
import { icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useCallback, useEffect, useState } from 'react';
import { MapContainer, Marker, Polyline, TileLayer } from 'react-leaflet';

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

interface MarkerData {
    id: number;
    position: [number, number];
    title: string;
    type: string;
    description?: string;
}

interface PathData {
    id: number;
    positions: [number, number][];
    color: string;
    name: string;
}

const shelterIcon = icon({
    iconUrl: '/icons/shelter-marker.svg',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
});

function CustomMap({
    height,
    className,
    markers = [],
    paths = [],
    zoom = 13,
    center = [-7.797068, 110.370529],
}: {
    height?: string;
    className?: string;
    markers?: MarkerData[];
    paths?: PathData[];
    zoom?: number;
    center?: [number, number];
}) {
    return (
        <div style={{ height }} className={className}>
            <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
                {markers.map((marker) => (
                    <Marker key={marker.id} position={marker.position} icon={shelterIcon} />
                ))}
                {paths.map((path) => (
                    <Polyline key={path.id} positions={path.positions} color={path.color} />
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
            setPosko(response.data);
            return response.data;
        } catch (error: unknown) {
            console.error('Failed to fetch evacuation shelters:', error);
            const errorMessage = error instanceof Error ? error.message : 'Gagal memuat data posko evakuasi';
            toast({
                title: 'Error',
                description: errorMessage,
                variant: 'destructive',
            });
            return [];
        }
    }, [toast]);

    useEffect(() => {
        Promise.all([fetchJalurEvakuasi(), fetchPosko()])
            .then(() => setLoading(false))
            .catch(() => setLoading(false));
    }, [fetchJalurEvakuasi, fetchPosko]);

    const markers = posko.map((p) => ({
        id: p.id,
        position: [p.latitude, p.longitude] as [number, number],
        title: p.nama,
        type: 'shelter',
        description: `${p.deskripsi}
                      Alamat: ${p.alamat || 'Tidak tersedia'}
                      Kontak: ${p.kontak || 'Tidak tersedia'}
                      Jenis: ${p.jenis_posko || 'Tidak tersedia'}
                      Status: ${p.status || 'Aktif'}`,
    }));

    const paths = jalurEvakuasi
        .filter((jalur) => jalur.koordinat && Array.isArray(jalur.koordinat) && jalur.koordinat.length > 0)
        .map((jalur) => ({
            id: jalur.id,
            positions: jalur.koordinat.map((point) => [point.lat, point.lng] as [number, number]),
            color: jalur.warna || '#3B82F6',
            name: jalur.nama,
        }));

    return (
        <div className="space-y-2 sm:space-y-4">
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
                <div className="h-[400px] w-full animate-pulse rounded-lg bg-gray-200 sm:h-[600px]"></div>
            ) : jalurEvakuasi.length === 0 && posko.length === 0 ? (
                <div className="flex h-[400px] w-full items-center justify-center rounded-lg border border-dashed sm:h-[600px]">
                    <div className="text-center">
                        <p className="text-lg font-medium text-gray-600">Belum ada data</p>
                        <p className="text-sm text-gray-500">Belum ada jalur evakuasi atau posko yang tersedia</p>
                    </div>
                </div>
            ) : (
                <CustomMap
                    height="400px"
                    className="sm:h-[600px]"
                    markers={markers || []}
                    paths={Array.isArray(paths) && paths.length > 0 ? paths : []}
                    zoom={6}
                    center={[-7.150975, 110.140259]}
                />
            )}
        </div>
    );
}
