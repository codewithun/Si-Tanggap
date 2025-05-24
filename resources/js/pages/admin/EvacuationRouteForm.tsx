import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { MapContainer, Marker, Polyline, TileLayer, useMapEvents } from 'react-leaflet';
import { useToast } from '../../hooks/useToast';

interface JalurEvakuasi {
    id: number;
    user_id: number;
    nama: string;
    koordinat: [number, number][];
    jenis_bencana: string;
    warna: string;
    created_at: string;
    updated_at: string;
    user?: {
        id: number;
        name: string;
        email: string;
    };
}

const PolylineCreator = ({
    points,
    setPoints,
    color,
}: {
    points: [number, number][];
    setPoints: React.Dispatch<React.SetStateAction<[number, number][]>>;
    color: string;
}) => {
    useMapEvents({
        click: (e) => {
            const { lat, lng } = e.latlng;
            setPoints((current) => [...current, [lat, lng]]);
        },
    });

    return (
        <>
            <Polyline positions={points} pathOptions={{ color }} />
            {points.map((position, idx) => (
                <Marker key={`marker-${idx}`} position={position} />
            ))}
        </>
    );
};

export default function EvacuationRouteForm() {
    const [jalurList, setJalurList] = useState<JalurEvakuasi[]>([]);
    const [points, setPoints] = useState<[number, number][]>([]);
    const [routeName, setRouteName] = useState('');
    const [disasterType, setDisasterType] = useState('');
    const [routeColor, setRouteColor] = useState('#FF5733');
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const fetchExistingRoutes = useCallback(async () => {
        try {
            const response = await axios.get('/jalur-evakuasi');
            // Ensure we're getting the data array from the response
            setJalurList(response.data?.data || []);
        } catch (error) {
            console.error('Failed to fetch evacuation routes:', error);
            toast({
                title: 'Error',
                description: 'Gagal memuat jalur evakuasi',
                variant: 'destructive',
            });
            setJalurList([]);
        }
    }, [toast]);

    // Replace empty array pattern in useEffect
    useEffect(() => {
        fetchExistingRoutes();
    }, [fetchExistingRoutes]); // Add dependency since we're using useCallback

    // Define a proper error interface
    interface ApiError {
        response?: {
            data?: {
                message?: string;
            };
        };
    }

    // Fix the error handling with proper type
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (points.length < 2) {
            toast({
                title: 'Peringatan',
                description: 'Tentukan minimal 2 titik untuk jalur evakuasi',
                variant: 'destructive',
            });
            return;
        }

        if (!routeName || !disasterType) {
            toast({
                title: 'Peringatan',
                description: 'Isi nama jalur dan jenis bencana',
                variant: 'destructive',
            });
            return;
        }

        setLoading(true);

        try {
            const formData = {
                nama: routeName,
                deskripsi: 'Jalur evakuasi', // Provide a default description
                koordinat: points.map(([lat, lng]) => ({
                    lat: parseFloat(lat.toFixed(6)),
                    lng: parseFloat(lng.toFixed(6)),
                })),
                jenis_bencana: disasterType,
                warna: routeColor,
            };

            // Log the request data for debugging
            console.log('Sending data:', formData);

            const response = await axios.post('/jalur-evakuasi', formData);

            // Log the response for debugging
            console.log('Response:', response.data);

            toast({
                title: 'Berhasil',
                description: 'Jalur evakuasi berhasil disimpan',
            });

            // Reset form
            setPoints([]);
            setRouteName('');
            setDisasterType('');
            fetchExistingRoutes();
        } catch (error: unknown) {
            console.error('Failed to save evacuation route:', error);
            const typedError = error as ApiError;
            const errorMessage = typedError?.response?.data?.message || 'Gagal menyimpan jalur evakuasi';
            toast({
                title: 'Error',
                description: errorMessage,
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Tambah Jalur Evakuasi</CardTitle>
                    <CardDescription>Tentukan jalur evakuasi pada peta dengan mengklik beberapa titik untuk membuat polyline</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div className="h-[400px] w-full overflow-hidden rounded-md">
                            <MapContainer center={[-7.150975, 110.140259]} zoom={6} style={{ height: '100%', width: '100%' }}>
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                <PolylineCreator points={points} setPoints={setPoints} color={routeColor} />

                                {/* Display existing routes */}
                                {jalurList.map((jalur) => {
                                    // Debug log for each route
                                    console.log(`Rendering route ${jalur.id}:`, jalur.koordinat);

                                    return jalur.koordinat && jalur.koordinat.length > 0 ? (
                                        <Polyline
                                            key={jalur.id}
                                            positions={jalur.koordinat}
                                            pathOptions={{
                                                color: jalur.warna || '#FF0000',
                                                weight: 3,
                                                opacity: 0.8,
                                            }}
                                        />
                                    ) : null;
                                })}
                            </MapContainer>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="routeName">Nama Jalur</Label>
                                    <Input
                                        id="routeName"
                                        value={routeName}
                                        onChange={(e) => setRouteName(e.target.value)}
                                        placeholder="Masukkan nama jalur evakuasi"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="disasterType">Jenis Bencana</Label>
                                    <Select value={disasterType} onValueChange={setDisasterType}>
                                        <SelectTrigger id="disasterType">
                                            <SelectValue placeholder="Pilih jenis bencana" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="banjir">Banjir</SelectItem>
                                            <SelectItem value="gempa">Gempa Bumi</SelectItem>
                                            <SelectItem value="longsor">Tanah Longsor</SelectItem>
                                            <SelectItem value="tsunami">Tsunami</SelectItem>
                                            <SelectItem value="angin-topan">Angin Topan</SelectItem>
                                            <SelectItem value="kebakaran">Kebakaran</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="routeColor">Warna Jalur</Label>
                                    <div className="flex items-center space-x-2">
                                        <Input
                                            type="color"
                                            id="routeColor"
                                            value={routeColor}
                                            onChange={(e) => setRouteColor(e.target.value)}
                                            className="h-8 w-12 cursor-pointer p-0"
                                        />
                                        <span className="text-sm text-gray-500">{routeColor}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 flex items-center space-x-2">
                                <Button type="button" variant="outline" onClick={() => setPoints([])}>
                                    Reset Titik
                                </Button>
                                <div className="text-sm text-gray-500">{points.length} titik ditentukan</div>
                            </div>
                        </form>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit" onClick={handleSubmit} disabled={loading || points.length < 2 || !routeName || !disasterType}>
                        {loading ? 'Menyimpan...' : 'Simpan Jalur Evakuasi'}
                    </Button>
                </CardFooter>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Daftar Jalur Evakuasi</CardTitle>
                    <CardDescription>Jalur evakuasi yang telah ditambahkan</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left font-medium">Nama</th>
                                    <th className="px-4 py-2 text-left font-medium">Jenis Bencana</th>
                                    <th className="px-4 py-2 text-left font-medium">Pembuat</th>
                                    <th className="px-4 py-2 text-left font-medium">Titik</th>
                                    <th className="px-4 py-2 text-left font-medium">Dibuat</th>
                                    <th className="px-4 py-2 text-left font-medium">Diperbarui</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {jalurList.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-4 text-center text-gray-500">
                                            Belum ada jalur evakuasi yang ditambahkan
                                        </td>
                                    </tr>
                                ) : (
                                    jalurList.map((jalur) => (
                                        <tr key={jalur.id}>
                                            <td className="px-4 py-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: jalur.warna }} />
                                                    {jalur.nama}
                                                </div>
                                            </td>
                                            <td className="px-4 py-2">
                                                <span className="rounded-full bg-gray-100 px-2 py-1 text-xs">{jalur.jenis_bencana}</span>
                                            </td>
                                            <td className="px-4 py-2">{jalur.user?.name || 'Unknown'}</td>
                                            <td className="px-4 py-2">{jalur.koordinat.length} titik</td>
                                            <td className="px-4 py-2 text-gray-500">{new Date(jalur.created_at).toLocaleDateString()}</td>
                                            <td className="px-4 py-2 text-gray-500">{new Date(jalur.updated_at).toLocaleDateString()}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
