import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import TripSearchForm from '../../components/booking/TripSearchForm';
import TripCard from '../../components/booking/TripCard';
import type { Trip } from '../../types/booking';

// Mock Data
const MOCK_TRIPS: Trip[] = [
    {
        id: 'trip-1',
        busNo: 'NB-4587',
        route: { from: 'Colombo', to: 'Kandy' },
        departureTime: '08:30 AM',
        arrivalTime: '11:45 AM',
        date: '2026-02-25',
        price: 1500,
        availableSeats: 32,
        totalSeats: 45,
        amenities: ['WiFi', 'Charging Point']
    },
    {
        id: 'trip-2',
        busNo: 'NP-1234',
        route: { from: 'Colombo', to: 'Galle' },
        departureTime: '09:00 AM',
        arrivalTime: '11:00 AM',
        date: '2026-02-25',
        price: 1200,
        availableSeats: 15,
        totalSeats: 40,
        amenities: ['AC', 'TV']
    },
    {
        id: 'trip-3',
        busNo: 'WP-9988',
        route: { from: 'Kandy', to: 'Colombo' },
        departureTime: '02:00 PM',
        arrivalTime: '05:15 PM',
        date: '2026-02-25',
        price: 1500,
        availableSeats: 40,
        totalSeats: 45,
        amenities: ['WiFi', 'Charging Point', 'AC']
    }
];

export default function SearchTrips() {
    const navigate = useNavigate();
    const [trips, setTrips] = useState<Trip[]>(MOCK_TRIPS);
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = (searchParams: { from: string; to: string; date: string }) => {
        setIsSearching(true);
        // Simulate API call
        setTimeout(() => {
            const filtered = MOCK_TRIPS.filter(trip =>
                (searchParams.from ? trip.route.from === searchParams.from : true) &&
                (searchParams.to ? trip.route.to === searchParams.to : true)
            );
            setTrips(filtered);
            setIsSearching(false);
        }, 800);
    };

    const handleBook = (tripId: string) => {
        navigate(`/customer/book/${tripId}`);
    };

    return (
        <div className="space-y-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Find Your Trip</h1>
                <p className="text-gray-500">Search for buses, check availability, and book instantly.</p>
            </div>

            <TripSearchForm onSearch={handleSearch} />

            <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900">
                    {isSearching ? 'Searching...' : `Available Buses (${trips.length})`}
                </h2>

                {trips.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6">
                        {trips.map((trip, index) => (
                            <motion.div
                                key={trip.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <TripCard trip={trip} onBook={handleBook} />
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-12 bg-white rounded-2xl border border-gray-100"
                    >
                        <p className="text-gray-500">No trips found matching your criteria.</p>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
