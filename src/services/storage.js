// src/services/storage.js
import { initialMockPatients } from '../data/mockPatients';
import { initialMockReports } from '../data/mockReports';
import { initialMockAttendance } from '../data/mockAttendance';

const STORAGE_KEYS = {
  PATIENTS: 'pathocare_patients_v1',
  REPORTS: 'pathocare_reports_v1',
  ATTENDANCE: 'pathocare_attendance_v1',
  SAVED_CREDS: 'pathocare_saved_creds_v1',
  AUTH_SESSION: 'pathocare_auth_session_v1',
};

export const initStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.PATIENTS)) {
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(initialMockPatients));
  }
  if (!localStorage.getItem(STORAGE_KEYS.REPORTS)) {
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(initialMockReports));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ATTENDANCE)) {
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(initialMockAttendance));
  }
};

export const resetStorageToDefault = () => {
  localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(initialMockPatients));
  localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(initialMockReports));
  localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(initialMockAttendance));
};

export const getStoredItem = (key, fallback = []) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (err) {
    console.error(`Error reading key ${key} from localStorage:`, err);
    return fallback;
  }
};

export const setStoredItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error writing key ${key} to localStorage:`, err);
  }
};

export { STORAGE_KEYS };
