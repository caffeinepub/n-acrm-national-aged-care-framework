import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CITY_PROVIDERS,
  type CityProvider,
  getProviderRatingForQuarter,
} from "@/data/mockData";

import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Building2,
  CheckCircle,
  ClipboardCheck,
  MapPin,
  Shield,
  ShieldCheck,
  SortAsc,
  Star,
  TrendingDown,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Unified indicator status — uses 1–5 star scale thresholds */
function getIndicatorStatus(score: number): {
  label: string;
  chipClass: string;
} {
  if (score >= 3.5)
    return {
      label: "Good",
      chipClass: "bg-green-100 text-green-700 border border-green-200",
    };
  if (score >= 2.5)
    return {
      label: "Moderate",
      chipClass: "bg-amber-100 text-amber-700 border border-amber-200",
    };
  return {
    label: "Needs Attention",
    chipClass: "bg-red-100 text-red-700 border border-red-200",
  };
}

/** Risk level derived from indicator performance, not just stars */
function getRiskLevelFromIndicators(
  indicators: CityProvider["indicators"],
): "Low" | "Medium" | "High" {
  const scores = [
    indicators.safetyClinical,
    indicators.preventiveCare,
    indicators.qualityMeasures,
    indicators.staffing,
    indicators.compliance,
    indicators.experience,
  ];
  const poorCount = scores.filter((s) => s < 2.5).length;
  const moderateCount = scores.filter((s) => s >= 2.5 && s < 3.5).length;
  if (poorCount >= 2) return "High";
  if (poorCount === 1 || moderateCount >= 3) return "Medium";
  return "Low";
}

/** Data-driven explanation — no hardcoded "Excellent performance" strings */
function generateDynamicExplanation(
  stars: number,
  indicators: CityProvider["indicators"],
): string {
  const domainNames: Record<string, string> = {
    safetyClinical: "falls safety",
    preventiveCare: "preventive screening",
    qualityMeasures: "care quality",
    staffing: "staffing",
    compliance: "standards compliance",
    experience: "resident satisfaction",
  };

  const entries = {
    safetyClinical: indicators.safetyClinical,
    preventiveCare: indicators.preventiveCare,
    qualityMeasures: indicators.qualityMeasures,
    staffing: indicators.staffing,
    compliance: indicators.compliance,
    experience: indicators.experience,
  };

  const weak = Object.entries(entries)
    .filter(([, v]) => v < 2.5)
    .map(([k]) => domainNames[k]);

  const moderate = Object.entries(entries)
    .filter(([, v]) => v >= 2.5 && v < 3.5)
    .map(([k]) => domainNames[k]);

  const strong = Object.entries(entries)
    .filter(([, v]) => v >= 4.0)
    .map(([k]) => domainNames[k]);

  if (weak.length >= 3) {
    return `Low performance in ${weak.slice(0, 2).join(" and ")} is significantly affecting the overall rating. Active improvement plans are underway.`;
  }
  if (weak.length === 2) {
    return `Performance issues in ${weak.join(" and ")} are reducing the overall rating. These areas require focused attention.`;
  }
  if (weak.length === 1 && moderate.length >= 2) {
    return `Provider shows concern in ${weak[0]} and needs improvement in ${moderate.slice(0, 2).join(" and ")}. Overall care quality is below average.`;
  }
  if (weak.length === 1) {
    const strengthText =
      strong.length > 0 ? ` Strong performance in ${strong[0]}.` : "";
    return `Provider performs adequately in most areas but needs improvement in ${weak[0]}.${strengthText}`;
  }
  if (moderate.length >= 3) {
    return `Provider performs well overall but needs improvement in ${moderate
      .slice(0, 2)
      .join(" and ")} to reach higher standards.`;
  }
  if (moderate.length >= 1) {
    const strengthText =
      strong.length > 0
        ? `Strong performance in ${strong.slice(0, 2).join(" and ")}.`
        : "Most indicators are good.";
    return `${strengthText} Some improvement needed in ${moderate[0]}.`;
  }
  if (stars >= 4.5) {
    return "This provider consistently delivers high-quality care across all measured areas, with strong safety outcomes and resident satisfaction.";
  }
  return "This provider delivers good quality care with solid performance across most measured areas.";
}

function getScorePct(p: CityProvider): number {
  return Math.round(p.indicators.preventiveCare * 20); // 1–5 → 0–100
}

function getSatisfactionPct(p: CityProvider): number {
  return Math.round(p.indicators.experience * 20); // 1–5 → 0–100
}

function getPctColor(pct: number): string {
  if (pct >= 70) return "bg-green-500";
  if (pct >= 50) return "bg-amber-500";
  return "bg-red-500";
}

function RiskBadge({ level }: { level: "Low" | "Medium" | "High" }) {
  const styles = {
    Low: "bg-green-100 text-green-700 border-green-200",
    Medium: "bg-amber-100 text-amber-700 border-amber-200",
    High: "bg-red-100 text-red-700 border-red-200",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${styles[level]}`}
    >
      {level === "Low" ? (
        <CheckCircle className="h-3 w-3" />
      ) : (
        <AlertTriangle className="h-3 w-3" />
      )}
      {level} Risk
    </span>
  );
}

function IndicatorBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-500">{label}</span>
        <span className="font-medium text-gray-700">{value}%</span>
      </div>
      <Progress value={value} className={`h-1.5 [&>div]:${color}`} />
    </div>
  );
}

function StarRating({
  stars,
  size = "sm",
}: { stars: number; size?: "sm" | "lg" }) {
  const iconClass = size === "lg" ? "h-6 w-6" : "h-4 w-4";
  const textClass =
    size === "lg"
      ? "text-lg font-bold text-gray-800"
      : "text-sm font-semibold text-gray-700";
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`${iconClass} ${
            i <= Math.floor(stars)
              ? "fill-amber-400 text-amber-400"
              : i - 0.5 <= stars
                ? "fill-amber-200 text-amber-400"
                : "fill-gray-100 text-gray-300"
          }`}
        />
      ))}
      <span className={`ml-1 ${textClass}`}>{stars.toFixed(1)}</span>
    </div>
  );
}

function getPerformanceLabel(stars: number): { label: string; color: string } {
  if (stars >= 4.5)
    return { label: "Excellent Performance", color: "text-green-700" };
  if (stars >= 4) return { label: "Good Performance", color: "text-green-600" };
  if (stars >= 3)
    return { label: "Satisfactory Performance", color: "text-amber-600" };
  return { label: "Needs Improvement", color: "text-red-600" };
}

// ── Domain score helpers ──────────────────────────────────────────────────────

const DOMAIN_FRIENDLY_NAMES: Record<string, string> = {
  safetyClinical: "Falls & Safety",
  preventiveCare: "Preventive Screening",
  qualityMeasures: "Care Quality",
  staffing: "Staffing & Support",
  compliance: "Standards Compliance",
  experience: "Resident Satisfaction",
};

function getDomainRawScores(p: CityProvider): Record<string, number> {
  return {
    safetyClinical: p.indicators.safetyClinical,
    preventiveCare: p.indicators.preventiveCare,
    qualityMeasures: p.indicators.qualityMeasures,
    staffing: p.indicators.staffing,
    compliance: p.indicators.compliance,
    experience: p.indicators.experience,
  };
}

// Per-indicator one-line descriptions (using 1–5 scale thresholds)
function getIndicatorDescription(domain: string, score: number): string {
  if (domain === "safetyClinical") {
    if (score >= 3.5) return "Falls rate is better than the national average";
    if (score >= 2.5) return "Falls rate is near the national average";
    return "Falls rate is worse than the national average";
  }
  if (domain === "preventiveCare") {
    if (score >= 3.5) return "Screening completion is above target";
    if (score >= 2.5) return "Screening completion is near target";
    return "Screening completion is below target";
  }
  if (domain === "qualityMeasures") {
    if (score >= 3.5) return "Care quality measures meet or exceed standards";
    if (score >= 2.5) return "Care quality is at an acceptable level";
    return "Care quality measures need improvement";
  }
  if (domain === "staffing") {
    if (score >= 3.5)
      return "Staffing levels and nurse hours exceed requirements";
    if (score >= 2.5) return "Staffing meets minimum requirements";
    return "Staffing levels are below recommended standards";
  }
  if (domain === "compliance") {
    if (score >= 3.5) return "Fully compliant with aged care quality standards";
    if (score >= 2.5) return "Meets most regulatory compliance standards";
    return "Has outstanding compliance issues";
  }
  if (domain === "experience") {
    if (score >= 3.5) return "Residents report high satisfaction with care";
    if (score >= 2.5) return "Resident satisfaction is mixed";
    return "Resident satisfaction scores are below average";
  }
  return "";
}

const DOMAIN_ICONS: Record<string, React.ReactNode> = {
  safetyClinical: <ShieldCheck className="h-4 w-4 text-[#1E3A8A]" />,
  preventiveCare: <CheckCircle className="h-4 w-4 text-[#1E3A8A]" />,
  qualityMeasures: <Activity className="h-4 w-4 text-[#1E3A8A]" />,
  staffing: <Users className="h-4 w-4 text-[#1E3A8A]" />,
  compliance: <ClipboardCheck className="h-4 w-4 text-[#1E3A8A]" />,
  experience: <Star className="h-4 w-4 text-[#1E3A8A]" />,
};

const DOMAIN_ORDER = [
  "safetyClinical",
  "preventiveCare",
  "qualityMeasures",
  "staffing",
  "compliance",
  "experience",
];

// ── Public Provider Modal ─────────────────────────────────────────────────────

function PublicProviderModal({
  provider,
  onClose,
  currentQuarter = "Q4-2025",
}: {
  provider: CityProvider | null;
  onClose: () => void;
  currentQuarter?: string;
}) {
  if (!provider) return null;

  const stars = getProviderRatingForQuarter(provider.id, currentQuarter).stars;
  const risk = getRiskLevelFromIndicators(provider.indicators);
  const perf = getPerformanceLabel(stars);
  const explanation = generateDynamicExplanation(stars, provider.indicators);
  const rawScores = getDomainRawScores(provider);

  // Strengths: score >= 4.0
  const strengths = Object.entries(rawScores).filter(([, v]) => v >= 4.0);
  // Areas for improvement: score < 3.0
  const improvements = Object.entries(rawScores).filter(([, v]) => v < 3.0);

  return (
    <Dialog open={!!provider} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="max-w-lg p-0 overflow-hidden"
        data-ocid="public.dialog"
      >
        {/* Navy header strip */}
        <div className="bg-[#1E3A8A] px-6 py-5 text-white">
          <div className="flex items-start justify-between gap-3">
            <DialogHeader className="flex-1 min-w-0">
              <DialogTitle className="text-xl font-bold text-white leading-tight">
                {provider.name}
              </DialogTitle>
              <p className="flex items-center gap-1.5 text-blue-200 text-sm mt-1">
                <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                {provider.city}, Australia
              </p>
            </DialogHeader>
            <button
              type="button"
              onClick={onClose}
              data-ocid="public.close_button"
              className="rounded-full p-1.5 text-blue-200 hover:bg-white/10 hover:text-white transition-colors flex-shrink-0 mt-0.5"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Rating row */}
          <div className="mt-4 flex items-center gap-4 flex-wrap">
            <div>
              <StarRating stars={stars} size="lg" />
              <p className="text-sm font-semibold mt-0.5 text-blue-100">
                {stars.toFixed(1)} / 5 &mdash; {perf.label}
              </p>
            </div>
            <div className="ml-auto">
              <RiskBadge level={risk} />
            </div>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto max-h-[65vh] px-6 py-5 space-y-5">
          {/* Plain-language explanation */}
          <div className="rounded-lg bg-blue-50 border border-blue-100 p-4">
            <p className="text-sm font-semibold text-[#1E3A8A] mb-1">
              What this means for you
            </p>
            <p className="text-sm text-gray-700 leading-relaxed">
              {explanation}
            </p>
          </div>

          {/* All 6 Performance Areas */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
              Key Performance Areas
            </p>
            <div className="space-y-3">
              {DOMAIN_ORDER.map((domain) => {
                const score = rawScores[domain];
                const status = getIndicatorStatus(score);
                const description = getIndicatorDescription(domain, score);
                return (
                  <div
                    key={domain}
                    className="flex items-start gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3"
                  >
                    <div className="rounded-full bg-blue-100 p-1.5 flex-shrink-0">
                      {DOMAIN_ICONS[domain]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-sm font-medium text-gray-800">
                          {DOMAIN_FRIENDLY_NAMES[domain]}
                        </span>
                        <span
                          className={`text-xs font-medium rounded-full px-2 py-0.5 ${status.chipClass}`}
                        >
                          {status.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Strengths */}
          <div className="rounded-lg bg-green-50 border border-green-100 p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <p className="text-sm font-semibold text-green-800">Strengths</p>
            </div>
            {strengths.length > 0 ? (
              <ul className="space-y-1">
                {strengths.map(([key]) => (
                  <li
                    key={key}
                    className="flex items-center gap-2 text-sm text-green-700"
                  >
                    <CheckCircle className="h-3.5 w-3.5 flex-shrink-0" />
                    {DOMAIN_FRIENDLY_NAMES[key] ?? key}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-green-700">
                Performing at benchmark levels across all areas.
              </p>
            )}
          </div>

          {/* Areas for Improvement */}
          <div className="rounded-lg bg-amber-50 border border-amber-100 p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="h-4 w-4 text-amber-600" />
              <p className="text-sm font-semibold text-amber-800">
                Areas Being Improved
              </p>
            </div>
            {improvements.length > 0 ? (
              <ul className="space-y-1">
                {improvements.map(([key]) => (
                  <li
                    key={key}
                    className="flex items-center gap-2 text-sm text-amber-700"
                  >
                    <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
                    Working to improve {DOMAIN_FRIENDLY_NAMES[key] ?? key}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-amber-700">
                No major concerns identified.
              </p>
            )}
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-gray-400 text-center pb-1">
            Ratings are based on national quality standards and updated
            quarterly.
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
          <Button
            onClick={onClose}
            data-ocid="public.cancel_button"
            className="w-full bg-[#1E3A8A] hover:bg-[#1e40af] text-white"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Provider Card ─────────────────────────────────────────────────────────────

function ProviderCard({
  provider,
  onSelect,
  currentQuarter = "Q4-2025",
}: {
  provider: CityProvider;
  onSelect: (p: CityProvider) => void;
  currentQuarter?: string;
}) {
  const stars = getProviderRatingForQuarter(provider.id, currentQuarter).stars;
  const risk = getRiskLevelFromIndicators(provider.indicators);
  const fallsStatus = getIndicatorStatus(provider.indicators.safetyClinical);
  const screeningPct = getScorePct(provider);
  const satisfactionPct = getSatisfactionPct(provider);

  const accentColor =
    stars >= 4 ? "bg-green-500" : stars >= 3 ? "bg-amber-500" : "bg-red-500";

  return (
    <Card
      className="overflow-hidden border border-gray-200 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer group"
      onClick={() => onSelect(provider)}
      data-ocid="public.card"
    >
      <div className={`h-1 w-full ${accentColor}`} />
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="space-y-1">
          <h3 className="font-semibold text-gray-900 leading-tight group-hover:text-[#1E3A8A] transition-colors">
            {provider.name}
          </h3>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <MapPin className="h-3 w-3" />
              {provider.city}
            </span>
            <Badge variant="outline" className="text-xs px-1.5 py-0">
              {provider.type}
            </Badge>
          </div>
        </div>

        {/* Rating & Risk */}
        <div className="flex items-center justify-between">
          <StarRating stars={stars} />
          <RiskBadge level={risk} />
        </div>

        {/* Indicators */}
        <div className="space-y-2 pt-1 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Falls Safety</span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${fallsStatus.chipClass}`}
            >
              {fallsStatus.label}
            </span>
          </div>
          <IndicatorBar
            label="Screening Completion"
            value={screeningPct}
            color={getPctColor(screeningPct)}
          />
          <IndicatorBar
            label="Satisfaction Score"
            value={satisfactionPct}
            color={getPctColor(satisfactionPct)}
          />
        </div>

        {/* View Details link */}
        <div className="pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(provider);
            }}
            data-ocid="public.primary_button"
            className="flex items-center gap-1.5 text-sm font-medium text-[#1E3A8A] hover:text-blue-700 transition-colors w-full justify-center py-1 rounded-md hover:bg-blue-50"
          >
            View Details
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

interface PublicViewProps {
  currentQuarter?: string;
}

export default function PublicView({
  currentQuarter = "Q4-2025",
}: PublicViewProps) {
  const cities = Object.keys(CITY_PROVIDERS);
  const [selectedCity, setSelectedCity] = useState("Sydney");
  const [sortBy, setSortBy] = useState<"rating" | "name">("rating");

  const [selectedProvider, setSelectedProvider] = useState<CityProvider | null>(
    null,
  );

  const providers = useMemo(() => {
    const list = CITY_PROVIDERS[selectedCity] ?? [];
    return [...list].sort((a, b) => {
      if (sortBy === "rating")
        return (
          getProviderRatingForQuarter(b.id, currentQuarter).stars -
          getProviderRatingForQuarter(a.id, currentQuarter).stars
        );
      return a.name.localeCompare(b.name);
    });
  }, [selectedCity, sortBy, currentQuarter]);

  // KPI calculations
  const kpi = useMemo(() => {
    const stars = providers.map(
      (p) => getProviderRatingForQuarter(p.id, currentQuarter).stars,
    );
    const avgRating =
      stars.length > 0 ? stars.reduce((s, x) => s + x, 0) / stars.length : 0;
    const goodOrAbove = stars.filter((s) => s >= 4).length;
    const higherRisk = providers.filter(
      (p) => getRiskLevelFromIndicators(p.indicators) === "High",
    ).length;
    return {
      total: providers.length,
      avgRating: avgRating.toFixed(1),
      goodOrAbovePct:
        providers.length > 0
          ? Math.round((goodOrAbove / providers.length) * 100)
          : 0,
      higherRisk,
    };
  }, [providers, currentQuarter]);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Gold strip */}
      <div className="h-1 bg-gradient-to-r from-[#D97706] via-[#F59E0B] to-[#D97706]" />

      {/* Hero band */}
      <div className="bg-[#1E3A8A] text-white">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="flex items-center gap-2 mb-3 text-blue-300 text-sm font-medium">
            <Shield className="h-4 w-4" />
            Australian Government · Department of Health and Aged Care
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">
            Aged Care Provider Search
          </h1>
          <p className="text-blue-200 text-base">
            Search and compare aged care providers in your region
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8 space-y-6">
        {/* Filter bar */}
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600">
                  Region
                </span>
                <Select value={selectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger className="w-44" data-ocid="public.select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600">
                  Sort by
                </span>
                <div className="flex rounded-md border border-gray-200 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setSortBy("rating")}
                    data-ocid="public.toggle"
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors ${
                      sortBy === "rating"
                        ? "bg-[#1E3A8A] text-white"
                        : "bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <Star className="h-3.5 w-3.5" />
                    Rating
                  </button>
                  <button
                    type="button"
                    onClick={() => setSortBy("name")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-sm border-l border-gray-200 transition-colors ${
                      sortBy === "name"
                        ? "bg-[#1E3A8A] text-white"
                        : "bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <SortAsc className="h-3.5 w-3.5" />
                    Name
                  </button>
                </div>
              </div>

              <span className="ml-auto text-sm text-gray-500">
                Showing{" "}
                <strong className="text-gray-800">{providers.length}</strong>{" "}
                providers in {selectedCity}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-lg bg-blue-50 p-2.5">
                <Building2 className="h-5 w-5 text-[#1E3A8A]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{kpi.total}</p>
                <p className="text-xs text-gray-500">Providers in Region</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-lg bg-amber-50 p-2.5">
                <Star className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {kpi.avgRating}
                </p>
                <p className="text-xs text-gray-500">Average Rating</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-lg bg-green-50 p-2.5">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {kpi.goodOrAbovePct}%
                </p>
                <p className="text-xs text-gray-500">Good or Above (4★+)</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-lg bg-red-50 p-2.5">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {kpi.higherRisk}
                </p>
                <p className="text-xs text-gray-500">High Risk Providers</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Provider grid */}
        {providers.length > 0 ? (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            data-ocid="public.list"
          >
            {providers.map((p, idx) => (
              <div key={p.id} data-ocid={`public.item.${idx + 1}`}>
                <ProviderCard
                  provider={p}
                  onSelect={setSelectedProvider}
                  currentQuarter={currentQuarter}
                />
              </div>
            ))}
          </div>
        ) : (
          <Card
            className="border border-gray-200 shadow-sm"
            data-ocid="public.empty_state"
          >
            <CardContent className="py-12 text-center space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                <Building2 className="h-7 w-7 text-gray-400" />
              </div>
              <div>
                <p className="font-semibold text-gray-700">
                  No providers found
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  No aged care providers are listed for this region.
                </p>
              </div>
              {/* Rating tier legend */}
              <div className="inline-flex items-center gap-4 rounded-lg border border-gray-200 bg-gray-50 px-5 py-3 text-sm">
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-green-500" />
                  Good (4–5★)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-amber-500" />
                  Moderate (3–4★)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-red-500" />
                  Needs Attention (&lt;3★)
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <footer className="border-t border-gray-200 pt-6 pb-4 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} Australian Government · Department of
          Health and Aged Care. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-600"
          >
            caffeine.ai
          </a>
          .
        </footer>
      </div>

      {/* Provider detail modal */}
      <PublicProviderModal
        provider={selectedProvider}
        onClose={() => setSelectedProvider(null)}
        currentQuarter={currentQuarter}
      />
    </div>
  );
}
