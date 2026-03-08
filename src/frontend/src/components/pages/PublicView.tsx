import { BenchmarkStatusChip } from "@/components/ui/BenchmarkStatusChip";
import { IncentiveEligibilityBadge } from "@/components/ui/IncentiveEligibilityBadge";
import { PerformanceAlertModal } from "@/components/ui/PerformanceAlertModal";
import { StarRating } from "@/components/ui/StarRating";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Award,
  BedDouble,
  Building2,
  CalendarDays,
  CheckCircle,
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
import {
  type DomainScores,
  calcWeightedProviderRating,
} from "../../utils/ratingEngine";

// ── Helpers ────────────────────────────────────────────────────────────────────

function calcOverallFromIndicators(ind: CityProvider["indicators"]): number {
  // Map CityProvider indicator keys to domain scores using the weighted engine
  const domains: DomainScores = {
    safety: ind.safetyClinical,
    preventive: ind.preventiveCare,
    quality: ind.qualityMeasures,
    staffing: ind.staffing,
    compliance: ind.compliance,
    experience: (ind.residents + ind.experience) / 2,
  };
  return calcWeightedProviderRating(domains).score;
}

function ratingColor(score: number): string {
  if (score >= 4.0) return "oklch(0.38 0.14 145)";
  if (score >= 3.0) return "oklch(0.50 0.16 72)";
  return "oklch(0.48 0.20 25)";
}

function ratingBandLabel(score: number): string {
  if (score >= 4.5) return "Excellent";
  if (score >= 4.0) return "Good";
  if (score >= 3.0) return "Moderate";
  return "Poor";
}

function ratingBadgeClass(score: number): string {
  if (score >= 4.0) return "badge-green";
  if (score >= 3.0) return "badge-amber";
  return "badge-red";
}

function typeBadge(type: string) {
  if (type === "Residential") return <span className="badge-navy">{type}</span>;
  if (type === "Home Care") return <span className="badge-blue">{type}</span>;
  return <span className="badge-gray">{type}</span>;
}

function TrendArrow({
  trend,
}: { trend: "improving" | "declining" | "stable" }) {
  if (trend === "improving")
    return (
      <TrendingUp
        className="w-3.5 h-3.5"
        style={{ color: "oklch(0.45 0.15 145)" }}
      />
    );
  if (trend === "declining")
    return (
      <TrendingDown
        className="w-3.5 h-3.5"
        style={{ color: "oklch(0.48 0.20 25)" }}
      />
    );
  return (
    <Minus className="w-3.5 h-3.5" style={{ color: "oklch(0.55 0.02 240)" }} />
  );
}

// ── Build alert indicators from CityProvider ──────────────────────────────────

const PUBLIC_INDICATOR_KEYS: {
  key: keyof CityProvider["indicators"];
  label: string;
}[] = [
  { key: "residents", label: "Residents Experience" },
  { key: "staffing", label: "Staffing" },
  { key: "qualityMeasures", label: "Quality Measures" },
  { key: "compliance", label: "Compliance" },
  { key: "safetyClinical", label: "Safety & Clinical" },
  { key: "preventiveCare", label: "Preventive Care" },
  { key: "experience", label: "Experience" },
  { key: "equity", label: "Equity" },
];

function buildPublicAlertIndicators(
  provider: CityProvider,
): IndicatorForAlert[] {
  return PUBLIC_INDICATOR_KEYS.map((ind) => ({
    label: ind.label,
    score: provider.indicators[ind.key],
    providerValue: provider.indicators[ind.key],
    benchmark: 3.5,
    isLowerBetter: false,
  }));
}

// ── Indicator config for public display ───────────────────────────────────────

const PUBLIC_INDICATORS: {
  key: keyof CityProvider["indicators"];
  label: string;
}[] = [
  { key: "residents", label: "Residents Experience" },
  { key: "staffing", label: "Staffing" },
  { key: "qualityMeasures", label: "Quality Measures" },
  { key: "compliance", label: "Compliance" },
  { key: "safetyClinical", label: "Safety & Clinical" },
  { key: "preventiveCare", label: "Preventive Care" },
  { key: "experience", label: "Experience" },
  { key: "equity", label: "Equity" },
];

// ── Regional Comparison Bar Chart ─────────────────────────────────────────────

function RegionComparisonChart({
  providers,
  selectedId,
}: {
  providers: CityProvider[];
  selectedId?: string;
}) {
  const data = providers.map((p) => ({
    name: p.name.length > 18 ? `${p.name.slice(0, 16)}…` : p.name,
    fullName: p.name,
    rating: Number.parseFloat(
      calcOverallFromIndicators(p.indicators).toFixed(2),
    ),
    id: p.id,
  }));

  return (
    <Card
      className="rounded-none border"
      data-ocid="public.comparison.chart_point"
    >
      <CardHeader className="pb-2 pt-4 px-4 border-b">
        <CardTitle className="text-sm font-semibold text-gov-navy">
          Regional Provider Rating Comparison
        </CardTitle>
        <p
          className="text-xs mt-0.5"
          style={{ color: "oklch(0.50 0.025 250)" }}
        >
          Weighted overall rating by provider — Benchmark at 3.5 stars
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
            Good (4.0+)
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="inline-block w-3 h-3 rounded-sm"
              style={{ background: "oklch(0.70 0.14 72)" }}
            />
            Moderate (3.0–3.9)
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="inline-block w-3 h-3 rounded-sm"
              style={{ background: "oklch(0.52 0.22 25)" }}
            />
            Poor (&lt;3.0)
          </span>
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
              }}
              formatter={(
                value: number,
                _: string,
                entry: { payload?: { fullName?: string } },
              ) => [
                `${(value as number).toFixed(2)} / 5.0`,
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
                  fill={
                    entry.id === selectedId
                      ? "oklch(0.28 0.09 254)"
                      : entry.rating >= 4.0
                        ? "oklch(0.52 0.15 145)"
                        : entry.rating >= 3.0
                          ? "oklch(0.70 0.14 72)"
                          : "oklch(0.52 0.22 25)"
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// ── KPI Summary Cards ─────────────────────────────────────────────────────────

function CityKPICards({ providers }: { providers: CityProvider[] }) {
  const ratings = providers.map((p) => calcOverallFromIndicators(p.indicators));
  const avgRating = ratings.reduce((s, r) => s + r, 0) / ratings.length;
  const highest = providers.reduce((prev, curr) =>
    calcOverallFromIndicators(curr.indicators) >
    calcOverallFromIndicators(prev.indicators)
      ? curr
      : prev,
  );
  const highestRating = calcOverallFromIndicators(highest.indicators);

  const kpiStyle = {
    background: "#fff",
    borderLeft: "4px solid oklch(var(--gov-navy))",
    borderTop: "1px solid oklch(var(--border))",
    borderRight: "1px solid oklch(var(--border))",
    borderBottom: "1px solid oklch(var(--border))",
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="p-4" style={kpiStyle} data-ocid="public.kpi.highest.card">
        <div
          className="text-xs uppercase font-bold tracking-widest mb-2"
          style={{ color: "oklch(0.46 0.025 250)" }}
        >
          Highest Rated Provider
        </div>
        <div className="flex items-center gap-1.5 mb-1">
          <Award
            className="w-4 h-4 flex-shrink-0"
            style={{ color: "oklch(0.52 0.15 145)" }}
          />
          <span
            className="text-xl font-black tabular-nums"
            style={{ color: ratingColor(highestRating) }}
          >
            {highestRating.toFixed(2)}
          </span>
        </div>
        <div
          className="text-xs font-semibold truncate"
          style={{ color: "oklch(0.35 0.06 254)" }}
        >
          {highest.name}
        </div>
      </div>

      <div
        className="p-4"
        style={{ ...kpiStyle, borderLeftColor: "oklch(0.50 0.16 72)" }}
        data-ocid="public.kpi.average.card"
      >
        <div
          className="text-xs uppercase font-bold tracking-widest mb-2"
          style={{ color: "oklch(0.46 0.025 250)" }}
        >
          Average Rating
        </div>
        <div
          className="text-3xl font-black tabular-nums leading-none"
          style={{ color: ratingColor(avgRating) }}
        >
          {avgRating.toFixed(2)}
        </div>
        <div className="mt-1.5">
          <StarRating value={avgRating} size="sm" showLabel={false} />
        </div>
      </div>

      <div
        className="p-4"
        style={{ ...kpiStyle, borderLeftColor: "oklch(0.28 0.09 254)" }}
        data-ocid="public.kpi.count.card"
      >
        <div
          className="text-xs uppercase font-bold tracking-widest mb-2"
          style={{ color: "oklch(0.46 0.025 250)" }}
        >
          Providers Monitored
        </div>
        <div className="text-3xl font-black tabular-nums leading-none text-gov-navy">
          {providers.length}
        </div>
        <div className="text-xs mt-2" style={{ color: "oklch(0.55 0.02 240)" }}>
          Registered in this region
        </div>
      </div>
    </div>
  );
}

// ── Provider Detail Panel ─────────────────────────────────────────────────────

function ProviderDetailPanel({
  provider,
  allProviders,
  onBack,
}: {
  provider: CityProvider;
  allProviders: CityProvider[];
  onBack: () => void;
}) {
  const overall = calcOverallFromIndicators(provider.indicators);
  const belowThree = PUBLIC_INDICATORS.filter(
    (ind) => provider.indicators[ind.key] < 3.0,
  ).length;
  const hasBelowBenchmark = PUBLIC_INDICATORS.some(
    (ind) => provider.indicators[ind.key] < 3.5,
  );
  const incentiveEligible = isEligibleForIncentive(overall, hasBelowBenchmark);

  const [alertOpen, setAlertOpen] = useState(false);
  const [currentAlert, setCurrentAlert] = useState<PerformanceAlert | null>(
    null,
  );

  useEffect(() => {
    const indicators = buildPublicAlertIndicators(provider);
    const alertResult = resolveAlertToShow(provider.name, overall, indicators);
    if (alertResult) {
      setCurrentAlert(alertResult);
      setAlertOpen(true);
    } else {
      setCurrentAlert(null);
      setAlertOpen(false);
    }
  }, [provider, overall]);

  return (
    <div className="space-y-6" data-ocid="public.provider.detail.panel">
      {/* Back button and header */}
      <div className="flex items-start gap-4 border-b pb-4">
        <button
          type="button"
          data-ocid="public.provider.detail.back_button"
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

      {/* Indicator Scorecard Table */}
      <Card className="rounded-none border">
        <CardHeader className="pb-2 pt-4 px-4 border-b">
          <CardTitle className="text-sm font-semibold text-gov-navy">
            Quality Indicator Ratings
          </CardTitle>
          <p
            className="text-xs mt-0.5"
            style={{ color: "oklch(0.50 0.025 250)" }}
          >
            Star ratings across 8 care quality domains
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full gov-table">
            <thead>
              <tr>
                <th className="text-left" style={{ width: "30%" }}>
                  Indicator
                </th>
                <th className="text-left" style={{ width: "28%" }}>
                  Star Rating
                </th>
                <th className="text-center" style={{ width: "10%" }}>
                  Score
                </th>
                <th className="text-left" style={{ width: "18%" }}>
                  vs Benchmark
                </th>
                <th className="text-center" style={{ width: "14%" }}>
                  Band
                </th>
              </tr>
            </thead>
            <tbody>
              {PUBLIC_INDICATORS.map((ind, idx) => {
                const score = provider.indicators[ind.key];
                const meta = provider.indicatorMeta?.[ind.key];
                const trend = meta?.trend ?? "stable";
                const isLow = score < 3.0;
                const isHigh = score >= 4.5;

                return (
                  <tr
                    key={ind.key}
                    data-ocid={`public.indicator.row.${idx + 1}`}
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
                        {ind.label}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <StarRating value={score} size="md" showLabel={false} />
                        <TrendArrow trend={trend} />
                      </div>
                    </td>
                    <td className="text-center">
                      <span
                        className="font-bold tabular-nums text-sm"
                        style={{ color: ratingColor(score) }}
                      >
                        {score.toFixed(1)}
                      </span>
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

      {/* Overall Rating card */}
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
        data-ocid="public.provider.overall_rating.card"
      >
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <div className="flex-1">
              <div
                className="text-xs uppercase font-bold tracking-widest mb-1"
                style={{ color: "oklch(0.46 0.025 250)" }}
              >
                Overall Provider Rating
              </div>
              <div
                className="text-xs mb-3"
                style={{ color: "oklch(0.40 0.03 250)" }}
              >
                Overall rating calculated using weighted composite score of key
                indicators.
              </div>
              <StarRating value={overall} size="lg" />
              <div
                className="mt-3 text-xs pt-3 border-t"
                style={{
                  color: "oklch(0.50 0.025 250)",
                  borderColor: "oklch(0.82 0.06 145)",
                }}
              >
                <span className="font-semibold">Safety 30%</span>
                {" · "}
                <span className="font-semibold">Preventive Care 20%</span>
                {" · "}
                <span className="font-semibold">Quality Measures 20%</span>
                {" · "}
                <span className="font-semibold">Staffing 15%</span>
                {" · "}
                <span className="font-semibold">Compliance 10%</span>
                {" · "}
                <span className="font-semibold">Experience 5%</span>
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
                  style={{ background: ratingColor(overall), color: "#fff" }}
                >
                  {ratingBandLabel(overall)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Warning for low indicators */}
      {belowThree > 0 && (
        <div
          className="flex items-center gap-2 px-4 py-3 text-xs font-semibold border"
          style={{
            background: "oklch(0.97 0.025 25)",
            border: "1px solid oklch(0.72 0.14 25)",
            color: "oklch(0.42 0.20 25)",
          }}
          data-ocid="public.provider.warning.panel"
        >
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          {belowThree} indicator{belowThree !== 1 ? "s" : ""} below acceptable
          threshold — this provider may require improvement action.
        </div>
      )}

      {/* Comparison chart */}
      <RegionComparisonChart
        providers={allProviders}
        selectedId={provider.id}
      />

      {/* Performance Alert Modal */}
      <PerformanceAlertModal
        open={alertOpen}
        onClose={() => setAlertOpen(false)}
        alert={currentAlert}
      />
    </div>
  );
}

// ── Provider Card ─────────────────────────────────────────────────────────────

function ProviderCard({
  provider,
  index,
  onSelect,
}: {
  provider: CityProvider;
  index: number;
  onSelect: (p: CityProvider) => void;
}) {
  const overall = calcOverallFromIndicators(provider.indicators);
  const belowThree = PUBLIC_INDICATORS.filter(
    (ind) => provider.indicators[ind.key] < 3.0,
  ).length;

  return (
    <button
      type="button"
      data-ocid={`public.provider.card.${index}`}
      className="border rounded-none bg-white hover:shadow-md transition-shadow cursor-pointer group w-full text-left"
      style={{ borderColor: "oklch(var(--border))" }}
      onClick={() => onSelect(provider)}
      aria-label={`View details for ${provider.name}`}
    >
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

        <div>
          <div
            className="text-xs uppercase tracking-wide font-semibold mb-1"
            style={{ color: "oklch(0.46 0.025 250)" }}
          >
            Overall Rating
          </div>
          <StarRating value={overall} size="md" />
        </div>

        <Button
          size="sm"
          variant="outline"
          className="w-full rounded-none border text-xs font-semibold mt-1 group-hover:bg-gov-navy group-hover:text-white transition-colors"
          style={{
            borderColor: "oklch(var(--gov-navy))",
            color: "oklch(var(--gov-navy))",
          }}
          data-ocid={`public.provider.view_details.button.${index}`}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(provider);
          }}
        >
          View Provider Scorecard
        </Button>
      </div>
    </button>
  );
}

// ── Main Public View ───────────────────────────────────────────────────────────

export default function PublicView() {
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedProvider, setSelectedProvider] = useState<CityProvider | null>(
    null,
  );

  const providers = selectedCity ? (CITY_PROVIDERS[selectedCity] ?? []) : [];

  function handleCityChange(city: string) {
    setSelectedCity(city);
    setSelectedProvider(null);
  }

  function handleProviderSelect(provider: CityProvider) {
    setSelectedProvider(provider);
  }

  return (
    <div className="p-6 space-y-6" data-ocid="public.page">
      {/* Page header */}
      <div className="flex items-start justify-between border-b pb-4">
        <div>
          <h1 className="text-xl font-bold text-gov-navy">
            Aged Care Provider Directory
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Public transparency portal — View and compare aged care provider
            quality ratings by region
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

      {/* Disclaimer banner */}
      <div
        className="flex items-start gap-3 px-4 py-3 border text-xs"
        style={{
          background: "oklch(0.97 0.01 254)",
          borderColor: "oklch(0.82 0.05 254)",
          color: "oklch(0.40 0.04 254)",
        }}
      >
        <CheckCircle
          className="w-4 h-4 flex-shrink-0 mt-0.5"
          style={{ color: "oklch(0.45 0.15 145)" }}
        />
        <div>
          <span className="font-bold">Public View — Quality Ratings Only.</span>{" "}
          Resident data, regulatory actions, cohort information, and operational
          details are not displayed in the public portal. Ratings are based on
          nationally standardized quality indicators.
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
            data-ocid="public.region.select"
          >
            <SelectValue placeholder="Select a region..." />
          </SelectTrigger>
          <SelectContent className="rounded-none">
            {CITY_LIST.map((city, idx) => (
              <SelectItem
                key={city}
                value={city}
                data-ocid={`public.city.item.${idx + 1}`}
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
          data-ocid="public.empty_state"
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
            Choose from {CITY_LIST.length} regions to compare aged care quality
            ratings
          </p>
        </div>
      )}

      {/* Provider list view */}
      {selectedCity && !selectedProvider && (
        <>
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

          {/* KPI Cards */}
          <CityKPICards providers={providers} />

          {/* Comparison chart */}
          <RegionComparisonChart providers={providers} />

          {/* Provider grid */}
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            data-ocid="public.provider.list"
          >
            {providers.map((provider, idx) => (
              <ProviderCard
                key={provider.id}
                provider={provider}
                index={idx + 1}
                onSelect={handleProviderSelect}
              />
            ))}
          </div>
        </>
      )}

      {/* Provider detail */}
      {selectedCity && selectedProvider && (
        <ProviderDetailPanel
          provider={selectedProvider}
          allProviders={providers}
          onBack={() => setSelectedProvider(null)}
        />
      )}
    </div>
  );
}
