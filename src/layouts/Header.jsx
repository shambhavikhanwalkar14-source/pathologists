// src/layouts/Header.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RotateCcw,
  LogOut,
  ShieldCheck,
  ChevronDown,
  Sparkles,
  Activity
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useAppData } from '../hooks/useAppData';
import { Modal } from '../components/Modal';
import { Button } from '../components/Button';

export const Header = () => {
  const { user, logout } = useAuth();
  const { resetDemoData } = useAppData();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const handleConfirmReset = () => {
    resetDemoData();
    setShowResetModal(false);
  };

  const handleConfirmLogout = async () => {
    await logout();
    setShowLogoutModal(false);
    navigate('/login');
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between no-print">
        {/* Left Side: Mobile title / System Tag */}
        <div className="flex items-center gap-3">
          <div className="md:hidden flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white shadow-xs">
              <Activity className="w-5 h-5" />
            </div>
            <span className="font-bold text-slate-800 text-base">PathoCare</span>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 font-medium bg-slate-100/80 px-3 py-1.5 rounded-full border border-slate-200/60">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Pathology Laboratory Core System</span>
            <span className="text-slate-300">•</span>
            <span>Clinical Pathology & Histopathology</span>
          </div>
        </div>

        {/* Right Side: Quick Actions & Pathologist User Menu */}
        <div className="flex items-center gap-3">
          {/* Reset Demo Data Button */}
          <button
            type="button"
            onClick={() => setShowResetModal(true)}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors shadow-2xs"
            title="Reset to default seed data"
          >
            <RotateCcw className="w-3.5 h-3.5 text-teal-600" />
            <span>Reset Demo Data</span>
          </button>

          {/* User Profile Menu */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-left focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              aria-haspopup="true"
              aria-expanded={menuOpen}
            >
              <div className="w-8 h-8 rounded-lg bg-teal-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                {user?.name ? user.name.split(' ').filter(n => !n.startsWith('Dr.')).slice(0, 2).map(n => n[0]).join('') || 'SM' : 'DR'}
              </div>
              <div className="hidden sm:block text-left pr-1">
                <div className="text-xs font-bold text-slate-800 leading-tight flex items-center gap-1">
                  <span>{user?.name || 'Dr. Sarah Mitchell'}</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                  {user?.role || 'Pathologist'}
                </div>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-40 animate-fade-in divide-y divide-slate-100">
                <div className="px-4 py-2.5">
                  <p className="text-xs font-bold text-slate-800">{user?.name}</p>
                  <p className="text-[11px] text-slate-500">{user?.designation || 'Senior Consultant Pathologist'}</p>
                  <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 text-[10px] font-semibold">
                    <Sparkles className="w-3 h-3" />
                    <span>Lic: {user?.licenseNumber || 'MCI-847291'}</span>
                  </div>
                </div>

                <div className="py-1">
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      setShowResetModal(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-teal-600" />
                    <span>Reset Demo Data</span>
                  </button>
                </div>

                <div className="py-1">
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      setShowLogoutModal(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 font-medium transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-600" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Confirmation Modal for Demo Data Reset */}
      <Modal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        title="Reset Demo Data?"
        subtitle="Restore database to original seed state"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setShowResetModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleConfirmReset}>
              Yes, Reset Data
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          This will restore patients, reports, and attendance records back to the default 18 demo patients, 14 diagnostic reports, and 30-day attendance roster. Any temporary modifications will be reset.
        </p>
      </Modal>

      {/* Confirmation Modal for Sign Out */}
      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="Sign Out of PathoCare?"
        subtitle="Your session token will be cleared"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setShowLogoutModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleConfirmLogout}>
              Confirm Sign Out
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          Are you sure you want to log out? Your saved credentials will remain pre-filled for convenience on your next visit.
        </p>
      </Modal>
    </>
  );
};
