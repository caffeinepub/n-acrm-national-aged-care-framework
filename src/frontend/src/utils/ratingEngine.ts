// Rating Engine — Pure calculation functions for N-ACRM indicator and provider ratings

/**
 * Calculates a star rating (1-5) from a quintile position, trend, and optional benchmark comparison.
 * Q1→5, Q2→4, Q3→3, Q4→2, Q5→1
 * Improving trend: +0.2 boost
 * Declining trend: -0.2 penalty
 * Below benchmark: -0.5 penalty
 * Above benchmark by >10%: +0.2 boost
 * Result is clamped to [1, 5].
 */
export function calcIndicatorStarRating(
  quintile: number,
  trend: string,
  rate?: number,
  benchmark?: number,
  isLowerBetter?: boolean,
): number {
  const baseRatings: Record<number, number> = {
    1: 5,
    2: 4,
    3: 3,
    4: 2,
    5: 1,
  };
  const base = baseRatings[quintile] ?? 3;
  const trendAdjustment =
    trend === "improving" ? 0.2 : trend === "declining" ? -0.2 : 0;
  let rating = base + trendAdjustment;

  // Apply benchmark adjustment if data is provided — inlined to avoid circular deps
  if (
    rate !== undefined &&
    benchmark !== undefined &&
    isLowerBetter !== undefined &&
    benchmark !== 0
  ) {
    const benchmarkStatus: "above" | "near" | "below" = (() => {
      if (isLowerBetter) {
        if (rate < benchmark * 0.95) return "above";
        if (rate <= benchmark * 1.05) return "near";
        return "below";
      }
      if (rate > benchmark * 1.05) return "above";
      if (rate >= benchmark * 0.95) return "near";
      return "below";
    })();

    if (benchmarkStatus === "below") {
      rating -= 0.5;
    } else if (benchmarkStatus === "above") {
      const pct = isLowerBetter
        ? (benchmark - rate) / benchmark
        : (rate - benchmark) / benchmark;
      if (pct > 0.1) rating += 0.2;
    }
  }

  return Math.min(5, Math.max(1, rating));
}

/**
 * Calculates the average domain score from an array of indicator star ratings.
 */
export function calcDomainScore(starRatings: number[]): number {
  if (starRatings.length === 0) return 3;
  return starRatings.reduce((sum, r) => sum + r, 0) / starRatings.length;
}

export interface DomainScores {
  safety: number;
  preventive: number;
  quality: number;
  staffing: number;
  compliance: number;
  experience: number;
}

export interface ProviderRating {
  score: number;
  stars: number;
}

/**
 * Calculates overall provider rating using a weighted domain model:
 * Safety 30%, Preventive 20%, Quality 20%, Staffing 15%, Compliance 10%, Experience 5%
 * Returns { score: number, stars: number } where stars is rounded and clamped to [1,5].
 */
export function calcWeightedProviderRating(
  domains: DomainScores,
): ProviderRating {
  const score =
    domains.safety * 0.3 +
    domains.preventive * 0.2 +
    domains.quality * 0.2 +
    domains.staffing * 0.15 +
    domains.compliance * 0.1 +
    domains.experience * 0.05;

  const stars = Math.min(5, Math.max(1, Math.round(score)));
  return { score, stars };
}

/**
 * Converts an overall score (e.g. 4.2) to a star band (1-5):
 * 4.5–5.0 → 5 stars
 * 3.5–4.49 → 4 stars
 * 2.5–3.49 → 3 stars
 * 1.5–2.49 → 2 stars
 * 0–1.49 → 1 star
 */
export function scoreToStarBand(score: number): number {
  if (score >= 4.5) return 5;
  if (score >= 3.5) return 4;
  if (score >= 2.5) return 3;
  if (score >= 1.5) return 2;
  return 1;
}

export interface EligibilityResult {
  tier: string;
  eligible: boolean;
  estimatedPayment: number;
}

/**
 * Calculates Pay-for-Improvement eligibility:
 * - overallStars >= 4 AND safetyImprovement >= 15% → "Bonus Eligible" ($120,000)
 * - overallStars >= 4 → "Base Eligible" ($75,000)
 * - otherwise → "Not Eligible" ($0)
 */
export function calcPayForImprovementEligibility(
  overallStars: number,
  safetyImprovement: number,
): EligibilityResult {
  if (overallStars >= 4 && safetyImprovement >= 15) {
    return {
      tier: "Bonus Eligible",
      eligible: true,
      estimatedPayment: 120000,
    };
  }
  if (overallStars >= 4) {
    return {
      tier: "Base Eligible",
      eligible: true,
      estimatedPayment: 75000,
    };
  }
  return {
    tier: "Not Eligible",
    eligible: false,
    estimatedPayment: 0,
  };
}
