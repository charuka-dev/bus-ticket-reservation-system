import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase';

export type AppRole = 'CUSTOMER' | 'CONDUCTOR' | 'OWNER' | 'ADMIN';

export interface AuthUser {
    uid: string;
    email: string;
    role: AppRole;
    // Firestore document data merged in
    [key: string]: any;
}

interface AuthContextType {
    authUser: AuthUser | null;
    isLoading: boolean;
    setAuthUser: (user: AuthUser | null) => void;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [authUser, setAuthUserState] = useState<AuthUser | null>(() => {
        // Restore session from localStorage on first render
        try {
            const stored = localStorage.getItem('authUser');
            return stored ? JSON.parse(stored) : null;
        } catch {
            return null;
        }
    });
    const [isLoading, setIsLoading] = useState(true);

    // Keep auth state in sync with Firebase
    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (firebaseUser) => {
            if (!firebaseUser) {
                // Firebase session expired → clear stored user
                setAuthUserState(null);
                localStorage.removeItem('authUser');
            }
            setIsLoading(false);
        });
        return unsub;
    }, []);

    const setAuthUser = useCallback((user: AuthUser | null) => {
        setAuthUserState(user);
        if (user) {
            localStorage.setItem('authUser', JSON.stringify(user));
            localStorage.setItem('role', user.role);
        } else {
            localStorage.removeItem('authUser');
            localStorage.removeItem('role');
        }
    }, []);

    const logout = useCallback(async () => {
        await signOut(auth);
        setAuthUser(null);
    }, [setAuthUser]);

    return (
        <AuthContext.Provider value={{ authUser, isLoading, setAuthUser, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuthContext() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
    return ctx;
}
