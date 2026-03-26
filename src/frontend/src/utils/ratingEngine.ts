// Rating Engine — N-ACRM
// Standardized 0–100 scoring model

import { calcIncentiveEligibilityTier } from "./benchmarkUtils";

/**
 * Maps 1–5 star values to representative 0–100 percent scores.
 */
export function starsToPercentScore(stars: number): number {
  if (stars >= 4.5) return 92;
  if (stars >= 3.5) return 85;
  if (stars >= 2.5) return 75;
  if (stars >= 1.5) return 65;
  return 50;
}

/**
 * Calculates a 0–100 indicator performance score.
 * lower_is_better: score = (benchmark / providerValue) × 100, capped at 100
 * higher_is_better: score = (providerValue / benchmark) × 100, capped at 100
 */
export function calcIndicatorPerformanceScore(
  providerValue: number,
  benchmark: number,
  isLowerBetter: boolean,
): number {
  if (benchmark === 0 || providerValue === 0) return 50;
  const raw = isLowerBetter
    ? (benchmark / providerValue) * 100
    : (providerValue / benchmark) * 100;
  return Math.min(100, raw);
}

/**
 * Converts 0–100 score to a continuous 0–5 star rating.
 * StarRating = (score / 100) × 5
 */
export function scoreToFractionalStars(score: number): number {
  return Math.min(5, Math.max(0, (score / 100) * 5));
}

/**
 * Converts a 0–100 overall score to a 1–5 star rating band:
 * 90–100 → 5 stars
 * 80–89  → 4 stars
 * 70–79  → 3 stars
 * 60–69  → 2 stars
 * < 60   → 1 star
 */
export function overallScoreToStars(score: number): number {
  if (score >= 90) return 5;
  if (score >= 80) return 4;
  if (score >= 70) return 3;
  if (score >= 60) return 2;
  return 1;
}

/**
 * Calculates weighted overall provider score (0–100) from domain scores (0–100):
 * Safety 30%, Preventive 20%, Quality 20%, Staffing 15%, Compliance 10%, Experience 5%
 */
export function calcNewWeightedOverallScore(domains: {
  safety: number;
  preventive: number;
  quality: number;
  staffing: number;
  compliance: number;
  experience: number;
}): number {
  return (
    domains.safety * 0.3 +
    domains.preventive * 0.2 +
    domains.quality * 0.2 +
    domains.staffing * 0.15 +
    domains.compliance * 0.1 +
    domains.experience * 0.05
  );
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
 * Wrapper — expects domain scores in 0–100 range, returns { score, stars }.
 */
export function calcWeightedProviderRating(
  domains: DomainScores,
): ProviderRating {
  const score = calcNewWeightedOverallScore(domains);
  return { score, stars: overallScoreToStars(score) };
}

/**
 * Indicator star rating.
 * Uses new 0–100 model when rate + benchmark are provided.
 * Falls back to quintile-based when not.
 */
export function calcIndicatorStarRating(
  quintile: number,
  trend: string,
  rate?: number,
  benchmark?: number,
  isLowerBetter?: boolean,
): number {
  if (
    rate !== undefined &&
    benchmark !== undefined &&
    isLowerBetter !== undefined &&
    benchmark !== 0 &&
    rate !== 0
  ) {
    const score = calcIndicatorPerformanceScore(rate, benchmark, isLowerBetter);
    return scoreToFractionalStars(score);
  }
  // Fallback: quintile-based
  const baseRatings: Record<number, number> = { 1: 5, 2: 4, 3: 3, 4: 2, 5: 1 };
  const base = baseRatings[quintile] ?? 3;
  const trendAdj =
    trend === "improving" ? 0.2 : trend === "declining" ? -0.2 : 0;
  return Math.min(5, Math.max(1, base + trendAdj));
}

/**
 * Calculates domain score (0–100) from array of indicator performance scores (0–100).
 */
export function calcDomainScore(indicatorScores: number[]): number {
  if (indicatorScores.length === 0) return 75;
  return (
    indicatorScores.reduce((sum, s) => sum + s, 0) / indicatorScores.length
  );
}

/**
 * Legacy score-to-star-band (0–5 legacy scale).
 * @deprecated Use overallScoreToStars for new model.
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
 * Pay-for-Improvement eligibility.
 *
 * Rules (synchronized with benchmarkUtils.calcIncentiveEligibilityTier):
 *   Stars ≥ 4.5 → Highly Eligible ($180,000) — automatically, no improvement requirement
 *   Stars ≥ 4.0 AND improvement ≥ 10% AND screening ≥ 85% → Maximum Eligible ($180,000)
 *   Stars ≥ 4.0 AND improvement ≥ 10% → Bonus Eligible ($120,000)
 *   Stars ≥ 4.0 → Base Eligible ($75,000)
 *   Stars ≥ 3.5 AND improvement ≥ 15% → Eligible ($50,000)
 *   Otherwise → Not Eligible ($0)
 *
 * HIGH-PERFORMING PROVIDERS (≥ 4.0 stars) ARE NEVER "Not Eligible".
 */
export function calcPayForImprovementEligibility(
  overallStars: number,
  safetyImprovement: number,
  screeningCompletion = 0,
  belowBenchmarkCount = 0,
  totalIndicatorCount = 0,
): EligibilityResult {
  // ≥ 4.5 stars → Highly Eligible (automatic, no improvement threshold needed)
  if (overallStars >= 4.5) {
    return {
      tier: "Highly Eligible",
      eligible: true,
      estimatedPayment: 180000,
    };
  }
  // ≥ 4.0 stars → Eligible at some tier (never Not Eligible)
  if (overallStars >= 4.0) {
    if (safetyImprovement >= 10 && screeningCompletion >= 85) {
      return {
        tier: "Maximum Eligible",
        eligible: true,
        estimatedPayment: 180000,
      };
    }
    if (safetyImprovement >= 10) {
      return {
        tier: "Bonus Eligible",
        eligible: true,
        estimatedPayment: 120000,
      };
    }
    // Base eligibility for any ≥ 4.0 star provider
    return { tier: "Base Eligible", eligible: true, estimatedPayment: 75000 };
  }
  // 3.5–3.99 stars with notable improvement
  if (overallStars >= 3.5 && safetyImprovement >= 15) {
    return { tier: "Eligible", eligible: true, estimatedPayment: 50000 };
  }
  // Below 3.5 or insufficient improvement — use tier helper for consistency
  const { tier, eligible } = calcIncentiveEligibilityTier(
    overallStars,
    belowBenchmarkCount,
    totalIndicatorCount,
  );
  return { tier, eligible, estimatedPayment: 0 };
}
