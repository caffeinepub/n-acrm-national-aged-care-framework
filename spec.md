# N-ACRM — Regulator Dashboard Command Center Redesign

## Current State
- `NationalOverview.tsx` is the main Regulator landing page (1331 lines): KPI cards, state table, alerts, radar/area charts, submissions table
- `ProviderPerformance.tsx` shows provider table with ratings, benchmarks (636 lines)
- `Header.tsx` and `Sidebar.tsx` already use a dark navy sidebar with gov-gold highlights
- `index.css` has a complete OKLCH design token system (`--gov-navy`, `--gov-gold`, `--gov-green`, `--gov-amber`, `--gov-red`)
- `mockData.ts` exports `UNIFIED_PROVIDERS`, `PROVIDER_MASTER`, `getProviderRatingForQuarter(id, quarter)`, `getUnifiedProviderIndicators(id, quarter)`
- `ratingEngine.ts` has `calcNewWeightedOverallScore`, `overallScoreToStars`, `starsToPercentScore`
- All providers have Q1-Q4 quarterly indicator data available via `getUnifiedProviderIndicators`

## Requested Changes (Diff)

### Add
- **Futuristic Command Center NationalOverview**: Deep navy/indigo glassmorphism redesign with animated KPI cards, glowing borders, gradient backgrounds, animated dot-grid hero banner. 4 command KPI cards (Total Providers, High-Risk Providers, Avg Rating, Active Alerts) each with icon, metric, trend indicator, gradient background, hover animation
- **Risk Prediction Engine utility** (`utils/riskPrediction.ts`): Predict future risk level (Low/Medium/High) + confidence score (%) for each provider using Q1-Q4 trend direction (improving/declining), benchmark deviation, current risk score. Logic: if 2+ indicators declining across quarters → elevated predicted risk; if falls rising continuously → high; confidence based on number of consistent trend signals
- **Trend Deviation Detector utility** (`utils/trendDeviation.ts`): Compare current vs previous quarter indicators, flag if change >20% (spike/drop). Output: deviation alerts per provider with indicator name, % change, severity (critical/warning)
- **Decision Support System utility** (`utils/decisionSupport.ts`): Given risk score + predicted risk + deviations + compliance → generate actionable recommendation ("Send audit team", "Increase monitoring", "Issue compliance warning", "Provide additional funding"), priority (High/Medium/Low), and plain-language explanation
- **New Regulator Intelligence page** (`pages/RegulatorIntelligence.tsx`): Full-page command center with 3 tabs: (1) Risk Predictions — table of all providers with Predicted Risk column (color-coded red/yellow/green), Confidence %, tooltip explanation; (2) Deviation Alerts — alert panel listing providers with sudden changes, affected indicator, % change, severity badges; (3) Decision Support — provider table with Recommended Action column, action badges, priority classification, clickable detail modal
- **New nav item** in Sidebar: "Regulator Intelligence" under INTELLIGENCE group, visible only to Regulator role, using `Brain` or `Cpu` Lucide icon, with `regulator_intelligence` page key
- **Advanced visual components** in NationalOverview: Recharts RadarChart for domain performance, AreaChart for trends, heatmap-style state grid
- **Glassmorphism card components**: backdrop-blur, semi-transparent backgrounds, glowing hover effects
- **Loading skeletons** for all data-loading states
- **Micro-interactions**: hover lift, glow, animated transitions on cards

### Modify
- `App.tsx`: Add `regulator_intelligence` to `ActivePage` type
- `Layout.tsx`: Add `RegulatorIntelligence` import and route case
- `Sidebar.tsx`: Add "Regulator Intelligence" nav item under INTELLIGENCE group for Regulator role only, using `Brain` icon
- `NationalOverview.tsx`: Full visual redesign — deep navy command center aesthetic with gradient hero, glassmorphism KPI cards with animated glow borders, advanced charts, alert panel with large color-coded cards
- `Header.tsx`: Enhance with notification bell badge (showing alert count), pulsing system status, more premium futuristic styling with gradient background
- `index.css`: Add futuristic utility classes: `.cmd-card` (glassmorphism card), `.glow-blue`, `.glow-red`, `.glow-green`, animated shimmer keyframe, `@keyframes pulse-glow`

### Remove
- No existing features removed

## Implementation Plan

1. Update `index.css` with futuristic utility classes and keyframe animations (shimmer, pulse-glow, slide-up)
2. Create `utils/riskPrediction.ts` — predict risk level + confidence from quarterly indicator trends
3. Create `utils/trendDeviation.ts` — detect >20% changes between quarters, output alert list
4. Create `utils/decisionSupport.ts` — generate action recommendations with priority and explanation
5. Redesign `NationalOverview.tsx` as a futuristic command center (keep all existing data, upgrade visuals: gradient hero, glassmorphism KPI cards, animated charts, large alert cards)
6. Redesign `Header.tsx` — add notification count, more futuristic dark gradient styling for Regulator role
7. Create `pages/RegulatorIntelligence.tsx` — 3-tab intelligence page using all 3 new utility modules
8. Update `App.tsx` — add `regulator_intelligence` to ActivePage
9. Update `Layout.tsx` — add RegulatorIntelligence route
10. Update `Sidebar.tsx` — add Regulator Intelligence nav item with Brain icon
