import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Activity,
  AlertTriangle,
  Building2,
  CheckCircle,
  Database,
  Shield,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  NATIONAL_TRENDS,
  RECENT_SUBMISSIONS,
  STATE_ADVERSE_EVENTS,
} from "../../data/mockData";
import { useNationalOverviewStats } from "../../hooks/useQueries";

interface NationalOverviewProps {
  currentQuarter: string;
}

interface StatCardProps {
  label: string;
  value: string;
  subtext?: string;
  trend?: number;
  icon: React.ComponentType<{ className?: string }>;
  color?: string;
}

function StatCard({
  label,
  value,
  subtext,
  trend,
  icon: Icon,
  color,
}: StatCardProps) {
  return (
    <Card
      className="rounded-none border"
      data-ocid="national_overview.stats.card"
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1 truncate">
              {label}
            </div>
            <div
              className="text-2xl font-bold leading-tight"
              style={{ color: color || "oklch(var(--foreground))" }}
            >
              {value}
            </div>
            {subtext && (
              <div className="text-xs text-muted-foreground mt-0.5">
                {subtext}
              </div>
            )}
          </div>
          <div
            className="w-9 h-9 rounded flex items-center justify-center flex-shrink-0 ml-2"
            style={{ background: "oklch(var(--secondary))" }}
          >
            <span
              style={{
                color: color || "oklch(var(--gov-navy))",
                display: "flex",
              }}
            >
              <Icon className="w-4 h-4" />
            </span>
          </div>
        </div>
        {trend !== undefined && (
          <div className="flex items-center gap-1 mt-2">
            {trend >= 0 ? (
              <TrendingUp
                className="w-3 h-3"
                style={{ color: "oklch(var(--gov-green))" }}
              />
            ) : (
              <TrendingDown
                className="w-3 h-3"
                style={{ color: "oklch(var(--gov-red))" }}
              />
            )}
            <span
              className="text-xs font-medium"
              style={{
                color:
                  trend >= 0
                    ? "oklch(var(--gov-green))"
                    : "oklch(var(--gov-red))",
              }}
            >
              {trend >= 0 ? "+" : ""}
              {trend}% vs Q3
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function NationalOverview({
  currentQuarter,
}: NationalOverviewProps) {
  const { data: stats, isLoading } = useNationalOverviewStats(currentQuarter);

  const kpiCards = [
    {
      label: "Total Providers",
      value: stats ? Number(stats.totalProviders).toLocaleString() : "2,743",
      subtext: "Active services",
      trend: 1.2,
      icon: Building2,
      color: "oklch(var(--gov-navy))",
    },
    {
      label: "Total Residents",
      value: stats ? Number(stats.totalResidents).toLocaleString() : "189,420",
      subtext: "In care nationally",
      trend: 2.4,
      icon: Users,
      color: "oklch(var(--gov-navy))",
    },
    {
      label: "Avg Safety Score",
      value: stats ? `${stats.avgSafetyScore.toFixed(1)}` : "78.1",
      subtext: "National average",
      trend: 2.5,
      icon: Shield,
      color: "oklch(var(--gov-green))",
    },
    {
      label: "Avg Preventive Score",
      value: stats ? `${stats.avgPreventiveScore.toFixed(1)}` : "76.8",
      subtext: "National average",
      trend: 4.8,
      icon: Activity,
      color: "oklch(var(--gov-green))",
    },
    {
      label: "Screening Compliance",
      value: stats ? `${stats.screeningComplianceRate.toFixed(1)}%` : "84.3%",
      subtext: "Bundle completion rate",
      trend: 3.1,
      icon: CheckCircle,
      color: "oklch(var(--gov-green))",
    },
    {
      label: "High-Risk Flagged",
      value: stats ? Number(stats.highRiskFlagged).toLocaleString() : "1,284",
      subtext: "Active cohorts",
      trend: -5.2,
      icon: AlertTriangle,
      color: "oklch(var(--gov-amber))",
    },
    {
      label: "Data Quality Score",
      value: stats ? `${stats.dataQualityScore.toFixed(1)}%` : "91.2%",
      subtext: "Avg submission quality",
      trend: 1.8,
      icon: Database,
      color: "oklch(var(--gov-blue))",
    },
  ];

  const getSubmissionBadge = (status: string) => {
    if (status === "processed")
      return <span className="badge-green">Processed</span>;
    if (status === "validating")
      return <span className="badge-blue">Validating</span>;
    if (status === "validation_error")
      return <span className="badge-red">Error</span>;
    return <span className="badge-gray">Pending</span>;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-xl font-bold text-gov-navy">National Overview</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Reporting period: {currentQuarter} · Updated:{" "}
            {new Date().toLocaleDateString("en-AU", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>
        <div
          className="px-3 py-1.5 text-xs font-semibold rounded border"
          style={{
            background: "oklch(0.95 0.03 145)",
            color: "oklch(0.35 0.15 145)",
            borderColor: "oklch(0.72 0.12 145)",
          }}
        >
          ● Live Data
        </div>
      </div>

      {/* KPI Cards */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {["s1", "s2", "s3", "s4", "s5", "s6", "s7"].map((k) => (
            <Skeleton key={k} className="h-24 rounded-none" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {kpiCards.map((card) => (
            <StatCard key={card.label} {...card} />
          ))}
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Trend Chart */}
        <Card className="rounded-none border">
          <CardHeader className="pb-2 pt-4 px-4 border-b">
            <CardTitle className="text-sm font-semibold text-gov-navy">
              National Score Trends — Q1 to Q4 2025
            </CardTitle>
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
                  domain={[65, 85]}
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    fontSize: "12px",
                    border: "1px solid oklch(0.87 0.012 240)",
                    borderRadius: "2px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
                <Line
                  type="monotone"
                  dataKey="safetyScore"
                  name="Safety Score"
                  stroke="oklch(0.28 0.09 254)"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="preventiveScore"
                  name="Preventive Score"
                  stroke="oklch(0.52 0.15 145)"
                  strokeWidth={2}
                  strokeDasharray="5 3"
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* State Adverse Events */}
        <Card className="rounded-none border">
          <CardHeader className="pb-2 pt-4 px-4 border-b">
            <CardTitle className="text-sm font-semibold text-gov-navy">
              Adverse Event Rate by State/Territory (per 1,000 residents)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={STATE_ADVERSE_EVENTS}
                margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="oklch(0.90 0.01 240)"
                  vertical={false}
                />
                <XAxis
                  dataKey="state"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    fontSize: "12px",
                    border: "1px solid oklch(0.87 0.012 240)",
                    borderRadius: "2px",
                  }}
                />
                <Bar
                  dataKey="rate"
                  name="Adverse Event Rate"
                  fill="oklch(0.52 0.22 25)"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Submissions */}
      <Card className="rounded-none border">
        <CardHeader className="pb-2 pt-4 px-4 border-b">
          <CardTitle className="text-sm font-semibold text-gov-navy">
            Recent Data Submissions
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full gov-table">
            <thead>
              <tr>
                <th className="text-left">Submission ID</th>
                <th className="text-left">Provider</th>
                <th className="text-left">Quarter</th>
                <th className="text-left">Type</th>
                <th className="text-right">Records</th>
                <th className="text-left">Submitted</th>
                <th className="text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {RECENT_SUBMISSIONS.map((sub) => (
                <tr key={sub.id}>
                  <td className="font-mono text-xs">{sub.id}</td>
                  <td className="font-medium">{sub.provider}</td>
                  <td>{sub.quarter}</td>
                  <td>{sub.type}</td>
                  <td className="text-right">{sub.records.toLocaleString()}</td>
                  <td>{sub.submitted}</td>
                  <td>{getSubmissionBadge(sub.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
