import { StarRating } from "@/components/ui/StarRating";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertTriangle,
  Award,
  BedDouble,
  Building2,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  DollarSign,
  Loader2,
  Minus,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Upload,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { CITY_PROVIDERS, MOCK_HIGH_RISK_COHORTS } from "../../data/mockData";
import {
  calcIndicatorStarRating,
  calcPayForImprovementEligibility,
  calcWeightedProviderRating,
  scoreToStarBand,
} from "../../utils/ratingEngine";

// ── Provider data (Bondi Aged Care, SYD-001) ─────────────────────────────────

const PROVIDER = CITY_PROVIDERS.Sydney?.[0]!; // SYD-001 Bondi Aged Care

const PERFORMANCE_INDICATORS = [
  {
    code: "SAF-001",
    name: "Falls with Harm Rate",
    rate: 4.2,
    benchmark: 5.1,
    quintile: 2,
    trend: "improving" as const,
    unit: "/1000 care days",
  },
  {
    code: "SAF-002",
    name: "Medication-Related Harm",
    rate: 2.8,
    benchmark: 3.2,
    quintile: 2,
    trend: "stable" as const,
    unit: "%",
  },
  {
    code: "SAF-003",
    name: "High-Risk Medication Prevalence",
    rate: 18.4,
    benchmark: 21.2,
    quintile: 2,
    trend: "improving" as const,
    unit: "%",
  },
  {
    code: "SAF-004",
    name: "Polypharmacy ≥10 Medications",
    rate: 12.1,
    benchmark: 14.8,
    quintile: 2,
    trend: "stable" as const,
    unit: "% residents",
  },
  {
    code: "SAF-005",
    name: "Pressure Injuries Stage 2–4",
    rate: 1.8,
    benchmark: 2.4,
    quintile: 2,
    trend: "improving" as const,
    unit: "/1000 care days",
  },
  {
    code: "SAF-006",
    name: "ED Presentations (30-day)",
    rate: 8.4,
    benchmark: 10.2,
    quintile: 2,
    trend: "improving" as const,
    unit: "% residents",
  },
];

const SCREENING_COMPLETION = [
  { name: "Falls Risk Assessment", completed: 84, total: 95 },
  { name: "Medication Review", completed: 78, total: 95 },
  { name: "Cognitive Assessment", completed: 71, total: 95 },
  { name: "Nutrition Assessment", completed: 88, total: 95 },
  { name: "Pain Assessment", completed: 92, total: 95 },
  { name: "Behavioral Assessment", completed: 74, total: 95 },
];

const RECOMMENDED_ACTIONS = [
  "Medication review required for 3 residents with polypharmacy ≥10 medications",
  "Falls prevention intervention recommended for 2 residents with recent incidents",
  "Nutrition assessment overdue for 4 residents — refer to dietitian",
  "Cognitive reassessment required for 2 residents flagged in Q3 screening bundle",
  "Advance care planning review required for 5 residents — plan expired",
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function getTrendIcon(trend: "improving" | "declining" | "stable") {
  if (trend === "improving")
    return (
      <TrendingUp
        className="w-3.5 h-3.5 text-gov-green"
        aria-label="Improving"
      />
    );
  if (trend === "declining")
    return (
      <TrendingDown
        className="w-3.5 h-3.5 text-gov-red"
        aria-label="Declining"
      />
    );
  return (
    <Minus className="w-3.5 h-3.5 text-muted-foreground" aria-label="Stable" />
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

export default function ProviderDashboard() {
  const [submitQuarter, setSubmitQuarter] = useState("Q4-2025");
  const [submitType, setSubmitType] = useState("fhir");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  // Calculate indicator star ratings using ratingEngine
  const indicatorRatings = PERFORMANCE_INDICATORS.map((ind) => ({
    ...ind,
    starRating: calcIndicatorStarRating(ind.quintile, ind.trend),
  }));

  // For the weighted provider rating use PROVIDER indicators as domain proxies
  const domainScores = {
    safety: PROVIDER.indicators.safetyClinical,
    preventive: PROVIDER.indicators.preventiveCare,
    quality: PROVIDER.indicators.qualityMeasures,
    staffing: PROVIDER.indicators.staffing,
    compliance: PROVIDER.indicators.compliance,
    experience:
      (PROVIDER.indicators.residents + PROVIDER.indicators.experience) / 2,
  };
  const { score: overallScore } = calcWeightedProviderRating(domainScores);
  const overallStars = scoreToStarBand(overallScore);

  // PFI eligibility — safety improvement 18% (simulated)
  const safetyImprovement = 18;
  const eligibility = calcPayForImprovementEligibility(
    overallStars,
    safetyImprovement,
  );

  // High-risk cohorts for this provider (HYD-001 mapped to PROV-001 for demo)
  const activeCohorts = MOCK_HIGH_RISK_COHORTS.filter(
    (c) => c.providerId === "PROV-001" && c.status === "active",
  );

  function handleSubmit() {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setFileName(null);
      toast.success("Data submission received successfully.", {
        description: `${submitType.toUpperCase()} data for ${submitQuarter} has been queued for processing.`,
      });
    }, 1500);
  }

  return (
    <div className="p-6 space-y-5">
      {/* 1. Facility Header */}
      <div
        className="p-4 border rounded-none"
        style={{
          background: "oklch(0.96 0.015 254)",
          borderColor: "oklch(0.82 0.05 254)",
        }}
        data-ocid="provider.facility.panel"
      >
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Building2
                className="w-5 h-5"
                style={{ color: "oklch(var(--gov-navy))" }}
              />
              <h1 className="text-xl font-bold text-gov-navy">
                {PROVIDER.name}
              </h1>
            </div>
            <div
              className="flex flex-wrap gap-4 text-xs mt-1"
              style={{ color: "oklch(0.48 0.025 250)" }}
            >
              <span className="flex items-center gap-1">
                <BedDouble className="w-3.5 h-3.5" />
                {PROVIDER.beds} beds
              </span>
              <span>{PROVIDER.type}</span>
              <span className="flex items-center gap-1">
                <CalendarDays className="w-3.5 h-3.5" />
                Established {PROVIDER.established}
              </span>
              <span>{PROVIDER.city}, Australia</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-none border"
              style={{
                background: "oklch(0.93 0.07 145)",
                borderColor: "oklch(0.72 0.12 145)",
                color: "oklch(0.28 0.14 145)",
              }}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Accredited Provider
            </span>
            <div>
              <div className="text-xs text-muted-foreground mb-0.5">
                Overall Rating
              </div>
              <StarRating value={overallScore} size="sm" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Performance Indicators */}
      <Card className="rounded-none border">
        <CardHeader className="pb-2 pt-4 px-4 border-b">
          <CardTitle className="text-sm font-semibold text-gov-navy">
            Performance Indicators — Q4-2025
          </CardTitle>
          <p
            className="text-xs mt-0.5"
            style={{ color: "oklch(0.50 0.025 250)" }}
          >
            Indicator ratings calculated from quintile position and trend
            performance
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
                  <th className="text-right">Rate</th>
                  <th className="text-right">Benchmark</th>
                  <th className="text-left">Quintile</th>
                  <th className="text-left">Trend</th>
                  <th className="text-left">Star Rating</th>
                </tr>
              </thead>
              <tbody>
                {indicatorRatings.map((ind, idx) => {
                  const qStyle = getQuintileStyle(ind.quintile);
                  return (
                    <tr
                      key={ind.code}
                      data-ocid={`provider.indicator.row.${idx + 1}`}
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
                      <td>
                        <StarRating
                          value={ind.starRating}
                          size="sm"
                          showLabel={false}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 3. Screening Completion */}
      <Card className="rounded-none border">
        <CardHeader className="pb-2 pt-4 px-4 border-b">
          <CardTitle className="text-sm font-semibold text-gov-navy">
            Screening Bundle Completion
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SCREENING_COMPLETION.map((s, idx) => {
              const pct = Math.round((s.completed / s.total) * 100);
              const isLow = pct < 75;
              return (
                <div
                  key={s.name}
                  data-ocid={`provider.screening.item.${idx + 1}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <ClipboardCheck
                        className="w-3.5 h-3.5 flex-shrink-0"
                        style={{
                          color: isLow
                            ? "oklch(0.48 0.20 25)"
                            : "oklch(0.45 0.15 145)",
                        }}
                      />
                      <span
                        className="text-xs font-semibold"
                        style={{ color: "oklch(0.30 0.06 254)" }}
                      >
                        {s.name}
                      </span>
                    </div>
                    <span
                      className="text-xs font-bold tabular-nums"
                      style={{
                        color: isLow
                          ? "oklch(0.48 0.20 25)"
                          : "oklch(0.38 0.14 145)",
                      }}
                    >
                      {pct}%
                    </span>
                  </div>
                  <Progress
                    value={pct}
                    className="h-2 rounded-none"
                    style={
                      isLow
                        ? ({
                            "--progress-fill": "oklch(0.52 0.22 25)",
                          } as React.CSSProperties)
                        : undefined
                    }
                  />
                  <div
                    className="text-xs mt-0.5"
                    style={{ color: "oklch(0.55 0.02 240)" }}
                  >
                    {s.completed} of {s.total} residents
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* 4. High-Risk Cohort Alerts */}
        <Card className="rounded-none border">
          <CardHeader className="pb-2 pt-4 px-4 border-b">
            <CardTitle className="text-sm font-semibold text-gov-navy flex items-center gap-2">
              <AlertTriangle
                className="w-4 h-4"
                style={{ color: "oklch(0.52 0.22 25)" }}
              />
              High-Risk Cohort Alerts
            </CardTitle>
          </CardHeader>
          <CardContent
            className="p-4 space-y-3"
            data-ocid="provider.cohort.panel"
          >
            {activeCohorts.length === 0 ? (
              <div
                className="text-sm text-muted-foreground"
                data-ocid="provider.cohort.empty_state"
              >
                No active high-risk cohorts at this time.
              </div>
            ) : (
              activeCohorts.map((cohort, idx) => (
                <div
                  key={cohort.id}
                  className="border p-3"
                  style={{
                    background: "oklch(0.97 0.025 25)",
                    borderColor: "oklch(0.72 0.14 25)",
                  }}
                  data-ocid={`provider.cohort.item.${idx + 1}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="font-bold text-xs"
                          style={{ color: "oklch(var(--gov-navy))" }}
                        >
                          {cohort.id}
                        </span>
                        <span
                          className="inline-flex items-center px-2 py-0.5 text-xs font-bold rounded-none"
                          style={{
                            background:
                              cohort.urgency === "high"
                                ? "oklch(0.52 0.22 25)"
                                : "oklch(0.70 0.14 72)",
                            color: "#fff",
                          }}
                        >
                          {cohort.urgency.toUpperCase()}
                        </span>
                      </div>
                      <div
                        className="text-xs"
                        style={{ color: "oklch(0.38 0.06 254)" }}
                      >
                        {cohort.cohortSize} residents flagged ·{" "}
                        {cohort.riskCriteria
                          .split(",")
                          .map((c) => c.replace(/_/g, " "))
                          .join(", ")}
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-xs rounded-none flex-shrink-0"
                      style={{
                        borderColor: "oklch(0.48 0.20 25)",
                        color: "oklch(0.42 0.20 25)",
                      }}
                    >
                      ACTIVE
                    </Badge>
                  </div>
                </div>
              ))
            )}
            <p className="text-xs" style={{ color: "oklch(0.50 0.025 250)" }}>
              View full details in the High-Risk Cohort Monitoring dashboard.
            </p>
          </CardContent>
        </Card>

        {/* 5. Recommended Actions */}
        <Card className="rounded-none border">
          <CardHeader className="pb-2 pt-4 px-4 border-b">
            <CardTitle className="text-sm font-semibold text-gov-navy">
              Recommended Actions
            </CardTitle>
            <p
              className="text-xs mt-0.5"
              style={{ color: "oklch(0.50 0.025 250)" }}
            >
              System-generated interventions based on indicator performance
            </p>
          </CardHeader>
          <CardContent className="p-4">
            <ul className="space-y-2.5" data-ocid="provider.actions.list">
              {RECOMMENDED_ACTIONS.map((action, idx) => (
                <li
                  key={action.slice(0, 30)}
                  className="flex items-start gap-2 text-xs"
                  data-ocid={`provider.action.item.${idx + 1}`}
                >
                  <AlertTriangle
                    className="w-3.5 h-3.5 flex-shrink-0 mt-0.5"
                    style={{ color: "oklch(0.52 0.22 25)" }}
                  />
                  <span style={{ color: "oklch(0.30 0.06 254)" }}>
                    {action}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* 6. Pay-for-Improvement Eligibility */}
      <Card
        className="rounded-none border"
        style={{
          background: eligibility.eligible
            ? "oklch(0.96 0.025 145)"
            : "oklch(0.97 0.01 240)",
          borderColor: eligibility.eligible
            ? "oklch(0.72 0.12 145)"
            : "oklch(0.82 0.01 240)",
        }}
        data-ocid="provider.pfi.panel"
      >
        <CardHeader
          className="pb-2 pt-4 px-4 border-b"
          style={{
            borderColor: eligibility.eligible
              ? "oklch(0.82 0.08 145)"
              : "oklch(0.82 0.01 240)",
          }}
        >
          <CardTitle className="text-sm font-semibold text-gov-navy flex items-center gap-2">
            <DollarSign
              className="w-4 h-4"
              style={{ color: "oklch(var(--gov-gold-dark))" }}
            />
            Pay-for-Improvement Eligibility
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {eligibility.eligible ? (
                  <CheckCircle2
                    className="w-5 h-5"
                    style={{ color: "oklch(0.45 0.15 145)" }}
                  />
                ) : (
                  <AlertTriangle
                    className="w-5 h-5"
                    style={{ color: "oklch(0.52 0.22 25)" }}
                  />
                )}
                <span
                  className="font-bold text-base"
                  style={{
                    color: eligibility.eligible
                      ? "oklch(0.28 0.14 145)"
                      : "oklch(0.48 0.20 25)",
                  }}
                >
                  {eligibility.tier}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table
                  className="text-xs w-full"
                  style={{ borderCollapse: "collapse" }}
                >
                  <thead>
                    <tr
                      style={{ borderBottom: "1px solid oklch(0.82 0.06 145)" }}
                    >
                      <th
                        className="text-left py-1.5 pr-4 font-semibold"
                        style={{ color: "oklch(0.46 0.025 250)" }}
                      >
                        Metric
                      </th>
                      <th
                        className="text-right py-1.5 pr-4 font-semibold"
                        style={{ color: "oklch(0.46 0.025 250)" }}
                      >
                        Current
                      </th>
                      <th
                        className="text-right py-1.5 font-semibold"
                        style={{ color: "oklch(0.46 0.025 250)" }}
                      >
                        Threshold
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      style={{ borderBottom: "1px solid oklch(0.88 0.04 145)" }}
                    >
                      <td
                        className="py-1.5 pr-4"
                        style={{ color: "oklch(0.30 0.06 254)" }}
                      >
                        Overall Provider Rating
                      </td>
                      <td
                        className="text-right pr-4 font-bold"
                        style={{
                          color:
                            overallStars >= 4
                              ? "oklch(0.38 0.14 145)"
                              : "oklch(0.48 0.20 25)",
                        }}
                      >
                        {overallStars} stars
                      </td>
                      <td
                        className="text-right font-semibold"
                        style={{ color: "oklch(0.46 0.025 250)" }}
                      >
                        ≥ 4 stars
                      </td>
                    </tr>
                    <tr>
                      <td
                        className="py-1.5 pr-4"
                        style={{ color: "oklch(0.30 0.06 254)" }}
                      >
                        Safety Indicator Improvement
                      </td>
                      <td
                        className="text-right pr-4 font-bold"
                        style={{
                          color:
                            safetyImprovement >= 15
                              ? "oklch(0.38 0.14 145)"
                              : "oklch(0.48 0.20 25)",
                        }}
                      >
                        {safetyImprovement}%
                      </td>
                      <td
                        className="text-right font-semibold"
                        style={{ color: "oklch(0.46 0.025 250)" }}
                      >
                        ≥ 15%
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            {eligibility.eligible && (
              <div
                className="flex-shrink-0 text-center p-3 border rounded-none"
                style={{
                  background: "#fff",
                  borderColor: "oklch(0.72 0.12 145)",
                }}
              >
                <Award
                  className="w-6 h-6 mx-auto mb-1"
                  style={{ color: "oklch(var(--gov-gold-dark))" }}
                />
                <div
                  className="text-2xl font-black"
                  style={{ color: "oklch(var(--gov-gold-dark))" }}
                >
                  ${eligibility.estimatedPayment.toLocaleString()}
                </div>
                <div
                  className="text-xs font-semibold mt-0.5"
                  style={{ color: "oklch(0.50 0.025 250)" }}
                >
                  Estimated Incentive
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 7. Data Submission Portal */}
      <Card className="rounded-none border">
        <CardHeader className="pb-2 pt-4 px-4 border-b">
          <CardTitle className="text-sm font-semibold text-gov-navy">
            Data Submission Portal
          </CardTitle>
          <p
            className="text-xs mt-0.5"
            style={{ color: "oklch(0.50 0.025 250)" }}
          >
            Submit clinical and operational data for quarterly reporting
          </p>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            {/* Quarter */}
            <div>
              <Label
                htmlFor="submit-quarter"
                className="text-xs font-bold uppercase tracking-wide mb-1.5 block"
                style={{ color: "oklch(0.46 0.025 250)" }}
              >
                Reporting Quarter
              </Label>
              <Select value={submitQuarter} onValueChange={setSubmitQuarter}>
                <SelectTrigger
                  id="submit-quarter"
                  className="rounded-none h-9 text-xs"
                  data-ocid="provider.submit.quarter.select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-none">
                  {["Q1-2026", "Q4-2025", "Q3-2025", "Q2-2025"].map((q) => (
                    <SelectItem key={q} value={q} className="text-xs">
                      {q}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Submission Type */}
            <div>
              <Label
                htmlFor="submit-type"
                className="text-xs font-bold uppercase tracking-wide mb-1.5 block"
                style={{ color: "oklch(0.46 0.025 250)" }}
              >
                Submission Type
              </Label>
              <Select value={submitType} onValueChange={setSubmitType}>
                <SelectTrigger
                  id="submit-type"
                  className="rounded-none h-9 text-xs"
                  data-ocid="provider.submit.type.select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-none">
                  <SelectItem value="fhir" className="text-xs">
                    FHIR API
                  </SelectItem>
                  <SelectItem value="csv" className="text-xs">
                    CSV Upload
                  </SelectItem>
                  <SelectItem value="manual" className="text-xs">
                    Manual Entry
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* File upload (CSV only) */}
            <div>
              <Label
                className="text-xs font-bold uppercase tracking-wide mb-1.5 block"
                style={{ color: "oklch(0.46 0.025 250)" }}
              >
                {submitType === "csv"
                  ? "Upload CSV File"
                  : "Data File (Optional)"}
              </Label>
              <div className="relative">
                <input
                  type="file"
                  accept=".csv,.json,.xml"
                  id="file-upload"
                  className="sr-only"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setFileName(file.name);
                  }}
                />
                <label
                  htmlFor="file-upload"
                  className="flex items-center gap-2 w-full h-9 px-3 border text-xs cursor-pointer transition-colors hover:bg-muted rounded-none"
                  style={{
                    borderColor: "oklch(var(--border))",
                    color: fileName
                      ? "oklch(0.30 0.06 254)"
                      : "oklch(0.55 0.02 240)",
                  }}
                  data-ocid="provider.submit.upload_button"
                >
                  <Upload className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">
                    {fileName ?? "Choose file..."}
                  </span>
                </label>
              </div>
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="rounded-none text-xs font-bold px-6 h-9"
            style={{ background: "oklch(var(--gov-navy))", color: "#fff" }}
            data-ocid="provider.submit.submit_button"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Data"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
