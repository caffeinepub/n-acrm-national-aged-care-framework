// Performance Alert System — Cross-module alert logic for N-ACRM

export interface HighPerformanceAlert {
  type: "high";
  providerName: string;
  overallRating: number;
  topIndicators: Array<{ label: string; score: number }>;
}

export interface LowPerformanceAlert {
  type: "low" | "moderate";
  providerName: string;
  indicatorName: string;
  providerValue: number;
  benchmarkValue: number;
  unit?: string;
  suggestedImprovement: string;
  isLowerBetter: boolean;
}

export type PerformanceAlert = HighPerformanceAlert | LowPerformanceAlert;

export function getSuggestedImprovement(indicatorKey: string): string {
  const map: Record<string, string> = {
    safetyClinical:
      "Implement a falls prevention program and medication safety review with a clinical pharmacist.",
    preventiveCare:
      "Increase screening bundle completion through staff training and reminder workflows.",
    staffing:
      "Review workforce planning, improve retention incentives, and recruit qualified nursing staff.",
    compliance:
      "Address outstanding ACQSC notices with a structured compliance improvement plan.",
    residents:
      "Establish a resident and family feedback program with regular care plan reviews.",
    qualityMeasures:
      "Engage a quality improvement coordinator to drive structured improvement activities.",
    experience:
      "Reduce complaint resolution times and improve resident social engagement programs.",
    equity: "Review CALD access pathways and referral-to-placement processes.",
    // Rating Engine indicator keys
    "Falls with Harm Rate":
      "Implement structured falls prevention: risk assessment on admission and post-falls reviews.",
    "Medication-Related Harm":
      "Engage a clinical pharmacist for medication safety audit and deprescribing review.",
    "High-Risk Medication Prevalence":
      "Conduct a high-risk medication review and implement monitoring protocols.",
    "Polypharmacy ≥10 Medications":
      "Initiate a pharmacist-led deprescribing program for residents on 10+ medications.",
    "Pressure Injuries Stage 2–4":
      "Implement a pressure injury prevention protocol with regular skin integrity assessments.",
    "ED Presentations (30-day)":
      "Introduce an early intervention model to reduce avoidable emergency department presentations.",
    "Falls Risk Screening Completion":
      "Establish a mandatory falls risk screening workflow triggered on admission.",
    "Depression Screening (GDS/PHQ-9)":
      "Introduce routine depression screening using validated tools at regular intervals.",
    "Malnutrition Screening":
      "Implement a nutrition screening protocol on admission and quarterly thereafter.",
    "Oral Health Assessment":
      "Establish an oral health assessment program with regular dental referrals.",
    "Complaint Rate":
      "Implement a structured complaints management framework with timely resolution tracking.",
    "Satisfaction Survey Score":
      "Conduct regular resident and family satisfaction surveys and act on findings.",
    "Social Engagement Rate":
      "Expand activities programs and community engagement to improve social participation.",
    "Referral-to-Placement Time (days)":
      "Review referral pathways and intake processes to reduce placement delays.",
    "CALD Access Gap":
      "Develop targeted outreach programs for CALD communities.",
    "Registered Nurse Hours per Resident":
      "Review staffing models to meet minimum registered nurse hour requirements.",
    "Staff Retention Rate":
      "Implement retention strategies including professional development and workplace wellbeing programs.",
    "Accreditation Compliance Score":
      "Engage a compliance advisor to address gaps identified in the last assessment.",
    "Mandatory Reporting Completeness":
      "Implement a data completeness dashboard and assign a reporting officer.",
  };
  return (
    map[indicatorKey] ??
    "Review performance data and implement a targeted improvement plan in consultation with clinical staff."
  );
}

export interface IndicatorForAlert {
  label: string;
  score: number;
  benchmark?: number;
  providerValue?: number;
  isLowerBetter?: boolean;
  unit?: string;
}

/**
 * Returns a HighPerformanceAlert if overall rating > 4.5, otherwise null.
 */
export function getHighPerformanceAlert(
  providerName: string,
  overallRating: number,
  indicators: IndicatorForAlert[],
): HighPerformanceAlert | null {
  if (overallRating <= 4.5) return null;
  const topIndicators = [...indicators]
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((i) => ({ label: i.label, score: i.score }));
  return { type: "high", providerName, overallRating, topIndicators };
}

/**
 * Returns LowPerformanceAlerts for indicators with score <= 2 or value worse than benchmark.
 */
export function getLowPerformanceAlerts(
  providerName: string,
  indicators: IndicatorForAlert[],
): LowPerformanceAlert[] {
  const alerts: LowPerformanceAlert[] = [];
  for (const ind of indicators) {
    const isLowerBetter = ind.isLowerBetter ?? false;
    const poorByStars = ind.score <= 2;
    const poorByBenchmark =
      ind.benchmark !== undefined &&
      ind.providerValue !== undefined &&
      (isLowerBetter
        ? ind.providerValue > ind.benchmark * 1.05
        : ind.providerValue < ind.benchmark * 0.95);
    if (!poorByStars && !poorByBenchmark) continue;
    alerts.push({
      type: ind.score <= 1.5 ? "low" : "moderate",
      providerName,
      indicatorName: ind.label,
      providerValue: ind.providerValue ?? ind.score,
      benchmarkValue: ind.benchmark ?? 3.0,
      unit: ind.unit,
      suggestedImprovement: getSuggestedImprovement(ind.label),
      isLowerBetter,
    });
  }
  return alerts;
}

/**
 * Decide which alert to show: high performance first, then first low/moderate alert.
 * Returns null if no alert conditions are met.
 */
export function resolveAlertToShow(
  providerName: string,
  overallRating: number,
  indicators: IndicatorForAlert[],
): PerformanceAlert | null {
  const highAlert = getHighPerformanceAlert(
    providerName,
    overallRating,
    indicators,
  );
  if (highAlert) return highAlert;
  const lowAlerts = getLowPerformanceAlerts(providerName, indicators);
  return lowAlerts[0] ?? null;
}
