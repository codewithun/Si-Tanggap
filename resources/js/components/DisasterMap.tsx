import MapComponent from '@/components/MapComponent';
import { Button } from '@/components/ui/button';
import axios from '@/lib/axios';
import { Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';

interface Disaster {
    id: number;
    latitude: number;
    longitude: number;
    judul: string;
    jenis_bencana: string;
    lokasi: string;
}

export default function DisasterMap() {
    const [disasters, setDisasters] = useState<Disaster[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecentDisasters = async () => {
            try {
                setLoading(true);
                const response = await axios.get('/titik-bencana', {
                    params: {
                        status: 'diverifikasi',
                        limit: 5, // Only get 5 most recent disasters for preview
                    },
                });
                setDisasters(response.data || []);
            } catch (error) {
                console.error('Error loading disaster data:', error);
                setDisasters([]);
            } finally {
                setLoading(false);
            }
        };

        fetchRecentDisasters();
    }, []);

    const markers = disasters.map((disaster) => ({
        id: disaster.id,
        position: [disaster.latitude, disaster.longitude] as [number, number],
        title: disaster.judul || disaster.jenis_bencana,
        type: 'disaster',
        description: `Jenis: ${disaster.jenis_bencana}\nLokasi: ${disaster.lokasi || 'Tidak diketahui'}`,
    }));

    return (
        <section className="bg-gray-50 py-12">
            <div className="container mx-auto px-4">
                <div className="mb-8 text-center">
                    <h2 className="mb-2 text-3xl font-bold text-gray-900">Peta Sebaran Bencana</h2>
                    <p className="mx-auto max-w-2xl text-gray-600">
                        Visualisasi data bencana terkini untuk membantu Anda memahami situasi di berbagai wilayah
                    </p>
                </div>

                <div className="relative mb-6">
                    {loading ? (
                        <div className="h-[400px] w-full animate-pulse rounded-lg bg-gray-200"></div>
                    ) : (
                        <MapComponent
                            height="400px"
                            markers={markers}
                            zoom={4}
                            initialView={[-2.5489, 118.0149]} // Center of Indonesia
                        />
                    )}
                </div>

                <div className="mt-6 flex justify-center space-x-4 text-center">
                    <Button asChild size="lg">
                        <Link href="/map">Lihat Peta Lengkap</Link>
                    </Button>
                    <Button asChild size="lg" variant="secondary">
                        <Link href="/map/dashboard">Buka Dashboard Interaktif</Link>
                    </Button>
                </div>
            </div>
        </section>
    );
}
