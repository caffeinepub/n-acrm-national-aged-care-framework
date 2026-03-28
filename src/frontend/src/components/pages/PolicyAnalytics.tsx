import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  BarChart2,
  CheckCircle,
  Download,
  FileText,
  Info,
  MapPin,
  Minus,
  Shield,
  Star,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { IncentiveEligibilityBadge } from "@/components/ui/IncentiveEligibilityBadge";
import { StarRating } from "@/components/ui/StarRating";
import { generateEnhancedInsights } from "@/utils/policyInsightEngine";
import {
  UNIFIED_PROVIDERS,
  getProviderRatingForQuarter,
} from "../../data/mockData";

// ─── AGGREGATED SECTOR DATA (NO individual provider names) ────────────────────

const STATE_DATA = [
  {
    state: "NSW",
    name: "New South Wales",
    providerCount: 7,
    avgRating: 3.6,
    avgScore: 72.1,
    highRiskCount: 2,
    screeningPct: 81.4,
    fallsRate: 5.8,
    medicationHarm: 3.2,
    improvementPct: 14.2,
    eligibleCount: 4,
    domainScores: {
      safety: 71,
      preventive: 76,
      quality: 73,
      staffing: 69,
      compliance: 74,
      experience: 70,
    },
    urbanRural: { urban: 5, rural: 1, remote: 1 },
    q1Score: 68.2,
    q2Score: 70.1,
    q3Score: 71.5,
    q4Score: 72.1,
  },
  {
    state: "VIC",
    name: "Victoria",
    providerCount: 6,
    avgRating: 4.1,
    avgScore: 82.4,
    highRiskCount: 0,
    screeningPct: 88.7,
    fallsRate: 4.1,
    medicationHarm: 2.1,
    improvementPct: 18.6,
    eligibleCount: 5,
    domainScores: {
      safety: 83,
      preventive: 87,
      quality: 82,
      staffing: 80,
      compliance: 84,
      experience: 81,
    },
    urbanRural: { urban: 5, rural: 1, remote: 0 },
    q1Score: 78.4,
    q2Score: 80.2,
    q3Score: 81.8,
    q4Score: 82.4,
  },
  {
    state: "QLD",
    name: "Queensland",
    providerCount: 5,
    avgRating: 3.3,
    avgScore: 66.8,
    highRiskCount: 2,
    screeningPct: 75.2,
    fallsRate: 6.9,
    medicationHarm: 3.8,
    improvementPct: 9.4,
    eligibleCount: 2,
    domainScores: {
      safety: 65,
      preventive: 68,
      quality: 67,
      staffing: 63,
      compliance: 70,
      experience: 68,
    },
    urbanRural: { urban: 3, rural: 1, remote: 1 },
    q1Score: 63.5,
    q2Score: 64.8,
    q3Score: 65.9,
    q4Score: 66.8,
  },
  {
    state: "SA",
    name: "South Australia",
    providerCount: 3,
    avgRating: 3.7,
    avgScore: 74.3,
    highRiskCount: 1,
    screeningPct: 82.1,
    fallsRate: 5.2,
    medicationHarm: 2.9,
    improvementPct: 12.8,
    eligibleCount: 2,
    domainScores: {
      safety: 74,
      preventive: 77,
      quality: 75,
      staffing: 72,
      compliance: 76,
      experience: 73,
    },
    urbanRural: { urban: 2, rural: 1, remote: 0 },
    q1Score: 70.8,
    q2Score: 72.1,
    q3Score: 73.4,
    q4Score: 74.3,
  },
  {
    state: "WA",
    name: "Western Australia",
    providerCount: 3,
    avgRating: 3.4,
    avgScore: 68.5,
    highRiskCount: 1,
    screeningPct: 77.8,
    fallsRate: 6.3,
    medicationHarm: 3.5,
    improvementPct: 11.2,
    eligibleCount: 2,
    domainScores: {
      safety: 67,
      preventive: 71,
      quality: 69,
      staffing: 65,
      compliance: 72,
      experience: 68,
    },
    urbanRural: { urban: 1, rural: 1, remote: 1 },
    q1Score: 65.2,
    q2Score: 66.5,
    q3Score: 67.8,
    q4Score: 68.5,
  },
  {
    state: "TAS",
    name: "Tasmania",
    providerCount: 2,
    avgRating: 3.2,
    avgScore: 64.1,
    highRiskCount: 1,
    screeningPct: 73.4,
    fallsRate: 7.2,
    medicationHarm: 4.1,
    improvementPct: 7.6,
    eligibleCount: 1,
    domainScores: {
      safety: 62,
      preventive: 65,
      quality: 64,
      staffing: 60,
      compliance: 67,
      experience: 63,
    },
    urbanRural: { urban: 1, rural: 1, remote: 0 },
    q1Score: 61.4,
    q2Score: 62.3,
    q3Score: 63.5,
    q4Score: 64.1,
  },
  {
    state: "NT",
    name: "Northern Territory",
    providerCount: 1,
    avgRating: 2.8,
    avgScore: 57.3,
    highRiskCount: 1,
    screeningPct: 66.5,
    fallsRate: 8.1,
    medicationHarm: 4.6,
    improvementPct: 5.2,
    eligibleCount: 0,
    domainScores: {
      safety: 55,
      preventive: 58,
      quality: 57,
      staffing: 52,
      compliance: 61,
      experience: 56,
    },
    urbanRural: { urban: 0, rural: 0, remote: 1 },
    q1Score: 54.8,
    q2Score: 55.6,
    q3Score: 56.4,
    q4Score: 57.3,
  },
  {
    state: "ACT",
    name: "Australian Capital Territory",
    providerCount: 2,
    avgRating: 4.4,
    avgScore: 87.9,
    highRiskCount: 0,
    screeningPct: 91.8,
    fallsRate: 3.5,
    medicationHarm: 1.8,
    improvementPct: 21.3,
    eligibleCount: 2,
    domainScores: {
      safety: 89,
      preventive: 91,
      quality: 88,
      staffing: 86,
      compliance: 90,
      experience: 87,
    },
    urbanRural: { urban: 2, rural: 0, remote: 0 },
    q1Score: 83.2,
    q2Score: 85.1,
    q3Score: 86.7,
    q4Score: 87.9,
  },
];

const QUARTERLY_TRENDS = [
  {
    quarter: "Q1 2024",
    fallsRate: 6.8,
    medicationHarm: 3.9,
    screening: 74.2,
    avgScore: 68.8,
  },
  {
    quarter: "Q2 2024",
    fallsRate: 6.4,
    medicationHarm: 3.6,
    screening: 76.8,
    avgScore: 70.4,
  },
  {
    quarter: "Q3 2024",
    fallsRate: 5.9,
    medicationHarm: 3.3,
    screening: 79.3,
    avgScore: 72.1,
  },
  {
    quarter: "Q4 2024",
    fallsRate: 5.6,
    medicationHarm: 3.1,
    screening: 81.6,
    avgScore: 73.8,
  },
];

const DOMAIN_BENCHMARKS = [
  { domain: "Safety", avgScore: 73, benchmark: 80 },
  { domain: "Preventive", avgScore: 76, benchmark: 82 },
  { domain: "Quality", avgScore: 74, benchmark: 80 },
  { domain: "Staffing", avgScore: 70, benchmark: 78 },
  { domain: "Compliance", avgScore: 76, benchmark: 83 },
  { domain: "Experience", avgScore: 72, benchmark: 80 },
];

// ─── UTILITY FUNCTIONS ────────────────────────────────────────────────────────

function getRiskTier(avgRating: number): { label: string; color: string } {
  if (avgRating >= 4.0) return { label: "Good", color: "green" };
  if (avgRating >= 3.0) return { label: "At Risk", color: "amber" };
  return { label: "Critical", color: "red" };
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <span className="star-rating">
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={s <= Math.round(rating) ? "" : "star-empty"}>
          ★
        </span>
      ))}
      <span
        className="ml-1 text-xs font-mono-data"
        style={{ color: "oklch(0.44 0.018 252)" }}
      >
        {rating.toFixed(1)}
      </span>
    </span>
  );
}

function TrendArrow({
  value,
  positiveIsGood = true,
}: { value: number; positiveIsGood?: boolean }) {
  const isGood = positiveIsGood ? value >= 0 : value <= 0;
  if (Math.abs(value) < 0.1) return <Minus className="h-3 w-3 text-gray-400" />;
  return isGood ? (
    <TrendingUp className="h-3 w-3" style={{ color: "oklch(0.52 0.15 145)" }} />
  ) : (
    <TrendingDown className="h-3 w-3" style={{ color: "oklch(0.5 0.2 25)" }} />
  );
}

const CHART_COLORS = {
  navy: "#1E3A8A",
  blue: "#3B82F6",
  green: "#16A34A",
  amber: "#F59E0B",
  red: "#DC2626",
  purple: "#7C3AED",
  teal: "#0D9488",
  orange: "#EA580C",
};

const STATE_COLORS: Record<string, string> = {
  NSW: "#1E3A8A",
  VIC: "#16A34A",
  QLD: "#DC2626",
  SA: "#7C3AED",
  WA: "#F59E0B",
  TAS: "#0D9488",
  NT: "#EA580C",
  ACT: "#3B82F6",
};

// ─── CUSTOM TOOLTIP ───────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded border bg-card shadow-card text-xs p-2.5"
      style={{ minWidth: 140 }}
    >
      <p
        className="font-semibold mb-1"
        style={{ color: "oklch(0.22 0.07 258)" }}
      >
        {label}
      </p>
      {payload.map((entry: any) => (
        <div
          key={entry.dataKey}
          className="flex items-center justify-between gap-4"
        >
          <span style={{ color: entry.color }}>{entry.name}</span>
          <span className="font-mono-data font-semibold">
            {entry.value?.toFixed ? entry.value.toFixed(1) : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── PERSISTENT KPI BAR ───────────────────────────────────────────────────────

function KpiBar() {
  const totalProviders = STATE_DATA.reduce((s, r) => s + r.providerCount, 0);
  const highRisk = STATE_DATA.reduce((s, r) => s + r.highRiskCount, 0);
  const avgRating =
    STATE_DATA.reduce((s, r) => s + r.avgRating * r.providerCount, 0) /
    totalProviders;
  const avgScreening =
    STATE_DATA.reduce((s, r) => s + r.screeningPct * r.providerCount, 0) /
    totalProviders;

  const kpis = [
    {
      label: "Average National Rating",
      value: avgRating.toFixed(1),
      sub: "/ 5.0 stars",
      icon: Star,
      accent: CHART_COLORS.amber,
      trend: +0.3,
      render: () => <StarDisplay rating={avgRating} />,
    },
    {
      label: "Total Providers",
      value: String(totalProviders),
      sub: "Across 8 states / territories",
      icon: Users,
      accent: CHART_COLORS.navy,
      trend: 0,
    },
    {
      label: "High-Risk Providers",
      value: String(highRisk),
      sub: `${((highRisk / totalProviders) * 100).toFixed(0)}% of sector · rating < 3★`,
      icon: AlertTriangle,
      accent: CHART_COLORS.red,
      trend: -2,
      trendPositiveIsGood: false,
    },
    {
      label: "Screening Completion",
      value: `${avgScreening.toFixed(1)}%`,
      sub: "Sector average · Q4 2024",
      icon: Activity,
      accent: CHART_COLORS.green,
      trend: +4.8,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
      {kpis.map((k) => (
        <div key={k.label} className="kpi-card" data-ocid="policy.kpi.card">
          <div className="kpi-card-accent" style={{ background: k.accent }} />
          <div className="px-4 pt-4 pb-3">
            <div className="flex items-start justify-between">
              <div
                className="flex items-center justify-center w-8 h-8 rounded-sm"
                style={{ background: `${k.accent}18` }}
              >
                <k.icon className="h-4 w-4" style={{ color: k.accent }} />
              </div>
              <div className="flex items-center gap-1">
                <TrendArrow
                  value={k.trend}
                  positiveIsGood={k.trendPositiveIsGood !== false}
                />
                <span
                  className="text-xs"
                  style={{ color: "oklch(0.5 0.022 252)" }}
                >
                  {k.trend > 0 ? "+" : ""}
                  {k.trend !== 0 ? k.trend : ""}
                </span>
              </div>
            </div>
            {k.render ? (
              <div className="mt-2">{k.render()}</div>
            ) : (
              <div
                className="stat-number text-2xl mt-2"
                style={{ color: "oklch(0.16 0.035 258)" }}
              >
                {k.value}
              </div>
            )}
            <div
              className="text-xs mt-0.5"
              style={{ color: "oklch(0.5 0.022 252)" }}
            >
              {k.sub}
            </div>
            <div
              className="text-xs font-medium mt-1.5"
              style={{ color: "oklch(0.44 0.018 252)" }}
            >
              {k.label}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── TAB 1: NATIONAL OVERVIEW ─────────────────────────────────────────────────

function NationalOverviewTab() {
  const totalProviders = STATE_DATA.reduce((s, r) => s + r.providerCount, 0);
  const riskTierData = [
    {
      name: "Low Risk (4★+)",
      value: STATE_DATA.filter((s) => s.avgRating >= 4).reduce(
        (a, s) => a + s.providerCount,
        0,
      ),
      fill: CHART_COLORS.green,
    },
    {
      name: "Medium Risk (3–4★)",
      value: STATE_DATA.filter(
        (s) => s.avgRating >= 3 && s.avgRating < 4,
      ).reduce((a, s) => a + s.providerCount, 0),
      fill: CHART_COLORS.amber,
    },
    {
      name: "High Risk (<3★)",
      value: STATE_DATA.filter((s) => s.avgRating < 3).reduce(
        (a, s) => a + s.providerCount,
        0,
      ),
      fill: CHART_COLORS.red,
    },
  ];

  return (
    <div className="space-y-5 animate-slide-in-up">
      {/* Screening Trend */}
      <div className="section-card">
        <div className="section-card-header">
          <span className="section-card-title">
            <Activity className="h-4 w-4" />
            Screening Completion Trend — Q1–Q4 2024
          </span>
          <Badge variant="outline" className="text-xs">
            Sector Average
          </Badge>
        </div>
        <div className="p-4">
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={QUARTERLY_TRENDS}>
              <defs>
                <linearGradient id="screeningGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={CHART_COLORS.green}
                    stopOpacity={0.25}
                  />
                  <stop
                    offset="95%"
                    stopColor={CHART_COLORS.green}
                    stopOpacity={0.03}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="quarter" tick={{ fontSize: 11 }} />
              <YAxis domain={[65, 90]} tick={{ fontSize: 11 }} unit="%" />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey="screening"
                name="Screening %"
                stroke={CHART_COLORS.green}
                fill="url(#screeningGrad)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Risk Tier Distribution */}
        <div className="section-card">
          <div className="section-card-header">
            <span className="section-card-title">
              <Shield className="h-4 w-4" />
              Provider Risk Tier Distribution
            </span>
          </div>
          <div className="p-4 flex items-center justify-center">
            <div className="w-full">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={riskTierData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    dataKey="value"
                    label={({ value }) => `${value}`}
                    labelLine={false}
                  >
                    {riskTierData.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: 11 }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-1">
                {riskTierData.map((t) => (
                  <div key={t.name} className="text-center">
                    <div
                      className="stat-number text-lg"
                      style={{ color: t.fill }}
                    >
                      {t.value}
                    </div>
                    <div
                      className="text-xs"
                      style={{ color: "oklch(0.5 0.022 252)" }}
                    >
                      {((t.value / totalProviders) * 100).toFixed(0)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Domain Performance Summary */}
        <div className="section-card">
          <div className="section-card-header">
            <span className="section-card-title">
              <BarChart2 className="h-4 w-4" />
              Sector Performance by Domain
            </span>
          </div>
          <div className="p-0">
            <table className="gov-table">
              <thead>
                <tr>
                  <th>Domain</th>
                  <th>Avg Score</th>
                  <th>Benchmark</th>
                  <th>Gap</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {DOMAIN_BENCHMARKS.map((d) => {
                  const gap = d.avgScore - d.benchmark;
                  return (
                    <tr key={d.domain}>
                      <td className="font-medium">{d.domain}</td>
                      <td className="font-mono-data font-semibold">
                        {d.avgScore}
                      </td>
                      <td className="font-mono-data">{d.benchmark}</td>
                      <td>
                        <span
                          className="font-mono-data text-xs font-semibold"
                          style={{
                            color:
                              gap >= 0
                                ? CHART_COLORS.green
                                : gap > -10
                                  ? CHART_COLORS.amber
                                  : CHART_COLORS.red,
                          }}
                        >
                          {gap > 0 ? "+" : ""}
                          {gap}
                        </span>
                      </td>
                      <td>
                        <div className="progress-mini" style={{ width: 80 }}>
                          <div
                            className="progress-mini-fill"
                            style={{
                              width: `${d.avgScore}%`,
                              background:
                                d.avgScore >= d.benchmark
                                  ? CHART_COLORS.green
                                  : d.avgScore >= d.benchmark - 10
                                    ? CHART_COLORS.amber
                                    : CHART_COLORS.red,
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── TAB 2: REGIONAL HEATMAPS ─────────────────────────────────────────────────

function RegionalHeatmapsTab() {
  const sorted = [...STATE_DATA].sort((a, b) => a.avgScore - b.avgScore);

  return (
    <div className="space-y-5 animate-slide-in-up">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {sorted.map((s) => {
          const tier = getRiskTier(s.avgRating);
          const isCritical = tier.label === "Critical";
          return (
            <div
              key={s.state}
              className="section-card overflow-hidden card-hover"
              style={
                isCritical
                  ? { borderLeft: `3px solid ${CHART_COLORS.red}` }
                  : {}
              }
              data-ocid="policy.region.card"
            >
              <div
                className="px-3 py-2 flex items-center justify-between"
                style={{
                  background: isCritical
                    ? "oklch(0.97 0.015 25)"
                    : tier.label === "At Risk"
                      ? "oklch(0.97 0.015 65)"
                      : "oklch(0.97 0.015 145)",
                }}
              >
                <div>
                  <div
                    className="font-bold text-sm"
                    style={{ color: "oklch(0.16 0.035 258)" }}
                  >
                    {s.state}
                  </div>
                  <div
                    className="text-xs"
                    style={{ color: "oklch(0.44 0.018 252)" }}
                  >
                    {s.name}
                  </div>
                </div>
                <span
                  className={`badge-${tier.color}`}
                  style={{ fontSize: "0.65rem" }}
                >
                  {tier.label}
                </span>
              </div>
              <div className="px-3 py-2.5 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span
                    className="text-xs"
                    style={{ color: "oklch(0.5 0.022 252)" }}
                  >
                    Avg Rating
                  </span>
                  <StarDisplay rating={s.avgRating} />
                </div>
                <div className="flex justify-between items-center">
                  <span
                    className="text-xs"
                    style={{ color: "oklch(0.5 0.022 252)" }}
                  >
                    Providers
                  </span>
                  <span className="font-mono-data text-xs font-semibold">
                    {s.providerCount}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span
                    className="text-xs"
                    style={{ color: "oklch(0.5 0.022 252)" }}
                  >
                    High Risk
                  </span>
                  <span
                    className="font-mono-data text-xs font-semibold"
                    style={{
                      color:
                        s.highRiskCount > 0
                          ? CHART_COLORS.red
                          : CHART_COLORS.green,
                    }}
                  >
                    {s.highRiskCount}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span
                    className="text-xs"
                    style={{ color: "oklch(0.5 0.022 252)" }}
                  >
                    Screening
                  </span>
                  <span className="font-mono-data text-xs font-semibold">
                    {s.screeningPct.toFixed(1)}%
                  </span>
                </div>
                <div className="mt-1">
                  <div className="progress-mini">
                    <div
                      className="progress-mini-fill"
                      style={{
                        width: `${s.avgScore}%`,
                        background:
                          tier.label === "Good"
                            ? CHART_COLORS.green
                            : tier.label === "At Risk"
                              ? CHART_COLORS.amber
                              : CHART_COLORS.red,
                      }}
                    />
                  </div>
                  <div
                    className="text-right text-xs font-mono-data mt-0.5"
                    style={{ color: "oklch(0.44 0.018 252)" }}
                  >
                    Score: {s.avgScore.toFixed(1)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Avg Score Bar Chart */}
      <div className="section-card">
        <div className="section-card-header">
          <span className="section-card-title">
            <BarChart2 className="h-4 w-4" />
            Average Performance Score by State / Territory
          </span>
        </div>
        <div className="p-4">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={[...STATE_DATA].sort((a, b) => b.avgScore - a.avgScore)}
              layout="vertical"
              margin={{ left: 8, right: 24 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#E5E7EB"
                horizontal={false}
              />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
              <YAxis
                type="category"
                dataKey="state"
                tick={{ fontSize: 12, fontWeight: 600 }}
                width={36}
              />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="avgScore" name="Avg Score" radius={[0, 3, 3, 0]}>
                {[...STATE_DATA]
                  .sort((a, b) => b.avgScore - a.avgScore)
                  .map((entry) => (
                    <Cell key={entry.state} fill={STATE_COLORS[entry.state]} />
                  ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ─── TAB 3: TREND ANALYSIS ────────────────────────────────────────────────────

function TrendAnalysisTab() {
  const qChangeData = [
    {
      indicator: "Falls Rate",
      q3: 5.9,
      q4: 5.6,
      change: -5.1,
      lowerIsGood: true,
    },
    {
      indicator: "Medication Harm",
      q3: 3.3,
      q4: 3.1,
      change: -6.1,
      lowerIsGood: true,
    },
    {
      indicator: "Screening",
      q3: 79.3,
      q4: 81.6,
      change: +2.9,
      lowerIsGood: false,
    },
    {
      indicator: "Avg Score",
      q3: 72.1,
      q4: 73.8,
      change: +2.4,
      lowerIsGood: false,
    },
  ];

  const q3q4CompareData = QUARTERLY_TRENDS.filter(
    (d) => d.quarter === "Q3 2024" || d.quarter === "Q4 2024",
  );

  return (
    <div className="space-y-5 animate-slide-in-up">
      {/* Multi-line Trend */}
      <div className="section-card">
        <div className="section-card-header">
          <span className="section-card-title">
            <TrendingUp className="h-4 w-4" />
            Sector Indicator Trends — Q1–Q4 2024
          </span>
          <Badge variant="outline" className="text-xs">
            National Sector Averages
          </Badge>
        </div>
        <div className="p-4">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={QUARTERLY_TRENDS}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="quarter" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 11 }} domain={[0, 15]} />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 11 }}
                domain={[60, 95]}
                unit="%"
              />
              <Tooltip content={<ChartTooltip />} />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 11 }}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="fallsRate"
                name="Falls Rate (%)"
                stroke={CHART_COLORS.red}
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="medicationHarm"
                name="Medication Harm (%)"
                stroke={CHART_COLORS.amber}
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="screening"
                name="Screening Completion (%)"
                stroke={CHART_COLORS.green}
                strokeWidth={2}
                strokeDasharray="5 3"
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* QoQ Change Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {qChangeData.map((d) => {
          const isImproving = d.lowerIsGood ? d.change < 0 : d.change > 0;
          return (
            <div key={d.indicator} className="kpi-card">
              <div
                className="kpi-card-accent"
                style={{
                  background: isImproving
                    ? CHART_COLORS.green
                    : CHART_COLORS.red,
                }}
              />
              <div className="px-4 py-3">
                <div
                  className="text-xs font-medium mb-1"
                  style={{ color: "oklch(0.5 0.022 252)" }}
                >
                  {d.indicator}
                </div>
                <div className="flex items-end gap-2">
                  <span
                    className="stat-number text-xl"
                    style={{
                      color: isImproving
                        ? CHART_COLORS.green
                        : CHART_COLORS.red,
                    }}
                  >
                    {d.change > 0 ? "+" : ""}
                    {d.change.toFixed(1)}%
                  </span>
                  {isImproving ? (
                    <TrendingUp
                      className="h-4 w-4 mb-0.5"
                      style={{ color: CHART_COLORS.green }}
                    />
                  ) : (
                    <TrendingDown
                      className="h-4 w-4 mb-0.5"
                      style={{ color: CHART_COLORS.red }}
                    />
                  )}
                </div>
                <div
                  className="text-xs mt-1"
                  style={{ color: "oklch(0.5 0.022 252)" }}
                >
                  Q3 → Q4 change
                </div>
                <div className="flex justify-between text-xs mt-1 font-mono-data">
                  <span>Q3: {d.q3}</span>
                  <span>Q4: {d.q4}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Q3 vs Q4 Comparison */}
      <div className="section-card">
        <div className="section-card-header">
          <span className="section-card-title">
            <BarChart2 className="h-4 w-4" />
            Quarter-on-Quarter Comparison — Q3 vs Q4 2024
          </span>
        </div>
        <div className="p-4">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={q3q4CompareData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="quarter" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip content={<ChartTooltip />} />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 11 }}
              />
              <Bar
                dataKey="fallsRate"
                name="Falls Rate"
                fill={CHART_COLORS.red}
                radius={[2, 2, 0, 0]}
              />
              <Bar
                dataKey="medicationHarm"
                name="Med Harm"
                fill={CHART_COLORS.amber}
                radius={[2, 2, 0, 0]}
              />
              <Bar
                dataKey="avgScore"
                name="Avg Score"
                fill={CHART_COLORS.navy}
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ─── TAB 6: PAY-FOR-IMPROVEMENT ANALYSIS ─────────────────────────────────────

function PayForImprovementTab({ currentQuarter }: { currentQuarter: string }) {
  const providerRows = useMemo(() => {
    return [...UNIFIED_PROVIDERS]
      .map((p) => {
        const rating = getProviderRatingForQuarter(p.id, currentQuarter);
        return {
          id: p.id,
          name: p.name,
          state: p.state,
          stars: rating.stars,
          score: rating.overallScore,
          eligibility: rating.eligibility,
        };
      })
      .sort((a, b) => b.stars - a.stars);
  }, [currentQuarter]);

  const eligibilityData = useMemo(() => {
    const highly = STATE_DATA.filter((s) => s.avgRating >= 4.5).reduce(
      (a, s) => a + s.eligibleCount,
      0,
    );
    const eligible = STATE_DATA.filter(
      (s) => s.avgRating >= 4.0 && s.avgRating < 4.5,
    ).reduce((a, s) => a + s.eligibleCount, 0);
    const totalEligible = STATE_DATA.reduce((a, s) => a + s.eligibleCount, 0);
    const notEligible =
      STATE_DATA.reduce((a, s) => a + s.providerCount, 0) - totalEligible;
    return [
      {
        name: "Highly Eligible (4.5★+)",
        value: highly,
        fill: CHART_COLORS.green,
      },
      { name: "Eligible (4.0–4.4★)", value: eligible, fill: CHART_COLORS.blue },
      {
        name: "Not Eligible (<4.0★)",
        value: notEligible,
        fill: CHART_COLORS.red,
      },
    ];
  }, []);

  const totalPool = STATE_DATA.reduce(
    (a, s) => a + s.eligibleCount * (s.avgRating >= 4.5 ? 180000 : 75000),
    0,
  );

  return (
    <div className="space-y-5 animate-slide-in-up">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Eligibility Donut */}
        <div className="section-card">
          <div className="section-card-header">
            <span className="section-card-title">
              <Shield className="h-4 w-4" />
              Incentive Eligibility Distribution
            </span>
          </div>
          <div className="p-4">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={eligibilityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={88}
                  dataKey="value"
                  label={({ value }) => `${value}`}
                  labelLine={false}
                >
                  {eligibilityData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 11 }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div
              className="text-center mt-2 p-2 rounded-sm"
              style={{ background: "oklch(0.965 0.012 145)" }}
            >
              <div
                className="stat-number text-lg"
                style={{ color: CHART_COLORS.green }}
              >
                ${(totalPool / 1_000_000).toFixed(2)}M
              </div>
              <div
                className="text-xs"
                style={{ color: "oklch(0.38 0.022 252)" }}
              >
                Total Estimated National Incentive Pool
              </div>
            </div>
          </div>
        </div>

        {/* Avg Improvement by State */}
        <div className="section-card">
          <div className="section-card-header">
            <span className="section-card-title">
              <TrendingUp className="h-4 w-4" />
              Average Improvement % by State
            </span>
          </div>
          <div className="p-4">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={[...STATE_DATA].sort(
                  (a, b) => b.improvementPct - a.improvementPct,
                )}
                layout="vertical"
                margin={{ left: 8, right: 24 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#E5E7EB"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  domain={[0, 25]}
                  tick={{ fontSize: 11 }}
                  unit="%"
                />
                <YAxis
                  type="category"
                  dataKey="state"
                  tick={{ fontSize: 12, fontWeight: 600 }}
                  width={36}
                />
                <Tooltip content={<ChartTooltip />} />
                <Bar
                  dataKey="improvementPct"
                  name="Improvement %"
                  radius={[0, 3, 3, 0]}
                >
                  {[...STATE_DATA]
                    .sort((a, b) => b.improvementPct - a.improvementPct)
                    .map((entry) => (
                      <Cell
                        key={entry.state}
                        fill={
                          entry.improvementPct >= 15
                            ? CHART_COLORS.green
                            : entry.improvementPct >= 10
                              ? CHART_COLORS.blue
                              : CHART_COLORS.amber
                        }
                      />
                    ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Regional Improvement Table */}
      <div className="section-card">
        <div className="section-card-header">
          <span className="section-card-title">
            <FileText className="h-4 w-4" />
            Regional Pay-for-Improvement Tracker
          </span>
        </div>
        <div className="p-0">
          <table className="gov-table">
            <thead>
              <tr>
                <th>State</th>
                <th>Providers</th>
                <th>Eligible</th>
                <th>Eligibility %</th>
                <th>Avg Improvement</th>
                <th>Est. Incentive Pool</th>
                <th>Trend</th>
              </tr>
            </thead>
            <tbody>
              {[...STATE_DATA]
                .sort((a, b) => b.eligibleCount - a.eligibleCount)
                .map((s) => {
                  const pool =
                    s.eligibleCount * (s.avgRating >= 4.5 ? 180000 : 75000);
                  const eligibilityPct = (
                    (s.eligibleCount / s.providerCount) *
                    100
                  ).toFixed(0);
                  return (
                    <tr key={s.state}>
                      <td className="font-semibold">
                        <span className="badge-navy">{s.state}</span>
                      </td>
                      <td className="font-mono-data">{s.providerCount}</td>
                      <td className="font-mono-data font-semibold">
                        {s.eligibleCount}
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="progress-mini" style={{ width: 60 }}>
                            <div
                              className="progress-mini-fill"
                              style={{
                                width: `${eligibilityPct}%`,
                                background:
                                  Number(eligibilityPct) >= 70
                                    ? CHART_COLORS.green
                                    : Number(eligibilityPct) >= 40
                                      ? CHART_COLORS.amber
                                      : CHART_COLORS.red,
                              }}
                            />
                          </div>
                          <span className="font-mono-data text-xs">
                            {eligibilityPct}%
                          </span>
                        </div>
                      </td>
                      <td>
                        <span
                          className="font-mono-data text-xs font-semibold"
                          style={{
                            color:
                              s.improvementPct >= 15
                                ? CHART_COLORS.green
                                : s.improvementPct >= 10
                                  ? CHART_COLORS.blue
                                  : CHART_COLORS.amber,
                          }}
                        >
                          +{s.improvementPct.toFixed(1)}%
                        </span>
                      </td>
                      <td className="font-mono-data">
                        {pool > 0 ? `${(pool / 1000).toFixed(0)}k` : "—"}
                      </td>
                      <td>
                        <TrendingUp
                          className="h-3.5 w-3.5"
                          style={{
                            color:
                              s.improvementPct >= 10
                                ? CHART_COLORS.green
                                : CHART_COLORS.amber,
                          }}
                        />
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Provider-Level Pay-for-Improvement Report */}
      <div className="section-card">
        <div className="section-card-header">
          <span className="section-card-title">
            <Shield className="h-4 w-4" />
            Provider-Level Pay-for-Improvement Report
          </span>
          <span
            className="flex items-center gap-1.5 text-xs font-medium"
            style={{ color: "oklch(0.45 0.14 145)" }}
          >
            <CheckCircle className="h-3.5 w-3.5" />
            All ratings sourced from central rating engine · {currentQuarter}
          </span>
        </div>
        <div className="p-0">
          <table className="gov-table">
            <thead>
              <tr>
                <th>Provider Name</th>
                <th>State</th>
                <th>Rating</th>
                <th>Score</th>
                <th>Eligibility</th>
                <th>Est. Payment</th>
              </tr>
            </thead>
            <tbody>
              {providerRows.map((row, idx) => (
                <tr
                  key={row.id}
                  className={idx % 2 === 0 ? "" : "bg-slate-50/60"}
                >
                  <td className="font-semibold text-sm">{row.name}</td>
                  <td>
                    <span className="badge-navy">{row.state}</span>
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      <StarRating value={row.stars} size="sm" />
                      <span className="font-mono-data text-xs text-slate-500">
                        {row.stars.toFixed(1)}
                      </span>
                    </div>
                  </td>
                  <td className="font-mono-data text-xs">
                    {row.score.toFixed(1)}
                  </td>
                  <td>
                    <IncentiveEligibilityBadge
                      eligible={row.eligibility.eligible}
                      tier={row.eligibility.tier}
                      size="sm"
                    />
                  </td>
                  <td
                    className="font-mono-data text-xs font-semibold"
                    style={{
                      color: row.eligibility.eligible
                        ? "oklch(0.45 0.14 145)"
                        : "oklch(0.5 0.03 252)",
                    }}
                  >
                    {row.eligibility.eligible
                      ? `$${(row.eligibility.estimatedPayment / 1000).toFixed(0)}k`
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── TAB: AI INSIGHTS ─────────────────────────────────────────────────────────

function AiInsightsTab({ currentQuarter }: { currentQuarter: string }) {
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [severityFilter, setSeverityFilter] = useState<string>("All");

  const insights = useMemo(
    () => generateEnhancedInsights(currentQuarter),
    [currentQuarter],
  );

  const filtered = useMemo(
    () =>
      insights.filter(
        (i) =>
          (categoryFilter === "All" || i.category === categoryFilter) &&
          (severityFilter === "All" || i.severity === severityFilter),
      ),
    [insights, categoryFilter, severityFilter],
  );

  const severityCounts = useMemo(
    () => ({
      critical: insights.filter((i) => i.severity === "critical").length,
      warning: insights.filter((i) => i.severity === "warning").length,
      info: insights.filter((i) => i.severity === "info").length,
      positive: insights.filter((i) => i.severity === "positive").length,
    }),
    [insights],
  );

  const severityStyle = {
    critical: {
      border: CHART_COLORS.red,
      bg: "oklch(0.97 0.015 25)",
      badge: "badge-red",
      label: "Critical",
    },
    warning: {
      border: CHART_COLORS.amber,
      bg: "oklch(0.97 0.015 65)",
      badge: "badge-amber",
      label: "Warning",
    },
    info: {
      border: CHART_COLORS.blue,
      bg: "oklch(0.97 0.015 230)",
      badge: "badge-blue",
      label: "Info",
    },
    positive: {
      border: CHART_COLORS.green,
      bg: "oklch(0.97 0.015 145)",
      badge: "badge-green",
      label: "Positive",
    },
  };

  const categoryBadge: Record<string, string> = {
    Safety: "badge-red",
    Preventive: "badge-blue",
    Equity: "badge-amber",
    Programs: "badge-green",
    Regional: "badge-navy",
  };

  return (
    <div className="space-y-4 animate-slide-in-up">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center w-9 h-9 rounded-sm"
            style={{ background: "oklch(0.22 0.07 258)" }}
          >
            <Activity className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3
              className="text-sm font-bold"
              style={{ color: "oklch(0.16 0.035 258)" }}
            >
              AI Policy Insight Engine
            </h3>
            <p
              className="text-xs mt-0.5"
              style={{ color: "oklch(0.5 0.022 252)" }}
            >
              {insights.length} insights generated from {currentQuarter} sector
              data · Confidence-weighted
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 text-xs"
          data-ocid="policy.ai_insights.download_button"
        >
          <Download className="h-3.5 w-3.5" />
          Export Report
        </Button>
      </div>

      {/* Severity summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {(
          [
            { key: "critical", label: "Critical", color: CHART_COLORS.red },
            { key: "warning", label: "Warning", color: CHART_COLORS.amber },
            { key: "info", label: "Informational", color: CHART_COLORS.blue },
            { key: "positive", label: "Positive", color: CHART_COLORS.green },
          ] as const
        ).map((s) => (
          <button
            type="button"
            key={s.key}
            onClick={() =>
              setSeverityFilter(
                severityFilter === s.label
                  ? "All"
                  : s.label.toLowerCase() === "informational"
                    ? "info"
                    : s.key,
              )
            }
            className="kpi-card text-left transition-all"
            style={{
              outline:
                severityFilter === s.key ? `2px solid ${s.color}` : "none",
            }}
            data-ocid="policy.ai_insights.severity.toggle"
          >
            <div className="kpi-card-accent" style={{ background: s.color }} />
            <div className="px-3 pt-3 pb-2">
              <div className="stat-number text-xl" style={{ color: s.color }}>
                {severityCounts[s.key]}
              </div>
              <div
                className="text-xs font-medium mt-0.5"
                style={{ color: "oklch(0.44 0.018 252)" }}
              >
                {s.label}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Filter bar */}
      <div className="section-card p-3 flex flex-wrap items-center gap-2">
        <span
          className="text-xs font-semibold"
          style={{ color: "oklch(0.44 0.018 252)" }}
        >
          Filter:
        </span>
        {["All", "Safety", "Preventive", "Equity", "Programs", "Regional"].map(
          (cat) => (
            <button
              type="button"
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className="px-2.5 py-1 rounded-sm text-xs font-semibold border transition-all"
              style={{
                background:
                  categoryFilter === cat ? CHART_COLORS.navy : "white",
                color:
                  categoryFilter === cat ? "white" : "oklch(0.44 0.018 252)",
                borderColor:
                  categoryFilter === cat
                    ? CHART_COLORS.navy
                    : "oklch(0.88 0.008 252)",
              }}
              data-ocid="policy.ai_insights.category.toggle"
            >
              {cat}
            </button>
          ),
        )}
        <span
          className="ml-auto text-xs"
          style={{ color: "oklch(0.5 0.022 252)" }}
        >
          {filtered.length} of {insights.length} insights
        </span>
      </div>

      {/* Insight cards */}
      <div className="space-y-3">
        {filtered.map((insight) => {
          const style = severityStyle[insight.severity];
          return (
            <div
              key={insight.id}
              className="section-card overflow-hidden card-hover"
              style={{ borderLeft: `4px solid ${style.border}` }}
              data-ocid="policy.ai_insights.insight.card"
            >
              <div className="px-4 py-3" style={{ background: style.bg }}>
                <div className="flex items-start justify-between gap-3 mb-1">
                  <h4
                    className="text-sm font-bold leading-snug flex-1"
                    style={{ color: "oklch(0.16 0.035 258)" }}
                  >
                    {insight.title}
                  </h4>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span
                      className={
                        categoryBadge[insight.category] ?? "badge-navy"
                      }
                      style={{ fontSize: "0.62rem" }}
                    >
                      {insight.category}
                    </span>
                    <span
                      className={style.badge}
                      style={{ fontSize: "0.62rem" }}
                    >
                      {style.label}
                    </span>
                  </div>
                </div>

                <p
                  className="text-xs leading-relaxed mb-3"
                  style={{ color: "oklch(0.38 0.022 252)" }}
                >
                  {insight.description}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Confidence */}
                  <div
                    className="p-2 rounded-sm"
                    style={{
                      background: "white",
                      border: "1px solid oklch(0.92 0.008 252)",
                    }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className="text-xs font-semibold"
                        style={{ color: "oklch(0.44 0.018 252)" }}
                      >
                        AI Confidence
                      </span>
                      <span
                        className="font-mono-data text-xs font-bold"
                        style={{ color: style.border }}
                      >
                        {insight.confidence}%
                      </span>
                    </div>
                    <div className="progress-mini">
                      <div
                        className="progress-mini-fill"
                        style={{
                          width: `${insight.confidence}%`,
                          background: style.border,
                        }}
                      />
                    </div>
                  </div>

                  {/* Affected regions */}
                  <div
                    className="p-2 rounded-sm"
                    style={{
                      background: "white",
                      border: "1px solid oklch(0.92 0.008 252)",
                    }}
                  >
                    <div
                      className="text-xs font-semibold mb-1"
                      style={{ color: "oklch(0.44 0.018 252)" }}
                    >
                      Affected Regions
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {insight.affectedRegions.map((r) => (
                        <span
                          key={r}
                          className="badge-navy"
                          style={{ fontSize: "0.62rem" }}
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Supporting data */}
                  <div
                    className="p-2 rounded-sm"
                    style={{
                      background: "white",
                      border: "1px solid oklch(0.92 0.008 252)",
                    }}
                  >
                    <div
                      className="text-xs font-semibold mb-1"
                      style={{ color: "oklch(0.44 0.018 252)" }}
                    >
                      Supporting Data
                    </div>
                    <div className="space-y-0.5">
                      {insight.dataPoints.slice(0, 2).map((dp) => (
                        <div
                          key={dp.label}
                          className="flex items-center justify-between"
                        >
                          <span
                            className="text-xs truncate"
                            style={{ color: "oklch(0.5 0.022 252)" }}
                          >
                            {dp.label}
                          </span>
                          <span className="font-mono-data text-xs font-bold ml-2 flex-shrink-0">
                            {dp.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recommended action */}
                <div
                  className="mt-3 flex items-start gap-2 p-2 rounded-sm"
                  style={{
                    background: "oklch(0.22 0.07 258)",
                  }}
                >
                  <Info className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-white opacity-80" />
                  <p className="text-xs text-white leading-relaxed">
                    <strong className="opacity-90">Recommended Action:</strong>{" "}
                    <span className="opacity-80">
                      {insight.recommendedAction}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div
            className="text-center py-10"
            style={{ color: "oklch(0.5 0.022 252)" }}
          >
            <Info className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No insights match the selected filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── TAB: SCENARIO ANALYSIS ───────────────────────────────────────────────────

interface ScenarioParams {
  screeningRate: number;
  staffHours: number;
  medHarmReduction: number;
  fallsProgram: "Low" | "Medium" | "High";
}

interface ScenarioResults {
  currentAvgRating: number;
  projectedAvgRating: number;
  currentHighRisk: number;
  projectedHighRisk: number;
  currentHospRate: number;
  projectedHospRate: number;
  currentEligible: number;
  projectedEligible: number;
  domainDeltas: { domain: string; current: number; projected: number }[];
  summary: string;
}

function runSimulation(params: ScenarioParams): ScenarioResults {
  const totalProviders = STATE_DATA.reduce((s, r) => s + r.providerCount, 0);
  const currentAvgRating =
    STATE_DATA.reduce((s, r) => s + r.avgRating * r.providerCount, 0) /
    totalProviders;
  const currentHighRisk = STATE_DATA.reduce((s, r) => s + r.highRiskCount, 0);
  const currentHospRate = 11.4;
  const currentEligible = STATE_DATA.reduce((s, r) => s + r.eligibleCount, 0);

  const baseScreening =
    STATE_DATA.reduce((s, r) => s + r.screeningPct * r.providerCount, 0) /
    totalProviders;
  const screeningDelta = (params.screeningRate - baseScreening) / 100;

  // Each 10pp screening increase → 0.15 star improvement
  const screeningStarGain = screeningDelta * 100 * 0.015;
  // Each 0.5 staff hour → 0.08 star improvement
  const staffStarGain = (params.staffHours / 0.5) * 0.08;
  // Each 10% medication harm reduction → 0.06 star
  const medStarGain = (params.medHarmReduction / 10) * 0.06;
  // Falls program
  const fallsGain =
    params.fallsProgram === "High"
      ? 0.18
      : params.fallsProgram === "Medium"
        ? 0.1
        : 0.04;

  const totalStarGain = Math.min(
    screeningStarGain + staffStarGain + medStarGain + fallsGain,
    0.8,
  );
  const projectedAvgRating = Math.min(currentAvgRating + totalStarGain, 5.0);

  // High risk reduction
  const riskReductionPct = (totalStarGain / 0.8) * 0.35;
  const projectedHighRisk = Math.max(
    Math.round(currentHighRisk * (1 - riskReductionPct)),
    0,
  );

  // Hospitalization rate
  const hospReduction =
    screeningDelta * 0.8 +
    (params.medHarmReduction / 50) * 0.5 +
    (params.staffHours / 5) * 0.3;
  const projectedHospRate = Math.max(
    currentHospRate * (1 - hospReduction * 0.12),
    8.5,
  );

  // Eligible providers
  const eligibleGain = Math.round(
    projectedHighRisk > currentHighRisk
      ? 0
      : (currentHighRisk - projectedHighRisk) * 0.6,
  );
  const projectedEligible = Math.min(
    currentEligible + eligibleGain,
    totalProviders,
  );

  // Domain scores
  const domainKeys = [
    "safety",
    "preventive",
    "quality",
    "staffing",
    "compliance",
    "experience",
  ] as const;
  const domainLabels = [
    "Safety",
    "Preventive",
    "Quality",
    "Staffing",
    "Compliance",
    "Experience",
  ];
  const domainGains = [
    Math.round((fallsGain + staffStarGain * 0.4) * 20),
    Math.round(screeningDelta * 100 * 0.2 + medStarGain * 25),
    Math.round(staffStarGain * 12 + medStarGain * 15),
    Math.round(params.staffHours * 6),
    Math.round(totalStarGain * 10),
    Math.round(screeningDelta * 100 * 0.12 + staffStarGain * 8),
  ];

  const avgDomainScore =
    domainKeys.reduce(
      (s, k) =>
        s +
        STATE_DATA.reduce(
          (a, r) => a + r.domainScores[k] * r.providerCount,
          0,
        ) /
          totalProviders,
      0,
    ) / 6;

  const domainDeltas = domainLabels.map((domain, i) => {
    const current = Math.round(avgDomainScore * (0.85 + i * 0.04));
    return {
      domain,
      current: Math.min(current, 100),
      projected: Math.min(current + domainGains[i], 100),
    };
  });

  const moversToMedium = currentHighRisk - projectedHighRisk;
  const summary = `Based on these changes, approximately ${moversToMedium} provider${moversToMedium !== 1 ? "s" : ""} would move from high-risk to medium-risk. National average rating would improve from ${currentAvgRating.toFixed(2)}★ to ${projectedAvgRating.toFixed(2)}★, and hospitalisation rates are projected to decrease from ${currentHospRate.toFixed(1)} to ${projectedHospRate.toFixed(1)} per 1,000 resident days.`;

  return {
    currentAvgRating,
    projectedAvgRating,
    currentHighRisk,
    projectedHighRisk,
    currentHospRate,
    projectedHospRate,
    currentEligible,
    projectedEligible,
    domainDeltas,
    summary,
  };
}

function ScenarioAnalysisTab() {
  const [params, setParams] = useState<ScenarioParams>({
    screeningRate: 82,
    staffHours: 2.5,
    medHarmReduction: 20,
    fallsProgram: "Medium",
  });
  const [results, setResults] = useState<ScenarioResults | null>(null);
  const [ran, setRan] = useState(false);

  const handleRun = () => {
    setResults(runSimulation(params));
    setRan(true);
  };

  const deltaColor = (delta: number, positiveIsGood = true) => {
    const good = positiveIsGood ? delta > 0 : delta < 0;
    return good
      ? CHART_COLORS.green
      : delta === 0
        ? CHART_COLORS.amber
        : CHART_COLORS.red;
  };

  return (
    <div className="space-y-5 animate-slide-in-up">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="flex items-center justify-center w-9 h-9 rounded-sm"
          style={{ background: "oklch(0.22 0.07 258)" }}
        >
          <TrendingUp className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3
            className="text-sm font-bold"
            style={{ color: "oklch(0.16 0.035 258)" }}
          >
            Scenario Analysis Tool
          </h3>
          <p
            className="text-xs mt-0.5"
            style={{ color: "oklch(0.5 0.022 252)" }}
          >
            Simulate policy changes and see projected outcomes
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Parameters Panel */}
        <div className="section-card">
          <div className="section-card-header">
            <span className="section-card-title">
              <Activity className="h-4 w-4" />
              Scenario Parameters
            </span>
          </div>
          <div className="p-4 space-y-5">
            {/* Screening Rate */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span
                  className="text-xs font-semibold"
                  style={{ color: "oklch(0.22 0.07 258)" }}
                >
                  Screening Completion Rate
                </span>
                <span
                  className="font-mono-data text-sm font-bold"
                  style={{ color: CHART_COLORS.green }}
                >
                  {params.screeningRate}%
                </span>
              </div>
              <input
                type="range"
                min={60}
                max={100}
                step={1}
                value={params.screeningRate}
                onChange={(e) =>
                  setParams((p) => ({
                    ...p,
                    screeningRate: Number(e.target.value),
                  }))
                }
                className="w-full accent-green-600 h-2 rounded cursor-pointer"
                data-ocid="policy.scenario.screening.input"
              />
              <div
                className="flex justify-between text-xs mt-1"
                style={{ color: "oklch(0.6 0.018 252)" }}
              >
                <span>60%</span>
                <span>Current: ~82%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Staff Hours */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span
                  className="text-xs font-semibold"
                  style={{ color: "oklch(0.22 0.07 258)" }}
                >
                  Additional Staff Hours / Resident / Day
                </span>
                <span
                  className="font-mono-data text-sm font-bold"
                  style={{ color: CHART_COLORS.blue }}
                >
                  +{params.staffHours.toFixed(1)}h
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={5}
                step={0.5}
                value={params.staffHours}
                onChange={(e) =>
                  setParams((p) => ({
                    ...p,
                    staffHours: Number(e.target.value),
                  }))
                }
                className="w-full accent-blue-600 h-2 rounded cursor-pointer"
                data-ocid="policy.scenario.staff.input"
              />
              <div
                className="flex justify-between text-xs mt-1"
                style={{ color: "oklch(0.6 0.018 252)" }}
              >
                <span>0h</span>
                <span>Current: ~2.5h</span>
                <span>5h</span>
              </div>
            </div>

            {/* Medication Harm Reduction */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span
                  className="text-xs font-semibold"
                  style={{ color: "oklch(0.22 0.07 258)" }}
                >
                  Medication Harm Reduction Target
                </span>
                <span
                  className="font-mono-data text-sm font-bold"
                  style={{ color: CHART_COLORS.amber }}
                >
                  {params.medHarmReduction}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={50}
                step={5}
                value={params.medHarmReduction}
                onChange={(e) =>
                  setParams((p) => ({
                    ...p,
                    medHarmReduction: Number(e.target.value),
                  }))
                }
                className="w-full accent-yellow-500 h-2 rounded cursor-pointer"
                data-ocid="policy.scenario.medharm.input"
              />
              <div
                className="flex justify-between text-xs mt-1"
                style={{ color: "oklch(0.6 0.018 252)" }}
              >
                <span>0%</span>
                <span>50%</span>
              </div>
            </div>

            {/* Falls Program */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span
                  className="text-xs font-semibold"
                  style={{ color: "oklch(0.22 0.07 258)" }}
                >
                  Falls Prevention Program Intensity
                </span>
              </div>
              <div className="flex gap-2">
                {(["Low", "Medium", "High"] as const).map((level) => (
                  <button
                    type="button"
                    key={level}
                    onClick={() =>
                      setParams((p) => ({ ...p, fallsProgram: level }))
                    }
                    className="flex-1 py-2 text-xs font-bold rounded-sm border transition-all"
                    style={{
                      background:
                        params.fallsProgram === level
                          ? level === "High"
                            ? CHART_COLORS.green
                            : level === "Medium"
                              ? CHART_COLORS.blue
                              : CHART_COLORS.amber
                          : "white",
                      color:
                        params.fallsProgram === level
                          ? "white"
                          : "oklch(0.44 0.018 252)",
                      borderColor:
                        params.fallsProgram === level
                          ? level === "High"
                            ? CHART_COLORS.green
                            : level === "Medium"
                              ? CHART_COLORS.blue
                              : CHART_COLORS.amber
                          : "oklch(0.88 0.008 252)",
                    }}
                    data-ocid="policy.scenario.falls.toggle"
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <Button
              className="w-full gap-2 font-semibold"
              onClick={handleRun}
              data-ocid="policy.scenario.run.primary_button"
              style={{
                background: CHART_COLORS.navy,
                color: "white",
              }}
            >
              <Activity className="h-4 w-4" />
              Run Simulation
            </Button>
          </div>
        </div>

        {/* Results Panel */}
        {results && ran ? (
          <div className="space-y-3">
            <div className="section-card">
              <div className="section-card-header">
                <span className="section-card-title">
                  <CheckCircle className="h-4 w-4" />
                  Projected Outcomes
                </span>
                <Badge
                  variant="outline"
                  className="text-xs text-green-700 border-green-300 bg-green-50"
                >
                  Simulation Complete
                </Badge>
              </div>
              <div className="p-3 grid grid-cols-2 gap-2">
                {[
                  {
                    label: "Avg Rating",
                    current: `${results.currentAvgRating.toFixed(2)}★`,
                    projected: `${results.projectedAvgRating.toFixed(2)}★`,
                    delta:
                      results.projectedAvgRating - results.currentAvgRating,
                    positiveIsGood: true,
                    fmt: (v: number) => `${v >= 0 ? "+" : ""}${v.toFixed(2)}★`,
                  },
                  {
                    label: "High-Risk Providers",
                    current: String(results.currentHighRisk),
                    projected: String(results.projectedHighRisk),
                    delta: results.projectedHighRisk - results.currentHighRisk,
                    positiveIsGood: false,
                    fmt: (v: number) => `${v >= 0 ? "+" : ""}${v}`,
                  },
                  {
                    label: "Hosp. Rate",
                    current: results.currentHospRate.toFixed(1),
                    projected: results.projectedHospRate.toFixed(1),
                    delta: results.projectedHospRate - results.currentHospRate,
                    positiveIsGood: false,
                    fmt: (v: number) =>
                      `${v >= 0 ? "+" : ""}${v.toFixed(2)}/1k`,
                  },
                  {
                    label: "Eligible Providers",
                    current: String(results.currentEligible),
                    projected: String(results.projectedEligible),
                    delta: results.projectedEligible - results.currentEligible,
                    positiveIsGood: true,
                    fmt: (v: number) => `${v >= 0 ? "+" : ""}${v}`,
                  },
                ].map((metric) => (
                  <div
                    key={metric.label}
                    className="p-2.5 rounded-sm border"
                    style={{ borderColor: "oklch(0.92 0.008 252)" }}
                  >
                    <div
                      className="text-xs mb-1"
                      style={{ color: "oklch(0.5 0.022 252)" }}
                    >
                      {metric.label}
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span
                          className="font-mono-data text-xs"
                          style={{ color: "oklch(0.5 0.022 252)" }}
                        >
                          {metric.current}
                        </span>
                        <span
                          className="mx-1.5 text-xs"
                          style={{ color: "oklch(0.6 0.018 252)" }}
                        >
                          →
                        </span>
                        <span
                          className="font-mono-data text-sm font-bold"
                          style={{ color: "oklch(0.16 0.035 258)" }}
                        >
                          {metric.projected}
                        </span>
                      </div>
                      <span
                        className="font-mono-data text-xs font-bold"
                        style={{
                          color: deltaColor(
                            metric.delta,
                            metric.positiveIsGood,
                          ),
                        }}
                      >
                        {metric.fmt(metric.delta)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Domain bar chart */}
            <div className="section-card">
              <div className="section-card-header">
                <span className="section-card-title">
                  <BarChart2 className="h-4 w-4" />
                  Domain Score Comparison
                </span>
              </div>
              <div className="p-3">
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={results.domainDeltas}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="domain" tick={{ fontSize: 9 }} />
                    <YAxis domain={[40, 100]} tick={{ fontSize: 10 }} />
                    <Tooltip content={<ChartTooltip />} />
                    <Legend
                      iconType="circle"
                      iconSize={7}
                      wrapperStyle={{ fontSize: 10 }}
                    />
                    <Bar
                      dataKey="current"
                      name="Current"
                      fill={CHART_COLORS.navy}
                      fillOpacity={0.6}
                      radius={[2, 2, 0, 0]}
                    />
                    <Bar
                      dataKey="projected"
                      name="Projected"
                      fill={CHART_COLORS.green}
                      radius={[2, 2, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Summary */}
            <div
              className="insight-card"
              style={{
                background: "oklch(0.965 0.018 230)",
                borderLeftColor: CHART_COLORS.blue,
                borderLeftWidth: 4,
              }}
            >
              <Info
                className="h-5 w-5 flex-shrink-0"
                style={{ color: CHART_COLORS.blue }}
              />
              <p
                className="text-xs leading-relaxed"
                style={{ color: "oklch(0.22 0.07 258)" }}
              >
                {results.summary}
              </p>
            </div>
          </div>
        ) : (
          <div
            className="section-card flex flex-col items-center justify-center py-16"
            style={{ color: "oklch(0.5 0.022 252)" }}
          >
            <TrendingUp className="h-10 w-10 mb-3 opacity-20" />
            <p className="text-sm font-medium">
              Configure parameters and run simulation
            </p>
            <p className="text-xs mt-1 opacity-70">
              Adjust sliders on the left, then click Run Simulation
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── EQUITY GAPS DATA ────────────────────────────────────────────────────────

const EQUITY_GAPS = [
  {
    group: "First Nations Elders",
    gapPp: -31.4,
    severity: "critical" as const,
    affectedResidents: 24800,
    trend: "stable",
    interventions: [
      "Co-designed culturally appropriate services",
      "First Nations navigator programs",
      "Community liaison officers",
    ],
  },
  {
    group: "Remote / Very Remote",
    gapPp: -24.7,
    severity: "critical" as const,
    affectedResidents: 18200,
    trend: "widening",
    interventions: [
      "Telehealth service expansion",
      "RFDS partnership programs",
      "Regional mobile care teams",
    ],
  },
  {
    group: "CALD Communities (Rural)",
    gapPp: -18.3,
    severity: "warning" as const,
    affectedResidents: 41600,
    trend: "stable",
    interventions: [
      "Multilingual care planning",
      "Interpreter service funding",
      "Cultural competency training",
    ],
  },
  {
    group: "Aged 85+ with Complex Needs",
    gapPp: -14.1,
    severity: "warning" as const,
    affectedResidents: 67400,
    trend: "improving",
    interventions: [
      "Enhanced care ratios for high-complexity residents",
      "Specialist dementia support programs",
    ],
  },
  {
    group: "LGBTIQ+ Community",
    gapPp: -11.2,
    severity: "warning" as const,
    affectedResidents: 12900,
    trend: "stable",
    interventions: [
      "LGBTIQ+ inclusive care training",
      "Safe space certification program",
    ],
  },
];

const EQUITY_TREND_DATA = [
  {
    quarter: "Q1",
    firstNations: -33.2,
    remote: -26.1,
    cald: -19.4,
    lgbtiq: -12.8,
  },
  {
    quarter: "Q2",
    firstNations: -32.5,
    remote: -25.8,
    cald: -19.1,
    lgbtiq: -12.2,
  },
  {
    quarter: "Q3",
    firstNations: -31.9,
    remote: -25.2,
    cald: -18.7,
    lgbtiq: -11.8,
  },
  {
    quarter: "Q4",
    firstNations: -31.4,
    remote: -24.7,
    cald: -18.3,
    lgbtiq: -11.2,
  },
];

const STATE_EQUITY_MATRIX = [
  {
    state: "NSW",
    firstNations: -22,
    remote: -15,
    cald: -12,
    lgbtiq: -8,
    aged85: -11,
  },
  {
    state: "VIC",
    firstNations: -18,
    remote: -8,
    cald: -9,
    lgbtiq: -6,
    aged85: -9,
  },
  {
    state: "QLD",
    firstNations: -28,
    remote: -22,
    cald: -16,
    lgbtiq: -12,
    aged85: -14,
  },
  {
    state: "SA",
    firstNations: -24,
    remote: -18,
    cald: -11,
    lgbtiq: -9,
    aged85: -13,
  },
  {
    state: "WA",
    firstNations: -31,
    remote: -29,
    cald: -14,
    lgbtiq: -10,
    aged85: -15,
  },
  {
    state: "TAS",
    firstNations: -20,
    remote: -21,
    cald: -8,
    lgbtiq: -7,
    aged85: -12,
  },
  {
    state: "NT",
    firstNations: -42,
    remote: -38,
    cald: -18,
    lgbtiq: -14,
    aged85: -20,
  },
  {
    state: "ACT",
    firstNations: -15,
    remote: -4,
    cald: -7,
    lgbtiq: -5,
    aged85: -8,
  },
];

function EquityGapsTab() {
  const equityIndex = Math.round(
    100 -
      Math.abs(
        EQUITY_GAPS.reduce((s, g) => s + g.gapPp, 0) / EQUITY_GAPS.length,
      ),
  );

  const gapColor = (gap: number) => {
    const abs = Math.abs(gap);
    if (abs >= 25) return CHART_COLORS.red;
    if (abs >= 15) return CHART_COLORS.amber;
    return CHART_COLORS.green;
  };

  return (
    <div className="space-y-5 animate-slide-in-up">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center w-9 h-9 rounded-sm"
            style={{ background: "oklch(0.22 0.07 258)" }}
          >
            <Users className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3
              className="text-sm font-bold"
              style={{ color: "oklch(0.16 0.035 258)" }}
            >
              Equity Gap Detection
            </h3>
            <p
              className="text-xs mt-0.5"
              style={{ color: "oklch(0.5 0.022 252)" }}
            >
              Identifying underserved populations and access disparities
            </p>
          </div>
        </div>
        {/* Equity Index KPI */}
        <div
          className="text-center px-5 py-3 rounded-sm border"
          style={{
            borderColor:
              equityIndex >= 80
                ? CHART_COLORS.green
                : equityIndex >= 70
                  ? CHART_COLORS.amber
                  : CHART_COLORS.red,
            background:
              equityIndex >= 80
                ? "oklch(0.97 0.015 145)"
                : "oklch(0.97 0.015 65)",
          }}
        >
          <div
            className="stat-number text-2xl font-bold"
            style={{
              color:
                equityIndex >= 80 ? CHART_COLORS.green : CHART_COLORS.amber,
            }}
          >
            {equityIndex}
          </div>
          <div
            className="text-xs font-semibold"
            style={{ color: "oklch(0.44 0.018 252)" }}
          >
            Equity Index / 100
          </div>
        </div>
      </div>

      {/* Top 5 Equity Gaps */}
      <div className="section-card">
        <div className="section-card-header">
          <span className="section-card-title">
            <AlertTriangle className="h-4 w-4" />
            Top 5 Equity Gaps — Ranked by Severity
          </span>
        </div>
        <div
          className="divide-y"
          style={{ borderColor: "oklch(0.92 0.008 252)" }}
        >
          {EQUITY_GAPS.map((gap, i) => (
            <div
              key={gap.group}
              className="px-4 py-3 flex items-start gap-4"
              data-ocid={`policy.equity.gap.item.${i + 1}`}
            >
              <div
                className="flex items-center justify-center w-7 h-7 rounded-full text-white text-xs font-bold flex-shrink-0"
                style={{ background: gapColor(gap.gapPp) }}
              >
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="text-sm font-semibold"
                    style={{ color: "oklch(0.16 0.035 258)" }}
                  >
                    {gap.group}
                  </span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span
                      className={
                        gap.severity === "critical"
                          ? "badge-red"
                          : "badge-amber"
                      }
                    >
                      {gap.severity}
                    </span>
                    <span
                      className="font-mono-data text-sm font-bold"
                      style={{ color: gapColor(gap.gapPp) }}
                    >
                      {gap.gapPp.toFixed(1)}pp
                    </span>
                  </div>
                </div>
                <div
                  className="text-xs mt-0.5"
                  style={{ color: "oklch(0.5 0.022 252)" }}
                >
                  Est. {gap.affectedResidents.toLocaleString()} affected
                  residents
                  {" · "}
                  <span
                    style={{
                      color:
                        gap.trend === "improving"
                          ? CHART_COLORS.green
                          : gap.trend === "widening"
                            ? CHART_COLORS.red
                            : CHART_COLORS.amber,
                    }}
                  >
                    {gap.trend === "improving"
                      ? "↗ Improving"
                      : gap.trend === "widening"
                        ? "↘ Widening"
                        : "→ Stable"}
                  </span>
                </div>
                <div className="progress-mini mt-1.5" style={{ height: 5 }}>
                  <div
                    className="progress-mini-fill"
                    style={{
                      width: `${Math.min((Math.abs(gap.gapPp) / 50) * 100, 100)}%`,
                      background: gapColor(gap.gapPp),
                    }}
                  />
                </div>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {gap.interventions.map((iv) => (
                    <span
                      key={iv}
                      className="text-xs px-1.5 py-0.5 rounded-sm border"
                      style={{
                        color: "oklch(0.38 0.022 252)",
                        borderColor: "oklch(0.88 0.008 252)",
                      }}
                    >
                      {iv}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Equity Trend Chart */}
        <div className="section-card">
          <div className="section-card-header">
            <span className="section-card-title">
              <TrendingUp className="h-4 w-4" />
              Equity Gap Trend Q1–Q4 2025
            </span>
          </div>
          <div className="p-4">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={EQUITY_TREND_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="quarter" tick={{ fontSize: 11 }} />
                <YAxis domain={[-45, 0]} tick={{ fontSize: 10 }} unit="pp" />
                <Tooltip content={<ChartTooltip />} />
                <Legend
                  iconType="circle"
                  iconSize={7}
                  wrapperStyle={{ fontSize: 10 }}
                />
                <Line
                  type="monotone"
                  dataKey="firstNations"
                  name="First Nations"
                  stroke={CHART_COLORS.red}
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="remote"
                  name="Remote"
                  stroke={CHART_COLORS.orange}
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="cald"
                  name="CALD Rural"
                  stroke={CHART_COLORS.amber}
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="lgbtiq"
                  name="LGBTIQ+"
                  stroke={CHART_COLORS.purple}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* State Equity Matrix */}
        <div className="section-card">
          <div className="section-card-header">
            <span className="section-card-title">
              <FileText className="h-4 w-4" />
              State Equity Matrix (Gap vs National, pp)
            </span>
          </div>
          <div className="p-0 overflow-auto">
            <table className="gov-table text-xs">
              <thead>
                <tr>
                  <th>State</th>
                  <th>1st Nations</th>
                  <th>Remote</th>
                  <th>CALD</th>
                  <th>LGBTIQ+</th>
                  <th>Aged 85+</th>
                </tr>
              </thead>
              <tbody>
                {STATE_EQUITY_MATRIX.map((row) => (
                  <tr key={row.state}>
                    <td className="font-semibold">
                      <span className="badge-navy">{row.state}</span>
                    </td>
                    {[
                      row.firstNations,
                      row.remote,
                      row.cald,
                      row.lgbtiq,
                      row.aged85,
                    ].map((val, colIdx) => (
                      <td
                        key={`${row.state}-${colIdx}`}
                        className="font-mono-data font-semibold text-center"
                        style={{
                          color:
                            Math.abs(val) >= 25
                              ? CHART_COLORS.red
                              : Math.abs(val) >= 15
                                ? CHART_COLORS.amber
                                : CHART_COLORS.green,
                          background:
                            Math.abs(val) >= 25
                              ? "oklch(0.97 0.015 25)"
                              : Math.abs(val) >= 15
                                ? "oklch(0.97 0.015 65)"
                                : "oklch(0.97 0.015 145)",
                        }}
                      >
                        {val}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── IMPACT TRACKING DATA ─────────────────────────────────────────────────────

const IMPACT_PROGRAMS = [
  {
    id: "quality-standards",
    name: "Quality Standards Reform",
    implementationDate: "Q2 2024",
    beforePeriod: "Q4 2023 – Q1 2024",
    afterPeriod: "Q3–Q4 2024",
    metrics: [
      {
        label: "Avg Provider Score",
        before: 68.4,
        after: 74.1,
        unit: "/100",
        positiveIsGood: true,
      },
      {
        label: "Compliance Rate",
        before: 71.2,
        after: 82.6,
        unit: "%",
        positiveIsGood: true,
      },
      {
        label: "High-Risk Providers",
        before: 9,
        after: 6,
        unit: "",
        positiveIsGood: false,
      },
      {
        label: "Resident Satisfaction",
        before: 74.8,
        after: 81.3,
        unit: "%",
        positiveIsGood: true,
      },
    ],
    trendData: [
      { period: "Q4 2023", score: 68.4 },
      { period: "Q1 2024", score: 69.1 },
      { period: "Q2 2024", score: 71.8 },
      { period: "Q3 2024", score: 73.4 },
      { period: "Q4 2024", score: 74.1 },
    ],
    implementationIdx: 1,
    summary:
      "Quality Standards Reform resulted in a 8.3% improvement in average provider scores and a 16.0% increase in compliance rates across the sector.",
  },
  {
    id: "dementia-strategy",
    name: "Dementia Care Strategy",
    implementationDate: "Q1 2024",
    beforePeriod: "Q3–Q4 2023",
    afterPeriod: "Q2–Q4 2024",
    metrics: [
      {
        label: "Dementia Screening Rate",
        before: 61.4,
        after: 78.9,
        unit: "%",
        positiveIsGood: true,
      },
      {
        label: "Behavioural Incidents",
        before: 12.4,
        after: 8.7,
        unit: "/1k",
        positiveIsGood: false,
      },
      {
        label: "Carer Training Rate",
        before: 42.0,
        after: 71.8,
        unit: "%",
        positiveIsGood: true,
      },
      {
        label: "Family Satisfaction",
        before: 68.3,
        after: 79.4,
        unit: "%",
        positiveIsGood: true,
      },
    ],
    trendData: [
      { period: "Q3 2023", score: 61.4 },
      { period: "Q4 2023", score: 62.8 },
      { period: "Q1 2024", score: 66.2 },
      { period: "Q2 2024", score: 72.1 },
      { period: "Q3 2024", score: 76.4 },
      { period: "Q4 2024", score: 78.9 },
    ],
    implementationIdx: 2,
    summary:
      "Dementia Care Strategy delivered a 28.5% improvement in screening rates and 29.8% reduction in behavioural incidents within 12 months.",
  },
  {
    id: "workforce-retention",
    name: "Workforce Retention Program",
    implementationDate: "Q2 2024",
    beforePeriod: "Q4 2023 – Q1 2024",
    afterPeriod: "Q3–Q4 2024",
    metrics: [
      {
        label: "Staff Turnover Rate",
        before: 38.4,
        after: 28.7,
        unit: "%",
        positiveIsGood: false,
      },
      {
        label: "Staffing Domain Score",
        before: 63.2,
        after: 71.4,
        unit: "/100",
        positiveIsGood: true,
      },
      {
        label: "Medication Harm Rate",
        before: 4.1,
        after: 3.3,
        unit: "%",
        positiveIsGood: false,
      },
      {
        label: "Falls Rate",
        before: 6.8,
        after: 5.6,
        unit: "/1k",
        positiveIsGood: false,
      },
    ],
    trendData: [
      { period: "Q4 2023", score: 63.2 },
      { period: "Q1 2024", score: 63.8 },
      { period: "Q2 2024", score: 66.1 },
      { period: "Q3 2024", score: 69.8 },
      { period: "Q4 2024", score: 71.4 },
    ],
    implementationIdx: 1,
    summary:
      "Workforce Retention Program reduced staff turnover by 25.3% and improved staffing domain scores by 13.0%, with measurable downstream effects on medication safety.",
  },
  {
    id: "regional-access",
    name: "Regional Access Fund",
    implementationDate: "Q3 2024",
    beforePeriod: "Q1–Q2 2024",
    afterPeriod: "Q4 2024",
    metrics: [
      {
        label: "Rural Access Gap",
        before: -24.7,
        after: -21.2,
        unit: "pp",
        positiveIsGood: true,
      },
      {
        label: "Rural Provider Score",
        before: 58.6,
        after: 63.1,
        unit: "/100",
        positiveIsGood: true,
      },
      {
        label: "Remote Screening Rate",
        before: 61.2,
        after: 68.4,
        unit: "%",
        positiveIsGood: true,
      },
      {
        label: "Remote High Risk %",
        before: 41.2,
        after: 36.8,
        unit: "%",
        positiveIsGood: false,
      },
    ],
    trendData: [
      { period: "Q1 2024", score: 58.6 },
      { period: "Q2 2024", score: 59.1 },
      { period: "Q3 2024", score: 60.8 },
      { period: "Q4 2024", score: 63.1 },
    ],
    implementationIdx: 2,
    summary:
      "Regional Access Fund improved rural provider scores by 7.7% and reduced the rural access gap by 3.5 percentage points, with remote screening rates up 11.7%.",
  },
];

const PROGRAMS_IMPACT_TABLE = [
  {
    program: "Quality Standards Reform",
    avgScore: "+8.3%",
    compliance: "+16.0%",
    screening: "+9.2%",
    falls: "\u22124.8%",
  },
  {
    program: "Dementia Care Strategy",
    avgScore: "+6.1%",
    compliance: "+10.4%",
    screening: "+28.5%",
    falls: "\u221218.3%",
  },
  {
    program: "Workforce Retention",
    avgScore: "+12.9%",
    compliance: "+7.8%",
    screening: "+5.4%",
    falls: "\u221217.6%",
  },
  {
    program: "Regional Access Fund",
    avgScore: "+7.7%",
    compliance: "+4.2%",
    screening: "+11.7%",
    falls: "\u22126.9%",
  },
];

function ImpactTrackingTab() {
  const [selectedProgram, setSelectedProgram] = useState(IMPACT_PROGRAMS[0].id);

  const program = IMPACT_PROGRAMS.find((p) => p.id === selectedProgram)!;

  const metricDelta = (before: number, after: number) =>
    (((after - before) / Math.abs(before)) * 100).toFixed(1);

  const metricColor = (
    before: number,
    after: number,
    positiveIsGood: boolean,
  ) => {
    const better = positiveIsGood ? after > before : after < before;
    return better ? CHART_COLORS.green : CHART_COLORS.red;
  };

  return (
    <div className="space-y-5 animate-slide-in-up">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="flex items-center justify-center w-9 h-9 rounded-sm"
          style={{ background: "oklch(0.22 0.07 258)" }}
        >
          <BarChart2 className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3
            className="text-sm font-bold"
            style={{ color: "oklch(0.16 0.035 258)" }}
          >
            Policy Impact Tracking
          </h3>
          <p
            className="text-xs mt-0.5"
            style={{ color: "oklch(0.5 0.022 252)" }}
          >
            Before &amp; after analysis of government policy programs
          </p>
        </div>
      </div>

      {/* Program Selector */}
      <div className="section-card p-3">
        <div
          className="text-xs font-semibold mb-2"
          style={{ color: "oklch(0.44 0.018 252)" }}
        >
          Select Policy Program
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {IMPACT_PROGRAMS.map((p) => (
            <button
              type="button"
              key={p.id}
              onClick={() => setSelectedProgram(p.id)}
              className="px-3 py-2 rounded-sm border text-xs font-semibold text-left transition-all"
              style={{
                background:
                  selectedProgram === p.id ? CHART_COLORS.navy : "white",
                color:
                  selectedProgram === p.id ? "white" : "oklch(0.44 0.018 252)",
                borderColor:
                  selectedProgram === p.id
                    ? CHART_COLORS.navy
                    : "oklch(0.88 0.008 252)",
              }}
              data-ocid="policy.impact.program.select"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Implementation Timeline */}
      <div className="section-card p-4">
        <div
          className="text-xs font-semibold mb-3"
          style={{ color: "oklch(0.44 0.018 252)" }}
        >
          Implementation Timeline
        </div>
        <div className="flex items-center gap-2">
          <span
            className="text-xs px-3 py-1.5 rounded-sm font-semibold"
            style={{
              background: "oklch(0.97 0.015 65)",
              color: CHART_COLORS.amber,
            }}
          >
            BEFORE: {program.beforePeriod}
          </span>
          <div
            className="flex-1 h-2 rounded-full relative"
            style={{ background: "oklch(0.92 0.008 252)" }}
          >
            <div
              className="absolute top-1/2 -translate-y-1/2 bg-white border-2 rounded-full w-4 h-4 flex items-center justify-center"
              style={{
                left: "40%",
                borderColor: CHART_COLORS.navy,
              }}
            />
          </div>
          <span
            className="text-xs px-2 py-1 rounded-sm font-bold"
            style={{
              background: "oklch(0.22 0.07 258)",
              color: "white",
              fontSize: "0.6rem",
            }}
          >
            {program.implementationDate}
          </span>
          <div
            className="flex-1 h-2 rounded-full"
            style={{ background: CHART_COLORS.navy, opacity: 0.3 }}
          />
          <span
            className="text-xs px-3 py-1.5 rounded-sm font-semibold"
            style={{
              background: "oklch(0.97 0.015 145)",
              color: CHART_COLORS.green,
            }}
          >
            AFTER: {program.afterPeriod}
          </span>
        </div>
      </div>

      {/* Before vs After Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {program.metrics.map((metric) => {
          const delta = Number(metricDelta(metric.before, metric.after));
          const color = metricColor(
            metric.before,
            metric.after,
            metric.positiveIsGood,
          );
          return (
            <div
              key={metric.label}
              className="section-card p-3 text-center"
              data-ocid="policy.impact.metric.card"
            >
              <div
                className="text-xs font-semibold mb-2"
                style={{ color: "oklch(0.44 0.018 252)" }}
              >
                {metric.label}
              </div>
              <div className="flex items-center justify-center gap-2 mb-1">
                <span
                  className="font-mono-data text-sm"
                  style={{ color: "oklch(0.5 0.022 252)" }}
                >
                  {metric.before.toFixed(1)}
                  {metric.unit}
                </span>
                <span
                  className="text-xs"
                  style={{ color: "oklch(0.6 0.018 252)" }}
                >
                  →
                </span>
                <span
                  className="font-mono-data text-base font-bold"
                  style={{ color: "oklch(0.16 0.035 258)" }}
                >
                  {metric.after.toFixed(1)}
                  {metric.unit}
                </span>
              </div>
              <div
                className="font-mono-data text-sm font-bold"
                style={{ color }}
              >
                {delta >= 0 ? "+" : ""}
                {delta}%
              </div>
            </div>
          );
        })}
      </div>

      {/* Trend Chart */}
      <div className="section-card">
        <div className="section-card-header">
          <span className="section-card-title">
            <TrendingUp className="h-4 w-4" />
            Outcome Trend — {program.name}
          </span>
          <Badge variant="outline" className="text-xs">
            Implementation: {program.implementationDate}
          </Badge>
        </div>
        <div className="p-4">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={program.trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="period" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip content={<ChartTooltip />} />
              <Line
                type="monotone"
                dataKey="score"
                name="Score"
                stroke={CHART_COLORS.navy}
                strokeWidth={2.5}
                dot={{ fill: CHART_COLORS.navy, r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
          <div
            className="text-xs mt-2 text-center"
            style={{ color: "oklch(0.5 0.022 252)" }}
          >
            ↑ Vertical dashed line indicates implementation date (
            {program.implementationDate})
          </div>
        </div>
      </div>

      {/* Impact Summary */}
      <div
        className="insight-card"
        style={{
          background: "oklch(0.965 0.018 145)",
          borderLeftColor: CHART_COLORS.green,
          borderLeftWidth: 4,
        }}
      >
        <CheckCircle
          className="h-5 w-5 flex-shrink-0"
          style={{ color: CHART_COLORS.green }}
        />
        <p
          className="text-xs leading-relaxed"
          style={{ color: "oklch(0.22 0.07 258)" }}
        >
          {program.summary}
        </p>
      </div>

      {/* Overall Programs Impact Table */}
      <div className="section-card">
        <div className="section-card-header">
          <span className="section-card-title">
            <FileText className="h-4 w-4" />
            All Programs — Impact Summary
          </span>
        </div>
        <div className="p-0">
          <table className="gov-table">
            <thead>
              <tr>
                <th>Program</th>
                <th>Avg Score</th>
                <th>Compliance</th>
                <th>Screening</th>
                <th>Falls Rate</th>
              </tr>
            </thead>
            <tbody>
              {PROGRAMS_IMPACT_TABLE.map((row) => (
                <tr key={row.program}>
                  <td className="font-semibold text-xs">{row.program}</td>
                  {[row.avgScore, row.compliance, row.screening, row.falls].map(
                    (val, colIdx) => {
                      const isPositive = val.startsWith("+");
                      return (
                        <td
                          key={`${row.program}-${colIdx}`}
                          className="font-mono-data font-bold text-center"
                          style={{
                            color: isPositive
                              ? CHART_COLORS.green
                              : CHART_COLORS.red,
                          }}
                        >
                          {val}
                        </td>
                      );
                    },
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── REGIONAL COMPARE TAB ─────────────────────────────────────────────────────

const COMPARE_METRICS = [
  { key: "avgScore", label: "Avg Score (0-100)", unit: "" },
  { key: "avgRating", label: "Avg Rating (Stars)", unit: "★" },
  { key: "screeningPct", label: "Screening Completion %", unit: "%" },
  { key: "fallsRate", label: "Falls Rate (per 1k)", unit: "" },
  { key: "medicationHarm", label: "Medication Harm %", unit: "%" },
  { key: "improvementPct", label: "Improvement %", unit: "%" },
] as const;

type CompareMetricKey = (typeof COMPARE_METRICS)[number]["key"];

function RegionalCompareTab() {
  const [selectedStates, setSelectedStates] = useState<string[]>([
    "NSW",
    "VIC",
    "QLD",
  ]);
  const [sortBy, setSortBy] = useState<string>("avgScore");
  const [primaryMetric, setPrimaryMetric] =
    useState<CompareMetricKey>("avgScore");

  const allStateKeys = STATE_DATA.map((s) => s.state);

  const toggleState = (state: string) => {
    setSelectedStates((prev) =>
      prev.includes(state)
        ? prev.length > 2
          ? prev.filter((s) => s !== state)
          : prev
        : prev.length < 5
          ? [...prev, state]
          : prev,
    );
  };

  const domains = [
    "Safety",
    "Preventive",
    "Quality",
    "Staffing",
    "Compliance",
    "Experience",
  ];
  const domainKeys = [
    "safety",
    "preventive",
    "quality",
    "staffing",
    "compliance",
    "experience",
  ] as const;

  const MULTI_COLORS = [
    CHART_COLORS.navy,
    CHART_COLORS.green,
    CHART_COLORS.red,
    CHART_COLORS.purple,
    CHART_COLORS.orange,
  ];

  const selectedData = STATE_DATA.filter((s) =>
    selectedStates.includes(s.state),
  );

  const barData = selectedData.map((s) => ({
    state: s.state,
    value: s[primaryMetric as keyof typeof s] as number,
  }));

  const radarData = domains.map((domain, i) => {
    const entry: Record<string, unknown> = { domain };
    for (const s of selectedData) {
      entry[s.state] = s.domainScores[domainKeys[i]];
    }
    return entry;
  });

  const tableData = [...selectedData].sort((a, b) => {
    const aVal = a[sortBy as keyof typeof a] as number;
    const bVal = b[sortBy as keyof typeof b] as number;
    return bVal - aVal;
  });

  const best = selectedData.reduce(
    (a, b) => (a.avgScore > b.avgScore ? a : b),
    selectedData[0],
  );
  const mostImproved = selectedData.reduce(
    (a, b) => (a.improvementPct > b.improvementPct ? a : b),
    selectedData[0],
  );
  const needsAttention = selectedData.reduce(
    (a, b) => (a.avgScore < b.avgScore ? a : b),
    selectedData[0],
  );

  const ALL_INDICATORS = [
    {
      key: "avgScore",
      label: "Score",
      render: (v: number) => `${v.toFixed(1)}`,
    },
    {
      key: "avgRating",
      label: "Rating",
      render: (v: number) => `${v.toFixed(1)}★`,
    },
    {
      key: "screeningPct",
      label: "Screening",
      render: (v: number) => `${v.toFixed(1)}%`,
    },
    {
      key: "fallsRate",
      label: "Falls",
      render: (v: number) => `${v.toFixed(1)}`,
    },
    {
      key: "medicationHarm",
      label: "Med Harm",
      render: (v: number) => `${v.toFixed(1)}%`,
    },
    {
      key: "improvementPct",
      label: "Improve",
      render: (v: number) => `+${v.toFixed(1)}%`,
    },
    {
      key: "highRiskCount",
      label: "High Risk",
      render: (v: number) => String(v),
    },
    {
      key: "eligibleCount",
      label: "Eligible",
      render: (v: number) => String(v),
    },
  ] as const;

  const getScoreTier = (key: string, val: number) => {
    if (key === "avgScore")
      return val >= 80 ? "green" : val >= 65 ? "amber" : "red";
    if (key === "avgRating")
      return val >= 4.0 ? "green" : val >= 3.0 ? "amber" : "red";
    if (key === "screeningPct")
      return val >= 85 ? "green" : val >= 75 ? "amber" : "red";
    if (key === "fallsRate")
      return val <= 5 ? "green" : val <= 7 ? "amber" : "red";
    if (key === "medicationHarm")
      return val <= 2.5 ? "green" : val <= 3.5 ? "amber" : "red";
    if (key === "improvementPct")
      return val >= 15 ? "green" : val >= 8 ? "amber" : "red";
    if (key === "highRiskCount")
      return val === 0 ? "green" : val === 1 ? "amber" : "red";
    if (key === "eligibleCount")
      return val >= 2 ? "green" : val >= 1 ? "amber" : "red";
    return "amber";
  };

  const tierBg: Record<string, string> = {
    green: "oklch(0.97 0.015 145)",
    amber: "oklch(0.97 0.015 65)",
    red: "oklch(0.97 0.015 25)",
  };
  const tierColor: Record<string, string> = {
    green: CHART_COLORS.green,
    amber: CHART_COLORS.amber,
    red: CHART_COLORS.red,
  };

  return (
    <div className="space-y-5 animate-slide-in-up">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="flex items-center justify-center w-9 h-9 rounded-sm"
          style={{ background: "oklch(0.22 0.07 258)" }}
        >
          <BarChart2 className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3
            className="text-sm font-bold"
            style={{ color: "oklch(0.16 0.035 258)" }}
          >
            Regional Comparison Engine
          </h3>
          <p
            className="text-xs mt-0.5"
            style={{ color: "oklch(0.5 0.022 252)" }}
          >
            Side-by-side comparison of regions across key indicators
          </p>
        </div>
      </div>

      {/* State Selector */}
      <div className="section-card">
        <div className="section-card-header">
          <span className="section-card-title">
            <MapPin className="h-4 w-4" />
            Select Regions to Compare (2–5)
          </span>
          <span className="text-xs" style={{ color: "oklch(0.5 0.022 252)" }}>
            {selectedStates.length}/5 selected
          </span>
        </div>
        <div className="p-3 flex flex-wrap gap-2">
          {allStateKeys.map((state) => {
            const isSelected = selectedStates.includes(state);
            const idx = selectedStates.indexOf(state);
            return (
              <button
                type="button"
                key={state}
                onClick={() => toggleState(state)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm border text-xs font-semibold transition-all"
                style={{
                  background: isSelected
                    ? (MULTI_COLORS[idx] ?? CHART_COLORS.navy)
                    : "white",
                  color: isSelected ? "white" : "oklch(0.44 0.018 252)",
                  borderColor: isSelected
                    ? (MULTI_COLORS[idx] ?? CHART_COLORS.navy)
                    : "oklch(0.88 0.008 252)",
                }}
                data-ocid="policy.compare.region.toggle"
              >
                {state}
                {isSelected && <span className="opacity-70">✓</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Summary Callout */}
      {selectedData.length >= 2 && (
        <div
          className="grid grid-cols-3 gap-3 p-3 rounded-sm border"
          style={{
            background: "oklch(0.965 0.018 230)",
            borderColor: "oklch(0.88 0.008 252)",
          }}
        >
          {[
            {
              label: "Best Performing",
              value: best?.state ?? "—",
              detail: `Score: ${best?.avgScore.toFixed(1)}`,
              color: CHART_COLORS.green,
            },
            {
              label: "Most Improved",
              value: mostImproved?.state ?? "—",
              detail: `+${mostImproved?.improvementPct.toFixed(1)}%`,
              color: CHART_COLORS.blue,
            },
            {
              label: "Needs Attention",
              value: needsAttention?.state ?? "—",
              detail: `Score: ${needsAttention?.avgScore.toFixed(1)}`,
              color: CHART_COLORS.red,
            },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <div
                className="text-xs"
                style={{ color: "oklch(0.5 0.022 252)" }}
              >
                {item.label}
              </div>
              <div
                className="font-bold text-lg font-mono-data"
                style={{ color: item.color }}
              >
                {item.value}
              </div>
              <div
                className="text-xs"
                style={{ color: "oklch(0.44 0.018 252)" }}
              >
                {item.detail}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Primary Metric Selector + Bar Chart */}
      <div className="section-card">
        <div className="section-card-header">
          <span className="section-card-title">
            <BarChart2 className="h-4 w-4" />
            Regional Comparison — Select Metric
          </span>
          <div className="flex gap-1 flex-wrap">
            {COMPARE_METRICS.slice(0, 4).map((m) => (
              <button
                type="button"
                key={m.key}
                onClick={() => setPrimaryMetric(m.key)}
                className="px-2 py-0.5 rounded text-xs font-semibold border transition-all"
                style={{
                  background:
                    primaryMetric === m.key ? CHART_COLORS.navy : "white",
                  color:
                    primaryMetric === m.key ? "white" : "oklch(0.44 0.018 252)",
                  borderColor:
                    primaryMetric === m.key
                      ? CHART_COLORS.navy
                      : "oklch(0.88 0.008 252)",
                  fontSize: "0.6rem",
                }}
                data-ocid="policy.compare.metric.select"
              >
                {m.label.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>
        <div className="p-4">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="state" tick={{ fontSize: 12, fontWeight: 600 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip content={<ChartTooltip />} />
              <Bar
                dataKey="value"
                name={
                  COMPARE_METRICS.find((m) => m.key === primaryMetric)?.label ??
                  primaryMetric
                }
                radius={[3, 3, 0, 0]}
              >
                {barData.map((entry) => (
                  <Cell
                    key={entry.state}
                    fill={
                      MULTI_COLORS[selectedStates.indexOf(entry.state)] ??
                      CHART_COLORS.navy
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Radar */}
        <div className="section-card">
          <div className="section-card-header">
            <span className="section-card-title">
              <Activity className="h-4 w-4" />
              Performance Radar — Domain Scores
            </span>
          </div>
          <div className="p-4">
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#E5E7EB" />
                <PolarAngleAxis dataKey="domain" tick={{ fontSize: 10 }} />
                <PolarRadiusAxis domain={[40, 100]} tick={{ fontSize: 9 }} />
                <Tooltip content={<ChartTooltip />} />
                <Legend
                  iconType="circle"
                  iconSize={7}
                  wrapperStyle={{ fontSize: 10 }}
                />
                {selectedStates.map((st, i) => (
                  <Radar
                    key={st}
                    name={st}
                    dataKey={st}
                    stroke={MULTI_COLORS[i] ?? CHART_COLORS.navy}
                    fill={MULTI_COLORS[i] ?? CHART_COLORS.navy}
                    fillOpacity={0.1}
                    strokeWidth={2}
                  />
                ))}
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Full Indicator Table */}
        <div className="section-card overflow-hidden">
          <div className="section-card-header">
            <span className="section-card-title">
              <FileText className="h-4 w-4" />
              All Indicators
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs border rounded-sm px-2 py-0.5"
              style={{ borderColor: "oklch(0.88 0.008 252)" }}
              data-ocid="policy.compare.sort.select"
            >
              {ALL_INDICATORS.map((ind) => (
                <option key={ind.key} value={ind.key}>
                  {ind.label}
                </option>
              ))}
            </select>
          </div>
          <div className="p-0 overflow-auto">
            <table className="gov-table text-xs">
              <thead>
                <tr>
                  <th>State</th>
                  {ALL_INDICATORS.map((ind) => (
                    <th key={ind.key}>{ind.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableData.map((s, rowIdx) => (
                  <tr
                    key={s.state}
                    data-ocid={`policy.compare.row.${rowIdx + 1}`}
                  >
                    <td>
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{
                            background:
                              MULTI_COLORS[selectedStates.indexOf(s.state)] ??
                              CHART_COLORS.navy,
                          }}
                        />
                        <span className="font-bold">{s.state}</span>
                      </div>
                    </td>
                    {ALL_INDICATORS.map((ind) => {
                      const val = s[ind.key as keyof typeof s] as number;
                      const tier = getScoreTier(ind.key, val);
                      return (
                        <td
                          key={ind.key}
                          className="font-mono-data font-semibold text-center"
                          style={{
                            background: tierBg[tier],
                            color: tierColor[tier],
                          }}
                        >
                          {ind.render(val)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PolicyAnalytics({
  currentQuarter = "Q4-2025",
}: { currentQuarter?: string }) {
  return (
    <div className="p-5 space-y-5 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div
              className="flex items-center justify-center w-8 h-8 rounded-sm"
              style={{ background: "oklch(0.22 0.07 258)" }}
            >
              <BarChart2 className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1
                className="text-base font-bold leading-none"
                style={{ color: "oklch(0.16 0.035 258)" }}
              >
                Policy Analyst Dashboard
              </h1>
              <p
                className="text-xs mt-0.5"
                style={{ color: "oklch(0.5 0.022 252)" }}
              >
                National Aged Care Intelligence Centre · Sector-Level Aggregated
                Analytics
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge-blue">Aggregated Data Only</span>
          <span className="badge-gray">Q4 2024</span>
        </div>
      </div>

      {/* Persistent KPI Bar */}
      <KpiBar />

      {/* Tabbed Dashboard */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList
          className="grid w-full text-xs h-auto p-0.5"
          style={{ gridTemplateColumns: "repeat(9, 1fr)" }}
          data-ocid="policy.tab"
        >
          {[
            { value: "overview", label: "National Overview", icon: Activity },
            { value: "ai-insights", label: "AI Insights", icon: Shield },
            { value: "scenario", label: "Scenario Analysis", icon: TrendingUp },
            { value: "equity-gaps", label: "Equity Gaps", icon: Users },
            { value: "impact", label: "Impact Tracking", icon: BarChart2 },
            { value: "compare", label: "Regional Compare", icon: MapPin },
            { value: "heatmaps", label: "Heatmaps", icon: MapPin },
            { value: "trends", label: "Trends", icon: TrendingUp },
            { value: "pfi", label: "Pay-for-Improvement", icon: Star },
          ].map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="flex flex-col items-center gap-0.5 py-2 px-1 text-center"
              style={{ fontSize: "0.65rem" }}
              data-ocid={`policy.${tab.value}.tab`}
            >
              <tab.icon className="h-3.5 w-3.5" />
              <span className="leading-tight">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview">
          <NationalOverviewTab />
        </TabsContent>
        <TabsContent value="ai-insights">
          <AiInsightsTab currentQuarter={currentQuarter} />
        </TabsContent>
        <TabsContent value="scenario">
          <ScenarioAnalysisTab />
        </TabsContent>
        <TabsContent value="equity-gaps">
          <EquityGapsTab />
        </TabsContent>
        <TabsContent value="impact">
          <ImpactTrackingTab />
        </TabsContent>
        <TabsContent value="compare">
          <RegionalCompareTab />
        </TabsContent>
        <TabsContent value="heatmaps">
          <RegionalHeatmapsTab />
        </TabsContent>
        <TabsContent value="trends">
          <TrendAnalysisTab />
        </TabsContent>
        <TabsContent value="pfi">
          <PayForImprovementTab currentQuarter={currentQuarter} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
