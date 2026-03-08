import { StarRating } from "@/components/ui/StarRating";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type {
  HighPerformanceAlert,
  LowPerformanceAlert,
  PerformanceAlert,
} from "@/utils/performanceAlerts";
import { AlertTriangle, CheckCircle, TrendingUp } from "lucide-react";

// ── Props ──────────────────────────────────────────────────────────────────────

interface PerformanceAlertModalProps {
  open: boolean;
  onClose: () => void;
  alert: PerformanceAlert | null;
}

// ── Color palette per alert type ──────────────────────────────────────────────

const THEME = {
  high: {
    headerBg: "oklch(0.26 0.08 145)",
    headerText: "#fff",
    accentBorder: "oklch(0.52 0.15 145)",
    accentBg: "oklch(0.95 0.04 145)",
    accentText: "oklch(0.25 0.14 145)",
    badgeBg: "oklch(0.88 0.10 145)",
    badgeColor: "oklch(0.20 0.16 145)",
    icon: CheckCircle,
    iconColor: "#fff",
  },
  moderate: {
    headerBg: "oklch(0.46 0.14 72)",
    headerText: "#fff",
    accentBorder: "oklch(0.70 0.14 72)",
    accentBg: "oklch(0.97 0.04 80)",
    accentText: "oklch(0.35 0.14 72)",
    badgeBg: "oklch(0.94 0.08 80)",
    badgeColor: "oklch(0.40 0.14 72)",
    icon: AlertTriangle,
    iconColor: "#fff",
  },
  low: {
    headerBg: "oklch(0.40 0.20 25)",
    headerText: "#fff",
    accentBorder: "oklch(0.55 0.22 25)",
    accentBg: "oklch(0.97 0.025 25)",
    accentText: "oklch(0.28 0.18 25)",
    badgeBg: "oklch(0.93 0.08 25)",
    badgeColor: "oklch(0.35 0.20 25)",
    icon: AlertTriangle,
    iconColor: "#fff",
  },
};

// ── Helper: score row for high performance table ──────────────────────────────

function ScoreRow({ label, score }: { label: string; score: number }) {
  return (
    <tr>
      <td
        className="py-2 pr-4 text-xs font-semibold"
        style={{ color: "oklch(0.28 0.06 254)" }}
      >
        {label}
      </td>
      <td className="py-2 pr-4">
        <StarRating value={score} size="sm" showLabel={false} />
      </td>
      <td
        className="py-2 text-right text-xs font-bold tabular-nums"
        style={{ color: "oklch(0.38 0.14 145)" }}
      >
        {score.toFixed(1)}&thinsp;/ 5
      </td>
    </tr>
  );
}

// ── Helper: value comparison row for low performance ─────────────────────────

function ComparisonRow({
  label,
  value,
  benchmark,
  unit,
  isLowerBetter,
}: {
  label: string;
  value: number;
  benchmark: number;
  unit?: string;
  isLowerBetter: boolean;
}) {
  const isWorse = isLowerBetter ? value > benchmark : value < benchmark;
  const valueColor = isWorse ? "oklch(0.40 0.20 25)" : "oklch(0.38 0.14 145)";
  const benchColor = "oklch(0.30 0.06 254)";
  const suffix = unit ? `\u2009${unit}` : "";

  return (
    <div className="grid grid-cols-2 gap-2">
      <div
        className="p-3 border rounded-sm text-center"
        style={{
          background: isWorse
            ? "oklch(0.96 0.035 25)"
            : "oklch(0.97 0.005 240)",
          borderColor: isWorse ? "oklch(0.72 0.18 25)" : "oklch(0.82 0.02 240)",
        }}
      >
        <div
          className="text-xs uppercase tracking-wide font-bold mb-0.5"
          style={{ color: "oklch(0.50 0.02 240)" }}
        >
          Provider
        </div>
        <div
          className="text-2xl font-black tabular-nums"
          style={{ color: valueColor }}
        >
          {value.toFixed(1)}
          {suffix}
        </div>
        {isWorse && (
          <div
            className="text-xs mt-0.5 font-semibold"
            style={{ color: valueColor }}
          >
            ▲ Above benchmark
          </div>
        )}
      </div>
      <div
        className="p-3 border rounded-sm text-center"
        style={{
          background: "oklch(0.97 0.01 254)",
          borderColor: "oklch(0.82 0.04 254)",
        }}
      >
        <div
          className="text-xs uppercase tracking-wide font-bold mb-0.5"
          style={{ color: "oklch(0.50 0.02 240)" }}
        >
          Benchmark
        </div>
        <div
          className="text-2xl font-black tabular-nums"
          style={{ color: benchColor }}
        >
          {benchmark.toFixed(1)}
          {suffix}
        </div>
        <div
          className="text-xs mt-0.5"
          style={{ color: "oklch(0.50 0.02 240)" }}
        >
          {label}
        </div>
      </div>
    </div>
  );
}

// ── Main Modal ─────────────────────────────────────────────────────────────────

export function PerformanceAlertModal({
  open,
  onClose,
  alert,
}: PerformanceAlertModalProps) {
  if (!alert) return null;

  const isHigh = alert.type === "high";
  const theme = THEME[alert.type];
  const Icon = theme.icon;
  const highAlert = isHigh ? (alert as HighPerformanceAlert) : null;
  const lowAlert = !isHigh ? (alert as LowPerformanceAlert) : null;

  const titleText = isHigh
    ? "Excellent Performance Detected"
    : alert.type === "low"
      ? "Performance Alert"
      : "Performance Caution";

  const subtitleText = isHigh
    ? "This provider has an overall rating above 4.5 and is performing significantly better than the regional benchmark."
    : alert.type === "low"
      ? "A critical performance concern has been identified for this provider. Immediate review is recommended."
      : "A performance risk has been identified. Monitoring and targeted improvement are advised.";

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <DialogContent
        className="rounded-none max-w-lg p-0 overflow-hidden"
        data-ocid="performance_alert.dialog"
        style={{
          border: `2px solid ${theme.accentBorder}`,
          boxShadow: "0 8px 40px oklch(0.10 0.04 254 / 0.18)",
        }}
      >
        {/* ── Header band ─────────────────────────────────────────── */}
        <div
          className="px-5 py-4 flex items-start gap-3"
          style={{ background: theme.headerBg }}
        >
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{
              background: isHigh
                ? "oklch(0.38 0.14 145)"
                : "rgba(255,255,255,0.15)",
              border: "1.5px solid rgba(255,255,255,0.30)",
            }}
          >
            <Icon className="w-5 h-5" style={{ color: theme.iconColor }} />
          </div>
          <div className="flex-1 min-w-0">
            <DialogHeader>
              <DialogTitle
                className="text-sm font-bold uppercase tracking-widest leading-snug"
                style={{ color: theme.headerText }}
              >
                {titleText}
              </DialogTitle>
            </DialogHeader>
            <p
              className="text-xs mt-1 leading-relaxed"
              style={{ color: "rgba(255,255,255,0.82)" }}
            >
              {subtitleText}
            </p>
          </div>
          {isHigh && (
            <TrendingUp
              className="w-5 h-5 flex-shrink-0 mt-1"
              style={{ color: "oklch(0.70 0.18 145)" }}
            />
          )}
        </div>

        {/* ── Body ───────────────────────────────────────────────── */}
        <div className="px-5 py-4 space-y-4">
          {/* Provider name pill */}
          <div className="flex items-center gap-2">
            <span
              className="text-xs uppercase tracking-wider font-bold"
              style={{ color: "oklch(0.50 0.025 250)" }}
            >
              Provider
            </span>
            <span
              className="px-2.5 py-1 text-xs font-bold rounded-sm border"
              style={{
                background: theme.badgeBg,
                color: theme.badgeColor,
                borderColor: theme.accentBorder,
              }}
            >
              {alert.providerName}
            </span>
          </div>

          {/* HIGH: Overall rating + top indicators ──────────────── */}
          {isHigh && highAlert && (
            <>
              <div
                className="flex items-center gap-4 px-3 py-3 border-l-4"
                style={{
                  background: theme.accentBg,
                  borderLeftColor: theme.accentBorder,
                }}
              >
                <div>
                  <div
                    className="text-xs uppercase tracking-wide font-bold mb-0.5"
                    style={{ color: "oklch(0.46 0.025 250)" }}
                  >
                    Overall Rating
                  </div>
                  <div
                    className="text-4xl font-black tabular-nums leading-none"
                    style={{ color: theme.accentText }}
                  >
                    {highAlert.overallRating.toFixed(2)}
                  </div>
                  <div
                    className="text-xs mt-0.5"
                    style={{ color: "oklch(0.55 0.02 240)" }}
                  >
                    out of 5.0
                  </div>
                </div>
                <div className="flex-1">
                  <StarRating
                    value={highAlert.overallRating}
                    size="lg"
                    showLabel={false}
                  />
                  <div
                    className="text-xs mt-1.5 font-semibold"
                    style={{ color: theme.accentText }}
                  >
                    Excellent — Above Regional Benchmark
                  </div>
                </div>
              </div>

              <div>
                <div
                  className="text-xs uppercase tracking-wider font-bold mb-2"
                  style={{ color: "oklch(0.46 0.025 250)" }}
                >
                  Key Indicators Contributing to High Performance
                </div>
                <table className="w-full">
                  <tbody>
                    {highAlert.topIndicators.map((ind) => (
                      <ScoreRow
                        key={ind.label}
                        label={ind.label}
                        score={ind.score}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* LOW / MODERATE: indicator details ─────────────────── */}
          {!isHigh && lowAlert && (
            <>
              {/* Indicator name */}
              <div
                className="px-3 py-2.5 border-l-4 text-xs font-bold uppercase tracking-wider"
                style={{
                  borderLeftColor: theme.accentBorder,
                  background: theme.accentBg,
                  color: theme.accentText,
                }}
              >
                {lowAlert.indicatorName}
              </div>

              {/* Benchmark comparison */}
              <ComparisonRow
                label="Regional Benchmark"
                value={lowAlert.providerValue}
                benchmark={lowAlert.benchmarkValue}
                unit={lowAlert.unit}
                isLowerBetter={lowAlert.isLowerBetter}
              />

              {/* Suggested improvement */}
              <div
                className="p-3 text-xs leading-relaxed border-l-4"
                style={{
                  background: "oklch(0.97 0.01 254)",
                  borderLeftColor: "oklch(var(--gov-navy))",
                  color: "oklch(0.28 0.06 254)",
                }}
              >
                <div
                  className="text-xs uppercase tracking-wider font-bold mb-1"
                  style={{ color: "oklch(var(--gov-navy))" }}
                >
                  Suggested Improvement Area
                </div>
                {lowAlert.suggestedImprovement}
              </div>
            </>
          )}
        </div>

        {/* ── Footer ─────────────────────────────────────────────── */}
        <div
          className="px-5 py-3 flex items-center justify-between border-t"
          style={{
            background: "oklch(0.97 0.005 254)",
            borderColor: "oklch(0.90 0.012 240)",
          }}
        >
          {!isHigh && (
            <span className="text-xs" style={{ color: "oklch(0.55 0.02 240)" }}>
              View the full provider scorecard for complete details.
            </span>
          )}
          {isHigh && (
            <span
              className="text-xs font-semibold"
              style={{ color: "oklch(0.38 0.14 145)" }}
            >
              ✓ Performance confirmed against national benchmarks
            </span>
          )}
          <Button
            size="sm"
            variant="outline"
            className="rounded-none text-xs font-semibold ml-auto"
            style={{
              borderColor: "oklch(var(--gov-navy))",
              color: "oklch(var(--gov-navy))",
            }}
            onClick={onClose}
            data-ocid="performance_alert.close_button"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
