import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import React from 'react';
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMapEvents } from 'react-leaflet';
import ErrorBoundary from './ErrorBoundary';
import LegendControl from './LegendControl';

interface MapComponentProps {
    height?: string;
    className?: string;
    initialView?: [number, number];
    zoom?: number;
    minZoom?: number;
    maxBounds?: [[number, number], [number, number]];
    markers?: Array<{
        id: number | string;
        position: [number, number];
        title: string;
        iconUrl: string;
        status?: 'diverifikasi' | 'menunggu' | 'ditolak';
        description?: string;
        popupContent?: React.ReactNode;
    }>;
    paths?: Array<{
        id: number;
        positions: Array<[number, number]>;
        color: string;
        name: string;
    }>;
    onClick?: (latLng: { lat: number; lng: number }) => void;
    editable?: boolean;
    mapType?: 'standard' | 'satellite' | 'terrain';
}

// Improved custom marker icon function
const createCustomIcon = (iconUrl: string, iconSize: [number, number] = [30, 30], status?: 'diverifikasi' | 'menunggu' | 'ditolak') => {
    const color = status === 'diverifikasi' ? '#22c55e' : status === 'menunggu' ? '#eab308' : status === 'ditolak' ? '#ef4444' : undefined;

    // Enhance the HTML for better icon display
    const html = `
        <div style="
            position: relative;
            width: ${iconSize[0]}px;
            height: ${iconSize[1]}px;
            display: flex;
            justify-content: center;
            align-items: center;
            filter: ${color ? `drop-shadow(0 0 4px ${color})` : 'none'};
        ">
            <img 
                src="${iconUrl}" 
                style="
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                    display: block;
                "
                alt="disaster icon"
            />
        </div>
    `;

    return L.divIcon({
        html,
        className: 'custom-marker-icon',
        iconSize,
        iconAnchor: [iconSize[0] / 2, iconSize[1] / 2], // Center the icon anchor
        popupAnchor: [0, -iconSize[1] / 2], // Position popup above the icon
    });
};

// Specific disaster type icons
const disasterIcons: Record<string, (status?: 'diverifikasi' | 'menunggu' | 'ditolak') => L.DivIcon> = {
    banjir: (status) => createCustomIcon('/icons/icon-banjir.png', [30, 30], status),
    gempa: (status) => createCustomIcon('/icons/icon-gempa.png', [30, 30], status),
    tsunami: (status) => createCustomIcon('/icons/icon-tsunami.png', [30, 30], status),
    longsor: (status) => createCustomIcon('/icons/icon-tanahlongsor.png', [30, 30], status),
    kebakaran: (status) => createCustomIcon('/icons/icon-kebakaran.png', [30, 30], status),
    kekeringan: (status) => createCustomIcon('/icons/icon-kekeringan.png', [30, 30], status),
    angin_topan: (status) => createCustomIcon('/icons/icon-angin-topan.svg', [30, 30], status),
    lainnya: (status) => createCustomIcon('/icons/icon-lainnya.svg', [30, 30], status),
};

// Map click handler component
const MapClickHandler = ({ onClick }: { onClick: (latLng: { lat: number; lng: number }) => void }) => {
    useMapEvents({
        click: (e) => {
            onClick({ lat: e.latlng.lat, lng: e.latlng.lng });
        },
    });
    return null;
};

const MapComponent: React.FC<MapComponentProps> = ({
    height = '500px',
    className = '',
    initialView = [-2.5489, 118.0149], // Indonesia center
    zoom = 5,
    minZoom = 3,
    maxBounds = undefined,
    markers = [],
    paths = [],
    onClick,
    editable = false,
    mapType = 'standard', // Default to standard map
}) => {
    // Get the appropriate tile layer based on the mapType
    const getTileLayer = () => {
        switch (mapType) {
            case 'satellite':
                return (
                    <TileLayer
                        attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
                        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                        noWrap={false}
                    />
                );
            case 'terrain':
                return (
                    <TileLayer
                        attribution='&copy; <a href="https://www.opentopomap.org">OpenTopoMap</a> contributors'
                        url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
                        noWrap={false}
                        maxZoom={17}
                    />
                );
            default:
                // Standard map (equivalent to Google's "Map" view)
                return (
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        noWrap={false}
                    />
                );
        }
    };

    const MapWithBoundaries = ({ children, maxLatitude = 100 }: { children: React.ReactNode; maxLatitude?: number }) => {
        const map = useMapEvents({
            movestart: () => {
                // No action needed on movestart
            },
            moveend: () => {
                const center = map.getCenter();

                // Check if the current center is outside our latitude bounds
                if (Math.abs(center.lat) > maxLatitude) {
                    // Clamp the latitude value within bounds
                    const clampedLat = Math.max(Math.min(center.lat, maxLatitude), -maxLatitude);

                    // Only update if there's a significant difference to avoid recursive calls
                    if (Math.abs(center.lat - clampedLat) > 0.001) {
                        // Use setView with disableAnimation to prevent recursion
                        map.setView([clampedLat, center.lng], map.getZoom(), {
                            animate: false,
                        });
                    }
                }
            },
        });

        return <>{children}</>;
    };

    const icons = [
        { icon: 'icon-banjir', label: 'Banjir' },
        { icon: 'gempa', label: 'Gempa Bumi' },
        { icon: 'icon-tsunami', label: 'Tsunami' },
        { icon: 'icon-tanahlongsor', label: 'Tanah Longsor' },
        { icon: 'icon-kebakaran', label: 'Kebakaran' },
        { icon: 'icon-kekeringan', label: 'Kekeringan' },
        { icon: 'angin-topan', label: 'Angin Topan' },
        { icon: 'lainnya', label: 'Bencana Lainnya' },
    ];

    return (
        <div style={{ height, width: '100%' }} className={`overflow-hidden rounded-lg shadow-lg ${className}`}>
            <ErrorBoundary
                fallback={
                    <div className="flex h-full w-full items-center justify-center bg-gray-100">
                        <div className="p-4 text-center">
                            <p className="text-lg font-medium text-gray-700">Gagal memuat peta</p>
                            <p className="text-sm text-gray-500">Terjadi kesalahan saat menampilkan peta</p>
                        </div>
                    </div>
                }
            >
                <MapContainer
                    center={initialView}
                    zoom={zoom}
                    minZoom={minZoom}
                    maxBounds={maxBounds}
                    worldCopyJump={false}
                    style={{ height: '100%', width: '100%' }}
                    scrollWheelZoom={true}
                >
                    <MapWithBoundaries maxLatitude={80}>
                        {getTileLayer()}

                        {/* Render markers */}
                        {markers.map((marker) => (
                            <Marker
                                key={marker.id}
                                position={marker.position}
                                icon={disasterIcons[marker.iconUrl.split('/').pop()?.replace('.svg', '') || 'lainnya'](marker.status)}
                            >
                                <Popup>
                                    <div>
                                        <h3 className="text-lg font-bold">{marker.title}</h3>
                                        {marker.description && <p className="mt-1 whitespace-pre-line">{marker.description}</p>}
                                        {marker.popupContent}
                                    </div>
                                </Popup>
                            </Marker>
                        ))}

                        {paths
                            .filter((path) => path.positions && path.positions.length > 1)
                            .map((path) => (
                                <Polyline key={path.id} positions={path.positions} pathOptions={{ color: path.color, weight: 5 }}>
                                    <Popup>
                                        <div>
                                            <h3 className="font-bold">{path.name}</h3>
                                            <p>Jalur Evakuasi</p>
                                        </div>
                                    </Popup>
                                </Polyline>
                            ))}

                        {/* Add Legend Control */}
                        <LegendControl position="topleft" icons={icons} />

                        {editable && onClick && <MapClickHandler onClick={onClick} />}
                    </MapWithBoundaries>
                </MapContainer>
            </ErrorBoundary>
        </div>
    );
};

export default MapComponent;
