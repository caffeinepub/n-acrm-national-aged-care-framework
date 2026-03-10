import { BenchmarkStatusChip } from "@/components/ui/BenchmarkStatusChip";
import { IncentiveEligibilityBadge } from "@/components/ui/IncentiveEligibilityBadge";
import { PerformanceAlertModal } from "@/components/ui/PerformanceAlertModal";
import { StarRating } from "@/components/ui/StarRating";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getBenchmarkStatus,
  isEligibleForIncentive,
} from "@/utils/benchmarkUtils";
import type {
  IndicatorForAlert,
  PerformanceAlert,
} from "@/utils/performanceAlerts";
import { resolveAlertToShow } from "@/utils/performanceAlerts";
import { Minus, Search, TrendingDown, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import {
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
  MOCK_SCORECARDS,
  UNIFIED_PROVIDERS,
  type UnifiedProvider,
  getUnifiedProviderDomainScores,
  getUnifiedProviderIndicators,
} from "../../data/mockData";
import {
  useIndicatorResults,
  useScorecardsByProvider,
} from "../../hooks/useQueries";
import { calcIndicatorStarRating } from "../../utils/ratingEngine";

interface ProviderPerformanceProps {
  currentQuarter: string;
}

function getQuintileStyle(rank: number) {
  const styles: Record<number, { bg: string; color: string; label: string }> = {
    1: {
      bg: "oklch(0.93 0.07 145)",
      color: "oklch(0.28 0.14 145)",
      label: "1st Quintile",
    },
    2: {
      bg: "oklch(0.95 0.05 145)",
      color: "oklch(0.40 0.12 145)",
      label: "2nd Quintile",
    },
    3: {
      bg: "oklch(0.96 0.05 80)",
      color: "oklch(0.43 0.14 72)",
      label: "3rd Quintile",
    },
    4: {
      bg: "oklch(0.95 0.06 50)",
      color: "oklch(0.48 0.18 50)",
      label: "4th Quintile",
    },
    5: {
      bg: "oklch(0.96 0.04 25)",
      color: "oklch(0.42 0.20 25)",
      label: "5th Quintile",
    },
  };
  return styles[rank] || styles[3];
}

function getAccreditationBadge(status: string) {
  if (status === "accredited")
    return <span className="badge-green">Accredited</span>;
  if (status === "conditional")
    return <span className="badge-amber">Conditional</span>;
  return <span className="badge-red">Not Accredited</span>;
}

function getTrendIcon(trend: string) {
  if (trend === "improving")
    return (
      <TrendingUp
        className="w-3 h-3 inline text-gov-green"
        aria-label="Improving"
      />
    );
  if (trend === "declining")
    return (
      <TrendingDown
        className="w-3 h-3 inline text-gov-red"
        aria-label="Declining"
      />
    );
  return (
    <Minus
      className="w-3 h-3 inline text-muted-foreground"
      aria-label="Stable"
    />
  );
}

function ScoreCard({
  label,
  value,
  quintile,
  scale = "percent",
}: {
  label: string;
  value: number;
  quintile?: number;
  scale?: "percent" | "stars";
}) {
  const scoreColor =
    scale === "stars"
      ? value >= 4.0
        ? "oklch(var(--gov-green))"
        : value >= 3.0
          ? "oklch(var(--gov-amber))"
          : "oklch(var(--gov-red))"
      : value >= 80
        ? "oklch(var(--gov-green))"
        : value >= 70
          ? "oklch(var(--gov-amber))"
          : "oklch(var(--gov-red))";

  return (
    <Card className="rounded-none border">
      <CardContent className="p-3">
        <div className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-1">
          {label}
        </div>
        <div className="text-2xl font-bold" style={{ color: scoreColor }}>
          {value.toFixed(1)}
        </div>
        {quintile && (
          <div
            className="inline-flex items-center mt-1 px-1.5 py-0.5 rounded text-xs font-bold"
            style={{
              background: getQuintileStyle(quintile).bg,
              color: getQuintileStyle(quintile).color,
            }}
          >
            {getQuintileStyle(quintile).label}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function ProviderPerformance({
  currentQuarter,
}: ProviderPerformanceProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<UnifiedProvider>(
    UNIFIED_PROVIDERS[0],
  );

  // Performance alert state
  const [alertOpen, setAlertOpen] = useState(false);
  const [currentAlert, setCurrentAlert] = useState<PerformanceAlert | null>(
    null,
  );

  const filteredProviders = UNIFIED_PROVIDERS.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.state.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Try live data, fall back to mock
  const { data: liveScorecards, isLoading: scorecardsLoading } =
    useScorecardsByProvider(selectedProvider.id);
  const { data: liveIndicators, isLoading: indicatorsLoading } =
    useIndicatorResults(selectedProvider.id, currentQuarter);

  const scorecards =
    liveScorecards && liveScorecards.length > 0
      ? liveScorecards.map((s) => ({
          ...s,
          quintileRank: Number(s.quintileRank),
        }))
      : MOCK_SCORECARDS(selectedProvider.id);

  const indicators =
    liveIndicators && liveIndicators.length > 0
      ? liveIndicators.map((ind) => ({
          ...ind,
          quintileRank: Number(ind.quintileRank),
          // isLowerBetter not available from backend; default to false
          isLowerBetter: false as boolean,
        }))
      : getUnifiedProviderIndicators(selectedProvider.id, currentQuarter);

  const latestScorecard = scorecards[scorecards.length - 1];
  const dimensions = [
    "Safety",
    "Preventive",
    "Quality",
    "Staffing",
    "Compliance",
    "Experience",
  ];

  // Compute domain star ratings from unified provider data (provider-specific, changes per provider)
  const domainStars = useMemo(
    () => getUnifiedProviderDomainScores(selectedProvider.id, currentQuarter),
    [selectedProvider.id, currentQuarter],
  );

  // Weighted overall star score: Safety 30%, Preventive 20%, Quality 20%, Staffing 15%, Compliance 10%, Experience 5%
  const overallStars = useMemo(
    () =>
      domainStars.safety * 0.3 +
      domainStars.preventive * 0.2 +
      domainStars.quality * 0.2 +
      domainStars.staffing * 0.15 +
      domainStars.compliance * 0.1 +
      domainStars.experience * 0.05,
    [domainStars],
  );

  function handleProviderSelect(provider: UnifiedProvider) {
    setSelectedProvider(provider);
    // Build indicator list for alert engine
    const provInds = getUnifiedProviderIndicators(provider.id, currentQuarter);
    const alertIndicators: IndicatorForAlert[] = provInds.map((ind) => ({
      label: ind.indicatorName,
      score: calcIndicatorStarRating(
        ind.quintileRank,
        ind.trend,
        ind.rate,
        ind.nationalBenchmark,
        ind.isLowerBetter,
      ),
      providerValue: ind.rate,
      benchmark: ind.nationalBenchmark,
      isLowerBetter: ind.isLowerBetter,
    }));
    const domScores = getUnifiedProviderDomainScores(
      provider.id,
      currentQuarter,
    );
    const overall =
      domScores.safety * 0.3 +
      domScores.preventive * 0.2 +
      domScores.quality * 0.2 +
      domScores.staffing * 0.15 +
      domScores.compliance * 0.1 +
      domScores.experience * 0.05;
    const alert = resolveAlertToShow(provider.name, overall, alertIndicators);
    if (alert) {
      setCurrentAlert(alert);
      setAlertOpen(true);
    }
  }

  return (
    <div className="p-6 space-y-5">
      <div className="border-b pb-4">
        <h1 className="text-xl font-bold text-gov-navy">
          Provider Performance
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Provider scorecards and indicator results — {currentQuarter}
        </p>
      </div>

      <div className="flex gap-4">
        {/* Provider list panel */}
        <div
          className="flex-shrink-0 border rounded-none"
          style={{ width: "220px" }}
        >
          <div className="p-3 border-b bg-muted">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search providers..."
                className="pl-8 h-7 text-xs rounded-none border-0 bg-white focus-visible:ring-1"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-ocid="provider_performance.provider_search.input"
                aria-label="Search providers"
              />
            </div>
          </div>
          <div
            className="overflow-y-auto"
            style={{ maxHeight: "calc(100vh - 280px)" }}
          >
            {filteredProviders.map((provider, idx) => (
              <button
                type="button"
                key={provider.id}
                onClick={() => handleProviderSelect(provider)}
                data-ocid={`provider_performance.provider.item.${idx + 1}`}
                aria-label={`Select provider ${provider.name}`}
                className="w-full text-left px-3 py-2.5 border-b transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
                style={{
                  background:
                    selectedProvider.id === provider.id
                      ? "oklch(0.93 0.03 254)"
                      : "transparent",
                  borderLeft:
                    selectedProvider.id === provider.id
                      ? "3px solid oklch(var(--gov-navy))"
                      : "3px solid transparent",
                }}
              >
                <div className="text-xs font-semibold leading-tight">
                  {provider.name}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {provider.city} · {provider.type}
                  {provider.beds ? ` · ${provider.beds} beds` : ""}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Provider detail */}
        <div className="flex-1 space-y-4 min-w-0">
          {/* Provider header */}
          <div
            className="p-4 border rounded-none"
            style={{ background: "oklch(0.97 0.01 254)" }}
          >
            <div className="flex items-start justify-between flex-wrap gap-2">
              <div>
                <h2 className="text-lg font-bold text-gov-navy">
                  {selectedProvider.name}
                </h2>
                <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground flex-wrap">
                  <span>{selectedProvider.city}</span>
                  <span>·</span>
                  <span>{selectedProvider.state}</span>
                  <span>·</span>
                  <span>{selectedProvider.type}</span>
                  {selectedProvider.beds && (
                    <>
                      <span>·</span>
                      <span>{selectedProvider.beds} beds</span>
                    </>
                  )}
                  <span>·</span>
                  <span>
                    ACQSC Standards: {selectedProvider.acqscStandards}/8
                  </span>
                </div>
                {/* Incentive Eligibility Badge */}
                <div className="mt-2">
                  <IncentiveEligibilityBadge
                    eligible={isEligibleForIncentive(
                      overallStars,
                      indicators.some(
                        (ind) =>
                          getBenchmarkStatus(
                            ind.rate,
                            ind.nationalBenchmark,
                            ind.isLowerBetter,
                          ) === "below",
                      ),
                    )}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getAccreditationBadge(selectedProvider.accreditationStatus)}
                {latestScorecard && (
                  <div
                    className="px-2 py-0.5 text-xs font-bold rounded"
                    style={{
                      background: getQuintileStyle(latestScorecard.quintileRank)
                        .bg,
                      color: getQuintileStyle(latestScorecard.quintileRank)
                        .color,
                    }}
                  >
                    {getQuintileStyle(latestScorecard.quintileRank).label}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Score cards */}
          {scorecardsLoading ? (
            <div className="grid grid-cols-4 gap-3">
              {["s1", "s2", "s3", "s4", "s5", "s6", "s7"].map((k) => (
                <Skeleton key={k} className="h-20 rounded-none" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              <ScoreCard
                label="Overall Score"
                value={Number.parseFloat(overallStars.toFixed(2))}
                quintile={latestScorecard?.quintileRank}
                scale="stars"
              />
              <ScoreCard
                label="Safety"
                value={domainStars.safety}
                scale="stars"
              />
              <ScoreCard
                label="Preventive"
                value={domainStars.preventive}
                scale="stars"
              />
              <ScoreCard
                label="Experience"
                value={domainStars.experience}
                scale="stars"
              />
              <ScoreCard
                label="Quality"
                value={domainStars.quality}
                scale="stars"
              />
              <ScoreCard
                label="Staffing"
                value={domainStars.staffing}
                scale="stars"
              />
              <ScoreCard
                label="Compliance"
                value={domainStars.compliance}
                scale="stars"
              />
            </div>
          )}

          {/* 4-quarter trend */}
          <Card className="rounded-none border">
            <CardHeader className="pb-2 pt-4 px-4 border-b">
              <CardTitle className="text-sm font-semibold text-gov-navy">
                Score Trend — 4 Quarters
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <ResponsiveContainer width="100%" height={180}>
                <LineChart
                  data={scorecards}
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
                    domain={[60, 90]}
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{ fontSize: "12px", borderRadius: "2px" }}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                  <Line
                    type="monotone"
                    dataKey="overallScore"
                    name="Overall"
                    stroke="oklch(0.28 0.09 254)"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="safetyScore"
                    name="Safety"
                    stroke="oklch(0.52 0.22 25)"
                    strokeWidth={1.5}
                    strokeDasharray="4 2"
                    dot={{ r: 2 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="preventiveScore"
                    name="Preventive"
                    stroke="oklch(0.52 0.15 145)"
                    strokeWidth={1.5}
                    strokeDasharray="4 2"
                    dot={{ r: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Indicator table */}
          <Card className="rounded-none border">
            <CardHeader className="pb-2 pt-4 px-4 border-b">
              <CardTitle className="text-sm font-semibold text-gov-navy">
                Indicator Results — {currentQuarter}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {indicatorsLoading ? (
                <div className="p-4 space-y-2">
                  {["i1", "i2", "i3", "i4", "i5"].map((k) => (
                    <Skeleton key={k} className="h-8" />
                  ))}
                </div>
              ) : (
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
                        <th className="text-left">vs Benchmark</th>
                        <th className="text-left">Quintile</th>
                        <th className="text-left">Trend</th>
                        <th className="text-left">Star Rating</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dimensions.map((dim) => {
                        const dimIndicators = indicators.filter(
                          (ind) => ind.dimension === dim,
                        );
                        if (!dimIndicators.length) return null;
                        return [
                          <tr key={`dim-${dim}`}>
                            <td
                              colSpan={8}
                              className="font-bold text-xs uppercase tracking-wide py-1.5"
                              style={{
                                background: "oklch(0.94 0.012 240)",
                                color: "oklch(var(--gov-navy))",
                                paddingLeft: "0.75rem",
                              }}
                            >
                              {dim}
                            </td>
                          </tr>,
                          ...dimIndicators.map((ind) => {
                            const qStyle = getQuintileStyle(ind.quintileRank);
                            const ilb = ind.isLowerBetter;
                            const starRating = calcIndicatorStarRating(
                              ind.quintileRank,
                              ind.trend,
                              ind.rate,
                              ind.nationalBenchmark,
                              ilb,
                            );
                            return (
                              <tr key={ind.id}>
                                <td className="font-medium">
                                  {ind.indicatorName}
                                </td>
                                <td className="font-mono text-xs text-muted-foreground">
                                  {ind.indicatorCode}
                                </td>
                                <td className="text-right font-semibold">
                                  {ind.rate.toFixed(1)}
                                </td>
                                <td className="text-right text-muted-foreground">
                                  {ind.nationalBenchmark.toFixed(1)}
                                </td>
                                <td>
                                  <BenchmarkStatusChip
                                    rate={ind.rate}
                                    benchmark={ind.nationalBenchmark}
                                    isLowerBetter={ilb}
                                    size="xs"
                                  />
                                </td>
                                <td>
                                  <span
                                    className="px-1.5 py-0.5 rounded text-xs font-bold"
                                    style={{
                                      background: qStyle.bg,
                                      color: qStyle.color,
                                    }}
                                  >
                                    Q{ind.quintileRank}
                                  </span>
                                </td>
                                <td>
                                  {getTrendIcon(ind.trend)}
                                  <span className="ml-1 text-xs capitalize">
                                    {ind.trend}
                                  </span>
                                </td>
                                <td>
                                  <StarRating
                                    value={starRating}
                                    size="sm"
                                    showLabel={false}
                                  />
                                </td>
                              </tr>
                            );
                          }),
                        ];
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
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
