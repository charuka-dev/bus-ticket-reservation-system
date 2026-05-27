import React, { useEffect } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { useAuthContext } from '../contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase/firebase';
import Dashboard from './components/Dashboard';
import type { Conductor } from './types';

/**
 * This inner component bridges the global AuthContext (populated by the
 * shared Login page) into the conductor-specific local AuthProvider.
 * When the conductor arrives at /conductor/* after logging in via the
 * shared login, their profile data is fetched from Firestore and seeded
 * into the conductor's local session state so the Dashboard renders.
 */
const Inner: React.FC = () => {
  const { conductor, login } = useAuth();
  const { authUser } = useAuthContext();

  useEffect(() => {
    // If the conductor local state is empty but the global auth has a
    // CONDUCTOR user, fetch their Firestore profile and seed local state.
    if (!conductor && authUser && authUser.role === 'CONDUCTOR') {
      (async () => {
        try {
          const snap = await getDoc(doc(db, 'conductors', authUser.uid));
          const data = snap.exists() ? snap.data() : {};
          const c: Conductor = {
            id: authUser.uid,
            username: authUser.email || '',
            password: '',
            name: data.name || authUser.email || 'Conductor',
            employeeId: data.uid || authUser.uid,
            phone: data.phone || '',
            email: authUser.email || '',
            route: data.route || '',
            photoUrl: data.photoUrl || '',
          };
          login(c);
        } catch (err) {
          console.error('Failed to fetch conductor profile:', err);
        }
      })();
    }
  }, [authUser, conductor, login]);

  if (!conductor) {
    // Show a loading spinner while we fetch the profile
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#f0f4ff',
        flexDirection: 'column',
        gap: 16
      }}>
        <span className="spinner spinner-dark" />
        <p style={{ color: '#6b7a9a', fontSize: '0.9rem' }}>Loading conductor dashboard…</p>
      </div>
    );
  }

  return <Dashboard />;
};

const ConductorApp: React.FC = () => (
  <AuthProvider>
    <Inner />
  </AuthProvider>
);

export default ConductorApp;
