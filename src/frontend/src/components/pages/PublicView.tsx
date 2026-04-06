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
import { useBookingContext } from "@/context/BookingContext";
import type { FeedbackData as CtxFeedbackData } from "@/context/BookingContext";
import {
  CITY_LIST,
  CITY_PROVIDERS,
  type CityProvider,
  getProviderRatingForQuarter,
} from "@/data/mockData";
import {
  Bar,
  BarChart,
  Legend,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useContactContext } from "@/context/ContactContext";
import { PROVIDER_CONTACTS } from "@/data/providerContacts";
import {
  CALL_TOPICS,
  deriveContactIntelligence,
  generateCallSummary,
} from "@/utils/providerContactIntelligence";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Award,
  BarChart2,
  Bell,
  Bot,
  Building2,
  Calendar,
  CheckCircle,
  ChevronRight,
  ClipboardCheck,
  Clock,
  Edit2,
  Heart,
  History,
  Info,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  PhoneCall,
  Search,
  Send,
  Shield,
  ShieldCheck,
  Sparkles,
  Star,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  TrendingDown,
  TrendingUp,
  Users,
  X,
  Zap,
} from "lucide-react";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";

// ── Constants ────────────────────────────────────────────────────────────────
const ALL_QUARTERS = ["Q1-2025", "Q2-2025", "Q3-2025", "Q4-2025"];

const SERVICES = [
  {
    name: "General Care",
    description: "Comprehensive daily care and support",
    availability: "Mon–Fri, 8am–6pm",
    icon: "🏥",
  },
  {
    name: "Physiotherapy",
    description: "Physical therapy and rehabilitation",
    availability: "Tue, Thu, 9am–4pm",
    icon: "🦾",
  },
  {
    name: "Medication Review",
    description: "Medication management and review",
    availability: "Mon–Wed, 10am–3pm",
    icon: "💊",
  },
  {
    name: "Home Care",
    description: "In-home assistance and support services",
    availability: "Daily, 7am–7pm",
    icon: "🏠",
  },
  {
    name: "Mental Health Support",
    description: "Counselling and mental wellness programs",
    availability: "Mon, Wed, Fri, 9am–5pm",
    icon: "🧠",
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

const CARE_NEEDS = [
  "General Care",
  "Dementia Care",
  "Physiotherapy",
  "Mental Health",
  "Palliative Care",
  "Wound Management",
];

// ── Types ────────────────────────────────────────────────────────────────────
type BookingStatus = "confirmed" | "in_progress" | "completed" | "cancelled";
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
interface Review {
  id: string;
  author: string;
  rating: number;
  comment: string;
  timestamp: number;
  isOwn: boolean;
}
interface ChatMessage {
  role: "user" | "ai";
  text: string;
  ts: number;
  providers?: string[]; // provider ids to show as chips
  quickReplies?: string[];
}
interface UserRatings {
  [providerId: string]: FeedbackData & { count: number };
}

// ── Seed Reviews ─────────────────────────────────────────────────────────────
function initReviews(): Record<string, Review[]> {
  const result: Record<string, Review[]> = {};
  const allProviders = Object.values(CITY_PROVIDERS).flat();
  const sampleReviews: Array<[string, number, string]> = [
    [
      "Margaret T.",
      5,
      "Exceptional care and very attentive staff. Mum settled in immediately and is thriving.",
    ],
    [
      "David R.",
      4,
      "Good facilities and responsive team. Minor concerns with shift handover communication but overall very positive.",
    ],
    [
      "Sarah K.",
      5,
      "The staff go above and beyond. I'm impressed by the activity programs and personalised care plans.",
    ],
    [
      "John M.",
      3,
      "Adequate care but room for improvement in communication with family members.",
    ],
    [
      "Linda H.",
      4,
      "Clean, professional environment. Dad is well looked after and seems happy.",
    ],
    [
      "Peter C.",
      2,
      "Understaffed on weekends. Raised concerns and management responded but changes are slow.",
    ],
    [
      "Helen B.",
      5,
      "Outstanding dementia care program. The specialists really understand how to engage residents.",
    ],
    [
      "Tom W.",
      4,
      "Friendly staff and modern facilities. The physio program has made a real difference.",
    ],
  ];
  for (let i = 0; i < allProviders.length; i++) {
    const p = allProviders[i];
    const [r1, r2] = [
      sampleReviews[i % sampleReviews.length],
      sampleReviews[(i + 3) % sampleReviews.length],
    ];
    result[p.id] = [
      {
        id: `${p.id}-r1`,
        author: r1[0] as string,
        rating: r1[1] as number,
        comment: r1[2] as string,
        timestamp: Date.now() - 1000 * 60 * 60 * 24 * 14,
        isOwn: false,
      },
      {
        id: `${p.id}-r2`,
        author: r2[0] as string,
        rating: r2[1] as number,
        comment: r2[2] as string,
        timestamp: Date.now() - 1000 * 60 * 60 * 24 * 7,
        isOwn: false,
      },
    ];
  }
  return result;
}

// ── Helpers ──────────────────────────────────────────────────────────────────
const STAR_POSITIONS = [1, 2, 3, 4, 5] as const;

function renderStars(rating: number, size = "h-4 w-4") {
  return (
    <span className="flex items-center gap-0.5">
      {STAR_POSITIONS.map((pos) => {
        const diff = rating - pos + 1;
        if (diff >= 1)
          return (
            <Star
              key={pos}
              className={`${size} fill-amber-400 text-amber-400`}
            />
          );
        if (diff >= 0.25)
          return (
            <span key={pos} className="relative inline-block">
              <Star className={`${size} fill-gray-200 text-gray-300`} />
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: "50%" }}
              >
                <Star className={`${size} fill-amber-400 text-amber-400`} />
              </span>
            </span>
          );
        return (
          <Star key={pos} className={`${size} fill-gray-100 text-gray-300`} />
        );
      })}
    </span>
  );
}

function getRiskLevel(
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
  const poor = scores.filter((s) => s < 2.5).length;
  const moderate = scores.filter((s) => s >= 2.5 && s < 3.5).length;
  if (poor >= 2) return "High";
  if (poor === 1 || moderate >= 3) return "Medium";
  return "Low";
}

// ── New Helper Functions ──────────────────────────────────────────────────────
function calcTrustScore(
  stars: number,
  safetyScore: number,
  complianceScore: number,
  avgReviewRating: number,
  trendDiff: number,
): { score: number; label: string; colorClass: string; ringColor: string } {
  const ratingPct = (stars / 5) * 100;
  const feedbackPct =
    avgReviewRating > 0 ? (avgReviewRating / 5) * 100 : (stars / 5) * 100;
  const trendBonus = Math.max(0, Math.min(100, 50 + trendDiff * 20));
  const score = Math.round(
    ratingPct * 0.35 +
      feedbackPct * 0.2 +
      safetyScore * 0.25 +
      complianceScore * 0.1 +
      trendBonus * 0.1,
  );
  const label =
    score >= 70
      ? "🟢 Trusted"
      : score >= 50
        ? "🟡 Moderate"
        : "🔴 Needs Improvement";
  const colorClass =
    score >= 70
      ? "text-green-600"
      : score >= 50
        ? "text-amber-600"
        : "text-red-600";
  const ringColor =
    score >= 70 ? "#16A34A" : score >= 50 ? "#F59E0B" : "#DC2626";
  return { score, label, colorClass, ringColor };
}

function TrustScoreRing({
  score,
  ringColor,
  size = 48,
}: { score: number; ringColor: string; size?: number }) {
  const r = size / 2 - 5;
  const circumference = 2 * Math.PI * r;
  const dash = (score / 100) * circumference;
  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        style={{ transform: "rotate(-90deg)" }}
        role="img"
        aria-label={`Trust score: ${score}`}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="4"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={ringColor}
          strokeWidth="4"
          strokeDasharray={`${dash} ${circumference}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 1s ease" }}
        />
      </svg>
      <span className="absolute text-xs font-bold" style={{ color: ringColor }}>
        {score}
      </span>
    </div>
  );
}

function calcOutcomePrediction(
  ratingData: ReturnType<typeof getProviderRatingForQuarter>,
) {
  const { domainScores } = ratingData;
  const score = Math.round(
    domainScores.safety * 0.3 +
      domainScores.experience * 0.25 +
      domainScores.quality * 0.2 +
      domainScores.preventive * 0.15 +
      domainScores.compliance * 0.1,
  );
  const confidence =
    score >= 75
      ? "High Confidence"
      : score >= 55
        ? "Moderate Confidence"
        : "Low Confidence";
  const confidenceColor =
    score >= 75
      ? "text-green-600"
      : score >= 55
        ? "text-amber-600"
        : "text-red-600";
  return { score, confidence, confidenceColor };
}

function CapacityIndicator({
  providerId,
  serviceName,
  capacityState,
}: {
  providerId: string;
  serviceName: string;
  capacityState: Record<string, { total: number; booked: number }>;
}) {
  const key = `${providerId}-${serviceName}`;
  const cap = capacityState[key] ?? { total: 12, booked: 0 };
  const available = cap.total - cap.booked;
  const pct = cap.total > 0 ? available / cap.total : 0;
  const status =
    available === 0
      ? { label: "Fully Booked", colorClass: "text-red-600", dot: "🔴" }
      : pct > 0.5
        ? { label: "Available Today", colorClass: "text-green-600", dot: "🟢" }
        : pct > 0.1
          ? {
              label: "Limited Availability",
              colorClass: "text-amber-600",
              dot: "🟡",
            }
          : { label: "Filling Fast", colorClass: "text-red-600", dot: "🔴" };
  return (
    <div className="mt-2">
      <div className="flex items-center justify-between text-xs mb-1">
        <span className={`font-medium ${status.colorClass}`}>
          {status.dot} {status.label}
        </span>
        <span className="text-gray-500">
          {available} of {cap.total} slots
        </span>
      </div>
      <Progress value={pct * 100} className="h-1.5" />
    </div>
  );
}

function CareJourneyTracker({
  bookings,
  onMarkComplete,
  onFeedback,
}: {
  bookings: Booking[];
  onMarkComplete: (id: string) => void;
  onFeedback: (b: Booking) => void;
}) {
  if (bookings.length === 0) return null;

  const stages: Array<{
    key: BookingStatus | "feedback";
    label: string;
    icon: ReactNode;
  }> = [
    {
      key: "confirmed",
      label: "Booked",
      icon: <Calendar className="h-3.5 w-3.5" />,
    },
    {
      key: "in_progress",
      label: "In Progress",
      icon: <Activity className="h-3.5 w-3.5" />,
    },
    {
      key: "completed",
      label: "Completed",
      icon: <CheckCircle className="h-3.5 w-3.5" />,
    },
    {
      key: "feedback",
      label: "Feedback",
      icon: <ThumbsUp className="h-3.5 w-3.5" />,
    },
  ];

  function getStageIndex(booking: Booking): number {
    if (booking.feedbackSubmitted) return 4;
    if (booking.status === "completed") return 3;
    if (booking.status === "in_progress") return 2;
    return 1;
  }

  return (
    <div className="glass-card rounded-2xl p-5" data-ocid="journey.section">
      <h2 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-4">
        <ClipboardCheck className="h-5 w-5 text-[#1E3A8A]" /> My Care Journey
      </h2>
      <div className="space-y-4">
        {bookings.map((b, i) => {
          const currentStage = getStageIndex(b);
          return (
            <div
              key={b.id}
              className="bg-[#F8FAFC] rounded-xl p-4 border"
              data-ocid={`journey.item.${i + 1}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-semibold text-sm text-gray-900">
                    {b.service}
                  </p>
                  <p className="text-xs text-gray-500">
                    {b.providerName} · {b.date} at {b.time}
                  </p>
                </div>
                <div className="flex gap-2">
                  {b.status === "confirmed" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-7"
                      onClick={() => onMarkComplete(b.id)}
                      data-ocid={`journey.progress_button.${i + 1}`}
                    >
                      Start Service
                    </Button>
                  )}
                  {b.status === "in_progress" && (
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white text-xs h-7"
                      onClick={() => onMarkComplete(b.id)}
                      data-ocid={`journey.complete_button.${i + 1}`}
                    >
                      Complete
                    </Button>
                  )}
                  {b.status === "completed" && !b.feedbackSubmitted && (
                    <Button
                      size="sm"
                      className="bg-amber-500 hover:bg-amber-600 text-white text-xs h-7"
                      onClick={() => onFeedback(b)}
                      data-ocid={`journey.feedback_button.${i + 1}`}
                    >
                      Rate Now
                    </Button>
                  )}
                  {b.feedbackSubmitted && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                </div>
              </div>
              {/* Timeline */}
              <div className="flex items-center gap-0">
                {stages.map((stage, si) => {
                  const isCompleted = currentStage > si + 1;
                  const isActive = currentStage === si + 1;
                  const isPending = currentStage < si + 1;
                  return (
                    <div
                      key={stage.key}
                      className="flex items-center flex-1 last:flex-none"
                    >
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all ${isCompleted ? "bg-green-500 border-green-500 text-white" : isActive ? "bg-[#1E3A8A] border-[#1E3A8A] text-white" : "bg-white border-gray-200 text-gray-400"}`}
                        >
                          {stage.icon}
                        </div>
                        <span
                          className={`text-xs mt-1 font-medium ${isCompleted ? "text-green-600" : isActive ? "text-[#1E3A8A]" : isPending ? "text-gray-400" : "text-gray-400"}`}
                        >
                          {stage.label}
                        </span>
                      </div>
                      {si < stages.length - 1 && (
                        <div
                          className={`flex-1 h-0.5 mx-1 mb-4 ${isCompleted ? "bg-green-400" : "bg-gray-200"}`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getProviderAlerts(
  indicators: CityProvider["indicators"],
): Array<{ text: string; color: "red" | "amber" }> {
  const alerts: Array<{ text: string; color: "red" | "amber" }> = [];
  if (indicators.safetyClinical < 2.5)
    alerts.push({ text: "⚠ High fall risk trend", color: "red" });
  if (indicators.preventiveCare < 2.5)
    alerts.push({ text: "⚠ Low screening performance", color: "amber" });
  if (indicators.staffing < 2.5)
    alerts.push({ text: "⚠ Staffing concerns", color: "amber" });
  if (indicators.experience < 2.5)
    alerts.push({ text: "⚠ Low satisfaction trend", color: "red" });
  return alerts.slice(0, 2);
}

function getBestForTags(
  provider: CityProvider,
  stars: number,
): Array<{ label: string; cls: string }> {
  const tags: Array<{ label: string; cls: string }> = [];
  if (stars >= 4.5)
    tags.push({
      label: "🏆 Top Rated",
      cls: "bg-amber-50 text-amber-700 border border-amber-200",
    });
  if (provider.indicators.safetyClinical >= 4.0)
    tags.push({
      label: "🛡 Best for Safety",
      cls: "bg-blue-50 text-blue-700 border border-blue-200",
    });
  if (provider.indicators.experience >= 4.0)
    tags.push({
      label: "⭐ Best for Experience",
      cls: "bg-green-50 text-green-700 border border-green-200",
    });
  if (provider.indicators.preventiveCare >= 4.0)
    tags.push({
      label: "💊 Best Preventive Care",
      cls: "bg-teal-50 text-teal-700 border border-teal-200",
    });
  if (stars < 3.0)
    tags.push({
      label: "⚠ Needs Improvement",
      cls: "bg-red-50 text-red-600 border border-red-200",
    });
  return tags.slice(0, 2);
}

function getPerformanceTags(provider: CityProvider): string[] {
  const tags: string[] = [];
  if (provider.indicators.safetyClinical >= 4.0) tags.push("Low falls");
  if (provider.indicators.experience >= 4.0) tags.push("High satisfaction");
  if (provider.indicators.preventiveCare >= 4.0) tags.push("Good screening");
  if (provider.indicators.staffing >= 4.0) tags.push("Strong staffing");
  if (provider.indicators.qualityMeasures >= 4.0) tags.push("High quality");
  return tags.slice(0, 3);
}

function generateRecommendationReason(
  _provider: CityProvider,
  domainScores: ReturnType<typeof getProviderRatingForQuarter>["domainScores"],
): string {
  const strengths: string[] = [];
  if (domainScores.safety > 80) strengths.push("high safety");
  if (domainScores.experience > 80) strengths.push("high satisfaction");
  if (domainScores.preventive > 80) strengths.push("excellent preventive care");
  if (domainScores.staffing > 80) strengths.push("strong staffing");
  if (domainScores.compliance > 80) strengths.push("full compliance");
  if (strengths.length === 0) strengths.push("consistent care quality");
  return `Recommended due to ${strengths.slice(0, 2).join(" and ")} scores`;
}

function generateDynamicExplanation(
  provider: CityProvider,
  stars: number,
): string {
  const ind = provider.indicators;
  const weak: string[] = [];
  if (ind.safetyClinical < 3.0) weak.push("safety indicators");
  if (ind.preventiveCare < 3.0) weak.push("preventive screening");
  if (ind.staffing < 3.0) weak.push("staffing levels");
  if (ind.experience < 3.0) weak.push("resident satisfaction");
  if (weak.length === 0) {
    if (stars >= 4.5)
      return "This provider delivers exceptional care across all quality domains.";
    if (stars >= 4.0)
      return "This provider performs well overall with strong results across most quality indicators.";
    return "This provider offers satisfactory care quality with room for improvement in some areas.";
  }
  return `Provider performs adequately overall but needs improvement in ${weak.slice(0, 2).join(" and ")} to reach higher standards.`;
}

// ── Star Picker ───────────────────────────────────────────────────────────────
function StarPicker({
  value,
  onChange,
  label,
}: { value: number; onChange: (v: number) => void; label?: string }) {
  const [hovered, setHovered] = useState(0);
  const [popped, setPopped] = useState(0);
  function handleClick(i: number) {
    onChange(i);
    setPopped(i);
    setTimeout(() => setPopped(0), 220);
  }
  return (
    <div className="flex items-center gap-2">
      {label && (
        <span className="text-sm text-gray-600 w-36 shrink-0">{label}</span>
      )}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={`star-${i}`}
            type="button"
            onClick={() => handleClick(i)}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(0)}
            className="transition-transform hover:scale-110"
          >
            <Star
              className={`h-6 w-6 ${popped === i ? "star-pop" : ""} ${i <= (hovered || value) ? "fill-amber-400 text-amber-400" : "fill-gray-100 text-gray-300"}`}
              style={
                i <= (hovered || value)
                  ? { filter: "drop-shadow(0 0 4px rgba(251,191,36,0.75))" }
                  : {}
              }
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
  }

  return (
    <Dialog open={!!provider} onOpenChange={onClose}>
      <DialogContent className="max-w-md" data-ocid="booking.dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-[#1E3A8A]" />
            Book Appointment
          </DialogTitle>
        </DialogHeader>
        {confirmed ? (
          <div className="text-center py-8" data-ocid="booking.success_state">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Booking Confirmed!
            </h3>
            <p className="text-gray-600 mb-1">
              <span className="font-medium">{service}</span> at{" "}
              <span className="font-medium">{provider?.name}</span>
            </p>
            <p className="text-sm text-gray-500">
              {date} at {time}
            </p>
            <Button
              className="mt-6 bg-[#1E3A8A] hover:bg-[#1e40af] btn-press"
              onClick={onClose}
              data-ocid="booking.close_button"
            >
              Done
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${step >= s ? "bg-gradient-to-r from-blue-500 to-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.55)]" : "bg-gray-200"}`}
                />
              ))}
            </div>
            {step === 1 && (
              <div className="space-y-4" data-ocid="booking.panel">
                <div className="bg-[#F8FAFC] rounded-lg p-4 border">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                    Selected Service
                  </p>
                  <p className="text-lg font-bold text-[#1E3A8A]">{service}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {SERVICES.find((s) => s.name === service)?.description}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {SERVICES.find((s) => s.name === service)?.availability}
                  </p>
                </div>
                <div className="bg-[#F8FAFC] rounded-lg p-4 border">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                    Provider
                  </p>
                  <p className="font-semibold text-gray-900">
                    {provider?.name}
                  </p>
                  <p className="text-sm text-gray-500">{provider?.city}</p>
                </div>
                <Button
                  className="w-full bg-[#1E3A8A] hover:bg-[#1e40af]"
                  onClick={() => setStep(2)}
                  data-ocid="booking.primary_button"
                >
                  Select Date & Time <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="bdate">Preferred Date</Label>
                  <Input
                    id="bdate"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="mt-1"
                    data-ocid="booking.input"
                  />
                </div>
                <div>
                  <Label>Preferred Time</Label>
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    {TIME_SLOTS.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTime(t)}
                        className={`text-sm py-2 px-3 rounded-lg border transition-colors ${time === t ? "bg-[#1E3A8A] text-white border-[#1E3A8A]" : "bg-white text-gray-700 border-gray-200 hover:border-[#3B82F6]"}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setStep(1)}
                    data-ocid="booking.secondary_button"
                  >
                    Back
                  </Button>
                  <Button
                    className="flex-1 bg-[#1E3A8A] hover:bg-[#1e40af]"
                    disabled={!date || !time}
                    onClick={() => setStep(3)}
                    data-ocid="booking.primary_button"
                  >
                    Continue
                  </Button>
                </div>
              </div>
            )}
            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="uname">Your Name</Label>
                  <Input
                    id="uname"
                    placeholder="Full name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="mt-1"
                    data-ocid="booking.input"
                  />
                </div>
                <div>
                  <Label htmlFor="uphone">Phone Number</Label>
                  <Input
                    id="uphone"
                    placeholder="04xx xxx xxx"
                    value={userPhone}
                    onChange={(e) => setUserPhone(e.target.value)}
                    className="mt-1"
                    data-ocid="booking.input"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setStep(2)}
                    data-ocid="booking.secondary_button"
                  >
                    Back
                  </Button>
                  <Button
                    className="flex-1 bg-[#1E3A8A] hover:bg-[#1e40af]"
                    disabled={!userName || !userPhone}
                    onClick={handleConfirm}
                    data-ocid="booking.submit_button"
                  >
                    Confirm Booking
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
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
  onSubmit: (bookingId: string, data: FeedbackData) => void;
}) {
  const [fd, setFd] = useState<FeedbackData>({
    overall: 5,
    safety: 4,
    preventive: 4,
    experience: 4,
    quality: 4,
    comment: "",
  });
  if (!booking) return null;
  return (
    <Dialog open={!!booking} onOpenChange={onClose}>
      <DialogContent className="max-w-md" data-ocid="feedback.dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-amber-500" />
            Rate Your Experience
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-[#F8FAFC] rounded-lg p-3 border text-sm">
            <p className="font-medium">{booking.service}</p>
            <p className="text-gray-500">
              {booking.providerName} · {booking.date}
            </p>
          </div>
          <div className="space-y-3">
            <StarPicker
              value={fd.overall}
              onChange={(v) => setFd({ ...fd, overall: v })}
              label="Overall"
            />
            <StarPicker
              value={fd.safety}
              onChange={(v) => setFd({ ...fd, safety: v })}
              label="Safety"
            />
            <StarPicker
              value={fd.preventive}
              onChange={(v) => setFd({ ...fd, preventive: v })}
              label="Preventive Care"
            />
            <StarPicker
              value={fd.experience}
              onChange={(v) => setFd({ ...fd, experience: v })}
              label="Experience"
            />
            <StarPicker
              value={fd.quality}
              onChange={(v) => setFd({ ...fd, quality: v })}
              label="Quality"
            />
          </div>
          <div>
            <Label>Comments (optional)</Label>
            <Textarea
              placeholder="Share your experience..."
              value={fd.comment}
              onChange={(e) => setFd({ ...fd, comment: e.target.value })}
              className="mt-1"
              data-ocid="feedback.textarea"
              rows={3}
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onClose}
              data-ocid="feedback.cancel_button"
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-gradient-to-r from-[#1e3a8a] to-[#4f46e5] hover:opacity-90 text-white btn-press"
              onClick={() => onSubmit(booking.id, fd)}
              data-ocid="feedback.submit_button"
            >
              Submit Feedback
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── AI Chatbot ────────────────────────────────────────────────────────────────
function AIChatbot({
  currentCity,
  onCityChange,
  onOpenProvider,
}: {
  currentCity: string;
  onCityChange: (c: string) => void;
  onOpenProvider: (p: CityProvider) => void;
}) {
  const [open, setOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [awaitingService, setAwaitingService] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "ai",
      text: "Hi! I'm your AI Care Assistant. Ask me anything about aged care providers in your area.",
      ts: Date.now(),
      quickReplies: [
        "Best provider?",
        "Safest option?",
        "Home care?",
        "Compare providers",
      ],
    },
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: scrollRef is stable
  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  function generateResponse(msg: string): string {
    const lower = msg.toLowerCase();
    const cityProviders = CITY_PROVIDERS[currentCity] || [];

    // City name mentioned — switch city
    for (const city of CITY_LIST) {
      if (lower.includes(city.toLowerCase())) {
        const cityPs = CITY_PROVIDERS[city] || [];
        if (cityPs.length > 0) {
          onCityChange(city);
          const top = [...cityPs].sort((a, b) => {
            const ra = getProviderRatingForQuarter(a.id).stars;
            const rb = getProviderRatingForQuarter(b.id).stars;
            return rb - ra;
          })[0];
          const rating = getProviderRatingForQuarter(top.id);
          return `I've switched to ${city}. The top provider there is **${top.name}** with ${rating.stars.toFixed(1)}⭐. ${generateRecommendationReason(top, rating.domainScores)}.`;
        }
      }
    }

    if (cityProviders.length === 0)
      return "I couldn't find providers for your current location. Try selecting a different city.";

    const sorted = [...cityProviders].sort((a, b) => {
      const ra = getProviderRatingForQuarter(a.id).stars;
      const rb = getProviderRatingForQuarter(b.id).stars;
      return rb - ra;
    });

    if (lower.includes("dementia")) {
      const top = sorted[0];
      const r = getProviderRatingForQuarter(top.id);
      return `For dementia care, I recommend **${top.name}** in ${top.city}. They have a ${r.stars.toFixed(1)}⭐ rating with strong safety and experience scores. ${generateRecommendationReason(top, r.domainScores)}.`;
    }
    if (
      lower.includes("safe") ||
      lower.includes("fall") ||
      lower.includes("safety")
    ) {
      const safest = [...cityProviders].sort(
        (a, b) => b.indicators.safetyClinical - a.indicators.safetyClinical,
      )[0];
      const r = getProviderRatingForQuarter(safest.id);
      return `The safest provider in ${currentCity} is **${safest.name}** with a safety score of ${safest.indicators.safetyClinical.toFixed(1)}/5 and overall rating of ${r.stars.toFixed(1)}⭐.`;
    }
    if (
      lower.includes("home care") ||
      lower.includes("cheapest") ||
      lower.includes("home")
    ) {
      const homeProviders = cityProviders.filter((p) => p.type === "Home Care");
      if (homeProviders.length === 0)
        return `There are no home care providers listed in ${currentCity}. Try searching in another city.`;
      return `Home care options in ${currentCity}: ${homeProviders.map((p) => `**${p.name}**`).join(", ")}. I recommend checking their ratings using the provider cards below.`;
    }
    if (
      lower.includes("highest rated") ||
      lower.includes("best provider") ||
      lower.includes("top rated")
    ) {
      const top = sorted[0];
      const r = getProviderRatingForQuarter(top.id);
      return `The highest rated provider in ${currentCity} is **${top.name}** with ${r.stars.toFixed(1)}⭐. ${generateRecommendationReason(top, r.domainScores)}.`;
    }
    if (lower.includes("lowest risk") || lower.includes("low risk")) {
      const lowRisk = cityProviders.find(
        (p) => getRiskLevel(p.indicators) === "Low",
      );
      if (lowRisk) {
        const r = getProviderRatingForQuarter(lowRisk.id);
        return `The lowest risk provider in ${currentCity} is **${lowRisk.name}** (${r.stars.toFixed(1)}⭐, Low Risk) — strong performance across all safety indicators.`;
      }
      return `All providers in ${currentCity} currently show some risk indicators. I recommend **${sorted[0].name}** as the best overall option.`;
    }
    if (lower.includes("how many") || lower.includes("providers")) {
      return `There are ${cityProviders.length} aged care providers listed in ${currentCity}. ${sorted.filter((p) => getProviderRatingForQuarter(p.id).stars >= 4).length} have a rating of 4⭐ or higher.`;
    }
    return `I can help you find aged care providers in ${currentCity}. Try asking:\n• "Best provider for dementia care"\n• "Safest provider"\n• "Home care options"\n• "Highest rated provider"\nOr mention a city name to explore providers there.`;
  }

  function sendMessage(overrideText?: string) {
    const text = (overrideText ?? input).trim();
    if (!text) return;
    const userMsg: ChatMessage = { role: "user", text, ts: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Multi-step: if "best provider" without service context, ask for service
    const lower = text.toLowerCase();
    if (
      !awaitingService &&
      (lower === "best provider?" || lower === "best provider") &&
      !lower.includes("for")
    ) {
      setTimeout(() => {
        setIsTyping(false);
        setAwaitingService(true);
        const aiMsg: ChatMessage = {
          role: "ai",
          text: "What type of care are you looking for?",
          ts: Date.now(),
          quickReplies: [
            "General Care",
            "Dementia Care",
            "Physiotherapy",
            "Home Care",
            "Mental Health",
          ],
        };
        setMessages((prev) => [...prev, aiMsg]);
      }, 700);
      return;
    }
    setAwaitingService(false);

    setTimeout(() => {
      setIsTyping(false);
      const responseText = generateResponse(text);
      // Find provider chips if response mentions providers
      const cityPs = CITY_PROVIDERS[currentCity] || [];
      const mentionedProviders = cityPs
        .filter((p) => responseText.includes(p.name))
        .map((p) => p.id);
      const aiMsg: ChatMessage = {
        role: "ai",
        text: responseText,
        ts: Date.now(),
        providers:
          mentionedProviders.length > 0 ? mentionedProviders : undefined,
      };
      setMessages((prev) => [...prev, aiMsg]);
    }, 700);
  }

  return (
    <>
      {/* Floating button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        data-ocid="chat.open_modal_button"
        className="fixed bottom-6 right-6 w-14 h-14 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105 z-50 pulse-ring btn-press"
        style={{ background: "linear-gradient(135deg,#1e3a8a,#6366f1)" }}
        title="AI Care Assistant"
      >
        <Bot className="h-6 w-6" />
      </button>

      {/* Chat panel */}
      {open && (
        <div
          className="fixed bottom-24 right-6 w-80 h-96 glass-card rounded-2xl flex flex-col z-50 animate-fade-up"
          data-ocid="chat.panel"
        >
          <div
            className="text-white px-4 py-3 rounded-t-2xl flex items-center justify-between"
            style={{ background: "linear-gradient(135deg,#1e3a8a,#312e81)" }}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span className="font-semibold text-sm">AI Care Assistant</span>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="hover:opacity-75"
              data-ocid="chat.close_button"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2">
            {messages.map((m) => (
              <div key={m.ts} className="space-y-1">
                <div
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm animate-chat-bubble ${m.role === "user" ? "bg-gradient-to-br from-[#1e3a8a] to-[#4f46e5] text-white rounded-br-sm" : "bg-white/90 text-gray-800 border border-gray-200 rounded-bl-sm"}`}
                  >
                    {m.text.split("\n").map((line, li) => (
                      // biome-ignore lint/suspicious/noArrayIndexKey: static split index
                      <p key={li} className={li > 0 ? "mt-1" : ""}>
                        {line}
                      </p>
                    ))}
                    <p
                      className={`text-xs mt-1 opacity-60 ${m.role === "user" ? "text-right" : ""}`}
                    >
                      {new Date(m.ts).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
                {/* Provider chips */}
                {m.providers && m.providers.length > 0 && (
                  <div className="flex flex-wrap gap-1 pl-2">
                    {m.providers.map((pid) => {
                      const allPs = Object.values(CITY_PROVIDERS).flat();
                      const prov = allPs.find((p) => p.id === pid);
                      if (!prov) return null;
                      return (
                        <button
                          key={pid}
                          type="button"
                          onClick={() => {
                            onOpenProvider(prov);
                            setOpen(false);
                          }}
                          className="text-xs px-2 py-1 bg-[#1e3a8a]/10 hover:bg-[#1e3a8a]/20 text-[#1e3a8a] rounded-full border border-[#1e3a8a]/20 font-medium transition-colors"
                          data-ocid="chat.provider.button"
                        >
                          📍 {prov.name}
                        </button>
                      );
                    })}
                  </div>
                )}
                {/* Quick replies */}
                {m.role === "ai" &&
                  m.quickReplies &&
                  messages[messages.length - 1]?.ts === m.ts && (
                    <div className="flex flex-wrap gap-1 pl-2">
                      {m.quickReplies.map((qr) => (
                        <button
                          key={qr}
                          type="button"
                          onClick={() => sendMessage(qr)}
                          className="text-xs px-2.5 py-1 bg-white border border-gray-200 hover:border-[#1e3a8a] hover:text-[#1e3a8a] text-gray-600 rounded-full transition-colors"
                          data-ocid="chat.quick_reply.button"
                        >
                          {qr}
                        </button>
                      ))}
                    </div>
                  )}
              </div>
            ))}
            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white/90 border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="p-3 border-t flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Ask about providers..."
              className="flex-1 text-sm"
              data-ocid="chat.input"
            />
            <Button
              size="sm"
              className="bg-[#1E3A8A] hover:bg-[#1e40af] px-3"
              onClick={() => sendMessage()}
              data-ocid="chat.submit_button"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

// ── Provider Contact Panel ─────────────────────────────────────────────────────
function ProviderContactPanel({
  provider,
  capacityState,
}: {
  provider: import("@/data/mockData").CityProvider;
  capacityState: Record<string, { total: number; booked: number }>;
}) {
  const {
    submitCallbackRequest,
    logInteraction,
    submitContactFeedback,
    getProviderCallbacks,
    interactions,
  } = useContactContext();

  const contact = PROVIDER_CONTACTS[provider.id];

  // Calculate booking load for this provider
  const bookingLoad = useMemo(() => {
    const entries = Object.entries(capacityState).filter(([key]) =>
      key.startsWith(provider.id),
    );
    if (entries.length === 0) return 0;
    const avg =
      entries.reduce((sum, [, v]) => sum + (v.booked / v.total) * 100, 0) /
      entries.length;
    return Math.round(avg);
  }, [capacityState, provider.id]);

  const intelligence = useMemo(() => {
    if (!contact) return null;
    return deriveContactIntelligence(contact, bookingLoad);
  }, [contact, bookingLoad]);

  // AI Call Assist state
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<string | undefined>(
    undefined,
  );

  // Callback form state
  const [showCallbackForm, setShowCallbackForm] = useState(false);
  const [callbackForm, setCallbackForm] = useState({
    userName: "Alex Chen",
    userPhone: "",
    preferredDate: "",
    preferredTimeSlot: "",
    topic: "",
    service: "",
  });
  const [callbackSuccess, setCallbackSuccess] = useState(false);
  const [callbackError, setCallbackError] = useState("");

  // Feedback state per interaction
  const [feedbackFor, setFeedbackFor] = useState<string | null>(null);
  const [feedbackForm, setFeedbackForm] = useState<{
    resolved: boolean | null;
    rating: number;
    comment: string;
  }>({ resolved: null, rating: 0, comment: "" });
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);

  const providerCallbacks = getProviderCallbacks(provider.id);
  // Use live context state for interactions to pick up newly-logged entries
  const liveInteractions = interactions.filter(
    (i) => i.providerId === provider.id,
  );

  function handleCallProvider() {
    logInteraction({
      providerId: provider.id,
      providerName: provider.name,
      type: "call",
      topic: selectedTopicId
        ? (CALL_TOPICS.find((t) => t.id === selectedTopicId)?.label ??
          "General")
        : "General",
      service: selectedService,
      outcome: "pending",
    });
    if (contact) {
      window.location.href = `tel:${contact.phone.replace(/\s/g, "")}`;
    }
  }

  function handleSubmitCallback() {
    setCallbackError("");
    if (!callbackForm.preferredDate) {
      setCallbackError("Please select a preferred date.");
      return;
    }
    if (!callbackForm.preferredTimeSlot) {
      setCallbackError("Please select a preferred time slot.");
      return;
    }
    if (!callbackForm.topic) {
      setCallbackError("Please select a topic.");
      return;
    }
    if (!callbackForm.userName.trim()) {
      setCallbackError("Please enter your name.");
      return;
    }
    submitCallbackRequest({
      providerId: provider.id,
      providerName: provider.name,
      userName: callbackForm.userName,
      userPhone: callbackForm.userPhone || undefined,
      preferredDate: callbackForm.preferredDate,
      preferredTimeSlot: callbackForm.preferredTimeSlot,
      topic: callbackForm.topic,
      service: callbackForm.service || undefined,
    });
    setCallbackSuccess(true);
  }

  function handleSubmitFeedback(interactionId: string) {
    if (feedbackForm.resolved === null) return;
    submitContactFeedback({
      interactionId,
      providerId: provider.id,
      resolved: feedbackForm.resolved,
      rating: feedbackForm.rating,
      comment: feedbackForm.comment,
    });
    setFeedbackSuccess(interactionId);
    setFeedbackFor(null);
    setFeedbackForm({ resolved: null, rating: 0, comment: "" });
  }

  function relativeTime(ts: number): string {
    const diffMs = Date.now() - ts;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    const diffDays = Math.floor(diffHrs / 24);
    return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
  }

  const selectedTopic = CALL_TOPICS.find((t) => t.id === selectedTopicId);
  const callSummary = selectedTopicId
    ? generateCallSummary(provider.name, selectedTopicId, selectedService)
    : null;

  const availabilityColors = {
    available: "bg-green-100 text-green-700 border-green-200",
    busy: "bg-amber-100 text-amber-700 border-amber-200",
    closed: "bg-red-100 text-red-700 border-red-200",
  };

  const statusDot = {
    available: "bg-green-500",
    busy: "bg-amber-500",
    closed: "bg-red-500",
  };

  return (
    <div className="space-y-4" data-ocid="provider.contact.panel">
      {/* ── Section 1: Contact Details ───────────────────────────────────── */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div
          className="px-4 py-3 flex items-center gap-2"
          style={{ background: "linear-gradient(90deg,#EFF6FF,#DBEAFE)" }}
        >
          <Phone className="h-4 w-4 text-blue-700" />
          <h3 className="text-sm font-semibold text-blue-800">
            Contact Details
          </h3>
        </div>
        <div className="p-4">
          {!contact ? (
            <p className="text-sm text-gray-400 italic">
              Contact information not available for this provider.
            </p>
          ) : (
            <div className="space-y-3">
              {/* Phone */}
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-gray-400 shrink-0" />
                <span className="text-sm text-gray-700 flex-1">
                  {contact.phone}
                </span>
                <a
                  href={`tel:${contact.phone.replace(/\s/g, "")}`}
                  onClick={() =>
                    logInteraction({
                      providerId: provider.id,
                      providerName: provider.name,
                      type: "call",
                      topic: "General",
                      outcome: "pending",
                    })
                  }
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-xs rounded-full font-medium hover:bg-blue-700 transition-colors"
                  data-ocid="provider.contact.call_button"
                >
                  <Phone className="h-3 w-3" />
                  Call
                </a>
              </div>
              {/* Email */}
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-gray-400 shrink-0" />
                <span className="text-sm text-gray-700 flex-1 break-all">
                  {contact.email}
                </span>
                <a
                  href={`mailto:${contact.email}`}
                  onClick={() =>
                    logInteraction({
                      providerId: provider.id,
                      providerName: provider.name,
                      type: "email",
                      topic: "General Enquiry",
                      outcome: "pending",
                    })
                  }
                  className="inline-flex items-center gap-1 px-3 py-1 bg-amber-500 text-white text-xs rounded-full font-medium hover:bg-amber-600 transition-colors"
                  data-ocid="provider.contact.email_button"
                >
                  <Mail className="h-3 w-3" />
                  Email
                </a>
              </div>
              {/* Address */}
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                <span className="text-sm text-gray-600">{contact.address}</span>
              </div>
              {/* Operating info */}
              <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                <Clock className="h-4 w-4 text-gray-400 shrink-0" />
                <span className="text-xs text-gray-500">
                  {contact.operatingDays} · {contact.operatingHours}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Section 2: Smart Contact Insights ───────────────────────────── */}
      {intelligence && (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div
            className="px-4 py-3 flex items-center gap-2"
            style={{ background: "linear-gradient(90deg,#EFF6FF,#DBEAFE)" }}
          >
            <Sparkles className="h-4 w-4 text-blue-700" />
            <h3 className="text-sm font-semibold text-blue-800">
              Smart Contact Insights
            </h3>
          </div>
          <div className="p-4 space-y-3">
            {/* Availability badge */}
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${availabilityColors[intelligence.availabilityStatus]}`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${statusDot[intelligence.availabilityStatus]}`}
                />
                {intelligence.availabilityLabel}
              </span>
            </div>
            {/* Response time */}
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Clock className="h-4 w-4 text-blue-500 shrink-0" />
              <span>
                Responds within{" "}
                <strong>{intelligence.responseTimeLabel}</strong>
              </span>
            </div>
            {/* Response rate */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Response rate</span>
                <span className="font-semibold text-gray-800">
                  {intelligence.responseRate}%
                </span>
              </div>
              <Progress value={intelligence.responseRate} className="h-2" />
            </div>
          </div>
        </div>
      )}

      {/* ── Section 3: Best Time to Contact ─────────────────────────────── */}
      {intelligence && (
        <div className="rounded-xl border border-blue-100 bg-blue-50 shadow-sm p-4 flex gap-3">
          <Clock className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-800">
              Best time to contact: {intelligence.bestTimeLabel}
            </p>
            <p className="text-xs text-blue-600 mt-0.5">
              {intelligence.bestTimeRationale}
            </p>
          </div>
        </div>
      )}

      {/* ── Section 4: AI Call Assist ────────────────────────────────────── */}
      <div className="rounded-xl border border-indigo-100 bg-white shadow-sm overflow-hidden">
        <div
          className="px-4 py-3 flex items-center gap-2"
          style={{ background: "linear-gradient(90deg,#EEF2FF,#E0E7FF)" }}
        >
          <Bot className="h-4 w-4 text-indigo-600" />
          <h3 className="text-sm font-semibold text-indigo-800">
            AI Call Assist
          </h3>
        </div>
        <div className="p-4 space-y-3">
          <p className="text-sm text-gray-600">What do you want to discuss?</p>
          {/* Topic chips */}
          <div className="flex flex-wrap gap-2">
            {CALL_TOPICS.map((topic) => (
              <button
                key={topic.id}
                type="button"
                onClick={() =>
                  setSelectedTopicId(
                    selectedTopicId === topic.id ? null : topic.id,
                  )
                }
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  selectedTopicId === topic.id
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                    : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600"
                }`}
                data-ocid="provider.contact.topic.toggle"
              >
                <span>{topic.icon}</span>
                {topic.label}
              </button>
            ))}
          </div>

          {/* Service selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Service (optional):</span>
            <select
              className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-400"
              value={selectedService ?? ""}
              onChange={(e) => setSelectedService(e.target.value || undefined)}
            >
              <option value="">Any service</option>
              {[
                "General Care",
                "Physiotherapy",
                "Medication Review",
                "Home Care",
                "Mental Health Support",
              ].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Generated summary */}
          {callSummary && (
            <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3">
              <p className="text-xs font-medium text-indigo-700 mb-1 flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Call Prep Summary
              </p>
              <p className="text-sm text-indigo-800 leading-relaxed">
                {callSummary}
              </p>
            </div>
          )}

          {/* Call button */}
          {contact && (
            <button
              type="button"
              onClick={handleCallProvider}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors"
              data-ocid="provider.contact.ai_call_button"
            >
              <Phone className="h-4 w-4" />
              Call Provider
              {selectedTopic && (
                <span className="opacity-80 text-xs">
                  · {selectedTopic.label}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* ── Section 5: Direct Action Buttons ────────────────────────────── */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div
          className="px-4 py-3 flex items-center gap-2"
          style={{ background: "linear-gradient(90deg,#EFF6FF,#DBEAFE)" }}
        >
          <PhoneCall className="h-4 w-4 text-blue-700" />
          <h3 className="text-sm font-semibold text-blue-800">
            Direct Contact
          </h3>
        </div>
        <div className="p-4 grid grid-cols-3 gap-2">
          {contact ? (
            <a
              href={`tel:${contact.phone.replace(/\s/g, "")}`}
              onClick={() =>
                logInteraction({
                  providerId: provider.id,
                  providerName: provider.name,
                  type: "call",
                  topic: "Direct Call",
                  outcome: "pending",
                })
              }
              className="flex flex-col items-center gap-1.5 px-3 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-xs transition-all hover:shadow-md text-center"
              data-ocid="provider.contact.direct_call_button"
            >
              <Phone className="h-5 w-5" />
              Call Provider
            </a>
          ) : (
            <button
              type="button"
              disabled
              className="flex flex-col items-center gap-1.5 px-3 py-3 bg-gray-200 text-gray-400 rounded-xl font-medium text-xs text-center cursor-not-allowed"
            >
              <Phone className="h-5 w-5" />
              Call Provider
            </button>
          )}

          {contact ? (
            <a
              href={`mailto:${contact.email}`}
              onClick={() =>
                logInteraction({
                  providerId: provider.id,
                  providerName: provider.name,
                  type: "email",
                  topic: "Direct Email",
                  outcome: "pending",
                })
              }
              className="flex flex-col items-center gap-1.5 px-3 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium text-xs transition-all hover:shadow-md text-center"
              data-ocid="provider.contact.direct_email_button"
            >
              <Mail className="h-5 w-5" />
              Email Provider
            </a>
          ) : (
            <button
              type="button"
              disabled
              className="flex flex-col items-center gap-1.5 px-3 py-3 bg-gray-200 text-gray-400 rounded-xl font-medium text-xs text-center cursor-not-allowed"
            >
              <Mail className="h-5 w-5" />
              Email Provider
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setShowCallbackForm(!showCallbackForm);
              setCallbackSuccess(false);
              setCallbackError("");
            }}
            className={`flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl font-medium text-xs transition-all hover:shadow-md text-center ${showCallbackForm ? "bg-green-700 text-white" : "bg-green-600 hover:bg-green-700 text-white"}`}
            data-ocid="provider.contact.callback_button"
          >
            <Calendar className="h-5 w-5" />
            Request Callback
          </button>
        </div>
      </div>

      {/* ── Section 6: Callback Request Form ────────────────────────────── */}
      {showCallbackForm && (
        <div className="rounded-xl border border-green-200 bg-white shadow-sm overflow-hidden">
          <div
            className="px-4 py-3 flex items-center gap-2"
            style={{ background: "linear-gradient(90deg,#F0FDF4,#DCFCE7)" }}
          >
            <Calendar className="h-4 w-4 text-green-700" />
            <h3 className="text-sm font-semibold text-green-800">
              Request a Callback
            </h3>
          </div>
          <div className="p-4 space-y-3">
            {callbackSuccess ? (
              <div className="flex flex-col items-center gap-2 py-4 text-center">
                <CheckCircle className="h-10 w-10 text-green-500" />
                <p className="font-semibold text-green-700">
                  Callback Requested!
                </p>
                <p className="text-sm text-gray-500">
                  Status:{" "}
                  <span className="font-medium text-amber-600">Pending</span>
                </p>
                <p className="text-xs text-gray-400">
                  {provider.name} will contact you at your preferred time.
                </p>
              </div>
            ) : (
              <>
                {callbackError && (
                  <div className="p-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">
                    {callbackError}
                  </div>
                )}
                {/* Name */}
                <div>
                  <span className="block text-xs font-medium text-gray-600 mb-1">
                    Your Name *
                  </span>
                  <input
                    type="text"
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                    value={callbackForm.userName}
                    onChange={(e) =>
                      setCallbackForm((p) => ({
                        ...p,
                        userName: e.target.value,
                      }))
                    }
                    data-ocid="provider.contact.callback_name.input"
                  />
                </div>
                {/* Phone */}
                <div>
                  <span className="block text-xs font-medium text-gray-600 mb-1">
                    Your Phone (optional)
                  </span>
                  <input
                    type="tel"
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                    placeholder="04XX XXX XXX"
                    value={callbackForm.userPhone}
                    onChange={(e) =>
                      setCallbackForm((p) => ({
                        ...p,
                        userPhone: e.target.value,
                      }))
                    }
                    data-ocid="provider.contact.callback_phone.input"
                  />
                </div>
                {/* Date */}
                <div>
                  <span className="block text-xs font-medium text-gray-600 mb-1">
                    Preferred Date *
                  </span>
                  <input
                    type="date"
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                    value={callbackForm.preferredDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) =>
                      setCallbackForm((p) => ({
                        ...p,
                        preferredDate: e.target.value,
                      }))
                    }
                    data-ocid="provider.contact.callback_date.input"
                  />
                </div>
                {/* Time slot */}
                <div>
                  <span className="block text-xs font-medium text-gray-600 mb-1">
                    Preferred Time Slot *
                  </span>
                  <select
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-green-400"
                    value={callbackForm.preferredTimeSlot}
                    onChange={(e) =>
                      setCallbackForm((p) => ({
                        ...p,
                        preferredTimeSlot: e.target.value,
                      }))
                    }
                    data-ocid="provider.contact.callback_slot.select"
                  >
                    <option value="">Select time slot...</option>
                    <option>Morning (8am–12pm)</option>
                    <option>Afternoon (12pm–4pm)</option>
                    <option>Late Afternoon (4pm–6pm)</option>
                  </select>
                </div>
                {/* Topic */}
                <div>
                  <span className="block text-xs font-medium text-gray-600 mb-1">
                    Topic *
                  </span>
                  <select
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-green-400"
                    value={callbackForm.topic}
                    onChange={(e) =>
                      setCallbackForm((p) => ({ ...p, topic: e.target.value }))
                    }
                    data-ocid="provider.contact.callback_topic.select"
                  >
                    <option value="">Select topic...</option>
                    {CALL_TOPICS.map((t) => (
                      <option key={t.id} value={t.label}>
                        {t.icon} {t.label}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Service */}
                <div>
                  <span className="block text-xs font-medium text-gray-600 mb-1">
                    Service (optional)
                  </span>
                  <select
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-green-400"
                    value={callbackForm.service}
                    onChange={(e) =>
                      setCallbackForm((p) => ({
                        ...p,
                        service: e.target.value,
                      }))
                    }
                    data-ocid="provider.contact.callback_service.select"
                  >
                    <option value="">Any service</option>
                    {[
                      "General Care",
                      "Physiotherapy",
                      "Medication Review",
                      "Home Care",
                      "Mental Health Support",
                    ].map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={handleSubmitCallback}
                  className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium text-sm transition-colors"
                  data-ocid="provider.contact.callback_submit.button"
                >
                  Request Callback
                </button>
              </>
            )}

            {/* Existing callbacks for this provider */}
            {providerCallbacks.length > 0 && !callbackSuccess && (
              <div className="pt-3 border-t border-gray-100">
                <p className="text-xs font-medium text-gray-500 mb-2">
                  Your existing requests:
                </p>
                <div className="space-y-1.5">
                  {providerCallbacks.slice(0, 3).map((cb) => (
                    <div
                      key={cb.id}
                      className="flex items-center justify-between text-xs bg-gray-50 rounded-lg px-3 py-2"
                      data-ocid="provider.contact.callback.item"
                    >
                      <span className="text-gray-600">
                        {cb.preferredDate} ·{" "}
                        {cb.preferredTimeSlot.split(" ")[0]}
                      </span>
                      <span
                        className={`font-medium px-2 py-0.5 rounded-full ${
                          cb.status === "Pending"
                            ? "bg-amber-100 text-amber-700"
                            : cb.status === "Accepted"
                              ? "bg-green-100 text-green-700"
                              : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {cb.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Section 7 & 8: Contact History + Feedback ───────────────────── */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div
          className="px-4 py-3 flex items-center gap-2"
          style={{ background: "linear-gradient(90deg,#EFF6FF,#DBEAFE)" }}
        >
          <History className="h-4 w-4 text-blue-700" />
          <h3 className="text-sm font-semibold text-blue-800">
            Contact History
          </h3>
          {liveInteractions.length > 0 && (
            <span className="ml-auto text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
              {liveInteractions.length}
            </span>
          )}
        </div>
        <div className="p-4">
          {liveInteractions.length === 0 ? (
            <div
              className="text-center py-6 text-gray-400 text-sm"
              data-ocid="provider.contact.history.empty_state"
            >
              <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-30" />
              No contact history yet
            </div>
          ) : (
            <div className="space-y-3">
              {liveInteractions.map((interaction, idx) => {
                const isLeavingFeedback = feedbackFor === interaction.id;
                const alreadySucceeded = feedbackSuccess === interaction.id;
                return (
                  <div
                    key={interaction.id}
                    className="border border-gray-100 rounded-xl p-3 space-y-2"
                    data-ocid={`provider.contact.history.item.${idx + 1}`}
                  >
                    <div className="flex items-center gap-2">
                      {interaction.type === "call" ? (
                        <Phone className="h-4 w-4 text-blue-500 shrink-0" />
                      ) : interaction.type === "email" ? (
                        <Mail className="h-4 w-4 text-amber-500 shrink-0" />
                      ) : (
                        <PhoneCall className="h-4 w-4 text-green-500 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 capitalize">
                          {interaction.type} · {interaction.topic}
                        </p>
                        {interaction.service && (
                          <p className="text-xs text-gray-500">
                            {interaction.service}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-gray-400">
                          {relativeTime(interaction.createdAt)}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            interaction.outcome === "resolved"
                              ? "bg-green-100 text-green-700"
                              : interaction.outcome === "unresolved"
                                ? "bg-red-100 text-red-700"
                                : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {interaction.outcome === "resolved"
                            ? "Resolved"
                            : interaction.outcome === "unresolved"
                              ? "Unresolved"
                              : "Pending"}
                        </span>
                      </div>
                    </div>

                    {/* Feedback button / form */}
                    {alreadySucceeded ? (
                      <p className="text-xs text-green-600 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Thank you for your feedback!
                      </p>
                    ) : !interaction.feedbackSubmitted &&
                      interaction.outcome !== "pending" ? (
                      isLeavingFeedback ? (
                        <div className="bg-gray-50 rounded-lg p-3 space-y-2 border border-gray-100">
                          {/* Resolved toggle */}
                          <div className="flex gap-2 items-center">
                            <span className="text-xs text-gray-600">
                              Was your issue resolved?
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setFeedbackForm((p) => ({
                                  ...p,
                                  resolved: true,
                                }))
                              }
                              className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${feedbackForm.resolved === true ? "bg-green-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-green-400"}`}
                              data-ocid="provider.contact.feedback.yes_button"
                            >
                              <ThumbsUp className="h-3 w-3" />
                              Yes
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setFeedbackForm((p) => ({
                                  ...p,
                                  resolved: false,
                                }))
                              }
                              className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${feedbackForm.resolved === false ? "bg-red-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-red-400"}`}
                              data-ocid="provider.contact.feedback.no_button"
                            >
                              <ThumbsDown className="h-3 w-3" />
                              No
                            </button>
                          </div>
                          {/* Star rating */}
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-600">
                              Rating:
                            </span>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((i) => (
                                <button
                                  key={i}
                                  type="button"
                                  onClick={() =>
                                    setFeedbackForm((p) => ({
                                      ...p,
                                      rating: i,
                                    }))
                                  }
                                  className="transition-transform hover:scale-110"
                                >
                                  <Star
                                    className={`h-5 w-5 ${i <= feedbackForm.rating ? "fill-amber-400 text-amber-400" : "fill-gray-100 text-gray-300"}`}
                                  />
                                </button>
                              ))}
                            </div>
                          </div>
                          {/* Comment */}
                          <textarea
                            className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400 resize-none"
                            placeholder="Optional comments..."
                            rows={2}
                            value={feedbackForm.comment}
                            onChange={(e) =>
                              setFeedbackForm((p) => ({
                                ...p,
                                comment: e.target.value,
                              }))
                            }
                            data-ocid="provider.contact.feedback.textarea"
                          />
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setFeedbackFor(null)}
                              className="px-3 py-1.5 text-xs text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                              data-ocid="provider.contact.feedback.cancel_button"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              disabled={feedbackForm.resolved === null}
                              onClick={() =>
                                handleSubmitFeedback(interaction.id)
                              }
                              className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              data-ocid="provider.contact.feedback.submit_button"
                            >
                              Submit Feedback
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setFeedbackFor(interaction.id);
                            setFeedbackForm({
                              resolved: null,
                              rating: 0,
                              comment: "",
                            });
                          }}
                          className="text-xs text-blue-600 hover:text-blue-800 underline transition-colors"
                          data-ocid="provider.contact.leave_feedback.button"
                        >
                          Leave Feedback
                        </button>
                      )
                    ) : interaction.feedbackSubmitted ? (
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3 text-green-400" />
                        Feedback submitted
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Provider Detail Modal ─────────────────────────────────────────────────────
function ProviderDetailModal({
  provider,
  quarter,
  onClose,
  onBook,
  reviews,
  onAddReview,
  onEditReview,
  onDeleteReview,
  userRatings,
  capacityState,
}: {
  provider: CityProvider | null;
  quarter: string;
  onClose: () => void;
  onBook: (service: string) => void;
  reviews: Review[];
  onAddReview: (review: Omit<Review, "id" | "isOwn">) => void;
  onEditReview: (id: string, updates: Partial<Review>) => void;
  onDeleteReview: (id: string) => void;
  userRatings: UserRatings;
  capacityState: Record<string, { total: number; booked: number }>;
}) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "trends" | "services" | "reviews" | "contact"
  >("overview");
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewDraft, setReviewDraft] = useState({ rating: 5, comment: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState({ rating: 5, comment: "" });

  const ratingData = useMemo(() => {
    if (!provider) return null;
    return getProviderRatingForQuarter(provider.id, quarter);
  }, [provider, quarter]);

  const trendData = useMemo(() => {
    if (!provider) return [];
    return ALL_QUARTERS.map((q) => ({
      quarter: q.replace("-2025", ""),
      stars: getProviderRatingForQuarter(provider.id, q).stars,
    }));
  }, [provider]);

  if (!provider || !ratingData) return null;

  const risk = getRiskLevel(provider.indicators);
  const alerts = getProviderAlerts(provider.indicators);
  const tags = getBestForTags(provider, ratingData.stars);
  const explanation = generateDynamicExplanation(provider, ratingData.stars);

  const q1Stars = trendData[0]?.stars ?? ratingData.stars;
  const q4Stars = trendData[3]?.stars ?? ratingData.stars;
  const trendStatus =
    q4Stars > q1Stars + 0.1
      ? "improving"
      : q4Stars < q1Stars - 0.1
        ? "declining"
        : "stable";

  // Explainable rating: top 3 positive / negative domains
  const domainEntries = Object.entries(ratingData.domainScores) as [
    string,
    number,
  ][];
  const sortedDomains = [...domainEntries].sort((a, b) => b[1] - a[1]);
  const top3Positive = sortedDomains.slice(0, 3);
  const top3Negative = sortedDomains.slice(-3).reverse();

  const domainLabels: Record<string, string> = {
    safety: "Falls & Safety",
    preventive: "Preventive Screening",
    quality: "Care Quality",
    staffing: "Staffing",
    compliance: "Compliance",
    experience: "Resident Experience",
  };

  const avgReviewRating =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;

  const trust = calcTrustScore(
    ratingData.stars,
    ratingData.domainScores.safety,
    ratingData.domainScores.compliance,
    avgReviewRating,
    q4Stars - q1Stars,
  );
  const outcome = calcOutcomePrediction(ratingData);

  // User feedback boost
  const userRating = userRatings[provider.id];
  const blendedStars = userRating
    ? (ratingData.stars * 10 + userRating.overall) / 11
    : ratingData.stars;

  const domainBars = [
    {
      name: "Safety",
      value: Math.round(ratingData.domainScores.safety),
      color: "#1E3A8A",
    },
    {
      name: "Preventive",
      value: Math.round(ratingData.domainScores.preventive),
      color: "#3B82F6",
    },
    {
      name: "Quality",
      value: Math.round(ratingData.domainScores.quality),
      color: "#16A34A",
    },
    {
      name: "Staffing",
      value: Math.round(ratingData.domainScores.staffing),
      color: "#F59E0B",
    },
    {
      name: "Compliance",
      value: Math.round(ratingData.domainScores.compliance),
      color: "#8B5CF6",
    },
    {
      name: "Experience",
      value: Math.round(ratingData.domainScores.experience),
      color: "#EC4899",
    },
  ];

  function handleAddReview() {
    onAddReview({
      author: "You",
      rating: reviewDraft.rating,
      comment: reviewDraft.comment,
      timestamp: Date.now(),
    });
    setReviewDraft({ rating: 5, comment: "" });
    setShowReviewForm(false);
  }

  function handleEditSave(id: string) {
    onEditReview(id, editDraft);
    setEditingId(null);
  }

  return (
    <Dialog open={!!provider} onOpenChange={onClose}>
      <DialogContent
        className="max-w-3xl max-h-[90vh] overflow-y-auto p-0"
        data-ocid="provider.modal"
      >
        <div className="animate-modal-up">
          {/* Header */}
          <div
            className="sticky top-0 bg-white border-b px-6 py-4 z-10"
            style={{
              background:
                "linear-gradient(135deg,rgba(255,255,255,0.97),rgba(248,250,252,0.97))",
            }}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-bold text-gray-900">
                    {provider.name}
                  </h2>
                  <div
                    title={`Trust Score: ${trust.score}/100 — Based on ratings, safety, compliance, reviews and improvement trend`}
                    className="flex items-center gap-1.5 cursor-help"
                  >
                    <TrustScoreRing
                      score={trust.score}
                      ringColor={trust.ringColor}
                      size={40}
                    />
                    <span
                      className={`text-xs font-semibold ${trust.colorClass}`}
                    >
                      {trust.label}
                    </span>
                  </div>
                  {tags.map((t) => (
                    <span
                      key={t.label}
                      className={`text-xs px-2 py-0.5 rounded-full font-medium border ${t.cls}`}
                    >
                      {t.label}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex items-center gap-1">
                    {renderStars(blendedStars, "h-5 w-5")}
                    <span className="font-bold text-gray-900 ml-1">
                      {blendedStars.toFixed(1)}
                    </span>
                    <span className="text-gray-400 text-sm">/5</span>
                  </div>
                  <span className="text-gray-300">|</span>
                  <span
                    className={`text-sm font-medium ${risk === "Low" ? "text-green-600" : risk === "Medium" ? "text-amber-600" : "text-red-600"}`}
                  >
                    {risk} Risk
                  </span>
                  <span className="text-gray-300">|</span>
                  <span className="text-sm text-gray-500">
                    {provider.city} · {provider.type}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
                data-ocid="provider.close_button"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {/* Tabs */}
            <div className="flex gap-1 mt-3">
              {(
                [
                  "overview",
                  "trends",
                  "services",
                  "reviews",
                  "contact",
                ] as const
              ).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  data-ocid={`provider.${tab}.tab`}
                  className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors capitalize ${activeTab === tab ? "bg-[#1E3A8A] text-white" : "text-gray-600 hover:bg-gray-100"}`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 space-y-5">
            {activeTab === "overview" && (
              <>
                {/* Smart Alerts */}
                {alerts.length > 0 && (
                  <div
                    className="space-y-2"
                    data-ocid="provider.alerts.section"
                  >
                    <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                      <Bell className="h-4 w-4" /> Safety Alerts
                    </h3>
                    {alerts.map((a) => (
                      <div
                        key={a.text}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${a.color === "red" ? "bg-red-50 text-red-700 border border-red-200" : "bg-amber-50 text-amber-700 border border-amber-200"}`}
                      >
                        <AlertTriangle className="h-4 w-4 shrink-0" />
                        {a.text}
                      </div>
                    ))}
                  </div>
                )}

                {/* Why This Rating */}
                <div className="bg-[#F8FAFC] rounded-xl p-4 border">
                  <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-1 mb-3">
                    <Info className="h-4 w-4 text-[#1E3A8A]" /> Why This Rating?
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">{explanation}</p>
                  <div className="grid grid-cols-1 gap-2">
                    <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">
                      Top Performing Areas
                    </p>
                    {top3Positive.map(([domain, score]) => (
                      <div
                        key={domain}
                        className="flex items-center justify-between bg-green-50 rounded-lg px-3 py-2"
                      >
                        <span className="text-sm font-medium text-gray-700">
                          {domainLabels[domain] ?? domain}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 bg-gray-200 rounded-full w-20">
                            <div
                              className="h-1.5 bg-green-500 rounded-full"
                              style={{ width: `${score}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-green-700">
                            {score.toFixed(0)}/100
                          </span>
                          <span className="text-xs px-1.5 py-0.5 bg-green-100 text-green-700 rounded font-medium">
                            Better
                          </span>
                        </div>
                      </div>
                    ))}
                    <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mt-1">
                      Areas for Improvement
                    </p>
                    {top3Negative.map(([domain, score]) => (
                      <div
                        key={domain}
                        className="flex items-center justify-between bg-amber-50 rounded-lg px-3 py-2"
                      >
                        <span className="text-sm font-medium text-gray-700">
                          {domainLabels[domain] ?? domain}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 bg-gray-200 rounded-full w-20">
                            <div
                              className="h-1.5 bg-amber-500 rounded-full"
                              style={{ width: `${score}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-amber-700">
                            {score.toFixed(0)}/100
                          </span>
                          <span className="text-xs px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded font-medium">
                            {score < 60 ? "Needs Work" : "Monitor"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Domain Progress Bars */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">
                    Performance by Domain
                  </h3>
                  <div className="space-y-2">
                    {domainBars.map((d) => (
                      <div key={d.name} className="flex items-center gap-3">
                        <span className="text-sm text-gray-600 w-24 shrink-0">
                          {d.name}
                        </span>
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${d.value}%`,
                              backgroundColor: d.color,
                            }}
                          />
                        </div>
                        <span className="text-xs font-bold text-gray-700 w-10 text-right">
                          {d.value}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Outcome Prediction Score */}
                <div
                  className="bg-gradient-to-br from-[#1E3A8A]/5 to-[#3B82F6]/5 rounded-xl p-4 border border-[#3B82F6]/20"
                  data-ocid="provider.outcome.card"
                >
                  <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-1 mb-3">
                    <Zap className="h-4 w-4 text-[#1E3A8A]" /> Outcome
                    Prediction Score
                    <span
                      title="Calculated from: Safety (30%), Resident Experience (25%), Care Quality (20%), Preventive Care (15%), Compliance (10%)"
                      className="ml-1 cursor-help"
                    >
                      <Info className="h-3.5 w-3.5 text-gray-400" />
                    </span>
                  </h3>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-black text-[#1E3A8A]">
                        {outcome.score}%
                      </div>
                      <div
                        className={`text-xs font-semibold mt-0.5 ${outcome.confidenceColor}`}
                      >
                        {outcome.confidence}
                      </div>
                    </div>
                    <div className="flex-1">
                      <Progress value={outcome.score} className="h-3 mb-1" />
                      <p className="text-xs text-gray-600">
                        This provider has a{" "}
                        <strong>{outcome.score}% predicted success rate</strong>{" "}
                        for similar care cases based on historical domain
                        performance.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === "trends" && (
              <>
                {/* Trend badge */}
                <div className="flex items-center gap-3">
                  <h3 className="text-sm font-semibold text-gray-700">
                    Performance Trend (Q1–Q4 2025)
                  </h3>
                  <span
                    className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
                      trendStatus === "improving"
                        ? "bg-green-100 text-green-700"
                        : trendStatus === "declining"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {trendStatus === "improving" ? (
                      <>
                        <TrendingUp className="h-3 w-3" /> 📈 Improving
                      </>
                    ) : trendStatus === "declining" ? (
                      <>
                        <TrendingDown className="h-3 w-3" /> 📉 Declining
                      </>
                    ) : (
                      <>➡ Stable</>
                    )}
                  </span>
                </div>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                      <XAxis dataKey="quarter" tick={{ fontSize: 11 }} />
                      <YAxis domain={[1, 5]} tick={{ fontSize: 11 }} />
                      <Tooltip
                        formatter={(v: number) => [
                          `${v.toFixed(2)}⭐`,
                          "Rating",
                        ]}
                      />
                      <Line
                        type="monotone"
                        dataKey="stars"
                        stroke="#1E3A8A"
                        strokeWidth={2.5}
                        dot={{ fill: "#1E3A8A", r: 5 }}
                        activeDot={{ r: 7 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {trendData.map((d) => (
                    <div
                      key={d.quarter}
                      className="bg-[#F8FAFC] rounded-lg p-3 text-center border"
                    >
                      <p className="text-xs text-gray-500">{d.quarter}</p>
                      <p className="text-lg font-bold text-[#1E3A8A]">
                        {d.stars.toFixed(1)}
                      </p>
                      <div className="flex justify-center">
                        {renderStars(d.stars, "h-3 w-3")}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {activeTab === "services" && (
              <>
                <h3 className="text-sm font-semibold text-gray-700">
                  Available Services
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {SERVICES.map((s) => {
                    const capKey = `${provider.id}-${s.name}`;
                    const cap = capacityState[capKey] ?? {
                      total: 12,
                      booked: 0,
                    };
                    const isFullyBooked = cap.total - cap.booked <= 0;
                    return (
                      <div
                        key={s.name}
                        className="glass-card hover-glow rounded-xl p-4"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0"
                            style={{
                              background:
                                "linear-gradient(135deg,#dbeafe,#ede9fe)",
                            }}
                          >
                            {s.icon}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">
                              {s.name}
                            </p>
                            <p className="text-sm text-gray-600">
                              {s.description}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              <Clock className="h-3 w-3 inline mr-1" />
                              {s.availability}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-[#1e3a8a] to-[#4f46e5] hover:opacity-90 text-white shrink-0 btn-press"
                            onClick={() => onBook(s.name)}
                            disabled={isFullyBooked}
                            data-ocid="service.book_button"
                          >
                            {isFullyBooked ? "Full" : "Book"}
                          </Button>
                        </div>
                        <CapacityIndicator
                          providerId={provider.id}
                          serviceName={s.name}
                          capacityState={capacityState}
                        />
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {activeTab === "reviews" && (
              <>
                {/* Aggregate rating */}
                <div className="bg-[#F8FAFC] rounded-xl p-4 border flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-[#1E3A8A]">
                      {avgReviewRating.toFixed(1)}
                    </p>
                    <div className="flex justify-center mt-1">
                      {renderStars(avgReviewRating, "h-4 w-4")}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {reviews.length} review{reviews.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="flex-1">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = reviews.filter(
                        (r) => r.rating === star,
                      ).length;
                      return (
                        <div
                          key={star}
                          className="flex items-center gap-2 mb-1"
                        >
                          <span className="text-xs text-gray-500 w-3">
                            {star}
                          </span>
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          <div className="flex-1 h-1.5 bg-gray-200 rounded-full">
                            <div
                              className="h-full bg-amber-400 rounded-full"
                              style={{
                                width: reviews.length
                                  ? `${(count / reviews.length) * 100}%`
                                  : "0%",
                              }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 w-4">
                            {count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Review list */}
                <div className="space-y-3">
                  {reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="bg-white rounded-xl border p-4"
                    >
                      {editingId === rev.id ? (
                        <div className="space-y-3">
                          <StarPicker
                            value={editDraft.rating}
                            onChange={(v) =>
                              setEditDraft({ ...editDraft, rating: v })
                            }
                          />
                          <Textarea
                            value={editDraft.comment}
                            onChange={(e) =>
                              setEditDraft({
                                ...editDraft,
                                comment: e.target.value,
                              })
                            }
                            rows={2}
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingId(null)}
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              className="bg-[#1E3A8A]"
                              onClick={() => handleEditSave(rev.id)}
                              data-ocid="review.save_button"
                            >
                              Save
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="font-semibold text-sm text-gray-900">
                                {rev.author}
                              </span>
                              <div className="flex items-center gap-1 mt-0.5">
                                {renderStars(rev.rating, "h-3.5 w-3.5")}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-400">
                                {new Date(rev.timestamp).toLocaleDateString(
                                  "en-AU",
                                )}
                              </span>
                              {rev.isOwn && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingId(rev.id);
                                      setEditDraft({
                                        rating: rev.rating,
                                        comment: rev.comment,
                                      });
                                    }}
                                    className="text-gray-400 hover:text-[#1E3A8A]"
                                    data-ocid="review.edit_button"
                                  >
                                    <Edit2 className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => onDeleteReview(rev.id)}
                                    className="text-gray-400 hover:text-red-500"
                                    data-ocid="review.delete_button"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mt-2">
                            {rev.comment}
                          </p>
                        </>
                      )}
                    </div>
                  ))}
                </div>

                {/* Write review */}
                {!showReviewForm ? (
                  <Button
                    variant="outline"
                    className="w-full border-[#1E3A8A] text-[#1E3A8A]"
                    onClick={() => setShowReviewForm(true)}
                    data-ocid="review.open_modal_button"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" /> Write a Review
                  </Button>
                ) : (
                  <div
                    className="bg-[#F8FAFC] rounded-xl p-4 border space-y-3"
                    data-ocid="review.modal"
                  >
                    <h4 className="font-semibold text-gray-900">Your Review</h4>
                    <StarPicker
                      value={reviewDraft.rating}
                      onChange={(v) =>
                        setReviewDraft({ ...reviewDraft, rating: v })
                      }
                      label="Your Rating"
                    />
                    <Textarea
                      placeholder="Share your experience with this provider..."
                      value={reviewDraft.comment}
                      onChange={(e) =>
                        setReviewDraft({
                          ...reviewDraft,
                          comment: e.target.value,
                        })
                      }
                      rows={3}
                      data-ocid="review.textarea"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowReviewForm(false)}
                        data-ocid="review.cancel_button"
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        className="bg-[#1E3A8A] hover:bg-[#1e40af]"
                        disabled={!reviewDraft.comment.trim()}
                        onClick={handleAddReview}
                        data-ocid="review.submit_button"
                      >
                        Submit Review
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}

            {activeTab === "contact" && (
              <ProviderContactPanel
                provider={provider}
                capacityState={capacityState}
              />
            )}
          </div>
        </div>
        {/* /animate-modal-up */}
      </DialogContent>
    </Dialog>
  );
}

// ── Provider Card ─────────────────────────────────────────────────────────────
function ProviderCard({
  provider,
  quarter,
  isInCompare,
  onCompareToggle,
  onViewDetails,
  index,
}: {
  provider: CityProvider;
  quarter: string;
  isInCompare: boolean;
  onCompareToggle: () => void;
  onViewDetails: () => void;
  index: number;
}) {
  const ratingData = useMemo(
    () => getProviderRatingForQuarter(provider.id, quarter),
    [provider.id, quarter],
  );
  const risk = getRiskLevel(provider.indicators);
  const alerts = getProviderAlerts(provider.indicators);
  const tags = getBestForTags(provider, ratingData.stars);
  const perfTags = getPerformanceTags(provider);
  const q1Stars = getProviderRatingForQuarter(provider.id, "Q1-2025").stars;
  const q4Stars = getProviderRatingForQuarter(provider.id, "Q4-2025").stars;
  const trust = calcTrustScore(
    ratingData.stars,
    ratingData.domainScores.safety,
    ratingData.domainScores.compliance,
    0,
    q4Stars - q1Stars,
  );
  const outcome = calcOutcomePrediction(ratingData);

  const staggerClass = `animate-fade-up-${(index % 6) + 1}`;
  return (
    <Card
      className={`group relative overflow-hidden glass-card hover-glow rounded-2xl ${staggerClass}`}
      data-ocid={`provider.item.${index + 1}`}
    >
      <div
        className="absolute inset-x-0 top-0 h-1 rounded-t-2xl"
        style={{ background: "linear-gradient(90deg,#3b82f6,#6366f1)" }}
      />
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 text-sm leading-tight truncate">
              {provider.name}
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
              <span className="text-xs text-gray-500">
                <MapPin className="h-3 w-3 inline" /> {provider.city}
              </span>
              <span className="text-xs text-gray-400">·</span>
              <span className="text-xs text-gray-500">{provider.type}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <input
              type="checkbox"
              checked={isInCompare}
              onChange={onCompareToggle}
              className="h-3.5 w-3.5 accent-[#1E3A8A]"
              title="Compare"
              data-ocid={`provider.compare.${index + 1}.checkbox`}
            />
            <span className="text-xs text-gray-400">Compare</span>
          </div>
        </div>

        {/* Stars + Trust Ring */}
        <div className="flex items-center gap-2 mb-2">
          {renderStars(ratingData.stars, "h-4 w-4")}
          <span className="font-bold text-sm text-gray-900">
            {ratingData.stars.toFixed(1)}
          </span>
          <div
            title={`Trust Score: ${trust.score}/100`}
            className="flex items-center gap-1 cursor-help ml-1"
          >
            <TrustScoreRing
              score={trust.score}
              ringColor={trust.ringColor}
              size={32}
            />
          </div>
          <span className={`text-xs font-semibold ${trust.colorClass}`}>
            {trust.label}
          </span>
        </div>

        {/* Best For Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {tags.map((t) => (
              <span
                key={t.label}
                className={`text-xs px-1.5 py-0.5 rounded-full border font-medium ${t.cls}`}
              >
                {t.label}
              </span>
            ))}
          </div>
        )}

        {/* Performance tags */}
        {perfTags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {perfTags.map((t) => (
              <span
                key={t}
                className="text-xs px-1.5 py-0.5 rounded-full bg-[#F8FAFC] text-gray-600 border"
              >
                {t}
              </span>
            ))}
          </div>
        )}

        {/* Smart Alerts */}
        {alerts.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {alerts.map((a) => (
              <span
                key={a.text}
                className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${a.color === "red" ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-700"}`}
              >
                {a.text}
              </span>
            ))}
          </div>
        )}

        {/* Indicator bars */}
        <div className="space-y-1.5 mb-3">
          {[
            { label: "Safety", value: provider.indicators.safetyClinical },
            { label: "Screening", value: provider.indicators.preventiveCare },
            { label: "Satisfaction", value: provider.indicators.experience },
          ].map((ind) => (
            <div key={ind.label} className="flex items-center gap-2">
              <span className="text-xs text-gray-500 w-16 shrink-0">
                {ind.label}
              </span>
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(ind.value / 5) * 100}%`,
                    backgroundColor:
                      ind.value >= 4
                        ? "#16A34A"
                        : ind.value >= 3
                          ? "#F59E0B"
                          : "#DC2626",
                  }}
                />
              </div>
              <span className="text-xs font-medium text-gray-600 w-6 text-right">
                {ind.value.toFixed(1)}
              </span>
            </div>
          ))}
        </div>

        {/* Outcome Prediction mini */}
        <div className="flex items-center gap-2 mb-2 text-xs text-gray-500">
          <Zap className="h-3 w-3 text-[#1E3A8A]" />
          <span
            title="Outcome Prediction Score — weighted from domain performance"
            className="cursor-help"
          >
            <span className="font-semibold text-[#1E3A8A]">
              {outcome.score}%
            </span>{" "}
            success rate ·{" "}
            <span className={outcome.confidenceColor}>
              {outcome.confidence}
            </span>
          </span>
        </div>

        {index === 0 && (
          <div className="mb-2 flex">
            <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-gradient-to-r from-amber-400 to-orange-400 text-white">
              ⭐ Top Recommended
            </span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${risk === "Low" ? "badge-gradient-green" : risk === "Medium" ? "badge-gradient-amber" : "badge-gradient-red"}`}
          >
            {risk} Risk
          </span>
          <Button
            size="sm"
            variant="ghost"
            className="text-[#1E3A8A] hover:text-[#1e40af] hover:bg-blue-50 text-xs h-7 px-2"
            onClick={onViewDetails}
            data-ocid={`provider.view_button.${index + 1}`}
          >
            View Details <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Comparison Panel ──────────────────────────────────────────────────────────
function ComparisonPanel({
  providerIds,
  allProviders,
  quarter,
  onClose,
}: {
  providerIds: string[];
  allProviders: CityProvider[];
  quarter: string;
  onClose: () => void;
}) {
  const providers = providerIds
    .map((id) => allProviders.find((p) => p.id === id))
    .filter(Boolean) as CityProvider[];
  if (providers.length < 2) return null;

  const ratings = providers.map((p) =>
    getProviderRatingForQuarter(p.id, quarter),
  );

  const trendData = ALL_QUARTERS.map((q) => {
    const row: Record<string, string | number> = {
      quarter: q.replace("-2025", ""),
    };
    for (const p of providers) {
      row[p.name] = getProviderRatingForQuarter(p.id, q).stars;
    }
    return row;
  });

  const barData = [
    "Safety",
    "Preventive",
    "Quality",
    "Staffing",
    "Compliance",
    "Experience",
  ].map((domain) => {
    const key =
      domain.toLowerCase() as keyof (typeof ratings)[0]["domainScores"];
    const row: Record<string, string | number> = { domain };
    for (let i = 0; i < providers.length; i++) {
      row[providers[i].name] = Math.round(ratings[i].domainScores[key] ?? 0);
    }
    return row;
  });

  const radarData = [
    "safety",
    "preventive",
    "quality",
    "staffing",
    "compliance",
    "experience",
  ].map((key) => {
    const row: Record<string, string | number> = {
      domain: key.charAt(0).toUpperCase() + key.slice(0, 5),
    };
    for (let i = 0; i < providers.length; i++) {
      row[providers[i].name] = Math.round(
        ratings[i].domainScores[
          key as keyof (typeof ratings)[0]["domainScores"]
        ] ?? 0,
      );
    }
    return row;
  });

  const COLORS = ["#1E3A8A", "#16A34A", "#DC2626"];

  return (
    <div className="glass-card rounded-2xl p-5" data-ocid="compare.panel">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <BarChart2 className="h-5 w-5 text-[#1E3A8A]" /> Provider Comparison
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
          data-ocid="compare.close_button"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5">
        {providers.map((p, i) => {
          const r = ratings[i];
          const risk = getRiskLevel(p.indicators);
          return (
            <div
              key={p.id}
              className="bg-[#F8FAFC] rounded-xl p-3 border-2"
              style={{ borderColor: COLORS[i] }}
            >
              <p className="font-bold text-sm text-gray-900 truncate">
                {p.name}
              </p>
              <div className="flex items-center gap-1 mt-1">
                {renderStars(r.stars, "h-3.5 w-3.5")}
                <span className="text-sm font-bold text-gray-800 ml-1">
                  {r.stars.toFixed(1)}
                </span>
              </div>
              <span
                className={`text-xs font-medium ${risk === "Low" ? "text-green-600" : risk === "Medium" ? "text-amber-600" : "text-red-600"}`}
              >
                {risk} Risk
              </span>
            </div>
          );
        })}
      </div>

      {/* Bar chart */}
      <div className="mb-5">
        <p className="text-sm font-semibold text-gray-700 mb-2">
          Domain Scores Comparison
        </p>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} barGap={4}>
              <XAxis dataKey="domain" tick={{ fontSize: 10 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {providers.map((p, i) => (
                <Bar
                  key={p.id}
                  dataKey={p.name}
                  fill={COLORS[i]}
                  radius={[3, 3, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Radar chart */}
      <div className="mb-5">
        <p className="text-sm font-semibold text-gray-700 mb-2">
          Performance Radar
        </p>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="domain" tick={{ fontSize: 10 }} />
              {providers.map((p, i) => (
                <Radar
                  key={p.id}
                  name={p.name}
                  dataKey={p.name}
                  stroke={COLORS[i]}
                  fill={COLORS[i]}
                  fillOpacity={0.2}
                />
              ))}
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Trend lines */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-2">
          Rating Trend Q1–Q4 2025
        </p>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <XAxis dataKey="quarter" tick={{ fontSize: 10 }} />
              <YAxis domain={[1, 5]} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {providers.map((p, i) => (
                <Line
                  key={p.id}
                  dataKey={p.name}
                  stroke={COLORS[i]}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function PublicView({
  currentQuarter = "Q4-2025",
}: { currentQuarter?: string }) {
  // Core state
  const [isLoading, setIsLoading] = useState(false);
  const [syncBanner, setSyncBanner] = useState(false);
  const [selectedCity, setSelectedCity] = useState("Sydney");
  const [searchText, setSearchText] = useState("");
  const [filterRating, setFilterRating] = useState("all");
  const [filterRisk, setFilterRisk] = useState("all");
  const [filterService, setFilterService] = useState("all");
  const [careNeeds, setCareNeeds] = useState("General Care");
  const [selectedProvider, setSelectedProvider] = useState<CityProvider | null>(
    null,
  );
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const [nearMeMsg, setNearMeMsg] = useState(false);

  // Reviews
  const seedReviews = useMemo(() => initReviews(), []);
  const [reviews, setReviews] = useState<Record<string, Review[]>>(seedReviews);

  // Bookings — sourced from BookingContext (single source of truth)
  const bookingCtx = useBookingContext();
  const {
    bookings: ctxBookings,
    ratingOverrides,
    createBooking: ctxCreateBooking,
    markComplete: ctxMarkComplete,
    submitRating: ctxSubmitRating,
  } = bookingCtx;

  // Local view bookings (only the ones created via this component's wizard)
  const [localBookings, setLocalBookings] = useState<Booking[]>([]);
  // merged view: context bookings + local internal-status bookings (confirmed/in_progress)
  const bookings = [
    ...localBookings,
    ...ctxBookings
      .filter((b) => !localBookings.some((lb) => lb.id === b.id))
      .map((b) => ({
        id: b.id,
        providerId: b.providerId,
        providerName: b.providerName,
        service: b.service,
        date: b.date,
        time: b.time,
        userName: b.userName,
        userPhone: b.userPhone,
        status: (b.status === "Booked"
          ? "confirmed"
          : b.status === "Completed"
            ? "completed"
            : "cancelled") as BookingStatus,
        feedbackSubmitted: b.feedbackSubmitted,
      })),
  ];

  const [bookingModal, setBookingModal] = useState<{
    provider: CityProvider;
    service: string;
  } | null>(null);
  const [feedbackModal, setFeedbackModal] = useState<{
    booking: Booking;
  } | null>(null);
  const [feedbackImpact, setFeedbackImpact] = useState<{
    name: string;
    pct: number;
  } | null>(null);
  const [userRatings, setUserRatings] = useState<UserRatings>({});

  // Apply ratingOverrides to displayed scores
  function getDisplayRating(providerId: string, quarter: string) {
    const base = getProviderRatingForQuarter(providerId, quarter);
    const override = ratingOverrides[providerId];
    if (!override) return base;
    return {
      ...base,
      stars: override.overallStars,
      domainScores: {
        ...base.domainScores,
        safety: override.safetyScore / 20,
        quality: override.qualityScore / 20,
        experience: override.experienceScore / 20,
      },
    };
  }
  // Use getDisplayRating instead of getProviderRatingForQuarter where scores are displayed
  void getDisplayRating; // prevent unused variable warning

  const SERVICES_LIST = [
    "General Care",
    "Physiotherapy",
    "Medication Review",
    "Home Care",
    "Mental Health Support",
  ];
  const [capacityState, setCapacityState] = useState<
    Record<string, { total: number; booked: number }>
  >(() => {
    const init: Record<string, { total: number; booked: number }> = {};
    for (const [, providers] of Object.entries(CITY_PROVIDERS)) {
      for (const p of providers) {
        for (let i = 0; i < SERVICES_LIST.length; i++) {
          const key = `${p.id}-${SERVICES_LIST[i]}`;
          init[key] = {
            total: 10 + ((p.id.length + i) % 11),
            booked: Math.floor((p.id.length * i) % 8),
          };
        }
      }
    }
    return init;
  });

  // Providers in city
  // biome-ignore lint/correctness/useExhaustiveDependencies: trigger skeleton on city change
  useEffect(() => {
    setIsLoading(true);
    const t = setTimeout(() => setIsLoading(false), 420);
    return () => clearTimeout(t);
  }, [selectedCity]);

  const cityProviders = useMemo(
    () => CITY_PROVIDERS[selectedCity] || [],
    [selectedCity],
  );

  // Filtered providers
  const filteredProviders = useMemo(() => {
    return cityProviders
      .filter((p) => {
        const rating = getProviderRatingForQuarter(p.id, currentQuarter);
        const risk = getRiskLevel(p.indicators);

        if (
          searchText &&
          !p.name.toLowerCase().includes(searchText.toLowerCase())
        )
          return false;

        if (filterRating === "5") {
          if (rating.stars < 4.5) return false;
        } else if (filterRating === "4+") {
          if (rating.stars < 4.0) return false;
        } else if (filterRating === "3+") {
          if (rating.stars < 3.0) return false;
        }

        if (filterRisk !== "all" && risk.toLowerCase() !== filterRisk)
          return false;
        if (
          filterService !== "all" &&
          p.type.toLowerCase() !== filterService.toLowerCase()
        )
          return false;

        return true;
      })
      .sort((a, b) => {
        const ra = getProviderRatingForQuarter(a.id, currentQuarter);
        const rb = getProviderRatingForQuarter(b.id, currentQuarter);
        const riskScore = (p: CityProvider) => {
          const risk = getRiskLevel(p.indicators);
          return risk === "Low" ? 100 : risk === "Medium" ? 60 : 20;
        };
        const availScore = (p: CityProvider) => {
          const key = `${p.id}-General Care`;
          const cap = capacityState[key] ?? { total: 12, booked: 0 };
          return cap.total > 0
            ? Math.round(((cap.total - cap.booked) / cap.total) * 100)
            : 0;
        };
        const feedbackScore = (p: CityProvider) => {
          const ur = userRatings[p.id];
          return ur ? (ur.overall / 5) * 100 : 50;
        };
        const scoreA =
          (ra.stars / 5) * 100 * 0.4 +
          riskScore(a) * 0.3 +
          availScore(a) * 0.2 +
          feedbackScore(a) * 0.1;
        const scoreB =
          (rb.stars / 5) * 100 * 0.4 +
          riskScore(b) * 0.3 +
          availScore(b) * 0.2 +
          feedbackScore(b) * 0.1;
        return scoreB - scoreA;
      });
  }, [
    cityProviders,
    searchText,
    filterRating,
    filterRisk,
    filterService,
    currentQuarter,
    capacityState,
    userRatings,
  ]);

  // Recommendations
  const recommendations = useMemo(() => {
    return [...cityProviders]
      .sort(
        (a, b) =>
          getProviderRatingForQuarter(b.id, currentQuarter).stars -
          getProviderRatingForQuarter(a.id, currentQuarter).stars,
      )
      .slice(0, 3)
      .map((p) => ({
        provider: p,
        rating: getProviderRatingForQuarter(p.id, currentQuarter),
      }));
  }, [cityProviders, currentQuarter]);

  // KPI stats
  const kpiStats = useMemo(() => {
    const all = cityProviders.map((p) => ({
      stars: getProviderRatingForQuarter(p.id, currentQuarter).stars,
      risk: getRiskLevel(p.indicators),
    }));
    const avg = all.reduce((s, p) => s + p.stars, 0) / (all.length || 1);
    return {
      total: all.length,
      avg: avg.toFixed(1),
      highRisk: all.filter((p) => p.risk === "High").length,
      trusted: all.filter((p) => p.stars >= 4.0).length,
    };
  }, [cityProviders, currentQuarter]);

  function handleNearMe() {
    setSelectedCity("Sydney");
    setNearMeMsg(true);
    setTimeout(() => setNearMeMsg(false), 3000);
  }

  function handleToggleCompare(id: string) {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  }

  function handleBook(service: string) {
    if (!selectedProvider) return;
    setBookingModal({ provider: selectedProvider, service });
  }

  function handleBookingConfirm(
    booking: Omit<Booking, "id" | "status" | "feedbackSubmitted">,
  ) {
    const newBooking: Booking = {
      ...booking,
      id: `B-${Date.now()}`,
      status: "confirmed",
      feedbackSubmitted: false,
    };
    setLocalBookings((prev) => [...prev, newBooking]);
    // Also store in context for cross-page visibility
    ctxCreateBooking({
      ...booking,
      userId: "guest_user",
      address: "—",
      status: "Booked",
      feedbackSubmitted: false,
    });
    // Decrease capacity
    const capKey = `${booking.providerId}-${booking.service}`;
    setCapacityState((prev) => {
      const cur = prev[capKey] ?? { total: 12, booked: 0 };
      return {
        ...prev,
        [capKey]: { ...cur, booked: Math.min(cur.booked + 1, cur.total) },
      };
    });
    setBookingModal(null);
  }

  function handleMarkComplete(id: string) {
    const booking = bookings.find((b) => b.id === id);
    if (!booking) return;
    if (booking.status === "confirmed") {
      setLocalBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: "in_progress" } : b)),
      );
    } else if (booking.status === "in_progress") {
      setLocalBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: "completed" } : b)),
      );
      // Mark in context for cross-page sync
      ctxMarkComplete(id);
      setFeedbackModal({ booking: { ...booking, status: "completed" } });
    }
  }

  function handleFeedbackSubmit(bookingId: string, data: FeedbackData) {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    const oldRating = getProviderRatingForQuarter(
      booking.providerId,
      currentQuarter,
    ).stars;
    const existingUserRating = userRatings[booking.providerId];
    const oldBlended = existingUserRating
      ? (oldRating * 10 +
          existingUserRating.overall * existingUserRating.count) /
        (10 + existingUserRating.count)
      : oldRating;
    const newCount = (existingUserRating?.count ?? 0) + 1;
    const newBlended = (oldBlended * (newCount - 1) + data.overall) / newCount;
    const pct = Math.max(0.1, Math.abs(newBlended - oldBlended) * 100);

    setUserRatings((prev) => ({
      ...prev,
      [booking.providerId]: { ...data, count: newCount },
    }));
    setLocalBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId ? { ...b, feedbackSubmitted: true } : b,
      ),
    );

    // Sync rating to context (updates ALL modules via applyRatingOverride)
    const ctxData: CtxFeedbackData = {
      overall: data.overall,
      safety: data.safety,
      quality: data.quality,
      experience: data.experience,
      preventive: data.preventive,
      comment: data.comment,
    };
    ctxSubmitRating(
      bookingId,
      booking.providerId,
      booking.providerName,
      ctxData,
    );

    setFeedbackModal(null);
    setFeedbackImpact({ name: booking.providerName, pct });
    setTimeout(() => setFeedbackImpact(null), 5000);
    setSyncBanner(true);
    setTimeout(() => setSyncBanner(false), 3500);

    // Add as review
    if (data.comment.trim()) {
      setReviews((prev) => ({
        ...prev,
        [booking.providerId]: [
          ...(prev[booking.providerId] ?? []),
          {
            id: `${booking.providerId}-user-${Date.now()}`,
            author: booking.userName,
            rating: data.overall,
            comment: data.comment,
            timestamp: Date.now(),
            isOwn: true,
          },
        ],
      }));
    }
  }

  function handleAddReview(
    providerId: string,
    review: Omit<Review, "id" | "isOwn">,
  ) {
    setReviews((prev) => ({
      ...prev,
      [providerId]: [
        ...(prev[providerId] ?? []),
        { ...review, id: `${providerId}-r-${Date.now()}`, isOwn: true },
      ],
    }));
  }

  function handleEditReview(
    providerId: string,
    id: string,
    updates: Partial<Review>,
  ) {
    setReviews((prev) => ({
      ...prev,
      [providerId]: (prev[providerId] ?? []).map((r) =>
        r.id === id ? { ...r, ...updates } : r,
      ),
    }));
  }

  function handleDeleteReview(providerId: string, id: string) {
    setReviews((prev) => ({
      ...prev,
      [providerId]: (prev[providerId] ?? []).filter((r) => r.id !== id),
    }));
  }

  const pendingFeedback = bookings.filter(
    (b) => b.status === "completed" && !b.feedbackSubmitted,
  );

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          "linear-gradient(160deg,#0f172a 0%,#1e3a8a 45%,#312e81 100%)",
      }}
    >
      {/* Hero Band */}
      <div
        className="relative overflow-hidden text-white"
        style={{
          background:
            "linear-gradient(135deg,#0f172a 0%,#1e3a8a 50%,#312e81 100%)",
        }}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle,#93c5fd 1px,transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="max-w-7xl mx-auto px-4 py-8 relative">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-blue-200 font-medium">
                    Australian Government
                  </span>
                  <span className="text-blue-300">·</span>
                  <span className="text-xs text-blue-200">
                    Department of Health and Aged Care
                  </span>
                </div>
                <h1 className="text-xl font-bold tracking-tight">
                  Aged Care Provider Finder
                </h1>
                <p className="text-sm text-blue-200 mt-0.5">
                  Find and compare quality aged care providers in your area
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-1.5">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs">Live Data · {currentQuarter}</span>
              </div>
              <div className="bg-white/10 rounded-lg px-3 py-1.5">
                <span className="text-xs text-blue-200">
                  Public Transparency Platform
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Feedback Impact Banner */}
        {feedbackImpact && (
          <div
            className="animate-sync rounded-xl px-5 py-3 flex items-center justify-between shadow-lg"
            style={{
              background:
                "linear-gradient(135deg,rgba(220,252,231,0.95),rgba(187,247,208,0.95))",
              border: "1px solid #86efac",
            }}
            data-ocid="feedback.success_state"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <ThumbsUp className="h-4 w-4 text-green-600" />
              </div>
              <p className="text-sm font-semibold text-green-800">
                🎉 Your feedback improved{" "}
                <span className="font-bold">{feedbackImpact.name}</span>'s score
                by{" "}
                <span className="font-bold text-green-700">
                  +{feedbackImpact.pct.toFixed(1)}%
                </span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => setFeedbackImpact(null)}
              className="text-green-600 hover:text-green-800"
              data-ocid="feedback.close_button"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Pending Feedback Notification */}
        {pendingFeedback.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-amber-600" />
              <p className="text-sm text-amber-800">
                <span className="font-semibold">
                  Please rate your experience
                </span>{" "}
                — You have {pendingFeedback.length} completed appointment
                {pendingFeedback.length > 1 ? "s" : ""} awaiting feedback
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="border-amber-400 text-amber-700 hover:bg-amber-100"
              onClick={() => setFeedbackModal({ booking: pendingFeedback[0] })}
              data-ocid="feedback.open_modal_button"
            >
              Rate Now
            </Button>
          </div>
        )}

        {/* Smart Recommendation Engine */}
        <div className="glass-card rounded-2xl p-5 animate-fade-up">
          <div className="flex items-center gap-2 mb-4">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#dbeafe,#ede9fe)" }}
            >
              <Sparkles className="h-4 w-4 text-[#1E3A8A]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">
                Smart Provider Recommendation Engine
              </h2>
              <p className="text-xs text-gray-500">
                Powered by AI · Based on real performance data
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 mb-4">
            <div className="flex-1 min-w-[140px]">
              <Label className="text-xs text-gray-500 mb-1 block">
                Your Location
              </Label>
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger
                  className="h-9"
                  data-ocid="recommendation.city.select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CITY_LIST.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-[140px]">
              <Label className="text-xs text-gray-500 mb-1 block">
                Care Needs
              </Label>
              <Select value={careNeeds} onValueChange={setCareNeeds}>
                <SelectTrigger
                  className="h-9"
                  data-ocid="recommendation.care.select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CARE_NEEDS.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {recommendations.length > 0 && (
            <>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                👉 Top Recommended Providers
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {recommendations.map(({ provider, rating }, i) => {
                  const reason = generateRecommendationReason(
                    provider,
                    rating.domainScores,
                  );
                  const topDomains = (
                    Object.entries(rating.domainScores) as [string, number][]
                  )
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 2)
                    .map(
                      ([k]) =>
                        ({
                          safety: "Safety",
                          preventive: "Preventive",
                          quality: "Quality",
                          staffing: "Staffing",
                          compliance: "Compliance",
                          experience: "Experience",
                        })[k] ?? k,
                    );
                  return (
                    <button
                      key={provider.id}
                      type="button"
                      className="bg-gradient-to-br from-[#1E3A8A]/5 to-[#3B82F6]/5 rounded-xl p-4 border border-[#3B82F6]/20 cursor-pointer hover:shadow-md transition-all text-left w-full"
                      onClick={() => setSelectedProvider(provider)}
                      data-ocid={`recommendation.item.${i + 1}`}
                    >
                      {i === 0 && (
                        <div className="text-xs font-bold text-[#1E3A8A] mb-1">
                          🥇 Best Match
                        </div>
                      )}
                      {i === 1 && (
                        <div className="text-xs font-bold text-[#3B82F6] mb-1">
                          🥈 Runner Up
                        </div>
                      )}
                      {i === 2 && (
                        <div className="text-xs font-bold text-gray-600 mb-1">
                          🥉 3rd Choice
                        </div>
                      )}
                      <p className="font-bold text-sm text-gray-900">
                        {provider.name}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        {renderStars(rating.stars, "h-3.5 w-3.5")}
                        <span className="text-xs font-bold text-gray-800 ml-1">
                          {rating.stars.toFixed(1)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-2">{reason}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {topDomains.map((d) => (
                          <span
                            key={d}
                            className="text-xs px-1.5 py-0.5 bg-white rounded border text-[#1E3A8A] font-medium"
                          >
                            {d}
                          </span>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: "Providers in Area",
              value: kpiStats.total.toString(),
              icon: Building2,
              color: "text-[#1E3A8A]",
              bg: "bg-[#1E3A8A]/10",
            },
            {
              label: "Average Rating",
              value: `${kpiStats.avg}⭐`,
              icon: Star,
              color: "text-amber-600",
              bg: "bg-amber-50",
            },
            {
              label: "High Risk Providers",
              value: kpiStats.highRisk.toString(),
              icon: AlertTriangle,
              color: "text-red-600",
              bg: "bg-red-50",
            },
            {
              label: "Trusted Providers",
              value: kpiStats.trusted.toString(),
              icon: ShieldCheck,
              color: "text-green-600",
              bg: "bg-green-50",
            },
          ].map((kpi, i) => (
            <Card
              key={kpi.label}
              className="glass-card hover-glow rounded-2xl"
              data-ocid={`kpi.item.${i + 1}`}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div
                  className={`w-10 h-10 ${kpi.bg} rounded-xl flex items-center justify-center shrink-0`}
                >
                  <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900">{kpi.value}</p>
                  <p className="text-xs text-gray-500">{kpi.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filter Bar */}
        <div className="glass-card rounded-2xl p-4">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[200px]">
              <Label className="text-xs text-gray-500 mb-1 block">
                Search Providers
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="pl-9 h-9"
                  data-ocid="filter.search_input"
                />
              </div>
            </div>
            <div className="min-w-[120px]">
              <Label className="text-xs text-gray-500 mb-1 block">Rating</Label>
              <Select value={filterRating} onValueChange={setFilterRating}>
                <SelectTrigger className="h-9" data-ocid="filter.rating.select">
                  <SelectValue placeholder="All Ratings" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="5">5 Stars</SelectItem>
                  <SelectItem value="4+">4+ Stars</SelectItem>
                  <SelectItem value="3+">3+ Stars</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="min-w-[120px]">
              <Label className="text-xs text-gray-500 mb-1 block">
                Risk Level
              </Label>
              <Select value={filterRisk} onValueChange={setFilterRisk}>
                <SelectTrigger className="h-9" data-ocid="filter.risk.select">
                  <SelectValue placeholder="All Risk" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Risk Levels</SelectItem>
                  <SelectItem value="low">Low Risk</SelectItem>
                  <SelectItem value="medium">Medium Risk</SelectItem>
                  <SelectItem value="high">High Risk</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="min-w-[130px]">
              <Label className="text-xs text-gray-500 mb-1 block">
                Service Type
              </Label>
              <Select value={filterService} onValueChange={setFilterService}>
                <SelectTrigger
                  className="h-9"
                  data-ocid="filter.service.select"
                >
                  <SelectValue placeholder="All Services" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Services</SelectItem>
                  <SelectItem value="Residential">Residential</SelectItem>
                  <SelectItem value="Home Care">Home Care</SelectItem>
                  <SelectItem value="Day Care">Day Care</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="outline"
              className="h-9 border-[#1E3A8A] text-[#1E3A8A] hover:bg-[#1E3A8A]/5"
              onClick={handleNearMe}
              data-ocid="filter.near_me_button"
            >
              <MapPin className="h-4 w-4 mr-1" /> Near Me
            </Button>
            {(searchText ||
              filterRating !== "all" ||
              filterRisk !== "all" ||
              filterService !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                className="h-9 text-gray-500"
                onClick={() => {
                  setSearchText("");
                  setFilterRating("all");
                  setFilterRisk("all");
                  setFilterService("all");
                }}
                data-ocid="filter.clear_button"
              >
                <X className="h-3.5 w-3.5 mr-1" /> Clear
              </Button>
            )}
          </div>
          {nearMeMsg && (
            <div className="mt-3 flex items-center gap-2 text-sm text-[#1E3A8A] bg-[#1E3A8A]/5 rounded-lg px-3 py-2">
              <MapPin className="h-4 w-4" /> Showing providers near Sydney
            </div>
          )}
        </div>

        {/* Care Journey Tracker */}
        {bookings.length > 0 && (
          <CareJourneyTracker
            bookings={bookings}
            onMarkComplete={handleMarkComplete}
            onFeedback={(b) => setFeedbackModal({ booking: b })}
          />
        )}

        {/* Provider Grid */}
        <div>
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <h2 className="text-base font-bold text-white/90">
              Providers in {selectedCity}
              <span className="ml-2 text-sm font-normal text-white/50">
                ({filteredProviders.length} found)
              </span>
            </h2>
            {compareIds.length >= 2 && (
              <Button
                className="bg-gradient-to-r from-[#1e3a8a] to-[#4f46e5] hover:opacity-90 text-white h-8 text-sm btn-press"
                onClick={() => setShowCompare(true)}
                data-ocid="compare.open_modal_button"
              >
                <BarChart2 className="h-4 w-4 mr-1" /> Compare{" "}
                {compareIds.length} Providers
              </Button>
            )}
          </div>

          {syncBanner && (
            <div
              className="animate-sync flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white shadow-lg mb-3"
              style={{ background: "linear-gradient(90deg,#2563eb,#4f46e5)" }}
            >
              <CheckCircle className="h-4 w-4 shrink-0" /> ✓ Synced across all
              modules — provider rating updated in real time
            </div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 6 }).map((_, si) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: skeleton positions
                <div key={si} className="glass-card rounded-2xl p-5 space-y-3">
                  <div className="skeleton-shimmer h-5 w-3/4" />
                  <div className="skeleton-shimmer h-4 w-1/2" />
                  <div className="skeleton-shimmer h-3 w-full" />
                  <div className="skeleton-shimmer h-3 w-4/5" />
                  <div className="skeleton-shimmer h-8 w-24 mt-4" />
                </div>
              ))}
            </div>
          ) : filteredProviders.length === 0 ? (
            <div
              className="glass-card rounded-2xl p-12 text-center"
              data-ocid="provider.empty_state"
            >
              <Search className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">
                No providers match your filters
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Try adjusting your search criteria
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProviders.map((provider, i) => (
                <ProviderCard
                  key={provider.id}
                  provider={provider}
                  quarter={currentQuarter}
                  isInCompare={compareIds.includes(provider.id)}
                  onCompareToggle={() => handleToggleCompare(provider.id)}
                  onViewDetails={() => setSelectedProvider(provider)}
                  index={i}
                />
              ))}
            </div>
          )}
        </div>

        {/* Comparison Panel */}
        {showCompare && compareIds.length >= 2 && (
          <ComparisonPanel
            providerIds={compareIds}
            allProviders={cityProviders}
            quarter={currentQuarter}
            onClose={() => setShowCompare(false)}
          />
        )}

        {/* Legend */}
        <div className="glass-card rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Info className="h-4 w-4 text-[#1E3A8A]" /> Rating Guide
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              {
                label: "Trusted",
                desc: "4★ and above — consistently high quality",
                cls: "bg-green-100 text-green-700",
              },
              {
                label: "Average",
                desc: "3–4★ — meets most standards",
                cls: "bg-amber-100 text-amber-700",
              },
              {
                label: "Needs Improvement",
                desc: "Below 3★ — under review",
                cls: "bg-red-100 text-red-700",
              },
              {
                label: "Low Risk",
                desc: "All key indicators performing well",
                cls: "bg-blue-100 text-blue-700",
              },
              {
                label: "Medium Risk",
                desc: "Some indicators need monitoring",
                cls: "bg-orange-100 text-orange-700",
              },
              {
                label: "High Risk",
                desc: "Multiple indicators below threshold",
                cls: "bg-red-100 text-red-700",
              },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-2">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${item.cls}`}
                >
                  {item.label}
                </span>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center py-4 text-xs text-white/50">
          © {new Date().getFullYear()}.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white/80"
          >
            Built with ❤️ using caffeine.ai
          </a>
        </footer>
      </div>

      {/* Provider Detail Modal */}
      <ProviderDetailModal
        provider={selectedProvider}
        quarter={currentQuarter}
        onClose={() => setSelectedProvider(null)}
        onBook={handleBook}
        reviews={reviews[selectedProvider?.id ?? ""] ?? []}
        onAddReview={(review) =>
          selectedProvider && handleAddReview(selectedProvider.id, review)
        }
        onEditReview={(id, updates) =>
          selectedProvider && handleEditReview(selectedProvider.id, id, updates)
        }
        onDeleteReview={(id) =>
          selectedProvider && handleDeleteReview(selectedProvider.id, id)
        }
        userRatings={userRatings}
        capacityState={capacityState}
      />

      {/* Booking Modal */}
      {bookingModal && (
        <ServiceBookingModal
          provider={bookingModal.provider}
          service={bookingModal.service}
          onClose={() => setBookingModal(null)}
          onConfirm={handleBookingConfirm}
        />
      )}

      {/* Feedback Modal */}
      {feedbackModal && (
        <FeedbackModal
          booking={feedbackModal.booking}
          onClose={() => setFeedbackModal(null)}
          onSubmit={handleFeedbackSubmit}
        />
      )}

      {/* AI Chatbot */}
      <AIChatbot
        currentCity={selectedCity}
        onCityChange={(c) => {
          setSelectedCity(c);
          setIsLoading(true);
          setTimeout(() => setIsLoading(false), 420);
        }}
        onOpenProvider={(p) => setSelectedProvider(p)}
      />
    </div>
  );
}
