# N-ACRM National Aged Care Framework

## Current State
- Full-stack app with 4 roles: Regulator, Provider, Policy Analyst, Public
- Sidebar has most nav items but is missing: Provider Comparison, AI Assistant for all roles
- Design system exists (design-system.css, components/ds/index.tsx) with OKLCH tokens and 11+ DS components
- Some inner pages (DataQuality, HighRiskCohorts, ScreeningTracking, CohortRiskDetail) use basic Card/border styles without the full DS hero banners and glassmorphism patterns
- No `ProviderComparison` or `AIAssistant` pages exist
- ActivePage type in App.tsx does not include `provider_comparison` or `ai_assistant`

## Requested Changes (Diff)

### Add
- `ProviderComparison.tsx` page — available for Regulator, Policy Analyst, Public roles
  - Side-by-side comparison of 2–5 providers: star ratings, domain scores, risk, trend
  - Grouped bar chart + radar chart using Recharts
  - Provider multi-select with search
  - Uses `getProviderRatingForQuarter` and `PROVIDER_MASTER` as data source
- `AIAssistant.tsx` page — available for all 4 roles
  - Full-page AI chat interface (not a floating widget)
  - Context-aware: responds based on real provider data from mockData
  - Typing animation, message bubbles, suggested queries
  - Quick action chips per role (Regulator: "Show high-risk providers", Provider: "How can I improve my rating?", etc.)
  - Multi-turn conversation with real data-driven responses
- Nav items added to Sidebar:
  - `provider_comparison` for Regulator, Policy Analyst, Public (in ANALYTICS / TOOLS group)
  - `ai_assistant` for all 4 roles (in a new AI TOOLS group)
- ActivePage union in App.tsx: add `provider_comparison` | `ai_assistant`
- Layout.tsx routing: handle `provider_comparison` and `ai_assistant` cases

### Modify
- Sidebar: Add Provider Comparison and AI Assistant items with proper icons (GitCompare/Bot)
- App.tsx: Extend ActivePage type
- Layout.tsx: Add route cases for new pages, pass currentRole to AIAssistant and ProviderComparison
- DataQuality.tsx: Apply DS hero banner, DSCard, DSKpiCard patterns for visual consistency
- HighRiskCohorts.tsx: Apply DS hero banner and card styles
- ScreeningTracking.tsx: Apply DS hero banner and card styles
- All pages that use plain `<Card>` with `rounded-none border`: upgrade to `ds-card` with proper spacing

### Remove
- Nothing removed (backwards-compatible additions only)

## Implementation Plan
1. Extend `ActivePage` type in App.tsx to include `provider_comparison` and `ai_assistant`
2. Add nav items in Sidebar.tsx under appropriate groups with GitCompare and Bot icons
3. Create `src/frontend/src/components/pages/ProviderComparison.tsx`
4. Create `src/frontend/src/components/pages/AIAssistant.tsx`
5. Add routing in Layout.tsx for both new pages
6. Apply DS hero banner + DSCard patterns to DataQuality, HighRiskCohorts, ScreeningTracking pages
7. Validate build passes with no type errors
