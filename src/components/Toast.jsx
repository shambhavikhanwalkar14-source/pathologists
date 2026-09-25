// src/components/Toast.jsx
import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useAppData } from '../hooks/useAppData';

export const ToastContainer = () => {
  const { toasts, removeToast } = useAppData();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 flex flex-col gap-2.5 max-w-md w-full pointer-events-none toast-container">
      {toasts.map((toast) => {
        let styles = 'bg-slate-900 text-white border-slate-800';
        let Icon = Info;
        let iconColor = 'text-teal-400';

        if (toast.type === 'success') {
          styles = 'bg-white text-slate-800 border-teal-500/30 shadow-lg shadow-teal-900/10 border-l-4 border-l-teal-600';
          Icon = CheckCircle2;
          iconColor = 'text-teal-600';
        } else if (toast.type === 'error') {
          styles = 'bg-white text-slate-800 border-rose-500/30 shadow-lg shadow-rose-900/10 border-l-4 border-l-rose-600';
          Icon = AlertCircle;
          iconColor = 'text-rose-600';
        } else if (toast.type === 'info') {
          styles = 'bg-white text-slate-800 border-blue-500/30 shadow-lg shadow-blue-900/10 border-l-4 border-l-blue-600';
          Icon = Info;
          iconColor = 'text-blue-600';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl border shadow-lg transition-all transform animate-fade-in ${styles}`}
            role="status"
          >
            <div className="flex items-center gap-3">
              <Icon className={`w-5 h-5 shrink-0 ${iconColor}`} />
              <p className="text-sm font-medium leading-snug">{toast.message}</p>
            </div>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0"
              aria-label="Dismiss toast"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
