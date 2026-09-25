// src/pages/Attendance.jsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  Clock,
  CheckCircle2,
  LogOut,
  Users,
  AlertCircle,
  Timer,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { useAuth } from '../hooks/useAuth';
import { useAppData } from '../hooks/useAppData';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { StatCard } from '../components/StatCard';
import { DataTable } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { mockStaffList } from '../data/mockAttendance';
import { getMonthlyAttendanceSummary } from '../services/attendanceService';

export const Attendance = () => {
  const { user } = useAuth();
  const { attendance, markCheckIn, markCheckOut } = useAppData();

  // Live Clock
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Formatted date string for today e.g. "2026-09-24"
  const todayDateStr = useMemo(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  // Selected staff member for action & summary
  const pathologistName = user?.name?.replace(/,.*$/, '') || 'Dr. Sarah Mitchell';
  const [selectedStaff, setSelectedStaff] = useState(pathologistName);
  const [selectedShift, setSelectedShift] = useState('Day Shift');
  const [summaryStaffFilter, setSummaryStaffFilter] = useState('All');
  const [tableDateFilter, setTableDateFilter] = useState('');
  const [tableShiftFilter, setTableShiftFilter] = useState('All');

  // Find attendance record for selected staff today
  const selectedStaffTodayRecord = useMemo(() => {
    return attendance.find(
      (a) => a.staffName.toLowerCase() === selectedStaff.toLowerCase() && a.date === todayDateStr
    );
  }, [attendance, selectedStaff, todayDateStr]);

  // Is selected staff currently checked in / checked out?
  const isCheckedIn = !!selectedStaffTodayRecord;
  const isCheckedOut = !!selectedStaffTodayRecord?.checkOut;

  // Monthly summary metrics & chart
  const summary = useMemo(() => {
    return getMonthlyAttendanceSummary(attendance, summaryStaffFilter);
  }, [attendance, summaryStaffFilter]);

  // Helper to determine active shift
  const isShiftActive = (row, shiftType) => {
    if (row.shift) {
      return row.shift.toLowerCase().includes(shiftType.toLowerCase());
    }
    const inTime = row.checkIn || '';
    if (!inTime) return shiftType === 'Day';
    if (inTime.includes('PM')) {
      const [h] = inTime.split(':').map(Number);
      if (h === 12 || (h >= 1 && h < 7)) {
        return shiftType === 'Afternoon';
      }
      return shiftType === 'Night' || shiftType === 'Evening';
    }
    return shiftType === 'Day';
  };

  // Handle Check-in
  const handleCheckIn = async () => {
    try {
      const staffObj = mockStaffList.find((s) => s.name === selectedStaff);
      await markCheckIn(selectedStaff, staffObj ? staffObj.role : 'Lab Staff', selectedShift);
    } catch {
      // Error handled with toast inside context
    }
  };

  // Handle Check-out
  const handleCheckOut = async () => {
    try {
      await markCheckOut(selectedStaff);
    } catch {
      // Error handled with toast inside context
    }
  };

  // Columns for Attendance Log Table with 3 Shift Columns
  const tableColumns = [
    {
      key: 'staffName',
      title: 'Staff Member',
      sortable: true,
      render: (val, row) => (
        <div>
          <div className="font-semibold text-slate-800 text-sm whitespace-nowrap">{val}</div>
          <div className="text-xs text-slate-400 whitespace-nowrap">{row.role || 'Laboratory Staff'}</div>
        </div>
      )
    },
    {
      key: 'date',
      title: 'Shift Date',
      sortable: true,
      render: (val) => {
        const d = new Date(val);
        return (
          <span className="text-xs font-medium text-slate-700 whitespace-nowrap">
            {d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        );
      }
    },
    {
      key: 'dayShift',
      title: 'Day Shift',
      sortable: false,
      render: (_, row) => {
        const active = isShiftActive(row, 'Day');
        if (!active) {
          return <span className="text-slate-300 font-mono text-xs pl-2">—</span>;
        }
        return (
          <div className="flex flex-col gap-0.5">
            <span className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 w-fit whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              {row.checkIn || '08:00 AM'}{row.checkOut ? ` – ${row.checkOut}` : ' (Active)'}
            </span>
            <span className="text-[10px] text-slate-400 whitespace-nowrap">08:00 AM – 02:00 PM</span>
          </div>
        );
      }
    },
    {
      key: 'afternoonShift',
      title: 'Afternoon Shift',
      sortable: false,
      render: (_, row) => {
        const active = isShiftActive(row, 'Afternoon');
        if (!active) {
          return <span className="text-slate-300 font-mono text-xs pl-2">—</span>;
        }
        return (
          <div className="flex flex-col gap-0.5">
            <span className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 w-fit whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              {row.checkIn || '02:00 PM'}{row.checkOut ? ` – ${row.checkOut}` : ' (Active)'}
            </span>
            <span className="text-[10px] text-slate-400 whitespace-nowrap">02:00 PM – 08:00 PM</span>
          </div>
        );
      }
    },
    {
      key: 'nightShift',
      title: 'Evening/Night Shift',
      sortable: false,
      render: (_, row) => {
        const active = isShiftActive(row, 'Night') || isShiftActive(row, 'Evening');
        if (!active) {
          return <span className="text-slate-300 font-mono text-xs pl-2">—</span>;
        }
        return (
          <div className="flex flex-col gap-0.5">
            <span className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-indigo-800 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-200 w-fit whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
              {row.checkIn || '08:00 PM'}{row.checkOut ? ` – ${row.checkOut}` : ' (On-Duty)'}
            </span>
            <span className="text-[10px] text-slate-400 whitespace-nowrap">08:00 PM – 08:00 AM</span>
          </div>
        );
      }
    },
    {
      key: 'totalHours',
      title: 'Total Hours',
      sortable: true,
      render: (val, row) => (
        <span className="font-mono text-xs font-bold text-slate-800 whitespace-nowrap">
          {val ? `${val} hrs` : row.checkIn ? 'In Progress' : '—'}
        </span>
      )
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      render: (val) => <StatusBadge status={val} />
    }
  ];

  // Filter attendance data for table
  const filteredAttendanceData = useMemo(() => {
    let list = [...attendance];
    if (tableDateFilter) {
      list = list.filter((r) => r.date === tableDateFilter);
    }
    if (tableShiftFilter !== 'All') {
      list = list.filter((r) => isShiftActive(r, tableShiftFilter));
    }
    return list;
  }, [attendance, tableDateFilter, tableShiftFilter]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header & Live Clock Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Clock className="w-6 h-6 text-teal-600" />
            <span>Laboratory Staff Attendance & Duty Clock</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time biometric attendance punch, duty hours log, and monthly roster analytics
          </p>
        </div>

        {/* Live Clock Card */}
        <div className="flex items-center gap-4 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-md border border-slate-800">
          <div className="p-2 rounded-lg bg-teal-500/20 text-teal-400">
            <Timer className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-mono font-bold tracking-wider text-teal-300">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            <div className="text-[11px] text-slate-400 font-medium">
              {currentTime.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
          </div>
        </div>
      </div>

      {/* CHECK-IN & CHECK-OUT ACTION STATION */}
      <Card
        title="Biometric Station: Shift Punch"
        subtitle="Manage check-in and check-out for pathologist and laboratory staff across shifts"
        headerClassName="bg-slate-50/50"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
          {/* Staff Member Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="staff-selector">
              Select Staff Member:
            </label>
            <select
              id="staff-selector"
              value={selectedStaff}
              onChange={(e) => setSelectedStaff(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            >
              <option value="Dr. Sarah Mitchell">Dr. Sarah Mitchell (Pathologist - Logged In)</option>
              {mockStaffList
                .filter((s) => s.name !== 'Dr. Sarah Mitchell')
                .map((s) => (
                  <option key={s.name} value={s.name}>
                    {s.name} ({s.role})
                  </option>
                ))}
            </select>
            <p className="text-[11px] text-slate-400 mt-1">
              Double check-in guarded automatically.
            </p>
          </div>

          {/* Shift Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="shift-selector">
              Select Duty Shift:
            </label>
            <select
              id="shift-selector"
              value={selectedShift}
              onChange={(e) => setSelectedShift(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            >
              <option value="Day Shift">Day Shift (08:00 AM – 02:00 PM)</option>
              <option value="Afternoon Shift">Afternoon Shift (02:00 PM – 08:00 PM)</option>
              <option value="Evening/Night Shift">Evening/Night Shift (08:00 PM – 08:00 AM)</option>
            </select>
            <p className="text-[11px] text-slate-400 mt-1">
              Logged to the corresponding shift column.
            </p>
          </div>

          {/* Today's Status for Selected Staff */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <span className="font-semibold text-slate-500 block mb-1">Today's Duty Status:</span>
            {selectedStaffTodayRecord ? (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800 text-sm truncate">{selectedStaff}</span>
                  <StatusBadge status={selectedStaffTodayRecord.status} />
                </div>
                <div className="text-slate-600">
                  <span>Shift: </span>
                  <strong className="text-slate-800">{selectedStaffTodayRecord.shift || 'Day Shift'}</strong>
                </div>
                <div className="text-slate-600">
                  <span>In: </span>
                  <strong className="text-teal-700 font-mono">{selectedStaffTodayRecord.checkIn}</strong>
                  {selectedStaffTodayRecord.checkOut && (
                    <span> • Out: <strong className="text-slate-700 font-mono">{selectedStaffTodayRecord.checkOut}</strong></span>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-slate-500">
                <p className="font-medium text-slate-700">{selectedStaff} not checked in today.</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Click "Check In" to record arrival.</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2.5 justify-end">
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleCheckIn}
              disabled={isCheckedIn}
              leftIcon={CheckCircle2}
              className="flex-1 w-full"
              id="attendance-checkin-btn"
            >
              {isCheckedIn ? 'Checked In' : 'Check In'}
            </Button>

            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={handleCheckOut}
              disabled={!isCheckedIn || isCheckedOut}
              leftIcon={LogOut}
              className="flex-1 w-full border-slate-300 text-slate-700 hover:bg-slate-100"
              id="attendance-checkout-btn"
            >
              {isCheckedOut ? 'Checked Out' : 'Check Out'}
            </Button>
          </div>
        </div>
      </Card>

      {/* MONTHLY SUMMARY METRICS & CHART */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-teal-600" />
              <span>Monthly Attendance Summary (Current Month)</span>
            </h3>
            <p className="text-xs text-slate-500">
              Aggregated work hours, shift attendance, and punctuality
            </p>
          </div>

          {/* Staff Filter Dropdown for Monthly Summary */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <label className="text-xs font-semibold text-slate-500" htmlFor="filter-staff-summary">
              Filter:
            </label>
            <select
              id="filter-staff-summary"
              value={summaryStaffFilter}
              onChange={(e) => setSummaryStaffFilter(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 shadow-2xs focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              <option value="All">All Staff Combined</option>
              <option value="Dr. Sarah Mitchell">Dr. Sarah Mitchell (Pathologist)</option>
              <option value="John Davis">John Davis (Lab Tech)</option>
              <option value="Rachel Kim">Rachel Kim (Phlebotomist)</option>
              <option value="Lisa Anderson">Lisa Anderson (Assistant)</option>
            </select>
          </div>
        </div>

        {/* 3 Summary Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Days Present"
            value={summary.daysPresent}
            subtitle="Working days registered this month"
            icon={UserCheck}
            colorScheme="teal"
          />
          <StatCard
            title="Total Working Hours"
            value={`${summary.totalHours} hrs`}
            subtitle="Cumulative verified duty time"
            icon={Clock}
            colorScheme="blue"
          />
          <StatCard
            title="Late Arrivals"
            value={summary.lateArrivals}
            subtitle="Punches after standard opening shift (9:15 AM)"
            icon={AlertCircle}
            colorScheme={summary.lateArrivals > 0 ? 'amber' : 'emerald'}
          />
        </div>

        {/* Monthly Attendance Hours Chart */}
        <Card
          title="Daily Shift Hours Distribution"
          subtitle="Hours logged per working day across current month"
          headerClassName="bg-slate-50/50"
        >
          <div className="h-64 w-full pt-2">
            {summary.chartData && summary.chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={summary.chartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="hoursGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="shortDate"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickLine={false}
                    axisLine={{ stroke: '#cbd5e1' }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '0.75rem',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                      fontSize: '12px'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="hours"
                    name="Logged Hours"
                    stroke="#0d9488"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#hoursGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                No attendance hours recorded for this period.
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* ATTENDANCE LOG TABLE */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Users className="w-5 h-5 text-teal-600" />
              <span>Full Attendance Logs (Past 30 Days)</span>
            </h3>
            <p className="text-xs text-slate-500">
              {filteredAttendanceData.length} records • Filter by date or search staff name
            </p>
          </div>
        </div>

        <DataTable
          id="attendance-data-table"
          columns={tableColumns}
          data={filteredAttendanceData}
          searchPlaceholder="Search staff by name or role..."
          searchKeys={['staffName', 'role', 'status']}
          initialSortKey="date"
          initialSortOrder="desc"
          pageSize={10}
          emptyMessage="No attendance records found."
          customFilters={
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={tableShiftFilter}
                onChange={(e) => setTableShiftFilter(e.target.value)}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 shadow-2xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                title="Filter by shift"
              >
                <option value="All">All Shifts</option>
                <option value="Day">Day Shift</option>
                <option value="Afternoon">Afternoon Shift</option>
                <option value="Night">Evening/Night Shift</option>
              </select>

              <input
                type="date"
                value={tableDateFilter}
                onChange={(e) => setTableDateFilter(e.target.value)}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 shadow-2xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                title="Filter by specific date"
              />
              {(tableDateFilter || tableShiftFilter !== 'All') && (
                <button
                  type="button"
                  onClick={() => {
                    setTableDateFilter('');
                    setTableShiftFilter('All');
                  }}
                  className="text-xs text-teal-600 hover:text-teal-700 font-semibold px-1"
                >
                  Reset Filters
                </button>
              )}
            </div>
          }
        />
      </div>
    </div>
  );
};
