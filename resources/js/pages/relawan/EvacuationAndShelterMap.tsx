import MapComponent from '@/components/MapComponent';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/useToast';
import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';

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

    // Transform posko data to marker format
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
    })); // Transform jalur evakuasi to path format with validation
    const paths = jalurEvakuasi
        .filter((jalur) => jalur.koordinat && Array.isArray(jalur.koordinat) && jalur.koordinat.length > 0)
        .map((jalur) => ({
            id: jalur.id,
            positions: jalur.koordinat.map((point) => [point.lat, point.lng] as [number, number]),
            color: jalur.warna || '#3B82F6', // Use defined color or blue as default
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
                <MapComponent
                    height="400px"
                    className="sm:h-[600px]"
                    markers={markers || []}
                    paths={Array.isArray(paths) && paths.length > 0 ? paths : []}
                    zoom={6}
                />
            )}
        </div>
    );
}
