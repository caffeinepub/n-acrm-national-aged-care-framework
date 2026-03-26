# N-ACRM Public Dashboard Consistency Fix

## Current State
The Public Dashboard (`PublicView.tsx`) has several data consistency issues:
- Risk level is derived only from overall star rating, not from individual indicator analysis
- Explanation text is hardcoded per star tier (e.g. "Excellent performance"), ignoring actual weak indicators
- Inconsistent status labels: `getFallsStatus` returns "Low/High" while popup uses "High/Moderate/Low" for satisfaction — neither matches the required "Good/Moderate/Needs Attention" standard
- Popup shows only 3 of 6 indicators, and does not show per-indicator status for all domains
- No contradiction guard: a provider with poor safety can still show "Excellent Performance" label
- `getDomains()` correctly converts 1–5 star values via `starsToPercentScore` into 0–100 for the central engine — this is correct and must be preserved

## Requested Changes (Diff)

### Add
- `getIndicatorStatus(starScore)` — returns `{label, chipClass}` with standardized "Good" / "Moderate" / "Needs Attention" based on indicator star value
- `getRiskLevelFromIndicators(indicators)` — counts poor indicators (< 3.0 stars) and derives Low/Medium/High risk
- `generateDynamicExplanation(stars, indicators)` — builds explanation text by scanning all 6 indicator scores and naming specific weak areas
- Full 6-indicator grid in the popup card (all domain indicators)

### Modify
- `getFallsStatus` → replace "Low/Moderate/High" labels with "Good/Moderate/Needs Attention"
- `getRiskLevel` → replace star-only logic with indicator-count-based logic
- `getPlainLanguageExplanation` → replace hardcoded text with dynamic generation
- Popup: Resident Satisfaction chip from "High/Moderate/Low" to "Good/Moderate/Needs Attention"
- Popup: Show all 6 indicators (not just 3)
- All status labels standardized to "Good/Moderate/Needs Attention"

### Remove
- Hardcoded static explanation strings like "This provider consistently delivers excellent care"
- Inconsistent label sets ("Low/High", "High/Moderate/Low")

## Implementation Plan
1. Add `getIndicatorStatus()` helper returning standardized labels
2. Rewrite `getRiskLevel()` to use indicator counts, not stars
3. Rewrite `getPlainLanguageExplanation()` to generate dynamic text from actual indicator data
4. Standardize all label chips across provider cards and popup
5. Expand popup to show all 6 indicators with consistent status chips and explanations
6. Ensure no UI contradiction: if any indicator is "Needs Attention", explanation must reflect it
