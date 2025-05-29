import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/useToast';
import AppLayout from '@/layouts/app-layout';
import axios from '@/lib/axios';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { MapContainer, Marker, Polyline, TileLayer, useMap, useMapEvents } from 'react-leaflet';
// Import Leaflet icon
import { icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Flag, MapPin, RotateCw } from 'lucide-react';
// Add imports for routing functionality
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import { renderToString } from 'react-dom/server';

// Add shelter icon definition just like in PoskoForm
const shelterIcon = icon({
    iconUrl: '/icons/posko.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
});

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

// Add routing control component similar to EvacuationRouteForm
const RoutingMachine = ({
    startPoint,
    endPoint,
    onRouteFound,
}: {
    startPoint: [number, number] | null;
    endPoint: [number, number] | null;
    onRouteFound?: (coordinates: [number, number][]) => void;
}) => {
    const map = useMap();
    const routingControlRef = useRef<L.Routing.Control | null>(null);
    const routeNotifiedRef = useRef(false);

    useEffect(() => {
        if (!startPoint || !endPoint) {
            // Clean up previous routing if any
            if (routingControlRef.current) {
                routingControlRef.current.remove();
                routingControlRef.current = null;
            }
            routeNotifiedRef.current = false;
            return;
        }

        // Create routing control
        const routingControl = L.Routing.control({
            waypoints: [L.latLng(startPoint[0], startPoint[1]), L.latLng(endPoint[0], endPoint[1])],
            routeWhileDragging: true,
            lineOptions: {
                styles: [{ color: '#3B82F6', opacity: 0.7, weight: 5 }],
                extendToWaypoints: true,
                missingRouteTolerance: 0,
            },
            show: false, // Don't show turn-by-turn instructions
            addWaypoints: false, // Disable adding waypoints by clicking on route
        }).addTo(map);

        // Capture the route points when a route is calculated
        routingControl.on('routesfound', function (e) {
            const routes = e.routes;
            if (routes && routes.length > 0) {
                const coordinates: [number, number][] = routes[0].coordinates.map(
                    (coord: { lat: number; lng: number }) => [coord.lat, coord.lng] as [number, number],
                );

                if (onRouteFound && !routeNotifiedRef.current) {
                    onRouteFound(coordinates);
                    routeNotifiedRef.current = true;
                }
            }
        });

        routingControlRef.current = routingControl;

        // Clean up on unmount
        return () => {
            if (routingControlRef.current) {
                routingControlRef.current.remove();
            }
        };
    }, [map, startPoint, endPoint, onRouteFound]);

    return null;
};

// Create a PolylineCreator component similar to EvacuationRouteForm
const PolylineCreator = ({
    points,
    setPoints,
    color = '#3B82F6',
    isRoutingMode = false,
    onPointClick,
}: {
    points: [number, number][];
    setPoints: React.Dispatch<React.SetStateAction<[number, number][]>>;
    color: string;
    isRoutingMode?: boolean;
    onPointClick?: (position: [number, number]) => void;
}) => {
    useMapEvents({
        click: (e) => {
            const { lat, lng } = e.latlng;
            const newPoint: [number, number] = [lat, lng];

            if (isRoutingMode && onPointClick) {
                onPointClick(newPoint);
            } else if (!isRoutingMode) {
                setPoints((current) => [...current, newPoint]);
            }
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

// Create a MarkerCreator component for the posko tab
const MarkerCreator = ({
    selectedPoint,
    setSelectedPoint,
}: {
    selectedPoint: { lat: number; lng: number } | null;
    setSelectedPoint: React.Dispatch<React.SetStateAction<{ lat: number; lng: number } | null>>;
}) => {
    useMapEvents({
        click: (e) => {
            const { lat, lng } = e.latlng;
            setSelectedPoint({ lat, lng });
        },
    });

    // Use shelterIcon here for the marker
    return selectedPoint ? <Marker position={[selectedPoint.lat, selectedPoint.lng]} icon={shelterIcon} /> : null;
};

export default function AddEvacuationAndShelter() {
    const [activeTab, setActiveTab] = useState<'jalur' | 'posko'>('jalur');
    const [jalurPoints, setJalurPoints] = useState<Array<[number, number]>>([]);
    const [jalurNama, setJalurNama] = useState('');

    // Add routing mode state
    const [startPoint, setStartPoint] = useState<[number, number] | null>(null);
    const [endPoint, setEndPoint] = useState<[number, number] | null>(null);
    const [routePoints, setRoutePoints] = useState<[number, number][]>([]);
    const [isRouteFound, setIsRouteFound] = useState(false);
    const routeNotificationShownRef = useRef(false);

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

    const handlePoskoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormPosko({
            ...formPosko,
            [name]: name === 'kapasitas' ? parseInt(value) || 0 : value,
        });
    };

    // Handle routing point selection
    const handleRoutingPointClick = (position: [number, number]) => {
        if (!startPoint) {
            setStartPoint(position);
            toast({
                title: 'Titik Awal',
                description: 'Titik awal rute ditentukan. Silahkan tentukan titik tujuan.',
            });
        } else if (!endPoint) {
            setEndPoint(position);
            toast({
                title: 'Titik Tujuan',
                description: 'Titik tujuan ditentukan. Mencari rute terbaik...',
            });
        } else {
            // Reset and start new route
            setStartPoint(position);
            setEndPoint(null);
            setRoutePoints([]);
            setIsRouteFound(false);
            toast({
                title: 'Titik Awal Baru',
                description: 'Titik awal baru ditentukan. Silahkan tentukan titik tujuan.',
            });
        }
    };

    // Handle when a route is found
    const handleRouteFound = (coordinates: [number, number][]) => {
        if (!routeNotificationShownRef.current) {
            setRoutePoints(coordinates);
            setIsRouteFound(true);
            toast({
                title: 'Rute Ditemukan',
                description: `Rute terbaik dengan ${coordinates.length} titik telah ditemukan.`,
            });
            routeNotificationShownRef.current = true;
        } else {
            // Just update the coordinates without showing notification again
            setRoutePoints(coordinates);
            setIsRouteFound(true);
        }
    };

    // Add route points to evacuation path
    const addRouteToEvacuationPath = () => {
        if (routePoints.length > 0) {
            setJalurPoints([...routePoints]);
            toast({
                title: 'Rute Ditambahkan',
                description: `${routePoints.length} titik rute ditambahkan ke jalur evakuasi.`,
            });
            // Reset routing
            resetRouting();
        }
    };

    // Reset routing
    const resetRouting = () => {
        setStartPoint(null);
        setEndPoint(null);
        setRoutePoints([]);
        setIsRouteFound(false);
        routeNotificationShownRef.current = false;
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
            resetRouting();
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
        resetRouting();
    };

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
                                            ? 'Klik pada peta untuk menentukan titik awal dan tujuan rute'
                                            : 'Klik pada peta untuk menentukan lokasi posko evakuasi'}
                                    </div>

                                    {/* Replace your MapComponent with MapContainer */}
                                    <div className="h-[300px] w-full overflow-hidden rounded-md sm:h-[400px]">
                                        <MapContainer center={[-7.150975, 110.140259]} zoom={7} style={{ height: '100%', width: '100%' }}>
                                            <TileLayer
                                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                            />

                                            {activeTab === 'jalur' ? (
                                                <>
                                                    <PolylineCreator
                                                        points={jalurPoints}
                                                        setPoints={setJalurPoints}
                                                        color="#3B82F6"
                                                        isRoutingMode={true}
                                                        onPointClick={handleRoutingPointClick}
                                                    />

                                                    {/* Routing Machine */}
                                                    <RoutingMachine startPoint={startPoint} endPoint={endPoint} onRouteFound={handleRouteFound} />

                                                    {/* Route start and end markers */}
                                                    {startPoint && (
                                                        <Marker
                                                            position={startPoint}
                                                            icon={L.divIcon({
                                                                html: renderToString(<Flag className="h-6 w-6 text-green-600" />),
                                                                className: 'custom-div-icon',
                                                                iconSize: [24, 24],
                                                                iconAnchor: [12, 24],
                                                            })}
                                                        />
                                                    )}
                                                    {endPoint && (
                                                        <Marker
                                                            position={endPoint}
                                                            icon={L.divIcon({
                                                                html: renderToString(<MapPin className="h-6 w-6 text-red-600" />),
                                                                className: 'custom-div-icon',
                                                                iconSize: [24, 24],
                                                                iconAnchor: [12, 24],
                                                            })}
                                                        />
                                                    )}

                                                    {/* Display route points as polyline */}
                                                    {routePoints.length > 0 && (
                                                        <Polyline
                                                            positions={routePoints}
                                                            pathOptions={{
                                                                color: '#4f46e5',
                                                                weight: 5,
                                                                dashArray: '10, 5',
                                                                opacity: 0.7,
                                                            }}
                                                        />
                                                    )}
                                                </>
                                            ) : (
                                                <MarkerCreator selectedPoint={selectedPoint} setSelectedPoint={setSelectedPoint} />
                                            )}
                                        </MapContainer>
                                    </div>

                                    {activeTab === 'jalur' && (
                                        <div className="mt-4">
                                            <div className="flex flex-wrap items-center gap-3">
                                                <Button type="button" variant="outline" onClick={resetRouting} size="sm">
                                                    <RotateCw className="mr-1 h-4 w-4" /> Reset Rute
                                                </Button>

                                                {isRouteFound && (
                                                    <Button type="button" onClick={addRouteToEvacuationPath} size="sm">
                                                        Tambahkan Rute ke Jalur
                                                    </Button>
                                                )}

                                                <div className="text-sm text-gray-500">
                                                    {!startPoint && 'Klik untuk menentukan titik awal'}
                                                    {startPoint && !endPoint && 'Klik untuk menentukan titik tujuan'}
                                                    {startPoint && endPoint && !isRouteFound && 'Mencari rute terbaik...'}
                                                    {isRouteFound && `${routePoints.length} titik rute ditemukan`}
                                                </div>
                                            </div>

                                            {jalurPoints.length > 0 && (
                                                <div className="mt-2">
                                                    <p className="mb-2 text-xs sm:text-sm">Titik yang dipilih: {jalurPoints.length}</p>
                                                    <Button variant="outline" size="sm" onClick={resetJalur}>
                                                        Reset Jalur
                                                    </Button>
                                                </div>
                                            )}
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
