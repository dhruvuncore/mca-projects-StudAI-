import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export interface ToastState {
  isOpen: boolean;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastProps {
  toasts?: ToastMessage[];
  onDismiss?: (id: string) => void;
  isOpen?: boolean;
  message?: string;
  type?: 'success' | 'error' | 'info';
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  toasts,
  onDismiss,
  isOpen,
  message,
  type = 'success',
  onClose,
}) => {
  // Auto-dismiss single toast
  useEffect(() => {
    if (isOpen && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  // Auto-dismiss multi-toast
  useEffect(() => {
    if (toasts && toasts.length > 0 && onDismiss) {
      const timer = setTimeout(() => {
        onDismiss(toasts[0].id);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toasts, onDismiss]);

  // Handle single toast mode
  if (isOpen && message) {
    return (
      <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border text-xs sm:text-sm transition-all transform translate-y-0 bg-white border-slate-200 animate-in slide-in-from-bottom-5">
        {type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
        {type === 'error' && <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />}
        {type === 'info' && <Info className="w-5 h-5 text-blue-600 shrink-0" />}
        <span className="font-semibold text-slate-800">{message}</span>
        {onClose && (
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded transition-colors ml-2"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    );
  }

  // Handle multi-toast array mode
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border text-xs sm:text-sm transition-all transform translate-y-0 ${
            toast.type === 'success'
              ? 'bg-white border-emerald-200 text-slate-800'
              : toast.type === 'error'
              ? 'bg-white border-rose-200 text-slate-800'
              : 'bg-white border-blue-200 text-slate-800'
          }`}
        >
          {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
          {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />}
          {toast.type === 'info' && <Info className="w-5 h-5 text-blue-600 shrink-0" />}
          <span className="flex-1 font-semibold">{toast.message}</span>
          {onDismiss && (
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
};
