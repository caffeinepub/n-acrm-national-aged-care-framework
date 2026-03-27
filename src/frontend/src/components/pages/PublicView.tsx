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
  Bar,
  BarChart,
  Legend,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Award,
  BarChart2,
  Building2,
  CheckCircle,
  ClipboardCheck,
  Info,
  MapPin,
  Shield,
  ShieldCheck,
  SortAsc,
  Sparkles,
  Star,
  ThumbsUp,
  TrendingDown,
  TrendingUp,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";

// ── Helpers ──────────────────────────────────────────────────────────────────

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

  if (weak.length >= 3)
    return `Low performance in ${weak.slice(0, 2).join(" and ")} is significantly affecting the overall rating. Active improvement plans are underway.`;
  if (weak.length === 2)
    return `Performance issues in ${weak.join(" and ")} are reducing the overall rating. These areas require focused attention.`;
  if (weak.length === 1 && moderate.length >= 2)
    return `Provider shows concern in ${weak[0]} and needs improvement in ${moderate.slice(0, 2).join(" and ")}. Overall care quality is below average.`;
  if (weak.length === 1) {
    const strengthText =
      strong.length > 0 ? ` Strong performance in ${strong[0]}.` : "";
    return `Provider performs adequately in most areas but needs improvement in ${weak[0]}.${strengthText}`;
  }
  if (moderate.length >= 3)
    return `Provider performs well overall but needs improvement in ${moderate.slice(0, 2).join(" and ")} to reach higher standards.`;
  if (moderate.length >= 1) {
    const strengthText =
      strong.length > 0
        ? `Strong performance in ${strong.slice(0, 2).join(" and ")}.`
        : "Most indicators are good.";
    return `${strengthText} Some improvement needed in ${moderate[0]}.`;
  }
  if (stars >= 4.5)
    return "This provider consistently delivers high-quality care across all measured areas, with strong safety outcomes and resident satisfaction.";
  return "This provider delivers good quality care with solid performance across most measured areas.";
}

/** Trust Score badge — single clear label for public users */
function getTrustScore(stars: number): {
  label: string;
  color: string;
  bg: string;
  border: string;
  icon: React.ReactNode;
} {
  if (stars >= 4.0)
    return {
      label: "Trusted",
      color: "text-green-700",
      bg: "bg-green-50",
      border: "border-green-200",
      icon: <ShieldCheck className="h-3.5 w-3.5" />,
    };
  if (stars >= 3.0)
    return {
      label: "Average",
      color: "text-amber-700",
      bg: "bg-amber-50",
      border: "border-amber-200",
      icon: <Info className="h-3.5 w-3.5" />,
    };
  return {
    label: "Needs Improvement",
    color: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-200",
    icon: <AlertTriangle className="h-3.5 w-3.5" />,
  };
}

/** Simple performance tags — plain language chips */
function getPerformanceTags(
  indicators: CityProvider["indicators"],
): { text: string; positive: boolean }[] {
  const tags: { text: string; positive: boolean }[] = [];
  if (indicators.safetyClinical >= 3.5)
    tags.push({ text: "Low falls", positive: true });
  else if (indicators.safetyClinical < 2.5)
    tags.push({ text: "High falls", positive: false });

  if (indicators.experience >= 3.5)
    tags.push({ text: "High satisfaction", positive: true });
  else if (indicators.experience < 2.5)
    tags.push({ text: "Low satisfaction", positive: false });

  if (indicators.preventiveCare >= 3.5)
    tags.push({ text: "Good screening", positive: true });
  else if (indicators.preventiveCare < 2.5)
    tags.push({ text: "Low screening", positive: false });

  if (indicators.staffing >= 3.5)
    tags.push({ text: "Strong staffing", positive: true });
  else if (indicators.staffing < 2.5)
    tags.push({ text: "Low staffing", positive: false });

  return tags.slice(0, 3);
}

function getScorePct(p: CityProvider): number {
  return Math.round(p.indicators.preventiveCare * 20);
}
function getSatisfactionPct(p: CityProvider): number {
  return Math.round(p.indicators.experience * 20);
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

const DOMAIN_FRIENDLY_NAMES: Record<string, string> = {
  safetyClinical: "Falls & Safety",
  preventiveCare: "Preventive Screening",
  qualityMeasures: "Care Quality",
  staffing: "Staffing & Support",
  compliance: "Standards Compliance",
  experience: "Resident Satisfaction",
};

const DOMAIN_SHORT: Record<string, string> = {
  safetyClinical: "Safety",
  preventiveCare: "Screening",
  qualityMeasures: "Care",
  staffing: "Staffing",
  compliance: "Compliance",
  experience: "Satisfaction",
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

const COMPARE_COLORS = ["#1E3A8A", "#16A34A", "#D97706"];

// ── Trust Score Badge Component ───────────────────────────────────────────────
function TrustScoreBadge({ stars }: { stars: number }) {
  const trust = getTrustScore(stars);
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${trust.color} ${trust.bg} ${trust.border}`}
    >
      {trust.icon}
      {trust.label}
    </span>
  );
}

// ── Performance Tags Component ────────────────────────────────────────────────
function PerformanceTags({
  indicators,
}: { indicators: CityProvider["indicators"] }) {
  const tags = getPerformanceTags(indicators);
  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <span
          key={tag.text}
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
            tag.positive
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-600 border border-red-200"
          }`}
        >
          {tag.positive ? (
            <ThumbsUp className="h-2.5 w-2.5" />
          ) : (
            <TrendingDown className="h-2.5 w-2.5" />
          )}
          {tag.text}
        </span>
      ))}
    </div>
  );
}

// ── Smart Recommendation Banner ───────────────────────────────────────────────
function SmartRecommendation({
  providers,
  onSelect,
  currentQuarter,
}: {
  providers: CityProvider[];
  onSelect: (p: CityProvider) => void;
  currentQuarter: string;
}) {
  const top = useMemo(() => {
    return [...providers]
      .sort(
        (a, b) =>
          getProviderRatingForQuarter(b.id, currentQuarter).stars -
          getProviderRatingForQuarter(a.id, currentQuarter).stars,
      )
      .slice(0, 3);
  }, [providers, currentQuarter]);

  if (top.length === 0) return null;

  return (
    <Card className="border border-blue-200 bg-blue-50 shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="rounded-lg bg-[#1E3A8A] p-2">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-[#1E3A8A] text-sm">
              Recommended Providers
            </h2>
            <p className="text-xs text-blue-600">
              Top-rated providers in your selected region
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {top.map((p, idx) => {
            const stars = getProviderRatingForQuarter(
              p.id,
              currentQuarter,
            ).stars;
            const trust = getTrustScore(stars);
            const tags = getPerformanceTags(p.indicators);
            const positiveTags = tags
              .filter((t) => t.positive)
              .slice(0, 2)
              .map((t) => t.text);
            return (
              <button
                type="button"
                key={p.id}
                onClick={() => onSelect(p)}
                className="text-left rounded-xl bg-white border border-blue-100 p-4 hover:border-[#1E3A8A] hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    {idx === 0 && (
                      <Award className="h-4 w-4 text-amber-500 flex-shrink-0" />
                    )}
                    <span className="font-semibold text-gray-900 text-sm leading-tight group-hover:text-[#1E3A8A]">
                      {p.name}
                    </span>
                  </div>
                  <span
                    className={`flex-shrink-0 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${trust.color} ${trust.bg} ${trust.border}`}
                  >
                    {trust.icon}
                    {trust.label}
                  </span>
                </div>
                <StarRating stars={stars} />
                {positiveTags.length > 0 && (
                  <p className="text-xs text-gray-500 mt-2">
                    {positiveTags.join(" · ")}
                  </p>
                )}
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Comparison Tool ───────────────────────────────────────────────────────────
function ComparisonTool({
  providers,
  selectedIds,
  onClear,
  currentQuarter,
}: {
  providers: CityProvider[];
  selectedIds: string[];
  onClear: () => void;
  currentQuarter: string;
}) {
  if (selectedIds.length < 2) return null;

  const compared = selectedIds
    .map((id) => providers.find((p) => p.id === id))
    .filter(Boolean) as CityProvider[];

  // Recharts bar chart data per domain
  const barData = DOMAIN_ORDER.map((domain) => {
    const row: Record<string, string | number> = {
      domain: DOMAIN_SHORT[domain],
    };
    for (const p of compared) {
      row[p.name] = Math.round((getDomainRawScores(p)[domain] / 5) * 100);
    }
    return row;
  });

  // Radar chart data
  const radarData = DOMAIN_ORDER.map((domain) => {
    const row: Record<string, string | number> = {
      domain: DOMAIN_SHORT[domain],
    };
    for (const p of compared) {
      row[p.name] = Math.round((getDomainRawScores(p)[domain] / 5) * 100);
    }
    return row;
  });

  return (
    <Card
      className="border border-gray-200 shadow-sm"
      data-ocid="public.compare_panel"
    >
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-[#1E3A8A] p-2">
              <BarChart2 className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 text-sm">
                Provider Comparison
              </h2>
              <p className="text-xs text-gray-500">
                Comparing {compared.length} providers side by side
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClear}
            className="text-xs text-gray-400 hover:text-gray-700 flex items-center gap-1"
          >
            <X className="h-3.5 w-3.5" /> Clear comparison
          </button>
        </div>

        {/* Provider summary row */}
        <div
          className={`grid gap-4 mb-6 ${
            compared.length === 3 ? "grid-cols-3" : "grid-cols-2"
          }`}
        >
          {compared.map((p, idx) => {
            const stars = getProviderRatingForQuarter(
              p.id,
              currentQuarter,
            ).stars;
            const trust = getTrustScore(stars);
            return (
              <div
                key={p.id}
                className="rounded-xl border-2 p-4 space-y-2"
                style={{ borderColor: `${COMPARE_COLORS[idx]}40` }}
              >
                <div
                  className="h-1 w-full rounded-full mb-3"
                  style={{ backgroundColor: COMPARE_COLORS[idx] }}
                />
                <p className="font-semibold text-gray-900 text-sm leading-tight">
                  {p.name}
                </p>
                <StarRating stars={stars} />
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${trust.color} ${trust.bg} ${trust.border}`}
                >
                  {trust.icon} {trust.label}
                </span>
                <PerformanceTags indicators={p.indicators} />
              </div>
            );
          })}
        </div>

        {/* Bar chart */}
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
            Performance by Area (% of maximum)
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={barData}
              margin={{ top: 4, right: 8, left: -20, bottom: 4 }}
            >
              <XAxis
                dataKey="domain"
                tick={{ fontSize: 11, fill: "#6B7280" }}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 10, fill: "#9CA3AF" }}
              />
              <Tooltip
                formatter={(v: number) => `${v}%`}
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid #E5E7EB",
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
              {compared.map((p, idx) => (
                <Bar
                  key={p.id}
                  dataKey={p.name}
                  fill={COMPARE_COLORS[idx]}
                  radius={[3, 3, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Radar chart */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
            Performance Radar
          </p>
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#E5E7EB" />
              <PolarAngleAxis
                dataKey="domain"
                tick={{ fontSize: 11, fill: "#6B7280" }}
              />
              {compared.map((p, idx) => (
                <Radar
                  key={p.id}
                  name={p.name}
                  dataKey={p.name}
                  stroke={COMPARE_COLORS[idx]}
                  fill={COMPARE_COLORS[idx]}
                  fillOpacity={0.15}
                />
              ))}
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
              <Tooltip
                formatter={(v: number) => `${v}%`}
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid #E5E7EB",
                  fontSize: 12,
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Domain detail table */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider py-2 pr-4">
                  Area
                </th>
                {compared.map((p, idx) => (
                  <th
                    key={p.id}
                    className="text-center text-xs font-semibold py-2 px-2"
                    style={{ color: COMPARE_COLORS[idx] }}
                  >
                    {p.name.split(" ").slice(0, 2).join(" ")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DOMAIN_ORDER.map((domain, i) => (
                <tr
                  key={domain}
                  className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}
                >
                  <td className="text-xs text-gray-600 py-2 pr-4 font-medium">
                    {DOMAIN_FRIENDLY_NAMES[domain]}
                  </td>
                  {compared.map((p) => {
                    const score = getDomainRawScores(p)[domain];
                    const status = getIndicatorStatus(score);
                    return (
                      <td key={p.id} className="text-center py-2 px-2">
                        <span
                          className={`text-xs font-medium rounded-full px-2 py-0.5 ${status.chipClass}`}
                        >
                          {status.label}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

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
  const strengths = Object.entries(rawScores).filter(([, v]) => v >= 4.0);
  const improvements = Object.entries(rawScores).filter(([, v]) => v < 3.0);

  return (
    <Dialog open={!!provider} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="max-w-lg p-0 overflow-hidden"
        data-ocid="public.dialog"
      >
        {/* Navy header */}
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
          <div className="mt-4 flex items-center gap-4 flex-wrap">
            <div>
              <StarRating stars={stars} size="lg" />
              <p className="text-sm font-semibold mt-0.5 text-blue-100">
                {stars.toFixed(1)} / 5 &mdash; {perf.label}
              </p>
            </div>
            <div className="ml-auto flex flex-col items-end gap-2">
              <RiskBadge level={risk} />
              <TrustScoreBadge stars={stars} />
            </div>
          </div>
          {/* Performance tags in modal header */}
          <div className="mt-3">
            <PerformanceTags indicators={provider.indicators} />
          </div>
        </div>

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
                      <Progress
                        value={Math.round(score * 20)}
                        className="h-1.5 mt-1.5"
                      />
                      <p className="text-xs text-gray-500 mt-1">
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

          <p className="text-xs text-gray-400 text-center pb-1">
            Ratings are based on national quality standards and updated
            quarterly.
          </p>
        </div>

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
  isComparing,
  onToggleCompare,
  currentQuarter = "Q4-2025",
}: {
  provider: CityProvider;
  onSelect: (p: CityProvider) => void;
  isComparing: boolean;
  onToggleCompare: (id: string) => void;
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
      className={`overflow-hidden border shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer group ${
        isComparing
          ? "border-[#1E3A8A] ring-2 ring-[#1E3A8A]/20"
          : "border-gray-200"
      }`}
      onClick={() => onSelect(provider)}
      data-ocid="public.card"
    >
      <div className={`h-1 w-full ${accentColor}`} />
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-gray-900 leading-tight group-hover:text-[#1E3A8A] transition-colors">
              {provider.name}
            </h3>
            <TrustScoreBadge stars={stars} />
          </div>
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

        {/* Performance tags */}
        <PerformanceTags indicators={provider.indicators} />

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

        {/* Actions */}
        <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(provider);
            }}
            data-ocid="public.primary_button"
            className="flex items-center gap-1.5 text-sm font-medium text-[#1E3A8A] hover:text-blue-700 transition-colors py-1 rounded-md hover:bg-blue-50 px-2"
          >
            View Details
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleCompare(provider.id);
            }}
            className={`flex items-center gap-1 text-xs font-medium py-1 px-2 rounded-md border transition-colors ${
              isComparing
                ? "bg-[#1E3A8A] text-white border-[#1E3A8A]"
                : "text-gray-500 border-gray-200 hover:border-[#1E3A8A] hover:text-[#1E3A8A]"
            }`}
          >
            {isComparing ? (
              <>
                <XCircle className="h-3 w-3" /> Remove
              </>
            ) : (
              <>
                <BarChart2 className="h-3 w-3" /> Compare
              </>
            )}
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
  const [compareIds, setCompareIds] = useState<string[]>([]);

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
    const trusted = providers.filter(
      (p) => getProviderRatingForQuarter(p.id, currentQuarter).stars >= 4,
    ).length;
    return {
      total: providers.length,
      avgRating: avgRating.toFixed(1),
      goodOrAbovePct:
        providers.length > 0
          ? Math.round((goodOrAbove / providers.length) * 100)
          : 0,
      higherRisk,
      trusted,
    };
  }, [providers, currentQuarter]);

  function toggleCompare(id: string) {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return prev; // max 3
      return [...prev, id];
    });
  }

  // Reset compare when city changes
  function handleCityChange(city: string) {
    setSelectedCity(city);
    setCompareIds([]);
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
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
            Search, compare, and choose the best aged care provider for you or
            your family
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
                <Select value={selectedCity} onValueChange={handleCityChange}>
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

              {compareIds.length > 0 && (
                <div className="ml-auto flex items-center gap-2">
                  <span className="text-xs text-gray-500">
                    {compareIds.length} selected for comparison
                    {compareIds.length < 2 && " (select 1 more to compare)"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCompareIds([])}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Clear
                  </button>
                </div>
              )}

              <span
                className={`text-sm text-gray-500 ${compareIds.length === 0 ? "ml-auto" : ""}`}
              >
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
                <ShieldCheck className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {kpi.trusted}
                </p>
                <p className="text-xs text-gray-500">Trusted Providers (4★+)</p>
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

        {/* Smart Recommendation */}
        <SmartRecommendation
          providers={providers}
          onSelect={setSelectedProvider}
          currentQuarter={currentQuarter}
        />

        {/* Comparison panel (shows when 2+ selected) */}
        {compareIds.length >= 2 && (
          <ComparisonTool
            providers={providers}
            selectedIds={compareIds}
            onClear={() => setCompareIds([])}
            currentQuarter={currentQuarter}
          />
        )}

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
          <span className="font-medium text-gray-600">Trust Score:</span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-green-600" />
            <span className="text-green-700 font-medium">Trusted</span> = 4★ and
            above
          </span>
          <span className="flex items-center gap-1">
            <Info className="h-3.5 w-3.5 text-amber-500" />
            <span className="text-amber-700 font-medium">Average</span> = 3–4★
          </span>
          <span className="flex items-center gap-1">
            <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
            <span className="text-red-700 font-medium">Needs Improvement</span>{" "}
            = below 3★
          </span>
          <span className="ml-auto text-gray-400 italic">
            Click Compare on up to 3 providers to compare side-by-side
          </span>
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
                  isComparing={compareIds.includes(p.id)}
                  onToggleCompare={toggleCompare}
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

      <PublicProviderModal
        provider={selectedProvider}
        onClose={() => setSelectedProvider(null)}
        currentQuarter={currentQuarter}
      />
    </div>
  );
}
