// src/components/StatusBadge.jsx
import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, ArrowUp, ArrowDown, Activity } from 'lucide-react';

export const StatusBadge = ({ status, className = '' }) => {
  if (!status) return null;

  const normalized = status.toString().trim().toLowerCase();

  let styles = 'bg-slate-100 text-slate-700 border-slate-200';
  let Icon = null;
  let label = status;

  if (normalized === 'completed' || normalized === 'ready' || normalized === 'signed') {
    styles = 'bg-teal-50 text-teal-700 border-teal-200/80';
    Icon = CheckCircle2;
  } else if (normalized === 'pending' || normalized === 'in progress') {
    styles = 'bg-amber-50 text-amber-700 border-amber-200/80';
    Icon = Clock;
  } else if (normalized === 'high' || normalized === 'critical high' || normalized.includes('critical')) {
    styles = 'bg-rose-50 text-rose-700 border-rose-200/90 font-semibold';
    Icon = ArrowUp;
  } else if (normalized === 'low') {
    styles = 'bg-blue-50 text-blue-700 border-blue-200/80 font-semibold';
    Icon = ArrowDown;
  } else if (normalized === 'normal') {
    styles = 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
    Icon = CheckCircle2;
  } else if (normalized.includes('present') || normalized === 'on duty') {
    styles = 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
    Icon = Activity;
  } else if (normalized.includes('late')) {
    styles = 'bg-orange-50 text-orange-700 border-orange-200/80';
    Icon = AlertTriangle;
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles} ${className}`}
    >
      {Icon && <Icon className="w-3 h-3 shrink-0" />}
      <span>{label}</span>
    </span>
  );
};
