// src/pages/Login.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Microscope, Lock, User, ShieldCheck, KeyRound, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useAppData } from '../hooks/useAppData';
import { Button } from '../components/Button';

export const Login = () => {
  const { user, login, savedUsername, rememberMe: savedRememberMe, loading: authLoading } = useAuth();
  const { addToast } = useAppData();
  const navigate = useNavigate();

  const [username, setUsername] = useState(savedUsername || 'dr.sarah');
  const [password, setPassword] = useState('password123'); // pre-fill demo for convenience
  const [rememberMe, setRememberMe] = useState(savedRememberMe ?? true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Update username if savedUsername changes
  useEffect(() => {
    if (savedUsername) {
      setUsername(savedUsername);
    }
  }, [savedUsername]);

  // If already authenticated and not loading, redirect straight to Dashboard
  if (!authLoading && user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!username.trim()) {
      setErrorMessage('Please enter your pathologist username or email.');
      return;
    }
    if (!password.trim()) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setSubmitting(true);
    try {
      const loggedInUser = await login({
        username: username.trim(),
        password: password.trim(),
        rememberMe
      });
      addToast(`Welcome back, ${loggedInUser.name}!`, 'success');
      navigate('/');
    } catch (err) {
      setErrorMessage(err.message || 'Authentication failed. Please verify credentials.');
      addToast(err.message || 'Login failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFillDemo = () => {
    setUsername('dr.sarah');
    setPassword('password123');
    setErrorMessage('');
  };

  return (
    <div className="w-full">
      {/* Brand Icon & Heading */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-600 to-teal-400 text-white shadow-xl shadow-teal-500/25 mb-3 ring-4 ring-slate-800">
          <Microscope className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">PathoCare Diagnostic Lab</h1>
        <p className="text-xs text-teal-400/90 font-medium mt-1">
          Pathologist Clinical Portal • Secure Station
        </p>
      </div>

      {/* Main Login Card */}
      <div className="bg-slate-800/90 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/40">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-700/60">
          <div>
            <h2 className="text-base font-bold text-white">Pathologist Sign In</h2>
            <p className="text-xs text-slate-400">Clinical session management</p>
          </div>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-teal-500/10 text-teal-300 border border-teal-500/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            Pathologist Access
          </span>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-300 animate-fade-in">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5" htmlFor="login-username">
              Username or Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                id="login-username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. dr.sarah"
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-900/80 border border-slate-600 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300" htmlFor="login-password">
                Password
              </label>
              <span className="text-[11px] text-teal-400">Security Clearance</span>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="login-password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-900/80 border border-slate-600 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-300">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-teal-600 focus:ring-teal-500/40 focus:ring-offset-0 cursor-pointer"
              />
              <span>Remember me on this station</span>
            </label>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={submitting}
            className="w-full justify-center bg-teal-600 hover:bg-teal-500 text-white font-semibold py-2.5 shadow-lg shadow-teal-600/30"
            id="login-submit-btn"
          >
            Authenticate & Access Dashboard
          </Button>
        </form>

        {/* Demo Credentials Helper Pill */}
        <div className="mt-6 pt-4 border-t border-slate-700/60 bg-slate-900/40 -mx-6 -mb-6 p-4 rounded-b-2xl flex items-center justify-between text-xs text-slate-400">
          <div>
            <p className="font-semibold text-slate-300">Demo Pathologist Credentials:</p>
            <p className="text-[11px] font-mono text-slate-400 mt-0.5">
              dr.sarah / password123
            </p>
          </div>
          <button
            type="button"
            onClick={handleFillDemo}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/20 font-medium text-xs transition-colors"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Auto-Fill</span>
          </button>
        </div>
      </div>

      <p className="text-center text-[11px] text-slate-500 mt-6">
        Protected Health Information (PHI) compliant session management • PathoCare v2.4
      </p>
    </div>
  );
};
