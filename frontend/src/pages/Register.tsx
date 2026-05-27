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
    Building2
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import clsx from 'clsx';
import { authService, type RegisterData, type RegisterOwnerData } from '../services/authService';
import { useToast } from '../contexts/ToastContext';

// --- Zod Schema ---
const registerSchema = z.object({
    role: z.enum(['CUSTOMER', 'OWNER']),
    name: z.string().min(1, 'Full Name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().regex(/^\d{10}$/, 'Phone number must be 10 digits'),
    nic: z.string().optional(),
    companyName: z.string().optional(),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Confirm Password must be at least 6 characters'),
    agreeTerms: z.boolean().refine((val) => val === true, {
        message: 'You must agree to the Terms and Conditions',
    }),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
}).refine((data) => {
    if (data.role === 'CUSTOMER') return !!data.nic && data.nic.trim().length > 0;
    return true;
}, { message: 'NIC is required', path: ['nic'] })
.refine((data) => {
    if (data.role === 'OWNER') return !!data.companyName && data.companyName.trim().length > 0;
    return true;
}, { message: 'Company Name is required', path: ['companyName'] });

type RegisterFormInputs = z.infer<typeof registerSchema>;

export default function Register() {
    const [isLoading, setIsLoading] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const navigate = useNavigate();
    const { success, error } = useToast();

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<RegisterFormInputs>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            role: 'CUSTOMER',
            agreeTerms: undefined,
        }
    });

    const selectedRole = watch('role');

    const onSubmit = async (data: RegisterFormInputs) => {
        setIsLoading(true);
        setServerError(null);
        setSuccessMessage(null);

        try {
            if (data.role === 'CUSTOMER') {
                const payload: RegisterData = {
                    role: "CUSTOMER",
                    name: data.name,
                    email: data.email,
                    phone: data.phone,
                    nic: data.nic!,
                    password: data.password
                };
                await authService.registerCustomer(payload);
                setSuccessMessage('Registration successful! Redirecting to login...');
                success('Account created successfully!');
            } else {
                const payload: RegisterOwnerData = {
                    role: "OWNER",
                    name: data.name,
                    email: data.email,
                    phone: data.phone,
                    companyName: data.companyName!,
                    password: data.password
                };
                await authService.registerOwner(payload);
                setSuccessMessage('Registration successful! Your account is pending approval.');
                success('Owner account created! Waiting for approval.');
            }

            setTimeout(() => {
                navigate('/login');
            }, 3000);

        } catch (err: any) {
            console.error('Registration failed:', err);
            const msg = err.code ? err.message : (err.message || 'Registration failed. Please try again.');
            setServerError(msg);
            error(msg);
            setIsLoading(false);
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
                    
                    {/* Role Selection Tabs */}
                    <div className="flex p-1 bg-gray-100 rounded-xl relative mb-6">
                        {/* Active Background Indicator */}
                        <motion.div
                            layoutId="register-role-indicator"
                            className="absolute top-1 bottom-1 bg-white rounded-lg shadow-sm border border-gray-200"
                            initial={false}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            style={{
                                width: 'calc(50% - 0.5rem)',
                                left: selectedRole === 'CUSTOMER' ? '0.25rem' : 'calc(50% + 0.25rem)'
                            }}
                        />

                        {['CUSTOMER', 'OWNER'].map((role) => (
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

                    {/* Phone & Dynamic Row */}
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

                        {selectedRole === 'CUSTOMER' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-1">
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
                            </motion.div>
                        )}

                        {selectedRole === 'OWNER' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-1">
                                <label className="block text-sm font-medium text-gray-700">Company Name</label>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        {...register('companyName')}
                                        type="text"
                                        placeholder="Company Ltd."
                                        className={clsx(
                                            "w-full pl-10 pr-4 py-3 rounded-lg bg-gray-50 border transition focus:ring-2 focus:outline-none",
                                            errors.companyName ? "border-red-500 focus:ring-red-200" : "border-gray-200 focus:border-blue-500 focus:ring-blue-100"
                                        )}
                                    />
                                </div>
                                {errors.companyName && <p className="text-red-500 text-xs mt-1">{errors.companyName.message}</p>}
                            </motion.div>
                        )}
                    </div>

                    {/* Password */}
                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                {...register('password')}
                                type="password"
                                placeholder="ΓÇóΓÇóΓÇóΓÇóΓÇóΓÇóΓÇóΓÇó"
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
                                placeholder="ΓÇóΓÇóΓÇóΓÇóΓÇóΓÇóΓÇóΓÇó"
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
                                <span className="mr-2">ΓÜá∩╕Å</span> {serverError}
                            </motion.div>
                        )}
                        {successMessage && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="p-3 bg-green-50 text-green-600 text-sm rounded-lg border border-green-100 flex items-center"
                            >
                                <CheckCircle className="w-5 h-5 mr-2 shrink-0" /> {successMessage}
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
                            selectedRole === 'CUSTOMER' ? "Create Customer Account" : "Register as Owner"
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
