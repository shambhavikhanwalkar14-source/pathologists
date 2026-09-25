// src/data/mockPatients.js

// Generate timestamps anchored relative to current date (e.g. Sep 24, 2026)
const now = new Date();
const getOffsetDate = (daysAgo, hours = 9, minutes = 30) => {
  const d = new Date(now);
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
};

const getMonthOffsetDate = (monthsAgo, day = 15, hours = 10, minutes = 0) => {
  const d = new Date(now);
  d.setMonth(d.getMonth() - monthsAgo);
  d.setDate(day);
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
};

export const initialMockPatients = [
  // Today's enrollments (Days Ago: 0)
  {
    id: 'PT-0001',
    patientCode: 'PT-0001',
    name: 'Robert Jenkins',
    age: 48,
    gender: 'Male',
    mobile: '9876543210',
    address: '42 Oakridge Blvd, North Wing, Apt 3B',
    referredBy: 'Dr. Kevin Vance, MD (Cardiology)',
    testsRequested: ['Total Cholesterol', 'HDL Cholesterol (Good)', 'LDL Cholesterol (Bad)', 'Serum Triglycerides'],
    sampleType: 'Serum',
    enrollmentDate: getOffsetDate(0, 8, 45),
    status: 'Completed'
  },
  {
    id: 'PT-0002',
    patientCode: 'PT-0002',
    name: 'Amara Patel',
    age: 34,
    gender: 'Female',
    mobile: '9845123456',
    address: '15 Lotus Park, 2nd Cross, Green Glen',
    referredBy: 'Dr. Neha Gupta, DGO (Gynecology)',
    testsRequested: ['Hemoglobin (Hb)', 'Total Leukocyte Count (WBC)', 'Platelet Count', 'TSH (Ultrasensitive)'],
    sampleType: 'Whole Blood (EDTA)',
    enrollmentDate: getOffsetDate(0, 9, 15),
    status: 'Completed'
  },
  {
    id: 'PT-0003',
    patientCode: 'PT-0003',
    name: 'David Miller',
    age: 59,
    gender: 'Male',
    mobile: '9765432109',
    address: '77 Westfall Road, Suite 400',
    referredBy: 'Dr. Kevin Vance, MD (Cardiology)',
    testsRequested: ['Fasting Blood Glucose', 'HbA1c (Glycated Hemoglobin)', 'Serum Creatinine'],
    sampleType: 'Fluoride Plasma',
    enrollmentDate: getOffsetDate(0, 10, 30),
    status: 'Pending'
  },
  {
    id: 'PT-0004',
    patientCode: 'PT-0004',
    name: 'Elena Rostova',
    age: 27,
    gender: 'Female',
    mobile: '9811223344',
    address: '102 Pinehurst Ave, Block C',
    referredBy: 'Dr. Anita Desai, MD (Medicine)',
    testsRequested: ['Hemoglobin (Hb)', 'RBC Count', 'Packed Cell Volume (PCV)'],
    sampleType: 'Whole Blood (EDTA)',
    enrollmentDate: getOffsetDate(0, 11, 20),
    status: 'Pending'
  },

  // Yesterday's enrollments (Days Ago: 1)
  {
    id: 'PT-0005',
    patientCode: 'PT-0005',
    name: 'Marcus Sterling',
    age: 52,
    gender: 'Male',
    mobile: '9723456781',
    address: '88 Meadowbrook Lane, Riverside',
    referredBy: 'Dr. Harold Finch, MD (Internal Medicine)',
    testsRequested: ['Total Bilirubin', 'SGOT / AST', 'SGPT / ALT', 'Alkaline Phosphatase (ALP)'],
    sampleType: 'Serum',
    enrollmentDate: getOffsetDate(1, 9, 0),
    status: 'Completed'
  },
  {
    id: 'PT-0006',
    patientCode: 'PT-0006',
    name: 'Priya Sundaram',
    age: 41,
    gender: 'Female',
    mobile: '9988776655',
    address: '23 Silver Springs, Lakeview Enclave',
    referredBy: 'Dr. Neha Gupta, DGO (Gynecology)',
    testsRequested: ['TSH (Ultrasensitive)', 'Total T3', 'Total T4', 'Fasting Blood Glucose'],
    sampleType: 'Serum',
    enrollmentDate: getOffsetDate(1, 10, 45),
    status: 'Completed'
  },
  {
    id: 'PT-0007',
    patientCode: 'PT-0007',
    name: 'Jonathan Wright',
    age: 63,
    gender: 'Male',
    mobile: '9654321987',
    address: '51 Beacon Street, Old City District',
    referredBy: 'Dr. Kevin Vance, MD (Cardiology)',
    testsRequested: ['Serum Creatinine', 'Blood Urea', 'Serum Uric Acid'],
    sampleType: 'Serum',
    enrollmentDate: getOffsetDate(1, 14, 15),
    status: 'Pending'
  },

  // This Month (Days Ago: 2 to 22)
  {
    id: 'PT-0008',
    patientCode: 'PT-0008',
    name: 'Fatima Al-Mansoor',
    age: 38,
    gender: 'Female',
    mobile: '9871122445',
    address: '34 Crescent Heights, Bay Area',
    referredBy: 'Dr. Anita Desai, MD (Medicine)',
    testsRequested: ['Hemoglobin (Hb)', 'Total Leukocyte Count (WBC)', 'Fasting Blood Glucose'],
    sampleType: 'Whole Blood (EDTA)',
    enrollmentDate: getOffsetDate(3, 10, 0),
    status: 'Completed'
  },
  {
    id: 'PT-0009',
    patientCode: 'PT-0009',
    name: 'Christopher Lee',
    age: 45,
    gender: 'Male',
    mobile: '9833445566',
    address: '9 Victoria Terrace, Downtown',
    referredBy: 'Dr. Harold Finch, MD (Internal Medicine)',
    testsRequested: ['Total Cholesterol', 'Serum Triglycerides', 'HbA1c (Glycated Hemoglobin)'],
    sampleType: 'Serum',
    enrollmentDate: getOffsetDate(6, 11, 30),
    status: 'Completed'
  },
  {
    id: 'PT-0010',
    patientCode: 'PT-0010',
    name: 'Sonia Fernandez',
    age: 31,
    gender: 'Female',
    mobile: '9912345678',
    address: '114 Sunset Boulevard, Palms',
    referredBy: 'Dr. Neha Gupta, DGO (Gynecology)',
    testsRequested: ['Hemoglobin (Hb)', 'Platelet Count', 'Urine Protein (Albumin)', 'Pus Cells (WBCs)'],
    sampleType: 'Urine (Mid-stream)',
    enrollmentDate: getOffsetDate(10, 9, 30),
    status: 'Completed'
  },
  {
    id: 'PT-0011',
    patientCode: 'PT-0011',
    name: 'William Harrison',
    age: 67,
    gender: 'Male',
    mobile: '9876501234',
    address: '12 Heritage Park Way, Westside',
    referredBy: 'Dr. Kevin Vance, MD (Cardiology)',
    testsRequested: ['Serum Creatinine', 'Blood Urea', 'Total Bilirubin', 'SGPT / ALT'],
    sampleType: 'Serum',
    enrollmentDate: getOffsetDate(14, 15, 0),
    status: 'Completed'
  },
  {
    id: 'PT-0012',
    patientCode: 'PT-0012',
    name: 'Kavita Chawla',
    age: 50,
    gender: 'Female',
    mobile: '9812981298',
    address: '89 Rosewood Gardens, South Extension',
    referredBy: 'Dr. Anita Desai, MD (Medicine)',
    testsRequested: ['Fasting Blood Glucose', 'Postprandial Blood Glucose (PP)', 'HbA1c (Glycated Hemoglobin)'],
    sampleType: 'Fluoride Plasma',
    enrollmentDate: getOffsetDate(18, 8, 30),
    status: 'Completed'
  },
  {
    id: 'PT-0013',
    patientCode: 'PT-0013',
    name: 'Arthur Pendelton',
    age: 72,
    gender: 'Male',
    mobile: '9654127890',
    address: '204 Highbury Estates, North Ridge',
    referredBy: 'Dr. Harold Finch, MD (Internal Medicine)',
    testsRequested: ['Serum Creatinine', 'Serum Uric Acid'],
    sampleType: 'Serum',
    enrollmentDate: getOffsetDate(21, 11, 0),
    status: 'Pending'
  },

  // Earlier Months of This Year
  {
    id: 'PT-0014',
    patientCode: 'PT-0014',
    name: 'Zara Washington',
    age: 29,
    gender: 'Female',
    mobile: '9845984598',
    address: '76 King Street, Central Quarter',
    referredBy: 'Dr. Neha Gupta, DGO (Gynecology)',
    testsRequested: ['TSH (Ultrasensitive)', 'Hemoglobin (Hb)'],
    sampleType: 'Whole Blood (EDTA)',
    enrollmentDate: getMonthOffsetDate(1, 12, 10, 15), // Last month
    status: 'Completed'
  },
  {
    id: 'PT-0015',
    patientCode: 'PT-0015',
    name: 'Vikram Sengupta',
    age: 55,
    gender: 'Male',
    mobile: '9765123984',
    address: '44 Lake Gardens, South Sector',
    referredBy: 'Dr. Kevin Vance, MD (Cardiology)',
    testsRequested: ['Total Cholesterol', 'HDL Cholesterol (Good)', 'LDL Cholesterol (Bad)'],
    sampleType: 'Serum',
    enrollmentDate: getMonthOffsetDate(2, 8, 9, 45), // 2 months ago
    status: 'Completed'
  },
  {
    id: 'PT-0016',
    patientCode: 'PT-0016',
    name: 'Chloe Bennett',
    age: 33,
    gender: 'Female',
    mobile: '9944332211',
    address: '601 Pacific Heights, Marina',
    referredBy: 'Dr. Anita Desai, MD (Medicine)',
    testsRequested: ['Hemoglobin (Hb)', 'Total Leukocyte Count (WBC)', 'Platelet Count'],
    sampleType: 'Whole Blood (EDTA)',
    enrollmentDate: getMonthOffsetDate(4, 20, 11, 20), // 4 months ago
    status: 'Completed'
  },
  {
    id: 'PT-0017',
    patientCode: 'PT-0017',
    name: 'Rajesh Nair',
    age: 46,
    gender: 'Male',
    mobile: '9822113344',
    address: '18 Palm Grove, Cyber Valley',
    referredBy: 'Dr. Harold Finch, MD (Internal Medicine)',
    testsRequested: ['Fasting Blood Glucose', 'HbA1c (Glycated Hemoglobin)'],
    sampleType: 'Fluoride Plasma',
    enrollmentDate: getMonthOffsetDate(6, 14, 14, 0), // 6 months ago
    status: 'Completed'
  },
  {
    id: 'PT-0018',
    patientCode: 'PT-0018',
    name: 'Miriam O’Connor',
    age: 61,
    gender: 'Female',
    mobile: '9711882233',
    address: '92 Glenwood Avenue, West Hill',
    referredBy: 'Dr. Kevin Vance, MD (Cardiology)',
    testsRequested: ['Serum Creatinine', 'Blood Urea', 'Serum Uric Acid'],
    sampleType: 'Serum',
    enrollmentDate: getMonthOffsetDate(8, 25, 10, 30), // 8 months ago
    status: 'Completed'
  }
];
