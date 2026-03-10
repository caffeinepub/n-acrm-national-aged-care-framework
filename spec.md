# N-ACRM National Aged Care Framework

## Current State
The Rating Engine and Live Indicator Submission modules have several bugs:
- `overallScoreToStars()` returns integer band values (1, 2, 3, 4, 5) instead of continuous fractional stars using `(score/100)×5` formula
- High-performance popup shows `92.50 out of 5.0` instead of `92.5 / 100` + `4.6 / 5`
- `ScoreRow` in PerformanceAlertModal shows indicator scores as `X.X / 5` instead of benchmark-derived `X / 100` → `Y / 5`
- The Live Indicator Submission table has no editable rate inputs — users can only change quintile/trend. Recalculation requires a button click.
- Quarter change does not reload provider-specific indicator data and recalculate
- `overallStars` stored as integer BigInt so star display is always a whole number

## Requested Changes (Diff)

### Add
- Continuous star formula: `starRating = (score / 100) × 5` replacing the band-based `overallScoreToStars`
- Editable numeric `rate` input fields in the Live Indicator Submission table, so changing a value immediately triggers recalculation
- `handleRateChange(idx, value)` function that updates the indicator rate and auto-recalculates ratings
- Quarter change handler that reloads provider-specific quarter data and re-runs calculation
- `scoreToFractionalStars(score: number): number` export in ratingEngine.ts: `return Math.min(5, (score / 100) * 5)`

### Modify
- `overallScoreToStars` in ratingEngine.ts: keep for backward compat but also export `scoreToFractionalStars`
- RatingEngine.tsx `handleCalculate`: use `scoreToFractionalStars(overallScore)` instead of `overallScoreToStars` for `overallStars`; store as `number` not `BigInt`
- Each indicator row's `starRating` in handleCalculate: use `scoreToFractionalStars(perfScore)` so fractional stars display in the table
- Overall Rating card: show `{result.overallScore.toFixed(1)} / 100` as the primary score label, then `StarRating value=(score/100)*5` with `{((score/100)*5).toFixed(1)} / 5` label
- PerformanceAlertModal high-alert section: replace `{highAlert.overallRating.toFixed(2)}` + "out of 5.0" with two lines: `{(highAlert.overallRating * 20).toFixed(1)} / 100` (convert star back to score) and `{highAlert.overallRating.toFixed(1)} / 5` star label. OR pass the overallScore (0-100) to the alert directly.
- `HighPerformanceAlert` interface: add `overallScore?: number` field (0-100) so popup can show both `92.5 / 100` and `4.6 / 5`
- `getHighPerformanceAlert` in performanceAlerts.ts: accept and pass through `overallScore`
- `resolveAlertToShow` in performanceAlerts.ts: accept `overallScore` and pass to high alert
- RatingEngine.tsx alert construction: pass `overallScore: result.overallScore` to the alert
- `ScoreRow` in PerformanceAlertModal: rename to show indicator perf score as `XX / 100` (the score is already 0-100 in topIndicators), and star rating using `scoreToFractionalStars`
- PerformanceAlertModal `topIndicators` in the high alert should display scores as percentage scores with star conversion, not as raw 1-5 values
- Star Band Thresholds rules panel: update ranges to show `Score 90-100 → 4.5-5.0 ★`, `80-89 → 4.0-4.5 ★` etc. matching the new formula
- `handleQuarterChange` in RatingEngine: when quarter changes, reload provider indicators using new quarter, reset and recalculate

### Remove
- "out of 5.0" text in PerformanceAlertModal high alert section
- Fixed non-editable rate display in Live Indicator Submission table (replace with editable inputs)

## Implementation Plan
1. Add `scoreToFractionalStars` to ratingEngine.ts
2. Update PerformanceAlertModal `HighPerformanceAlert` to include `overallScore` and fix display
3. Update performanceAlerts.ts interfaces and functions to pass `overallScore`
4. Rewrite RatingEngine.tsx:
   a. Add editable rate inputs + `handleRateChange` with auto-recalculation (useEffect on indicators)
   b. Use `scoreToFractionalStars` for all star values
   c. Fix Overall Rating display: `XX.X / 100` + `Y.Y / 5`
   d. Fix quarter change handler to reload provider data and recalculate
   e. Pass `overallScore` to alert construction
