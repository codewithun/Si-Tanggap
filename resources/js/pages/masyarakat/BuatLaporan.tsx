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
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Buat Laporan',
        href: '/laporan-bencana/create',
    },
];

type BencanaType = 'banjir' | 'longsor' | 'gempa' | 'tsunami' | 'kebakaran' | 'angin_topan' | 'kekeringan' | 'lainnya';

export default function BuatLaporan() {
    const { auth } = usePage<SharedData>().props;
    const mapRef = useRef<HTMLDivElement>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        judul: '',
        jenis_bencana: '' as BencanaType,
        deskripsi: '',
        lokasi: '',
        latitude: 0,
        longitude: 0,
        foto: null as File | null,
    });

    // Initialize map if needed
    useEffect(() => {
        // Here you would initialize your map if you have one
        // For example using Leaflet or Google Maps
        // This is a placeholder - you'll need to implement actual map functionality
        const initMap = () => {
            // Map initialization code would go here
            console.log('Map would be initialized here');
        };

        initMap();

        return () => {
            // Cleanup map if needed
        };
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (value: string) => {
        setFormData((prev) => ({ ...prev, jenis_bencana: value as BencanaType }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setFormData((prev) => ({ ...prev, foto: file }));

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviewImage(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const data = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                if (value !== null) {
                    if (typeof value === 'number') {
                        data.append(key, value.toString());
                    } else {
                        data.append(key, value);
                    }
                }
            });

            await axios.post('/laporans', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
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

            // Redirect to laporan list
            window.location.href = '/dashboard';
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
                            <div className="grid gap-2">
                                <Label htmlFor="judul">Judul Laporan</Label>
                                <Input id="judul" name="judul" value={formData.judul} onChange={handleInputChange} required />
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
                                        <SelectItem value="lainnya">Lainnya</SelectItem>
                                    </SelectContent>
                                </Select>
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
                                <div className="h-64 rounded-md border" ref={mapRef}>
                                    {/* Map would be rendered here */}
                                    <div className="flex h-full items-center justify-center bg-slate-100">
                                        <p className="text-muted-foreground">Klik pada peta untuk menentukan lokasi</p>
                                    </div>
                                </div>

                                <div className="mt-2 grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="latitude">Latitude</Label>
                                        <Input
                                            id="latitude"
                                            name="latitude"
                                            type="number"
                                            value={formData.latitude || ''}
                                            onChange={handleInputChange}
                                            step="any"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="longitude">Longitude</Label>
                                        <Input
                                            id="longitude"
                                            name="longitude"
                                            type="number"
                                            value={formData.longitude || ''}
                                            onChange={handleInputChange}
                                            step="any"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="foto">Foto Bencana</Label>
                                <Input id="foto" name="foto" type="file" accept="image/*" onChange={handleFileChange} />
                                <p className="text-muted-foreground text-xs">JPG, GIF or PNG. Max size 2MB.</p>

                                {previewImage && (
                                    <div className="mt-2 w-full max-w-md rounded-md border p-2">
                                        <img src={previewImage} alt="Preview" className="mx-auto max-h-64 object-contain" />
                                    </div>
                                )}
                            </div>

                            <Button type="submit" disabled={isSubmitting}>
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
