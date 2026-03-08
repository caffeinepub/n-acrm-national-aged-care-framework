import { BenchmarkStatusChip } from "@/components/ui/BenchmarkStatusChip";
import { IncentiveEligibilityBadge } from "@/components/ui/IncentiveEligibilityBadge";
import { PerformanceAlertModal } from "@/components/ui/PerformanceAlertModal";
import { StarRating } from "@/components/ui/StarRating";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CITY_LIST, CITY_PROVIDERS, type CityProvider } from "@/data/mockData";
import { isEligibleForIncentive } from "@/utils/benchmarkUtils";
import type {
  IndicatorForAlert,
  PerformanceAlert,
} from "@/utils/performanceAlerts";
import { resolveAlertToShow } from "@/utils/performanceAlerts";
import {
  AlertTriangle,
  ArrowLeft,
  BedDouble,
  Building2,
  CalendarDays,
  CheckCircle,
  Info,
  MapPin,
  Minus,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Tooltip as RechartsTooltip,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";

// ── Weighted calculation ───────────────────────────────────────────────────────

function calcOverall(ind: CityProvider["indicators"]): number {
  const weightedBase =
    ind.residents * 0.33 +
    ind.compliance * 0.3 +
    ind.staffing * 0.22 +
    ind.qualityMeasures * 0.15;
  const adjustment =
    (ind.safetyClinical - 3) * 0.1 + (ind.preventiveCare - 3) * 0.07;
  return Math.min(5, Math.max(1, weightedBase + adjustment));
}

// ── helpers ───────────────────────────────────────────────────────────────────

function ratingColor(score: number): string {
  if (score >= 4.0) return "oklch(0.38 0.14 145)";
  if (score >= 3.0) return "oklch(0.50 0.16 72)";
  return "oklch(0.48 0.20 25)";
}

function ratingBadgeClass(score: number): string {
  if (score >= 4.5) return "badge-green";
  if (score >= 3.5) return "badge-amber";
  return "badge-red";
}

function typeBadge(type: string) {
  if (type === "Residential") return <span className="badge-navy">{type}</span>;
  if (type === "Home Care") return <span className="badge-blue">{type}</span>;
  return <span className="badge-gray">{type}</span>;
}

function getColorDot(score: number) {
  if (score >= 4.0) {
    return (
      <span
        className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
        style={{
          background: "oklch(0.52 0.15 145)",
          border: "1px solid oklch(0.40 0.14 145)",
        }}
        title="Good"
      />
    );
  }
  if (score >= 3.0) {
    return (
      <span
        className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
        style={{
          background: "oklch(0.70 0.14 72)",
          border: "1px solid oklch(0.55 0.14 72)",
        }}
        title="Moderate"
      />
    );
  }
  return (
    <span
      className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
      style={{
        background: "oklch(0.52 0.22 25)",
        border: "1px solid oklch(0.40 0.20 25)",
      }}
      title="Needs Improvement"
    />
  );
}

// ── Trend Arrow ───────────────────────────────────────────────────────────────

function TrendArrow({
  trend,
}: { trend: "improving" | "declining" | "stable" }) {
  if (trend === "improving") {
    return (
      <TrendingUp
        className="w-4 h-4 flex-shrink-0"
        style={{ color: "oklch(0.45 0.15 145)" }}
      />
    );
  }
  if (trend === "declining") {
    return (
      <TrendingDown
        className="w-4 h-4 flex-shrink-0"
        style={{ color: "oklch(0.48 0.20 25)" }}
      />
    );
  }
  return (
    <Minus
      className="w-4 h-4 flex-shrink-0"
      style={{ color: "oklch(0.55 0.02 240)" }}
    />
  );
}

// ── indicator rows config ─────────────────────────────────────────────────────

const INDICATOR_CONFIG: {
  key: keyof CityProvider["indicators"];
  label: string;
  weight: number;
  weightLabel: string;
  isAdjustment: boolean;
}[] = [
  {
    key: "residents",
    label: "Residents Experience",
    weight: 0.33,
    weightLabel: "33%",
    isAdjustment: false,
  },
  {
    key: "compliance",
    label: "Compliance",
    weight: 0.3,
    weightLabel: "30%",
    isAdjustment: false,
  },
  {
    key: "staffing",
    label: "Staffing",
    weight: 0.22,
    weightLabel: "22%",
    isAdjustment: false,
  },
  {
    key: "qualityMeasures",
    label: "Quality Measures",
    weight: 0.15,
    weightLabel: "15%",
    isAdjustment: false,
  },
  {
    key: "safetyClinical",
    label: "Safety & Clinical",
    weight: 0,
    weightLabel: "Adj.",
    isAdjustment: true,
  },
  {
    key: "preventiveCare",
    label: "Preventive Care",
    weight: 0,
    weightLabel: "Adj.",
    isAdjustment: true,
  },
];

// Fallback generic insights for providers without indicatorMeta
function getFallbackInsight(key: string, score: number): string {
  if (score < 3.0) {
    const lowMessages: Record<string, string> = {
      safetyClinical:
        "⚠ This provider shows poor performance in Falls Risk Safety indicator due to higher incident rate compared to regional benchmark.",
      preventiveCare:
        "⚠ This provider has low Preventive Screening completion compared with national average.",
      staffing:
        "⚠ Staffing levels are below minimum thresholds. High turnover may be impacting care delivery.",
      compliance:
        "⚠ Compliance indicators are below acceptable threshold. Review of outstanding notices is recommended.",
      residents:
        "⚠ Resident Experience scores are below acceptable range. Complaint rates may be elevated.",
      qualityMeasures:
        "⚠ Quality Measures performance requires immediate attention and structured improvement planning.",
      experience:
        "⚠ Experience indicators require attention. Complaint resolution times exceed benchmarks.",
      equity:
        "⚠ Equity access gaps have been identified. Targeted intervention is recommended.",
    };
    return (
      lowMessages[key] ??
      "⚠ This indicator is below acceptable threshold. Improvement action is recommended."
    );
  }
  if (score >= 4.5) {
    return "✅ This provider demonstrates excellent performance in this indicator, above the regional benchmark.";
  }
  if (score >= 4.0) {
    return "✅ This provider demonstrates strong performance in this area, above regional benchmark.";
  }
  return "ℹ Performance is within acceptable range. Minor improvement opportunities identified.";
}

// ── Indicator Insight Dialog ──────────────────────────────────────────────────

interface InsightDialogProps {
  open: boolean;
  onClose: () => void;
  indicatorLabel: string;
  insight: string;
  score: number;
  trend: "improving" | "declining" | "stable";
}

function IndicatorInsightDialog({
  open,
  onClose,
  indicatorLabel,
  insight,
  score,
  trend,
}: InsightDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <DialogContent
        className="rounded-none max-w-md"
        data-ocid="indicator.insight.dialog"
        style={{
          borderColor: "oklch(var(--gov-navy))",
          borderWidth: "2px",
        }}
      >
        <DialogHeader>
          <DialogTitle
            className="text-sm font-bold uppercase tracking-widest"
            style={{ color: "oklch(var(--gov-navy))" }}
          >
            Indicator Performance Insight
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-1">
          <div
            className="px-3 py-2 border-l-4 text-xs font-semibold uppercase tracking-wider"
            style={{
              borderColor: "oklch(var(--gov-navy))",
              background: "oklch(0.95 0.012 254)",
              color: "oklch(var(--gov-navy))",
            }}
          >
            {indicatorLabel}
          </div>

          <div className="flex items-center gap-4">
            <div>
              <div
                className="text-xs uppercase tracking-wide font-semibold mb-0.5"
                style={{ color: "oklch(0.46 0.025 250)" }}
              >
                Score
              </div>
              <div
                className="text-2xl font-black tabular-nums"
                style={{ color: ratingColor(score) }}
              >
                {score.toFixed(1)}
              </div>
            </div>
            <div>
              <div
                className="text-xs uppercase tracking-wide font-semibold mb-0.5"
                style={{ color: "oklch(0.46 0.025 250)" }}
              >
                Trend
              </div>
              <div
                className="flex items-center gap-1.5 text-xs font-semibold"
                style={{ color: "oklch(0.38 0.025 250)" }}
              >
                <TrendArrow trend={trend} />
                <span className="capitalize">{trend}</span>
              </div>
            </div>
            <div className="ml-auto">
              <StarRating value={score} size="sm" showLabel={false} />
            </div>
          </div>

          <div
            className="p-3 text-sm leading-relaxed rounded-sm"
            style={{
              background:
                score < 3.0
                  ? "oklch(0.97 0.025 25)"
                  : score >= 4.0
                    ? "oklch(0.96 0.025 145)"
                    : "oklch(0.97 0.03 80)",
              borderLeft: `3px solid ${score < 3.0 ? "oklch(0.52 0.22 25)" : score >= 4.0 ? "oklch(0.52 0.15 145)" : "oklch(0.70 0.14 72)"}`,
              color: "oklch(0.25 0.04 254)",
            }}
          >
            {insight}
          </div>

          <div className="pt-1 flex justify-end">
            <Button
              size="sm"
              variant="outline"
              className="rounded-none text-xs font-semibold"
              style={{
                borderColor: "oklch(var(--gov-navy))",
                color: "oklch(var(--gov-navy))",
              }}
              onClick={onClose}
              data-ocid="indicator.insight.close_button"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Region Comparison Bar Chart ───────────────────────────────────────────────

interface RegionComparisonChartProps {
  providers: CityProvider[];
  selectedId?: string;
}

function RegionComparisonChart({
  providers,
  selectedId,
}: RegionComparisonChartProps) {
  const data = providers.map((p) => ({
    name: p.name.length > 18 ? `${p.name.slice(0, 16)}…` : p.name,
    fullName: p.name,
    rating: Number.parseFloat(calcOverall(p.indicators).toFixed(2)),
    id: p.id,
  }));

  const getBarColor = (rating: number, id: string) => {
    if (id === selectedId) return "oklch(0.28 0.09 254)";
    if (rating >= 4.0) return "oklch(0.52 0.15 145)";
    if (rating >= 3.0) return "oklch(0.70 0.14 72)";
    return "oklch(0.52 0.22 25)";
  };

  return (
    <Card
      className="rounded-none border"
      data-ocid="provider.region.comparison.chart_point"
    >
      <CardHeader className="pb-2 pt-4 px-4 border-b">
        <CardTitle className="text-sm font-semibold text-gov-navy">
          Regional Provider Rating Comparison
        </CardTitle>
        <p
          className="text-xs mt-0.5"
          style={{ color: "oklch(0.50 0.025 250)" }}
        >
          Overall weighted rating by provider · Benchmark line at 3.5
        </p>
      </CardHeader>
      <CardContent className="p-4">
        <div
          className="flex items-center gap-4 mb-3 text-xs"
          style={{ color: "oklch(0.50 0.025 250)" }}
        >
          <span className="flex items-center gap-1.5">
            <span
              className="inline-block w-3 h-3 rounded-sm"
              style={{ background: "oklch(0.52 0.15 145)" }}
            />
            ≥ 4.0 Good
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="inline-block w-3 h-3 rounded-sm"
              style={{ background: "oklch(0.70 0.14 72)" }}
            />
            3.0–3.9 Moderate
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="inline-block w-3 h-3 rounded-sm"
              style={{ background: "oklch(0.52 0.22 25)" }}
            />
            &lt; 3.0 Poor
          </span>
          {selectedId && (
            <span className="flex items-center gap-1.5">
              <span
                className="inline-block w-3 h-3 rounded-sm"
                style={{ background: "oklch(0.28 0.09 254)" }}
              />
              Selected
            </span>
          )}
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart
            data={data}
            margin={{ top: 8, right: 16, left: 0, bottom: 40 }}
            barCategoryGap="30%"
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="oklch(0.87 0.012 240)"
              vertical={false}
            />
            <XAxis
              dataKey="name"
              tick={{
                fontSize: 10,
                fill: "oklch(0.38 0.06 254)",
                fontWeight: 600,
              }}
              axisLine={{ stroke: "oklch(0.82 0.04 254)" }}
              tickLine={false}
              angle={-30}
              textAnchor="end"
              interval={0}
            />
            <YAxis
              domain={[0, 5]}
              ticks={[0, 1, 2, 3, 4, 5]}
              tick={{ fontSize: 10, fill: "oklch(0.50 0.025 250)" }}
              axisLine={false}
              tickLine={false}
              width={28}
            />
            <RechartsTooltip
              contentStyle={{
                fontSize: 12,
                fontWeight: 600,
                border: "1px solid oklch(0.82 0.04 254)",
                borderRadius: 0,
                background: "#fff",
                color: "oklch(0.20 0.06 254)",
              }}
              formatter={(
                value: number,
                _: string,
                entry: { payload?: { fullName?: string } },
              ) => [
                `${value.toFixed(2)} / 5.0`,
                entry?.payload?.fullName ?? "Rating",
              ]}
            />
            <ReferenceLine
              y={3.5}
              stroke="oklch(0.28 0.09 254)"
              strokeDasharray="5 3"
              strokeWidth={1.5}
              label={{
                value: "Benchmark 3.5",
                position: "insideTopRight",
                fontSize: 9,
                fontWeight: 700,
                fill: "oklch(0.28 0.09 254)",
              }}
            />
            <Bar dataKey="rating" radius={0} maxBarSize={48}>
              {data.map((entry) => (
                <Cell
                  key={entry.id}
                  fill={getBarColor(entry.rating, entry.id)}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// ── KPI Cards ─────────────────────────────────────────────────────────────────

interface KPICardsProps {
  provider: CityProvider;
  overall: number;
}

function KPICards({ provider, overall }: KPICardsProps) {
  const allIndicators = INDICATOR_CONFIG.map((ind) => ({
    label: ind.label,
    score: provider.indicators[ind.key],
  }));

  const topPerformer = [...allIndicators].sort((a, b) => b.score - a.score)[0];
  const needsAttention = [...allIndicators].sort(
    (a, b) => a.score - b.score,
  )[0];
  const belowThree = allIndicators.filter((i) => i.score < 3.0).length;

  const kpiCardStyle = {
    background: "#ffffff",
    borderLeft: "4px solid oklch(var(--gov-navy))",
    borderTop: "1px solid oklch(var(--border))",
    borderRight: "1px solid oklch(var(--border))",
    borderBottom: "1px solid oklch(var(--border))",
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Overall Rating */}
      <div
        className="p-4"
        style={kpiCardStyle}
        data-ocid="provider.kpi.overall.card"
      >
        <div
          className="text-xs uppercase font-bold tracking-widest mb-2"
          style={{ color: "oklch(0.46 0.025 250)" }}
        >
          Overall Rating
        </div>
        <div
          className="text-3xl font-black tabular-nums leading-none"
          style={{ color: ratingColor(overall) }}
        >
          {overall.toFixed(1)}
        </div>
        <div className="mt-1.5">
          <StarRating value={overall} size="sm" showLabel={false} />
        </div>
        <div
          className="text-xs mt-1.5 font-semibold"
          style={{ color: "oklch(0.55 0.02 240)" }}
        >
          Weighted composite
        </div>
      </div>

      {/* Top Performer */}
      <div
        className="p-4"
        style={{ ...kpiCardStyle, borderLeftColor: "oklch(0.52 0.15 145)" }}
      >
        <div
          className="text-xs uppercase font-bold tracking-widest mb-2"
          style={{ color: "oklch(0.46 0.025 250)" }}
        >
          Top Performer
        </div>
        <div className="flex items-center gap-1.5 mb-1">
          <CheckCircle
            className="w-4 h-4 flex-shrink-0"
            style={{ color: "oklch(0.45 0.15 145)" }}
          />
          <span
            className="text-xl font-black tabular-nums"
            style={{ color: "oklch(0.38 0.14 145)" }}
          >
            {topPerformer.score.toFixed(1)}
          </span>
        </div>
        <div
          className="text-xs font-semibold truncate"
          style={{ color: "oklch(0.35 0.06 254)" }}
        >
          {topPerformer.label}
        </div>
        <div
          className="text-xs mt-0.5"
          style={{ color: "oklch(0.55 0.02 240)" }}
        >
          Highest scored indicator
        </div>
      </div>

      {/* Needs Attention */}
      <div
        className="p-4"
        style={{
          ...kpiCardStyle,
          borderLeftColor:
            needsAttention.score < 3.0
              ? "oklch(0.52 0.22 25)"
              : "oklch(0.70 0.14 72)",
        }}
      >
        <div
          className="text-xs uppercase font-bold tracking-widest mb-2"
          style={{ color: "oklch(0.46 0.025 250)" }}
        >
          Needs Attention
        </div>
        <div className="flex items-center gap-1.5 mb-1">
          {needsAttention.score < 3.0 && (
            <AlertTriangle
              className="w-4 h-4 flex-shrink-0"
              style={{ color: "oklch(0.52 0.22 25)" }}
            />
          )}
          <span
            className="text-xl font-black tabular-nums"
            style={{ color: ratingColor(needsAttention.score) }}
          >
            {needsAttention.score.toFixed(1)}
          </span>
        </div>
        <div
          className="text-xs font-semibold truncate"
          style={{ color: "oklch(0.35 0.06 254)" }}
        >
          {needsAttention.label}
        </div>
        <div
          className="text-xs mt-0.5"
          style={{ color: "oklch(0.55 0.02 240)" }}
        >
          Lowest scored indicator
        </div>
      </div>

      {/* Below 3.0 count */}
      <div
        className="p-4"
        style={{
          ...kpiCardStyle,
          borderLeftColor:
            belowThree > 0 ? "oklch(0.52 0.22 25)" : "oklch(0.52 0.15 145)",
        }}
      >
        <div
          className="text-xs uppercase font-bold tracking-widest mb-2"
          style={{ color: "oklch(0.46 0.025 250)" }}
        >
          Indicators Below 3.0
        </div>
        <div
          className="text-3xl font-black tabular-nums leading-none"
          style={{
            color:
              belowThree > 0 ? "oklch(0.48 0.20 25)" : "oklch(0.38 0.14 145)",
          }}
        >
          {belowThree}
        </div>
        <div className="text-xs mt-2" style={{ color: "oklch(0.55 0.02 240)" }}>
          {belowThree === 0
            ? "All indicators acceptable"
            : belowThree === 1
              ? "indicator requires urgent review"
              : "indicators require urgent review"}
        </div>
      </div>
    </div>
  );
}

// ── Indicator Visual Grid ─────────────────────────────────────────────────────

interface IndicatorGridProps {
  provider: CityProvider;
  onIndicatorClick: (ind: (typeof INDICATOR_CONFIG)[0]) => void;
}

function IndicatorVisualGrid({
  provider,
  onIndicatorClick,
}: IndicatorGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {INDICATOR_CONFIG.map((ind) => {
        const score = provider.indicators[ind.key];
        const meta = provider.indicatorMeta?.[ind.key];
        const trend = meta?.trend ?? "stable";

        const bgColor =
          score >= 4.0
            ? "oklch(0.96 0.025 145)"
            : score >= 3.0
              ? "oklch(0.97 0.03 80)"
              : "oklch(0.97 0.025 25)";
        const borderColor =
          score >= 4.0
            ? "oklch(0.72 0.12 145)"
            : score >= 3.0
              ? "oklch(0.75 0.12 75)"
              : "oklch(0.68 0.18 25)";

        return (
          <button
            key={ind.key}
            type="button"
            className="p-3 text-left transition-all hover:opacity-90 cursor-pointer"
            style={{
              background: bgColor,
              border: `1px solid ${borderColor}`,
              borderRadius: 0,
            }}
            onClick={() => onIndicatorClick(ind)}
            title={`Click for insight on ${ind.label}`}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div
                className="text-xs font-bold uppercase tracking-wide leading-tight flex-1"
                style={{ color: "oklch(0.28 0.06 254)" }}
              >
                {ind.label}
              </div>
              {score < 3.0 && (
                <AlertTriangle
                  className="w-3.5 h-3.5 flex-shrink-0"
                  style={{ color: "oklch(0.48 0.20 25)" }}
                />
              )}
              {score >= 4.5 && (
                <CheckCircle
                  className="w-3.5 h-3.5 flex-shrink-0"
                  style={{ color: "oklch(0.45 0.15 145)" }}
                />
              )}
            </div>
            <div className="flex items-end justify-between">
              <div>
                <div
                  className="text-2xl font-black tabular-nums leading-none"
                  style={{ color: ratingColor(score) }}
                >
                  {score.toFixed(1)}
                </div>
                <StarRating
                  value={score}
                  size="sm"
                  showLabel={false}
                  className="mt-1"
                />
              </div>
              <div className="flex flex-col items-end gap-1">
                <TrendArrow trend={trend} />
                <div
                  className="text-xs font-semibold"
                  style={{ color: "oklch(0.50 0.025 250)" }}
                >
                  {ind.isAdjustment ? "Adj." : ind.weightLabel}
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ── Provider Card ─────────────────────────────────────────────────────────────

interface ProviderCardProps {
  provider: CityProvider;
  index: number;
  onSelect: (p: CityProvider) => void;
}

function ProviderCard({ provider, index, onSelect }: ProviderCardProps) {
  const overall = calcOverall(provider.indicators);

  const belowThree = INDICATOR_CONFIG.filter(
    (ind) => provider.indicators[ind.key] < 3.0,
  ).length;

  function handleClick() {
    // Show a brief toast insight when selecting provider
    const lowestInd = INDICATOR_CONFIG.reduce((prev, curr) =>
      provider.indicators[curr.key] < provider.indicators[prev.key]
        ? curr
        : prev,
    );
    const lowestScore = provider.indicators[lowestInd.key];
    const meta = provider.indicatorMeta?.[lowestInd.key];
    const insight =
      meta?.insight ?? getFallbackInsight(lowestInd.key, lowestScore);
    if (belowThree > 0) {
      toast.warning(insight.replace(/^[⚠✅ℹ]\s*/, ""), {
        duration: 3500,
        description: `${provider.name} — ${lowestInd.label}: ${lowestScore.toFixed(1)}/5`,
      });
    } else if (overall >= 4.0) {
      const highestInd = INDICATOR_CONFIG.reduce((prev, curr) =>
        provider.indicators[curr.key] > provider.indicators[prev.key]
          ? curr
          : prev,
      );
      const highestMeta = provider.indicatorMeta?.[highestInd.key];
      const highInsight =
        highestMeta?.insight ??
        getFallbackInsight(highestInd.key, provider.indicators[highestInd.key]);
      toast.success(highInsight.replace(/^[⚠✅ℹ]\s*/, ""), {
        duration: 3000,
        description: `${provider.name} — Overall: ${overall.toFixed(2)}/5`,
      });
    }
    onSelect(provider);
  }

  return (
    <button
      type="button"
      data-ocid={`provider.card.${index}`}
      className="border rounded-none bg-white hover:shadow-md transition-shadow cursor-pointer group w-full text-left"
      style={{ borderColor: "oklch(var(--border))" }}
      onClick={handleClick}
      aria-label={`View details for ${provider.name}`}
    >
      {/* Card header band */}
      <div
        className="px-4 py-2.5 border-b flex items-center gap-2"
        style={{
          background: "oklch(0.95 0.012 254)",
          borderColor: "oklch(var(--border))",
        }}
      >
        <Building2
          className="w-4 h-4 flex-shrink-0"
          style={{ color: "oklch(var(--gov-navy))" }}
        />
        <span
          className="font-bold text-sm leading-snug flex-1"
          style={{ color: "oklch(var(--gov-navy))" }}
        >
          {provider.name}
        </span>
        {typeBadge(provider.type)}
      </div>

      <div className="p-4 space-y-3">
        {/* Meta info */}
        <div
          className="flex flex-wrap gap-x-4 gap-y-1 text-xs"
          style={{ color: "oklch(0.48 0.025 250)" }}
        >
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {provider.city}
          </span>
          {provider.beds && (
            <span className="flex items-center gap-1">
              <BedDouble className="w-3 h-3" />
              {provider.beds} beds
            </span>
          )}
          <span className="flex items-center gap-1">
            <CalendarDays className="w-3 h-3" />
            Est. {provider.established}
          </span>
        </div>

        {/* Alerts */}
        {belowThree > 0 && (
          <div
            className="flex items-center gap-1.5 px-2 py-1 text-xs font-semibold"
            style={{
              background: "oklch(0.97 0.025 25)",
              border: "1px solid oklch(0.72 0.14 25)",
              color: "oklch(0.42 0.20 25)",
            }}
          >
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
            {belowThree} indicator{belowThree !== 1 ? "s" : ""} below threshold
          </div>
        )}

        {/* Overall rating preview */}
        <div>
          <div
            className="text-xs uppercase tracking-wide font-semibold mb-1"
            style={{ color: "oklch(0.46 0.025 250)" }}
          >
            Overall Rating
          </div>
          <StarRating value={overall} size="md" />
        </div>

        {/* CTA */}
        <Button
          size="sm"
          variant="outline"
          className="w-full rounded-none border text-xs font-semibold mt-1 group-hover:bg-gov-navy group-hover:text-white transition-colors"
          style={{
            borderColor: "oklch(var(--gov-navy))",
            color: "oklch(var(--gov-navy))",
          }}
          data-ocid={`provider.view_details.button.${index}`}
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
        >
          View Provider Scorecard
        </Button>
      </div>
    </button>
  );
}

// ── Provider Detail ───────────────────────────────────────────────────────────

interface ProviderDetailProps {
  provider: CityProvider;
  allProviders: CityProvider[];
  onBack: () => void;
}

function buildCityProviderAlertIndicators(
  provider: CityProvider,
): IndicatorForAlert[] {
  return INDICATOR_CONFIG.map((ind) => ({
    label: ind.label,
    score: provider.indicators[ind.key],
    providerValue: provider.indicators[ind.key],
    benchmark: 3.5,
    isLowerBetter: false,
  }));
}

function ProviderDetail({
  provider,
  allProviders,
  onBack,
}: ProviderDetailProps) {
  const overall = calcOverall(provider.indicators);
  const hasBelowBenchmark = INDICATOR_CONFIG.some(
    (ind) => provider.indicators[ind.key] < 3.5,
  );
  const incentiveEligible = isEligibleForIncentive(overall, hasBelowBenchmark);

  const [insightOpen, setInsightOpen] = useState(false);
  const [insightData, setInsightData] = useState<{
    label: string;
    insight: string;
    score: number;
    trend: "improving" | "declining" | "stable";
  } | null>(null);

  // Performance alert state
  const [alertOpen, setAlertOpen] = useState(false);
  const [currentAlert, setCurrentAlert] = useState<PerformanceAlert | null>(
    null,
  );

  // Auto-show alert when provider changes
  useEffect(() => {
    const indicators = buildCityProviderAlertIndicators(provider);
    const alertResult = resolveAlertToShow(provider.name, overall, indicators);
    if (alertResult) {
      setCurrentAlert(alertResult);
      setAlertOpen(true);
    } else {
      setCurrentAlert(null);
      setAlertOpen(false);
    }
  }, [provider, overall]);

  function openInsight(ind: (typeof INDICATOR_CONFIG)[0]) {
    const score = provider.indicators[ind.key];
    const meta = provider.indicatorMeta?.[ind.key];
    const trend = meta?.trend ?? "stable";
    const insight = meta?.insight ?? getFallbackInsight(ind.key, score);
    setInsightData({ label: ind.label, insight, score, trend });
    setInsightOpen(true);
  }

  return (
    <div className="space-y-6" data-ocid="provider.detail.panel">
      {/* Back + header */}
      <div className="flex items-start gap-4 border-b pb-4">
        <button
          type="button"
          data-ocid="provider.detail.back_button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 border rounded-none transition-colors hover:bg-gov-navy hover:text-white mt-0.5 flex-shrink-0"
          style={{
            borderColor: "oklch(var(--gov-navy))",
            color: "oklch(var(--gov-navy))",
          }}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Providers
        </button>
        <div className="flex-1 min-w-0">
          <h2
            className="text-lg font-bold"
            style={{ color: "oklch(var(--gov-navy))" }}
          >
            {provider.name}
          </h2>
          <div
            className="flex flex-wrap gap-3 mt-1 text-xs"
            style={{ color: "oklch(0.48 0.025 250)" }}
          >
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {provider.city}
            </span>
            <span>{typeBadge(provider.type)}</span>
            {provider.beds && (
              <span className="flex items-center gap-1">
                <BedDouble className="w-3.5 h-3.5" />
                {provider.beds} beds
              </span>
            )}
            <span className="flex items-center gap-1">
              <CalendarDays className="w-3.5 h-3.5" />
              Established {provider.established}
            </span>
            <IncentiveEligibilityBadge eligible={incentiveEligible} size="sm" />
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <KPICards provider={provider} overall={overall} />

      {/* Indicators table */}
      <Card className="rounded-none border">
        <CardHeader className="pb-2 pt-4 px-4 border-b">
          <CardTitle className="text-sm font-semibold text-gov-navy">
            Quality Indicator Scorecard — Weighted Performance
          </CardTitle>
          <p
            className="text-xs mt-0.5"
            style={{ color: "oklch(0.50 0.025 250)" }}
          >
            Click any row to view performance insight
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full gov-table">
            <thead>
              <tr>
                <th className="text-left" style={{ width: "24%" }}>
                  Indicator
                </th>
                <th className="text-left" style={{ width: "7%" }}>
                  Weight
                </th>
                <th className="text-left" style={{ width: "26%" }}>
                  Star Rating
                </th>
                <th className="text-center" style={{ width: "8%" }}>
                  Score
                </th>
                <th className="text-center" style={{ width: "8%" }}>
                  Trend
                </th>
                <th className="text-left" style={{ width: "15%" }}>
                  vs Benchmark
                </th>
                <th className="text-center" style={{ width: "12%" }}>
                  Band
                </th>
              </tr>
            </thead>
            <tbody>
              {INDICATOR_CONFIG.map((ind, idx) => {
                const score = provider.indicators[ind.key];
                const meta = provider.indicatorMeta?.[ind.key];
                const trend = meta?.trend ?? "stable";
                const isLow = score < 3.0;
                const isHigh = score >= 4.5;

                return (
                  <tr
                    key={ind.key}
                    data-ocid={`indicator.row.${idx + 1}`}
                    className="cursor-pointer"
                    onClick={() => openInsight(ind)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") openInsight(ind);
                    }}
                    tabIndex={0}
                    title={`Click for ${ind.label} insight`}
                  >
                    <td
                      className="font-semibold text-xs uppercase tracking-wide"
                      style={{ color: "oklch(0.30 0.06 254)" }}
                    >
                      <div className="flex items-center gap-1.5">
                        {isLow && (
                          <AlertTriangle
                            className="w-3.5 h-3.5 flex-shrink-0"
                            style={{ color: "oklch(0.48 0.20 25)" }}
                          />
                        )}
                        {isHigh && (
                          <CheckCircle
                            className="w-3.5 h-3.5 flex-shrink-0"
                            style={{ color: "oklch(0.45 0.15 145)" }}
                          />
                        )}
                        <button
                          type="button"
                          data-ocid="indicator.insight.open_modal_button"
                          className="text-left hover:underline"
                          onClick={(e) => {
                            e.stopPropagation();
                            openInsight(ind);
                          }}
                          style={{
                            color: "oklch(0.30 0.06 254)",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: 0,
                          }}
                        >
                          {ind.label}
                        </button>
                      </div>
                    </td>
                    <td>
                      <span
                        className="text-xs font-bold px-1.5 py-0.5 rounded-sm"
                        style={{
                          background: ind.isAdjustment
                            ? "oklch(0.92 0.01 240)"
                            : "oklch(0.90 0.03 254)",
                          color: ind.isAdjustment
                            ? "oklch(0.45 0.02 240)"
                            : "oklch(var(--gov-navy))",
                          border: `1px solid ${ind.isAdjustment ? "oklch(0.80 0.01 240)" : "oklch(0.74 0.05 254)"}`,
                        }}
                      >
                        {ind.weightLabel}
                      </span>
                    </td>
                    <td>
                      <StarRating value={score} size="md" showLabel={false} />
                    </td>
                    <td className="text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {getColorDot(score)}
                        <span
                          className="font-bold tabular-nums text-sm"
                          style={{ color: ratingColor(score) }}
                        >
                          {score.toFixed(1)}
                        </span>
                      </div>
                    </td>
                    <td className="text-center">
                      <div className="flex justify-center">
                        <TrendArrow trend={trend} />
                      </div>
                    </td>
                    <td>
                      <BenchmarkStatusChip
                        rate={score}
                        benchmark={3.5}
                        isLowerBetter={false}
                        size="xs"
                      />
                    </td>
                    <td className="text-center">
                      <span className={ratingBadgeClass(score)}>
                        {score >= 4.5
                          ? "Excellent"
                          : score >= 3.5
                            ? "Good"
                            : score >= 3.0
                              ? "Moderate"
                              : "Poor"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Overall Rating */}
      <Card
        className="rounded-none border"
        style={{
          background:
            overall >= 4.0
              ? "oklch(0.96 0.025 145)"
              : overall >= 3.0
                ? "oklch(0.97 0.03 80)"
                : "oklch(0.97 0.025 25)",
          borderColor:
            overall >= 4.0
              ? "oklch(0.72 0.12 145)"
              : overall >= 3.0
                ? "oklch(0.75 0.12 75)"
                : "oklch(0.68 0.18 25)",
        }}
        data-ocid="provider.overall_rating.card"
      >
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="text-xs uppercase font-bold tracking-widest"
                  style={{ color: "oklch(0.46 0.025 250)" }}
                >
                  Overall Provider Rating
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button type="button" className="focus:outline-none">
                        <Info
                          className="w-3.5 h-3.5"
                          style={{ color: "oklch(0.55 0.04 254)" }}
                        />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent
                      className="max-w-xs text-xs rounded-none"
                      style={{ border: "1px solid oklch(0.82 0.04 254)" }}
                    >
                      <p className="font-semibold mb-1">Weighted Formula</p>
                      <p>
                        Overall = (Residents × 33%) + (Compliance × 30%) +
                        (Staffing × 22%) + (Quality × 15%) + Safety Adjustment +
                        Preventive Adjustment
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div
                className="text-xs mb-3"
                style={{ color: "oklch(0.40 0.03 250)" }}
              >
                Overall rating calculated using weighted composite score of key
                indicators.
              </div>
              <StarRating value={overall} size="lg" />
              {/* Weight breakdown */}
              <div
                className="mt-3 text-xs pt-3 border-t"
                style={{
                  color: "oklch(0.50 0.025 250)",
                  borderColor: "oklch(0.82 0.06 145)",
                }}
              >
                <span className="font-semibold">
                  Residents Experience (33%)
                </span>
                {" · "}
                <span className="font-semibold">Compliance (30%)</span>
                {" · "}
                <span className="font-semibold">Staffing (22%)</span>
                {" · "}
                <span className="font-semibold">Quality Measures (15%)</span>
                {" + "}
                <span className="italic">Safety & Clinical (Adj.)</span>
                {" + "}
                <span className="italic">Preventive Care (Adj.)</span>
              </div>
            </div>

            <div className="flex-shrink-0 text-right">
              <div
                className="text-5xl font-black tabular-nums leading-none"
                style={{ color: ratingColor(overall) }}
              >
                {overall.toFixed(1)}
              </div>
              <div
                className="text-xs font-semibold mt-1"
                style={{ color: "oklch(0.55 0.02 240)" }}
              >
                out of 5.0
              </div>
              <div className="mt-2">
                <span
                  className="px-3 py-1 text-xs font-bold uppercase tracking-wide rounded-sm"
                  style={{
                    background: ratingColor(overall),
                    color: "#fff",
                  }}
                >
                  {overall >= 4.5
                    ? "Excellent"
                    : overall >= 4.0
                      ? "Good"
                      : overall >= 3.0
                        ? "Moderate"
                        : "Poor"}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Indicator Visual Grid */}
      <div>
        <div
          className="text-xs uppercase font-bold tracking-widest mb-3"
          style={{ color: "oklch(0.46 0.025 250)" }}
        >
          Indicator Performance Overview — Click any tile for insight
        </div>
        <IndicatorVisualGrid
          provider={provider}
          onIndicatorClick={openInsight}
        />
      </div>

      {/* Region Comparison Chart */}
      <RegionComparisonChart
        providers={allProviders}
        selectedId={provider.id}
      />

      {/* Insight Dialog */}
      {insightData && (
        <IndicatorInsightDialog
          open={insightOpen}
          onClose={() => setInsightOpen(false)}
          indicatorLabel={insightData.label}
          insight={insightData.insight}
          score={insightData.score}
          trend={insightData.trend}
        />
      )}

      {/* Performance Alert Modal */}
      <PerformanceAlertModal
        open={alertOpen}
        onClose={() => setAlertOpen(false)}
        alert={currentAlert}
      />
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function RegionalProviderDrillDown() {
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedProvider, setSelectedProvider] = useState<CityProvider | null>(
    null,
  );

  const providers = selectedCity ? (CITY_PROVIDERS[selectedCity] ?? []) : [];

  function handleCityChange(city: string) {
    setSelectedCity(city);
    setSelectedProvider(null);
  }

  return (
    <div className="p-6 space-y-6" data-ocid="regional_provider.page">
      {/* Page header */}
      <div className="flex items-start justify-between border-b pb-4">
        <div>
          <h1 className="text-xl font-bold text-gov-navy">
            Regional Provider Lookup
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Select a region to view aged care providers and their quality
            performance ratings
          </p>
        </div>
        <div
          className="px-3 py-1.5 text-xs font-semibold rounded border hidden sm:block"
          style={{
            background: "oklch(0.93 0.012 240)",
            color: "oklch(var(--gov-navy))",
            borderColor: "oklch(var(--border))",
          }}
        >
          <MapPin className="w-3 h-3 inline mr-1" />
          {CITY_LIST.length} Regions ·{" "}
          {Object.values(CITY_PROVIDERS).flat().length} Providers
        </div>
      </div>

      {/* City selector */}
      <div className="max-w-xs">
        <div
          className="block text-xs font-bold uppercase tracking-wide mb-1.5"
          style={{ color: "oklch(0.46 0.025 250)" }}
        >
          Select Region / City
        </div>
        <Select value={selectedCity} onValueChange={handleCityChange}>
          <SelectTrigger
            className="rounded-none border w-full"
            style={{ borderColor: "oklch(var(--border))" }}
            data-ocid="region.select"
          >
            <SelectValue placeholder="Select a region..." />
          </SelectTrigger>
          <SelectContent className="rounded-none">
            {CITY_LIST.map((city, idx) => (
              <SelectItem
                key={city}
                value={city}
                data-ocid={`regional_provider.city.item.${idx + 1}`}
              >
                {city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Empty state */}
      {!selectedCity && (
        <div
          className="border rounded-none py-16 text-center"
          data-ocid="regional_provider.empty_state"
          style={{
            borderColor: "oklch(var(--border))",
            background: "oklch(0.97 0.005 240)",
          }}
        >
          <MapPin
            className="w-10 h-10 mx-auto mb-3"
            style={{ color: "oklch(0.72 0.04 254)" }}
          />
          <p
            className="text-sm font-semibold"
            style={{ color: "oklch(var(--gov-navy))" }}
          >
            Select a region to view providers
          </p>
          <p className="text-xs mt-1" style={{ color: "oklch(0.55 0.02 240)" }}>
            Choose from {CITY_LIST.length} regions across Australia
          </p>
        </div>
      )}

      {/* Provider list view */}
      {selectedCity && !selectedProvider && (
        <>
          {/* City summary bar */}
          <div
            className="flex items-center justify-between px-4 py-2.5 border rounded-none"
            style={{
              background: "oklch(0.95 0.012 254)",
              borderColor: "oklch(0.82 0.05 254)",
            }}
          >
            <div className="flex items-center gap-2">
              <MapPin
                className="w-4 h-4"
                style={{ color: "oklch(var(--gov-navy))" }}
              />
              <span
                className="font-bold text-sm"
                style={{ color: "oklch(var(--gov-navy))" }}
              >
                {selectedCity}
              </span>
              <span
                className="text-xs"
                style={{ color: "oklch(0.48 0.025 250)" }}
              >
                — {providers.length} registered provider
                {providers.length !== 1 ? "s" : ""}
              </span>
            </div>
            <span className="badge-navy">{providers.length} Providers</span>
          </div>

          {/* Region bar chart comparison */}
          <RegionComparisonChart providers={providers} />

          {/* Provider grid */}
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            data-ocid="regional_provider.provider.list"
          >
            {providers.map((provider, idx) => (
              <ProviderCard
                key={provider.id}
                provider={provider}
                index={idx + 1}
                onSelect={setSelectedProvider}
              />
            ))}
          </div>
        </>
      )}

      {/* Provider detail */}
      {selectedCity && selectedProvider && (
        <ProviderDetail
          provider={selectedProvider}
          allProviders={providers}
          onBack={() => setSelectedProvider(null)}
        />
      )}
    </div>
  );
}
