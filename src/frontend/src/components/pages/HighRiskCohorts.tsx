import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { useState } from "react";
import type { HighRiskCohort } from "../../backend.d";
import {
  MOCK_HIGH_RISK_COHORTS,
  MOCK_PROVIDERS,
  RISK_CRITERIA_LABELS,
} from "../../data/mockData";
import { useAllHighRiskCohorts } from "../../hooks/useQueries";
import CohortRiskDetail from "./CohortRiskDetail";

type FilterType = "all" | "high" | "medium" | "resolved";

function getProviderName(providerId: string): string {
  return MOCK_PROVIDERS.find((p) => p.id === providerId)?.name || providerId;
}

function formatRiskCriteria(criteria: string): string[] {
  return criteria
    .split(",")
    .map((c) => RISK_CRITERIA_LABELS[c.trim()] || c.trim());
}

function formatDate(timestamp: bigint | number): string {
  const ts = typeof timestamp === "bigint" ? Number(timestamp) : timestamp;
  const date = ts > 1e12 ? new Date(ts) : new Date(ts * 1000);
  return date.toLocaleDateString("en-AU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function UrgencyBadge({ urgency }: { urgency: string }) {
  if (urgency === "high")
    return (
      <output className="badge-red" aria-label="High urgency">
        <AlertTriangle className="w-3 h-3 mr-1" aria-hidden="true" />
        High
      </output>
    );
  if (urgency === "medium")
    return (
      <output className="badge-amber" aria-label="Medium urgency">
        <Clock className="w-3 h-3 mr-1" aria-hidden="true" />
        Medium
      </output>
    );
  return (
    <output className="badge-blue" aria-label="Low urgency">
      Low
    </output>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "active")
    return (
      <output className="badge-red" aria-label="Active">
        Active
      </output>
    );
  if (status === "monitoring")
    return (
      <output className="badge-amber" aria-label="Monitoring">
        Monitoring
      </output>
    );
  return (
    <output className="badge-green" aria-label="Resolved">
      <CheckCircle className="w-3 h-3 mr-1" aria-hidden="true" />
      Resolved
    </output>
  );
}

export default function HighRiskCohorts() {
  const [filter, setFilter] = useState<FilterType>("all");
  const [selectedCohortId, setSelectedCohortId] = useState<string | null>(null);

  const { data: liveData, isLoading } = useAllHighRiskCohorts();

  const rawData: Array<{
    id: string;
    providerId: string;
    riskCriteria: string;
    cohortSize: bigint | number;
    flagDate: bigint | number;
    status: string;
    urgency: string;
  }> = liveData && liveData.length > 0 ? liveData : MOCK_HIGH_RISK_COHORTS;

  const filteredData = rawData.filter((cohort) => {
    if (filter === "all") return true;
    if (filter === "high") return cohort.urgency === "high";
    if (filter === "medium") return cohort.urgency === "medium";
    if (filter === "resolved") return cohort.status === "resolved";
    return true;
  });

  // Show detail view if a cohort is selected
  if (selectedCohortId) {
    return (
      <CohortRiskDetail
        cohortId={selectedCohortId}
        onBack={() => setSelectedCohortId(null)}
      />
    );
  }

  const counts = {
    total: rawData.length,
    high: rawData.filter((c) => c.urgency === "high").length,
    medium: rawData.filter((c) => c.urgency === "medium").length,
    active: rawData.filter((c) => c.status === "active").length,
  };

  const filters: { key: FilterType; label: string }[] = [
    { key: "all", label: `All (${counts.total})` },
    { key: "high", label: `High Urgency (${counts.high})` },
    { key: "medium", label: `Medium (${counts.medium})` },
    { key: "resolved", label: "Resolved" },
  ];

  return (
    <div className="p-6 space-y-5">
      <div className="border-b pb-4">
        <h1 className="text-xl font-bold text-gov-navy">
          High-Risk Cohort Monitoring
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          HRSM — Automated high-risk cohort detection and mandatory screening
          workflow triggers
        </p>
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="rounded-none border">
          <CardContent className="p-3 flex items-center gap-3">
            <Activity className="w-6 h-6 text-gov-navy flex-shrink-0" />
            <div>
              <div className="text-xs text-muted-foreground uppercase font-semibold">
                Total Flagged
              </div>
              <div className="text-2xl font-bold text-gov-navy">
                {counts.total}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-none border">
          <CardContent className="p-3 flex items-center gap-3">
            <AlertTriangle
              className="w-6 h-6 flex-shrink-0"
              style={{ color: "oklch(var(--gov-red))" }}
            />
            <div>
              <div className="text-xs text-muted-foreground uppercase font-semibold">
                High Urgency
              </div>
              <div
                className="text-2xl font-bold"
                style={{ color: "oklch(var(--gov-red))" }}
              >
                {counts.high}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-none border">
          <CardContent className="p-3 flex items-center gap-3">
            <Clock
              className="w-6 h-6 flex-shrink-0"
              style={{ color: "oklch(var(--gov-amber))" }}
            />
            <div>
              <div className="text-xs text-muted-foreground uppercase font-semibold">
                Medium
              </div>
              <div
                className="text-2xl font-bold"
                style={{ color: "oklch(var(--gov-amber))" }}
              >
                {counts.medium}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-none border">
          <CardContent className="p-3 flex items-center gap-3">
            <CheckCircle
              className="w-6 h-6 flex-shrink-0"
              style={{ color: "oklch(var(--gov-green))" }}
            />
            <div>
              <div className="text-xs text-muted-foreground uppercase font-semibold">
                Active
              </div>
              <div
                className="text-2xl font-bold"
                style={{ color: "oklch(var(--gov-green))" }}
              >
                {counts.active}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter tabs */}
      <div
        className="flex items-center gap-1 border-b pb-0"
        role="tablist"
        aria-label="Filter high-risk cohorts"
      >
        {filters.map((f) => (
          <button
            type="button"
            key={f.key}
            role="tab"
            aria-selected={filter === f.key}
            onClick={() => setFilter(f.key)}
            data-ocid="high_risk.filter.tab"
            className="px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors -mb-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            style={{
              borderBottomColor:
                filter === f.key ? "oklch(var(--gov-navy))" : "transparent",
              color:
                filter === f.key
                  ? "oklch(var(--gov-navy))"
                  : "oklch(var(--muted-foreground))",
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <Card className="rounded-none border">
        <CardHeader className="pb-2 pt-4 px-4 border-b">
          <CardTitle className="text-sm font-semibold text-gov-navy">
            Flagged Cohorts —{" "}
            {filter === "all"
              ? "All"
              : filters.find((f) => f.key === filter)?.label}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-2">
              {["h1", "h2", "h3", "h4", "h5"].map((k) => (
                <Skeleton key={k} className="h-10 rounded-none" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full gov-table">
                <thead>
                  <tr>
                    <th className="text-left">ID</th>
                    <th className="text-left">Provider</th>
                    <th className="text-left">Risk Criteria</th>
                    <th className="text-right">Cohort Size</th>
                    <th className="text-left">Flag Date</th>
                    <th className="text-left">Urgency</th>
                    <th className="text-left">Status</th>
                    <th className="text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No cohorts matching the selected filter
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((cohort, idx) => (
                      <tr
                        key={cohort.id}
                        data-ocid={`high_risk.cohort.item.${idx + 1}`}
                      >
                        <td className="font-mono text-xs">{cohort.id}</td>
                        <td className="font-medium">
                          {getProviderName(cohort.providerId)}
                        </td>
                        <td>
                          <div className="flex flex-wrap gap-1">
                            {formatRiskCriteria(cohort.riskCriteria).map(
                              (criteria) => (
                                <span
                                  key={criteria}
                                  className="inline-block px-1.5 py-0.5 text-xs rounded border"
                                  style={{
                                    background: "oklch(0.93 0.03 254)",
                                    color: "oklch(var(--gov-navy))",
                                    borderColor: "oklch(0.82 0.04 254)",
                                    fontSize: "11px",
                                  }}
                                >
                                  {criteria}
                                </span>
                              ),
                            )}
                          </div>
                        </td>
                        <td className="text-right font-semibold">
                          {Number(cohort.cohortSize)}
                        </td>
                        <td>{formatDate(cohort.flagDate)}</td>
                        <td>
                          <UrgencyBadge urgency={cohort.urgency} />
                        </td>
                        <td>
                          <StatusBadge status={cohort.status} />
                        </td>
                        <td>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-6 text-xs rounded-none border-primary text-primary hover:bg-primary hover:text-white"
                            aria-label={`View details for cohort ${cohort.id}`}
                            onClick={() => setSelectedCohortId(cohort.id)}
                            data-ocid={`high_risk.view_details.button.${idx + 1}`}
                          >
                            View Details
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
