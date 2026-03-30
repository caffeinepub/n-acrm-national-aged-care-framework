/**
 * N-ACRM Global Design System Components
 * All modules should use these primitives for visual consistency.
 */

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

// ─────────────────────────────────────────────────────────────
// DSCard
// ─────────────────────────────────────────────────────────────
export interface DSCardProps {
  children: ReactNode;
  className?: string;
  /** glass = semi-transparent glassmorphism style (for dark backgrounds) */
  glass?: boolean;
  /** hover = lift + shadow on hover */
  hover?: boolean;
  /** accent color for left border stripe (e.g. '#1E3A8A', 'oklch(...)') */
  accent?: string;
}

export function DSCard({
  children,
  className,
  glass = false,
  hover = true,
  accent,
}: DSCardProps) {
  return (
    <div
      className={cn(
        glass
          ? "ds-card-glass"
          : "ds-card bg-white border border-[oklch(90%_0.01_252)] rounded-lg",
        hover &&
          "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
        className,
      )}
      style={accent ? { borderLeft: `3px solid ${accent}` } : undefined}
    >
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// DSKpiCard
// ─────────────────────────────────────────────────────────────
export interface DSKpiCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  /** accent stripe color at top */
  accentColor?: string;
  subtitle?: string;
  trend?: { value: number; label: string };
  className?: string;
}

export function DSKpiCard({
  title,
  value,
  icon,
  accentColor,
  subtitle,
  trend,
  className,
}: DSKpiCardProps) {
  const trendPositive = trend && trend.value >= 0;

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-white border border-[oklch(90%_0.01_252)] rounded-lg",
        "shadow-[0_1px_3px_oklch(0%_0_0/0.08)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_8px_24px_oklch(0%_0_0/0.12)]",
        className,
      )}
    >
      {accentColor && (
        <div
          className="absolute inset-x-0 top-0 h-[3px]"
          style={{ background: accentColor }}
        />
      )}
      <div className="p-4 pt-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[oklch(50%_0.022_252)] truncate">
              {title}
            </p>
            <p className="mt-1.5 text-2xl font-extrabold text-[oklch(18%_0.055_258)] font-mono tabular-nums leading-none">
              {value}
            </p>
            {subtitle && (
              <p className="mt-1 text-[11px] text-[oklch(52%_0.02_252)]">
                {subtitle}
              </p>
            )}
          </div>
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{
              background: accentColor
                ? `${accentColor}18`
                : "oklch(94% 0.018 258)",
            }}
          >
            <span style={{ color: accentColor ?? "oklch(22% 0.07 258)" }}>
              {icon}
            </span>
          </div>
        </div>
        {trend && (
          <div className="mt-2 flex items-center gap-1">
            <span
              className={cn(
                "text-[11px] font-semibold px-1.5 py-0.5 rounded-full",
                trendPositive
                  ? "bg-[oklch(94%_0.06_145)] text-[oklch(28%_0.14_145)]"
                  : "bg-[oklch(95%_0.06_25)] text-[oklch(30%_0.18_25)]",
              )}
            >
              {trendPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
            </span>
            <span className="text-[10px] text-[oklch(56%_0.02_252)]">
              {trend.label}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// DSBadge
// ─────────────────────────────────────────────────────────────
export type DSBadgeVariant =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "gold"
  | "neutral"
  | "navy";

const DS_BADGE_STYLES: Record<DSBadgeVariant, string> = {
  success:
    "bg-[oklch(94%_0.06_145)] text-[oklch(28%_0.14_145)] border border-[oklch(84%_0.1_145)]",
  warning:
    "bg-[oklch(95%_0.06_78)] text-[oklch(38%_0.14_72)] border border-[oklch(86%_0.1_78)]",
  danger:
    "bg-[oklch(95%_0.06_25)] text-[oklch(30%_0.18_25)] border border-[oklch(86%_0.1_25)]",
  info: "bg-[oklch(94%_0.05_230)] text-[oklch(28%_0.14_230)] border border-[oklch(84%_0.08_230)]",
  gold: "bg-[oklch(96%_0.05_88)] text-[oklch(38%_0.15_82)] border border-[oklch(88%_0.1_88)]",
  neutral:
    "bg-[oklch(94%_0.006_252)] text-[oklch(44%_0.018_252)] border border-[oklch(86%_0.008_252)]",
  navy: "bg-[oklch(20%_0.065_258)] text-[oklch(92%_0.01_252)] border border-[oklch(26%_0.065_258)]",
};

export interface DSBadgeProps {
  variant?: DSBadgeVariant;
  size?: "sm" | "md";
  children: ReactNode;
  className?: string;
}

export function DSBadge({
  variant = "neutral",
  size = "sm",
  children,
  className,
}: DSBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-semibold rounded-full",
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",
        DS_BADGE_STYLES[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// DSButton
// ─────────────────────────────────────────────────────────────
export interface DSButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
}

const DS_BUTTON_VARIANTS = {
  primary:
    "bg-[oklch(22%_0.07_258)] hover:bg-[oklch(26%_0.08_258)] text-white border-transparent shadow-sm",
  secondary:
    "bg-white hover:bg-[oklch(96%_0.01_252)] text-[oklch(22%_0.07_258)] border-[oklch(82%_0.022_254)]",
  ghost:
    "bg-transparent hover:bg-[oklch(95%_0.008_252)] text-[oklch(30%_0.06_258)] border-transparent",
  danger:
    "bg-[oklch(52%_0.22_25)] hover:bg-[oklch(46%_0.22_25)] text-white border-transparent shadow-sm",
};
const DS_BUTTON_SIZES = {
  sm: "h-7 px-3 text-[11px] gap-1.5",
  md: "h-8 px-4 text-xs gap-2",
  lg: "h-10 px-5 text-sm gap-2",
};

export function DSButton({
  variant = "primary",
  size = "md",
  children,
  className,
  ...rest
}: DSButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center justify-center font-semibold rounded-md border transition-all duration-150 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(22%_0.07_258)] disabled:opacity-50 disabled:pointer-events-none",
        DS_BUTTON_VARIANTS[variant],
        DS_BUTTON_SIZES[size],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// DSStatusChip
// ─────────────────────────────────────────────────────────────
export type DSStatusType = "good" | "moderate" | "needs-attention";

const DS_STATUS_STYLES: Record<
  DSStatusType,
  { chip: string; dot: string; label: string }
> = {
  good: {
    chip: "bg-[oklch(94%_0.06_145)] text-[oklch(28%_0.14_145)]",
    dot: "bg-[oklch(52%_0.16_145)]",
    label: "Good",
  },
  moderate: {
    chip: "bg-[oklch(95%_0.06_78)] text-[oklch(38%_0.14_72)]",
    dot: "bg-[oklch(70%_0.17_75)]",
    label: "Moderate",
  },
  "needs-attention": {
    chip: "bg-[oklch(95%_0.06_25)] text-[oklch(30%_0.18_25)]",
    dot: "bg-[oklch(52%_0.22_25)]",
    label: "Needs Attention",
  },
};

export interface DSStatusChipProps {
  status: DSStatusType;
  label?: string;
  className?: string;
}

export function DSStatusChip({ status, label, className }: DSStatusChipProps) {
  const styles = DS_STATUS_STYLES[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold",
        styles.chip,
        className,
      )}
    >
      <span
        className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", styles.dot)}
      />
      {label ?? styles.label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// DSLoadingSkeleton
// ─────────────────────────────────────────────────────────────
export interface DSLoadingSkeletonProps {
  className?: string;
  lines?: number;
  lineHeights?: string[];
}

export function DSLoadingSkeleton({
  className,
  lines = 3,
  lineHeights,
}: DSLoadingSkeletonProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }, (_, i) => i).map((i) => (
        <div
          key={String(i)}
          className="ds-skeleton rounded"
          style={{
            height: lineHeights?.[i] ?? (i === 0 ? "20px" : "14px"),
            width: i === lines - 1 && lines > 1 ? "65%" : "100%",
          }}
        />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// DSStarRating
// ─────────────────────────────────────────────────────────────
export interface DSStarRatingProps {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export function DSStarRating({
  value,
  max = 5,
  size = "md",
  showLabel = false,
  className,
}: DSStarRatingProps) {
  const sizeClasses = {
    sm: "text-[13px] gap-0.5",
    md: "text-base gap-0.5",
    lg: "text-xl gap-1",
  };
  const full = Math.floor(value);
  const half = value - full >= 0.25 && value - full < 0.75;
  const stars = Array.from({ length: max }, (_, i) => {
    if (i < full) return "full";
    if (i === full && half) return "half";
    return "empty";
  });

  return (
    <span
      className={cn("inline-flex items-center", sizeClasses[size], className)}
    >
      {stars.map((type, i) => (
        <span
          key={String(i)}
          style={{
            color:
              type === "empty" ? "oklch(82% 0.01 252)" : "oklch(76% 0.17 86)",
          }}
        >
          {type === "full" ? "★" : type === "half" ? "⭑" : "☆"}
        </span>
      ))}
      {showLabel && (
        <span className="ml-1.5 text-[11px] font-semibold text-[oklch(40%_0.035_252)]">
          {value.toFixed(1)}
        </span>
      )}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// DSRiskBadge
// ─────────────────────────────────────────────────────────────
export interface DSRiskBadgeProps {
  risk: "Low" | "Medium" | "High";
  className?: string;
}

const DS_RISK_STYLES = {
  Low: "bg-[oklch(94%_0.06_145)] text-[oklch(28%_0.14_145)] border border-[oklch(84%_0.1_145)]",
  Medium:
    "bg-[oklch(95%_0.06_78)] text-[oklch(38%_0.14_72)] border border-[oklch(86%_0.1_78)]",
  High: "bg-[oklch(95%_0.06_25)] text-[oklch(30%_0.18_25)] border border-[oklch(86%_0.1_25)]",
};

export function DSRiskBadge({ risk, className }: DSRiskBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold",
        DS_RISK_STYLES[risk],
        className,
      )}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{
          background:
            risk === "Low"
              ? "oklch(52% 0.16 145)"
              : risk === "Medium"
                ? "oklch(70% 0.17 75)"
                : "oklch(52% 0.22 25)",
        }}
      />
      {risk} Risk
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// DSPageHero — consistent page header band
// ─────────────────────────────────────────────────────────────
export interface DSPageHeroProps {
  title: string;
  subtitle?: string;
  badge?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function DSPageHero({
  title,
  subtitle,
  badge,
  actions,
  className,
}: DSPageHeroProps) {
  return (
    <div
      className={cn(
        "px-6 py-5 border-b flex items-center justify-between gap-4",
        className,
      )}
      style={{
        background:
          "linear-gradient(135deg, oklch(20% 0.065 258) 0%, oklch(26% 0.07 255) 100%)",
        borderBottomColor: "oklch(26% 0.065 258)",
      }}
    >
      <div className="flex items-center gap-3">
        {badge && <div>{badge}</div>}
        <div>
          <h1 className="text-base font-bold text-white leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p
              className="text-[11px] mt-0.5"
              style={{ color: "oklch(72% 0.03 252)" }}
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// DSSectionCard — card with header + body
// ─────────────────────────────────────────────────────────────
export interface DSSectionCardProps {
  title: ReactNode;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  noPadding?: boolean;
}

export function DSSectionCard({
  title,
  subtitle,
  actions,
  children,
  className,
  bodyClassName,
  noPadding,
}: DSSectionCardProps) {
  return (
    <div
      className={cn(
        "bg-white border border-[oklch(90%_0.01_252)] rounded-lg shadow-[0_1px_3px_oklch(0%_0_0/0.06)]",
        className,
      )}
    >
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{
          background: "oklch(98.8% 0.003 254)",
          borderBottomColor: "oklch(91% 0.008 252)",
        }}
      >
        <div>
          <div className="text-sm font-semibold text-[oklch(20%_0.065_258)] flex items-center gap-2">
            {title}
          </div>
          {subtitle && (
            <p className="text-[11px] text-[oklch(52%_0.02_252)] mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      <div className={cn(!noPadding && "p-4", bodyClassName)}>{children}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// DSEligibilityBadge — standardized incentive eligibility display
// ─────────────────────────────────────────────────────────────
export interface DSEligibilityBadgeProps {
  tier: string;
  eligible: boolean;
  size?: "sm" | "md";
  className?: string;
}

export function DSEligibilityBadge({
  tier,
  eligible,
  size = "sm",
  className,
}: DSEligibilityBadgeProps) {
  const isGold = tier.toLowerCase().includes("highly");
  const variant: DSBadgeVariant = !eligible
    ? "danger"
    : isGold
      ? "gold"
      : "success";
  const icon = !eligible ? "✗" : isGold ? "⭐" : "✓";
  return (
    <DSBadge variant={variant} size={size} className={className}>
      <span>{icon}</span>
      {tier}
    </DSBadge>
  );
}
