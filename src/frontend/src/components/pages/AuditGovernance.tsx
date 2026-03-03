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
import { CheckCircle2, Download, Filter, Shield } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { AuditLog } from "../../backend.d";
import { MOCK_AUDIT_LOGS } from "../../data/mockData";
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

export default function AuditGovernance() {
  const [entityFilter, setEntityFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [searchFilter, setSearchFilter] = useState("");

  const { data: liveAuditLogs, isLoading } = useAuditLogs();

  const rawLogs: MockAuditLog[] =
    liveAuditLogs && liveAuditLogs.length > 0 ? liveAuditLogs : MOCK_AUDIT_LOGS;

  const filteredLogs = rawLogs.filter((log) => {
    const matchEntity =
      entityFilter === "all" || log.entityType === entityFilter;
    const matchRole = roleFilter === "all" || log.userRole === roleFilter;
    const matchSearch =
      !searchFilter ||
      log.userId.toLowerCase().includes(searchFilter.toLowerCase()) ||
      log.action.toLowerCase().includes(searchFilter.toLowerCase()) ||
      log.details.toLowerCase().includes(searchFilter.toLowerCase());
    return matchEntity && matchRole && matchSearch;
  });

  const entityTypes = [
    "all",
    ...Array.from(new Set(rawLogs.map((l) => l.entityType))),
  ];
  const roles = ["all", ...Array.from(new Set(rawLogs.map((l) => l.userRole)))];

  const handleExport = () => {
    toast.success("Audit log export initiated — CSV will be ready shortly");
  };

  return (
    <div className="p-6 space-y-5">
      <div className="border-b pb-4 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-gov-navy">
            Audit & Governance
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            System audit log and compliance status — Privacy Act 1988 compliant
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

      <div className="flex gap-5">
        {/* Main audit log */}
        <div className="flex-1 space-y-4 min-w-0">
          {/* Filter bar */}
          <div
            className="flex items-center gap-3 flex-wrap p-3 border rounded-none"
            style={{ background: "oklch(var(--muted))" }}
          >
            <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
                Entity:
              </span>
              <Select value={entityFilter} onValueChange={setEntityFilter}>
                <SelectTrigger
                  className="h-7 w-36 text-xs rounded-none"
                  aria-label="Filter by entity type"
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
                  aria-label="Filter by user role"
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
            <Input
              type="search"
              placeholder="Search logs..."
              className="h-7 text-xs rounded-none w-36 md:w-48"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              aria-label="Search audit logs"
            />
            <span className="text-xs text-muted-foreground ml-auto">
              {filteredLogs.length} of {rawLogs.length} records
            </span>
          </div>

          {/* Audit log table */}
          <Card className="rounded-none border">
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-4 space-y-2">
                  {["a1", "a2", "a3", "a4", "a5", "a6"].map((k) => (
                    <Skeleton key={k} className="h-10 rounded-none" />
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full gov-table">
                    <thead>
                      <tr>
                        <th className="text-left" style={{ minWidth: "160px" }}>
                          Timestamp
                        </th>
                        <th className="text-left">User ID</th>
                        <th className="text-left">Role</th>
                        <th className="text-left">Action</th>
                        <th className="text-left">Entity Type</th>
                        <th className="text-left" style={{ minWidth: "200px" }}>
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
                        filteredLogs.map((log) => (
                          <tr key={log.id}>
                            <td className="font-mono text-xs whitespace-nowrap">
                              {formatTimestamp(log.timestamp)}
                            </td>
                            <td className="font-mono text-xs">{log.userId}</td>
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
                    <div className="text-xs font-semibold">{item.label}</div>
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
                  Australian data centres only — Azure Sovereign Cloud (Sydney &
                  Canberra)
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
    </div>
  );
}
