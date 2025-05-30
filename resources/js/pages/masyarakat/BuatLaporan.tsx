import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';

// Instead of a single disaster icon, get the appropriate icon based on disaster type
const getDisasterIcon = (type: string) => {
    // Hapus cache buster untuk menghindari masalah loading dan konsistensi
    const iconSize: [number, number] = [32, 32];
    const iconAnchor: [number, number] = [16, 32];
    const popupAnchor: [number, number] = [0, -32];

    switch (type.toLowerCase()) {
        case 'banjir':
            return L.icon({
                iconUrl: '/icons/icon-banjir.png',
                iconSize,
                iconAnchor,
                popupAnchor,
            });
        case 'kebakaran':
            return L.icon({
                iconUrl: '/icons/icon-kebakaran.png',
                iconSize,
                iconAnchor,
                popupAnchor,
            });
        case 'gempa':
            return L.icon({
                iconUrl: '/icons/icon-gempa.png',
                iconSize,
                iconAnchor,
                popupAnchor,
            });
        case 'longsor':
            return L.icon({
                iconUrl: '/icons/icon-tanahlongsor.png',
                iconSize,
                iconAnchor,
                popupAnchor,
            });
        case 'angin_topan':
            return L.icon({
                iconUrl: '/icons/icon-angin-topan.svg', // Menggunakan icon-angin.png yang lebih konsisten
                iconSize,
                iconAnchor,
                popupAnchor,
            });
        case 'tsunami':
            return L.icon({
                iconUrl: '/icons/icon-tsunami.png',
                iconSize,
                iconAnchor,
                popupAnchor,
            });
        case 'kekeringan':
            return L.icon({
                iconUrl: '/icons/icon-kekeringan.png',
                iconSize,
                iconAnchor,
                popupAnchor,
            });
        default:
            return L.icon({
                iconUrl: '/icons/disaster.svg',
                iconSize,
                iconAnchor,
                popupAnchor,
            });
    }
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Buat Laporan',
        href: '/laporan-bencana/create',
    },
];

type BencanaType = 'banjir' | 'longsor' | 'gempa' | 'tsunami' | 'kebakaran' | 'angin_topan' | 'kekeringan' | 'lainnya';

function MarkerCreator({
    position,
    setPosition,
    jenisBencana,
}: {
    position: [number, number] | null;
    setPosition: (position: [number, number]) => void;
    jenisBencana: string;
}) {
    // Use the hook directly without assigning to a variable
    useMapEvents({
        click: (e) => {
            // Only allow setting position if a disaster type is selected
            if (jenisBencana) {
                const newPosition: [number, number] = [e.latlng.lat, e.latlng.lng];
                setPosition(newPosition);
            }
        },
    });

    return position && jenisBencana ? <Marker position={position} icon={getDisasterIcon(jenisBencana)} /> : null;
}

export default function BuatLaporan() {
    const { auth } = usePage<SharedData>().props;
    const mapRef = useRef<HTMLDivElement>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [selectedPosition, setSelectedPosition] = useState<[number, number] | null>(null);
    const [mapType, setMapType] = useState<'standard' | 'satellite' | 'terrain'>('standard');
    const [imageError, setImageError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        judul: '',
        jenis_bencana: '' as BencanaType,
        deskripsi: '',
        lokasi: '',
        latitude: -6.2, // Default to Jakarta's coordinates
        longitude: 106.816666,
        foto: null as File | null,
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (value: string) => {
        setFormData((prev) => ({ ...prev, jenis_bencana: value as BencanaType }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setImageError(null);

        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            // Validate file type
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
            if (!validTypes.includes(file.type)) {
                setImageError('Format file tidak didukung. Gunakan JPG, PNG, atau GIF.');
                e.target.value = '';
                return;
            }

            // Validate file size (max 2MB)
            const maxSize = 2 * 1024 * 1024; // 2MB in bytes
            if (file.size > maxSize) {
                setImageError('Ukuran file terlalu besar. Maksimum 2MB.');
                e.target.value = '';
                return;
            }

            setFormData((prev) => ({ ...prev, foto: file }));

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviewImage(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePositionSelect = (position: [number, number]) => {
        setSelectedPosition(position);
        setFormData((prev) => ({
            ...prev,
            latitude: position[0],
            longitude: position[1],
        }));
    };

    // Get tile layer URL based on map type
    const getTileLayerUrl = () => {
        switch (mapType) {
            case 'satellite':
                return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
            case 'terrain':
                return 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
            default:
                return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
        }
    };

    // Get tile layer attribution based on map type
    const getTileLayerAttribution = () => {
        switch (mapType) {
            case 'satellite':
                return '&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';
            case 'terrain':
                return '&copy; <a href="https://opentopomap.org">OpenTopoMap</a> contributors';
            default:
                return '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.judul || !formData.jenis_bencana || !formData.deskripsi || !formData.lokasi || !selectedPosition) {
            toast.error(
                !formData.jenis_bencana
                    ? 'Pilih jenis bencana terlebih dahulu sebelum menentukan lokasi di peta!'
                    : 'Lengkapi semua data bencana dan tentukan lokasi di peta!',
            );
            return;
        }

        if (!formData.foto) {
            toast.error('Unggah foto kejadian bencana!');
            return;
        }

        setIsSubmitting(true);

        try {
            const data = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                if (value !== null) {
                    if (key === 'foto' && value instanceof File) {
                        // Ensure we're passing the File object directly, not the file path
                        data.append(key, value, value.name);
                    } else if (typeof value === 'number') {
                        data.append(key, value.toString());
                    } else {
                        data.append(key, value);
                    }
                }
            });

            // Include file mime type for debugging
            if (formData.foto) {
                console.log(`Uploading image: ${formData.foto.name}, type: ${formData.foto.type}, size: ${formData.foto.size} bytes`);
            }

            await axios.post('/laporans', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Accept: 'application/json',
                },
            });

            toast.success('Laporan berhasil dikirim');

            // Reset form
            setFormData({
                judul: '',
                jenis_bencana: '' as BencanaType,
                deskripsi: '',
                lokasi: '',
                latitude: 0,
                longitude: 0,
                foto: null,
            });
            setPreviewImage(null);
            setSelectedPosition(null);

            // Redirect to laporan list
            window.location.href = '/masyarakat/laporan-saya';
        } catch (error: unknown) {
            console.error('Error submitting report:', error);

            if (axios.isAxiosError(error) && error.response?.data?.errors) {
                const serverErrors = error.response.data.errors;
                // Handle validation errors
                Object.keys(serverErrors).forEach((key) => {
                    toast.error(serverErrors[key][0]);
                });
            } else {
                toast.error('Gagal mengirim laporan');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        // Fungsi untuk memeriksa ketersediaan icon
        const checkIconAvailability = (iconUrl: string) => {
            return new Promise<boolean>((resolve) => {
                const img = new Image();
                img.onload = () => resolve(true);
                img.onerror = () => resolve(false);
                img.src = iconUrl;
            });
        };

        const iconPaths = [
            '/icons/icon-banjir.png',
            '/icons/icon-kebakaran.png',
            '/icons/icon-gempa.png',
            '/icons/icon-tanahlongsor.png',
            '/icons/icon-angin.png',
            '/icons/icon-tsunami.png',
            '/icons/icon-kekeringan.png',
            '/icons/disaster.svg',
            '/icons/posko.png',
        ];

        Promise.all(iconPaths.map((path) => checkIconAvailability(path))).then((results) => {
            const missingIcons = iconPaths.filter((_, index) => !results[index]);
            if (missingIcons.length > 0) {
                console.warn('Warning: Missing icon files:', missingIcons);
            }
        });
    }, []);

    if (!auth.user) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Buat Laporan" />
                <div className="flex h-full items-center justify-center">
                    <Card>
                        <CardHeader>
                            <CardTitle>Login Diperlukan</CardTitle>
                            <CardDescription>Anda harus login terlebih dahulu untuk membuat laporan bencana.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button onClick={() => (window.location.href = '/login')}>Login</Button>
                        </CardContent>
                    </Card>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Buat Laporan Bencana" />

            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Buat Laporan Bencana</CardTitle>
                        <CardDescription>Laporkan kejadian bencana yang terjadi di sekitar Anda.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="judul">Judul Laporan</Label>
                                    <Input
                                        id="judul"
                                        name="judul"
                                        value={formData.judul}
                                        onChange={handleInputChange}
                                        placeholder="Contoh: Banjir di Kelurahan Sukamaju"
                                        required
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="jenis_bencana">Jenis Bencana</Label>
                                    <Select value={formData.jenis_bencana} onValueChange={handleSelectChange}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih jenis bencana" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="banjir">Banjir</SelectItem>
                                            <SelectItem value="longsor">Tanah Longsor</SelectItem>
                                            <SelectItem value="gempa">Gempa Bumi</SelectItem>
                                            <SelectItem value="tsunami">Tsunami</SelectItem>
                                            <SelectItem value="kebakaran">Kebakaran</SelectItem>
                                            <SelectItem value="angin_topan">Angin Topan</SelectItem>
                                            <SelectItem value="kekeringan">Kekeringan</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="deskripsi">Deskripsi Bencana</Label>
                                <Textarea
                                    id="deskripsi"
                                    name="deskripsi"
                                    value={formData.deskripsi}
                                    onChange={handleInputChange}
                                    required
                                    rows={5}
                                    placeholder="Deskripsikan kejadian bencana secara detail"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="lokasi">Alamat Lokasi</Label>
                                <Input
                                    id="lokasi"
                                    name="lokasi"
                                    value={formData.lokasi}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Masukkan alamat lengkap lokasi bencana"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label>Lokasi di Peta</Label>

                                <div className="mb-2 grid grid-cols-1 gap-4 md:grid-cols-3">
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="radio"
                                            id="map-standard"
                                            name="map-type"
                                            checked={mapType === 'standard'}
                                            onChange={() => setMapType('standard')}
                                        />
                                        <label htmlFor="map-standard" className="text-sm">
                                            Peta Standar
                                        </label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="radio"
                                            id="map-satellite"
                                            name="map-type"
                                            checked={mapType === 'satellite'}
                                            onChange={() => setMapType('satellite')}
                                        />
                                        <label htmlFor="map-satellite" className="text-sm">
                                            Peta Satelit
                                        </label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="radio"
                                            id="map-terrain"
                                            name="map-type"
                                            checked={mapType === 'terrain'}
                                            onChange={() => setMapType('terrain')}
                                        />
                                        <label htmlFor="map-terrain" className="text-sm">
                                            Peta Kontur
                                        </label>
                                    </div>
                                </div>

                                <div className="h-[400px] overflow-hidden rounded-md border" ref={mapRef}>
                                    {!formData.jenis_bencana ? (
                                        <div className="flex h-full w-full items-center justify-center rounded-md border-2 border-dashed border-gray-300 bg-gray-50">
                                            <div className="text-center">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="24"
                                                    height="24"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    className="mx-auto mb-2 text-gray-400"
                                                >
                                                    <circle cx="12" cy="12" r="10" />
                                                    <path d="M12 8v4M12 16h.01" />
                                                </svg>
                                                <p className="text-sm font-medium text-gray-600">Pilih jenis bencana terlebih dahulu</p>
                                                <p className="text-xs text-gray-500">Anda harus memilih jenis bencana sebelum menentukan lokasi</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <MapContainer center={[-6.2, 106.816666]} zoom={6} scrollWheelZoom={true} className="h-full w-full">
                                            <TileLayer attribution={getTileLayerAttribution()} url={getTileLayerUrl()} />
                                            <MarkerCreator
                                                position={selectedPosition}
                                                setPosition={handlePositionSelect}
                                                jenisBencana={formData.jenis_bencana}
                                            />
                                        </MapContainer>
                                    )}
                                </div>

                                {formData.jenis_bencana ? (
                                    <p className="text-sm text-gray-500">
                                        {selectedPosition
                                            ? `Lokasi yang dipilih: Latitude ${selectedPosition[0].toFixed(6)}, Longitude ${selectedPosition[1].toFixed(6)}`
                                            : 'Klik pada peta untuk menentukan lokasi bencana'}
                                    </p>
                                ) : (
                                    <p className="text-sm text-gray-500">Pilih jenis bencana terlebih dahulu untuk mengaktifkan peta</p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="foto">Foto Bencana</Label>
                                <Input
                                    id="foto"
                                    name="foto"
                                    type="file"
                                    accept="image/jpeg,image/png,image/gif"
                                    onChange={handleFileChange}
                                    required
                                />
                                <p className="text-xs text-gray-500">JPG, GIF atau PNG. Ukuran maksimal 2MB.</p>

                                {imageError && <p className="mt-1 text-xs text-red-500">{imageError}</p>}

                                {previewImage && (
                                    <div className="mt-2 rounded-md border p-2">
                                        <p className="mb-1 text-sm font-medium">Pratinjau Foto:</p>
                                        <img
                                            src={previewImage}
                                            alt="Preview"
                                            className="max-h-64 w-full rounded object-contain"
                                            onError={() => {
                                                setPreviewImage(null);
                                                setImageError('Gambar tidak valid atau rusak. Silakan pilih gambar lain.');
                                            }}
                                        />
                                    </div>
                                )}
                            </div>

                            <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
                                {isSubmitting ? (
                                    <div className="flex items-center">
                                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                                        Mengirim...
                                    </div>
                                ) : (
                                    'Kirim Laporan'
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
