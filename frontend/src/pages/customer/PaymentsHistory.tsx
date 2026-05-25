import { useState, useEffect } from 'react';
import { Search, Filter, Download } from 'lucide-react';
import PaymentsTable from '../../components/payments/PaymentsTable';
import type { PaymentRecord } from '../../types/booking';

const MOCK_PAYMENTS: PaymentRecord[] = [
    {
        paymentId: 'PAY-1001',
        bookingId: 'BK-7890',
        amount: 3000,
        dateTime: '2026-02-18T14:30:00',
        status: 'PAID',
        method: 'CARD'
    },
    {
        paymentId: 'PAY-1002',
        bookingId: 'BK-1234',
        amount: 1200,
        dateTime: '2026-02-15T09:15:00',
        status: 'PAID',
        method: 'ONLINE'
    },
    {
        paymentId: 'PAY-1003',
        bookingId: 'BK-5678',
        amount: 2000,
        dateTime: '2026-01-10T18:45:00',
        status: 'REFUNDED',
        method: 'CARD'
    },
    {
        paymentId: 'PAY-1004',
        bookingId: 'BK-9999',
        amount: 1500,
        dateTime: '2025-12-20T10:00:00',
        status: 'FAILED',
        method: 'ONLINE'
    }
];

import { authService } from '../../services/authService';
import { bookingService } from '../../services/bookingService';

export default function PaymentsHistory() {
    const [payments, setPayments] = useState<PaymentRecord[]>([]);
    const [filter, setFilter] = useState<'ALL' | 'PAID' | 'FAILED' | 'REFUNDED'>('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const user = await authService.getCurrentCustomerProfile();
                if (!user) return;

                const firebasePayments = await bookingService.getPaymentHistory(user.uid);
                
                const mappedPayments: PaymentRecord[] = firebasePayments.map(p => ({
                    paymentId: p.id || 'N/A',
                    bookingId: p.bookingId,
                    amount: p.amount,
                    dateTime: p.paymentDate,
                    status: p.status === 'SUCCESS' ? 'PAID' : p.status as any,
                    method: p.method === 'CREDIT_CARD' || p.method === 'DEBIT_CARD' ? 'CARD' : 'ONLINE'
                }));

                setPayments(mappedPayments);
            } catch (error) {
                console.error("Failed to fetch payments", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPayments();
    }, []);

    const filteredPayments = payments.filter(payment => {
        const matchesFilter = filter === 'ALL' || payment.status === filter;
        const matchesSearch = payment.paymentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payment.bookingId.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Payment History</h1>
                    <p className="text-gray-500 text-sm">View all your past transactions and refunds</p>
                </div>

                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Find by ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full sm:w-64 pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none transition-shadow"
                        />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value as any)}
                            className="w-full sm:w-auto pl-9 pr-8 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none appearance-none cursor-pointer"
                        >
                            <option value="ALL">All Status</option>
                            <option value="PAID">Paid</option>
                            <option value="REFUNDED">Refunded</option>
                            <option value="FAILED">Failed</option>
                        </select>
                    </div>
                    <button className="flex items-center justify-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-black transition-colors">
                        <Download className="w-4 h-4" />
                        <span className="hidden sm:inline">Export</span>
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
            ) : (
                <PaymentsTable payments={filteredPayments} />
            )}
        </div>
    );
}
