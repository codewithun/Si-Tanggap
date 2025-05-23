import MapComponent from '@/components/MapComponent';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/useToast';
import axios from '@/lib/axios';
import { useCallback, useEffect, useState } from 'react';

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

export default function BencanaMap() {
    const [bencanaPoints, setBencanaPoints] = useState<Bencana[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const fetchBencanaPoints = useCallback(async () => {
        try {
            setLoading(true);
            console.log('Fetching disaster points...');
            const response = await axios.get('/laporans');
            // Log the full response for debugging
            console.log('API Response:', response);

            // Handle both paginated and non-paginated responses
            const data = response.data.data || response.data;
            console.log('Extracted data:', data);
            console.log('Is data an array?', Array.isArray(data));

            if (Array.isArray(data)) {
                // Check for reports with all status values
                const allStatusValues = new Set(data.map((report) => report.status));
                console.log('All status values in data:', [...allStatusValues]);

                // Filter only verified reports - using 'diverifikasi' instead of 'terverifikasi'
                const verifiedReports = data.filter((report) => report.status === 'diverifikasi');
                console.log('Verified reports count:', verifiedReports.length);
                console.log('Verified reports:', verifiedReports);

                setBencanaPoints(verifiedReports);
            } else {
                console.log('Data is not an array, cannot filter by status');
                setBencanaPoints([]);
            }
        } catch (error: unknown) {
            console.error('Failed to fetch disaster points:', error);
            const errorMessage = error instanceof Error ? error.message : 'Gagal memuat data titik bencana';

            toast({
                title: 'Error',
                description: errorMessage,
                variant: 'destructive',
            });
            // Set empty array on error
            setBencanaPoints([]);
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchBencanaPoints();
    }, [fetchBencanaPoints]);

    // Transform bencana data to marker format
    const markers = bencanaPoints.map((bencana) => ({
        id: bencana.id,
        position: [bencana.latitude, bencana.longitude] as [number, number],
        title: bencana.judul || bencana.jenis_bencana,
        type: 'disaster',
        description: `Jenis: ${bencana.jenis_bencana || 'Tidak diketahui'}
                     Tanggal: ${new Date(bencana.created_at).toLocaleDateString('id-ID')}
                     Lokasi: ${bencana.lokasi || 'Tidak diketahui'}
                     Status: ${bencana.status || 'Belum diverifikasi'}`,
    }));
    return (
        <div className="space-y-2 sm:space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold sm:text-2xl">Peta Titik Bencana</h2>
                <Button variant="outline" size="sm" onClick={() => fetchBencanaPoints()} disabled={loading}>
                    {loading ? 'Memuat...' : 'Refresh'}
                </Button>
            </div>
            {loading ? (
                <div className="h-[400px] w-full animate-pulse rounded-lg bg-gray-200 sm:h-[600px]"></div>
            ) : bencanaPoints.length === 0 ? (
                <div className="flex h-[400px] w-full items-center justify-center rounded-lg border border-dashed sm:h-[600px]">
                    <div className="text-center">
                        <p className="text-lg font-medium text-gray-600">Tidak ada data bencana</p>
                        <p className="text-sm text-gray-500">Belum ada laporan bencana yang terverifikasi</p>
                    </div>
                </div>
            ) : (
                <MapComponent height="400px" className="sm:h-[600px]" markers={markers} zoom={6} />
            )}
        </div>
    );
}
