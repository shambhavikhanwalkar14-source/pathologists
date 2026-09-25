// src/services/dashboardService.js
import { STORAGE_KEYS, getStoredItem } from './storage';

/**
 * Format date for display in dropdown e.g. "Today, 24 Sep 2026"
 */
export const getFormattedPeriodLabels = () => {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  const options = { day: 'numeric', month: 'short', year: 'numeric' };
  const todayFormatted = now.toLocaleDateString('en-GB', options);
  const yesterdayFormatted = yesterday.toLocaleDateString('en-GB', options);

  return [
    { id: 'today', label: `Today (${todayFormatted})` },
    { id: 'yesterday', label: `Yesterday (${yesterdayFormatted})` },
    { id: 'month', label: `This Month (${now.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })})` },
    { id: 'year', label: `This Year (${now.getFullYear()})` }
  ];
};

/**
 * Helper to check if a date falls within the selected period
 */
export const isDateInPeriod = (dateInput, period) => {
  if (!dateInput) return false;
  const targetDate = new Date(dateInput);
  if (isNaN(targetDate.getTime())) return false;

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0, 0);
  const endOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59, 999);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const startOfYear = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
  const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);

  switch (period) {
    case 'today':
      return targetDate >= startOfToday && targetDate <= endOfToday;
    case 'yesterday':
      return targetDate >= startOfYesterday && targetDate <= endOfYesterday;
    case 'month':
      return targetDate >= startOfMonth && targetDate <= endOfMonth;
    case 'year':
      return targetDate >= startOfYear && targetDate <= endOfYear;
    default:
      return true;
  }
};

/**
 * Calculate dashboard stats based on active period and dataset
 */
export const getDashboardStats = (period = 'today', datasets = {}) => {
  const patients = datasets.patients || getStoredItem(STORAGE_KEYS.PATIENTS, []);
  const reports = datasets.reports || getStoredItem(STORAGE_KEYS.REPORTS, []);
  const attendance = datasets.attendance || getStoredItem(STORAGE_KEYS.ATTENDANCE, []);

  // Filter patients by enrollmentDate
  const periodPatients = patients.filter(p => isDateInPeriod(p.enrollmentDate, period));
  const patientsEnrolled = periodPatients.length;

  // Filter reports by generatedDate
  const periodReports = reports.filter(r => isDateInPeriod(r.generatedDate, period));
  const reportsGenerated = periodReports.length;

  // Pending reports: patients enrolled in this period whose status is Pending
  const pendingReports = periodPatients.filter(p => p.status === 'Pending').length;

  // Staff Present calculation
  let staffPresentCount = 0;
  const now = new Date();
  const todayYMD = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const yesterdayDate = new Date(now);
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayYMD = `${yesterdayDate.getFullYear()}-${String(yesterdayDate.getMonth() + 1).padStart(2, '0')}-${String(yesterdayDate.getDate()).padStart(2, '0')}`;

  if (period === 'today') {
    const todayLogs = attendance.filter(a => a.date === todayYMD);
    // Count active or present staff
    staffPresentCount = new Set(todayLogs.map(a => a.staffName)).size;
  } else if (period === 'yesterday') {
    const yestLogs = attendance.filter(a => a.date === yesterdayYMD);
    staffPresentCount = new Set(yestLogs.map(a => a.staffName)).size;
  } else if (period === 'month') {
    const monthLogs = attendance.filter(a => {
      const d = new Date(a.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    // Distinct active staff members who worked this month
    staffPresentCount = new Set(monthLogs.map(a => a.staffName)).size;
  } else {
    // year: distinct staff roster size
    staffPresentCount = new Set(attendance.map(a => a.staffName)).size || 4;
  }

  return {
    patientsEnrolled,
    reportsGenerated,
    pendingReports,
    staffPresent: staffPresentCount
  };
};

/**
 * Generate Recharts bar/line chart data for the selected period
 * Enrollments vs Reports over the selected period:
 * - Hourly for day (Today / Yesterday)
 * - Daily for month (This Month)
 * - Monthly for year (This Year)
 */
export const getChartData = (period = 'today', datasets = {}) => {
  const patients = datasets.patients || getStoredItem(STORAGE_KEYS.PATIENTS, []);
  const reports = datasets.reports || getStoredItem(STORAGE_KEYS.REPORTS, []);

  if (period === 'today' || period === 'yesterday') {
    // Hourly breakdown: 08:00 to 20:00 (every 2 hours)
    const hours = [
      { label: '08:00 AM', startH: 8, endH: 9 },
      { label: '10:00 AM', startH: 10, endH: 11 },
      { label: '12:00 PM', startH: 12, endH: 13 },
      { label: '02:00 PM', startH: 14, endH: 15 },
      { label: '04:00 PM', startH: 16, endH: 17 },
      { label: '06:00 PM', startH: 18, endH: 19 },
      { label: '08:00 PM', startH: 20, endH: 21 },
    ];

    const chartPoints = hours.map(h => {
      let enrolledCount = 0;
      let reportsCount = 0;

      patients.forEach(p => {
        if (isDateInPeriod(p.enrollmentDate, period)) {
          const d = new Date(p.enrollmentDate);
          const hr = d.getHours();
          if (hr >= h.startH && hr <= h.endH) enrolledCount++;
        }
      });

      reports.forEach(r => {
        if (isDateInPeriod(r.generatedDate, period)) {
          const d = new Date(r.generatedDate);
          const hr = d.getHours();
          if (hr >= h.startH && hr <= h.endH) reportsCount++;
        }
      });

      return {
        time: h.label,
        Enrollments: enrolledCount,
        Reports: reportsCount
      };
    });

    return chartPoints;
  }

  if (period === 'month') {
    // Daily breakdown across the month (grouped by chunks or days)
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

    const chartPoints = [];
    const step = daysInMonth > 28 ? 3 : 2; // sample intervals for clean aesthetic chart readability

    for (let day = 1; day <= daysInMonth; day += step) {
      const endDayRange = Math.min(day + step - 1, daysInMonth);
      let enrolledCount = 0;
      let reportsCount = 0;

      patients.forEach(p => {
        if (isDateInPeriod(p.enrollmentDate, 'month')) {
          const d = new Date(p.enrollmentDate);
          if (d.getDate() >= day && d.getDate() <= endDayRange) enrolledCount++;
        }
      });

      reports.forEach(r => {
        if (isDateInPeriod(r.generatedDate, 'month')) {
          const d = new Date(r.generatedDate);
          if (d.getDate() >= day && d.getDate() <= endDayRange) reportsCount++;
        }
      });

      chartPoints.push({
        time: `Day ${day}-${endDayRange}`,
        Enrollments: enrolledCount,
        Reports: reportsCount
      });
    }

    return chartPoints;
  }

  if (period === 'year') {
    // Monthly breakdown (Jan - Dec)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const currentYear = now.getFullYear();

    const chartPoints = monthNames.map((name, index) => {
      let enrolledCount = 0;
      let reportsCount = 0;

      patients.forEach(p => {
        const d = new Date(p.enrollmentDate);
        if (d.getFullYear() === currentYear && d.getMonth() === index) {
          enrolledCount++;
        }
      });

      reports.forEach(r => {
        const d = new Date(r.generatedDate);
        if (d.getFullYear() === currentYear && d.getMonth() === index) {
          reportsCount++;
        }
      });

      return {
        time: name,
        Enrollments: enrolledCount,
        Reports: reportsCount
      };
    });

    return chartPoints;
  }

  return [];
};

/**
 * Get recent activity feed (last 5 items across enrollments and reports)
 */
export const getRecentActivity = (datasets = {}, period = null) => {
  const patients = datasets.patients || getStoredItem(STORAGE_KEYS.PATIENTS, []);
  const reports = datasets.reports || getStoredItem(STORAGE_KEYS.REPORTS, []);

  const items = [];

  patients.forEach(p => {
    if (!period || isDateInPeriod(p.enrollmentDate, period)) {
      items.push({
        id: `act-p-${p.id}`,
        type: 'enrollment',
        title: `Patient Enrolled: ${p.name}`,
        subtitle: `ID: ${p.patientCode} • Tests: ${(p.testsRequested || []).slice(0, 2).join(', ')}${(p.testsRequested || []).length > 2 ? '...' : ''}`,
        timestamp: p.enrollmentDate,
        status: p.status,
        badge: p.status === 'Completed' ? 'Completed' : 'Pending'
      });
    }
  });

  reports.forEach(r => {
    if (!period || isDateInPeriod(r.generatedDate, period)) {
      items.push({
        id: `act-r-${r.id}`,
        type: 'report',
        title: `Report Generated: ${r.reportCode}`,
        subtitle: `Patient: ${r.patientName} (${r.patientCode}) • ${r.tests.length} tests evaluated`,
        timestamp: r.generatedDate,
        status: 'Report Ready',
        badge: 'Report'
      });
    }
  });

  // Sort descending by timestamp
  items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return items.slice(0, 5);
};
