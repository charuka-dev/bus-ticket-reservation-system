import { motion } from 'framer-motion';
import { CreditCard, Calendar, Lock, User } from 'lucide-react';
import { useState } from 'react';
import type { PaymentDetails } from '../../types/booking';

interface PaymentFormProps {
    amount: number;
    onSubmit: (details: PaymentDetails) => void;
    onBack: () => void;
}

export default function PaymentForm({ amount, onSubmit, onBack }: PaymentFormProps) {
    const [details, setDetails] = useState<PaymentDetails>({
        cardHolder: '',
        cardNumber: '',
        expiryDate: '',
        cvv: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(details);
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100"
        >
            <h3 className="text-xl font-bold text-gray-900 mb-6">Payment Details</h3>

            <div className="mb-8 p-4 bg-orange-50 rounded-xl border border-orange-100 flex justify-between items-center">
                <span className="text-gray-600 font-medium">Total Amount</span>
                <span className="text-2xl font-bold text-orange-600">LKR {amount.toLocaleString()}</span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Card Holder Name</label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            required
                            value={details.cardHolder}
                            onChange={(e) => setDetails({ ...details, cardHolder: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                            placeholder="John Doe"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                    <div className="relative">
                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            required
                            maxLength={19}
                            value={details.cardNumber}
                            onChange={(e) => setDetails({ ...details, cardNumber: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                            placeholder="0000 0000 0000 0000"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                required
                                maxLength={5}
                                value={details.expiryDate}
                                onChange={(e) => setDetails({ ...details, expiryDate: e.target.value })}
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                                placeholder="MM/YY"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                required
                                maxLength={3}
                                value={details.cvv}
                                onChange={(e) => setDetails({ ...details, cvv: e.target.value })}
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                                placeholder="123"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex space-x-4 pt-4">
                    <button
                        type="button"
                        onClick={onBack}
                        className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                    >
                        Back
                    </button>
                    <button
                        type="submit"
                        className="flex-1 py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:shadow-lg transition-all transform hover:scale-[1.02]"
                    >
                        Pay Now
                    </button>
                </div>
            </form>
        </motion.div>
    );
}
