# N-ACRM Policy Analyst Dashboard Enhancement

## Current State
The Policy Analyst Dashboard has 7 tabs: National Overview, Regional Heatmaps, Trend Analysis, Policy Insights, Equity Analysis, Pay-for-Improvement, Comparison Charts. A policyInsightEngine.ts generates auto-updating insights.

## Requested Changes (Diff)

### Add
- Enhanced AI Policy Insight Engine tab with correlation analysis, confidence scores, severity ranking
- Scenario Analysis Tool with interactive sliders and projected outcome calculations
- Enhanced Equity Gap Detection with auto-detection, gap ranking, population breakdown
- Policy Impact Tracking with before/after timeline comparison
- Enhanced Regional Comparison Engine with multi-region radar and sortable table

### Modify
- PolicyAnalytics.tsx: Add new tabs, reorganize layout
- policyInsightEngine.ts: Add correlation logic, confidence scores, categorization

### Remove
- Nothing removed

## Implementation Plan
1. Enhance policyInsightEngine.ts with correlation detection and confidence scores
2. Add ScenarioAnalysis section with sliders and projected outcomes
3. Add EquityGapDetection section with gap ranking
4. Add PolicyImpactTracking section with before/after comparison
5. Add enhanced RegionalComparison with multi-region radar
6. Update PolicyAnalytics.tsx tabs
