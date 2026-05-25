import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Activity } from 'lucide-react';
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';
import type { BusLocation } from '../../types/booking';

interface TrackingMapPanelProps {
    location?: BusLocation;
    isLive: boolean;
}

const containerStyle = {
    width: '100%',
    height: '100%',
    position: 'absolute' as const,
    top: 0,
    left: 0
};

// Use a custom bus icon if needed, or stick to the default marker
// We can use a custom SVG for the marker if we want
const busMarkerIcon = {
    path: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4', // Simple path, but a real SVG path for a bus is better.
    // For now, let's just use a standard marker to avoid complex SVG paths in the map, 
    // or we can use a basic circle/icon URL. Let's stick to the default marker.
};

export default function TrackingMapPanel({ location, isLive }: TrackingMapPanelProps) {
    const { isLoaded, loadError } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: 'AIzaSyBbDF0yXcXZYRPzevkYV2HCqj5bme8AKxI'
    });

    const center = useMemo(() => {
        if (location && !isNaN(Number(location.lat)) && !isNaN(Number(location.lng))) {
            return { lat: Number(location.lat), lng: Number(location.lng) };
        }
        // Default center (e.g., Colombo, Sri Lanka)
        return { lat: 6.9271, lng: 79.8612 };
    }, [location]);

    if (!isLive || !location) {
        return (
            <div className="h-full w-full bg-gray-100 rounded-3xl flex flex-col items-center justify-center text-gray-400 p-8 text-center border-2 border-dashed border-gray-200">
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                    <MapPin className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-500 mb-2">Tracking Unavailable</h3>
                <p className="max-w-xs text-sm">
                    Live tracking is only available on the day of travel. Please select a trip scheduled for today.
                </p>
            </div>
        );
    }

    if (loadError) {
        return (
            <div className="h-full w-full bg-red-50 rounded-3xl flex flex-col items-center justify-center text-red-400 p-8 text-center border-2 border-dashed border-red-200">
                <h3 className="text-lg font-bold mb-2">Map Load Error</h3>
                <p className="text-sm">Could not load Google Maps.</p>
            </div>
        );
    }

    return (
        <div className="relative h-full min-h-[500px] w-full bg-slate-200 rounded-3xl overflow-hidden shadow-inner border border-gray-200">
            {isLoaded ? (
                <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={center}
                    zoom={14}
                    options={{
                        disableDefaultUI: true,
                        zoomControl: true,
                    }}
                >
                    {/* Marker for the bus */}
                    <MarkerF 
                        position={center} 
                        // You can customize the icon here if desired:
                        // icon={{ url: 'path/to/bus-icon.png', scaledSize: new window.google.maps.Size(32, 32) }}
                    />
                </GoogleMap>
            ) : (
                <div className="h-full w-full flex items-center justify-center bg-gray-100">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                </div>
            )}

            {/* Info Overlay */}
            <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white/50 flex justify-between items-center">
                <div>
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wide mb-1 flex items-center gap-1">
                        <Navigation className="w-3 h-3" /> Speed
                    </p>
                    <p className="text-sm font-bold text-gray-900">{location.speed} km/h</p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wide mb-1 flex items-center justify-end gap-1">
                        <Activity className="w-3 h-3" /> Last Updated
                    </p>
                    <p className="text-sm font-mono text-gray-900">
                        {new Date(location.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </p>
                </div>
            </div>

            {/* Live Indicator */}
            <div className="absolute top-6 right-6 flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm border border-white/50">
                <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                </span>
                <span className="text-xs font-bold text-gray-700">LIVE TRACKING</span>
            </div>
        </div>
    );
}
