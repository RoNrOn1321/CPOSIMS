import React, { useEffect, useState, useRef } from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  X 
} from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string | React.ReactNode;
  duration?: number;
}

interface ToastCardProps {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}

export function ToastCard({ toast, onDismiss }: ToastCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [progress, setProgress] = useState(100);
  const duration = toast.duration ?? 4500;
  const startTimeRef = useRef(Date.now());
  const remainingRef = useRef(duration);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isHovered) {
      if (timerRef.current) clearTimeout(timerRef.current);
      remainingRef.current = Math.max(0, remainingRef.current - (Date.now() - startTimeRef.current));
      return;
    }

    startTimeRef.current = Date.now();
    timerRef.current = setTimeout(() => {
      onDismiss(toast.id);
    }, remainingRef.current);

    // Progress bar animation interval
    const interval = setInterval(() => {
      if (!isHovered) {
        const elapsed = Date.now() - startTimeRef.current;
        const currentRemaining = Math.max(0, remainingRef.current - elapsed);
        setProgress((currentRemaining / duration) * 100);
      }
    }, 50);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      clearInterval(interval);
    };
  }, [isHovered, toast.id, duration, onDismiss]);

  const config = {
    success: {
      borderColor: 'border-emerald-200/90',
      badgeBg: 'bg-emerald-50 text-emerald-600 border border-emerald-200',
      icon: <CheckCircle2 size={18} className="text-emerald-600" />,
      defaultTitle: 'Success',
      progressBg: 'bg-emerald-500',
    },
    error: {
      borderColor: 'border-rose-200/90',
      badgeBg: 'bg-rose-50 text-rose-600 border border-rose-200',
      icon: <AlertCircle size={18} className="text-rose-600" />,
      defaultTitle: 'Error',
      progressBg: 'bg-rose-500',
    },
    warning: {
      borderColor: 'border-amber-200/90',
      badgeBg: 'bg-amber-50 text-amber-600 border border-amber-200',
      icon: <AlertTriangle size={18} className="text-amber-600" />,
      defaultTitle: 'Attention',
      progressBg: 'bg-amber-500',
    },
    info: {
      borderColor: 'border-slate-200/90',
      badgeBg: 'bg-rose-50 text-[#5c1516] border border-rose-100',
      icon: <Info size={18} className="text-[#5c1516]" />,
      defaultTitle: 'Notification',
      progressBg: 'bg-[#5c1516]',
    },
  }[toast.type];

  return (
    <div
      role="status"
      aria-live="polite"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative w-full max-w-sm sm:max-w-md bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border ${config.borderColor} overflow-hidden pointer-events-auto transition-all duration-300 ease-out animate-in slide-in-from-top-3 fade-in-0`}
    >
      <div className="p-3.5 flex items-start gap-3">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${config.badgeBg}`}>
          {config.icon}
        </div>

        <div className="flex-1 min-w-0 pt-0.5">
          <p className="text-xs font-black text-slate-800 tracking-tight leading-none mb-1">
            {toast.title || config.defaultTitle}
          </p>
          <div className="text-xs text-slate-600 leading-relaxed font-medium break-words">
            {toast.message}
          </div>
        </div>

        <button
          type="button"
          onClick={() => onDismiss(toast.id)}
          className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100/80 transition-colors shrink-0"
          title="Dismiss notification"
        >
          <X size={14} />
        </button>
      </div>

      {/* Subtle Progress Bar */}
      <div className="w-full bg-slate-100 h-1 overflow-hidden">
        <div
          className={`h-full ${config.progressBg} transition-all duration-75 ease-linear`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export function ToastContainer({ 
  toasts, 
  onDismiss 
}: { 
  toasts: ToastItem[]; 
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div 
      aria-label="Notifications"
      className="fixed top-4 right-4 z-[9999] flex flex-col gap-2.5 max-w-sm sm:max-w-md w-full pointer-events-none px-3 sm:px-0"
    >
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
