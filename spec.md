# N-ACRM National Aged Care Framework

## Current State
The app has a centralized rating engine, unified provider registry, role-based views, regional provider lookup, provider performance dashboard, pay-for-improvement tracker, and a rating engine page. Core issues:
1. `getUnifiedProviderIndicators` always returns `quarter: "Q4-2025"` and identical data regardless of which quarter is selected — all modules show the same values across Q1/Q2/Q3/Q4.
2. Alert logic in `resolveAlertToShow` / `getLowPerformanceAlerts` incorrectly triggers red warnings for providers performing BETTER than benchmark (does not properly respect `isLowerBetter` direction).
3. Star rating display is sometimes inconsistent across modules; domain scores and overall ratings need to flow from a single calculation path.
4. Pay-for-Improvement improvement percentages don't update when quarter changes.

## Requested Changes (Diff)

### Add
- Quarter-specific data multipliers in `getUnifiedProviderIndicators(providerId, quarter)` — Q1 shows highest rates (worse), Q4 shows lowest rates (best), so indicators visibly change per quarter
- Quarter-keyed domain score helper `getUnifiedProviderDomainScoresByQuarter(providerId, quarter)` — returns slightly different domain scores per quarter derived from the quarterly indicator data
- `QUARTER_MULTIPLIERS` map: Q1→1.15, Q2→1.07, Q3→1.0, Q4→0.93 for lower-is-better indicators (inverted for higher-is-better)
- Proper `isLowerBetter`-aware alert classification in `getLowPerformanceAlerts`

### Modify
- `getUnifiedProviderIndicators(providerId)` → `getUnifiedProviderIndicators(providerId, quarter?: string)` — apply quarter multipliers to `rate` and recalculate `quintileRank` and `trend` based on quarter progression
- `getUnifiedProviderDomainScores(providerId)` → add optional `quarter` param, delegate to quarterly variant
- `ProviderPerformance.tsx` — pass `currentQuarter` to `getUnifiedProviderIndicators` and `getUnifiedProviderDomainScoresByQuarter`; recompute `domainStars` and `overallStars` when quarter changes
- `RatingEngine.tsx` — pass `currentQuarter` to data helpers; pre-populate form with quarter-specific values
- `PayForImprovement.tsx` — derive improvement % from quarter-specific baseline vs current values
- `RegionalProviderDrillDown.tsx` — accept and use `currentQuarter` prop for indicator display
- `PublicView.tsx` — accept and use `currentQuarter` prop
- `performanceAlerts.ts` `getLowPerformanceAlerts` — fix benchmark comparison: for `isLowerBetter=true`, provider is performing WELL if `rate < benchmark`; only flag as poor if `rate > benchmark * 1.05`
- `StarRating.tsx` — ensure consistent ⭐ emoji-based stars from 1–5, no malformed icons

### Remove
- Hardcoded `quarter: "Q4-2025"` string inside `getUnifiedProviderIndicators` indicators array (replace with dynamic quarter param)

## Implementation Plan
1. Update `mockData.ts`: add `QUARTER_MULTIPLIERS`, update `getUnifiedProviderIndicators(providerId, quarter?)` and `getUnifiedProviderDomainScores(providerId, quarter?)` to apply quarter-based rate scaling
2. Fix `performanceAlerts.ts` `getLowPerformanceAlerts` to correctly check `isLowerBetter` direction before flagging red
3. Update `ProviderPerformance.tsx` to pass `currentQuarter` through to data helpers and recompute scores reactively
4. Update `RatingEngine.tsx` to use quarter-specific data
5. Update `PayForImprovement.tsx` to use quarter-specific improvement baselines
6. Update `RegionalProviderDrillDown.tsx` and `PublicView.tsx` with quarter prop
7. Ensure `StarRating.tsx` renders consistent ⭐ star format
8. Validate and fix build errors
