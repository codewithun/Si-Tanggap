import { Button } from '@/components/ui/button';
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

const disasterIcon = L.icon({
    iconUrl: '/icons/gempa.svg',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
});

const shelterIcon = L.icon({
    iconUrl: '/icons/posko.png',
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -38],
});

export default function BencanaMaps() {
    const [bencanaPoints, setBencanaPoints] = useState<Bencana[]>([]);
    const [earthquakes, setEarthquakes] = useState<EarthquakeFeature[]>([]);
    const [jalurEvakuasi, setJalurEvakuasi] = useState<JalurEvakuasi[]>([]);
    const [posko, setPosko] = useState<Posko[]>([]);
    const [loading, setLoading] = useState(true);

    // Map controls
    const [mapType, setMapType] = useState<'standard' | 'satellite' | 'terrain'>('standard');
    const [selectedHazardLayers, setSelectedHazardLayers] = useState<HazardLayerType[]>(['gempabumi']);
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
            const data = response.data.data || response.data;
            if (Array.isArray(data)) {
                const verifiedReports = data.filter((report) => report.status === 'diverifikasi');
                const enhancedData = verifiedReports.map((disaster: Bencana) => ({
                    ...disaster,
                    tingkat_bahaya: getRiskLevel(disaster),
                }));
                setBencanaPoints(enhancedData);
            } else {
                setBencanaPoints([]);
            }
        } finally {
            setLoading(false);
        }
    }, []);

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
        } catch {
            /* ignore */
        }
    }, []);

    const fetchPosko = useCallback(async () => {
        try {
            const response = await axios.get('/poskos');
            const poskoData = Array.isArray(response.data) ? response.data : response.data.data;
            setPosko(poskoData || []);
        } catch {
            /* ignore */
        }
    }, []);

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

    const getMarkerIcon = (type: string) => {
        return type === 'shelter' ? shelterIcon : disasterIcon;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Peta Bencana & Evakuasi" />
            <div className="space-y-4 p-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold sm:text-2xl">Peta Bencana & Evakuasi</h2>
                    <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => setSidebarOpen((v) => !v)}>
                            Layer
                        </Button>
                        <Button variant="outline" size="sm" onClick={refreshAll} disabled={loading}>
                            {loading ? 'Memuat...' : 'Refresh'}
                        </Button>
                    </div>
                </div>
                <div className="relative overflow-hidden">
                    <div
                        className={`h-[300px] w-full overflow-hidden rounded-lg transition-all duration-300 sm:h-[600px] ${sidebarOpen ? 'sm:pr-[300px]' : ''}`}
                    >
                        {loading ? (
                            <div className="h-full w-full animate-pulse rounded-lg bg-gray-200"></div>
                        ) : (
                            <MapContainer center={[-2.5489, 118.0149]} zoom={5} style={{ height: '100%', width: '100%' }}>
                                <TileLayer url={getTileLayerUrl()} attribution={getTileLayerAttribution()} />
                                {filteredMarkers.map((marker: MapMarker) => (
                                    <Marker key={marker.id} position={marker.position} icon={getMarkerIcon(marker.type)}>
                                        <Popup>
                                            <div className="max-w-xs">
                                                <h3 className="mb-2 text-lg font-semibold">{marker.title}</h3>
                                                <div className="text-sm whitespace-pre-line">{marker.description}</div>
                                                {marker.type === 'shelter' && (
                                                    <div className="mt-2">
                                                        <p>
                                                            <strong>Alamat:</strong> {marker.alamat}
                                                        </p>
                                                        <p>
                                                            <strong>Kontak:</strong> {marker.kontak}
                                                        </p>
                                                        <p>
                                                            <strong>Jenis:</strong> {marker.jenis}
                                                        </p>
                                                        <p>
                                                            <strong>Status:</strong>{' '}
                                                            <span className={marker.statusPosko === 'Aktif' ? 'text-green-600' : 'text-red-600'}>
                                                                {marker.statusPosko}
                                                            </span>
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </Popup>
                                    </Marker>
                                ))}
                                {showEvacRoutes &&
                                    validPaths.map((jalur: JalurEvakuasi) => (
                                        <Polyline
                                            key={jalur.id}
                                            positions={jalur.koordinat.map((k) => [k.lat, k.lng])}
                                            pathOptions={{ color: jalur.warna || '#FF0000', weight: 3 }}
                                        >
                                            <Popup>
                                                <div>
                                                    <h3 className="font-semibold">{jalur.nama}</h3>
                                                    <p>{jalur.deskripsi}</p>
                                                </div>
                                            </Popup>
                                        </Polyline>
                                    ))}
                            </MapContainer>
                        )}
                    </div>
                    {/* Layer Panel */}
                    <div
                        className={`absolute top-0 right-0 z-30 h-[300px] w-[300px] overflow-hidden border-l border-slate-200 bg-white shadow-xl transition-transform duration-300 sm:h-[500px] ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}
                    >
                        <div className="h-full overflow-x-hidden overflow-y-auto p-4">
                            <h3 className="mb-4 text-lg font-semibold">Pengaturan Layer</h3>
                            <div className="mb-4">
                                <label className="mb-2 block text-sm font-medium">Tipe Peta</label>
                                <select
                                    value={mapType}
                                    onChange={(e) => setMapType(e.target.value as 'standard' | 'satellite' | 'terrain')}
                                    className="w-full rounded border p-1"
                                >
                                    <option value="standard">Standar</option>
                                    <option value="satellite">Satelit</option>
                                    <option value="terrain">Terrain</option>
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className="mb-2 block text-sm font-medium">Layer Bencana</label>
                                <div className="mb-2 flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="show-disasters"
                                        checked={showDisasters}
                                        onChange={(e) => setShowDisasters(e.target.checked)}
                                    />
                                    <label htmlFor="show-disasters">Tampilkan Bencana</label>
                                </div>
                                {showDisasters && (
                                    <div className="ml-6 space-y-2">
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                id="gempabumi"
                                                checked={selectedHazardLayers.includes('gempabumi')}
                                                onChange={(e) => handleHazardLayerChange('gempabumi', e.target.checked)}
                                            />
                                            <label htmlFor="gempabumi">Gempa Bumi</label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                id="banjir"
                                                checked={selectedHazardLayers.includes('banjir')}
                                                onChange={(e) => handleHazardLayerChange('banjir', e.target.checked)}
                                            />
                                            <label htmlFor="banjir">Banjir</label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                id="tanah_longsor"
                                                checked={selectedHazardLayers.includes('tanah_longsor')}
                                                onChange={(e) => handleHazardLayerChange('tanah_longsor', e.target.checked)}
                                            />
                                            <label htmlFor="tanah_longsor">Tanah Longsor</label>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="mb-4">
                                <label className="mb-2 block text-sm font-medium">Layer Posko</label>
                                <div className="mb-2 flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="show-shelters"
                                        checked={showShelters}
                                        onChange={(e) => setShowShelters(e.target.checked)}
                                    />
                                    <label htmlFor="show-shelters">Tampilkan Posko</label>
                                </div>
                                {showShelters && (
                                    <select
                                        value={shelterTypeFilter}
                                        onChange={(e) => setShelterTypeFilter(e.target.value)}
                                        className="w-full rounded border p-1"
                                    >
                                        <option value="all">Semua Posko</option>
                                        <option value="pengungsian">Pengungsian</option>
                                        <option value="kesehatan">Kesehatan</option>
                                        <option value="logistik">Logistik</option>
                                    </select>
                                )}
                            </div>
                            <div className="mb-4">
                                <label className="mb-2 block text-sm font-medium">Layer Jalur Evakuasi</label>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="show-evac-routes"
                                        checked={showEvacRoutes}
                                        onChange={(e) => setShowEvacRoutes(e.target.checked)}
                                    />
                                    <label htmlFor="show-evac-routes">Tampilkan Jalur Evakuasi</label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
