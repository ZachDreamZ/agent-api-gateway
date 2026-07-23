content = '''import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (message: string, type: Toast['type'], duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: Toast['type'], duration = 5000) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = { id, message, type, duration };
    
    setToasts((prev) => [...prev, newToast]);
    
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
  if (toasts.length === 0) return null;

  return (
    <div
      className=\"fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none\"
      style={{ maxWidth: '420px' }}
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const icons = {
    success: <CheckCircle className=\"w-5 h-5 flex-shrink-0\" />,
    error: <AlertCircle className=\"w-5 h-5 flex-shrink-0\" />,
    warning: <AlertTriangle className=\"w-5 h-5 flex-shrink-0\" />,
    info: <Info className=\"w-5 h-5 flex-shrink-0\" />,
  };

  const colors = {
    success: {
      bg: 'oklch(0.95 0.05 145)',
      border: 'oklch(0.55 0.15 145)',
      text: 'oklch(0.35 0.15 145)',
    },
    error: {
      bg: 'oklch(0.95 0.05 25)',
      border: 'oklch(0.55 0.15 25)',
      text: 'oklch(0.35 0.15 25)',
    },
    warning: {
      bg: 'oklch(0.95 0.08 85)',
      border: 'oklch(0.65 0.15 85)',
      text: 'oklch(0.35 0.12 85)',
    },
    info: {
      bg: 'oklch(0.95 0.05 235)',
      border: 'oklch(0.55 0.12 235)',
      text: 'oklch(0.35 0.12 235)',
    },
  };

  const color = colors[toast.type];

  return (
    <div
      className=\"surface-elevated rounded-lg shadow-lg pointer-events-auto animate-slide-in-right flex items-start gap-3 p-4\"
      style={{
        background: color.bg,
        borderLeft: 4px solid ,
        maxWidth: '420px',
      }}
    >
      <div style={{ color: color.text }}>{icons[toast.type]}</div>
      <p className=\"flex-1 text-sm font-medium\" style={{ color: color.text }}>
        {toast.message}
      </p>
      <button
        onClick={() => onRemove(toast.id)}
        className=\"flex-shrink-0 hover:opacity-70 transition-opacity\"
        style={{ color: color.text }}
        aria-label=\"Dismiss\"
      >
        <X className=\"w-4 h-4\" />
      </button>
    </div>
  );
}
'''

with open('src/dashboard/src/components/Toast.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Created Toast component')
