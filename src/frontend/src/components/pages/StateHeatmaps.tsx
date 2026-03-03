import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import {
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { REGIONAL_DATA, type StateKey } from "../../data/mockData";

const STATES: StateKey[] = [
  "NSW",
  "VIC",
  "QLD",
  "SA",
  "WA",
  "TAS",
  "NT",
  "ACT",
];

function getScoreClass(value: number, lowerIsBetter = false): string {
  if (lowerIsBetter) {
    if (value <= 10) return "cell-good";
    if (value <= 20) return "cell-moderate";
    return "cell-poor";
  }
  if (value >= 80) return "cell-good";
  if (value >= 70) return "cell-moderate";
  return "cell-poor";
}

function getEquityClass(value: number): string {
  if (value <= 8) return "cell-good";
  if (value <= 15) return "cell-moderate";
  return "cell-poor";
}

function getComplianceClass(value: number): string {
  if (value >= 85) return "cell-good";
  if (value >= 75) return "cell-moderate";
  return "cell-poor";
}

export default function StateHeatmaps() {
  const [selectedState, setSelectedState] = useState<StateKey>("NSW");

  const stateData = REGIONAL_DATA[selectedState];

  const statePopulations: Record<
    StateKey,
    { providers: number; residents: number }
  > = {
    NSW: { providers: 530, residents: 42180 },
    VIC: { providers: 483, residents: 38420 },
    QLD: { providers: 416, residents: 31480 },
    SA: { providers: 201, residents: 16840 },
    WA: { providers: 228, residents: 18240 },
    TAS: { providers: 88, residents: 7240 },
    NT: { providers: 31, residents: 2480 },
    ACT: { providers: 34, residents: 2840 },
  };

  return (
    <div className="p-6 space-y-5">
      <div className="border-b pb-4">
        <h1 className="text-xl font-bold text-gov-navy">
          State & Regional Heatmaps
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Regional performance breakdown by state and territory — Q4-2025
        </p>
      </div>

      {/* State selector */}
      <Tabs
        value={selectedState}
        onValueChange={(v) => setSelectedState(v as StateKey)}
      >
        <TabsList
          className="h-auto rounded-none gap-0 border-b bg-transparent p-0 w-full justify-start"
          aria-label="Select state or territory"
        >
          {STATES.map((state) => (
            <TabsTrigger
              key={state}
              value={state}
              className="rounded-none border-b-2 border-transparent px-4 py-2.5 text-xs font-semibold data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary"
            >
              {state}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* State summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="rounded-none border">
          <CardContent className="p-3">
            <div className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-1">
              Total Providers
            </div>
            <div className="text-2xl font-bold text-gov-navy">
              {statePopulations[selectedState].providers.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-none border">
          <CardContent className="p-3">
            <div className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-1">
              Total Residents
            </div>
            <div className="text-2xl font-bold text-gov-navy">
              {statePopulations[selectedState].residents.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-none border">
          <CardContent className="p-3">
            <div className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-1">
              Regions Covered
            </div>
            <div className="text-2xl font-bold text-gov-navy">
              {stateData.regions.length}
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-none border">
          <CardContent className="p-3">
            <div className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-1">
              State/Territory
            </div>
            <div className="text-2xl font-bold text-gov-navy">
              {selectedState}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Regional breakdown table */}
      <Card className="rounded-none border">
        <CardHeader className="pb-2 pt-4 px-4 border-b">
          <CardTitle className="text-sm font-semibold text-gov-navy">
            Regional Performance Breakdown — {selectedState}
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Color indicates performance vs national benchmark:
            <span className="inline-block w-3 h-3 cell-good rounded mx-1 align-middle" />{" "}
            Good
            <span className="inline-block w-3 h-3 cell-moderate rounded mx-1 align-middle" />{" "}
            Moderate
            <span className="inline-block w-3 h-3 cell-poor rounded mx-1 align-middle" />{" "}
            Poor
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full gov-table">
              <thead>
                <tr>
                  <th className="text-left" style={{ minWidth: "160px" }}>
                    Region
                  </th>
                  <th className="text-right">Providers</th>
                  <th className="text-right">Avg Safety</th>
                  <th className="text-right">Avg Preventive</th>
                  <th className="text-right">Screening Compliance</th>
                  <th className="text-right">High-Risk Prev.</th>
                  <th className="text-right">Adverse Events</th>
                  <th className="text-right">Equity Gap</th>
                </tr>
              </thead>
              <tbody>
                {stateData.regions.map((region) => (
                  <tr key={region.region}>
                    <td className="font-medium">{region.region}</td>
                    <td className="text-right">{region.providers}</td>
                    <td
                      className={`text-right ${getScoreClass(region.avgSafety)}`}
                    >
                      {region.avgSafety.toFixed(1)}
                    </td>
                    <td
                      className={`text-right ${getScoreClass(region.avgPreventive)}`}
                    >
                      {region.avgPreventive.toFixed(1)}
                    </td>
                    <td
                      className={`text-right ${getComplianceClass(region.screeningCompliance)}`}
                    >
                      {region.screeningCompliance.toFixed(1)}%
                    </td>
                    <td
                      className={`text-right ${getScoreClass(region.highRiskPrevalence, true)}`}
                    >
                      {region.highRiskPrevalence.toFixed(1)}%
                    </td>
                    <td
                      className={`text-right ${getScoreClass(region.adverseEvents, true)}`}
                    >
                      {region.adverseEvents.toFixed(1)}
                    </td>
                    <td
                      className={`text-right ${getEquityClass(region.equityGap)}`}
                    >
                      {region.equityGap.toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Radar chart */}
      <Card className="rounded-none border">
        <CardHeader className="pb-2 pt-4 px-4 border-b">
          <CardTitle className="text-sm font-semibold text-gov-navy">
            {selectedState} Performance Profile vs National Benchmark
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart
              data={stateData.radarProfile}
              margin={{ top: 10, right: 40, bottom: 10, left: 40 }}
            >
              <PolarGrid stroke="oklch(0.87 0.012 240)" />
              <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 12 }} />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 100]}
                tick={{ fontSize: 10 }}
                tickCount={4}
              />
              <Tooltip
                contentStyle={{
                  fontSize: "12px",
                  border: "1px solid oklch(0.87 0.012 240)",
                  borderRadius: "2px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <Radar
                name={`${selectedState} Score`}
                dataKey="score"
                stroke="oklch(0.28 0.09 254)"
                fill="oklch(0.28 0.09 254)"
                fillOpacity={0.25}
                strokeWidth={2}
              />
              <Radar
                name="National Benchmark"
                dataKey="benchmark"
                stroke="oklch(0.52 0.15 145)"
                fill="oklch(0.52 0.15 145)"
                fillOpacity={0.1}
                strokeWidth={2}
                strokeDasharray="5 3"
              />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
