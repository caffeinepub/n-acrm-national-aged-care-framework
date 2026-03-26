// Policy Insight Engine — N-ACRM
// Analyses aggregated sector data and generates readable policy insights

export interface PolicyInsight {
  id: string;
  category: "trend" | "regional" | "benchmark" | "risk" | "screening";
  severity: "info" | "warning" | "critical";
  title: string;
  description: string;
  evidence: string;
  recommendation: string;
  updatedAt: string;
}

// Mirror of PolicyAnalytics inline data (kept in sync)
const REGIONAL_DATA = [
  {
    state: "NSW",
    providers: 624,
    avgRating: 3.9,
    highRiskPct: 9.3,
    screeningPct: 86,
    fallsRate: 7.2,
  },
  {
    state: "VIC",
    providers: 581,
    avgRating: 4.1,
    highRiskPct: 7.6,
    screeningPct: 88,
    fallsRate: 6.8,
  },
  {
    state: "QLD",
    providers: 428,
    avgRating: 3.6,
    highRiskPct: 14.5,
    screeningPct: 81,
    fallsRate: 8.9,
  },
  {
    state: "SA",
    providers: 214,
    avgRating: 3.7,
    highRiskPct: 14.5,
    screeningPct: 79,
    fallsRate: 9.1,
  },
  {
    state: "WA",
    providers: 298,
    avgRating: 3.8,
    highRiskPct: 12.8,
    screeningPct: 83,
    fallsRate: 8.4,
  },
  {
    state: "TAS",
    providers: 98,
    avgRating: 4.2,
    highRiskPct: 7.1,
    screeningPct: 90,
    fallsRate: 6.4,
  },
  {
    state: "NT",
    providers: 64,
    avgRating: 3.2,
    highRiskPct: 43.8,
    screeningPct: 68,
    fallsRate: 13.2,
  },
  {
    state: "ACT",
    providers: 89,
    avgRating: 4.0,
    highRiskPct: 18.0,
    screeningPct: 85,
    fallsRate: 7.8,
  },
];

const QUARTERLY_DATA = [
  {
    quarter: "Q1 2025",
    falls: 8.4,
    medication: 3.8,
    screening: 76,
    hospitalizations: 12.1,
  },
  {
    quarter: "Q2 2025",
    falls: 8.1,
    medication: 3.6,
    screening: 79,
    hospitalizations: 11.8,
  },
  {
    quarter: "Q3 2025",
    falls: 7.8,
    medication: 3.3,
    screening: 81,
    hospitalizations: 11.4,
  },
  {
    quarter: "Q4 2025",
    falls: 7.5,
    medication: 3.1,
    screening: 84,
    hospitalizations: 11.0,
  },
];

const SECTOR_HIGH_RISK_PCT = 10.4;
const SECTOR_HIGH_RISK_THRESHOLD = 8.0;

function getQuarterIndex(quarter: string): number {
  const map: Record<string, number> = {
    "Q1 2025": 0,
    "Q2 2025": 1,
    "Q3 2025": 2,
    "Q4 2025": 3,
  };
  return map[quarter] ?? 3;
}

export function generatePolicyInsights(quarter: string): PolicyInsight[] {
  const qIdx = getQuarterIndex(quarter);
  const isEarlyQuarter = qIdx <= 1;
  const insights: PolicyInsight[] = [];
  const ts = new Date().toISOString();

  const q1 = QUARTERLY_DATA[0];
  const q4 = QUARTERLY_DATA[3];
  const current = QUARTERLY_DATA[qIdx];

  // ── Screening + Hospitalization Correlation ────────────────────────────────
  const lowScreeningStates = REGIONAL_DATA.filter((r) => r.screeningPct < 80);
  for (const region of lowScreeningStates) {
    insights.push({
      id: `screening-hosp-${region.state}`,
      category: "screening",
      severity: region.screeningPct < 72 ? "critical" : "warning",
      title: `${region.state}: Low Screening Completion Linked to Elevated Hospitalisations`,
      description: `Regions with screening completion below 80% show higher hospitalisation rates. ${region.state} at ${region.screeningPct}% screening has a falls rate of ${region.fallsRate} — well above the national average of 7.8.`,
      evidence: `${region.state}: ${region.screeningPct}% screening, ${region.fallsRate} falls rate/1,000 resident days`,
      recommendation: `Prioritise outreach screening programs in ${region.state}. Target all high-risk cohorts for mandatory screening bundle completion by end of quarter.`,
      updatedAt: ts,
    });
  }

  // ── Regional High-Risk Outliers ────────────────────────────────────────────
  const highRiskStates = REGIONAL_DATA.filter((r) => r.highRiskPct > 15);
  for (const region of highRiskStates) {
    insights.push({
      id: `regional-risk-${region.state}`,
      category: "regional",
      severity: region.highRiskPct > 35 ? "critical" : "warning",
      title: `${region.state}: Disproportionate High-Risk Provider Concentration`,
      description: `${region.state} has ${region.highRiskPct}% of its providers classified as high-risk, compared to the national average of ${SECTOR_HIGH_RISK_PCT}%. This concentration suggests systemic challenges in this region.`,
      evidence: `${region.state}: ${region.highRiskPct}% high-risk (${region.providers} total providers)`,
      recommendation: `Deploy targeted regulatory support to ${region.state} providers. Consider enhanced monitoring protocols and funding prioritisation.`,
      updatedAt: ts,
    });
  }

  // ── National Trend: Screening Improvement ─────────────────────────────────
  const screeningGain = current.screening - q1.screening;
  insights.push({
    id: "trend-screening-improvement",
    category: "trend",
    severity: "info",
    title: isEarlyQuarter
      ? "National Screening: Improvement Trajectory Established"
      : "National Screening: Sustained Sector-Wide Improvement",
    description: `Sector-wide screening completion has improved from ${q1.screening}% in Q1 2025 to ${current.screening}% in ${quarter}, a gain of ${screeningGain} percentage points. This positive trend indicates successful program uptake.`,
    evidence: `Q1 2025: ${q1.screening}% → ${quarter}: ${current.screening}% (target: 85%)`,
    recommendation: `Continue investment in screening support programs. Replicate best practices from TAS (${REGIONAL_DATA[5].screeningPct}%) and VIC (${REGIONAL_DATA[1].screeningPct}%).`,
    updatedAt: ts,
  });

  // ── National Trend: Hospitalisations ──────────────────────────────────────
  insights.push({
    id: "trend-hospitalisations",
    category: "trend",
    severity: isEarlyQuarter ? "warning" : "info",
    title: isEarlyQuarter
      ? "Hospitalisation Rates Require Continued Monitoring"
      : "Hospitalisation Rates Show Consistent Decline",
    description: isEarlyQuarter
      ? `National hospitalisation rates remain elevated at ${current.hospitalizations} per 1,000 resident days in ${quarter}. Early-quarter data suggests ongoing pressure on acute care services.`
      : `National hospitalisation rates have declined from ${q1.hospitalizations} in Q1 2025 to ${current.hospitalizations} in ${quarter}. Preventive care programs are demonstrating measurable impact on acute presentations.`,
    evidence: `Q1 2025: ${q1.hospitalizations}/1,000 days → ${quarter}: ${current.hospitalizations}/1,000 days`,
    recommendation: isEarlyQuarter
      ? "Reinforce early intervention protocols and preventive care workflows across all providers."
      : `Sustain current preventive care investments. Target reduction to ${(current.hospitalizations - 0.3).toFixed(1)} by next quarter.`,
    updatedAt: ts,
  });

  // ── Benchmark Gap: NT ─────────────────────────────────────────────────────
  insights.push({
    id: "benchmark-nt-critical",
    category: "benchmark",
    severity: "critical",
    title: "NT Providers: Persistent Benchmark Gap Requiring Intervention",
    description:
      "The Northern Territory has an average provider rating of 3.2, which is 0.6 points below the national average of 3.8. This gap reflects structural under-resourcing and workforce challenges in remote and very remote aged care settings.",
    evidence: "NT avg rating: 3.2 / 5.0 (national avg: 3.8, benchmark: 4.0)",
    recommendation:
      "Implement NT-specific funding uplift and workforce incentive packages. Establish a regional improvement task force with dedicated Quality Use of Medicines and staffing support.",
    updatedAt: ts,
  });

  // ── Benchmark Positive: TAS ───────────────────────────────────────────────
  if (!isEarlyQuarter) {
    insights.push({
      id: "benchmark-tas-positive",
      category: "benchmark",
      severity: "info",
      title: "Tasmania: Sector-Leading Performance Across Key Indicators",
      description:
        "Tasmania maintains an average provider rating of 4.2 — the highest nationally — with 90% screening completion and a falls rate of 6.4, well below the national average of 7.8. Tasmania's model provides a replicable blueprint for other states.",
      evidence:
        "TAS avg rating: 4.2, screening: 90%, falls rate: 6.4 (national avg: 7.8)",
      recommendation:
        "Commission a TAS practice study to extract transferable model elements for deployment in under-performing regions, particularly NT and QLD.",
      updatedAt: ts,
    });
  }

  // ── Sector Risk Distribution ───────────────────────────────────────────────
  insights.push({
    id: "risk-sector-threshold",
    category: "risk",
    severity:
      SECTOR_HIGH_RISK_PCT > SECTOR_HIGH_RISK_THRESHOLD ? "warning" : "info",
    title: `Sector High-Risk Provider Rate Exceeds ${SECTOR_HIGH_RISK_THRESHOLD}% Policy Threshold`,
    description: `${SECTOR_HIGH_RISK_PCT}% of all aged care providers are currently classified as high-risk — exceeding the policy intervention threshold of ${SECTOR_HIGH_RISK_THRESHOLD}%. This represents 284 providers nationally requiring enhanced oversight.`,
    evidence: `High-risk providers: 284 (${SECTOR_HIGH_RISK_PCT}% of 2,743 total) — threshold: ${SECTOR_HIGH_RISK_THRESHOLD}%`,
    recommendation:
      "Activate enhanced monitoring protocols for all 284 high-risk providers. Allocate improvement coaching resources proportionally to state risk concentrations.",
    updatedAt: ts,
  });

  // ── Equity: CALD ──────────────────────────────────────────────────────────
  insights.push({
    id: "equity-cald-gap",
    category: "regional",
    severity: "warning",
    title: "CALD Communities: Service Access Gap Exceeds Equity Benchmark",
    description:
      "Culturally and Linguistically Diverse (CALD) communities face an 11.4% access gap compared to the 8.0% benchmark. Language barriers, cultural misalignment, and navigator shortfalls contribute to this disparity.",
    evidence: "CALD access gap: 11.4% vs benchmark 8.0% — excess gap: 3.4pp",
    recommendation:
      "Fund culturally-adapted service delivery models and expand community liaison officer programs in high-CALD-population urban areas.",
    updatedAt: ts,
  });

  // ── Equity: LGBTIQ+ ───────────────────────────────────────────────────────
  insights.push({
    id: "equity-lgbtiq-inclusive",
    category: "regional",
    severity: "warning",
    title: "LGBTIQ+ Inclusive Services: Below 85% National Target",
    description:
      "Only 68% of aged care providers offer LGBTIQ+-inclusive services, against a national target of 85%. This leaves a significant proportion of older LGBTIQ+ Australians without culturally safe care options.",
    evidence: "LGBTIQ+ inclusive providers: 68% (target: 85%) — 17pp gap",
    recommendation:
      "Introduce LGBTIQ+ inclusive care as a quality standard compliance requirement. Provide funded training packages to under-compliant providers.",
    updatedAt: ts,
  });

  // ── Sector-Wide Screening Coverage ─────────────────────────────────────────
  if (current.screening < 82) {
    insights.push({
      id: "screening-sector-coverage",
      category: "screening",
      severity: "warning",
      title: `Sector Screening Completion at ${current.screening}% — Below 85% Target`,
      description: `In ${quarter}, national screening completion stands at ${current.screening}%, falling short of the 85% sector target. Incomplete screening coverage leaves high-risk residents undetected and delays preventive interventions.`,
      evidence: `${quarter} screening: ${current.screening}% (target: 85%, gap: ${85 - current.screening}pp)`,
      recommendation:
        "Mandate screening bundle completion reporting in quarterly submissions. Flag providers below 75% completion for immediate regulatory follow-up.",
      updatedAt: ts,
    });
  }

  // ── Falls Trend ────────────────────────────────────────────────────────────
  if (isEarlyQuarter) {
    insights.push({
      id: "trend-falls-early",
      category: "trend",
      severity: "warning",
      title: "Falls Rates Elevated in Early-Quarter Data",
      description: `Q1 2025 data shows a national falls rate of ${q1.falls} per 1,000 resident days. Early-quarter elevated rates are consistent with seasonal staffing challenges and post-holiday care disruptions.`,
      evidence: `Q1 2025 falls: ${q1.falls} vs Q4 target: ${q4.falls} (gap: ${(q1.falls - q4.falls).toFixed(1)})`,
      recommendation:
        "Review Q1 roster and incident patterns. Deploy targeted falls prevention audits in facilities with significant Q4-to-Q1 deterioration.",
      updatedAt: ts,
    });
  } else {
    const fallsReductionPct = (
      ((q1.falls - current.falls) / q1.falls) *
      100
    ).toFixed(1);
    insights.push({
      id: "trend-falls-improving",
      category: "trend",
      severity: "info",
      title: "Falls Rate Declining: Prevention Programs Demonstrating Impact",
      description: `National falls rates have reduced from ${q1.falls} in Q1 2025 to ${current.falls} in ${quarter}, a ${fallsReductionPct}% improvement. Falls prevention investment is yielding measurable outcomes across the sector.`,
      evidence: `Q1: ${q1.falls} → ${quarter}: ${current.falls} falls/1,000 days (${fallsReductionPct}% reduction)`,
      recommendation:
        "Document and disseminate successful falls prevention protocols from top-quartile providers to accelerate sector-wide improvement.",
      updatedAt: ts,
    });
  }

  // ── Screening Improvement Pace ─────────────────────────────────────────────
  const annualGain = q4.screening - q1.screening;
  if (annualGain >= 8) {
    insights.push({
      id: "trend-screening-pace",
      category: "screening",
      severity: "info",
      title: `Screening Improvement Pace: ${annualGain}pp Annual Gain Surpasses Target`,
      description: `The sector has achieved an ${annualGain} percentage-point improvement in screening completion across 2025, surpassing the annual target of 7pp. This acceleration indicates broad adoption of integrated screening workflows.`,
      evidence: `Annual screening gain: ${q1.screening}% → ${q4.screening}% (+${annualGain}pp vs 7pp target)`,
      recommendation:
        "Lock in gains by embedding screening into mandatory care planning templates. Set 2026 target at 88% national completion.",
      updatedAt: ts,
    });
  }

  return insights;
}
