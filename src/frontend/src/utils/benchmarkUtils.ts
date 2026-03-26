// Benchmark Utility Functions — N-ACRM
// All benchmark comparisons, improvement calculations, and incentive eligibility

/**
 * Indicator direction lookup.
 * Maps indicator names and domain keys to isLowerBetter.
 * TRUE  = lower value is better (harm/adverse event indicators)
 * FALSE = higher value is better (screening, satisfaction, staffing indicators)
 */
export const INDICATOR_DIRECTION_MAP: Record<string, boolean> = {
  // Safety / harm indicators — lower is better
  "Falls with Harm Rate": true,
  "Falls with Harm": true,
  "Medication-Related Harm": true,
  "Medication Harm": true,
  "High-Risk Medication Prevalence": true,
  "Polypharmacy \u226510 Medications": true,
  "Pressure Injuries Stage 2\u20134": true,
  "Pressure Injuries": true,
  "ED Presentations (30-day)": true,
  "ED Presentations": true,
  "Complaint Rate": true,
  "Referral-to-Placement Time (days)": true,
  "CALD Access Gap": true,
  // Safety domain key
  safetyClinical: true,

  // Screening / preventive — higher is better
  "Falls Risk Screening Completion": false,
  "Depression Screening (GDS/PHQ-9)": false,
  "Depression Screening": false,
  "Malnutrition Screening": false,
  "Oral Health Assessment": false,
  "Satisfaction Survey Score": false,
  "Social Engagement Rate": false,
  "Registered Nurse Hours per Resident": false,
  "Registered Nurse Hours": false,
  "Staff Retention Rate": false,
  "Accreditation Compliance Score": false,
  "Accreditation Compliance": false,
  "Mandatory Reporting Completeness": false,
  "Resident Satisfaction": false,
  // Higher-is-better domain keys
  preventiveCare: false,
  staffing: false,
  compliance: false,
  residents: false,
  qualityMeasures: false,
  experience: false,
};

/**
 * Look up indicator direction. Defaults to false (higher_is_better) when unknown.
 */
export function getIndicatorDirection(indicatorNameOrKey: string): boolean {
  if (indicatorNameOrKey in INDICATOR_DIRECTION_MAP) {
    return INDICATOR_DIRECTION_MAP[indicatorNameOrKey];
  }
  return false;
}

/**
 * Determines whether a provider value is above, near, or below benchmark.
 * "above" always means BETTER performance (regardless of indicator direction).
 * "near" = within 5% of benchmark.
 * "below" = worse than benchmark by more than 5%.
 */
export function getBenchmarkStatus(
  rate: number,
  benchmark: number,
  isLowerBetter: boolean,
): "above" | "near" | "below" {
  if (benchmark === 0) return "near";
  if (isLowerBetter) {
    if (rate < benchmark * 0.95) return "above";
    if (rate <= benchmark * 1.05) return "near";
    return "below";
  }
  if (rate > benchmark * 1.05) return "above";
  if (rate >= benchmark * 0.95) return "near";
  return "below";
}

/**
 * Returns a rating delta to apply based on benchmark comparison.
 * Below benchmark → -0.5
 * Above benchmark by >10% → +0.2
 * Near → 0
 */
export function getBenchmarkRatingAdjustment(
  rate: number,
  benchmark: number,
  isLowerBetter: boolean,
): number {
  const status = getBenchmarkStatus(rate, benchmark, isLowerBetter);
  if (status === "below") return -0.5;
  if (status === "above") {
    const pct = isLowerBetter
      ? (benchmark - rate) / benchmark
      : (rate - benchmark) / benchmark;
    if (pct > 0.1) return 0.2;
  }
  return 0;
}

/**
 * Improvement % relative to benchmark.
 * For lower-is-better: positive means provider is BETTER (lower) than benchmark.
 * Formula: ((Benchmark - ProviderValue) / Benchmark) * 100
 */
export function calcBenchmarkImprovement(
  providerValue: number,
  benchmarkValue: number,
  isLowerBetter: boolean,
): number {
  if (benchmarkValue === 0) return 0;
  if (isLowerBetter) {
    return ((benchmarkValue - providerValue) / benchmarkValue) * 100;
  }
  return ((providerValue - benchmarkValue) / benchmarkValue) * 100;
}

/**
 * Improvement % from baseline (period-over-period).
 * Formula: ((Current − Previous) / |Previous|) × 100
 * Direction-aware: for lower-is-better, a decrease is positive improvement.
 * Capped at ±100% to prevent unrealistic values (e.g. 3025%).
 */
export function calcBaselineImprovement(
  baseline: number,
  current: number,
  isLowerBetter: boolean,
): number {
  if (baseline === 0) return 0;
  let pct: number;
  if (isLowerBetter) {
    pct = ((baseline - current) / Math.abs(baseline)) * 100;
  } else {
    pct = ((current - baseline) / Math.abs(baseline)) * 100;
  }
  // Cap to prevent unrealistic percentages (e.g. 3025%)
  return Math.max(-100, Math.min(100, pct));
}

/**
 * Incentive eligibility tiers based on overall star rating.
 *
 * Rules:
 *   ≥ 4.5 stars → "Highly Eligible" (automatically eligible, maximum tier)
 *   ≥ 4.0 stars → "Eligible" (eligible regardless of benchmark)
 *   ≥ 3.5 stars AND majority of indicators above/near benchmark → "Eligible"
 *   ≥ 3.5 stars AND most indicators below benchmark → "Not Eligible"
 *   < 3.5 stars → "Not Eligible"
 *
 * High-performing providers (≥ 4.0 stars) are NEVER marked Not Eligible.
 */
export function calcIncentiveEligibilityTier(
  overallStars: number,
  belowBenchmarkCount: number,
  totalIndicatorCount: number,
): { tier: string; eligible: boolean } {
  // ≥ 4.5 stars: always Highly Eligible regardless of benchmark
  if (overallStars >= 4.5) {
    return { tier: "Highly Eligible", eligible: true };
  }
  // ≥ 4.0 stars: always Eligible regardless of benchmark
  if (overallStars >= 4.0) {
    return { tier: "Eligible", eligible: true };
  }
  // 3.5–3.99 stars: eligible only if majority of indicators are NOT below benchmark
  if (overallStars >= 3.5) {
    const majorityBelowBenchmark =
      totalIndicatorCount > 0 && belowBenchmarkCount > totalIndicatorCount / 2;
    if (majorityBelowBenchmark) {
      return { tier: "Not Eligible", eligible: false };
    }
    return { tier: "Eligible", eligible: true };
  }
  // < 3.5 stars: not eligible
  return { tier: "Not Eligible", eligible: false };
}

/**
 * Legacy isEligibleForIncentive — kept for backward compat.
 * FIXED: high-rated providers (≥ 4.0 stars) are always eligible.
 *
 * @deprecated Use calcIncentiveEligibilityTier for full tier information.
 */
export function isEligibleForIncentive(
  overallStars: number,
  hasBelowBenchmarkIndicators: boolean,
): boolean {
  // ≥ 4.0 stars → always eligible, regardless of any below-benchmark indicators
  if (overallStars >= 4.0) return true;
  // < 4.0 stars: only eligible if no indicators below benchmark
  return overallStars >= 3.5 && !hasBelowBenchmarkIndicators;
}

export function getBenchmarkStatusColor(
  status: "above" | "near" | "below",
): string {
  if (status === "above") return "oklch(0.45 0.15 145)"; // green
  if (status === "near") return "oklch(0.55 0.14 75)"; // amber
  return "oklch(0.52 0.22 25)"; // red
}

export function getBenchmarkStatusBg(
  status: "above" | "near" | "below",
): string {
  if (status === "above") return "oklch(0.93 0.07 145)";
  if (status === "near") return "oklch(0.96 0.05 80)";
  return "oklch(0.95 0.06 25)";
}

/**
 * Human-readable benchmark status labels.
 * Direction-agnostic: "Better"/"Close"/"Worse" rather than "Above"/"Below".
 */
export function getBenchmarkStatusLabel(
  status: "above" | "near" | "below",
): string {
  if (status === "above") return "Better than benchmark";
  if (status === "near") return "Close to benchmark";
  return "Worse than benchmark";
}
