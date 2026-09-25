// src/pages/PatientEnrollment.jsx
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserPlus,
  Users,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Edit2,
  FilePlus,
  ExternalLink
} from 'lucide-react';
import { useAppData } from '../hooks/useAppData';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { FormInput } from '../components/FormInput';
import { Modal } from '../components/Modal';
import { DataTable } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { sampleTypesList } from '../data/mockTestTemplates';
import { checkDuplicatePatient } from '../services/patientService';

export const PatientEnrollment = () => {
  const {
    patients,
    testTemplates,
    enrollNewPatient,
    updateExistingPatient,
    removePatient
  } = useAppData();

  const navigate = useNavigate();

  // Compute next auto-generated Patient Code
  const nextPatientCode = useMemo(() => {
    const existingNumbers = patients
      .map((p) => {
        const match = (p.patientCode || '').match(/PT-(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter((n) => !isNaN(n));
    const nextNum = (existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0) + 1;
    return `PT-${String(nextNum).padStart(4, '0')}`;
  }, [patients]);

  // Form State
  const initialFormState = {
    name: '',
    age: '',
    gender: 'Male',
    mobile: '',
    address: '',
    referredBy: 'Dr. Kevin Vance, MD (Cardiology)',
    testsRequested: ['Hemoglobin (Hb)', 'Total Leukocyte Count (WBC)'],
    sampleType: 'Whole Blood (EDTA)',
  };

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [duplicateWarning, setDuplicateWarning] = useState(null);

  // Modals state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Patient editing state
  const [editingPatient, setEditingPatient] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [editErrors, setEditErrors] = useState({});

  // Patient deletion state
  const [patientToDelete, setPatientToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Current auto enrollment time preview
  const currentEnrollmentTime = useMemo(() => {
    return new Date().toLocaleString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }, []);

  // Validation
  const validateForm = (data) => {
    const errs = {};
    if (!data.name || !data.name.trim()) {
      errs.name = 'Patient full name is required.';
    } else if (data.name.trim().length < 2) {
      errs.name = 'Name must be at least 2 characters.';
    }

    if (!data.age || isNaN(data.age) || Number(data.age) < 1 || Number(data.age) > 125) {
      errs.age = 'Please enter a valid age between 1 and 125.';
    }

    const cleanMobile = (data.mobile || '').replace(/\D/g, '');
    if (!cleanMobile) {
      errs.mobile = 'Mobile number is required.';
    } else if (cleanMobile.length !== 10) {
      errs.mobile = 'Mobile must be a valid 10-digit number.';
    }

    if (!data.testsRequested || data.testsRequested.length === 0) {
      errs.testsRequested = 'Please select at least one test requested.';
    }

    return errs;
  };

  // Handle Form Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
    if (duplicateWarning) {
      setDuplicateWarning(null);
    }
  };

  // Toggle Test selection
  const handleToggleTest = (testName) => {
    setFormData((prev) => {
      const exists = prev.testsRequested.includes(testName);
      const updated = exists
        ? prev.testsRequested.filter((t) => t !== testName)
        : [...prev.testsRequested, testName];

      // Auto update sample type if test template suggests one
      let recommendedSample = prev.sampleType;
      if (!exists) {
        const tpl = testTemplates.find((t) => t.name === testName);
        if (tpl && tpl.sampleType) {
          recommendedSample = tpl.sampleType;
        }
      }

      return {
        ...prev,
        testsRequested: updated,
        sampleType: recommendedSample
      };
    });

    if (errors.testsRequested) {
      setErrors((prev) => ({ ...prev, testsRequested: null }));
    }
  };

  // Submit Intent: check validation & duplicate prevention
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setDuplicateWarning(null);

    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Check Duplicate
    const duplicate = await checkDuplicatePatient(formData.name, formData.mobile);
    if (duplicate) {
      setDuplicateWarning(duplicate);
      return;
    }

    setShowConfirmModal(true);
  };

  // Confirm and Save
  const handleConfirmEnrollment = async () => {
    setIsSubmitting(true);
    try {
      await enrollNewPatient({
        ...formData,
        enrollmentDate: new Date().toISOString()
      });
      // Reset form
      setFormData(initialFormState);
      setShowConfirmModal(false);
      setErrors({});
      setDuplicateWarning(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit Patient Handlers
  const handleOpenEdit = (patient) => {
    setEditingPatient(patient);
    setEditFormData({
      name: patient.name,
      age: patient.age,
      gender: patient.gender,
      mobile: patient.mobile,
      address: patient.address,
      referredBy: patient.referredBy,
      sampleType: patient.sampleType,
      testsRequested: [...patient.testsRequested]
    });
    setEditErrors({});
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    const errs = validateForm(editFormData);
    if (Object.keys(errs).length > 0) {
      setEditErrors(errs);
      return;
    }

    try {
      await updateExistingPatient(editingPatient.id, editFormData);
      setShowEditModal(false);
      setEditingPatient(null);
    } catch (err) {
      setEditErrors({ general: err.message });
    }
  };

  // Delete Patient Handlers
  const handleConfirmDelete = async () => {
    if (!patientToDelete) return;
    try {
      await removePatient(patientToDelete.id);
      setShowDeleteModal(false);
      setPatientToDelete(null);
    } catch (err) {
      console.error(err);
    }
  };

  // Columns for DataTable
  const tableColumns = [
    {
      key: 'patientCode',
      title: 'Patient ID',
      sortable: true,
      render: (val) => (
        <div>
          <span className="font-mono font-bold text-teal-700 text-xs px-2 py-0.5 rounded bg-teal-50 border border-teal-200/60">
            {val}
          </span>
        </div>
      )
    },
    {
      key: 'name',
      title: 'Full Name',
      sortable: true,
      render: (val, row) => (
        <div>
          <div className="font-semibold text-slate-800 text-sm">{val}</div>
          <div className="text-xs text-slate-400">
            {row.age} yrs • {row.gender}
          </div>
        </div>
      )
    },
    {
      key: 'mobile',
      title: 'Mobile / Contact',
      sortable: true,
      render: (val) => (
        <span className="font-mono text-xs text-slate-700">{val}</span>
      )
    },
    {
      key: 'testsRequested',
      title: 'Requested Tests',
      sortable: false,
      render: (val = []) => (
        <div className="flex flex-wrap gap-1 max-w-xs">
          {val.slice(0, 2).map((t, idx) => (
            <span
              key={idx}
              className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium truncate"
            >
              {t}
            </span>
          ))}
          {val.length > 2 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 font-bold">
              +{val.length - 2} more
            </span>
          )}
        </div>
      )
    },
    {
      key: 'sampleType',
      title: 'Sample Type',
      sortable: true,
      render: (val) => (
        <span className="text-xs text-slate-600 font-medium">{val}</span>
      )
    },
    {
      key: 'enrollmentDate',
      title: 'Enrolled At',
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
      key: 'status',
      title: 'Status',
      sortable: true,
      render: (val) => <StatusBadge status={val} />
    },
    {
      key: 'actions',
      title: 'Actions',
      sortable: false,
      render: (_, row) => (
        <div className="flex items-center gap-1.5">
          {row.status === 'Pending' ? (
            <Button
              variant="tealOutline"
              size="sm"
              onClick={() => navigate(`/reports?action=new&patientId=${row.id}`)}
              leftIcon={FilePlus}
              title="Create Diagnostic Report for this patient"
              className="text-xs py-1 px-2.5"
            >
              Report
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/reports?viewPatient=${row.id}`)}
              className="text-xs py-1 px-2 text-teal-700"
              title="View existing report"
            >
              View Report
            </Button>
          )}

          <button
            type="button"
            onClick={() => handleOpenEdit(row)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title="Edit Patient"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => {
              setPatientToDelete(row);
              setShowDeleteModal(true);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="Delete Patient"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <UserPlus className="w-6 h-6 text-teal-600" />
            <span>Patient Enrollment</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Register new patients, record clinical requests, and manage specimen intake
          </p>
        </div>
      </div>

      {/* Duplicate Prevention Alert Banner */}
      {duplicateWarning && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200/90 text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs animate-fade-in">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm">
                Duplicate Enrollment Blocked: Patient Already Registered
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                A patient matching Name <strong>"{duplicateWarning.name}"</strong> and Mobile{' '}
                <strong>{duplicateWarning.mobile}</strong> already exists under Patient ID{' '}
                <span className="font-mono font-bold">{duplicateWarning.patientCode}</span> (Status: {duplicateWarning.status}).
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                navigate(`/reports?viewPatient=${duplicateWarning.id}`);
              }}
              rightIcon={ExternalLink}
              className="bg-white border-amber-300 text-amber-900 hover:bg-amber-100/50"
            >
              Inspect Existing Patient
            </Button>
            <button
              type="button"
              onClick={() => setDuplicateWarning(null)}
              className="text-xs text-amber-700 underline font-semibold px-2"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Patient Intake Form Card */}
      <Card
        title="Intake & Specimen Registration Form"
        subtitle="Ensure all required clinical identifiers are verified"
        headerClassName="bg-slate-50/50"
      >
        <form onSubmit={handleFormSubmit} className="space-y-6">
          {/* Row 1: Patient ID (auto-generated), Full Name, Age, Gender */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <FormInput
                label="Patient ID (Auto-Generated)"
                name="patientCode"
                value={nextPatientCode}
                readOnly
                helperText="Unique sequential accession identifier"
                inputClassName="font-mono font-bold text-teal-700 bg-teal-50/40"
              />
            </div>

            <div>
              <FormInput
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Eleanor Vance"
                required
                error={errors.name}
              />
            </div>

            <div>
              <FormInput
                label="Age (Years)"
                name="age"
                type="number"
                min="1"
                max="125"
                value={formData.age}
                onChange={handleChange}
                placeholder="e.g. 42"
                required
                error={errors.age}
              />
            </div>

            <div>
              <FormInput
                label="Gender"
                name="gender"
                type="select"
                value={formData.gender}
                onChange={handleChange}
                options={['Male', 'Female', 'Other']}
                required
              />
            </div>
          </div>

          {/* Row 2: Mobile (10-digit), Referred By, Sample Type, Date & Time (auto-filled) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <FormInput
                label="Mobile Number (10 Digits)"
                name="mobile"
                type="tel"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="e.g. 9876543210"
                required
                maxLength={10}
                error={errors.mobile}
                helperText="Used for automated report alerts"
              />
            </div>

            <div>
              <FormInput
                label="Referred By (Doctor / Clinic)"
                name="referredBy"
                value={formData.referredBy}
                onChange={handleChange}
                placeholder="e.g. Dr. Kevin Vance, MD"
                options={[
                  'Dr. Kevin Vance, MD (Cardiology)',
                  'Dr. Neha Gupta, DGO (Gynecology)',
                  'Dr. Harold Finch, MD (Internal Medicine)',
                  'Dr. Anita Desai, MD (General Medicine)',
                  'Self / Walk-in Consultation'
                ]}
                type="select"
              />
            </div>

            <div>
              <FormInput
                label="Sample Specimen Type"
                name="sampleType"
                type="select"
                value={formData.sampleType}
                onChange={handleChange}
                options={sampleTypesList}
                required
              />
            </div>

            <div>
              <FormInput
                label="Enrollment Date & Time"
                name="enrollmentDate"
                value={currentEnrollmentTime}
                readOnly
                helperText="Auto-recorded system accession"
              />
            </div>
          </div>

          {/* Row 3: Residential Address */}
          <div>
            <FormInput
              label="Address / Residence (Optional)"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="e.g. 42 Pine Crest Ave, Westside District"
            />
          </div>

          {/* Row 4: Multi-Select Tests Requested */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div>
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Tests Requested <span className="text-rose-500">*</span>
                </label>
                <p className="text-xs text-slate-500">
                  Select one or more diagnostic parameters for this sample ({formData.testsRequested.length} selected)
                </p>
              </div>

              {errors.testsRequested && (
                <p className="text-xs text-rose-600 font-semibold">{errors.testsRequested}</p>
              )}
            </div>

            {/* Test Templates Badges Selector */}
            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-1">
              {testTemplates.map((template) => {
                const isSelected = formData.testsRequested.includes(template.name);
                return (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => handleToggleTest(template.name)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 border text-left flex items-center gap-2 select-none ${
                      isSelected
                        ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-teal-400 hover:bg-teal-50/50'
                    }`}
                  >
                    <span>{template.name}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded ${
                        isSelected ? 'bg-teal-700 text-teal-100' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {template.category.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setFormData(initialFormState);
                setErrors({});
                setDuplicateWarning(null);
              }}
            >
              Clear Form
            </Button>

            <Button
              type="submit"
              variant="primary"
              size="md"
              leftIcon={CheckCircle2}
              id="enroll-submit-button"
            >
              Verify & Enroll Patient
            </Button>
          </div>
        </form>
      </Card>

      {/* Confirmation Modal Before Saving */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Patient Enrollment"
        subtitle={`Accession ID: ${nextPatientCode}`}
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowConfirmModal(false)}
              disabled={isSubmitting}
            >
              Review Details
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={isSubmitting}
              onClick={handleConfirmEnrollment}
              id="confirm-enroll-save-btn"
            >
              Confirm & Save
            </Button>
          </>
        }
      >
        <div className="space-y-4 text-sm text-slate-700">
          <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-100 text-teal-900">
            <p className="font-semibold text-xs text-teal-700 uppercase tracking-wider mb-1">
              Enrollment Summary
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-teal-600">Full Name:</span>{' '}
                <span className="font-bold">{formData.name}</span>
              </div>
              <div>
                <span className="text-teal-600">Age / Gender:</span>{' '}
                <span className="font-bold">{formData.age} yrs, {formData.gender}</span>
              </div>
              <div>
                <span className="text-teal-600">Mobile:</span>{' '}
                <span className="font-bold font-mono">{formData.mobile}</span>
              </div>
              <div>
                <span className="text-teal-600">Specimen:</span>{' '}
                <span className="font-bold">{formData.sampleType}</span>
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Assigned Diagnostic Tests ({formData.testsRequested.length}):
            </p>
            <div className="flex flex-wrap gap-1.5">
              {formData.testsRequested.map((t, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-800 text-xs font-medium"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          <p className="text-xs text-slate-500">
            Upon saving, the patient record will be listed with status <strong>Pending</strong>, ready for the pathologist to record test results and publish the diagnostic report.
          </p>
        </div>
      </Modal>

      {/* Patient List Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Users className="w-5 h-5 text-teal-600" />
              <span>Enrolled Patients Database</span>
            </h3>
            <p className="text-xs text-slate-500">
              {patients.length} total registered records • Click column headers to sort
            </p>
          </div>
        </div>

        <DataTable
          id="patients-data-table"
          columns={tableColumns}
          data={patients}
          searchPlaceholder="Search patients by name, PT ID, mobile or doctor..."
          searchKeys={['name', 'patientCode', 'mobile', 'referredBy']}
          initialSortKey="enrollmentDate"
          initialSortOrder="desc"
          pageSize={8}
          emptyMessage="No enrolled patients found."
        />
      </div>

      {/* Edit Patient Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Patient Information"
        subtitle={`Editing ${editingPatient?.patientCode}`}
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveEdit}>
              Update Patient
            </Button>
          </>
        }
      >
        {editFormData && (
          <div className="space-y-4">
            {editErrors.general && (
              <p className="text-xs text-rose-600 font-semibold">{editErrors.general}</p>
            )}
            <div className="grid grid-cols-2 gap-3">
              <FormInput
                label="Full Name"
                name="name"
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                error={editErrors.name}
                required
              />
              <FormInput
                label="Age"
                name="age"
                type="number"
                value={editFormData.age}
                onChange={(e) => setEditFormData({ ...editFormData, age: e.target.value })}
                error={editErrors.age}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormInput
                label="Gender"
                name="gender"
                type="select"
                value={editFormData.gender}
                onChange={(e) => setEditFormData({ ...editFormData, gender: e.target.value })}
                options={['Male', 'Female', 'Other']}
              />
              <FormInput
                label="Mobile"
                name="mobile"
                value={editFormData.mobile}
                onChange={(e) => setEditFormData({ ...editFormData, mobile: e.target.value })}
                error={editErrors.mobile}
                required
              />
            </div>
            <FormInput
              label="Referred By"
              name="referredBy"
              value={editFormData.referredBy}
              onChange={(e) => setEditFormData({ ...editFormData, referredBy: e.target.value })}
            />
            <FormInput
              label="Sample Type"
              name="sampleType"
              type="select"
              value={editFormData.sampleType}
              onChange={(e) => setEditFormData({ ...editFormData, sampleType: e.target.value })}
              options={sampleTypesList}
            />
          </div>
        )}
      </Modal>

      {/* Delete Patient Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Patient Record?"
        subtitle={patientToDelete?.name}
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleConfirmDelete}>
              Confirm Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          Are you sure you want to remove patient <strong>{patientToDelete?.name}</strong> (
          {patientToDelete?.patientCode})? This action will permanently remove this record from the active database.
        </p>
      </Modal>
    </div>
  );
};
