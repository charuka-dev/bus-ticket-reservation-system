import React, { createContext, useContext, useState } from 'react';

type ToastType = 'success' | 'error';

interface ToastContextType {
  success: (msg: string) => void;
  error: (msg: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [message, setMessage] = useState<string | null>(null);
  const [type, setType] = useState<ToastType>('success');

  const success = (msg: string) => {
    alert("✅ SUCCESS: " + msg); // Alert ekak damma, passe CSS Toast ekak danna puluwan
  };

  const error = (msg: string) => {
    alert("❌ ERROR: " + msg);
  };

  return (
    <ToastContext.Provider value={{ success, error }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};