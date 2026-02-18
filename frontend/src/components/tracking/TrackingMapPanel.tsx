import { motion } from 'framer-motion';
import { MapPin, Navigation, Activity } from 'lucide-react';
import type { BusLocation } from '../../types/booking';

interface TrackingMapPanelProps {
    location?: BusLocation;
    isLive: boolean;
}

export default function TrackingMapPanel({ location, isLive }: TrackingMapPanelProps) {
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

    return (
        <div className="relative h-full w-full bg-slate-200 rounded-3xl overflow-hidden shadow-inner border border-gray-200">
            {/* Simulated Map Background */}
            <div className="absolute inset-0 opacity-10 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')] bg-cover bg-center"></div>

            {/* Grid Pattern */}
            <div className="absolute inset-0 opacity-20"
                style={{ backgroundImage: 'radial-gradient(#64748b 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
            </div>

            {/* Moving Bus Marker */}
            <motion.div
                animate={{
                    x: [0, 10, -10, 5, -5, 0], // Subtle vibration/movement
                    y: [0, -5, 5, -2, 2, 0],
                }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            >
                <div className="relative">
                    <div className="absolute -inset-4 bg-orange-500/20 rounded-full animate-ping"></div>
                    <div className="w-12 h-12 bg-orange-600 rounded-full border-4 border-white shadow-xl flex items-center justify-center z-10 relative">
                        <BusIcon className="w-6 h-6 text-white" />
                    </div>
                    {/* Tooltip */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: -50 }}
                        className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs font-bold py-1.5 px-3 rounded-lg whitespace-nowrap shadow-lg"
                    >
                        {location.speed} km/h
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
                    </motion.div>
                </div>
            </motion.div>

            {/* Route Path (Simulated) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30">
                <path d="M100,500 Q400,300 800,400" fill="none" stroke="#f97316" strokeWidth="4" strokeDasharray="10 5" />
            </svg>

            {/* Info Overlay */}
            <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white/50 flex justify-between items-center">
                <div>
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wide mb-1 flex items-center gap-1">
                        <Navigation className="w-3 h-3" /> Next Stop
                    </p>
                    <p className="text-sm font-bold text-gray-900">{location.nextStop}</p>
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

function BusIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
    );
}
