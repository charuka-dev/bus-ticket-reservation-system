import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Map } from 'lucide-react';
import UpcomingTicketCard from '../../components/tracking/UpcomingTicketCard';
import TrackingMapPanel from '../../components/tracking/TrackingMapPanel';
import type { TrackingTicket, BusLocation } from '../../types/booking';

// Mock Data
const MOCK_TICKETS: TrackingTicket[] = [
    {
        bookingId: 'TCK-5501',
        busNo: 'NB-4587',
        route: { from: 'Colombo', to: 'Kandy' },
        date: new Date().toISOString().split('T')[0], // Today
        departureTime: '08:30 AM',
        seatNos: ['A3'],
        status: 'CONFIRMED',
        used: false
    },
    {
        bookingId: 'TCK-5502',
        busNo: 'WP-1234',
        route: { from: 'Galle', to: 'Matara' },
        date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
        departureTime: '10:00 AM',
        seatNos: ['B4', 'B5'],
        status: 'CONFIRMED',
        used: false
    }
];

import { authService } from '../../services/authService';
import { bookingService } from '../../services/bookingService';
import { trackingService, type LocationData } from '../../services/trackingService';

export default function TrackBus() {
    const [tickets, setTickets] = useState<TrackingTicket[]>([]);
    const [selectedTicket, setSelectedTicket] = useState<TrackingTicket | null>(null);
    const [busLocation, setBusLocation] = useState<BusLocation | undefined>(undefined);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const user = await authService.getCurrentCustomerProfile();
                if (!user) return;

                const bookings = await bookingService.getMyBookings(user.uid);
                const activeBookings = bookings.filter(b => b.status === 'CONFIRMED');

                const mappedTickets: TrackingTicket[] = activeBookings.map(b => ({
                    bookingId: b.id || 'N/A',
                    busId: b.busId || b.tripId, // Use the resolved busId, fallback to tripId
                    busNo: b.tripDetails?.busNumber || 'TBD',
                    route: { 
                        from: b.tripDetails?.from || 'Unknown', 
                        to: b.tripDetails?.to || 'Unknown' 
                    },
                    // Ensure date is properly extracted using the travel date, avoiding Invalid Date crashes
                    date: b.date || b.bookingDate?.split('T')[0] || new Date().toISOString().split('T')[0],
                    departureTime: b.tripDetails?.departureTime || '',
                    seatNos: b.seatNumbers || [`${b.seatCount} Seat(s)`],
                    status: b.status as 'CONFIRMED',
                    used: false
                }));

                setTickets(mappedTickets);
            } catch (error) {
                console.error("Failed to fetch tickets", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTickets();
    }, []);

    // RTDB Live Tracking Effect
    useEffect(() => {
        let unsubscribe: (() => void) | undefined;

        if (selectedTicket) {
            // Check if ticket date is today
            const today = new Date().toISOString().split('T')[0];
            const isToday = selectedTicket.date === today;

            // In a real app, you might want to show tracking even if it's not today just to test, 
            // but usually it's only active on the day of the trip.
            // For testing Firebase integration seamlessly, we'll listen anyway if selected.
            // Replace selectedTicket.busId with a real busId if your trips have them.
            
            const busIdToTrack = selectedTicket.busId || 'mock-bus-id';

            unsubscribe = trackingService.listenLiveBusLocation(busIdToTrack, (data: LocationData | null) => {
                if (data) {
                    setBusLocation({
                        lat: data.latitude,
                        lng: data.longitude,
                        updatedAt: data.updatedAt || new Date().toISOString(),
                        speed: data.speed || 0,
                        nextStop: 'Updating...' // Could fetch next stop logic here
                    });
                } else {
                    // Fallback to mock movement if no data in Firebase yet for this bus, just to show UI
                    setBusLocation({
                        lat: 6.9271 + (Math.random() * 0.01),
                        lng: 79.8612 + (Math.random() * 0.01),
                        updatedAt: new Date().toISOString(),
                        speed: Math.floor(40 + Math.random() * 20),
                        nextStop: 'Connecting to GPS...'
                    });
                }
            });
        } else {
            setBusLocation(undefined);
        }

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [selectedTicket]);

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] gap-6">
            <div className="shrink-0">
                <h1 className="text-2xl font-bold text-gray-900">Track Your Bus</h1>
                <p className="text-gray-500 text-sm">Real-time location updates for your today's trips</p>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-0 overflow-hidden">
                {/* Left Panel: Ticket List */}
                <div className="lg:col-span-1 overflow-y-auto pr-2 custom-scrollbar">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-4 sticky top-0 bg-gray-50/95 backdrop-blur-sm py-2 z-10">
                        Upcoming Trips
                    </h3>

                    <div className="space-y-4 pb-4">
                        {loading ? (
                            <div className="flex justify-center p-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
                        ) : tickets.length > 0 ? (
                            tickets.map(ticket => (
                                <UpcomingTicketCard
                                    key={ticket.bookingId}
                                    ticket={ticket}
                                    isSelected={selectedTicket?.bookingId === ticket.bookingId}
                                    onClick={() => setSelectedTicket(ticket)}
                                />
                            ))
                        ) : (
                            <div className="text-center py-10 text-gray-400">
                                <p>No upcoming trips found.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Panel: Map */}
                <div className="lg:col-span-2 h-full">
                    <AnimatePresence mode="wait">
                        {selectedTicket ? (
                            <motion.div
                                key="map-panel"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="h-full min-h-[500px] w-full"
                            >
                                <TrackingMapPanel
                                    location={busLocation}
                                    isLive={selectedTicket.date === new Date().toISOString().split('T')[0]}
                                />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="placeholder"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="h-full bg-white rounded-3xl border border-gray-100 flex flex-col items-center justify-center text-gray-400 text-center"
                            >
                                <Map className="w-16 h-16 mb-4 opacity-20" />
                                <h3 className="text-xl font-bold text-gray-600 mb-2">Select a trip to track</h3>
                                <p className="max-w-xs text-sm">
                                    Choose an upcoming trip from the list to view live tracking details.
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
