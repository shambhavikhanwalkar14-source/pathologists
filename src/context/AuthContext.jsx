// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentSession, getSavedCredentials, login as apiLogin, logout as apiLogout } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savedUsername, setSavedUsername] = useState('dr.sarah');
  const [rememberMe, setRememberMe] = useState(true);

  // Initialize session and saved credentials on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check saved credentials
        const creds = await getSavedCredentials();
        if (creds && creds.username) {
          setSavedUsername(creds.username);
          setRememberMe(creds.rememberMe);
        }

        // Check if there is an active valid session (auto-login)
        const sessionUser = await getCurrentSession();
        if (sessionUser) {
          setUser(sessionUser);
        }
      } catch (err) {
        console.error('Failed to restore auth session:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async ({ username, password, rememberMe: isRemember = true }) => {
    setLoading(true);
    try {
      const loggedUser = await apiLogin({ username, password, rememberMe: isRemember });
      setUser(loggedUser);
      setRememberMe(isRemember);
      if (isRemember) {
        setSavedUsername(username);
      }
      return loggedUser;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await apiLogout();
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    savedUsername,
    rememberMe,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
