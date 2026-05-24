import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { ref, onValue, update, off } from 'firebase/database'; // RTDB imports
import { rtdb } from '../firebase/firebase'; // RTDB instance
import type { PageKey } from '../types';
import HomePage from '../pages/HomePage';
import ProfilePage from '../pages/ProfilePage';
import BookingPage from '../pages/BookingPage';
import ScanQrPage from '../pages/ScanQrPage';
import TasksPage from '../pages/TasksPage';
import { Bus, Home, UserCog, Ticket, QrCode, ListChecks, LogOut } from 'lucide-react';

const NAV: { key: PageKey; label: string; icon: React.ReactNode }[] = [
  { key: 'home',    label: 'Home',        icon: <Home size={18} /> },
  { key: 'profile', label: 'Profile',     icon: <UserCog size={18} /> },
  { key: 'booking', label: 'Seat Booking', icon: <Ticket size={18} /> },
  { key: 'scanqr',  label: 'Scan QR',     icon: <QrCode size={18} /> },
  { key: 'tasks',   label: 'Your Routes', icon: <ListChecks size={18} /> },
];

const Dashboard: React.FC = () => {
  const { conductor, logout } = useAuth();
  const [page, setPage] = useState<PageKey>('home');

  useEffect(() => {
    const busId = (conductor as any)?.assignedBusId;
    if (!busId) return;

    let watchId: number | null = null;

    // Realtime Database tracking status 
    const statusRef = ref(rtdb, `busStatus/${busId}`);
    
    const unsub = onValue(statusRef, (snapshot) => {
      const data = snapshot.val();
      const isTracking = data?.isTracking;

      if (isTracking === true) {
        // Tracking , GPS  RTDB 
        if (watchId === null) {
          watchId = navigator.geolocation.watchPosition(
            (pos) => {
              update(ref(rtdb, `busLocations/${busId}`), {
                lat: pos.coords.latitude,
                lng: pos.coords.longitude,
                status: 'active',
                lastUpdated: Date.now()
              });
            },
            (err) => console.warn("GPS Error:", err),
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
          );
        }
      } else {
        // Tracking 
        if (watchId !== null) {
          navigator.geolocation.clearWatch(watchId);
          watchId = null;
          // Tracking  status  inactive 
          update(ref(rtdb, `busLocations/${busId}`), { status: 'inactive' });
        }
      }
    });

    return () => {
      off(statusRef);
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    };
  }, [conductor]);

  const initials = conductor?.name ? conductor.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'CO';
  const firstName = conductor?.name ? conductor.name.split(' ')[0] : 'Operator';

  const renderPage = () => {
    switch (page) {
      case 'home':    return <HomePage onNavigate={setPage} />;
      case 'profile': return <ProfilePage />;
      case 'booking': return <BookingPage />;
      case 'scanqr':  return <ScanQrPage />;
      case 'tasks':   return <TasksPage />;
      default:        return <HomePage onNavigate={setPage} />;
    }
  };

  return (
    <>
      <header className="topbar">
        <div className="topbar-brand">
          <Bus size={22} />
          <span className="welcome-text">Welcome, {firstName}!</span>
        </div>
        <div className="topbar-right">
          <div className="status-dot" />
          <div className="topbar-user">
            <div className="topbar-avatar">{initials}</div>
            <span>{conductor?.name || 'Conductor'}</span>
          </div>
        </div>
      </header>

      <div className="layout">
        <nav className="sidebar">
          <div className="sidebar-nav">
            {NAV.map(item => (
              <button key={item.key} className={`nav-btn ${page === item.key ? 'active' : ''}`} onClick={() => setPage(item.key)}>
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
          <div>
            <button className="logout-btn" onClick={logout}>
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        </nav>
        <main className="main-content">
          {renderPage()}
        </main>
      </div>
    </>
  );
};

export default Dashboard;