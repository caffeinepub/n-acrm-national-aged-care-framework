import { BenchmarkStatusChip } from "@/components/ui/BenchmarkStatusChip";
import { IncentiveEligibilityBadge } from "@/components/ui/IncentiveEligibilityBadge";
import { PerformanceAlertModal } from "@/components/ui/PerformanceAlertModal";
import { StarRating } from "@/components/ui/StarRating";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  getBenchmarkStatus,
  isEligibleForIncentive,
} from "@/utils/benchmarkUtils";
import type {
  IndicatorForAlert,
  PerformanceAlert,
} from "@/utils/performanceAlerts";
import { resolveAlertToShow } from "@/utils/performanceAlerts";
import {
  AlertTriangle,
  Calculator,
  CheckCircle2,
  Loader2,
  Shield,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { RatingEngineResult } from "../../backend.d";
import {
  UNIFIED_PROVIDERS,
  getUnifiedProviderIndicators,
} from "../../data/mockData";
import {
  calcDomainScore,
  calcIndicatorStarRating,
  calcPayForImprovementEligibility,
  calcWeightedProviderRating,
  scoreToStarBand,
} from "../../utils/ratingEngine";

// ── Extended local types ──────────────────────────────────────────────────────

/** Extends the generated backend type with benchmark-specific fields computed locally */
interface LocalIndicatorRating {
  indicatorCode: string;
  indicatorName: string;
  domain: string;
  quintile: bigint;
  trend: string;
  trendAdjustment: number;
  starRating: number;
  rate: number;
  benchmark: number;
  isLowerBetter: boolean;
  benchmarkStatus: "above" | "near" | "below";
}

interface LocalRatingEngineResult
  extends Omit<RatingEngineResult, "indicatorRatings"> {
  indicatorRatings: LocalIndicatorRating[];
}

// ── Editable indicator form state ─────────────────────────────────────────────

interface IndicatorRow {
  code: string;
  name: string;
  domain: string;
  rate: number;
  benchmark: number;
  quintile: number;
  trend: "improving" | "stable" | "declining";
  screeningCompletion: number;
  isLowerBetter: boolean;
}

const DEFAULT_INDICATORS: IndicatorRow[] = [
  {
    code: "SAF-001",
    name: "Falls with Harm Rate",
    domain: "Safety",
    rate: 4.2,
    benchmark: 5.1,
    quintile: 2,
    trend: "improving",
    screeningCompletion: 0,
    isLowerBetter: true,
  },
  {
    code: "SAF-002",
    name: "Medication-Related Harm",
    domain: "Safety",
    rate: 2.8,
    benchmark: 3.2,
    quintile: 2,
    trend: "stable",
    screeningCompletion: 0,
    isLowerBetter: true,
  },
  {
    code: "SAF-003",
    name: "High-Risk Medication Prevalence",
    domain: "Safety",
    rate: 18.4,
    benchmark: 21.2,
    quintile: 2,
    trend: "improving",
    screeningCompletion: 0,
    isLowerBetter: true,
  },
  {
    code: "SAF-004",
    name: "Polypharmacy ≥10 Medications",
    domain: "Safety",
    rate: 12.1,
    benchmark: 14.8,
    quintile: 2,
    trend: "stable",
    screeningCompletion: 0,
    isLowerBetter: true,
  },
  {
    code: "SAF-005",
    name: "Pressure Injuries Stage 2–4",
    domain: "Safety",
    rate: 1.8,
    benchmark: 2.4,
    quintile: 2,
    trend: "improving",
    screeningCompletion: 0,
    isLowerBetter: true,
  },
  {
    code: "PREV-001",
    name: "Falls Risk Screening Completion",
    domain: "Preventive",
    rate: 94.2,
    benchmark: 88.4,
    quintile: 1,
    trend: "improving",
    screeningCompletion: 94,
    isLowerBetter: false,
  },
  {
    code: "QM-001",
    name: "Satisfaction Survey Score",
    domain: "Quality",
    rate: 84.8,
    benchmark: 80.2,
    quintile: 2,
    trend: "stable",
    screeningCompletion: 0,
    isLowerBetter: false,
  },
  {
    code: "STAFF-001",
    name: "Registered Nurse Hours",
    domain: "Staffing",
    rate: 4.8,
    benchmark: 4.1,
    quintile: 1,
    trend: "improving",
    screeningCompletion: 0,
    isLowerBetter: false,
  },
  {
    code: "COMP-001",
    name: "Accreditation Compliance",
    domain: "Compliance",
    rate: 76.4,
    benchmark: 82.0,
    quintile: 3,
    trend: "stable",
    screeningCompletion: 0,
    isLowerBetter: false,
  },
  {
    code: "EXP-001",
    name: "Resident Satisfaction",
    domain: "Experience",
    rate: 84.8,
    benchmark: 80.2,
    quintile: 2,
    trend: "improving",
    screeningCompletion: 0,
    isLowerBetter: false,
  },
];

// ── Mock audit log ─────────────────────────────────────────────────────────────

const AUDIT_LOG_ENTRIES = [
  {
    timestamp: "2025-12-01 02:00:04",
    providerId: "PROV-001",
    quarter: "Q4-2025",
    prevStars: 3,
    newStars: 4,
    tier: "Bonus Eligible",
    trigger: "Quarterly Recalculation",
  },
  {
    timestamp: "2025-11-28 14:35:12",
    providerId: "PROV-003",
    quarter: "Q4-2025",
    prevStars: 2,
    newStars: 3,
    tier: "Not Eligible",
    trigger: "Data Submission",
  },
  {
    timestamp: "2025-11-27 09:18:44",
    providerId: "PROV-005",
    quarter: "Q4-2025",
    prevStars: 4,
    newStars: 5,
    tier: "Maximum Eligible",
    trigger: "Data Correction",
  },
  {
    timestamp: "2025-11-25 16:02:31",
    providerId: "PROV-007",
    quarter: "Q3-2025",
    prevStars: 3,
    newStars: 3,
    tier: "Base Eligible",
    trigger: "Quarterly Recalculation",
  },
  {
    timestamp: "2025-11-22 10:44:08",
    providerId: "PROV-002",
    quarter: "Q4-2025",
    prevStars: 4,
    newStars: 4,
    tier: "Bonus Eligible",
    trigger: "Data Submission",
  },
  {
    timestamp: "2025-11-20 08:15:55",
    providerId: "PROV-009",
    quarter: "Q3-2025",
    prevStars: 2,
    newStars: 2,
    tier: "Not Eligible",
    trigger: "Manual Trigger",
  },
];

// ── Helper functions ──────────────────────────────────────────────────────────

function getTierBadgeStyle(tier: string): {
  bg: string;
  color: string;
  border: string;
} {
  if (tier === "Maximum Eligible")
    return {
      bg: "oklch(0.94 0.06 145)",
      color: "oklch(0.22 0.18 145)",
      border: "oklch(0.62 0.18 145)",
    };
  if (tier === "Bonus Eligible")
    return {
      bg: "oklch(0.96 0.03 145)",
      color: "oklch(0.28 0.14 145)",
      border: "oklch(0.72 0.12 145)",
    };
  if (tier === "Base Eligible")
    return {
      bg: "oklch(0.97 0.05 75)",
      color: "oklch(0.43 0.14 72)",
      border: "oklch(0.75 0.12 75)",
    };
  return {
    bg: "oklch(0.96 0.01 240)",
    color: "oklch(0.45 0.02 240)",
    border: "oklch(0.82 0.01 240)",
  };
}

function getDomainColor(score: number): string {
  if (score >= 4.0) return "oklch(0.45 0.15 145)";
  if (score >= 3.0) return "oklch(0.55 0.14 75)";
  return "oklch(0.52 0.22 25)";
}

function getTrendIcon(trend: string) {
  if (trend === "improving")
    return (
      <TrendingUp
        className="w-3.5 h-3.5 inline mr-0.5"
        style={{ color: "oklch(0.45 0.15 145)" }}
      />
    );
  if (trend === "declining")
    return (
      <TrendingDown
        className="w-3.5 h-3.5 inline mr-0.5"
        style={{ color: "oklch(0.52 0.22 25)" }}
      />
    );
  return (
    <span
      className="inline-block w-3 h-0.5 mr-1 align-middle"
      style={{ background: "oklch(0.65 0.02 240)" }}
    />
  );
}

function getTrendAdjLabel(adj: number): React.ReactNode {
  if (adj > 0)
    return (
      <span style={{ color: "oklch(0.45 0.15 145)" }}>+{adj.toFixed(1)}</span>
    );
  if (adj < 0)
    return (
      <span style={{ color: "oklch(0.52 0.22 25)" }}>{adj.toFixed(1)}</span>
    );
  return (
    <span style={{ color: "oklch(0.55 0.02 240)" }}>{adj.toFixed(1)}</span>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

interface RatingEngineProps {
  currentQuarter: string;
}

export default function RatingEngine({ currentQuarter }: RatingEngineProps) {
  const [selectedProviderId, setSelectedProviderId] = useState(
    UNIFIED_PROVIDERS[0]?.id ?? "HYD-001",
  );
  const [providerId, setProviderId] = useState(
    UNIFIED_PROVIDERS[0]?.id ?? "HYD-001",
  );
  const [quarter, setQuarter] = useState(currentQuarter);
  const [screeningCompletion, setScreeningCompletion] = useState(78);
  const [previousSafetyScore, setPreviousSafetyScore] = useState(3.2);
  const [indicators, setIndicators] =
    useState<IndicatorRow[]>(DEFAULT_INDICATORS);
  const [result, setResult] = useState<LocalRatingEngineResult | null>(null);
  const [hasCalculated, setHasCalculated] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

  // Performance alert state
  const [alertOpen, setAlertOpen] = useState(false);
  const [currentAlert, setCurrentAlert] = useState<PerformanceAlert | null>(
    null,
  );

  function handleProviderSelect(provId: string) {
    setSelectedProviderId(provId);
    setProviderId(provId);
    // Load unified provider indicators — each provider has its own quintile & trend data
    const unifiedInds = getUnifiedProviderIndicators(provId, currentQuarter);
    const domainMap: Record<string, string> = {
      Safety: "Safety",
      Preventive: "Preventive",
      Experience: "Experience",
      Quality: "Quality",
      Staffing: "Staffing",
      Compliance: "Compliance",
    };
    const mapped: IndicatorRow[] = unifiedInds.slice(0, 10).map((m) => ({
      code: m.indicatorCode,
      name: m.indicatorName,
      domain: domainMap[m.dimension] ?? m.dimension,
      rate: m.rate,
      benchmark: m.nationalBenchmark,
      quintile: m.quintileRank,
      trend: m.trend as "improving" | "stable" | "declining",
      screeningCompletion:
        m.dimension === "Preventive" ? Math.round(m.rate) : 0,
      isLowerBetter: m.isLowerBetter,
    }));
    setIndicators(mapped);
    setResult(null);
    setHasCalculated(false);
  }

  function handleQuintileChange(idx: number, value: string) {
    setIndicators((prev) =>
      prev.map((ind, i) =>
        i === idx ? { ...ind, quintile: Number.parseInt(value) } : ind,
      ),
    );
  }

  function handleTrendChange(
    idx: number,
    value: "improving" | "stable" | "declining",
  ) {
    setIndicators((prev) =>
      prev.map((ind, i) => (i === idx ? { ...ind, trend: value } : ind)),
    );
  }

  function handleCalculate() {
    setIsCalculating(true);

    // 1. Calculate indicator star ratings (benchmark-aware)
    const indicatorRatings = indicators.map((ind) => {
      const starRating = calcIndicatorStarRating(
        ind.quintile,
        ind.trend,
        ind.rate,
        ind.benchmark,
        ind.isLowerBetter,
      );
      const trendAdjustment =
        ind.trend === "improving" ? 0.2 : ind.trend === "declining" ? -0.2 : 0;
      const benchmarkStatus = getBenchmarkStatus(
        ind.rate,
        ind.benchmark,
        ind.isLowerBetter,
      );
      return {
        indicatorCode: ind.code,
        indicatorName: ind.name,
        domain: ind.domain,
        quintile: BigInt(ind.quintile),
        trend: ind.trend,
        trendAdjustment,
        starRating,
        rate: ind.rate,
        benchmark: ind.benchmark,
        isLowerBetter: ind.isLowerBetter,
        benchmarkStatus,
      };
    });

    // Track whether any indicator is below benchmark
    const hasBelowBenchmark = indicatorRatings.some(
      (ir) => ir.benchmarkStatus === "below",
    );

    // 2. Group by domain and calculate domain scores
    const domainMap: Record<string, number[]> = {
      Safety: [],
      Preventive: [],
      Quality: [],
      Staffing: [],
      Compliance: [],
      Experience: [],
    };
    for (const ir of indicatorRatings) {
      if (domainMap[ir.domain] !== undefined) {
        domainMap[ir.domain].push(ir.starRating);
      }
    }
    const domainScores = {
      safety: calcDomainScore(
        domainMap.Safety.length > 0 ? domainMap.Safety : [3],
      ),
      preventive: calcDomainScore(
        domainMap.Preventive.length > 0 ? domainMap.Preventive : [3],
      ),
      quality: calcDomainScore(
        domainMap.Quality.length > 0 ? domainMap.Quality : [3],
      ),
      staffing: calcDomainScore(
        domainMap.Staffing.length > 0 ? domainMap.Staffing : [3],
      ),
      compliance: calcDomainScore(
        domainMap.Compliance.length > 0 ? domainMap.Compliance : [3],
      ),
      experience: calcDomainScore(
        domainMap.Experience.length > 0 ? domainMap.Experience : [3],
      ),
    };

    // 3. Compute weighted overall score
    const weighted = calcWeightedProviderRating(domainScores);
    const starBand = scoreToStarBand(weighted.score);

    // 4. Compute P4I eligibility
    const safetyImprovement =
      previousSafetyScore > 0
        ? ((domainScores.safety - previousSafetyScore) / previousSafetyScore) *
          100
        : 0;
    let eligibility = calcPayForImprovementEligibility(
      starBand,
      safetyImprovement,
    );

    // 5. Override eligibility if any indicator is below benchmark
    const incentiveEligible = isEligibleForIncentive(
      weighted.score,
      hasBelowBenchmark,
    );
    if (!incentiveEligible) {
      eligibility = {
        tier: "Not Eligible",
        eligible: false,
        estimatedPayment: 0,
      };
    }

    // 6. Upgrade to Maximum Eligible if all three criteria met
    if (
      incentiveEligible &&
      starBand >= 4 &&
      safetyImprovement >= 10 &&
      screeningCompletion >= 85
    ) {
      eligibility = {
        tier: "Maximum Eligible",
        eligible: true,
        estimatedPayment: 180000,
      };
    }

    const newResult: LocalRatingEngineResult = {
      id: `RE-${providerId}-${quarter}-${Date.now()}`,
      providerId,
      quarter,
      calculatedAt: BigInt(Date.now()) * BigInt(1_000_000),
      overallScore: weighted.score,
      overallStars: BigInt(starBand),
      previousOverallStars: BigInt(Math.max(1, starBand - 1)),
      auditNotes:
        "Rating calculated using weighted domain model. Safety 30%, Preventive 20%, Quality 20%, Staffing 15%, Compliance 10%, Experience 5%.",
      domainScores,
      indicatorRatings,
      incentiveEligibility: {
        tier: eligibility.tier,
        eligible: eligibility.eligible,
        improvementScore: Number.parseFloat(safetyImprovement.toFixed(1)),
        screeningCompletion,
        estimatedPayment: eligibility.estimatedPayment,
      },
    };

    setResult(newResult);
    setHasCalculated(true);
    setIsCalculating(false);
    toast.success("Ratings calculated and synchronized across all modules");

    // Show performance alert based on calculated result
    const alertIndicators: IndicatorForAlert[] = indicatorRatings.map(
      (ind) => ({
        label: ind.indicatorName,
        score: ind.starRating,
        providerValue: ind.rate,
        benchmark: ind.benchmark,
        isLowerBetter: [
          "Falls with Harm Rate",
          "Medication-Related Harm",
          "High-Risk Medication Prevalence",
          "Polypharmacy ≥10 Medications",
          "Pressure Injuries Stage 2–4",
          "ED Presentations (30-day)",
        ].includes(ind.indicatorName),
      }),
    );
    const providerLabel =
      UNIFIED_PROVIDERS.find((p) => p.id === providerId)?.name ?? providerId;
    const alert = resolveAlertToShow(
      providerLabel,
      weighted.score,
      alertIndicators,
    );
    if (alert) {
      setCurrentAlert(alert);
      setAlertOpen(true);
    }
  }

  const domainOrder = [
    { key: "safety", label: "Safety", weight: "30%" },
    { key: "preventive", label: "Preventive Care", weight: "20%" },
    { key: "quality", label: "Quality Measures", weight: "20%" },
    { key: "staffing", label: "Staffing", weight: "15%" },
    { key: "compliance", label: "Compliance", weight: "10%" },
    { key: "experience", label: "Resident Experience", weight: "5%" },
  ];

  return (
    <div className="p-6 space-y-5">
      {/* Page header */}
      <div className="border-b pb-4">
        <div className="flex items-center gap-2.5">
          <Calculator
            className="w-5 h-5"
            style={{ color: "oklch(var(--gov-navy))" }}
          />
          <h1 className="text-xl font-bold text-gov-navy">Rating Engine</h1>
        </div>
        <p className="text-sm text-muted-foreground mt-0.5">
          Automated indicator-to-rating calculation engine — N-ACRM
        </p>
      </div>

      {/* Rating Calculation Rules Panel */}
      <Card className="rounded-none border">
        <CardHeader className="pb-2 pt-4 px-4 border-b">
          <CardTitle className="text-sm font-semibold text-gov-navy flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Rating Calculation Rules
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Published rules governing all rating computations in the N-ACRM
            system
          </p>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Quintile mapping */}
            <div>
              <div
                className="text-xs font-bold uppercase tracking-wide mb-2"
                style={{ color: "oklch(var(--gov-navy))" }}
              >
                Quintile → Star Rating
              </div>
              <table className="w-full text-xs">
                <tbody>
                  {[
                    { q: "Q1", stars: 5 },
                    { q: "Q2", stars: 4 },
                    { q: "Q3", stars: 3 },
                    { q: "Q4", stars: 2 },
                    { q: "Q5", stars: 1 },
                  ].map(({ q, stars }) => (
                    <tr key={q} className="border-b last:border-0">
                      <td
                        className="py-1 font-bold"
                        style={{
                          color: "oklch(0.30 0.06 254)",
                        }}
                      >
                        {q}
                      </td>
                      <td className="py-1">
                        <StarRating value={stars} size="sm" showLabel={false} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Trend adjustments */}
            <div>
              <div
                className="text-xs font-bold uppercase tracking-wide mb-2"
                style={{ color: "oklch(var(--gov-navy))" }}
              >
                Trend Adjustment
              </div>
              <table className="w-full text-xs">
                <tbody>
                  {[
                    {
                      trend: "Improving",
                      adj: "+0.2",
                      color: "oklch(0.45 0.15 145)",
                    },
                    {
                      trend: "Stable",
                      adj: "0.0",
                      color: "oklch(0.55 0.02 240)",
                    },
                    {
                      trend: "Declining",
                      adj: "−0.2",
                      color: "oklch(0.52 0.22 25)",
                    },
                  ].map(({ trend, adj, color }) => (
                    <tr key={trend} className="border-b last:border-0">
                      <td className="py-1 text-muted-foreground">{trend}</td>
                      <td
                        className="py-1 font-bold text-right"
                        style={{ color }}
                      >
                        {adj}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-muted-foreground mt-2">
                Clamped to [1.0 – 5.0]
              </p>
            </div>

            {/* Domain weights */}
            <div>
              <div
                className="text-xs font-bold uppercase tracking-wide mb-2"
                style={{ color: "oklch(var(--gov-navy))" }}
              >
                Domain Weights
              </div>
              <table className="w-full text-xs">
                <tbody>
                  {domainOrder.map(({ label, weight }) => (
                    <tr key={label} className="border-b last:border-0">
                      <td className="py-1 text-muted-foreground">{label}</td>
                      <td
                        className="py-1 font-bold text-right"
                        style={{ color: "oklch(var(--gov-gold-dark))" }}
                      >
                        {weight}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Star bands */}
            <div>
              <div
                className="text-xs font-bold uppercase tracking-wide mb-2"
                style={{ color: "oklch(var(--gov-navy))" }}
              >
                Star Band Thresholds
              </div>
              <table className="w-full text-xs">
                <tbody>
                  {[
                    { range: "4.5 – 5.0", stars: 5 },
                    { range: "3.5 – 4.49", stars: 4 },
                    { range: "2.5 – 3.49", stars: 3 },
                    { range: "1.5 – 2.49", stars: 2 },
                    { range: "0 – 1.49", stars: 1 },
                  ].map(({ range, stars }) => (
                    <tr key={range} className="border-b last:border-0">
                      <td
                        className="py-1 font-mono text-xs"
                        style={{ color: "oklch(0.40 0.04 254)" }}
                      >
                        {range}
                      </td>
                      <td className="py-1 text-right">
                        <StarRating value={stars} size="sm" showLabel={false} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Indicator Submission Form */}
      <Card className="rounded-none border">
        <CardHeader className="pb-2 pt-4 px-4 border-b">
          <CardTitle className="text-sm font-semibold text-gov-navy">
            Live Indicator Submission
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Submit indicator data and watch the Rating Engine calculate results
            in real-time
          </p>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          {/* Form header fields */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-gov-navy">
                Select Provider
              </Label>
              <Select
                value={selectedProviderId}
                onValueChange={handleProviderSelect}
              >
                <SelectTrigger
                  className="h-8 text-xs rounded-none"
                  data-ocid="rating_engine.provider_select.select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {UNIFIED_PROVIDERS.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} ({p.city})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label
                htmlFor="re-provider-id"
                className="text-xs font-semibold text-gov-navy"
              >
                Provider ID
              </Label>
              <Input
                id="re-provider-id"
                value={providerId}
                onChange={(e) => setProviderId(e.target.value)}
                className="h-8 text-xs rounded-none font-mono"
                placeholder="PROV-001"
                data-ocid="rating_engine.provider_id.input"
              />
            </div>
            <div className="space-y-1">
              <Label
                htmlFor="re-quarter"
                className="text-xs font-semibold text-gov-navy"
              >
                Quarter
              </Label>
              <Select value={quarter} onValueChange={setQuarter}>
                <SelectTrigger
                  id="re-quarter"
                  className="h-8 text-xs rounded-none"
                  data-ocid="rating_engine.quarter.select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Q1-2025">Q1-2025</SelectItem>
                  <SelectItem value="Q2-2025">Q2-2025</SelectItem>
                  <SelectItem value="Q3-2025">Q3-2025</SelectItem>
                  <SelectItem value="Q4-2025">Q4-2025</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label
                htmlFor="re-screening"
                className="text-xs font-semibold text-gov-navy"
              >
                Screening Bundle Completion %
              </Label>
              <Input
                id="re-screening"
                type="number"
                min={0}
                max={100}
                value={screeningCompletion}
                onChange={(e) => setScreeningCompletion(Number(e.target.value))}
                className="h-8 text-xs rounded-none"
                data-ocid="rating_engine.screening_completion.input"
              />
            </div>
            <div className="space-y-1">
              <Label
                htmlFor="re-prev-safety"
                className="text-xs font-semibold text-gov-navy"
              >
                Previous Safety Score
              </Label>
              <Input
                id="re-prev-safety"
                type="number"
                step={0.1}
                min={1}
                max={5}
                value={previousSafetyScore}
                onChange={(e) => setPreviousSafetyScore(Number(e.target.value))}
                className="h-8 text-xs rounded-none"
              />
            </div>
          </div>

          {/* Indicator table */}
          <div className="overflow-x-auto">
            <table className="w-full gov-table">
              <thead>
                <tr>
                  <th className="text-left" style={{ minWidth: "80px" }}>
                    Code
                  </th>
                  <th className="text-left" style={{ minWidth: "200px" }}>
                    Indicator
                  </th>
                  <th className="text-left">Domain</th>
                  <th className="text-right">Rate</th>
                  <th className="text-right">Benchmark</th>
                  <th className="text-left" style={{ minWidth: "100px" }}>
                    Quintile
                  </th>
                  <th className="text-left" style={{ minWidth: "130px" }}>
                    Trend
                  </th>
                </tr>
              </thead>
              <tbody>
                {indicators.map((ind, idx) => (
                  <tr key={ind.code}>
                    <td className="font-mono text-xs text-muted-foreground">
                      {ind.code}
                    </td>
                    <td className="font-medium">{ind.name}</td>
                    <td>
                      <span
                        className="text-xs px-1.5 py-0.5"
                        style={{
                          background: "oklch(0.94 0.012 240)",
                          color: "oklch(var(--gov-navy))",
                        }}
                      >
                        {ind.domain}
                      </span>
                    </td>
                    <td className="text-right">{ind.rate}</td>
                    <td className="text-right text-muted-foreground">
                      {ind.benchmark}
                    </td>
                    <td>
                      <Select
                        value={String(ind.quintile)}
                        onValueChange={(v) => handleQuintileChange(idx, v)}
                      >
                        <SelectTrigger
                          className="h-7 text-xs rounded-none w-24"
                          data-ocid={`rating_engine.indicator.quintile.select.${idx + 1}`}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5].map((q) => (
                            <SelectItem key={q} value={String(q)}>
                              Q{q}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td>
                      <Select
                        value={ind.trend}
                        onValueChange={(v) =>
                          handleTrendChange(
                            idx,
                            v as "improving" | "stable" | "declining",
                          )
                        }
                      >
                        <SelectTrigger
                          className="h-7 text-xs rounded-none w-32"
                          data-ocid={`rating_engine.indicator.trend.select.${idx + 1}`}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="improving">↑ Improving</SelectItem>
                          <SelectItem value="stable">→ Stable</SelectItem>
                          <SelectItem value="declining">↓ Declining</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleCalculate}
              disabled={isCalculating}
              className="rounded-none text-xs font-semibold h-9 px-6"
              style={{
                background: "oklch(var(--gov-navy))",
                color: "white",
              }}
              data-ocid="rating_engine.submit.button"
            >
              {isCalculating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Calculating...
                </>
              ) : (
                <>
                  <Calculator className="w-4 h-4 mr-2" />
                  Calculate Ratings
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Placeholder before first calculation */}
      {!hasCalculated && (
        <div
          className="border p-8 text-center text-muted-foreground text-sm"
          style={{ background: "oklch(0.98 0.005 254)" }}
        >
          Select a provider and click &ldquo;Calculate Ratings&rdquo; to see the
          full rating cascade.
        </div>
      )}

      {/* Rating Engine Output */}
      {hasCalculated && result && (
        <div className="space-y-4" data-ocid="rating_engine.output.panel">
          {/* Indicator Ratings Table */}
          <Card className="rounded-none border">
            <CardHeader className="pb-2 pt-4 px-4 border-b">
              <CardTitle className="text-sm font-semibold text-gov-navy">
                Indicator Ratings
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full gov-table">
                  <thead>
                    <tr>
                      <th className="text-left">Code</th>
                      <th className="text-left">Indicator</th>
                      <th className="text-left">Domain</th>
                      <th className="text-right">Rate</th>
                      <th className="text-right">Benchmark</th>
                      <th className="text-left">vs Benchmark</th>
                      <th className="text-left">Quintile</th>
                      <th className="text-left">Trend</th>
                      <th className="text-right">Adj.</th>
                      <th className="text-left">Star Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.indicatorRatings.map((ind) => (
                      <tr key={ind.indicatorCode}>
                        <td className="font-mono text-xs text-muted-foreground">
                          {ind.indicatorCode}
                        </td>
                        <td className="font-medium">{ind.indicatorName}</td>
                        <td>
                          <span
                            className="text-xs px-1.5 py-0.5"
                            style={{
                              background: "oklch(0.94 0.012 240)",
                              color: "oklch(var(--gov-navy))",
                            }}
                          >
                            {ind.domain}
                          </span>
                        </td>
                        <td className="text-right">{ind.rate.toFixed(1)}</td>
                        <td className="text-right text-muted-foreground">
                          {ind.benchmark.toFixed(1)}
                        </td>
                        <td>
                          <BenchmarkStatusChip
                            rate={ind.rate}
                            benchmark={ind.benchmark}
                            isLowerBetter={ind.isLowerBetter}
                            size="xs"
                          />
                        </td>
                        <td>
                          <span
                            className="px-1.5 py-0.5 text-xs font-bold"
                            style={{
                              background:
                                Number(ind.quintile) <= 2
                                  ? "oklch(0.93 0.07 145)"
                                  : Number(ind.quintile) === 3
                                    ? "oklch(0.96 0.05 80)"
                                    : "oklch(0.95 0.06 25)",
                              color:
                                Number(ind.quintile) <= 2
                                  ? "oklch(0.28 0.14 145)"
                                  : Number(ind.quintile) === 3
                                    ? "oklch(0.43 0.14 72)"
                                    : "oklch(0.42 0.20 25)",
                            }}
                          >
                            Q{Number(ind.quintile)}
                          </span>
                        </td>
                        <td>
                          {getTrendIcon(ind.trend)}
                          <span className="text-xs capitalize">
                            {ind.trend}
                          </span>
                        </td>
                        <td className="text-right font-mono text-xs">
                          {getTrendAdjLabel(ind.trendAdjustment)}
                        </td>
                        <td>
                          <StarRating
                            value={ind.starRating}
                            size="sm"
                            showLabel={false}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Domain Scores + Overall Rating */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Domain scores */}
            <div className="lg:col-span-2">
              <Card className="rounded-none border h-full">
                <CardHeader className="pb-2 pt-4 px-4 border-b">
                  <CardTitle className="text-sm font-semibold text-gov-navy">
                    Domain Scores
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {domainOrder.map(({ key, label, weight }) => {
                      const score =
                        result.domainScores[
                          key as keyof typeof result.domainScores
                        ];
                      const color = getDomainColor(score);
                      return (
                        <div
                          key={key}
                          className="border p-3"
                          style={{
                            background: "oklch(0.98 0.005 254)",
                          }}
                        >
                          <div className="flex items-start justify-between gap-1 mb-1.5">
                            <div className="text-xs font-semibold text-gov-navy leading-tight">
                              {label}
                            </div>
                            <Badge
                              className="text-xs rounded-sm px-1.5 py-0.5 font-bold shrink-0"
                              style={{
                                background: "oklch(0.92 0.04 254)",
                                color: "oklch(0.35 0.08 254)",
                                border: "none",
                              }}
                            >
                              {weight}
                            </Badge>
                          </div>
                          <div className="text-2xl font-bold" style={{ color }}>
                            {score.toFixed(2)}
                          </div>
                          <div className="mt-1.5">
                            <StarRating
                              value={score}
                              size="sm"
                              showLabel={false}
                            />
                          </div>
                          <div className="mt-1.5">
                            <Progress
                              value={(score / 5) * 100}
                              className="h-1.5 rounded-none"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Overall Rating + P4I */}
            <div className="space-y-3">
              {/* Overall Rating */}
              <Card className="rounded-none border">
                <CardHeader className="pb-2 pt-4 px-4 border-b">
                  <CardTitle className="text-sm font-semibold text-gov-navy">
                    Overall Provider Rating
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 text-center">
                  <div
                    className="text-5xl font-bold mb-1"
                    style={{ color: "oklch(var(--gov-navy))" }}
                  >
                    {result.overallScore.toFixed(2)}
                  </div>
                  <div className="flex justify-center mb-2">
                    <StarRating
                      value={Number(result.overallStars)}
                      size="lg"
                      showLabel={true}
                    />
                  </div>
                  <p
                    className="text-xs text-center mt-2"
                    style={{ color: "oklch(0.45 0.04 254)" }}
                  >
                    Weighted composite score of all 6 domains
                  </p>
                  {result.previousOverallStars !== result.overallStars && (
                    <div
                      className="mt-2 text-xs font-semibold"
                      style={{ color: "oklch(0.45 0.15 145)" }}
                    >
                      ▲ Improved from {Number(result.previousOverallStars)}{" "}
                      stars
                    </div>
                  )}
                  <p
                    className="text-xs mt-3 leading-relaxed"
                    style={{ color: "oklch(0.55 0.02 240)" }}
                  >
                    {result.auditNotes}
                  </p>
                </CardContent>
              </Card>

              {/* Pay-for-Improvement */}
              <Card className="rounded-none border">
                <CardHeader className="pb-2 pt-4 px-4 border-b">
                  <CardTitle className="text-sm font-semibold text-gov-navy">
                    Pay-for-Improvement Eligibility
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-2.5">
                  {(() => {
                    const style = getTierBadgeStyle(
                      result.incentiveEligibility.tier,
                    );
                    return (
                      <div className="space-y-2">
                        <div
                          className="border px-3 py-2 flex items-center justify-between"
                          style={{
                            background: style.bg,
                            borderColor: style.border,
                          }}
                        >
                          <span
                            className="text-sm font-bold"
                            style={{ color: style.color }}
                          >
                            {result.incentiveEligibility.tier}
                          </span>
                          {result.incentiveEligibility.eligible ? (
                            <CheckCircle2
                              className="w-4 h-4"
                              style={{ color: style.color }}
                            />
                          ) : (
                            <AlertTriangle
                              className="w-4 h-4"
                              style={{ color: style.color }}
                            />
                          )}
                        </div>
                        <div className="flex justify-center">
                          <IncentiveEligibilityBadge
                            eligible={result.incentiveEligibility.eligible}
                            size="md"
                          />
                        </div>
                      </div>
                    );
                  })()}
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Improvement Score
                      </span>
                      <span className="font-semibold">
                        {result.incentiveEligibility.improvementScore.toFixed(
                          1,
                        )}
                        %
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Screening Completion
                      </span>
                      <span className="font-semibold">
                        {result.incentiveEligibility.screeningCompletion.toFixed(
                          0,
                        )}
                        %
                      </span>
                    </div>
                    <div className="flex justify-between border-t pt-1.5">
                      <span className="font-semibold text-gov-navy">
                        Est. Payment
                      </span>
                      <span
                        className="font-bold text-sm"
                        style={{ color: "oklch(var(--gov-gold-dark))" }}
                      >
                        $
                        {result.incentiveEligibility.estimatedPayment.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Calculated At */}
          <div
            className="text-xs text-right"
            style={{ color: "oklch(0.55 0.02 240)" }}
          >
            Calculated at:{" "}
            {new Date(Number(result.calculatedAt) / 1_000_000).toLocaleString(
              "en-AU",
              {
                timeZone: "Australia/Sydney",
              },
            )}{" "}
            AEST · Provider: {result.providerId} · Quarter: {result.quarter}
          </div>
        </div>
      )}

      {/* Performance Alert Modal */}
      <PerformanceAlertModal
        open={alertOpen}
        onClose={() => setAlertOpen(false)}
        alert={currentAlert}
      />

      {/* Audit Log */}
      <Card className="rounded-none border">
        <CardHeader className="pb-2 pt-4 px-4 border-b">
          <CardTitle className="text-sm font-semibold text-gov-navy">
            Rating Engine Audit Log
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Every recalculation is permanently audit-logged for regulatory
            compliance and dispute resolution
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table
              className="w-full gov-table"
              data-ocid="rating_engine.audit_log.table"
            >
              <thead>
                <tr>
                  <th className="text-left">Timestamp</th>
                  <th className="text-left">Provider ID</th>
                  <th className="text-left">Quarter</th>
                  <th className="text-right">Prev. Stars</th>
                  <th className="text-right">New Stars</th>
                  <th className="text-left">Incentive Tier</th>
                  <th className="text-left">Trigger</th>
                </tr>
              </thead>
              <tbody>
                {AUDIT_LOG_ENTRIES.map((entry) => {
                  const tierStyle = getTierBadgeStyle(entry.tier);
                  const starChanged = entry.newStars !== entry.prevStars;
                  return (
                    <tr key={entry.timestamp}>
                      <td className="font-mono text-xs text-muted-foreground">
                        {entry.timestamp}
                      </td>
                      <td className="font-mono text-xs font-semibold">
                        {entry.providerId}
                      </td>
                      <td>{entry.quarter}</td>
                      <td className="text-right">
                        <StarRating
                          value={entry.prevStars}
                          size="sm"
                          showLabel={false}
                        />
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <StarRating
                            value={entry.newStars}
                            size="sm"
                            showLabel={false}
                          />
                          {starChanged && entry.newStars > entry.prevStars && (
                            <TrendingUp
                              className="w-3 h-3"
                              style={{ color: "oklch(0.45 0.15 145)" }}
                            />
                          )}
                          {starChanged && entry.newStars < entry.prevStars && (
                            <TrendingDown
                              className="w-3 h-3"
                              style={{ color: "oklch(0.52 0.22 25)" }}
                            />
                          )}
                        </div>
                      </td>
                      <td>
                        <span
                          className="text-xs px-1.5 py-0.5 font-semibold border"
                          style={{
                            background: tierStyle.bg,
                            color: tierStyle.color,
                            borderColor: tierStyle.border,
                          }}
                        >
                          {entry.tier}
                        </span>
                      </td>
                      <td className="text-xs text-muted-foreground">
                        {entry.trigger}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
