import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Ticket } from 'lucide-react';
import BookingMiniCard from '../../components/booking/BookingMiniCard';
import TicketView from '../../components/booking/TicketView';
import type { BookingDetails } from '../../types/booking';

// Mock Data
const MOCK_BOOKINGS: BookingDetails[] = [
    {
        bookingId: 'BK-7890',
        tripId: 'trip-1',
        customerName: 'John Doe',
        route: { from: 'Colombo', to: 'Kandy' },
        busNo: 'NB-4587',
        date: '2026-02-25',
        time: '08:30 AM',
        arrivalTime: '11:45 AM',
        selectedSeats: [
            { id: 's1', seatNo: '3', status: 'booked', price: 1500 },
            { id: 's2', seatNo: '4', status: 'booked', price: 1500 }
        ],
        totalAmount: 3000,
        email: 'john@example.com',
        phoneNumber: '0771234567',
        paymentStatus: 'completed',
        status: 'confirmed'
    },
    {
        bookingId: 'BK-1234',
        tripId: 'trip-2',
        customerName: 'John Doe',
        route: { from: 'Galle', to: 'Colombo' },
        busNo: 'NP-1234',
        date: '2026-03-01',
        time: '09:00 AM',
        arrivalTime: '11:00 AM',
        selectedSeats: [
            { id: 's3', seatNo: '12', status: 'booked', price: 1200 }
        ],
        totalAmount: 1200,
        email: 'john@example.com',
        phoneNumber: '0771234567',
        paymentStatus: 'completed',
        status: 'confirmed'
    },
    {
        bookingId: 'BK-5678',
        tripId: 'trip-3',
        customerName: 'John Doe',
        route: { from: 'Jaffna', to: 'Colombo' },
        busNo: 'WP-9988',
        date: '2026-01-15',
        time: '08:00 PM',
        arrivalTime: '04:00 AM',
        selectedSeats: [
            { id: 's4', seatNo: 'B1', status: 'booked', price: 2000 }
        ],
        totalAmount: 2000,
        email: 'john@example.com',
        phoneNumber: '0771234567',
        paymentStatus: 'completed',
        status: 'cancelled'
    }
];

export default function MyBookings() {
    const [bookings, setBookings] = useState<BookingDetails[]>([]);
    const [selectedBooking, setSelectedBooking] = useState<BookingDetails | null>(null);
    const [filter, setFilter] = useState<'all' | 'confirmed' | 'cancelled'>('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        // Simulate API fetch
        setBookings(MOCK_BOOKINGS);
    }, []);

    const filteredBookings = bookings.filter(booking => {
        if (!booking.route || !booking.bookingId) return false;
        const matchesFilter = filter === 'all' || booking.status === filter;
        const matchesSearch = booking.route.to.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.bookingId.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const handleDownload = () => {
        alert('Downloading ticket... (Feature to be implemented)');
    };

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] gap-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
                    <p className="text-gray-500 text-sm">Manage your upcoming and past trips</p>
                </div>

                <div className="flex space-x-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search destination or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none w-64"
                        />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value as any)}
                            className="pl-9 pr-8 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none appearance-none cursor-pointer"
                        >
                            <option value="all">All Status</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-0 overflow-hidden">
                {/* Left Column: Bookings List */}
                <div className="lg:col-span-1 overflow-y-auto pr-2 space-y-4 h-full custom-scrollbar">
                    <AnimatePresence>
                        {filteredBookings.length > 0 ? (
                            filteredBookings.map((booking) => (
                                <BookingMiniCard
                                    key={booking.bookingId}
                                    booking={booking}
                                    isSelected={selectedBooking?.bookingId === booking.bookingId}
                                    onClick={() => setSelectedBooking(booking)}
                                />
                            ))
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-12 text-gray-500"
                            >
                                <Ticket className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                <p>No bookings found</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Right Column: Ticket Preview */}
                <div className="lg:col-span-2 bg-gray-50 rounded-3xl p-6 md:p-12 flex items-center justify-center border border-gray-100 relative overflow-hidden h-full">
                    <AnimatePresence mode="wait">
                        {selectedBooking ? (
                            <motion.div
                                key={selectedBooking.bookingId}
                                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                                transition={{ duration: 0.3 }}
                                className="w-full max-w-xl z-20 relative"
                            >
                                <TicketView booking={selectedBooking} onDownload={handleDownload} />
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center text-gray-400 z-10"
                            >
                                <Ticket className="w-24 h-24 mx-auto mb-4 opacity-20" />
                                <h3 className="text-xl font-bold mb-2">Select a booking</h3>
                                <p>Click on a trip from the list to view your ticket details.</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-orange-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 pointer-events-none"></div>
                </div>
            </div>
        </div>
    );
}
