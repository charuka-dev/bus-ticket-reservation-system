import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useState, useEffect } from 'react';
import { authService } from '../services/authService';

export default function CustomerLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    authService.getCurrentUser().then(user => {
      setIsAuthenticated(!!user);
    }).catch(() => {
      setIsAuthenticated(false);
    });
  }, []);

  if (isAuthenticated === null) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
