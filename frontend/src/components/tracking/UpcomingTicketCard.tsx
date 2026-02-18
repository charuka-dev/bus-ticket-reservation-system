import { motion } from 'framer-motion';
import { Bus, Clock, Calendar } from 'lucide-react';
import type { TrackingTicket } from '../../types/booking';

interface UpcomingTicketCardProps {
    ticket: TrackingTicket;
    isSelected: boolean;
    onClick: () => void;
}

export default function UpcomingTicketCard({ ticket, isSelected, onClick }: UpcomingTicketCardProps) {
    const isToday = ticket.date === new Date().toISOString().split('T')[0];

    return (
        <motion.div
            onClick={onClick}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`cursor-pointer rounded-2xl p-5 border transition-all duration-200 mb-4 ${isSelected
                ? 'bg-orange-50 border-orange-200 shadow-md ring-1 ring-orange-200'
                : 'bg-white border-gray-100 shadow-sm hover:shadow-md hover:border-orange-100'
                }`}
        >
            <div className="flex justify-between items-start mb-3">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${isToday ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-blue-100 text-blue-600'
                    }`}>
                    {isToday ? 'Today' : 'Upcoming'}
                </span>
                <span className="text-xs text-gray-400 font-mono">{ticket.bookingId}</span>
            </div>

            <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
                    <Bus className="w-5 h-5" />
                </div>
                <div>
                    <h4 className="text-sm font-bold text-gray-900">{ticket.route.from} → {ticket.route.to}</h4>
                    <p className="text-xs text-gray-500">{ticket.busNo}</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                <div className="flex items-center space-x-1.5">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <span>{ticket.date}</span>
                </div>
                <div className="flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    <span>{ticket.departureTime}</span>
                </div>
            </div>
        </motion.div>
    );
}
