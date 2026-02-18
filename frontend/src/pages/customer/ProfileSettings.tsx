import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, CreditCard, Lock, Save, Trash2, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ConfirmDeleteModal from '../../components/common/ConfirmDeleteModal';
import type { CustomerProfile } from '../../types/user';

// Mock Data
const MOCK_PROFILE: CustomerProfile = {
    id: 'cust-001',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '0771234567',
    nic: '199012345678',
    profileImage: 'https://ui-avatars.com/api/?name=John+Doe&background=f97316&color=fff'
};

export default function ProfileSettings() {
    const navigate = useNavigate();
    const [profile, setProfile] = useState<CustomerProfile>(MOCK_PROFILE);
    const [isEditing, setIsEditing] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });

    useEffect(() => {
        // Simulate fetch
        setProfile(MOCK_PROFILE);
    }, []);

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate API update
        setIsEditing(false);
        alert('Profile updated successfully!');
    };

    const handleDeleteAccount = () => {
        // Simulate API delete
        setShowDeleteModal(false);
        alert('Account deleted successfully.');
        navigate('/login');
    };

    const handleLogout = () => {
        navigate('/login');
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
                    <p className="text-gray-500 text-sm">Manage your account information and security</p>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 text-gray-500 hover:text-red-600 transition-colors px-4 py-2 rounded-xl hover:bg-red-50"
                >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm font-medium">Log Out</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Profile Card */}
                <div className="lg:col-span-1">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center"
                    >
                        <div className="relative inline-block mb-4">
                            <img
                                src={profile.profileImage}
                                alt={profile.name}
                                className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
                            />
                            <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 border-2 border-white rounded-full"></div>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">{profile.name}</h2>
                        <p className="text-gray-500 text-sm mb-6">{profile.email}</p>

                        <div className="space-y-3">
                            <button
                                onClick={() => setIsEditing(!isEditing)}
                                className={`w-full py-2.5 rounded-xl font-medium transition-all ${isEditing
                                        ? 'bg-gray-100 text-gray-700'
                                        : 'bg-gray-900 text-white hover:bg-black shadow-lg hover:shadow-xl'
                                    }`}
                            >
                                {isEditing ? 'Cancel Editing' : 'Edit Profile'}
                            </button>
                            <button
                                onClick={() => setShowDeleteModal(true)}
                                className="w-full py-2.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
                            >
                                <Trash2 className="w-4 h-4" />
                                <span>Delete Account</span>
                            </button>
                        </div>
                    </motion.div>
                </div>

                {/* Right Column: Edit Form */}
                <div className="lg:col-span-2">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100"
                    >
                        <form onSubmit={handleUpdate}>
                            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <User className="w-5 h-5 text-orange-500" />
                                Personal Information
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type="text"
                                            disabled={!isEditing}
                                            value={profile.name}
                                            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type="email"
                                            disabled={true} // Email usually strictly controlled
                                            value={profile.email}
                                            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none opacity-60 cursor-not-allowed"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type="tel"
                                            disabled={!isEditing}
                                            value={profile.phone}
                                            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">NIC Number</label>
                                    <div className="relative">
                                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type="text"
                                            disabled={!isEditing}
                                            value={profile.nic}
                                            onChange={(e) => setProfile({ ...profile, nic: e.target.value })}
                                            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-gray-100 pt-8">
                                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <Lock className="w-5 h-5 text-blue-500" />
                                    Change Password
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                                        <input
                                            type="password"
                                            disabled={!isEditing}
                                            value={passwords.new}
                                            onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                            placeholder="••••••••"
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                                        <input
                                            type="password"
                                            disabled={!isEditing}
                                            value={passwords.confirm}
                                            onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                            placeholder="••••••••"
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            {isEditing && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex justify-end pt-4"
                                >
                                    <button
                                        type="submit"
                                        className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all flex items-center space-x-2"
                                    >
                                        <Save className="w-4 h-4" />
                                        <span>Save Changes</span>
                                    </button>
                                </motion.div>
                            )}
                        </form>
                    </motion.div>
                </div>
            </div>

            <ConfirmDeleteModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDeleteAccount}
                title="Delete Account"
                message="Are you sure you want to delete your account? This action cannot be undone and you will lose all your booking history."
                confirmText="Delete Account"
            />
        </div>
    );
}
