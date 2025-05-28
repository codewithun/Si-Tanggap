import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/useToast';
import axios from '@/lib/axios';
import L from 'leaflet';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMapEvents } from 'react-leaflet';

// Define risk levels for filtering
type RiskLevel = 'tinggi' | 'sedang' | 'rendah' | 'semua';

// Define hazard layer types
type HazardLayerType =
    | 'banjir'
    | 'banjir_bandang'
    | 'cuaca_ekstrim'
    | 'gelombang_ekstrim'
    | 'gempabumi'
    | 'kebakaran_hutan'
    | 'kekeringan'
    | 'letusan_gunung_api'
    | 'likuefaksi'
    | 'multi_bahaya'
    | 'tanah_longsor'
    | 'tsunami'
    | 'covid19';

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
    tingkat_bahaya?: RiskLevel;
}

// Interface for USGS earthquake data
interface EarthquakeFeature {
    type: 'Feature';
    properties: {
        mag: number;
        place: string;
        time: number;
        url: string;
        title: string;
    };
    geometry: {
        type: 'Point';
        coordinates: [number, number, number]; // [longitude, latitude, depth]
    };
}

interface JalurEvakuasi {
    id: number;
    nama: string;
    deskripsi: string;
    koordinat: Array<{ lat: number; lng: number }>;
    jenis_bencana: string;
    warna: string;
}

interface Posko {
    id: number;
    nama: string;
    deskripsi: string;
    alamat: string;
    kontak: string;
    jenis_posko: string;
    status: string;
    latitude: number;
    longitude: number;
}

const disasterIcon = L.icon({
    iconUrl: '/icons/gempa.svg', // Changed from '/icons/disaster-marker.svg' to match relawan version
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
});

const shelterIcon = L.icon({
    iconUrl: '/icons/posko.png',
    iconSize: [38, 38], // Make slightly larger than disaster icons
    iconAnchor: [19, 38],
    popupAnchor: [0, -38],
});

// Helper function to convert disaster type to hazard layer type
function disasterToHazardLayer(jenisBencana: string): HazardLayerType {
    const mapping: Record<string, HazardLayerType> = {
        banjir: 'banjir',
        longsor: 'tanah_longsor',
        gempa: 'gempabumi',
        tsunami: 'tsunami',
        kebakaran: 'kebakaran_hutan',
        angin_topan: 'cuaca_ekstrim',
        kekeringan: 'kekeringan',
    };
    return mapping[jenisBencana] || 'multi_bahaya';
}

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
    const [earthquakes, setEarthquakes] = useState<EarthquakeFeature[]>([]);
    const [jalurEvakuasi, setJalurEvakuasi] = useState<JalurEvakuasi[]>([]);
    const [posko, setPosko] = useState<Posko[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshCount, setRefreshCount] = useState(0);

    // Form state
    const [judul, setJudul] = useState('');
    const [jenisBencana, setJenisBencana] = useState('');
    const [deskripsi, setDeskripsi] = useState('');
    const [lokasi, setLokasi] = useState('');
    const [position, setPosition] = useState<[number, number] | null>(null);
    const [saving, setSaving] = useState(false);

    // Map controls from MapKeseluruhan
    const [mapType, setMapType] = useState<'standard' | 'satellite' | 'terrain'>('standard');
    const [selectedHazardLayers, setSelectedHazardLayers] = useState<HazardLayerType[]>(['gempabumi']);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Layer visibility toggles - set shelters to true by default
    const [showDisasters, setShowDisasters] = useState(true);
    const [showShelters, setShowShelters] = useState(true);
    const [showEvacRoutes, setShowEvacRoutes] = useState(true);

    // Add filter for shelter types
    const [shelterTypeFilter, setShelterTypeFilter] = useState<string | 'all'>('all');

    const { toast } = useToast();

    // Get risk level based on description or other factors
    const getRiskLevel = (disaster: Bencana): RiskLevel => {
        if (disaster.tingkat_bahaya) {
            return disaster.tingkat_bahaya;
        }

        const desc = disaster.deskripsi?.toLowerCase() || '';
        if (
            desc.includes('parah') ||
            desc.includes('besar') ||
            desc.includes('darurat') ||
            disaster.jenis_bencana === 'gempa' ||
            disaster.jenis_bencana === 'tsunami'
        ) {
            return 'tinggi';
        } else if (desc.includes('sedang') || disaster.jenis_bencana === 'banjir' || disaster.jenis_bencana === 'kebakaran') {
            return 'sedang';
        }
        return 'rendah';
    };

    const fetchBencanaPoints = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axios.get('/laporans');

            // Handle both paginated and non-paginated responses
            const data = response.data.data || response.data;

            if (Array.isArray(data)) {
                // Filter only verified reports
                const verifiedReports = data.filter((report) => report.status === 'diverifikasi');

                // Add risk level to each disaster
                const enhancedData = verifiedReports.map((disaster: Bencana) => ({
                    ...disaster,
                    tingkat_bahaya: getRiskLevel(disaster),
                }));

                setBencanaPoints(enhancedData);
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

    // Fetch USGS earthquake data
    const fetchEarthquakeData = useCallback(async () => {
        try {
            const today = new Date();
            const endtime = today.toISOString().split('T')[0];

            const pastDate = new Date();
            pastDate.setMonth(today.getMonth() - 1); // Get last month's data
            const starttime = pastDate.toISOString().split('T')[0];

            const url = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=${starttime}&endtime=${endtime}&minlatitude=-11&maxlatitude=6.1&minlongitude=94&maxlongitude=141&orderby=time&limit=50`;

            const response = await fetch(url);
            const data = await response.json();
            setEarthquakes(data.features || []);
        } catch (error) {
            console.error('Gagal ambil data gempa:', error);
            toast({
                title: 'Error',
                description: 'Gagal memuat data gempa USGS',
                variant: 'destructive',
            });
        }
    }, [toast]);

    const fetchJalurEvakuasi = useCallback(async () => {
        try {
            const response = await axios.get('/jalur-evakuasi');
            setJalurEvakuasi(response.data.data);
            return response.data.data;
        } catch (error: unknown) {
            console.error('Failed to fetch evacuation routes:', error);
            const errorMessage = error instanceof Error ? error.message : 'Gagal memuat data jalur evakuasi';
            toast({
                title: 'Error',
                description: errorMessage,
                variant: 'destructive',
            });
            return [];
        }
    }, [toast]);

    const fetchPosko = useCallback(async () => {
        try {
            const response = await axios.get('/poskos');
            const poskoData = Array.isArray(response.data) ? response.data : response.data.data;
            setPosko(poskoData || []);
            return poskoData || [];
        } catch (error: unknown) {
            console.error('Failed to fetch evacuation shelters:', error);
            const errorMessage = error instanceof Error ? error.message : 'Gagal memuat data posko evakuasi';
            toast({
                title: 'Error',
                description: errorMessage,
                variant: 'destructive',
            });
            setPosko([]);
            return [];
        }
    }, [toast]);

    useEffect(() => {
        Promise.all([fetchBencanaPoints(), fetchEarthquakeData(), fetchJalurEvakuasi(), fetchPosko()])
            .catch(() => {
                // Error handling is done in the individual functions
            })
            .finally(() => {
                setLoading(false);
            });
    }, [fetchBencanaPoints, fetchEarthquakeData, fetchJalurEvakuasi, fetchPosko, refreshCount]);

    // Transform posko markers with better formatting
    const shelterMarkers = useMemo(() => {
        if (!showShelters || !posko.length) return [];

        return posko
            .filter((p) => shelterTypeFilter === 'all' || p.jenis_posko === shelterTypeFilter)
            .map((p) => ({
                id: `shelter-${p.id}`,
                position: [p.latitude, p.longitude] as [number, number],
                title: p.nama,
                jenis_bencana: 'shelter',
                status: 'diverifikasi' as 'diverifikasi' | 'menunggu' | 'ditolak',
                type: 'shelter',
                jenis_posko: p.jenis_posko,
                description: `${p.deskripsi || ''}`, // Keep main description as is
                alamat: p.alamat || 'Tidak tersedia',
                kontak: p.kontak || 'Tidak tersedia',
                jenis: p.jenis_posko || 'Tidak tersedia',
                statusPosko: p.status || 'Aktif',
            }));
    }, [posko, showShelters, shelterTypeFilter]);

    // Define marker interface to include optional jenis_posko
    interface MapMarker {
        id: string;
        position: [number, number];
        title: string;
        jenis_bencana: string;
        status: 'diverifikasi' | 'menunggu' | 'ditolak';
        type: string;
        description: string;
        jenis_posko?: string;
        originalData?: Bencana; // Changed from any to Bencana
    }

    const [editMode, setEditMode] = useState(false);
    const [selectedDisaster, setSelectedDisaster] = useState<Bencana | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const allMarkers = useMemo(
        () =>
            [
                ...(showDisasters
                    ? [
                          ...(bencanaPoints.map((disaster) => ({
                              id: `disaster-${disaster.id}`,
                              position: [disaster.latitude, disaster.longitude] as [number, number],
                              title: disaster.judul || disaster.jenis_bencana,
                              jenis_bencana: disaster.jenis_bencana,
                              status: disaster.status as 'diverifikasi' | 'menunggu' | 'ditolak',
                              type: 'disaster',
                              originalData: disaster, // Store the original data for edit/delete operations
                              description: `
                        Jenis: ${disaster.jenis_bencana || 'Tidak diketahui'}
                        Tanggal: ${new Date(disaster.created_at).toLocaleDateString('id-ID')}
                        Lokasi: ${disaster.lokasi || 'Tidak diketahui'}
                        Status: ${disaster.status || 'Tidak diketahui'}
                        Tingkat Bahaya: ${disaster.tingkat_bahaya || 'Tidak diketahui'}
                        Deskripsi: ${disaster.deskripsi || 'Tidak ada deskripsi'}
                    `,
                          })) as MapMarker[]),
                          ...(earthquakes.map((quake) => ({
                              id: `earthquake-${quake.properties.time}`,
                              position: [quake.geometry.coordinates[1], quake.geometry.coordinates[0]] as [number, number],
                              title: `Gempa ${quake.properties.mag} SR - ${quake.properties.place}`,
                              jenis_bencana: 'gempa',
                              status: 'diverifikasi' as 'diverifikasi' | 'menunggu' | 'ditolak',
                              type: 'earthquake',
                              description: `
                    Magnitude: ${quake.properties.mag}
                    Lokasi: ${quake.properties.place}
                    Waktu: ${new Date(quake.properties.time).toLocaleString('id-ID')}
                    Info lebih lanjut: ${quake.properties.url}
                `,
                          })) as MapMarker[]),
                      ]
                    : []),
                ...shelterMarkers,
            ] as MapMarker[],
        [bencanaPoints, earthquakes, shelterMarkers, showDisasters],
    );

    // Get valid evacuation routes
    const validPaths = useMemo(() => {
        if (!showEvacRoutes) return [];

        return jalurEvakuasi.filter((jalur) => {
            return (
                jalur.koordinat &&
                Array.isArray(jalur.koordinat) &&
                jalur.koordinat.length >= 2 &&
                jalur.koordinat.every((point) => point && typeof point.lat === 'number' && typeof point.lng === 'number')
            );
        });
    }, [jalurEvakuasi, showEvacRoutes]);

    // State to store filtered markers
    const [filteredMarkers, setFilteredMarkers] = useState<typeof allMarkers>([]);

    // Filter markers based on selected layers
    const filterMarkers = useCallback(() => {
        if (!allMarkers.length) return;

        const filtered = allMarkers.filter((marker) => {
            // Always include shelter markers when shelters are visible
            if (marker.type === 'shelter') {
                return true;
            }

            // Filter earthquake markers
            if (marker.id.startsWith('earthquake-')) {
                return selectedHazardLayers.includes('gempabumi');
            }

            // Filter other disaster markers
            const hazardLayer = disasterToHazardLayer(marker.jenis_bencana);
            return selectedHazardLayers.includes(hazardLayer);
        });

        setFilteredMarkers(filtered);
    }, [allMarkers, selectedHazardLayers]);

    // Handle hazard layer selection
    const handleHazardLayerChange = (type: HazardLayerType, checked: boolean) => {
        if (checked) {
            setSelectedHazardLayers((prev) => [...prev, type]);
        } else {
            setSelectedHazardLayers((prev) => prev.filter((t) => t !== type));
        }
    };

    // Update markers when filters change
    useEffect(() => {
        filterMarkers();
    }, [filterMarkers, selectedHazardLayers, showShelters, showDisasters]);

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

    // Enhanced marker icon selector with different appearances for shelters by type
    const getMarkerIcon = (type: string) => {
        if (type === 'shelter') {
            return shelterIcon;
        }
        return disasterIcon;
    };

    // Function to handle editing a disaster
    const handleEditDisaster = (disaster: Bencana) => {
        setSelectedDisaster(disaster);
        setJudul(disaster.judul);
        setJenisBencana(disaster.jenis_bencana);
        setDeskripsi(disaster.deskripsi);
        setLokasi(disaster.lokasi);
        setPosition([disaster.latitude, disaster.longitude]);
        setEditMode(true);

        // Scroll to form
        setTimeout(() => {
            const formElement = document.getElementById('disaster-form');
            if (formElement) {
                formElement.scrollIntoView({ behavior: 'smooth' });
            }
        }, 100);
    };

    // Function to handle deleting a disaster
    const handleDeleteDisaster = async (id: number) => {
        try {
            setSaving(true);
            await axios.delete(`/laporans/${id}`);
            toast({ title: 'Berhasil', description: 'Bencana berhasil dihapus.' });
            setRefreshCount((c) => c + 1);
            setShowDeleteConfirm(false);
            setDeletingId(null);
        } catch (error: unknown) {
            const axiosError = error as { response?: { data?: { message?: string } } };
            toast({
                title: 'Error',
                description: axiosError.response?.data?.message || 'Gagal menghapus bencana',
                variant: 'destructive',
            });
        } finally {
            setSaving(false);
        }
    };

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
            const disasterData = {
                judul,
                jenis_bencana: jenisBencana,
                deskripsi,
                lokasi,
                latitude: position[0],
                longitude: position[1],
            };

            if (editMode && selectedDisaster) {
                // Update existing disaster
                await axios.put(`/laporans/${selectedDisaster.id}`, disasterData);
                toast({ title: 'Berhasil', description: 'Bencana berhasil diperbarui.' });
            } else {
                // Create new disaster
                await axios.post('/laporans', disasterData);
                toast({ title: 'Berhasil', description: 'Bencana berhasil ditambahkan & menunggu verifikasi.' });
            }

            // Reset form
            resetForm();
            setRefreshCount((c) => c + 1);
        } catch (error: unknown) {
            const axiosError = error as { response?: { data?: { message?: string } } };
            toast({
                title: 'Error',
                description: axiosError.response?.data?.message || 'Gagal menyimpan bencana',
                variant: 'destructive',
            });
        } finally {
            setSaving(false);
        }
    };

    // Function to reset the form
    const resetForm = () => {
        setJudul('');
        setJenisBencana('');
        setDeskripsi('');
        setLokasi('');
        setPosition(null);
        setEditMode(false);
        setSelectedDisaster(null);
    };

    // Add custom CSS for wider popups when component mounts
    useEffect(() => {
        // Add custom style for wider popups
        const style = document.createElement('style');
        style.textContent = `
            .leaflet-popup-content {
                min-width: 260px !important;
                max-width: 300px;
            }
            .disaster-popup-content {
                white-space: pre-line;
                line-height: 1.5;
            }
            .disaster-popup-content div {
                margin-bottom: 2px;
            }
            /* Control map z-index to prevent overlapping UI elements */
            .leaflet-container {
                z-index: 1 !important;
            }
            .leaflet-pane,
            .leaflet-control,
            .leaflet-top,
            .leaflet-bottom {
                z-index: 400 !important;
            }
            /* Higher z-index for form dialogs and overlays */
            .dialog-overlay,
            .form-overlay {
                z-index: 500 !important;
            }
        `;
        document.head.appendChild(style);

        return () => {
            document.head.removeChild(style);
        };
    }, []);

    // Format description for better readability
    const formatDescription = (description: string) => {
        const lines = description
            .trim()
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean);

        return (
            <div className="disaster-popup-content">
                {lines.map((line, index) => (
                    <div key={index}>{line}</div>
                ))}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold sm:text-2xl">Peta Titik Bencana</h2>
                <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => setSidebarOpen((v) => !v)}>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="mr-2"
                        >
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <path d="M9 3v18M3 9h18" />
                        </svg>
                        Layer
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setRefreshCount((c) => c + 1)} disabled={loading}>
                        {loading ? 'Memuat...' : 'Refresh'}
                    </Button>
                </div>
            </div>

            {/* Peta Titik Bencana */}
            <div className="space-y-2 sm:space-y-4">
                <h3 className="text-lg font-semibold">Peta Titik Bencana Terverifikasi</h3>

                <div className="relative overflow-hidden">
                    {/* Main Map Area with dynamic padding */}
                    <div
                        className={`h-[300px] w-full overflow-hidden rounded-lg transition-all duration-300 sm:h-[600px] ${
                            sidebarOpen ? 'sm:pr-[300px]' : ''
                        }`}
                    >
                        {loading ? (
                            <div className="h-full w-full animate-pulse rounded-lg bg-gray-200"></div>
                        ) : bencanaPoints.length === 0 && earthquakes.length === 0 && posko.length === 0 && validPaths.length === 0 ? (
                            <div className="flex h-full w-full items-center justify-center rounded-lg border border-dashed">
                                <div className="text-center">
                                    <p className="text-lg font-medium text-gray-600">Tidak ada data tersedia</p>
                                    <p className="text-sm text-gray-500">Belum ada titik bencana, posko, atau jalur evakuasi</p>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full w-full">
                                <MapContainer center={[-2.5489, 118.0149]} zoom={5} style={{ height: '100%', width: '100%' }}>
                                    <TileLayer attribution={getTileLayerAttribution()} url={getTileLayerUrl()} />

                                    {/* Render all markers */}
                                    {filteredMarkers.map((marker) => (
                                        <Marker key={marker.id} position={marker.position} icon={getMarkerIcon(marker.type)}>
                                            <Popup className="wider-popup">
                                                <div className="font-bold">{marker.title}</div>
                                                {marker.type === 'shelter' && (
                                                    <>
                                                        <div className="mt-2 text-xs">{marker.description}</div>
                                                        <div className="disaster-popup-content mt-2 text-xs">
                                                            <div>
                                                                <span className="font-semibold">Alamat:</span>{' '}
                                                                {(marker as unknown as { alamat: string }).alamat}
                                                            </div>
                                                            <div>
                                                                <span className="font-semibold">Kontak:</span>{' '}
                                                                {(marker as unknown as { kontak: string }).kontak}
                                                            </div>
                                                            <div>
                                                                <span className="font-semibold">Jenis:</span>{' '}
                                                                {(marker as unknown as { jenis: string }).jenis}
                                                            </div>
                                                            <div>
                                                                <span className="font-semibold">Status:</span>{' '}
                                                                {(marker as unknown as { statusPosko: string }).statusPosko}
                                                            </div>
                                                        </div>
                                                    </>
                                                )}
                                                {marker.type === 'disaster' && (
                                                    <>
                                                        <div className="mt-2 text-xs">{formatDescription(marker.description)}</div>
                                                        <div className="mt-3 flex justify-end space-x-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="h-7 text-xs"
                                                                onClick={() => {
                                                                    if (marker.originalData) {
                                                                        handleEditDisaster(marker.originalData);
                                                                    }
                                                                }}
                                                            >
                                                                Edit
                                                            </Button>
                                                            <Button
                                                                variant="destructive"
                                                                size="sm"
                                                                className="h-7 text-xs"
                                                                onClick={() => {
                                                                    if (marker.originalData) {
                                                                        setDeletingId(marker.originalData.id);
                                                                        setShowDeleteConfirm(true);
                                                                    }
                                                                }}
                                                            >
                                                                Hapus
                                                            </Button>
                                                        </div>
                                                    </>
                                                )}
                                                {marker.type === 'earthquake' && (
                                                    <div className="mt-2 text-xs">{formatDescription(marker.description)}</div>
                                                )}
                                            </Popup>
                                        </Marker>
                                    ))}

                                    {/* Render evacuation routes */}
                                    {validPaths.map((jalur) => (
                                        <Polyline
                                            key={`jalur-${jalur.id}`}
                                            positions={jalur.koordinat.map((point) => [point.lat, point.lng])}
                                            pathOptions={{
                                                color: jalur.warna || '#3B82F6',
                                                weight: 4,
                                                opacity: 0.7,
                                            }}
                                        >
                                            <Popup>
                                                <div className="font-bold">{jalur.nama}</div>
                                                <div className="text-xs">{jalur.deskripsi}</div>
                                                <div className="mt-2 text-xs">
                                                    <span className="font-semibold">Jenis Bencana:</span> {jalur.jenis_bencana || 'Umum'}
                                                </div>
                                            </Popup>
                                        </Polyline>
                                    ))}
                                </MapContainer>
                            </div>
                        )}
                    </div>

                    {/* Floating Layer Panel */}
                    <div
                        id="layer-drawer"
                        className={`absolute top-0 right-0 z-30 h-[300px] w-[300px] overflow-hidden border-l border-slate-200 bg-white shadow-xl transition-transform duration-300 sm:h-[600px] ${
                            sidebarOpen ? 'translate-x-0' : 'translate-x-full'
                        }`}
                    >
                        <div className="h-full overflow-x-hidden overflow-y-auto">
                            <div className="flex items-center justify-between border-b border-slate-200 p-3">
                                <h3 className="text-sm font-medium">Layer Control</h3>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 rounded-full p-0 hover:bg-gray-100"
                                    onClick={() => setSidebarOpen(false)}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="14"
                                        height="14"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M18 6L6 18M6 6l12 12" />
                                    </svg>
                                </Button>
                            </div>

                            <div className="space-y-4 p-3">
                                {/* Map Type Section */}
                                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                                    <div className="border-b border-slate-200 p-2">
                                        <h4 className="text-xs font-medium text-slate-800">Tipe Peta</h4>
                                    </div>
                                    <div className="p-2">
                                        <RadioGroup
                                            value={mapType}
                                            onValueChange={(value: 'standard' | 'satellite' | 'terrain') => setMapType(value)}
                                        >
                                            <div className="grid grid-cols-3 gap-2">
                                                <div>
                                                    <RadioGroupItem value="standard" id="standard" className="peer sr-only" />
                                                    <Label
                                                        htmlFor="standard"
                                                        className="flex cursor-pointer flex-col items-center gap-1 rounded-lg border-2 border-transparent p-2 transition-all peer-data-[state=checked]:border-blue-600 peer-data-[state=checked]:bg-blue-50 hover:border-slate-300 hover:bg-slate-50"
                                                    >
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            width="20"
                                                            height="20"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="2"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            className="text-slate-600 peer-data-[state=checked]:text-blue-600"
                                                        >
                                                            <rect width="18" height="18" x="3" y="3" rx="2" />
                                                            <path d="M3 9h18" />
                                                            <path d="M9 3v18" />
                                                        </svg>
                                                        <span className="text-xs font-medium">Standar</span>
                                                    </Label>
                                                </div>
                                                <div>
                                                    <RadioGroupItem value="satellite" id="satellite" className="peer sr-only" />
                                                    <Label
                                                        htmlFor="satellite"
                                                        className="flex cursor-pointer flex-col items-center gap-1 rounded-lg border-2 border-transparent p-2 transition-all peer-data-[state=checked]:border-blue-600 peer-data-[state=checked]:bg-blue-50 hover:border-slate-300 hover:bg-slate-50"
                                                    >
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            width="20"
                                                            height="20"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="2"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            className="text-slate-600 peer-data-[state=checked]:text-blue-600"
                                                        >
                                                            <path d="M12 12a4 4 0 0 0-4-4 4 4 0 0 0-4 4 4 4 0 0 0 4 4 4 4 0 0 0 4-4Z" />
                                                            <path d="M15 15l2-2" />
                                                        </svg>
                                                        <span className="text-xs font-medium">Satelit</span>
                                                    </Label>
                                                </div>
                                                <div>
                                                    <RadioGroupItem value="terrain" id="terrain" className="peer sr-only" />
                                                    <Label
                                                        htmlFor="terrain"
                                                        className="flex cursor-pointer flex-col items-center gap-1 rounded-lg border-2 border-transparent p-2 transition-all peer-data-[state=checked]:border-blue-600 peer-data-[state=checked]:bg-blue-50 hover:border-slate-300 hover:bg-slate-50"
                                                    >
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            width="20"
                                                            height="20"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="2"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            className="text-slate-600 peer-data-[state=checked]:text-blue-600"
                                                        >
                                                            <path d="M22 19h-6l-4-4-4 4H2" />
                                                            <path d="M2 19 12 5l10 14" />
                                                        </svg>
                                                        <span className="text-xs font-medium">Terrain</span>
                                                    </Label>
                                                </div>
                                            </div>
                                        </RadioGroup>
                                    </div>
                                </div>

                                {/* Enhanced Data Layer Types */}
                                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                                    <div className="flex items-center justify-between border-b border-slate-200 p-2">
                                        <h4 className="text-xs font-medium text-slate-800">Tipe Data</h4>
                                    </div>
                                    <div className="p-2">
                                        <div className="space-y-2">
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="show-disasters"
                                                    checked={showDisasters}
                                                    onCheckedChange={(checked) => setShowDisasters(checked as boolean)}
                                                />
                                                <Label htmlFor="show-disasters">Titik Bencana</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="show-shelters"
                                                    checked={showShelters}
                                                    onCheckedChange={(checked) => setShowShelters(checked as boolean)}
                                                />
                                                <Label htmlFor="show-shelters">Posko Evakuasi</Label>
                                            </div>

                                            {/* Shelter type filter */}
                                            {showShelters && (
                                                <div className="mt-1 ml-6 space-y-2 border-l-2 border-gray-200 pl-2">
                                                    <div className="text-xs text-gray-500">Filter Jenis Posko:</div>
                                                    <Select value={shelterTypeFilter} onValueChange={(v) => setShelterTypeFilter(v)}>
                                                        <SelectTrigger className="h-7 text-xs">
                                                            <SelectValue placeholder="Semua Jenis" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="all">Semua Jenis</SelectItem>
                                                            <SelectItem value="pengungsian">Pengungsian</SelectItem>
                                                            <SelectItem value="kesehatan">Kesehatan</SelectItem>
                                                            <SelectItem value="logistik">Logistik</SelectItem>
                                                            <SelectItem value="dapur-umum">Dapur Umum</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            )}

                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="show-evacroutes"
                                                    checked={showEvacRoutes}
                                                    onCheckedChange={(checked) => setShowEvacRoutes(checked as boolean)}
                                                />
                                                <Label htmlFor="show-evacroutes">Jalur Evakuasi</Label>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Hazard Layers Section */}
                                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                                    <div className="flex items-center justify-between border-b border-slate-200 p-2">
                                        <h4 className="text-xs font-medium text-slate-800">Jenis Bahaya</h4>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 px-2 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                            onClick={() => {
                                                setSelectedHazardLayers([]);
                                            }}
                                        >
                                            Reset
                                        </Button>
                                    </div>
                                    <div className="max-h-[200px] overflow-y-auto p-2">
                                        <div className="space-y-1">
                                            {(
                                                [
                                                    { id: 'banjir', label: 'Banjir' },
                                                    { id: 'banjir_bandang', label: 'Banjir Bandang' },
                                                    { id: 'cuaca_ekstrim', label: 'Cuaca Ekstrim' },
                                                    { id: 'gelombang_ekstrim', label: 'Gelombang Ekstrim' },
                                                    { id: 'gempabumi', label: 'Gempabumi' },
                                                    { id: 'kebakaran_hutan', label: 'Kebakaran' },
                                                    { id: 'kekeringan', label: 'Kekeringan' },
                                                    { id: 'letusan_gunung_api', label: 'Gunung Api' },
                                                    { id: 'tanah_longsor', label: 'Tanah Longsor' },
                                                    { id: 'tsunami', label: 'Tsunami' },
                                                    { id: 'multi_bahaya', label: 'Lainnya' },
                                                ] as const
                                            ).map((item) => (
                                                <div key={item.id} className="flex items-center space-x-2 rounded px-1 py-1 hover:bg-slate-50">
                                                    <Checkbox
                                                        id={`hazard-${item.id}`}
                                                        checked={selectedHazardLayers.includes(item.id as HazardLayerType)}
                                                        onCheckedChange={(checked) =>
                                                            handleHazardLayerChange(item.id as HazardLayerType, checked as boolean)
                                                        }
                                                        className="h-3 w-3 rounded border-gray-300 text-blue-600"
                                                    />
                                                    <Label
                                                        htmlFor={`hazard-${item.id}`}
                                                        className="flex-1 cursor-pointer text-xs font-medium text-slate-700"
                                                    >
                                                        {item.label}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Layer statistics */}
                            <div className="sticky bottom-0 border-t border-slate-200 bg-white p-3 text-xs">
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="flex justify-between">
                                        <span>Titik Bencana:</span>
                                        <span>{bencanaPoints.length + earthquakes.length}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Posko:</span>
                                        <span>
                                            {posko.length} ({shelterTypeFilter === 'all' ? 'semua' : shelterTypeFilter})
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Jalur Evakuasi:</span>
                                        <span>{validPaths.length}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Layer:</span>
                                        <span>{selectedHazardLayers.length}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirmation Dialog for Delete */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-lg bg-white p-6">
                        <h3 className="text-lg font-bold">Konfirmasi Hapus</h3>
                        <p className="my-4">Anda yakin ingin menghapus data bencana ini? Tindakan ini tidak dapat dibatalkan.</p>
                        <div className="flex justify-end space-x-2">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowDeleteConfirm(false);
                                    setDeletingId(null);
                                }}
                            >
                                Batal
                            </Button>
                            <Button variant="destructive" onClick={() => deletingId && handleDeleteDisaster(deletingId)} disabled={saving}>
                                {saving ? 'Menghapus...' : 'Hapus'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Form Tambah/Edit Bencana */}
            <div id="disaster-form" className="mt-6 rounded-lg bg-white p-4 shadow">
                <h3 className="mb-4 text-lg font-semibold">{editMode ? 'Edit Titik Bencana' : 'Kelola Titik Bencana'}</h3>
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
                            <div className="h-full w-full">
                                <MapContainer center={[-2.5489, 118.0149]} zoom={5} style={{ height: '100%', width: '100%' }}>
                                    <TileLayer attribution={getTileLayerAttribution()} url={getTileLayerUrl()} />
                                    <MarkerCreator position={position} setPosition={setPosition} />
                                </MapContainer>
                            </div>
                        </div>
                        <div className="mt-2 text-xs text-gray-600">
                            {position ? `Lokasi: ${position[0]}, ${position[1]}` : 'Klik pada peta untuk menentukan lokasi.'}
                        </div>
                    </div>
                    <div className="mt-4 flex justify-end space-x-2">
                        {editMode && (
                            <Button type="button" variant="outline" onClick={resetForm}>
                                Batal
                            </Button>
                        )}
                        <Button type="submit" disabled={saving || !judul || !jenisBencana || !deskripsi || !lokasi || !position}>
                            {saving ? 'Menyimpan...' : editMode ? 'Simpan Perubahan' : 'Tambah Bencana'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
