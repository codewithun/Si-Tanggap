import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/useToast';
import axios from '@/lib/axios';
import L from 'leaflet';
import { useCallback, useEffect, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMapEvents } from 'react-leaflet';

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

const disasterIcon = L.icon({
    iconUrl: '/icons/disaster-marker.svg',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
});

function MarkerCreator({
    position,
    setPosition,
}: {
    position: [number, number] | null;
    setPosition: React.Dispatch<React.SetStateAction<[number, number] | null>>;
}) {
    useMapEvents({
        click: (e) => {
            setPosition([e.latlng.lat, e.latlng.lng]);
        },
    });
    return position ? <Marker position={position} icon={disasterIcon} /> : null;
}

export default function BencanaMap() {
    const [bencanaPoints, setBencanaPoints] = useState<Bencana[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshCount, setRefreshCount] = useState(0);

    // Form state
    const [judul, setJudul] = useState('');
    const [jenisBencana, setJenisBencana] = useState('');
    const [deskripsi, setDeskripsi] = useState('');
    const [lokasi, setLokasi] = useState('');
    const [position, setPosition] = useState<[number, number] | null>(null);
    const [saving, setSaving] = useState(false);

    const { toast } = useToast();

    const fetchBencanaPoints = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axios.get('/laporans');
            const data = response.data.data || response.data;
            if (Array.isArray(data)) {
                const verifiedReports = data.filter((report) => report.status === 'diverifikasi');
                setBencanaPoints(verifiedReports);
            } else {
                setBencanaPoints([]);
            }
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Gagal memuat data titik bencana';
            toast({
                title: 'Error',
                description: errorMessage,
                variant: 'destructive',
            });
            setBencanaPoints([]);
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchBencanaPoints();
    }, [fetchBencanaPoints, refreshCount]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!judul || !jenisBencana || !deskripsi || !lokasi || !position) {
            toast({
                title: 'Peringatan',
                description: 'Lengkapi semua data bencana dan tentukan lokasi di peta!',
                variant: 'destructive',
            });
            return;
        }
        setSaving(true);
        try {
            await axios.post('/laporans', {
                judul,
                jenis_bencana: jenisBencana,
                deskripsi,
                lokasi,
                latitude: position[0],
                longitude: position[1],
            });
            toast({ title: 'Berhasil', description: 'Bencana berhasil ditambahkan & menunggu verifikasi.' });
            setJudul('');
            setJenisBencana('');
            setDeskripsi('');
            setLokasi('');
            setPosition(null);
            setRefreshCount((c) => c + 1);
        } catch (error: unknown) {
            const axiosError = error as { response?: { data?: { message?: string } } };
            toast({
                title: 'Error',
                description: axiosError.response?.data?.message || 'Gagal menambahkan bencana',
                variant: 'destructive',
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold sm:text-2xl">Kelola Titik Bencana</h2>
                <Button variant="outline" size="sm" onClick={() => setRefreshCount((c) => c + 1)} disabled={loading}>
                    {loading ? 'Memuat...' : 'Refresh'}
                </Button>
            </div>
            {/* Form Tambah Bencana */}
            <div className="rounded-lg bg-white p-4 shadow">
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="judul">Judul</Label>
                            <Input id="judul" value={judul} onChange={(e) => setJudul(e.target.value)} placeholder="Judul bencana" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="jenisBencana">Jenis Bencana</Label>
                            <Select value={jenisBencana} onValueChange={setJenisBencana}>
                                <SelectTrigger id="jenisBencana">
                                    <SelectValue placeholder="Pilih jenis bencana" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="banjir">Banjir</SelectItem>
                                    <SelectItem value="gempa">Gempa Bumi</SelectItem>
                                    <SelectItem value="longsor">Tanah Longsor</SelectItem>
                                    <SelectItem value="tsunami">Tsunami</SelectItem>
                                    <SelectItem value="angin-topan">Angin Topan</SelectItem>
                                    <SelectItem value="kebakaran">Kebakaran</SelectItem>
                                    <SelectItem value="gunung-meletus">Gunung Meletus</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="deskripsi">Deskripsi</Label>
                            <Textarea
                                id="deskripsi"
                                value={deskripsi}
                                onChange={(e) => setDeskripsi(e.target.value)}
                                placeholder="Deskripsi bencana"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lokasi">Lokasi</Label>
                            <Input id="lokasi" value={lokasi} onChange={(e) => setLokasi(e.target.value)} placeholder="Nama lokasi / alamat" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <Label>Pilih Titik pada Peta</Label>
                        <div className="mt-2 h-[300px] w-full overflow-hidden rounded-md">
                            <MapContainer center={[-7.150975, 110.140259]} zoom={6} style={{ height: '100%', width: '100%' }}>
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                <MarkerCreator position={position} setPosition={setPosition} />
                            </MapContainer>
                        </div>
                        <div className="mt-2 text-xs text-gray-600">
                            {position ? `Lokasi: ${position[0]}, ${position[1]}` : 'Klik pada peta untuk menentukan lokasi.'}
                        </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                        <Button type="submit" disabled={saving || !judul || !jenisBencana || !deskripsi || !lokasi || !position}>
                            {saving ? 'Menyimpan...' : 'Tambah Bencana'}
                        </Button>
                    </div>
                </form>
            </div>
            {/* Peta Titik Bencana */}
            <div className="space-y-2 sm:space-y-4">
                <h3 className="text-lg font-semibold">Peta Titik Bencana Terverifikasi</h3>
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
                    <MapContainer center={[-7.150975, 110.140259]} zoom={6} style={{ height: '400px', width: '100%' }}>
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        {bencanaPoints.map((bencana) => (
                            <Marker key={bencana.id} position={[bencana.latitude, bencana.longitude]} icon={disasterIcon}>
                                <Popup>
                                    <div className="font-bold">{bencana.judul || bencana.jenis_bencana}</div>
                                    <div className="text-xs">{bencana.deskripsi}</div>
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
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                )}
            </div>
        </div>
    );
}
