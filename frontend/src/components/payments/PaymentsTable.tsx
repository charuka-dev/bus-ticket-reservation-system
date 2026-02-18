import { motion } from 'framer-motion';
import { CreditCard, Calendar, Clock, AlertCircle } from 'lucide-react';
import PaymentStatusBadge from './PaymentStatusBadge';
import type { PaymentRecord } from '../../types/booking';

interface PaymentsTableProps {
    payments: PaymentRecord[];
}

export default function PaymentsTable({ payments }: PaymentsTableProps) {
    if (payments.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 text-gray-500 bg-gray-50 rounded-2xl border border-gray-100 border-dashed"
            >
                <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No payments found matching your criteria.</p>
            </motion.div>
        );
    }

    return (
        <div className="w-full">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-hidden rounded-2xl border border-gray-100 shadow-sm bg-white">
                <table className="w-full">
                    <thead className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-4">Transaction ID</th>
                            <th className="px-6 py-4">Booking ID</th>
                            <th className="px-6 py-4">Date & Time</th>
                            <th className="px-6 py-4 text-right">Amount</th>
                            <th className="px-6 py-4 text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {payments.map((payment, index) => (
                            <motion.tr
                                key={payment.paymentId}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="hover:bg-gray-50/50 transition-colors"
                            >
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                    <div className="flex items-center space-x-2">
                                        <div className="p-1.5 bg-gray-100 rounded text-gray-500">
                                            <CreditCard className="w-4 h-4" />
                                        </div>
                                        <span>{payment.paymentId}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                                    {payment.bookingId}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    <div className="flex flex-col">
                                        <span className="flex items-center space-x-1">
                                            <Calendar className="w-3 h-3" />
                                            <span>{new Date(payment.dateTime).toLocaleDateString()}</span>
                                        </span>
                                        <span className="flex items-center space-x-1 text-gray-400 text-xs mt-0.5">
                                            <Clock className="w-3 h-3" />
                                            <span>{new Date(payment.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right">
                                    LKR {payment.amount.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <PaymentStatusBadge status={payment.status} />
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
                {payments.map((payment, index) => (
                    <motion.div
                        key={payment.paymentId}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-xs text-gray-400 uppercase font-bold tracking-wide">Transaction ID</p>
                                <p className="text-sm font-bold text-gray-900 flex items-center space-x-2 mt-1">
                                    <CreditCard className="w-4 h-4 text-gray-400" />
                                    <span>{payment.paymentId}</span>
                                </p>
                            </div>
                            <PaymentStatusBadge status={payment.status} />
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <p className="text-xs text-gray-400 uppercase font-bold tracking-wide">Date</p>
                                <p className="text-sm font-medium text-gray-700 mt-1">
                                    {new Date(payment.dateTime).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-400 uppercase font-bold tracking-wide">Amount</p>
                                <p className="text-lg font-bold text-gray-900 mt-1">
                                    LKR {payment.amount.toLocaleString()}
                                </p>
                            </div>
                        </div>

                        <div className="pt-3 border-t border-gray-100 flex justify-between text-xs text-gray-500">
                            <span>Booking: <span className="font-mono text-gray-700">{payment.bookingId}</span></span>
                            <span>{new Date(payment.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
