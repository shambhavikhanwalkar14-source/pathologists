// src/services/reportService.js
import { STORAGE_KEYS, getStoredItem, setStoredItem } from './storage';

/**
 * Helper to auto-flag a test result based on numerical range or text
 */
export const calculateFlag = (result, low, high) => {
  if (result === undefined || result === null || result === '') return 'Normal';
  const val = parseFloat(result);
  if (isNaN(val)) return 'Normal';
  if (low !== undefined && low !== null && !isNaN(low) && val < low) return 'Low';
  if (high !== undefined && high !== null && !isNaN(high) && val > high) return 'High';
  return 'Normal';
};

/**
 * Fetch reports with filtering and sorting
 */
export const getReports = async ({ query = '', dateFilter = '', sortBy = 'generatedDate', sortOrder = 'desc' } = {}) => {
  const reports = getStoredItem(STORAGE_KEYS.REPORTS, []);
  let filtered = [...reports];

  if (query && query.trim()) {
    const q = query.trim().toLowerCase();
    filtered = filtered.filter(r =>
      (r.reportCode && r.reportCode.toLowerCase().includes(q)) ||
      (r.patientCode && r.patientCode.toLowerCase().includes(q)) ||
      (r.patientName && r.patientName.toLowerCase().includes(q)) ||
      (r.remarks && r.remarks.toLowerCase().includes(q))
    );
  }

  if (dateFilter) {
    filtered = filtered.filter(r => {
      const repDate = new Date(r.generatedDate).toISOString().split('T')[0];
      return repDate === dateFilter;
    });
  }

  filtered.sort((a, b) => {
    let aVal = a[sortBy];
    let bVal = b[sortBy];

    if (sortBy === 'generatedDate') {
      aVal = new Date(aVal).getTime();
      bVal = new Date(bVal).getTime();
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
 * Get single report by ID or Code
 */
export const getReportById = async (id) => {
  const reports = getStoredItem(STORAGE_KEYS.REPORTS, []);
  return reports.find(r => r.id === id || r.reportCode === id) || null;
};

/**
 * Create and save a new diagnostic report
 * Also marks the corresponding patient status as 'Completed'
 */
export const createReport = async (reportData) => {
  const reports = getStoredItem(STORAGE_KEYS.REPORTS, []);
  const patients = getStoredItem(STORAGE_KEYS.PATIENTS, []);

  // Generate unique report code e.g. REP-2026-0015
  const year = new Date().getFullYear();
  const existingNumbers = reports
    .map(r => {
      const match = (r.reportCode || '').match(/REP-\d{4}-(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter(n => !isNaN(n));

  const nextNum = (existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0) + 1;
  const newReportCode = `REP-${year}-${String(nextNum).padStart(4, '0')}`;
  const newReportId = `REP-${String(nextNum).padStart(4, '0')}`;

  const newReport = {
    id: newReportId,
    reportCode: newReportCode,
    patientId: reportData.patientId,
    patientCode: reportData.patientCode,
    patientName: reportData.patientName,
    tests: Array.isArray(reportData.tests) ? reportData.tests : [],
    remarks: (reportData.remarks || 'Clinical correlation recommended.').trim(),
    pathologistName: reportData.pathologistName || 'Dr. Sarah Mitchell, MD (Path)',
    signatureText: reportData.signatureText || 'Dr. Sarah Mitchell, M.D. (Pathology)',
    generatedDate: reportData.generatedDate || new Date().toISOString(),
    status: reportData.status || (reportData.sentToReceptionist ? 'Sent to Reception' : 'Saved'),
    sentToReceptionist: !!reportData.sentToReceptionist,
    sentToReceptionistAt: reportData.sentToReceptionist ? new Date().toISOString() : null
  };

  // Add report
  const updatedReports = [newReport, ...reports];
  setStoredItem(STORAGE_KEYS.REPORTS, updatedReports);

  // Update corresponding patient status to 'Completed'
  const patientIndex = patients.findIndex(p => p.id === reportData.patientId || p.patientCode === reportData.patientCode);
  if (patientIndex !== -1) {
    patients[patientIndex].status = 'Completed';
    setStoredItem(STORAGE_KEYS.PATIENTS, patients);
  }

  return { report: newReport, updatedPatients: patients };
};

/**
 * Update an existing report
 */
export const updateReport = async (id, updatedFields) => {
  const reports = getStoredItem(STORAGE_KEYS.REPORTS, []);
  const index = reports.findIndex(r => r.id === id || r.reportCode === id);

  if (index === -1) {
    throw new Error('Report not found');
  }

  const updated = {
    ...reports[index],
    ...updatedFields
  };

  reports[index] = updated;
  setStoredItem(STORAGE_KEYS.REPORTS, reports);
  return updated;
};
