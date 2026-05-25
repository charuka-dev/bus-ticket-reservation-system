import { motion } from 'framer-motion';
import { Bus, Calendar, Clock, ArrowRight, Trash2 } from 'lucide-react';
import type { BookingDetails } from '../../types/booking';

interface BookingMiniCardProps {
    booking: BookingDetails;
    isSelected: boolean;
    onClick: () => void;
    onCancel?: () => void;
}

export default function BookingMiniCard({ booking, isSelected, onClick, onCancel }: BookingMiniCardProps) {
    return (
        <motion.div
            layout
            onClick={onClick}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`cursor-pointer rounded-2xl p-5 border transition-all duration-200 mb-4 ${isSelected
                    ? 'bg-orange-50 border-orange-200 shadow-md ring-1 ring-orange-200'
                    : 'bg-white border-gray-100 shadow-sm hover:shadow-md hover:border-orange-100'
                }`}
        >
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-2">
                    <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded-md">
                        {booking.busNo}
                    </span>
                    <span className={`text-xs font-bold px-2 py-1 rounded-md ${booking.status === 'confirmed'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                        {booking.status.toUpperCase()}
                    </span>
                </div>
                <div className="flex items-center space-x-3">
                    <span className="text-sm font-bold text-gray-900">LKR {booking.totalAmount.toLocaleString()}</span>
                    {booking.status === 'confirmed' && onCancel && (
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                onCancel();
                            }}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Cancel Booking"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            <div className="flex items-center justify-between mb-4">
                <div>
                    <p className="text-sm font-bold text-gray-900">{booking.route.from}</p>
                    <p className="text-xs text-gray-500">{booking.time}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300" />
                <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">{booking.route.to}</p>
                    <p className="text-xs text-gray-500">{booking.arrivalTime}</p>
                </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-100/50">
                <div className="flex items-center space-x-2 text-gray-500 text-xs">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{booking.date}</span>
                </div>
                <button className={`text-xs font-bold transition-colors ${isSelected ? 'text-orange-600' : 'text-gray-400 hover:text-orange-500'
                    }`}>
                    View Ticket
                </button>
            </div>
        </motion.div>
    );
}
