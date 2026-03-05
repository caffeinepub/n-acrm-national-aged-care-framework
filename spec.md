# N-ACRM National Aged Care Framework

## Current State

The app has:
- 4 roles: Regulator, Provider, Policy Analyst, Public (selector in header)
- Sidebar navigation gated by role (Regulator sees all, Policy Analyst sees subset, Provider sees subset, Public sees only National Overview)
- Pages: NationalOverview, StateHeatmaps, ProviderPerformance, HighRiskCohorts, CohortRiskDetail, ScreeningTracking, PayForImprovement, DataQuality, AuditGovernance, RegionalProviderDrillDown
- RegionalProviderDrillDown shows city dropdown (Hyderabad, Kolkata, Delhi, Mumbai, Chennai, Bangalore), provider list, provider scorecard with 8 indicator star ratings, insight popups, weighted overall rating, KPI cards, and regional bar chart comparison
- ProviderPerformance shows provider list + scorecard with 4-quarter trend + indicator table (rate, benchmark, quintile, trend)
- PayForImprovement shows eligibility table with improvement %, thresholds, estimated funding
- mockData.ts has CITY_PROVIDERS with per-indicator star ratings (1-5) and indicatorMeta for insights
- No dedicated "Provider" dashboard with data submission portal; no dedicated "Policy Analyst" analytics page
- No Rating Engine module that auto-calculates indicator star ratings from quintile + benchmark + trend
- Public role only sees NationalOverview (not the full regional provider lookup with comparison charts)

## Requested Changes (Diff)

### Add

1. **Rating Engine utility** (`src/utils/ratingEngine.ts`): Pure functions that compute:
   - `calcIndicatorStarRating(quintile, rate, benchmark, trend)`: Q1→5, Q2→4, Q3→3, Q4→2, Q5→1, +0.2 for improving, -0.2 for declining, clamped 1–5
   - `calcDomainScore(indicators[])`: average of indicator star ratings in a domain
   - `calcWeightedProviderRating(domainScores)`: Safety 30%, Preventive 20%, Quality 20%, Staffing 15%, Compliance 10%, Experience 5%; returns numeric score and star band (1-5)
   - `calcPayForImprovementEligibility(overallRating, safetyImprovement, screeningCompletion)`: returns eligibility tier and estimated payment

2. **Public role view** — replace NationalOverview-only with a dedicated `PublicView.tsx`:
   - Regional provider lookup with city dropdown
   - Provider list for selected city
   - Provider detail with indicator star ratings and overall provider rating
   - Provider comparison bar chart
   - NO resident data, NO regulatory actions, NO high-risk cohort data
   - Reads from CITY_PROVIDERS mock data

3. **Provider role dashboard** — dedicated `ProviderDashboard.tsx` page:
   - Shows only one hardcoded provider (e.g. "Green Valley Aged Care" / HYD-001)
   - Performance indicators with star ratings (uses ratingEngine)
   - Screening completion rates (donut/progress bars)
   - High-risk cohort alerts (count + urgency badge)
   - Recommended actions panel (system-generated interventions)
   - Pay-for-Improvement eligibility summary (tier, estimated payment)
   - Data Submission portal section (form to submit data — mock, no real backend call needed)
   - Cannot see other providers' data

4. **Policy Analyst dashboard** — dedicated `PolicyAnalytics.tsx` page:
   - National risk trends (line chart of safety + preventive scores over 4 quarters)
   - Regional heatmap summary (bar chart of state-level safety + screening compliance)
   - Indicator performance trends (table of key indicators with trend arrows)
   - Screening completion statistics (completion rate KPI cards by screening type)
   - Equity indicators (referral-to-placement gap, CALD gap)
   - Pay-for-Improvement outcomes summary (total eligible, total funding, improvement avg)
   - Cannot see individual resident records or provider operational details

5. **Synchronized Rating Engine integration** into existing pages:
   - ProviderPerformance: add a "Star Rating" column to the indicator table using calcIndicatorStarRating
   - RegionalProviderDrillDown: overall rating calculation should visibly use the weighted formula from ratingEngine (display formula note)
   - PayForImprovement: add an "Overall Star Rating" column that updates based on indicator data (using ratingEngine)
   - Add a visible "Ratings synchronized" status banner/badge showing the calculation chain: Indicator Data → Indicator Rating → Scorecard → Overall Rating → Pay-for-Improvement

### Modify

- `Layout.tsx`:
  - Public role → render `PublicView` instead of `NationalOverview`
  - Provider role → `activePage === "national_overview"` becomes default to `ProviderDashboard`
  - Policy Analyst role → add "policy_analytics" as a visible page
  - Add "policy_analytics" to `ActivePage` type in App.tsx

- `Sidebar.tsx`:
  - Provider role: only show National Overview (as Provider Dashboard), High-Risk Cohorts, Screening Tracking, Pay-for-Improvement, Data Quality
  - Policy Analyst role: show National Overview, State Heatmaps, Policy Analytics, Pay-for-Improvement
  - Public role: no sidebar (already hidden)
  - Add "policy_analytics" nav item visible to Policy Analyst and Regulator

- `ProviderPerformance.tsx`: add star rating column to indicator table; add rating sync status note

- `PayForImprovement.tsx`: add "Overall Rating" column computed by ratingEngine; show eligibility logic note

### Remove

- Nothing removed. All existing pages and data preserved.

## Implementation Plan

1. Create `src/utils/ratingEngine.ts` with pure calculation functions
2. Create `src/components/pages/PublicView.tsx` (city dropdown → provider list → provider detail with star ratings, comparison chart)
3. Create `src/components/pages/ProviderDashboard.tsx` (single-provider view with indicators, screening completion, cohort alerts, recommended actions, PFI eligibility, data submission form)
4. Create `src/components/pages/PolicyAnalytics.tsx` (national trends, regional heatmap, indicator trends, screening stats, equity indicators, PFI outcomes)
5. Update `App.tsx` — add "policy_analytics" to ActivePage type
6. Update `Layout.tsx` — wire new pages to roles and active pages
7. Update `Sidebar.tsx` — add policy_analytics nav item; adjust role-visibility per new spec
8. Update `ProviderPerformance.tsx` — add star rating column using ratingEngine; add sync status badge
9. Update `PayForImprovement.tsx` — add overall rating column; show eligibility logic chain
10. Update `mockData.ts` — add any missing indicator quintile/benchmark data needed for ratingEngine demo
