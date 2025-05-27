import MapComponent from '@/components/MapComponent';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/useToast';
import axios from '@/lib/axios';
import { Head, Link } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';

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

// Define infrastructure layer types
type InfraLayerType =
    | 'topografi'
    | 'fault'
    | 'jalur_rel'
    | 'jalan'
    | 'pasar'
    | 'masjid'
    | 'kelenteng'
    | 'pura'
    | 'station'
    | 'terminal'
    | 'sungai'
    | 'batas_das'
    | 'batas_admin';

// Define display type options
type DisplayType = 'bahaya' | 'kerentanan' | 'kapasitas' | 'risiko';

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

// Interface for statistics data
interface StatisticsData {
    jumlah_kecamatan: number;
    luas_bahaya: number;
    data_sekolah: {
        sedang: number;
        tinggi: number;
    };
    data_rumah_sakit: {
        sedang: number;
        tinggi: number;
    };
    data_puskesmas: {
        sedang: number;
        tinggi: number;
    };
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
        coordinates: [number, number];  // [longitude, latitude, depth]
    };
}

export default function MapKeseluruhan() {
    const [disasters, setDisasters] = useState<Bencana[]>([]);
    const [earthquakes, setEarthquakes] = useState<EarthquakeFeature[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    // Update the naming to match Google Maps conventions
    const [mapType, setMapType] = useState<'standard' | 'satellite' | 'terrain'>('standard');
    const [selectedHazardLayers, setSelectedHazardLayers] = useState<HazardLayerType[]>(['gempabumi']);
    const [selectedInfraLayers, setSelectedInfraLayers] = useState<InfraLayerType[]>([]);
    const [displayType, setDisplayType] = useState<DisplayType>('bahaya');

    // Mock statistics data similar to what's shown in the image
    const [statistics] = useState<StatisticsData>({
        jumlah_kecamatan: 17,
        luas_bahaya: 50246,
        data_sekolah: {
            sedang: 848,
            tinggi: 1097,
        },
        data_rumah_sakit: {
            sedang: 7,
            tinggi: 20,
        },
        data_puskesmas: {
            sedang: 13,
            tinggi: 13,
        },
    });

    // Sidebar open state for layer control drawer
    const [sidebarOpen, setSidebarOpen] = useState(false);

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
    };

    // Handle infrastructure layer selection
    const handleInfraLayerChange = (type: InfraLayerType, checked: boolean) => {
        if (checked) {
            setSelectedInfraLayers((prev) => [...prev, type]);
        } else {
            setSelectedInfraLayers((prev) => prev.filter((t) => t !== type));
        }
    };

    // Transform disaster and earthquake data to marker format for MapComponent
    const markers = [
        ...disasters.map((disaster) => ({
            id: `disaster-${disaster.id}`,
            position: [disaster.latitude, disaster.longitude] as [number, number],
            title: disaster.judul || disaster.jenis_bencana,
            iconUrl: `/icons/${disaster.jenis_bencana || 'lainnya'}.svg`, // Use direct icon path
            status: disaster.status as 'diverifikasi' | 'menunggu' | 'ditolak', // Narrow the type
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
            status: 'diverifikasi' as 'diverifikasi' | 'menunggu' | 'ditolak', // USGS data is always considered verified
            description: `
                Magnitude: ${quake.properties.mag}
                Lokasi: ${quake.properties.place}
                Waktu: ${new Date(quake.properties.time).toLocaleString('id-ID')}
                Info lebih lanjut: ${quake.properties.url}
            `,
        })),
    ];

    return (
        <div className="flex min-h-screen flex-col bg-slate-50">
            <Head title="Peta Bencana Indonesia" />

            {/* Modern Header with gradient */}
            <header className="bg-gradient-to-r from-blue-800 to-blue-600 shadow-lg">
                <div className="container mx-auto flex items-center justify-between px-6 py-4">
                    <div className="flex items-center space-x-4">
                        <Link href="/" className="group flex items-center space-x-2 text-white transition-colors hover:text-blue-100">
                            <svg
                                className="h-5 w-5 transition-transform group-hover:-translate-x-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            <span className="font-medium">Kembali ke Beranda</span>
                        </Link>
                    </div>
                    <h1 className="text-xl font-bold text-white">Peta Risiko Bencana Indonesia</h1>
                    <div className="w-32"></div>
                </div>
            </header>

            {/* Top Controls Panel */}
            <div className="sticky top-0 z-20 bg-white p-4 shadow-md">
                <div className="container mx-auto flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                        <h3 className="font-medium text-blue-700">Tipe Peta:</h3>
                        <RadioGroup
                            value={mapType}
                            onValueChange={(value: string) => setMapType(value as 'standard' | 'satellite' | 'terrain')}
                            className="flex space-x-4"
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="standard" id="standard" className="text-blue-600" />
                                <Label htmlFor="standard">Standar</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="satellite" id="satellite" className="text-blue-600" />
                                <Label htmlFor="satellite">Satelit</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="terrain" id="terrain" className="text-blue-600" />
                                <Label htmlFor="terrain">Terrain</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    <div className="flex items-center space-x-4">
                        <Button
                            variant="outline"
                            className="border-blue-600 text-blue-600 hover:bg-blue-50"
                            onClick={() => setSidebarOpen((v) => !v)}
                        >
                            {/* ...icon... */}
                            Layer Control
                        </Button>
                        <Button className="bg-blue-600 text-white hover:bg-blue-700" onClick={() => console.log('Apply filters')}>
                            Terapkan Filter
                        </Button>
                    </div>
                </div>
            </div>

            <div className="relative flex-grow">
                {/* Main Map Area - Full width and height */}
                <div className={`h-[calc(100vh-13rem)] transition-all duration-300 ${sidebarOpen ? 'pr-[330px]' : ''}`}>
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
                            markers={markers}
                            zoom={5}
                            minZoom={2.5}
                            initialView={[-2.5489, 118.0149]}
                            maxBounds={undefined}
                            className="h-full w-full"
                            mapType={mapType} // Pass the mapType prop
                        />
                    )}
                </div>

                {/* Floating Layer Panel */}
                <div
                    id="layer-drawer"
                    className={`fixed top-[8.5rem] right-0 z-30 h-[calc(100vh-13rem)] w-[330px] border-l border-slate-200 bg-white shadow-xl transition-transform duration-300 ${
                        sidebarOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
                >
                    <div className="h-full overflow-y-auto">
                        <div className="flex items-center justify-between border-b border-slate-200 p-4">
                            <h3 className="text-lg font-medium">Layer Control</h3>
                            <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full p-0" onClick={() => setSidebarOpen(false)}>
                                {/* ...icon... */}
                            </Button>
                        </div>

                        <div className="p-4">
                            {/* Jenis Tampilan Section */}
                            <div className="mb-6">
                                <h4 className="mb-3 text-base font-medium text-slate-700">Jenis Tampilan</h4>
                                <RadioGroup value={displayType} onValueChange={(value: string) => setDisplayType(value as DisplayType)}>
                                    <div className="grid grid-cols-2 gap-2">
                                        {(
                                            [
                                                { value: 'bahaya', label: 'Bahaya' },
                                                { value: 'kerentanan', label: 'Kerentanan' },
                                                { value: 'kapasitas', label: 'Kapasitas' },
                                                { value: 'risiko', label: 'Risiko' },
                                            ] as const
                                        ).map((option) => (
                                            <div
                                                key={option.value}
                                                className={`flex cursor-pointer items-center space-x-2 rounded-md border p-2 transition-all ${
                                                    displayType === option.value
                                                        ? 'border-blue-500 bg-blue-50'
                                                        : 'border-slate-200 hover:border-blue-300 hover:bg-blue-50/50'
                                                }`}
                                                onClick={() => setDisplayType(option.value)}
                                            >
                                                <RadioGroupItem value={option.value} id={`display-${option.value}`} className="text-blue-600" />
                                                <Label htmlFor={`display-${option.value}`} className="cursor-pointer text-sm">
                                                    {option.label}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                </RadioGroup>
                            </div>

                            {/* Hazard Layers Section - Simplified */}
                            <div className="mb-6">
                                <h4 className="mb-3 text-base font-medium text-slate-700">Lapisan Bahaya</h4>
                                <div className="space-y-1 rounded-md border border-slate-200 p-3">
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
                                        <div key={item.id} className="flex items-center space-x-2 py-1">
                                            <Checkbox
                                                id={item.id}
                                                checked={selectedHazardLayers.includes(item.id as HazardLayerType)}
                                                onCheckedChange={(checked) => handleHazardLayerChange(item.id as HazardLayerType, checked as boolean)}
                                                className="h-4 w-4 rounded border-gray-300 text-blue-600 data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600"
                                            />
                                            <Label htmlFor={item.id} className="cursor-pointer text-sm">
                                                {item.label}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Infrastructure Section - Simplified */}
                            <div>
                                <h4 className="mb-3 text-base font-medium text-slate-700">Infrastruktur</h4>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-1 rounded-md border border-slate-200 p-3">
                                    {(
                                        [
                                            { id: 'topografi', label: 'Topografi' },
                                            { id: 'fault', label: 'Fault' },
                                            { id: 'jalur_rel', label: 'Jalur Rel' },
                                            { id: 'jalan', label: 'Jalan' },
                                            { id: 'pasar', label: 'Pasar' },
                                            { id: 'masjid', label: 'Masjid' },
                                            { id: 'kelenteng', label: 'Kelenteng' },
                                            { id: 'pura', label: 'Pura' },
                                            { id: 'station', label: 'Station' },
                                            { id: 'terminal', label: 'Terminal' },
                                            { id: 'sungai', label: 'Sungai' },
                                            { id: 'batas_das', label: 'Batas DAS' },
                                            { id: 'batas_admin', label: 'Batas Admin' },
                                        ] as const
                                    ).map((item) => (
                                        <div key={item.id} className="flex items-center space-x-2 py-1">
                                            <Checkbox
                                                id={item.id}
                                                checked={selectedInfraLayers.includes(item.id as InfraLayerType)}
                                                onCheckedChange={(checked) => handleInfraLayerChange(item.id as InfraLayerType, checked as boolean)}
                                                className="h-4 w-4 rounded border-gray-300 text-blue-600"
                                            />
                                            <Label htmlFor={item.id} className="cursor-pointer text-sm">
                                                {item.label}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Map Legend */}
            <div className="border-t border-slate-200 bg-white shadow-md">
                <div className="container mx-auto py-4">
                    <div className="grid grid-cols-4 gap-4 px-4">
                        {/* Primary Disaster Icons */}
                        <div className="rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 p-3">
                            <div className="mb-2 text-xs font-semibold tracking-wide text-slate-500 uppercase">Icon Bencana</div>
                            <div className="flex flex-col space-y-2">
                                <div className="flex items-center space-x-2">
                                    <img src="/icons/banjir.svg" alt="Banjir" className="h-6 w-6" />
                                    <span className="text-sm">= Banjir</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <img src="/icons/gempa.svg" alt="Gempa" className="h-6 w-6" />
                                    <span className="text-sm">= Gempa</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <img src="/icons/tsunami.svg" alt="Tsunami" className="h-6 w-6" />
                                    <span className="text-sm">= Tsunami</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <img src="/icons/longsor.svg" alt="Longsor" className="h-6 w-6" />
                                    <span className="text-sm">= Longsor</span>
                                </div>
                            </div>
                        </div>

                        {/* Secondary Disaster Icons */}
                        <div className="rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 p-3">
                            <div className="mb-2 text-xs font-semibold tracking-wide text-slate-500 uppercase">Icon Bencana Lainnya</div>
                            <div className="flex flex-col space-y-2">
                                <div className="flex items-center space-x-2">
                                    <img src="/icons/kebakaran.svg" alt="Kebakaran" className="h-6 w-6" />
                                    <span className="text-sm">= Kebakaran</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <img src="/icons/kekeringan.svg" alt="Kekeringan" className="h-6 w-6" />
                                    <span className="text-sm">= Kekeringan</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <img src="/icons/angin-topan.svg" alt="Angin Topan" className="h-6 w-6" />
                                    <span className="text-sm">= Angin Topan</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <img src="/icons/lainnya.svg" alt="Lainnya" className="h-6 w-6" />
                                    <span className="text-sm">= Lainnya</span>
                                </div>
                            </div>
                        </div>

                        {/* Marker Types */}
                        <div className="rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 p-3">
                            <div className="mb-2 text-xs font-semibold tracking-wide text-slate-500 uppercase">Tipe Marker</div>
                            <div className="flex flex-col space-y-2">
                                <div className="flex items-center space-x-2">
                                    <img src="/icons/disaster-marker.svg" alt="Lokasi Bencana" className="h-6 w-6" />
                                    <span className="text-sm">= Lokasi Bencana</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <img src="/icons/shelter-marker.svg" alt="Shelter" className="h-6 w-6" />
                                    <span className="text-sm">= Shelter/Posko</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <img src="/icons/default-marker.svg" alt="Default" className="h-6 w-6" />
                                    <span className="text-sm">= Lokasi Umum</span>
                                </div>
                            </div>
                        </div>

                        {/* Status Indicators */}
                        <div className="rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 p-3">
                            <div className="mb-2 text-xs font-semibold tracking-wide text-slate-500 uppercase">Status Laporan</div>
                            <div className="flex flex-col space-y-2">
                                <div className="flex items-center space-x-2">
                                    <span className="inline-block h-3 w-3 rounded-full bg-green-500"></span>
                                    <span className="text-sm">= Terverifikasi</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="inline-block h-3 w-3 rounded-full bg-yellow-500"></span>
                                    <span className="text-sm">= Menunggu</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="inline-block h-3 w-3 rounded-full bg-red-500"></span>
                                    <span className="text-sm">= Ditolak</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
