import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';
import { ToastItem, ToastType, ToastContainer } from '@/Components/ui/toast';
import { PageProps } from '@/types';

export interface ToastOptions {
  title?: string;
  duration?: number;
}

interface ToastContextType {
  toast: {
    success: (message: string | React.ReactNode, options?: ToastOptions) => void;
    error: (message: string | React.ReactNode, options?: ToastOptions) => void;
    warning: (message: string | React.ReactNode, options?: ToastOptions) => void;
    info: (message: string | React.ReactNode, options?: ToastOptions) => void;
    dismiss: (id: string) => void;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Standalone global dispatcher for non-react or outside-component usage
type ToastListener = (toast: Omit<ToastItem, 'id'>) => void;
const listeners = new Set<ToastListener>();

export const toast = {
  success: (message: string | React.ReactNode, options?: ToastOptions) => {
    listeners.forEach((listener) => listener({ type: 'success', message, ...options }));
  },
  error: (message: string | React.ReactNode, options?: ToastOptions) => {
    listeners.forEach((listener) => listener({ type: 'error', message, ...options }));
  },
  warning: (message: string | React.ReactNode, options?: ToastOptions) => {
    listeners.forEach((listener) => listener({ type: 'warning', message, ...options }));
  },
  info: (message: string | React.ReactNode, options?: ToastOptions) => {
    listeners.forEach((listener) => listener({ type: 'info', message, ...options }));
  },
  dismiss: (_id: string) => {
    // Dismiss handled via state in ToastProvider
  },
};

function InertiaFlashBridge({ onAddToast }: { onAddToast: (item: Omit<ToastItem, 'id'>) => void }) {
  const lastProcessedFlashRef = useRef<string | null>(null);

  const processFlash = useCallback((flash?: PageProps['flash']) => {
    if (!flash) return;

    // Create unique signature to avoid duplicate toasts on identical state renders
    const flashSignature = JSON.stringify(flash);
    if (lastProcessedFlashRef.current === flashSignature) {
      return;
    }
    lastProcessedFlashRef.current = flashSignature;

    if (flash.success) {
      onAddToast({
        type: 'success',
        title: 'Success',
        message: flash.success,
      });
    }

    if (flash.error) {
      onAddToast({
        type: 'error',
        title: 'Error',
        message: flash.error,
        duration: 6000,
      });
    }

    if (flash.warning) {
      onAddToast({
        type: 'warning',
        title: 'Warning',
        message: flash.warning,
      });
    }

    if (flash.info) {
      onAddToast({
        type: 'info',
        title: 'Information',
        message: flash.info,
      });
    }

    if (flash.status) {
      onAddToast({
        type: 'info',
        title: 'Status Update',
        message: flash.status,
      });
    }
  }, [onAddToast]);

  useEffect(() => {
    // 1. Check initial flash from the Inertia root element dataset
    if (typeof document !== 'undefined') {
      try {
        const pageEl = document.getElementById('app');
        if (pageEl?.dataset.page) {
          const initialPage = JSON.parse(pageEl.dataset.page);
          const initialFlash = initialPage.props?.flash || initialPage.flash;
          if (initialFlash) {
            processFlash(initialFlash);
          }
        }
      } catch {
        // Ignore JSON parsing errors
      }
    }

    // 2. Subscribe to Inertia router success & flash events
    const unregisterSuccess = router.on('success', (event: any) => {
      const pageFlash = event?.detail?.page?.props?.flash;
      if (pageFlash) {
        processFlash(pageFlash);
      }
    });

    const unregisterFlash = router.on('flash', (event: any) => {
      const flashData = event?.detail?.flash;
      if (flashData) {
        processFlash(flashData);
      }
    });

    return () => {
      unregisterSuccess();
      unregisterFlash();
    };
  }, [processFlash]);

  return null;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((item: Omit<ToastItem, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const newToast: ToastItem = { ...item, id };
    setToasts((prev) => [newToast, ...prev].slice(0, 5)); // Keep max 5 visible
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Subscribe to standalone toast helpers
  useEffect(() => {
    const handleListener: ToastListener = (toastData) => {
      addToast(toastData);
    };
    listeners.add(handleListener);
    return () => {
      listeners.delete(handleListener);
    };
  }, [addToast]);

  const contextValue: ToastContextType = {
    toast: {
      success: (message, options) => addToast({ type: 'success', message, ...options }),
      error: (message, options) => addToast({ type: 'error', message, ...options }),
      warning: (message, options) => addToast({ type: 'warning', message, ...options }),
      info: (message, options) => addToast({ type: 'info', message, ...options }),
      dismiss: dismissToast,
    },
  };

  return (
    <ToastContext.Provider value={contextValue}>
      <InertiaFlashBridge onAddToast={addToast} />
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
