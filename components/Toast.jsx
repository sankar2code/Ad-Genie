'use client';

import { createContext, useCallback, useContext, useState } from 'react';

const ToastContext = createContext(null);

const VARIANT_STYLES = {
  genie: 'text-ag-genie',
  success: 'text-ag-success',
  error: 'text-ag-error',
};

let nextId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, variant = 'genie', duration = 2000) => {
    const id = nextId++;
    setToasts(prev => [...prev, { id, message, variant }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div
        aria-live="polite"
        role="status"
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-2 pointer-events-none"
      >
        {toasts.map(t => (
          <div
            key={t.id}
            className={`ag-fade-in bg-ag-bg-elevated border border-ag-border-strong rounded-lg px-4 py-2.5 text-sm font-medium shadow-lg ${VARIANT_STYLES[t.variant] || VARIANT_STYLES.genie}`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}
