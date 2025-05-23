import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { MapContainer, Marker, Polyline, TileLayer, useMapEvents } from 'react-leaflet';
import { useToast } from '../../hooks/useToast';

interface JalurEvakuasi {
    id: number;
    nama: string;
    deskripsi: string;
    koordinat: [number, number][];
    jenis_bencana: string;
    warna: string;
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

    useEffect(() => {
        fetchExistingRoutes();
    }, []);

    const fetchExistingRoutes = async () => {
        try {
            const response = await axios.get('/api/jalur-evakuasi');
            setJalurList(response.data.data);
        } catch (error) {
            console.error('Failed to fetch evacuation routes:', error);
            toast({
                title: 'Error',
                description: 'Gagal memuat jalur evakuasi',
                variant: 'destructive',
            });
        }
    };

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
            await axios.post('/api/jalur-evakuasi', {
                nama: routeName,
                deskripsi: routeDesc,
                koordinat: points,
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
                                {jalurList.map((jalur) => (
                                    <Polyline key={jalur.id} positions={jalur.koordinat} pathOptions={{ color: jalur.warna }} />
                                ))}
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
                    <div className="divide-y">
                        {jalurList.length === 0 ? (
                            <p className="py-4 text-sm text-gray-500">Belum ada jalur evakuasi yang ditambahkan</p>
                        ) : (
                            jalurList.map((jalur) => (
                                <div key={jalur.id} className="py-4">
                                    <div className="flex items-center gap-2">
                                        <div className="h-4 w-4 rounded-full" style={{ backgroundColor: jalur.warna }} />
                                        <h3 className="font-medium">{jalur.nama}</h3>
                                        <span className="rounded-full bg-gray-100 px-2 py-1 text-xs">{jalur.jenis_bencana}</span>
                                    </div>
                                    <p className="mt-1 text-sm text-gray-500">{jalur.deskripsi}</p>
                                    <div className="mt-1 text-xs text-gray-400">{jalur.koordinat.length} titik koordinat</div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
