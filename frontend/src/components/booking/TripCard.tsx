import { motion } from 'framer-motion';
import { Bus, Clock, Wifi, BatteryCharging, Tv } from 'lucide-react';
import type { Trip } from '../../types/booking';

interface TripCardProps {
    trip: Trip;
    onBook: (tripId: string) => void;
}

export default function TripCard({ trip, onBook }: TripCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300"
        >
            <div className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                    <div>
                        <div className="flex items-center space-x-3 mb-2">
                            <span className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-xs font-bold uppercase tracking-wide">
                                {trip.busNo}
                            </span>
                            <span className="text-gray-400 text-sm">{trip.date}</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 flex items-center">
                            {trip.route.from}
                            <span className="mx-2 text-gray-300">→</span>
                            {trip.route.to}
                        </h3>
                    </div>
                    <div className="mt-4 md:mt-0 text-right">
                        <p className="text-sm text-gray-500">Price per seat</p>
                        <p className="text-2xl font-bold text-gray-900">LKR {trip.price.toLocaleString()}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-500">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Departure</p>
                            <p className="font-semibold text-gray-900">{trip.departureTime}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-purple-50 rounded-lg text-purple-500">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Arrival</p>
                            <p className="font-semibold text-gray-900">{trip.arrivalTime}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-50 rounded-lg text-green-500">
                            <Bus className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Seats</p>
                            <p className="font-semibold text-gray-900">
                                {trip.availableSeats} <span className="text-gray-400 font-normal">/ {trip.totalSeats}</span>
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-4 mb-6">
                    {trip.amenities.includes('WiFi') && (
                        <div className="flex items-center space-x-1 text-gray-500 text-xs" title="WiFi Available">
                            <Wifi className="w-4 h-4" />
                            <span>WiFi</span>
                        </div>
                    )}
                    {trip.amenities.includes('Charging Point') && (
                        <div className="flex items-center space-x-1 text-gray-500 text-xs" title="Charging Points">
                            <BatteryCharging className="w-4 h-4" />
                            <span>Charging</span>
                        </div>
                    )}
                    {trip.amenities.includes('TV') && (
                        <div className="flex items-center space-x-1 text-gray-500 text-xs" title="Entertainment">
                            <Tv className="w-4 h-4" />
                            <span>TV</span>
                        </div>
                    )}
                </div>

                <button
                    onClick={() => onBook(trip.id)}
                    className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-orange-600 transition-colors duration-300"
                >
                    Select Seats
                </button>
            </div>
        </motion.div>
    );
}
