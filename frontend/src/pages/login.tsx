import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Bus, Loader2, Eye, EyeOff } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, db } from '../firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore'; 
import { useToast } from '../contexts/ToastContext';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password required'),
});

type LoginInputs = z.infer<typeof loginSchema>;

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { success, error } = useToast();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginInputs>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInputs) => {
    setIsLoading(true);
    try {
      // 1. Firebase Auth එකෙන් ලොග් වෙනවා
      await signInWithEmailAndPassword(auth, data.email, data.password);
      
      // 2. Email එකෙන් Database එකේ තියෙන අදාළ Document එක හොයනවා
      const q = query(collection(db, 'owners'), where("email", "==", data.email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // 3. Database එකේ තියෙන 'ownerCustomId' එක අරගෙන localStorage එකට දාගන්නවා
        const ownerData = querySnapshot.docs[0].data();
        if (ownerData.ownerCustomId) {
            localStorage.setItem("ownerId", ownerData.ownerCustomId);
        }

        success('Login successful!');
        navigate('/');
      } else {
        error('Not authorized as an Owner.');
      }
    } catch (err: any) {
      error(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-900 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 md:p-10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30">
            <Bus className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Owner Login</h2>
          <p className="text-gray-500 text-sm mt-2 text-center">Manage your transport business fleet</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <input {...register('email')} type="email" placeholder="Email Address" 
              className={`w-full px-5 py-4 rounded-xl bg-gray-50 border outline-none focus:ring-2 transition-all ${errors.email ? 'border-red-500 ring-red-100' : 'border-gray-200 focus:border-blue-500 ring-blue-50'}`} />
            {errors.email && <p className="text-red-500 text-xs mt-1 ml-1">{errors.email.message}</p>}
          </div>

          <div className="relative">
            <input {...register('password')} type={showPassword ? "text" : "password"} placeholder="Password" 
              className={`w-full px-5 py-4 rounded-xl bg-gray-50 border outline-none focus:ring-2 transition-all ${errors.password ? 'border-red-500 ring-red-100' : 'border-gray-200 focus:border-blue-500 ring-blue-50'}`} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-4.5 text-gray-400 hover:text-gray-600 transition-colors">
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            {errors.password && <p className="text-red-500 text-xs mt-1 ml-1">{errors.password.message}</p>}
          </div>

          <button disabled={isLoading} className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 transition active:scale-95 disabled:opacity-50">
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : "Access Dashboard"}
          </button>
          
          <div className="text-center pt-2">
            <p className="text-sm text-gray-600">
              New here? <Link to="/register" className="text-blue-600 font-bold hover:underline">Register Business</Link>
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
}