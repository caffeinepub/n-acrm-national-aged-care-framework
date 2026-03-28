// Mock data for sections that don't have full backend support
import {
  calcNewWeightedOverallScore,
  calcPayForImprovementEligibility,
  overallScoreToStars,
  starsToPercentScore,
} from "../utils/ratingEngine";

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

export const MOCK_SCORECARDS = (providerId: string) => {
  const d = getProviderDomainStarScores(providerId);
  const latestOverall = domainScoresToOverallPercent(d);
  const q = overallStarsToQuintile(latestOverall);

  // Build 4 quarters with a slight regression for earlier quarters (each step back ~3pts)
  const quarters = ["Q1-2025", "Q2-2025", "Q3-2025", "Q4-2025"];
  return quarters.map((quarter, i) => {
    const step = (3 - i) * 3; // Q4 = 0, Q3 = 3, Q2 = 6, Q1 = 9 pts lower
    const clamp = (v: number) =>
      Math.min(95, Math.max(10, Math.round(v - step)));
    const safety = clamp(starsToPercentScore(d.safety));
    const preventive = clamp(starsToPercentScore(d.preventive));
    const quality = clamp(starsToPercentScore(d.quality));
    const staffing = clamp(starsToPercentScore(d.staffing));
    const compliance = clamp(starsToPercentScore(d.compliance));
    const experience = clamp(starsToPercentScore(d.experience));
    const equity = clamp(starsToPercentScore(d.safety)); // proxy equity from safety domain
    const overallScore = clamp(latestOverall);
    // Quintile improves toward Q4 for most providers
    const quintileRank = Math.min(5, Math.max(1, q + (3 - i)));
    return {
      quarter,
      overallScore,
      safetyScore: safety,
      preventiveScore: preventive,
      experienceScore: experience,
      equityScore: equity,
      qualityScore: quality,
      staffingScore: staffing,
      complianceScore: compliance,
      quintileRank,
      id: `SC-${providerId}-${i}`,
      providerId,
    };
  });
};

// Per-provider indicator profiles keyed by numeric seed (provider suffix)
type ProviderProfile = {
  safetyQ: number;
  safetyTrend: "improving" | "stable" | "declining";
  preventiveQ: number;
  preventiveTrend: "improving" | "stable" | "declining";
  experienceQ: number;
  experienceTrend: "improving" | "stable" | "declining";
  equityQ: number;
  equityTrend: "improving" | "stable" | "declining";
  qualityQ: number;
  qualityTrend: "improving" | "stable" | "declining";
  staffingQ: number;
  staffingTrend: "improving" | "stable" | "declining";
  complianceQ: number;
  complianceTrend: "improving" | "stable" | "declining";
};

const PROVIDER_PROFILES: Record<number, ProviderProfile> = {
  // PROV-001 Sunridge: Strong safety, weak preventive
  1: {
    safetyQ: 2,
    safetyTrend: "improving",
    preventiveQ: 4,
    preventiveTrend: "stable",
    experienceQ: 2,
    experienceTrend: "stable",
    equityQ: 2,
    equityTrend: "improving",
    qualityQ: 3,
    qualityTrend: "stable",
    staffingQ: 2,
    staffingTrend: "stable",
    complianceQ: 2,
    complianceTrend: "improving",
  },
  // PROV-002 Bayside: Weak safety, excellent staffing
  2: {
    safetyQ: 4,
    safetyTrend: "declining",
    preventiveQ: 3,
    preventiveTrend: "stable",
    experienceQ: 3,
    experienceTrend: "stable",
    equityQ: 3,
    equityTrend: "stable",
    qualityQ: 3,
    qualityTrend: "stable",
    staffingQ: 1,
    staffingTrend: "improving",
    complianceQ: 2,
    complianceTrend: "stable",
  },
  // PROV-003 Central QLD: Poor performer across the board
  3: {
    safetyQ: 4,
    safetyTrend: "declining",
    preventiveQ: 5,
    preventiveTrend: "declining",
    experienceQ: 4,
    experienceTrend: "declining",
    equityQ: 4,
    equityTrend: "stable",
    qualityQ: 4,
    qualityTrend: "declining",
    staffingQ: 4,
    staffingTrend: "declining",
    complianceQ: 5,
    complianceTrend: "declining",
  },
  // PROV-004 Adelaide: Balanced average performer
  4: {
    safetyQ: 3,
    safetyTrend: "stable",
    preventiveQ: 3,
    preventiveTrend: "stable",
    experienceQ: 2,
    experienceTrend: "stable",
    equityQ: 3,
    equityTrend: "improving",
    qualityQ: 3,
    qualityTrend: "stable",
    staffingQ: 3,
    staffingTrend: "stable",
    complianceQ: 2,
    complianceTrend: "improving",
  },
  // PROV-005 Perth Metro: Excellent top performer
  5: {
    safetyQ: 1,
    safetyTrend: "improving",
    preventiveQ: 1,
    preventiveTrend: "improving",
    experienceQ: 1,
    experienceTrend: "improving",
    equityQ: 2,
    equityTrend: "improving",
    qualityQ: 1,
    qualityTrend: "improving",
    staffingQ: 1,
    staffingTrend: "improving",
    complianceQ: 1,
    complianceTrend: "improving",
  },
  // PROV-006 Hobart: Good safety + strong compliance
  6: {
    safetyQ: 2,
    safetyTrend: "stable",
    preventiveQ: 3,
    preventiveTrend: "stable",
    experienceQ: 3,
    experienceTrend: "stable",
    equityQ: 3,
    equityTrend: "stable",
    qualityQ: 2,
    qualityTrend: "stable",
    staffingQ: 3,
    staffingTrend: "stable",
    complianceQ: 1,
    complianceTrend: "stable",
  },
  // PROV-007 Darwin: Worst performer, all declining
  7: {
    safetyQ: 5,
    safetyTrend: "declining",
    preventiveQ: 5,
    preventiveTrend: "declining",
    experienceQ: 5,
    experienceTrend: "declining",
    equityQ: 5,
    equityTrend: "declining",
    qualityQ: 5,
    qualityTrend: "declining",
    staffingQ: 5,
    staffingTrend: "declining",
    complianceQ: 5,
    complianceTrend: "declining",
  },
  // PROV-008 ACT: Solid performer, mostly Q2
  8: {
    safetyQ: 2,
    safetyTrend: "improving",
    preventiveQ: 2,
    preventiveTrend: "improving",
    experienceQ: 2,
    experienceTrend: "improving",
    equityQ: 2,
    equityTrend: "stable",
    qualityQ: 2,
    qualityTrend: "improving",
    staffingQ: 2,
    staffingTrend: "stable",
    complianceQ: 2,
    complianceTrend: "improving",
  },
  // PROV-009 Hunter Valley: Weak safety + preventive, clinical issues
  9: {
    safetyQ: 4,
    safetyTrend: "stable",
    preventiveQ: 4,
    preventiveTrend: "declining",
    experienceQ: 3,
    experienceTrend: "stable",
    equityQ: 3,
    equityTrend: "stable",
    qualityQ: 4,
    qualityTrend: "stable",
    staffingQ: 3,
    staffingTrend: "stable",
    complianceQ: 4,
    complianceTrend: "declining",
  },
  // PROV-010 Geelong: Moderate balanced
  10: {
    safetyQ: 2,
    safetyTrend: "stable",
    preventiveQ: 3,
    preventiveTrend: "stable",
    experienceQ: 2,
    experienceTrend: "improving",
    equityQ: 2,
    equityTrend: "stable",
    qualityQ: 3,
    qualityTrend: "stable",
    staffingQ: 2,
    staffingTrend: "improving",
    complianceQ: 2,
    complianceTrend: "stable",
  },
};

const DEFAULT_PROFILE: ProviderProfile = {
  safetyQ: 3,
  safetyTrend: "stable",
  preventiveQ: 3,
  preventiveTrend: "stable",
  experienceQ: 3,
  experienceTrend: "stable",
  equityQ: 3,
  equityTrend: "stable",
  qualityQ: 3,
  qualityTrend: "stable",
  staffingQ: 3,
  staffingTrend: "stable",
  complianceQ: 3,
  complianceTrend: "stable",
};

// Inline quintile-to-star converter (avoids circular dep with ratingEngine)
function qToStars(q: number, trend: string): number {
  const base = [5, 4, 3, 2, 1][q - 1] ?? 3;
  const adj = trend === "improving" ? 0.2 : trend === "declining" ? -0.2 : 0;
  return Math.min(5, Math.max(1, base + adj));
}

// Returns all 6 domain star scores for a given provider
export function getProviderDomainStarScores(providerId: string): {
  safety: number;
  preventive: number;
  quality: number;
  staffing: number;
  compliance: number;
  experience: number;
} {
  const match = providerId.match(/(\d+)$/);
  const seed = match ? Number.parseInt(match[1], 10) : 0;
  const p = PROVIDER_PROFILES[seed] ?? DEFAULT_PROFILE;
  return {
    safety: qToStars(p.safetyQ, p.safetyTrend),
    preventive: qToStars(p.preventiveQ, p.preventiveTrend),
    quality: qToStars(p.qualityQ, p.qualityTrend),
    staffing: qToStars(p.staffingQ, p.staffingTrend),
    compliance: qToStars(p.complianceQ, p.complianceTrend),
    experience: qToStars(p.experienceQ, p.experienceTrend),
  };
}

// Weighted overall score → percentage (0–100)
function domainScoresToOverallPercent(domains: {
  safety: number;
  preventive: number;
  quality: number;
  staffing: number;
  compliance: number;
  experience: number;
}): number {
  // domains are still 1-5 star values from getProviderDomainStarScores
  const asPercent = {
    safety: starsToPercentScore(domains.safety),
    preventive: starsToPercentScore(domains.preventive),
    quality: starsToPercentScore(domains.quality),
    staffing: starsToPercentScore(domains.staffing),
    compliance: starsToPercentScore(domains.compliance),
    experience: starsToPercentScore(domains.experience),
  };
  return Math.round(calcNewWeightedOverallScore(asPercent));
}

// Quintile rank from overall star score
function overallStarsToQuintile(overallPct: number): number {
  if (overallPct >= 74) return 1;
  if (overallPct >= 62) return 2;
  if (overallPct >= 50) return 3;
  if (overallPct >= 38) return 4;
  return 5;
}

// Rate values scaled by quintile: worse quintile → higher adverse rates / lower completion rates
function safetyRate(
  base: number,
  q: number,
  scale: "lower_is_better" | "higher_is_better",
): number {
  const qFactor: Record<number, number> = {
    1: 0.65,
    2: 0.82,
    3: 1.0,
    4: 1.22,
    5: 1.55,
  };
  const f = qFactor[q] ?? 1.0;
  return scale === "lower_is_better"
    ? Number.parseFloat((base * f).toFixed(1))
    : Number.parseFloat((base / f).toFixed(1));
}

export const MOCK_INDICATORS = (providerId: string) => {
  const match = providerId.match(/(\d+)$/);
  const seed = match ? Number.parseInt(match[1], 10) : 0;
  const profile = PROVIDER_PROFILES[seed] ?? DEFAULT_PROFILE;

  const {
    safetyQ,
    safetyTrend,
    preventiveQ,
    preventiveTrend,
    experienceQ,
    experienceTrend,
    equityQ,
    equityTrend,
    qualityQ,
    qualityTrend,
    staffingQ,
    staffingTrend,
    complianceQ,
    complianceTrend,
  } = profile;

  return [
    {
      id: `IND-${providerId}-1`,
      providerId,
      quarter: "Q4-2025",
      dimension: "Safety",
      indicatorCode: "SAF-001",
      indicatorName: "Falls with Harm Rate",
      rate: safetyRate(4.2, safetyQ, "lower_is_better"),
      nationalBenchmark: 5.1,
      quintileRank: safetyQ,
      trend: safetyTrend,
    },
    {
      id: `IND-${providerId}-2`,
      providerId,
      quarter: "Q4-2025",
      dimension: "Safety",
      indicatorCode: "SAF-002",
      indicatorName: "Medication-Related Harm",
      rate: safetyRate(2.8, safetyQ, "lower_is_better"),
      nationalBenchmark: 3.2,
      quintileRank: safetyQ,
      trend: safetyTrend,
    },
    {
      id: `IND-${providerId}-3`,
      providerId,
      quarter: "Q4-2025",
      dimension: "Safety",
      indicatorCode: "SAF-003",
      indicatorName: "High-Risk Medication Prevalence",
      rate: safetyRate(18.4, safetyQ, "lower_is_better"),
      nationalBenchmark: 21.2,
      quintileRank: safetyQ,
      trend: safetyTrend,
    },
    {
      id: `IND-${providerId}-4`,
      providerId,
      quarter: "Q4-2025",
      dimension: "Safety",
      indicatorCode: "SAF-004",
      indicatorName: "Polypharmacy ≥10 Medications",
      rate: safetyRate(12.1, safetyQ, "lower_is_better"),
      nationalBenchmark: 14.8,
      quintileRank: safetyQ,
      trend: safetyTrend,
    },
    {
      id: `IND-${providerId}-5`,
      providerId,
      quarter: "Q4-2025",
      dimension: "Safety",
      indicatorCode: "SAF-005",
      indicatorName: "Pressure Injuries Stage 2–4",
      rate: safetyRate(1.8, safetyQ, "lower_is_better"),
      nationalBenchmark: 2.4,
      quintileRank: safetyQ,
      trend: safetyTrend,
    },
    {
      id: `IND-${providerId}-6`,
      providerId,
      quarter: "Q4-2025",
      dimension: "Safety",
      indicatorCode: "SAF-006",
      indicatorName: "ED Presentations (30-day)",
      rate: safetyRate(8.4, safetyQ, "lower_is_better"),
      nationalBenchmark: 10.2,
      quintileRank: safetyQ,
      trend: safetyTrend,
    },
    {
      id: `IND-${providerId}-7`,
      providerId,
      quarter: "Q4-2025",
      dimension: "Preventive",
      indicatorCode: "PRV-001",
      indicatorName: "Falls Risk Screening Completion",
      rate: safetyRate(94.2, preventiveQ, "higher_is_better"),
      nationalBenchmark: 88.4,
      quintileRank: preventiveQ,
      trend: preventiveTrend,
    },
    {
      id: `IND-${providerId}-8`,
      providerId,
      quarter: "Q4-2025",
      dimension: "Preventive",
      indicatorCode: "PRV-002",
      indicatorName: "Depression Screening (GDS/PHQ-9)",
      rate: safetyRate(88.4, preventiveQ, "higher_is_better"),
      nationalBenchmark: 82.1,
      quintileRank: preventiveQ,
      trend: preventiveTrend,
    },
    {
      id: `IND-${providerId}-9`,
      providerId,
      quarter: "Q4-2025",
      dimension: "Preventive",
      indicatorCode: "PRV-003",
      indicatorName: "Malnutrition Screening",
      rate: safetyRate(91.2, preventiveQ, "higher_is_better"),
      nationalBenchmark: 85.8,
      quintileRank: preventiveQ,
      trend: preventiveTrend,
    },
    {
      id: `IND-${providerId}-10`,
      providerId,
      quarter: "Q4-2025",
      dimension: "Preventive",
      indicatorCode: "PRV-004",
      indicatorName: "Oral Health Assessment",
      rate: safetyRate(82.4, preventiveQ, "higher_is_better"),
      nationalBenchmark: 78.4,
      quintileRank: preventiveQ,
      trend: preventiveTrend,
    },
    {
      id: `IND-${providerId}-11`,
      providerId,
      quarter: "Q4-2025",
      dimension: "Experience",
      indicatorCode: "EXP-001",
      indicatorName: "Complaint Rate",
      rate: safetyRate(3.2, experienceQ, "lower_is_better"),
      nationalBenchmark: 4.8,
      quintileRank: experienceQ,
      trend: experienceTrend,
    },
    {
      id: `IND-${providerId}-12`,
      providerId,
      quarter: "Q4-2025",
      dimension: "Experience",
      indicatorCode: "EXP-002",
      indicatorName: "Satisfaction Survey Score",
      rate: safetyRate(84.8, experienceQ, "higher_is_better"),
      nationalBenchmark: 80.2,
      quintileRank: experienceQ,
      trend: experienceTrend,
    },
    {
      id: `IND-${providerId}-13`,
      providerId,
      quarter: "Q4-2025",
      dimension: "Experience",
      indicatorCode: "EXP-003",
      indicatorName: "Social Engagement Rate",
      rate: safetyRate(72.4, experienceQ, "higher_is_better"),
      nationalBenchmark: 68.8,
      quintileRank: experienceQ,
      trend: experienceTrend,
    },
    {
      id: `IND-${providerId}-14`,
      providerId,
      quarter: "Q4-2025",
      dimension: "Equity",
      indicatorCode: "EQT-001",
      indicatorName: "Referral-to-Placement Time (days)",
      rate: safetyRate(18.4, equityQ, "lower_is_better"),
      nationalBenchmark: 22.8,
      quintileRank: equityQ,
      trend: equityTrend,
    },
    {
      id: `IND-${providerId}-15`,
      providerId,
      quarter: "Q4-2025",
      dimension: "Equity",
      indicatorCode: "EQT-002",
      indicatorName: "CALD Access Gap",
      rate: safetyRate(8.4, equityQ, "lower_is_better"),
      nationalBenchmark: 12.2,
      quintileRank: equityQ,
      trend: equityTrend,
    },
    {
      id: `IND-${providerId}-16`,
      providerId,
      quarter: "Q4-2025",
      dimension: "Quality",
      indicatorCode: "QM-001",
      indicatorName: "Satisfaction Survey Score",
      rate: safetyRate(84.8, qualityQ, "higher_is_better"),
      nationalBenchmark: 80.2,
      quintileRank: qualityQ,
      trend: qualityTrend,
    },
    {
      id: `IND-${providerId}-17`,
      providerId,
      quarter: "Q4-2025",
      dimension: "Quality",
      indicatorCode: "QM-002",
      indicatorName: "Clinical Outcome Score",
      rate: safetyRate(76.4, qualityQ, "higher_is_better"),
      nationalBenchmark: 74.2,
      quintileRank: qualityQ,
      trend: qualityTrend,
    },
    {
      id: `IND-${providerId}-18`,
      providerId,
      quarter: "Q4-2025",
      dimension: "Staffing",
      indicatorCode: "STAFF-001",
      indicatorName: "Registered Nurse Hours per Resident",
      rate: safetyRate(4.8, staffingQ, "higher_is_better"),
      nationalBenchmark: 4.1,
      quintileRank: staffingQ,
      trend: staffingTrend,
    },
    {
      id: `IND-${providerId}-19`,
      providerId,
      quarter: "Q4-2025",
      dimension: "Staffing",
      indicatorCode: "STAFF-002",
      indicatorName: "Staff Retention Rate",
      rate: safetyRate(88.2, staffingQ, "higher_is_better"),
      nationalBenchmark: 82.4,
      quintileRank: staffingQ,
      trend: staffingTrend,
    },
    {
      id: `IND-${providerId}-20`,
      providerId,
      quarter: "Q4-2025",
      dimension: "Compliance",
      indicatorCode: "COMP-001",
      indicatorName: "Accreditation Compliance Score",
      rate: safetyRate(92.4, complianceQ, "higher_is_better"),
      nationalBenchmark: 88.0,
      quintileRank: complianceQ,
      trend: complianceTrend,
    },
    {
      id: `IND-${providerId}-21`,
      providerId,
      quarter: "Q4-2025",
      dimension: "Compliance",
      indicatorCode: "COMP-002",
      indicatorName: "Mandatory Reporting Completeness",
      rate: safetyRate(96.8, complianceQ, "higher_is_better"),
      nationalBenchmark: 92.0,
      quintileRank: complianceQ,
      trend: complianceTrend,
    },
  ];
};

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
  // ── Sydney: 3 providers — HIGH / LOW / HIGH (5★, 1★, 5★) ──────────────────
  Sydney: [
    {
      // HIGH performer: strong across all domains — Overall ~5★
      id: "SYD-001",
      name: "Bondi Aged Care",
      city: "Sydney",
      type: "Residential",
      beds: 95,
      established: 2008,
      indicators: {
        residents: 4.7,
        staffing: 4.6,
        qualityMeasures: 4.8,
        compliance: 4.9,
        safetyClinical: 4.8,
        preventiveCare: 4.7,
        experience: 4.8,
        equity: 4.5,
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
            "✅ Staffing levels are outstanding. All positions are filled with qualified staff and retention is above 92%.",
        },
        qualityMeasures: {
          trend: "improving",
          insight:
            "✅ Quality Measures are exemplary, reflecting a culture of continuous improvement across all care domains.",
        },
        compliance: {
          trend: "stable",
          insight:
            "✅ Full compliance with all ACQSC standards. No outstanding notices or conditions.",
        },
        safetyClinical: {
          trend: "improving",
          insight:
            "✅ Falls harm rate is significantly below regional benchmark. Medication incidents are rare.",
        },
        preventiveCare: {
          trend: "improving",
          insight:
            "✅ Preventive screening completion rates are among the highest in the region. All mandatory bundles are on track.",
        },
        experience: {
          trend: "improving",
          insight:
            "✅ Resident satisfaction is outstanding with very low complaint rates and strong social engagement.",
        },
        equity: {
          trend: "stable",
          insight:
            "✅ Equity access performance is strong. First Nations and CALD community access gaps are well-managed.",
        },
      },
    },
    {
      // LOW performer: critically weak safety, poor staffing, poor preventive — Overall ~1★
      id: "SYD-002",
      name: "Northern Beaches Elder Support",
      city: "Sydney",
      type: "Home Care",
      established: 2014,
      indicators: {
        residents: 1.8,
        staffing: 1.4,
        qualityMeasures: 1.6,
        compliance: 2.0,
        safetyClinical: 1.2,
        preventiveCare: 1.3,
        experience: 1.7,
        equity: 2.1,
      },
      indicatorMeta: {
        residents: {
          trend: "declining",
          insight:
            "⚠ Resident Experience is critically below standard. High complaint volumes and unresolved grievances are ongoing.",
        },
        staffing: {
          trend: "declining",
          insight:
            "⚠ Staffing levels are critically below minimum thresholds. High turnover and unfilled clinical positions are severely impacting care delivery.",
        },
        qualityMeasures: {
          trend: "declining",
          insight:
            "⚠ Quality Measures are significantly below acceptable range. Immediate improvement plan is required.",
        },
        compliance: {
          trend: "declining",
          insight:
            "⚠ Multiple compliance notices outstanding. Provider is subject to enhanced monitoring by the regulator.",
        },
        safetyClinical: {
          trend: "declining",
          insight:
            "⚠ Falls with harm rate is 3× the national benchmark. Medication-related incidents are critically above threshold. Urgent intervention required.",
        },
        preventiveCare: {
          trend: "declining",
          insight:
            "⚠ Preventive screening completion is critically low at under 35% nationally. Falls risk, depression, and malnutrition screenings are all overdue.",
        },
        experience: {
          trend: "declining",
          insight:
            "⚠ Resident experience scores are in the bottom quintile nationally. Complaint rates are 4× the regional average.",
        },
        equity: {
          trend: "stable",
          insight:
            "⚠ Equity access performance is poor. Referral-to-placement time significantly exceeds the national benchmark.",
        },
      },
    },
    {
      // HIGH performer: 5★ — strong safety, excellent compliance — Overall ~5★
      id: "SYD-003",
      name: "Harbour View Care Centre",
      city: "Sydney",
      type: "Residential",
      beds: 120,
      established: 2005,
      indicators: {
        residents: 4.8,
        staffing: 4.9,
        qualityMeasures: 4.7,
        compliance: 5.0,
        safetyClinical: 4.9,
        preventiveCare: 4.6,
        experience: 4.8,
        equity: 4.4,
      },
      indicatorMeta: {
        residents: {
          trend: "improving",
          insight:
            "✅ Resident Experience is exceptional. Satisfaction surveys show 96% positive ratings across all care domains.",
        },
        staffing: {
          trend: "stable",
          insight:
            "✅ Staffing coverage is outstanding. All clinical positions filled; staff retention at 95%.",
        },
        qualityMeasures: {
          trend: "improving",
          insight:
            "✅ Quality Measures are at the highest level. Continuous improvement processes are embedded in daily care.",
        },
        compliance: {
          trend: "stable",
          insight:
            "✅ Full compliance across all ACQSC standards. This provider is a national benchmark for regulatory compliance.",
        },
        safetyClinical: {
          trend: "improving",
          insight:
            "✅ Safety indicators are exemplary. Falls harm rate is the lowest in the region. Zero medication-related serious incidents reported.",
        },
        preventiveCare: {
          trend: "improving",
          insight:
            "✅ Preventive screening completion at 97%. All mandatory bundles completed ahead of schedule.",
        },
        experience: {
          trend: "improving",
          insight:
            "✅ Resident satisfaction is outstanding. Complaint rate is negligible and all resolved within 24 hours.",
        },
        equity: {
          trend: "stable",
          insight:
            "✅ Equity access performance is strong. No measurable CALD access gap. Interpreter services fully embedded.",
        },
      },
    },
  ],

  // ── Melbourne: 2 providers — AVERAGE / HIGH (3★, 4★) ───────────────────────
  Melbourne: [
    {
      // AVERAGE performer: mixed — weak preventive, adequate safety — Overall ~3★
      id: "MEL-001",
      name: "Yarra Valley Life Care",
      city: "Melbourne",
      type: "Residential",
      beds: 80,
      established: 2001,
      indicators: {
        residents: 3.1,
        staffing: 2.8,
        qualityMeasures: 3.3,
        compliance: 3.5,
        safetyClinical: 3.2,
        preventiveCare: 1.9,
        experience: 3.0,
        equity: 2.9,
      },
      indicatorMeta: {
        residents: {
          trend: "stable",
          insight:
            "ℹ Resident Experience is below average. Survey completion rates are low, limiting data reliability.",
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
            "⚠ Preventive screening completion is critically low. Malnutrition and cognitive assessments are significantly overdue.",
        },
        experience: {
          trend: "stable",
          insight:
            "ℹ Experience indicators are below average. Complaint resolution time exceeds the national benchmark.",
        },
        equity: {
          trend: "stable",
          insight:
            "ℹ Equity access is marginal. First Nations and CALD community representation gaps have been identified.",
        },
      },
    },
    {
      // HIGH performer: strong staffing, good safety — Overall ~4★
      id: "MEL-002",
      name: "Southbank Senior Living",
      city: "Melbourne",
      type: "Residential",
      beds: 60,
      established: 1998,
      indicators: {
        residents: 4.2,
        staffing: 4.8,
        qualityMeasures: 4.1,
        compliance: 4.4,
        safetyClinical: 3.9,
        preventiveCare: 3.8,
        experience: 4.3,
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
            "✅ Excellent staffing coverage. Staff retention rates are the highest in the region and serve as a regional benchmark.",
        },
        qualityMeasures: {
          trend: "stable",
          insight:
            "✅ Quality Measures are performing well with consistent results over four quarters.",
        },
        compliance: {
          trend: "stable",
          insight:
            "✅ Compliance standards are well met. All mandatory reporting is submitted on time.",
        },
        safetyClinical: {
          trend: "stable",
          insight:
            "ℹ Safety performance is within acceptable range. Falls prevention protocols are in place and monitored.",
        },
        preventiveCare: {
          trend: "improving",
          insight:
            "ℹ Preventive Care completion is improving. Screening bundles are being progressively completed across all cohorts.",
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

  // ── Brisbane: 2 providers — HIGH / LOW-AVERAGE (5★, 2★) ─────────────────────
  Brisbane: [
    {
      // HIGH performer: top performer across all domains — Overall ~5★
      id: "BRI-001",
      name: "Sunshine Coast Elder Home",
      city: "Brisbane",
      type: "Residential",
      beds: 150,
      established: 2006,
      indicators: {
        residents: 4.8,
        staffing: 4.7,
        qualityMeasures: 4.6,
        compliance: 4.9,
        safetyClinical: 4.8,
        preventiveCare: 4.7,
        experience: 4.8,
        equity: 4.5,
      },
      indicatorMeta: {
        residents: {
          trend: "improving",
          insight:
            "✅ Resident Experience is consistently excellent, placing this provider in the top quintile nationally.",
        },
        staffing: {
          trend: "stable",
          insight:
            "✅ Staffing performance is outstanding. All positions filled with qualified staff; retention above 91%.",
        },
        qualityMeasures: {
          trend: "improving",
          insight:
            "✅ Quality Measures demonstrate a strong continuous improvement culture. Peer review outcomes are consistently positive.",
        },
        compliance: {
          trend: "stable",
          insight:
            "✅ Full compliance with all ACQSC standards. No outstanding notices or conditions.",
        },
        safetyClinical: {
          trend: "improving",
          insight:
            "✅ Safety and Clinical performance is excellent. Falls harm rate and medication incidents well below national average.",
        },
        preventiveCare: {
          trend: "stable",
          insight:
            "✅ Preventive Care completion rates are high across all mandatory screening bundles. Post-discharge protocols consistently met.",
        },
        experience: {
          trend: "improving",
          insight:
            "✅ Experience indicators outstanding. Complaint rates are the lowest in the region with rapid resolution.",
        },
        equity: {
          trend: "stable",
          insight:
            "✅ Equity access performance is strong. First Nations and CALD community access gaps are minimal and monitored proactively.",
        },
      },
    },
    {
      // LOW-AVERAGE performer: poor safety, weak preventive — Overall ~2★
      id: "BRI-002",
      name: "Gold Coast Residency",
      city: "Brisbane",
      type: "Residential",
      beds: 90,
      established: 2011,
      indicators: {
        residents: 2.4,
        staffing: 2.8,
        qualityMeasures: 2.2,
        compliance: 2.5,
        safetyClinical: 1.8,
        preventiveCare: 1.9,
        experience: 2.3,
        equity: 2.6,
      },
      indicatorMeta: {
        residents: {
          trend: "declining",
          insight:
            "⚠ Resident Experience is well below city average. Multiple unresolved complaints are under investigation.",
        },
        staffing: {
          trend: "declining",
          insight:
            "⚠ Staffing is critically below acceptable levels. Agency staff usage is at 45%, impacting continuity of care.",
        },
        qualityMeasures: {
          trend: "declining",
          insight:
            "⚠ Quality Measures are declining. Incident trend analysis shows worsening clinical governance outcomes.",
        },
        compliance: {
          trend: "declining",
          insight:
            "⚠ Compliance is below minimum requirements. Two conditions from the last assessment cycle remain unresolved.",
        },
        safetyClinical: {
          trend: "declining",
          insight:
            "⚠ Falls Risk Safety is critically poor. Incident rate is 2.8× the regional benchmark. A targeted safety improvement plan is urgently required.",
        },
        preventiveCare: {
          trend: "declining",
          insight:
            "⚠ Preventive Screening completion is significantly below national average. Falls risk and oral health screening are critically low.",
        },
        experience: {
          trend: "declining",
          insight:
            "⚠ Experience scores are in the lower quartile. Complaint resolution time has doubled year-on-year.",
        },
        equity: {
          trend: "stable",
          insight:
            "ℹ Equity access performance is marginal. Referral-to-placement time is above the regional average.",
        },
      },
    },
  ],

  // ── Perth: 4 providers — HIGH / AVERAGE / HIGH / LOW (5★, 3★, 4★, 2★) ───────
  Perth: [
    {
      // HIGH performer: strong safety + experience — Overall ~5★
      id: "PER-001",
      name: "Swan River Senior Care",
      city: "Perth",
      type: "Residential",
      beds: 110,
      established: 2009,
      indicators: {
        residents: 4.6,
        staffing: 4.8,
        qualityMeasures: 4.5,
        compliance: 4.9,
        safetyClinical: 4.7,
        preventiveCare: 4.5,
        experience: 4.7,
        equity: 4.3,
      },
      indicatorMeta: {
        residents: {
          trend: "improving",
          insight:
            "✅ Resident Experience scores are at the top quartile nationally. Satisfaction has improved for four consecutive quarters.",
        },
        staffing: {
          trend: "stable",
          insight:
            "✅ Staffing is excellent. All clinical positions filled; RN hours per resident exceed national requirement by 18%.",
        },
        qualityMeasures: {
          trend: "improving",
          insight:
            "✅ Quality Measures are top-tier. Clinical governance processes are embedded and consistently delivering strong outcomes.",
        },
        compliance: {
          trend: "stable",
          insight:
            "✅ Full compliance maintained. No notices or conditions outstanding from regulator.",
        },
        safetyClinical: {
          trend: "improving",
          insight:
            "✅ Falls with harm rate is well below the national benchmark. Medication-related incidents are negligible.",
        },
        preventiveCare: {
          trend: "improving",
          insight:
            "✅ Preventive screening completion at 94%. All mandatory screening bundles completed within required timeframes.",
        },
        experience: {
          trend: "improving",
          insight:
            "✅ Experience indicators are exceptional. Complaint rate is among the lowest in the state.",
        },
        equity: {
          trend: "stable",
          insight:
            "✅ Equity access is strong. First Nations and CALD access gap is minimal and proactively managed.",
        },
      },
    },
    {
      // AVERAGE performer: mixed indicators — strong staffing, weak safety — Overall ~3★
      id: "PER-002",
      name: "Fremantle Aged Services",
      city: "Perth",
      type: "Residential",
      beds: 85,
      established: 2013,
      indicators: {
        residents: 3.2,
        staffing: 4.1,
        qualityMeasures: 3.0,
        compliance: 3.4,
        safetyClinical: 2.6,
        preventiveCare: 2.8,
        experience: 3.1,
        equity: 3.3,
      },
      indicatorMeta: {
        residents: {
          trend: "stable",
          insight:
            "ℹ Resident Experience is below city average. Improvement in complaint handling processes is recommended.",
        },
        staffing: {
          trend: "improving",
          insight:
            "✅ Staffing is a relative strength. RN coverage ratios meet national standards and agency staff reliance has reduced.",
        },
        qualityMeasures: {
          trend: "stable",
          insight:
            "ℹ Quality Measures are marginally acceptable. Structured improvement planning is in progress.",
        },
        compliance: {
          trend: "stable",
          insight:
            "ℹ Compliance meets minimum requirements. One outstanding action item from the last audit cycle.",
        },
        safetyClinical: {
          trend: "declining",
          insight:
            "⚠ Falls with harm rate is above regional benchmark. Medication prevalence indicators require review.",
        },
        preventiveCare: {
          trend: "declining",
          insight:
            "⚠ Preventive screening completion is below national average. Depression screening and malnutrition review completion are lagging.",
        },
        experience: {
          trend: "stable",
          insight:
            "ℹ Experience indicators are below regional peers. Complaint resolution time is trending upward.",
        },
        equity: {
          trend: "stable",
          insight:
            "ℹ Equity performance is acceptable. Referral-to-placement monitoring is ongoing.",
        },
      },
    },
    {
      // HIGH performer: 4★ — good safety, strong staffing — Overall ~4★
      id: "PER-003",
      name: "Cottesloe Home Care",
      city: "Perth",
      type: "Home Care",
      established: 2016,
      indicators: {
        residents: 4.3,
        staffing: 4.5,
        qualityMeasures: 4.2,
        compliance: 4.6,
        safetyClinical: 4.4,
        preventiveCare: 4.1,
        experience: 4.4,
        equity: 4.0,
      },
      indicatorMeta: {
        residents: {
          trend: "stable",
          insight:
            "✅ Resident Experience is strong and consistent across all care domains. Satisfaction surveys show high engagement.",
        },
        staffing: {
          trend: "stable",
          insight:
            "✅ Staffing coverage is above average. RN hours per resident exceed national minimum.",
        },
        qualityMeasures: {
          trend: "improving",
          insight:
            "✅ Quality Measures are performing well. Incident review processes demonstrate a strong safety culture.",
        },
        compliance: {
          trend: "stable",
          insight:
            "✅ Compliance is well-maintained. All mandatory reporting submitted on time with no conditions.",
        },
        safetyClinical: {
          trend: "stable",
          insight:
            "✅ Safety performance is above average. Falls with harm rate is within the national top two quintiles.",
        },
        preventiveCare: {
          trend: "improving",
          insight:
            "✅ Preventive Care completion is improving. Screening bundles are being completed at an increasing rate.",
        },
        experience: {
          trend: "stable",
          insight:
            "✅ Experience indicators are above regional average. Resident feedback is positive.",
        },
        equity: {
          trend: "stable",
          insight:
            "ℹ Equity performance is acceptable. Access gap monitoring is ongoing.",
        },
      },
    },
    {
      // LOW performer: poor safety, very weak preventive — Overall ~2★
      id: "PER-004",
      name: "Rockingham Care Centre",
      city: "Perth",
      type: "Residential",
      beds: 68,
      established: 2010,
      indicators: {
        residents: 2.1,
        staffing: 2.4,
        qualityMeasures: 2.0,
        compliance: 2.3,
        safetyClinical: 1.6,
        preventiveCare: 1.8,
        experience: 2.2,
        equity: 2.5,
      },
      indicatorMeta: {
        residents: {
          trend: "declining",
          insight:
            "⚠ Resident Experience is critically low. Complaint volumes have increased and two formal investigations are underway.",
        },
        staffing: {
          trend: "declining",
          insight:
            "⚠ Staffing is significantly below minimum standards. Reliance on casual staff is impacting care continuity and quality.",
        },
        qualityMeasures: {
          trend: "declining",
          insight:
            "⚠ Quality Measures are poor. Multiple adverse incidents reflect systemic clinical governance failures.",
        },
        compliance: {
          trend: "declining",
          insight:
            "⚠ Multiple compliance conditions remain unresolved. Enhanced regulatory monitoring is in place.",
        },
        safetyClinical: {
          trend: "declining",
          insight:
            "⚠ Falls with harm rate is critically above benchmark. Polypharmacy prevalence is in the worst quintile nationally. Urgent review required.",
        },
        preventiveCare: {
          trend: "declining",
          insight:
            "⚠ Preventive screening completion is critically low at under 32%. All mandatory bundles are significantly overdue.",
        },
        experience: {
          trend: "declining",
          insight:
            "⚠ Experience scores are in the bottom decile nationally. Resident complaints are unresolved beyond 30 days.",
        },
        equity: {
          trend: "stable",
          insight:
            "⚠ Equity access is poor. Referral-to-placement time is 2× the national benchmark.",
        },
      },
    },
  ],

  // ── Adelaide: 4 providers — HIGH / AVERAGE / HIGH / AVERAGE (5★, 3★, 4★, 3★) ─
  Adelaide: [
    {
      // HIGH performer: excellent safety, top compliance — Overall ~5★
      id: "ADL-001",
      name: "Glenelg Senior Services",
      city: "Adelaide",
      type: "Residential",
      beds: 100,
      established: 2007,
      indicators: {
        residents: 4.7,
        staffing: 4.6,
        qualityMeasures: 4.8,
        compliance: 4.9,
        safetyClinical: 4.8,
        preventiveCare: 4.6,
        experience: 4.7,
        equity: 4.4,
      },
      indicatorMeta: {
        residents: {
          trend: "improving",
          insight:
            "✅ Resident Experience is outstanding. Placed in top quintile nationally for two consecutive reporting periods.",
        },
        staffing: {
          trend: "stable",
          insight:
            "✅ Staffing is excellent. All positions filled; staff retention rate is 93%.",
        },
        qualityMeasures: {
          trend: "improving",
          insight:
            "✅ Quality Measures are exemplary. Continuous improvement culture is reflected in all outcome metrics.",
        },
        compliance: {
          trend: "stable",
          insight:
            "✅ Full compliance with all ACQSC standards. No outstanding notices or conditions.",
        },
        safetyClinical: {
          trend: "improving",
          insight:
            "✅ Safety indicators are at the highest level. Falls harm rate is 60% below the national benchmark.",
        },
        preventiveCare: {
          trend: "improving",
          insight:
            "✅ Preventive Care completion at 95%. All mandatory bundles completed within required timeframes.",
        },
        experience: {
          trend: "improving",
          insight:
            "✅ Experience indicators are exceptional. Resident complaint rate is near zero.",
        },
        equity: {
          trend: "stable",
          insight:
            "✅ Equity access is strong. No measurable CALD access gap identified. First Nations access plan is active.",
        },
      },
    },
    {
      // AVERAGE performer: moderate across all — some weak areas — Overall ~3★
      id: "ADL-002",
      name: "Barossa Valley Elder Care",
      city: "Adelaide",
      type: "Residential",
      beds: 75,
      established: 2004,
      indicators: {
        residents: 3.3,
        staffing: 3.0,
        qualityMeasures: 3.4,
        compliance: 3.6,
        safetyClinical: 3.1,
        preventiveCare: 2.9,
        experience: 3.2,
        equity: 3.0,
      },
      indicatorMeta: {
        residents: {
          trend: "stable",
          insight:
            "ℹ Resident Experience is marginally acceptable. Improvement in care personalisation and complaint handling is recommended.",
        },
        staffing: {
          trend: "declining",
          insight:
            "⚠ Staffing ratios are declining. Vacancy rates are elevated and clinical supervision coverage is below standard.",
        },
        qualityMeasures: {
          trend: "stable",
          insight:
            "ℹ Quality Measures are borderline. Incident review cycle needs to be strengthened.",
        },
        compliance: {
          trend: "stable",
          insight:
            "ℹ Compliance is within minimum thresholds. One outstanding action item from the last audit cycle.",
        },
        safetyClinical: {
          trend: "stable",
          insight:
            "ℹ Safety performance is borderline. Falls rate is slightly above the regional average. Monitoring protocol is in place.",
        },
        preventiveCare: {
          trend: "declining",
          insight:
            "⚠ Preventive screening completion is below average. Cognitive and nutritional assessment completion rates require improvement.",
        },
        experience: {
          trend: "stable",
          insight:
            "ℹ Experience indicators are average. Complaint resolution times are within acceptable range but trending upward.",
        },
        equity: {
          trend: "stable",
          insight:
            "ℹ Equity performance is acceptable. Access gap monitoring is in place.",
        },
      },
    },
    {
      // HIGH performer: 4★ — good safety, above average staffing — Overall ~4★
      id: "ADL-003",
      name: "Hills District Home Care",
      city: "Adelaide",
      type: "Home Care",
      established: 2018,
      indicators: {
        residents: 4.1,
        staffing: 4.4,
        qualityMeasures: 4.2,
        compliance: 4.5,
        safetyClinical: 4.3,
        preventiveCare: 4.0,
        experience: 4.2,
        equity: 3.9,
      },
      indicatorMeta: {
        residents: {
          trend: "improving",
          insight:
            "✅ Resident Experience is strong. Recent improvements in care coordination have boosted satisfaction scores.",
        },
        staffing: {
          trend: "stable",
          insight:
            "✅ Staffing coverage is above average. Clinical supervision ratios meet national standards.",
        },
        qualityMeasures: {
          trend: "improving",
          insight:
            "✅ Quality Measures are above average and improving. Clinical governance processes are producing measurable outcomes.",
        },
        compliance: {
          trend: "stable",
          insight:
            "✅ Compliance is well-maintained. All mandatory reporting is submitted on time.",
        },
        safetyClinical: {
          trend: "stable",
          insight:
            "✅ Safety performance is good. Falls with harm rate is below the regional benchmark.",
        },
        preventiveCare: {
          trend: "improving",
          insight:
            "✅ Preventive Care completion is improving. Screening bundle completion rate increased 8% over the past quarter.",
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
    {
      // AVERAGE performer: balanced moderate — some gaps — Overall ~3★
      id: "ADL-004",
      name: "Port Adelaide Aged Care",
      city: "Adelaide",
      type: "Day Care",
      established: 2021,
      indicators: {
        residents: 3.0,
        staffing: 3.5,
        qualityMeasures: 3.1,
        compliance: 3.4,
        safetyClinical: 2.8,
        preventiveCare: 3.2,
        experience: 3.0,
        equity: 3.1,
      },
      indicatorMeta: {
        residents: {
          trend: "stable",
          insight:
            "ℹ Resident Experience is at the lower end of acceptable range. Survey participation rates need improvement.",
        },
        staffing: {
          trend: "stable",
          insight:
            "ℹ Staffing is adequate but below regional peers. Agency staff reliance is a concern for care continuity.",
        },
        qualityMeasures: {
          trend: "stable",
          insight:
            "ℹ Quality Measures are borderline. Improvement opportunities have been identified in clinical incident reporting.",
        },
        compliance: {
          trend: "stable",
          insight:
            "ℹ Compliance meets minimum requirements. Improvement plan is in progress.",
        },
        safetyClinical: {
          trend: "declining",
          insight:
            "⚠ Safety indicators are below average. Falls rate has increased in the past quarter. A targeted prevention plan is required.",
        },
        preventiveCare: {
          trend: "stable",
          insight:
            "ℹ Preventive Care completion is at the lower end of acceptable range. Cognitive assessment completion needs improvement.",
        },
        experience: {
          trend: "stable",
          insight:
            "ℹ Experience scores are average. Complaint resolution process is in place but requires strengthening.",
        },
        equity: {
          trend: "stable",
          insight:
            "ℹ Equity performance is acceptable. Access gap is being monitored.",
        },
      },
    },
  ],

  // ── Canberra: 4 providers — HIGH / AVERAGE / HIGH / LOW (5★, 3★, 4★, 2★) ────
  Canberra: [
    {
      // HIGH performer: 5★ — outstanding all-round — Overall ~5★
      id: "CAN-001",
      name: "Tuggeranong Senior Living",
      city: "Canberra",
      type: "Residential",
      beds: 130,
      established: 2006,
      indicators: {
        residents: 4.9,
        staffing: 4.8,
        qualityMeasures: 4.7,
        compliance: 5.0,
        safetyClinical: 4.9,
        preventiveCare: 4.8,
        experience: 4.9,
        equity: 4.6,
      },
      indicatorMeta: {
        residents: {
          trend: "improving",
          insight:
            "✅ Resident Experience is at the highest level nationally. Satisfaction surveys consistently yield 97%+ positive ratings.",
        },
        staffing: {
          trend: "stable",
          insight:
            "✅ Staffing is exceptional. All positions permanently filled; staff retention at 96%.",
        },
        qualityMeasures: {
          trend: "improving",
          insight:
            "✅ Quality Measures are at the national top. Continuous improvement culture is deeply embedded.",
        },
        compliance: {
          trend: "stable",
          insight:
            "✅ Full compliance with all ACQSC standards. Zero outstanding notices. Recognised as a sector leader in compliance.",
        },
        safetyClinical: {
          trend: "improving",
          insight:
            "✅ Safety indicators are exceptional. Falls with harm rate is 70% below the national benchmark.",
        },
        preventiveCare: {
          trend: "improving",
          insight:
            "✅ Preventive screening completion at 98%. Proactive screening model has become a sector exemplar.",
        },
        experience: {
          trend: "improving",
          insight:
            "✅ Experience indicators are outstanding. Near-zero complaint rate with all complaints resolved within 12 hours.",
        },
        equity: {
          trend: "stable",
          insight:
            "✅ Equity access is excellent. No measurable CALD access gap. First Nations access plan is fully implemented.",
        },
      },
    },
    {
      // AVERAGE performer: adequate across the board — some weak safety — Overall ~3★
      id: "CAN-002",
      name: "Belconnen Home Care",
      city: "Canberra",
      type: "Home Care",
      established: 2017,
      indicators: {
        residents: 3.4,
        staffing: 3.6,
        qualityMeasures: 3.2,
        compliance: 3.5,
        safetyClinical: 2.9,
        preventiveCare: 3.3,
        experience: 3.4,
        equity: 3.1,
      },
      indicatorMeta: {
        residents: {
          trend: "stable",
          insight:
            "ℹ Resident Experience is within acceptable range. Below city average with improvement opportunities in personalised care.",
        },
        staffing: {
          trend: "stable",
          insight:
            "ℹ Staffing is adequate but below city peers. Agency usage is moderate and being actively reduced.",
        },
        qualityMeasures: {
          trend: "stable",
          insight:
            "ℹ Quality Measures are borderline. Structured improvement planning is recommended.",
        },
        compliance: {
          trend: "stable",
          insight:
            "ℹ Compliance meets minimum requirements. One outstanding notice under resolution.",
        },
        safetyClinical: {
          trend: "declining",
          insight:
            "⚠ Safety performance is below average. Falls rate has increased and medication review cycle needs strengthening.",
        },
        preventiveCare: {
          trend: "stable",
          insight:
            "ℹ Preventive Care completion is at average levels. Screening bundle completion requires monitoring.",
        },
        experience: {
          trend: "stable",
          insight:
            "ℹ Experience indicators are borderline. Complaint resolution time has been improving slightly.",
        },
        equity: {
          trend: "stable",
          insight:
            "ℹ Equity performance is acceptable. Access gap monitoring is ongoing.",
        },
      },
    },
    {
      // HIGH performer: 4★ — strong compliance, good quality — Overall ~4★
      id: "CAN-003",
      name: "Gungahlin Elder Home",
      city: "Canberra",
      type: "Residential",
      beds: 88,
      established: 2012,
      indicators: {
        residents: 4.0,
        staffing: 4.2,
        qualityMeasures: 4.3,
        compliance: 4.6,
        safetyClinical: 4.1,
        preventiveCare: 3.9,
        experience: 4.0,
        equity: 3.8,
      },
      indicatorMeta: {
        residents: {
          trend: "stable",
          insight:
            "✅ Resident Experience is above average. Satisfaction surveys show positive trends.",
        },
        staffing: {
          trend: "improving",
          insight:
            "✅ Staffing coverage is improving. New recruits have increased RN hours per resident above national minimum.",
        },
        qualityMeasures: {
          trend: "improving",
          insight:
            "✅ Quality Measures are performing well. Clinical governance processes are producing good outcomes.",
        },
        compliance: {
          trend: "stable",
          insight:
            "✅ Compliance is well-maintained. All mandatory reporting submitted on time with no conditions.",
        },
        safetyClinical: {
          trend: "stable",
          insight:
            "✅ Safety performance is above average. Falls with harm rate is within the national top two quintiles.",
        },
        preventiveCare: {
          trend: "stable",
          insight:
            "ℹ Preventive Care completion is within acceptable range. Malnutrition screening completion requires monitoring.",
        },
        experience: {
          trend: "stable",
          insight:
            "✅ Experience indicators are above regional average. Resident feedback is positive.",
        },
        equity: {
          trend: "stable",
          insight:
            "ℹ Equity performance is acceptable. Access gap monitoring is ongoing.",
        },
      },
    },
    {
      // LOW performer: poor safety, poor staffing — Overall ~2★
      id: "CAN-004",
      name: "Woden Valley Care",
      city: "Canberra",
      type: "Residential",
      beds: 105,
      established: 2009,
      indicators: {
        residents: 2.3,
        staffing: 1.9,
        qualityMeasures: 2.1,
        compliance: 2.4,
        safetyClinical: 1.7,
        preventiveCare: 2.0,
        experience: 2.2,
        equity: 2.5,
      },
      indicatorMeta: {
        residents: {
          trend: "declining",
          insight:
            "⚠ Resident Experience is significantly below standard. High complaint volumes and slow resolution times are impacting the rating.",
        },
        staffing: {
          trend: "declining",
          insight:
            "⚠ Staffing is critically below minimum thresholds. High vacancy rates and heavy reliance on casual staff are impacting care quality.",
        },
        qualityMeasures: {
          trend: "declining",
          insight:
            "⚠ Quality Measures are poor. Incident analysis reveals systemic failures in clinical governance processes.",
        },
        compliance: {
          trend: "declining",
          insight:
            "⚠ Multiple compliance conditions outstanding. Provider is subject to enhanced monitoring.",
        },
        safetyClinical: {
          trend: "declining",
          insight:
            "⚠ Safety indicators are critically poor. Falls with harm rate is in the worst quintile nationally. Pressure injury prevalence is above the acceptable threshold.",
        },
        preventiveCare: {
          trend: "declining",
          insight:
            "⚠ Preventive screening completion is critically low. All mandatory bundles are significantly overdue across multiple cohorts.",
        },
        experience: {
          trend: "declining",
          insight:
            "⚠ Experience scores are in the lower quartile nationally. Complaint rates have increased sharply in the past two quarters.",
        },
        equity: {
          trend: "stable",
          insight:
            "⚠ Equity access performance is below standard. CALD access gap and referral-to-placement time require urgent attention.",
        },
      },
    },
  ],

  // ── Hobart: 4 providers — AVERAGE / AVERAGE-LOW / HIGH / LOW (3★, 3★, 4★, 1★) ─
  Hobart: [
    {
      // AVERAGE performer: balanced moderate — Overall ~3★
      id: "HOB-001",
      name: "Sandy Bay Senior Care",
      city: "Hobart",
      type: "Residential",
      beds: 92,
      established: 2010,
      indicators: {
        residents: 3.3,
        staffing: 3.5,
        qualityMeasures: 3.4,
        compliance: 3.7,
        safetyClinical: 3.0,
        preventiveCare: 3.2,
        experience: 3.3,
        equity: 3.1,
      },
      indicatorMeta: {
        residents: {
          trend: "stable",
          insight:
            "ℹ Resident Experience is within acceptable range. Improvement planning is in progress.",
        },
        staffing: {
          trend: "stable",
          insight:
            "ℹ Staffing is adequate but below city peers. Agency usage has stabilised.",
        },
        qualityMeasures: {
          trend: "stable",
          insight:
            "ℹ Quality Measures are borderline. Improvement opportunities have been identified.",
        },
        compliance: {
          trend: "stable",
          insight:
            "ℹ Compliance meets minimum requirements. No new notices outstanding.",
        },
        safetyClinical: {
          trend: "stable",
          insight:
            "ℹ Safety performance is average. Falls rate is within the national mid-range. Improvement plan is in place.",
        },
        preventiveCare: {
          trend: "stable",
          insight:
            "ℹ Preventive Care completion is at average levels. Screening bundle completion requires ongoing monitoring.",
        },
        experience: {
          trend: "stable",
          insight:
            "ℹ Experience indicators are borderline. Complaint resolution process is in place.",
        },
        equity: {
          trend: "stable",
          insight:
            "ℹ Equity performance is acceptable. Access gap is being monitored.",
        },
      },
    },
    {
      // AVERAGE-LOW performer: weak safety but improving, moderate compliance — Overall ~3★
      id: "HOB-002",
      name: "Huon Valley Elder Services",
      city: "Hobart",
      type: "Home Care",
      established: 2019,
      indicators: {
        residents: 2.9,
        staffing: 3.2,
        qualityMeasures: 2.7,
        compliance: 3.1,
        safetyClinical: 2.4,
        preventiveCare: 2.6,
        experience: 2.8,
        equity: 3.0,
      },
      indicatorMeta: {
        residents: {
          trend: "stable",
          insight:
            "ℹ Resident Experience is below average. Improvement in complaint handling is required.",
        },
        staffing: {
          trend: "improving",
          insight:
            "ℹ Staffing is improving from a low base. New recruitment campaign has reduced vacancy rates.",
        },
        qualityMeasures: {
          trend: "stable",
          insight:
            "ℹ Quality Measures are below acceptable range. Structured improvement planning is recommended.",
        },
        compliance: {
          trend: "stable",
          insight:
            "ℹ Compliance meets minimum requirements. One outstanding action item remains open.",
        },
        safetyClinical: {
          trend: "improving",
          insight:
            "⚠ Safety performance is below average but has improved slightly. Falls rate remains above the regional benchmark.",
        },
        preventiveCare: {
          trend: "stable",
          insight:
            "⚠ Preventive Care completion is below national average. Cognitive and malnutrition screening bundles require priority attention.",
        },
        experience: {
          trend: "stable",
          insight:
            "ℹ Experience indicators are below average. Complaint resolution time has improved but remains above the national benchmark.",
        },
        equity: {
          trend: "stable",
          insight:
            "ℹ Equity performance is acceptable. Access gap monitoring is in place.",
        },
      },
    },
    {
      // HIGH performer: 4★ — strong quality, good safety — Overall ~4★
      id: "HOB-003",
      name: "North Hobart Aged Care",
      city: "Hobart",
      type: "Residential",
      beds: 115,
      established: 2007,
      indicators: {
        residents: 4.2,
        staffing: 4.5,
        qualityMeasures: 4.4,
        compliance: 4.7,
        safetyClinical: 4.3,
        preventiveCare: 4.1,
        experience: 4.2,
        equity: 4.0,
      },
      indicatorMeta: {
        residents: {
          trend: "improving",
          insight:
            "✅ Resident Experience is strong. Satisfaction surveys show consistent above-average results.",
        },
        staffing: {
          trend: "stable",
          insight:
            "✅ Staffing is above average. RN hours per resident exceed national minimum by 15%.",
        },
        qualityMeasures: {
          trend: "improving",
          insight:
            "✅ Quality Measures are performing well. Continuous improvement processes are driving measurable outcomes.",
        },
        compliance: {
          trend: "stable",
          insight:
            "✅ Compliance is well-maintained. All mandatory reporting submitted on time with no conditions.",
        },
        safetyClinical: {
          trend: "stable",
          insight:
            "✅ Safety performance is above average. Falls with harm rate is in the national top two quintiles.",
        },
        preventiveCare: {
          trend: "improving",
          insight:
            "✅ Preventive Care completion is improving. Screening bundle completion rate is above the national average.",
        },
        experience: {
          trend: "stable",
          insight:
            "✅ Experience indicators are above regional average. Resident feedback is positive.",
        },
        equity: {
          trend: "stable",
          insight:
            "✅ Equity performance is good. First Nations and CALD access gap is being actively managed.",
        },
      },
    },
    {
      // LOW performer: 1★ — critically weak across all domains — Overall ~1★
      id: "HOB-004",
      name: "Tasman Care Home",
      city: "Hobart",
      type: "Residential",
      beds: 70,
      established: 2015,
      indicators: {
        residents: 1.4,
        staffing: 1.6,
        qualityMeasures: 1.3,
        compliance: 1.5,
        safetyClinical: 1.1,
        preventiveCare: 1.2,
        experience: 1.4,
        equity: 1.7,
      },
      indicatorMeta: {
        residents: {
          trend: "declining",
          insight:
            "⚠ Resident Experience is critically poor. Multiple formal complaints are under active investigation by the regulator.",
        },
        staffing: {
          trend: "declining",
          insight:
            "⚠ Staffing is critically below minimum requirements. Reliance on unqualified staff is a significant clinical risk.",
        },
        qualityMeasures: {
          trend: "declining",
          insight:
            "⚠ Quality Measures are at the lowest level. Systemic failures in clinical governance have been identified.",
        },
        compliance: {
          trend: "declining",
          insight:
            "⚠ Provider is non-compliant with multiple mandatory standards. Formal improvement notice has been issued.",
        },
        safetyClinical: {
          trend: "declining",
          insight:
            "⚠ Safety indicators are at the national worst quintile. Falls with serious harm rate is 4× the national benchmark. Urgent escalation required.",
        },
        preventiveCare: {
          trend: "declining",
          insight:
            "⚠ Preventive screening completion is critically low at under 22%. Systematic failure to complete mandatory screening bundles.",
        },
        experience: {
          trend: "declining",
          insight:
            "⚠ Experience scores are in the bottom decile. Complaint rates are the highest in the city. Resident advocacy involvement is recommended.",
        },
        equity: {
          trend: "declining",
          insight:
            "⚠ Equity access performance is the worst in the region. Significant barriers to First Nations and CALD community access have been identified.",
        },
      },
    },
  ],

  // ── Darwin: 4 providers — HIGH / AVERAGE / HIGH / AVERAGE (4★, 3★, 5★, 3★) ──
  Darwin: [
    {
      // HIGH performer: 4★ — good overall — Overall ~4★
      id: "DAR-001",
      name: "Mindil Beach Senior Care",
      city: "Darwin",
      type: "Residential",
      beds: 82,
      established: 2008,
      indicators: {
        residents: 4.1,
        staffing: 4.4,
        qualityMeasures: 4.0,
        compliance: 4.5,
        safetyClinical: 4.2,
        preventiveCare: 3.9,
        experience: 4.1,
        equity: 3.8,
      },
      indicatorMeta: {
        residents: {
          trend: "stable",
          insight:
            "✅ Resident Experience is above average. Satisfaction surveys show consistent positive results.",
        },
        staffing: {
          trend: "stable",
          insight:
            "✅ Staffing coverage is strong. All clinical positions are filled and retention is above 88%.",
        },
        qualityMeasures: {
          trend: "improving",
          insight:
            "✅ Quality Measures are performing well. Clinical governance processes are delivering strong outcomes.",
        },
        compliance: {
          trend: "stable",
          insight:
            "✅ Compliance is well-maintained. All mandatory reporting submitted on time.",
        },
        safetyClinical: {
          trend: "stable",
          insight:
            "✅ Safety performance is above average. Falls with harm rate is within the national top two quintiles.",
        },
        preventiveCare: {
          trend: "stable",
          insight:
            "ℹ Preventive Care completion is within acceptable range. Minor improvement opportunities in cognitive assessment completion.",
        },
        experience: {
          trend: "stable",
          insight:
            "✅ Experience indicators are above regional average. Resident feedback is consistently positive.",
        },
        equity: {
          trend: "stable",
          insight:
            "ℹ Equity performance is acceptable. First Nations community access gap monitoring is ongoing.",
        },
      },
    },
    {
      // AVERAGE performer: moderate indicators — some weak areas — Overall ~3★
      id: "DAR-002",
      name: "Palmerston Aged Services",
      city: "Darwin",
      type: "Residential",
      beds: 65,
      established: 2003,
      indicators: {
        residents: 3.1,
        staffing: 3.4,
        qualityMeasures: 3.0,
        compliance: 3.3,
        safetyClinical: 2.7,
        preventiveCare: 2.9,
        experience: 3.1,
        equity: 3.2,
      },
      indicatorMeta: {
        residents: {
          trend: "stable",
          insight:
            "ℹ Resident Experience is within acceptable range but below city average. Improvement plan is in progress.",
        },
        staffing: {
          trend: "stable",
          insight:
            "ℹ Staffing is adequate but below city peers. Agency usage is moderate.",
        },
        qualityMeasures: {
          trend: "stable",
          insight:
            "ℹ Quality Measures are borderline. Structured improvement planning is recommended.",
        },
        compliance: {
          trend: "stable",
          insight:
            "ℹ Compliance meets minimum requirements. One outstanding action item remains open.",
        },
        safetyClinical: {
          trend: "declining",
          insight:
            "⚠ Safety performance is below average. Falls rate has increased slightly. Medication prevalence indicators require attention.",
        },
        preventiveCare: {
          trend: "stable",
          insight:
            "⚠ Preventive Care completion is below average. Screening bundles for malnutrition and depression are lagging.",
        },
        experience: {
          trend: "stable",
          insight:
            "ℹ Experience indicators are below city average. Complaint resolution time is above the national benchmark.",
        },
        equity: {
          trend: "stable",
          insight:
            "ℹ Equity performance is acceptable. First Nations access gap is being monitored.",
        },
      },
    },
    {
      // HIGH performer: 5★ — exceptional safety, top compliance — Overall ~5★
      id: "DAR-003",
      name: "Darwin Harbour Care",
      city: "Darwin",
      type: "Home Care",
      established: 2016,
      indicators: {
        residents: 4.8,
        staffing: 4.7,
        qualityMeasures: 4.9,
        compliance: 4.9,
        safetyClinical: 4.9,
        preventiveCare: 4.8,
        experience: 4.8,
        equity: 4.6,
      },
      indicatorMeta: {
        residents: {
          trend: "improving",
          insight:
            "✅ Resident Experience is outstanding. Satisfaction surveys place this provider in the top quintile nationally.",
        },
        staffing: {
          trend: "stable",
          insight:
            "✅ Staffing is excellent. All positions filled permanently; staff retention at 94%.",
        },
        qualityMeasures: {
          trend: "improving",
          insight:
            "✅ Quality Measures are at the highest level nationally. Continuous improvement culture is evident in all care domains.",
        },
        compliance: {
          trend: "stable",
          insight:
            "✅ Full compliance with all ACQSC standards. Zero outstanding notices.",
        },
        safetyClinical: {
          trend: "improving",
          insight:
            "✅ Safety indicators are at the national top. Falls with harm rate is 72% below the national benchmark.",
        },
        preventiveCare: {
          trend: "improving",
          insight:
            "✅ Preventive screening completion at 97%. Proactive screening model recognised as a sector exemplar.",
        },
        experience: {
          trend: "improving",
          insight:
            "✅ Experience indicators are exceptional. Near-zero complaint rate with all complaints resolved within 24 hours.",
        },
        equity: {
          trend: "stable",
          insight:
            "✅ Equity access is excellent. First Nations community access program is fully operational. No measurable CALD access gap.",
        },
      },
    },
    {
      // AVERAGE performer: moderate but with some weak safety — Overall ~3★
      id: "DAR-004",
      name: "Casuarina Elder Care",
      city: "Darwin",
      type: "Day Care",
      established: 2020,
      indicators: {
        residents: 3.5,
        staffing: 3.7,
        qualityMeasures: 3.3,
        compliance: 3.8,
        safetyClinical: 3.0,
        preventiveCare: 3.4,
        experience: 3.4,
        equity: 3.2,
      },
      indicatorMeta: {
        residents: {
          trend: "stable",
          insight:
            "ℹ Resident Experience is within acceptable range. Survey participation rates should be improved for more reliable data.",
        },
        staffing: {
          trend: "stable",
          insight:
            "ℹ Staffing is adequate but below city peers. Agency staff reliance has been stable.",
        },
        qualityMeasures: {
          trend: "stable",
          insight:
            "ℹ Quality Measures are borderline. Improvement opportunities have been identified in clinical incident reporting.",
        },
        compliance: {
          trend: "stable",
          insight:
            "ℹ Compliance meets requirements. No new notices outstanding.",
        },
        safetyClinical: {
          trend: "stable",
          insight:
            "ℹ Safety performance is average. Falls rate is within the national mid-range. Monitoring protocol is in place.",
        },
        preventiveCare: {
          trend: "stable",
          insight:
            "ℹ Preventive Care completion is within acceptable range. Cognitive assessment completion requires monitoring.",
        },
        experience: {
          trend: "stable",
          insight:
            "ℹ Experience scores are average. Complaint resolution process is in place.",
        },
        equity: {
          trend: "stable",
          insight:
            "ℹ Equity performance is acceptable. First Nations access gap is being monitored.",
        },
      },
    },
  ],
};

export const CITY_LIST = Object.keys(CITY_PROVIDERS);

// ── Unified Provider List (single source of truth for all modules) ────────────

const CITY_TO_STATE: Record<string, string> = {
  Sydney: "New South Wales",
  Melbourne: "Victoria",
  Brisbane: "Queensland",
  Perth: "Western Australia",
  Adelaide: "South Australia",
  Canberra: "Australian Capital Territory",
  Hobart: "Tasmania",
  Darwin: "Northern Territory",
};

export interface UnifiedProvider {
  id: string;
  name: string;
  city: string;
  type: string;
  serviceType: string;
  state: string;
  beds?: number;
  established: number;
  accreditationStatus: "accredited" | "conditional" | "not-accredited";
  acqscStandards: number;
  domainScores: {
    safety: number;
    preventive: number;
    quality: number;
    staffing: number;
    compliance: number;
    experience: number;
  };
  overallStars: number;
}

function cityProviderToDomainScores(cp: CityProvider): {
  safety: number;
  preventive: number;
  quality: number;
  staffing: number;
  compliance: number;
  experience: number;
} {
  return {
    safety: starsToPercentScore(cp.indicators.safetyClinical),
    preventive: starsToPercentScore(cp.indicators.preventiveCare),
    quality: starsToPercentScore(cp.indicators.qualityMeasures),
    staffing: starsToPercentScore(cp.indicators.staffing),
    compliance: starsToPercentScore(cp.indicators.compliance),
    experience: starsToPercentScore(
      (cp.indicators.residents + cp.indicators.experience) / 2,
    ),
  };
}

function cityProviderToOverallStars(cp: CityProvider): number {
  const d = cityProviderToDomainScores(cp);
  const overallScore = calcNewWeightedOverallScore(d);
  return overallScoreToStars(overallScore);
}

export const UNIFIED_PROVIDERS: UnifiedProvider[] = Object.values(
  CITY_PROVIDERS,
)
  .flat()
  .map((cp) => {
    const domainScores = cityProviderToDomainScores(cp);
    const overallStars = cityProviderToOverallStars(cp);
    let accreditationStatus: "accredited" | "conditional" | "not-accredited" =
      "not-accredited";
    if (overallStars >= 4) accreditationStatus = "accredited";
    else if (overallStars >= 3) accreditationStatus = "conditional";
    const acqscStandards = Math.min(
      8,
      Math.max(1, Math.round((overallStars / 5) * 8)),
    );
    return {
      id: cp.id,
      name: cp.name,
      city: cp.city,
      type: cp.type,
      serviceType: cp.type,
      state: CITY_TO_STATE[cp.city] ?? cp.city,
      beds: cp.beds,
      established: cp.established,
      accreditationStatus,
      acqscStandards,
      domainScores,
      overallStars,
    };
  });

/**
 * Returns domain star scores for any provider ID.
 * For UNIFIED_PROVIDERS (city-based IDs like SYD-001), returns computed domain scores.
 * Falls back to getProviderDomainStarScores for legacy PROV-xxx IDs.
 */
export function getUnifiedProviderDomainScores(
  providerId: string,
  quarter = "Q4-2025",
): {
  safety: number;
  preventive: number;
  quality: number;
  staffing: number;
  compliance: number;
  experience: number;
} {
  if (quarter === "Q4-2025") {
    const unified = UNIFIED_PROVIDERS.find((p) => p.id === providerId);
    if (unified) return unified.domainScores;
    const starScores = getProviderDomainStarScores(providerId);
    return {
      safety: starsToPercentScore(starScores.safety),
      preventive: starsToPercentScore(starScores.preventive),
      quality: starsToPercentScore(starScores.quality),
      staffing: starsToPercentScore(starScores.staffing),
      compliance: starsToPercentScore(starScores.compliance),
      experience: starsToPercentScore(starScores.experience),
    };
  }
  // For non-base quarters, recalculate from quarter-specific indicator data
  const inds = getUnifiedProviderIndicators(providerId, quarter);
  // Use new 0-100 scoring model
  const domMap: Record<string, number[]> = {
    Safety: [],
    Preventive: [],
    Quality: [],
    Staffing: [],
    Compliance: [],
    Experience: [],
  };
  for (const ind of inds) {
    const score =
      ind.rate !== undefined &&
      ind.nationalBenchmark !== undefined &&
      ind.nationalBenchmark !== 0 &&
      ind.rate !== 0
        ? Math.min(
            100,
            ind.isLowerBetter
              ? (ind.nationalBenchmark / ind.rate) * 100
              : (ind.rate / ind.nationalBenchmark) * 100,
          )
        : 75;
    const dimKey = ind.dimension as keyof typeof domMap;
    if (domMap[dimKey]) domMap[dimKey].push(score);
  }
  const avg = (arr: number[]) =>
    arr.length === 0 ? 3 : arr.reduce((a, b) => a + b, 0) / arr.length;
  return {
    safety: avg(domMap.Safety),
    preventive: avg(domMap.Preventive),
    quality: avg(domMap.Quality),
    staffing: avg(domMap.Staffing),
    compliance: avg(domMap.Compliance),
    experience: avg(domMap.Experience),
  };
}

/**
 * Returns 10 mock indicators for any provider ID, derived from that provider's
 * domain scores so that ratings are consistent across all modules.
 */
export function getUnifiedProviderIndicators(
  providerId: string,
  quarter = "Q4-2025",
): Array<{
  id: string;
  providerId: string;
  quarter: string;
  dimension: string;
  indicatorCode: string;
  indicatorName: string;
  rate: number;
  nationalBenchmark: number;
  quintileRank: number;
  trend: "improving" | "stable" | "declining";
  isLowerBetter: boolean;
}> {
  const QUARTER_MULTIPLIERS: Record<string, number> = {
    "Q1-2025": 1.18,
    "Q2-2025": 1.09,
    "Q3-2025": 1.0,
    "Q4-2025": 0.92,
  };
  const qMult = QUARTER_MULTIPLIERS[quarter] ?? 1.0;

  function adjustQuintileForQuarter(baseQ: number, q: string): number {
    const adj: Record<string, number> = {
      "Q1-2025": 1,
      "Q2-2025": 0,
      "Q3-2025": 0,
      "Q4-2025": -1,
    };
    return Math.min(5, Math.max(1, baseQ + (adj[q] ?? 0)));
  }

  function applyQuarterRate(baseRate: number, isLowerBetter2: boolean): number {
    if (isLowerBetter2) return Number.parseFloat((baseRate * qMult).toFixed(1));
    return Number.parseFloat(Math.min(100, baseRate / qMult).toFixed(1));
  }

  function quarterTrend(
    baseTrend: "improving" | "stable" | "declining",
    q_rank: number,
  ): "improving" | "stable" | "declining" {
    if (quarter === "Q1-2025" && q_rank >= 4) return "declining";
    if (quarter === "Q4-2025" && baseTrend === "stable") return "improving";
    return baseTrend;
  }

  const d = getUnifiedProviderDomainScores(providerId);

  // Get trend from city provider meta if available
  function getTrend(
    cp: CityProvider | undefined,
    field: keyof NonNullable<CityProvider["indicatorMeta"]>,
  ): "improving" | "stable" | "declining" {
    return cp?.indicatorMeta?.[field as string]?.trend ?? "stable";
  }

  const cityProvider = Object.values(CITY_PROVIDERS)
    .flat()
    .find((p) => p.id === providerId);

  const safetyTrend = getTrend(cityProvider, "safetyClinical");
  const preventiveTrend = getTrend(cityProvider, "preventiveCare");
  const qualityTrend = getTrend(cityProvider, "qualityMeasures");
  const staffingTrend = getTrend(cityProvider, "staffing");
  const complianceTrend = getTrend(cityProvider, "compliance");
  const experienceTrend = getTrend(cityProvider, "experience");

  // Per-indicator quintile from provider-specific domain sub-scores
  // Uses the city provider's individual indicator scores for each specific indicator
  const cp = cityProvider;

  // Derive per-indicator quintiles from individual domain indicator values stored on CityProvider
  // This gives each indicator a distinct quintile instead of sharing the domain-level quintile
  function indQ(starScore: number): number {
    return Math.min(5, Math.max(1, Math.round(6 - starScore)));
  }

  // Safety sub-indicators: derive from safetyClinical score with per-indicator offsets
  const safetyBase = cp ? cp.indicators.safetyClinical : d.safety;
  const falls_q = indQ(safetyBase);
  const medHarm_q = indQ(
    Math.min(
      5,
      Math.max(1, safetyBase + (cp ? (cp.indicators.compliance - 3) * 0.2 : 0)),
    ),
  );
  const highRiskMed_q = indQ(
    Math.min(
      5,
      Math.max(1, safetyBase - (cp ? (cp.indicators.staffing - 3) * 0.15 : 0)),
    ),
  );
  const polypharmacy_q = indQ(
    Math.min(
      5,
      Math.max(
        1,
        safetyBase + (cp ? (cp.indicators.preventiveCare - 3) * 0.18 : 0),
      ),
    ),
  );
  const pressure_q = indQ(
    Math.min(
      5,
      Math.max(
        1,
        safetyBase - (cp ? (cp.indicators.qualityMeasures - 3) * 0.12 : 0),
      ),
    ),
  );
  const ed_q = indQ(
    Math.min(
      5,
      Math.max(1, safetyBase + (cp ? (cp.indicators.residents - 3) * 0.1 : 0)),
    ),
  );

  // Preventive sub-indicators
  const prevBase = cp ? cp.indicators.preventiveCare : d.preventive;
  const fallsScreen_q = indQ(prevBase);
  const deprScreen_q = indQ(
    Math.min(
      5,
      Math.max(1, prevBase + (cp ? (cp.indicators.experience - 3) * 0.15 : 0)),
    ),
  );
  const malnutrition_q = indQ(
    Math.min(
      5,
      Math.max(1, prevBase - (cp ? (cp.indicators.staffing - 3) * 0.1 : 0)),
    ),
  );

  // Quality sub-indicators
  const qualBase = cp ? cp.indicators.qualityMeasures : d.quality;
  const satisfaction_q = indQ(qualBase);
  const clinical_q = indQ(
    Math.min(
      5,
      Math.max(1, qualBase + (cp ? (cp.indicators.compliance - 3) * 0.1 : 0)),
    ),
  );

  // Staffing sub-indicators
  const staffBase = cp ? cp.indicators.staffing : d.staffing;
  const rnHours_q = indQ(staffBase);
  const retention_q = indQ(
    Math.min(
      5,
      Math.max(1, staffBase + (cp ? (cp.indicators.compliance - 3) * 0.12 : 0)),
    ),
  );

  // Compliance sub-indicators
  const compBase = cp ? cp.indicators.compliance : d.compliance;
  const accred_q = indQ(compBase);
  const reporting_q = indQ(
    Math.min(
      5,
      Math.max(
        1,
        compBase + (cp ? (cp.indicators.qualityMeasures - 3) * 0.1 : 0),
      ),
    ),
  );

  // Experience sub-indicators
  const expBase = cp ? cp.indicators.experience : d.experience;
  const expSatisfaction_q = indQ(expBase);
  const complaintRate_q = indQ(
    Math.min(
      5,
      Math.max(1, expBase - (cp ? (cp.indicators.residents - 3) * 0.15 : 0)),
    ),
  );

  function indRate(
    base: number,
    q: number,
    scale: "lower_is_better" | "higher_is_better",
  ): number {
    const qFactor: Record<number, number> = {
      1: 0.62,
      2: 0.8,
      3: 1.0,
      4: 1.28,
      5: 1.62,
    };
    const f = qFactor[q] ?? 1.0;
    return scale === "lower_is_better"
      ? Number.parseFloat((base * f).toFixed(1))
      : Number.parseFloat(Math.min(100, base / f).toFixed(1));
  }

  // Derive trend per indicator from domain trend + slight per-indicator variation
  function indTrend(
    domainTrend: "improving" | "stable" | "declining",
    q: number,
  ): "improving" | "stable" | "declining" {
    // Low-quintile (poor) providers tend to have declining indicators
    if (domainTrend === "declining") return "declining";
    if (domainTrend === "improving") return q <= 2 ? "improving" : "stable";
    // Stable domain: top quintile might still be improving on individual indicators
    if (q === 1) return "improving";
    if (q === 5) return "declining";
    return "stable";
  }

  return [
    {
      id: `IND-${providerId}-1`,
      providerId,
      quarter,
      dimension: "Safety",
      indicatorCode: "SAF-001",
      indicatorName: "Falls with Harm Rate",
      rate: applyQuarterRate(indRate(4.2, falls_q, "lower_is_better"), true),
      nationalBenchmark: 5.1,
      quintileRank: adjustQuintileForQuarter(falls_q, quarter),
      trend: quarterTrend(indTrend(safetyTrend, falls_q), falls_q),
      isLowerBetter: true,
    },
    {
      id: `IND-${providerId}-2`,
      providerId,
      quarter,
      dimension: "Safety",
      indicatorCode: "SAF-002",
      indicatorName: "Medication-Related Harm",
      rate: applyQuarterRate(indRate(2.8, medHarm_q, "lower_is_better"), true),
      nationalBenchmark: 3.2,
      quintileRank: medHarm_q,
      trend: indTrend(safetyTrend, medHarm_q),
      isLowerBetter: true,
    },
    {
      id: `IND-${providerId}-3`,
      providerId,
      quarter,
      dimension: "Safety",
      indicatorCode: "SAF-003",
      indicatorName: "High-Risk Medication Prevalence",
      rate: applyQuarterRate(
        indRate(18.4, highRiskMed_q, "lower_is_better"),
        true,
      ),
      nationalBenchmark: 21.2,
      quintileRank: highRiskMed_q,
      trend: indTrend(safetyTrend, highRiskMed_q),
      isLowerBetter: true,
    },
    {
      id: `IND-${providerId}-4`,
      providerId,
      quarter,
      dimension: "Safety",
      indicatorCode: "SAF-004",
      indicatorName: "Polypharmacy ≥10 Medications",
      rate: applyQuarterRate(
        indRate(12.1, polypharmacy_q, "lower_is_better"),
        true,
      ),
      nationalBenchmark: 14.8,
      quintileRank: adjustQuintileForQuarter(polypharmacy_q, quarter),
      trend: quarterTrend(
        indTrend(safetyTrend, polypharmacy_q),
        polypharmacy_q,
      ),
      isLowerBetter: true,
    },
    {
      id: `IND-${providerId}-5`,
      providerId,
      quarter,
      dimension: "Safety",
      indicatorCode: "SAF-005",
      indicatorName: "Pressure Injuries Stage 2–4",
      rate: applyQuarterRate(indRate(1.8, pressure_q, "lower_is_better"), true),
      nationalBenchmark: 2.4,
      quintileRank: adjustQuintileForQuarter(pressure_q, quarter),
      trend: quarterTrend(indTrend(safetyTrend, pressure_q), pressure_q),
      isLowerBetter: true,
    },
    {
      id: `IND-${providerId}-6`,
      providerId,
      quarter,
      dimension: "Safety",
      indicatorCode: "SAF-006",
      indicatorName: "ED Presentations (30-day)",
      rate: applyQuarterRate(indRate(8.4, ed_q, "lower_is_better"), true),
      nationalBenchmark: 10.2,
      quintileRank: adjustQuintileForQuarter(ed_q, quarter),
      trend: quarterTrend(indTrend(safetyTrend, ed_q), ed_q),
      isLowerBetter: true,
    },
    {
      id: `IND-${providerId}-7`,
      providerId,
      quarter,
      dimension: "Preventive",
      indicatorCode: "PRV-001",
      indicatorName: "Falls Risk Screening Completion",
      rate: applyQuarterRate(
        indRate(94.2, fallsScreen_q, "higher_is_better"),
        false,
      ),
      nationalBenchmark: 88.4,
      quintileRank: fallsScreen_q,
      trend: indTrend(preventiveTrend, fallsScreen_q),
      isLowerBetter: false,
    },
    {
      id: `IND-${providerId}-8`,
      providerId,
      quarter,
      dimension: "Preventive",
      indicatorCode: "PRV-002",
      indicatorName: "Depression Screening (GDS/PHQ-9)",
      rate: applyQuarterRate(
        indRate(88.4, deprScreen_q, "higher_is_better"),
        false,
      ),
      nationalBenchmark: 82.1,
      quintileRank: deprScreen_q,
      trend: indTrend(preventiveTrend, deprScreen_q),
      isLowerBetter: false,
    },
    {
      id: `IND-${providerId}-9`,
      providerId,
      quarter,
      dimension: "Preventive",
      indicatorCode: "PRV-003",
      indicatorName: "Malnutrition Screening",
      rate: applyQuarterRate(
        indRate(91.2, malnutrition_q, "higher_is_better"),
        false,
      ),
      nationalBenchmark: 85.8,
      quintileRank: adjustQuintileForQuarter(malnutrition_q, quarter),
      trend: quarterTrend(
        indTrend(preventiveTrend, malnutrition_q),
        malnutrition_q,
      ),
      isLowerBetter: false,
    },
    {
      id: `IND-${providerId}-10`,
      providerId,
      quarter,
      dimension: "Quality",
      indicatorCode: "QM-001",
      indicatorName: "Satisfaction Survey Score",
      rate: applyQuarterRate(
        indRate(84.8, satisfaction_q, "higher_is_better"),
        false,
      ),
      nationalBenchmark: 80.2,
      quintileRank: adjustQuintileForQuarter(satisfaction_q, quarter),
      trend: quarterTrend(
        indTrend(qualityTrend, satisfaction_q),
        satisfaction_q,
      ),
      isLowerBetter: false,
    },
    {
      id: `IND-${providerId}-11`,
      providerId,
      quarter,
      dimension: "Quality",
      indicatorCode: "QM-002",
      indicatorName: "Clinical Outcome Score",
      rate: applyQuarterRate(
        indRate(76.4, clinical_q, "higher_is_better"),
        false,
      ),
      nationalBenchmark: 74.2,
      quintileRank: adjustQuintileForQuarter(clinical_q, quarter),
      trend: quarterTrend(indTrend(qualityTrend, clinical_q), clinical_q),
      isLowerBetter: false,
    },
    {
      id: `IND-${providerId}-12`,
      providerId,
      quarter,
      dimension: "Staffing",
      indicatorCode: "STAFF-001",
      indicatorName: "Registered Nurse Hours per Resident",
      rate: applyQuarterRate(
        indRate(4.8, rnHours_q, "higher_is_better"),
        false,
      ),
      nationalBenchmark: 4.1,
      quintileRank: rnHours_q,
      trend: indTrend(staffingTrend, rnHours_q),
      isLowerBetter: false,
    },
    {
      id: `IND-${providerId}-13`,
      providerId,
      quarter,
      dimension: "Staffing",
      indicatorCode: "STAFF-002",
      indicatorName: "Staff Retention Rate",
      rate: applyQuarterRate(
        indRate(88.2, retention_q, "higher_is_better"),
        false,
      ),
      nationalBenchmark: 82.4,
      quintileRank: adjustQuintileForQuarter(retention_q, quarter),
      trend: quarterTrend(indTrend(staffingTrend, retention_q), retention_q),
      isLowerBetter: false,
    },
    {
      id: `IND-${providerId}-14`,
      providerId,
      quarter,
      dimension: "Compliance",
      indicatorCode: "COMP-001",
      indicatorName: "Accreditation Compliance Score",
      rate: applyQuarterRate(
        indRate(92.4, accred_q, "higher_is_better"),
        false,
      ),
      nationalBenchmark: 88.0,
      quintileRank: adjustQuintileForQuarter(accred_q, quarter),
      trend: quarterTrend(indTrend(complianceTrend, accred_q), accred_q),
      isLowerBetter: false,
    },
    {
      id: `IND-${providerId}-15`,
      providerId,
      quarter,
      dimension: "Compliance",
      indicatorCode: "COMP-002",
      indicatorName: "Mandatory Reporting Completeness",
      rate: applyQuarterRate(
        indRate(96.8, reporting_q, "higher_is_better"),
        false,
      ),
      nationalBenchmark: 92.0,
      quintileRank: adjustQuintileForQuarter(reporting_q, quarter),
      trend: quarterTrend(indTrend(complianceTrend, reporting_q), reporting_q),
      isLowerBetter: false,
    },
    {
      id: `IND-${providerId}-16`,
      providerId,
      quarter,
      dimension: "Experience",
      indicatorCode: "EXP-001",
      indicatorName: "Resident Satisfaction Score",
      rate: applyQuarterRate(
        indRate(84.8, expSatisfaction_q, "higher_is_better"),
        false,
      ),
      nationalBenchmark: 80.2,
      quintileRank: expSatisfaction_q,
      trend: indTrend(experienceTrend, expSatisfaction_q),
      isLowerBetter: false,
    },
    {
      id: `IND-${providerId}-17`,
      providerId,
      quarter,
      dimension: "Experience",
      indicatorCode: "EXP-002",
      indicatorName: "Complaint Rate",
      rate: applyQuarterRate(
        indRate(3.2, complaintRate_q, "lower_is_better"),
        true,
      ),
      nationalBenchmark: 4.8,
      quintileRank: complaintRate_q,
      trend: indTrend(experienceTrend, complaintRate_q),
      isLowerBetter: true,
    },
  ];
}

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

/**
 * SINGLE SOURCE OF TRUTH for provider rating and eligibility.
 * All modules must call this instead of computing locally.
 */
export function getProviderRatingForQuarter(
  providerId: string,
  quarter = "Q4-2025",
): {
  domainScores: {
    safety: number;
    preventive: number;
    quality: number;
    staffing: number;
    compliance: number;
    experience: number;
  };
  overallScore: number;
  stars: number;
  eligibility: { tier: string; eligible: boolean; estimatedPayment: number };
} {
  const domainScores = getUnifiedProviderDomainScores(providerId, quarter);
  const overallScore = calcNewWeightedOverallScore(domainScores);
  const stars = overallScoreToStars(overallScore);
  const eligibility = calcPayForImprovementEligibility(stars, 0, 0);
  return { domainScores, overallScore, stars, eligibility };
}

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

// Canonical provider master — all modules must import from this
export const PROVIDER_MASTER = UNIFIED_PROVIDERS;
