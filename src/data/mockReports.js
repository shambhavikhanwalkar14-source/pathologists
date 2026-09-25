// src/data/mockReports.js

const now = new Date();
const getOffsetDate = (daysAgo, hours = 14, minutes = 15) => {
  const d = new Date(now);
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
};

const getMonthOffsetDate = (monthsAgo, day = 15, hours = 15, minutes = 30) => {
  const d = new Date(now);
  d.setMonth(d.getMonth() - monthsAgo);
  d.setDate(day);
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
};

export const initialMockReports = [
  // Today's reports (Days Ago: 0)
  {
    id: 'REP-0001',
    reportCode: 'REP-2026-0001',
    patientId: 'PT-0001',
    patientCode: 'PT-0001',
    patientName: 'Robert Jenkins',
    tests: [
      {
        testName: 'Total Cholesterol',
        result: '238',
        unit: 'mg/dL',
        normalRange: '< 200',
        flag: 'High'
      },
      {
        testName: 'HDL Cholesterol (Good)',
        result: '38',
        unit: 'mg/dL',
        normalRange: '40 - 60',
        flag: 'Low'
      },
      {
        testName: 'LDL Cholesterol (Bad)',
        result: '154',
        unit: 'mg/dL',
        normalRange: '< 100',
        flag: 'High'
      },
      {
        testName: 'Serum Triglycerides',
        result: '185',
        unit: 'mg/dL',
        normalRange: '< 150',
        flag: 'High'
      }
    ],
    remarks: 'Lipid profile reveals mixed hyperlipidemia with elevated LDL and Triglycerides, and sub-optimal HDL. Dietary modification and clinical correlation with cardiovascular risk factors advised.',
    pathologistName: 'Dr. Sarah Mitchell, MD (Path)',
    signatureText: 'Dr. Sarah Mitchell, M.D. (Pathology)',
    generatedDate: getOffsetDate(0, 11, 30)
  },
  {
    id: 'REP-0002',
    reportCode: 'REP-2026-0002',
    patientId: 'PT-0002',
    patientCode: 'PT-0002',
    patientName: 'Amara Patel',
    tests: [
      {
        testName: 'Hemoglobin (Hb)',
        result: '10.8',
        unit: 'g/dL',
        normalRange: '12.0 - 15.0',
        flag: 'Low'
      },
      {
        testName: 'Total Leukocyte Count (WBC)',
        result: '7200',
        unit: '/cumm',
        normalRange: '4,000 - 11,000',
        flag: 'Normal'
      },
      {
        testName: 'Platelet Count',
        result: '2.80',
        unit: 'lakh/cumm',
        normalRange: '1.50 - 4.50',
        flag: 'Normal'
      },
      {
        testName: 'TSH (Ultrasensitive)',
        result: '6.45',
        unit: 'µIU/mL',
        normalRange: '0.35 - 4.94',
        flag: 'High'
      }
    ],
    remarks: 'Microcytic mild anemia noted with elevated TSH indicative of subclinical hypothyroidism. Iron profile and anti-TPO antibody evaluation suggested.',
    pathologistName: 'Dr. Sarah Mitchell, MD (Path)',
    signatureText: 'Dr. Sarah Mitchell, M.D. (Pathology)',
    generatedDate: getOffsetDate(0, 12, 45)
  },

  // Yesterday's reports (Days Ago: 1)
  {
    id: 'REP-0003',
    reportCode: 'REP-2026-0003',
    patientId: 'PT-0005',
    patientCode: 'PT-0005',
    patientName: 'Marcus Sterling',
    tests: [
      {
        testName: 'Total Bilirubin',
        result: '1.9',
        unit: 'mg/dL',
        normalRange: '0.2 - 1.2',
        flag: 'High'
      },
      {
        testName: 'SGOT / AST',
        result: '68',
        unit: 'U/L',
        normalRange: '5 - 40',
        flag: 'High'
      },
      {
        testName: 'SGPT / ALT',
        result: '82',
        unit: 'U/L',
        normalRange: '7 - 56',
        flag: 'High'
      },
      {
        testName: 'Alkaline Phosphatase (ALP)',
        result: '135',
        unit: 'U/L',
        normalRange: '44 - 147',
        flag: 'Normal'
      }
    ],
    remarks: 'Elevated transaminases and mild hyperbilirubinemia suggestive of acute hepatocellular injury or steatohepatitis. Viral markers and ultrasound abdomen advised.',
    pathologistName: 'Dr. Sarah Mitchell, MD (Path)',
    signatureText: 'Dr. Sarah Mitchell, M.D. (Pathology)',
    generatedDate: getOffsetDate(1, 12, 15)
  },
  {
    id: 'REP-0004',
    reportCode: 'REP-2026-0004',
    patientId: 'PT-0006',
    patientCode: 'PT-0006',
    patientName: 'Priya Sundaram',
    tests: [
      {
        testName: 'TSH (Ultrasensitive)',
        result: '2.15',
        unit: 'µIU/mL',
        normalRange: '0.35 - 4.94',
        flag: 'Normal'
      },
      {
        testName: 'Total T3',
        result: '124',
        unit: 'ng/dL',
        normalRange: '80 - 200',
        flag: 'Normal'
      },
      {
        testName: 'Total T4',
        result: '8.6',
        unit: 'µg/dL',
        normalRange: '5.1 - 14.1',
        flag: 'Normal'
      },
      {
        testName: 'Fasting Blood Glucose',
        result: '92',
        unit: 'mg/dL',
        normalRange: '70 - 99',
        flag: 'Normal'
      }
    ],
    remarks: 'Normal thyroid hormone profile and normal fasting glucose levels. Clinically euthyroid.',
    pathologistName: 'Dr. Sarah Mitchell, MD (Path)',
    signatureText: 'Dr. Sarah Mitchell, M.D. (Pathology)',
    generatedDate: getOffsetDate(1, 15, 30)
  },

  // This Month
  {
    id: 'REP-0005',
    reportCode: 'REP-2026-0005',
    patientId: 'PT-0008',
    patientCode: 'PT-0008',
    patientName: 'Fatima Al-Mansoor',
    tests: [
      {
        testName: 'Hemoglobin (Hb)',
        result: '13.4',
        unit: 'g/dL',
        normalRange: '12.0 - 15.0',
        flag: 'Normal'
      },
      {
        testName: 'Total Leukocyte Count (WBC)',
        result: '6800',
        unit: '/cumm',
        normalRange: '4,000 - 11,000',
        flag: 'Normal'
      },
      {
        testName: 'Fasting Blood Glucose',
        result: '96',
        unit: 'mg/dL',
        normalRange: '70 - 99',
        flag: 'Normal'
      }
    ],
    remarks: 'All analyzed parameters are within normal biological reference limits.',
    pathologistName: 'Dr. Sarah Mitchell, MD (Path)',
    signatureText: 'Dr. Sarah Mitchell, M.D. (Pathology)',
    generatedDate: getOffsetDate(3, 14, 0)
  },
  {
    id: 'REP-0006',
    reportCode: 'REP-2026-0006',
    patientId: 'PT-0009',
    patientCode: 'PT-0009',
    patientName: 'Christopher Lee',
    tests: [
      {
        testName: 'Total Cholesterol',
        result: '210',
        unit: 'mg/dL',
        normalRange: '< 200',
        flag: 'High'
      },
      {
        testName: 'Serum Triglycerides',
        result: '165',
        unit: 'mg/dL',
        normalRange: '< 150',
        flag: 'High'
      },
      {
        testName: 'HbA1c (Glycated Hemoglobin)',
        result: '6.8',
        unit: '%',
        normalRange: '4.0 - 5.6',
        flag: 'High'
      }
    ],
    remarks: 'HbA1c indicates fair glycemic control in a diabetic patient. Mild dyslipidemia noted.',
    pathologistName: 'Dr. Sarah Mitchell, MD (Path)',
    signatureText: 'Dr. Sarah Mitchell, M.D. (Pathology)',
    generatedDate: getOffsetDate(6, 16, 20)
  },
  {
    id: 'REP-0007',
    reportCode: 'REP-2026-0007',
    patientId: 'PT-0010',
    patientCode: 'PT-0010',
    patientName: 'Sonia Fernandez',
    tests: [
      {
        testName: 'Hemoglobin (Hb)',
        result: '12.8',
        unit: 'g/dL',
        normalRange: '12.0 - 15.0',
        flag: 'Normal'
      },
      {
        testName: 'Platelet Count',
        result: '3.10',
        unit: 'lakh/cumm',
        normalRange: '1.50 - 4.50',
        flag: 'Normal'
      },
      {
        testName: 'Urine Protein (Albumin)',
        result: 'Traces',
        unit: 'Qualitative',
        normalRange: 'Nil / Negative',
        flag: 'Normal'
      },
      {
        testName: 'Pus Cells (WBCs)',
        result: '2 - 3',
        unit: '/hpf',
        normalRange: '0 - 5 /hpf',
        flag: 'Normal'
      }
    ],
    remarks: 'Routine urinalysis and hematology within physiological limits. No evidence of active urinary tract infection.',
    pathologistName: 'Dr. Sarah Mitchell, MD (Path)',
    signatureText: 'Dr. Sarah Mitchell, M.D. (Pathology)',
    generatedDate: getOffsetDate(10, 14, 45)
  },
  {
    id: 'REP-0008',
    reportCode: 'REP-2026-0008',
    patientId: 'PT-0011',
    patientCode: 'PT-0011',
    patientName: 'William Harrison',
    tests: [
      {
        testName: 'Serum Creatinine',
        result: '1.6',
        unit: 'mg/dL',
        normalRange: '0.7 - 1.3',
        flag: 'High'
      },
      {
        testName: 'Blood Urea',
        result: '48',
        unit: 'mg/dL',
        normalRange: '15 - 40',
        flag: 'High'
      },
      {
        testName: 'Total Bilirubin',
        result: '0.9',
        unit: 'mg/dL',
        normalRange: '0.2 - 1.2',
        flag: 'Normal'
      },
      {
        testName: 'SGPT / ALT',
        result: '28',
        unit: 'U/L',
        normalRange: '7 - 56',
        flag: 'Normal'
      }
    ],
    remarks: 'Moderate elevation in renal retention markers (Urea and Creatinine). Nephrology consultation and hydration review recommended.',
    pathologistName: 'Dr. Sarah Mitchell, MD (Path)',
    signatureText: 'Dr. Sarah Mitchell, M.D. (Pathology)',
    generatedDate: getOffsetDate(14, 17, 30)
  },
  {
    id: 'REP-0009',
    reportCode: 'REP-2026-0009',
    patientId: 'PT-0012',
    patientCode: 'PT-0012',
    patientName: 'Kavita Chawla',
    tests: [
      {
        testName: 'Fasting Blood Glucose',
        result: '142',
        unit: 'mg/dL',
        normalRange: '70 - 99',
        flag: 'High'
      },
      {
        testName: 'Postprandial Blood Glucose (PP)',
        result: '215',
        unit: 'mg/dL',
        normalRange: '70 - 140',
        flag: 'High'
      },
      {
        testName: 'HbA1c (Glycated Hemoglobin)',
        result: '8.4',
        unit: '%',
        normalRange: '4.0 - 5.6',
        flag: 'High'
      }
    ],
    remarks: 'Uncontrolled hyperglycemia documented across fasting, postprandial, and 3-month glycation metrics. Urgent endocrinology evaluation advised.',
    pathologistName: 'Dr. Sarah Mitchell, MD (Path)',
    signatureText: 'Dr. Sarah Mitchell, M.D. (Pathology)',
    generatedDate: getOffsetDate(18, 12, 0)
  },

  // Earlier Months of This Year
  {
    id: 'REP-0010',
    reportCode: 'REP-2026-0010',
    patientId: 'PT-0014',
    patientCode: 'PT-0014',
    patientName: 'Zara Washington',
    tests: [
      {
        testName: 'TSH (Ultrasensitive)',
        result: '1.82',
        unit: 'µIU/mL',
        normalRange: '0.35 - 4.94',
        flag: 'Normal'
      },
      {
        testName: 'Hemoglobin (Hb)',
        result: '13.1',
        unit: 'g/dL',
        normalRange: '12.0 - 15.0',
        flag: 'Normal'
      }
    ],
    remarks: 'Antenatal/general screening tests normal.',
    pathologistName: 'Dr. Sarah Mitchell, MD (Path)',
    signatureText: 'Dr. Sarah Mitchell, M.D. (Pathology)',
    generatedDate: getMonthOffsetDate(1, 12, 14, 0)
  },
  {
    id: 'REP-0011',
    reportCode: 'REP-2026-0011',
    patientId: 'PT-0015',
    patientCode: 'PT-0015',
    patientName: 'Vikram Sengupta',
    tests: [
      {
        testName: 'Total Cholesterol',
        result: '190',
        unit: 'mg/dL',
        normalRange: '< 200',
        flag: 'Normal'
      },
      {
        testName: 'HDL Cholesterol (Good)',
        result: '44',
        unit: 'mg/dL',
        normalRange: '40 - 60',
        flag: 'Normal'
      },
      {
        testName: 'LDL Cholesterol (Bad)',
        result: '98',
        unit: 'mg/dL',
        normalRange: '< 100',
        flag: 'Normal'
      }
    ],
    remarks: 'Lipid profile parameters well controlled within target ranges.',
    pathologistName: 'Dr. Sarah Mitchell, MD (Path)',
    signatureText: 'Dr. Sarah Mitchell, M.D. (Pathology)',
    generatedDate: getMonthOffsetDate(2, 8, 16, 0)
  },
  {
    id: 'REP-0012',
    reportCode: 'REP-2026-0012',
    patientId: 'PT-0016',
    patientCode: 'PT-0016',
    patientName: 'Chloe Bennett',
    tests: [
      {
        testName: 'Hemoglobin (Hb)',
        result: '13.8',
        unit: 'g/dL',
        normalRange: '12.0 - 15.0',
        flag: 'Normal'
      },
      {
        testName: 'Total Leukocyte Count (WBC)',
        result: '6100',
        unit: '/cumm',
        normalRange: '4,000 - 11,000',
        flag: 'Normal'
      },
      {
        testName: 'Platelet Count',
        result: '2.45',
        unit: 'lakh/cumm',
        normalRange: '1.50 - 4.50',
        flag: 'Normal'
      }
    ],
    remarks: 'Hemogram indices unremarkable.',
    pathologistName: 'Dr. Sarah Mitchell, MD (Path)',
    signatureText: 'Dr. Sarah Mitchell, M.D. (Pathology)',
    generatedDate: getMonthOffsetDate(4, 20, 15, 30)
  },
  {
    id: 'REP-0013',
    reportCode: 'REP-2026-0013',
    patientId: 'PT-0017',
    patientCode: 'PT-0017',
    patientName: 'Rajesh Nair',
    tests: [
      {
        testName: 'Fasting Blood Glucose',
        result: '105',
        unit: 'mg/dL',
        normalRange: '70 - 99',
        flag: 'High'
      },
      {
        testName: 'HbA1c (Glycated Hemoglobin)',
        result: '5.9',
        unit: '%',
        normalRange: '4.0 - 5.6',
        flag: 'High'
      }
    ],
    remarks: 'Impaired fasting glucose and pre-diabetic state evidenced by HbA1c 5.9%. Lifestyle intervention advised.',
    pathologistName: 'Dr. Sarah Mitchell, MD (Path)',
    signatureText: 'Dr. Sarah Mitchell, M.D. (Pathology)',
    generatedDate: getMonthOffsetDate(6, 14, 16, 45)
  },
  {
    id: 'REP-0014',
    reportCode: 'REP-2026-0014',
    patientId: 'PT-0018',
    patientCode: 'PT-0018',
    patientName: 'Miriam O’Connor',
    tests: [
      {
        testName: 'Serum Creatinine',
        result: '0.9',
        unit: 'mg/dL',
        normalRange: '0.7 - 1.3',
        flag: 'Normal'
      },
      {
        testName: 'Blood Urea',
        result: '24',
        unit: 'mg/dL',
        normalRange: '15 - 40',
        flag: 'Normal'
      },
      {
        testName: 'Serum Uric Acid',
        result: '4.2',
        unit: 'mg/dL',
        normalRange: '3.5 - 7.2',
        flag: 'Normal'
      }
    ],
    remarks: 'Normal renal biochemistry.',
    pathologistName: 'Dr. Sarah Mitchell, MD (Path)',
    signatureText: 'Dr. Sarah Mitchell, M.D. (Pathology)',
    generatedDate: getMonthOffsetDate(8, 25, 14, 15)
  }
];
