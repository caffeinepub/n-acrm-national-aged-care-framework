import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Bell,
  Building2,
  CheckCircle2,
  ChevronRight,
  Lightbulb,
  MapPin,
  Minus,
  Star,
  Table2,
  TrendingDown,
  TrendingUp,
  Users2,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ActivePage } from "../../App";
import { NATIONAL_TRENDS, RECENT_SUBMISSIONS } from "../../data/mockData";
import { useNationalOverviewStats } from "../../hooks/useQueries";

interface NationalOverviewProps {
  currentQuarter: string;
  setActivePage?: (page: ActivePage) => void;
}

function getQuarterMultiplier(quarter: string): number {
  if (quarter.startsWith("Q1")) return 0.88;
  if (quarter.startsWith("Q2")) return 0.93;
  if (quarter.startsWith("Q3")) return 0.97;
  return 1.0;
}

const STATES_DATA = [
  {
    code: "NSW",
    name: "New South Wales",
    providers: 847,
    avgRating: 3.9,
    risk: "low" as const,
  },
  {
    code: "VIC",
    name: "Victoria",
    providers: 712,
    avgRating: 3.7,
    risk: "medium" as const,
  },
  {
    code: "QLD",
    name: "Queensland",
    providers: 489,
    avgRating: 3.5,
    risk: "medium" as const,
  },
  {
    code: "WA",
    name: "Western Australia",
    providers: 287,
    avgRating: 4.1,
    risk: "low" as const,
  },
  {
    code: "SA",
    name: "South Australia",
    providers: 198,
    avgRating: 3.2,
    risk: "high" as const,
  },
  {
    code: "TAS",
    name: "Tasmania",
    providers: 89,
    avgRating: 3.8,
    risk: "low" as const,
  },
  {
    code: "NT",
    name: "Northern Territory",
    providers: 67,
    avgRating: 2.9,
    risk: "high" as const,
  },
  {
    code: "ACT",
    name: "Australian Capital Territory",
    providers: 54,
    avgRating: 4.2,
    risk: "low" as const,
  },
];

const CRITICAL_ALERTS = [
  {
    provider: "Northern Beaches Elder Support",
    state: "NSW",
    indicator: "Falls with Harm Rate",
    providerValue: 7.2,
    benchmark: 5.1,
    unit: "per 1,000 res-days",
    severity: "critical" as const,
    action: "Implement falls prevention protocol review within 30 days",
    daysAgo: 1,
  },
  {
    provider: "Sandy Bay Senior Care",
    state: "TAS",
    indicator: "Medication-Related Harm",
    providerValue: 4.8,
    benchmark: 3.2,
    unit: "incidents/month",
    severity: "critical" as const,
    action: "Commission medication safety audit and pharmacist review",
    daysAgo: 2,
  },
  {
    provider: "Casuarina Elder Care",
    state: "NT",
    indicator: "Pressure Injuries Stage 2–4",
    providerValue: 3.9,
    benchmark: 2.4,
    unit: "prevalence %",
    severity: "warning" as const,
    action: "Review wound care protocols and increase nursing rounds",
    daysAgo: 3,
  },
  {
    provider: "Glenelg Senior Services",
    state: "SA",
    indicator: "Screening Completion Rate",
    providerValue: 61.0,
    benchmark: 85.0,
    unit: "% complete",
    severity: "warning" as const,
    action: "Escalate screening compliance to facility manager",
    daysAgo: 4,
  },
  {
    provider: "Mount Isa Aged Services",
    state: "QLD",
    indicator: "Unplanned Hospital Transfers",
    providerValue: 14.2,
    benchmark: 9.8,
    unit: "per 1,000 res-days",
    severity: "critical" as const,
    action: "Review care planning and escalation procedures immediately",
    daysAgo: 5,
  },
];

const DOMAIN_SCORES = [
  { domain: "Safety", score: 78, weight: 30 },
  { domain: "Preventive", score: 81, weight: 20 },
  { domain: "Quality", score: 74, weight: 20 },
  { domain: "Staffing", score: 83, weight: 15 },
  { domain: "Compliance", score: 87, weight: 10 },
  { domain: "Experience", score: 76, weight: 5 },
];

const RADAR_DATA = DOMAIN_SCORES.map((d) => ({
  subject: d.domain,
  Score: d.score,
  Benchmark: 80,
}));

const PROVIDER_TABLE_DATA = [
  {
    name: "ACT Aged Services",
    state: "ACT",
    rating: 4.6,
    risk: "low",
    trend: "up",
    screening: 94,
    status: "Excellent",
  },
  {
    name: "Perth Metro Seniors Living",
    state: "WA",
    rating: 4.3,
    risk: "low",
    trend: "up",
    screening: 91,
    status: "Good",
  },
  {
    name: "Sunridge Aged Care",
    state: "NSW",
    rating: 4.1,
    risk: "low",
    trend: "stable",
    screening: 88,
    status: "Good",
  },
  {
    name: "Hobart Community Aged Care",
    state: "TAS",
    rating: 3.9,
    risk: "low",
    trend: "up",
    screening: 86,
    status: "Good",
  },
  {
    name: "Bayside Home Care Services",
    state: "VIC",
    rating: 3.7,
    risk: "medium",
    trend: "stable",
    screening: 79,
    status: "Satisfactory",
  },
  {
    name: "Hunter Valley Care Group",
    state: "NSW",
    rating: 3.5,
    risk: "medium",
    trend: "down",
    screening: 74,
    status: "Satisfactory",
  },
  {
    name: "Geelong Aged Care Network",
    state: "VIC",
    rating: 3.3,
    risk: "medium",
    trend: "stable",
    screening: 71,
    status: "Needs Attention",
  },
  {
    name: "Central Queensland Aged Care",
    state: "QLD",
    rating: 3.0,
    risk: "medium",
    trend: "down",
    screening: 68,
    status: "Needs Attention",
  },
  {
    name: "Adelaide Southern Care",
    state: "SA",
    rating: 2.6,
    risk: "high",
    trend: "down",
    screening: 62,
    status: "At Risk",
  },
  {
    name: "Casuarina Elder Care",
    state: "NT",
    rating: 2.2,
    risk: "high",
    trend: "down",
    screening: 54,
    status: "Critical",
  },
];

const PLATFORM_INSIGHTS = [
  {
    text: "Providers with screening completion below 75% show 2.3× higher hospitalization rates than the sector average.",
    icon: TrendingUp,
    color: "#3B82F6",
    bg: "#EFF6FF",
    border: "#3B82F6",
    tag: "Preventive Care",
  },
  {
    text: "NT and SA providers account for 68% of all critical performance alerts despite representing only 9.6% of total providers.",
    icon: MapPin,
    color: "#DC2626",
    bg: "#FEF2F2",
    border: "#DC2626",
    tag: "Regional Risk",
  },
  {
    text: "Facilities with registered nurse hours ≥ 0.6 per resident show 34% fewer pressure injuries than the sector average.",
    icon: Activity,
    color: "#16A34A",
    bg: "#F0FDF4",
    border: "#16A34A",
    tag: "Staffing",
  },
  {
    text: "Pay-for-Improvement eligibility has increased 18% since Q1 2024 — 621 providers now qualify for incentive payments.",
    icon: CheckCircle2,
    color: "#F59E0B",
    bg: "#FFFBEB",
    border: "#F59E0B",
    tag: "Policy",
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function renderStars(rating: number) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  const fullStars = "★".repeat(full);
  const emptyStars = "★".repeat(empty);
  return (
    <span className="star-rating">
      {fullStars && <span>{fullStars}</span>}
      {half && <span style={{ opacity: 0.6 }}>★</span>}
      {emptyStars && <span className="star-empty">{emptyStars}</span>}
    </span>
  );
}

function RiskBadge({ risk }: { risk: "low" | "medium" | "high" }) {
  if (risk === "low") return <span className="badge-green">Low Risk</span>;
  if (risk === "medium") return <span className="badge-amber">Moderate</span>;
  return <span className="badge-red">High Risk</span>;
}

function TrendIcon({ trend }: { trend: "up" | "down" | "stable" }) {
  if (trend === "up")
    return <TrendingUp className="w-3.5 h-3.5" style={{ color: "#16A34A" }} />;
  if (trend === "down")
    return (
      <TrendingDown className="w-3.5 h-3.5" style={{ color: "#DC2626" }} />
    );
  return <Minus className="w-3.5 h-3.5" style={{ color: "#9CA3AF" }} />;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  subtext,
  trend,
  icon: Icon,
  accentColor,
  accentBg,
}: {
  label: string;
  value: string;
  subtext: string;
  trend?: number;
  icon: React.ComponentType<{
    className?: string;
    style?: React.CSSProperties;
  }>;
  accentColor: string;
  accentBg: string;
}) {
  return (
    <div
      className="kpi-card group cursor-default"
      data-ocid={`kpi.${label.toLowerCase().replace(/\s+/g, "_")}.card`}
    >
      <div className="kpi-card-accent" style={{ background: accentColor }} />
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div
            className="w-10 h-10 rounded-sm flex items-center justify-center flex-shrink-0"
            style={{ background: accentBg }}
          >
            <Icon className="w-5 h-5" style={{ color: accentColor }} />
          </div>
          {trend !== undefined && (
            <div
              className="flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded"
              style={{
                background: trend >= 0 ? "#F0FDF4" : "#FEF2F2",
                color: trend >= 0 ? "#16A34A" : "#DC2626",
              }}
            >
              {trend >= 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {trend >= 0 ? "+" : ""}
              {trend}%
            </div>
          )}
        </div>
        <div
          className="text-3xl font-bold leading-none tracking-tight mb-1.5"
          style={{
            fontFamily: "'Geist Mono', monospace",
            color: "#111827",
          }}
        >
          {value}
        </div>
        <div
          className="text-xs font-bold uppercase tracking-wider mb-0.5"
          style={{ color: accentColor, letterSpacing: "0.06em" }}
        >
          {label}
        </div>
        <div className="text-xs" style={{ color: "#9CA3AF" }}>
          {subtext}
        </div>
      </div>
    </div>
  );
}

function NationalHealthBar({
  stats,
}: {
  stats:
    | {
        totalProviders: bigint | number;
        highRiskFlagged: bigint | number;
        avgSafetyScore: number;
        avgPreventiveScore: number;
      }
    | null
    | undefined;
}) {
  const avgScore = stats
    ? (stats.avgSafetyScore + stats.avgPreventiveScore) / 2
    : 76.5;
  const highRisk = stats ? Number(stats.highRiskFlagged) : 184;
  const total = stats ? Number(stats.totalProviders) : 2743;
  const improving = Math.round(total * 0.227);
  const incentiveEligible = Math.round(total * 0.498);

  let statusLabel = "STABLE";
  let statusColor = "#15803D";
  let statusBg = "#F0FDF4";
  let statusBorder = "#BBF7D0";
  let dotColor = "#4ade80";

  if (avgScore < 65) {
    statusLabel = "CRITICAL";
    statusColor = "#DC2626";
    statusBg = "#FEF2F2";
    statusBorder = "#FECACA";
    dotColor = "#f87171";
  } else if (avgScore < 75) {
    statusLabel = "WATCH";
    statusColor = "#D97706";
    statusBg = "#FFFBEB";
    statusBorder = "#FDE68A";
    dotColor = "#fbbf24";
  }

  const metrics = [
    {
      label: "National Avg Score",
      value: `${avgScore.toFixed(1)} / 100`,
      color: "#1E3A8A",
    },
    {
      label: "High-Risk Providers",
      value: highRisk.toLocaleString(),
      color: "#DC2626",
    },
    {
      label: "Improving Providers",
      value: improving.toLocaleString(),
      color: "#16A34A",
    },
    {
      label: "Incentive Eligible",
      value: incentiveEligible.toLocaleString(),
      color: "#3B82F6",
    },
  ];

  return (
    <div
      className="border rounded-sm px-4 py-3"
      style={{ background: "#F8FAFC", borderColor: "#E5E7EB" }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded text-xs font-bold border"
            style={{
              background: statusBg,
              color: statusColor,
              borderColor: statusBorder,
            }}
          >
            <span className="relative flex h-2 w-2">
              <span
                className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                style={{ background: dotColor }}
              />
              <span
                className="relative inline-flex rounded-full h-2 w-2"
                style={{ background: dotColor }}
              />
            </span>
            SYSTEM {statusLabel}
          </div>
          <span
            className="text-xs font-medium hidden sm:block"
            style={{ color: "#6B7280" }}
          >
            National Aged Care Intelligence Platform
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          {metrics.map(({ label, value, color }) => (
            <div key={label} className="flex flex-col gap-0">
              <span className="text-xs" style={{ color: "#9CA3AF" }}>
                {label}
              </span>
              <span
                className="text-sm font-bold font-mono-data"
                style={{ color }}
              >
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DomainScoreRow({
  domain,
  score,
  weight,
}: { domain: string; score: number; weight: number }) {
  const color = score >= 80 ? "#16A34A" : score >= 70 ? "#F59E0B" : "#DC2626";
  return (
    <div className="flex items-center gap-3">
      <span
        className="text-xs w-20 flex-shrink-0 font-medium"
        style={{ color: "#6B7280" }}
      >
        {domain}
      </span>
      <div
        className="flex-1 h-1.5 rounded-full overflow-hidden"
        style={{ background: "#F3F4F6" }}
      >
        <div
          className="h-full rounded-full transition-all duration-700 progress-animate"
          style={{ width: `${score}%`, background: color }}
        />
      </div>
      <span
        className="text-xs font-bold font-mono-data w-7 text-right"
        style={{ color }}
      >
        {score}
      </span>
      <span className="text-xs w-8 flex-shrink-0" style={{ color: "#9CA3AF" }}>
        {weight}%
      </span>
    </div>
  );
}

function StateRiskBox({ state }: { state: (typeof STATES_DATA)[0] }) {
  const s = {
    low: {
      border: "#16A34A",
      bg: "#F0FDF4",
      badge: "badge-green",
      label: "Low Risk",
    },
    medium: {
      border: "#F59E0B",
      bg: "#FFFBEB",
      badge: "badge-amber",
      label: "Moderate",
    },
    high: {
      border: "#DC2626",
      bg: "#FEF2F2",
      badge: "badge-red",
      label: "High Risk",
    },
  }[state.risk];

  return (
    <div
      className="p-3 rounded-sm card-hover cursor-default"
      style={{
        background: s.bg,
        borderLeft: `3px solid ${s.border}`,
        border: `1px solid ${s.border}22`,
        borderLeftWidth: "3px",
        borderLeftColor: s.border,
      }}
      title={`${state.name}: ${state.providers} providers, avg ${state.avgRating}★`}
    >
      <div className="flex items-start justify-between mb-1">
        <span
          className="text-lg font-bold"
          style={{ fontFamily: "'Geist Mono', monospace", color: "#1E3A8A" }}
        >
          {state.code}
        </span>
        <span className={s.badge}>{s.label}</span>
      </div>
      <div className="text-xs mb-2" style={{ color: "#6B7280" }}>
        {state.name}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs" style={{ color: "#9CA3AF" }}>
          {state.providers.toLocaleString()} providers
        </span>
        <div className="flex items-center gap-0.5">
          <Star
            className="w-3 h-3"
            style={{ color: "#F59E0B", fill: "#F59E0B" }}
          />
          <span className="text-xs font-bold font-mono-data">
            {state.avgRating.toFixed(1)}
          </span>
        </div>
      </div>
    </div>
  );
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="border rounded px-3 py-2 text-xs"
      style={{
        background: "#1E3A8A",
        borderColor: "#2d4fa0",
        color: "#fff",
        boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
      }}
    >
      <div className="font-semibold mb-1" style={{ color: "#F59E0B" }}>
        {label}
      </div>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: p.color }}
          />
          <span style={{ color: "#D1D5DB" }}>{p.name}:</span>
          <span className="font-bold font-mono-data">
            {typeof p.value === "number" ? p.value.toFixed(2) : p.value}
          </span>
        </div>
      ))}
    </div>
  );
}

function getSubmissionBadge(status: string) {
  if (status === "processed")
    return <span className="badge-green">Processed</span>;
  if (status === "validating")
    return <span className="badge-amber">Validating</span>;
  if (status === "failed") return <span className="badge-red">Failed</span>;
  return <span className="badge-gray">{status}</span>;
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function NationalOverview({
  currentQuarter,
  setActivePage,
}: NationalOverviewProps) {
  const { data: stats, isLoading } = useNationalOverviewStats(currentQuarter);
  const qm = getQuarterMultiplier(currentQuarter);

  const totalProviders = stats ? Number(stats.totalProviders) : 2743;
  const highRisk = stats ? Number(stats.highRiskFlagged) : 284;
  const avgScore = stats
    ? (stats.avgSafetyScore + stats.avgPreventiveScore) / 2
    : 76.5;
  const starRating = ((avgScore / 100) * 5).toFixed(1);
  const incentiveEligible = Math.round(totalProviders * 0.226 * qm) + 227;
  const highRiskAdjusted = Math.round(highRisk * (2 - qm));

  const trendData = NATIONAL_TRENDS.map((row) => ({
    quarter: row.quarter,
    "Safety Score": Number.parseFloat((row.safetyScore * qm).toFixed(1)),
    "Preventive Score": Number.parseFloat(
      (row.preventiveScore * qm).toFixed(1),
    ),
  }));

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={`sk-${i}`} className="skeleton h-32 w-full rounded-sm" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5 max-w-[1400px] mx-auto animate-fade-in">
      {/* ── Page Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: "#1E3A8A" }}
          >
            National Overview
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "#6B7280" }}>
            Sector-wide aged care performance intelligence — {currentQuarter}
          </p>
        </div>
        {setActivePage && (
          <Button
            size="sm"
            className="text-xs font-semibold gap-1.5 h-8"
            style={{
              background: "#1E3A8A",
              color: "#fff",
              borderRadius: "4px",
            }}
            onClick={() => setActivePage("regional_provider")}
            data-ocid="national_overview.regional_lookup.primary_button"
          >
            Regional Lookup <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>

      {/* ── National Health Status Bar ── */}
      <NationalHealthBar stats={stats} />

      {/* ── Section A: KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total Providers"
          value={totalProviders.toLocaleString()}
          subtext="Registered aged care services"
          trend={1.4}
          icon={Building2}
          accentColor="#1E3A8A"
          accentBg="#EFF6FF"
        />
        <KpiCard
          label="Average Rating"
          value={`${starRating} ★`}
          subtext="Sector-wide star rating"
          trend={0.8}
          icon={Star}
          accentColor="#F59E0B"
          accentBg="#FFFBEB"
        />
        <KpiCard
          label="High Risk Providers"
          value={highRiskAdjusted.toLocaleString()}
          subtext="Flagged for intervention"
          trend={-3.2}
          icon={AlertTriangle}
          accentColor="#DC2626"
          accentBg="#FEF2F2"
        />
        <KpiCard
          label="Incentive Eligible"
          value={incentiveEligible.toLocaleString()}
          subtext="Qualify for P4I payments"
          trend={18.0}
          icon={CheckCircle2}
          accentColor="#16A34A"
          accentBg="#F0FDF4"
        />
      </div>

      {/* ── Section B: Performance Trends + Radar ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Trend chart — 65% */}
        <div className="section-card lg:col-span-2">
          <div className="section-card-header">
            <h2 className="section-card-title">
              <TrendingUp className="w-4 h-4" style={{ color: "#3B82F6" }} />
              Performance Trends
            </h2>
            <span className="text-xs" style={{ color: "#9CA3AF" }}>
              Quarterly indicators
            </span>
          </div>
          <div className="p-4">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart
                data={trendData}
                margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="gradSafety" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradPrev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16A34A" stopOpacity={0.14} />
                    <stop offset="95%" stopColor="#16A34A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#F3F4F6"
                  vertical={false}
                />
                <XAxis
                  dataKey="quarter"
                  tick={{ fontSize: 10, fill: "#9CA3AF" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#9CA3AF" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 10, paddingTop: 8 }} />
                <Area
                  type="monotone"
                  dataKey="Safety Score"
                  stroke="#3B82F6"
                  strokeWidth={2.5}
                  fill="url(#gradSafety)"
                  dot={false}
                  isAnimationActive={true}
                />
                <Area
                  type="monotone"
                  dataKey="Preventive Score"
                  stroke="#16A34A"
                  strokeWidth={2.5}
                  fill="url(#gradPrev)"
                  dot={false}
                  isAnimationActive={true}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Radar chart — 35% */}
        <div className="section-card">
          <div className="section-card-header">
            <h2 className="section-card-title">
              <Activity className="w-4 h-4" style={{ color: "#16A34A" }} />
              Domain Performance
            </h2>
          </div>
          <div className="p-3">
            <ResponsiveContainer width="100%" height={160}>
              <RadarChart
                data={RADAR_DATA}
                margin={{ top: 4, right: 16, left: 16, bottom: 4 }}
              >
                <PolarGrid stroke="#E5E7EB" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fontSize: 9, fill: "#6B7280" }}
                />
                <Radar
                  name="Score"
                  dataKey="Score"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.18}
                  strokeWidth={2}
                  isAnimationActive={true}
                />
                <Radar
                  name="Benchmark"
                  dataKey="Benchmark"
                  stroke="#F59E0B"
                  fill="transparent"
                  strokeDasharray="4 2"
                  strokeWidth={1.5}
                  isAnimationActive={true}
                />
              </RadarChart>
            </ResponsiveContainer>
            <div className="mt-3 space-y-2">
              {DOMAIN_SCORES.map((d) => (
                <DomainScoreRow key={d.domain} {...d} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Section C: Regional Performance Heatmap ── */}
      <div className="section-card">
        <div className="section-card-header">
          <h2 className="section-card-title">
            <MapPin className="w-4 h-4" style={{ color: "#3B82F6" }} />
            Regional Performance
          </h2>
          <span className="text-xs" style={{ color: "#9CA3AF" }}>
            State &amp; Territory Overview
          </span>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {STATES_DATA.map((s) => (
              <StateRiskBox key={s.code} state={s} />
            ))}
          </div>
          <div className="mt-4">
            <ResponsiveContainer width="100%" height={120}>
              <BarChart
                data={STATES_DATA.map((s) => ({
                  state: s.code,
                  rating: s.avgRating,
                  providers: s.providers,
                }))}
                margin={{ top: 4, right: 4, left: -24, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#F3F4F6"
                  vertical={false}
                />
                <XAxis
                  dataKey="state"
                  tick={{ fontSize: 10, fill: "#9CA3AF" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 5]}
                  tick={{ fontSize: 10, fill: "#9CA3AF" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<ChartTooltip />} />
                <Bar
                  dataKey="rating"
                  name="Avg Rating"
                  fill="#3B82F6"
                  radius={[3, 3, 0, 0]}
                  maxBarSize={32}
                  isAnimationActive={true}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Section D: Provider Performance Table ── */}
      <div className="section-card">
        <div className="section-card-header">
          <h2 className="section-card-title">
            <Table2 className="w-4 h-4" style={{ color: "#1E3A8A" }} />
            Provider Performance Overview
          </h2>
          <span className="text-xs" style={{ color: "#9CA3AF" }}>
            Top 10 providers — {currentQuarter}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="gov-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Provider Name</th>
                <th>State</th>
                <th>Overall Rating</th>
                <th>Risk Level</th>
                <th>Trend</th>
                <th>Screening %</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {PROVIDER_TABLE_DATA.map((p, idx) => (
                <tr key={p.name} data-ocid={`provider_table.item.${idx + 1}`}>
                  <td
                    className="font-mono-data"
                    style={{ color: "#9CA3AF", width: "32px" }}
                  >
                    {idx + 1}
                  </td>
                  <td className="font-semibold" style={{ color: "#111827" }}>
                    {p.name}
                  </td>
                  <td>
                    <span className="badge-blue">{p.state}</span>
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      {renderStars(p.rating)}
                      <span
                        className="text-xs font-bold font-mono-data"
                        style={{ color: "#374151" }}
                      >
                        {p.rating.toFixed(1)}
                      </span>
                    </div>
                  </td>
                  <td>
                    <RiskBadge risk={p.risk as "low" | "medium" | "high"} />
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <TrendIcon trend={p.trend as "up" | "down" | "stable"} />
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="progress-mini" style={{ width: "56px" }}>
                        <div
                          className="progress-mini-fill"
                          style={{
                            width: `${p.screening}%`,
                            background:
                              p.screening >= 85
                                ? "#16A34A"
                                : p.screening >= 70
                                  ? "#F59E0B"
                                  : "#DC2626",
                          }}
                        />
                      </div>
                      <span
                        className="text-xs font-mono-data"
                        style={{ color: "#374151" }}
                      >
                        {p.screening}%
                      </span>
                    </div>
                  </td>
                  <td>
                    {p.status === "Excellent" && (
                      <span className="badge-green">{p.status}</span>
                    )}
                    {p.status === "Good" && (
                      <span className="badge-blue">{p.status}</span>
                    )}
                    {p.status === "Satisfactory" && (
                      <span className="badge-gray">{p.status}</span>
                    )}
                    {p.status === "Needs Attention" && (
                      <span className="badge-amber">{p.status}</span>
                    )}
                    {(p.status === "At Risk" || p.status === "Critical") && (
                      <span className="badge-red">{p.status}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Section E: Alerts + Insights ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Alerts Panel */}
        <div className="section-card flex flex-col">
          <div className="section-card-header flex-shrink-0">
            <h2 className="section-card-title">
              <Bell className="w-4 h-4" style={{ color: "#DC2626" }} />
              Performance Alerts
              <span
                className="ml-1 px-1.5 py-0.5 text-xs font-bold rounded"
                style={{ background: "#FEE2E2", color: "#DC2626" }}
              >
                {CRITICAL_ALERTS.length}
              </span>
            </h2>
            <span className="text-xs" style={{ color: "#9CA3AF" }}>
              Requires action
            </span>
          </div>
          <div className="flex-1 divide-y" style={{ borderColor: "#F3F4F6" }}>
            {CRITICAL_ALERTS.map((alert, i) => (
              <div
                key={alert.provider}
                className="px-4 py-3"
                style={{
                  borderLeft: `3px solid ${
                    alert.severity === "critical" ? "#DC2626" : "#F59E0B"
                  }`,
                }}
                data-ocid={`alerts.item.${i + 1}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div
                      className="text-xs font-bold"
                      style={{ color: "#111827" }}
                    >
                      {alert.provider}
                      <span
                        className="ml-1.5 font-normal text-xs"
                        style={{ color: "#9CA3AF" }}
                      >
                        · {alert.state}
                      </span>
                    </div>
                    <div
                      className="text-xs font-semibold mt-0.5"
                      style={{
                        color:
                          alert.severity === "critical" ? "#DC2626" : "#D97706",
                      }}
                    >
                      {alert.indicator}
                    </div>
                    <div
                      className="text-xs mt-0.5"
                      style={{ color: "#6B7280" }}
                    >
                      Value:{" "}
                      <strong className="font-mono-data">
                        {alert.providerValue}
                      </strong>{" "}
                      {alert.unit} (benchmark:{" "}
                      <strong className="font-mono-data">
                        {alert.benchmark}
                      </strong>
                      )
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    {alert.severity === "critical" ? (
                      <span className="badge-red">Critical</span>
                    ) : (
                      <span className="badge-amber">Warning</span>
                    )}
                    <span className="text-xs" style={{ color: "#9CA3AF" }}>
                      {alert.daysAgo}d ago
                    </span>
                  </div>
                </div>
                <div
                  className="mt-1.5 text-xs flex items-start gap-1"
                  style={{ color: "#3B82F6" }}
                >
                  <ChevronRight className="w-3 h-3 flex-shrink-0 mt-0.5" />
                  <span className="italic">{alert.action}</span>
                </div>
              </div>
            ))}
          </div>
          {setActivePage && (
            <div
              className="p-3 border-t flex-shrink-0"
              style={{ borderColor: "#E5E7EB" }}
            >
              <Button
                size="sm"
                variant="outline"
                className="w-full text-xs font-semibold gap-1.5"
                style={{
                  borderColor: "#1E3A8A",
                  color: "#1E3A8A",
                  borderRadius: "4px",
                }}
                onClick={() => setActivePage("high_risk_cohorts")}
                data-ocid="national_overview.view_alerts.button"
              >
                View All Alerts <ArrowUpRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}
        </div>

        {/* Insights Panel */}
        <div className="section-card flex flex-col">
          <div className="section-card-header flex-shrink-0">
            <h2 className="section-card-title">
              <Lightbulb className="w-4 h-4" style={{ color: "#F59E0B" }} />
              Platform Insights
            </h2>
            <span className="text-xs" style={{ color: "#9CA3AF" }}>
              AI-generated — {currentQuarter}
            </span>
          </div>
          <div className="flex-1 p-4 space-y-3">
            {PLATFORM_INSIGHTS.map((insight, i) => {
              const Icon = insight.icon;
              return (
                <div
                  key={insight.tag}
                  className="flex items-start gap-3 p-3 rounded-sm"
                  style={{
                    background: insight.bg,
                    borderLeft: `4px solid ${insight.border}`,
                    border: `1px solid ${insight.border}33`,
                    borderLeftWidth: "4px",
                    borderLeftColor: insight.border,
                  }}
                  data-ocid={`insights.item.${i + 1}`}
                >
                  <div
                    className="w-7 h-7 rounded-sm flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: `${insight.color}22` }}
                  >
                    <Icon
                      className="w-3.5 h-3.5"
                      style={{ color: insight.color }}
                    />
                  </div>
                  <div className="flex-1">
                    <p
                      className="text-xs leading-relaxed"
                      style={{ color: "#374151" }}
                    >
                      {insight.text}
                    </p>
                    <span
                      className="inline-block mt-1.5 px-1.5 py-0.5 text-xs font-semibold rounded-sm"
                      style={{
                        background: `${insight.color}18`,
                        color: insight.color,
                      }}
                    >
                      {insight.tag}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          {setActivePage && (
            <div
              className="p-3 border-t flex-shrink-0"
              style={{ borderColor: "#E5E7EB" }}
            >
              <Button
                size="sm"
                variant="outline"
                className="w-full text-xs font-semibold gap-1.5"
                style={{
                  borderColor: "#1E3A8A",
                  color: "#1E3A8A",
                  borderRadius: "4px",
                }}
                onClick={() => setActivePage("policy_analytics")}
                data-ocid="national_overview.view_insights.button"
              >
                Policy Intelligence Hub <ArrowUpRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* ── Recent Submissions ── */}
      <div className="section-card">
        <div className="section-card-header">
          <h2 className="section-card-title">
            <Users2 className="w-4 h-4" style={{ color: "#3B82F6" }} />
            Recent Data Submissions
          </h2>
          <span className="text-xs" style={{ color: "#9CA3AF" }}>
            Latest provider uploads
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="gov-table">
            <thead>
              <tr>
                <th>Submission ID</th>
                <th>Provider</th>
                <th>Quarter</th>
                <th>Type</th>
                <th className="text-right">Records</th>
                <th>Submitted</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {RECENT_SUBMISSIONS.map((sub) => (
                <tr key={sub.id}>
                  <td className="font-mono-data text-xs">{sub.id}</td>
                  <td className="font-semibold">{sub.provider}</td>
                  <td>{sub.quarter}</td>
                  <td>{sub.type}</td>
                  <td className="text-right font-mono-data">
                    {sub.records.toLocaleString()}
                  </td>
                  <td>{sub.submitted}</td>
                  <td>{getSubmissionBadge(sub.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div
        className="text-center py-3 text-xs border-t"
        style={{ color: "#9CA3AF", borderColor: "#E5E7EB" }}
      >
        &copy; {new Date().getFullYear()} Australian Government — Department of
        Health and Aged Care. Built with{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          className="underline hover:text-foreground transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          caffeine.ai
        </a>
      </div>
    </div>
  );
}
