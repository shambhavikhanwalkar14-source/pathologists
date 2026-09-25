// src/pages/Dashboard.jsx
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  FileCheck,
  Clock,
  UserCheck,
  UserPlus,
  FilePlus,
  ArrowRight,
  Activity
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { useAuth } from '../hooks/useAuth';
import { useAppData } from '../hooks/useAppData';
import { PeriodDropdown } from '../components/PeriodDropdown';
import { StatCard } from '../components/StatCard';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { StatusBadge } from '../components/StatusBadge';
import { getDashboardStats, getChartData, getRecentActivity } from '../services/dashboardService';

export const Dashboard = () => {
  const { user } = useAuth();
  const { patients, reports, attendance } = useAppData();
  const navigate = useNavigate();

  // Active period state (today, yesterday, month, year)
  const [selectedPeriod, setSelectedPeriod] = useState('today');

  // Reactive stats calculated from service functions
  const stats = useMemo(() => {
    return getDashboardStats(selectedPeriod, { patients, reports, attendance });
  }, [selectedPeriod, patients, reports, attendance]);

  // Reactive chart data for the period
  const chartData = useMemo(() => {
    return getChartData(selectedPeriod, { patients, reports });
  }, [selectedPeriod, patients, reports]);

  // Recent activity list
  const recentActivities = useMemo(() => {
    return getRecentActivity({ patients, reports }, selectedPeriod);
  }, [selectedPeriod, patients, reports]);

  // Pathologist name extraction
  const pathologistDisplayName = user?.name || 'Dr. Sarah Mitchell';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Welcome Bar & Period Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse" />
            <span className="text-xs font-semibold text-teal-700 uppercase tracking-wider">
              Diagnostic Session Active
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1 tracking-tight">
            Hello, {pathologistDisplayName.startsWith('Dr.') ? pathologistDisplayName : `Dr. ${pathologistDisplayName}`}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Pathology Laboratory Operations & Diagnostic Analytics
          </p>
        </div>

        {/* Period Dropdown */}
        <div className="flex items-center gap-3">
          <PeriodDropdown
            value={selectedPeriod}
            onChange={(newPeriod) => setSelectedPeriod(newPeriod)}
            id="dashboard-period-dropdown"
          />
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          id="stat-patients-enrolled"
          title="Patients Enrolled"
          value={stats.patientsEnrolled}
          subtitle="Total intake for selected period"
          icon={Users}
          colorScheme="teal"
          onClick={() => navigate('/enroll')}
        />
        <StatCard
          id="stat-reports-generated"
          title="Reports Generated"
          value={stats.reportsGenerated}
          subtitle="Signed and validated"
          icon={FileCheck}
          colorScheme="emerald"
          onClick={() => navigate('/reports')}
        />
        <StatCard
          id="stat-pending-reports"
          title="Pending Reports"
          value={stats.pendingReports}
          subtitle="Awaiting laboratory sign-off"
          icon={Clock}
          colorScheme="amber"
          onClick={() => navigate('/reports')}
        />
        <StatCard
          id="stat-staff-present"
          title="Staff Present"
          value={stats.staffPresent}
          subtitle="Active duty roster"
          icon={UserCheck}
          colorScheme="blue"
          onClick={() => navigate('/attendance')}
        />
      </div>

      {/* Quick Action Banner */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-gradient-to-r from-teal-800 via-teal-700 to-teal-900 text-white shadow-md shadow-teal-900/10">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="p-2.5 rounded-lg bg-white/10 text-teal-200 shrink-0 hidden sm:block">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm tracking-tight">Need to intake a sample or sign a pending report?</h4>
            <p className="text-xs text-teal-100/80 mt-0.5">Quickly jump into clinical workflows without navigating away.</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Button
            id="quick-enroll-btn"
            variant="outline"
            size="sm"
            onClick={() => navigate('/enroll')}
            leftIcon={UserPlus}
            className="flex-1 sm:flex-none bg-white text-teal-900 hover:bg-teal-50 border-white font-semibold"
          >
            Enroll Patient
          </Button>
          <Button
            id="quick-report-btn"
            variant="primary"
            size="sm"
            onClick={() => navigate('/reports?action=new')}
            leftIcon={FilePlus}
            className="flex-1 sm:flex-none bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold"
          >
            Create Report
          </Button>
        </div>
      </div>

      {/* Analytics Chart & Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recharts Chart: Enrollments vs Reports */}
        <Card
          id="dashboard-analytics-card"
          className="lg:col-span-2 shadow-xs"
          title="Clinical Diagnostic Volume"
          subtitle={`Enrollments vs Completed Reports (${
            selectedPeriod === 'today'
              ? 'Hourly Today'
              : selectedPeriod === 'yesterday'
              ? 'Hourly Yesterday'
              : selectedPeriod === 'month'
              ? 'Daily this Month'
              : 'Monthly this Year'
          })`}
          headerClassName="bg-slate-50/50"
        >
          <div className="h-72 w-full pt-2">
            {chartData && chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="time"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickLine={false}
                    axisLine={{ stroke: '#cbd5e1' }}
                  />
                  <YAxis
                    allowDecimals={false}
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
                    cursor={{ fill: '#f1f5f9' }}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    wrapperStyle={{ paddingBottom: 15, fontSize: 12 }}
                  />
                  <Bar
                    dataKey="Enrollments"
                    name="Patients Enrolled"
                    fill="#0d9488"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                  <Bar
                    dataKey="Reports"
                    name="Reports Signed"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                No volumetric activity recorded in this period.
              </div>
            )}
          </div>
        </Card>

        {/* Recent Activity List */}
        <Card
          id="dashboard-activity-card"
          className="shadow-xs flex flex-col justify-between"
          title="Recent Laboratory Activity"
          subtitle="Latest enrollments & reports"
          headerClassName="bg-slate-50/50"
        >
          <div className="divide-y divide-slate-100">
            {recentActivities.length > 0 ? (
              recentActivities.map((act) => {
                const dateObj = new Date(act.timestamp);
                const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const dateStr = dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' });

                return (
                  <div key={act.id} className="py-3 first:pt-0 last:pb-0 flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        act.type === 'report'
                          ? 'bg-blue-50 text-blue-600 border border-blue-200/60'
                          : 'bg-teal-50 text-teal-600 border border-teal-200/60'
                      }`}
                    >
                      {act.type === 'report' ? (
                        <FileCheck className="w-4 h-4" />
                      ) : (
                        <UserPlus className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs font-semibold text-slate-800 truncate">
                          {act.title}
                        </p>
                        <span className="text-[10px] text-slate-400 font-medium shrink-0">
                          {dateStr} {timeStr}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {act.subtitle}
                      </p>
                      <div className="mt-1">
                        <StatusBadge status={act.badge} />
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                No activity records found for this period.
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4">
            <button
              type="button"
              onClick={() => navigate('/reports')}
              className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-800 py-1"
            >
              <span>View All Reports & History</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};
