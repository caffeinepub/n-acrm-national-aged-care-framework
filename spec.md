# N-ACRM National Aged Care Framework

## Current State

The app has a centralized rating engine (`ratingEngine.ts`, `benchmarkUtils.ts`) and a unified provider registry (`UNIFIED_PROVIDERS` in `mockData.ts`). However, data is NOT fully synchronized across all modules:

- `PublicView.tsx`: Uses `CITY_PROVIDERS` directly via a local `getDomains()` helper that does NOT accept a quarter parameter — always uses base Q4 indicator values regardless of selected quarter.
- `PayForImprovement.tsx`: Reads `UNIFIED_PROVIDERS[x].overallStars` which is a static property computed once at load time (no quarter awareness).
- `ProviderPerformance.tsx`: Calls `getUnifiedProviderIndicators(id, quarter)` — IS quarter-aware.
- `RatingEngine.tsx`: Calculates its own rating from user-submitted indicator values — correct by design, but should display the same result as other modules for the same provider/quarter.
- `UNIFIED_PROVIDERS` stores a single static `overallStars` computed from Q4 base values.

Result: switching quarters produces different stars in ProviderPerformance but NOT in PublicView or PayForImprovement. Eligibility can also differ.

## Requested Changes (Diff)

### Add
- `getProviderRatingForQuarter(providerId: string, quarter: string)` exported function in `mockData.ts` — the **single source of truth** for all rating and eligibility data. It calls `getUnifiedProviderDomainScores(providerId, quarter)` → `calcNewWeightedOverallScore` → `overallScoreToStars` → `calcPayForImprovementEligibility`, returns `{ domainScores, overallScore, stars, eligibility }`. All modules must call this instead of computing locally.

### Modify
- `PublicView.tsx`: Replace local `getDomains(p)` and `getStars(p)` with calls to `getProviderRatingForQuarter(p.id, currentQuarter)`. Thread the `currentQuarter` prop (already available in app state) into PublicView so it reacts to quarter changes.
- `PayForImprovement.tsx`: Replace `UNIFIED_PROVIDERS[x].overallStars` and the local `getProviderOverallStars()` with `getProviderRatingForQuarter(id, currentQuarter).stars`. Use quarter from app state.
- `NationalOverview.tsx` and any other module that computes ratings independently: Ensure they all call `getProviderRatingForQuarter` or derive from `UNIFIED_PROVIDERS` computed via the same function.
- All incentive eligibility badges: Must use `calcPayForImprovementEligibility` from the central result, not local recalculations.

### Remove
- Local `getDomains()` helper in `PublicView.tsx` (replace with central call).
- Local `getProviderOverallStars()` in `PayForImprovement.tsx` (replace with central call).
- Any local star/score recalculations in individual page components that duplicate the central engine logic.

## Implementation Plan

1. Add `getProviderRatingForQuarter(providerId, quarter)` to `mockData.ts` — returns `{ domainScores, overallScore, stars, eligibility }` using existing utilities.
2. Update `PublicView.tsx`: accept `currentQuarter` prop, use `getProviderRatingForQuarter` for all provider ratings, popup data, and KPI counts.
3. Update `PayForImprovement.tsx`: accept `currentQuarter` prop, use `getProviderRatingForQuarter` for all provider star/eligibility lookups.
4. Check `App.tsx`/`Layout.tsx` to ensure `currentQuarter` is passed to PublicView and PayForImprovement.
5. Validate: same provider shown in PublicView, ProviderPerformance, and PayForImprovement must show same star rating for same quarter.
