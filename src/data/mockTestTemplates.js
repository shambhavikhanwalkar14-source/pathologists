// src/data/mockTestTemplates.js

export const mockTestTemplates = [
  // CBC
  {
    id: 'TEST-CBC-01',
    name: 'Hemoglobin (Hb)',
    category: 'Complete Blood Count (CBC)',
    unit: 'g/dL',
    normalRangeLow: 13.0,
    normalRangeHigh: 17.0,
    normalRangeText: '13.0 - 17.0',
    sampleType: 'Whole Blood (EDTA)'
  },
  {
    id: 'TEST-CBC-02',
    name: 'Total Leukocyte Count (WBC)',
    category: 'Complete Blood Count (CBC)',
    unit: '/cumm',
    normalRangeLow: 4000,
    normalRangeHigh: 11000,
    normalRangeText: '4,000 - 11,000',
    sampleType: 'Whole Blood (EDTA)'
  },
  {
    id: 'TEST-CBC-03',
    name: 'Platelet Count',
    category: 'Complete Blood Count (CBC)',
    unit: 'lakh/cumm',
    normalRangeLow: 1.5,
    normalRangeHigh: 4.5,
    normalRangeText: '1.50 - 4.50',
    sampleType: 'Whole Blood (EDTA)'
  },
  {
    id: 'TEST-CBC-04',
    name: 'RBC Count',
    category: 'Complete Blood Count (CBC)',
    unit: 'million/cumm',
    normalRangeLow: 4.5,
    normalRangeHigh: 5.9,
    normalRangeText: '4.50 - 5.90',
    sampleType: 'Whole Blood (EDTA)'
  },
  {
    id: 'TEST-CBC-05',
    name: 'Packed Cell Volume (PCV)',
    category: 'Complete Blood Count (CBC)',
    unit: '%',
    normalRangeLow: 40.0,
    normalRangeHigh: 50.0,
    normalRangeText: '40.0 - 50.0',
    sampleType: 'Whole Blood (EDTA)'
  },

  // Blood Sugar
  {
    id: 'TEST-GLU-01',
    name: 'Fasting Blood Glucose',
    category: 'Blood Sugar',
    unit: 'mg/dL',
    normalRangeLow: 70,
    normalRangeHigh: 99,
    normalRangeText: '70 - 99',
    sampleType: 'Fluoride Plasma'
  },
  {
    id: 'TEST-GLU-02',
    name: 'Postprandial Blood Glucose (PP)',
    category: 'Blood Sugar',
    unit: 'mg/dL',
    normalRangeLow: 70,
    normalRangeHigh: 140,
    normalRangeText: '70 - 140',
    sampleType: 'Fluoride Plasma'
  },
  {
    id: 'TEST-GLU-03',
    name: 'HbA1c (Glycated Hemoglobin)',
    category: 'Blood Sugar',
    unit: '%',
    normalRangeLow: 4.0,
    normalRangeHigh: 5.6,
    normalRangeText: '4.0 - 5.6',
    sampleType: 'Whole Blood (EDTA)'
  },

  // Lipid Profile
  {
    id: 'TEST-LIP-01',
    name: 'Total Cholesterol',
    category: 'Lipid Profile',
    unit: 'mg/dL',
    normalRangeLow: 125,
    normalRangeHigh: 200,
    normalRangeText: '< 200',
    sampleType: 'Serum'
  },
  {
    id: 'TEST-LIP-02',
    name: 'HDL Cholesterol (Good)',
    category: 'Lipid Profile',
    unit: 'mg/dL',
    normalRangeLow: 40,
    normalRangeHigh: 60,
    normalRangeText: '40 - 60',
    sampleType: 'Serum'
  },
  {
    id: 'TEST-LIP-03',
    name: 'LDL Cholesterol (Bad)',
    category: 'Lipid Profile',
    unit: 'mg/dL',
    normalRangeLow: 50,
    normalRangeHigh: 100,
    normalRangeText: '< 100',
    sampleType: 'Serum'
  },
  {
    id: 'TEST-LIP-04',
    name: 'Serum Triglycerides',
    category: 'Lipid Profile',
    unit: 'mg/dL',
    normalRangeLow: 50,
    normalRangeHigh: 150,
    normalRangeText: '< 150',
    sampleType: 'Serum'
  },

  // Liver Function Test (LFT)
  {
    id: 'TEST-LFT-01',
    name: 'Total Bilirubin',
    category: 'Liver Function Test (LFT)',
    unit: 'mg/dL',
    normalRangeLow: 0.2,
    normalRangeHigh: 1.2,
    normalRangeText: '0.2 - 1.2',
    sampleType: 'Serum'
  },
  {
    id: 'TEST-LFT-02',
    name: 'SGOT / AST',
    category: 'Liver Function Test (LFT)',
    unit: 'U/L',
    normalRangeLow: 5,
    normalRangeHigh: 40,
    normalRangeText: '5 - 40',
    sampleType: 'Serum'
  },
  {
    id: 'TEST-LFT-03',
    name: 'SGPT / ALT',
    category: 'Liver Function Test (LFT)',
    unit: 'U/L',
    normalRangeLow: 7,
    normalRangeHigh: 56,
    normalRangeText: '7 - 56',
    sampleType: 'Serum'
  },
  {
    id: 'TEST-LFT-04',
    name: 'Alkaline Phosphatase (ALP)',
    category: 'Liver Function Test (LFT)',
    unit: 'U/L',
    normalRangeLow: 44,
    normalRangeHigh: 147,
    normalRangeText: '44 - 147',
    sampleType: 'Serum'
  },
  {
    id: 'TEST-LFT-05',
    name: 'Total Protein',
    category: 'Liver Function Test (LFT)',
    unit: 'g/dL',
    normalRangeLow: 6.0,
    normalRangeHigh: 8.3,
    normalRangeText: '6.0 - 8.3',
    sampleType: 'Serum'
  },

  // Kidney Function Test (KFT)
  {
    id: 'TEST-KFT-01',
    name: 'Serum Creatinine',
    category: 'Kidney Function Test (KFT)',
    unit: 'mg/dL',
    normalRangeLow: 0.7,
    normalRangeHigh: 1.3,
    normalRangeText: '0.7 - 1.3',
    sampleType: 'Serum'
  },
  {
    id: 'TEST-KFT-02',
    name: 'Blood Urea',
    category: 'Kidney Function Test (KFT)',
    unit: 'mg/dL',
    normalRangeLow: 15,
    normalRangeHigh: 40,
    normalRangeText: '15 - 40',
    sampleType: 'Serum'
  },
  {
    id: 'TEST-KFT-03',
    name: 'Serum Uric Acid',
    category: 'Kidney Function Test (KFT)',
    unit: 'mg/dL',
    normalRangeLow: 3.5,
    normalRangeHigh: 7.2,
    normalRangeText: '3.5 - 7.2',
    sampleType: 'Serum'
  },

  // Thyroid Profile
  {
    id: 'TEST-THY-01',
    name: 'TSH (Ultrasensitive)',
    category: 'Thyroid Profile',
    unit: 'µIU/mL',
    normalRangeLow: 0.35,
    normalRangeHigh: 4.94,
    normalRangeText: '0.35 - 4.94',
    sampleType: 'Serum'
  },
  {
    id: 'TEST-THY-02',
    name: 'Total T3',
    category: 'Thyroid Profile',
    unit: 'ng/dL',
    normalRangeLow: 80,
    normalRangeHigh: 200,
    normalRangeText: '80 - 200',
    sampleType: 'Serum'
  },
  {
    id: 'TEST-THY-03',
    name: 'Total T4',
    category: 'Thyroid Profile',
    unit: 'µg/dL',
    normalRangeLow: 5.1,
    normalRangeHigh: 14.1,
    normalRangeText: '5.1 - 14.1',
    sampleType: 'Serum'
  },

  // Urine Routine
  {
    id: 'TEST-URN-01',
    name: 'Urine Glucose',
    category: 'Urine Routine',
    unit: 'Qualitative',
    normalRangeLow: 0,
    normalRangeHigh: 0,
    normalRangeText: 'Nil / Negative',
    sampleType: 'Urine (Mid-stream)'
  },
  {
    id: 'TEST-URN-02',
    name: 'Urine Protein (Albumin)',
    category: 'Urine Routine',
    unit: 'Qualitative',
    normalRangeLow: 0,
    normalRangeHigh: 0,
    normalRangeText: 'Nil / Negative',
    sampleType: 'Urine (Mid-stream)'
  },
  {
    id: 'TEST-URN-03',
    name: 'Pus Cells (WBCs)',
    category: 'Urine Routine',
    unit: '/hpf',
    normalRangeLow: 0,
    normalRangeHigh: 5,
    normalRangeText: '0 - 5 /hpf',
    sampleType: 'Urine (Mid-stream)'
  }
];

export const testCategories = [
  'Complete Blood Count (CBC)',
  'Blood Sugar',
  'Lipid Profile',
  'Liver Function Test (LFT)',
  'Kidney Function Test (KFT)',
  'Thyroid Profile',
  'Urine Routine'
];

export const sampleTypesList = [
  'Whole Blood (EDTA)',
  'Serum',
  'Fluoride Plasma',
  'Urine (Mid-stream)',
  'Citrate Plasma',
  'Heparin Blood',
  'Sputum'
];
