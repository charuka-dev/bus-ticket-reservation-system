import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { ShieldCheck, CheckCircle, Loader2 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, db } from '../firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, collection, getDocs, serverTimestamp } from 'firebase/firestore';
import { useToast } from '../contexts/ToastContext';

const registerSchema = z.object({
    name: z.string().min(2, 'Name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(10, 'Invalid phone number'),
    companyName: z.string().min(2, 'Company name is required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

type RegisterInputs = z.infer<typeof registerSchema>;

export default function Register() {
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { success, error } = useToast();

    const { register, handleSubmit, formState: { errors } } = useForm<RegisterInputs>({
        resolver: zodResolver(registerSchema),
    });

    // Automatically calculates the next sequential ID (Max + 1)
    const getNextOwnerId = async () => {
        const snapshot = await getDocs(collection(db, 'owners'));
        
        if (snapshot.empty) {
            return 'owner001'; 
        }

        let maxNum = 0;
        snapshot.docs.forEach((doc) => {
            const id = doc.id; 
            if (id.startsWith('owner')) {
                const num = parseInt(id.replace('owner', ''), 10);
                if (num > maxNum) {
                    maxNum = num; 
                }
            }
        });

        const nextNum = maxNum + 1;
        return `owner${String(nextNum).padStart(3, '0')}`; 
    };

    const onSubmit = async (data: RegisterInputs) => {
        setIsLoading(true);
        try {
            // 1. Create official authentication profile inside Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, data.email.trim().toLowerCase(), data.password);
            const firebaseUser = userCredential.user;

            // 2. Fetch next custom serial ID (e.g., owner010)
            const customOwnerId = await getNextOwnerId();

            // 3. Save profile data using standard simple-case configurations to avoid lookup bugs
            await setDoc(doc(db, 'owners', customOwnerId), {
                ownerCustomId: customOwnerId, 
                uid: firebaseUser.uid, // 🟢 FIXED: Stores the ACTUAL generated Firebase Authentication UID string
                name: data.name,
                email: data.email.trim().toLowerCase(), // 🟢 FIXED: Forces lowercase to eliminate case-mismatch conflicts
                phone: data.phone,
                companyName: data.companyName,
                role: 'OWNER',
                approved: "pending", 
                createdAt: serverTimestamp(),
            });
            
            success(`Registration successful! Your ID is ${customOwnerId}. Waiting for admin approval.`);
            navigate('/login'); 
            
        } catch (err: any) {
            error(err.message || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex bg-slate-900 overflow-hidden">
            {/* Left Hero Panel */}
            <div className="hidden lg:flex flex-col justify-center w-1/2 px-20 relative border-r border-white/5">
                <div className="relative z-10 space-y-8">
                    <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                        <ShieldCheck className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-5xl font-black text-white leading-tight">
                        Register Your <br /> <span className="text-orange-400">Bus Business</span>
                    </h1>
                    <div className="space-y-4">
                        <div className="flex items-center space-x-3 text-blue-100/80 text-lg">
                            <CheckCircle className="w-6 h-6 text-orange-400" />
                            <span>Fleet Management Dashboard</span>
                        </div>
                        <div className="flex items-center space-x-3 text-blue-100/80 text-lg">
                            <CheckCircle className="w-6 h-6 text-orange-400" />
                            <span>Conductor & Route Assignment</span>
                        </div>
                    </div>
                </div>
                <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600/10 rounded-full blur-[120px]" />
            </div>

            {/* Right Interactive Registration Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-gray-50">
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 md:p-10 border border-gray-100">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8">Business Registration</h2>
                    
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <input {...register('name')} placeholder="Full Name" className="w-full px-5 py-4 rounded-xl bg-gray-50 border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" />
                            {errors.name && <p className="text-red-500 text-xs mt-1 ml-1">{errors.name.message}</p>}
                        </div>

                        <div>
                            <input {...register('email')} type="email" placeholder="Email" className="w-full px-5 py-4 rounded-xl bg-gray-50 border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" />
                            {errors.email && <p className="text-red-500 text-xs mt-1 ml-1">{errors.email.message}</p>}
                        </div>

                        <div>
                            <input {...register('phone')} placeholder="Phone Number" className="w-full px-5 py-4 rounded-xl bg-gray-50 border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" />
                            {errors.phone && <p className="text-red-500 text-xs mt-1 ml-1">{errors.phone.message}</p>}
                        </div>

                        <div>
                            <input {...register('companyName')} placeholder="Company Name" className="w-full px-5 py-4 rounded-xl bg-gray-50 border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" />
                            {errors.companyName && <p className="text-red-500 text-xs mt-1 ml-1">{errors.companyName.message}</p>}
                        </div>

                        <div>
                            <input {...register('password')} type="password" placeholder="Password" className="w-full px-5 py-4 rounded-xl bg-gray-50 border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" />
                            {errors.password && <p className="text-red-500 text-xs mt-1 ml-1">{errors.password.message}</p>}
                        </div>
                        
                        <button type="submit" disabled={isLoading} className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 transition mt-4 active:scale-95 flex items-center justify-center">
                            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Create Owner Account"}
                        </button>
                        
                        <p className="text-center text-sm text-gray-600 mt-6">
                            Already an owner? <Link to="/login" className="text-blue-600 font-bold hover:underline">Login</Link>
                        </p>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}