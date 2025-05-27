import MapComponent from '@/components/MapComponent';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/useToast';
import AppLayout from '@/layouts/app-layout';
import axios from '@/lib/axios';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard Relawan',
        href: '/relawan/dashboard',
    },
    {
        title: 'Tambah Jalur & Posko',
        href: '/relawan/add-evacuation-and-shelter',
    },
];

interface FormPosko {
    nama: string;
    deskripsi: string;
    kapasitas: number;
    latitude: number;
    longitude: number;
}

export default function AddEvacuationAndShelter() {
    const [activeTab, setActiveTab] = useState<'jalur' | 'posko'>('jalur');
    const [jalurPoints, setJalurPoints] = useState<Array<[number, number]>>([]);
    const [jalurNama, setJalurNama] = useState('');

    // Get CSRF cookie when component mounts
    useEffect(() => {
        const getCsrfToken = async () => {
            const baseURL = import.meta.env.VITE_API_URL || '';
            await axios.get(`${baseURL}/sanctum/csrf-cookie`);
        };
        getCsrfToken();
    }, []);
    const [selectedPoint, setSelectedPoint] = useState<{ lat: number; lng: number } | null>(null);
    const [formPosko, setFormPosko] = useState<FormPosko>({
        nama: '',
        deskripsi: '',
        kapasitas: 0,
        latitude: 0,
        longitude: 0,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();
    useEffect(() => {
        if (selectedPoint && activeTab === 'posko') {
            setFormPosko((prevState) => ({
                ...prevState,
                latitude: selectedPoint.lat,
                longitude: selectedPoint.lng,
            }));
        }
    }, [selectedPoint, activeTab]); // Menghapus formPosko dari dependency list

    const handleMapClick = (latLng: { lat: number; lng: number }) => {
        if (activeTab === 'jalur') {
            setJalurPoints([...jalurPoints, [latLng.lat, latLng.lng]]);
        } else {
            setSelectedPoint(latLng);
        }
    };

    const handlePoskoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormPosko({
            ...formPosko,
            [name]: name === 'kapasitas' ? parseInt(value) || 0 : value,
        });
    };

    const handleSubmitJalur = async (e: React.FormEvent) => {
        e.preventDefault();
        if (jalurPoints.length < 2) {
            toast({
                title: 'Error',
                description: 'Jalur evakuasi harus memiliki minimal 2 titik',
                variant: 'destructive',
            });
            return;
        }

        if (!jalurNama) {
            toast({
                title: 'Error',
                description: 'Nama jalur tidak boleh kosong',
                variant: 'destructive',
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const jalurData = {
                nama: jalurNama,
                koordinat: jalurPoints.map((point) => ({ lat: point[0], lng: point[1] })),
                jenis_bencana: 'semua',
                deskripsi: 'Jalur evakuasi baru',
                warna: '#3B82F6',
            };

            const baseURL = import.meta.env.VITE_API_URL || '';
            await axios.post(`${baseURL}/jalur-evakuasi`, jalurData);

            toast({
                title: 'Sukses',
                description: 'Jalur evakuasi berhasil ditambahkan',
            });

            // Reset form
            setJalurPoints([]);
            setJalurNama('');
        } catch (error: unknown) {
            console.error('Failed to submit evacuation route:', error);
            const errorMessage = error instanceof Error ? error.message : 'Gagal menambahkan jalur evakuasi';

            toast({
                title: 'Error',
                description: errorMessage,
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };
    const handleSubmitPosko = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formPosko.nama || !formPosko.kapasitas || !selectedPoint) {
            toast({
                title: 'Error',
                description: 'Mohon lengkapi semua data posko dan pilih lokasi di peta',
                variant: 'destructive',
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const poskoData = {
                nama: formPosko.nama,
                deskripsi: formPosko.deskripsi || 'Posko evakuasi baru', // Pastikan deskripsi tidak kosong
                kapasitas: formPosko.kapasitas,
                jenis_posko: 'pengungsian',
                status: 'aktif',
                alamat: 'Lokasi posko baru', // Field wajib
                kontak: 'Belum tersedia',
                latitude: formPosko.latitude,
                longitude: formPosko.longitude,
            };

            console.log('Mengirim data posko:', poskoData); // Untuk debugging

            const baseURL = import.meta.env.VITE_API_URL || '';
            // Perhatikan path yang benar: /api/poskos
            const response = await axios.post(`${baseURL}/poskos`, poskoData);

            console.log('Response dari server:', response.data); // Untuk debugging

            toast({
                title: 'Sukses',
                description: 'Posko evakuasi berhasil ditambahkan',
            });

            // Reset form
            setFormPosko({
                nama: '',
                deskripsi: '',
                kapasitas: 0,
                latitude: 0,
                longitude: 0,
            });
            setSelectedPoint(null);
        } catch (error: unknown) {
            console.error('Failed to submit evacuation shelter:', error);

            // Lebih detail dalam penanganan error
            let errorMessage = 'Gagal menambahkan posko evakuasi';

            // Type guard untuk error dengan response property
            if (error && typeof error === 'object' && 'response' in error) {
                type AxiosErrorResponse = {
                    response?: {
                        data?: { message?: string } | string;
                        status?: number;
                    };
                };

                const axiosError = error as AxiosErrorResponse;
                if (axiosError.response?.data) {
                    console.error('Error response:', axiosError.response.data);

                    const responseData = axiosError.response.data;
                    if (typeof responseData === 'object' && responseData.message) {
                        errorMessage = responseData.message;
                    } else if (axiosError.response.status) {
                        errorMessage = `Error ${axiosError.response.status}: ${errorMessage}`;
                    }
                }
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }

            toast({
                title: 'Error',
                description: errorMessage,
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetJalur = () => {
        setJalurPoints([]);
        setJalurNama('');
    };

    // Prepare path for visualization
    const paths =
        jalurPoints.length > 1
            ? [
                  {
                      id: 1,
                      positions: jalurPoints,
                      color: '#3B82F6',
                      name: jalurNama || 'Jalur Baru',
                  },
              ]
            : [];

    // Prepare marker for visualization if a point is selected for posko
    const markers =
        selectedPoint && activeTab === 'posko'
            ? [
                  {
                      id: 999,
                      position: [selectedPoint.lat, selectedPoint.lng] as [number, number],
                      title: formPosko.nama || 'Posko Baru',
                      type: 'shelter',
                      description: formPosko.deskripsi,
                  },
              ]
            : [];

    // Show temporary markers for jalur points
    const jalurMarkers =
        activeTab === 'jalur'
            ? jalurPoints.map((point, index) => ({
                  id: index,
                  position: point,
                  title: `Titik ${index + 1}`,
                  type: 'default',
                  description: `Latitude: ${point[0].toFixed(6)}, Longitude: ${point[1].toFixed(6)}`,
              }))
            : [];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tambah Jalur & Posko Evakuasi" />
            <div className="p-6">
                <div className="space-y-4 sm:space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold sm:text-2xl">Tambah Jalur & Posko Evakuasi</h2>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                if (activeTab === 'jalur') {
                                    resetJalur();
                                } else {
                                    setFormPosko({
                                        nama: '',
                                        deskripsi: '',
                                        kapasitas: 0,
                                        latitude: 0,
                                        longitude: 0,
                                    });
                                    setSelectedPoint(null);
                                }
                            }}
                        >
                            Reset Form
                        </Button>
                    </div>

                    {/* Tab navigation */}
                    <div className="flex space-x-2 border-b">
                        <button
                            className={`px-4 py-2 text-xs sm:text-sm ${
                                activeTab === 'jalur' ? 'border-b-2 border-blue-500 font-medium text-blue-600' : 'text-gray-500 hover:text-gray-700'
                            }`}
                            onClick={() => setActiveTab('jalur')}
                        >
                            Jalur Evakuasi
                        </button>
                        <button
                            className={`px-4 py-2 text-xs sm:text-sm ${
                                activeTab === 'posko' ? 'border-b-2 border-blue-500 font-medium text-blue-600' : 'text-gray-500 hover:text-gray-700'
                            }`}
                            onClick={() => setActiveTab('posko')}
                        >
                            Posko Evakuasi
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
                        {/* Map */}
                        <div>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg">
                                        {activeTab === 'jalur' ? 'Tentukan Jalur Evakuasi' : 'Pilih Lokasi Posko'}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="mb-2 text-xs text-gray-500 sm:text-sm">
                                        {activeTab === 'jalur'
                                            ? 'Klik pada peta untuk menambahkan titik jalur evakuasi'
                                            : 'Klik pada peta untuk menentukan lokasi posko evakuasi'}
                                    </div>
                                    <MapComponent
                                        height="300px"
                                        className="sm:h-[400px]"
                                        markers={[...markers, ...jalurMarkers]}
                                        paths={paths}
                                        zoom={7}
                                        onClick={handleMapClick}
                                        editable={true}
                                    />
                                    {activeTab === 'jalur' && jalurPoints.length > 0 && (
                                        <div className="mt-4">
                                            <p className="mb-2 text-xs sm:text-sm">Titik yang dipilih: {jalurPoints.length}</p>
                                            <Button variant="outline" size="sm" onClick={resetJalur}>
                                                Reset Jalur
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Form */}
                        <div>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg">
                                        {activeTab === 'jalur' ? 'Detail Jalur Evakuasi' : 'Detail Posko Evakuasi'}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {activeTab === 'jalur' ? (
                                        <form onSubmit={handleSubmitJalur} className="space-y-4">
                                            <div>
                                                <label htmlFor="nama" className="mb-2 block text-xs font-medium sm:text-sm">
                                                    Nama Jalur Evakuasi
                                                </label>
                                                <Input
                                                    id="nama"
                                                    value={jalurNama}
                                                    onChange={(e) => setJalurNama(e.target.value)}
                                                    placeholder="Contoh: Jalur Evakuasi Gunung Merapi Sisi Barat"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <p className="mb-2 text-xs font-medium sm:text-sm">Titik Jalur Evakuasi</p>
                                                <div className="rounded border p-3">
                                                    {jalurPoints.length === 0 ? (
                                                        <p className="text-xs text-gray-500 sm:text-sm">
                                                            Belum ada titik yang dipilih. Klik pada peta untuk menambahkan titik.
                                                        </p>
                                                    ) : (
                                                        <div className="max-h-40 overflow-y-auto text-xs">
                                                            {jalurPoints.map((point, index) => (
                                                                <div key={index} className="mb-1">
                                                                    Titik {index + 1}: {point[0].toFixed(6)}, {point[1].toFixed(6)}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <Button type="submit" disabled={isSubmitting || jalurPoints.length < 2 || !jalurNama}>
                                                {isSubmitting ? 'Menyimpan...' : 'Simpan Jalur Evakuasi'}
                                            </Button>
                                        </form>
                                    ) : (
                                        <form onSubmit={handleSubmitPosko} className="space-y-4">
                                            <div>
                                                <label htmlFor="nama" className="mb-2 block text-xs font-medium sm:text-sm">
                                                    Nama Posko
                                                </label>
                                                <Input
                                                    id="nama"
                                                    name="nama"
                                                    value={formPosko.nama}
                                                    onChange={handlePoskoChange}
                                                    placeholder="Contoh: Posko Evakuasi Balai Desa"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="deskripsi" className="mb-2 block text-xs font-medium sm:text-sm">
                                                    Deskripsi
                                                </label>
                                                <Textarea
                                                    id="deskripsi"
                                                    name="deskripsi"
                                                    value={formPosko.deskripsi}
                                                    onChange={handlePoskoChange}
                                                    placeholder="Deskripsi tentang posko evakuasi"
                                                    rows={3}
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="kapasitas" className="mb-2 block text-xs font-medium sm:text-sm">
                                                    Kapasitas (orang)
                                                </label>
                                                <Input
                                                    id="kapasitas"
                                                    name="kapasitas"
                                                    type="number"
                                                    value={formPosko.kapasitas || ''}
                                                    onChange={handlePoskoChange}
                                                    min={1}
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <p className="mb-2 text-xs font-medium sm:text-sm">Lokasi Posko</p>
                                                {selectedPoint ? (
                                                    <div className="rounded border p-3 text-xs sm:text-sm">
                                                        <p>Latitude: {selectedPoint.lat.toFixed(6)}</p>
                                                        <p>Longitude: {selectedPoint.lng.toFixed(6)}</p>
                                                    </div>
                                                ) : (
                                                    <p className="text-xs text-gray-500 sm:text-sm">Klik pada peta untuk menentukan lokasi posko</p>
                                                )}
                                            </div>
                                            <Button
                                                type="submit"
                                                disabled={isSubmitting || !formPosko.nama || !formPosko.kapasitas || !selectedPoint}
                                            >
                                                {isSubmitting ? 'Menyimpan...' : 'Simpan Posko Evakuasi'}
                                            </Button>
                                        </form>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
