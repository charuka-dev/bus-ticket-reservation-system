import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Plus, History, CreditCard, Loader2, CheckCircle2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '../../contexts/ToastContext';
import { authService } from '../../services/authService';
import { walletService } from '../../services/walletService';
import type { WalletTransaction } from '../../types/firebase';

const topUpSchema = z.object({
    amount: z.string().min(1, 'Amount is required').refine(val => !isNaN(Number(val)) && Number(val) > 0, 'Invalid amount'),
    cardHolder: z.string().min(2, 'Cardholder name is required'),
    cardNumber: z.string().length(16, 'Card number must be 16 digits'),
    expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Must be MM/YY'),
    cvv: z.string().length(3, 'CVV must be 3 digits'),
});

type TopUpFormValues = z.infer<typeof topUpSchema>;

export default function WalletPage() {
    const [balance, setBalance] = useState<number>(0);
    const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [isTopUpOpen, setIsTopUpOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [customerUid, setCustomerUid] = useState<string | null>(null);
    const { success, error } = useToast();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<TopUpFormValues>({
        resolver: zodResolver(topUpSchema),
    });

    const loadWalletData = async () => {
        try {
            const user = await authService.getCurrentCustomerProfile();
            if (!user) return;
            setCustomerUid(user.uid);

            const bal = await walletService.getWalletBalance(user.uid);
            const txns = await walletService.getWalletTransactions(user.uid);
            
            setBalance(bal);
            setTransactions(txns);
        } catch (err) {
            console.error("Failed to load wallet data", err);
            error('Failed to load wallet details.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadWalletData();
    }, []);

    const handleTopUp = async (data: TopUpFormValues) => {
        if (!customerUid) return;
        setIsProcessing(true);

        try {
            // Simulate payment gateway delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            const amount = Number(data.amount);
            await walletService.topUpWallet(customerUid, amount, 'CARD');
            
            success(`Successfully topped up LKR ${amount}`);
            setIsTopUpOpen(false);
            reset();
            
            // Reload data
            loadWalletData();
        } catch (err) {
            console.error("Top-up failed", err);
            error('Top-up failed. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-100px)]">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-12">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">My Wallet</h1>
                <p className="text-gray-500 text-sm">Manage your digital balance and view transaction history</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Balance Card */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="md:col-span-1 bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-8 text-white shadow-xl shadow-blue-900/20 flex flex-col justify-between min-h-[200px]"
                >
                    <div className="flex items-center gap-3 opacity-80 mb-6">
                        <Wallet className="w-6 h-6" />
                        <span className="font-medium tracking-wide">Total Amount</span>
                    </div>
                    <div>
                        <p className="text-sm opacity-80 mb-1">Current Balance</p>
                        <h2 className="text-4xl font-bold tracking-tight">LKR {balance.toLocaleString()}</h2>
                    </div>
                </motion.div>

                {/* Top-Up Action */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="md:col-span-2 bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col justify-center items-center text-center"
                >
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
                        <CreditCard className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Add Money to Wallet</h3>
                    <p className="text-gray-500 max-w-sm mb-6">
                        Top up your wallet easily using any major credit or debit card to enjoy faster bookings.
                    </p>
                    <button 
                        onClick={() => setIsTopUpOpen(true)}
                        className="px-8 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition shadow-lg shadow-gray-200 flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" /> Top Up Now
                    </button>
                </motion.div>
            </div>

            {/* Top-up Form Modal (Inline expansion for better UX) */}
            <AnimatePresence>
                {isTopUpOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mt-6 relative">
                            <button 
                                onClick={() => setIsTopUpOpen(false)}
                                className="absolute top-6 right-6 text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-blue-600" /> Top Up Details
                            </h3>
                            
                            <form onSubmit={handleSubmit(handleTopUp)} className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">Amount (LKR)</label>
                                    <input 
                                        type="number" 
                                        {...register('amount')}
                                        placeholder="e.g. 5000"
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-blue-100 outline-none"
                                    />
                                    {errors.amount && <p className="text-red-500 text-xs">{errors.amount.message}</p>}
                                </div>
                                
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">Cardholder Name</label>
                                    <input 
                                        type="text" 
                                        {...register('cardHolder')}
                                        placeholder="John Doe"
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-blue-100 outline-none"
                                    />
                                    {errors.cardHolder && <p className="text-red-500 text-xs">{errors.cardHolder.message}</p>}
                                </div>

                                <div className="space-y-1 md:col-span-2">
                                    <label className="text-sm font-medium text-gray-700">Card Number</label>
                                    <input 
                                        type="text" 
                                        maxLength={16}
                                        {...register('cardNumber')}
                                        placeholder="0000 0000 0000 0000"
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-blue-100 outline-none"
                                    />
                                    {errors.cardNumber && <p className="text-red-500 text-xs">{errors.cardNumber.message}</p>}
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">Expiry (MM/YY)</label>
                                    <input 
                                        type="text" 
                                        maxLength={5}
                                        {...register('expiryDate')}
                                        placeholder="MM/YY"
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-blue-100 outline-none"
                                    />
                                    {errors.expiryDate && <p className="text-red-500 text-xs">{errors.expiryDate.message}</p>}
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">CVV</label>
                                    <input 
                                        type="password" 
                                        maxLength={3}
                                        {...register('cvv')}
                                        placeholder="123"
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-blue-100 outline-none"
                                    />
                                    {errors.cvv && <p className="text-red-500 text-xs">{errors.cvv.message}</p>}
                                </div>

                                <div className="md:col-span-2 flex justify-end mt-4">
                                    <button 
                                        type="submit" 
                                        disabled={isProcessing}
                                        className="px-8 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition shadow-lg shadow-blue-500/30 flex items-center gap-2 disabled:opacity-70"
                                    >
                                        {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                                        {isProcessing ? 'Processing...' : 'Confirm Payment'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* History Section */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
            >
                <div className="p-6 border-b border-gray-100 flex items-center gap-2">
                    <History className="w-5 h-5 text-gray-500" />
                    <h3 className="font-bold text-gray-900">Top-up History</h3>
                </div>
                
                {transactions.length === 0 ? (
                    <div className="p-10 text-center text-gray-500">
                        No transactions found. Your top-up history will appear here.
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {transactions.map((txn) => (
                            <div key={txn.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
                                        <Plus className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">Wallet Top-up</p>
                                        <p className="text-sm text-gray-500 flex items-center gap-2">
                                            {new Date(txn.timestamp).toLocaleDateString()} at {new Date(txn.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'})}
                                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                            {txn.method}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-green-600">+ LKR {txn.amount.toLocaleString()}</p>
                                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{txn.id}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </motion.div>
        </div>
    );
}
