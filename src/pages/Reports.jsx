// src/pages/Reports.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FileText,
  Printer,
  Plus,
  Trash2,
  Search,
  User,
  Edit3,
  Microscope,
  Save,
  SendHorizontal,
  CheckCheck
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useAppData } from '../hooks/useAppData';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { FormInput } from '../components/FormInput';
import { Modal } from '../components/Modal';
import { DataTable } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { calculateFlag } from '../services/reportService';

export const Reports = () => {
  const { user } = useAuth();
  const {
    patients,
    reports,
    testTemplates,
    saveNewReport,
    sendReportToReceptionist,
    updateExistingReport
  } = useAppData();

  const [searchParams] = useSearchParams();

  // Active view tab: 'new' (Report Entry) or 'history' (Report History)
  const [activeTab, setActiveTab] = useState('new');

  // Selected patient for new report
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [patientSearch, setPatientSearch] = useState('');

  // Report fields
  const [testRows, setTestRows] = useState([]);
  const [remarks, setRemarks] = useState(
    'Parameters clinically evaluated. Values within expected biological variations unless specifically flagged.'
  );
  const pathologistName = user?.name || 'Dr. Sarah Mitchell, MD (Path)';
  const signatureText = user?.signatureText || 'Dr. Sarah Mitchell, M.D. (Pathology)';

  // Modal states
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [actionType, setActionType] = useState('save'); // 'save' | 'send'
  const [printableReport, setPrintableReport] = useState(null);
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Edit existing report modal state
  const [editingReport, setEditingReport] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Selected patient details
  const selectedPatient = useMemo(() => {
    return patients.find((p) => p.id === selectedPatientId || p.patientCode === selectedPatientId) || null;
  }, [patients, selectedPatientId]);

  // Handle URL query parameters e.g. ?action=new&patientId=PT-0003 or ?viewPatient=PT-0001
  useEffect(() => {
    const patientIdParam = searchParams.get('patientId');
    const viewPatientParam = searchParams.get('viewPatient');
    const viewReportParam = searchParams.get('viewReport');

    if (patientIdParam) {
      setSelectedPatientId(patientIdParam);
      setActiveTab('new');
    } else if (viewPatientParam) {
      const existingReport = reports.find(
        (r) => r.patientId === viewPatientParam || r.patientCode === viewPatientParam
      );
      if (existingReport) {
        setPrintableReport(existingReport);
        setShowPrintModal(true);
        setActiveTab('history');
      } else {
        setSelectedPatientId(viewPatientParam);
        setActiveTab('new');
      }
    } else if (viewReportParam) {
      const rep = reports.find((r) => r.id === viewReportParam || r.reportCode === viewReportParam);
      if (rep) {
        setPrintableReport(rep);
        setShowPrintModal(true);
        setActiveTab('history');
      }
    }
  }, [searchParams, reports]);

  // When patient selection changes, auto-populate test rows based on patient's testsRequested
  useEffect(() => {
    if (!selectedPatient) {
      setTestRows([]);
      return;
    }

    const requested = selectedPatient.testsRequested || [];
    const rows = requested.map((testName) => {
      const tpl = testTemplates.find((t) => t.name === testName);
      return {
        testName,
        result: '',
        unit: tpl ? tpl.unit : '',
        normalRange: tpl ? tpl.normalRangeText : '',
        normalRangeLow: tpl ? tpl.normalRangeLow : null,
        normalRangeHigh: tpl ? tpl.normalRangeHigh : null,
        flag: 'Normal'
      };
    });

    // If no requested tests found, add at least one default row
    if (rows.length === 0) {
      const firstTpl = testTemplates[0];
      rows.push({
        testName: firstTpl.name,
        result: '',
        unit: firstTpl.unit,
        normalRange: firstTpl.normalRangeText,
        normalRangeLow: firstTpl.normalRangeLow,
        normalRangeHigh: firstTpl.normalRangeHigh,
        flag: 'Normal'
      });
    }

    setTestRows(rows);
  }, [selectedPatient, testTemplates]);

  // Update a specific test row
  const handleTestRowChange = (index, field, value) => {
    setTestRows((prev) => {
      const copy = [...prev];
      const row = { ...copy[index], [field]: value };

      if (field === 'testName') {
        const tpl = testTemplates.find((t) => t.name === value);
        if (tpl) {
          row.unit = tpl.unit;
          row.normalRange = tpl.normalRangeText;
          row.normalRangeLow = tpl.normalRangeLow;
          row.normalRangeHigh = tpl.normalRangeHigh;
          row.flag = calculateFlag(row.result, tpl.normalRangeLow, tpl.normalRangeHigh);
        }
      } else if (field === 'result') {
        row.flag = calculateFlag(value, row.normalRangeLow, row.normalRangeHigh);
      }

      copy[index] = row;
      return copy;
    });
  };

  // Add test row
  const handleAddRow = () => {
    const defaultTemplate = testTemplates[0];
    setTestRows((prev) => [
      ...prev,
      {
        testName: defaultTemplate.name,
        result: '',
        unit: defaultTemplate.unit,
        normalRange: defaultTemplate.normalRangeText,
        normalRangeLow: defaultTemplate.normalRangeLow,
        normalRangeHigh: defaultTemplate.normalRangeHigh,
        flag: 'Normal'
      }
    ]);
  };

  // Remove test row
  const handleRemoveRow = (index) => {
    if (testRows.length <= 1) return;
    setTestRows((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Save report
  const handleConfirmSave = async () => {
    if (!selectedPatient) return;
    setIsSaving(true);

    try {
      const isSend = actionType === 'send';
      const newRep = await saveNewReport({
        patientId: selectedPatient.id,
        patientCode: selectedPatient.patientCode,
        patientName: selectedPatient.name,
        tests: testRows.map((r) => ({
          testName: r.testName,
          result: r.result || 'Normal',
          unit: r.unit,
          normalRange: r.normalRange,
          flag: r.flag || 'Normal'
        })),
        remarks,
        pathologistName,
        signatureText,
        generatedDate: new Date().toISOString(),
        sentToReceptionist: isSend,
        status: isSend ? 'Sent to Reception' : 'Saved'
      });

      setShowConfirmModal(false);
      // Open print/PDF preview for the newly generated report
      setPrintableReport(newRep);
      setShowPrintModal(true);
      // Reset selection
      setSelectedPatientId('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  // Filtered patients for the patient dropdown selector (Pending first)
  const patientOptions = useMemo(() => {
    let list = [...patients];
    if (patientSearch.trim()) {
      const q = patientSearch.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.patientCode.toLowerCase().includes(q) ||
          p.mobile.includes(q)
      );
    }
    // Sort Pending first
    list.sort((a, b) => {
      if (a.status === 'Pending' && b.status !== 'Pending') return -1;
      if (a.status !== 'Pending' && b.status === 'Pending') return 1;
      return 0;
    });
    return list;
  }, [patients, patientSearch]);

  // Handle Print Action
  const handleTriggerPrint = () => {
    window.print();
  };

  // History Table Columns
  const historyColumns = [
    {
      key: 'reportCode',
      title: 'Report No.',
      sortable: true,
      render: (val) => (
        <span className="font-mono font-bold text-teal-800 text-xs px-2 py-0.5 rounded bg-teal-50 border border-teal-200">
          {val}
        </span>
      )
    },
    {
      key: 'patientName',
      title: 'Patient',
      sortable: true,
      render: (val, row) => (
        <div>
          <div className="font-semibold text-slate-800 text-sm">{val}</div>
          <div className="text-xs text-slate-400 font-mono">{row.patientCode}</div>
        </div>
      )
    },
    {
      key: 'tests',
      title: 'Evaluated Tests',
      sortable: false,
      render: (tests = []) => (
        <div className="flex flex-wrap gap-1 max-w-xs">
          {tests.slice(0, 2).map((t, i) => (
            <span
              key={i}
              className={`text-[11px] px-2 py-0.5 rounded font-medium ${
                t.flag === 'High' || t.flag === 'Low'
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {t.testName}
            </span>
          ))}
          {tests.length > 2 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 font-bold">
              +{tests.length - 2} more
            </span>
          )}
        </div>
      )
    },
    {
      key: 'generatedDate',
      title: 'Generated Date',
      sortable: true,
      render: (val) => {
        const d = new Date(val);
        return (
          <div className="text-xs text-slate-600">
            <div>{d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</div>
            <div className="text-[11px] text-slate-400">{d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
          </div>
        );
      }
    },
    {
      key: 'pathologistName',
      title: 'Pathologist',
      sortable: true,
      render: (val) => <span className="text-xs text-slate-700 font-medium">{val}</span>
    },
    {
      key: 'status',
      title: 'Delivery Status',
      sortable: true,
      render: (_, row) =>
        row.sentToReceptionist ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            <CheckCheck className="w-3 h-3 text-emerald-600" />
            Sent to Reception
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
            <Save className="w-3 h-3 text-slate-500" />
            Saved
          </span>
        )
    },
    {
      key: 'actions',
      title: 'Actions',
      sortable: false,
      render: (_, row) => (
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setPrintableReport(row);
              setShowPrintModal(true);
            }}
            leftIcon={Printer}
            className="text-xs py-1 px-2.5 text-teal-700 border-teal-200 hover:bg-teal-50"
            title="View & Print Report"
          >
            View / Print
          </Button>

          {!row.sentToReceptionist && (
            <Button
              variant="tealOutline"
              size="sm"
              onClick={async () => {
                await sendReportToReceptionist(row.id);
              }}
              leftIcon={SendHorizontal}
              className="text-xs py-1 px-2 text-teal-700 border-teal-300 hover:bg-teal-50"
              title="Send to Receptionist"
            >
              Send
            </Button>
          )}

          <button
            type="button"
            onClick={() => {
              setEditingReport({ ...row });
              setShowEditModal(true);
            }}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title="Edit Report"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-teal-600" />
            <span>Diagnostic Reports</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Pathologist sign-off, clinical impression, auto-flagging & PDF print generation
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="inline-flex rounded-xl bg-slate-200/70 p-1 border border-slate-200 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('new')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'new'
                ? 'bg-white text-teal-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            New Result Entry
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'history'
                ? 'bg-white text-teal-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Report History ({reports.length})
          </button>
        </div>
      </div>

      {activeTab === 'new' ? (
        <div className="space-y-6 no-print">
          {/* STEP 1: Search & Select Enrolled Patient */}
          <Card
            title="Step 1: Select Enrolled Patient"
            subtitle="Search by patient name, mobile, or accession number (PT-XXXX)"
            headerClassName="bg-slate-50/50"
          >
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={patientSearch}
                    onChange={(e) => setPatientSearch(e.target.value)}
                    placeholder="Type name, ID (e.g. PT-0003), or mobile to filter list..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>

                <div className="sm:w-80">
                  <select
                    id="select-enrolled-patient"
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium"
                  >
                    <option value="">-- Choose Patient from List --</option>
                    {patientOptions.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.status === 'Pending' ? '⏳ [Pending] ' : '✓ [Completed] '}
                        {p.patientCode} - {p.name} ({p.mobile})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Fast Pending Patient Chips */}
              <div className="flex items-center gap-2 flex-wrap pt-1 text-xs">
                <span className="font-semibold text-slate-500">Quick Select Pending:</span>
                {patients
                  .filter((p) => p.status === 'Pending')
                  .slice(0, 5)
                  .map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedPatientId(p.id)}
                      className={`px-2.5 py-1 rounded-lg border transition-all text-xs font-medium ${
                        selectedPatientId === p.id
                          ? 'bg-teal-600 text-white border-teal-600 font-semibold'
                          : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                      }`}
                    >
                      {p.patientCode}: {p.name}
                    </button>
                  ))}
              </div>
            </div>
          </Card>

          {/* STEP 2: AUTO-FILLED PATIENT INFO (READ-ONLY) */}
          {selectedPatient ? (
            <Card
              title="Step 2: Enrolled Patient Clinical Details"
              subtitle="All details auto-filled from enrollment record (read-only verification)"
              headerClassName="bg-teal-50/50 border-b border-teal-100/60"
            >
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Patient Accession ID</span>
                  <span className="font-mono font-bold text-teal-800 text-sm">{selectedPatient.patientCode}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Full Name</span>
                  <span className="font-bold text-slate-800 text-sm">{selectedPatient.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Age & Gender</span>
                  <span className="font-semibold text-slate-800">{selectedPatient.age} Years / {selectedPatient.gender}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Mobile Number</span>
                  <span className="font-mono font-semibold text-slate-800">{selectedPatient.mobile}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Referred By</span>
                  <span className="font-medium text-slate-800">{selectedPatient.referredBy || 'Self / Walk-in'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Specimen Sample Type</span>
                  <span className="font-semibold text-teal-700">{selectedPatient.sampleType}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Sample Collection Date</span>
                  <span className="font-medium text-slate-800">
                    {new Date(selectedPatient.enrollmentDate).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Current Status</span>
                  <StatusBadge status={selectedPatient.status} />
                </div>
              </div>
            </Card>
          ) : (
            <div className="p-8 text-center rounded-2xl border-2 border-dashed border-slate-200 bg-white">
              <User className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No Patient Selected Yet</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Select an enrolled patient above to auto-fill demographic details and load test parameters.
              </p>
            </div>
          )}

          {/* STEP 3: PATHOLOGIST TEST RESULTS ENTRY */}
          {selectedPatient && (
            <Card
              title="Step 3: Laboratory Diagnostic Results Entry"
              subtitle="Enter test findings • Flags (Low/Normal/High) are calculated automatically and highlighted"
              headerClassName="bg-slate-50/50"
            >
              <div className="space-y-6">
                {/* Test Rows Table */}
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-xs font-bold text-slate-600 uppercase tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3 min-w-[200px]">Diagnostic Test</th>
                        <th className="px-4 py-3 min-w-[120px]">Result / Observed</th>
                        <th className="px-4 py-3 min-w-[90px]">Unit</th>
                        <th className="px-4 py-3 min-w-[140px]">Normal Range</th>
                        <th className="px-4 py-3 min-w-[100px]">Clinical Flag</th>
                        <th className="px-3 py-3 w-12 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {testRows.map((row, idx) => {
                        const isAbnormal = row.flag === 'High' || row.flag === 'Low';
                        return (
                          <tr
                            key={idx}
                            className={`transition-colors ${
                              isAbnormal ? 'bg-rose-50/40' : 'hover:bg-slate-50/50'
                            }`}
                          >
                            {/* Test Name Selector */}
                            <td className="px-4 py-2.5">
                              <select
                                value={row.testName}
                                onChange={(e) => handleTestRowChange(idx, 'testName', e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
                              >
                                {testTemplates.map((t) => (
                                  <option key={t.id} value={t.name}>
                                    {t.name} ({t.category.split(' ')[0]})
                                  </option>
                                ))}
                              </select>
                            </td>

                            {/* Result Input */}
                            <td className="px-4 py-2.5">
                              <input
                                type="text"
                                value={row.result}
                                onChange={(e) => handleTestRowChange(idx, 'result', e.target.value)}
                                placeholder="Enter value..."
                                className={`w-full px-2.5 py-1.5 border rounded-lg text-xs font-bold focus:outline-none focus:ring-2 ${
                                  isAbnormal
                                    ? 'bg-rose-50 border-rose-300 text-rose-700 focus:ring-rose-500/20'
                                    : 'bg-white border-slate-300 text-slate-800 focus:ring-teal-500/20'
                                }`}
                              />
                            </td>

                            {/* Unit */}
                            <td className="px-4 py-2.5">
                              <input
                                type="text"
                                value={row.unit}
                                onChange={(e) => handleTestRowChange(idx, 'unit', e.target.value)}
                                className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 font-mono"
                              />
                            </td>

                            {/* Normal Range */}
                            <td className="px-4 py-2.5">
                              <input
                                type="text"
                                value={row.normalRange}
                                onChange={(e) => handleTestRowChange(idx, 'normalRange', e.target.value)}
                                className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600"
                              />
                            </td>

                            {/* Flag Display */}
                            <td className="px-4 py-2.5">
                              <StatusBadge status={row.flag} />
                            </td>

                            {/* Action Remove */}
                            <td className="px-3 py-2.5 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveRow(idx)}
                                disabled={testRows.length <= 1}
                                className="p-1 rounded text-slate-400 hover:text-rose-600 disabled:opacity-30 disabled:cursor-not-allowed"
                                title="Remove test row"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Add Test Row Button */}
                <div className="flex items-center justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddRow}
                    leftIcon={Plus}
                    className="text-xs"
                  >
                    Add Test Parameter
                  </Button>
                  <p className="text-xs text-slate-400">
                    Values outside reference interval are automatically flagged in red.
                  </p>
                </div>

                {/* Pathologist's Remarks & Impression */}
                <div>
                  <FormInput
                    label="Pathologist's Clinical Impression / Remarks"
                    type="textarea"
                    rows={3}
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Enter diagnostic impression, peripheral smear findings, or clinical advice..."
                    required
                  />
                  <div className="flex gap-2 mt-1.5 flex-wrap">
                    <span className="text-[11px] text-slate-400">Quick Inserts:</span>
                    <button
                      type="button"
                      onClick={() =>
                        setRemarks(
                          'Parameters clinically evaluated. Values within expected biological reference interval.'
                        )
                      }
                      className="text-[11px] text-teal-600 hover:underline"
                    >
                      "Normal range remark"
                    </button>
                    <span className="text-slate-300">•</span>
                    <button
                      type="button"
                      onClick={() =>
                        setRemarks(
                          'Mild abnormal parameters documented. Clinical correlation and follow-up recommended.'
                        )
                      }
                      className="text-[11px] text-teal-600 hover:underline"
                    >
                      "Mild abnormal remark"
                    </button>
                  </div>
                </div>

                {/* Pathologist Authentication Block */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <FormInput
                    label="Signing Pathologist"
                    value={pathologistName}
                    readOnly
                    helperText="Pre-filled from active authenticated pathologist"
                    inputClassName="font-semibold text-slate-800"
                  />
                  <FormInput
                    label="Digital Signature Attestation"
                    value={signatureText}
                    readOnly
                    helperText="Electronic authorization seal"
                    inputClassName="font-serif italic text-teal-800"
                  />
                </div>

                {/* Action Buttons: Save & Send to Receptionist */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4 border-t border-slate-200">
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => {
                      setActionType('save');
                      setShowConfirmModal(true);
                    }}
                    leftIcon={Save}
                    id="save-report-button"
                    className="w-full sm:w-auto font-bold border-teal-600 text-teal-700 hover:bg-teal-50 shadow-xs"
                  >
                    Save
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    size="lg"
                    onClick={() => {
                      setActionType('send');
                      setShowConfirmModal(true);
                    }}
                    leftIcon={SendHorizontal}
                    id="send-to-receptionist-button"
                    className="w-full sm:w-auto font-bold bg-teal-600 hover:bg-teal-700 shadow-md shadow-teal-700/20"
                  >
                    Send to Receptionist
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      ) : (
        /* REPORT HISTORY VIEW */
        <div className="space-y-4 no-print">
          <DataTable
            id="reports-history-table"
            columns={historyColumns}
            data={reports}
            searchPlaceholder="Search reports by report code, patient name, or ID..."
            searchKeys={['reportCode', 'patientCode', 'patientName', 'remarks']}
            initialSortKey="generatedDate"
            initialSortOrder="desc"
            pageSize={10}
            emptyMessage="No diagnostic reports generated yet."
          />
        </div>
      )}

      {/* CONFIRMATION MODAL BEFORE SAVING REPORT */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title={actionType === 'send' ? 'Send Report to Receptionist' : 'Save Diagnostic Report'}
        subtitle={`Patient: ${selectedPatient?.name} (${selectedPatient?.patientCode})`}
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowConfirmModal(false)}
              disabled={isSaving}
            >
              Review Again
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={isSaving}
              onClick={handleConfirmSave}
              leftIcon={actionType === 'send' ? SendHorizontal : Save}
              className={actionType === 'send' ? 'bg-teal-600 hover:bg-teal-700' : 'bg-slate-800 hover:bg-slate-900'}
              id="confirm-report-save-btn"
            >
              {actionType === 'send' ? 'Confirm & Send to Receptionist' : 'Confirm & Save'}
            </Button>
          </>
        }
      >
        <div className="space-y-4 text-sm text-slate-700">
          <p>
            {actionType === 'send' ? (
              <>
                You are about to save and immediately dispatch the verified diagnostic report for{' '}
                <strong>{selectedPatient?.name}</strong> to the <strong>Receptionist Desk</strong>.
              </>
            ) : (
              <>
                You are about to save the verified diagnostic report for{' '}
                <strong>{selectedPatient?.name}</strong> to the laboratory archive.
              </>
            )}
          </p>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
            <p>
              <strong>Parameters Evaluated:</strong> {testRows.length} tests
            </p>
            <p>
              <strong>Abnormal Flags:</strong>{' '}
              {testRows.filter((r) => r.flag === 'High' || r.flag === 'Low').length > 0 ? (
                <span className="text-rose-600 font-bold">
                  {testRows.filter((r) => r.flag === 'High' || r.flag === 'Low').length} abnormal value(s) detected
                </span>
              ) : (
                <span className="text-emerald-600 font-bold">All within biological reference</span>
              )}
            </p>
            <p>
              <strong>Status Update:</strong> Patient status will immediately change to{' '}
              <span className="font-bold text-teal-700">Completed</span> on the Dashboard and patient registry.
              {actionType === 'send' && (
                <span className="ml-1 text-emerald-700 font-semibold">(Dispatched to Reception)</span>
              )}
            </p>
          </div>
        </div>
      </Modal>

      {/* PRINT / DOWNLOAD PDF MODAL & PRINTABLE REPORT LAYOUT */}
      <Modal
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        title="Diagnostic Report Print Preview"
        subtitle={printableReport?.reportCode}
        size="xl"
        footer={
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 w-full">
            <div className="text-left">
              {printableReport?.sentToReceptionist ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Sent to Receptionist
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                  <Save className="w-3.5 h-3.5 text-slate-500" />
                  Saved Locally
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowPrintModal(false)} className="w-full sm:w-auto">
                Close Preview
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleTriggerPrint}
                leftIcon={Printer}
                className="w-full sm:w-auto print-include text-slate-700 border-slate-300"
                id="print-report-btn"
              >
                Print / Save as PDF
              </Button>
              {!printableReport?.sentToReceptionist && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={async () => {
                    const updated = await sendReportToReceptionist(printableReport.id);
                    setPrintableReport(updated);
                  }}
                  leftIcon={SendHorizontal}
                  className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 shadow-sm"
                  id="preview-send-receptionist-btn"
                >
                  Send to Receptionist
                </Button>
              )}
            </div>
          </div>
        }
      >
        {printableReport && (
          <div className="printable-report-card bg-white p-6 sm:p-8 rounded-xl border border-slate-200 text-slate-800">
            {/* LAB HEADER */}
            <div className="border-b-2 border-teal-700 pb-4 mb-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-teal-700 text-white flex items-center justify-center font-bold text-xl shadow-xs">
                    <Microscope className="w-7 h-7" />
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                      PathoCare Diagnostic Laboratories
                    </h1>
                    <p className="text-xs text-slate-500 font-medium">
                      ISO 15189:2022 & NABL Accredited Clinical Laboratory • Reg. No: LAB-2026-908
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Medical College Road, Healthcare District • Tel: +1 (800) 555-PATH • lab@pathocare.org
                    </p>
                  </div>
                </div>

                <div className="text-right hidden sm:block">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-teal-100 text-teal-800">
                    Official Report
                  </span>
                  <p className="text-xs font-mono font-bold text-slate-700 mt-1">
                    {printableReport.reportCode}
                  </p>
                </div>
              </div>
            </div>

            {/* PATIENT BLOCK */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs mb-6">
              <div>
                <span className="text-slate-400 block">Patient ID:</span>
                <span className="font-mono font-bold text-slate-800">{printableReport.patientCode}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Patient Name:</span>
                <span className="font-bold text-slate-900">{printableReport.patientName}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Report Date:</span>
                <span className="font-medium text-slate-800">
                  {new Date(printableReport.generatedDate).toLocaleDateString([], {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Specimen:</span>
                <span className="font-medium text-slate-800">Diagnostic Blood / Serum</span>
              </div>
            </div>

            {/* RESULTS TABLE */}
            <div className="mb-6">
              <table className="w-full text-left text-xs border border-slate-200 rounded">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase border-b border-slate-200">
                  <tr>
                    <th className="px-3.5 py-2.5">Investigation / Test Parameter</th>
                    <th className="px-3.5 py-2.5">Observed Value</th>
                    <th className="px-3.5 py-2.5">Unit</th>
                    <th className="px-3.5 py-2.5">Biological Ref. Interval</th>
                    <th className="px-3.5 py-2.5">Flag</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {printableReport.tests.map((test, i) => {
                    const isAbnormal = test.flag === 'High' || test.flag === 'Low';
                    return (
                      <tr key={i} className={isAbnormal ? 'bg-rose-50/40 font-semibold' : ''}>
                        <td className="px-3.5 py-2 text-slate-800">{test.testName}</td>
                        <td className={`px-3.5 py-2 ${isAbnormal ? 'text-rose-700 font-bold' : 'text-slate-900'}`}>
                          {test.result}
                        </td>
                        <td className="px-3.5 py-2 font-mono text-slate-600">{test.unit}</td>
                        <td className="px-3.5 py-2 text-slate-600">{test.normalRange}</td>
                        <td className="px-3.5 py-2">
                          <StatusBadge status={test.flag} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* CLINICAL IMPRESSION / REMARKS */}
            <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/70 text-xs mb-8">
              <span className="font-bold text-slate-800 block mb-1">Pathologist's Clinical Impression:</span>
              <p className="text-slate-700 leading-relaxed">{printableReport.remarks}</p>
            </div>

            {/* SIGNATURE BLOCK */}
            <div className="flex items-end justify-between pt-6 border-t border-slate-200">
              <div className="text-[11px] text-slate-400">
                <p>Generated automatically via PathoCare Clinical Laboratory Information System</p>
                <p>This report has been reviewed and verified by a licensed pathologist.</p>
              </div>

              <div className="text-right">
                <div className="font-serif italic text-base text-teal-800 font-semibold mb-1">
                  {printableReport.signatureText || 'Dr. Sarah Mitchell, M.D.'}
                </div>
                <div className="text-xs font-bold text-slate-800">{printableReport.pathologistName}</div>
                <div className="text-[11px] text-slate-500">Consultant Pathologist & Laboratory Director</div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* EDIT REPORT MODAL */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Diagnostic Report"
        subtitle={editingReport?.reportCode}
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={async () => {
                try {
                  await updateExistingReport(editingReport.id, editingReport);
                  setShowEditModal(false);
                } catch (err) {
                  console.error(err);
                }
              }}
            >
              Update Report
            </Button>
          </>
        }
      >
        {editingReport && (
          <div className="space-y-4">
            <FormInput
              label="Pathologist's Impression / Remarks"
              type="textarea"
              rows={4}
              value={editingReport.remarks}
              onChange={(e) => setEditingReport({ ...editingReport, remarks: e.target.value })}
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Edit Observed Values:
              </label>
              <div className="space-y-2">
                {editingReport.tests.map((t, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="text-xs font-medium w-48 truncate">{t.testName}</span>
                    <input
                      type="text"
                      value={t.result}
                      onChange={(e) => {
                        const copy = [...editingReport.tests];
                        copy[idx].result = e.target.value;
                        setEditingReport({ ...editingReport, tests: copy });
                      }}
                      className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-bold w-28"
                    />
                    <span className="text-xs text-slate-400 font-mono">{t.unit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
