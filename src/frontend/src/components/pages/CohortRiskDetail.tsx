import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertTriangle, ArrowLeft, ChevronRight, Star } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { COHORT_DETAIL_DATA } from "../../data/mockData";

interface Props {
  cohortId: string;
  onBack: () => void;
}

function UrgencyBadge({ urgency }: { urgency: "high" | "medium" | "low" }) {
  if (urgency === "high") return <span className="badge-red">HIGH</span>;
  if (urgency === "medium") return <span className="badge-amber">MEDIUM</span>;
  return <span className="badge-blue">LOW</span>;
}

function StatusBadge({ status }: { status: string }) {
  const s = status.toUpperCase();
  if (s === "ACTIVE") return <span className="badge-red">ACTIVE</span>;
  if (s === "MONITORING")
    return <span className="badge-amber">MONITORING</span>;
  return <span className="badge-green">RESOLVED</span>;
}

function RiskLevelBadge({ level }: { level: "HIGH" | "MEDIUM" | "LOW" }) {
  if (level === "HIGH") return <span className="badge-red">HIGH</span>;
  if (level === "MEDIUM") return <span className="badge-amber">MEDIUM</span>;
  return <span className="badge-green">LOW</span>;
}

function ScreeningStatusBadge({
  status,
}: { status: "Completed" | "Pending" | "Overdue" }) {
  if (status === "Completed")
    return <span className="badge-green">Completed</span>;
  if (status === "Pending") return <span className="badge-amber">Pending</span>;
  return <span className="badge-red">Overdue</span>;
}

function StarRating({ stars, max = 5 }: { stars: number; max?: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <Star
          // biome-ignore lint/suspicious/noArrayIndexKey: star positions are stable ordinal indices
          key={i}
          className="w-4 h-4"
          style={{
            fill: i < stars ? "oklch(var(--gov-gold))" : "none",
            color:
              i < stars
                ? "oklch(var(--gov-gold-dark))"
                : "oklch(var(--border))",
          }}
        />
      ))}
    </span>
  );
}

function RiskScoreGauge({
  score,
  level,
}: { score: number; level: "HIGH" | "MEDIUM" | "LOW" }) {
  const color =
    level === "HIGH"
      ? "oklch(var(--gov-red))"
      : level === "MEDIUM"
        ? "oklch(var(--gov-amber))"
        : "oklch(var(--gov-green))";

  return (
    <div className="flex flex-col items-center justify-center gap-2 py-4">
      <div
        className="relative w-28 h-28 rounded-full flex items-center justify-center border-8"
        style={{ borderColor: color, background: "oklch(var(--card))" }}
      >
        <div className="text-center">
          <div className="text-3xl font-bold" style={{ color }}>
            {score}
          </div>
          <div className="text-xs text-muted-foreground font-semibold">
            / 100
          </div>
        </div>
      </div>
      <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Risk Score
      </div>
      <RiskLevelBadge level={level} />
    </div>
  );
}

export default function CohortRiskDetail({ cohortId, onBack }: Props) {
  const detail = COHORT_DETAIL_DATA[cohortId];

  if (!detail) {
    return (
      <div className="p-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="mb-4 rounded-none text-gov-navy"
          data-ocid="cohort_detail.back.button"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to High-Risk Cohort Monitoring
        </Button>
        <div className="text-muted-foreground">
          Cohort details not found for {cohortId}.
        </div>
      </div>
    );
  }

  // Derived: screening completion rate
  const totalCompleted = detail.screeningBundle.reduce(
    (a, s) => a + s.completed,
    0,
  );
  const totalPossible = detail.screeningBundle.reduce((a, s) => a + s.total, 0);
  const completionRate = Math.round((totalCompleted / totalPossible) * 100);

  return (
    <div className="p-6 space-y-5">
      {/* Breadcrumb / Back nav */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 text-gov-navy hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          data-ocid="cohort_detail.back.button"
          aria-label="Back to High-Risk Cohort Monitoring"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          High-Risk Cohort Monitoring
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="font-semibold text-foreground">
          Cohort Risk Investigation
        </span>
        <span
          className="ml-2 px-2 py-0.5 text-xs font-mono font-bold rounded border"
          style={{
            background: "oklch(0.93 0.03 254)",
            color: "oklch(var(--gov-navy))",
            borderColor: "oklch(0.82 0.04 254)",
          }}
        >
          {cohortId}
        </span>
      </div>

      {/* Page header */}
      <div className="border-b pb-4">
        <h1 className="text-xl font-bold text-gov-navy">
          Cohort Risk Investigation
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          HRSM — Detailed clinical risk profile and regulatory action panel for
          flagged cohort
        </p>
      </div>

      {/* ── Section 1: Cohort Summary ────────────────────────────────── */}
      <Card
        className="rounded-none border"
        data-ocid="cohort_detail.summary.card"
      >
        <CardHeader className="pb-2 pt-4 px-4 border-b">
          <CardTitle className="text-sm font-bold text-gov-navy uppercase tracking-wide">
            Section 1 — Cohort Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4">
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                Cohort ID
              </div>
              <div className="font-mono font-bold text-gov-navy">
                {detail.cohortId}
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                Provider Name
              </div>
              <div className="font-semibold">{detail.providerName}</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                Region
              </div>
              <div>{detail.region}</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                Cohort Size
              </div>
              <div className="font-bold text-gov-navy">
                {detail.cohortSize}{" "}
                <span className="font-normal text-muted-foreground text-xs">
                  residents
                </span>
              </div>
            </div>
            <div className="col-span-2">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                Risk Criteria
              </div>
              <ul className="space-y-0.5">
                {detail.riskCriteria.map((c) => (
                  <li key={c} className="flex items-start gap-1.5 text-sm">
                    <span
                      className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: "oklch(var(--gov-navy))" }}
                    />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                Flag Date
              </div>
              <div>{detail.flagDate}</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                Urgency Level
              </div>
              <UrgencyBadge urgency={detail.urgency} />
            </div>
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                Status
              </div>
              <StatusBadge status={detail.status} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Section 2: Risk Analysis ─────────────────────────────────── */}
      <Card
        className="rounded-none border"
        data-ocid="cohort_detail.risk_analysis.card"
      >
        <CardHeader className="pb-2 pt-4 px-4 border-b">
          <CardTitle className="text-sm font-bold text-gov-navy uppercase tracking-wide">
            Section 2 — Risk Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row">
            {/* Gauge */}
            <div
              className="md:w-52 flex-shrink-0 border-b md:border-b-0 md:border-r flex flex-col items-center justify-center p-4"
              style={{ background: "oklch(var(--muted))" }}
            >
              <RiskScoreGauge
                score={detail.riskScore}
                level={detail.riskLevel}
              />
            </div>
            {/* Table */}
            <div className="flex-1 overflow-x-auto">
              <table className="w-full gov-table">
                <thead>
                  <tr>
                    <th className="text-left">Indicator</th>
                    <th className="text-left">Current Value</th>
                    <th className="text-left">Regional Benchmark</th>
                    <th className="text-left">Risk Level</th>
                    <th className="text-left" style={{ width: "140px" }}>
                      Visual
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {detail.riskIndicators.map((ind) => {
                    const barColor =
                      ind.riskLevel === "HIGH"
                        ? "oklch(var(--gov-red))"
                        : ind.riskLevel === "MEDIUM"
                          ? "oklch(var(--gov-amber))"
                          : "oklch(var(--gov-green))";
                    return (
                      <tr key={ind.indicator}>
                        <td className="font-medium text-sm">{ind.indicator}</td>
                        <td className="font-semibold">{ind.currentValue}</td>
                        <td className="text-muted-foreground">
                          {ind.benchmark}
                        </td>
                        <td>
                          <RiskLevelBadge level={ind.riskLevel} />
                        </td>
                        <td>
                          <div
                            className="h-2 rounded-none"
                            style={{ background: "oklch(var(--border))" }}
                          >
                            <div
                              className="h-2 rounded-none transition-all"
                              style={{
                                width: `${ind.barPercent}%`,
                                background: barColor,
                              }}
                            />
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {ind.barPercent}%
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Section 3: Screening Bundle Status ──────────────────────── */}
      <Card
        className="rounded-none border"
        data-ocid="cohort_detail.screening.card"
      >
        <CardHeader className="pb-2 pt-4 px-4 border-b">
          <CardTitle className="text-sm font-bold text-gov-navy uppercase tracking-wide">
            Section 3 — Screening Bundle Status
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          {/* Overall completion */}
          <div
            className="flex items-center gap-4 p-3 border rounded-none"
            style={{ background: "oklch(var(--muted))" }}
          >
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">
                Screening Completion Rate
              </div>
              <div className="text-2xl font-bold text-gov-navy">
                {completionRate}%
              </div>
            </div>
            <div className="flex-1">
              <Progress value={completionRate} className="h-3 rounded-none" />
            </div>
            <div
              className={
                completionRate >= 80
                  ? "badge-green"
                  : completionRate >= 60
                    ? "badge-amber"
                    : "badge-red"
              }
            >
              {completionRate >= 80
                ? "ON TRACK"
                : completionRate >= 60
                  ? "AT RISK"
                  : "CRITICAL"}
            </div>
          </div>

          {/* Screening table */}
          <div className="overflow-x-auto">
            <table className="w-full gov-table">
              <thead>
                <tr>
                  <th className="text-left">Assessment</th>
                  <th className="text-right">Completed</th>
                  <th className="text-right">Pending</th>
                  <th className="text-right">Overdue</th>
                  <th className="text-left" style={{ width: "160px" }}>
                    Progress
                  </th>
                </tr>
              </thead>
              <tbody>
                {detail.screeningBundle.map((s) => {
                  const pct = Math.round((s.completed / s.total) * 100);
                  return (
                    <tr key={s.name}>
                      <td className="font-medium">{s.name}</td>
                      <td
                        className="text-right font-semibold"
                        style={{ color: "oklch(var(--gov-green))" }}
                      >
                        {s.completed}
                      </td>
                      <td
                        className="text-right font-semibold"
                        style={{ color: "oklch(var(--gov-amber))" }}
                      >
                        {s.pending}
                      </td>
                      <td
                        className="text-right font-semibold"
                        style={{
                          color:
                            s.overdue > 0 ? "oklch(var(--gov-red))" : "inherit",
                        }}
                      >
                        {s.overdue > 0 ? (
                          <span className="inline-flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            {s.overdue}
                          </span>
                        ) : (
                          s.overdue
                        )}
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div
                            className="flex-1 h-1.5 rounded-none"
                            style={{ background: "oklch(var(--border))" }}
                          >
                            <div
                              className="h-1.5 rounded-none"
                              style={{
                                width: `${pct}%`,
                                background:
                                  pct >= 80
                                    ? "oklch(var(--gov-green))"
                                    : pct >= 60
                                      ? "oklch(var(--gov-amber))"
                                      : "oklch(var(--gov-red))",
                              }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground w-8 text-right">
                            {pct}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ── Section 4: Resident Breakdown ───────────────────────────── */}
      <Card className="rounded-none border">
        <CardHeader className="pb-2 pt-4 px-4 border-b">
          <CardTitle className="text-sm font-bold text-gov-navy uppercase tracking-wide">
            Section 4 — Resident Breakdown (Anonymized)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table data-ocid="cohort_detail.residents.table">
            <TableHeader>
              <TableRow style={{ background: "oklch(var(--muted))" }}>
                <TableHead className="text-xs font-bold uppercase tracking-wide">
                  Resident ID
                </TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wide">
                  Age
                </TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wide">
                  Risk Factors
                </TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wide">
                  Screening Status
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {detail.residents.map((r, idx) => (
                <TableRow
                  key={r.id}
                  data-ocid={`cohort_detail.residents.row.${idx + 1}`}
                  style={
                    r.screeningStatus === "Overdue"
                      ? { background: "oklch(0.98 0.01 25)" }
                      : undefined
                  }
                >
                  <TableCell className="font-mono text-xs font-bold text-gov-navy">
                    {r.id}
                  </TableCell>
                  <TableCell>{r.age}</TableCell>
                  <TableCell className="text-sm">{r.riskFactors}</TableCell>
                  <TableCell>
                    <ScreeningStatusBadge status={r.screeningStatus} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div
            className="px-4 py-2 border-t text-xs text-muted-foreground italic"
            style={{ background: "oklch(var(--muted))" }}
          >
            Resident names are not displayed to maintain privacy in accordance
            with the Privacy Act 1988.
          </div>
        </CardContent>
      </Card>

      {/* ── Section 5: Recommended Actions ──────────────────────────── */}
      <Card className="rounded-none border">
        <CardHeader className="pb-2 pt-4 px-4 border-b">
          <CardTitle className="text-sm font-bold text-gov-navy uppercase tracking-wide">
            Section 5 — Recommended Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          {/* Alerts */}
          <div className="space-y-2">
            {detail.recommendedAlerts.map((alert) => {
              const isInfo = alert.startsWith("ℹ");
              return (
                <div
                  key={alert}
                  className="flex items-start gap-2 p-2.5 border rounded-none text-sm"
                  style={{
                    background: isInfo
                      ? "oklch(var(--gov-blue-bg))"
                      : "oklch(var(--gov-red-bg))",
                    borderColor: isInfo
                      ? "oklch(0.65 0.14 250)"
                      : "oklch(0.68 0.18 25)",
                    color: isInfo
                      ? "oklch(0.35 0.16 250)"
                      : "oklch(0.42 0.20 25)",
                  }}
                >
                  <AlertTriangle
                    className="w-4 h-4 mt-0.5 flex-shrink-0"
                    aria-hidden="true"
                  />
                  <span>{alert}</span>
                </div>
              );
            })}
          </div>

          <div
            className="border-t pt-4"
            style={{ borderColor: "oklch(var(--border))" }}
          >
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Suggested Interventions
            </div>
            <div className="flex flex-wrap gap-2">
              {detail.suggestedActions.map((action) => (
                <span
                  key={action}
                  className="px-3 py-1 text-xs font-semibold border rounded-full"
                  style={{
                    background: "oklch(var(--gov-blue-bg))",
                    color: "oklch(0.35 0.16 250)",
                    borderColor: "oklch(0.65 0.14 250)",
                  }}
                >
                  {action}
                </span>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Section 6: Cohort Trend Analysis ────────────────────────── */}
      <Card className="rounded-none border">
        <CardHeader className="pb-2 pt-4 px-4 border-b">
          <CardTitle className="text-sm font-bold text-gov-navy uppercase tracking-wide">
            Section 6 — Cohort Trend Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="text-xs text-muted-foreground mb-3">
            High-risk resident count over time. Dashed line indicates alert
            threshold (10 residents).
          </div>
          <ResponsiveContainer
            width="100%"
            height={220}
            data-ocid="cohort_detail.trend.chart_point"
          >
            <LineChart
              data={detail.trendData}
              margin={{ top: 8, right: 24, left: 0, bottom: 8 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="oklch(0.87 0.012 240)"
              />
              <XAxis
                dataKey="quarter"
                tick={{ fontSize: 12, fill: "oklch(0.46 0.025 250)" }}
                axisLine={{ stroke: "oklch(0.87 0.012 240)" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "oklch(0.46 0.025 250)" }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  border: "1px solid oklch(0.87 0.012 240)",
                  borderRadius: 0,
                  fontSize: 12,
                  background: "white",
                }}
                formatter={(value: number) => [value, "High-Risk Residents"]}
              />
              <ReferenceLine
                y={10}
                stroke="oklch(0.52 0.22 25)"
                strokeDasharray="4 4"
                label={{
                  value: "Alert Threshold",
                  position: "insideTopRight",
                  fontSize: 11,
                  fill: "oklch(0.52 0.22 25)",
                }}
              />
              <Line
                type="monotone"
                dataKey="highRiskResidents"
                stroke="oklch(var(--gov-navy))"
                strokeWidth={2.5}
                dot={{ fill: "oklch(var(--gov-navy))", r: 5 }}
                activeDot={{ r: 7 }}
                name="High-Risk Residents"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* ── Section 7: Provider Performance Impact ───────────────────── */}
      <Card className="rounded-none border">
        <CardHeader className="pb-2 pt-4 px-4 border-b">
          <CardTitle className="text-sm font-bold text-gov-navy uppercase tracking-wide">
            Section 7 — Provider Performance Impact
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="space-y-3">
            {detail.performanceImpact.map((p) => (
              <div
                key={p.indicator}
                className="flex items-center justify-between gap-4"
              >
                <div className="text-sm font-medium w-40">{p.indicator}</div>
                <StarRating stars={p.stars} />
                <div className="text-xs text-muted-foreground">
                  {p.stars} / 5
                </div>
              </div>
            ))}
          </div>
          <div
            className="p-3 border-l-4 text-sm italic"
            style={{
              borderLeftColor: "oklch(var(--gov-amber))",
              background: "oklch(var(--gov-amber-bg))",
              color: "oklch(0.43 0.14 72)",
            }}
          >
            {detail.performanceMessage}
          </div>
        </CardContent>
      </Card>

      {/* ── Section 8: Regulator Actions Panel ──────────────────────── */}
      <Card
        className="rounded-none border"
        data-ocid="cohort_detail.actions.panel"
        style={{ background: "oklch(var(--gov-navy))" }}
      >
        <CardHeader
          className="pb-2 pt-4 px-4 border-b"
          style={{ borderColor: "oklch(0.38 0.07 254)" }}
        >
          <CardTitle className="text-sm font-bold uppercase tracking-wide text-white">
            Section 8 — Regulator Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <p className="text-xs mb-4" style={{ color: "oklch(0.75 0.04 254)" }}>
            Actions below are logged in the audit trail and may trigger provider
            notifications.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              size="sm"
              className="rounded-none text-xs font-semibold h-8 border-2"
              style={{
                borderColor: "oklch(var(--gov-amber))",
                color: "oklch(var(--gov-amber))",
                background: "transparent",
              }}
              data-ocid="cohort_detail.mark_review.button"
            >
              Mark Under Review
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-none text-xs font-semibold h-8 border-2 text-white border-white hover:bg-white/10"
              style={{ background: "transparent" }}
              data-ocid="cohort_detail.send_alert.button"
            >
              Send Alert to Provider
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-none text-xs font-semibold h-8 border-2 text-white border-white hover:bg-white/10"
              style={{ background: "transparent" }}
              data-ocid="cohort_detail.request_review.button"
            >
              Request Clinical Review
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-none text-xs font-semibold h-8 border-2 text-white border-white hover:bg-white/10"
              style={{ background: "transparent" }}
              data-ocid="cohort_detail.export_report.button"
            >
              Export Cohort Report
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-none text-xs font-semibold h-8 border-2"
              style={{
                borderColor: "oklch(0.68 0.18 25)",
                color: "oklch(0.68 0.18 25)",
                background: "transparent",
              }}
              data-ocid="cohort_detail.close_case.button"
            >
              Close Cohort Case
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
