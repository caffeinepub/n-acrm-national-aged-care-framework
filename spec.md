# N-ACRM National Aged Care Framework

## Current State

The app has a working `RegionalProviderDrillDown` page with:
- City dropdown using CITY_LIST (Hyderabad, Kolkata, Delhi, Mumbai, Chennai, Bengaluru, Pune, Ahmedabad)
- Provider grid cards showing overall average star rating
- Provider detail view with an 8-indicator scorecard table (equal weights)
- Simple mini bar breakdown at the bottom of the detail view
- No weighted rating calculation (all indicators use weight: 1)
- No trend arrows on indicators
- No color-coded risk indicators per indicator
- No indicator insight popups
- No bar chart comparing providers in a region
- No KPI cards at top of provider detail
- No low-performance visual warnings/red icons
- Provider names differ from what the user requested (e.g. "Sunshine Senior Care" instead of "Green Valley Aged Care")

## Requested Changes (Diff)

### Add
- **Exact provider names** as specified: Hyderabad (Green Valley Aged Care, Sunrise Elder Support, Harmony Care Centre), Kolkata (Eastern Life Care, Bengal Senior Living), Delhi (Capital Elder Home, Silver Years Residency)
- **Weighted indicator rating calculation** using: Residents Experience 33%, Compliance 30%, Staffing 22%, Quality Measures 15%, Safety & Clinical as adjustment factor (-0.5 to +0.5 applied after weighted sum), Preventive Care as adjustment factor (-0.3 to +0.3)
- **Trend arrows** on each indicator row: improving (green up arrow), declining (red down arrow), stable (gray right arrow)
- **Color indicators** per row: green (score >= 4.0), yellow (3.0–3.9), red (< 3.0)
- **Low-performance indicator warnings**: red warning icon (AlertTriangle) shown for indicators with score < 3.0; simulate at least one provider with low falls safety, one with poor preventive screening, one with very high staffing
- **Indicator Insight Popup**: clicking any indicator row opens a Dialog/Popover with a contextual explanation message (why rating is high or low); clicking a provider card also shows a brief summary popup before navigating to detail
- **KPI cards** at top of provider detail view: Overall Rating card, highest-performing indicator card, lowest-performing indicator card, and total indicators below benchmark card
- **Bar chart** on the provider list view comparing all providers in the selected region by overall weighted rating (Recharts BarChart)
- **Regional provider comparison chart**: horizontal bar chart or grouped bars showing all providers in the region side-by-side
- **Indicator performance grid** in provider detail: visual grid with color-coded cells per indicator
- **Overall rating explanation text**: "Overall rating calculated using weighted composite score of key indicators." with weight breakdown tooltip

### Modify
- `CITY_PROVIDERS` mockData: update Hyderabad, Kolkata, Delhi entries to use user-specified provider names; add realistic low-performance data to specific providers
- `INDICATOR_CONFIG` in `RegionalProviderDrillDown.tsx`: update weights to 33/30/22/15 for core indicators; add trend and insight fields
- `calcOverall()` function: replace equal average with weighted composite formula
- Provider detail scorecard table: add trend arrow column, color indicator column, warning icon for low performers
- Overall rating card: add weight explanation and breakdown

### Remove
- Nothing removed; existing features are enhanced

## Implementation Plan

1. **Update mockData.ts** – replace Hyderabad/Kolkata/Delhi provider names with user-specified ones; add `trend` and `insight` fields to `CityProvider` indicators; simulate low-performance scenarios (one provider with safetyClinical: 1.8, one with preventiveCare: 1.5, one with staffing: 4.9); add `lowPerformanceFlag` per indicator

2. **Update `CityProvider` interface** – add `indicatorMeta` map: `{ [key]: { trend: 'improving'|'declining'|'stable', insight: string } }`

3. **Update `RegionalProviderDrillDown.tsx`**:
   - Fix `INDICATOR_CONFIG` with correct weights (33%, 30%, 22%, 15% for core 4; adjustment for safetyClinical and preventiveCare)
   - Fix `calcOverall()` to use weighted formula
   - Add `TrendArrow` component (up/right/down icon with color)
   - Add `IndicatorInsightDialog` component (Dialog with insight text, triggered on row click)
   - Add `ProviderInsightPopup` on provider card click (brief summary toast or inline popup before navigating)
   - Add KPI summary cards row at top of ProviderDetail
   - Add `RegionComparisonChart` (Recharts BarChart) below provider list
   - Add warning icon (red AlertTriangle) on low-performing rows
   - Add color dot/badge per indicator row
   - Update overall rating card to show weight breakdown and explanation text
   - Add `data-ocid` markers on all new interactive elements
