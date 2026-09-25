// src/context/AppDataContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  initStorage,
  resetStorageToDefault,
  STORAGE_KEYS,
  getStoredItem
} from '../services/storage';
import {
  enrollPatient as apiEnrollPatient,
  updatePatient as apiUpdatePatient,
  deletePatient as apiDeletePatient
} from '../services/patientService';
import {
  createReport as apiCreateReport,
  updateReport as apiUpdateReport
} from '../services/reportService';
import {
  checkIn as apiCheckIn,
  checkOut as apiCheckOut
} from '../services/attendanceService';
import { mockTestTemplates } from '../data/mockTestTemplates';

const AppDataContext = createContext(null);

export const AppDataProvider = ({ children }) => {
  const [patients, setPatients] = useState([]);
  const [reports, setReports] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [testTemplates] = useState(mockTestTemplates);
  const [toasts, setToasts] = useState([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Initialize and load data from localStorage
  const loadData = useCallback(() => {
    initStorage();
    const storedPatients = getStoredItem(STORAGE_KEYS.PATIENTS, []);
    const storedReports = getStoredItem(STORAGE_KEYS.REPORTS, []);
    const storedAttendance = getStoredItem(STORAGE_KEYS.ATTENDANCE, []);

    setPatients(storedPatients);
    setReports(storedReports);
    setAttendance(storedAttendance);
    setIsDataLoaded(true);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Toast notification system
  const addToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Patient Actions
  const enrollNewPatient = async (patientData) => {
    try {
      const newPatient = await apiEnrollPatient(patientData);
      setPatients((prev) => [newPatient, ...prev]);
      addToast(`Patient ${newPatient.name} enrolled successfully (${newPatient.patientCode})`, 'success');
      return newPatient;
    } catch (err) {
      addToast(err.message, 'error');
      throw err;
    }
  };

  const updateExistingPatient = async (id, updatedFields) => {
    try {
      const updated = await apiUpdatePatient(id, updatedFields);
      setPatients((prev) => prev.map((p) => (p.id === id ? updated : p)));
      addToast(`Patient details updated for ${updated.name}`, 'success');
      return updated;
    } catch (err) {
      addToast(err.message, 'error');
      throw err;
    }
  };

  const removePatient = async (id) => {
    try {
      const patientToRemove = patients.find((p) => p.id === id);
      await apiDeletePatient(id);
      setPatients((prev) => prev.filter((p) => p.id !== id));
      addToast(`Patient ${patientToRemove ? patientToRemove.name : id} deleted`, 'info');
      return true;
    } catch (err) {
      addToast(err.message, 'error');
      throw err;
    }
  };

  // Report Actions
  const saveNewReport = async (reportData) => {
    try {
      const { report, updatedPatients } = await apiCreateReport(reportData);
      setReports((prev) => [report, ...prev]);
      setPatients(updatedPatients);
      if (reportData.sentToReceptionist) {
        addToast(`Report ${report.reportCode} saved & sent to Receptionist!`, 'success');
      } else {
        addToast(`Report ${report.reportCode} saved successfully!`, 'success');
      }
      return report;
    } catch (err) {
      addToast(err.message, 'error');
      throw err;
    }
  };

  const sendReportToReceptionist = async (id) => {
    try {
      const updated = await apiUpdateReport(id, {
        sentToReceptionist: true,
        sentToReceptionistAt: new Date().toISOString(),
        status: 'Sent to Reception'
      });
      setReports((prev) => prev.map((r) => (r.id === id || r.reportCode === id ? updated : r)));
      addToast(`Report ${updated.reportCode} sent to Receptionist!`, 'success');
      return updated;
    } catch (err) {
      addToast(err.message, 'error');
      throw err;
    }
  };

  const updateExistingReport = async (id, updatedFields) => {
    try {
      const updated = await apiUpdateReport(id, updatedFields);
      setReports((prev) => prev.map((r) => (r.id === id ? updated : r)));
      addToast(`Report ${updated.reportCode} updated successfully`, 'success');
      return updated;
    } catch (err) {
      addToast(err.message, 'error');
      throw err;
    }
  };

  // Attendance Actions
  const markCheckIn = async (staffName, role, shift = 'Day Shift') => {
    try {
      const record = await apiCheckIn(staffName, role, shift);
      setAttendance((prev) => [record, ...prev]);
      addToast(`Checked in ${staffName} (${shift}) at ${record.checkIn}`, 'success');
      return record;
    } catch (err) {
      addToast(err.message, 'error');
      throw err;
    }
  };

  const markCheckOut = async (staffName) => {
    try {
      const updatedRecord = await apiCheckOut(staffName);
      setAttendance((prev) =>
        prev.map((r) => (r.id === updatedRecord.id ? updatedRecord : r))
      );
      addToast(`Checked out ${staffName} at ${updatedRecord.checkOut} (${updatedRecord.totalHours} hrs)`, 'success');
      return updatedRecord;
    } catch (err) {
      addToast(err.message, 'error');
      throw err;
    }
  };

  // Reset Demo Data
  const resetDemoData = () => {
    resetStorageToDefault();
    loadData();
    addToast('Demo database restored to default seed state.', 'info');
  };

  const value = {
    patients,
    reports,
    attendance,
    testTemplates,
    isDataLoaded,
    toasts,
    addToast,
    removeToast,
    enrollNewPatient,
    updateExistingPatient,
    removePatient,
    saveNewReport,
    sendReportToReceptionist,
    updateExistingReport,
    markCheckIn,
    markCheckOut,
    resetDemoData
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
};

export const useAppData = () => {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
};
