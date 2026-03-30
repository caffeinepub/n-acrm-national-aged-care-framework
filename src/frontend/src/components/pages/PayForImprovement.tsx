import { IncentiveEligibilityBadge } from "@/components/ui/IncentiveEligibilityBadge";
import { PerformanceAlertModal } from "@/components/ui/PerformanceAlertModal";
import { StarRating } from "@/components/ui/StarRating";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PerformanceAlert } from "@/utils/performanceAlerts";
import { resolveAlertToShow } from "@/utils/performanceAlerts";
import {
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  PROVIDER_MASTER,
  getProviderQuarterTrend,
  getProviderRatingForQuarter,
  getUnifiedProviderIndicators,
} from "../../data/mockData";

// ── Tier → funding map ───────────────────────────────────────────────────────
const TIER_FUNDING: Record<string, number> = {
  "Highly Eligible": 180000,
  Eligible: 75000,
  "Not Eligible": 0,
};

// ── Improvement % from indicator scores across quarters ──────────────────────
function deriveImprovementPct(
  providerId: string,
  currentQuarter: string,
): number {
  const BASELINE_QUARTER = "Q1-2025";
  if (currentQuarter === BASELINE_QUARTER) return 0;

  const currentInds = getUnifiedProviderIndicators(providerId, currentQuarter);
  const baselineInds = getUnifiedProviderIndicators(
    providerId,
    BASELINE_QUARTER,
  );

  if (currentInds.length === 0 || baselineInds.length === 0) return 0;

  function indicatorScore(ind: {
    rate: number;
    nationalBenchmark: number;
    isLowerBetter: boolean;
  }): number {
    if (ind.nationalBenchmark === 0) return 50;
    if (ind.isLowerBetter) {
      return Math.min(100, (ind.nationalBenchmark / ind.rate) * 100);
    }
    return Math.min(100, (ind.rate / ind.nationalBenchmark) * 100);
  }

  const avgCurrent =
    currentInds.reduce((s, i) => s + indicatorScore(i), 0) / currentInds.length;
  const avgBaseline =
    baselineInds.reduce((s, i) => s + indicatorScore(i), 0) /
    baselineInds.length;

  if (avgBaseline === 0) return 0;
  const pct = ((avgCurrent - avgBaseline) / Math.abs(avgBaseline)) * 100;
  // Cap at ±50% to prevent edge-case extremes
  const capped = Math.max(-50, Math.min(50, pct));
  return Math.round(capped * 10) / 10;
}

// ── Types ────────────────────────────────────────────────────────────────────
interface ProviderRow {
  id: string;
  name: string;
  city: string;
  state: string;
  stars: number;
  tier: string;
  eligible: boolean;
  improvementPct: number;
  estimatedFunding: number;
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

  // ── Build rows from PROVIDER_MASTER ─────────────────────────────────────
  const providerRows = useMemo<ProviderRow[]>(() => {
    return PROVIDER_MASTER.map((provider) => {
      const rating = getProviderRatingForQuarter(provider.id, currentQuarter);
      const stars = rating.stars;
      const { tier: finalTier, eligible } = rating.eligibility;
      // VALIDATION: Not Eligible → funding MUST be $0
      const estimatedFunding = eligible
        ? (TIER_FUNDING[finalTier] ?? 75000)
        : 0;
      const improvementPct = deriveImprovementPct(provider.id, currentQuarter);
      return {
        id: provider.id,
        name: provider.name,
        city: provider.city,
        state: provider.state,
        stars,
        tier: finalTier,
        eligible,
        improvementPct,
        estimatedFunding,
      };
    });
  }, [currentQuarter]);

  // ── KPI summary ──────────────────────────────────────────────────────────
  const eligibleCount = useMemo(
    () => providerRows.filter((r) => r.eligible).length,
    [providerRows],
  );
  const notEligibleCount = useMemo(
    () => providerRows.filter((r) => !r.eligible).length,
    [providerRows],
  );
  const totalFunding = useMemo(
    () => providerRows.reduce((s, r) => s + r.estimatedFunding, 0),
    [providerRows],
  );

  // ── Chart data ───────────────────────────────────────────────────────────
  const chartData = useMemo(() => {
    const tiers = ["Highly Eligible", "Eligible", "Not Eligible"];
    return tiers.map((tier) => ({
      tier:
        tier === "Highly Eligible"
          ? "Highly\nEligible"
          : tier === "Not Eligible"
            ? "Not\nEligible"
            : tier,
      label: tier,
      count: providerRows.filter((r) => r.tier === tier).length,
    }));
  }, [providerRows]);

  // ── Funding summary table ────────────────────────────────────────────────
  const fundingSummary = useMemo(() => {
    const tiers = ["Highly Eligible", "Eligible", "Not Eligible"];
    return tiers.map((tier) => {
      const rows = providerRows.filter((r) => r.tier === tier);
      const perProvider = TIER_FUNDING[tier] ?? 0;
      return {
        tier,
        count: rows.length,
        perProvider,
        totalFunding: rows.reduce((s, r) => s + r.estimatedFunding, 0),
      };
    });
  }, [providerRows]);

  // ── Alert handler ────────────────────────────────────────────────────────
  function handleViewAlert(row: ProviderRow) {
    const alert = resolveAlertToShow(row.name, row.stars, [
      { label: "Overall Performance", score: row.stars },
    ]);
    if (alert) {
      setCurrentAlert(alert);
      setAlertOpen(true);
    }
  }

  const chartFill = (label: string) => {
    if (label === "Highly Eligible") return "oklch(0.72 0.14 72)";
    if (label === "Eligible") return "oklch(0.52 0.15 145)";
    return "oklch(0.52 0.22 25)";
  };

  return (
    <div className="p-6 space-y-5">
      {/* Page header */}
      <div className="border-b pb-4">
        <h1 className="text-xl font-bold text-gov-navy">
          Pay-for-Improvement Tracker
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {currentQuarter} Eligibility Report — Provider funding eligibility
          based on centralized rating engine
        </p>
      </div>

      {/* Eligibility logic cards */}
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
                background: "oklch(0.96 0.06 80)",
                borderColor: "oklch(0.72 0.14 72)",
              }}
              data-ocid="pfi.eligibility.highly.card"
            >
              <div
                className="text-xs font-bold uppercase tracking-wide mb-1"
                style={{ color: "oklch(0.38 0.14 72)" }}
              >
                ⭐ Highly Eligible
              </div>
              <div className="text-xs space-y-0.5 text-muted-foreground">
                <p>Overall rating ≥ 4.5 stars</p>
                <p>Automatic — no threshold required</p>
              </div>
              <div
                className="mt-2 font-bold text-sm"
                style={{ color: "oklch(0.38 0.14 72)" }}
              >
                Est. $180,000
              </div>
            </div>
            <div
              className="border p-3"
              style={{
                background: "oklch(0.93 0.07 145)",
                borderColor: "oklch(0.72 0.12 145)",
              }}
              data-ocid="pfi.eligibility.eligible.card"
            >
              <div
                className="text-xs font-bold uppercase tracking-wide mb-1"
                style={{ color: "oklch(0.28 0.14 145)" }}
              >
                ✅ Eligible
              </div>
              <div className="text-xs space-y-0.5 text-muted-foreground">
                <p>Overall rating ≥ 4.0 stars</p>
                <p>Standard incentive payment</p>
              </div>
              <div
                className="mt-2 font-bold text-sm"
                style={{ color: "oklch(0.28 0.14 145)" }}
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
                ✗ Not Eligible
              </div>
              <div className="text-xs space-y-0.5 text-muted-foreground">
                <p>Overall rating &lt; 3.5 stars</p>
                <p>No incentive payment issued</p>
              </div>
              <div className="mt-2 font-bold text-sm text-muted-foreground">
                $0
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI summary row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="rounded-none border" data-ocid="pfi.total.card">
          <CardContent className="p-3 flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-gov-navy flex-shrink-0" />
            <div>
              <div className="text-xs text-muted-foreground uppercase font-semibold">
                Total Providers
              </div>
              <div className="text-2xl font-bold text-gov-navy">
                {providerRows.length}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-none border" data-ocid="pfi.eligible.card">
          <CardContent className="p-3 flex items-center gap-3">
            <CheckCircle2
              className="w-6 h-6 flex-shrink-0"
              style={{ color: "oklch(0.52 0.15 145)" }}
            />
            <div>
              <div className="text-xs text-muted-foreground uppercase font-semibold">
                Eligible (incl. Highly)
              </div>
              <div
                className="text-2xl font-bold"
                style={{ color: "oklch(0.52 0.15 145)" }}
              >
                {eligibleCount}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-none border" data-ocid="pfi.not_eligible.card">
          <CardContent className="p-3 flex items-center gap-3">
            <XCircle
              className="w-6 h-6 flex-shrink-0"
              style={{ color: "oklch(0.52 0.22 25)" }}
            />
            <div>
              <div className="text-xs text-muted-foreground uppercase font-semibold">
                Not Eligible
              </div>
              <div
                className="text-2xl font-bold"
                style={{ color: "oklch(0.52 0.22 25)" }}
              >
                {notEligibleCount}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-none border" data-ocid="pfi.funding.card">
          <CardContent className="p-3 flex items-center gap-3">
            <DollarSign
              className="w-6 h-6 flex-shrink-0"
              style={{ color: "oklch(0.60 0.14 72)" }}
            />
            <div>
              <div className="text-xs text-muted-foreground uppercase font-semibold">
                Est. Total Funding
              </div>
              <div
                className="text-xl font-bold"
                style={{ color: "oklch(0.38 0.14 72)" }}
              >
                ${(totalFunding / 1_000_000).toFixed(2)}M
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Provider eligibility table */}
      <Card className="rounded-none border">
        <CardHeader className="pb-2 pt-4 px-4 border-b">
          <CardTitle className="text-sm font-semibold text-gov-navy">
            {currentQuarter} Provider Eligibility Report — All{" "}
            {providerRows.length} Providers
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full gov-table" data-ocid="pfi.table">
              <thead>
                <tr>
                  <th className="text-left">Provider</th>
                  <th className="text-left">Location</th>
                  <th className="text-left">Overall Rating</th>
                  <th className="text-left">Trend</th>
                  <th className="text-right">Improvement %</th>
                  <th className="text-left">Eligibility Status</th>
                  <th className="text-right">Est. Funding</th>
                  <th className="text-center">Alert</th>
                </tr>
              </thead>
              <tbody>
                {providerRows.map((row, idx) => (
                  <tr key={row.id} data-ocid={`pfi.item.${idx + 1}`}>
                    <td className="font-medium">{row.name}</td>
                    <td className="text-muted-foreground text-xs">
                      {row.city}, {row.state}
                    </td>
                    <td>
                      {(() => {
                        const t = getProviderQuarterTrend(
                          row.id,
                          currentQuarter,
                        );
                        return (
                          <span
                            style={{
                              color:
                                t === "improving"
                                  ? "oklch(0.45 0.15 145)"
                                  : t === "declining"
                                    ? "oklch(0.52 0.22 25)"
                                    : "oklch(0.55 0.02 252)",
                              fontWeight: 700,
                              fontSize: "0.8rem",
                            }}
                          >
                            {t === "improving"
                              ? "↑"
                              : t === "declining"
                                ? "↓"
                                : "→"}
                          </span>
                        );
                      })()}
                    </td>
                    <td>
                      <StarRating
                        value={row.stars}
                        size="sm"
                        showLabel={false}
                      />
                      <span className="text-xs text-muted-foreground ml-1">
                        {row.stars.toFixed(1)}
                      </span>
                    </td>
                    <td className="text-right">
                      <span
                        className="font-bold text-xs"
                        style={{
                          color:
                            row.improvementPct >= 0
                              ? "oklch(0.45 0.15 145)"
                              : "oklch(0.52 0.22 25)",
                        }}
                      >
                        {row.improvementPct >= 0 ? "+" : ""}
                        {row.improvementPct.toFixed(1)}%
                      </span>
                    </td>
                    <td>
                      <IncentiveEligibilityBadge
                        eligible={row.eligible}
                        tier={row.tier}
                        size="sm"
                      />
                    </td>
                    <td className="text-right">
                      {row.eligible ? (
                        <span
                          className="font-semibold text-sm"
                          style={{ color: "oklch(0.38 0.14 72)" }}
                        >
                          ${row.estimatedFunding.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-sm">
                          $0
                        </span>
                      )}
                    </td>
                    <td className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 rounded-none"
                        title={`View alert for ${row.name}`}
                        onClick={() => handleViewAlert(row)}
                        data-ocid={`pfi.alert.button.${idx + 1}`}
                      >
                        <AlertTriangle
                          className="w-3.5 h-3.5"
                          style={{
                            color:
                              row.stars >= 4.5
                                ? "oklch(0.45 0.15 145)"
                                : row.stars <= 2
                                  ? "oklch(0.48 0.20 25)"
                                  : "oklch(0.60 0.08 72)",
                          }}
                        />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Funding distribution section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Bar chart */}
        <Card className="rounded-none border">
          <CardHeader className="pb-2 pt-4 px-4 border-b">
            <CardTitle className="text-sm font-semibold text-gov-navy">
              Funding Distribution by Eligibility Tier
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Provider count per eligibility tier
            </p>
          </CardHeader>
          <CardContent className="p-4">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={chartData}
                margin={{ top: 5, right: 20, bottom: 10, left: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="oklch(0.90 0.01 240)"
                />
                <XAxis
                  dataKey="tier"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    fontSize: "12px",
                    borderRadius: "2px",
                    border: "1px solid oklch(0.87 0.012 240)",
                  }}
                  formatter={(value: number) => [`${value} providers`, "Count"]}
                />
                <Bar dataKey="count" name="Providers" radius={[2, 2, 0, 0]}>
                  {chartData.map((entry) => (
                    <Cell
                      key={`cell-${entry.label}`}
                      fill={chartFill(entry.label)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Funding summary table */}
        <Card className="rounded-none border">
          <CardHeader className="pb-2 pt-4 px-4 border-b">
            <CardTitle className="text-sm font-semibold text-gov-navy">
              Tier Funding Summary
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Aggregate payment per tier
            </p>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full gov-table" data-ocid="pfi.funding.table">
              <thead>
                <tr>
                  <th className="text-left">Tier</th>
                  <th className="text-right">Providers</th>
                  <th className="text-right">Per Provider</th>
                  <th className="text-right">Total Funding</th>
                </tr>
              </thead>
              <tbody>
                {fundingSummary.map((row) => (
                  <tr key={row.tier}>
                    <td>
                      <IncentiveEligibilityBadge
                        eligible={row.tier !== "Not Eligible"}
                        tier={row.tier}
                        size="sm"
                      />
                    </td>
                    <td className="text-right font-semibold">{row.count}</td>
                    <td className="text-right text-muted-foreground text-xs">
                      {row.perProvider > 0
                        ? `$${row.perProvider.toLocaleString()}`
                        : "$0"}
                    </td>
                    <td
                      className="text-right font-semibold"
                      style={{
                        color:
                          row.totalFunding > 0
                            ? "oklch(0.38 0.14 72)"
                            : "oklch(0.55 0.02 240)",
                      }}
                    >
                      {row.totalFunding > 0
                        ? `$${(row.totalFunding / 1000).toFixed(0)}k`
                        : "$0"}
                    </td>
                  </tr>
                ))}
                <tr style={{ borderTop: "2px solid oklch(0.87 0.012 240)" }}>
                  <td className="font-bold text-gov-navy" colSpan={2}>
                    Total
                  </td>
                  <td />
                  <td className="text-right font-bold text-gov-navy">
                    ${(totalFunding / 1_000_000).toFixed(2)}M
                  </td>
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      {/* Performance Alert Modal */}
      <PerformanceAlertModal
        open={alertOpen}
        onClose={() => setAlertOpen(false)}
        alert={currentAlert}
      />
    </div>
  );
}
