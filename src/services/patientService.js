// src/services/patientService.js
import { STORAGE_KEYS, getStoredItem, setStoredItem } from './storage';

/**
 * Check if a patient with the same Name and Mobile already exists.
 * Case-insensitive name and normalized mobile.
 */
export const checkDuplicatePatient = async (name, mobile, excludeId = null) => {
  const patients = getStoredItem(STORAGE_KEYS.PATIENTS, []);
  const normalizedName = (name || '').trim().toLowerCase();
  const normalizedMobile = (mobile || '').replace(/\D/g, '');

  const duplicate = patients.find(p => {
    if (excludeId && p.id === excludeId) return false;
    const pName = (p.name || '').trim().toLowerCase();
    const pMobile = (p.mobile || '').replace(/\D/g, '');
    return pName === normalizedName && pMobile === normalizedMobile;
  });

  return duplicate || null;
};

/**
 * Fetch all patients with optional filtering and sorting
 */
export const getPatients = async ({ query = '', status = '', sortBy = 'enrollmentDate', sortOrder = 'desc' } = {}) => {
  const patients = getStoredItem(STORAGE_KEYS.PATIENTS, []);
  let filtered = [...patients];

  // Search filter (Name, PatientCode, Mobile)
  if (query && query.trim()) {
    const q = query.trim().toLowerCase();
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.patientCode.toLowerCase().includes(q) ||
      p.mobile.includes(q) ||
      (p.referredBy && p.referredBy.toLowerCase().includes(q))
    );
  }

  // Status filter
  if (status) {
    filtered = filtered.filter(p => p.status.toLowerCase() === status.toLowerCase());
  }

  // Sorting
  filtered.sort((a, b) => {
    let aVal = a[sortBy];
    let bVal = b[sortBy];

    if (sortBy === 'enrollmentDate') {
      aVal = new Date(aVal).getTime();
      bVal = new Date(bVal).getTime();
    } else if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase();
      bVal = (bVal || '').toLowerCase();
    }

    if (sortOrder === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  return filtered;
};

/**
 * Get patient by ID or PatientCode
 */
export const getPatientById = async (id) => {
  const patients = getStoredItem(STORAGE_KEYS.PATIENTS, []);
  return patients.find(p => p.id === id || p.patientCode === id) || null;
};

/**
 * Enroll a new patient
 */
export const enrollPatient = async (patientData) => {
  // Validate duplicate
  const duplicate = await checkDuplicatePatient(patientData.name, patientData.mobile);
  if (duplicate) {
    const err = new Error(`Patient "${patientData.name}" with mobile ${patientData.mobile} is already enrolled.`);
    err.duplicatePatient = duplicate;
    throw err;
  }

  const patients = getStoredItem(STORAGE_KEYS.PATIENTS, []);

  // Generate unique sequential Patient Code (e.g. PT-0019)
  const existingNumbers = patients
    .map(p => {
      const match = (p.patientCode || '').match(/PT-(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter(n => !isNaN(n));
  
  const nextNum = (existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0) + 1;
  const newCode = `PT-${String(nextNum).padStart(4, '0')}`;

  const newPatient = {
    id: newCode,
    patientCode: newCode,
    name: patientData.name.trim(),
    age: Number(patientData.age),
    gender: patientData.gender,
    mobile: patientData.mobile.trim(),
    address: (patientData.address || '').trim(),
    referredBy: (patientData.referredBy || 'Self / Walk-in').trim(),
    testsRequested: Array.isArray(patientData.testsRequested) ? patientData.testsRequested : [],
    sampleType: patientData.sampleType || 'Whole Blood (EDTA)',
    enrollmentDate: patientData.enrollmentDate || new Date().toISOString(),
    status: 'Pending'
  };

  const updatedPatients = [newPatient, ...patients];
  setStoredItem(STORAGE_KEYS.PATIENTS, updatedPatients);

  return newPatient;
};

/**
 * Update existing patient
 */
export const updatePatient = async (id, updatedFields) => {
  const patients = getStoredItem(STORAGE_KEYS.PATIENTS, []);
  const index = patients.findIndex(p => p.id === id);

  if (index === -1) {
    throw new Error('Patient not found.');
  }

  // Duplicate check if name or mobile changed
  if (updatedFields.name || updatedFields.mobile) {
    const nameToCheck = updatedFields.name || patients[index].name;
    const mobileToCheck = updatedFields.mobile || patients[index].mobile;
    const duplicate = await checkDuplicatePatient(nameToCheck, mobileToCheck, id);
    if (duplicate) {
      throw new Error(`Another patient with name "${nameToCheck}" and mobile ${mobileToCheck} already exists.`);
    }
  }

  const updatedPatient = {
    ...patients[index],
    ...updatedFields
  };

  patients[index] = updatedPatient;
  setStoredItem(STORAGE_KEYS.PATIENTS, patients);
  return updatedPatient;
};

/**
 * Delete a patient
 */
export const deletePatient = async (id) => {
  const patients = getStoredItem(STORAGE_KEYS.PATIENTS, []);
  const filtered = patients.filter(p => p.id !== id);
  setStoredItem(STORAGE_KEYS.PATIENTS, filtered);
  return true;
};
