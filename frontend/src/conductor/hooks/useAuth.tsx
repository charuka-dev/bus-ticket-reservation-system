import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { Conductor } from '../types';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';

interface AuthContextType {
  conductor: Conductor | null;
  login: (conductor: Conductor) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [conductor, setConductor] = useState<Conductor | null>(() => {
    try {
      const saved = sessionStorage.getItem('conductor');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // 💡 Login function 
  const login = async (c: Conductor) => {
    try {
      // 1. Firestore picture gave
      const docRef = doc(db, 'conductors', c.id);
      const docSnap = await getDoc(docRef);
      
      let finalConductor = c;
      if (docSnap.exists()) {
        finalConductor = { ...c, ...docSnap.data() } as Conductor;
      }

      // 2. save data
      setConductor(finalConductor);
      sessionStorage.setItem('conductor', JSON.stringify(finalConductor));
    } catch (err) {
      console.error("Login data fetch error:", err);
      // save the old type data if Firestore fetch failed
      setConductor(c);
      sessionStorage.setItem('conductor', JSON.stringify(c));
    }
  };

  const logout = () => {
    setConductor(null);
    sessionStorage.removeItem('conductor');
  };

  return (
    <AuthContext.Provider value={{ conductor, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}