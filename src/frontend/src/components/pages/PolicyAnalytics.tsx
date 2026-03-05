import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NATIONAL_TRENDS, REGIONAL_DATA } from "@/data/mockData";
import {
  BarChart2,
  ChevronDown,
  ChevronUp,
  Globe2,
  Minus,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { calcIndicatorStarRating } from "../../utils/ratingEngine";

// ── Mock indicator data for national level ────────────────────────────────────

const NATIONAL_INDICATORS = [
  {
    code: "SAF-001",
    name: "Falls with Harm Rate",
    rate: 5.8,
    benchmark: 5.1,
    quintile: 4,
    trend: "declining" as const,
  },
  {
    code: "SAF-002",
    name: "Medication-Related Harm",
    rate: 3.1,
    benchmark: 3.2,
    quintile: 3,
    trend: "stable" as const,
  },
  {
    code: "SAF-003",
    name: "High-Risk Medication Prevalence",
    rate: 20.4,
    benchmark: 21.2,
    quintile: 3,
    trend: "improving" as const,
  },
  {
    code: "SAF-004",
    name: "Polypharmacy ≥10 Medications",
    rate: 13.2,
    benchmark: 14.8,
    quintile: 2,
    trend: "stable" as const,
  },
  {
    code: "SAF-005",
    name: "Pressure Injuries Stage 2–4",
    rate: 2.1,
    benchmark: 2.4,
    quintile: 3,
    trend: "improving" as const,
  },
  {
    code: "SAF-006",
    name: "ED Presentations (30-day)",
    rate: 9.8,
    benchmark: 10.2,
    quintile: 3,
    trend: "improving" as const,
  },
];

const EQUITY_INDICATORS = [
  {
    label: "CALD Access Gap",
    value: "11.4%",
    trend: "declining" as const,
    benchmark: "8.0%",
    description: "Gap in CALD community access vs general population",
  },
  {
    label: "Referral-to-Placement Time",
    value: "24.8 days",
    trend: "improving" as const,
    benchmark: "22.0 days",
    description: "Average referral to placement time nationally",
  },
  {
    label: "Remote / Rural Gap",
    value: "18.2%",
    trend: "stable" as const,
    benchmark: "12.0%",
    description: "Service availability gap in remote and rural areas",
  },
  {
    label: "Indigenous Access Equity Score",
    value: "62 / 100",
    trend: "improving" as const,
    benchmark: "80 / 100",
    description: "Composite equity score for First Nations access",
  },
];

const SCREENING_STATS = [
  { name: "Falls Risk", completion: 84, target: 90 },
  { name: "Medication Review", completion: 78, target: 85 },
  { name: "Cognitive Assessment", completion: 71, target: 80 },
  { name: "Nutrition Assessment", completion: 88, target: 90 },
  { name: "Pain Assessment", completion: 92, target: 90 },
  { name: "Behavioral Assessment", completion: 74, target: 80 },
];

const PFI_OUTCOMES = [
  { label: "Total Eligible Providers", value: "1,842", sub: "of 2,743 total" },
  { label: "Total Estimated Funding", value: "$142M", sub: "current quarter" },
  { label: "Average Improvement", value: "18.4%", sub: "across all metrics" },
  {
    label: "Bonus Incentive Providers",
    value: "384",
    sub: "safety improvement ≥15%",
  },
];

// ── State screening compliance data ──────────────────────────────────────────

function buildStateComplianceData() {
  return (
    Object.entries(REGIONAL_DATA) as [
      string,
      (typeof REGIONAL_DATA)[keyof typeof REGIONAL_DATA],
    ][]
  )
    .map(([state, data]) => {
      const avg =
        data.regions.reduce((s, r) => s + r.screeningCompliance, 0) /
        data.regions.length;
      return { state, compliance: Number.parseFloat(avg.toFixed(1)) };
    })
    .sort((a, b) => b.compliance - a.compliance);
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getTrendIcon(trend: "improving" | "declining" | "stable") {
  if (trend === "improving")
    return (
      <TrendingUp
        className="w-3.5 h-3.5"
        style={{ color: "oklch(0.45 0.15 145)" }}
      />
    );
  if (trend === "declining")
    return (
      <TrendingDown
        className="w-3.5 h-3.5"
        style={{ color: "oklch(0.48 0.20 25)" }}
      />
    );
  return (
    <Minus className="w-3.5 h-3.5" style={{ color: "oklch(0.55 0.02 240)" }} />
  );
}

function getQuintileStyle(q: number) {
  const styles: Record<number, { bg: string; color: string }> = {
    1: { bg: "oklch(0.93 0.07 145)", color: "oklch(0.28 0.14 145)" },
    2: { bg: "oklch(0.95 0.05 145)", color: "oklch(0.40 0.12 145)" },
    3: { bg: "oklch(0.96 0.05 80)", color: "oklch(0.43 0.14 72)" },
    4: { bg: "oklch(0.95 0.06 50)", color: "oklch(0.48 0.18 50)" },
    5: { bg: "oklch(0.96 0.04 25)", color: "oklch(0.42 0.20 25)" },
  };
  return styles[q] ?? styles[3];
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function PolicyAnalytics() {
  const [pfiExpanded, setPfiExpanded] = useState(false);
  const stateCompliance = buildStateComplianceData();

  return (
    <div className="p-6 space-y-5" data-ocid="policy_analytics.page">
      {/* 1. Page Header */}
      <div className="border-b pb-4">
        <div className="flex items-start gap-3">
          <Globe2
            className="w-6 h-6 flex-shrink-0 mt-0.5"
            style={{ color: "oklch(var(--gov-navy))" }}
          />
          <div>
            <h1 className="text-xl font-bold text-gov-navy">
              Policy Analytics
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Aggregated national and regional sector data — Q4 2025. Individual
              provider and resident data not shown.
            </p>
          </div>
        </div>
        <div
          className="mt-3 px-3 py-2 text-xs border flex items-center gap-2"
          style={{
            background: "oklch(0.97 0.01 254)",
            borderColor: "oklch(0.82 0.05 254)",
            color: "oklch(0.40 0.04 254)",
          }}
        >
          <BarChart2 className="w-4 h-4 flex-shrink-0" />
          <span>
            <strong>Policy Analyst View.</strong> This dashboard displays
            aggregated sector-level metrics only. Individual resident records,
            provider operational details, and regulatory case data are not
            accessible in this view.
          </span>
        </div>
      </div>

      {/* 2. National Risk Trends */}
      <Card className="rounded-none border">
        <CardHeader className="pb-2 pt-4 px-4 border-b">
          <CardTitle className="text-sm font-semibold text-gov-navy">
            National Risk Trends — Q1 to Q4 2025
          </CardTitle>
          <p
            className="text-xs mt-0.5"
            style={{ color: "oklch(0.50 0.025 250)" }}
          >
            National average safety and preventive care composite scores across
            all providers
          </p>
        </CardHeader>
        <CardContent className="p-4">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart
              data={NATIONAL_TRENDS}
              margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="oklch(0.90 0.01 240)"
              />
              <XAxis
                dataKey="quarter"
                tick={{ fontSize: 11 }}
                tickLine={false}
              />
              <YAxis
                domain={[60, 85]}
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{ fontSize: "12px", borderRadius: "2px" }}
              />
              <Legend wrapperStyle={{ fontSize: "11px" }} />
              <Line
                type="monotone"
                dataKey="safetyScore"
                name="Safety Score"
                stroke="oklch(0.28 0.09 254)"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="preventiveScore"
                name="Preventive Score"
                stroke="oklch(0.52 0.15 145)"
                strokeWidth={2}
                strokeDasharray="4 2"
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 3. State Screening Compliance */}
      <Card className="rounded-none border">
        <CardHeader className="pb-2 pt-4 px-4 border-b">
          <CardTitle className="text-sm font-semibold text-gov-navy">
            State Screening Compliance — Average %
          </CardTitle>
          <p
            className="text-xs mt-0.5"
            style={{ color: "oklch(0.50 0.025 250)" }}
          >
            Average mandatory screening bundle completion rate by
            state/territory
          </p>
        </CardHeader>
        <CardContent className="p-4">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={stateCompliance}
              layout="vertical"
              margin={{ top: 5, right: 40, bottom: 5, left: 8 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="oklch(0.90 0.01 240)"
                horizontal={false}
              />
              <XAxis
                type="number"
                domain={[60, 95]}
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                type="category"
                dataKey="state"
                tick={{ fontSize: 11 }}
                tickLine={false}
                width={32}
              />
              <Tooltip
                contentStyle={{ fontSize: "12px", borderRadius: "2px" }}
                formatter={(value: number) => [
                  `${value}%`,
                  "Screening Compliance",
                ]}
              />
              <ReferenceLine
                x={85}
                stroke="oklch(0.28 0.09 254)"
                strokeDasharray="5 3"
                label={{
                  value: "Target 85%",
                  position: "top",
                  fontSize: 9,
                  fill: "oklch(0.28 0.09 254)",
                }}
              />
              <Bar
                dataKey="compliance"
                name="Compliance %"
                radius={0}
                maxBarSize={20}
              >
                {stateCompliance.map((entry) => (
                  <Cell
                    key={entry.state}
                    fill={
                      entry.compliance >= 85
                        ? "oklch(0.52 0.15 145)"
                        : entry.compliance >= 75
                          ? "oklch(0.70 0.14 72)"
                          : "oklch(0.52 0.22 25)"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 4. Key Indicator Performance */}
      <Card className="rounded-none border">
        <CardHeader className="pb-2 pt-4 px-4 border-b">
          <CardTitle className="text-sm font-semibold text-gov-navy">
            National Indicator Performance — Q4 2025
          </CardTitle>
          <p
            className="text-xs mt-0.5"
            style={{ color: "oklch(0.50 0.025 250)" }}
          >
            National average rates, benchmarks, and calculated star ratings
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full gov-table">
              <thead>
                <tr>
                  <th className="text-left" style={{ minWidth: "200px" }}>
                    Indicator
                  </th>
                  <th className="text-left">Code</th>
                  <th className="text-right">National Avg Rate</th>
                  <th className="text-right">Benchmark</th>
                  <th className="text-left">Quintile</th>
                  <th className="text-left">Trend</th>
                  <th className="text-right">Star Rating</th>
                </tr>
              </thead>
              <tbody>
                {NATIONAL_INDICATORS.map((ind, idx) => {
                  const starRating = calcIndicatorStarRating(
                    ind.quintile,
                    ind.trend,
                  );
                  const qStyle = getQuintileStyle(ind.quintile);
                  return (
                    <tr
                      key={ind.code}
                      data-ocid={`policy.indicator.row.${idx + 1}`}
                    >
                      <td className="font-medium">{ind.name}</td>
                      <td className="font-mono text-xs text-muted-foreground">
                        {ind.code}
                      </td>
                      <td className="text-right font-semibold">
                        {ind.rate.toFixed(1)}
                      </td>
                      <td className="text-right text-muted-foreground">
                        {ind.benchmark.toFixed(1)}
                      </td>
                      <td>
                        <span
                          className="px-1.5 py-0.5 rounded text-xs font-bold"
                          style={{ background: qStyle.bg, color: qStyle.color }}
                        >
                          Q{ind.quintile}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-1.5">
                          {getTrendIcon(ind.trend)}
                          <span className="text-xs capitalize">
                            {ind.trend}
                          </span>
                        </div>
                      </td>
                      <td
                        className="text-right font-bold tabular-nums"
                        style={{
                          color:
                            starRating >= 4
                              ? "oklch(0.38 0.14 145)"
                              : starRating >= 3
                                ? "oklch(0.50 0.16 72)"
                                : "oklch(0.48 0.20 25)",
                        }}
                      >
                        {"★".repeat(Math.round(starRating))}
                        {"☆".repeat(5 - Math.round(starRating))}
                        <span className="ml-1 text-xs text-muted-foreground">
                          ({starRating.toFixed(1)})
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 5. Equity Indicators */}
      <div>
        <div
          className="text-xs uppercase font-bold tracking-widest mb-3"
          style={{ color: "oklch(0.46 0.025 250)" }}
        >
          Equity Indicators
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {EQUITY_INDICATORS.map((eq, idx) => (
            <div
              key={eq.label}
              className="p-4 border"
              style={{
                background: "#fff",
                borderLeft: "4px solid oklch(var(--gov-navy))",
                borderTop: "1px solid oklch(var(--border))",
                borderRight: "1px solid oklch(var(--border))",
                borderBottom: "1px solid oklch(var(--border))",
              }}
              data-ocid={`policy.equity.card.${idx + 1}`}
            >
              <div
                className="text-xs uppercase font-bold tracking-widest mb-2"
                style={{ color: "oklch(0.46 0.025 250)" }}
              >
                {eq.label}
              </div>
              <div className="text-2xl font-black tabular-nums mb-1 text-gov-navy">
                {eq.value}
              </div>
              <div className="flex items-center gap-1.5 text-xs mb-1">
                {getTrendIcon(eq.trend)}
                <span
                  className="capitalize"
                  style={{ color: "oklch(0.50 0.025 250)" }}
                >
                  {eq.trend}
                </span>
              </div>
              <div
                className="text-xs"
                style={{ color: "oklch(0.55 0.02 240)" }}
              >
                Benchmark: {eq.benchmark}
              </div>
              <div
                className="text-xs mt-1"
                style={{ color: "oklch(0.55 0.02 240)" }}
              >
                {eq.description}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Screening Completion Statistics */}
      <Card className="rounded-none border">
        <CardHeader className="pb-2 pt-4 px-4 border-b">
          <CardTitle className="text-sm font-semibold text-gov-navy">
            Screening Completion Statistics — National Average
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {SCREENING_STATS.map((s, idx) => {
              const isAboveTarget = s.completion >= s.target;
              return (
                <div
                  key={s.name}
                  className="p-3 border"
                  style={{
                    background: isAboveTarget
                      ? "oklch(0.97 0.02 145)"
                      : "oklch(0.97 0.025 25)",
                    borderColor: isAboveTarget
                      ? "oklch(0.72 0.12 145)"
                      : "oklch(0.72 0.14 25)",
                  }}
                  data-ocid={`policy.screening.card.${idx + 1}`}
                >
                  <div
                    className="text-xs font-bold uppercase tracking-wide mb-1"
                    style={{ color: "oklch(0.30 0.06 254)" }}
                  >
                    {s.name}
                  </div>
                  <div
                    className="text-2xl font-black tabular-nums"
                    style={{
                      color: isAboveTarget
                        ? "oklch(0.38 0.14 145)"
                        : "oklch(0.48 0.20 25)",
                    }}
                  >
                    {s.completion}%
                  </div>
                  <div
                    className="text-xs mt-0.5"
                    style={{ color: "oklch(0.50 0.025 250)" }}
                  >
                    Target: {s.target}%
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 7. Pay-for-Improvement Outcomes */}
      <Card className="rounded-none border">
        <CardHeader className="pb-2 pt-4 px-4 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-gov-navy">
              Pay-for-Improvement Program Outcomes
            </CardTitle>
            <button
              type="button"
              className="flex items-center gap-1 text-xs font-semibold focus:outline-none"
              style={{ color: "oklch(var(--gov-navy))" }}
              onClick={() => setPfiExpanded(!pfiExpanded)}
              data-ocid="policy.pfi.toggle"
              aria-expanded={pfiExpanded}
            >
              {pfiExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
              {pfiExpanded ? "Collapse" : "Expand"}
            </button>
          </div>
          <p
            className="text-xs mt-0.5"
            style={{ color: "oklch(0.50 0.025 250)" }}
          >
            Aggregate Q4-2025 Pay-for-Improvement program outcomes — sector
            level
          </p>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {PFI_OUTCOMES.map((outcome, idx) => (
              <div
                key={outcome.label}
                className="p-3 border"
                style={{
                  background: "#fff",
                  borderLeft: "4px solid oklch(var(--gov-gold-dark))",
                  borderTop: "1px solid oklch(var(--border))",
                  borderRight: "1px solid oklch(var(--border))",
                  borderBottom: "1px solid oklch(var(--border))",
                }}
                data-ocid={`policy.pfi.card.${idx + 1}`}
              >
                <div
                  className="text-xs uppercase font-bold tracking-widest mb-1"
                  style={{ color: "oklch(0.46 0.025 250)" }}
                >
                  {outcome.label}
                </div>
                <div
                  className="text-2xl font-black tabular-nums"
                  style={{ color: "oklch(var(--gov-gold-dark))" }}
                >
                  {outcome.value}
                </div>
                <div
                  className="text-xs mt-0.5"
                  style={{ color: "oklch(0.55 0.02 240)" }}
                >
                  {outcome.sub}
                </div>
              </div>
            ))}
          </div>

          {pfiExpanded && (
            <div
              className="mt-4 p-4 border text-xs space-y-2"
              style={{
                background: "oklch(0.97 0.01 254)",
                borderColor: "oklch(0.82 0.05 254)",
                color: "oklch(0.40 0.04 254)",
              }}
              data-ocid="policy.pfi.eligibility.panel"
            >
              <div
                className="font-bold text-sm mb-2"
                style={{ color: "oklch(var(--gov-navy))" }}
              >
                Eligibility Logic Chain
              </div>
              <div className="flex items-center gap-2 flex-wrap font-semibold">
                <span className="px-2 py-1 border border-gov-navy text-gov-navy rounded-none">
                  Indicator Performance
                </span>
                <span>→</span>
                <span className="px-2 py-1 border border-gov-navy text-gov-navy rounded-none">
                  Indicator Rating
                </span>
                <span>→</span>
                <span className="px-2 py-1 border border-gov-navy text-gov-navy rounded-none">
                  Provider Scorecard
                </span>
                <span>→</span>
                <span className="px-2 py-1 border border-gov-navy text-gov-navy rounded-none">
                  Overall Rating
                </span>
                <span>→</span>
                <span
                  className="px-2 py-1 border rounded-none"
                  style={{
                    borderColor: "oklch(var(--gov-gold-dark))",
                    color: "oklch(var(--gov-gold-dark))",
                  }}
                >
                  Pay-for-Improvement Eligibility
                </span>
              </div>
              <div className="mt-2 space-y-1">
                <p>
                  Overall provider rating ≥ 4 stars → Base Incentive Eligible
                  (estimated $75,000)
                </p>
                <p>
                  Safety improvement ≥ 15% over prior quarter → Additional Bonus
                  Incentive (estimated $120,000)
                </p>
                <p>
                  Screening bundle completion ≥ 85% → Maximum eligibility tier
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
