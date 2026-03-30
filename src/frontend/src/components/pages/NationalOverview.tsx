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
    color: "#60A5FA",
    tag: "Preventive Care",
  },
  {
    text: "NT and SA providers account for 68% of all critical performance alerts despite representing only 9.6% of total providers.",
    icon: MapPin,
    color: "#F87171",
    tag: "Regional Risk",
  },
  {
    text: "Facilities with registered nurse hours ≥ 0.6 per resident show 34% fewer pressure injuries than the sector average.",
    icon: Activity,
    color: "#34D399",
    tag: "Staffing",
  },
  {
    text: "Pay-for-Improvement eligibility has increased 18% since Q1 2024 — 621 providers now qualify for incentive payments.",
    icon: CheckCircle2,
    color: "#FBBF24",
    tag: "Policy",
  },
];

// ── Dark theme styles
const PAGE_BG = {
  background: "linear-gradient(135deg, #0a0f1e 0%, #0d1528 50%, #0a1020 100%)",
  minHeight: "100%",
};
const GLASS_CARD = {
  background: "rgba(255,255,255,0.05)",
  backdropFilter: "blur(16px)",
  border: "1px solid rgba(255,255,255,0.10)",
  borderRadius: "10px",
};
const GLASS_CARD_HEADER = {
  background: "rgba(255,255,255,0.04)",
  borderBottom: "1px solid rgba(255,255,255,0.08)",
  padding: "12px 16px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
};

// ── Helpers
function renderStars(rating: number) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return (
    <span style={{ color: "#FBBF24", fontSize: "0.85rem" }}>
      {"★".repeat(full)}
      {half && <span style={{ opacity: 0.5 }}>★</span>}
      <span style={{ color: "rgba(255,255,255,0.15)" }}>
        {"★".repeat(empty)}
      </span>
    </span>
  );
}

function RiskBadge({ risk }: { risk: "low" | "medium" | "high" }) {
  if (risk === "low")
    return (
      <span
        style={{
          background: "rgba(52,211,153,0.2)",
          color: "#34D399",
          border: "1px solid rgba(52,211,153,0.3)",
          borderRadius: "4px",
          padding: "2px 8px",
          fontSize: "0.7rem",
          fontWeight: 600,
        }}
      >
        Low Risk
      </span>
    );
  if (risk === "medium")
    return (
      <span
        style={{
          background: "rgba(251,191,36,0.2)",
          color: "#FBBF24",
          border: "1px solid rgba(251,191,36,0.3)",
          borderRadius: "4px",
          padding: "2px 8px",
          fontSize: "0.7rem",
          fontWeight: 600,
        }}
      >
        Moderate
      </span>
    );
  return (
    <span
      style={{
        background: "rgba(248,113,113,0.2)",
        color: "#F87171",
        border: "1px solid rgba(248,113,113,0.3)",
        borderRadius: "4px",
        padding: "2px 8px",
        fontSize: "0.7rem",
        fontWeight: 600,
      }}
    >
      High Risk
    </span>
  );
}

function TrendIcon({ trend }: { trend: "up" | "down" | "stable" }) {
  if (trend === "up")
    return <TrendingUp className="w-3.5 h-3.5" style={{ color: "#34D399" }} />;
  if (trend === "down")
    return (
      <TrendingDown className="w-3.5 h-3.5" style={{ color: "#F87171" }} />
    );
  return (
    <Minus
      className="w-3.5 h-3.5"
      style={{ color: "rgba(255,255,255,0.35)" }}
    />
  );
}

function SectionTitle({
  icon: Icon,
  title,
  color = "#60A5FA",
  subtitle,
}: {
  icon: React.ComponentType<{
    className?: string;
    style?: React.CSSProperties;
  }>;
  title: string;
  color?: string;
  subtitle?: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <div
        style={{
          width: "3px",
          height: "18px",
          background: color,
          borderRadius: "2px",
          flexShrink: 0,
        }}
      />
      <Icon className="w-4 h-4" style={{ color }} />
      <span
        style={{
          fontSize: "0.82rem",
          fontWeight: 700,
          color: "#E2E8F0",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}
      >
        {title}
      </span>
      {subtitle && (
        <span
          style={{
            fontSize: "0.7rem",
            color: "rgba(255,255,255,0.35)",
            marginLeft: "4px",
          }}
        >
          {subtitle}
        </span>
      )}
    </div>
  );
}

function KpiCommandCard({
  label,
  value,
  subtext,
  trend,
  icon: Icon,
  accentColor,
  gradientFrom,
  gradientTo,
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
  gradientFrom: string;
  gradientTo: string;
}) {
  return (
    <div
      className="cmd-card"
      data-ocid={`kpi.${label.toLowerCase().replace(/\s+/g, "_")}.card`}
      style={{
        position: "relative",
        overflow: "hidden",
        padding: "18px",
        cursor: "default",
        transition: "all 0.3s ease",
      }}
    >
      {/* Gradient accent bottom bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "2px",
          background: `linear-gradient(90deg, ${gradientFrom}, ${gradientTo})`,
        }}
      />
      {/* Faint bg glow */}
      <div
        style={{
          position: "absolute",
          top: "-30px",
          right: "-20px",
          width: "80px",
          height: "80px",
          borderRadius: "50%",
          background: `${accentColor}18`,
          filter: "blur(20px)",
        }}
      />

      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: "12px",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "10px",
            background: `linear-gradient(135deg, ${gradientFrom}33, ${gradientTo}22)`,
            border: `1px solid ${accentColor}44`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon className="w-5 h-5" style={{ color: accentColor }} />
        </div>
        {trend !== undefined && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "3px",
              fontSize: "0.72rem",
              fontWeight: 700,
              padding: "3px 8px",
              borderRadius: "20px",
              background:
                trend >= 0 ? "rgba(52,211,153,0.15)" : "rgba(248,113,113,0.15)",
              color: trend >= 0 ? "#34D399" : "#F87171",
              border: `1px solid ${trend >= 0 ? "rgba(52,211,153,0.3)" : "rgba(248,113,113,0.3)"}`,
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
        style={{
          fontSize: "1.9rem",
          fontWeight: 800,
          color: "#F1F5F9",
          fontFamily: "'Geist Mono', monospace",
          lineHeight: 1,
          marginBottom: "6px",
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: "0.72rem",
          fontWeight: 700,
          color: accentColor,
          textTransform: "uppercase",
          letterSpacing: "0.07em",
          marginBottom: "3px",
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: "0.69rem", color: "rgba(255,255,255,0.38)" }}>
        {subtext}
      </div>
    </div>
  );
}

function DomainScoreRow({
  domain,
  score,
  weight,
}: { domain: string; score: number; weight: number }) {
  const color = score >= 80 ? "#34D399" : score >= 70 ? "#FBBF24" : "#F87171";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <span
        style={{
          fontSize: "0.7rem",
          width: "72px",
          flexShrink: 0,
          color: "rgba(255,255,255,0.55)",
          fontWeight: 500,
        }}
      >
        {domain}
      </span>
      <div
        style={{
          flex: 1,
          height: "5px",
          borderRadius: "3px",
          background: "rgba(255,255,255,0.08)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${score}%`,
            height: "100%",
            background: `linear-gradient(90deg, ${color}88, ${color})`,
            borderRadius: "3px",
            transition: "width 0.7s ease",
          }}
        />
      </div>
      <span
        style={{
          fontSize: "0.7rem",
          fontWeight: 700,
          color,
          fontFamily: "'Geist Mono', monospace",
          width: "26px",
          textAlign: "right",
        }}
      >
        {score}
      </span>
      <span
        style={{
          fontSize: "0.68rem",
          color: "rgba(255,255,255,0.25)",
          width: "28px",
          flexShrink: 0,
        }}
      >
        {weight}%
      </span>
    </div>
  );
}

function StateRiskBox({ state }: { state: (typeof STATES_DATA)[0] }) {
  const s = {
    low: {
      border: "rgba(52,211,153,0.5)",
      bg: "rgba(52,211,153,0.06)",
      color: "#34D399",
      label: "Low Risk",
    },
    medium: {
      border: "rgba(251,191,36,0.5)",
      bg: "rgba(251,191,36,0.06)",
      color: "#FBBF24",
      label: "Moderate",
    },
    high: {
      border: "rgba(248,113,113,0.5)",
      bg: "rgba(248,113,113,0.06)",
      color: "#F87171",
      label: "High Risk",
    },
  }[state.risk];

  return (
    <div
      style={{
        background: s.bg,
        borderLeft: `3px solid ${s.border}`,
        border: `1px solid ${s.border}`,
        borderLeftWidth: "3px",
        borderLeftColor: s.border,
        borderRadius: "8px",
        padding: "12px",
        cursor: "default",
        transition: "all 0.2s ease",
      }}
      title={`${state.name}: ${state.providers} providers, avg ${state.avgRating}★`}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: "4px",
        }}
      >
        <span
          style={{
            fontSize: "1.1rem",
            fontWeight: 800,
            color: "#E2E8F0",
            fontFamily: "'Geist Mono', monospace",
          }}
        >
          {state.code}
        </span>
        <span
          style={{
            background: `${s.color}22`,
            color: s.color,
            border: `1px solid ${s.color}44`,
            borderRadius: "4px",
            padding: "1px 7px",
            fontSize: "0.65rem",
            fontWeight: 600,
          }}
        >
          {s.label}
        </span>
      </div>
      <div
        style={{
          fontSize: "0.68rem",
          color: "rgba(255,255,255,0.4)",
          marginBottom: "8px",
        }}
      >
        {state.name}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.3)" }}>
          {state.providers.toLocaleString()} providers
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
          <Star
            className="w-3 h-3"
            style={{ color: "#FBBF24", fill: "#FBBF24" }}
          />
          <span
            style={{
              fontSize: "0.72rem",
              fontWeight: 700,
              color: "#FBBF24",
              fontFamily: "'Geist Mono', monospace",
            }}
          >
            {state.avgRating.toFixed(1)}
          </span>
        </div>
      </div>
    </div>
  );
}

function DarkChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "rgba(15,23,42,0.95)",
        border: "1px solid rgba(99,179,237,0.3)",
        borderRadius: "8px",
        padding: "10px 14px",
        fontSize: "0.75rem",
        boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
      }}
    >
      <div style={{ fontWeight: 700, color: "#FBBF24", marginBottom: "6px" }}>
        {label}
      </div>
      {payload.map((p: any) => (
        <div
          key={p.name}
          style={{ display: "flex", alignItems: "center", gap: "8px" }}
        >
          <span
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: p.color,
              flexShrink: 0,
            }}
          />
          <span style={{ color: "rgba(255,255,255,0.6)" }}>{p.name}:</span>
          <span
            style={{
              fontWeight: 700,
              color: "#E2E8F0",
              fontFamily: "'Geist Mono', monospace",
            }}
          >
            {typeof p.value === "number" ? p.value.toFixed(2) : p.value}
          </span>
        </div>
      ))}
    </div>
  );
}

function getStatusBadge(status: string) {
  const map: Record<string, { bg: string; color: string }> = {
    Excellent: { bg: "rgba(52,211,153,0.15)", color: "#34D399" },
    Good: { bg: "rgba(96,165,250,0.15)", color: "#60A5FA" },
    Satisfactory: {
      bg: "rgba(255,255,255,0.08)",
      color: "rgba(255,255,255,0.5)",
    },
    "Needs Attention": { bg: "rgba(251,191,36,0.15)", color: "#FBBF24" },
    "At Risk": { bg: "rgba(248,113,113,0.15)", color: "#F87171" },
    Critical: { bg: "rgba(248,113,113,0.25)", color: "#F87171" },
  };
  const s = map[status] ?? map.Satisfactory;
  return (
    <span
      style={{
        ...s,
        border: `1px solid ${s.color}44`,
        borderRadius: "4px",
        padding: "2px 8px",
        fontSize: "0.7rem",
        fontWeight: 600,
      }}
    >
      {status}
    </span>
  );
}

function getSubmissionBadge(status: string) {
  if (status === "processed")
    return (
      <span
        style={{
          background: "rgba(52,211,153,0.15)",
          color: "#34D399",
          border: "1px solid rgba(52,211,153,0.3)",
          borderRadius: "4px",
          padding: "2px 8px",
          fontSize: "0.7rem",
          fontWeight: 600,
        }}
      >
        Processed
      </span>
    );
  if (status === "validating")
    return (
      <span
        style={{
          background: "rgba(251,191,36,0.15)",
          color: "#FBBF24",
          border: "1px solid rgba(251,191,36,0.3)",
          borderRadius: "4px",
          padding: "2px 8px",
          fontSize: "0.7rem",
          fontWeight: 600,
        }}
      >
        Validating
      </span>
    );
  if (status === "failed")
    return (
      <span
        style={{
          background: "rgba(248,113,113,0.15)",
          color: "#F87171",
          border: "1px solid rgba(248,113,113,0.3)",
          borderRadius: "4px",
          padding: "2px 8px",
          fontSize: "0.7rem",
          fontWeight: 600,
        }}
      >
        Failed
      </span>
    );
  return (
    <span
      style={{
        background: "rgba(255,255,255,0.08)",
        color: "rgba(255,255,255,0.5)",
        borderRadius: "4px",
        padding: "2px 8px",
        fontSize: "0.7rem",
        fontWeight: 600,
      }}
    >
      {status}
    </span>
  );
}

// Dark table styles
const TABLE_HEADER_STYLE: React.CSSProperties = {
  padding: "10px 12px",
  fontSize: "0.65rem",
  fontWeight: 700,
  color: "rgba(255,255,255,0.4)",
  textTransform: "uppercase",
  letterSpacing: "0.07em",
  textAlign: "left",
  borderBottom: "1px solid rgba(255,255,255,0.08)",
  whiteSpace: "nowrap",
  background: "rgba(255,255,255,0.03)",
};
const TABLE_CELL_STYLE: React.CSSProperties = {
  padding: "9px 12px",
  fontSize: "0.75rem",
  color: "rgba(255,255,255,0.75)",
  borderBottom: "1px solid rgba(255,255,255,0.05)",
};

// ── Main Component
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
      <div style={PAGE_BG} className="p-6 space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton
            key={`sk-${i}`}
            className="h-32 w-full"
            style={{ background: "rgba(255,255,255,0.05)" }}
          />
        ))}
      </div>
    );
  }

  return (
    <div style={PAGE_BG}>
      {/* ── Hero Command Header ── */}
      <div
        style={{
          background:
            "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)",
          borderBottom: "1px solid rgba(99,179,237,0.2)",
          padding: "20px 28px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Dot-grid overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.15,
            backgroundImage:
              "radial-gradient(rgba(99,179,237,0.6) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            pointerEvents: "none",
          }}
        />
        {/* Glow accent */}
        <div
          style={{
            position: "absolute",
            top: "-40px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "600px",
            height: "120px",
            background:
              "radial-gradient(ellipse, rgba(99,102,241,0.25) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "6px",
              }}
            >
              <div
                className="animate-pulse-glow"
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "#34D399",
                }}
              />
              <span
                style={{
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  color: "rgba(99,179,237,0.8)",
                  textTransform: "uppercase",
                  letterSpacing: "0.18em",
                }}
              >
                NATIONAL COMMAND CENTER
              </span>
            </div>
            <h1
              style={{
                fontSize: "1.6rem",
                fontWeight: 900,
                color: "#F1F5F9",
                letterSpacing: "-0.01em",
                lineHeight: 1,
                marginBottom: "4px",
              }}
            >
              National Overview
            </h1>
            <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.45)" }}>
              Sector-wide aged care performance intelligence — {currentQuarter}
            </p>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            {/* System status */}
            <div
              style={{
                background: "rgba(52,211,153,0.12)",
                border: "1px solid rgba(52,211,153,0.3)",
                borderRadius: "8px",
                padding: "8px 14px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <div style={{ position: "relative" }}>
                <span
                  className="animate-ping"
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "50%",
                    background: "#34D399",
                    opacity: 0.6,
                  }}
                />
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "#34D399",
                    display: "block",
                    position: "relative",
                  }}
                />
              </div>
              <span
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  color: "#34D399",
                }}
              >
                SYSTEM OPERATIONAL
              </span>
            </div>

            {/* Alert count badge */}
            <div
              style={{
                background: "rgba(248,113,113,0.12)",
                border: "1px solid rgba(248,113,113,0.3)",
                borderRadius: "8px",
                padding: "8px 14px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <Bell className="w-3.5 h-3.5" style={{ color: "#F87171" }} />
              <span
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  color: "#F87171",
                }}
              >
                {CRITICAL_ALERTS.length} Active Alerts
              </span>
            </div>

            {setActivePage && (
              <Button
                size="sm"
                onClick={() => setActivePage("regional_provider")}
                data-ocid="national_overview.regional_lookup.primary_button"
                style={{
                  background: "linear-gradient(135deg, #3B82F6, #6366F1)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  height: "36px",
                  gap: "6px",
                }}
              >
                Regional Lookup <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>
      </div>

      <div
        className="animate-fade-in"
        style={{ padding: "24px 28px", maxWidth: "1400px", margin: "0 auto" }}
      >
        {/* ── KPI Command Cards ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <KpiCommandCard
            label="Total Providers"
            value={totalProviders.toLocaleString()}
            subtext="Registered aged care services"
            trend={1.4}
            icon={Building2}
            accentColor="#60A5FA"
            gradientFrom="#3B82F6"
            gradientTo="#6366F1"
          />
          <KpiCommandCard
            label="Average Rating"
            value={`${starRating} ★`}
            subtext="Sector-wide star rating"
            trend={0.8}
            icon={Star}
            accentColor="#FBBF24"
            gradientFrom="#F59E0B"
            gradientTo="#EF4444"
          />
          <KpiCommandCard
            label="High Risk Providers"
            value={highRiskAdjusted.toLocaleString()}
            subtext="Flagged for intervention"
            trend={-3.2}
            icon={AlertTriangle}
            accentColor="#F87171"
            gradientFrom="#EF4444"
            gradientTo="#DC2626"
          />
          <KpiCommandCard
            label="Incentive Eligible"
            value={incentiveEligible.toLocaleString()}
            subtext="Qualify for P4I payments"
            trend={18.0}
            icon={CheckCircle2}
            accentColor="#34D399"
            gradientFrom="#10B981"
            gradientTo="#059669"
          />
        </div>

        {/* ── Performance Trends + Radar ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          {/* Trend chart */}
          <div style={GLASS_CARD}>
            <div style={GLASS_CARD_HEADER}>
              <SectionTitle
                icon={TrendingUp}
                title="Performance Trends"
                color="#60A5FA"
                subtitle="Quarterly indicators"
              />
            </div>
            <div style={{ padding: "16px" }}>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart
                  data={trendData}
                  margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="gradSafetyDark"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient
                      id="gradPrevDark"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#34D399"
                        stopOpacity={0.25}
                      />
                      <stop offset="95%" stopColor="#34D399" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.06)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="quarter"
                    tick={{ fontSize: 10, fill: "rgba(255,255,255,0.35)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "rgba(255,255,255,0.35)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<DarkChartTooltip />} />
                  <Legend
                    wrapperStyle={{
                      fontSize: 10,
                      paddingTop: 8,
                      color: "rgba(255,255,255,0.5)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="Safety Score"
                    stroke="#3B82F6"
                    strokeWidth={2.5}
                    fill="url(#gradSafetyDark)"
                    dot={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="Preventive Score"
                    stroke="#34D399"
                    strokeWidth={2.5}
                    fill="url(#gradPrevDark)"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Radar chart */}
          <div style={GLASS_CARD}>
            <div style={GLASS_CARD_HEADER}>
              <SectionTitle
                icon={Activity}
                title="Domain Performance"
                color="#34D399"
              />
            </div>
            <div style={{ padding: "12px" }}>
              <ResponsiveContainer width="100%" height={155}>
                <RadarChart
                  data={RADAR_DATA}
                  margin={{ top: 4, right: 16, left: 16, bottom: 4 }}
                >
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fontSize: 9, fill: "rgba(255,255,255,0.45)" }}
                  />
                  <Radar
                    name="Score"
                    dataKey="Score"
                    stroke="#3B82F6"
                    fill="#3B82F6"
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                  <Radar
                    name="Benchmark"
                    dataKey="Benchmark"
                    stroke="#FBBF24"
                    fill="transparent"
                    strokeDasharray="4 2"
                    strokeWidth={1.5}
                  />
                </RadarChart>
              </ResponsiveContainer>
              <div
                style={{
                  marginTop: "10px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "7px",
                }}
              >
                {DOMAIN_SCORES.map((d) => (
                  <DomainScoreRow key={d.domain} {...d} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Regional Performance ── */}
        <div style={{ ...GLASS_CARD, marginBottom: "24px" }}>
          <div style={GLASS_CARD_HEADER}>
            <SectionTitle
              icon={MapPin}
              title="Regional Performance"
              color="#A78BFA"
              subtitle="State & Territory Overview"
            />
          </div>
          <div style={{ padding: "16px" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "10px",
                marginBottom: "16px",
              }}
            >
              {STATES_DATA.map((s) => (
                <StateRiskBox key={s.code} state={s} />
              ))}
            </div>
            <ResponsiveContainer width="100%" height={110}>
              <BarChart
                data={STATES_DATA.map((s) => ({
                  state: s.code,
                  rating: s.avgRating,
                }))}
                margin={{ top: 4, right: 4, left: -24, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.06)"
                  vertical={false}
                />
                <XAxis
                  dataKey="state"
                  tick={{ fontSize: 10, fill: "rgba(255,255,255,0.35)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 5]}
                  tick={{ fontSize: 10, fill: "rgba(255,255,255,0.35)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<DarkChartTooltip />} />
                <Bar
                  dataKey="rating"
                  name="Avg Rating"
                  fill="url(#barGradDark)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={32}
                />
                <defs>
                  <linearGradient id="barGradDark" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#6366F1" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Provider Performance Table ── */}
        <div style={{ ...GLASS_CARD, marginBottom: "24px" }}>
          <div style={GLASS_CARD_HEADER}>
            <SectionTitle
              icon={Table2}
              title="Provider Performance Overview"
              color="#60A5FA"
              subtitle={`Top 10 — ${currentQuarter}`}
            />
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {[
                    "#",
                    "Provider Name",
                    "State",
                    "Overall Rating",
                    "Risk Level",
                    "Trend",
                    "Screening %",
                    "Status",
                  ].map((h) => (
                    <th key={h} style={TABLE_HEADER_STYLE}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PROVIDER_TABLE_DATA.map((p, idx) => (
                  <tr
                    key={p.name}
                    data-ocid={`provider_table.item.${idx + 1}`}
                    style={{ transition: "background 0.15s ease" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        "rgba(255,255,255,0.04)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "";
                    }}
                  >
                    <td
                      style={{
                        ...TABLE_CELL_STYLE,
                        color: "rgba(255,255,255,0.25)",
                        width: "32px",
                        fontFamily: "'Geist Mono', monospace",
                      }}
                    >
                      {idx + 1}
                    </td>
                    <td
                      style={{
                        ...TABLE_CELL_STYLE,
                        fontWeight: 600,
                        color: "#E2E8F0",
                      }}
                    >
                      {p.name}
                    </td>
                    <td style={TABLE_CELL_STYLE}>
                      <span
                        style={{
                          background: "rgba(96,165,250,0.15)",
                          color: "#60A5FA",
                          border: "1px solid rgba(96,165,250,0.25)",
                          borderRadius: "4px",
                          padding: "1px 7px",
                          fontSize: "0.7rem",
                          fontWeight: 600,
                        }}
                      >
                        {p.state}
                      </span>
                    </td>
                    <td style={TABLE_CELL_STYLE}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        {renderStars(p.rating)}
                        <span
                          style={{
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            color: "#E2E8F0",
                            fontFamily: "'Geist Mono', monospace",
                          }}
                        >
                          {p.rating.toFixed(1)}
                        </span>
                      </div>
                    </td>
                    <td style={TABLE_CELL_STYLE}>
                      <RiskBadge risk={p.risk as "low" | "medium" | "high"} />
                    </td>
                    <td style={TABLE_CELL_STYLE}>
                      <TrendIcon trend={p.trend as "up" | "down" | "stable"} />
                    </td>
                    <td style={TABLE_CELL_STYLE}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <div
                          style={{
                            width: "52px",
                            height: "5px",
                            borderRadius: "3px",
                            background: "rgba(255,255,255,0.08)",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${p.screening}%`,
                              height: "100%",
                              background:
                                p.screening >= 85
                                  ? "#34D399"
                                  : p.screening >= 70
                                    ? "#FBBF24"
                                    : "#F87171",
                              borderRadius: "3px",
                            }}
                          />
                        </div>
                        <span
                          style={{
                            fontSize: "0.72rem",
                            color: "rgba(255,255,255,0.7)",
                            fontFamily: "'Geist Mono', monospace",
                          }}
                        >
                          {p.screening}%
                        </span>
                      </div>
                    </td>
                    <td style={TABLE_CELL_STYLE}>{getStatusBadge(p.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Alerts + Insights ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          {/* Alerts */}
          <div
            style={{ ...GLASS_CARD, display: "flex", flexDirection: "column" }}
          >
            <div style={GLASS_CARD_HEADER}>
              <SectionTitle
                icon={Bell}
                title="Performance Alerts"
                color="#F87171"
              />
              <span
                style={{
                  background: "rgba(248,113,113,0.2)",
                  color: "#F87171",
                  border: "1px solid rgba(248,113,113,0.3)",
                  borderRadius: "20px",
                  padding: "2px 10px",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                }}
              >
                {CRITICAL_ALERTS.length}
              </span>
            </div>
            <div style={{ flex: 1 }}>
              {CRITICAL_ALERTS.map((alert, i) => (
                <div
                  key={alert.provider}
                  style={{
                    padding: "12px 16px",
                    borderLeft: `3px solid ${alert.severity === "critical" ? "#F87171" : "#FBBF24"}`,
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                  }}
                  data-ocid={`alerts.item.${i + 1}`}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: "8px",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: "0.78rem",
                          fontWeight: 700,
                          color: "#E2E8F0",
                        }}
                      >
                        {alert.provider}
                        <span
                          style={{
                            marginLeft: "6px",
                            fontWeight: 400,
                            color: "rgba(255,255,255,0.35)",
                            fontSize: "0.72rem",
                          }}
                        >
                          · {alert.state}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: "0.72rem",
                          fontWeight: 600,
                          color:
                            alert.severity === "critical"
                              ? "#F87171"
                              : "#FBBF24",
                          marginTop: "2px",
                        }}
                      >
                        {alert.indicator}
                      </div>
                      <div
                        style={{
                          fontSize: "0.7rem",
                          color: "rgba(255,255,255,0.4)",
                          marginTop: "2px",
                        }}
                      >
                        Value:{" "}
                        <strong
                          style={{
                            color: "rgba(255,255,255,0.7)",
                            fontFamily: "'Geist Mono', monospace",
                          }}
                        >
                          {alert.providerValue}
                        </strong>{" "}
                        {alert.unit} (benchmark:{" "}
                        <strong
                          style={{
                            color: "rgba(255,255,255,0.7)",
                            fontFamily: "'Geist Mono', monospace",
                          }}
                        >
                          {alert.benchmark}
                        </strong>
                        )
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-end",
                        gap: "4px",
                        flexShrink: 0,
                      }}
                    >
                      {alert.severity === "critical" ? (
                        <span
                          style={{
                            background: "rgba(248,113,113,0.2)",
                            color: "#F87171",
                            border: "1px solid rgba(248,113,113,0.3)",
                            borderRadius: "4px",
                            padding: "2px 8px",
                            fontSize: "0.68rem",
                            fontWeight: 600,
                          }}
                        >
                          Critical
                        </span>
                      ) : (
                        <span
                          style={{
                            background: "rgba(251,191,36,0.2)",
                            color: "#FBBF24",
                            border: "1px solid rgba(251,191,36,0.3)",
                            borderRadius: "4px",
                            padding: "2px 8px",
                            fontSize: "0.68rem",
                            fontWeight: 600,
                          }}
                        >
                          Warning
                        </span>
                      )}
                      <span
                        style={{
                          fontSize: "0.68rem",
                          color: "rgba(255,255,255,0.25)",
                        }}
                      >
                        {alert.daysAgo}d ago
                      </span>
                    </div>
                  </div>
                  <div
                    style={{
                      marginTop: "6px",
                      fontSize: "0.7rem",
                      color: "#60A5FA",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "4px",
                    }}
                  >
                    <ChevronRight
                      className="w-3 h-3"
                      style={{ flexShrink: 0, marginTop: "1px" }}
                    />
                    <span style={{ fontStyle: "italic" }}>{alert.action}</span>
                  </div>
                </div>
              ))}
            </div>
            {setActivePage && (
              <div
                style={{
                  padding: "12px 16px",
                  borderTop: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <button
                  type="button"
                  onClick={() => setActivePage("high_risk_cohorts")}
                  data-ocid="national_overview.view_alerts.button"
                  style={{
                    width: "100%",
                    background: "rgba(96,165,250,0.1)",
                    border: "1px solid rgba(96,165,250,0.25)",
                    borderRadius: "6px",
                    color: "#60A5FA",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    padding: "8px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    transition: "all 0.2s ease",
                  }}
                >
                  View All Alerts <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Insights */}
          <div
            style={{ ...GLASS_CARD, display: "flex", flexDirection: "column" }}
          >
            <div style={GLASS_CARD_HEADER}>
              <SectionTitle
                icon={Lightbulb}
                title="Platform Insights"
                color="#FBBF24"
                subtitle={`AI-generated — ${currentQuarter}`}
              />
            </div>
            <div
              style={{
                flex: 1,
                padding: "16px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              {PLATFORM_INSIGHTS.map((insight, i) => {
                const Icon = insight.icon;
                return (
                  <div
                    key={insight.tag}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "12px",
                      padding: "12px",
                      borderRadius: "8px",
                      background: `${insight.color}10`,
                      borderLeft: `3px solid ${insight.color}66`,
                      border: `1px solid ${insight.color}22`,
                      borderLeftWidth: "3px",
                      borderLeftColor: `${insight.color}66`,
                    }}
                    data-ocid={`insights.item.${i + 1}`}
                  >
                    <div
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "8px",
                        background: `${insight.color}20`,
                        border: `1px solid ${insight.color}33`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Icon
                        className="w-3.5 h-3.5"
                        style={{ color: insight.color }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p
                        style={{
                          fontSize: "0.75rem",
                          color: "rgba(255,255,255,0.7)",
                          lineHeight: 1.5,
                          margin: 0,
                        }}
                      >
                        {insight.text}
                      </p>
                      <span
                        style={{
                          display: "inline-block",
                          marginTop: "6px",
                          background: `${insight.color}18`,
                          color: insight.color,
                          border: `1px solid ${insight.color}33`,
                          borderRadius: "4px",
                          padding: "1px 8px",
                          fontSize: "0.65rem",
                          fontWeight: 700,
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
                style={{
                  padding: "12px 16px",
                  borderTop: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <button
                  type="button"
                  onClick={() => setActivePage("policy_analytics")}
                  data-ocid="national_overview.view_insights.button"
                  style={{
                    width: "100%",
                    background: "rgba(96,165,250,0.1)",
                    border: "1px solid rgba(96,165,250,0.25)",
                    borderRadius: "6px",
                    color: "#60A5FA",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    padding: "8px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    transition: "all 0.2s ease",
                  }}
                >
                  Policy Intelligence Hub{" "}
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Recent Submissions ── */}
        <div style={{ ...GLASS_CARD, marginBottom: "24px" }}>
          <div style={GLASS_CARD_HEADER}>
            <SectionTitle
              icon={Users2}
              title="Recent Data Submissions"
              color="#60A5FA"
              subtitle="Latest provider uploads"
            />
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {[
                    "Submission ID",
                    "Provider",
                    "Quarter",
                    "Type",
                    "Records",
                    "Submitted",
                    "Status",
                  ].map((h) => (
                    <th key={h} style={TABLE_HEADER_STYLE}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {RECENT_SUBMISSIONS.map((sub) => (
                  <tr
                    key={sub.id}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        "rgba(255,255,255,0.04)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "";
                    }}
                  >
                    <td
                      style={{
                        ...TABLE_CELL_STYLE,
                        fontFamily: "'Geist Mono', monospace",
                        fontSize: "0.7rem",
                      }}
                    >
                      {sub.id}
                    </td>
                    <td
                      style={{
                        ...TABLE_CELL_STYLE,
                        fontWeight: 600,
                        color: "#E2E8F0",
                      }}
                    >
                      {sub.provider}
                    </td>
                    <td style={TABLE_CELL_STYLE}>{sub.quarter}</td>
                    <td style={TABLE_CELL_STYLE}>{sub.type}</td>
                    <td
                      style={{
                        ...TABLE_CELL_STYLE,
                        textAlign: "right",
                        fontFamily: "'Geist Mono', monospace",
                      }}
                    >
                      {sub.records.toLocaleString()}
                    </td>
                    <td style={TABLE_CELL_STYLE}>{sub.submitted}</td>
                    <td style={TABLE_CELL_STYLE}>
                      {getSubmissionBadge(sub.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            textAlign: "center",
            padding: "16px 0",
            fontSize: "0.72rem",
            color: "rgba(255,255,255,0.2)",
            borderTop: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          &copy; {new Date().getFullYear()} Australian Government — Department
          of Health and Aged Care. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            style={{
              color: "rgba(96,165,250,0.6)",
              textDecoration: "underline",
            }}
            target="_blank"
            rel="noopener noreferrer"
          >
            caffeine.ai
          </a>
        </div>
      </div>
    </div>
  );
}
