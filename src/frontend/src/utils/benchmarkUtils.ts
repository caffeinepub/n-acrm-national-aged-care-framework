// Benchmark Utility Functions — N-ACRM
// All benchmark comparisons, improvement calculations, and incentive eligibility

/**
 * Determines whether a provider value is above, near, or below benchmark.
 * "above" means provider is performing better than benchmark.
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
 * Improvement % from baseline.
 * For lower-is-better: positive means current is lower (better) than baseline.
 * Formula: ((Baseline - Current) / Baseline) * 100
 */
export function calcBaselineImprovement(
  baseline: number,
  current: number,
  isLowerBetter: boolean,
): number {
  if (baseline === 0) return 0;
  if (isLowerBetter) {
    return ((baseline - current) / baseline) * 100;
  }
  return ((current - baseline) / baseline) * 100;
}

/**
 * Provider is eligible for incentive if overall score >= 3.5
 * AND no core indicators are below benchmark.
 */
export function isEligibleForIncentive(
  overallWeightedScore: number,
  hasBelowBenchmarkIndicators: boolean,
): boolean {
  return overallWeightedScore >= 3.5 && !hasBelowBenchmarkIndicators;
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

export function getBenchmarkStatusLabel(
  status: "above" | "near" | "below",
): string {
  if (status === "above") return "Above Benchmark";
  if (status === "near") return "Near Benchmark";
  return "Below Benchmark";
}
