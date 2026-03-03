import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, DollarSign, TrendingUp, XCircle } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  PAY_FOR_IMPROVEMENT_DATA,
  PAY_FOR_IMPROVEMENT_THRESHOLDS,
} from "../../data/mockData";

interface PayForImprovementProps {
  currentQuarter: string;
}

export default function PayForImprovement({
  currentQuarter,
}: PayForImprovementProps) {
  const eligibleCount = PAY_FOR_IMPROVEMENT_DATA.filter(
    (d) => d.eligible,
  ).length;
  const totalFunding = PAY_FOR_IMPROVEMENT_DATA.reduce(
    (sum, d) => sum + d.funding,
    0,
  );

  const chartData = PAY_FOR_IMPROVEMENT_THRESHOLDS.map((threshold) => {
    const records = PAY_FOR_IMPROVEMENT_DATA.filter(
      (d) => d.metric === threshold.metric,
    );
    const avgImprovement =
      records.length > 0
        ? records.reduce((sum, r) => sum + r.improvement, 0) / records.length
        : 0;
    return {
      metric: threshold.metric,
      improvement: Number.parseFloat(avgImprovement.toFixed(1)),
      threshold: threshold.threshold,
      eligible: avgImprovement >= threshold.threshold,
    };
  });

  return (
    <div className="p-6 space-y-5">
      <div className="border-b pb-4">
        <h1 className="text-xl font-bold text-gov-navy">
          Pay-for-Improvement Tracker
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {currentQuarter} Eligibility Report — Improvement metrics and funding
          eligibility assessment
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="rounded-none border">
          <CardContent className="p-3 flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-gov-navy flex-shrink-0" />
            <div>
              <div className="text-xs text-muted-foreground uppercase font-semibold">
                Total Records
              </div>
              <div className="text-2xl font-bold text-gov-navy">
                {PAY_FOR_IMPROVEMENT_DATA.length}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-none border">
          <CardContent className="p-3 flex items-center gap-3">
            <CheckCircle2
              className="w-6 h-6 flex-shrink-0"
              style={{ color: "oklch(var(--gov-green))" }}
            />
            <div>
              <div className="text-xs text-muted-foreground uppercase font-semibold">
                Eligible
              </div>
              <div
                className="text-2xl font-bold"
                style={{ color: "oklch(var(--gov-green))" }}
              >
                {eligibleCount}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-none border">
          <CardContent className="p-3 flex items-center gap-3">
            <XCircle
              className="w-6 h-6 flex-shrink-0"
              style={{ color: "oklch(var(--gov-red))" }}
            />
            <div>
              <div className="text-xs text-muted-foreground uppercase font-semibold">
                Not Eligible
              </div>
              <div
                className="text-2xl font-bold"
                style={{ color: "oklch(var(--gov-red))" }}
              >
                {PAY_FOR_IMPROVEMENT_DATA.length - eligibleCount}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-none border">
          <CardContent className="p-3 flex items-center gap-3">
            <DollarSign
              className="w-6 h-6 flex-shrink-0"
              style={{ color: "oklch(var(--gov-gold-dark))" }}
            />
            <div>
              <div className="text-xs text-muted-foreground uppercase font-semibold">
                Est. Total Funding
              </div>
              <div
                className="text-xl font-bold"
                style={{ color: "oklch(var(--gov-gold-dark))" }}
              >
                ${(totalFunding / 1000).toFixed(0)}k
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main table */}
      <Card className="rounded-none border">
        <CardHeader className="pb-2 pt-4 px-4 border-b">
          <CardTitle className="text-sm font-semibold text-gov-navy">
            {currentQuarter} Pay-for-Improvement Eligibility Report
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full gov-table">
              <thead>
                <tr>
                  <th className="text-left">Provider</th>
                  <th className="text-left">Metric Type</th>
                  <th className="text-right">Baseline</th>
                  <th className="text-right">Current</th>
                  <th className="text-right">Improvement %</th>
                  <th className="text-right">Threshold Required</th>
                  <th className="text-left">Funding Eligible</th>
                  <th className="text-right">Est. Funding</th>
                </tr>
              </thead>
              <tbody>
                {PAY_FOR_IMPROVEMENT_DATA.map((row) => {
                  const aboveThreshold =
                    row.improvement >=
                    (PAY_FOR_IMPROVEMENT_THRESHOLDS.find(
                      (t) => t.metric === row.metric,
                    )?.threshold || 0);
                  return (
                    <tr key={row.id}>
                      <td className="font-medium">{row.provider}</td>
                      <td>{row.metric}</td>
                      <td className="text-right">{row.baseline.toFixed(1)}%</td>
                      <td className="text-right">{row.current.toFixed(1)}%</td>
                      <td
                        className="text-right font-bold"
                        style={{
                          color: aboveThreshold
                            ? "oklch(var(--gov-green))"
                            : "oklch(var(--gov-red))",
                        }}
                      >
                        {row.improvement.toFixed(1)}%
                      </td>
                      <td className="text-right text-muted-foreground">
                        {PAY_FOR_IMPROVEMENT_THRESHOLDS.find(
                          (t) => t.metric === row.metric,
                        )?.threshold ?? "—"}
                        %
                      </td>
                      <td>
                        {row.eligible ? (
                          <span className="badge-green">ELIGIBLE</span>
                        ) : (
                          <span className="badge-red">NOT ELIGIBLE</span>
                        )}
                      </td>
                      <td className="text-right font-semibold">
                        {row.funding > 0
                          ? `$${row.funding.toLocaleString()}`
                          : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Chart */}
      <Card className="rounded-none border">
        <CardHeader className="pb-2 pt-4 px-4 border-b">
          <CardTitle className="text-sm font-semibold text-gov-navy">
            Average Improvement % by Metric Type vs Threshold
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Dashed line indicates minimum eligibility threshold
          </p>
        </CardHeader>
        <CardContent className="p-4">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 20, bottom: 60, left: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="oklch(0.90 0.01 240)"
              />
              <XAxis
                dataKey="metric"
                tick={{ fontSize: 10 }}
                tickLine={false}
                angle={-30}
                textAnchor="end"
                interval={0}
              />
              <YAxis
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  fontSize: "12px",
                  borderRadius: "2px",
                  border: "1px solid oklch(0.87 0.012 240)",
                }}
                formatter={(value: number, name: string) => [`${value}%`, name]}
              />
              <ReferenceLine
                y={15}
                stroke="oklch(0.52 0.22 25)"
                strokeDasharray="6 3"
                label={{ value: "Min. 15%", position: "right", fontSize: 10 }}
              />
              <Bar
                dataKey="improvement"
                name="Avg. Improvement %"
                radius={[2, 2, 0, 0]}
              >
                {chartData.map((entry) => (
                  <Cell
                    key={`cell-${entry.metric}`}
                    fill={
                      entry.eligible
                        ? "oklch(0.52 0.15 145)"
                        : "oklch(0.52 0.22 25)"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Threshold configuration */}
      <Card className="rounded-none border">
        <CardHeader className="pb-2 pt-4 px-4 border-b">
          <CardTitle className="text-sm font-semibold text-gov-navy">
            Configurable Eligibility Thresholds
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Current threshold configuration for {currentQuarter}
          </p>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {PAY_FOR_IMPROVEMENT_THRESHOLDS.map((t) => (
              <div
                key={t.metric}
                className="border p-3 rounded-none"
                style={{ background: "oklch(0.97 0.01 254)" }}
              >
                <div className="font-semibold text-sm text-gov-navy mb-0.5">
                  {t.metric}
                </div>
                <div className="text-xs text-muted-foreground mb-1">
                  {t.description}
                </div>
                <div className="flex items-baseline gap-1">
                  <span
                    className="text-xl font-bold"
                    style={{ color: "oklch(var(--gov-gold-dark))" }}
                  >
                    {t.threshold}%
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {t.unit}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
