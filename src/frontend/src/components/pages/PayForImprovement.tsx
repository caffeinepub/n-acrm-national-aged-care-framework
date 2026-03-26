import { IncentiveEligibilityBadge } from "@/components/ui/IncentiveEligibilityBadge";
import { PerformanceAlertModal } from "@/components/ui/PerformanceAlertModal";
import { StarRating } from "@/components/ui/StarRating";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  calcBenchmarkImprovement,
  calcIncentiveEligibilityTier,
} from "@/utils/benchmarkUtils";
import type {
  IndicatorForAlert,
  PerformanceAlert,
} from "@/utils/performanceAlerts";
import { resolveAlertToShow } from "@/utils/performanceAlerts";
import {
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  MOCK_PROVIDERS,
  PAY_FOR_IMPROVEMENT_DATA,
  PAY_FOR_IMPROVEMENT_THRESHOLDS,
  UNIFIED_PROVIDERS,
  getProviderRatingForQuarter,
  getUnifiedProviderDomainScores,
} from "../../data/mockData";
import {
  calcWeightedProviderRating,
  overallScoreToStars,
  scoreToStarBand,
} from "../../utils/ratingEngine";

// ── Benchmark values for each P4I metric ─────────────────────────────────────

const METRIC_BENCHMARKS: Record<
  string,
  { benchmarkValue: number; isLowerBetter: boolean }
> = {
  "ED Reduction 90-Day": { benchmarkValue: 11.2, isLowerBetter: true },
  "Hospitalization Reduction": { benchmarkValue: 9.0, isLowerBetter: true },
  "Deprescribing Rate": { benchmarkValue: 20.0, isLowerBetter: false },
  "Screening Completion": { benchmarkValue: 85.0, isLowerBetter: false },
  "Social Participation": { benchmarkValue: 55.0, isLowerBetter: false },
};

// ── Improvement % calculator (correct formula) ───────────────────────────────
// Formula: ((Current − Previous) / |Previous|) × 100
// Direction-aware: for lower-is-better metrics, a decrease is positive improvement.
// Capped at ±100% to prevent unrealistic values from edge-case data.
const MAX_IMPROVEMENT_PCT = 100;

function computeImprovementPct(
  baseline: number,
  current: number,
  isLowerBetter: boolean,
): number {
  if (baseline === 0) return 0;
  let pct: number;
  if (isLowerBetter) {
    // Improvement = reduction from baseline
    pct = ((baseline - current) / Math.abs(baseline)) * 100;
  } else {
    // Improvement = increase from baseline
    pct = ((current - baseline) / Math.abs(baseline)) * 100;
  }
  // Cap to prevent unrealistic percentages (e.g. 3025%)
  return Math.max(-MAX_IMPROVEMENT_PCT, Math.min(MAX_IMPROVEMENT_PCT, pct));
}

// ── Provider star rating lookup ───────────────────────────────────────────────

function getProviderOverallStars(
  providerName: string,
  q = "Q4-2025",
): number | null {
  // First try UNIFIED_PROVIDERS (covers all city-based providers)
  const unified = UNIFIED_PROVIDERS.find(
    (p) => p.name.toLowerCase() === providerName.toLowerCase(),
  );
  if (unified) {
    // Use quarter-aware calculation instead of static overallStars
    return getProviderRatingForQuarter(unified.id, q).stars;
  }

  // Fall back to MOCK_PROVIDERS (legacy PROV-xxx based providers)
  const legacy = MOCK_PROVIDERS.find(
    (p) => p.name.toLowerCase() === providerName.toLowerCase(),
  );
  if (legacy) {
    const domains = getUnifiedProviderDomainScores(legacy.id, q);
    const { stars } = calcWeightedProviderRating(domains);
    return stars;
  }

  return null;
}

interface PayForImprovementProps {
  currentQuarter: string;
}

export default function PayForImprovement({
  currentQuarter,
}: PayForImprovementProps) {
  const [alertOpen, setAlertOpen] = useState(false);
  const [currentAlert, setCurrentAlert] = useState<PerformanceAlert | null>(
    null,
  );

  function handleViewAlert(providerName: string) {
    const overallStars = getProviderOverallStars(providerName, currentQuarter);
    if (overallStars === null) return;
    // Build minimal indicator set from domain scores for the provider
    const unified = UNIFIED_PROVIDERS.find(
      (p) => p.name.toLowerCase() === providerName.toLowerCase(),
    );
    const alertIndicators: IndicatorForAlert[] = unified
      ? [
          {
            label: "Safety & Clinical",
            score: overallScoreToStars(unified.domainScores.safety),
          },
          {
            label: "Preventive Care",
            score: overallScoreToStars(unified.domainScores.preventive),
          },
          {
            label: "Staffing",
            score: overallScoreToStars(unified.domainScores.staffing),
          },
          {
            label: "Compliance",
            score: overallScoreToStars(unified.domainScores.compliance),
          },
          {
            label: "Residents Experience",
            score: overallScoreToStars(unified.domainScores.experience),
          },
          {
            label: "Quality Measures",
            score: overallScoreToStars(unified.domainScores.quality),
          },
        ]
      : [{ label: "Overall Performance", score: overallStars }];
    const alert = resolveAlertToShow(
      providerName,
      overallStars,
      alertIndicators,
    );
    if (alert) {
      setCurrentAlert(alert);
      setAlertOpen(true);
    }
  }

  const eligibleCount = PAY_FOR_IMPROVEMENT_DATA.filter((d) => {
    const mb = METRIC_BENCHMARKS[d.metric];
    const threshold = PAY_FOR_IMPROVEMENT_THRESHOLDS.find(
      (t) => t.metric === d.metric,
    );
    const imp = mb
      ? computeImprovementPct(d.baseline, d.current, mb.isLowerBetter)
      : computeImprovementPct(d.baseline, d.current, false);
    return imp >= (threshold?.threshold ?? 0);
  }).length;
  const totalFunding = PAY_FOR_IMPROVEMENT_DATA.reduce(
    (sum, d) => sum + d.funding,
    0,
  );

  const chartData = PAY_FOR_IMPROVEMENT_THRESHOLDS.map((threshold) => {
    const records = PAY_FOR_IMPROVEMENT_DATA.filter(
      (d) => d.metric === threshold.metric,
    );
    const mb = METRIC_BENCHMARKS[threshold.metric];
    const avgImprovement =
      records.length > 0
        ? records.reduce((sum, r) => {
            const imp = computeImprovementPct(
              r.baseline,
              r.current,
              mb?.isLowerBetter ?? false,
            );
            return sum + imp;
          }, 0) / records.length
        : 0;
    return {
      metric: threshold.metric,
      improvement: Number.parseFloat(avgImprovement.toFixed(1)),
      threshold: threshold.threshold,
      eligible: avgImprovement >= threshold.threshold,
    };
  });

  return (
    <div className="p-6 space-y-5">
      <div className="border-b pb-4">
        <h1 className="text-xl font-bold text-gov-navy">
          Pay-for-Improvement Tracker
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {currentQuarter} Eligibility Report — Improvement metrics and funding
          eligibility assessment
        </p>
      </div>

      {/* Eligibility Logic Explanation */}
      <Card className="rounded-none border">
        <CardHeader className="pb-2 pt-4 px-4 border-b">
          <CardTitle className="text-sm font-semibold text-gov-navy">
            Eligibility Logic — How Ratings Drive Incentives
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div
              className="border p-3"
              style={{
                background: "oklch(0.95 0.04 145)",
                borderColor: "oklch(0.62 0.18 145)",
              }}
              data-ocid="pfi.eligibility.maximum.card"
            >
              <div
                className="text-xs font-bold uppercase tracking-wide mb-1"
                style={{ color: "oklch(0.22 0.18 145)" }}
              >
                Maximum Eligible
              </div>
              <div
                className="text-xs space-y-0.5"
                style={{ color: "oklch(0.30 0.06 254)" }}
              >
                <p>Overall rating ≥ 4 stars</p>
                <p>AND Safety improvement ≥ 10%</p>
                <p>AND Screening ≥ 85%</p>
              </div>
              <div
                className="mt-2 font-bold text-sm"
                style={{ color: "oklch(var(--gov-gold-dark))" }}
              >
                Est. $180,000
              </div>
            </div>
            <div
              className="border p-3"
              style={{
                background: "oklch(0.96 0.025 145)",
                borderColor: "oklch(0.72 0.12 145)",
              }}
              data-ocid="pfi.eligibility.bonus.card"
            >
              <div
                className="text-xs font-bold uppercase tracking-wide mb-1"
                style={{ color: "oklch(0.28 0.14 145)" }}
              >
                Bonus Eligible
              </div>
              <div
                className="text-xs space-y-0.5"
                style={{ color: "oklch(0.30 0.06 254)" }}
              >
                <p>Overall rating ≥ 4 stars</p>
                <p>AND Safety improvement ≥ 10%</p>
              </div>
              <div
                className="mt-2 font-bold text-sm"
                style={{ color: "oklch(var(--gov-gold-dark))" }}
              >
                Est. $120,000
              </div>
            </div>
            <div
              className="border p-3"
              style={{
                background: "oklch(0.97 0.03 80)",
                borderColor: "oklch(0.75 0.12 75)",
              }}
              data-ocid="pfi.eligibility.base.card"
            >
              <div
                className="text-xs font-bold uppercase tracking-wide mb-1"
                style={{ color: "oklch(0.43 0.14 72)" }}
              >
                Base Eligible
              </div>
              <div
                className="text-xs space-y-0.5"
                style={{ color: "oklch(0.30 0.06 254)" }}
              >
                <p>Overall rating ≥ 4 stars</p>
                <p>Safety improvement any %</p>
              </div>
              <div
                className="mt-2 font-bold text-sm"
                style={{ color: "oklch(var(--gov-gold-dark))" }}
              >
                Est. $75,000
              </div>
            </div>
            <div
              className="border p-3"
              style={{
                background: "oklch(0.97 0.01 240)",
                borderColor: "oklch(0.82 0.01 240)",
              }}
              data-ocid="pfi.eligibility.not.card"
            >
              <div
                className="text-xs font-bold uppercase tracking-wide mb-1"
                style={{ color: "oklch(0.48 0.02 240)" }}
              >
                Not Eligible
              </div>
              <div
                className="text-xs space-y-0.5"
                style={{ color: "oklch(0.30 0.06 254)" }}
              >
                <p>Overall rating &lt; 4 stars</p>
                <p>Improvement below threshold</p>
              </div>
              <div
                className="mt-2 font-bold text-sm"
                style={{ color: "oklch(0.55 0.02 240)" }}
              >
                $0
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="rounded-none border">
          <CardContent className="p-3 flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-gov-navy flex-shrink-0" />
            <div>
              <div className="text-xs text-muted-foreground uppercase font-semibold">
                Total Records
              </div>
              <div className="text-2xl font-bold text-gov-navy">
                {PAY_FOR_IMPROVEMENT_DATA.length}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-none border">
          <CardContent className="p-3 flex items-center gap-3">
            <CheckCircle2
              className="w-6 h-6 flex-shrink-0"
              style={{ color: "oklch(var(--gov-green))" }}
            />
            <div>
              <div className="text-xs text-muted-foreground uppercase font-semibold">
                Eligible
              </div>
              <div
                className="text-2xl font-bold"
                style={{ color: "oklch(var(--gov-green))" }}
              >
                {eligibleCount}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-none border">
          <CardContent className="p-3 flex items-center gap-3">
            <XCircle
              className="w-6 h-6 flex-shrink-0"
              style={{ color: "oklch(var(--gov-red))" }}
            />
            <div>
              <div className="text-xs text-muted-foreground uppercase font-semibold">
                Not Eligible
              </div>
              <div
                className="text-2xl font-bold"
                style={{ color: "oklch(var(--gov-red))" }}
              >
                {PAY_FOR_IMPROVEMENT_DATA.length - eligibleCount}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-none border">
          <CardContent className="p-3 flex items-center gap-3">
            <DollarSign
              className="w-6 h-6 flex-shrink-0"
              style={{ color: "oklch(var(--gov-gold-dark))" }}
            />
            <div>
              <div className="text-xs text-muted-foreground uppercase font-semibold">
                Est. Total Funding
              </div>
              <div
                className="text-xl font-bold"
                style={{ color: "oklch(var(--gov-gold-dark))" }}
              >
                ${(totalFunding / 1000).toFixed(0)}k
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main table */}
      <Card className="rounded-none border">
        <CardHeader className="pb-2 pt-4 px-4 border-b">
          <CardTitle className="text-sm font-semibold text-gov-navy">
            {currentQuarter} Pay-for-Improvement Eligibility Report
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full gov-table">
              <thead>
                <tr>
                  <th className="text-left">Provider</th>
                  <th className="text-left">Metric Type</th>
                  <th className="text-right">Benchmark</th>
                  <th className="text-right">Baseline</th>
                  <th className="text-right">Current</th>
                  <th className="text-right">vs Benchmark %</th>
                  <th className="text-right">vs Baseline %</th>
                  <th className="text-right">Threshold</th>
                  <th className="text-left">Overall Rating</th>
                  <th className="text-left">Funding Eligible</th>
                  <th className="text-right">Est. Funding</th>
                  <th className="text-center">Alert</th>
                </tr>
              </thead>
              <tbody>
                {PAY_FOR_IMPROVEMENT_DATA.map((row) => {
                  const threshold = PAY_FOR_IMPROVEMENT_THRESHOLDS.find(
                    (t) => t.metric === row.metric,
                  );
                  const metricBenchmark = METRIC_BENCHMARKS[row.metric];

                  // Compute improvement using correct formula:
                  // ((Current − Previous) / |Previous|) × 100, capped at ±100%
                  const computedImprovementPct = computeImprovementPct(
                    row.baseline,
                    row.current,
                    metricBenchmark?.isLowerBetter ?? false,
                  );
                  const aboveThreshold =
                    computedImprovementPct >= (threshold?.threshold || 0);
                  const overallStars = getProviderOverallStars(
                    row.provider,
                    currentQuarter,
                  );

                  // Dynamic eligibility: must meet improvement threshold AND have eligible rating tier
                  // High-performing providers (>= 4.0 stars) are always eligible
                  const ratingEligible =
                    overallStars !== null
                      ? calcIncentiveEligibilityTier(overallStars, 0, 1)
                          .eligible
                      : false;
                  const dynamicEligible =
                    ratingEligible &&
                    (aboveThreshold ||
                      (overallStars !== null && overallStars >= 4.5));

                  // Benchmark improvement %
                  let vsBenchmarkPct: number | null = null;
                  if (metricBenchmark) {
                    vsBenchmarkPct = calcBenchmarkImprovement(
                      row.current,
                      metricBenchmark.benchmarkValue,
                      metricBenchmark.isLowerBetter,
                    );
                  }

                  // Baseline improvement % (same as computedImprovementPct, shown separately)
                  const vsBaselinePct = computedImprovementPct;

                  const benchmarkColor = (pct: number) =>
                    pct >= 0
                      ? "oklch(var(--gov-green))"
                      : "oklch(var(--gov-red))";

                  return (
                    <tr key={row.id}>
                      <td className="font-medium">{row.provider}</td>
                      <td>{row.metric}</td>
                      <td className="text-right text-muted-foreground text-xs">
                        {metricBenchmark
                          ? `${metricBenchmark.benchmarkValue}${metricBenchmark.isLowerBetter ? "" : "%"}`
                          : "—"}
                      </td>
                      <td className="text-right">{row.baseline.toFixed(1)}%</td>
                      <td className="text-right">{row.current.toFixed(1)}%</td>
                      <td className="text-right">
                        {vsBenchmarkPct !== null ? (
                          <span
                            className="font-bold text-xs"
                            style={{ color: benchmarkColor(vsBenchmarkPct) }}
                          >
                            {vsBenchmarkPct >= 0 ? "+" : ""}
                            {vsBenchmarkPct.toFixed(1)}%
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td
                        className="text-right font-bold"
                        style={{
                          color: aboveThreshold
                            ? "oklch(var(--gov-green))"
                            : "oklch(var(--gov-red))",
                        }}
                      >
                        {vsBaselinePct >= 0 ? "+" : ""}
                        {vsBaselinePct.toFixed(1)}%
                      </td>
                      <td className="text-right text-muted-foreground">
                        {threshold?.threshold ?? "—"}%
                      </td>
                      <td>
                        {overallStars !== null ? (
                          <StarRating
                            value={overallStars}
                            size="sm"
                            showLabel={false}
                          />
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td>
                        <IncentiveEligibilityBadge
                          eligible={dynamicEligible}
                          tier={
                            overallStars !== null && overallStars >= 4.5
                              ? "Highly Eligible"
                              : undefined
                          }
                          size="sm"
                        />
                      </td>
                      <td className="text-right font-semibold">
                        {row.funding > 0
                          ? `$${row.funding.toLocaleString()}`
                          : "—"}
                      </td>
                      <td className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 rounded-none"
                          title={`View performance alert for ${row.provider}`}
                          onClick={() => handleViewAlert(row.provider)}
                          data-ocid="pfi.alert.button"
                        >
                          <AlertTriangle
                            className="w-3.5 h-3.5"
                            style={{
                              color:
                                overallStars !== null && overallStars >= 5
                                  ? "oklch(0.45 0.15 145)"
                                  : overallStars !== null && overallStars <= 2
                                    ? "oklch(0.48 0.20 25)"
                                    : "oklch(0.60 0.08 72)",
                            }}
                          />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Chart */}
      <Card className="rounded-none border">
        <CardHeader className="pb-2 pt-4 px-4 border-b">
          <CardTitle className="text-sm font-semibold text-gov-navy">
            Average Improvement % by Metric Type vs Threshold
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Dashed line indicates minimum eligibility threshold
          </p>
        </CardHeader>
        <CardContent className="p-4">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 20, bottom: 60, left: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="oklch(0.90 0.01 240)"
              />
              <XAxis
                dataKey="metric"
                tick={{ fontSize: 10 }}
                tickLine={false}
                angle={-30}
                textAnchor="end"
                interval={0}
              />
              <YAxis
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  fontSize: "12px",
                  borderRadius: "2px",
                  border: "1px solid oklch(0.87 0.012 240)",
                }}
                formatter={(value: number, name: string) => [`${value}%`, name]}
              />
              <ReferenceLine
                y={15}
                stroke="oklch(0.52 0.22 25)"
                strokeDasharray="6 3"
                label={{ value: "Min. 15%", position: "right", fontSize: 10 }}
              />
              <Bar
                dataKey="improvement"
                name="Avg. Improvement %"
                radius={[2, 2, 0, 0]}
              >
                {chartData.map((entry) => (
                  <Cell
                    key={`cell-${entry.metric}`}
                    fill={
                      entry.eligible
                        ? "oklch(0.52 0.15 145)"
                        : "oklch(0.52 0.22 25)"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Performance Alert Modal */}
      <PerformanceAlertModal
        open={alertOpen}
        onClose={() => setAlertOpen(false)}
        alert={currentAlert}
      />

      {/* Threshold configuration */}
      <Card className="rounded-none border">
        <CardHeader className="pb-2 pt-4 px-4 border-b">
          <CardTitle className="text-sm font-semibold text-gov-navy">
            Configurable Eligibility Thresholds
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Current threshold configuration for {currentQuarter}
          </p>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {PAY_FOR_IMPROVEMENT_THRESHOLDS.map((t) => (
              <div
                key={t.metric}
                className="border p-3 rounded-none"
                style={{ background: "oklch(0.97 0.01 254)" }}
              >
                <div className="font-semibold text-sm text-gov-navy mb-0.5">
                  {t.metric}
                </div>
                <div className="text-xs text-muted-foreground mb-1">
                  {t.description}
                </div>
                <div className="flex items-baseline gap-1">
                  <span
                    className="text-xl font-bold"
                    style={{ color: "oklch(var(--gov-gold-dark))" }}
                  >
                    {t.threshold}%
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {t.unit}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
