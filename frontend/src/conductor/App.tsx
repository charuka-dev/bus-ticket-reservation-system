import React from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import Dashboard from './components/Dashboard';

const Inner: React.FC = () => {
  const { conductor } = useAuth();
  return conductor ? <Dashboard /> : <LoginPage />;
};

const ConductorApp: React.FC = () => (
  <AuthProvider>
    <Inner />
  </AuthProvider>
);

export default ConductorApp;
