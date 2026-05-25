import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bus,
    QrCode,
    MapPin,
    Eye,
    EyeOff,
    Loader2,
    CheckCircle,
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import clsx from 'clsx';
import { authService } from '../services/authService';
import { useToast } from '../contexts/ToastContext';

// --- Zod Schema ---
const loginSchema = z.object({
    role: z.enum(['CUSTOMER', 'CONDUCTOR', 'OWNER']),
    email: z.string().email({ message: 'Invalid email address' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

// --- Components ---

const FeatureItem = ({
    icon: Icon,
    text,
    delay,
}: {
    icon: React.ElementType;
    text: string;
    delay: number;
}) => (
    <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay, duration: 0.5 }}
        className="flex items-center space-x-3 text-blue-100/90"
    >
        <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
            <Icon className="w-5 h-5 text-orange-400" />
        </div>
        <span className="text-lg font-medium">{text}</span>
    </motion.div>
);

const FloatingShape = ({
    className,
    delay,
}: {
    className: string;
    delay: number;
}) => (
    <motion.div
        className={clsx('absolute rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob', className)}
        initial={{ opacity: 0 }}
        animate={{
            opacity: [0.4, 0.7, 0.4],
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
        }}
        transition={{
            duration: 10,
            repeat: Infinity,
            delay: delay,
        }}
    />
);

export default function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { success, error } = useToast();

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<LoginFormInputs>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            role: 'CUSTOMER',
        },
    });

    const selectedRole = watch('role');

    const onSubmit = async (data: LoginFormInputs) => {
        setIsLoading(true);
        setServerError(null);
        try {
            const userAccount = await authService.loginUser(data.email, data.password, data.role);
            
            // Optionally store role if needed elsewhere without checking DB again
            localStorage.setItem('role', userAccount.role);

            success('Successfully logged in!');

            // Redirect based on role
            switch (userAccount.role) {
                case 'CUSTOMER':
                    navigate('/customer/dashboard');
                    break;
                case 'CONDUCTOR':
                    navigate('/conductor/dashboard');
                    break;
                case 'OWNER':
                    navigate('/owner/dashboard');
                    break;
                default:
                    navigate('/');
            }
        } catch (err: any) {
            console.error('Login failed:', err);
            let msg = err.code ? err.message : (err.message || 'Login failed. Please try again.');
            
            if (err.code === 'auth/invalid-credential' || (err.message && err.message.includes('auth/invalid-credential'))) {
                msg = 'Incorrect email or password. Please try again.';
            }
            
            setServerError(msg);
            error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex overflow-hidden bg-gray-50">
            {/* --- Left Side: Hero Section --- */}
            <div className="hidden lg:flex flex-col justify-center w-1/2 relative overflow-hidden bg-slate-900 px-16">
                {/* Animated Background */}
                <div className="absolute inset-0 overflow-hidden">
                    <FloatingShape className="bg-blue-400 top-0 -left-4 w-72 h-72" delay={0} />
                    <FloatingShape className="bg-indigo-500 top-20 right-20 w-80 h-80" delay={2} />
                    <FloatingShape className="bg-purple-500 -bottom-8 left-20 w-64 h-64" delay={4} />
                </div>

                <div className="relative z-10 space-y-8">
                    {/* Logo & Brand */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-orange-500/20">
                            <Bus className="w-7 h-7 text-white" />
                        </div>
                        <h1 className="text-5xl font-bold text-white mb-4 leading-tight">
                            Bus Ticket <br /> Reservation System
                        </h1>
                        <p className="text-xl text-blue-200 font-light max-w-md">
                            Book seats, pay securely, and track your bus in real time.
                        </p>
                    </motion.div>

                    <div className="space-y-4 pt-4">
                        <FeatureItem
                            icon={CheckCircle}
                            text="Instant Booking & Payment"
                            delay={0.2}
                        />
                        <FeatureItem
                            icon={QrCode}
                            text="Digital QR Tickets"
                            delay={0.3}
                        />
                        <FeatureItem
                            icon={MapPin}
                            text="Live Bus Tracking"
                            delay={0.4}
                        />
                    </div>
                </div>

                {/* Glass decoration */}
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-900 to-transparent z-10"></div>
            </div>

            {/* --- Right Side: Login Form --- */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative">
                {/* Mobile Background (Subtle) */}
                <div className="lg:hidden absolute inset-0 bg-slate-100 -z-10"></div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
                >
                    <div className="text-center mb-8 lg:hidden">
                        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <Bus className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
                        <p className="text-gray-500">Sign in to access your account</p>
                    </div>

                    <div className="hidden lg:block mb-8">
                        <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
                        <p className="text-gray-500 mt-2">Please enter your details to sign in.</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                        {/* Role Selection */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">I am a</label>
                            <div className="flex p-1 bg-gray-100 rounded-xl relative">
                                {/* Active Background Indicator */}
                                <motion.div
                                    layoutId="role-indicator"
                                    className="absolute top-1 bottom-1 bg-white rounded-lg shadow-sm border border-gray-200"
                                    initial={false}
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    style={{
                                        width: 'calc(33.33% - 0.5rem)',
                                        left: selectedRole === 'CUSTOMER' ? '0.25rem' : selectedRole === 'CONDUCTOR' ? 'calc(33.33% + 0.25rem)' : 'calc(66.66% + 0.25rem)'
                                    }}
                                />

                                {['CUSTOMER', 'CONDUCTOR', 'OWNER'].map((role) => (
                                    <button
                                        key={role}
                                        type="button"
                                        onClick={() => setValue('role', role as any)}
                                        className={clsx(
                                            "flex-1 relative z-10 py-2 text-sm font-medium rounded-lg transition-colors capitalize",
                                            selectedRole === role ? "text-blue-600" : "text-gray-500 hover:text-gray-700"
                                        )}
                                    >
                                        {role.toLowerCase()}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Email Field */}
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input
                                {...register('email')}
                                type="email"
                                placeholder="Enter your email"
                                className={clsx(
                                    "w-full px-4 py-3 rounded-lg bg-gray-50 border transition focus:ring-2 focus:outline-none",
                                    errors.email ? "border-red-500 focus:ring-red-200" : "border-gray-200 focus:border-blue-500 focus:ring-blue-100"
                                )}
                            />
                            {errors.email && (
                                <motion.p
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="text-red-500 text-sm"
                                >
                                    {errors.email.message}
                                </motion.p>
                            )}
                        </div>

                        {/* Password Field */}
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700">Password</label>
                            <div className="relative">
                                <input
                                    {...register('password')}
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Enter your password"
                                    className={clsx(
                                        "w-full px-4 py-3 rounded-lg bg-gray-50 border transition focus:ring-2 focus:outline-none",
                                        errors.password ? "border-red-500 focus:ring-red-200" : "border-gray-200 focus:border-blue-500 focus:ring-blue-100"
                                    )}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.password && (
                                <motion.p
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="text-red-500 text-sm"
                                >
                                    {errors.password.message}
                                </motion.p>
                            )}
                        </div>

                        {/* Remember Me & Forgot Password */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                <span className="text-sm text-gray-600">Remember me</span>
                            </label>
                            <a href="#" className="text-sm text-blue-600 hover:underline hover:text-blue-700 font-medium">
                                Forgot password?
                            </a>
                        </div>

                        {/* Error Message */}
                        <AnimatePresence>
                            {serverError && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-center"
                                >
                                    <span className="mr-2">⚠️</span> {serverError}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Submit Button */}
                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center relative overflow-hidden"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                "Sign In"
                            )}
                        </motion.button>

                        {/* Sign Up Link */}
                        {(selectedRole === 'CUSTOMER' || selectedRole === 'OWNER') && (
                            <div className="text-center pt-2">
                                <p className="text-sm text-gray-600">
                                    Don't have an account?{' '}
                                    <Link to="/register" className="text-blue-600 font-medium hover:underline">
                                        Create account
                                    </Link>
                                </p>
                            </div>
                        )}
                    </form>
                </motion.div>
            </div>
        </div>
    );
}
