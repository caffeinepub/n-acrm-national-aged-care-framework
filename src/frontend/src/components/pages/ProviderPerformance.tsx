import { StarRating } from "@/components/ui/StarRating";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle2,
  Minus,
  RefreshCw,
  Search,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
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
  MOCK_INDICATORS,
  MOCK_PROVIDERS,
  MOCK_SCORECARDS,
  type MockProvider,
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
}: {
  label: string;
  value: number;
  quintile?: number;
}) {
  const scoreColor =
    value >= 80
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
  const [selectedProvider, setSelectedProvider] = useState<MockProvider>(
    MOCK_PROVIDERS[0],
  );

  const filteredProviders = MOCK_PROVIDERS.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
        }))
      : MOCK_INDICATORS(selectedProvider.id);

  const latestScorecard = scorecards[scorecards.length - 1];
  const dimensions = ["Safety", "Preventive", "Experience", "Equity"];

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

      {/* Ratings Synchronized status banner */}
      <div
        className="flex items-center gap-3 px-4 py-2.5 border text-xs"
        style={{
          background: "oklch(0.97 0.01 254)",
          borderColor: "oklch(0.82 0.05 254)",
          color: "oklch(0.40 0.04 254)",
        }}
        data-ocid="provider_performance.sync.panel"
      >
        <RefreshCw
          className="w-3.5 h-3.5 flex-shrink-0"
          style={{ color: "oklch(0.45 0.15 145)" }}
        />
        <div className="flex items-center gap-1.5 flex-wrap font-semibold">
          <CheckCircle2 className="w-3.5 h-3.5 text-gov-green flex-shrink-0" />
          <span className="text-gov-green font-bold">Ratings Synchronized</span>
          <span className="text-muted-foreground font-normal mx-1">·</span>
          <span>Indicator Data</span>
          <span>→</span>
          <span>Indicator Rating</span>
          <span>→</span>
          <span>Scorecard</span>
          <span>→</span>
          <span>Overall Rating</span>
          <span>→</span>
          <span>Pay-for-Improvement</span>
        </div>
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
            {filteredProviders.slice(0, 10).map((provider, idx) => (
              <button
                type="button"
                key={provider.id}
                onClick={() => setSelectedProvider(provider)}
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
                  {provider.state} · {provider.serviceType}
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
                  <span>{selectedProvider.state}</span>
                  <span>·</span>
                  <span>{selectedProvider.serviceType}</span>
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
            <div className="grid grid-cols-5 gap-3">
              {["s1", "s2", "s3", "s4", "s5"].map((k) => (
                <Skeleton key={k} className="h-20 rounded-none" />
              ))}
            </div>
          ) : latestScorecard ? (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <ScoreCard
                label="Overall Score"
                value={latestScorecard.overallScore}
                quintile={latestScorecard.quintileRank}
              />
              <ScoreCard label="Safety" value={latestScorecard.safetyScore} />
              <ScoreCard
                label="Preventive"
                value={latestScorecard.preventiveScore}
              />
              <ScoreCard
                label="Experience"
                value={latestScorecard.experienceScore}
              />
              <ScoreCard label="Equity" value={latestScorecard.equityScore} />
            </div>
          ) : null}

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
                              colSpan={7}
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
                            const starRating = calcIndicatorStarRating(
                              ind.quintileRank,
                              ind.trend,
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
    </div>
  );
}
