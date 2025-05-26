import L from 'leaflet';
import React from 'react';
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMapEvents } from 'react-leaflet';
import ErrorBoundary from './ErrorBoundary';

interface MapComponentProps {
    height?: string;
    className?: string;
    initialView?: [number, number];
    zoom?: number;
    minZoom?: number;
    maxBounds?: [[number, number], [number, number]];
    markers?: Array<{
        id: number;
        position: [number, number];
        title: string;
        type: string;
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
    mapType?: 'standard' | 'satellite' | 'terrain'; // New prop for map type
}

// Custom marker icons
const createCustomIcon = (iconUrl: string, iconSize: [number, number] = [25, 41]) => {
    return L.icon({
        iconUrl,
        iconSize,
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
    });
};

const markerIcons = {
    disaster: createCustomIcon('/icons/disaster-marker.svg', [30, 30]),
    evacuation: createCustomIcon('/icons/evacuation-marker.svg', [30, 30]),
    shelter: createCustomIcon('/icons/shelter-marker.svg', [30, 30]),
    default: createCustomIcon('/icons/default-marker.svg', [25, 41]),
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

                        {markers.map((marker) => (
                            <Marker
                                key={marker.id}
                                position={marker.position}
                                icon={markerIcons[marker.type as keyof typeof markerIcons] || markerIcons.default}
                            >
                                <Popup>
                                    <div>
                                        <h3 className="text-lg font-bold">{marker.title}</h3>
                                        {marker.description && <p className="mt-1">{marker.description}</p>}
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

                        {editable && onClick && <MapClickHandler onClick={onClick} />}
                    </MapWithBoundaries>
                </MapContainer>
            </ErrorBoundary>
        </div>
    );
};

export default MapComponent;
