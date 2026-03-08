import {
  getBenchmarkStatus,
  getBenchmarkStatusBg,
  getBenchmarkStatusColor,
  getBenchmarkStatusLabel,
} from "@/utils/benchmarkUtils";

interface BenchmarkStatusChipProps {
  rate: number;
  benchmark: number;
  isLowerBetter: boolean;
  size?: "xs" | "sm";
  showLabel?: boolean;
}

/**
 * A compact inline pill that shows Green "Above Benchmark",
 * Amber "Near Benchmark", or Red "Below Benchmark".
 */
export function BenchmarkStatusChip({
  rate,
  benchmark,
  isLowerBetter,
  size = "xs",
  showLabel = true,
}: BenchmarkStatusChipProps) {
  const status = getBenchmarkStatus(rate, benchmark, isLowerBetter);
  const color = getBenchmarkStatusColor(status);
  const bg = getBenchmarkStatusBg(status);
  const label = getBenchmarkStatusLabel(status);

  const sizeClass =
    size === "xs"
      ? "text-xs px-1.5 py-0.5 font-semibold"
      : "text-xs px-2 py-1 font-bold";

  const dot = (
    <span
      className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0"
      style={{ background: color }}
    />
  );

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-sm ${sizeClass} whitespace-nowrap`}
      style={{ background: bg, color }}
      title={`${label}: Provider value ${rate}, Benchmark ${benchmark}`}
    >
      {dot}
      {showLabel && label}
    </span>
  );
}
