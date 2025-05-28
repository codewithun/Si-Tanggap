import MapComponent from '@/components/MapComponent';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/useToast';
import axios from '@/lib/axios';
import { Head, Link } from '@inertiajs/react';
import { useCallback, useEffect, useMemo, useState } from 'react';

// Define disaster icon types for type safety
type DisasterType = 'banjir' | 'longsor' | 'gempa' | 'tsunami' | 'kebakaran' | 'angin_topan' | 'kekeringan' | 'lainnya';

// Define risk levels for filtering
type RiskLevel = 'tinggi' | 'sedang' | 'rendah' | 'semua';

// Define map layer types

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

// Interface for disaster data from API
interface Bencana {
    id: number;
    judul: string;
    jenis_bencana: DisasterType;
    created_at: string;
    latitude: number;
    longitude: number;
    lokasi: string;
    status: 'menunggu' | 'diverifikasi' | 'ditolak';
    deskripsi: string;
    tingkat_bahaya?: RiskLevel;
}

// No longer needed

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
        coordinates: [number, number];  // [longitude, latitude, depth]
    };
}

// Helper function to convert disaster type to hazard layer type
function disasterToHazardLayer(jenisBencana: DisasterType): HazardLayerType {
    const mapping: Record<DisasterType, HazardLayerType> = {
        banjir: 'banjir',
        longsor: 'tanah_longsor',
        gempa: 'gempabumi',
        tsunami: 'tsunami',
        kebakaran: 'kebakaran_hutan',
        angin_topan: 'cuaca_ekstrim',
        kekeringan: 'kekeringan',
        lainnya: 'multi_bahaya'
    };
    return mapping[jenisBencana];
}

export default function MapKeseluruhan() {
    const [disasters, setDisasters] = useState<Bencana[]>([]);
    const [earthquakes, setEarthquakes] = useState<EarthquakeFeature[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const [mapType, setMapType] = useState<'standard' | 'satellite' | 'terrain'>('standard');
    const [selectedHazardLayers, setSelectedHazardLayers] = useState<HazardLayerType[]>(['gempabumi']);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Transform disaster and earthquake data to marker format for MapComponent
    const markers = useMemo(() => [
        ...disasters.map((disaster) => ({
            id: `disaster-${disaster.id}`,
            position: [disaster.latitude, disaster.longitude] as [number, number],
            title: disaster.judul || disaster.jenis_bencana,
            iconUrl: `/icons/${disaster.jenis_bencana || 'lainnya'}.svg`,
            status: disaster.status as 'diverifikasi' | 'menunggu' | 'ditolak',
            description: `
                Jenis: ${disaster.jenis_bencana || 'Tidak diketahui'}
                Tanggal: ${new Date(disaster.created_at).toLocaleDateString('id-ID')}
                Lokasi: ${disaster.lokasi || 'Tidak diketahui'}
                Status: ${disaster.status || 'Tidak diketahui'}
                Tingkat Bahaya: ${disaster.tingkat_bahaya || 'Tidak diketahui'}
                Deskripsi: ${disaster.deskripsi || 'Tidak ada deskripsi'}
            `,
        })),
        ...earthquakes.map((quake) => ({
            id: `earthquake-${quake.properties.time}`,
            position: [quake.geometry.coordinates[1], quake.geometry.coordinates[0]] as [number, number],
            title: 'Gempa Bumi USGS',
            iconUrl: '/icons/gempa.svg',
            status: 'diverifikasi' as 'diverifikasi' | 'menunggu' | 'ditolak',
            description: `
                Magnitude: ${quake.properties.mag}
                Lokasi: ${quake.properties.place}
                Waktu: ${new Date(quake.properties.time).toLocaleString('id-ID')}
                Info lebih lanjut: ${quake.properties.url}
            `,
        })),
    ], [disasters, earthquakes]);

    const [filteredMarkers, setFilteredMarkers] = useState(markers);

    // Filter markers based on selected layers
    const filterMarkers = useCallback(() => {
        // Only proceed if we have markers to filter
        if (!markers.length) return;

        const filtered = markers.filter(marker => {
            if (marker.id.startsWith('earthquake-')) {
                return selectedHazardLayers.includes('gempabumi');
            }
            const disasterId = marker.id.split('-')[1];
            const disaster = disasters.find(d => d.id.toString() === disasterId);
            if (!disaster) return false;
            
            const hazardLayer = disasterToHazardLayer(disaster.jenis_bencana);
            return selectedHazardLayers.includes(hazardLayer);
        });
        
        setFilteredMarkers(filtered);
    }, [markers, selectedHazardLayers, disasters]);

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

    const fetchDisasters = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axios.get('/titik-bencana', {
                params: {
                    status: 'diverifikasi', // Only show verified reports
                },
            });

            const data = response.data?.data || [];
            console.log('Disaster data loaded:', data);

            // Add risk level to each disaster
            const enhancedData = data.map((disaster: Bencana) => ({
                ...disaster,
                tingkat_bahaya: getRiskLevel(disaster),
            }));

            setDisasters(enhancedData);
        } catch (error) {
            console.error('Failed to fetch disaster data:', error);
            const errorMessage = error instanceof Error ? error.message : 'Gagal memuat data bencana';

            toast({
                title: 'Error',
                description: errorMessage,
                variant: 'destructive',
            });
            setDisasters([]);
        } finally {
            setLoading(false);
        }
    }, [toast]);

    // Fetch USGS earthquake data
    const fetchEarthquakeData = useCallback(async () => {
        try {
            const today = new Date();
            const endtime = today.toISOString().split("T")[0];

            const pastDate = new Date();
            pastDate.setFullYear(today.getFullYear() - 5);
            const starttime = pastDate.toISOString().split("T")[0];

            const url = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=${starttime}&endtime=${endtime}&minlatitude=-11&maxlatitude=6.1&minlongitude=94&maxlongitude=141&orderby=time&limit=100`;

            const response = await fetch(url);
            const data = await response.json();
            setEarthquakes(data.features || []);
        } catch (error) {
            console.error("Gagal ambil data gempa:", error);
            toast({
                title: 'Error',
                description: 'Gagal memuat data gempa USGS',
                variant: 'destructive',
            });
        }
    }, [toast]);

    useEffect(() => {
        fetchDisasters();
        fetchEarthquakeData();
    }, [fetchDisasters, fetchEarthquakeData]);

    // Handle hazard layer selection
    const handleHazardLayerChange = (type: HazardLayerType, checked: boolean) => {
        if (checked) {
            setSelectedHazardLayers((prev) => [...prev, type]);
        } else {
            setSelectedHazardLayers((prev) => prev.filter((t) => t !== type));
        }
        
        // Filter markers when layer selection changes
        filterMarkers();
    };

    // Update markers when filters change
    useEffect(() => {
        filterMarkers();
    }, [filterMarkers, selectedHazardLayers]);

    return (
        <div className="flex min-h-screen flex-col bg-slate-50">
            <Head title="GeoSiaga" />

            {/* Simple modern header with subtle effects */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-slate-200">
                <div className="container mx-auto flex items-center justify-between px-6 py-4">
                    <div className="flex items-center space-x-4">
                        <Link 
                            href="/" 
                            className="group flex items-center space-x-2 rounded-lg px-3 py-2 text-gray-600 transition-all hover:bg-blue-50 hover:text-blue-600 hover:shadow-sm active:bg-blue-100"
                        >
                            <svg
                                className="h-5 w-5 transition-transform duration-200 ease-out group-hover:-translate-x-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            <span className="font-medium">Kembali ke Beranda</span>
                        </Link>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                        <h1 className="text-2xl font-bold">
                            <span className="text-gray-800">Geo</span>
                            <span className="bg-gradient-to-r from-emerald-500 to-blue-500 bg-clip-text text-transparent">
                                Siaga
                            </span>
                        </h1>
                        
                        <div className="h-6 w-px bg-slate-200"></div>
                        
                        <Button
                            variant="outline"
                            className="group flex items-center space-x-2 rounded-lg border border-slate-200 bg-white/90 px-4 py-2 text-gray-700 transition-all duration-200 ease-out hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 hover:shadow-sm active:bg-blue-100"
                            onClick={() => setSidebarOpen((v) => !v)}
                        >
                            <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                width="18" 
                                height="18" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="2" 
                                strokeLinecap="round" 
                                strokeLinejoin="round"
                            >
                                <rect x="3" y="3" width="18" height="18" rx="2"/>
                                <path d="M9 3v18M3 9h18"/>
                            </svg>
                            <span>Layer Control</span>
                        </Button>
                    </div>
                </div>
            </header>

            <div className="relative flex-grow">
                {/* Main Map Area */}
                <div className={`h-[calc(100vh-5rem)] transition-all duration-300 ${sidebarOpen ? 'pr-[330px]' : ''}`}>
                    {loading ? (
                        <div className="flex h-full w-full items-center justify-center bg-slate-100">
                            <div className="text-center">
                                <div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                                <p className="text-slate-600">Memuat data peta...</p>
                            </div>
                        </div>
                    ) : (
                        <MapComponent
                            height="100%"
                            markers={filteredMarkers}
                            zoom={5}
                            minZoom={2.5}
                            initialView={[-2.5489, 118.0149]}
                            maxBounds={undefined}
                            className="h-full w-full"
                            mapType={mapType}
                        />
                    )}
                </div>

                {/* Floating Layer Panel */}
                <div
                    id="layer-drawer"
                    className={`fixed top-0 right-0 z-30 h-screen w-[330px] border-l border-slate-200 bg-white shadow-xl transition-transform duration-300 ${
                        sidebarOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
                >
                    <div className="h-full overflow-y-auto">
                        <div className="flex items-center justify-between border-b border-slate-200 p-4">
                            <h3 className="text-lg font-medium">Layer Control</h3>
                            <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full p-0 hover:bg-gray-100" onClick={() => setSidebarOpen(false)}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M18 6L6 18M6 6l12 12"/>
                                </svg>
                            </Button>
                        </div>

                        <div className="p-4 space-y-6">
                            {/* Map Type Section */}
                            <div className="bg-white rounded-lg shadow-sm border border-slate-200">
                                <div className="p-4 border-b border-slate-200">
                                    <h4 className="font-medium text-slate-800">Tipe Peta</h4>
                                </div>
                                <div className="p-4">
                                    <RadioGroup value={mapType} onValueChange={(value: 'standard' | 'satellite' | 'terrain') => setMapType(value)}>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div>
                                                <RadioGroupItem value="standard" id="standard" className="peer sr-only" />
                                                <Label 
                                                    htmlFor="standard" 
                                                    className="flex flex-col items-center gap-2 rounded-lg border-2 border-transparent p-4 hover:border-slate-300 hover:bg-slate-50 peer-data-[state=checked]:border-blue-600 peer-data-[state=checked]:bg-blue-50 cursor-pointer transition-all"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600 peer-data-[state=checked]:text-blue-600">
                                                        <rect width="18" height="18" x="3" y="3" rx="2"/>
                                                        <path d="M3 9h18"/>
                                                        <path d="M9 3v18"/>
                                                        <path d="M15 3v18"/>
                                                        <path d="M3 15h18"/>
                                                    </svg>
                                                    <span className="text-sm font-medium">Standar</span>
                                                </Label>
                                            </div>
                                            <div>
                                                <RadioGroupItem value="satellite" id="satellite" className="peer sr-only" />
                                                <Label 
                                                    htmlFor="satellite" 
                                                    className="flex flex-col items-center gap-2 rounded-lg border-2 border-transparent p-4 hover:border-slate-300 hover:bg-slate-50 peer-data-[state=checked]:border-blue-600 peer-data-[state=checked]:bg-blue-50 cursor-pointer transition-all"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600 peer-data-[state=checked]:text-blue-600">
                                                        <path d="M12 12a4 4 0 0 0-4-4 4 4 0 0 0-4 4 4 4 0 0 0 4 4 4 4 0 0 0 4-4Z"/>
                                                        <path d="m12 12 3 3"/>
                                                        <path d="m15 15 2-2"/>
                                                        <path d="M12 20v-8"/>
                                                        <path d="M12 12h8"/>
                                                        <path d="M17 12a5 5 0 0 0-5-5"/>
                                                    </svg>
                                                    <span className="text-sm font-medium">Satelit</span>
                                                </Label>
                                            </div>
                                            <div>
                                                <RadioGroupItem value="terrain" id="terrain" className="peer sr-only" />
                                                <Label 
                                                    htmlFor="terrain" 
                                                    className="flex flex-col items-center gap-2 rounded-lg border-2 border-transparent p-4 hover:border-slate-300 hover:bg-slate-50 peer-data-[state=checked]:border-blue-600 peer-data-[state=checked]:bg-blue-50 cursor-pointer transition-all"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600 peer-data-[state=checked]:text-blue-600">
                                                        <path d="M22 19h-6l-4-4-4 4H2"/>
                                                        <path d="M2 19 12 5l10 14"/>
                                                        <path d="M19 12 12 5l-7 7"/>
                                                    </svg>
                                                    <span className="text-sm font-medium">Terrain</span>
                                                </Label>
                                            </div>
                                        </div>
                                    </RadioGroup>
                                </div>
                            </div>

                            {/* Hazard Layers Section */}
                            <div className="bg-white rounded-lg shadow-sm border border-slate-200">
                                <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                                    <h4 className="font-medium text-slate-800">Jenis Bahaya</h4>
                                    <Button 
                                        variant="ghost" 
                                        size="sm"
                                        className="h-8 px-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                                        onClick={() => {
                                            setSelectedHazardLayers([]);
                                            setFilteredMarkers(markers);
                                        }}
                                    >
                                        Reset Filter
                                    </Button>
                                </div>
                                <div className="p-4">
                                    <div className="space-y-2.5">
                                    {(
                                        [
                                            { id: 'banjir', label: 'Banjir' },
                                            { id: 'banjir_bandang', label: 'Banjir Bandang' },
                                            { id: 'cuaca_ekstrim', label: 'Cuaca Ekstrim' },
                                            { id: 'gelombang_ekstrim', label: 'Gelombang Ekstrim dan Abrasi' },
                                            { id: 'gempabumi', label: 'Gempabumi' },
                                            { id: 'kebakaran_hutan', label: 'Kebakaran Hutan dan Lahan' },
                                            { id: 'kekeringan', label: 'Kekeringan' },
                                            { id: 'letusan_gunung_api', label: 'Letusan Gunung Api' },
                                            { id: 'likuefaksi', label: 'Likuefaksi' },
                                            { id: 'multi_bahaya', label: 'Multi Bahaya' },
                                            { id: 'tanah_longsor', label: 'Tanah Longsor' },
                                            { id: 'tsunami', label: 'Tsunami' },
                                            { id: 'covid19', label: 'COVID-19' },
                                        ] as const
                                    ).map((item) => (
                                        <div key={item.id} className="flex items-center space-x-3 py-1 px-2 rounded hover:bg-slate-50">
                                            <Checkbox
                                                id={item.id}
                                                checked={selectedHazardLayers.includes(item.id as HazardLayerType)}
                                                onCheckedChange={(checked) => handleHazardLayerChange(item.id as HazardLayerType, checked as boolean)}
                                                className="h-4 w-4 rounded border-gray-300 text-blue-600 data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600"
                                            />
                                            <Label htmlFor={item.id} className="flex-1 cursor-pointer text-sm font-medium text-slate-700">
                                                {item.label}
                                            </Label>
                                        </div>
                                    ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Layer Count */}
                        <div className="sticky bottom-0 border-t border-slate-200 bg-white p-4">
                            <div className="flex justify-between text-sm text-slate-600">
                                <span>Layer Terpilih:</span>
                                <span>{selectedHazardLayers.length} layer</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
