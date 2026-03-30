import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Textarea } from "@/components/ui/textarea";
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
  Bell,
  Building2,
  Calendar,
  CheckCircle,
  ClipboardCheck,
  Clock,
  Info,
  MapPin,
  Phone,
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

// ── Types ─────────────────────────────────────────────────────────────────────
type BookingStatus = "confirmed" | "completed" | "cancelled";
interface Booking {
  id: string;
  providerId: string;
  providerName: string;
  service: string;
  date: string;
  time: string;
  userName: string;
  userPhone: string;
  status: BookingStatus;
  feedbackSubmitted: boolean;
}
interface FeedbackData {
  overall: number;
  safety: number;
  preventive: number;
  experience: number;
  quality: number;
  comment: string;
}

// ── Services ──────────────────────────────────────────────────────────────────
const SERVICES = [
  {
    name: "General Care",
    description: "Comprehensive daily care and support",
    availability: "Mon–Fri, 8am–6pm",
  },
  {
    name: "Physiotherapy",
    description: "Physical therapy and rehabilitation",
    availability: "Tue, Thu, 9am–4pm",
  },
  {
    name: "Medication Review",
    description: "Medication management and review",
    availability: "Mon–Wed, 10am–3pm",
  },
  {
    name: "Home Care",
    description: "In-home assistance and support services",
    availability: "Daily, 7am–7pm",
  },
  {
    name: "Mental Health Support",
    description: "Counselling and mental wellness programs",
    availability: "Mon, Wed, Fri, 9am–5pm",
  },
];

const TIME_SLOTS = [
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
];

// ── Star Picker ───────────────────────────────────────────────────────────────
function StarPicker({
  value,
  onChange,
  label,
}: { value: number; onChange: (v: number) => void; label?: string }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-2">
      {label && <span className="text-sm text-gray-600 w-32">{label}</span>}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            onClick={() => onChange(i)}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(0)}
            className="transition-transform hover:scale-110"
          >
            <Star
              className={`h-6 w-6 ${
                i <= (hovered || value)
                  ? "fill-amber-400 text-amber-400"
                  : "fill-gray-100 text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>
      {value > 0 && (
        <span className="text-sm font-medium text-gray-600">{value}/5</span>
      )}
    </div>
  );
}

// ── Service Booking Modal ─────────────────────────────────────────────────────
function ServiceBookingModal({
  provider,
  service,
  onClose,
  onConfirm,
}: {
  provider: CityProvider | null;
  service: string;
  onClose: () => void;
  onConfirm: (
    booking: Omit<Booking, "id" | "status" | "feedbackSubmitted">,
  ) => void;
}) {
  const [step, setStep] = useState(1);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [userName, setUserName] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  function handleConfirm() {
    if (!provider || !date || !time || !userName || !userPhone) return;
    onConfirm({
      providerId: provider.id,
      providerName: provider.name,
      service,
      date,
      time,
      userName,
      userPhone,
    });
    setConfirmed(true);
    setTimeout(() => {
      onClose();
    }, 2500);
  }

  if (!provider) return null;

  return (
    <Dialog open={!!provider} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="max-w-md p-0 overflow-hidden"
        data-ocid="booking.dialog"
      >
        {/* Header */}
        <div className="bg-[#1E3A8A] px-6 py-4 text-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white">
              Book Appointment
            </DialogTitle>
          </DialogHeader>
          <p className="text-blue-200 text-sm mt-1">{provider.name}</p>
          {/* Step indicator */}
          {!confirmed && (
            <div className="flex items-center gap-2 mt-4">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center gap-1.5">
                  <div
                    className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                      s <= step
                        ? "bg-white text-[#1E3A8A]"
                        : "bg-white/20 text-white/60"
                    }`}
                  >
                    {s < step ? "✓" : s}
                  </div>
                  {s < 3 && (
                    <div
                      className={`h-0.5 w-8 ${s < step ? "bg-white" : "bg-white/20"}`}
                    />
                  )}
                </div>
              ))}
              <span className="text-blue-200 text-xs ml-2">
                {step === 1
                  ? "Service"
                  : step === 2
                    ? "Date & Time"
                    : "Your Details"}
              </span>
            </div>
          )}
        </div>

        <div className="px-6 py-5">
          {confirmed ? (
            /* Success state */
            <div
              className="text-center py-6 space-y-4"
              data-ocid="booking.success_state"
            >
              <div className="mx-auto h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Booking Confirmed!
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  We look forward to seeing you
                </p>
              </div>
              <div className="rounded-lg bg-gray-50 border border-gray-200 p-4 text-left space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Activity className="h-4 w-4 text-[#1E3A8A]" />
                  <span className="font-medium">{service}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="h-4 w-4 text-[#1E3A8A]" />
                  <span>{date}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="h-4 w-4 text-[#1E3A8A]" />
                  <span>{time}</span>
                </div>
              </div>
              <p className="text-xs text-gray-400">
                This dialog will close automatically…
              </p>
            </div>
          ) : step === 1 ? (
            /* Step 1: Confirm service */
            <div className="space-y-4" data-ocid="booking.panel">
              <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1">
                  Selected Service
                </p>
                <p className="text-lg font-bold text-[#1E3A8A]">{service}</p>
                {SERVICES.find((s) => s.name === service) && (
                  <>
                    <p className="text-sm text-gray-600 mt-1">
                      {SERVICES.find((s) => s.name === service)!.description}
                    </p>
                    <div className="flex items-center gap-1.5 text-xs text-blue-600 mt-2">
                      <Clock className="h-3.5 w-3.5" />
                      {SERVICES.find((s) => s.name === service)!.availability}
                    </div>
                  </>
                )}
              </div>
              <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 text-sm text-gray-600">
                <p className="font-medium text-gray-800 mb-1">
                  {provider.name}
                </p>
                <p className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  {provider.city}, Australia
                </p>
              </div>
              <Button
                className="w-full bg-[#1E3A8A] hover:bg-[#1e40af] text-white"
                onClick={() => setStep(2)}
                data-ocid="booking.primary_button"
              >
                Choose Date & Time <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          ) : step === 2 ? (
            /* Step 2: Date & time */
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Select Date
                </Label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full"
                  data-ocid="booking.input"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Select Time
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {TIME_SLOTS.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setTime(slot)}
                      className={`rounded-lg border py-2 text-sm font-medium transition-colors ${
                        time === slot
                          ? "border-[#1E3A8A] bg-[#1E3A8A] text-white"
                          : "border-gray-200 bg-white text-gray-700 hover:border-[#1E3A8A] hover:text-[#1E3A8A]"
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep(1)}
                  data-ocid="booking.secondary_button"
                >
                  Back
                </Button>
                <Button
                  className="flex-1 bg-[#1E3A8A] hover:bg-[#1e40af] text-white"
                  disabled={!date || !time}
                  onClick={() => setStep(3)}
                  data-ocid="booking.primary_button"
                >
                  Continue <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          ) : (
            /* Step 3: Personal details */
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Your Name
                </Label>
                <Input
                  placeholder="Enter your full name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  data-ocid="booking.input"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Phone Number
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="04xx xxx xxx"
                    value={userPhone}
                    onChange={(e) => setUserPhone(e.target.value)}
                    className="pl-9"
                    data-ocid="booking.input"
                  />
                </div>
              </div>
              {/* Summary */}
              <div className="rounded-lg bg-gray-50 border border-gray-100 p-3 text-xs text-gray-500 space-y-1">
                <p className="font-medium text-gray-700 text-sm mb-2">
                  Booking Summary
                </p>
                <p>
                  {service} · {date} · {time}
                </p>
                <p>
                  {provider.name}, {provider.city}
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep(2)}
                  data-ocid="booking.secondary_button"
                >
                  Back
                </Button>
                <Button
                  className="flex-1 bg-[#1E3A8A] hover:bg-[#1e40af] text-white"
                  disabled={!userName || !userPhone}
                  onClick={handleConfirm}
                  data-ocid="booking.confirm_button"
                >
                  Confirm Booking
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Feedback Modal ─────────────────────────────────────────────────────────────
function FeedbackModal({
  booking,
  onClose,
  onSubmit,
}: {
  booking: Booking | null;
  onClose: () => void;
  onSubmit: (bookingId: string, feedback: FeedbackData) => void;
}) {
  const [overall, setOverall] = useState(0);
  const [safety, setSafety] = useState(0);
  const [preventive, setPreventive] = useState(0);
  const [experience, setExperience] = useState(0);
  const [quality, setQuality] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit() {
    if (!booking || overall === 0) return;
    onSubmit(booking.id, {
      overall,
      safety,
      preventive,
      experience,
      quality,
      comment,
    });
    setSubmitted(true);
    setTimeout(onClose, 2000);
  }

  if (!booking) return null;

  return (
    <Dialog open={!!booking} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="max-w-md p-0 overflow-hidden"
        data-ocid="feedback.dialog"
      >
        <div className="bg-[#1E3A8A] px-6 py-4 text-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white">
              Rate Your Experience
            </DialogTitle>
          </DialogHeader>
          <p className="text-blue-200 text-sm mt-1">
            {booking.providerName} · {booking.service}
          </p>
        </div>

        <div className="px-6 py-5">
          {submitted ? (
            <div
              className="text-center py-8 space-y-3"
              data-ocid="feedback.success_state"
            >
              <div className="mx-auto h-14 w-14 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-9 w-9 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Thank you!</h3>
              <p className="text-sm text-gray-500">
                Your feedback helps others make informed decisions.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Overall rating — required */}
              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-800">
                  Overall Experience <span className="text-red-500">*</span>
                </p>
                <StarPicker value={overall} onChange={setOverall} />
                {overall === 0 && (
                  <p className="text-xs text-red-500">
                    Please select a rating to continue
                  </p>
                )}
              </div>

              <div className="border-t border-gray-100" />

              {/* Domain ratings — optional */}
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Area Ratings (optional)
                </p>
                <StarPicker
                  value={safety}
                  onChange={setSafety}
                  label="Safety"
                />
                <StarPicker
                  value={preventive}
                  onChange={setPreventive}
                  label="Preventive Care"
                />
                <StarPicker
                  value={experience}
                  onChange={setExperience}
                  label="Experience"
                />
                <StarPicker
                  value={quality}
                  onChange={setQuality}
                  label="Care Quality"
                />
              </div>

              <div className="border-t border-gray-100" />

              {/* Comment */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Comments <span className="text-gray-400">(optional)</span>
                </Label>
                <Textarea
                  placeholder="Share your experience…"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  data-ocid="feedback.textarea"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={onClose}
                  data-ocid="feedback.cancel_button"
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-[#1E3A8A] hover:bg-[#1e40af] text-white"
                  disabled={overall === 0}
                  onClick={handleSubmit}
                  data-ocid="feedback.submit_button"
                >
                  Submit Feedback
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PublicProviderModal({
  provider,
  onClose,
  currentQuarter = "Q4-2025",
  onBookService,
}: {
  provider: CityProvider | null;
  onClose: () => void;
  currentQuarter?: string;
  onBookService?: (provider: CityProvider, service: string) => void;
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

          {/* Available Services */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
              Available Services
            </p>
            <div className="space-y-2">
              {SERVICES.map((svc) => (
                <div
                  key={svc.name}
                  className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800">
                      {svc.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {svc.description}
                    </p>
                    <div className="flex items-center gap-1.5 text-xs text-blue-600 mt-1">
                      <Clock className="h-3 w-3" />
                      {svc.availability}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="flex-shrink-0 bg-[#1E3A8A] hover:bg-[#1e40af] text-white text-xs"
                    onClick={() => {
                      if (onBookService && provider) {
                        onBookService(provider, svc.name);
                        onClose();
                      }
                    }}
                    data-ocid="booking.open_modal_button"
                  >
                    Book
                  </Button>
                </div>
              ))}
            </div>
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
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingProvider, setBookingProvider] = useState<CityProvider | null>(
    null,
  );
  const [bookingService, setBookingService] = useState<string>("");
  const [feedbackBookingId, setFeedbackBookingId] = useState<string | null>(
    null,
  );
  const [userRatingAdjustments, setUserRatingAdjustments] = useState<
    Record<string, number>
  >({});
  const [rateNotification, setRateNotification] = useState<Booking | null>(
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

  function handleBookingConfirm(
    booking: Omit<Booking, "id" | "status" | "feedbackSubmitted">,
  ) {
    const newBooking: Booking = {
      ...booking,
      id: `booking-${Date.now()}`,
      status: "confirmed",
      feedbackSubmitted: false,
    };
    setBookings((prev) => [...prev, newBooking]);
    setBookingProvider(null);
    setBookingService("");
  }

  function handleMarkComplete(bookingId: string) {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: "completed" } : b)),
    );
    const booking = bookings.find((b) => b.id === bookingId);
    if (booking) setRateNotification(booking);
  }

  function handleFeedbackSubmit(bookingId: string, feedback: FeedbackData) {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId ? { ...b, feedbackSubmitted: true } : b,
      ),
    );
    const booking = bookings.find((b) => b.id === bookingId);
    if (booking) {
      const existing = userRatingAdjustments[booking.providerId] ?? 0;
      const blended = existing
        ? 0.3 * feedback.overall + 0.7 * existing
        : feedback.overall;
      setUserRatingAdjustments((prev) => ({
        ...prev,
        [booking.providerId]: blended,
      }));
    }
    setFeedbackBookingId(null);
    setRateNotification(null);
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

        {/* My Bookings panel */}
        {bookings.length > 0 && (
          <Card
            className="border border-gray-200 shadow-sm"
            data-ocid="booking.panel"
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-[#1E3A8A] p-2">
                    <Calendar className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900 text-sm">
                      My Bookings
                    </h2>
                    <p className="text-xs text-gray-500">
                      Your appointment history
                    </p>
                  </div>
                </div>
                <Badge className="bg-[#1E3A8A] text-white">
                  {bookings.length}
                </Badge>
              </div>
              <div className="space-y-3">
                {bookings.map((b, idx) => (
                  <div
                    key={b.id}
                    data-ocid={`booking.item.${idx + 1}`}
                    className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800">
                        {b.providerName}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {b.service}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <Calendar className="h-3 w-3" />
                          {b.date}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <Clock className="h-3 w-3" />
                          {b.time}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {b.status === "confirmed" && (
                        <Badge className="bg-blue-100 text-blue-700 border border-blue-200 text-xs">
                          Confirmed
                        </Badge>
                      )}
                      {b.status === "completed" && (
                        <Badge className="bg-green-100 text-green-700 border border-green-200 text-xs">
                          Completed
                        </Badge>
                      )}
                      {b.status === "cancelled" && (
                        <Badge className="bg-gray-100 text-gray-600 border border-gray-200 text-xs">
                          Cancelled
                        </Badge>
                      )}
                      {b.status === "confirmed" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs h-7"
                          onClick={() => handleMarkComplete(b.id)}
                          data-ocid="booking.secondary_button"
                        >
                          Mark Complete
                        </Button>
                      )}
                      {b.status === "completed" && !b.feedbackSubmitted && (
                        <Button
                          size="sm"
                          className="text-xs h-7 bg-amber-500 hover:bg-amber-600 text-white"
                          onClick={() => setFeedbackBookingId(b.id)}
                          data-ocid="feedback.open_modal_button"
                        >
                          Rate Now
                        </Button>
                      )}
                      {b.feedbackSubmitted && (
                        <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                          <CheckCircle className="h-3.5 w-3.5" /> Rated
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
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

      {/* Sticky rate notification */}
      {rateNotification && !rateNotification.feedbackSubmitted && (
        <div
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl px-4"
          data-ocid="feedback.toast"
        >
          <div className="flex items-center justify-between gap-4 rounded-xl bg-amber-500 px-5 py-4 shadow-xl text-white">
            <div className="flex items-center gap-3 min-w-0">
              <Bell className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm font-medium leading-tight">
                You completed your visit to{" "}
                <strong>{rateNotification.providerName}</strong>. Share your
                experience to help others.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                size="sm"
                className="bg-white text-amber-600 hover:bg-amber-50 text-xs font-semibold h-8"
                onClick={() => setFeedbackBookingId(rateNotification.id)}
                data-ocid="feedback.open_modal_button"
              >
                Rate Now
              </Button>
              <button
                type="button"
                className="text-white/80 hover:text-white"
                onClick={() => setRateNotification(null)}
                data-ocid="feedback.close_button"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <PublicProviderModal
        provider={selectedProvider}
        onClose={() => setSelectedProvider(null)}
        currentQuarter={currentQuarter}
        onBookService={(provider, service) => {
          setBookingProvider(provider);
          setBookingService(service);
        }}
      />
      <ServiceBookingModal
        provider={bookingProvider}
        service={bookingService}
        onClose={() => {
          setBookingProvider(null);
          setBookingService("");
        }}
        onConfirm={handleBookingConfirm}
      />
      <FeedbackModal
        booking={bookings.find((b) => b.id === feedbackBookingId) ?? null}
        onClose={() => setFeedbackBookingId(null)}
        onSubmit={handleFeedbackSubmit}
      />
    </div>
  );
}
