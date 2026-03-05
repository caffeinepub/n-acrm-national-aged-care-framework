import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number; // 1-5, can be float
  maxStars?: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

const STAR_PATH =
  "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z";

const FILLED_COLOR = "oklch(0.78 0.18 85)";
const EMPTY_COLOR = "oklch(0.85 0.02 240)";

interface SingleStarProps {
  fill: number; // 0–1
  width: number;
  height: number;
  position: number;
  sizeKey: string;
}

function SingleStar({
  fill,
  width,
  height,
  position,
  sizeKey,
}: SingleStarProps) {
  const clipId = `sc-${sizeKey}-${position}`;

  if (fill >= 1) {
    return (
      <svg
        width={width}
        height={height}
        viewBox="0 0 24 24"
        fill={FILLED_COLOR}
        aria-hidden="true"
        style={{ flexShrink: 0 }}
      >
        <path d={STAR_PATH} />
      </svg>
    );
  }

  if (fill > 0) {
    const pct = fill * 100;
    return (
      <svg
        width={width}
        height={height}
        viewBox="0 0 24 24"
        aria-hidden="true"
        style={{ flexShrink: 0 }}
      >
        <defs>
          <clipPath id={clipId}>
            <rect x="0" y="0" width={`${pct}%`} height="24" />
          </clipPath>
        </defs>
        <path d={STAR_PATH} fill={EMPTY_COLOR} />
        <path d={STAR_PATH} fill={FILLED_COLOR} clipPath={`url(#${clipId})`} />
      </svg>
    );
  }

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill={EMPTY_COLOR}
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <path d={STAR_PATH} />
    </svg>
  );
}

export function StarRating({
  value,
  maxStars = 5,
  size = "md",
  showLabel = true,
  className,
}: StarRatingProps) {
  const clamped = Math.max(0, Math.min(value, maxStars));

  const starSizes = {
    sm: { width: 14, height: 14, gap: 1, textCls: "text-xs" },
    md: { width: 18, height: 18, gap: 2, textCls: "text-sm" },
    lg: { width: 26, height: 26, gap: 3, textCls: "text-base" },
  };
  const { width, height, gap, textCls } = starSizes[size];

  const positions = Array.from({ length: maxStars }, (_, i) => i);

  return (
    <span
      className={cn("inline-flex items-center", className)}
      style={{ gap: `${gap}px` }}
      role="img"
      aria-label={`Rating: ${clamped.toFixed(1)} out of ${maxStars} stars`}
    >
      {positions.map((pos) => (
        <SingleStar
          key={`star-pos-${pos}`}
          fill={Math.min(Math.max(clamped - pos, 0), 1)}
          width={width}
          height={height}
          position={pos}
          sizeKey={size}
        />
      ))}
      {showLabel && (
        <span
          className={cn("font-semibold ml-1 tabular-nums", textCls)}
          style={{ color: "oklch(0.38 0.04 254)" }}
        >
          {clamped.toFixed(1)}&nbsp;
          <span style={{ color: "oklch(0.58 0.02 240)", fontWeight: 400 }}>
            / {maxStars}
          </span>
        </span>
      )}
    </span>
  );
}
