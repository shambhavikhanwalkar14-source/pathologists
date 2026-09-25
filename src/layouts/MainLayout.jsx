// src/layouts/MainLayout.jsx
import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  UserPlus,
  FileText,
  Clock,
  LogOut
} from 'lucide-react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ToastContainer } from '../components/Toast';
import { Modal } from '../components/Modal';
import { Button } from '../components/Button';
import { useAuth } from '../hooks/useAuth';

export const MainLayout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = async () => {
    await logout();
    setShowLogoutModal(false);
    navigate('/login');
  };

  const mobileNavItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/enroll', label: 'Enroll', icon: UserPlus, end: false },
    { to: '/reports', label: 'Reports', icon: FileText, end: false },
    { to: '/attendance', label: 'Attendance', icon: Clock, end: false }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-800 antialiased">
      {/* Desktop Sidebar */}
      <Sidebar onLogoutClick={() => setShowLogoutModal(true)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        <Header />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Tab Bar */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-2 py-1.5 flex items-center justify-around shadow-lg no-print bottom-nav"
        aria-label="Mobile Navigation"
      >
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[10px] font-semibold transition-colors duration-150 ${
                  isActive
                    ? 'text-teal-700 bg-teal-50'
                    : 'text-slate-500 hover:text-slate-800'
                }`
              }
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}

        <button
          type="button"
          onClick={() => setShowLogoutModal(true)}
          className="flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[10px] font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-colors"
        >
          <LogOut className="w-5 h-5 mb-0.5" />
          <span>Logout</span>
        </button>
      </nav>

      {/* Global Toast Container */}
      <ToastContainer />

      {/* Confirmation Modal for Mobile / Sidebar Logout */}
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
            <Button variant="danger" size="sm" onClick={handleLogout}>
              Confirm Sign Out
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          Are you sure you want to end your active pathologist session? Your saved username will stay remembered for next time.
        </p>
      </Modal>
    </div>
  );
};
