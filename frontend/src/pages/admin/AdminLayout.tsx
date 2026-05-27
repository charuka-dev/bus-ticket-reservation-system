import { Outlet } from 'react-router-dom';
import AdminSidebarNav from './AdminSidebarNav';
import { useAuthContext } from '../../contexts/AuthContext';

export default function AdminLayout() {
    const { authUser } = useAuthContext();

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-slate-950">
            <AdminSidebarNav />
            <div className="flex flex-col flex-1 overflow-hidden">
                {/* Top bar */}
                <header className="h-16 bg-slate-900 border-b border-white/10 flex items-center justify-between px-6 shrink-0">
                    <h1 className="text-white font-semibold text-sm">Admin Dashboard</h1>
                    <div className="flex items-center gap-3">
                        <span className="text-white/50 text-xs">{authUser?.email}</span>
                        <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {authUser?.email?.[0]?.toUpperCase() ?? 'A'}
                        </div>
                    </div>
                </header>
                {/* Page content */}
                <main className="flex-1 overflow-y-auto p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
