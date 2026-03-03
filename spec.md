# National Aged Care Reporting & Prevention Framework (N-ACRM + HRSM)

## Current State

New project. No prior implementation exists.

## Requested Changes (Diff)

### Add

- Full enterprise-grade web application for the Australian National Aged Care Reporting & Prevention Framework
- Two core modules: N-ACRM (National Aged Care Reporting Modernization) and HRSM (High-Risk Screening Mandates) + Pay-for-Improvement Engine
- Role-based access control with four user personas: Regulator, Provider, Public, Policy Analyst
- Eight dashboard sections with mock realistic data

**Backend Data Models:**
- Provider records (2,700+ services, state/region/type, contact info)
- Indicator results (safety/clinical, preventive, experience, equity dimensions)
- Quarterly scorecards (quintile rankings, peer comparisons, trend data)
- High-risk cohort flags (patient groups, risk criteria, flag status)
- Screening workflow items (type, assigned provider, due date, completion status)
- Pay-for-improvement metrics (improvement calculations, funding eligibility, thresholds)
- Data ingestion records (submission status, validation results, quality scores)
- Audit log entries (user, action, timestamp, entity)
- Regional heatmap data (state/region aggregates, prevalence rates)

**Frontend Pages/Sections:**
1. National Overview Dashboard - KPI cards, trend charts, national summary stats
2. State & Regional Heatmaps - geographic breakdown with indicator overlays
3. Provider Performance Pages - scorecard view, quintile ranking, drill-down
4. High-Risk Cohort Monitoring - flagged cohorts, risk criteria, workflow triggers
5. Screening Bundle Tracking - mandatory workflow completion rates, overdue alerts
6. Pay-for-Improvement Tracker - improvement metrics, funding eligibility, quarterly reports
7. Data Quality Dashboard - ingestion status, validation errors, data lineage
8. Audit & Governance Panel - audit log, user activity, compliance reporting
9. Navigation with role-based view switching (Regulator / Provider / Policy Analyst / Public)

### Modify

Nothing (new project).

### Remove

Nothing (new project).

## Implementation Plan

1. Select authorization component for RBAC support
2. Generate Motoko backend with data models for providers, indicators, scorecards, high-risk cohorts, screening workflows, pay-for-improvement metrics, data quality records, audit logs, and regional aggregates
3. Implement frontend with:
   - Institutional government-grade design (not SaaS startup)
   - Top navigation with role switcher and module tabs
   - National Overview with KPI summary cards and Recharts trend graphs
   - State/Regional heatmap view with tabular geographic breakdown
   - Provider scorecard pages with quintile ranking tables
   - HRSM high-risk cohort monitoring with flag management
   - Screening bundle workflow tracker with overdue indicators
   - Pay-for-improvement tracker with configurable thresholds display
   - Data quality dashboard with ingestion pipeline status
   - Audit & governance log panel
   - WCAG 2.1 Level AA compliance throughout
   - All mock data pre-populated with realistic Australian aged care values
