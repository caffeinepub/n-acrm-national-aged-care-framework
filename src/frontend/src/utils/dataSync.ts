/**
 * N-ACRM Data Synchronization Utilities
 * Single authoritative source for all provider ratings, eligibility, and funding.
 *
 * ALL modules must import provider data and rating functions from this file
 * (or directly from @/data/mockData) — never calculate independently.
 */

import { PROVIDER_MASTER, getProviderRatingForQuarter } from "@/data/mockData";

export { PROVIDER_MASTER, getProviderRatingForQuarter };

/** Alias — semantically explicit for modules that want to signal they use the canonical source */
export const VALIDATED_PROVIDERS = PROVIDER_MASTER;

/**
 * Single authoritative rating lookup used across ALL modules.
 * Do not call `calcWeightedProviderRating` directly in module components;
 * call this instead so there is one traceable entry point.
 */
export function getAuthorativeProviderRating(
  providerId: string,
  quarter: string,
) {
  return getProviderRatingForQuarter(providerId, quarter);
}

/**
 * Validate & auto-correct eligibility / funding consistency.
 * Rule: stars < 3.5 → not eligible, funding must be $0.
 * Rule: stars ≥ 4.5 → Highly Eligible, funding ≥ $180k.
 */
export function validateEligibility(
  stars: number,
  estimatedFunding: number,
): { eligible: boolean; correctedFunding: number; tier: string } {
  if (stars >= 4.5) {
    return {
      eligible: true,
      correctedFunding: Math.max(estimatedFunding, 180000),
      tier: "Highly Eligible",
    };
  }
  if (stars >= 4.0) {
    return {
      eligible: true,
      correctedFunding: estimatedFunding > 0 ? estimatedFunding : 75000,
      tier: "Eligible",
    };
  }
  if (stars < 3.5) {
    return { eligible: false, correctedFunding: 0, tier: "Not Eligible" };
  }
  // 3.5–3.99
  return {
    eligible: true,
    correctedFunding: estimatedFunding,
    tier: "Eligible",
  };
}

/**
 * Validate that a module's displayed rating matches the authoritative source.
 * Returns true if consistent; logs a warning if not.
 */
export function assertRatingConsistency(
  moduleDisplayedStars: number,
  providerId: string,
  quarter: string,
): boolean {
  const authoritative = getProviderRatingForQuarter(providerId, quarter);
  if (Math.round(moduleDisplayedStars) !== authoritative.stars) {
    console.warn(
      `[N-ACRM DataSync] Rating mismatch for ${providerId} in ${quarter}: module shows ${moduleDisplayedStars} stars, authoritative source says ${authoritative.stars} stars. Using authoritative value.`,
    );
    return false;
  }
  return true;
}

/**
 * Quarter-aware eligibility check that is guaranteed consistent with the
 * central rating engine.
 */
export function getQuarterEligibility(providerId: string, quarter: string) {
  return getProviderRatingForQuarter(providerId, quarter).eligibility;
}
