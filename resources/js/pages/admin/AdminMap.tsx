// filepath: d:\laragon\www\Si-Tanggap\resources\js\pages\admin\AdminMap.tsx
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/useToast';
import AppLayout from '@/layouts/app-layout';
import axios from '@/lib/axios';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import L, { icon, Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useCallback, useEffect, useState } from 'react';
import { MapContainer, Marker, Polyline, Popup, TileLayer } from 'react-leaflet';

// Define breadcrumbs for consistent navigation
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard Admin',
        href: '/admin/dashboard',
    },
    {
        title: 'Peta Jalur & Posko Evakuasi',
        href: '/admin/map',
    },
];

// --- Interfaces ---
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

interface Disaster {
    id: number;
    nama: string;
    deskripsi: string;
    jenis_bencana: string;
    status: string;
    latitude: number;
    longitude: number;
}

// Add type definition for coordinate objects with various possible structures
interface CoordinatePoint {
    lat?: number;
    latitude?: number;
    lng?: number;
    longitude?: number;
    [key: number]: number | undefined;
}

// --- Icons ---
const shelterIcon = icon({
    iconUrl: '/icons/posko.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
});

// Replace your disasterIcons definition with this:
const cacheBuster = new Date().getTime();
// Map icon keys to match exactly the disaster types from the database
const disasterIcons = {
    gempa: icon({
        iconUrl: `/icons/icon-gempa.png?v=${cacheBuster}`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16],
    }),
    'gempa bumi': icon({
        iconUrl: `/icons/icon-gempa.png?v=${cacheBuster}`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16],
    }),
    banjir: icon({
        iconUrl: `/icons/icon-banjir.png?v=${cacheBuster}`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16],
    }),
    'tanah longsor': icon({
        iconUrl: `/icons/icon-tanahlongsor.png?v=${cacheBuster}`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16],
    }),
    tsunami: icon({
        iconUrl: `/icons/icon-tsunami.png?v=${cacheBuster}`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16],
    }),
    kebakaran: icon({
        iconUrl: `/icons/icon-kebakaran.png?v=${cacheBuster}`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16],
    }),
    kekeringan: icon({
        iconUrl: `/icons/icon-kekeringan.png?v=${cacheBuster}`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16],
    }),
    default: icon({
        iconUrl: `/icons/disaster-marker.svg?v=${cacheBuster}`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16],
    }),
};

// Helper function to get the right icon based on disaster type
const getDisasterIcon = (disasterType: string) => {
    if (!disasterType) {
        console.warn('Disaster has no type, using default icon');
        return disasterIcons.default;
    }

    const type = disasterType.toLowerCase().trim();
    console.log(`Looking for icon for disaster type: "${type}"`);

    // Check if there's a direct match
    if (type in disasterIcons) {
        console.log(`Found direct icon match for "${type}"`);
        return disasterIcons[type as keyof typeof disasterIcons];
    }

    // Common mappings for disaster types
    const typeMapping: Record<string, string> = {
        gempa: 'gempa',
        'gempa bumi': 'gempa',
        banjir: 'banjir',
        longsor: 'tanah longsor',
        'tanah longsor': 'tanah longsor',
        tsunami: 'tsunami',
        kebakaran: 'kebakaran',
        kekeringan: 'kekeringan',
    };

    // Try to match based on known mappings
    for (const [key, mappedType] of Object.entries(typeMapping)) {
        if (type.includes(key)) {
            console.log(`Found mapping match: "${type}" -> "${mappedType}"`);
            return disasterIcons[mappedType as keyof typeof disasterIcons];
        }
    }

    // If no direct match or mapping, try to find a partial match
    const keys = Object.keys(disasterIcons);
    const partialMatch = keys.find((key) => type.includes(key.toLowerCase()) || key.toLowerCase().includes(type));

    if (partialMatch) {
        console.log(`Found partial icon match: "${type}" -> "${partialMatch}"`);
        return disasterIcons[partialMatch as keyof typeof disasterIcons];
    }

    console.warn(`No icon match for "${type}", using default`);
    return disasterIcons.default;
};

// --- CustomMap Component with all overlays ---
function CustomMap({
    height,
    className,
    poskos = [],
    jalurEvakuasi = [],
    disasters = [],
    zoom = 13,
    center = [-7.797068, 110.370529],
}: {
    height?: string;
    className?: string;
    poskos?: Posko[];
    jalurEvakuasi?: JalurEvakuasi[];
    disasters?: Disaster[];
    zoom?: number;
    center?: [number, number];
}) {
    // Log routes for troubleshooting
    useEffect(() => {
        if (jalurEvakuasi?.length > 0) {
            console.log(`Rendering ${jalurEvakuasi.length} evacuation routes`);
        }
    }, [jalurEvakuasi]);

    useEffect(() => {
        // Add custom style for map z-index
        const style = document.createElement('style');
        style.textContent = `
            /* Control map z-index */
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

    // Fix Leaflet default icon issues
    useEffect(() => {
        // Use the imported Icon and set default marker options
        Icon.Default.mergeOptions({
            iconUrl: '/icons/default-marker.png',
            iconRetinaUrl: '/icons/default-marker-2x.png',
            shadowUrl: '/icons/marker-shadow.png',
        });

        // Log icon loading status for debugging
        const iconFiles = [
            '/icons/posko.png',
            '/icons/icon-gempa.png',
            '/icons/icon-banjir.png',
            '/icons/icon-tanahlongsor.png',
            '/icons/icon-tsunami.png',
            '/icons/icon-kebakaran.png',
            '/icons/icon-kekeringan.png',
            '/icons/icon-angin-topan.svg',
            '/icons/icon-lainnya.svg',
            '/icons/disaster-marker.svg',
        ];

        console.log('Checking icon availability:');
        iconFiles.forEach((path) => {
            const img = new Image();
            img.src = path;
            img.onload = () => console.log(`✅ Icon loaded successfully: ${path}`);
            img.onerror = () => console.error(`❌ Failed to load icon: ${path}`);

            // Also log a fetch attempt for additional diagnostics
            fetch(path)
                .then((response) => {
                    if (response.ok) {
                        console.log(`📁 Icon file exists (HTTP ${response.status}): ${path}`);
                    } else {
                        console.error(`📁 Icon file missing (HTTP ${response.status}): ${path}`);
                    }
                })
                .catch((error) => console.error(`📁 Error checking icon file: ${path}`, error));
        });
    }, []);

    // More thorough filtering of routes with valid coordinates
    const validRoutes = jalurEvakuasi.filter((jalur) => {
        if (!jalur.koordinat || !Array.isArray(jalur.koordinat)) {
            console.warn(`Route ${jalur.id} has invalid coordinates format`);
            return false;
        }

        if (jalur.koordinat.length < 2) {
            console.warn(`Route ${jalur.id} has insufficient points (${jalur.koordinat.length})`);
            return false;
        }

        const validPoints = jalur.koordinat.every(
            (point) =>
                point && typeof point === 'object' && 'lat' in point && 'lng' in point && !isNaN(Number(point.lat)) && !isNaN(Number(point.lng)),
        );

        if (!validPoints) {
            console.warn(`Route ${jalur.id} has invalid point format`);
            return false;
        }

        return true;
    });

    if (validRoutes.length !== jalurEvakuasi.length) {
        console.warn(`Filtered out ${jalurEvakuasi.length - validRoutes.length} routes with invalid coordinates`);
    }

    // Add this inside your CustomMap component
    useEffect(() => {
        console.log('🔍 DISASTER DATA DEBUGGING:');
        console.log(
            '📋 Disaster icons defined:',
            Object.keys(disasterIcons).map((key) => {
                const iconPath = (disasterIcons as Record<string, L.Icon>)[key].options?.iconUrl;
                const iconFilename = iconPath?.split('/').pop()?.split('?')[0];
                return {
                    type: key,
                    path: iconPath,
                    filename: iconFilename,
                };
            }),
        );

        // Log unique disaster types for easier debugging
        const uniqueTypes = [...new Set(disasters.map((d) => d.jenis_bencana))];
        console.log('📊 Unique disaster types in data:', uniqueTypes);

        // Check what would getDisasterIcon return for each disaster
        console.log('🗺️ DISASTER ICONS MAPPING:');
        disasters.forEach((disaster) => {
            const icon = getDisasterIcon(disaster.jenis_bencana);
            // Extract just the filename from the URL for cleaner logs
            const iconPath = icon?.options?.iconUrl || 'unknown';
            const iconFilename = iconPath.split('/').pop()?.split('?')[0];
            console.log(`Disaster ${disaster.id} (${disaster.jenis_bencana}) using icon: ${iconFilename} (${iconPath})`);
        });

        // Test the lookup for each unique type we found
        if (uniqueTypes.length > 0) {
            console.log('\n🧪 TESTING ICON MAPPING FOR UNIQUE DISASTER TYPES:');
            uniqueTypes.forEach((type) => {
                const icon = getDisasterIcon(type);
                const iconPath = icon?.options?.iconUrl || 'unknown';
                const iconFilename = iconPath.split('/').pop()?.split('?')[0];
                console.log(`Type "${type}" maps to icon: ${iconFilename} (${iconPath})`);

                // Also test if the icon file actually exists
                const img = new Image();
                img.src = iconPath;
                img.onload = () => console.log(`✅ Icon for "${type}" exists`);
                img.onerror = () => console.error(`❌ Icon for "${type}" does not exist`);
            });
        }
    }, [disasters]);

    return (
        <div style={{ height }} className={className}>
            <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />

                {/* Disaster Markers */}
                {disasters.map((disaster) => (
                    <Marker
                        key={`disaster-${disaster.id}`}
                        position={[disaster.latitude, disaster.longitude]}
                        icon={getDisasterIcon(disaster.jenis_bencana)}
                    >
                        <Popup>
                            <div>
                                <div className="mb-1 text-base font-bold">{disaster.nama}</div>
                                <div className="mb-1 text-sm">{disaster.deskripsi}</div>
                                <div className="mt-1 text-xs text-gray-600">
                                    <div>
                                        <span className="font-semibold">Jenis:</span> {disaster.jenis_bencana}
                                    </div>
                                    <div>
                                        <span className="font-semibold">Status:</span> {disaster.status}
                                    </div>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}

                {/* Posko Markers */}
                {poskos.map((marker) => (
                    <Marker key={`posko-${marker.id}`} position={[marker.latitude, marker.longitude]} icon={shelterIcon}>
                        <Popup>
                            <div style={{ minWidth: 270, minHeight: 110, display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: 16 }}>
                                <div style={{ flex: 1 }}>
                                    <div className="mb-1 text-base font-bold">{marker.nama}</div>
                                    <div className="mb-1 text-sm">{marker.deskripsi}</div>
                                    <div className="mt-2 text-xs text-gray-600">
                                        <div>
                                            <span className="font-semibold">Alamat:</span> {marker.alamat || 'Tidak tersedia'}
                                        </div>
                                        <div>
                                            <span className="font-semibold">Kontak:</span> {marker.kontak || 'Tidak tersedia'}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ flex: 0.7 }}>
                                    <div className="text-xs">
                                        <div>
                                            <span className="font-semibold">Jenis:</span> {marker.jenis_posko || 'Tidak tersedia'}
                                        </div>
                                        <div>
                                            <span className="font-semibold">Status:</span> {marker.status || 'Aktif'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
                {/* Jalur Evakuasi Polylines */}
                {validRoutes.map((jalur) => (
                    <Polyline
                        key={`jalur-${jalur.id}`}
                        positions={jalur.koordinat.map((point) => [point.lat, point.lng] as [number, number])}
                        pathOptions={{ color: jalur.warna || '#3B82F6', weight: 3, opacity: 0.8 }}
                    >
                        <Popup>
                            <div>
                                <div className="font-bold">{jalur.nama}</div>
                                <div className="text-xs text-gray-600">jalur evakuasi</div>
                            </div>
                        </Popup>
                    </Polyline>
                ))}
            </MapContainer>
        </div>
    );
}

export default function AdminMap() {
    const [jalurEvakuasi, setJalurEvakuasi] = useState<JalurEvakuasi[]>([]);
    const [posko, setPosko] = useState<Posko[]>([]);
    const [disasters, setDisasters] = useState<Disaster[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    // Add timestamp state for cache busting
    const [fetchTimestamp, setFetchTimestamp] = useState(Date.now());
    // Add auto refresh interval (setiap 30 detik)
    const [autoRefreshEnabled] = useState(true);

    // Function to refresh data by updating the timestamp
    const refreshData = () => {
        setLoading(true);
        setFetchTimestamp(Date.now()); // This will trigger the useEffect and refetch data
    }; // Function to normalize coordinates to consistent format
    const normalizeCoordinates = useCallback((jalurData: JalurEvakuasi[]) => {
        return jalurData.map((jalur) => {
            // If koordinat is undefined or null, return empty array
            if (!jalur.koordinat) {
                console.warn('Missing koordinat for jalur:', jalur.id);
                return { ...jalur, koordinat: [] };
            }

            // Log original format for debugging
            console.log(`Normalizing koordinat for jalur ${jalur.id}:`, {
                type: typeof jalur.koordinat,
                isArray: Array.isArray(jalur.koordinat),
                sample: Array.isArray(jalur.koordinat) && jalur.koordinat.length > 0 ? jalur.koordinat[0] : null,
                raw: jalur.koordinat,
            });

            // Pastikan koordinat selalu dalam format yang diharapkan oleh Map component: [{lat, lng}, {lat, lng}]
            let normalizedKoordinat = jalur.koordinat;

            try {
                // Handle string format (from JSON)
                if (typeof jalur.koordinat === 'string') {
                    try {
                        const parsed = JSON.parse(jalur.koordinat);
                        jalur.koordinat = parsed;
                        console.log('Parsed koordinat from string:', parsed);
                    } catch (e) {
                        console.error('Failed to parse koordinat string:', e);
                        return { ...jalur, koordinat: [] };
                    }
                }

                // Jika koordinat adalah array of arrays [[lat, lng], [lat, lng]]
                if (Array.isArray(jalur.koordinat) && jalur.koordinat.length > 0 && Array.isArray(jalur.koordinat[0])) {
                    console.log('Converting array of arrays to objects');
                    normalizedKoordinat = jalur.koordinat.map((coord) => {
                        // Ensure we treat coord as a numeric array
                        const coordArray = coord as unknown as number[];
                        return { lat: parseFloat(String(coordArray[0])), lng: parseFloat(String(coordArray[1])) };
                    });
                }
                // Jika koordinat adalah array namun bukan array of objects
                else if (Array.isArray(jalur.koordinat) && jalur.koordinat.length > 0 && typeof jalur.koordinat[0] !== 'object') {
                    console.log('Converting flat array to objects');
                    const coords = [];
                    for (let i = 0; i < jalur.koordinat.length; i += 2) {
                        if (i + 1 < jalur.koordinat.length) {
                            coords.push({
                                lat: parseFloat(String(jalur.koordinat[i])),
                                lng: parseFloat(String(jalur.koordinat[i + 1])),
                            });
                        }
                    }
                    normalizedKoordinat = coords;
                }
                // Jika koordinat sudah berupa array of objects tapi perlu verify properties
                else if (Array.isArray(jalur.koordinat) && jalur.koordinat.length > 0 && typeof jalur.koordinat[0] === 'object') {
                    console.log('Verifying object properties');
                    normalizedKoordinat = jalur.koordinat.map((coord) => {
                        // Handling different property names that might exist
                        const coordObj = coord as CoordinatePoint; // Use our defined type instead of any
                        const lat = coordObj.lat || coordObj.latitude || coordObj[0] || 0;
                        const lng = coordObj.lng || coordObj.longitude || coordObj[1] || 0;
                        return { lat: parseFloat(String(lat)), lng: parseFloat(String(lng)) };
                    });
                }

                console.log('Normalized koordinat:', normalizedKoordinat);
            } catch (error) {
                console.error('Error normalizing coordinates:', error);
                return { ...jalur, koordinat: [] };
            }

            return {
                ...jalur,
                koordinat: normalizedKoordinat,
            };
        });
    }, []);

    // --- Fetchers ---
    const fetchJalurEvakuasi = useCallback(async () => {
        try {
            // Use a random parameter for more effective cache-busting
            const cacheBuster = `${fetchTimestamp}-${Math.random().toString(36).substring(2, 15)}`;

            // Make several attempts with different cache-busting parameters
            let jalurData: JalurEvakuasi[] = [];
            let attempts = 0;
            const maxAttempts = 2;

            while (jalurData.length === 0 && attempts < maxAttempts) {
                attempts++;
                console.log(`Fetching evacuation routes attempt ${attempts}/${maxAttempts}`);

                // Try different endpoints and parameters for cache-busting
                const response = await axios.get(`/jalur-evakuasi?t=${cacheBuster}&attempt=${attempts}`);

                // Handle both array and pagination object formats
                if (Array.isArray(response.data)) {
                    jalurData = response.data;
                } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
                    jalurData = response.data.data;
                }

                // If we got data, log it for debugging
                if (jalurData.length > 0) {
                    console.log(`Fetched ${jalurData.length} evacuation routes`);
                    console.log('First route:', jalurData[0]);

                    // Log detailed information about coordinates
                    if (jalurData[0] && jalurData[0].koordinat) {
                        console.log('Debug - First route coordinates info:', {
                            type: typeof jalurData[0].koordinat,
                            isArray: Array.isArray(jalurData[0].koordinat),
                            length: Array.isArray(jalurData[0].koordinat) ? jalurData[0].koordinat.length : 0,
                            sample:
                                Array.isArray(jalurData[0].koordinat) && jalurData[0].koordinat.length > 0
                                    ? jalurData[0].koordinat[0]
                                    : 'no coordinates',
                        });
                    }

                    break; // Exit the loop if we have data
                } else if (attempts < maxAttempts) {
                    // Wait briefly before trying again
                    await new Promise((resolve) => setTimeout(resolve, 300));
                }
            }

            // Process and normalize the data
            const normalizedData = normalizeCoordinates(jalurData);

            // Log count of routes with valid coordinates
            const validRoutes = normalizedData.filter((route) => Array.isArray(route.koordinat) && route.koordinat.length > 1);
            console.log(`Processed ${normalizedData.length} routes, ${validRoutes.length} have valid coordinates`);

            setJalurEvakuasi(normalizedData);
            return normalizedData;
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
    }, [toast, fetchTimestamp, normalizeCoordinates]);

    const fetchPosko = useCallback(async () => {
        try {
            // Add cache-busting parameter here too
            const response = await axios.get(`/poskos?t=${fetchTimestamp}`);
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
    }, [toast, fetchTimestamp]);

    const fetchDisasters = useCallback(async () => {
        try {
            // Add cache-busting parameter
            const response = await axios.get(`/disasters?t=${fetchTimestamp}`);
            const disasterData = Array.isArray(response.data) ? response.data : response.data.data;
            setDisasters(disasterData || []);
            return disasterData || [];
        } catch (error: unknown) {
            console.error('Failed to fetch disasters:', error);
            const errorMessage = error instanceof Error ? error.message : 'Gagal memuat data bencana';
            toast({
                title: 'Error',
                description: errorMessage,
                variant: 'destructive',
            });
            setDisasters([]);
            return [];
        }
    }, [toast, fetchTimestamp]);

    // Update your Promise.all in useEffect to include fetchDisasters
    useEffect(() => {
        Promise.all([fetchJalurEvakuasi(), fetchPosko(), fetchDisasters()])
            .then(() => setLoading(false))
            .catch(() => setLoading(false));
    }, [fetchJalurEvakuasi, fetchPosko, fetchDisasters, fetchTimestamp]);

    // Cek perubahan terakhir saat awal load halaman
    useEffect(() => {
        const checkForUpdates = async () => {
            try {
                // Mendapatkan timestamp terakhir modifikasi dari localStorage (jika ada)
                const lastUpdateTimestamp = localStorage.getItem('lastEvacuationDataUpdate');
                const now = Date.now();
                const timeDiff = lastUpdateTimestamp ? now - parseInt(lastUpdateTimestamp) : Infinity;

                // Jika tidak ada timestamp sebelumnya atau data lebih dari 1 menit yang lalu, refresh
                if (!lastUpdateTimestamp || timeDiff > 60000) {
                    refreshData();
                    // Simpan timestamp terbaru
                    localStorage.setItem('lastEvacuationDataUpdate', now.toString());
                }
            } catch (error) {
                console.error('Failed to check for updates:', error);
            }
        };

        checkForUpdates();
    }, []);

    // Auto refresh effect - setiap 30 detik
    useEffect(() => {
        let intervalId: NodeJS.Timeout | null = null;

        if (autoRefreshEnabled) {
            intervalId = setInterval(() => {
                setFetchTimestamp(Date.now());
            }, 30000); // 30 detik
        }

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [autoRefreshEnabled]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Peta Jalur & Posko Evakuasi" />

            <div className="p-6">
                <h1 className="mb-4 text-2xl font-semibold text-gray-800">Peta Jalur & Posko Evakuasi</h1>
                <p className="mb-6 text-gray-600">Visualisasi jalur evakuasi dan posko pengungsian dalam bentuk peta interaktif.</p>

                <div className="space-y-2 sm:space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold sm:text-2xl">Peta Jalur Evakuasi & Posko</h2>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={refreshData} disabled={loading}>
                                {loading ? 'Memuat...' : 'Refresh'}
                            </Button>
                        </div>
                    </div>
                    {loading ? (
                        <div className="h-[400px] w-full animate-pulse rounded-lg bg-gray-200 sm:h-[600px]"></div>
                    ) : jalurEvakuasi.length === 0 && posko.length === 0 ? (
                        <div className="flex h-[400px] w-full items-center justify-center rounded-lg border border-dashed sm:h-[600px]">
                            <div className="text-center">
                                <p className="text-lg font-medium text-gray-600">Belum ada data</p>
                                <p className="text-sm text-gray-500">Belum ada jalur evakuasi atau posko yang tersedia</p>
                            </div>
                        </div>
                    ) : (
                        <div className="h-[450px] w-full overflow-hidden rounded-lg sm:h-[600px]">
                            <CustomMap
                                height="100%"
                                className="h-full w-full"
                                poskos={posko}
                                jalurEvakuasi={jalurEvakuasi}
                                disasters={disasters} // Add this line
                                zoom={6}
                                center={[-7.150975, 110.140259]}
                            />
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
