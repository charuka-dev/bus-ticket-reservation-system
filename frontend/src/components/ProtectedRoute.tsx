import { Navigate, useLocation } from 'react-router-dom';
import type { AppRole } from '../contexts/AuthContext';
import { useAuthContext } from '../contexts/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles: AppRole[];
}

/**
 * Wraps a route and redirects to /login if:
 *  - Not logged in
 *  - Logged in but role is not in allowedRoles
 */
export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const { authUser, isLoading } = useAuthContext();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-slate-900">
                <div className="text-white font-semibold text-lg animate-pulse">Loading...</div>
            </div>
        );
    }

    if (!authUser) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (!allowedRoles.includes(authUser.role)) {
        // Redirect to their correct dashboard instead of showing 403
        const roleHome: Record<AppRole, string> = {
            CUSTOMER: '/customer/dashboard',
            CONDUCTOR: '/conductor/dashboard',
            OWNER: '/owner/dashboard',
            ADMIN: '/admin/dashboard',
        };
        return <Navigate to={roleHome[authUser.role]} replace />;
    }

    return <>{children}</>;
}
