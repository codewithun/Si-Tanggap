import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { MapContainer, Marker, Polyline, TileLayer, useMapEvents } from 'react-leaflet';
import { useToast } from '../../hooks/useToast';

interface JalurEvakuasi {
    id: number;
    user_id: number;
    nama: string;
    deskripsi: string;
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
    const [routeDesc, setRouteDesc] = useState('');
    const [disasterType, setDisasterType] = useState('');
    const [routeColor, setRouteColor] = useState('#FF5733');
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const fetchExistingRoutes = useCallback(async () => {
        try {
            console.error('Failed to fetch evacuation routes:', error);
            toast({
                title: 'Error',
                description: 'Gagal memuat jalur evakuasi',
                variant: 'destructive',
            });
            setJalurList([]);
        }
    }, [toast]);

    useEffect(() => {
        fetchExistingRoutes();
    }, [fetchExistingRoutes]);

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
            // Change the endpoint URL from /api/jalur-evakuasi to /jalur-evakuasi
            await axios.post('/jalur-evakuasi', {
                nama: routeName,
                deskripsi: routeDesc,
                koordinat: points.map(point => ({ lat: point[0], lng: point[1] })), // Format coordinates properly
                jenis_bencana: disasterType,
                warna: routeColor,
            });

            toast({
                title: 'Berhasil',
                description: 'Jalur evakuasi berhasil disimpan',
            });

            // Reset form
            setPoints([]);
            setRouteName('');
            setRouteDesc('');
            setDisasterType('');
            fetchExistingRoutes();
        } catch (error) {
            console.error('Failed to save evacuation route:', error);
            toast({
                title: 'Error',
                description: 'Gagal menyimpan jalur evakuasi',
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
                            <MapContainer
                                center={[-7.797068, 110.370529]} // Default to Yogyakarta
                                zoom={13}
                                style={{ height: '100%', width: '100%' }}
                            >
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
                                                opacity: 0.8 
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

                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="routeDesc">Deskripsi</Label>
                                    <Textarea
                                        id="routeDesc"
                                        value={routeDesc}
                                        onChange={(e) => setRouteDesc(e.target.value)}
                                        placeholder="Masukkan deskripsi jalur evakuasi"
                                    />
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
                                    <th className="py-2 px-4 text-left font-medium">Nama</th>
                                    <th className="py-2 px-4 text-left font-medium">Jenis Bencana</th>
                                    <th className="py-2 px-4 text-left font-medium">Deskripsi</th>
                                    <th className="py-2 px-4 text-left font-medium">Pembuat</th>
                                    <th className="py-2 px-4 text-left font-medium">Titik</th>
                                    <th className="py-2 px-4 text-left font-medium">Dibuat</th>
                                    <th className="py-2 px-4 text-left font-medium">Diperbarui</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {jalurList.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-4 px-4 text-center text-gray-500">
                                            Belum ada jalur evakuasi yang ditambahkan
                                        </td>
                                    </tr>
                                ) : (
                                    jalurList.map((jalur) => (
                                        <tr key={jalur.id}>
                                            <td className="py-2 px-4">
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="h-3 w-3 rounded-full"
                                                        style={{ backgroundColor: jalur.warna }}
                                                    />
                                                    {jalur.nama}
                                                </div>
                                            </td>
                                            <td className="py-2 px-4">
                                                <span className="rounded-full bg-gray-100 px-2 py-1 text-xs">
                                                    {jalur.jenis_bencana}
                                                </span>
                                            </td>
                                            <td className="py-2 px-4 max-w-xs truncate">
                                                {jalur.deskripsi}
                                            </td>
                                            <td className="py-2 px-4">
                                                {jalur.user?.name || 'Unknown'}
                                            </td>
                                            <td className="py-2 px-4">
                                                {jalur.koordinat.length} titik
                                            </td>
                                            <td className="py-2 px-4 text-gray-500">
                                                {new Date(jalur.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="py-2 px-4 text-gray-500">
                                                {new Date(jalur.updated_at).toLocaleDateString()}
                                            </td>
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
