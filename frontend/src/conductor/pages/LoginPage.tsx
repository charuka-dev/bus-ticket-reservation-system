import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase/firebase';
import type { Conductor } from '../types';
import { Bus, AlertCircle, Eye, EyeOff, LogIn, Shield, Sparkles } from 'lucide-react';
import '../../styles/login.css';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) { setError('Please enter email and password'); return; }
    setLoading(true);
    setError('');
    try {
      const userCredential = await signInWithEmailAndPassword(auth, username, password);
      const firebaseUser = userCredential.user;
      const q = query(collection(db, 'conductors'), where('email', '==', firebaseUser.email));
      const snap = await getDocs(q);
      if (snap.empty) { setError('Conductor data not found'); return; }
      const docData = snap.docs[0].data();
      const conductor: Conductor = {
        id: snap.docs[0].id,
        username: docData.email || '',
        password: '',
        name: docData.name || '',
        employeeId: docData.uid || '',
        phone: docData.phone || '',
        email: docData.email || '',
        route: '',
        photoUrl: '',
      };
      login(conductor);
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') setError('User not found');
      else if (err.code === 'auth/wrong-password') setError('Wrong password');
      else if (err.code === 'auth/invalid-credential') setError('Invalid email or password');
      else setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg-circle" style={{ width: 560, height: 560, top: -180, right: -200 }} />
      <div className="login-bg-circle" style={{ width: 360, height: 360, bottom: -100, left: -100 }} />
      <div className="login-bg-grid" />

      <div className="login-shell">
        <aside className="login-welcome">
          <div className="login-welcome-badge"><Sparkles size={14} /> Welcome aboard</div>
          <h1>Drive your route<br />with confidence.</h1>
          <p>
            BusLine Pro gives conductors a real-time view of seat reservations,
            QR ticket validation, and routes assigned by the bus owner — all in one place.
          </p>
          <ul className="login-welcome-list">
            <li><Shield size={16} /> Secure conductor-only access</li>
            <li><Bus size={16} /> Live seat map for every trip</li>
            <li><Sparkles size={16} /> One-tap QR ticket verification</li>
          </ul>
          <div className="login-welcome-foot">Powered by BusLine Pro · v1.2</div>
        </aside>

        <div className="login-card">
          <div className="login-logo">
            <div className="login-logo-icon"><Bus size={24} /></div>
            <div className="login-logo-text">
              BusLine Pro
              <small>Conductor Portal</small>
            </div>
          </div>

          <h1 className="login-title">Sign in to your dashboard</h1>
          <p className="login-sub">Use the credentials issued by your depot.</p>

          {error && (
            <div className="login-error">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="username">Email or Username</label>
              <input
                id="username"
                type="text"
                className="form-control"
                placeholder="e.g. kasun.p@busline.lk"
                value={username}
                onChange={e => setUsername(e.target.value)}
                autoComplete="username"
                autoFocus
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  type={showPwd ? 'text' : 'password'}
                  className="form-control"
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                  style={{ paddingRight: '44px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(p => !p)}
                  className="pwd-toggle"
                  aria-label={showPwd ? 'Hide password' : 'Show password'}
                >
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
              {loading ? <span className="spinner" /> : <LogIn size={17} />}
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="login-foot">Trouble signing in? Contact your depot supervisor.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
