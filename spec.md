# N-ACRM National Aged Care Framework — Rating Engine

## Current State

The application is a full-stack N-ACRM prototype with:

- Motoko backend storing IndicatorResult, ProviderScorecard, HighRiskCohort, ScreeningWorkflow, AuditLog, and NationalOverviewStats as static mock data
- Frontend ratingEngine.ts utility containing pure calculation functions: calcIndicatorStarRating, calcDomainScore, calcWeightedProviderRating, scoreToStarBand, calcPayForImprovementEligibility
- ProviderPerformance page calling backend for live indicators/scorecards and falling back to mock data
- PayForImprovement page using mock data only
- No backend logic persisting provider indicator submissions or computing ratings server-side
- No backend audit trail tied to rating calculation events
- No API for submitting indicator data and triggering a full recalculation cascade

## Requested Changes (Diff)

### Add

- **IndicatorSubmission** backend type: providerId, quarter, list of indicator records (code, name, domain, rate, benchmark, quintile, trend)
- **RatingEngineResult** backend type: providerId, quarter, indicatorRatings (per indicator star rating + trend adjustment), domainScores (safety, preventive, quality, staffing, compliance, experience), overallScore (float), overallStars (1–5 band), incentiveEligibility (tier, estimated payment, improvement score), calculatedAt timestamp
- **submitIndicatorData** mutation: accepts a provider indicator submission, runs the full rating cascade in Motoko (quintile→stars, trend adjustment, domain averages, weighted overall score, star band, P4I eligibility), persists the RatingEngineResult, appends an audit log entry with all inputs/outputs
- **getRatingEngineResult** query: retrieve the latest RatingEngineResult for a given providerId + quarter
- **getAllRatingEngineResults** query (admin/regulator): returns results across all providers for a given quarter
- **getProviderScorecardV2** query: returns a fully calculated scorecard derived from the persisted RatingEngineResult — indicator ratings, domain scores, benchmark comparisons, overall rating, incentive tier
- Audit log entries automatically created on every rating recalculation event with: providerId, quarter, previous overall stars, new overall stars, trigger action

### Modify

- **ProviderScorecard** type: add qualityScore, staffingScore, complianceScore fields to match the 6-domain weighted model (Safety 30%, Preventive 20%, Quality 20%, Staffing 15%, Compliance 10%, Experience 5%)
- **getIndicatorResults**: expand static seed data to include all 6 domains with realistic SAF-001–SAF-005 style codes, rates, benchmarks, quintiles, and trends
- **NationalOverviewStats**: add avgQualityScore, avgComplianceScore, avgStaffingScore fields
- Frontend **ProviderPerformance** page: consume getProviderScorecardV2 / getRatingEngineResult when available; show all 6 domain scores; display calculated overall star rating alongside numeric score
- Frontend **PayForImprovement** page: consume incentiveEligibility from RatingEngineResult rather than mock calculation; display tier, estimated payment, improvement score from backend
- Frontend **ratingEngine.ts** utility: keep pure functions for local fallback; add scoreToStarBand export used by new UI components

### Remove

- Nothing removed; existing endpoints remain for backward compatibility

## Implementation Plan

1. Extend Motoko types: add IndicatorSubmission, RatingEngineResult (with all sub-fields), IncentiveEligibility
2. Implement pure rating calculation in Motoko: quintile map, trend adjustment, clamp [1,5], domain average, weighted sum, scoreToStarBand thresholds
3. Implement P4I eligibility logic in Motoko: overallStars ≥ 4 → base; + safety improvement ≥ 10% → bonus; + screeningCompletion ≥ 85% → maximum
4. Add submitIndicatorData shared function: validate, compute, persist RatingEngineResult, write AuditLog entry
5. Add getRatingEngineResult query, getAllRatingEngineResults query, getProviderScorecardV2 query
6. Expand static seed data for indicator results across all 6 domains (Safety, Preventive, Quality, Staffing, Compliance, Experience)
7. Update backend.d.ts types to reflect new API
8. Update frontend useQueries hooks: add useRatingEngineResult, useProviderScorecardV2, useSubmitIndicatorData, useAllRatingEngineResults
9. Update ProviderPerformance page: show 6-domain scores from backend, overall star band
10. Update PayForImprovement page: pull live incentive tier + payment from backend RatingEngineResult
11. Add a "Rating Engine Status" panel to the Provider Performance page showing the last recalculation timestamp and sync chain status
