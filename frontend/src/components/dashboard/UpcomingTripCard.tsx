import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Bus, Armchair, QrCode } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TripDetails {
    id: string;
    route: string;
    date: string;
    time: string;
    seatNo: string;
    busNo: string;
}

interface UpcomingTripCardProps {
    trip: TripDetails;
}

export default function UpcomingTripCard({ trip }: UpcomingTripCardProps) {
    const navigate = useNavigate();

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full bg-white rounded-3xl overflow-hidden shadow-lg border border-orange-100 relative group"
        >
            {/* Accent Border/Header */}
            <div className="h-2 bg-gradient-to-r from-orange-400 to-red-500" />

            <div className="p-8 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                    <div>
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-orange-100 text-orange-600 text-sm font-semibold mb-3">
                            <span className="relative flex h-2 w-2 mr-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                            </span>
                            Upcoming Trip
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900">{trip.route}</h2>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                    <div className="flex items-center space-x-3 text-gray-600">
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-500">
                            <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 font-medium uppercase">Date</p>
                            <p className="font-semibold">{trip.date}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3 text-gray-600">
                        <div className="p-2 bg-green-50 rounded-lg text-green-500">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 font-medium uppercase">Departure</p>
                            <p className="font-semibold">{trip.time}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3 text-gray-600">
                        <div className="p-2 bg-purple-50 rounded-lg text-purple-500">
                            <Armchair className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 font-medium uppercase">Seat No</p>
                            <p className="font-semibold">{trip.seatNo}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3 text-gray-600">
                        <div className="p-2 bg-indigo-50 rounded-lg text-indigo-500">
                            <Bus className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 font-medium uppercase">Bus No</p>
                            <p className="font-semibold">{trip.busNo}</p>
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-gray-100 flex justify-end">
                    <motion.button
                        whileHover={{ scale: 1.05, boxShadow: "0px 5px 15px rgba(234, 88, 12, 0.3)" }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate(`/customer/ticket/${trip.id}`)}
                        className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-red-600 text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg transition-all"
                    >
                        <QrCode className="w-5 h-5" />
                        <span>View Ticket</span>
                    </motion.button>
                </div>
            </div>

            {/* Background Decoration */}
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-orange-50 rounded-full mix-blend-multiply filter blur-3xl opacity-50 z-0 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-blue-50 rounded-full mix-blend-multiply filter blur-3xl opacity-50 z-0 pointer-events-none"></div>
        </motion.div>
    );
}
