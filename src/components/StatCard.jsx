// src/components/StatCard.jsx
import React from 'react';

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  colorScheme = 'teal',
  onClick,
  id
}) => {
  const schemeStyles = {
    teal: {
      bg: 'bg-teal-50/70',
      iconText: 'text-teal-600',
      border: 'border-teal-100',
      highlight: 'text-teal-700'
    },
    blue: {
      bg: 'bg-blue-50/70',
      iconText: 'text-blue-600',
      border: 'border-blue-100',
      highlight: 'text-blue-700'
    },
    amber: {
      bg: 'bg-amber-50/70',
      iconText: 'text-amber-600',
      border: 'border-amber-100',
      highlight: 'text-amber-700'
    },
    emerald: {
      bg: 'bg-emerald-50/70',
      iconText: 'text-emerald-600',
      border: 'border-emerald-100',
      highlight: 'text-emerald-700'
    },
    rose: {
      bg: 'bg-rose-50/70',
      iconText: 'text-rose-600',
      border: 'border-rose-100',
      highlight: 'text-rose-700'
    }
  };

  const scheme = schemeStyles[colorScheme] || schemeStyles.teal;

  return (
    <div
      id={id}
      onClick={onClick}
      className={`bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden ${
        onClick ? 'cursor-pointer hover:border-teal-300' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{title}</p>
          <h4 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 tracking-tight">
            {value !== undefined && value !== null ? value : 0}
          </h4>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1 font-medium">
              {subtitle}
            </p>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl border ${scheme.bg} ${scheme.border} ${scheme.iconText} shrink-0`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  );
};
