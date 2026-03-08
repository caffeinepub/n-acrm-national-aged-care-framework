interface IncentiveEligibilityBadgeProps {
  eligible: boolean;
  size?: "sm" | "md";
  showIcon?: boolean;
}

/**
 * Badge showing "✓ Eligible for Incentive" (green) or "✗ Not Eligible for Incentive" (red).
 */
export function IncentiveEligibilityBadge({
  eligible,
  size = "sm",
  showIcon = true,
}: IncentiveEligibilityBadgeProps) {
  const sizeClass =
    size === "sm"
      ? "text-xs px-2 py-0.5 font-semibold"
      : "text-sm px-2.5 py-1 font-bold";

  if (eligible) {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-sm ${sizeClass} whitespace-nowrap`}
        style={{
          background: "oklch(0.93 0.07 145)",
          color: "oklch(0.28 0.14 145)",
          border: "1px solid oklch(0.72 0.12 145)",
        }}
        data-ocid="incentive.eligible.success_state"
      >
        {showIcon && <span className="font-bold">✓</span>}
        Eligible for Incentive
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-sm ${sizeClass} whitespace-nowrap`}
      style={{
        background: "oklch(0.95 0.06 25)",
        color: "oklch(0.42 0.20 25)",
        border: "1px solid oklch(0.72 0.16 25)",
      }}
      data-ocid="incentive.not_eligible.error_state"
    >
      {showIcon && <span className="font-bold">✗</span>}
      Not Eligible for Incentive
    </span>
  );
}
