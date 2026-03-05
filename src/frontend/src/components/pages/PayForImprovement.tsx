import { StarRating } from "@/components/ui/StarRating";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckCircle2,
  DollarSign,
  RefreshCw,
  TrendingUp,
  XCircle,
} from "lucide-react";
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
  CITY_PROVIDERS,
  PAY_FOR_IMPROVEMENT_DATA,
  PAY_FOR_IMPROVEMENT_THRESHOLDS,
} from "../../data/mockData";
import {
  type DomainScores,
  calcWeightedProviderRating,
  scoreToStarBand,
} from "../../utils/ratingEngine";

// ── Provider star rating lookup ───────────────────────────────────────────────

// Map PFI provider names to city providers for rating lookup
const ALL_CITY_PROVIDERS = Object.values(CITY_PROVIDERS).flat();

function getProviderOverallStars(providerName: string): number | null {
  const found = ALL_CITY_PROVIDERS.find((p) => p.name === providerName);
  if (!found) return null;
  const domains: DomainScores = {
    safety: found.indicators.safetyClinical,
    preventive: found.indicators.preventiveCare,
    quality: found.indicators.qualityMeasures,
    staffing: found.indicators.staffing,
    compliance: found.indicators.compliance,
    experience: (found.indicators.residents + found.indicators.experience) / 2,
  };
  const { score } = calcWeightedProviderRating(domains);
  return scoreToStarBand(score);
}

interface PayForImprovementProps {
  currentQuarter: string;
}

export default function PayForImprovement({
  currentQuarter,
}: PayForImprovementProps) {
  const eligibleCount = PAY_FOR_IMPROVEMENT_DATA.filter(
    (d) => d.eligible,
  ).length;
  const totalFunding = PAY_FOR_IMPROVEMENT_DATA.reduce(
    (sum, d) => sum + d.funding,
    0,
  );

  const chartData = PAY_FOR_IMPROVEMENT_THRESHOLDS.map((threshold) => {
    const records = PAY_FOR_IMPROVEMENT_DATA.filter(
      (d) => d.metric === threshold.metric,
    );
    const avgImprovement =
      records.length > 0
        ? records.reduce((sum, r) => sum + r.improvement, 0) / records.length
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

      {/* Ratings synchronized banner */}
      <div
        className="flex items-center gap-3 px-4 py-2.5 border text-xs"
        style={{
          background: "oklch(0.97 0.01 254)",
          borderColor: "oklch(0.82 0.05 254)",
          color: "oklch(0.40 0.04 254)",
        }}
        data-ocid="pfi.sync.panel"
      >
        <RefreshCw
          className="w-3.5 h-3.5 flex-shrink-0"
          style={{ color: "oklch(0.45 0.15 145)" }}
        />
        <div className="flex items-center gap-1.5 flex-wrap font-semibold">
          <CheckCircle2 className="w-3.5 h-3.5 text-gov-green flex-shrink-0" />
          <span className="text-gov-green font-bold">Ratings Synchronized</span>
          <span className="text-muted-foreground font-normal mx-1">·</span>
          <span>Indicator Performance</span>
          <span>→</span>
          <span>Indicator Rating</span>
          <span>→</span>
          <span>Provider Scorecard</span>
          <span>→</span>
          <span>Overall Rating</span>
          <span>→</span>
          <span>Pay-for-Improvement Eligibility</span>
        </div>
      </div>

      {/* Eligibility Logic Explanation */}
      <Card className="rounded-none border">
        <CardHeader className="pb-2 pt-4 px-4 border-b">
          <CardTitle className="text-sm font-semibold text-gov-navy">
            Eligibility Logic — How Ratings Drive Incentives
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
                Bonus Incentive
              </div>
              <div
                className="text-xs space-y-0.5"
                style={{ color: "oklch(0.30 0.06 254)" }}
              >
                <p>Overall rating ≥ 4 stars</p>
                <p>AND Safety improvement ≥ 15%</p>
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
                Base Incentive
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
                  <th className="text-right">Baseline</th>
                  <th className="text-right">Current</th>
                  <th className="text-right">Improvement %</th>
                  <th className="text-right">Threshold Required</th>
                  <th className="text-left">Overall Rating</th>
                  <th className="text-left">Funding Eligible</th>
                  <th className="text-right">Est. Funding</th>
                </tr>
              </thead>
              <tbody>
                {PAY_FOR_IMPROVEMENT_DATA.map((row) => {
                  const aboveThreshold =
                    row.improvement >=
                    (PAY_FOR_IMPROVEMENT_THRESHOLDS.find(
                      (t) => t.metric === row.metric,
                    )?.threshold || 0);
                  const overallStars = getProviderOverallStars(row.provider);
                  return (
                    <tr key={row.id}>
                      <td className="font-medium">{row.provider}</td>
                      <td>{row.metric}</td>
                      <td className="text-right">{row.baseline.toFixed(1)}%</td>
                      <td className="text-right">{row.current.toFixed(1)}%</td>
                      <td
                        className="text-right font-bold"
                        style={{
                          color: aboveThreshold
                            ? "oklch(var(--gov-green))"
                            : "oklch(var(--gov-red))",
                        }}
                      >
                        {row.improvement.toFixed(1)}%
                      </td>
                      <td className="text-right text-muted-foreground">
                        {PAY_FOR_IMPROVEMENT_THRESHOLDS.find(
                          (t) => t.metric === row.metric,
                        )?.threshold ?? "—"}
                        %
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
                        {row.eligible ? (
                          <span className="badge-green">ELIGIBLE</span>
                        ) : (
                          <span className="badge-red">NOT ELIGIBLE</span>
                        )}
                      </td>
                      <td className="text-right font-semibold">
                        {row.funding > 0
                          ? `$${row.funding.toLocaleString()}`
                          : "—"}
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
