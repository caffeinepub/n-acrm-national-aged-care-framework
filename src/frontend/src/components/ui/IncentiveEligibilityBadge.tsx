interface IncentiveEligibilityBadgeProps {
  eligible: boolean;
  tier?: string;
  size?: "sm" | "md";
  showIcon?: boolean;
}

/**
 * Badge showing incentive eligibility status.
 * Supports: Highly Eligible (gold), Eligible (green), Not Eligible (red).
 */
export function IncentiveEligibilityBadge({
  eligible,
  tier,
  size = "sm",
  showIcon = true,
}: IncentiveEligibilityBadgeProps) {
  const sizeClass =
    size === "sm"
      ? "text-xs px-2 py-0.5 font-semibold"
      : "text-sm px-2.5 py-1 font-bold";

  const isHighlyEligible =
    eligible &&
    (tier === "Highly Eligible" ||
      tier === "Maximum Eligible" ||
      tier === "Bonus Eligible");

  if (isHighlyEligible) {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-sm ${sizeClass} whitespace-nowrap`}
        style={{
          background: "oklch(0.96 0.06 80)",
          color: "oklch(0.38 0.14 72)",
          border: "1px solid oklch(0.72 0.14 72)",
        }}
        data-ocid="incentive.highly_eligible.success_state"
      >
        {showIcon && <span className="font-bold">⭐</span>}
        {tier ?? "Highly Eligible"}
      </span>
    );
  }

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
        {showIcon && <span className="font-bold">✅</span>}
        Eligible
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
      Not Eligible
    </span>
  );
}
