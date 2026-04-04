import {
  DSBadge,
  DSCard,
  DSEligibilityBadge,
  DSRiskBadge,
} from "@/components/ds";
import { Input } from "@/components/ui/input";
import { GitCompare, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { AppRole } from "../../App";
import {
  PROVIDER_MASTER,
  getProviderDomainScoresForQuarter,
  getProviderRatingForQuarter,
} from "../../data/mockData";

interface ProviderComparisonProps {
  currentQuarter: string;
  currentRole: AppRole;
}

const DOMAIN_LABELS: Record<string, string> = {
  safety: "Safety",
  preventive: "Preventive",
  quality: "Quality",
  staffing: "Staffing",
  compliance: "Compliance",
  experience: "Experience",
};

const DOMAIN_KEYS = Object.keys(DOMAIN_LABELS);

const CHART_COLORS = [
  "oklch(0.60 0.18 260)",
  "oklch(0.60 0.18 160)",
  "oklch(0.65 0.18 30)",
  "oklch(0.60 0.18 300)",
  "oklch(0.62 0.17 200)",
];

function StarDisplay({ stars }: { stars: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <span
          key={s}
          style={{
            fontSize: "16px",
            color:
              s <= Math.round(stars)
                ? "oklch(0.74 0.14 86)"
                : "oklch(0.70 0.01 252)",
          }}
        >
          ★
        </span>
      ))}
      <span
        style={{
          fontSize: "13px",
          fontWeight: 700,
          color: "oklch(0.74 0.14 86)",
          marginLeft: "4px",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}
      >
        {stars.toFixed(1)}
      </span>
    </div>
  );
}

export default function ProviderComparison({
  currentQuarter,
}: ProviderComparisonProps) {
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filteredProviders = useMemo(() => {
    const q = search.toLowerCase();
    return PROVIDER_MASTER.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.state.toLowerCase().includes(q),
    );
  }, [search]);

  const toggleProvider = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 5) return prev;
      return [...prev, id];
    });
  };

  const selectedData = useMemo(
    () =>
      selectedIds.map((id) => {
        const provider = PROVIDER_MASTER.find((p) => p.id === id)!;
        const rating = getProviderRatingForQuarter(id, currentQuarter);
        const domains = getProviderDomainScoresForQuarter(id, currentQuarter);
        return { provider, rating, domains };
      }),
    [selectedIds, currentQuarter],
  );

  // Build recharts data
  const barData = DOMAIN_KEYS.map((key) => {
    const entry: Record<string, string | number> = {
      domain: DOMAIN_LABELS[key],
    };
    for (const sd of selectedData) {
      entry[sd.provider.name] = Math.round(
        sd.domains[key as keyof typeof sd.domains] ?? 0,
      );
    }
    return entry;
  });

  const radarData = DOMAIN_KEYS.map((key) => {
    const entry: Record<string, string | number> = {
      domain: DOMAIN_LABELS[key],
    };
    for (const sd of selectedData) {
      entry[sd.provider.name] = Math.round(
        sd.domains[key as keyof typeof sd.domains] ?? 0,
      );
    }
    return entry;
  });

  const heroStyle: React.CSSProperties = {
    background:
      "linear-gradient(135deg, oklch(0.14 0.055 258) 0%, oklch(0.10 0.042 258) 100%)",
    padding: "24px 28px",
    marginBottom: "0",
  };

  return (
    <div className="flex flex-col h-full">
      {/* Hero Banner */}
      <div style={heroStyle}>
        <div className="flex items-center gap-3">
          <div
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "10px",
              background:
                "linear-gradient(135deg, oklch(0.48 0.18 260), oklch(0.40 0.22 290))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <GitCompare
              style={{ width: "18px", height: "18px", color: "#fff" }}
            />
          </div>
          <div>
            <h1
              style={{
                fontSize: "22px",
                fontWeight: 800,
                color: "#fff",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              Provider Comparison
            </h1>
            <p
              style={{
                fontSize: "13px",
                color: "oklch(0.65 0.025 252)",
                marginTop: "2px",
              }}
            >
              Compare up to 5 providers side-by-side across all performance
              domains — {currentQuarter}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-5 flex-1 overflow-y-auto">
        {/* Provider Selector */}
        <DSCard className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2
                style={{
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "oklch(0.18 0.055 258)",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                Select Providers
              </h2>
              <p
                style={{
                  fontSize: "12px",
                  color: "oklch(0.52 0.02 252)",
                  marginTop: "2px",
                }}
              >
                Choose 2–5 providers to compare ({selectedIds.length}/5
                selected)
              </p>
            </div>
            {selectedIds.length > 0 && (
              <button
                type="button"
                data-ocid="provider_comparison.clear_button"
                onClick={() => setSelectedIds([])}
                style={{
                  fontSize: "12px",
                  color: "oklch(0.52 0.18 260)",
                  background: "none",
                  border: "1px solid oklch(0.52 0.18 260)",
                  borderRadius: "6px",
                  padding: "4px 10px",
                  cursor: "pointer",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                Clear All
              </button>
            )}
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search
              style={{
                position: "absolute",
                left: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                width: "14px",
                height: "14px",
                color: "oklch(0.60 0.02 252)",
              }}
            />
            <Input
              data-ocid="provider_comparison.search_input"
              placeholder="Search by name, ID, or state…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                paddingLeft: "32px",
                fontSize: "13px",
                height: "36px",
              }}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                style={{
                  position: "absolute",
                  right: "8px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "oklch(0.60 0.02 252)",
                }}
              >
                <X style={{ width: "14px", height: "14px" }} />
              </button>
            )}
          </div>

          {/* Provider List */}
          <div
            style={{
              maxHeight: "200px",
              overflowY: "auto",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: "6px",
            }}
          >
            {filteredProviders.length === 0 && (
              <div
                style={{
                  gridColumn: "1 / -1",
                  textAlign: "center",
                  padding: "20px",
                  fontSize: "13px",
                  color: "oklch(0.52 0.02 252)",
                }}
              >
                No providers found
              </div>
            )}
            {filteredProviders.map((p) => {
              const isSelected = selectedIds.includes(p.id);
              const isDisabled = !isSelected && selectedIds.length >= 5;
              return (
                <button
                  key={p.id}
                  type="button"
                  data-ocid={"provider_comparison.select_button"}
                  onClick={() => !isDisabled && toggleProvider(p.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 10px",
                    borderRadius: "8px",
                    border: `1px solid ${
                      isSelected
                        ? "oklch(0.52 0.18 260)"
                        : "oklch(0.88 0.01 252)"
                    }`,
                    background: isSelected
                      ? "oklch(0.96 0.04 260)"
                      : "oklch(0.99 0.005 252)",
                    cursor: isDisabled ? "not-allowed" : "pointer",
                    opacity: isDisabled ? 0.5 : 1,
                    transition: "all 150ms ease",
                    textAlign: "left",
                  }}
                >
                  <div
                    style={{
                      width: "16px",
                      height: "16px",
                      borderRadius: "4px",
                      border: `2px solid ${
                        isSelected
                          ? "oklch(0.52 0.18 260)"
                          : "oklch(0.75 0.01 252)"
                      }`,
                      background: isSelected
                        ? "oklch(0.52 0.18 260)"
                        : "transparent",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {isSelected && (
                      <span
                        style={{
                          color: "#fff",
                          fontSize: "10px",
                          lineHeight: 1,
                        }}
                      >
                        ✓
                      </span>
                    )}
                  </div>
                  <div style={{ overflow: "hidden" }}>
                    <div
                      style={{
                        fontSize: "12.5px",
                        fontWeight: 600,
                        color: "oklch(0.18 0.055 258)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                      }}
                    >
                      {p.name}
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "oklch(0.55 0.02 252)",
                      }}
                    >
                      {p.id} · {p.state}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </DSCard>

        {/* Empty State */}
        {selectedIds.length < 2 && (
          <div
            data-ocid="provider_comparison.empty_state"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "60px 20px",
              background: "oklch(0.98 0.006 252)",
              borderRadius: "12px",
              border: "2px dashed oklch(0.85 0.015 252)",
            }}
          >
            <GitCompare
              style={{
                width: "48px",
                height: "48px",
                color: "oklch(0.70 0.04 252)",
                marginBottom: "16px",
              }}
            />
            <h3
              style={{
                fontSize: "16px",
                fontWeight: 700,
                color: "oklch(0.30 0.04 258)",
                marginBottom: "8px",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              Select at least 2 providers to compare
            </h3>
            <p
              style={{
                fontSize: "13px",
                color: "oklch(0.55 0.02 252)",
                textAlign: "center",
                maxWidth: "380px",
              }}
            >
              Use the search above to find providers, then click to select them.
              You can compare up to 5 at once.
            </p>
          </div>
        )}

        {/* Comparison Results */}
        {selectedIds.length >= 2 && (
          <>
            {/* Summary Cards */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${selectedData.length}, minmax(0, 1fr))`,
                gap: "12px",
              }}
            >
              {selectedData.map((sd, idx) => (
                <DSCard
                  key={sd.provider.id}
                  className="p-4"
                  accent={CHART_COLORS[idx]}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3
                        style={{
                          fontSize: "13px",
                          fontWeight: 700,
                          color: "oklch(0.18 0.055 258)",
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          lineHeight: 1.3,
                        }}
                      >
                        {sd.provider.name}
                      </h3>
                      <p
                        style={{
                          fontSize: "11px",
                          color: "oklch(0.55 0.02 252)",
                          marginTop: "2px",
                        }}
                      >
                        {sd.provider.id} · {sd.provider.state}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleProvider(sd.provider.id)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "oklch(0.60 0.02 252)",
                        flexShrink: 0,
                      }}
                    >
                      <X style={{ width: "14px", height: "14px" }} />
                    </button>
                  </div>
                  <StarDisplay stars={sd.rating.stars} />
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <DSRiskBadge
                      risk={
                        sd.rating.stars < 2.5
                          ? "High"
                          : sd.rating.stars < 3.5
                            ? "Medium"
                            : "Low"
                      }
                    />
                    <DSEligibilityBadge
                      tier={sd.rating.eligibility.tier}
                      eligible={sd.rating.eligibility.eligible}
                    />
                  </div>
                </DSCard>
              ))}
            </div>

            {/* Bar Chart */}
            <DSCard className="p-5">
              <h3
                style={{
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "oklch(0.18 0.055 258)",
                  marginBottom: "16px",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                Domain Score Comparison
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={barData}
                  margin={{ top: 0, right: 10, left: -10, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="oklch(0.90 0.01 252)"
                  />
                  <XAxis
                    dataKey="domain"
                    tick={{ fontSize: 11, fill: "oklch(0.45 0.02 252)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 11, fill: "oklch(0.45 0.02 252)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "oklch(0.14 0.055 258)",
                      border: "1px solid oklch(0.22 0.055 258)",
                      borderRadius: "8px",
                      fontSize: "12px",
                      color: "#fff",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                  {selectedData.map((sd, idx) => (
                    <Bar
                      key={sd.provider.id}
                      dataKey={sd.provider.name}
                      fill={CHART_COLORS[idx]}
                      radius={[3, 3, 0, 0]}
                      maxBarSize={32}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </DSCard>

            {/* Radar Chart */}
            <DSCard className="p-5">
              <h3
                style={{
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "oklch(0.18 0.055 258)",
                  marginBottom: "16px",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                Performance Radar
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="oklch(0.88 0.01 252)" />
                  <PolarAngleAxis
                    dataKey="domain"
                    tick={{ fontSize: 11, fill: "oklch(0.40 0.03 258)" }}
                  />
                  {selectedData.map((sd, idx) => (
                    <Radar
                      key={sd.provider.id}
                      name={sd.provider.name}
                      dataKey={sd.provider.name}
                      stroke={CHART_COLORS[idx]}
                      fill={CHART_COLORS[idx]}
                      fillOpacity={0.12}
                      strokeWidth={2}
                    />
                  ))}
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                  <Tooltip
                    contentStyle={{
                      background: "oklch(0.14 0.055 258)",
                      border: "1px solid oklch(0.22 0.055 258)",
                      borderRadius: "8px",
                      fontSize: "12px",
                      color: "#fff",
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </DSCard>

            {/* Data Table */}
            <DSCard className="p-0 overflow-hidden">
              <div
                style={{
                  padding: "14px 16px",
                  borderBottom: "1px solid oklch(0.90 0.01 252)",
                  background: "oklch(0.97 0.008 258)",
                }}
              >
                <h3
                  style={{
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "oklch(0.18 0.055 258)",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  Detailed Domain Scores
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full gov-table">
                  <thead>
                    <tr>
                      <th className="text-left" style={{ minWidth: "120px" }}>
                        Domain
                      </th>
                      {selectedData.map((sd, idx) => (
                        <th key={sd.provider.id} className="text-right">
                          <span style={{ color: CHART_COLORS[idx] }}>
                            {sd.provider.name}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {DOMAIN_KEYS.map((key) => (
                      <tr key={key}>
                        <td className="font-semibold">{DOMAIN_LABELS[key]}</td>
                        {selectedData.map((sd) => {
                          const score = Math.round(
                            sd.domains[key as keyof typeof sd.domains] ?? 0,
                          );
                          const color =
                            score >= 75
                              ? "oklch(0.45 0.15 145)"
                              : score >= 55
                                ? "oklch(0.55 0.14 60)"
                                : "oklch(0.50 0.18 20)";
                          return (
                            <td key={sd.provider.id} className="text-right">
                              <span
                                style={{
                                  fontWeight: 700,
                                  color,
                                  fontSize: "13px",
                                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                                }}
                              >
                                {score}
                              </span>
                              <span
                                style={{
                                  fontSize: "10px",
                                  color: "oklch(0.60 0.02 252)",
                                  marginLeft: "2px",
                                }}
                              >
                                /100
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                    <tr style={{ background: "oklch(0.95 0.015 258)" }}>
                      <td className="font-bold">Overall Stars</td>
                      {selectedData.map((sd) => (
                        <td key={sd.provider.id} className="text-right">
                          <StarDisplay stars={sd.rating.stars} />
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </DSCard>
          </>
        )}
      </div>
    </div>
  );
}
