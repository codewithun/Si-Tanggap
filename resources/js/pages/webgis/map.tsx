import { Head } from '@inertiajs/react';
import { ArcElement, BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, LineElement, PointElement, Title, Tooltip } from 'chart.js';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { Bar, Line, Pie } from 'react-chartjs-2';

// Register chart components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

// Define disaster type and disaster data types for proper type checking
type DisasterType = 'Banjir' | 'Gempa' | 'Tanah Longsor' | 'Kebakaran Hutan';
type LayerType = 'Titik Bencana' | 'Zona Risiko' | 'Fasilitas Evakuasi' | 'Jalur Evakuasi';

interface DisasterLocation {
    lat: number;
    lng: number;
}

interface Disaster {
    id: number;
    type: DisasterType;
    location: DisasterLocation;
    district: string;
    subdistrict: string;
    village: string;
    date: string;
    severity: string;
    victims: number;
    imageUrl: string;
}

// Sample disaster data
const disasterData: Disaster[] = [
    {
        id: 1,
        type: 'Banjir',
        location: { lat: -6.2088, lng: 106.8456 },
        district: 'Jakarta Pusat',
        subdistrict: 'Tanah Abang',
        village: 'Karet Tengsin',
        date: '2023-01-15',
        severity: 'Tinggi',
        victims: 250,
        imageUrl: 'https://images.unsplash.com/photo-1547683905-f686c993aae5',
    },
    {
        id: 2,
        type: 'Gempa',
        location: { lat: -7.7956, lng: 110.3695 },
        district: 'Yogyakarta',
        subdistrict: 'Sleman',
        village: 'Condongcatur',
        date: '2023-02-22',
        severity: 'Sedang',
        victims: 15,
        imageUrl: 'https://images.unsplash.com/photo-1600096194735-ec70c5b6b831',
    },
    {
        id: 3,
        type: 'Tanah Longsor',
        location: { lat: -6.9147, lng: 107.6098 },
        district: 'Bandung',
        subdistrict: 'Lembang',
        village: 'Cibodas',
        date: '2023-03-10',
        severity: 'Tinggi',
        victims: 45,
        imageUrl: 'https://images.unsplash.com/photo-1602425113580-fe92c8da149e',
    },
    {
        id: 4,
        type: 'Kebakaran Hutan',
        location: { lat: -0.7893, lng: 113.9213 },
        district: 'Kalimantan Tengah',
        subdistrict: 'Palangka Raya',
        village: 'Sebangau',
        date: '2023-08-05',
        severity: 'Ekstrem',
        victims: 0,
        imageUrl: 'https://images.unsplash.com/photo-1602584386319-fa8eb4361c2c',
    },
    {
        id: 5,
        type: 'Banjir',
        location: { lat: -7.2575, lng: 112.7521 },
        district: 'Surabaya',
        subdistrict: 'Wonokromo',
        village: 'Darmo',
        date: '2023-02-10',
        severity: 'Rendah',
        victims: 20,
        imageUrl: 'https://images.unsplash.com/photo-1597218868981-1b68e15f0065',
    },
];

// Disable default markers to use custom ones
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Custom marker icons
const createCustomIcon = (type: string) => {
    let iconColor;

    switch (type) {
        case 'Banjir':
            iconColor = 'blue';
            break;
        case 'Gempa':
            iconColor = 'red';
            break;
        case 'Tanah Longsor':
            iconColor = 'orange';
            break;
        case 'Kebakaran Hutan':
            iconColor = 'darkred';
            break;
        default:
            iconColor = 'gray';
    }

    return L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: ${iconColor}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
    });
};

export default function Map() {
    const mapRef = useRef<HTMLDivElement | null>(null);
    const mapInstance = useRef<L.Map | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activeLayers, setActiveLayers] = useState<Record<LayerType, boolean>>({
        'Titik Bencana': true,
        'Zona Risiko': false,
        'Fasilitas Evakuasi': false,
        'Jalur Evakuasi': false,
    });
    const [activeFilters, setActiveFilters] = useState<Record<DisasterType, boolean>>({
        Banjir: true,
        Gempa: true,
        'Tanah Longsor': true,
        'Kebakaran Hutan': true,
    });
    const [dateRange, setDateRange] = useState({
        from: '2023-01-01',
        to: '2023-12-31',
    });
    // const [selectedDisaster, setSelectedDisaster] = useState(null);

    // Initialize map
    useEffect(() => {
        if (!mapRef.current) return;

        // Initialize the map if not already initialized
        if (!mapInstance.current) {
            mapInstance.current = L.map(mapRef.current).setView([-2.5489, 118.0149], 5); // Center of Indonesia

            // Add tile layer (basemap)
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                maxZoom: 19,
            }).addTo(mapInstance.current!);

            // Add scale control
            L.control.scale({ imperial: false }).addTo(mapInstance.current);
        }

        // Clean up function
        return () => {
            if (mapInstance.current) {
                mapInstance.current.remove();
            }
        };
    }, []);

    // Update markers based on active filters
    useEffect(() => {
        if (!mapInstance.current) return;

        // Clear existing markers
        mapInstance.current.eachLayer((layer) => {
            if (layer instanceof L.Marker) {
                if (mapInstance.current) {
                    mapInstance.current.removeLayer(layer);
                }
            }
        });

        // Add filtered markers
        disasterData.forEach((disaster) => {
            if (activeFilters[disaster.type] && activeLayers['Titik Bencana']) {
                const marker = L.marker([disaster.location.lat, disaster.location.lng], {
                    icon: createCustomIcon(disaster.type),
                }).addTo(mapInstance.current!);

                // Add popup
                marker.bindPopup(`
                    <div class="disaster-popup">
                        <h3 class="text-lg font-bold">${disaster.type}</h3>
                        <div class="mb-2">
                            <img src="${disaster.imageUrl}?w=400&h=200&fit=crop" alt="${disaster.type}" class="w-full h-32 object-cover rounded mb-2">
                        </div>
                        <div class="mb-1"><strong>Lokasi:</strong> ${disaster.district}, ${disaster.subdistrict}, ${disaster.village}</div>
                        <div class="mb-1"><strong>Tanggal:</strong> ${disaster.date}</div>
                        <div class="mb-1"><strong>Tingkat Kerusakan:</strong> <span class="text-red-600 font-medium">${disaster.severity}</span></div>
                        ${disaster.victims > 0 ? `<div class="mb-1"><strong>Korban:</strong> ${disaster.victims} orang</div>` : ''}
                        <button class="mt-2 bg-blue-600 text-white px-3 py-1 rounded text-sm">Lapor Update</button>
                    </div>
                `);

                // Add click event
                marker.on('click', () => {
                    // setSelectedDisaster(disaster);
                });
            }
        });
    }, [activeLayers, activeFilters, dateRange]);

    // Toggle layer visibility
    const toggleLayer = (layerName: LayerType) => {
        setActiveLayers((prev) => ({
            ...prev,
            [layerName]: !prev[layerName],
        }));
    };

    // Toggle disaster type filter
    const toggleFilter = (disasterType: DisasterType) => {
        setActiveFilters((prev) => ({
            ...prev,
            [disasterType]: !prev[disasterType],
        }));
    };

    // Handle date range changes
    const handleDateChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setDateRange((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Chart data
    const barChartData = {
        labels: ['Banjir', 'Gempa', 'Tanah Longsor', 'Kebakaran Hutan'],
        datasets: [
            {
                label: 'Jumlah Kejadian',
                data: [25, 12, 18, 8],
                backgroundColor: ['rgba(54, 162, 235, 0.7)', 'rgba(255, 99, 132, 0.7)', 'rgba(255, 159, 64, 0.7)', 'rgba(175, 35, 35, 0.7)'],
            },
        ],
    };

    const lineChartData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'],
        datasets: [
            {
                label: 'Tren Kejadian 2023',
                data: [5, 8, 12, 6, 3, 2, 1, 4, 7, 9, 15, 10],
                borderColor: 'rgba(54, 162, 235, 1)',
                tension: 0.3,
                fill: false,
            },
        ],
    };

    const pieChartData = {
        labels: ['Kerusakan Tinggi', 'Kerusakan Sedang', 'Kerusakan Rendah'],
        datasets: [
            {
                data: [35, 45, 20],
                backgroundColor: ['rgba(255, 99, 132, 0.7)', 'rgba(255, 159, 64, 0.7)', 'rgba(54, 162, 235, 0.7)'],
                borderColor: ['rgba(255, 99, 132, 1)', 'rgba(255, 159, 64, 1)', 'rgba(54, 162, 235, 1)'],
                borderWidth: 1,
            },
        ],
    };

    return (
        <>
            <Head title="Peta Bencana - Si Tanggap">
                <link
                    rel="stylesheet"
                    href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
                    integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
                    crossOrigin=""
                />
            </Head>

            <div className="flex h-screen flex-col">
                {/* Header */}
                <header className="z-10 bg-white px-4 py-2 shadow-sm">
                    <div className="container mx-auto flex items-center justify-between">
                        <div className="flex items-center">
                            <a href="/webgis" className="flex items-center">
                                <img src="/logo.svg" alt="Si Tanggap Logo" className="mr-2 h-8 w-8" />
                                <span className="text-xl font-bold text-blue-600">Si Tanggap</span>
                            </a>
                        </div>

                        <div className="hidden items-center space-x-4 md:flex">
                            {/* Search Bar */}
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Cari lokasi..."
                                    className="w-64 rounded-md border border-gray-300 py-2 pr-4 pl-10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="absolute top-2.5 left-3 h-5 w-5 text-gray-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                    />
                                </svg>
                            </div>

                            {/* Navigation links */}
                            <a href="/webgis" className="text-gray-700 hover:text-blue-600">
                                Beranda
                            </a>
                            <a href="/webgis/reports" className="text-gray-700 hover:text-blue-600">
                                Laporan
                            </a>
                            <a href="/webgis/data" className="text-gray-700 hover:text-blue-600">
                                Data
                            </a>
                            <a href="/webgis/about" className="text-gray-700 hover:text-blue-600">
                                Tentang
                            </a>
                        </div>

                        {/* Mobile menu button */}
                        <button className="text-gray-500 md:hidden">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </header>

                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar */}
                    <div className={`z-20 flex flex-col bg-white shadow-lg transition-all duration-300 ${sidebarOpen ? 'w-80' : 'w-12'}`}>
                        {/* Sidebar toggle button */}
                        <button
                            className="absolute top-16 left-80 z-30 ml-2 -translate-x-1/2 transform rounded-full bg-white p-1 shadow-md"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            style={{ left: sidebarOpen ? '320px' : '48px' }}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className={`h-5 w-5 text-gray-600 transition-transform ${sidebarOpen ? 'rotate-180' : ''}`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>

                        {/* Sidebar content */}
                        {sidebarOpen && (
                            <div className="overflow-y-auto p-4">
                                <h2 className="mb-4 text-lg font-semibold">Kontrol Peta</h2>

                                {/* Layer Control */}
                                <div className="mb-6">
                                    <h3 className="mb-3 text-sm font-medium text-gray-900">Layer</h3>
                                    <div className="space-y-2">
                                        {Object.keys(activeLayers).map((layer) => (
                                            <label key={layer} className="flex cursor-pointer items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={activeLayers[layer as LayerType]}
                                                    onChange={() => toggleLayer(layer as LayerType)}
                                                    className="mr-2 h-4 w-4 accent-blue-600"
                                                />
                                                <span>{layer}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Disaster Type Filter */}
                                <div className="mb-6">
                                    <h3 className="mb-3 text-sm font-medium text-gray-900">Jenis Bencana</h3>  
                                    <div className="space-y-2">
                                        {Object.keys(activeFilters).map((type) => (
                                            <label key={type} className="flex cursor-pointer items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={activeFilters[type as DisasterType]}
                                                    onChange={() => toggleFilter(type as DisasterType)}
                                                    className="mr-2 h-4 w-4 accent-blue-600"
                                                />
                                                <span className="flex items-center">
                                                    <span
                                                        className="mr-2 inline-block h-3 w-3 rounded-full"
                                                        style={{
                                                            backgroundColor:
                                                                type === 'Banjir'
                                                                    ? 'blue'
                                                                    : type === 'Gempa'
                                                                      ? 'red'
                                                                      : type === 'Tanah Longsor'
                                                                        ? 'orange'
                                                                        : 'darkred',
                                                        }}
                                                    ></span>
                                                    {type}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Date Range Filter */}
                                <div className="mb-6">
                                    <h3 className="mb-3 text-sm font-medium text-gray-900">Rentang Waktu</h3>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="mb-1 block text-xs">Dari</label>
                                            <input
                                                type="date"
                                                name="from"
                                                value={dateRange.from}
                                                onChange={handleDateChange}
                                                max={dateRange.to}
                                                className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-xs">Sampai</label>
                                            <input
                                                type="date"
                                                name="to"
                                                value={dateRange.to}
                                                onChange={handleDateChange}
                                                min={dateRange.from}
                                                className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                                            />
                                        </div>
                                        <button
                                            className="mt-2 w-full rounded-md bg-blue-600 py-2 text-sm text-white transition-colors hover:bg-blue-700"
                                            onClick={() => {
                                                // Apply date filter logic here
                                                console.log('Applying date filter:', dateRange);
                                            }}
                                        >
                                            Terapkan Filter
                                        </button>
                                    </div>
                                </div>

                                {/* Legend */}
                                <div>
                                    <h3 className="mb-3 text-sm font-medium text-gray-900">Legenda</h3>
                                    <div className="rounded-md bg-gray-50 p-3">
                                        <h4 className="mb-2 text-xs font-medium text-gray-800">Jenis Bencana</h4>
                                        <div className="space-y-2 text-xs">
                                            <div className="flex items-center">
                                                <span
                                                    className="bg-blue mr-2 inline-block h-3 w-3 rounded-full"
                                                    style={{ backgroundColor: 'blue' }}
                                                ></span>
                                                <span>Banjir</span>
                                            </div>
                                            <div className="flex items-center">
                                                <span
                                                    className="bg-red mr-2 inline-block h-3 w-3 rounded-full"
                                                    style={{ backgroundColor: 'red' }}
                                                ></span>
                                                <span>Gempa</span>
                                            </div>
                                            <div className="flex items-center">
                                                <span
                                                    className="bg-orange mr-2 inline-block h-3 w-3 rounded-full"
                                                    style={{ backgroundColor: 'orange' }}
                                                ></span>
                                                <span>Tanah Longsor</span>
                                            </div>
                                            <div className="flex items-center">
                                                <span
                                                    className="bg-darkred mr-2 inline-block h-3 w-3 rounded-full"
                                                    style={{ backgroundColor: 'darkred' }}
                                                ></span>
                                                <span>Kebakaran Hutan</span>
                                            </div>
                                        </div>

                                        <div className="mt-4">
                                            <h4 className="mb-2 text-xs font-medium text-gray-800">Tingkat Kerusakan</h4>
                                            <div className="flex items-center">
                                                <div className="h-2 flex-1 rounded bg-gradient-to-r from-blue-500 via-yellow-500 to-red-500"></div>
                                            </div>
                                            <div className="mt-1 flex justify-between text-xs">
                                                <span>Rendah</span>
                                                <span>Sedang</span>
                                                <span>Tinggi</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Map container */}
                    <div className="flex flex-1 flex-col">
                        <div id="map" ref={mapRef} className="h-[600px] w-full flex-1"></div>

                        {/* Dashboard Section */}
                        <div className="overflow-y-auto bg-gray-100 p-4">
                            <h2 className="mb-4 text-xl font-bold">Dashboard Bencana</h2>

                            {/* Stats Cards */}
                            <div className="mb-6 grid grid-cols-4 gap-4">
                                <div className="rounded-lg bg-white p-4 shadow">
                                    <h3 className="mb-1 text-sm text-gray-500">Total Kejadian</h3>
                                    <p className="text-2xl font-bold">63</p>
                                    <span className="text-xs text-green-600">+12% dari bulan lalu</span>
                                </div>
                                <div className="rounded-lg bg-white p-4 shadow">
                                    <h3 className="mb-1 text-sm text-gray-500">Total Korban</h3>
                                    <p className="text-2xl font-bold">330</p>
                                    <span className="text-xs text-red-600">+28% dari bulan lalu</span>
                                </div>
                                <div className="rounded-lg bg-white p-4 shadow">
                                    <h3 className="mb-1 text-sm text-gray-500">Area Terdampak</h3>
                                    <p className="text-2xl font-bold">42</p>
                                    <span className="text-xs text-gray-600">Kabupaten/Kota</span>
                                </div>
                                <div className="rounded-lg bg-white p-4 shadow">
                                    <h3 className="mb-1 text-sm text-gray-500">Est. Kerugian</h3>
                                    <p className="text-2xl font-bold">25.7 M</p>
                                    <span className="text-xs text-gray-600">Dalam Rupiah</span>
                                </div>
                            </div>

                            {/* Charts */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="rounded-lg bg-white p-4 shadow">
                                    <h3 className="mb-3 text-sm font-medium">Jumlah Kejadian per Jenis</h3>
                                    <div className="h-64">
                                        <Bar
                                            data={barChartData}
                                            options={{
                                                plugins: { 
                                                    legend: { 
                                                        display: false 
                                                    } 
                                                },
                                                responsive: true,
                                                maintainAspectRatio: false,
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="rounded-lg bg-white p-4 shadow">
                                    <h3 className="mb-3 text-sm font-medium">Tren Kejadian Bencana</h3>
                                    <div className="h-64">
                                        <Line
                                            data={lineChartData}
                                            options={{
                                                plugins: { 
                                                    legend: { 
                                                        display: false 
                                                    } 
                                                },
                                                responsive: true,
                                                maintainAspectRatio: false,
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="rounded-lg bg-white p-4 shadow">
                                    <h3 className="mb-3 text-sm font-medium">Distribusi Dampak Bencana</h3>
                                    <div className="flex h-64 items-center justify-center">
                                        <Pie
                                            data={pieChartData}
                                            options={{
                                                responsive: true,
                                                maintainAspectRatio: false,
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}