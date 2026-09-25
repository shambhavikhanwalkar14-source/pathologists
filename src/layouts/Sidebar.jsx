// src/layouts/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  UserPlus,
  FileText,
  Clock,
  LogOut,
  Microscope,
  Stethoscope
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const Sidebar = ({ onLogoutClick }) => {
  const { user } = useAuth();

  const navItems = [
    {
      to: '/',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      to: '/enroll',
      label: 'Enroll Patient',
      icon: UserPlus,
      badge: 'New'
    },
    {
      to: '/reports',
      label: 'Diagnostic Reports',
      icon: FileText,
      badge: null
    },
    {
      to: '/attendance',
      label: 'Lab Attendance',
      icon: Clock,
      badge: null
    }
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200/80 shrink-0 h-screen sticky top-0 z-40 select-none no-print">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-100 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-700 to-teal-500 flex items-center justify-center text-white shadow-md shadow-teal-700/20">
          <Microscope className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-extrabold text-slate-900 tracking-tight text-lg leading-tight flex items-center gap-1.5">
            <span>PathoCare</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-100 text-teal-800">
              PRO
            </span>
          </h1>
          <p className="text-[11px] font-medium text-slate-400">Pathology Management</p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Clinical Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-teal-50 text-teal-800 font-semibold shadow-2xs border border-teal-200/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5 shrink-0 transition-colors" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-teal-600 text-white">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Pathologist Card & Logout at Bottom */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="p-3 bg-white rounded-xl border border-slate-200/70 shadow-2xs mb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-teal-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-slate-800 truncate">
                {user?.name || 'Dr. Sarah Mitchell'}
              </p>
              <p className="text-[11px] text-teal-600 font-medium truncate">
                Active Session
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onLogoutClick}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
