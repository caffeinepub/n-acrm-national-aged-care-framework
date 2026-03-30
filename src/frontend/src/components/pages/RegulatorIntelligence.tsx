import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertTriangle,
  Brain,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Download,
  Info,
  Lightbulb,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useMemo, useState } from "react";
import { PROVIDER_MASTER } from "../../data/mockData";
import { getProviderRatingForQuarter } from "../../data/mockData";
import type { DecisionRecommendation } from "../../utils/decisionSupport";
import { generateRecommendation } from "../../utils/decisionSupport";
import type { RiskPrediction } from "../../utils/riskPrediction";
import { predictProviderRisk } from "../../utils/riskPrediction";
import type { DeviationAlert } from "../../utils/trendDeviation";
import {
  detectDeviations,
  getPreviousQuarter,
} from "../../utils/trendDeviation";

interface Props {
  currentQuarter: string;
}

const PAGE_BG: React.CSSProperties = {
  background: "linear-gradient(135deg, #0a0f1e 0%, #0d1528 50%, #0a1020 100%)",
  minHeight: "100%",
};
const GLASS_CARD: React.CSSProperties = {
  background: "rgba(255,255,255,0.05)",
  backdropFilter: "blur(16px)",
  border: "1px solid rgba(255,255,255,0.10)",
  borderRadius: "10px",
};
const TABLE_HEAD: React.CSSProperties = {
  padding: "10px 12px",
  fontSize: "0.65rem",
  fontWeight: 700,
  color: "rgba(255,255,255,0.4)",
  textTransform: "uppercase",
  letterSpacing: "0.07em",
  textAlign: "left",
  borderBottom: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.03)",
  whiteSpace: "nowrap",
};
const TABLE_CELL: React.CSSProperties = {
  padding: "10px 12px",
  fontSize: "0.75rem",
  color: "rgba(255,255,255,0.75)",
  borderBottom: "1px solid rgba(255,255,255,0.05)",
};

const ALL_QUARTERS = [
  "Q1-2024",
  "Q2-2024",
  "Q3-2024",
  "Q4-2024",
  "Q1-2025",
  "Q2-2025",
  "Q3-2025",
  "Q4-2025",
];

function getQuartersUpTo(q: string): string[] {
  const idx = ALL_QUARTERS.indexOf(q);
  if (idx < 0) return ALL_QUARTERS.slice(-4);
  return ALL_QUARTERS.slice(Math.max(0, idx - 3), idx + 1);
}

function RiskBadge({ risk }: { risk: "Low" | "Medium" | "High" }) {
  const map = {
    High: {
      bg: "rgba(248,113,113,0.2)",
      color: "#F87171",
      border: "rgba(248,113,113,0.35)",
    },
    Medium: {
      bg: "rgba(251,191,36,0.2)",
      color: "#FBBF24",
      border: "rgba(251,191,36,0.35)",
    },
    Low: {
      bg: "rgba(52,211,153,0.2)",
      color: "#34D399",
      border: "rgba(52,211,153,0.35)",
    },
  }[risk];
  return (
    <span
      style={{
        background: map.bg,
        color: map.color,
        border: `1px solid ${map.border}`,
        borderRadius: "4px",
        padding: "2px 10px",
        fontSize: "0.7rem",
        fontWeight: 700,
      }}
    >
      {risk === "High" && <span style={{ marginRight: "4px" }}>&#9679;</span>}
      {risk === "Medium" && <span style={{ marginRight: "4px" }}>&#9679;</span>}
      {risk === "Low" && <span style={{ marginRight: "4px" }}>&#9679;</span>}
      {risk}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: "High" | "Medium" | "Low" }) {
  const e = {
    High: {
      emoji: "\uD83D\uDD34",
      color: "#F87171",
      bg: "rgba(248,113,113,0.1)",
    },
    Medium: {
      emoji: "\uD83DDFE1",
      color: "#FBBF24",
      bg: "rgba(251,191,36,0.1)",
    },
    Low: {
      emoji: "\uD83D\uDFE2",
      color: "#34D399",
      bg: "rgba(52,211,153,0.1)",
    },
  }[priority];
  return (
    <span
      style={{
        background: e.bg,
        color: e.color,
        borderRadius: "4px",
        padding: "2px 8px",
        fontSize: "0.7rem",
        fontWeight: 700,
      }}
    >
      {priority === "High" ? "🔴" : priority === "Medium" ? "🟡" : "🟢"}{" "}
      {priority}
    </span>
  );
}

function ActionBadge({ type, action }: { type: string; action: string }) {
  const map: Record<string, { bg: string; color: string; border: string }> = {
    Audit: {
      bg: "rgba(248,113,113,0.15)",
      color: "#F87171",
      border: "rgba(248,113,113,0.3)",
    },
    Warning: {
      bg: "rgba(251,191,36,0.15)",
      color: "#FBBF24",
      border: "rgba(251,191,36,0.3)",
    },
    Monitoring: {
      bg: "rgba(251,191,36,0.1)",
      color: "#FBBF24",
      border: "rgba(251,191,36,0.25)",
    },
    Support: {
      bg: "rgba(96,165,250,0.15)",
      color: "#60A5FA",
      border: "rgba(96,165,250,0.3)",
    },
    Incentive: {
      bg: "rgba(52,211,153,0.15)",
      color: "#34D399",
      border: "rgba(52,211,153,0.3)",
    },
  };
  const s = map[type] ?? map.Monitoring;
  return (
    <span
      style={{
        ...s,
        borderRadius: "5px",
        padding: "3px 10px",
        fontSize: "0.72rem",
        fontWeight: 700,
        border: `1px solid ${s.border}`,
      }}
    >
      {action}
    </span>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
  color = "#60A5FA",
  extra,
}: {
  icon: React.ComponentType<{
    className?: string;
    style?: React.CSSProperties;
  }>;
  title: string;
  subtitle: string;
  color?: string;
  extra?: React.ReactNode;
}) {
  return (
    <div
      style={{
        background:
          "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)",
        borderBottom: "1px solid rgba(99,179,237,0.15)",
        padding: "18px 24px",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "12px",
      }}
    >
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "4px",
          }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
          <h2
            style={{
              fontSize: "1.1rem",
              fontWeight: 800,
              color: "#F1F5F9",
              letterSpacing: "-0.01em",
            }}
          >
            {title}
          </h2>
        </div>
        <p
          style={{
            fontSize: "0.78rem",
            color: "rgba(255,255,255,0.45)",
            maxWidth: "600px",
          }}
        >
          {subtitle}
        </p>
      </div>
      {extra}
    </div>
  );
}

function KpiRow({
  items,
}: { items: { label: string; value: string | number; color: string }[] }) {
  return (
    <div
      style={{
        display: "flex",
        gap: "16px",
        padding: "12px 20px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        flexWrap: "wrap",
      }}
    >
      {items.map((item) => (
        <div
          key={item.label}
          style={{ display: "flex", flexDirection: "column" }}
        >
          <span
            style={{
              fontSize: "0.65rem",
              color: "rgba(255,255,255,0.35)",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            {item.label}
          </span>
          <span
            style={{
              fontSize: "1.2rem",
              fontWeight: 800,
              color: item.color,
              fontFamily: "'Geist Mono', monospace",
              lineHeight: 1.2,
            }}
          >
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Tab 1: Risk Predictions
function RiskPredictionsTab({
  predictions,
}: {
  predictions: Array<
    RiskPrediction & { name: string; state: string; stars: number }
  >;
}) {
  const highCount = predictions.filter(
    (p) => p.predictedRisk === "High",
  ).length;
  const medCount = predictions.filter(
    (p) => p.predictedRisk === "Medium",
  ).length;
  const lowCount = predictions.filter((p) => p.predictedRisk === "Low").length;

  return (
    <div style={PAGE_BG}>
      <SectionHeader
        icon={Brain}
        title="AI Risk Prediction Engine"
        subtitle="Predicts which providers are likely to become high-risk next quarter based on 4-quarter trend analysis"
        color="#A78BFA"
      />
      <KpiRow
        items={[
          { label: "High Risk Predicted", value: highCount, color: "#F87171" },
          { label: "Medium Risk", value: medCount, color: "#FBBF24" },
          { label: "Low Risk", value: lowCount, color: "#34D399" },
          {
            label: "Providers Analysed",
            value: predictions.length,
            color: "#60A5FA",
          },
        ]}
      />

      <div style={{ padding: "20px", overflowX: "auto" }}>
        <div style={GLASS_CARD}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {[
                  "Provider Name",
                  "State",
                  "Current Stars",
                  "Predicted Risk",
                  "Confidence",
                  "Key Signals",
                  "Explanation",
                ].map((h) => (
                  <th key={h} style={TABLE_HEAD}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {predictions.map((p, idx) => (
                <tr
                  key={p.providerId}
                  data-ocid={`risk_predictions.item.${idx + 1}`}
                  style={{
                    background:
                      p.predictedRisk === "High"
                        ? "rgba(248,113,113,0.06)"
                        : "",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    if (p.predictedRisk !== "High")
                      e.currentTarget.style.background =
                        "rgba(255,255,255,0.03)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background =
                      p.predictedRisk === "High"
                        ? "rgba(248,113,113,0.06)"
                        : "";
                  }}
                >
                  <td
                    style={{ ...TABLE_CELL, fontWeight: 600, color: "#E2E8F0" }}
                  >
                    {p.name}
                  </td>
                  <td style={TABLE_CELL}>
                    <span
                      style={{
                        background: "rgba(96,165,250,0.12)",
                        color: "#60A5FA",
                        border: "1px solid rgba(96,165,250,0.2)",
                        borderRadius: "4px",
                        padding: "1px 7px",
                        fontSize: "0.68rem",
                        fontWeight: 600,
                      }}
                    >
                      {p.state}
                    </span>
                  </td>
                  <td
                    style={{
                      ...TABLE_CELL,
                      fontFamily: "'Geist Mono', monospace",
                      color: "#FBBF24",
                      fontWeight: 700,
                    }}
                  >
                    {p.stars.toFixed(1)} ★
                  </td>
                  <td style={TABLE_CELL}>
                    <RiskBadge risk={p.predictedRisk} />
                  </td>
                  <td style={TABLE_CELL}>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "4px",
                        minWidth: "100px",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "'Geist Mono', monospace",
                          fontWeight: 700,
                          color:
                            p.predictedRisk === "High"
                              ? "#F87171"
                              : p.predictedRisk === "Medium"
                                ? "#FBBF24"
                                : "#34D399",
                          fontSize: "0.78rem",
                        }}
                      >
                        {p.confidence}%
                      </span>
                      <div
                        style={{
                          height: "4px",
                          borderRadius: "2px",
                          background: "rgba(255,255,255,0.08)",
                          overflow: "hidden",
                          width: "80px",
                        }}
                      >
                        <div
                          style={{
                            width: `${p.confidence}%`,
                            height: "100%",
                            background:
                              p.predictedRisk === "High"
                                ? "#F87171"
                                : p.predictedRisk === "Medium"
                                  ? "#FBBF24"
                                  : "#34D399",
                            borderRadius: "2px",
                          }}
                        />
                      </div>
                    </div>
                  </td>
                  <td style={{ ...TABLE_CELL, maxWidth: "200px" }}>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "2px",
                      }}
                    >
                      {p.trendSignals.slice(0, 2).map((sig, i) => (
                        <span
                          key={`${sig.slice(0, 20)}-${i}`}
                          style={{
                            fontSize: "0.68rem",
                            color: "rgba(255,255,255,0.45)",
                            display: "block",
                          }}
                        >
                          &#9679; {sig.substring(0, 40)}
                          {sig.length > 40 ? "..." : ""}
                        </span>
                      ))}
                      {p.trendSignals.length === 0 && (
                        <span
                          style={{
                            fontSize: "0.68rem",
                            color: "rgba(255,255,255,0.25)",
                          }}
                        >
                          No declining signals
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ ...TABLE_CELL, maxWidth: "220px" }}>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "5px",
                              cursor: "help",
                            }}
                          >
                            <span
                              style={{
                                fontSize: "0.72rem",
                                color: "rgba(255,255,255,0.55)",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                maxWidth: "180px",
                              }}
                            >
                              {p.explanation}
                            </span>
                            <Info
                              className="w-3.5 h-3.5"
                              style={{
                                color: "rgba(255,255,255,0.3)",
                                flexShrink: 0,
                              }}
                            />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent
                          style={{
                            background: "rgba(15,23,42,0.98)",
                            border: "1px solid rgba(99,179,237,0.3)",
                            color: "#E2E8F0",
                            fontSize: "0.75rem",
                            maxWidth: "280px",
                            padding: "10px 14px",
                            borderRadius: "8px",
                          }}
                        >
                          <p>{p.explanation}</p>
                          {p.trendSignals.length > 0 && (
                            <ul
                              style={{
                                marginTop: "8px",
                                paddingLeft: "14px",
                                display: "flex",
                                flexDirection: "column",
                                gap: "3px",
                              }}
                            >
                              {p.trendSignals.map((sig, i) => (
                                <li
                                  key={`${sig.slice(0, 20)}-${i}`}
                                  style={{
                                    fontSize: "0.7rem",
                                    color: "rgba(255,255,255,0.6)",
                                  }}
                                >
                                  {sig}
                                </li>
                              ))}
                            </ul>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Tab 2: Deviation Alerts
function DeviationAlertsTab({
  alerts,
  currentQuarter,
  previousQuarter,
}: {
  alerts: DeviationAlert[];
  currentQuarter: string;
  previousQuarter: string;
}) {
  const [filter, setFilter] = useState<"All" | "Critical" | "Warning">("All");
  const criticalCount = alerts.filter((a) => a.severity === "critical").length;

  const filtered =
    filter === "All"
      ? alerts
      : alerts.filter((a) => a.severity === filter.toLowerCase());

  return (
    <div style={PAGE_BG}>
      <SectionHeader
        icon={Zap}
        title="Trend Deviation Detector"
        subtitle={`Detects sudden abnormal changes in provider performance indicators. Comparing ${currentQuarter} vs ${previousQuarter}.`}
        color="#FBBF24"
      />
      <KpiRow
        items={[
          { label: "Total Deviations", value: alerts.length, color: "#60A5FA" },
          { label: "Critical", value: criticalCount, color: "#F87171" },
          {
            label: "Warning",
            value: alerts.length - criticalCount,
            color: "#FBBF24",
          },
          {
            label: "Providers Affected",
            value: new Set(alerts.map((a) => a.providerId)).size,
            color: "#A78BFA",
          },
        ]}
      />

      <div style={{ padding: "20px" }}>
        {/* Filter buttons */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
          {(["All", "Critical", "Warning"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              data-ocid={`deviation_alerts.${f.toLowerCase()}.tab`}
              style={{
                padding: "6px 16px",
                borderRadius: "6px",
                fontSize: "0.75rem",
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.2s",
                background:
                  filter === f
                    ? "rgba(96,165,250,0.2)"
                    : "rgba(255,255,255,0.05)",
                color: filter === f ? "#60A5FA" : "rgba(255,255,255,0.45)",
                border:
                  filter === f
                    ? "1px solid rgba(96,165,250,0.4)"
                    : "1px solid rgba(255,255,255,0.1)",
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div
            style={{ ...GLASS_CARD, padding: "40px", textAlign: "center" }}
            data-ocid="deviation_alerts.empty_state"
          >
            <CheckCircle2
              className="w-8 h-8 mx-auto mb-3"
              style={{ color: "#34D399" }}
            />
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem" }}>
              No {filter !== "All" ? filter.toLowerCase() : ""} deviations
              detected for this period.
            </p>
          </div>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            {filtered.map((alert, idx) => (
              <div
                key={`${alert.providerId}-${alert.indicator}`}
                data-ocid={`deviation_alerts.item.${idx + 1}`}
                style={{
                  ...GLASS_CARD,
                  borderLeft: `4px solid ${alert.severity === "critical" ? "#F87171" : "#FBBF24"}`,
                  padding: "16px 20px",
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: "16px",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      marginBottom: "6px",
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 700,
                        color: "#E2E8F0",
                        fontSize: "0.85rem",
                      }}
                    >
                      {alert.providerName}
                    </span>
                    <span
                      style={{
                        background: "rgba(96,165,250,0.12)",
                        color: "#60A5FA",
                        border: "1px solid rgba(96,165,250,0.2)",
                        borderRadius: "4px",
                        padding: "1px 7px",
                        fontSize: "0.68rem",
                        fontWeight: 600,
                      }}
                    >
                      NSW
                    </span>
                    {alert.severity === "critical" ? (
                      <span
                        style={{
                          background: "rgba(248,113,113,0.15)",
                          color: "#F87171",
                          border: "1px solid rgba(248,113,113,0.3)",
                          borderRadius: "4px",
                          padding: "2px 8px",
                          fontSize: "0.7rem",
                          fontWeight: 700,
                        }}
                      >
                        &#9888; Critical
                      </span>
                    ) : (
                      <span
                        style={{
                          background: "rgba(251,191,36,0.15)",
                          color: "#FBBF24",
                          border: "1px solid rgba(251,191,36,0.3)",
                          borderRadius: "4px",
                          padding: "2px 8px",
                          fontSize: "0.7rem",
                          fontWeight: 700,
                        }}
                      >
                        &#9888; Warning
                      </span>
                    )}
                  </div>
                  <p
                    style={{
                      fontSize: "0.8rem",
                      color: "rgba(255,255,255,0.7)",
                      margin: 0,
                      marginBottom: "8px",
                    }}
                  >
                    {alert.message}
                  </p>
                  <div
                    style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}
                  >
                    <span
                      style={{
                        fontSize: "0.72rem",
                        color: "rgba(255,255,255,0.4)",
                      }}
                    >
                      Indicator:{" "}
                      <strong style={{ color: "rgba(255,255,255,0.7)" }}>
                        {alert.indicator}
                      </strong>
                    </span>
                    <span
                      style={{
                        fontSize: "0.72rem",
                        color: "rgba(255,255,255,0.4)",
                      }}
                    >
                      Previous:{" "}
                      <strong
                        style={{
                          color: "rgba(255,255,255,0.7)",
                          fontFamily: "'Geist Mono', monospace",
                        }}
                      >
                        {alert.previousValue.toFixed(1)}
                      </strong>
                    </span>
                    <span
                      style={{
                        fontSize: "0.72rem",
                        color: "rgba(255,255,255,0.4)",
                      }}
                    >
                      Current:{" "}
                      <strong
                        style={{
                          color: "rgba(255,255,255,0.7)",
                          fontFamily: "'Geist Mono', monospace",
                        }}
                      >
                        {alert.currentValue.toFixed(1)}
                      </strong>
                    </span>
                  </div>
                </div>
                <div
                  style={{
                    flexShrink: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  {alert.direction === "spike" ? (
                    <TrendingUp
                      className="w-6 h-6"
                      style={{ color: "#F87171" }}
                    />
                  ) : (
                    <TrendingDown
                      className="w-6 h-6"
                      style={{ color: "#F87171" }}
                    />
                  )}
                  <span
                    style={{
                      fontFamily: "'Geist Mono', monospace",
                      fontWeight: 800,
                      fontSize: "1rem",
                      color: "#F87171",
                    }}
                  >
                    {alert.percentChange > 0 ? "+" : ""}
                    {alert.percentChange.toFixed(1)}%
                  </span>
                  <span
                    style={{
                      fontSize: "0.65rem",
                      color: "rgba(255,255,255,0.3)",
                    }}
                  >
                    change
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Tab 3: Decision Support
function DecisionSupportTab({
  recommendations,
}: {
  recommendations: Array<
    DecisionRecommendation & { stars: number; predictedRisk: string }
  >;
}) {
  const [priorityFilter, setPriorityFilter] = useState<
    "All" | "High" | "Medium" | "Low"
  >("All");
  const [selectedRec, setSelectedRec] = useState<
    (typeof recommendations)[0] | null
  >(null);
  const [expandedExplanations, setExpandedExplanations] = useState<Set<string>>(
    new Set(),
  );

  const highCount = recommendations.filter((r) => r.priority === "High").length;
  const medCount = recommendations.filter(
    (r) => r.priority === "Medium",
  ).length;
  const lowCount = recommendations.filter((r) => r.priority === "Low").length;

  const filtered =
    priorityFilter === "All"
      ? recommendations
      : recommendations.filter((r) => r.priority === priorityFilter);

  return (
    <div style={PAGE_BG}>
      <SectionHeader
        icon={Lightbulb}
        title="AI Decision Support System"
        subtitle="AI-generated actionable recommendations based on integrated risk, trend, and performance analysis"
        color="#34D399"
        extra={
          <Button
            variant="outline"
            size="sm"
            data-ocid="decision_support.export.button"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.15)",
              color: "rgba(255,255,255,0.6)",
              fontSize: "0.72rem",
              gap: "5px",
            }}
          >
            <Download className="w-3.5 h-3.5" /> Export
          </Button>
        }
      />
      <KpiRow
        items={[
          { label: "High Priority", value: highCount, color: "#F87171" },
          { label: "Medium Priority", value: medCount, color: "#FBBF24" },
          { label: "Low Priority", value: lowCount, color: "#34D399" },
          {
            label: "Total Providers",
            value: recommendations.length,
            color: "#60A5FA",
          },
        ]}
      />

      <div style={{ padding: "20px" }}>
        {/* Priority filter */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
          {(["All", "High", "Medium", "Low"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setPriorityFilter(f)}
              data-ocid={`decision_support.${f.toLowerCase()}.tab`}
              style={{
                padding: "6px 16px",
                borderRadius: "6px",
                fontSize: "0.75rem",
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.2s",
                background:
                  priorityFilter === f
                    ? "rgba(96,165,250,0.2)"
                    : "rgba(255,255,255,0.05)",
                color:
                  priorityFilter === f ? "#60A5FA" : "rgba(255,255,255,0.45)",
                border:
                  priorityFilter === f
                    ? "1px solid rgba(96,165,250,0.4)"
                    : "1px solid rgba(255,255,255,0.1)",
              }}
            >
              {f === "All"
                ? "All Priorities"
                : `${f === "High" ? "🔴" : f === "Medium" ? "🟡" : "🟢"} ${f}`}
            </button>
          ))}
        </div>

        <div style={GLASS_CARD}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {[
                  "Provider",
                  "Stars",
                  "Predicted Risk",
                  "Recommended Action",
                  "Priority",
                  "Explanation",
                ].map((h) => (
                  <th key={h} style={TABLE_HEAD}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((rec, idx) => {
                const isExpanded = expandedExplanations.has(rec.providerId);
                return (
                  <tr
                    key={rec.providerId}
                    data-ocid={`decision_support.item.${idx + 1}`}
                    onClick={() => setSelectedRec(rec)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") setSelectedRec(rec);
                    }}
                    tabIndex={0}
                    style={{
                      cursor: "pointer",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        "rgba(255,255,255,0.04)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "";
                    }}
                  >
                    <td
                      style={{
                        ...TABLE_CELL,
                        fontWeight: 600,
                        color: "#E2E8F0",
                      }}
                    >
                      {rec.providerName}
                    </td>
                    <td
                      style={{
                        ...TABLE_CELL,
                        fontFamily: "'Geist Mono', monospace",
                        color: "#FBBF24",
                        fontWeight: 700,
                      }}
                    >
                      {rec.stars.toFixed(1)} ★
                    </td>
                    <td style={TABLE_CELL}>
                      <RiskBadge
                        risk={rec.predictedRisk as "Low" | "Medium" | "High"}
                      />
                    </td>
                    <td style={TABLE_CELL}>
                      <ActionBadge type={rec.actionType} action={rec.action} />
                    </td>
                    <td style={TABLE_CELL}>
                      <PriorityBadge priority={rec.priority} />
                    </td>
                    <td style={{ ...TABLE_CELL, maxWidth: "260px" }}>
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          const next = new Set(expandedExplanations);
                          if (isExpanded) next.delete(rec.providerId);
                          else next.add(rec.providerId);
                          setExpandedExplanations(next);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.stopPropagation();
                            const next = new Set(expandedExplanations);
                            if (isExpanded) next.delete(rec.providerId);
                            else next.add(rec.providerId);
                            setExpandedExplanations(next);
                          }
                        }}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "6px",
                          cursor: "pointer",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "0.72rem",
                            color: "rgba(255,255,255,0.5)",
                            lineHeight: 1.4,
                            flex: 1,
                            overflow: isExpanded ? "visible" : "hidden",
                            textOverflow: isExpanded ? "clip" : "ellipsis",
                            whiteSpace: isExpanded ? "normal" : "nowrap",
                          }}
                        >
                          {rec.explanation}
                        </span>
                        {isExpanded ? (
                          <ChevronUp
                            className="w-3.5 h-3.5"
                            style={{
                              color: "rgba(255,255,255,0.3)",
                              flexShrink: 0,
                              marginTop: "1px",
                            }}
                          />
                        ) : (
                          <ChevronDown
                            className="w-3.5 h-3.5"
                            style={{
                              color: "rgba(255,255,255,0.3)",
                              flexShrink: 0,
                              marginTop: "1px",
                            }}
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedRec && (
        <Dialog open={!!selectedRec} onOpenChange={() => setSelectedRec(null)}>
          <DialogContent
            style={{
              background: "#0d1528",
              border: "1px solid rgba(99,179,237,0.25)",
              borderRadius: "12px",
              maxWidth: "520px",
              color: "#E2E8F0",
            }}
            data-ocid="decision_support.dialog"
          >
            <DialogHeader>
              <DialogTitle style={{ color: "#F1F5F9", fontSize: "1.05rem" }}>
                Decision Recommendation
              </DialogTitle>
            </DialogHeader>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "14px" }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "8px",
                }}
              >
                <span
                  style={{
                    fontWeight: 700,
                    color: "#E2E8F0",
                    fontSize: "0.95rem",
                  }}
                >
                  {selectedRec.providerName}
                </span>
                <div style={{ display: "flex", gap: "6px" }}>
                  <PriorityBadge priority={selectedRec.priority} />
                  <ActionBadge
                    type={selectedRec.actionType}
                    action={selectedRec.action}
                  />
                </div>
              </div>

              <div
                style={{
                  background: "rgba(255,255,255,0.04)",
                  borderRadius: "8px",
                  padding: "12px",
                  borderLeft: "3px solid rgba(96,165,250,0.5)",
                }}
              >
                <p
                  style={{
                    fontSize: "0.82rem",
                    color: "rgba(255,255,255,0.7)",
                    margin: 0,
                    lineHeight: 1.5,
                  }}
                >
                  {selectedRec.explanation}
                </p>
              </div>

              <div>
                <p
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    color: "rgba(255,255,255,0.4)",
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                    marginBottom: "8px",
                  }}
                >
                  Action Details
                </p>
                <ul
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                    margin: 0,
                    padding: 0,
                    listStyle: "none",
                  }}
                >
                  {selectedRec.details.map((detail, i) => (
                    <li
                      key={`detail-${detail.slice(0, 15)}-${i}`}
                      style={{
                        fontSize: "0.78rem",
                        color: "rgba(255,255,255,0.65)",
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "8px",
                      }}
                    >
                      <span
                        style={{
                          color: "#60A5FA",
                          flexShrink: 0,
                          marginTop: "2px",
                        }}
                      >
                        ›
                      </span>
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>

              <div style={{ display: "flex", gap: "10px", paddingTop: "4px" }}>
                <div
                  style={{
                    flex: 1,
                    background: "rgba(255,255,255,0.04)",
                    borderRadius: "8px",
                    padding: "10px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.65rem",
                      color: "rgba(255,255,255,0.35)",
                      textTransform: "uppercase",
                      letterSpacing: "0.07em",
                    }}
                  >
                    Current Stars
                  </div>
                  <div
                    style={{
                      fontFamily: "'Geist Mono', monospace",
                      fontWeight: 800,
                      color: "#FBBF24",
                      fontSize: "1.1rem",
                    }}
                  >
                    {selectedRec.stars.toFixed(1)} ★
                  </div>
                </div>
                <div
                  style={{
                    flex: 1,
                    background: "rgba(255,255,255,0.04)",
                    borderRadius: "8px",
                    padding: "10px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.65rem",
                      color: "rgba(255,255,255,0.35)",
                      textTransform: "uppercase",
                      letterSpacing: "0.07em",
                    }}
                  >
                    Predicted Risk
                  </div>
                  <div
                    style={{
                      fontFamily: "'Geist Mono', monospace",
                      fontWeight: 800,
                      color:
                        selectedRec.predictedRisk === "High"
                          ? "#F87171"
                          : selectedRec.predictedRisk === "Medium"
                            ? "#FBBF24"
                            : "#34D399",
                      fontSize: "1.1rem",
                    }}
                  >
                    {selectedRec.predictedRisk}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedRec(null)}
                data-ocid="decision_support.close_button"
                style={{
                  width: "100%",
                  background: "rgba(96,165,250,0.1)",
                  border: "1px solid rgba(96,165,250,0.25)",
                  borderRadius: "7px",
                  color: "#60A5FA",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  padding: "10px",
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// ── Main Component
export default function RegulatorIntelligence({ currentQuarter }: Props) {
  const previousQuarter = getPreviousQuarter(currentQuarter);
  const quartersForPrediction = getQuartersUpTo(currentQuarter);

  // Compute all predictions
  const predictions = useMemo(() => {
    return PROVIDER_MASTER.map((prov) => {
      const rating = getProviderRatingForQuarter(prov.id, currentQuarter);
      const pred = predictProviderRisk(
        prov.id,
        prov.name,
        quartersForPrediction,
      );
      return {
        ...pred,
        name: prov.name,
        state: prov.state,
        stars: rating.stars,
      };
    }).sort((a, b) => {
      const order = { High: 0, Medium: 1, Low: 2 };
      return order[a.predictedRisk] - order[b.predictedRisk];
    });
  }, [currentQuarter, quartersForPrediction]);

  // Compute all deviations
  const deviationAlerts = useMemo(() => {
    const all: DeviationAlert[] = [];
    for (const prov of PROVIDER_MASTER) {
      const alerts = detectDeviations(
        prov.id,
        prov.name,
        currentQuarter,
        previousQuarter,
      );
      all.push(...alerts);
    }
    return all.sort(
      (a, b) =>
        (a.severity === "critical" ? -1 : 1) -
        (b.severity === "critical" ? -1 : 1),
    );
  }, [currentQuarter, previousQuarter]);

  // Compute all recommendations
  const recommendations = useMemo(() => {
    return PROVIDER_MASTER.map((prov) => {
      const rating = getProviderRatingForQuarter(prov.id, currentQuarter);
      const pred = predictions.find((p) => p.providerId === prov.id);
      const provAlerts = deviationAlerts.filter(
        (a) => a.providerId === prov.id,
      );
      const rec = generateRecommendation(
        prov.id,
        prov.name,
        rating.stars,
        pred?.predictedRisk ?? "Low",
        provAlerts,
        currentQuarter,
      );
      return {
        ...rec,
        stars: rating.stars,
        predictedRisk: pred?.predictedRisk ?? "Low",
      };
    }).sort((a, b) => {
      const order = { High: 0, Medium: 1, Low: 2 };
      return order[a.priority] - order[b.priority];
    });
  }, [currentQuarter, predictions, deviationAlerts]);

  return (
    <div style={PAGE_BG}>
      {/* Page hero */}
      <div
        style={{
          background:
            "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)",
          borderBottom: "1px solid rgba(99,179,237,0.2)",
          padding: "20px 28px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.1,
            backgroundImage:
              "radial-gradient(rgba(99,179,237,0.6) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            pointerEvents: "none",
          }}
        />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "6px",
            }}
          >
            <Brain className="w-5 h-5" style={{ color: "#A78BFA" }} />
            <span
              style={{
                fontSize: "0.65rem",
                fontWeight: 700,
                color: "rgba(167,139,250,0.8)",
                textTransform: "uppercase",
                letterSpacing: "0.18em",
              }}
            >
              REGULATOR INTELLIGENCE
            </span>
          </div>
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: 900,
              color: "#F1F5F9",
              marginBottom: "4px",
            }}
          >
            Intelligence Command
          </h1>
          <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.45)" }}>
            AI-powered risk prediction, deviation detection, and decision
            support for {currentQuarter}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="predictions" className="w-full">
        <div
          style={{
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.02)",
          }}
        >
          <TabsList
            style={{
              background: "transparent",
              borderRadius: 0,
              height: "auto",
              padding: "0 24px",
              gap: "0",
            }}
          >
            {[
              {
                value: "predictions",
                label: "Risk Predictions",
                icon: Brain,
                color: "#A78BFA",
                ocid: "regulator_intelligence.predictions.tab",
              },
              {
                value: "deviations",
                label: "Deviation Alerts",
                icon: Zap,
                color: "#FBBF24",
                ocid: "regulator_intelligence.deviations.tab",
              },
              {
                value: "decisions",
                label: "Decision Support",
                icon: Lightbulb,
                color: "#34D399",
                ocid: "regulator_intelligence.decisions.tab",
              },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  data-ocid={tab.ocid}
                  style={{
                    borderRadius: 0,
                    padding: "14px 20px",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    color: "rgba(255,255,255,0.45)",
                    gap: "7px",
                    borderBottom: "2px solid transparent",
                    transition: "all 0.2s",
                    background: "transparent",
                  }}
                  className="data-[state=active]:text-white data-[state=active]:border-b-2"
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                  {tab.value === "deviations" && deviationAlerts.length > 0 && (
                    <span
                      style={{
                        background: "rgba(248,113,113,0.2)",
                        color: "#F87171",
                        border: "1px solid rgba(248,113,113,0.3)",
                        borderRadius: "20px",
                        padding: "0 7px",
                        fontSize: "0.65rem",
                        fontWeight: 700,
                      }}
                    >
                      {
                        deviationAlerts.filter((a) => a.severity === "critical")
                          .length
                      }
                    </span>
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        <TabsContent value="predictions" style={{ margin: 0 }}>
          <RiskPredictionsTab predictions={predictions} />
        </TabsContent>
        <TabsContent value="deviations" style={{ margin: 0 }}>
          <DeviationAlertsTab
            alerts={deviationAlerts}
            currentQuarter={currentQuarter}
            previousQuarter={previousQuarter}
          />
        </TabsContent>
        <TabsContent value="decisions" style={{ margin: 0 }}>
          <DecisionSupportTab recommendations={recommendations} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
