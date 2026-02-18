import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bus,
    Loader2,
    User,
    Mail,
    Phone,
    CreditCard,
    Lock,
    CheckCircle,
} from 'lucide-react';
import axiosClient from '../lib/axios';
import { useNavigate, Link } from 'react-router-dom';
import clsx from 'clsx';

// --- Zod Schema ---
const registerSchema = z.object({
    name: z.string().min(1, 'Full Name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().regex(/^\d{10}$/, 'Phone number must be 10 digits'),
    nic: z.string().min(1, 'NIC is required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Confirm Password must be at least 6 characters'),
    agreeTerms: z.boolean().refine((val) => val === true, {
        message: 'You must agree to the Terms and Conditions',
    }),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});

type RegisterFormInputs = z.infer<typeof registerSchema>;

export default function Register() {
    const [isLoading, setIsLoading] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterFormInputs>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            agreeTerms: undefined, // ensure it's controlled or handled correctly
        }
    });

    const onSubmit = async (data: RegisterFormInputs) => {
        setIsLoading(true);
        setServerError(null);
        setSuccessMessage(null);

        try {
            // payload matches requirement
            const payload = {
                role: "CUSTOMER",
                name: data.name,
                email: data.email,
                phone: data.phone,
                nic: data.nic,
                password: data.password
            };

            await axiosClient.post('/auth/register', payload);

            setSuccessMessage('Registration successful! Redirecting to login...');

            // Delay redirect to show success message
            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (error: any) {
            console.error('Registration failed:', error);
            setServerError(
                error.response?.data?.message || 'Registration failed. Please try again.'
            );
            setIsLoading(false); // Only stop loading on error, on success we keep loading/success state until redirect
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-4 relative overflow-hidden">

            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-100/50 blur-3xl"></div>
                <div className="absolute top-[60%] -right-[10%] w-[40%] h-[40%] rounded-full bg-orange-100/50 blur-3xl"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8 border border-gray-100 relative z-10"
            >
                <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20">
                        <Bus className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
                    <p className="text-gray-500 mt-2">Join us to book your bus tickets easily</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                    {/* Full Name */}
                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                {...register('name')}
                                type="text"
                                placeholder="John Doe"
                                className={clsx(
                                    "w-full pl-10 pr-4 py-3 rounded-lg bg-gray-50 border transition focus:ring-2 focus:outline-none",
                                    errors.name ? "border-red-500 focus:ring-red-200" : "border-gray-200 focus:border-blue-500 focus:ring-blue-100"
                                )}
                            />
                        </div>
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                    </div>

                    {/* Email */}
                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                {...register('email')}
                                type="email"
                                placeholder="john@example.com"
                                className={clsx(
                                    "w-full pl-10 pr-4 py-3 rounded-lg bg-gray-50 border transition focus:ring-2 focus:outline-none",
                                    errors.email ? "border-red-500 focus:ring-red-200" : "border-gray-200 focus:border-blue-500 focus:ring-blue-100"
                                )}
                            />
                        </div>
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                    </div>

                    {/* Phone & NIC Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    {...register('phone')}
                                    type="text"
                                    placeholder="0771234567"
                                    className={clsx(
                                        "w-full pl-10 pr-4 py-3 rounded-lg bg-gray-50 border transition focus:ring-2 focus:outline-none",
                                        errors.phone ? "border-red-500 focus:ring-red-200" : "border-gray-200 focus:border-blue-500 focus:ring-blue-100"
                                    )}
                                />
                            </div>
                            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                        </div>

                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700">NIC</label>
                            <div className="relative">
                                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    {...register('nic')}
                                    type="text"
                                    placeholder="NIC Number"
                                    className={clsx(
                                        "w-full pl-10 pr-4 py-3 rounded-lg bg-gray-50 border transition focus:ring-2 focus:outline-none",
                                        errors.nic ? "border-red-500 focus:ring-red-200" : "border-gray-200 focus:border-blue-500 focus:ring-blue-100"
                                    )}
                                />
                            </div>
                            {errors.nic && <p className="text-red-500 text-xs mt-1">{errors.nic.message}</p>}
                        </div>
                    </div>

                    {/* Password */}
                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                {...register('password')}
                                type="password"
                                placeholder="••••••••"
                                className={clsx(
                                    "w-full pl-10 pr-4 py-3 rounded-lg bg-gray-50 border transition focus:ring-2 focus:outline-none",
                                    errors.password ? "border-red-500 focus:ring-red-200" : "border-gray-200 focus:border-blue-500 focus:ring-blue-100"
                                )}
                            />
                        </div>
                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                {...register('confirmPassword')}
                                type="password"
                                placeholder="••••••••"
                                className={clsx(
                                    "w-full pl-10 pr-4 py-3 rounded-lg bg-gray-50 border transition focus:ring-2 focus:outline-none",
                                    errors.confirmPassword ? "border-red-500 focus:ring-red-200" : "border-gray-200 focus:border-blue-500 focus:ring-blue-100"
                                )}
                            />
                        </div>
                        {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
                    </div>

                    {/* Terms */}
                    <div className="flex items-start space-x-2 pt-2">
                        <div className="flex h-5 items-center">
                            <input
                                {...register('agreeTerms')}
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                        </div>
                        <div className="text-sm text-gray-600">
                            I agree to the <a href="#" className="text-blue-600 hover:underline">Terms and Conditions</a> and <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>.
                        </div>
                    </div>
                    {errors.agreeTerms && <p className="text-red-500 text-xs">{errors.agreeTerms.message}</p>}

                    {/* Messages */}
                    <AnimatePresence>
                        {serverError && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-center"
                            >
                                <span className="mr-2">⚠️</span> {serverError}
                            </motion.div>
                        )}
                        {successMessage && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="p-3 bg-green-50 text-green-600 text-sm rounded-lg border border-green-100 flex items-center"
                            >
                                <CheckCircle className="w-5 h-5 mr-2" /> {successMessage}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Submit Button */}
                    <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={isLoading || !!successMessage}
                        className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            "Create Account"
                        )}
                    </motion.button>

                    <div className="text-center pt-4">
                        <p className="text-sm text-gray-600">
                            Already have an account?{' '}
                            <Link to="/login" className="text-blue-600 font-medium hover:underline">
                                Login
                            </Link>
                        </p>
                    </div>

                </form>
            </motion.div>
        </div>
    );
}
