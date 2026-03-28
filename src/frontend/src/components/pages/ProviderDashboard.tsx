import { BenchmarkStatusChip } from "@/components/ui/BenchmarkStatusChip";
import { IncentiveEligibilityBadge } from "@/components/ui/IncentiveEligibilityBadge";
import { StarRating } from "@/components/ui/StarRating";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity,
  AlertTriangle,
  Award,
  BarChart2,
  CheckCircle2,
  ClipboardCheck,
  DollarSign,
  Edit2,
  Save,
  ShieldCheck,
  TrendingUp,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  CartesianGrid,
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
import { toast } from "sonner";
import {
  UNIFIED_PROVIDERS,
  getUnifiedProviderIndicators,
} from "../../data/mockData";
import { getBenchmarkStatus } from "../../utils/benchmarkUtils";
import {
  calcIndicatorPerformanceScore,
  calcPayForImprovementEligibility,
  calcWeightedProviderRating,
  scoreToFractionalStars,
} from "../../utils/ratingEngine";

// ── Provider registry — sourced from central PROVIDER_MASTER ──────────────────
const PROVIDERS = UNIFIED_PROVIDERS;

// ── Indicator definitions ──────────────────────────────────────────────────────
interface IndicatorDef {
  code: string;
  name: string;
  benchmark: number;
  isLowerBetter: boolean;
  unit: string;
  domain:
    | "safety"
    | "preventive"
    | "quality"
    | "staffing"
    | "compliance"
    | "experience";
}

const INDICATOR_DEFS: IndicatorDef[] = [
  {
    code: "SAF-001",
    name: "Falls with Harm Rate",
    benchmark: 5.1,
    isLowerBetter: true,
    unit: "/1000 care days",
    domain: "safety",
  },
  {
    code: "SAF-002",
    name: "Medication-Related Harm",
    benchmark: 3.2,
    isLowerBetter: true,
    unit: "%",
    domain: "safety",
  },
  {
    code: "PRV-001",
    name: "Screening Completion",
    benchmark: 85,
    isLowerBetter: false,
    unit: "%",
    domain: "preventive",
  },
  {
    code: "STF-001",
    name: "Staff Retention",
    benchmark: 82,
    isLowerBetter: false,
    unit: "%",
    domain: "staffing",
  },
  {
    code: "SAF-003",
    name: "Pressure Injuries Stage 2–4",
    benchmark: 2.4,
    isLowerBetter: true,
    unit: "/1000 care days",
    domain: "safety",
  },
  {
    code: "EXP-001",
    name: "Resident Satisfaction",
    benchmark: 78,
    isLowerBetter: false,
    unit: "%",
    domain: "experience",
  },
  {
    code: "QUA-001",
    name: "Care Plan Compliance",
    benchmark: 90,
    isLowerBetter: false,
    unit: "%",
    domain: "quality",
  },
  {
    code: "COM-001",
    name: "Regulatory Compliance Score",
    benchmark: 88,
    isLowerBetter: false,
    unit: "%",
    domain: "compliance",
  },
];

// Maps central indicator data to the 8 INDICATOR_DEFS by code
function getProviderDefaultValues(
  providerId: string,
  quarter = "Q4-2025",
): number[] {
  const inds = getUnifiedProviderIndicators(providerId, quarter);
  const find = (code: string, fallback: number) =>
    inds.find((i) => i.indicatorCode === code)?.rate ?? fallback;
  return [
    find("SAF-001", 4.2), // Falls with Harm Rate
    find("SAF-002", 2.8), // Medication-Related Harm
    find("PRV-001", 87), // Screening Completion (Falls Risk)
    inds.find((i) => i.indicatorCode === "STF-001")?.rate ??
      inds.find((i) => i.dimension === "Staffing")?.rate ??
      84, // Staff Retention
    find("SAF-005", 1.8), // Pressure Injuries Stage 2–4
    inds.find((i) => i.indicatorCode === "QUA-001")?.rate ??
      inds.find((i) => i.dimension === "Quality")?.rate ??
      82, // Resident Satisfaction
    inds.find((i) => i.indicatorCode === "QUA-002")?.rate ??
      inds.filter((i) => i.dimension === "Quality")[1]?.rate ??
      92, // Care Plan Compliance
    inds.find((i) => i.indicatorCode === "COM-001")?.rate ??
      inds.find((i) => i.dimension === "Compliance")?.rate ??
      91, // Regulatory Compliance
  ];
}

function getPrevQuarter(quarter: string): string {
  const map: Record<string, string> = {
    "Q4-2025": "Q3-2025",
    "Q3-2025": "Q2-2025",
    "Q2-2025": "Q1-2025",
    "Q1-2025": "Q4-2025",
  };
  return map[quarter] ?? "Q3-2025";
}

// Quarterly trend data per provider
const TREND_DATA: Record<
  string,
  {
    quarter: string;
    falls: number;
    medication: number;
    screening: number;
    staffing: number;
    satisfaction: number;
  }[]
> = {
  "SYD-001": [
    {
      quarter: "Q1",
      falls: 6.2,
      medication: 3.8,
      screening: 78,
      staffing: 78,
      satisfaction: 72,
    },
    {
      quarter: "Q2",
      falls: 5.6,
      medication: 3.4,
      screening: 81,
      staffing: 80,
      satisfaction: 76,
    },
    {
      quarter: "Q3",
      falls: 4.9,
      medication: 3.1,
      screening: 84,
      staffing: 82,
      satisfaction: 79,
    },
    {
      quarter: "Q4",
      falls: 4.2,
      medication: 2.8,
      screening: 87,
      staffing: 84,
      satisfaction: 82,
    },
  ],
  "MEL-001": [
    {
      quarter: "Q1",
      falls: 7.4,
      medication: 4.5,
      screening: 70,
      staffing: 70,
      satisfaction: 64,
    },
    {
      quarter: "Q2",
      falls: 7.0,
      medication: 4.2,
      screening: 73,
      staffing: 72,
      satisfaction: 67,
    },
    {
      quarter: "Q3",
      falls: 6.5,
      medication: 4.0,
      screening: 76,
      staffing: 74,
      satisfaction: 69,
    },
    {
      quarter: "Q4",
      falls: 6.1,
      medication: 3.8,
      screening: 78,
      staffing: 76,
      satisfaction: 71,
    },
  ],
  "BNE-001": [
    {
      quarter: "Q1",
      falls: 4.8,
      medication: 2.9,
      screening: 86,
      staffing: 84,
      satisfaction: 80,
    },
    {
      quarter: "Q2",
      falls: 4.4,
      medication: 2.7,
      screening: 88,
      staffing: 86,
      satisfaction: 83,
    },
    {
      quarter: "Q3",
      falls: 4.1,
      medication: 2.5,
      screening: 90,
      staffing: 87,
      satisfaction: 85,
    },
    {
      quarter: "Q4",
      falls: 3.9,
      medication: 2.4,
      screening: 91,
      staffing: 88,
      satisfaction: 86,
    },
  ],
  "PER-001": [
    {
      quarter: "Q1",
      falls: 6.8,
      medication: 4.0,
      screening: 74,
      staffing: 73,
      satisfaction: 67,
    },
    {
      quarter: "Q2",
      falls: 6.4,
      medication: 3.8,
      screening: 77,
      staffing: 75,
      satisfaction: 70,
    },
    {
      quarter: "Q3",
      falls: 6.0,
      medication: 3.6,
      screening: 79,
      staffing: 77,
      satisfaction: 72,
    },
    {
      quarter: "Q4",
      falls: 5.6,
      medication: 3.5,
      screening: 82,
      staffing: 79,
      satisfaction: 74,
    },
  ],
  "ADL-001": [
    {
      quarter: "Q1",
      falls: 8.2,
      medication: 4.8,
      screening: 66,
      staffing: 66,
      satisfaction: 60,
    },
    {
      quarter: "Q2",
      falls: 7.9,
      medication: 4.5,
      screening: 68,
      staffing: 68,
      satisfaction: 63,
    },
    {
      quarter: "Q3",
      falls: 7.5,
      medication: 4.3,
      screening: 70,
      staffing: 69,
      satisfaction: 66,
    },
    {
      quarter: "Q4",
      falls: 7.2,
      medication: 4.1,
      screening: 72,
      staffing: 71,
      satisfaction: 68,
    },
  ],
};

// Compliance standards per provider
const COMPLIANCE_DATA: Record<
  string,
  {
    id: number;
    standard: string;
    category: string;
    status: "Compliant" | "At Risk" | "Non-Compliant" | "Pending Review";
    lastAssessed: string;
    notes: string;
  }[]
> = {
  "SYD-001": [
    {
      id: 1,
      standard: "Quality Standard 1 — Consumer Dignity and Choice",
      category: "Aged Care Quality Standards",
      status: "Compliant",
      lastAssessed: "15 Jan 2025",
      notes: "Full compliance achieved",
    },
    {
      id: 2,
      standard: "Quality Standard 2 — Ongoing Assessment and Planning",
      category: "Aged Care Quality Standards",
      status: "Compliant",
      lastAssessed: "15 Jan 2025",
      notes: "Documentation up to date",
    },
    {
      id: 3,
      standard: "Quality Standard 3 — Personal Care and Clinical Care",
      category: "Aged Care Quality Standards",
      status: "Compliant",
      lastAssessed: "10 Jan 2025",
      notes: "Full compliance",
    },
    {
      id: 4,
      standard: "Medication Management Protocol",
      category: "Clinical Standards",
      status: "Compliant",
      lastAssessed: "20 Feb 2025",
      notes: "Pharmacist review completed",
    },
    {
      id: 5,
      standard: "Infection Prevention and Control",
      category: "Clinical Standards",
      status: "Compliant",
      lastAssessed: "05 Feb 2025",
      notes: "IPC audit passed",
    },
    {
      id: 6,
      standard: "Safe Environment and Equipment",
      category: "Safety Standards",
      status: "Compliant",
      lastAssessed: "12 Jan 2025",
      notes: "3-year accreditation granted",
    },
    {
      id: 7,
      standard: "Mandatory Reporting Obligations",
      category: "Regulatory",
      status: "Compliant",
      lastAssessed: "01 Mar 2025",
      notes: "All incidents reported on time",
    },
  ],
  "MEL-001": [
    {
      id: 1,
      standard: "Quality Standard 1 — Consumer Dignity and Choice",
      category: "Aged Care Quality Standards",
      status: "Compliant",
      lastAssessed: "10 Jan 2025",
      notes: "Compliance maintained",
    },
    {
      id: 2,
      standard: "Quality Standard 2 — Ongoing Assessment and Planning",
      category: "Aged Care Quality Standards",
      status: "Pending Review",
      lastAssessed: "15 Oct 2024",
      notes: "Awaiting documentation review",
    },
    {
      id: 3,
      standard: "Quality Standard 3 — Personal Care and Clinical Care",
      category: "Aged Care Quality Standards",
      status: "At Risk",
      lastAssessed: "15 Oct 2024",
      notes: "Clinical audit overdue",
    },
    {
      id: 4,
      standard: "Medication Management Protocol",
      category: "Clinical Standards",
      status: "At Risk",
      lastAssessed: "01 Nov 2024",
      notes: "Review in progress",
    },
    {
      id: 5,
      standard: "Infection Prevention and Control",
      category: "Clinical Standards",
      status: "Compliant",
      lastAssessed: "20 Jan 2025",
      notes: "IPC standards met",
    },
    {
      id: 6,
      standard: "Safe Environment and Equipment",
      category: "Safety Standards",
      status: "Compliant",
      lastAssessed: "10 Dec 2024",
      notes: "Annual inspection passed",
    },
    {
      id: 7,
      standard: "Mandatory Reporting Obligations",
      category: "Regulatory",
      status: "Compliant",
      lastAssessed: "01 Feb 2025",
      notes: "All reports submitted",
    },
  ],
  "BNE-001": [
    {
      id: 1,
      standard: "Quality Standard 1 — Consumer Dignity and Choice",
      category: "Aged Care Quality Standards",
      status: "Compliant",
      lastAssessed: "20 Jan 2025",
      notes: "Excellent compliance",
    },
    {
      id: 2,
      standard: "Quality Standard 2 — Ongoing Assessment and Planning",
      category: "Aged Care Quality Standards",
      status: "Compliant",
      lastAssessed: "20 Jan 2025",
      notes: "Up to date",
    },
    {
      id: 3,
      standard: "Quality Standard 3 — Personal Care and Clinical Care",
      category: "Aged Care Quality Standards",
      status: "Compliant",
      lastAssessed: "20 Jan 2025",
      notes: "Audit passed",
    },
    {
      id: 4,
      standard: "Medication Management Protocol",
      category: "Clinical Standards",
      status: "Compliant",
      lastAssessed: "01 Mar 2025",
      notes: "Zero incidents",
    },
    {
      id: 5,
      standard: "Infection Prevention and Control",
      category: "Clinical Standards",
      status: "Compliant",
      lastAssessed: "15 Feb 2025",
      notes: "Full compliance",
    },
    {
      id: 6,
      standard: "Safe Environment and Equipment",
      category: "Safety Standards",
      status: "Compliant",
      lastAssessed: "10 Jan 2025",
      notes: "Passed inspection",
    },
    {
      id: 7,
      standard: "Mandatory Reporting Obligations",
      category: "Regulatory",
      status: "Compliant",
      lastAssessed: "01 Mar 2025",
      notes: "Timely reporting",
    },
  ],
  "PER-001": [
    {
      id: 1,
      standard: "Quality Standard 1 — Consumer Dignity and Choice",
      category: "Aged Care Quality Standards",
      status: "Compliant",
      lastAssessed: "12 Jan 2025",
      notes: "Compliance achieved",
    },
    {
      id: 2,
      standard: "Quality Standard 2 — Ongoing Assessment and Planning",
      category: "Aged Care Quality Standards",
      status: "Compliant",
      lastAssessed: "12 Jan 2025",
      notes: "Documentation reviewed",
    },
    {
      id: 3,
      standard: "Quality Standard 3 — Personal Care and Clinical Care",
      category: "Aged Care Quality Standards",
      status: "Pending Review",
      lastAssessed: "01 Nov 2024",
      notes: "Review scheduled",
    },
    {
      id: 4,
      standard: "Medication Management Protocol",
      category: "Clinical Standards",
      status: "Compliant",
      lastAssessed: "15 Feb 2025",
      notes: "Pharmacist sign-off received",
    },
    {
      id: 5,
      standard: "Infection Prevention and Control",
      category: "Clinical Standards",
      status: "Compliant",
      lastAssessed: "20 Jan 2025",
      notes: "Passed audit",
    },
    {
      id: 6,
      standard: "Safe Environment and Equipment",
      category: "Safety Standards",
      status: "Compliant",
      lastAssessed: "05 Feb 2025",
      notes: "No issues",
    },
    {
      id: 7,
      standard: "Mandatory Reporting Obligations",
      category: "Regulatory",
      status: "Compliant",
      lastAssessed: "01 Mar 2025",
      notes: "On time",
    },
  ],
  "ADL-001": [
    {
      id: 1,
      standard: "Quality Standard 1 — Consumer Dignity and Choice",
      category: "Aged Care Quality Standards",
      status: "Compliant",
      lastAssessed: "05 Jan 2025",
      notes: "Standards met",
    },
    {
      id: 2,
      standard: "Quality Standard 2 — Ongoing Assessment and Planning",
      category: "Aged Care Quality Standards",
      status: "At Risk",
      lastAssessed: "01 Oct 2024",
      notes: "Backlog in care plan reviews",
    },
    {
      id: 3,
      standard: "Quality Standard 3 — Personal Care and Clinical Care",
      category: "Aged Care Quality Standards",
      status: "Non-Compliant",
      lastAssessed: "01 Oct 2024",
      notes: "Improvement notice issued",
    },
    {
      id: 4,
      standard: "Medication Management Protocol",
      category: "Clinical Standards",
      status: "At Risk",
      lastAssessed: "01 Nov 2024",
      notes: "Multiple medication errors recorded",
    },
    {
      id: 5,
      standard: "Infection Prevention and Control",
      category: "Clinical Standards",
      status: "Compliant",
      lastAssessed: "15 Jan 2025",
      notes: "Passed audit",
    },
    {
      id: 6,
      standard: "Safe Environment and Equipment",
      category: "Safety Standards",
      status: "Pending Review",
      lastAssessed: "01 Sep 2024",
      notes: "Maintenance backlog",
    },
    {
      id: 7,
      standard: "Mandatory Reporting Obligations",
      category: "Regulatory",
      status: "Compliant",
      lastAssessed: "01 Feb 2025",
      notes: "Reporting up to date",
    },
  ],
};

// Suggested actions per indicator code
const SUGGESTED_ACTIONS: Record<string, string> = {
  "SAF-001":
    "Conduct a comprehensive falls risk assessment and update prevention protocols for high-risk residents.",
  "SAF-002":
    "Initiate a pharmacist-led medication review for all residents on polypharmacy regimens.",
  "PRV-001":
    "Implement a targeted outreach program to increase screening participation rates.",
  "STF-001":
    "Review workforce retention policies, including competitive remuneration and professional development pathways.",
  "SAF-003":
    "Enhance skin integrity monitoring and implement evidence-based pressure injury prevention bundles.",
  "EXP-001":
    "Conduct resident and family feedback surveys and implement a rapid-response improvement action plan.",
  "QUA-001":
    "Assign dedicated clinical staff to backlog care plan reviews and set weekly completion targets.",
  "COM-001":
    "Schedule an internal compliance audit and engage external accreditation consultants if needed.",
};

// ── Helpers ────────────────────────────────────────────────────────────────────
function calcImprovementPct(
  current: number,
  previous: number,
  isLowerBetter: boolean,
): number {
  if (previous === 0) return 0;
  const raw = isLowerBetter
    ? ((previous - current) / previous) * 100
    : ((current - previous) / previous) * 100;
  return Math.max(-100, Math.min(100, raw));
}

function getRiskLevel(score: number): {
  label: string;
  variant: "default" | "secondary" | "destructive" | "outline";
  color: string;
} {
  if (score >= 80)
    return { label: "Low Risk", variant: "default", color: "#16a34a" };
  if (score >= 65)
    return { label: "Medium Risk", variant: "secondary", color: "#d97706" };
  return { label: "High Risk", variant: "destructive", color: "#dc2626" };
}

function getComplianceStyle(status: string) {
  switch (status) {
    case "Compliant":
      return { bg: "#dcfce7", text: "#166534", label: "Compliant" };
    case "At Risk":
      return { bg: "#fef3c7", text: "#92400e", label: "At Risk" };
    case "Non-Compliant":
      return { bg: "#fee2e2", text: "#991b1b", label: "Non-Compliant" };
    default:
      return { bg: "#f3f4f6", text: "#374151", label: "Pending Review" };
  }
}

const DOMAIN_LABELS: Record<string, string> = {
  safety: "Safety",
  preventive: "Preventive",
  quality: "Quality",
  staffing: "Staffing",
  compliance: "Compliance",
  experience: "Experience",
};

const DOMAIN_WEIGHTS: Record<string, number> = {
  safety: 30,
  preventive: 20,
  quality: 20,
  staffing: 15,
  compliance: 10,
  experience: 5,
};

// ── Main Component ─────────────────────────────────────────────────────────────
export default function ProviderDashboard() {
  const [selectedProviderId, setSelectedProviderId] = useState("SYD-001");
  const [activeTab, setActiveTab] = useState("overview");
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  const CURRENT_QUARTER = "Q4-2025";
  const provider =
    PROVIDERS.find((p) => p.id === selectedProviderId) ?? PROVIDERS[0];
  const _defaultVals = getProviderDefaultValues(
    selectedProviderId,
    CURRENT_QUARTER,
  );
  const prevVals = getProviderDefaultValues(
    selectedProviderId,
    getPrevQuarter(CURRENT_QUARTER),
  );

  // Validate provider exists in master
  const providerInMaster = UNIFIED_PROVIDERS.find(
    (p) => p.id === selectedProviderId,
  );
  if (!providerInMaster)
    console.error(`Provider ${selectedProviderId} not in PROVIDER_MASTER`);

  const [indicatorValues, setIndicatorValues] = useState<number[]>(() =>
    getProviderDefaultValues("SYD-001", "Q4-2025"),
  );

  const resetForProvider = (pid: string) => {
    setSelectedProviderId(pid);
    setIndicatorValues(getProviderDefaultValues(pid, CURRENT_QUARTER));
    setEditingIdx(null);
  };

  // Computed scores
  const indicatorScores = useMemo(
    () =>
      INDICATOR_DEFS.map((def, i) =>
        calcIndicatorPerformanceScore(
          indicatorValues[i],
          def.benchmark,
          def.isLowerBetter,
        ),
      ),
    [indicatorValues],
  );

  const domainScores = useMemo(() => {
    const groups: Record<string, number[]> = {};
    INDICATOR_DEFS.forEach((def, i) => {
      if (!groups[def.domain]) groups[def.domain] = [];
      groups[def.domain].push(indicatorScores[i]);
    });
    const avg = (arr: number[]) =>
      arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : 75;
    return {
      safety: avg(groups.safety ?? []),
      preventive: avg(groups.preventive ?? []),
      quality: avg(groups.quality ?? []),
      staffing: avg(groups.staffing ?? []),
      compliance: avg(groups.compliance ?? []),
      experience: avg(groups.experience ?? []),
    };
  }, [indicatorScores]);

  const { score: overallScore } = calcWeightedProviderRating(domainScores);
  const overallStars = scoreToFractionalStars(overallScore);
  const riskInfo = getRiskLevel(overallScore);

  const screeningIdx = INDICATOR_DEFS.findIndex((d) => d.code === "PRV-001");
  const screeningCompletion = indicatorValues[screeningIdx] ?? 87;

  const improvementPcts = INDICATOR_DEFS.map((def, i) =>
    calcImprovementPct(indicatorValues[i], prevVals[i], def.isLowerBetter),
  );
  const avgImprovement =
    improvementPcts.reduce((s, v) => s + v, 0) / improvementPcts.length;

  const pfiEligibility = calcPayForImprovementEligibility(
    overallStars,
    avgImprovement,
    screeningCompletion,
  );

  const alerts = useMemo(
    () =>
      INDICATOR_DEFS.map((def, i) => ({
        index: i,
        def,
        value: indicatorValues[i],
        status: getBenchmarkStatus(
          indicatorValues[i],
          def.benchmark,
          def.isLowerBetter,
        ),
      })).filter((a) => a.status === "below"),
    [indicatorValues],
  );

  const radarData = [
    { domain: "Safety", score: Math.round(domainScores.safety), benchmark: 75 },
    {
      domain: "Preventive",
      score: Math.round(domainScores.preventive),
      benchmark: 75,
    },
    {
      domain: "Quality",
      score: Math.round(domainScores.quality),
      benchmark: 75,
    },
    {
      domain: "Staffing",
      score: Math.round(domainScores.staffing),
      benchmark: 75,
    },
    {
      domain: "Compliance",
      score: Math.round(domainScores.compliance),
      benchmark: 75,
    },
    {
      domain: "Experience",
      score: Math.round(domainScores.experience),
      benchmark: 75,
    },
  ];

  const trendData = TREND_DATA[selectedProviderId] ?? TREND_DATA["SYD-001"];
  const complianceData =
    COMPLIANCE_DATA[selectedProviderId] ?? COMPLIANCE_DATA["SYD-001"];

  const saveEdit = (idx: number) => {
    const num = Number.parseFloat(editValue);
    if (Number.isNaN(num) || num < 0) {
      toast.error("Please enter a valid positive number.");
      return;
    }
    const updated = [...indicatorValues];
    updated[idx] = num;
    setIndicatorValues(updated);
    setEditingIdx(null);
    toast.success(
      `${INDICATOR_DEFS[idx].name} updated to ${num} ${INDICATOR_DEFS[idx].unit}`,
    );
  };

  // ── Inline KPI Card ──
  const KpiCard = ({
    icon,
    label,
    children,
    accentColor = "#1E3A8A",
  }: {
    icon: React.ReactNode;
    label: string;
    children: React.ReactNode;
    accentColor?: string;
  }) => (
    <Card className="relative overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div
        className="absolute left-0 top-0 bottom-0 w-1"
        style={{ backgroundColor: accentColor }}
      />
      <CardContent className="pl-5 py-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          {icon}
          <span className="font-medium uppercase tracking-wide">{label}</span>
        </div>
        {children}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-[#1E3A8A] text-white px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              Facility Performance Dashboard
            </h1>
            <p className="text-blue-200 text-sm mt-0.5">
              N-ACRM · Provider Self-Service Portal · Q4 2024–25
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-blue-200 text-sm">Viewing facility:</span>
            <Select value={selectedProviderId} onValueChange={resetForProvider}>
              <SelectTrigger
                className="w-56 bg-white/10 border-white/20 text-white"
                data-ocid="provider.select"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROVIDERS.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} ({p.state})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Facility info strip */}
        <div className="flex items-center gap-4 mb-6 p-3 bg-white rounded-lg border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-[#1E3A8A]" />
            <span className="font-semibold text-slate-800">
              {provider.name}
            </span>
          </div>
          <span className="text-slate-300">|</span>
          <span className="text-sm text-slate-500">
            {provider.city}, {provider.state}
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-sm text-slate-500">
            {provider.type} · {provider.beds} beds
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-sm text-slate-500">
            Provider ID: {provider.id}
          </span>
          {alerts.length > 0 && (
            <>
              <span className="text-slate-300">|</span>
              <span className="flex items-center gap-1 text-sm text-red-600 font-medium">
                <AlertTriangle className="h-4 w-4" />
                {alerts.length} active alert{alerts.length > 1 ? "s" : ""}
              </span>
            </>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-7 w-full mb-6 bg-white border border-slate-200 shadow-sm h-auto p-1">
            <TabsTrigger
              value="overview"
              data-ocid="provider.overview.tab"
              className="text-xs py-2"
            >
              <Activity className="h-3.5 w-3.5 mr-1" />
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="indicators"
              data-ocid="provider.indicators.tab"
              className="text-xs py-2"
            >
              <Edit2 className="h-3.5 w-3.5 mr-1" />
              Indicators
            </TabsTrigger>
            <TabsTrigger
              value="scorecard"
              data-ocid="provider.scorecard.tab"
              className="text-xs py-2"
            >
              <Award className="h-3.5 w-3.5 mr-1" />
              Scorecard
            </TabsTrigger>
            <TabsTrigger
              value="alerts"
              data-ocid="provider.alerts.tab"
              className="text-xs py-2 relative"
            >
              <AlertTriangle className="h-3.5 w-3.5 mr-1" />
              Alerts
              {alerts.length > 0 && (
                <span className="ml-1 bg-red-500 text-white text-[10px] rounded-full px-1.5 py-0.5 font-bold">
                  {alerts.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="trends"
              data-ocid="provider.trends.tab"
              className="text-xs py-2"
            >
              <BarChart2 className="h-3.5 w-3.5 mr-1" />
              Trends
            </TabsTrigger>
            <TabsTrigger
              value="pay"
              data-ocid="provider.pay.tab"
              className="text-xs py-2"
            >
              <DollarSign className="h-3.5 w-3.5 mr-1" />
              Pay-for-Impr.
            </TabsTrigger>
            <TabsTrigger
              value="compliance"
              data-ocid="provider.compliance.tab"
              className="text-xs py-2"
            >
              <ClipboardCheck className="h-3.5 w-3.5 mr-1" />
              Compliance
            </TabsTrigger>
          </TabsList>

          {/* ── TAB 1: OVERVIEW ── */}
          <TabsContent value="overview" data-ocid="provider.overview.panel">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <KpiCard
                icon={<Award className="h-4 w-4" />}
                label="Overall Rating"
                accentColor="#1E3A8A"
              >
                <div className="flex items-end gap-2">
                  <StarRating value={overallStars} />
                  <span className="text-lg font-bold text-slate-800">
                    {overallStars.toFixed(1)}
                  </span>
                  <span className="text-sm text-slate-500 mb-0.5">/ 5</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Score: {overallScore.toFixed(1)} / 100
                </p>
              </KpiCard>

              <KpiCard
                icon={<AlertTriangle className="h-4 w-4" />}
                label="Risk Level"
                accentColor={riskInfo.color}
              >
                <div className="mt-1">
                  <span
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold"
                    style={{
                      backgroundColor: `${riskInfo.color}20`,
                      color: riskInfo.color,
                    }}
                    data-ocid="provider.risk_level.panel"
                  >
                    {riskInfo.label}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Based on overall score
                </p>
              </KpiCard>

              <KpiCard
                icon={<ClipboardCheck className="h-4 w-4" />}
                label="Screening Completion"
                accentColor="#0891b2"
              >
                <div className="flex items-end gap-1">
                  <span className="text-2xl font-bold text-slate-800">
                    {screeningCompletion.toFixed(0)}
                  </span>
                  <span className="text-slate-500 mb-1">%</span>
                </div>
                <Progress
                  value={screeningCompletion}
                  className="h-2 mt-2"
                  data-ocid="provider.screening.progress"
                />
                <p className="text-xs text-slate-500 mt-1">Benchmark: 85%</p>
              </KpiCard>

              <KpiCard
                icon={<DollarSign className="h-4 w-4" />}
                label="Incentive Eligibility"
                accentColor="#7c3aed"
              >
                <div className="mt-1">
                  <IncentiveEligibilityBadge
                    tier={pfiEligibility.tier}
                    eligible={pfiEligibility.eligible}
                    data-ocid="provider.incentive.panel"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  {pfiEligibility.eligible
                    ? `Est. $${pfiEligibility.estimatedPayment.toLocaleString()}`
                    : "Not eligible this period"}
                </p>
              </KpiCard>
            </div>

            {/* Radar chart */}
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-[#1E3A8A]" />
                  Domain Performance Radar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ResponsiveContainer width="100%" height={280}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis
                        dataKey="domain"
                        tick={{ fontSize: 12, fill: "#64748b" }}
                      />
                      <Radar
                        name="Your Facility"
                        dataKey="score"
                        stroke="#1E3A8A"
                        fill="#1E3A8A"
                        fillOpacity={0.25}
                      />
                      <Radar
                        name="Benchmark"
                        dataKey="benchmark"
                        stroke="#94a3b8"
                        fill="#94a3b8"
                        fillOpacity={0.1}
                        strokeDasharray="4 4"
                      />
                      <Tooltip formatter={(v: number) => [`${v}`, ""]} />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                  <div className="space-y-3">
                    {Object.entries(domainScores).map(([domain, score]) => (
                      <div key={domain}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-slate-700">
                            {DOMAIN_LABELS[domain]}
                          </span>
                          <span className="text-slate-500">
                            {score.toFixed(0)} / 100{" "}
                            <span className="text-xs text-slate-400">
                              ({DOMAIN_WEIGHTS[domain]}% weight)
                            </span>
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all"
                            style={{
                              width: `${score}%`,
                              backgroundColor:
                                score >= 80
                                  ? "#16a34a"
                                  : score >= 65
                                    ? "#d97706"
                                    : "#dc2626",
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── TAB 2: INDICATORS ── */}
          <TabsContent value="indicators" data-ocid="provider.indicators.panel">
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Edit2 className="h-4 w-4 text-[#1E3A8A]" />
                  Indicator Management — Update your facility's clinical
                  indicator values
                </CardTitle>
                <p className="text-xs text-slate-500 mt-1">
                  Click the edit button to update a value. Ratings recalculate
                  instantly on save.
                </p>
              </CardHeader>
              <CardContent>
                <Table data-ocid="provider.indicators.table">
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="text-xs font-semibold">
                        Indicator
                      </TableHead>
                      <TableHead className="text-xs font-semibold">
                        Domain
                      </TableHead>
                      <TableHead className="text-xs font-semibold">
                        Current Value
                      </TableHead>
                      <TableHead className="text-xs font-semibold">
                        Benchmark
                      </TableHead>
                      <TableHead className="text-xs font-semibold">
                        Direction
                      </TableHead>
                      <TableHead className="text-xs font-semibold">
                        Status
                      </TableHead>
                      <TableHead className="text-xs font-semibold">
                        Score
                      </TableHead>
                      <TableHead className="text-xs font-semibold w-20">
                        Action
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {INDICATOR_DEFS.map((def, i) => {
                      const val = indicatorValues[i];
                      const score = indicatorScores[i];
                      const isEditing = editingIdx === i;
                      return (
                        <TableRow
                          key={def.code}
                          className="hover:bg-slate-50 even:bg-slate-50/50"
                          data-ocid={`provider.indicators.item.${i + 1}`}
                        >
                          <TableCell className="font-medium text-sm text-slate-800">
                            {def.name}
                          </TableCell>
                          <TableCell>
                            <span className="text-xs capitalize px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">
                              {def.domain}
                            </span>
                          </TableCell>
                          <TableCell>
                            {isEditing ? (
                              <div className="flex items-center gap-1">
                                <Input
                                  type="number"
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  className="w-24 h-7 text-sm"
                                  data-ocid="provider.indicators.input"
                                  onKeyDown={(e) =>
                                    e.key === "Enter" && saveEdit(i)
                                  }
                                  autoFocus
                                />
                                <span className="text-xs text-slate-500">
                                  {def.unit}
                                </span>
                              </div>
                            ) : (
                              <span className="font-semibold text-slate-700">
                                {val}{" "}
                                <span className="text-xs font-normal text-slate-400">
                                  {def.unit}
                                </span>
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-slate-600 text-sm">
                            {def.benchmark}{" "}
                            <span className="text-xs text-slate-400">
                              {def.unit}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full ${def.isLowerBetter ? "bg-orange-50 text-orange-700" : "bg-green-50 text-green-700"}`}
                            >
                              {def.isLowerBetter ? "↓ Lower" : "↑ Higher"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <BenchmarkStatusChip
                              rate={val}
                              benchmark={def.benchmark}
                              isLowerBetter={def.isLowerBetter}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-slate-100 rounded-full h-1.5">
                                <div
                                  className="h-1.5 rounded-full"
                                  style={{
                                    width: `${score}%`,
                                    backgroundColor:
                                      score >= 80
                                        ? "#16a34a"
                                        : score >= 65
                                          ? "#d97706"
                                          : "#dc2626",
                                  }}
                                />
                              </div>
                              <span className="text-xs text-slate-600">
                                {score.toFixed(0)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {isEditing ? (
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="default"
                                  className="h-7 w-7 p-0"
                                  onClick={() => saveEdit(i)}
                                  data-ocid="provider.indicators.save_button"
                                >
                                  <Save className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 w-7 p-0"
                                  onClick={() => setEditingIdx(null)}
                                  data-ocid="provider.indicators.cancel_button"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 w-7 p-0"
                                onClick={() => {
                                  setEditingIdx(i);
                                  setEditValue(String(val));
                                }}
                                data-ocid={`provider.indicators.edit_button.${i + 1}`}
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── TAB 3: SCORECARD ── */}
          <TabsContent value="scorecard" data-ocid="provider.scorecard.panel">
            {/* Overall */}
            <Card className="mb-5 shadow-sm border-l-4 border-[#1E3A8A]">
              <CardContent className="py-4 px-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">
                      Overall Provider Rating
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <StarRating value={overallStars} size="lg" />
                      <span className="text-3xl font-bold text-slate-800">
                        {overallStars.toFixed(1)}
                      </span>
                      <span className="text-slate-400 text-lg">/5</span>
                    </div>
                    <p className="text-sm text-slate-600 mt-1">
                      Performance Score:{" "}
                      <strong>{overallScore.toFixed(1)}</strong> / 100
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold"
                      style={{
                        backgroundColor: `${riskInfo.color}20`,
                        color: riskInfo.color,
                      }}
                    >
                      {riskInfo.label}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Domain score cards */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
              {Object.entries(domainScores).map(([domain, score]) => {
                const domainIndicators = INDICATOR_DEFS.map((def, i) => ({
                  def,
                  score: indicatorScores[i],
                })).filter(({ def }) => def.domain === domain);
                const stars = scoreToFractionalStars(score);
                const weight = DOMAIN_WEIGHTS[domain];
                return (
                  <Card
                    key={domain}
                    className="shadow-sm hover:shadow-md transition-shadow"
                  >
                    <CardContent className="py-3 px-4">
                      <div className="flex justify-between items-start">
                        <span className="text-sm font-semibold text-slate-700 capitalize">
                          {DOMAIN_LABELS[domain]}
                        </span>
                        <span className="text-xs text-slate-400">
                          {weight}% weight
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-2xl font-bold text-slate-800">
                          {score.toFixed(0)}
                        </span>
                        <span className="text-slate-400">/100</span>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <StarRating value={stars} size="sm" />
                        <span className="text-xs text-slate-500">
                          {stars.toFixed(1)}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
                        <div
                          className="h-1.5 rounded-full transition-all"
                          style={{
                            width: `${score}%`,
                            backgroundColor:
                              score >= 80
                                ? "#16a34a"
                                : score >= 65
                                  ? "#d97706"
                                  : "#dc2626",
                          }}
                        />
                      </div>
                      <div className="mt-2 space-y-0.5">
                        {domainIndicators.map(({ def, score: iScore }) => (
                          <div
                            key={def.code}
                            className="flex justify-between text-xs text-slate-500"
                          >
                            <span className="truncate">{def.name}</span>
                            <span className="ml-2 font-medium">
                              {iScore.toFixed(0)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Indicator detail table */}
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-slate-700">
                  Indicator Ratings Detail
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table data-ocid="provider.scorecard.table">
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="text-xs">Indicator</TableHead>
                      <TableHead className="text-xs">Domain</TableHead>
                      <TableHead className="text-xs">Provider Value</TableHead>
                      <TableHead className="text-xs">Benchmark</TableHead>
                      <TableHead className="text-xs">Score</TableHead>
                      <TableHead className="text-xs">Star Rating</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {INDICATOR_DEFS.map((def, i) => {
                      const score = indicatorScores[i];
                      const stars = scoreToFractionalStars(score);
                      return (
                        <TableRow
                          key={def.code}
                          className="even:bg-slate-50/50"
                          data-ocid={`provider.scorecard.item.${i + 1}`}
                        >
                          <TableCell className="font-medium text-sm">
                            {def.name}
                          </TableCell>
                          <TableCell>
                            <span className="text-xs capitalize px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">
                              {def.domain}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm">
                            {indicatorValues[i]} {def.unit}
                          </TableCell>
                          <TableCell className="text-sm text-slate-500">
                            {def.benchmark} {def.unit}
                          </TableCell>
                          <TableCell>
                            <span
                              className="font-semibold"
                              style={{
                                color:
                                  score >= 80
                                    ? "#16a34a"
                                    : score >= 65
                                      ? "#d97706"
                                      : "#dc2626",
                              }}
                            >
                              {score.toFixed(0)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <StarRating value={stars} size="sm" />
                              <span className="text-xs text-slate-500">
                                {stars.toFixed(1)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <BenchmarkStatusChip
                              rate={indicatorValues[i]}
                              benchmark={def.benchmark}
                              isLowerBetter={def.isLowerBetter}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── TAB 4: ALERTS ── */}
          <TabsContent value="alerts" data-ocid="provider.alerts.panel">
            {alerts.length === 0 ? (
              <Card className="shadow-sm">
                <CardContent
                  className="py-12 text-center"
                  data-ocid="provider.alerts.empty_state"
                >
                  <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-slate-700">
                    All indicators meeting benchmark
                  </h3>
                  <p className="text-slate-500 text-sm mt-1">
                    Your facility is performing at or above benchmark across all
                    measured indicators.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <h2 className="text-sm font-semibold text-slate-700">
                    {alerts.length} indicator{alerts.length > 1 ? "s" : ""}{" "}
                    below benchmark — action required
                  </h2>
                </div>
                {alerts.map((alert, idx) => {
                  const gap = Math.abs(
                    alert.def.isLowerBetter
                      ? ((alert.value - alert.def.benchmark) /
                          alert.def.benchmark) *
                          100
                      : ((alert.def.benchmark - alert.value) /
                          alert.def.benchmark) *
                          100,
                  );
                  const isCritical = gap > 20;
                  return (
                    <Card
                      key={alert.def.code}
                      className="shadow-sm border-l-4"
                      style={{
                        borderLeftColor: isCritical ? "#dc2626" : "#d97706",
                      }}
                      data-ocid={`provider.alerts.item.${idx + 1}`}
                    >
                      <CardContent className="py-4 px-5">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <AlertTriangle
                              className="h-5 w-5 flex-shrink-0"
                              style={{
                                color: isCritical ? "#dc2626" : "#d97706",
                              }}
                            />
                            <div>
                              <h3 className="font-semibold text-slate-800">
                                {alert.def.name}
                              </h3>
                              <p className="text-xs text-slate-500 mt-0.5">
                                Domain:{" "}
                                <span className="capitalize">
                                  {alert.def.domain}
                                </span>{" "}
                                · Code: {alert.def.code}
                              </p>
                            </div>
                          </div>
                          <span
                            className="text-xs font-semibold px-2.5 py-1 rounded-full"
                            style={{
                              backgroundColor: isCritical
                                ? "#fee2e2"
                                : "#fef3c7",
                              color: isCritical ? "#991b1b" : "#92400e",
                            }}
                          >
                            {isCritical ? "Critical" : "Warning"} ·{" "}
                            {gap.toFixed(1)}% gap
                          </span>
                        </div>

                        <div className="mt-3 grid grid-cols-3 gap-3">
                          <div className="bg-slate-50 rounded p-2">
                            <p className="text-xs text-slate-500">Your Value</p>
                            <p className="font-bold text-slate-800">
                              {alert.value}{" "}
                              <span className="text-xs font-normal text-slate-400">
                                {alert.def.unit}
                              </span>
                            </p>
                          </div>
                          <div className="bg-slate-50 rounded p-2">
                            <p className="text-xs text-slate-500">Benchmark</p>
                            <p className="font-bold text-slate-800">
                              {alert.def.benchmark}{" "}
                              <span className="text-xs font-normal text-slate-400">
                                {alert.def.unit}
                              </span>
                            </p>
                          </div>
                          <div className="bg-slate-50 rounded p-2">
                            <p className="text-xs text-slate-500">Direction</p>
                            <p className="font-bold text-slate-800">
                              {alert.def.isLowerBetter
                                ? "Lower is better"
                                : "Higher is better"}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                          <p className="text-xs font-semibold text-blue-800 mb-1">
                            💡 Suggested Action
                          </p>
                          <p className="text-sm text-blue-700">
                            {SUGGESTED_ACTIONS[alert.def.code] ??
                              "Review and implement evidence-based improvement protocols for this indicator."}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* ── TAB 5: TRENDS ── */}
          <TabsContent value="trends" data-ocid="provider.trends.panel">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-[#1E3A8A]" />
                    Safety Indicators — Quarterly Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={240}>
                    <LineChart
                      data={trendData}
                      margin={{ top: 5, right: 5, bottom: 5, left: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="quarter" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Line
                        type="monotone"
                        dataKey="falls"
                        name="Falls Rate"
                        stroke="#dc2626"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="medication"
                        name="Medication Harm"
                        stroke="#d97706"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                  <p className="text-xs text-slate-400 mt-2 text-center">
                    Lower is better — benchmark: Falls 5.1, Medication 3.2
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-[#1E3A8A]" />
                    Care Quality Indicators — Quarterly Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={240}>
                    <LineChart
                      data={trendData}
                      margin={{ top: 5, right: 5, bottom: 5, left: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="quarter" tick={{ fontSize: 12 }} />
                      <YAxis domain={[50, 100]} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Line
                        type="monotone"
                        dataKey="screening"
                        name="Screening %"
                        stroke="#1E3A8A"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="staffing"
                        name="Staff Retention %"
                        stroke="#7c3aed"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="satisfaction"
                        name="Satisfaction %"
                        stroke="#0891b2"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                  <p className="text-xs text-slate-400 mt-2 text-center">
                    Higher is better — benchmarks: Screening 85%, Staffing 82%,
                    Satisfaction 78%
                  </p>
                </CardContent>
              </Card>

              {/* Quarter summary table */}
              <Card className="shadow-sm lg:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-slate-700">
                    Quarterly Summary Table
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table data-ocid="provider.trends.table">
                    <TableHeader>
                      <TableRow className="bg-slate-50">
                        <TableHead className="text-xs">Quarter</TableHead>
                        <TableHead className="text-xs">Falls Rate</TableHead>
                        <TableHead className="text-xs">
                          Medication Harm
                        </TableHead>
                        <TableHead className="text-xs">Screening %</TableHead>
                        <TableHead className="text-xs">
                          Staff Retention %
                        </TableHead>
                        <TableHead className="text-xs">
                          Satisfaction %
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {trendData.map((row, i) => (
                        <TableRow
                          key={row.quarter}
                          className="even:bg-slate-50/50"
                          data-ocid={`provider.trends.item.${i + 1}`}
                        >
                          <TableCell className="font-semibold text-sm">
                            {row.quarter}
                          </TableCell>
                          <TableCell className="text-sm">{row.falls}</TableCell>
                          <TableCell className="text-sm">
                            {row.medication}
                          </TableCell>
                          <TableCell className="text-sm">
                            {row.screening}%
                          </TableCell>
                          <TableCell className="text-sm">
                            {row.staffing}%
                          </TableCell>
                          <TableCell className="text-sm">
                            {row.satisfaction}%
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── TAB 6: PAY-FOR-IMPROVEMENT ── */}
          <TabsContent value="pay" data-ocid="provider.pay.panel">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
              <KpiCard
                icon={<TrendingUp className="h-4 w-4" />}
                label="Avg Improvement"
                accentColor="#16a34a"
              >
                <div className="flex items-end gap-1 mt-1">
                  <span
                    className="text-3xl font-bold"
                    style={{
                      color: avgImprovement >= 0 ? "#16a34a" : "#dc2626",
                    }}
                  >
                    {avgImprovement >= 0 ? "+" : ""}
                    {avgImprovement.toFixed(1)}
                  </span>
                  <span className="text-slate-500 mb-1">%</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  vs previous quarter
                </p>
              </KpiCard>

              <KpiCard
                icon={<Award className="h-4 w-4" />}
                label="Eligibility Status"
                accentColor="#7c3aed"
              >
                <div className="mt-1">
                  <IncentiveEligibilityBadge
                    tier={pfiEligibility.tier}
                    eligible={pfiEligibility.eligible}
                    data-ocid="provider.pay.panel"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Based on current rating &amp; improvement
                </p>
              </KpiCard>

              <KpiCard
                icon={<DollarSign className="h-4 w-4" />}
                label="Estimated Incentive"
                accentColor="#0891b2"
              >
                <div className="flex items-end gap-1 mt-1">
                  <span className="text-2xl font-bold text-slate-800">
                    {pfiEligibility.eligible
                      ? `$${pfiEligibility.estimatedPayment.toLocaleString()}`
                      : "$0"}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Estimated annual payment
                </p>
              </KpiCard>
            </div>

            {/* Criteria breakdown */}
            <Card className="shadow-sm mb-5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-slate-700">
                  Eligibility Criteria Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    {
                      label: "Overall Rating ≥ 4.0 stars",
                      met: overallStars >= 4.0,
                      value: `${overallStars.toFixed(1)} stars`,
                    },
                    {
                      label: "Overall Rating ≥ 4.5 stars (Highly Eligible)",
                      met: overallStars >= 4.5,
                      value: `${overallStars.toFixed(1)} stars`,
                    },
                    {
                      label: "Average Improvement ≥ 10%",
                      met: avgImprovement >= 10,
                      value: `${avgImprovement.toFixed(1)}%`,
                    },
                    {
                      label: "Average Improvement ≥ 15%",
                      met: avgImprovement >= 15,
                      value: `${avgImprovement.toFixed(1)}%`,
                    },
                    {
                      label: "Screening Completion ≥ 85%",
                      met: screeningCompletion >= 85,
                      value: `${screeningCompletion.toFixed(0)}%`,
                    },
                  ].map((criterion) => (
                    <div
                      key={criterion.label}
                      className="flex items-center justify-between p-3 rounded-lg border"
                      style={{
                        borderColor: criterion.met ? "#bbf7d0" : "#fecaca",
                        backgroundColor: criterion.met ? "#f0fdf4" : "#fff1f2",
                      }}
                    >
                      <div className="flex items-center gap-2">
                        {criterion.met ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <X className="h-4 w-4 text-red-500" />
                        )}
                        <span className="text-sm text-slate-700">
                          {criterion.label}
                        </span>
                      </div>
                      <span
                        className="text-sm font-semibold"
                        style={{ color: criterion.met ? "#166534" : "#991b1b" }}
                      >
                        {criterion.value}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Per-indicator improvement */}
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-slate-700">
                  Per-Indicator Improvement vs Previous Quarter
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table data-ocid="provider.pay.table">
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="text-xs">Indicator</TableHead>
                      <TableHead className="text-xs">Previous</TableHead>
                      <TableHead className="text-xs">Current</TableHead>
                      <TableHead className="text-xs">Improvement</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {INDICATOR_DEFS.map((def, i) => {
                      const imp = improvementPcts[i];
                      return (
                        <TableRow
                          key={def.code}
                          className="even:bg-slate-50/50"
                          data-ocid={`provider.pay.item.${i + 1}`}
                        >
                          <TableCell className="font-medium text-sm">
                            {def.name}
                          </TableCell>
                          <TableCell className="text-sm">
                            {prevVals[i]} {def.unit}
                          </TableCell>
                          <TableCell className="text-sm">
                            {indicatorValues[i]} {def.unit}
                          </TableCell>
                          <TableCell>
                            <span
                              className="font-semibold text-sm flex items-center gap-1"
                              style={{
                                color: imp >= 0 ? "#16a34a" : "#dc2626",
                              }}
                            >
                              {imp >= 0 ? (
                                <TrendingUp className="h-3.5 w-3.5" />
                              ) : (
                                <TrendingUp className="h-3.5 w-3.5 rotate-180" />
                              )}
                              {imp >= 0 ? "+" : ""}
                              {imp.toFixed(1)}%
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── TAB 7: COMPLIANCE ── */}
          <TabsContent value="compliance" data-ocid="provider.compliance.panel">
            {/* Summary badges */}
            <div className="flex flex-wrap gap-3 mb-5">
              {(
                [
                  "Compliant",
                  "At Risk",
                  "Non-Compliant",
                  "Pending Review",
                ] as const
              ).map((status) => {
                const count = complianceData.filter(
                  (c) => c.status === status,
                ).length;
                if (count === 0) return null;
                const style = getComplianceStyle(status);
                return (
                  <div
                    key={status}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border"
                    style={{
                      backgroundColor: style.bg,
                      borderColor: `${style.text}40`,
                    }}
                  >
                    <span
                      className="text-lg font-bold"
                      style={{ color: style.text }}
                    >
                      {count}
                    </span>
                    <span
                      className="text-sm font-medium"
                      style={{ color: style.text }}
                    >
                      {style.label}
                    </span>
                  </div>
                );
              })}
            </div>

            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <ClipboardCheck className="h-4 w-4 text-[#1E3A8A]" />
                  Regulatory Compliance Status — {provider.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table data-ocid="provider.compliance.table">
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="text-xs">Standard</TableHead>
                      <TableHead className="text-xs">Category</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                      <TableHead className="text-xs">Last Assessed</TableHead>
                      <TableHead className="text-xs">Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {complianceData.map((item, idx) => {
                      const style = getComplianceStyle(item.status);
                      return (
                        <TableRow
                          key={item.id}
                          className="even:bg-slate-50/50"
                          data-ocid={`provider.compliance.item.${idx + 1}`}
                        >
                          <TableCell className="font-medium text-sm max-w-xs">
                            {item.standard}
                          </TableCell>
                          <TableCell>
                            <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
                              {item.category}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span
                              className="text-xs font-semibold px-2.5 py-1 rounded-full"
                              style={{
                                backgroundColor: style.bg,
                                color: style.text,
                              }}
                            >
                              {style.label}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-slate-600">
                            {item.lastAssessed}
                          </TableCell>
                          <TableCell className="text-sm text-slate-500">
                            {item.notes}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
