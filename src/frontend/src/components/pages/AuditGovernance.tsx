import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Download,
  Filter,
  Flag,
  Shield,
  TrendingDown,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { AppRole } from "../../App";
import {
  MOCK_AUDIT_LOGS,
  PROVIDER_MASTER,
  getProviderRatingForQuarter,
} from "../../data/mockData";
import { useAuditLogs } from "../../hooks/useQueries";

type MockAuditLog = {
  id: string;
  userId: string;
  userRole: string;
  action: string;
  entityType: string;
  timestamp: number | bigint;
  details: string;
};

function formatTimestamp(ts: bigint | number): string {
  const num = typeof ts === "bigint" ? Number(ts) : ts;
  const date = num > 1e12 ? new Date(num) : new Date(num * 1000);
  return date.toLocaleString("en-AU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function formatDateHeader(ts: bigint | number): string {
  const num = typeof ts === "bigint" ? Number(ts) : ts;
  const date = num > 1e12 ? new Date(num) : new Date(num * 1000);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const logDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  if (logDay.getTime() === today.getTime()) return "Today";
  if (logDay.getTime() === yesterday.getTime()) return "Yesterday";
  return date.toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function RoleBadge({ role }: { role: string }) {
  const styles: Record<string, string> = {
    Regulator: "badge-navy",
    Provider: "badge-blue",
    "Policy Analyst": "badge-amber",
    System: "badge-gray",
    Public: "badge-green",
  };
  const cls = styles[role] || "badge-gray";
  return <span className={cls}>{role}</span>;
}

function TimelineIcon({ action }: { action: string }) {
  const a = action.toLowerCase();
  if (a.includes("submit") || a.includes("save"))
    return (
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
        style={{
          background: "oklch(0.93 0.07 145)",
          color: "oklch(0.45 0.15 145)",
        }}
      >
        <CheckCircle2 className="w-3 h-3" />
      </div>
    );
  if (a.includes("edit") || a.includes("update"))
    return (
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
        style={{
          background: "oklch(0.96 0.05 80)",
          color: "oklch(0.55 0.14 75)",
        }}
      >
        <Flag className="w-3 h-3" />
      </div>
    );
  if (a.includes("calc") || a.includes("rate"))
    return (
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
        style={{
          background: "oklch(0.93 0.06 280)",
          color: "oklch(0.50 0.15 280)",
        }}
      >
        <TrendingDown className="w-3 h-3" />
      </div>
    );
  return (
    <div
      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
      style={{
        background: "oklch(0.93 0.04 258)",
        color: "oklch(0.50 0.08 258)",
      }}
    >
      <Clock className="w-3 h-3" />
    </div>
  );
}

const COMPLIANCE_ITEMS = [
  {
    label: "Privacy Act 1988",
    detail: "Compliant — Last reviewed Nov 2025",
    ok: true,
  },
  {
    label: "WCAG 2.1 Level AA",
    detail: "Compliant — Audit passed Oct 2025",
    ok: true,
  },
  {
    label: "TLS 1.3 Encryption",
    detail: "Active — All endpoints secured",
    ok: true,
  },
  {
    label: "AES-256 Data Encryption",
    detail: "Active — At-rest and in-transit",
    ok: true,
  },
  {
    label: "Penetration Testing",
    detail: "Passed — Annual test Sep 2025",
    ok: true,
  },
  { label: "ISO/IEC 27001", detail: "Certified — Valid to Dec 2026", ok: true },
];

interface AuditGovernanceProps {
  currentRole?: AppRole;
}

export default function AuditGovernance({
  currentRole = "Regulator",
}: AuditGovernanceProps) {
  const [entityFilter, setEntityFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");
  const [dateRangeFilter, setDateRangeFilter] = useState("all");
  const [searchFilter, setSearchFilter] = useState("");

  const { data: liveAuditLogs, isLoading } = useAuditLogs();

  const rawLogs: MockAuditLog[] =
    liveAuditLogs && liveAuditLogs.length > 0 ? liveAuditLogs : MOCK_AUDIT_LOGS;

  // Filter logs based on role
  const roleLogs = useMemo(() => {
    if (currentRole === "Provider") {
      return rawLogs.filter((l) => l.userRole === "Provider");
    }
    if (currentRole === "Policy Analyst") {
      // Sector-level only — no provider-specific edits
      return rawLogs.filter(
        (l) => l.entityType !== "Indicator" && l.action !== "EDIT_INDICATOR",
      );
    }
    return rawLogs; // Regulator sees everything
  }, [rawLogs, currentRole]);

  const filteredLogs = useMemo(() => {
    const now = Date.now();
    const DAY = 86400000;
    return roleLogs.filter((log) => {
      const matchEntity =
        entityFilter === "all" || log.entityType === entityFilter;
      const matchRole = roleFilter === "all" || log.userRole === roleFilter;
      const matchAction =
        actionFilter === "all" ||
        log.action.toLowerCase().includes(actionFilter.toLowerCase());
      const matchSearch =
        !searchFilter ||
        log.userId.toLowerCase().includes(searchFilter.toLowerCase()) ||
        log.action.toLowerCase().includes(searchFilter.toLowerCase()) ||
        log.details.toLowerCase().includes(searchFilter.toLowerCase());

      let matchDate = true;
      const ts =
        typeof log.timestamp === "bigint"
          ? Number(log.timestamp)
          : log.timestamp;
      const ms = ts > 1e12 ? ts : ts * 1000;
      if (dateRangeFilter === "today") matchDate = now - ms < DAY;
      else if (dateRangeFilter === "last7days") matchDate = now - ms < 7 * DAY;
      else if (dateRangeFilter === "last30days")
        matchDate = now - ms < 30 * DAY;

      return (
        matchEntity && matchRole && matchAction && matchSearch && matchDate
      );
    });
  }, [
    roleLogs,
    entityFilter,
    roleFilter,
    actionFilter,
    searchFilter,
    dateRangeFilter,
  ]);

  const entityTypes = [
    "all",
    ...Array.from(new Set(rawLogs.map((l) => l.entityType))),
  ];
  const roles = ["all", ...Array.from(new Set(rawLogs.map((l) => l.userRole)))];

  // Timeline grouped by day
  const timelineGroups = useMemo(() => {
    const sorted = [...roleLogs].slice(0, 20);
    const groups: Array<{ dayLabel: string; logs: MockAuditLog[] }> = [];
    const seen = new Map<string, number>();
    for (const log of sorted) {
      const label = formatDateHeader(log.timestamp);
      if (!seen.has(label)) {
        seen.set(label, groups.length);
        groups.push({ dayLabel: label, logs: [] });
      }
      groups[seen.get(label)!].logs.push(log);
    }
    return groups;
  }, [roleLogs]);

  // Governance flags — compare Q3 vs Q4 for all providers
  const governanceFlags = useMemo(() => {
    if (currentRole === "Provider") return []; // Providers don't see system flags
    const flags: Array<{
      id: string;
      severity: "Critical" | "Warning";
      providerName: string;
      issue: string;
      detail: string;
      change: string;
      action: string;
    }> = [];

    for (const provider of PROVIDER_MASTER) {
      const q3 = getProviderRatingForQuarter(provider.id, "Q3-2025");
      const q4 = getProviderRatingForQuarter(provider.id, "Q4-2025");

      // Flag: rating drop > 1 star
      if (q3.stars - q4.stars > 1) {
        flags.push({
          id: `${provider.id}-rating-drop`,
          severity: "Critical",
          providerName: provider.name,
          issue: "Rating Drop Alert",
          detail: `Rating dropped from ${q3.stars}★ to ${q4.stars}★ between Q3 and Q4`,
          change: `−${(q3.stars - q4.stars).toFixed(1)}★`,
          action: "Review indicators and initiate performance improvement plan",
        });
      }

      // Flag: eligibility flip
      if (q3.eligibility.eligible !== q4.eligibility.eligible) {
        flags.push({
          id: `${provider.id}-eligibility-flip`,
          severity: "Warning",
          providerName: provider.name,
          issue: "Eligibility Flip",
          detail: `Eligibility changed from ${q3.eligibility.eligible ? "Eligible" : "Not Eligible"} to ${q4.eligibility.eligible ? "Eligible" : "Not Eligible"} between Q3 and Q4`,
          change: q4.eligibility.eligible ? "+Eligible" : "−Eligible",
          action: "Verify eligibility criteria and reconcile indicator data",
        });
      }

      // Flag: domain score spike > 30% in safety
      if (q3.domainScores.safety > 0) {
        const safetyChange =
          Math.abs(
            (q4.domainScores.safety - q3.domainScores.safety) /
              q3.domainScores.safety,
          ) * 100;
        if (safetyChange > 30) {
          flags.push({
            id: `${provider.id}-safety-spike`,
            severity:
              q4.domainScores.safety < q3.domainScores.safety
                ? "Critical"
                : "Warning",
            providerName: provider.name,
            issue: "Sudden Indicator Spike — Safety",
            detail: `Safety domain score changed by ${safetyChange.toFixed(1)}% between Q3 and Q4`,
            change: `${safetyChange.toFixed(0)}% shift`,
            action: "Conduct falls risk and safety incident audit",
          });
        }
      }
    }

    return flags.slice(0, 30); // limit display
  }, [currentRole]);

  const handleExport = () => {
    toast.success("Audit log export initiated — CSV will be ready shortly");
  };

  return (
    <div className="p-6 space-y-5">
      <div className="border-b pb-4 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-gov-navy">
            Audit &amp; Governance
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            System audit log, event timeline, and governance flags — Privacy Act
            1988 compliant
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="rounded-none gap-2 text-xs"
          onClick={handleExport}
          aria-label="Export audit log as CSV"
          data-ocid="audit.export.button"
        >
          <Download className="w-3.5 h-3.5" />
          Export CSV
        </Button>
      </div>

      <Tabs defaultValue="log" className="space-y-4">
        <TabsList className="rounded-none h-8">
          <TabsTrigger
            value="log"
            className="text-xs rounded-none"
            data-ocid="audit.log.tab"
          >
            Audit Log
          </TabsTrigger>
          <TabsTrigger
            value="timeline"
            className="text-xs rounded-none"
            data-ocid="audit.timeline.tab"
          >
            Timeline View
          </TabsTrigger>
          {currentRole !== "Provider" && (
            <TabsTrigger
              value="flags"
              className="text-xs rounded-none"
              data-ocid="audit.flags.tab"
            >
              Governance Flags
              {governanceFlags.length > 0 && (
                <span
                  className="ml-1.5 px-1.5 py-0.5 rounded-full text-xs font-bold"
                  style={{
                    background: "oklch(0.95 0.06 25)",
                    color: "oklch(0.52 0.22 25)",
                    fontSize: "0.6rem",
                  }}
                >
                  {
                    governanceFlags.filter((f) => f.severity === "Critical")
                      .length
                  }
                </span>
              )}
            </TabsTrigger>
          )}
        </TabsList>

        {/* ── TAB 1: Audit Log ──────────────────────────────────── */}
        <TabsContent
          value="log"
          className="space-y-4"
          data-ocid="audit.log.panel"
        >
          <div className="flex gap-5">
            <div className="flex-1 space-y-4 min-w-0">
              {/* Filter bar */}
              <div
                className="flex items-center gap-3 flex-wrap p-3 border rounded-none"
                style={{ background: "oklch(var(--muted))" }}
              >
                <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
                    Action:
                  </span>
                  <Select value={actionFilter} onValueChange={setActionFilter}>
                    <SelectTrigger
                      className="h-7 w-32 text-xs rounded-none"
                      data-ocid="audit.action.select"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        "all",
                        "view",
                        "edit",
                        "submit",
                        "export",
                        "login",
                        "calculate",
                        "system",
                      ].map((t) => (
                        <SelectItem key={t} value={t} className="text-xs">
                          {t === "all"
                            ? "All Actions"
                            : t.charAt(0).toUpperCase() + t.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
                    Entity:
                  </span>
                  <Select value={entityFilter} onValueChange={setEntityFilter}>
                    <SelectTrigger
                      className="h-7 w-36 text-xs rounded-none"
                      data-ocid="audit.entity.select"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {entityTypes.map((t) => (
                        <SelectItem key={t} value={t} className="text-xs">
                          {t === "all" ? "All Entities" : t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
                    Role:
                  </span>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger
                      className="h-7 w-32 text-xs rounded-none"
                      data-ocid="audit.role.select"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((r) => (
                        <SelectItem key={r} value={r} className="text-xs">
                          {r === "all" ? "All Roles" : r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
                    Period:
                  </span>
                  <Select
                    value={dateRangeFilter}
                    onValueChange={setDateRangeFilter}
                  >
                    <SelectTrigger
                      className="h-7 w-32 text-xs rounded-none"
                      data-ocid="audit.period.select"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="text-xs">
                        All Time
                      </SelectItem>
                      <SelectItem value="today" className="text-xs">
                        Today
                      </SelectItem>
                      <SelectItem value="last7days" className="text-xs">
                        Last 7 Days
                      </SelectItem>
                      <SelectItem value="last30days" className="text-xs">
                        Last 30 Days
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Input
                  type="search"
                  placeholder="Search logs..."
                  className="h-7 text-xs rounded-none w-36 md:w-48"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  aria-label="Search audit logs"
                  data-ocid="audit.search.input"
                />
                <span className="text-xs text-muted-foreground ml-auto">
                  {filteredLogs.length} of {roleLogs.length} records
                </span>
              </div>

              {/* Audit log table */}
              <Card className="rounded-none border">
                <CardContent className="p-0">
                  {isLoading ? (
                    <div className="p-4 space-y-2">
                      {["a1", "a2", "a3", "a4", "a5"].map((k) => (
                        <Skeleton key={k} className="h-10 rounded-none" />
                      ))}
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full gov-table">
                        <thead>
                          <tr>
                            <th
                              className="text-left"
                              style={{ minWidth: "160px" }}
                            >
                              Timestamp
                            </th>
                            <th className="text-left">User ID</th>
                            <th className="text-left">Role</th>
                            <th className="text-left">Action</th>
                            <th className="text-left">Entity</th>
                            <th
                              className="text-left"
                              style={{ minWidth: "200px" }}
                            >
                              Details
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredLogs.length === 0 ? (
                            <tr>
                              <td
                                colSpan={6}
                                className="text-center py-8 text-muted-foreground"
                              >
                                No audit log entries match the selected filters
                              </td>
                            </tr>
                          ) : (
                            filteredLogs.map((log, idx) => (
                              <tr
                                key={log.id}
                                data-ocid={`audit.log.item.${idx + 1}`}
                              >
                                <td className="font-mono text-xs whitespace-nowrap">
                                  {formatTimestamp(log.timestamp)}
                                </td>
                                <td className="font-mono text-xs">
                                  {log.userId}
                                </td>
                                <td>
                                  <RoleBadge role={log.userRole} />
                                </td>
                                <td className="font-semibold text-xs uppercase tracking-wide">
                                  {log.action.replace(/_/g, " ")}
                                </td>
                                <td>{log.entityType}</td>
                                <td className="text-xs text-muted-foreground">
                                  {log.details}
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

            {/* Compliance panel */}
            <div className="flex-shrink-0" style={{ width: "240px" }}>
              <Card className="rounded-none border">
                <CardHeader className="pb-2 pt-4 px-4 border-b">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-gov-navy" />
                    <CardTitle className="text-sm font-semibold text-gov-navy">
                      Compliance Status
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  {COMPLIANCE_ITEMS.map((item) => (
                    <div key={item.label} className="flex items-start gap-2">
                      <CheckCircle2
                        className="w-4 h-4 flex-shrink-0 mt-0.5"
                        style={{ color: "oklch(var(--gov-green))" }}
                        aria-hidden="true"
                      />
                      <div>
                        <div className="text-xs font-semibold">
                          {item.label}
                        </div>
                        <div className="text-xs text-muted-foreground leading-snug">
                          {item.detail}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div
                    className="mt-4 pt-3 border-t text-xs"
                    style={{ borderColor: "oklch(var(--border))" }}
                  >
                    <div className="font-semibold text-gov-navy mb-1">
                      Data Hosting
                    </div>
                    <div className="text-muted-foreground">
                      Australian data centres only — Azure Sovereign Cloud
                    </div>
                  </div>
                  <div
                    className="pt-3 border-t text-xs"
                    style={{ borderColor: "oklch(var(--border))" }}
                  >
                    <div className="font-semibold text-gov-navy mb-1">
                      Next Review
                    </div>
                    <div className="text-muted-foreground">
                      Q1-2026 · Scheduled 15 Feb 2026
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ── TAB 2: Timeline View ──────────────────────────────── */}
        <TabsContent
          value="timeline"
          className="space-y-4"
          data-ocid="audit.timeline.panel"
        >
          <Card className="rounded-none border">
            <CardHeader className="pb-2 pt-4 px-4 border-b">
              <CardTitle className="text-sm font-semibold text-gov-navy">
                Event Timeline — Last 20 Events
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {timelineGroups.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No events to display
                </div>
              ) : (
                <div className="space-y-5">
                  {timelineGroups.map((group) => (
                    <div key={group.dayLabel}>
                      <div
                        className="text-xs font-bold uppercase tracking-widest mb-3 pb-1 border-b"
                        style={{
                          color: "oklch(0.50 0.08 258)",
                          borderColor: "oklch(var(--border))",
                          letterSpacing: "0.08em",
                        }}
                      >
                        {group.dayLabel}
                      </div>
                      <div className="space-y-3">
                        {group.logs.map((log, idx) => (
                          <div
                            key={log.id}
                            className="flex items-start gap-3"
                            data-ocid={`audit.timeline.item.${idx + 1}`}
                          >
                            <TimelineIcon action={log.action} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-semibold">
                                  {log.action.replace(/_/g, " ")}
                                </span>
                                <RoleBadge role={log.userRole} />
                                <span className="text-xs text-muted-foreground font-mono">
                                  {log.userId}
                                </span>
                              </div>
                              <div className="text-xs text-muted-foreground mt-0.5">
                                {log.details}
                              </div>
                              <div
                                className="text-xs font-mono mt-0.5"
                                style={{
                                  color: "oklch(0.62 0.025 252)",
                                  fontSize: "0.65rem",
                                }}
                              >
                                {formatTimestamp(log.timestamp)} ·{" "}
                                {log.entityType}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB 3: Governance Flags ───────────────────────────── */}
        {currentRole !== "Provider" && (
          <TabsContent
            value="flags"
            className="space-y-4"
            data-ocid="audit.flags.panel"
          >
            <Card className="rounded-none border">
              <CardHeader className="pb-2 pt-4 px-4 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle
                      className="w-4 h-4"
                      style={{ color: "oklch(0.55 0.14 75)" }}
                    />
                    <CardTitle className="text-sm font-semibold text-gov-navy">
                      Governance Flags — Q3 vs Q4 Analysis
                    </CardTitle>
                  </div>
                  <div className="flex gap-2 text-xs">
                    <span
                      className="px-2 py-0.5 rounded-sm font-semibold"
                      style={{
                        background: "oklch(0.95 0.06 25)",
                        color: "oklch(0.52 0.22 25)",
                      }}
                    >
                      {
                        governanceFlags.filter((f) => f.severity === "Critical")
                          .length
                      }{" "}
                      Critical
                    </span>
                    <span
                      className="px-2 py-0.5 rounded-sm font-semibold"
                      style={{
                        background: "oklch(0.96 0.05 80)",
                        color: "oklch(0.55 0.14 75)",
                      }}
                    >
                      {
                        governanceFlags.filter((f) => f.severity === "Warning")
                          .length
                      }{" "}
                      Warning
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {governanceFlags.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground text-sm">
                    <CheckCircle2
                      className="w-8 h-8 mx-auto mb-2"
                      style={{ color: "oklch(var(--gov-green))" }}
                    />
                    No governance flags detected — all providers within
                    acceptable thresholds
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full gov-table">
                      <thead>
                        <tr>
                          <th className="text-left">Severity</th>
                          <th className="text-left">Provider</th>
                          <th className="text-left">Issue</th>
                          <th className="text-left">Detail</th>
                          <th className="text-right">Change</th>
                          <th className="text-left">Recommended Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {governanceFlags.map((flag, idx) => (
                          <tr
                            key={flag.id}
                            data-ocid={`audit.flag.item.${idx + 1}`}
                          >
                            <td>
                              <span
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-xs font-semibold"
                                style={{
                                  background:
                                    flag.severity === "Critical"
                                      ? "oklch(0.95 0.06 25)"
                                      : "oklch(0.96 0.05 80)",
                                  color:
                                    flag.severity === "Critical"
                                      ? "oklch(0.52 0.22 25)"
                                      : "oklch(0.55 0.14 75)",
                                }}
                              >
                                {flag.severity === "Critical" ? (
                                  <AlertTriangle className="w-2.5 h-2.5" />
                                ) : (
                                  <Flag className="w-2.5 h-2.5" />
                                )}
                                {flag.severity}
                              </span>
                            </td>
                            <td className="font-semibold text-xs">
                              {flag.providerName}
                            </td>
                            <td className="font-medium text-xs">
                              {flag.issue}
                            </td>
                            <td className="text-xs text-muted-foreground">
                              {flag.detail}
                            </td>
                            <td
                              className="text-right font-mono text-xs font-bold"
                              style={{
                                color: flag.change.startsWith("-")
                                  ? "oklch(0.52 0.22 25)"
                                  : "oklch(0.45 0.15 145)",
                              }}
                            >
                              {flag.change}
                            </td>
                            <td className="text-xs text-muted-foreground">
                              {flag.action}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
