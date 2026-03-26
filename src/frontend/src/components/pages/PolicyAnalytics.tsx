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

const EQUITY_DATA = [
  {
    type: "Urban",
    safety: 79,
    preventive: 83,
    quality: 80,
    staffing: 77,
    screening: 86.2,
    highRiskPct: 6.2,
    avgScore: 79.8,
  },
  {
    type: "Rural",
    safety: 68,
    preventive: 71,
    quality: 69,
    staffing: 64,
    screening: 76.4,
    highRiskPct: 18.5,
    avgScore: 68.1,
  },
  {
    type: "Remote",
    safety: 58,
    preventive: 61,
    quality: 59,
    staffing: 54,
    screening: 67.8,
    highRiskPct: 33.3,
    avgScore: 58.6,
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

const POLICY_INSIGHTS = [
  {
    id: 1,
    priority: "High" as const,
    title: "Screening Gap in High-Harm Regions",
    description:
      "Regions with low screening completion (NT: 66.5%, TAS: 73.4%) show significantly higher medication harm rates (>4%). Targeted screening programs could reduce harm by an estimated 18–24%.",
    regions: ["NT", "TAS", "QLD"],
    action:
      "Deploy mobile screening teams to NT and TAS. Mandate quarterly screening audits for providers below 75% completion.",
    icon: AlertTriangle,
    color: "red" as const,
  },
  {
    id: 2,
    priority: "High" as const,
    title: "Elevated Falls Rates in NSW and QLD",
    description:
      "NSW (5.8%) and QLD (6.9%) record falls rates significantly above the national target of 4.5%. This correlates with staffing shortfalls (scores 63–69) in both states.",
    regions: ["NSW", "QLD"],
    action:
      "Implement mandatory falls risk assessment protocols. Link staffing adequacy funding to falls rate benchmarks.",
    icon: AlertCircle,
    color: "red" as const,
  },
  {
    id: 3,
    priority: "High" as const,
    title: "Medication Harm Correlates with Staffing Shortfalls",
    description:
      "A strong inverse correlation (r = −0.82) exists between staffing domain scores and medication harm rates. States with staffing scores below 65 show medication harm rates above 3.5%.",
    regions: ["NT", "TAS", "QLD"],
    action:
      "Increase staffing incentive packages in low-scoring states. Introduce clinical pharmacist requirements for high-risk facilities.",
    icon: AlertTriangle,
    color: "amber" as const,
  },
  {
    id: 4,
    priority: "Medium" as const,
    title: "Incentive Uptake Uneven Across Regions",
    description:
      "ACT (100% eligible) and VIC (83% eligible) vastly outperform NT (0%) and TAS (50%). Pay-for-Improvement funding is concentrating in already high-performing regions.",
    regions: ["NT", "TAS", "WA"],
    action:
      "Redesign eligibility thresholds to include improvement trajectory, not just absolute score. Introduce baseline incentives for remote providers.",
    icon: BarChart2,
    color: "amber" as const,
  },
  {
    id: 5,
    priority: "Medium" as const,
    title: "Rural and Remote Providers Underperform on Preventive Care",
    description:
      "Remote providers score 20+ points below urban counterparts on preventive care (61 vs 83). This gap has remained static over 4 quarters, indicating systemic rather than transitional barriers.",
    regions: ["NT", "WA", "TAS", "QLD"],
    action:
      "Fund telehealth preventive care delivery. Partner with RFDS for remote facility support. Mandate equity metrics in reporting.",
    icon: MapPin,
    color: "amber" as const,
  },
  {
    id: 6,
    priority: "Low" as const,
    title: "ACT and VIC Consistently Above Benchmark Across All Domains",
    description:
      "ACT and VIC have maintained above-benchmark scores for 4 consecutive quarters across all 6 domains. These regions represent transferable best-practice models.",
    regions: ["ACT", "VIC"],
    action:
      "Commission best-practice documentation from ACT and VIC providers. Establish peer-learning exchange programs with lower-performing states.",
    icon: CheckCircle,
    color: "green" as const,
  },
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

// ─── TAB 4: POLICY INSIGHTS ───────────────────────────────────────────────────

function PolicyInsightsTab() {
  const priorityColors = {
    High: {
      badge: "badge-red",
      border: CHART_COLORS.red,
      bg: "oklch(0.97 0.012 25)",
    },
    Medium: {
      badge: "badge-amber",
      border: CHART_COLORS.amber,
      bg: "oklch(0.97 0.012 65)",
    },
    Low: {
      badge: "badge-green",
      border: CHART_COLORS.green,
      bg: "oklch(0.97 0.012 145)",
    },
  };

  return (
    <div className="space-y-4 animate-slide-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h3
            className="text-sm font-semibold"
            style={{ color: "oklch(0.22 0.07 258)" }}
          >
            Policy Intelligence Engine
          </h3>
          <p
            className="text-xs mt-0.5"
            style={{ color: "oklch(0.5 0.022 252)" }}
          >
            Auto-generated insights from Q4 2024 sector data · Updated in real
            time
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 text-xs"
          data-ocid="policy.download_button"
        >
          <Download className="h-3.5 w-3.5" />
          Download Report
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {POLICY_INSIGHTS.map((insight) => {
          const style = priorityColors[insight.priority];
          return (
            <div
              key={insight.id}
              className="section-card overflow-hidden card-hover"
              style={{ borderLeft: `4px solid ${style.border}` }}
              data-ocid="policy.insight.card"
            >
              <div
                className="px-4 py-3 flex items-start gap-3"
                style={{ background: style.bg }}
              >
                <insight.icon
                  className="h-5 w-5 mt-0.5 flex-shrink-0"
                  style={{ color: style.border }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4
                      className="text-sm font-semibold leading-snug"
                      style={{ color: "oklch(0.16 0.035 258)" }}
                    >
                      {insight.title}
                    </h4>
                    <span className={style.badge} style={{ flexShrink: 0 }}>
                      {insight.priority}
                    </span>
                  </div>
                  <p
                    className="text-xs mt-1.5 leading-relaxed"
                    style={{ color: "oklch(0.38 0.022 252)" }}
                  >
                    {insight.description}
                  </p>

                  <div className="mt-2.5 space-y-1.5">
                    <div className="flex flex-wrap gap-1">
                      {insight.regions.map((r) => (
                        <span
                          key={r}
                          className="badge-blue"
                          style={{ fontSize: "0.62rem" }}
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                    <div
                      className="flex items-start gap-1.5 text-xs"
                      style={{ color: "oklch(0.38 0.022 252)" }}
                    >
                      <Info
                        className="h-3.5 w-3.5 mt-0.5 flex-shrink-0"
                        style={{ color: style.border }}
                      />
                      <span className="leading-relaxed">
                        <strong>Recommended Action:</strong> {insight.action}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── TAB 5: EQUITY ANALYSIS ───────────────────────────────────────────────────

function EquityAnalysisTab() {
  const equityIndicators = [
    { key: "safety", name: "Safety" },
    { key: "preventive", name: "Preventive Care" },
    { key: "quality", name: "Quality" },
    { key: "staffing", name: "Staffing" },
  ];

  const equityBarData = equityIndicators.map((ind) => ({
    indicator: ind.name,
    Urban:
      EQUITY_DATA.find((e) => e.type === "Urban")?.[
        ind.key as keyof (typeof EQUITY_DATA)[0]
      ] ?? 0,
    Rural:
      EQUITY_DATA.find((e) => e.type === "Rural")?.[
        ind.key as keyof (typeof EQUITY_DATA)[0]
      ] ?? 0,
    Remote:
      EQUITY_DATA.find((e) => e.type === "Remote")?.[
        ind.key as keyof (typeof EQUITY_DATA)[0]
      ] ?? 0,
  }));

  return (
    <div className="space-y-5 animate-slide-in-up">
      {/* CALD Gap Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {EQUITY_DATA.map((e) => (
          <div key={e.type} className="kpi-card">
            <div
              className="kpi-card-accent"
              style={{
                background:
                  e.type === "Urban"
                    ? CHART_COLORS.green
                    : e.type === "Rural"
                      ? CHART_COLORS.amber
                      : CHART_COLORS.red,
              }}
            />
            <div className="px-4 py-3">
              <div className="flex items-center gap-2">
                <MapPin
                  className="h-4 w-4"
                  style={{
                    color:
                      e.type === "Urban"
                        ? CHART_COLORS.green
                        : e.type === "Rural"
                          ? CHART_COLORS.amber
                          : CHART_COLORS.red,
                  }}
                />
                <span
                  className="text-sm font-semibold"
                  style={{ color: "oklch(0.16 0.035 258)" }}
                >
                  {e.type} Providers
                </span>
              </div>
              <div
                className="stat-number text-2xl mt-2"
                style={{ color: "oklch(0.16 0.035 258)" }}
              >
                {e.avgScore.toFixed(1)}
              </div>
              <div
                className="text-xs"
                style={{ color: "oklch(0.5 0.022 252)" }}
              >
                Avg sector score
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>
                  <div
                    className="text-xs font-mono-data font-semibold"
                    style={{
                      color:
                        e.highRiskPct > 20
                          ? CHART_COLORS.red
                          : e.highRiskPct > 10
                            ? CHART_COLORS.amber
                            : CHART_COLORS.green,
                    }}
                  >
                    {e.highRiskPct.toFixed(1)}%
                  </div>
                  <div
                    className="text-xs"
                    style={{ color: "oklch(0.5 0.022 252)" }}
                  >
                    High risk
                  </div>
                </div>
                <div>
                  <div className="text-xs font-mono-data font-semibold">
                    {e.screening.toFixed(1)}%
                  </div>
                  <div
                    className="text-xs"
                    style={{ color: "oklch(0.5 0.022 252)" }}
                  >
                    Screening
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CALD Gap Metric */}
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
        <div>
          <div
            className="font-semibold text-sm"
            style={{ color: "oklch(0.22 0.07 258)" }}
          >
            CALD Access Gap Metric
          </div>
          <p
            className="text-xs mt-1"
            style={{ color: "oklch(0.38 0.022 252)" }}
          >
            Culturally and Linguistically Diverse (CALD) communities accessing
            aged care services experience an estimated{" "}
            <strong>12–18% lower screening completion rate</strong> compared to
            the national average. Concentrated in NSW (Western Sydney) and VIC
            (South-East Melbourne). Interpreter services and multilingual care
            plans have shown a <strong>22% uplift</strong> in screening
            completion in pilot programs.
          </p>
        </div>
      </div>

      {/* Grouped Bar Chart: Urban vs Rural vs Remote */}
      <div className="section-card">
        <div className="section-card-header">
          <span className="section-card-title">
            <BarChart2 className="h-4 w-4" />
            Equity Comparison — Urban vs Rural vs Remote Performance
          </span>
        </div>
        <div className="p-4">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={equityBarData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="indicator" tick={{ fontSize: 11 }} />
              <YAxis domain={[40, 100]} tick={{ fontSize: 11 }} />
              <Tooltip content={<ChartTooltip />} />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 11 }}
              />
              <Bar
                dataKey="Urban"
                fill={CHART_COLORS.green}
                radius={[2, 2, 0, 0]}
              />
              <Bar
                dataKey="Rural"
                fill={CHART_COLORS.amber}
                radius={[2, 2, 0, 0]}
              />
              <Bar
                dataKey="Remote"
                fill={CHART_COLORS.red}
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* State Equity Table */}
      <div className="section-card">
        <div className="section-card-header">
          <span className="section-card-title">
            <FileText className="h-4 w-4" />
            State-by-State Equity Breakdown
          </span>
        </div>
        <div className="p-0">
          <table className="gov-table">
            <thead>
              <tr>
                <th>State</th>
                <th>Avg Score</th>
                <th>High Risk %</th>
                <th>Screening %</th>
                <th>Urban</th>
                <th>Rural</th>
                <th>Remote</th>
                <th>Equity Gap</th>
              </tr>
            </thead>
            <tbody>
              {STATE_DATA.map((s) => {
                const total =
                  s.urbanRural.urban + s.urbanRural.rural + s.urbanRural.remote;
                const remoteShare =
                  total > 0
                    ? ((s.urbanRural.remote / total) * 100).toFixed(0)
                    : "0";
                const equityGap =
                  s.avgRating >= 4
                    ? "Low"
                    : s.avgRating >= 3
                      ? "Medium"
                      : "High";
                return (
                  <tr key={s.state}>
                    <td className="font-semibold">
                      <span className="badge-navy">{s.state}</span>
                    </td>
                    <td className="font-mono-data font-semibold">
                      {s.avgScore.toFixed(1)}
                    </td>
                    <td>
                      <span
                        className="font-mono-data text-xs font-semibold"
                        style={{
                          color:
                            s.highRiskCount === 0
                              ? CHART_COLORS.green
                              : s.highRiskCount === 1
                                ? CHART_COLORS.amber
                                : CHART_COLORS.red,
                        }}
                      >
                        {((s.highRiskCount / s.providerCount) * 100).toFixed(0)}
                        %
                      </span>
                    </td>
                    <td className="font-mono-data">
                      {s.screeningPct.toFixed(1)}%
                    </td>
                    <td className="font-mono-data">{s.urbanRural.urban}</td>
                    <td className="font-mono-data">{s.urbanRural.rural}</td>
                    <td className="font-mono-data">{remoteShare}%</td>
                    <td>
                      <span
                        className={`badge-${
                          equityGap === "Low"
                            ? "green"
                            : equityGap === "Medium"
                              ? "amber"
                              : "red"
                        }`}
                      >
                        {equityGap}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── TAB 6: PAY-FOR-IMPROVEMENT ANALYSIS ─────────────────────────────────────

function PayForImprovementTab() {
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
    </div>
  );
}

// ─── TAB 7: COMPARISON CHARTS ─────────────────────────────────────────────────

function ComparisonChartsTab() {
  const [selectedStates, setSelectedStates] = useState<string[]>([
    "NSW",
    "VIC",
    "QLD",
  ]);

  const toggleState = (state: string) => {
    setSelectedStates((prev) =>
      prev.includes(state)
        ? prev.length > 1
          ? prev.filter((s) => s !== state)
          : prev
        : prev.length < 3
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

  const groupedBarData = domains.map((domain, i) => {
    const entry: Record<string, any> = { domain };
    for (const st of selectedStates) {
      const stateData = STATE_DATA.find((s) => s.state === st);
      if (stateData) entry[st] = stateData.domainScores[domainKeys[i]];
    }
    return entry;
  });

  const radarData = domains.map((domain, i) => {
    const entry: Record<string, any> = { domain };
    for (const st of selectedStates) {
      const stateData = STATE_DATA.find((s) => s.state === st);
      if (stateData) entry[st] = stateData.domainScores[domainKeys[i]];
    }
    return entry;
  });

  const RADAR_COLORS = [
    CHART_COLORS.navy,
    CHART_COLORS.green,
    CHART_COLORS.red,
  ];

  return (
    <div className="space-y-5 animate-slide-in-up">
      {/* State Selector */}
      <div className="section-card">
        <div className="section-card-header">
          <span className="section-card-title">
            <MapPin className="h-4 w-4" />
            Select States to Compare (up to 3)
          </span>
          <span className="text-xs" style={{ color: "oklch(0.5 0.022 252)" }}>
            {selectedStates.length}/3 selected
          </span>
        </div>
        <div className="p-3 flex flex-wrap gap-2">
          {STATE_DATA.map((s) => {
            const isSelected = selectedStates.includes(s.state);
            const idx = selectedStates.indexOf(s.state);
            return (
              <button
                type="button"
                key={s.state}
                onClick={() => toggleState(s.state)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm border text-xs font-semibold transition-all"
                style={{
                  background: isSelected
                    ? (RADAR_COLORS[idx] ?? CHART_COLORS.navy)
                    : "white",
                  color: isSelected ? "white" : "oklch(0.44 0.018 252)",
                  borderColor: isSelected
                    ? (RADAR_COLORS[idx] ?? CHART_COLORS.navy)
                    : "oklch(0.88 0.008 252)",
                }}
                data-ocid="policy.tab"
              >
                {s.state}
                {isSelected && <span className="opacity-70 text-xs">✓</span>}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Grouped Bar Chart */}
        <div className="section-card">
          <div className="section-card-header">
            <span className="section-card-title">
              <BarChart2 className="h-4 w-4" />
              Domain Score Comparison
            </span>
          </div>
          <div className="p-4">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={groupedBarData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="domain" tick={{ fontSize: 10 }} />
                <YAxis domain={[40, 100]} tick={{ fontSize: 11 }} />
                <Tooltip content={<ChartTooltip />} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 11 }}
                />
                {selectedStates.map((st, i) => (
                  <Bar
                    key={st}
                    dataKey={st}
                    fill={RADAR_COLORS[i] ?? CHART_COLORS.navy}
                    radius={[2, 2, 0, 0]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Radar Chart */}
        <div className="section-card">
          <div className="section-card-header">
            <span className="section-card-title">
              <Activity className="h-4 w-4" />
              Performance Radar
            </span>
          </div>
          <div className="p-4">
            <ResponsiveContainer width="100%" height={240}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#E5E7EB" />
                <PolarAngleAxis dataKey="domain" tick={{ fontSize: 10 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9 }} />
                <Tooltip content={<ChartTooltip />} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 11 }}
                />
                {selectedStates.map((st, i) => (
                  <Radar
                    key={st}
                    name={st}
                    dataKey={st}
                    stroke={RADAR_COLORS[i] ?? CHART_COLORS.navy}
                    fill={RADAR_COLORS[i] ?? CHART_COLORS.navy}
                    fillOpacity={0.12}
                    strokeWidth={2}
                  />
                ))}
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Summary Table */}
      <div className="section-card">
        <div className="section-card-header">
          <span className="section-card-title">
            <FileText className="h-4 w-4" />
            Selected States Summary
          </span>
        </div>
        <div className="p-0">
          <table className="gov-table">
            <thead>
              <tr>
                <th>State</th>
                <th>Avg Rating</th>
                <th>Avg Score</th>
                <th>High Risk</th>
                <th>Screening</th>
                <th>Falls Rate</th>
                <th>Improvement</th>
                <th>Eligible</th>
              </tr>
            </thead>
            <tbody>
              {selectedStates.map((st, i) => {
                const s = STATE_DATA.find((d) => d.state === st);
                if (!s) return null;
                return (
                  <tr key={st}>
                    <td>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{
                            background: RADAR_COLORS[i] ?? CHART_COLORS.navy,
                          }}
                        />
                        <span className="font-semibold">{st}</span>
                      </div>
                    </td>
                    <td>
                      <StarDisplay rating={s.avgRating} />
                    </td>
                    <td className="font-mono-data font-semibold">
                      {s.avgScore.toFixed(1)}
                    </td>
                    <td>
                      <span
                        className={`badge-${s.highRiskCount === 0 ? "green" : s.highRiskCount === 1 ? "amber" : "red"}`}
                      >
                        {s.highRiskCount}
                      </span>
                    </td>
                    <td className="font-mono-data">
                      {s.screeningPct.toFixed(1)}%
                    </td>
                    <td>
                      <span
                        className="font-mono-data text-xs font-semibold"
                        style={{
                          color:
                            s.fallsRate > 6
                              ? CHART_COLORS.red
                              : s.fallsRate > 4.5
                                ? CHART_COLORS.amber
                                : CHART_COLORS.green,
                        }}
                      >
                        {s.fallsRate.toFixed(1)}%
                      </span>
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
                    <td>
                      <span
                        className={`badge-${s.eligibleCount > 0 ? "green" : "red"}`}
                      >
                        {s.eligibleCount}/{s.providerCount}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function PolicyAnalytics() {
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
          style={{ gridTemplateColumns: "repeat(7, 1fr)" }}
          data-ocid="policy.tab"
        >
          {[
            { value: "overview", label: "National Overview", icon: Activity },
            { value: "heatmaps", label: "Regional Heatmaps", icon: MapPin },
            { value: "trends", label: "Trend Analysis", icon: TrendingUp },
            {
              value: "insights",
              label: "Policy Insights",
              icon: AlertTriangle,
            },
            { value: "equity", label: "Equity Analysis", icon: Users },
            { value: "pfi", label: "Pay-for-Improvement", icon: Star },
            { value: "compare", label: "Comparison", icon: BarChart2 },
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
        <TabsContent value="heatmaps">
          <RegionalHeatmapsTab />
        </TabsContent>
        <TabsContent value="trends">
          <TrendAnalysisTab />
        </TabsContent>
        <TabsContent value="insights">
          <PolicyInsightsTab />
        </TabsContent>
        <TabsContent value="equity">
          <EquityAnalysisTab />
        </TabsContent>
        <TabsContent value="pfi">
          <PayForImprovementTab />
        </TabsContent>
        <TabsContent value="compare">
          <ComparisonChartsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
