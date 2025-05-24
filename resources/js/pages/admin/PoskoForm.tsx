import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/useToast';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';
import { icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Posko {
    id: number;
    user_id: number;
    nama: string;
    deskripsi: string;
    alamat: string;
    kontak: string;
    jenis_posko: string;
    status: string;
    latitude: number;
    longitude: number;
    kapasitas: number;
    created_at: string;
    updated_at: string;
    user?: {
        id: number;
        name: string;
        email: string;
    };
}

const shelterIcon = icon({
    iconUrl: '/icons/shelter-marker.svg',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
});

const MarkerCreator = ({
    position,
    setPosition,
}: {
    position: [number, number] | null;
    setPosition: React.Dispatch<React.SetStateAction<[number, number] | null>>;
}) => {
    useMapEvents({
        click: (e) => {
            setPosition([e.latlng.lat, e.latlng.lng]);
        },
    });

    return position ? <Marker position={position} icon={shelterIcon} /> : null;
};

export default function PoskoForm() {
    const [poskoList, setPoskoList] = useState<Posko[]>([]);
    const [position, setPosition] = useState<[number, number] | null>(null);
    const [poskoName, setPoskoName] = useState('');
    const [poskoDesc, setPoskoDesc] = useState('');
    const [poskoAddress, setPoskoAddress] = useState('');
    const [poskoContact, setPoskoContact] = useState('');
    const [poskoType, setPoskoType] = useState('');
    const [poskoStatus, setPoskoStatus] = useState('aktif');
    const [poskoCapacity, setPoskoCapacity] = useState('');
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        fetchExistingPoskos();
    }, []);

    const fetchExistingPoskos = async () => {
        try {
            const response = await axios.get('/poskos');
            setPoskoList(response.data);
        } catch (error) {
            console.error('Failed to fetch poskos:', error);
            toast({
                title: 'Error',
                description: 'Gagal memuat data posko',
                variant: 'destructive',
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!position) {
            toast({
                title: 'Peringatan',
                description: 'Tentukan lokasi posko pada peta',
                variant: 'destructive',
            });
            return;
        }

        if (!poskoName || !poskoDesc || !poskoAddress || !poskoType || !poskoCapacity) {
            toast({
                title: 'Peringatan',
                description: 'Lengkapi semua data yang diperlukan',
                variant: 'destructive',
            });
            return;
        }

        setLoading(true);

        try {
            await axios.post('/poskos', {
                nama: poskoName,
                deskripsi: poskoDesc,
                alamat: poskoAddress,
                kontak: poskoContact,
                jenis_posko: poskoType,
                status: poskoStatus,
                latitude: position[0],
                longitude: position[1],
                kapasitas: parseInt(poskoCapacity),
            });

            toast({
                title: 'Berhasil',
                description: 'Posko berhasil disimpan',
            });

            // Reset form
            setPosition(null);
            setPoskoName('');
            setPoskoDesc('');
            setPoskoAddress('');
            setPoskoContact('');
            setPoskoType('');
            setPoskoCapacity('');
            fetchExistingPoskos();
        } catch (error) {
            console.error('Failed to save posko:', error);
            toast({
                title: 'Error',
                description: 'Gagal menyimpan posko',
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
                    <CardTitle>Tambah Posko</CardTitle>
                    <CardDescription>
                        Tentukan lokasi posko pada peta dengan mengklik titik yang diinginkan
                    </CardDescription>
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
                                <MarkerCreator position={position} setPosition={setPosition} />

                                {/* Display existing poskos */}
                                {poskoList.map((posko) => (
                                    <Marker
                                        key={posko.id}
                                        position={[posko.latitude, posko.longitude]}
                                        icon={shelterIcon}
                                    />
                                ))}
                            </MapContainer>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="poskoName">Nama Posko</Label>
                                    <Input
                                        id="poskoName"
                                        value={poskoName}
                                        onChange={(e) => setPoskoName(e.target.value)}
                                        placeholder="Masukkan nama posko"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="poskoType">Jenis Posko</Label>
                                    <Select value={poskoType} onValueChange={setPoskoType}>
                                        <SelectTrigger id="poskoType">
                                            <SelectValue placeholder="Pilih jenis posko" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pengungsian">Pengungsian</SelectItem>
                                            <SelectItem value="kesehatan">Kesehatan</SelectItem>
                                            <SelectItem value="logistik">Logistik</SelectItem>
                                            <SelectItem value="dapur-umum">Dapur Umum</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="poskoAddress">Alamat</Label>
                                    <Textarea
                                        id="poskoAddress"
                                        value={poskoAddress}
                                        onChange={(e) => setPoskoAddress(e.target.value)}
                                        placeholder="Masukkan alamat lengkap posko"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="poskoDesc">Deskripsi</Label>
                                    <Textarea
                                        id="poskoDesc"
                                        value={poskoDesc}
                                        onChange={(e) => setPoskoDesc(e.target.value)}
                                        placeholder="Masukkan deskripsi posko"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="poskoContact">Kontak</Label>
                                    <Input
                                        id="poskoContact"
                                        value={poskoContact}
                                        onChange={(e) => setPoskoContact(e.target.value)}
                                        placeholder="Masukkan nomor kontak"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="poskoCapacity">Kapasitas</Label>
                                    <Input
                                        id="poskoCapacity"
                                        type="number"
                                        value={poskoCapacity}
                                        onChange={(e) => setPoskoCapacity(e.target.value)}
                                        placeholder="Masukkan kapasitas posko"
                                        min="1"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="poskoStatus">Status</Label>
                                    <Select value={poskoStatus} onValueChange={setPoskoStatus}>
                                        <SelectTrigger id="poskoStatus">
                                            <SelectValue placeholder="Pilih status posko" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="aktif">Aktif</SelectItem>
                                            <SelectItem value="tidak_aktif">Tidak Aktif</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </form>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button
                        type="submit"
                        onClick={handleSubmit}
                        disabled={loading || !position || !poskoName || !poskoDesc || !poskoAddress || !poskoType || !poskoCapacity}
                    >
                        {loading ? 'Menyimpan...' : 'Simpan Posko'}
                    </Button>
                </CardFooter>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Daftar Posko</CardTitle>
                    <CardDescription>Posko yang telah ditambahkan</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="py-2 px-4 text-left font-medium">Nama</th>
                                    <th className="py-2 px-4 text-left font-medium">Jenis</th>
                                    <th className="py-2 px-4 text-left font-medium">Status</th>
                                    <th className="py-2 px-4 text-left font-medium">Kapasitas</th>
                                    <th className="py-2 px-4 text-left font-medium">Alamat</th>
                                    <th className="py-2 px-4 text-left font-medium">Kontak</th>
                                    <th className="py-2 px-4 text-left font-medium">Pembuat</th>
                                    <th className="py-2 px-4 text-left font-medium">Dibuat</th>
                                    <th className="py-2 px-4 text-left font-medium">Diperbarui</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {poskoList.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="py-4 px-4 text-center text-gray-500">
                                            Belum ada posko yang ditambahkan
                                        </td>
                                    </tr>
                                ) : (
                                    poskoList.map((posko) => (
                                        <tr key={posko.id}>
                                            <td className="py-2 px-4">{posko.nama}</td>
                                            <td className="py-2 px-4">
                                                <span className="rounded-full bg-gray-100 px-2 py-1 text-xs">
                                                    {posko.jenis_posko}
                                                </span>
                                            </td>
                                            <td className="py-2 px-4">
                                                <span
                                                    className={`rounded-full px-2 py-1 text-xs ${
                                                        posko.status === 'aktif'
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-red-100 text-red-800'
                                                    }`}
                                                >
                                                    {posko.status}
                                                </span>
                                            </td>
                                            <td className="py-2 px-4">{posko.kapasitas} orang</td>
                                            <td className="py-2 px-4">{posko.alamat}</td>
                                            <td className="py-2 px-4">{posko.kontak || '-'}</td>
                                            <td className="py-2 px-4">{posko.user?.name || 'Unknown'}</td>
                                            <td className="py-2 px-4 text-gray-500">
                                                {new Date(posko.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="py-2 px-4 text-gray-500">
                                                {new Date(posko.updated_at).toLocaleDateString()}
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