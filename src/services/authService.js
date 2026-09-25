// src/services/authService.js
import { mockUsers } from '../data/mockUsers';
import { STORAGE_KEYS, getStoredItem, setStoredItem } from './storage';

/**
 * Retrieve saved credentials (username only, never plaintext password)
 */
export const getSavedCredentials = async () => {
  const creds = getStoredItem(STORAGE_KEYS.SAVED_CREDS, null);
  if (creds && creds.rememberMe) {
    return {
      username: creds.username || 'dr.sarah',
      rememberMe: true
    };
  }
  return { username: 'dr.sarah', rememberMe: true };
};

/**
 * Check if valid active session exists
 */
export const getCurrentSession = async () => {
  const session = getStoredItem(STORAGE_KEYS.AUTH_SESSION, null);
  if (session && session.token && session.expiresAt > Date.now()) {
    return session.user;
  }
  return null;
};

/**
 * Login user
 */
export const login = async ({ username, password, rememberMe = true }) => {
  // Simulate network delay for realistic async service structure
  await new Promise(resolve => setTimeout(resolve, 250));

  const trimmedUsername = (username || '').trim().toLowerCase();
  const trimmedPassword = (password || '').trim();

  if (!trimmedUsername || !trimmedPassword) {
    throw new Error('Username and password are required.');
  }

  // Find user
  const foundUser = mockUsers.find(
    u => u.username.toLowerCase() === trimmedUsername || u.name.toLowerCase().includes(trimmedUsername)
  );

  // Demo allows default user or matched credentials
  if (!foundUser || foundUser.password !== trimmedPassword) {
    // If entered dr.sarah and password123 or demo password
    if (trimmedUsername === 'dr.sarah' && trimmedPassword === 'password123') {
      const user = mockUsers[0];
      return handleLoginSuccess(user, rememberMe);
    }
    throw new Error('Invalid username or password. (Demo: dr.sarah / password123)');
  }

  return handleLoginSuccess(foundUser, rememberMe);
};

const handleLoginSuccess = (user, rememberMe) => {
  // Save credentials preference (username only)
  if (rememberMe) {
    setStoredItem(STORAGE_KEYS.SAVED_CREDS, {
      username: user.username,
      rememberMe: true
    });
  } else {
    // Clear saved username if explicitly unchecked
    setStoredItem(STORAGE_KEYS.SAVED_CREDS, {
      username: '',
      rememberMe: false
    });
  }

  // Create session token
  const session = {
    token: `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    user: {
      id: user.id,
      name: user.name,
      username: user.username,
      role: user.role,
      licenseNumber: user.licenseNumber,
      designation: user.designation,
      signatureText: user.signatureText
    },
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
  };

  setStoredItem(STORAGE_KEYS.AUTH_SESSION, session);
  return session.user;
};

/**
 * Logout user: clears session token, preserves saved username
 */
export const logout = async () => {
  localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
  return true;
};
