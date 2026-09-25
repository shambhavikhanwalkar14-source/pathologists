// src/services/attendanceService.js
import { STORAGE_KEYS, getStoredItem, setStoredItem } from './storage';

const getTodayDateStr = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatTimeAMPM = (date) => {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 becomes 12
  const strMinutes = minutes < 10 ? '0' + minutes : minutes;
  const strHours = hours < 10 ? '0' + hours : hours;
  return `${strHours}:${strMinutes} ${ampm}`;
};

/**
 * Fetch attendance logs with optional date filter and search
 */
export const getAttendance = async ({ dateFilter = '', staffQuery = '', sortBy = 'date', sortOrder = 'desc' } = {}) => {
  const records = getStoredItem(STORAGE_KEYS.ATTENDANCE, []);
  let filtered = [...records];

  if (dateFilter) {
    filtered = filtered.filter(r => r.date === dateFilter);
  }

  if (staffQuery && staffQuery.trim()) {
    const q = staffQuery.trim().toLowerCase();
    filtered = filtered.filter(r =>
      r.staffName.toLowerCase().includes(q) ||
      (r.role && r.role.toLowerCase().includes(q))
    );
  }

  filtered.sort((a, b) => {
    let aVal = a[sortBy];
    let bVal = b[sortBy];

    if (sortBy === 'date') {
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
 * Check-in staff member for today
 */
export const checkIn = async (staffName, role = 'Lab Staff', shift = 'Day Shift') => {
  const records = getStoredItem(STORAGE_KEYS.ATTENDANCE, []);
  const todayStr = getTodayDateStr();

  // Find existing record for today
  const existingToday = records.find(r => r.staffName === staffName && r.date === todayStr);

  if (existingToday) {
    throw new Error(`Double check-in prevented: ${staffName} is already checked in for today at ${existingToday.checkIn}.`);
  }

  const now = new Date();
  const checkInTime = formatTimeAMPM(now);
  const isLate = shift === 'Day Shift' && now.getHours() >= 9 && now.getMinutes() > 15; // after 9:15 AM is late for morning shift

  const newRecord = {
    id: `ATT-${String(Date.now()).slice(-4)}`,
    staffName,
    role,
    shift,
    date: todayStr,
    checkIn: checkInTime,
    checkOut: null,
    totalHours: null,
    status: isLate ? 'Late (On Duty)' : 'Present (On Duty)'
  };

  const updatedRecords = [newRecord, ...records];
  setStoredItem(STORAGE_KEYS.ATTENDANCE, updatedRecords);
  return newRecord;
};

/**
 * Check-out staff member for today
 */
export const checkOut = async (staffName) => {
  const records = getStoredItem(STORAGE_KEYS.ATTENDANCE, []);
  const todayStr = getTodayDateStr();

  const recordIndex = records.findIndex(r => r.staffName === staffName && r.date === todayStr);

  if (recordIndex === -1) {
    throw new Error(`Cannot check out without check-in: ${staffName} has not checked in today.`);
  }

  if (records[recordIndex].checkOut) {
    throw new Error(`${staffName} is already checked out today at ${records[recordIndex].checkOut}.`);
  }

  const now = new Date();
  const checkOutTime = formatTimeAMPM(now);

  // Compute total hours
  // Parse check-in time string e.g. "08:30 AM"
  let totalHours = 8.0; // fallback default
  try {
    const [timePart, meridiem] = records[recordIndex].checkIn.split(' ');
    let [inH, inM] = timePart.split(':').map(Number);
    if (meridiem === 'PM' && inH < 12) inH += 12;
    if (meridiem === 'AM' && inH === 12) inH = 0;

    const inDate = new Date();
    inDate.setHours(inH, inM, 0, 0);

    const diffMs = now - inDate;
    const diffHours = diffMs / (1000 * 60 * 60);
    totalHours = Math.max(0.1, Number(diffHours.toFixed(1)));
  } catch (err) {
    console.error('Error calculating hours:', err);
  }

  records[recordIndex] = {
    ...records[recordIndex],
    checkOut: checkOutTime,
    totalHours,
    status: 'Completed'
  };

  setStoredItem(STORAGE_KEYS.ATTENDANCE, records);
  return records[recordIndex];
};

/**
 * Get monthly summary metrics & chart for attendance
 */
export const getMonthlyAttendanceSummary = (records, selectedStaffName = null) => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Filter records to this month and optionally specific staff
  const monthRecords = records.filter(r => {
    const rDate = new Date(r.date);
    const matchesMonth = rDate.getMonth() === currentMonth && rDate.getFullYear() === currentYear;
    if (!matchesMonth) return false;
    if (selectedStaffName && selectedStaffName !== 'All') {
      return r.staffName === selectedStaffName;
    }
    return true;
  });

  // Calculate unique days present
  const uniqueDates = new Set(monthRecords.map(r => r.date));
  const daysPresent = uniqueDates.size;

  // Total working hours
  const totalHours = monthRecords.reduce((acc, curr) => acc + (Number(curr.totalHours) || 0), 0);

  // Late arrivals count
  const lateArrivals = monthRecords.filter(r => {
    return (r.status && r.status.toLowerCase().includes('late')) ||
      (r.checkIn && (r.checkIn.startsWith('09:') || r.checkIn.startsWith('10:')));
  }).length;

  // Chart data: daily attendance or weekly distribution
  // Let's group hours by day of month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const chartData = [];

  for (let day = 1; day <= Math.min(daysInMonth, now.getDate()); day++) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayRecords = monthRecords.filter(r => r.date === dateStr);
    const dayHours = dayRecords.reduce((sum, r) => sum + (Number(r.totalHours) || 0), 0);
    const staffCount = dayRecords.length;

    chartData.push({
      day: `Day ${day}`,
      shortDate: `${day} Sep`,
      hours: Number(dayHours.toFixed(1)),
      staffPresent: staffCount
    });
  }

  return {
    daysPresent,
    totalHours: Number(totalHours.toFixed(1)),
    lateArrivals,
    chartData
  };
};
