'use client';

import { useState, createContext, useContext, ReactNode, useCallback } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastVariant = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  variant: ToastVariant;
  title: string;
  description?: string;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (variant: ToastVariant, title: string, description?: string) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Global toast queue for non-component contexts
let globalToastQueue: Array<{ variant: ToastVariant; title: string; description?: string }> = [];
let globalAddToast: ((variant: ToastVariant, title: string, description?: string) => void) | null =
  null;

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((variant: ToastVariant, title: string, description?: string) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, variant, title, description }]);

    // Auto-remove after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  // Register global toast handler and process queue
  if (typeof window !== 'undefined') {
    globalAddToast = addToast;

    // Process any queued toasts
    if (globalToastQueue.length > 0) {
      globalToastQueue.forEach(({ variant, title, description }) => {
        addToast(variant, title, description);
      });
      globalToastQueue = [];
    }
  }

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({
  toasts,
  removeToast,
}: {
  toasts: Toast[];
  removeToast: (id: string) => void;
}) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  const icons = {
    success: <CheckCircle className="h-5 w-5 text-emerald-600" />,
    error: <AlertCircle className="h-5 w-5 text-destructive" />,
    info: <Info className="h-5 w-5 text-primary" />,
  };

  const variants = {
    success: 'bg-card border-emerald-200',
    error: 'bg-card border-destructive/50',
    info: 'bg-card border-primary/50',
  };

  return (
    <div
      className={cn(
        'relative flex items-start gap-3 w-80 rounded-lg border shadow-lg p-4 animate-in slide-in-from-right-8',
        variants[toast.variant]
      )}
    >
      {icons[toast.variant]}

      <div className="flex-1 space-y-1">
        <p className="font-medium text-sm">{toast.title}</p>
        {toast.description && <p className="text-sm text-muted-foreground">{toast.description}</p>}
      </div>

      <button
        onClick={onRemove}
        className="text-muted-foreground hover:text-foreground transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
}

// Utility functions that can be called from anywhere
function showToast(variant: ToastVariant, title: string, description?: string) {
  if (globalAddToast) {
    globalAddToast(variant, title, description);
  } else {
    // Queue toast if provider not ready
    globalToastQueue.push({ variant, title, description });
  }
}

export function toastSuccess(title: string, description?: string) {
  showToast('success', title, description);
}

export function toastError(title: string, description?: string) {
  showToast('error', title, description);
}

export function toastInfo(title: string, description?: string) {
  showToast('info', title, description);
}
