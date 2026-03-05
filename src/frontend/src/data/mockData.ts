// Mock data for sections that don't have full backend support

export interface MockProvider {
  id: string;
  name: string;
  state: string;
  serviceType: string;
  beds?: number;
  accreditationStatus: "accredited" | "conditional" | "not-accredited";
  acqscStandards: number;
}

export const MOCK_PROVIDERS: MockProvider[] = [
  {
    id: "PROV-001",
    name: "Sunridge Aged Care",
    state: "NSW",
    serviceType: "Residential",
    beds: 120,
    accreditationStatus: "accredited",
    acqscStandards: 8,
  },
  {
    id: "PROV-002",
    name: "Bayside Home Care Services",
    state: "VIC",
    serviceType: "Home Care",
    accreditationStatus: "accredited",
    acqscStandards: 8,
  },
  {
    id: "PROV-003",
    name: "Central Queensland Aged Care",
    state: "QLD",
    serviceType: "Residential",
    beds: 85,
    accreditationStatus: "conditional",
    acqscStandards: 6,
  },
  {
    id: "PROV-004",
    name: "Adelaide Southern Care",
    state: "SA",
    serviceType: "Residential",
    beds: 64,
    accreditationStatus: "accredited",
    acqscStandards: 8,
  },
  {
    id: "PROV-005",
    name: "Perth Metro Seniors Living",
    state: "WA",
    serviceType: "Residential",
    beds: 145,
    accreditationStatus: "accredited",
    acqscStandards: 8,
  },
  {
    id: "PROV-006",
    name: "Hobart Community Aged Care",
    state: "TAS",
    serviceType: "CHSP",
    accreditationStatus: "accredited",
    acqscStandards: 8,
  },
  {
    id: "PROV-007",
    name: "Darwin Territory Care",
    state: "NT",
    serviceType: "Home Care",
    accreditationStatus: "conditional",
    acqscStandards: 5,
  },
  {
    id: "PROV-008",
    name: "ACT Aged Services",
    state: "ACT",
    serviceType: "Residential",
    beds: 78,
    accreditationStatus: "accredited",
    acqscStandards: 8,
  },
  {
    id: "PROV-009",
    name: "Hunter Valley Care Group",
    state: "NSW",
    serviceType: "Residential",
    beds: 112,
    accreditationStatus: "accredited",
    acqscStandards: 7,
  },
  {
    id: "PROV-010",
    name: "Geelong Aged Care Network",
    state: "VIC",
    serviceType: "CHSP",
    accreditationStatus: "accredited",
    acqscStandards: 8,
  },
];

export const NATIONAL_TRENDS = [
  { quarter: "Q1-2025", safetyScore: 72.4, preventiveScore: 68.1 },
  { quarter: "Q2-2025", safetyScore: 74.8, preventiveScore: 70.5 },
  { quarter: "Q3-2025", safetyScore: 76.2, preventiveScore: 73.3 },
  { quarter: "Q4-2025", safetyScore: 78.1, preventiveScore: 76.8 },
];

export const STATE_ADVERSE_EVENTS = [
  { state: "NSW", rate: 8.4 },
  { state: "VIC", rate: 7.2 },
  { state: "QLD", rate: 9.8 },
  { state: "SA", rate: 11.2 },
  { state: "WA", rate: 10.5 },
  { state: "TAS", rate: 6.8 },
  { state: "NT", rate: 14.3 },
  { state: "ACT", rate: 7.6 },
];

export const RECENT_SUBMISSIONS = [
  {
    id: "SUB-2025-1241",
    provider: "Sunridge Aged Care",
    quarter: "Q4-2025",
    type: "FHIR API",
    records: 1842,
    status: "processed",
    submitted: "2025-11-28",
  },
  {
    id: "SUB-2025-1240",
    provider: "Perth Metro Seniors Living",
    quarter: "Q4-2025",
    type: "CSV Upload",
    records: 3201,
    status: "validating",
    submitted: "2025-11-27",
  },
  {
    id: "SUB-2025-1239",
    provider: "Central Queensland Aged Care",
    quarter: "Q4-2025",
    type: "Manual Entry",
    records: 956,
    status: "validation_error",
    submitted: "2025-11-26",
  },
  {
    id: "SUB-2025-1238",
    provider: "Bayside Home Care Services",
    quarter: "Q4-2025",
    type: "FHIR API",
    records: 2104,
    status: "processed",
    submitted: "2025-11-25",
  },
  {
    id: "SUB-2025-1237",
    provider: "Adelaide Southern Care",
    quarter: "Q4-2025",
    type: "FHIR API",
    records: 1578,
    status: "processed",
    submitted: "2025-11-24",
  },
];

export type StateKey =
  | "NSW"
  | "VIC"
  | "QLD"
  | "SA"
  | "WA"
  | "TAS"
  | "NT"
  | "ACT";

export const REGIONAL_DATA: Record<
  StateKey,
  {
    regions: Array<{
      region: string;
      providers: number;
      avgSafety: number;
      avgPreventive: number;
      screeningCompliance: number;
      highRiskPrevalence: number;
      adverseEvents: number;
      equityGap: number;
    }>;
    radarProfile: Array<{
      dimension: string;
      score: number;
      benchmark: number;
    }>;
  }
> = {
  NSW: {
    regions: [
      {
        region: "Sydney Metro",
        providers: 312,
        avgSafety: 79.2,
        avgPreventive: 77.4,
        screeningCompliance: 88.1,
        highRiskPrevalence: 14.2,
        adverseEvents: 7.8,
        equityGap: 5.2,
      },
      {
        region: "Hunter & Central Coast",
        providers: 89,
        avgSafety: 75.8,
        avgPreventive: 73.2,
        screeningCompliance: 82.4,
        highRiskPrevalence: 17.5,
        adverseEvents: 9.4,
        equityGap: 7.8,
      },
      {
        region: "Illawarra & South Coast",
        providers: 67,
        avgSafety: 77.1,
        avgPreventive: 74.8,
        screeningCompliance: 85.3,
        highRiskPrevalence: 15.8,
        adverseEvents: 8.6,
        equityGap: 6.4,
      },
      {
        region: "New England & North West",
        providers: 44,
        avgSafety: 68.4,
        avgPreventive: 65.1,
        screeningCompliance: 71.2,
        highRiskPrevalence: 22.4,
        adverseEvents: 13.8,
        equityGap: 14.2,
      },
      {
        region: "Far West & Western",
        providers: 18,
        avgSafety: 61.2,
        avgPreventive: 58.4,
        screeningCompliance: 64.8,
        highRiskPrevalence: 28.6,
        adverseEvents: 16.4,
        equityGap: 21.5,
      },
    ],
    radarProfile: [
      { dimension: "Safety", score: 74.8, benchmark: 76.2 },
      { dimension: "Preventive", score: 72.1, benchmark: 73.8 },
      { dimension: "Experience", score: 78.4, benchmark: 75.0 },
      { dimension: "Equity", score: 65.2, benchmark: 70.0 },
      { dimension: "Data Quality", score: 82.1, benchmark: 80.0 },
      { dimension: "Compliance", score: 84.3, benchmark: 82.0 },
    ],
  },
  VIC: {
    regions: [
      {
        region: "Melbourne Metro",
        providers: 287,
        avgSafety: 81.4,
        avgPreventive: 79.2,
        screeningCompliance: 89.4,
        highRiskPrevalence: 13.1,
        adverseEvents: 6.9,
        equityGap: 4.8,
      },
      {
        region: "Barwon South West",
        providers: 72,
        avgSafety: 77.8,
        avgPreventive: 75.4,
        screeningCompliance: 83.6,
        highRiskPrevalence: 16.2,
        adverseEvents: 8.2,
        equityGap: 7.1,
      },
      {
        region: "Grampians",
        providers: 38,
        avgSafety: 72.1,
        avgPreventive: 68.9,
        screeningCompliance: 76.4,
        highRiskPrevalence: 20.8,
        adverseEvents: 11.4,
        equityGap: 11.8,
      },
      {
        region: "Loddon Mallee",
        providers: 41,
        avgSafety: 73.6,
        avgPreventive: 70.2,
        screeningCompliance: 78.1,
        highRiskPrevalence: 19.4,
        adverseEvents: 10.8,
        equityGap: 10.2,
      },
      {
        region: "Gippsland",
        providers: 45,
        avgSafety: 74.2,
        avgPreventive: 71.8,
        screeningCompliance: 80.2,
        highRiskPrevalence: 18.1,
        adverseEvents: 9.8,
        equityGap: 9.4,
      },
    ],
    radarProfile: [
      { dimension: "Safety", score: 78.4, benchmark: 76.2 },
      { dimension: "Preventive", score: 76.2, benchmark: 73.8 },
      { dimension: "Experience", score: 80.1, benchmark: 75.0 },
      { dimension: "Equity", score: 68.4, benchmark: 70.0 },
      { dimension: "Data Quality", score: 85.2, benchmark: 80.0 },
      { dimension: "Compliance", score: 87.4, benchmark: 82.0 },
    ],
  },
  QLD: {
    regions: [
      {
        region: "Brisbane Metro",
        providers: 198,
        avgSafety: 77.2,
        avgPreventive: 75.1,
        screeningCompliance: 86.2,
        highRiskPrevalence: 15.4,
        adverseEvents: 8.4,
        equityGap: 6.2,
      },
      {
        region: "Gold Coast",
        providers: 84,
        avgSafety: 78.8,
        avgPreventive: 76.4,
        screeningCompliance: 87.1,
        highRiskPrevalence: 14.8,
        adverseEvents: 7.8,
        equityGap: 5.4,
      },
      {
        region: "Sunshine Coast & Hinterland",
        providers: 61,
        avgSafety: 76.4,
        avgPreventive: 73.8,
        screeningCompliance: 84.8,
        highRiskPrevalence: 16.2,
        adverseEvents: 8.9,
        equityGap: 7.2,
      },
      {
        region: "Central Queensland",
        providers: 42,
        avgSafety: 69.8,
        avgPreventive: 66.4,
        screeningCompliance: 72.4,
        highRiskPrevalence: 23.8,
        adverseEvents: 12.8,
        equityGap: 15.4,
      },
      {
        region: "Far North Queensland",
        providers: 31,
        avgSafety: 62.4,
        avgPreventive: 59.8,
        screeningCompliance: 67.4,
        highRiskPrevalence: 31.4,
        adverseEvents: 17.8,
        equityGap: 22.8,
      },
    ],
    radarProfile: [
      { dimension: "Safety", score: 73.2, benchmark: 76.2 },
      { dimension: "Preventive", score: 70.8, benchmark: 73.8 },
      { dimension: "Experience", score: 76.8, benchmark: 75.0 },
      { dimension: "Equity", score: 62.4, benchmark: 70.0 },
      { dimension: "Data Quality", score: 79.2, benchmark: 80.0 },
      { dimension: "Compliance", score: 81.8, benchmark: 82.0 },
    ],
  },
  SA: {
    regions: [
      {
        region: "Adelaide Metro",
        providers: 142,
        avgSafety: 75.8,
        avgPreventive: 73.4,
        screeningCompliance: 83.8,
        highRiskPrevalence: 16.8,
        adverseEvents: 9.8,
        equityGap: 8.4,
      },
      {
        region: "Barossa, Light & Lower North",
        providers: 28,
        avgSafety: 72.4,
        avgPreventive: 69.8,
        screeningCompliance: 78.4,
        highRiskPrevalence: 20.4,
        adverseEvents: 11.8,
        equityGap: 12.4,
      },
      {
        region: "Fleurieu & Kangaroo Island",
        providers: 19,
        avgSafety: 70.8,
        avgPreventive: 67.4,
        screeningCompliance: 74.8,
        highRiskPrevalence: 22.8,
        adverseEvents: 13.4,
        equityGap: 14.8,
      },
      {
        region: "Eyre & Western",
        providers: 12,
        avgSafety: 63.4,
        avgPreventive: 60.8,
        screeningCompliance: 66.4,
        highRiskPrevalence: 29.8,
        adverseEvents: 16.8,
        equityGap: 20.4,
      },
    ],
    radarProfile: [
      { dimension: "Safety", score: 71.8, benchmark: 76.2 },
      { dimension: "Preventive", score: 69.4, benchmark: 73.8 },
      { dimension: "Experience", score: 74.2, benchmark: 75.0 },
      { dimension: "Equity", score: 60.8, benchmark: 70.0 },
      { dimension: "Data Quality", score: 77.4, benchmark: 80.0 },
      { dimension: "Compliance", score: 80.2, benchmark: 82.0 },
    ],
  },
  WA: {
    regions: [
      {
        region: "Perth Metro",
        providers: 168,
        avgSafety: 76.8,
        avgPreventive: 74.2,
        screeningCompliance: 84.8,
        highRiskPrevalence: 15.8,
        adverseEvents: 9.4,
        equityGap: 7.8,
      },
      {
        region: "Bunbury & South West",
        providers: 38,
        avgSafety: 73.4,
        avgPreventive: 70.8,
        screeningCompliance: 79.4,
        highRiskPrevalence: 19.8,
        adverseEvents: 11.4,
        equityGap: 11.8,
      },
      {
        region: "Midwest & Gascoyne",
        providers: 14,
        avgSafety: 64.8,
        avgPreventive: 62.4,
        screeningCompliance: 68.4,
        highRiskPrevalence: 28.4,
        adverseEvents: 15.8,
        equityGap: 19.4,
      },
      {
        region: "Pilbara & Kimberley",
        providers: 8,
        avgSafety: 58.4,
        avgPreventive: 55.8,
        screeningCompliance: 61.4,
        highRiskPrevalence: 34.8,
        adverseEvents: 20.4,
        equityGap: 26.4,
      },
    ],
    radarProfile: [
      { dimension: "Safety", score: 72.4, benchmark: 76.2 },
      { dimension: "Preventive", score: 70.2, benchmark: 73.8 },
      { dimension: "Experience", score: 75.8, benchmark: 75.0 },
      { dimension: "Equity", score: 60.4, benchmark: 70.0 },
      { dimension: "Data Quality", score: 78.8, benchmark: 80.0 },
      { dimension: "Compliance", score: 82.4, benchmark: 82.0 },
    ],
  },
  TAS: {
    regions: [
      {
        region: "Greater Hobart",
        providers: 42,
        avgSafety: 78.4,
        avgPreventive: 76.8,
        screeningCompliance: 87.4,
        highRiskPrevalence: 14.2,
        adverseEvents: 7.2,
        equityGap: 5.8,
      },
      {
        region: "Launceston & North East",
        providers: 28,
        avgSafety: 75.2,
        avgPreventive: 73.4,
        screeningCompliance: 83.8,
        highRiskPrevalence: 17.4,
        adverseEvents: 8.8,
        equityGap: 8.4,
      },
      {
        region: "West & North West",
        providers: 18,
        avgSafety: 70.8,
        avgPreventive: 68.4,
        screeningCompliance: 76.4,
        highRiskPrevalence: 22.4,
        adverseEvents: 11.8,
        equityGap: 13.8,
      },
    ],
    radarProfile: [
      { dimension: "Safety", score: 76.4, benchmark: 76.2 },
      { dimension: "Preventive", score: 74.8, benchmark: 73.8 },
      { dimension: "Experience", score: 79.2, benchmark: 75.0 },
      { dimension: "Equity", score: 66.8, benchmark: 70.0 },
      { dimension: "Data Quality", score: 83.4, benchmark: 80.0 },
      { dimension: "Compliance", score: 86.2, benchmark: 82.0 },
    ],
  },
  NT: {
    regions: [
      {
        region: "Darwin & Palmerston",
        providers: 18,
        avgSafety: 68.4,
        avgPreventive: 65.8,
        screeningCompliance: 71.4,
        highRiskPrevalence: 24.8,
        adverseEvents: 14.8,
        equityGap: 18.4,
      },
      {
        region: "Alice Springs & Central",
        providers: 8,
        avgSafety: 58.8,
        avgPreventive: 55.4,
        screeningCompliance: 62.4,
        highRiskPrevalence: 34.2,
        adverseEvents: 19.8,
        equityGap: 28.4,
      },
      {
        region: "Katherine & Remote",
        providers: 5,
        avgSafety: 52.4,
        avgPreventive: 49.8,
        screeningCompliance: 55.8,
        highRiskPrevalence: 41.8,
        adverseEvents: 24.4,
        equityGap: 34.8,
      },
    ],
    radarProfile: [
      { dimension: "Safety", score: 62.4, benchmark: 76.2 },
      { dimension: "Preventive", score: 59.8, benchmark: 73.8 },
      { dimension: "Experience", score: 66.4, benchmark: 75.0 },
      { dimension: "Equity", score: 48.4, benchmark: 70.0 },
      { dimension: "Data Quality", score: 68.2, benchmark: 80.0 },
      { dimension: "Compliance", score: 71.8, benchmark: 82.0 },
    ],
  },
  ACT: {
    regions: [
      {
        region: "Canberra North",
        providers: 14,
        avgSafety: 80.8,
        avgPreventive: 79.4,
        screeningCompliance: 90.4,
        highRiskPrevalence: 12.4,
        adverseEvents: 6.8,
        equityGap: 4.2,
      },
      {
        region: "Canberra South",
        providers: 12,
        avgSafety: 79.4,
        avgPreventive: 78.2,
        screeningCompliance: 89.8,
        highRiskPrevalence: 13.2,
        adverseEvents: 7.2,
        equityGap: 4.8,
      },
      {
        region: "Queanbeyan & Surrounds",
        providers: 8,
        avgSafety: 76.8,
        avgPreventive: 75.4,
        screeningCompliance: 86.4,
        highRiskPrevalence: 15.8,
        adverseEvents: 8.4,
        equityGap: 6.4,
      },
    ],
    radarProfile: [
      { dimension: "Safety", score: 80.2, benchmark: 76.2 },
      { dimension: "Preventive", score: 78.8, benchmark: 73.8 },
      { dimension: "Experience", score: 82.4, benchmark: 75.0 },
      { dimension: "Equity", score: 70.8, benchmark: 70.0 },
      { dimension: "Data Quality", score: 88.4, benchmark: 80.0 },
      { dimension: "Compliance", score: 90.2, benchmark: 82.0 },
    ],
  },
};

export const MOCK_SCORECARDS = (providerId: string) =>
  [
    {
      quarter: "Q1-2025",
      overallScore: 72.4,
      safetyScore: 74.2,
      preventiveScore: 70.1,
      experienceScore: 75.8,
      equityScore: 68.2,
      qualityScore: 78.4,
      staffingScore: 71.2,
      complianceScore: 80.6,
      quintileRank: 3,
    },
    {
      quarter: "Q2-2025",
      overallScore: 74.8,
      safetyScore: 76.4,
      preventiveScore: 72.8,
      experienceScore: 77.1,
      equityScore: 70.4,
      qualityScore: 80.1,
      staffingScore: 73.8,
      complianceScore: 82.4,
      quintileRank: 2,
    },
    {
      quarter: "Q3-2025",
      overallScore: 76.2,
      safetyScore: 78.1,
      preventiveScore: 74.4,
      experienceScore: 78.4,
      equityScore: 72.8,
      qualityScore: 81.8,
      staffingScore: 75.9,
      complianceScore: 83.8,
      quintileRank: 2,
    },
    {
      quarter: "Q4-2025",
      overallScore: 78.1,
      safetyScore: 80.2,
      preventiveScore: 76.8,
      experienceScore: 80.1,
      equityScore: 74.2,
      qualityScore: 82.1,
      staffingScore: 77.4,
      complianceScore: 85.0,
      quintileRank: 2,
    },
  ].map((s, i) => ({ ...s, id: `SC-${providerId}-${i}`, providerId }));

export const MOCK_INDICATORS = (providerId: string) => [
  {
    id: `IND-${providerId}-1`,
    providerId,
    quarter: "Q4-2025",
    dimension: "Safety",
    indicatorCode: "SAF-001",
    indicatorName: "Falls with Harm Rate",
    rate: 4.2,
    nationalBenchmark: 5.1,
    quintileRank: 2,
    trend: "improving",
  },
  {
    id: `IND-${providerId}-2`,
    providerId,
    quarter: "Q4-2025",
    dimension: "Safety",
    indicatorCode: "SAF-002",
    indicatorName: "Medication-Related Harm",
    rate: 2.8,
    nationalBenchmark: 3.2,
    quintileRank: 2,
    trend: "stable",
  },
  {
    id: `IND-${providerId}-3`,
    providerId,
    quarter: "Q4-2025",
    dimension: "Safety",
    indicatorCode: "SAF-003",
    indicatorName: "High-Risk Medication Prevalence",
    rate: 18.4,
    nationalBenchmark: 21.2,
    quintileRank: 2,
    trend: "improving",
  },
  {
    id: `IND-${providerId}-4`,
    providerId,
    quarter: "Q4-2025",
    dimension: "Safety",
    indicatorCode: "SAF-004",
    indicatorName: "Polypharmacy ≥10 Medications",
    rate: 12.1,
    nationalBenchmark: 14.8,
    quintileRank: 2,
    trend: "stable",
  },
  {
    id: `IND-${providerId}-5`,
    providerId,
    quarter: "Q4-2025",
    dimension: "Safety",
    indicatorCode: "SAF-005",
    indicatorName: "Pressure Injuries Stage 2–4",
    rate: 1.8,
    nationalBenchmark: 2.4,
    quintileRank: 2,
    trend: "improving",
  },
  {
    id: `IND-${providerId}-6`,
    providerId,
    quarter: "Q4-2025",
    dimension: "Safety",
    indicatorCode: "SAF-006",
    indicatorName: "ED Presentations (30-day)",
    rate: 8.4,
    nationalBenchmark: 10.2,
    quintileRank: 2,
    trend: "improving",
  },
  {
    id: `IND-${providerId}-7`,
    providerId,
    quarter: "Q4-2025",
    dimension: "Preventive",
    indicatorCode: "PRV-001",
    indicatorName: "Falls Risk Screening Completion",
    rate: 94.2,
    nationalBenchmark: 88.4,
    quintileRank: 1,
    trend: "improving",
  },
  {
    id: `IND-${providerId}-8`,
    providerId,
    quarter: "Q4-2025",
    dimension: "Preventive",
    indicatorCode: "PRV-002",
    indicatorName: "Depression Screening (GDS/PHQ-9)",
    rate: 88.4,
    nationalBenchmark: 82.1,
    quintileRank: 1,
    trend: "improving",
  },
  {
    id: `IND-${providerId}-9`,
    providerId,
    quarter: "Q4-2025",
    dimension: "Preventive",
    indicatorCode: "PRV-003",
    indicatorName: "Malnutrition Screening",
    rate: 91.2,
    nationalBenchmark: 85.8,
    quintileRank: 1,
    trend: "stable",
  },
  {
    id: `IND-${providerId}-10`,
    providerId,
    quarter: "Q4-2025",
    dimension: "Preventive",
    indicatorCode: "PRV-004",
    indicatorName: "Oral Health Assessment",
    rate: 82.4,
    nationalBenchmark: 78.4,
    quintileRank: 2,
    trend: "improving",
  },
  {
    id: `IND-${providerId}-11`,
    providerId,
    quarter: "Q4-2025",
    dimension: "Experience",
    indicatorCode: "EXP-001",
    indicatorName: "Complaint Rate",
    rate: 3.2,
    nationalBenchmark: 4.8,
    quintileRank: 1,
    trend: "improving",
  },
  {
    id: `IND-${providerId}-12`,
    providerId,
    quarter: "Q4-2025",
    dimension: "Experience",
    indicatorCode: "EXP-002",
    indicatorName: "Satisfaction Survey Score",
    rate: 84.8,
    nationalBenchmark: 80.2,
    quintileRank: 1,
    trend: "stable",
  },
  {
    id: `IND-${providerId}-13`,
    providerId,
    quarter: "Q4-2025",
    dimension: "Experience",
    indicatorCode: "EXP-003",
    indicatorName: "Social Engagement Rate",
    rate: 72.4,
    nationalBenchmark: 68.8,
    quintileRank: 2,
    trend: "improving",
  },
  {
    id: `IND-${providerId}-14`,
    providerId,
    quarter: "Q4-2025",
    dimension: "Equity",
    indicatorCode: "EQT-001",
    indicatorName: "Referral-to-Placement Time (days)",
    rate: 18.4,
    nationalBenchmark: 22.8,
    quintileRank: 2,
    trend: "improving",
  },
  {
    id: `IND-${providerId}-15`,
    providerId,
    quarter: "Q4-2025",
    dimension: "Equity",
    indicatorCode: "EQT-002",
    indicatorName: "CALD Access Gap",
    rate: 8.4,
    nationalBenchmark: 12.2,
    quintileRank: 2,
    trend: "stable",
  },
];

export const PAY_FOR_IMPROVEMENT_DATA = [
  {
    id: "PFI-001",
    provider: "Sunridge Aged Care",
    metric: "ED Reduction 90-Day",
    baseline: 12.4,
    current: 9.8,
    improvement: 21.0,
    threshold: 15.0,
    eligible: true,
    funding: 142000,
  },
  {
    id: "PFI-002",
    provider: "Sunridge Aged Care",
    metric: "Deprescribing Rate",
    baseline: 18.3,
    current: 24.7,
    improvement: 35.0,
    threshold: 20.0,
    eligible: true,
    funding: 89500,
  },
  {
    id: "PFI-003",
    provider: "Perth Metro Seniors Living",
    metric: "Hospitalization Reduction",
    baseline: 8.2,
    current: 7.1,
    improvement: 13.4,
    threshold: 15.0,
    eligible: false,
    funding: 0,
  },
  {
    id: "PFI-004",
    provider: "Perth Metro Seniors Living",
    metric: "Screening Completion",
    baseline: 71.0,
    current: 89.0,
    improvement: 25.4,
    threshold: 20.0,
    eligible: true,
    funding: 78200,
  },
  {
    id: "PFI-005",
    provider: "Bayside Home Care Services",
    metric: "Social Participation",
    baseline: 42.0,
    current: 51.0,
    improvement: 21.4,
    threshold: 15.0,
    eligible: true,
    funding: 54800,
  },
  {
    id: "PFI-006",
    provider: "Adelaide Southern Care",
    metric: "ED Reduction 90-Day",
    baseline: 14.8,
    current: 11.2,
    improvement: 24.3,
    threshold: 15.0,
    eligible: true,
    funding: 98400,
  },
  {
    id: "PFI-007",
    provider: "Central Queensland Aged Care",
    metric: "Hospitalization Reduction",
    baseline: 10.4,
    current: 9.8,
    improvement: 5.8,
    threshold: 15.0,
    eligible: false,
    funding: 0,
  },
  {
    id: "PFI-008",
    provider: "Hunter Valley Care Group",
    metric: "Deprescribing Rate",
    baseline: 15.8,
    current: 21.4,
    improvement: 35.4,
    threshold: 20.0,
    eligible: true,
    funding: 72400,
  },
];

export const PAY_FOR_IMPROVEMENT_THRESHOLDS = [
  {
    metric: "ED Reduction 90-Day",
    threshold: 15.0,
    unit: "% reduction",
    description: "90-day emergency department presentation reduction",
  },
  {
    metric: "Hospitalization Reduction",
    threshold: 15.0,
    unit: "% reduction",
    description: "Unplanned hospitalization reduction",
  },
  {
    metric: "Deprescribing Rate",
    threshold: 20.0,
    unit: "% improvement",
    description: "Reduction in high-risk/unnecessary medications",
  },
  {
    metric: "Screening Completion",
    threshold: 20.0,
    unit: "% point improvement",
    description: "Mandatory screening bundle completion rate",
  },
  {
    metric: "Social Participation",
    threshold: 15.0,
    unit: "% improvement",
    description: "Resident social engagement and activities participation",
  },
];

export const DATA_QUALITY_RECORDS = [
  {
    id: "DQ-2025-001",
    provider: "Sunridge Aged Care",
    quarter: "Q4-2025",
    type: "FHIR API",
    records: 1842,
    validationErrors: 0,
    qualityScore: 98.4,
    status: "processed",
    submittedDate: "2025-11-28",
  },
  {
    id: "DQ-2025-002",
    provider: "Perth Metro Seniors Living",
    quarter: "Q4-2025",
    type: "CSV Upload",
    records: 3201,
    validationErrors: 12,
    qualityScore: 96.2,
    status: "processed",
    submittedDate: "2025-11-27",
  },
  {
    id: "DQ-2025-003",
    provider: "Central Queensland Aged Care",
    quarter: "Q4-2025",
    type: "Manual Entry",
    records: 956,
    validationErrors: 47,
    qualityScore: 72.4,
    status: "validation_error",
    submittedDate: "2025-11-26",
  },
  {
    id: "DQ-2025-004",
    provider: "Bayside Home Care Services",
    quarter: "Q4-2025",
    type: "FHIR API",
    records: 2104,
    validationErrors: 3,
    qualityScore: 97.8,
    status: "processed",
    submittedDate: "2025-11-25",
  },
  {
    id: "DQ-2025-005",
    provider: "Adelaide Southern Care",
    quarter: "Q4-2025",
    type: "FHIR API",
    records: 1578,
    validationErrors: 8,
    qualityScore: 94.8,
    status: "processed",
    submittedDate: "2025-11-24",
  },
  {
    id: "DQ-2025-006",
    provider: "Hobart Community Aged Care",
    quarter: "Q4-2025",
    type: "CSV Upload",
    records: 842,
    validationErrors: 28,
    qualityScore: 81.2,
    status: "processed",
    submittedDate: "2025-11-23",
  },
  {
    id: "DQ-2025-007",
    provider: "Darwin Territory Care",
    quarter: "Q4-2025",
    type: "CSV Upload",
    records: 421,
    validationErrors: 84,
    qualityScore: 68.4,
    status: "validation_error",
    submittedDate: "2025-11-22",
  },
  {
    id: "DQ-2025-008",
    provider: "ACT Aged Services",
    quarter: "Q4-2025",
    type: "FHIR API",
    records: 1248,
    validationErrors: 2,
    qualityScore: 99.1,
    status: "processed",
    submittedDate: "2025-11-21",
  },
  {
    id: "DQ-2025-009",
    provider: "Hunter Valley Care Group",
    quarter: "Q4-2025",
    type: "FHIR API",
    records: 1924,
    validationErrors: 6,
    qualityScore: 96.8,
    status: "processed",
    submittedDate: "2025-11-20",
  },
  {
    id: "DQ-2025-010",
    provider: "Geelong Aged Care Network",
    quarter: "Q4-2025",
    type: "CSV Upload",
    records: 688,
    validationErrors: 18,
    qualityScore: 88.4,
    status: "validating",
    submittedDate: "2025-11-19",
  },
];

export const MOCK_HIGH_RISK_COHORTS = [
  {
    id: "HRC-001",
    providerId: "PROV-001",
    riskCriteria: "recent_hospital_discharge,polypharmacy_80plus",
    cohortSize: 12,
    flagDate: new Date("2025-11-20").getTime(),
    status: "active",
    urgency: "high",
  },
  {
    id: "HRC-002",
    providerId: "PROV-003",
    riskCriteria: "falls_history,dementia_bpsd",
    cohortSize: 8,
    flagDate: new Date("2025-11-18").getTime(),
    status: "active",
    urgency: "high",
  },
  {
    id: "HRC-003",
    providerId: "PROV-005",
    riskCriteria: "frailty_threshold,comorbidities_3plus",
    cohortSize: 23,
    flagDate: new Date("2025-11-15").getTime(),
    status: "monitoring",
    urgency: "medium",
  },
  {
    id: "HRC-004",
    providerId: "PROV-007",
    riskCriteria: "polypharmacy_80plus",
    cohortSize: 5,
    flagDate: new Date("2025-11-12").getTime(),
    status: "active",
    urgency: "high",
  },
  {
    id: "HRC-005",
    providerId: "PROV-002",
    riskCriteria: "recent_hospital_discharge",
    cohortSize: 14,
    flagDate: new Date("2025-11-10").getTime(),
    status: "monitoring",
    urgency: "medium",
  },
  {
    id: "HRC-006",
    providerId: "PROV-004",
    riskCriteria: "falls_history",
    cohortSize: 7,
    flagDate: new Date("2025-11-05").getTime(),
    status: "resolved",
    urgency: "low",
  },
  {
    id: "HRC-007",
    providerId: "PROV-009",
    riskCriteria: "dementia_bpsd,comorbidities_3plus",
    cohortSize: 18,
    flagDate: new Date("2025-11-28").getTime(),
    status: "active",
    urgency: "high",
  },
  {
    id: "HRC-008",
    providerId: "PROV-010",
    riskCriteria: "frailty_threshold",
    cohortSize: 9,
    flagDate: new Date("2025-11-25").getTime(),
    status: "monitoring",
    urgency: "medium",
  },
];

export const MOCK_SCREENING_WORKFLOWS = [
  {
    id: "WF-001",
    providerId: "PROV-001",
    screeningType: "falls_risk_assessment",
    dueDate: new Date("2025-12-01").getTime(),
    status: "overdue",
    completionTimeHours: 0,
  },
  {
    id: "WF-002",
    providerId: "PROV-001",
    screeningType: "medication_review",
    dueDate: new Date("2025-12-05").getTime(),
    status: "in_progress",
    completionTimeHours: 0,
  },
  {
    id: "WF-003",
    providerId: "PROV-002",
    screeningType: "cognitive_assessment",
    dueDate: new Date("2025-11-28").getTime(),
    status: "completed",
    completionTimeHours: 48.5,
  },
  {
    id: "WF-004",
    providerId: "PROV-003",
    screeningType: "nutritional_review",
    dueDate: new Date("2025-11-25").getTime(),
    status: "overdue",
    completionTimeHours: 0,
  },
  {
    id: "WF-005",
    providerId: "PROV-004",
    screeningType: "pain_assessment",
    dueDate: new Date("2025-12-10").getTime(),
    status: "pending",
    completionTimeHours: 0,
  },
  {
    id: "WF-006",
    providerId: "PROV-005",
    screeningType: "behavioral_assessment",
    dueDate: new Date("2025-12-08").getTime(),
    status: "in_progress",
    completionTimeHours: 0,
  },
  {
    id: "WF-007",
    providerId: "PROV-006",
    screeningType: "advance_care_planning",
    dueDate: new Date("2025-11-30").getTime(),
    status: "completed",
    completionTimeHours: 72.0,
  },
  {
    id: "WF-008",
    providerId: "PROV-007",
    screeningType: "falls_risk_assessment",
    dueDate: new Date("2025-11-22").getTime(),
    status: "overdue",
    completionTimeHours: 0,
  },
  {
    id: "WF-009",
    providerId: "PROV-008",
    screeningType: "medication_review",
    dueDate: new Date("2025-12-12").getTime(),
    status: "pending",
    completionTimeHours: 0,
  },
  {
    id: "WF-010",
    providerId: "PROV-009",
    screeningType: "cognitive_assessment",
    dueDate: new Date("2025-12-03").getTime(),
    status: "in_progress",
    completionTimeHours: 0,
  },
  {
    id: "WF-011",
    providerId: "PROV-010",
    screeningType: "nutritional_review",
    dueDate: new Date("2025-11-29").getTime(),
    status: "completed",
    completionTimeHours: 36.0,
  },
  {
    id: "WF-012",
    providerId: "PROV-003",
    screeningType: "behavioral_assessment",
    dueDate: new Date("2025-11-20").getTime(),
    status: "overdue",
    completionTimeHours: 0,
  },
];

export const MOCK_AUDIT_LOGS = [
  {
    id: "AL-001",
    userId: "USR-REG-0142",
    userRole: "Regulator",
    action: "VIEW_SCORECARD",
    entityType: "ProviderScorecard",
    timestamp: new Date("2025-11-28T14:23:11").getTime(),
    details: "Accessed Q4-2025 scorecard for Sunridge Aged Care",
  },
  {
    id: "AL-002",
    userId: "USR-PRV-0089",
    userRole: "Provider",
    action: "SUBMIT_DATA",
    entityType: "DataSubmission",
    timestamp: new Date("2025-11-28T11:45:02").getTime(),
    details: "Submitted Q4-2025 FHIR data batch (1842 records)",
  },
  {
    id: "AL-003",
    userId: "USR-REG-0142",
    userRole: "Regulator",
    action: "FLAG_COHORT",
    entityType: "HighRiskCohort",
    timestamp: new Date("2025-11-27T16:32:44").getTime(),
    details: "Flagged high-risk cohort HRC-007 for Hunter Valley Care Group",
  },
  {
    id: "AL-004",
    userId: "USR-POL-0031",
    userRole: "Policy Analyst",
    action: "EXPORT_REPORT",
    entityType: "NationalReport",
    timestamp: new Date("2025-11-27T09:18:33").getTime(),
    details: "Exported Q3-2025 National Overview report (PDF)",
  },
  {
    id: "AL-005",
    userId: "USR-PRV-0124",
    userRole: "Provider",
    action: "UPDATE_SCREENING",
    entityType: "ScreeningWorkflow",
    timestamp: new Date("2025-11-26T15:44:18").getTime(),
    details: "Marked WF-003 cognitive assessment as complete",
  },
  {
    id: "AL-006",
    userId: "USR-REG-0208",
    userRole: "Regulator",
    action: "VIEW_AUDIT_LOG",
    entityType: "AuditLog",
    timestamp: new Date("2025-11-26T10:22:07").getTime(),
    details: "Accessed audit log for period 2025-11-01 to 2025-11-26",
  },
  {
    id: "AL-007",
    userId: "USR-PRV-0089",
    userRole: "Provider",
    action: "UPDATE_SCREENING",
    entityType: "ScreeningWorkflow",
    timestamp: new Date("2025-11-25T14:11:55").getTime(),
    details: "Updated medication review WF-002 to in_progress",
  },
  {
    id: "AL-008",
    userId: "USR-POL-0055",
    userRole: "Policy Analyst",
    action: "VIEW_HEATMAP",
    entityType: "RegionalHeatmap",
    timestamp: new Date("2025-11-25T09:04:28").getTime(),
    details: "Accessed NT regional heatmap analysis",
  },
  {
    id: "AL-009",
    userId: "SYS-BATCH",
    userRole: "System",
    action: "GENERATE_SCORECARDS",
    entityType: "ProviderScorecard",
    timestamp: new Date("2025-11-24T02:00:00").getTime(),
    details: "Automated Q4-2025 scorecard generation for 2,743 providers",
  },
  {
    id: "AL-010",
    userId: "USR-REG-0142",
    userRole: "Regulator",
    action: "VIEW_HIGH_RISK",
    entityType: "HighRiskCohort",
    timestamp: new Date("2025-11-23T16:48:22").getTime(),
    details: "Reviewed all active high-risk cohorts",
  },
];

// ── Regional Provider Drill-Down ──────────────────────────────────────────────

export interface CityProvider {
  id: string;
  name: string;
  city: string;
  type: string; // "Residential" | "Home Care" | "Day Care"
  beds?: number;
  established: number;
  indicators: {
    residents: number;
    staffing: number;
    qualityMeasures: number;
    compliance: number;
    safetyClinical: number;
    preventiveCare: number;
    experience: number;
    equity: number;
  };
  indicatorMeta?: {
    [key: string]: {
      trend: "improving" | "declining" | "stable";
      insight: string;
    };
  };
}

export const CITY_PROVIDERS: Record<string, CityProvider[]> = {
  Hyderabad: [
    {
      id: "HYD-001",
      name: "Green Valley Aged Care",
      city: "Hyderabad",
      type: "Residential",
      beds: 95,
      established: 2008,
      indicators: {
        residents: 4.2,
        staffing: 4.5,
        qualityMeasures: 4.0,
        compliance: 4.8,
        safetyClinical: 4.3,
        preventiveCare: 4.1,
        experience: 4.6,
        equity: 3.9,
      },
      indicatorMeta: {
        residents: {
          trend: "improving",
          insight:
            "✅ This provider demonstrates strong performance in Resident Experience, above regional benchmark.",
        },
        staffing: {
          trend: "stable",
          insight:
            "✅ Staffing levels are consistent and above acceptable threshold. Coverage ratios meet national standards.",
        },
        qualityMeasures: {
          trend: "improving",
          insight:
            "✅ Quality Measures are trending positively with measurable improvement over the last two quarters.",
        },
        compliance: {
          trend: "stable",
          insight:
            "✅ Compliance score is excellent. All mandatory standards met with no outstanding notices.",
        },
        safetyClinical: {
          trend: "improving",
          insight:
            "✅ This provider demonstrates strong performance in this area, above regional benchmark.",
        },
        preventiveCare: {
          trend: "stable",
          insight:
            "ℹ Performance is within acceptable range. Minor improvement opportunities identified in cognitive assessment completion.",
        },
        experience: {
          trend: "improving",
          insight:
            "✅ Resident satisfaction surveys indicate consistently high experience scores across all care domains.",
        },
        equity: {
          trend: "stable",
          insight:
            "ℹ Equity access indicators are within range. CALD access gap is being monitored.",
        },
      },
    },
    {
      id: "HYD-002",
      name: "Sunrise Elder Support",
      city: "Hyderabad",
      type: "Home Care",
      established: 2014,
      indicators: {
        residents: 3.4,
        staffing: 2.5,
        qualityMeasures: 3.2,
        compliance: 3.6,
        safetyClinical: 1.8,
        preventiveCare: 2.1,
        experience: 3.3,
        equity: 3.0,
      },
      indicatorMeta: {
        residents: {
          trend: "declining",
          insight:
            "ℹ Resident Experience is below average. Complaint resolution times have increased in recent quarters.",
        },
        staffing: {
          trend: "declining",
          insight:
            "⚠ Staffing levels are below minimum thresholds. High turnover and unfilled positions are impacting care delivery.",
        },
        qualityMeasures: {
          trend: "stable",
          insight:
            "ℹ Quality Measures are marginally acceptable but trending toward concern. Improvement plan recommended.",
        },
        compliance: {
          trend: "stable",
          insight:
            "ℹ Compliance is within acceptable range but below regional peers. One open notice requires resolution.",
        },
        safetyClinical: {
          trend: "declining",
          insight:
            "⚠ This provider shows poor performance in Falls Risk Safety indicator due to higher incident rate compared to regional benchmark. Immediate review is recommended.",
        },
        preventiveCare: {
          trend: "declining",
          insight:
            "⚠ This provider has low Preventive Screening completion compared with national average. Falls risk and depression screening completion rates are critically low.",
        },
        experience: {
          trend: "declining",
          insight:
            "⚠ Resident experience scores are below acceptable range. Complaint rates are elevated compared to city average.",
        },
        equity: {
          trend: "stable",
          insight:
            "ℹ Equity access performance is marginally acceptable. Referral-to-placement times require attention.",
        },
      },
    },
    {
      id: "HYD-003",
      name: "Harmony Care Centre",
      city: "Hyderabad",
      type: "Residential",
      beds: 120,
      established: 2005,
      indicators: {
        residents: 4.5,
        staffing: 4.8,
        qualityMeasures: 4.4,
        compliance: 4.9,
        safetyClinical: 4.6,
        preventiveCare: 4.3,
        experience: 4.7,
        equity: 4.2,
      },
      indicatorMeta: {
        residents: {
          trend: "improving",
          insight:
            "✅ Resident Experience is consistently excellent. Satisfaction survey results place this provider in the top quintile nationally.",
        },
        staffing: {
          trend: "stable",
          insight:
            "✅ This provider demonstrates excellent performance in Staffing Coverage and Resident Experience.",
        },
        qualityMeasures: {
          trend: "improving",
          insight:
            "✅ Quality Measures are excellent, reflecting a culture of continuous improvement across all care domains.",
        },
        compliance: {
          trend: "stable",
          insight:
            "✅ Full compliance maintained. No outstanding notices. This provider is a model for regional peers.",
        },
        safetyClinical: {
          trend: "improving",
          insight:
            "✅ Safety and Clinical indicators are exemplary. Falls harm rate is significantly below regional benchmark.",
        },
        preventiveCare: {
          trend: "improving",
          insight:
            "✅ Preventive Care screening completion rates are among the highest in the region. All mandatory bundles are on track.",
        },
        experience: {
          trend: "improving",
          insight:
            "✅ Resident satisfaction is outstanding with very low complaint rates and strong social engagement metrics.",
        },
        equity: {
          trend: "stable",
          insight:
            "✅ Equity access performance is strong. CALD community access gaps are well-managed.",
        },
      },
    },
  ],
  Kolkata: [
    {
      id: "KOL-001",
      name: "Eastern Life Care",
      city: "Kolkata",
      type: "Residential",
      beds: 80,
      established: 2001,
      indicators: {
        residents: 3.5,
        staffing: 3.2,
        qualityMeasures: 3.4,
        compliance: 3.8,
        safetyClinical: 3.3,
        preventiveCare: 1.6,
        experience: 3.6,
        equity: 3.1,
      },
      indicatorMeta: {
        residents: {
          trend: "stable",
          insight:
            "ℹ Resident Experience is marginally acceptable. Survey completion rates are low, limiting data reliability.",
        },
        staffing: {
          trend: "declining",
          insight:
            "⚠ Staffing ratios are below regional average. Vacancy rates are elevated across clinical and support roles.",
        },
        qualityMeasures: {
          trend: "stable",
          insight:
            "ℹ Quality Measures performance is borderline. Structured improvement planning is recommended.",
        },
        compliance: {
          trend: "stable",
          insight:
            "ℹ Compliance is within minimum thresholds. One outstanding action item from last audit cycle.",
        },
        safetyClinical: {
          trend: "declining",
          insight:
            "⚠ Medication-related risk indicators are above acceptable threshold for this provider. Pharmacist review is overdue.",
        },
        preventiveCare: {
          trend: "declining",
          insight:
            "⚠ This provider has critically low Preventive Screening completion compared with national average. Malnutrition and cognitive assessments are significantly overdue.",
        },
        experience: {
          trend: "stable",
          insight:
            "ℹ Experience indicators are below average. Complaint resolution time exceeds the national benchmark.",
        },
        equity: {
          trend: "stable",
          insight:
            "ℹ Equity access is marginally adequate. CALD community representation gaps have been identified.",
        },
      },
    },
    {
      id: "KOL-002",
      name: "Bengal Senior Living",
      city: "Kolkata",
      type: "Residential",
      beds: 60,
      established: 1998,
      indicators: {
        residents: 4.1,
        staffing: 4.9,
        qualityMeasures: 4.0,
        compliance: 4.3,
        safetyClinical: 3.9,
        preventiveCare: 3.8,
        experience: 4.2,
        equity: 3.7,
      },
      indicatorMeta: {
        residents: {
          trend: "stable",
          insight:
            "✅ Resident Experience is strong, reflecting consistent quality care delivery and responsive management.",
        },
        staffing: {
          trend: "improving",
          insight:
            "✅ This provider demonstrates excellent performance in Staffing Coverage. Staff retention rates are the highest in the region and serve as a benchmark.",
        },
        qualityMeasures: {
          trend: "stable",
          insight:
            "✅ Quality Measures are performing well with consistent results over the last four quarters.",
        },
        compliance: {
          trend: "stable",
          insight:
            "✅ Compliance standards are well met. All mandatory reporting is submitted on time.",
        },
        safetyClinical: {
          trend: "stable",
          insight:
            "ℹ Safety and Clinical performance is within acceptable range. Falls prevention protocols are in place.",
        },
        preventiveCare: {
          trend: "improving",
          insight:
            "ℹ Preventive Care completion is improving. Screening bundles are being progressively completed.",
        },
        experience: {
          trend: "stable",
          insight:
            "✅ Experience indicators are above regional average. Resident feedback is consistently positive.",
        },
        equity: {
          trend: "stable",
          insight:
            "ℹ Equity performance is acceptable. Access gap monitoring is ongoing.",
        },
      },
    },
  ],
  Delhi: [
    {
      id: "DEL-001",
      name: "Capital Elder Home",
      city: "Delhi",
      type: "Residential",
      beds: 150,
      established: 2006,
      indicators: {
        residents: 4.5,
        staffing: 4.6,
        qualityMeasures: 4.4,
        compliance: 4.7,
        safetyClinical: 4.5,
        preventiveCare: 4.4,
        experience: 4.6,
        equity: 4.3,
      },
      indicatorMeta: {
        residents: {
          trend: "improving",
          insight:
            "✅ Resident Experience is consistently excellent, placing this provider in the top quintile nationally. Satisfaction scores have improved for three consecutive quarters.",
        },
        staffing: {
          trend: "stable",
          insight:
            "✅ Staffing performance is outstanding. All positions are filled with qualified staff and retention is above 90%.",
        },
        qualityMeasures: {
          trend: "improving",
          insight:
            "✅ Quality Measures demonstrate a strong continuous improvement culture. Peer review outcomes are consistently positive.",
        },
        compliance: {
          trend: "stable",
          insight:
            "✅ Full compliance with all ACQSC standards. No outstanding notices or conditions. A model for regional peers.",
        },
        safetyClinical: {
          trend: "improving",
          insight:
            "✅ Safety and Clinical performance is excellent. Falls harm rate and medication-related incidents are well below national average.",
        },
        preventiveCare: {
          trend: "stable",
          insight:
            "✅ Preventive Care completion rates are high across all mandatory screening bundles. Post-discharge protocols are consistently met.",
        },
        experience: {
          trend: "improving",
          insight:
            "✅ Experience indicators are outstanding. Complaint rates are the lowest in the region with rapid resolution times.",
        },
        equity: {
          trend: "stable",
          insight:
            "✅ Equity access performance is strong. CALD community access gaps are minimal and monitored proactively.",
        },
      },
    },
    {
      id: "DEL-002",
      name: "Silver Years Residency",
      city: "Delhi",
      type: "Residential",
      beds: 90,
      established: 2011,
      indicators: {
        residents: 3.6,
        staffing: 3.8,
        qualityMeasures: 3.5,
        compliance: 3.7,
        safetyClinical: 2.2,
        preventiveCare: 2.8,
        experience: 3.6,
        equity: 3.3,
      },
      indicatorMeta: {
        residents: {
          trend: "stable",
          insight:
            "ℹ Resident Experience is within acceptable range but below city average. Structured improvement planning is in progress.",
        },
        staffing: {
          trend: "stable",
          insight:
            "ℹ Staffing is marginally acceptable. Agency staff usage is elevated which may impact care continuity.",
        },
        qualityMeasures: {
          trend: "declining",
          insight:
            "ℹ Quality Measures are borderline. Incident trend analysis shows scope for improvement in clinical governance.",
        },
        compliance: {
          trend: "stable",
          insight:
            "ℹ Compliance meets minimum requirements. One condition from the last assessment cycle remains open.",
        },
        safetyClinical: {
          trend: "declining",
          insight:
            "⚠ This provider shows poor performance in Falls Risk Safety indicator due to higher incident rate compared to regional benchmark. A targeted safety improvement plan is required.",
        },
        preventiveCare: {
          trend: "declining",
          insight:
            "⚠ Preventive Screening completion is significantly below national average. Falls risk and oral health screening completion are critically low.",
        },
        experience: {
          trend: "stable",
          insight:
            "ℹ Experience scores are below average. Complaint resolution time has increased and requires management attention.",
        },
        equity: {
          trend: "stable",
          insight:
            "ℹ Equity access performance is acceptable. Referral-to-placement time is within range but above the regional average.",
        },
      },
    },
  ],
  Mumbai: [
    {
      id: "MUM-001",
      name: "Maitri Senior Care",
      city: "Mumbai",
      type: "Residential",
      beds: 110,
      established: 2009,
      indicators: {
        residents: 4.3,
        staffing: 4.6,
        qualityMeasures: 4.2,
        compliance: 4.7,
        safetyClinical: 4.4,
        preventiveCare: 4.1,
        experience: 4.5,
        equity: 4.0,
      },
    },
    {
      id: "MUM-002",
      name: "Vanaprastha Mumbai",
      city: "Mumbai",
      type: "Residential",
      beds: 85,
      established: 2013,
      indicators: {
        residents: 3.8,
        staffing: 4.1,
        qualityMeasures: 3.9,
        compliance: 4.4,
        safetyClinical: 4.0,
        preventiveCare: 3.7,
        experience: 4.2,
        equity: 3.6,
      },
    },
    {
      id: "MUM-003",
      name: "SilverBay Care",
      city: "Mumbai",
      type: "Home Care",
      established: 2016,
      indicators: {
        residents: 4.5,
        staffing: 4.7,
        qualityMeasures: 4.4,
        compliance: 4.9,
        safetyClinical: 4.6,
        preventiveCare: 4.3,
        experience: 4.7,
        equity: 4.2,
      },
    },
    {
      id: "MUM-004",
      name: "Anand Ashram Mumbai",
      city: "Mumbai",
      type: "Residential",
      beds: 68,
      established: 2010,
      indicators: {
        residents: 4.0,
        staffing: 4.3,
        qualityMeasures: 4.1,
        compliance: 4.6,
        safetyClinical: 4.2,
        preventiveCare: 3.9,
        experience: 4.3,
        equity: 3.8,
      },
    },
  ],
  Chennai: [
    {
      id: "CHE-001",
      name: "VelaCare Senior Services",
      city: "Chennai",
      type: "Residential",
      beds: 100,
      established: 2007,
      indicators: {
        residents: 4.2,
        staffing: 4.5,
        qualityMeasures: 4.0,
        compliance: 4.8,
        safetyClinical: 4.3,
        preventiveCare: 4.1,
        experience: 4.6,
        equity: 3.9,
      },
    },
    {
      id: "CHE-002",
      name: "Thanga Thozhil Home",
      city: "Chennai",
      type: "Residential",
      beds: 75,
      established: 2004,
      indicators: {
        residents: 3.9,
        staffing: 4.2,
        qualityMeasures: 3.8,
        compliance: 4.5,
        safetyClinical: 4.0,
        preventiveCare: 3.8,
        experience: 4.3,
        equity: 3.6,
      },
    },
    {
      id: "CHE-003",
      name: "Karunalaya Elder Care",
      city: "Chennai",
      type: "Home Care",
      established: 2018,
      indicators: {
        residents: 4.4,
        staffing: 4.7,
        qualityMeasures: 4.3,
        compliance: 4.8,
        safetyClinical: 4.5,
        preventiveCare: 4.2,
        experience: 4.6,
        equity: 4.1,
      },
    },
    {
      id: "CHE-004",
      name: "Aarokya Seniors",
      city: "Chennai",
      type: "Day Care",
      established: 2021,
      indicators: {
        residents: 3.6,
        staffing: 3.9,
        qualityMeasures: 3.7,
        compliance: 4.2,
        safetyClinical: 3.8,
        preventiveCare: 3.5,
        experience: 4.0,
        equity: 3.3,
      },
    },
  ],
  Bengaluru: [
    {
      id: "BLR-001",
      name: "Nandanam Senior Living",
      city: "Bengaluru",
      type: "Residential",
      beds: 130,
      established: 2006,
      indicators: {
        residents: 4.5,
        staffing: 4.8,
        qualityMeasures: 4.4,
        compliance: 4.9,
        safetyClinical: 4.6,
        preventiveCare: 4.3,
        experience: 4.7,
        equity: 4.2,
      },
    },
    {
      id: "BLR-002",
      name: "Sparsh Care Bengaluru",
      city: "Bengaluru",
      type: "Home Care",
      established: 2017,
      indicators: {
        residents: 4.1,
        staffing: 4.4,
        qualityMeasures: 4.0,
        compliance: 4.6,
        safetyClinical: 4.2,
        preventiveCare: 3.9,
        experience: 4.3,
        equity: 3.8,
      },
    },
    {
      id: "BLR-003",
      name: "Vatsalya Elder Home",
      city: "Bengaluru",
      type: "Residential",
      beds: 88,
      established: 2012,
      indicators: {
        residents: 3.8,
        staffing: 4.1,
        qualityMeasures: 3.9,
        compliance: 4.4,
        safetyClinical: 4.0,
        preventiveCare: 3.7,
        experience: 4.2,
        equity: 3.6,
      },
    },
    {
      id: "BLR-004",
      name: "Sukhayam Senior Care",
      city: "Bengaluru",
      type: "Residential",
      beds: 105,
      established: 2009,
      indicators: {
        residents: 4.3,
        staffing: 4.6,
        qualityMeasures: 4.2,
        compliance: 4.7,
        safetyClinical: 4.4,
        preventiveCare: 4.1,
        experience: 4.5,
        equity: 4.0,
      },
    },
  ],
  Pune: [
    {
      id: "PUN-001",
      name: "Shantivan Senior Care",
      city: "Pune",
      type: "Residential",
      beds: 92,
      established: 2010,
      indicators: {
        residents: 4.0,
        staffing: 4.3,
        qualityMeasures: 4.1,
        compliance: 4.6,
        safetyClinical: 4.2,
        preventiveCare: 4.0,
        experience: 4.4,
        equity: 3.8,
      },
    },
    {
      id: "PUN-002",
      name: "Prayag Elder Services",
      city: "Pune",
      type: "Home Care",
      established: 2019,
      indicators: {
        residents: 3.7,
        staffing: 4.0,
        qualityMeasures: 3.8,
        compliance: 4.3,
        safetyClinical: 3.9,
        preventiveCare: 3.6,
        experience: 4.1,
        equity: 3.4,
      },
    },
    {
      id: "PUN-003",
      name: "Arjuna Senior Living",
      city: "Pune",
      type: "Residential",
      beds: 115,
      established: 2007,
      indicators: {
        residents: 4.4,
        staffing: 4.7,
        qualityMeasures: 4.3,
        compliance: 4.8,
        safetyClinical: 4.5,
        preventiveCare: 4.2,
        experience: 4.6,
        equity: 4.1,
      },
    },
    {
      id: "PUN-004",
      name: "Sahyadri Care Home",
      city: "Pune",
      type: "Residential",
      beds: 70,
      established: 2015,
      indicators: {
        residents: 3.5,
        staffing: 3.8,
        qualityMeasures: 3.6,
        compliance: 4.0,
        safetyClinical: 3.7,
        preventiveCare: 3.4,
        experience: 3.9,
        equity: 3.2,
      },
    },
  ],
  Ahmedabad: [
    {
      id: "AMD-001",
      name: "Shree Senior Seva",
      city: "Ahmedabad",
      type: "Residential",
      beds: 82,
      established: 2008,
      indicators: {
        residents: 4.2,
        staffing: 4.5,
        qualityMeasures: 4.0,
        compliance: 4.8,
        safetyClinical: 4.3,
        preventiveCare: 4.1,
        experience: 4.6,
        equity: 3.9,
      },
    },
    {
      id: "AMD-002",
      name: "Amrut Varsham",
      city: "Ahmedabad",
      type: "Residential",
      beds: 65,
      established: 2003,
      indicators: {
        residents: 3.9,
        staffing: 4.2,
        qualityMeasures: 3.8,
        compliance: 4.5,
        safetyClinical: 4.0,
        preventiveCare: 3.7,
        experience: 4.2,
        equity: 3.5,
      },
    },
    {
      id: "AMD-003",
      name: "Vridh Aashray",
      city: "Ahmedabad",
      type: "Home Care",
      established: 2016,
      indicators: {
        residents: 4.4,
        staffing: 4.7,
        qualityMeasures: 4.3,
        compliance: 4.8,
        safetyClinical: 4.5,
        preventiveCare: 4.2,
        experience: 4.6,
        equity: 4.1,
      },
    },
    {
      id: "AMD-004",
      name: "Kalyaan Senior Care",
      city: "Ahmedabad",
      type: "Day Care",
      established: 2020,
      indicators: {
        residents: 3.6,
        staffing: 3.9,
        qualityMeasures: 3.7,
        compliance: 4.2,
        safetyClinical: 3.8,
        preventiveCare: 3.5,
        experience: 4.0,
        equity: 3.3,
      },
    },
  ],
};

export const CITY_LIST = Object.keys(CITY_PROVIDERS);

// ──────────────────────────────────────────────────────────────────────────────

// ── Cohort Risk Investigation Detail ─────────────────────────────────────────

export interface CohortDetail {
  cohortId: string;
  providerName: string;
  region: string;
  riskCriteria: string[];
  cohortSize: number;
  flagDate: string;
  urgency: "high" | "medium" | "low";
  status: string;
  riskScore: number;
  riskLevel: "HIGH" | "MEDIUM" | "LOW";
  riskIndicators: Array<{
    indicator: string;
    currentValue: string;
    benchmark: string;
    riskLevel: "HIGH" | "MEDIUM" | "LOW";
    barPercent: number;
  }>;
  screeningBundle: Array<{
    name: string;
    completed: number;
    pending: number;
    overdue: number;
    total: number;
  }>;
  residents: Array<{
    id: string;
    age: number;
    riskFactors: string;
    screeningStatus: "Completed" | "Pending" | "Overdue";
  }>;
  recommendedAlerts: string[];
  suggestedActions: string[];
  trendData: Array<{ quarter: string; highRiskResidents: number }>;
  performanceImpact: Array<{
    indicator: string;
    stars: number;
  }>;
  performanceMessage: string;
}

export const COHORT_DETAIL_DATA: Record<string, CohortDetail> = {
  "HRC-001": {
    cohortId: "HRC-001",
    providerName: "Sunridge Aged Care",
    region: "Queensland",
    riskCriteria: ["Recent Hospital Discharge", "Age ≥80 + Polypharmacy"],
    cohortSize: 12,
    flagDate: "20 Nov 2025",
    urgency: "high",
    status: "ACTIVE",
    riskScore: 82,
    riskLevel: "HIGH",
    riskIndicators: [
      {
        indicator: "Recent hospital discharge rate",
        currentValue: "38.5%",
        benchmark: "18.2%",
        riskLevel: "HIGH",
        barPercent: 82,
      },
      {
        indicator: "Polypharmacy rate",
        currentValue: "41.7%",
        benchmark: "21.4%",
        riskLevel: "HIGH",
        barPercent: 78,
      },
      {
        indicator: "Falls history rate",
        currentValue: "33.3%",
        benchmark: "19.8%",
        riskLevel: "MEDIUM",
        barPercent: 55,
      },
      {
        indicator: "Frailty score",
        currentValue: "4.2 / 5",
        benchmark: "3.1 / 5",
        riskLevel: "HIGH",
        barPercent: 84,
      },
    ],
    screeningBundle: [
      {
        name: "Falls Risk Assessment",
        completed: 7,
        pending: 3,
        overdue: 2,
        total: 12,
      },
      {
        name: "Medication Review",
        completed: 5,
        pending: 4,
        overdue: 3,
        total: 12,
      },
      {
        name: "Cognitive Assessment",
        completed: 8,
        pending: 2,
        overdue: 2,
        total: 12,
      },
      {
        name: "Nutrition Assessment",
        completed: 6,
        pending: 3,
        overdue: 3,
        total: 12,
      },
      {
        name: "Pain Assessment",
        completed: 9,
        pending: 2,
        overdue: 1,
        total: 12,
      },
      {
        name: "Behavioral Assessment",
        completed: 7,
        pending: 4,
        overdue: 1,
        total: 12,
      },
    ],
    residents: [
      {
        id: "R-1032",
        age: 84,
        riskFactors: "Polypharmacy",
        screeningStatus: "Completed",
      },
      {
        id: "R-1044",
        age: 88,
        riskFactors: "Falls History",
        screeningStatus: "Pending",
      },
      {
        id: "R-1092",
        age: 82,
        riskFactors: "Hospital Discharge",
        screeningStatus: "Overdue",
      },
      {
        id: "R-1015",
        age: 86,
        riskFactors: "Polypharmacy + Falls",
        screeningStatus: "Overdue",
      },
      {
        id: "R-1067",
        age: 81,
        riskFactors: "Hospital Discharge",
        screeningStatus: "Pending",
      },
      {
        id: "R-1078",
        age: 85,
        riskFactors: "Dementia",
        screeningStatus: "Completed",
      },
      {
        id: "R-1033",
        age: 83,
        riskFactors: "Frailty",
        screeningStatus: "Pending",
      },
      {
        id: "R-1088",
        age: 89,
        riskFactors: "Polypharmacy",
        screeningStatus: "Overdue",
      },
      {
        id: "R-1055",
        age: 80,
        riskFactors: "Comorbidities",
        screeningStatus: "Completed",
      },
      {
        id: "R-1021",
        age: 87,
        riskFactors: "Falls History",
        screeningStatus: "Pending",
      },
      {
        id: "R-1041",
        age: 84,
        riskFactors: "Hospital Discharge",
        screeningStatus: "Completed",
      },
      {
        id: "R-1099",
        age: 82,
        riskFactors: "Polypharmacy",
        screeningStatus: "Overdue",
      },
    ],
    recommendedAlerts: [
      "⚠ Medication review required for 4 residents",
      "⚠ Falls prevention intervention recommended for 3 residents",
      "⚠ Nutrition review required for 2 residents",
      "⚠ Cognitive assessment overdue for 2 residents",
    ],
    suggestedActions: [
      "Pharmacist medication review",
      "Occupational therapy home safety check",
      "Physiotherapy falls prevention program",
      "Dietitian consultation",
      "Advance care planning review",
    ],
    trendData: [
      { quarter: "Q2 2025", highRiskResidents: 8 },
      { quarter: "Q3 2025", highRiskResidents: 10 },
      { quarter: "Q4 2025", highRiskResidents: 12 },
    ],
    performanceImpact: [
      { indicator: "Safety & Clinical", stars: 2 },
      { indicator: "Preventive Care", stars: 2 },
      { indicator: "Quality Measures", stars: 3 },
    ],
    performanceMessage:
      "This provider shows lower preventive care performance due to incomplete screening bundles.",
  },
  "HRC-002": {
    cohortId: "HRC-002",
    providerName: "Central Queensland Aged Care",
    region: "Central Queensland",
    riskCriteria: ["Falls History", "Dementia with BPSD"],
    cohortSize: 8,
    flagDate: "18 Nov 2025",
    urgency: "high",
    status: "ACTIVE",
    riskScore: 76,
    riskLevel: "HIGH",
    riskIndicators: [
      {
        indicator: "Falls history rate",
        currentValue: "42.1%",
        benchmark: "19.8%",
        riskLevel: "HIGH",
        barPercent: 76,
      },
      {
        indicator: "Dementia with BPSD prevalence",
        currentValue: "37.5%",
        benchmark: "22.0%",
        riskLevel: "HIGH",
        barPercent: 72,
      },
      {
        indicator: "Behavioural incident rate",
        currentValue: "28.4%",
        benchmark: "18.6%",
        riskLevel: "MEDIUM",
        barPercent: 52,
      },
      {
        indicator: "Cognitive assessment overdue rate",
        currentValue: "50.0%",
        benchmark: "10.2%",
        riskLevel: "HIGH",
        barPercent: 80,
      },
    ],
    screeningBundle: [
      {
        name: "Falls Risk Assessment",
        completed: 4,
        pending: 2,
        overdue: 2,
        total: 8,
      },
      {
        name: "Medication Review",
        completed: 3,
        pending: 3,
        overdue: 2,
        total: 8,
      },
      {
        name: "Cognitive Assessment",
        completed: 5,
        pending: 1,
        overdue: 2,
        total: 8,
      },
      {
        name: "Nutrition Assessment",
        completed: 4,
        pending: 2,
        overdue: 2,
        total: 8,
      },
      {
        name: "Pain Assessment",
        completed: 6,
        pending: 1,
        overdue: 1,
        total: 8,
      },
      {
        name: "Behavioral Assessment",
        completed: 3,
        pending: 2,
        overdue: 3,
        total: 8,
      },
    ],
    residents: [
      {
        id: "R-2011",
        age: 83,
        riskFactors: "Falls History + Dementia",
        screeningStatus: "Overdue",
      },
      {
        id: "R-2024",
        age: 87,
        riskFactors: "BPSD",
        screeningStatus: "Pending",
      },
      {
        id: "R-2038",
        age: 85,
        riskFactors: "Falls History",
        screeningStatus: "Completed",
      },
      {
        id: "R-2045",
        age: 81,
        riskFactors: "Dementia",
        screeningStatus: "Overdue",
      },
      {
        id: "R-2059",
        age: 89,
        riskFactors: "BPSD + Polypharmacy",
        screeningStatus: "Overdue",
      },
      {
        id: "R-2062",
        age: 80,
        riskFactors: "Falls History",
        screeningStatus: "Pending",
      },
      {
        id: "R-2074",
        age: 84,
        riskFactors: "Dementia",
        screeningStatus: "Completed",
      },
      {
        id: "R-2081",
        age: 86,
        riskFactors: "Falls History + BPSD",
        screeningStatus: "Pending",
      },
    ],
    recommendedAlerts: [
      "⚠ Behavioral intervention required for 3 residents",
      "⚠ Falls prevention assessment overdue for 2 residents",
      "⚠ Cognitive reassessment required for 2 residents",
    ],
    suggestedActions: [
      "Dementia specialist consultation",
      "Physiotherapy falls prevention program",
      "Behavioral support plan review",
      "Psychogeriatric assessment referral",
    ],
    trendData: [
      { quarter: "Q2 2025", highRiskResidents: 5 },
      { quarter: "Q3 2025", highRiskResidents: 7 },
      { quarter: "Q4 2025", highRiskResidents: 8 },
    ],
    performanceImpact: [
      { indicator: "Safety & Clinical", stars: 2 },
      { indicator: "Preventive Care", stars: 2 },
      { indicator: "Quality Measures", stars: 2 },
    ],
    performanceMessage:
      "This provider demonstrates elevated risk in dementia-related behavioral incidents. Mandatory behavioral assessment completion is critically overdue.",
  },
  "HRC-003": {
    cohortId: "HRC-003",
    providerName: "Perth Metro Seniors Living",
    region: "Western Australia",
    riskCriteria: ["Frailty Score ≥ Threshold", "≥3 Comorbidities"],
    cohortSize: 23,
    flagDate: "15 Nov 2025",
    urgency: "medium",
    status: "MONITORING",
    riskScore: 61,
    riskLevel: "MEDIUM",
    riskIndicators: [
      {
        indicator: "Frailty score",
        currentValue: "3.8 / 5",
        benchmark: "3.1 / 5",
        riskLevel: "MEDIUM",
        barPercent: 61,
      },
      {
        indicator: "Comorbidity burden rate",
        currentValue: "56.5%",
        benchmark: "38.2%",
        riskLevel: "MEDIUM",
        barPercent: 58,
      },
      {
        indicator: "Polypharmacy rate",
        currentValue: "26.1%",
        benchmark: "21.4%",
        riskLevel: "MEDIUM",
        barPercent: 48,
      },
      {
        indicator: "Functional decline rate",
        currentValue: "21.7%",
        benchmark: "16.4%",
        riskLevel: "LOW",
        barPercent: 38,
      },
    ],
    screeningBundle: [
      {
        name: "Falls Risk Assessment",
        completed: 16,
        pending: 5,
        overdue: 2,
        total: 23,
      },
      {
        name: "Medication Review",
        completed: 14,
        pending: 6,
        overdue: 3,
        total: 23,
      },
      {
        name: "Cognitive Assessment",
        completed: 18,
        pending: 3,
        overdue: 2,
        total: 23,
      },
      {
        name: "Nutrition Assessment",
        completed: 15,
        pending: 6,
        overdue: 2,
        total: 23,
      },
      {
        name: "Pain Assessment",
        completed: 19,
        pending: 3,
        overdue: 1,
        total: 23,
      },
      {
        name: "Behavioral Assessment",
        completed: 17,
        pending: 4,
        overdue: 2,
        total: 23,
      },
    ],
    residents: [
      {
        id: "R-3001",
        age: 82,
        riskFactors: "Frailty + 3 Comorbidities",
        screeningStatus: "Completed",
      },
      {
        id: "R-3014",
        age: 85,
        riskFactors: "Comorbidities",
        screeningStatus: "Pending",
      },
      {
        id: "R-3022",
        age: 80,
        riskFactors: "Frailty",
        screeningStatus: "Completed",
      },
      {
        id: "R-3031",
        age: 88,
        riskFactors: "Comorbidities + Frailty",
        screeningStatus: "Overdue",
      },
      {
        id: "R-3044",
        age: 83,
        riskFactors: "4 Comorbidities",
        screeningStatus: "Pending",
      },
      {
        id: "R-3057",
        age: 81,
        riskFactors: "Frailty",
        screeningStatus: "Completed",
      },
      {
        id: "R-3063",
        age: 86,
        riskFactors: "Comorbidities",
        screeningStatus: "Overdue",
      },
      {
        id: "R-3078",
        age: 84,
        riskFactors: "Frailty + Polypharmacy",
        screeningStatus: "Pending",
      },
    ],
    recommendedAlerts: [
      "⚠ Frailty reassessment required for 5 residents",
      "⚠ Medication review overdue for 3 residents",
      "⚠ Nutrition assessment pending for 6 residents",
    ],
    suggestedActions: [
      "Geriatrician frailty assessment",
      "Pharmacist medication reconciliation",
      "Physiotherapy strength and balance program",
      "Dietitian consultation",
    ],
    trendData: [
      { quarter: "Q2 2025", highRiskResidents: 16 },
      { quarter: "Q3 2025", highRiskResidents: 20 },
      { quarter: "Q4 2025", highRiskResidents: 23 },
    ],
    performanceImpact: [
      { indicator: "Safety & Clinical", stars: 3 },
      { indicator: "Preventive Care", stars: 3 },
      { indicator: "Quality Measures", stars: 3 },
    ],
    performanceMessage:
      "This provider is monitoring a growing frailty cohort. Screening completion rates are adequate but improvement in medication review turnaround is required.",
  },
  "HRC-004": {
    cohortId: "HRC-004",
    providerName: "Darwin Territory Care",
    region: "Northern Territory",
    riskCriteria: ["Age ≥80 + Polypharmacy"],
    cohortSize: 5,
    flagDate: "12 Nov 2025",
    urgency: "high",
    status: "ACTIVE",
    riskScore: 79,
    riskLevel: "HIGH",
    riskIndicators: [
      {
        indicator: "Polypharmacy rate (≥10 meds)",
        currentValue: "60.0%",
        benchmark: "21.4%",
        riskLevel: "HIGH",
        barPercent: 79,
      },
      {
        indicator: "Age ≥80 in cohort",
        currentValue: "100.0%",
        benchmark: "42.0%",
        riskLevel: "HIGH",
        barPercent: 85,
      },
      {
        indicator: "Medication-related incident rate",
        currentValue: "24.8%",
        benchmark: "9.4%",
        riskLevel: "HIGH",
        barPercent: 72,
      },
      {
        indicator: "Pharmacist review completion",
        currentValue: "20.0%",
        benchmark: "78.4%",
        riskLevel: "HIGH",
        barPercent: 88,
      },
    ],
    screeningBundle: [
      {
        name: "Falls Risk Assessment",
        completed: 2,
        pending: 2,
        overdue: 1,
        total: 5,
      },
      {
        name: "Medication Review",
        completed: 1,
        pending: 1,
        overdue: 3,
        total: 5,
      },
      {
        name: "Cognitive Assessment",
        completed: 3,
        pending: 1,
        overdue: 1,
        total: 5,
      },
      {
        name: "Nutrition Assessment",
        completed: 2,
        pending: 2,
        overdue: 1,
        total: 5,
      },
      {
        name: "Pain Assessment",
        completed: 3,
        pending: 1,
        overdue: 1,
        total: 5,
      },
      {
        name: "Behavioral Assessment",
        completed: 2,
        pending: 2,
        overdue: 1,
        total: 5,
      },
    ],
    residents: [
      {
        id: "R-4001",
        age: 84,
        riskFactors: "Polypharmacy (12 meds)",
        screeningStatus: "Overdue",
      },
      {
        id: "R-4009",
        age: 81,
        riskFactors: "Polypharmacy (10 meds)",
        screeningStatus: "Overdue",
      },
      {
        id: "R-4017",
        age: 87,
        riskFactors: "Polypharmacy + Falls",
        screeningStatus: "Overdue",
      },
      {
        id: "R-4025",
        age: 80,
        riskFactors: "Polypharmacy (11 meds)",
        screeningStatus: "Pending",
      },
      {
        id: "R-4033",
        age: 86,
        riskFactors: "Polypharmacy (13 meds)",
        screeningStatus: "Completed",
      },
    ],
    recommendedAlerts: [
      "⚠ Urgent medication review required for 3 residents",
      "⚠ Medication-related risk indicators are above acceptable threshold",
      "⚠ Pharmacist review critically overdue",
    ],
    suggestedActions: [
      "Urgent pharmacist medication review",
      "Deprescribing protocol initiation",
      "GP medication reconciliation referral",
      "Medication safety risk assessment",
    ],
    trendData: [
      { quarter: "Q2 2025", highRiskResidents: 3 },
      { quarter: "Q3 2025", highRiskResidents: 4 },
      { quarter: "Q4 2025", highRiskResidents: 5 },
    ],
    performanceImpact: [
      { indicator: "Safety & Clinical", stars: 1 },
      { indicator: "Preventive Care", stars: 2 },
      { indicator: "Quality Measures", stars: 2 },
    ],
    performanceMessage:
      "This provider has critically low medication management performance. Polypharmacy prevalence is significantly above national benchmarks and requires urgent intervention.",
  },
  "HRC-005": {
    cohortId: "HRC-005",
    providerName: "Bayside Home Care Services",
    region: "Victoria",
    riskCriteria: ["Recent Hospital Discharge"],
    cohortSize: 14,
    flagDate: "10 Nov 2025",
    urgency: "medium",
    status: "MONITORING",
    riskScore: 58,
    riskLevel: "MEDIUM",
    riskIndicators: [
      {
        indicator: "Recent hospital discharge rate",
        currentValue: "28.6%",
        benchmark: "18.2%",
        riskLevel: "MEDIUM",
        barPercent: 58,
      },
      {
        indicator: "Post-discharge bundle completion (7-day)",
        currentValue: "42.9%",
        benchmark: "72.4%",
        riskLevel: "HIGH",
        barPercent: 72,
      },
      {
        indicator: "Readmission risk score",
        currentValue: "3.4 / 5",
        benchmark: "2.6 / 5",
        riskLevel: "MEDIUM",
        barPercent: 52,
      },
      {
        indicator: "GP follow-up completion (14-day)",
        currentValue: "57.1%",
        benchmark: "82.0%",
        riskLevel: "MEDIUM",
        barPercent: 45,
      },
    ],
    screeningBundle: [
      {
        name: "Falls Risk Assessment",
        completed: 9,
        pending: 3,
        overdue: 2,
        total: 14,
      },
      {
        name: "Medication Review",
        completed: 7,
        pending: 4,
        overdue: 3,
        total: 14,
      },
      {
        name: "Cognitive Assessment",
        completed: 10,
        pending: 2,
        overdue: 2,
        total: 14,
      },
      {
        name: "Nutrition Assessment",
        completed: 8,
        pending: 4,
        overdue: 2,
        total: 14,
      },
      {
        name: "Pain Assessment",
        completed: 11,
        pending: 2,
        overdue: 1,
        total: 14,
      },
      {
        name: "Behavioral Assessment",
        completed: 9,
        pending: 3,
        overdue: 2,
        total: 14,
      },
    ],
    residents: [
      {
        id: "R-5001",
        age: 82,
        riskFactors: "Hospital Discharge",
        screeningStatus: "Completed",
      },
      {
        id: "R-5008",
        age: 79,
        riskFactors: "Hospital Discharge + Falls",
        screeningStatus: "Pending",
      },
      {
        id: "R-5015",
        age: 85,
        riskFactors: "Hospital Discharge",
        screeningStatus: "Overdue",
      },
      {
        id: "R-5022",
        age: 77,
        riskFactors: "Hospital Discharge",
        screeningStatus: "Completed",
      },
      {
        id: "R-5029",
        age: 83,
        riskFactors: "Hospital Discharge + Polypharmacy",
        screeningStatus: "Overdue",
      },
      {
        id: "R-5036",
        age: 80,
        riskFactors: "Hospital Discharge",
        screeningStatus: "Pending",
      },
      {
        id: "R-5043",
        age: 88,
        riskFactors: "Hospital Discharge",
        screeningStatus: "Completed",
      },
    ],
    recommendedAlerts: [
      "⚠ Post-discharge medication review overdue for 3 residents",
      "⚠ Falls risk reassessment required for 2 residents post-discharge",
      "⚠ GP follow-up referral outstanding for 6 residents",
    ],
    suggestedActions: [
      "Post-discharge care coordination review",
      "GP follow-up appointment scheduling",
      "Pharmacist medication reconciliation",
      "Occupational therapy home assessment",
    ],
    trendData: [
      { quarter: "Q2 2025", highRiskResidents: 10 },
      { quarter: "Q3 2025", highRiskResidents: 12 },
      { quarter: "Q4 2025", highRiskResidents: 14 },
    ],
    performanceImpact: [
      { indicator: "Safety & Clinical", stars: 3 },
      { indicator: "Preventive Care", stars: 3 },
      { indicator: "Quality Measures", stars: 3 },
    ],
    performanceMessage:
      "Post-discharge care coordination requires improvement. Completion of the 7-day bundle is below the national benchmark for this provider.",
  },
  "HRC-006": {
    cohortId: "HRC-006",
    providerName: "Adelaide Southern Care",
    region: "South Australia",
    riskCriteria: ["Falls History"],
    cohortSize: 7,
    flagDate: "05 Nov 2025",
    urgency: "low",
    status: "RESOLVED",
    riskScore: 34,
    riskLevel: "LOW",
    riskIndicators: [
      {
        indicator: "Falls history rate",
        currentValue: "21.4%",
        benchmark: "19.8%",
        riskLevel: "LOW",
        barPercent: 34,
      },
      {
        indicator: "Falls with harm rate",
        currentValue: "8.6%",
        benchmark: "5.1%",
        riskLevel: "MEDIUM",
        barPercent: 42,
      },
      {
        indicator: "Falls risk screening completion",
        currentValue: "85.7%",
        benchmark: "88.4%",
        riskLevel: "LOW",
        barPercent: 28,
      },
      {
        indicator: "Environment hazard score",
        currentValue: "2.4 / 5",
        benchmark: "2.8 / 5",
        riskLevel: "LOW",
        barPercent: 22,
      },
    ],
    screeningBundle: [
      {
        name: "Falls Risk Assessment",
        completed: 7,
        pending: 0,
        overdue: 0,
        total: 7,
      },
      {
        name: "Medication Review",
        completed: 6,
        pending: 1,
        overdue: 0,
        total: 7,
      },
      {
        name: "Cognitive Assessment",
        completed: 7,
        pending: 0,
        overdue: 0,
        total: 7,
      },
      {
        name: "Nutrition Assessment",
        completed: 6,
        pending: 1,
        overdue: 0,
        total: 7,
      },
      {
        name: "Pain Assessment",
        completed: 7,
        pending: 0,
        overdue: 0,
        total: 7,
      },
      {
        name: "Behavioral Assessment",
        completed: 6,
        pending: 1,
        overdue: 0,
        total: 7,
      },
    ],
    residents: [
      {
        id: "R-6001",
        age: 81,
        riskFactors: "Falls History",
        screeningStatus: "Completed",
      },
      {
        id: "R-6008",
        age: 84,
        riskFactors: "Falls History",
        screeningStatus: "Completed",
      },
      {
        id: "R-6015",
        age: 79,
        riskFactors: "Falls History",
        screeningStatus: "Completed",
      },
      {
        id: "R-6022",
        age: 83,
        riskFactors: "Falls History + Frailty",
        screeningStatus: "Completed",
      },
      {
        id: "R-6029",
        age: 80,
        riskFactors: "Falls History",
        screeningStatus: "Completed",
      },
      {
        id: "R-6036",
        age: 86,
        riskFactors: "Falls History",
        screeningStatus: "Pending",
      },
      {
        id: "R-6043",
        age: 82,
        riskFactors: "Falls History",
        screeningStatus: "Completed",
      },
    ],
    recommendedAlerts: [
      "ℹ Ongoing monitoring recommended for 1 resident with pending review",
      "ℹ Quarterly falls risk reassessment scheduled for all cohort members",
    ],
    suggestedActions: [
      "Continue falls prevention program",
      "Quarterly reassessment scheduling",
      "Environmental safety monitoring",
    ],
    trendData: [
      { quarter: "Q2 2025", highRiskResidents: 9 },
      { quarter: "Q3 2025", highRiskResidents: 8 },
      { quarter: "Q4 2025", highRiskResidents: 7 },
    ],
    performanceImpact: [
      { indicator: "Safety & Clinical", stars: 4 },
      { indicator: "Preventive Care", stars: 4 },
      { indicator: "Quality Measures", stars: 4 },
    ],
    performanceMessage:
      "This provider has successfully resolved the high-risk falls cohort through effective intervention. Performance indicators are tracking positively.",
  },
  "HRC-007": {
    cohortId: "HRC-007",
    providerName: "Hunter Valley Care Group",
    region: "New South Wales",
    riskCriteria: ["Dementia with BPSD", "≥3 Comorbidities"],
    cohortSize: 18,
    flagDate: "28 Nov 2025",
    urgency: "high",
    status: "ACTIVE",
    riskScore: 88,
    riskLevel: "HIGH",
    riskIndicators: [
      {
        indicator: "Dementia with BPSD prevalence",
        currentValue: "44.4%",
        benchmark: "22.0%",
        riskLevel: "HIGH",
        barPercent: 88,
      },
      {
        indicator: "Comorbidity burden (≥3 conditions)",
        currentValue: "61.1%",
        benchmark: "38.2%",
        riskLevel: "HIGH",
        barPercent: 80,
      },
      {
        indicator: "Unplanned hospitalisation rate",
        currentValue: "27.8%",
        benchmark: "12.4%",
        riskLevel: "HIGH",
        barPercent: 82,
      },
      {
        indicator: "Behavioral incident rate",
        currentValue: "38.9%",
        benchmark: "18.6%",
        riskLevel: "HIGH",
        barPercent: 76,
      },
    ],
    screeningBundle: [
      {
        name: "Falls Risk Assessment",
        completed: 10,
        pending: 4,
        overdue: 4,
        total: 18,
      },
      {
        name: "Medication Review",
        completed: 8,
        pending: 5,
        overdue: 5,
        total: 18,
      },
      {
        name: "Cognitive Assessment",
        completed: 12,
        pending: 3,
        overdue: 3,
        total: 18,
      },
      {
        name: "Nutrition Assessment",
        completed: 9,
        pending: 4,
        overdue: 5,
        total: 18,
      },
      {
        name: "Pain Assessment",
        completed: 13,
        pending: 3,
        overdue: 2,
        total: 18,
      },
      {
        name: "Behavioral Assessment",
        completed: 7,
        pending: 5,
        overdue: 6,
        total: 18,
      },
    ],
    residents: [
      {
        id: "R-7001",
        age: 86,
        riskFactors: "Dementia + BPSD",
        screeningStatus: "Overdue",
      },
      {
        id: "R-7012",
        age: 82,
        riskFactors: "3 Comorbidities + Dementia",
        screeningStatus: "Overdue",
      },
      {
        id: "R-7023",
        age: 88,
        riskFactors: "BPSD + Polypharmacy",
        screeningStatus: "Overdue",
      },
      {
        id: "R-7034",
        age: 83,
        riskFactors: "Dementia",
        screeningStatus: "Pending",
      },
      {
        id: "R-7045",
        age: 85,
        riskFactors: "4 Comorbidities",
        screeningStatus: "Overdue",
      },
      {
        id: "R-7056",
        age: 81,
        riskFactors: "BPSD",
        screeningStatus: "Completed",
      },
      {
        id: "R-7067",
        age: 87,
        riskFactors: "Dementia + Frailty",
        screeningStatus: "Overdue",
      },
      {
        id: "R-7078",
        age: 84,
        riskFactors: "3 Comorbidities",
        screeningStatus: "Pending",
      },
      {
        id: "R-7089",
        age: 80,
        riskFactors: "Dementia + Hospital Discharge",
        screeningStatus: "Overdue",
      },
    ],
    recommendedAlerts: [
      "⚠ Urgent behavioral support plan required for 6 residents",
      "⚠ Medication review critically overdue for 5 residents",
      "⚠ Nutrition assessment overdue for 5 residents",
      "⚠ Unplanned hospitalisation rate significantly above benchmark",
    ],
    suggestedActions: [
      "Psychogeriatric specialist assessment",
      "Behavioral support plan development",
      "Pharmacist medication review and deprescribing",
      "Dietitian nutritional assessment",
      "Advance care planning review",
    ],
    trendData: [
      { quarter: "Q2 2025", highRiskResidents: 11 },
      { quarter: "Q3 2025", highRiskResidents: 15 },
      { quarter: "Q4 2025", highRiskResidents: 18 },
    ],
    performanceImpact: [
      { indicator: "Safety & Clinical", stars: 1 },
      { indicator: "Preventive Care", stars: 1 },
      { indicator: "Quality Measures", stars: 2 },
    ],
    performanceMessage:
      "This provider has critically poor performance across safety and preventive care indicators. Urgent regulatory intervention and clinical review are recommended.",
  },
  "HRC-008": {
    cohortId: "HRC-008",
    providerName: "Geelong Aged Care Network",
    region: "Victoria",
    riskCriteria: ["Frailty Score ≥ Threshold"],
    cohortSize: 9,
    flagDate: "25 Nov 2025",
    urgency: "medium",
    status: "MONITORING",
    riskScore: 55,
    riskLevel: "MEDIUM",
    riskIndicators: [
      {
        indicator: "Frailty score",
        currentValue: "3.6 / 5",
        benchmark: "3.1 / 5",
        riskLevel: "MEDIUM",
        barPercent: 55,
      },
      {
        indicator: "Functional decline rate",
        currentValue: "33.3%",
        benchmark: "16.4%",
        riskLevel: "MEDIUM",
        barPercent: 52,
      },
      {
        indicator: "Weight loss prevalence (>5%)",
        currentValue: "22.2%",
        benchmark: "14.8%",
        riskLevel: "MEDIUM",
        barPercent: 46,
      },
      {
        indicator: "Activity participation rate",
        currentValue: "44.4%",
        benchmark: "68.8%",
        riskLevel: "LOW",
        barPercent: 32,
      },
    ],
    screeningBundle: [
      {
        name: "Falls Risk Assessment",
        completed: 6,
        pending: 2,
        overdue: 1,
        total: 9,
      },
      {
        name: "Medication Review",
        completed: 5,
        pending: 3,
        overdue: 1,
        total: 9,
      },
      {
        name: "Cognitive Assessment",
        completed: 7,
        pending: 1,
        overdue: 1,
        total: 9,
      },
      {
        name: "Nutrition Assessment",
        completed: 5,
        pending: 3,
        overdue: 1,
        total: 9,
      },
      {
        name: "Pain Assessment",
        completed: 7,
        pending: 1,
        overdue: 1,
        total: 9,
      },
      {
        name: "Behavioral Assessment",
        completed: 6,
        pending: 2,
        overdue: 1,
        total: 9,
      },
    ],
    residents: [
      {
        id: "R-8001",
        age: 82,
        riskFactors: "Frailty",
        screeningStatus: "Completed",
      },
      {
        id: "R-8009",
        age: 85,
        riskFactors: "Frailty + Weight Loss",
        screeningStatus: "Pending",
      },
      {
        id: "R-8017",
        age: 80,
        riskFactors: "Frailty",
        screeningStatus: "Completed",
      },
      {
        id: "R-8025",
        age: 88,
        riskFactors: "Frailty + Functional Decline",
        screeningStatus: "Overdue",
      },
      {
        id: "R-8033",
        age: 83,
        riskFactors: "Frailty + Comorbidities",
        screeningStatus: "Pending",
      },
      {
        id: "R-8041",
        age: 81,
        riskFactors: "Frailty",
        screeningStatus: "Completed",
      },
      {
        id: "R-8049",
        age: 86,
        riskFactors: "Frailty + Weight Loss",
        screeningStatus: "Pending",
      },
      {
        id: "R-8057",
        age: 84,
        riskFactors: "Frailty",
        screeningStatus: "Completed",
      },
      {
        id: "R-8065",
        age: 79,
        riskFactors: "Frailty",
        screeningStatus: "Completed",
      },
    ],
    recommendedAlerts: [
      "⚠ Nutrition review required for 3 residents with weight loss",
      "⚠ Frailty reassessment pending for 2 residents",
      "⚠ Activity engagement program referral recommended",
    ],
    suggestedActions: [
      "Geriatrician frailty assessment review",
      "Dietitian nutritional consultation",
      "Physiotherapy strength and balance program",
      "Social engagement and activity program",
    ],
    trendData: [
      { quarter: "Q2 2025", highRiskResidents: 6 },
      { quarter: "Q3 2025", highRiskResidents: 8 },
      { quarter: "Q4 2025", highRiskResidents: 9 },
    ],
    performanceImpact: [
      { indicator: "Safety & Clinical", stars: 3 },
      { indicator: "Preventive Care", stars: 3 },
      { indicator: "Quality Measures", stars: 4 },
    ],
    performanceMessage:
      "This provider is proactively monitoring a frailty cohort. Nutrition and activity engagement require focused improvement to prevent deterioration.",
  },
};

// ──────────────────────────────────────────────────────────────────────────────

export const RISK_CRITERIA_LABELS: Record<string, string> = {
  recent_hospital_discharge: "Recent Hospital Discharge",
  polypharmacy_80plus: "Age ≥80 + Polypharmacy",
  falls_history: "Falls History",
  dementia_bpsd: "Dementia with BPSD",
  frailty_threshold: "Frailty Score ≥ Threshold",
  comorbidities_3plus: "≥3 Comorbidities",
};

export const SCREENING_TYPE_LABELS: Record<string, string> = {
  falls_risk_assessment: "Falls Risk Assessment",
  medication_review: "Medication Review",
  cognitive_assessment: "Cognitive Assessment",
  nutritional_review: "Nutritional Review",
  pain_assessment: "Pain Assessment",
  behavioral_assessment: "Behavioral Assessment",
  advance_care_planning: "Advance Care Planning Review",
};
