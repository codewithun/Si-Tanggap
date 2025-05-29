import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/useToast';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { MapContainer, Marker, Polyline, Popup, TileLayer } from 'react-leaflet';

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

interface MapMarker {
    id: string;
    position: [number, number];
    title: string;
    jenis_bencana: string;
    status: 'diverifikasi' | 'menunggu' | 'ditolak';
    type: string;
    description: string;
    jenis_posko?: string;
    alamat?: string;
    kontak?: string;
    jenis?: string;
    statusPosko?: string;
}

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

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Peta Bencana & Evakuasi',
        href: '/peta-bencana',
    },
];

// Replace the single disasterIcon with a function to get appropriate icon by type
const getDisasterIcon = (type: string) => {
    const cacheBuster = `?v=${new Date().getTime()}`;

    switch (type.toLowerCase()) {
        case 'banjir':
            return L.icon({
                iconUrl: `/icons/icon-banjir.png${cacheBuster}`,
                iconSize: [32, 32],
                iconAnchor: [16, 32],
                popupAnchor: [0, -32],
            });
        case 'kebakaran':
            return L.icon({
                iconUrl: `/icons/icon-kebakaran.png${cacheBuster}`,
                iconSize: [32, 32],
                iconAnchor: [16, 32],
                popupAnchor: [0, -32],
            });
        case 'gempa':
            return L.icon({
                iconUrl: `/icons/gempa.png${cacheBuster}`,
                iconSize: [32, 32],
                iconAnchor: [16, 32],
                popupAnchor: [0, -32],
            });
        case 'longsor':
            return L.icon({
                iconUrl: `/icons/icon-tanahlongsor.png${cacheBuster}`,
                iconSize: [32, 32],
                iconAnchor: [16, 32],
                popupAnchor: [0, -32],
            });
        case 'angin-topan':
        case 'angin_topan':
            return L.icon({
                iconUrl: `/icons/default-marker.svg${cacheBuster}`,
                iconSize: [32, 32],
                iconAnchor: [16, 32],
                popupAnchor: [0, -32],
            });
        case 'tsunami':
            return L.icon({
                iconUrl: `/icons/icon-tsunami.png${cacheBuster}`,
                iconSize: [32, 32],
                iconAnchor: [16, 32],
                popupAnchor: [0, -32],
            });
        case 'kekeringan':
            return L.icon({
                iconUrl: `/icons/icon-kekeringan.png${cacheBuster}`,
                iconSize: [32, 32],
                iconAnchor: [16, 32],
                popupAnchor: [0, -32],
            });
        default:
            return L.icon({
                iconUrl: `/icons/disaster.svg${cacheBuster}`,
                iconSize: [32, 32],
                iconAnchor: [16, 32],
                popupAnchor: [0, -32],
            });
    }
};

export default function BencanaMaps() {
    const [bencanaPoints, setBencanaPoints] = useState<Bencana[]>([]);
    const [earthquakes, setEarthquakes] = useState<EarthquakeFeature[]>([]);
    const [jalurEvakuasi, setJalurEvakuasi] = useState<JalurEvakuasi[]>([]);
    const [posko, setPosko] = useState<Posko[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    // Map controls
    const [mapType, setMapType] = useState<'standard' | 'satellite' | 'terrain'>('standard');
    const [selectedHazardLayers, setSelectedHazardLayers] = useState<HazardLayerType[]>([
        'banjir',
        'banjir_bandang',
        'cuaca_ekstrim',
        'gelombang_ekstrim',
        'gempabumi',
        'kebakaran_hutan',
        'kekeringan',
        'letusan_gunung_api',
        'tanah_longsor',
        'tsunami',
        'multi_bahaya',
        'likuefaksi',
        'covid19',
    ]);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showDisasters, setShowDisasters] = useState(true);
    const [showShelters, setShowShelters] = useState(true);
    const [showEvacRoutes, setShowEvacRoutes] = useState(true);
    const [shelterTypeFilter, setShelterTypeFilter] = useState<string | 'all'>('all');

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

    // Add this function for hazard layer checkbox
    const handleHazardLayerChange = (type: HazardLayerType, checked: boolean) => {
        setSelectedHazardLayers((prev) => (checked ? [...prev, type] : prev.filter((t) => t !== type)));
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
            console.error('Failed to fetch disaster points:', error);
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

    const fetchEarthquakeData = useCallback(async () => {
        try {
            const today = new Date();
            const endtime = today.toISOString().split('T')[0];
            const pastDate = new Date();
            pastDate.setMonth(today.getMonth() - 1);
            const starttime = pastDate.toISOString().split('T')[0];
            const url = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=${starttime}&endtime=${endtime}&minlatitude=-11&maxlatitude=6.1&minlongitude=94&maxlongitude=141&orderby=time&limit=50`;
            const response = await fetch(url);
            const data = await response.json();
            setEarthquakes(data.features || []);
        } catch {
            /* ignore */
        }
    }, []);

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

    const refreshAll = () => {
        setLoading(true);
        Promise.all([fetchBencanaPoints(), fetchEarthquakeData(), fetchJalurEvakuasi(), fetchPosko()]).finally(() => setLoading(false));
    };

    useEffect(() => {
        refreshAll();
        // eslint-disable-next-line
    }, []);

    const shelterMarkers = useMemo(() => {
        if (!showShelters || !posko.length) return [];
        return posko
            .filter((p: Posko) => shelterTypeFilter === 'all' || p.jenis_posko === shelterTypeFilter)
            .map((p: Posko) => ({
                id: `shelter-${p.id}`,
                position: [p.latitude, p.longitude] as [number, number],
                title: p.nama,
                jenis_bencana: 'shelter',
                status: 'diverifikasi' as const,
                type: 'shelter',
                jenis_posko: p.jenis_posko,
                description: `${p.deskripsi || ''}`,
                alamat: p.alamat || 'Tidak tersedia',
                kontak: p.kontak || 'Tidak tersedia',
                jenis: p.jenis_posko || 'Tidak tersedia',
                statusPosko: p.status || 'Aktif',
            }));
    }, [posko, showShelters, shelterTypeFilter]);

    const allMarkers = useMemo(() => {
        return [
            ...(showDisasters
                ? [
                      ...(bencanaPoints.map((disaster: Bencana) => ({
                          id: `disaster-${disaster.id}`,
                          position: [disaster.latitude, disaster.longitude] as [number, number],
                          title: disaster.judul || disaster.jenis_bencana,
                          jenis_bencana: disaster.jenis_bencana,
                          status: disaster.status,
                          type: 'disaster',
                          description: `Jenis: ${disaster.jenis_bencana || 'Tidak diketahui'}
                    Tanggal: ${new Date(disaster.created_at).toLocaleDateString('id-ID')}
                    Lokasi: ${disaster.lokasi || 'Tidak diketahui'}
                    Status: ${disaster.status || 'Tidak diketahui'}
                    Tingkat Bahaya: ${disaster.tingkat_bahaya || 'Tidak diketahui'}
                    Deskripsi: ${disaster.deskripsi || 'Tidak ada deskripsi'}
                `,
                      })) as MapMarker[]),
                      ...(earthquakes.map((quake: EarthquakeFeature) => ({
                          id: `earthquake-${quake.properties.time}`,
                          position: [quake.geometry.coordinates[1], quake.geometry.coordinates[0]] as [number, number],
                          title: `Gempa ${quake.properties.mag} SR - ${quake.properties.place}`,
                          jenis_bencana: 'gempa',
                          status: 'diverifikasi' as const,
                          type: 'earthquake',
                          description: `Magnitude: ${quake.properties.mag}
                    Lokasi: ${quake.properties.place}
                    Waktu: ${new Date(quake.properties.time).toLocaleString('id-ID')}
                    Info lebih lanjut: ${quake.properties.url}
                `,
                      })) as MapMarker[]),
                  ]
                : []),
            ...shelterMarkers,
        ] as MapMarker[];
    }, [bencanaPoints, earthquakes, shelterMarkers, showDisasters]);

    const validPaths = useMemo(() => {
        if (!showEvacRoutes) return [];
        return jalurEvakuasi.filter((jalur: JalurEvakuasi) => {
            return (
                jalur.koordinat &&
                Array.isArray(jalur.koordinat) &&
                jalur.koordinat.length >= 2 &&
                jalur.koordinat.every(
                    (point: { lat: number; lng: number }) => point && typeof point.lat === 'number' && typeof point.lng === 'number',
                )
            );
        });
    }, [jalurEvakuasi, showEvacRoutes]);

    const [filteredMarkers, setFilteredMarkers] = useState<MapMarker[]>([]);

    const filterMarkers = useCallback(() => {
        if (!allMarkers.length) return;
        const filtered = allMarkers.filter((marker: MapMarker) => {
            if (marker.type === 'shelter') return true;
            if (marker.id.startsWith('earthquake-')) return selectedHazardLayers.includes('gempabumi');
            const hazardLayer = disasterToHazardLayer(marker.jenis_bencana);
            return selectedHazardLayers.includes(hazardLayer);
        });
        setFilteredMarkers(filtered);
    }, [allMarkers, selectedHazardLayers]);

    useEffect(() => {
        filterMarkers();
    }, [filterMarkers, selectedHazardLayers, showShelters, showDisasters]);

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
        `;
        document.head.appendChild(style);

        return () => {
            document.head.removeChild(style);
        };
    }, []);

    // Define shelter icon
    const shelterIcon = L.icon({
        iconUrl: `/icons/posko.png?v=${new Date().getTime()}`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
    });

    // Enhanced marker icon selector with different appearances for shelters by type
    const getMarkerIcon = (type: string, jenis_bencana?: string) => {
        if (type === 'shelter') {
            return shelterIcon;
        }
        if (type === 'earthquake') {
            return getDisasterIcon('gempa');
        }
        if (type === 'disaster' && jenis_bencana) {
            return getDisasterIcon(jenis_bencana);
        }
        return getDisasterIcon('default');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Peta Bencana & Evakuasi" />
            <div className="space-y-4 p-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold sm:text-2xl">Peta Bencana & Evakuasi</h2>
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
                        <Button variant="outline" size="sm" onClick={refreshAll} disabled={loading}>
                            {loading ? 'Memuat...' : 'Refresh'}
                        </Button>
                    </div>
                </div>

                <div className="relative overflow-hidden">
                    {/* Main Map Area with dynamic padding */}
                    <div
                        className={`h-[300px] w-full overflow-hidden rounded-lg transition-all duration-300 sm:h-[600px] ${
                            sidebarOpen ? 'sm:pr-[300px]' : ''
                        }`}
                    >
                        {loading ? (
                            <div className="h-full w-full animate-pulse rounded-lg bg-gray-200"></div>
                        ) : (
                            <MapContainer center={[-2.5489, 118.0149]} zoom={5} style={{ height: '100%', width: '100%' }}>
                                <TileLayer url={getTileLayerUrl()} attribution={getTileLayerAttribution()} />

                                {filteredMarkers.map((marker: MapMarker) => (
                                    <Marker key={marker.id} position={marker.position} icon={getMarkerIcon(marker.type, marker.jenis_bencana)}>
                                        <Popup>
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
                                            {marker.type !== 'shelter' && <div className="mt-2 text-xs">{formatDescription(marker.description)}</div>}
                                        </Popup>
                                    </Marker>
                                ))}

                                {showEvacRoutes &&
                                    validPaths.map((jalur: JalurEvakuasi) => (
                                        <Polyline
                                            key={`jalur-${jalur.id}`}
                                            positions={jalur.koordinat.map((k) => [k.lat, k.lng])}
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
                        )}
                    </div>

                    {/* Floating Layer Panel - Modern UI */}
                    <div
                        id="layer-drawer"
                        className={`absolute top-0 right-0 z-30 h-full w-[300px] overflow-hidden border-l border-slate-200 bg-white shadow-xl transition-transform duration-300 ${
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
        </AppLayout>
    );
}
