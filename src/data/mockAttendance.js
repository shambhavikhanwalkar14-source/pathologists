// src/data/mockAttendance.js

const now = new Date();

const formatDateYMD = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const staffMembers = [
  { name: 'Dr. Sarah Mitchell', role: 'Pathologist' },
  { name: 'John Davis', role: 'Senior Lab Technician' },
  { name: 'Rachel Kim', role: 'Phlebotomist' },
  { name: 'Lisa Anderson', role: 'Lab Assistant' }
];

export const generateInitialAttendance = () => {
  const records = [];
  let recordId = 1;

  // Generate 30 days of attendance ending today (day 0)
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = formatDateYMD(d);
    const dayOfWeek = d.getDay(); // 0 is Sunday

    if (dayOfWeek === 0) {
      // Sunday - skip or skeletal emergency staff
      continue;
    }

    if (i === 0) {
      // TODAY: Staff are currently checked in (present) across shifts
      records.push({
        id: `ATT-${String(recordId++).padStart(4, '0')}`,
        staffName: 'Dr. Sarah Mitchell',
        role: 'Pathologist',
        shift: 'Day Shift',
        date: dateStr,
        checkIn: '08:30 AM',
        checkOut: null,
        totalHours: null,
        status: 'Present (On Duty)'
      });

      records.push({
        id: `ATT-${String(recordId++).padStart(4, '0')}`,
        staffName: 'John Davis',
        role: 'Senior Lab Technician',
        shift: 'Day Shift',
        date: dateStr,
        checkIn: '08:00 AM',
        checkOut: null,
        totalHours: null,
        status: 'Present (On Duty)'
      });

      records.push({
        id: `ATT-${String(recordId++).padStart(4, '0')}`,
        staffName: 'Rachel Kim',
        role: 'Phlebotomist',
        shift: 'Afternoon Shift',
        date: dateStr,
        checkIn: '02:00 PM',
        checkOut: null,
        totalHours: null,
        status: 'Present (On Duty)'
      });

      records.push({
        id: `ATT-${String(recordId++).padStart(4, '0')}`,
        staffName: 'Lisa Anderson',
        role: 'Lab Assistant',
        shift: 'Evening/Night Shift',
        date: dateStr,
        checkIn: '08:00 PM',
        checkOut: null,
        totalHours: null,
        status: 'Present (On Duty)'
      });
    } else {
      // Past days: Full day shift with checkout across shifts
      const checkInHour = i % 7 === 3 ? 9 : 8; // Some late arrivals (after 9:00)
      const checkInMin = (i * 7) % 45;
      const inTimeStr = `${String(checkInHour).padStart(2, '0')}:${String(checkInMin).padStart(2, '0')} AM`;
      
      const outMin = (i * 11) % 50;
      const outTimeStr = `05:${String(outMin).padStart(2, '0')} PM`;
      const totalH = Number((8.5 + ((i % 5) * 0.2)).toFixed(1));

      // Pathologist: primarily Day Shift with occasional on-call Night Shift
      const pathologistShift = i % 6 === 0 ? 'Evening/Night Shift' : 'Day Shift';
      records.push({
        id: `ATT-${String(recordId++).padStart(4, '0')}`,
        staffName: 'Dr. Sarah Mitchell',
        role: 'Pathologist',
        shift: pathologistShift,
        date: dateStr,
        checkIn: pathologistShift === 'Evening/Night Shift' ? '08:00 PM' : inTimeStr,
        checkOut: pathologistShift === 'Evening/Night Shift' ? '06:00 AM' : outTimeStr,
        totalHours: pathologistShift === 'Evening/Night Shift' ? 10.0 : totalH,
        status: checkInHour >= 9 && pathologistShift === 'Day Shift' ? 'Late' : 'Completed'
      });

      // Lab Technician: rotates Day Shift and Afternoon Shift
      const techShift = i % 3 === 1 ? 'Afternoon Shift' : 'Day Shift';
      records.push({
        id: `ATT-${String(recordId++).padStart(4, '0')}`,
        staffName: 'John Davis',
        role: 'Senior Lab Technician',
        shift: techShift,
        date: dateStr,
        checkIn: techShift === 'Afternoon Shift' ? '02:00 PM' : '08:00 AM',
        checkOut: techShift === 'Afternoon Shift' ? '10:00 PM' : '05:00 PM',
        totalHours: techShift === 'Afternoon Shift' ? 8.0 : 9.0,
        status: 'Completed'
      });

      // Phlebotomist: rotates Day Shift and Afternoon Shift
      const phlebShift = i % 2 === 0 ? 'Day Shift' : 'Afternoon Shift';
      records.push({
        id: `ATT-${String(recordId++).padStart(4, '0')}`,
        staffName: 'Rachel Kim',
        role: 'Phlebotomist',
        shift: phlebShift,
        date: dateStr,
        checkIn: phlebShift === 'Afternoon Shift' ? '01:30 PM' : '08:15 AM',
        checkOut: phlebShift === 'Afternoon Shift' ? '08:30 PM' : '04:45 PM',
        totalHours: phlebShift === 'Afternoon Shift' ? 7.0 : 8.5,
        status: 'Completed'
      });

      // Lab Assistant: rotates Afternoon and Evening/Night Shift
      const assistantShift = i % 4 === 2 ? 'Evening/Night Shift' : 'Afternoon Shift';
      records.push({
        id: `ATT-${String(recordId++).padStart(4, '0')}`,
        staffName: 'Lisa Anderson',
        role: 'Lab Assistant',
        shift: assistantShift,
        date: dateStr,
        checkIn: assistantShift === 'Evening/Night Shift' ? '08:00 PM' : '02:00 PM',
        checkOut: assistantShift === 'Evening/Night Shift' ? '04:00 AM' : '09:00 PM',
        totalHours: assistantShift === 'Evening/Night Shift' ? 8.0 : 7.0,
        status: 'Completed'
      });
    }
  }

  return records;
};

export const initialMockAttendance = generateInitialAttendance();
export const mockStaffList = staffMembers;
