import { Activity, AlertTriangle, CheckCircle2, Database } from "lucide-react";
import { DATA_QUALITY_RECORDS } from "../../data/mockData";

function QualityScore({ score }: { score: number }) {
  const cls =
    score >= 90 ? "cell-good" : score >= 75 ? "cell-moderate" : "cell-poor";
  return (
    <span className={`px-2 py-0.5 rounded font-bold text-xs ${cls}`}>
      {score.toFixed(1)}%
    </span>
  );
}

function SubmissionTypeBadge({ type }: { type: string }) {
  if (type === "FHIR API") return <span className="badge-blue">{type}</span>;
  if (type === "CSV Upload") return <span className="badge-navy">{type}</span>;
  return <span className="badge-gray">{type}</span>;
}

function StatusBadge({ status }: { status: string }) {
  if (status === "processed")
    return <span className="badge-green">Processed</span>;
  if (status === "validating")
    return <span className="badge-blue">Validating</span>;
  if (status === "validation_error")
    return <span className="badge-red">Validation Error</span>;
  return <span className="badge-gray">Pending</span>;
}

const PIPELINE_STAGES = [
  { label: "Received", count: 10, status: "done" },
  { label: "Validating", count: 2, status: "active" },
  { label: "Processing", count: 1, status: "active" },
  { label: "Processed", count: 7, status: "done" },
];

export default function DataQuality() {
  const totalSubmissions = DATA_QUALITY_RECORDS.length;
  const processed = DATA_QUALITY_RECORDS.filter(
    (r) => r.status === "processed",
  ).length;
  const validationErrors = DATA_QUALITY_RECORDS.reduce(
    (sum, r) => sum + r.validationErrors,
    0,
  );
  const avgQuality =
    DATA_QUALITY_RECORDS.reduce((sum, r) => sum + r.qualityScore, 0) /
    DATA_QUALITY_RECORDS.length;

  return (
    <div className="p-6 space-y-5">
      {/* DS Hero Banner */}
      <div
        style={{
          background:
            "linear-gradient(135deg, oklch(0.14 0.055 258) 0%, oklch(0.10 0.042 258) 100%)",
          padding: "24px 28px",
          marginBottom: "24px",
          marginLeft: "-24px",
          marginRight: "-24px",
          marginTop: "-24px",
        }}
      >
        <h1
          style={{
            fontSize: "22px",
            fontWeight: 800,
            color: "#fff",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          Data Quality Dashboard
        </h1>
        <p
          style={{
            fontSize: "13px",
            color: "oklch(0.65 0.025 252)",
            marginTop: "4px",
          }}
        >
          Submission ingestion pipeline status and data quality metrics —
          Q4-2025
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="ds-card p-3 flex items-center gap-3">
          <Database className="w-6 h-6 text-gov-navy flex-shrink-0" />
          <div>
            <div className="text-xs text-muted-foreground uppercase font-semibold">
              Total Submissions
            </div>
            <div className="text-2xl font-bold text-gov-navy">
              {totalSubmissions}
            </div>
          </div>
        </div>
        <div className="ds-card p-3 flex items-center gap-3">
          <CheckCircle2
            className="w-6 h-6 flex-shrink-0"
            style={{ color: "oklch(var(--gov-green))" }}
          />
          <div>
            <div className="text-xs text-muted-foreground uppercase font-semibold">
              Processed
            </div>
            <div
              className="text-2xl font-bold"
              style={{ color: "oklch(var(--gov-green))" }}
            >
              {processed}
            </div>
          </div>
        </div>
        <div className="ds-card p-3 flex items-center gap-3">
          <AlertTriangle
            className="w-6 h-6 flex-shrink-0"
            style={{ color: "oklch(var(--gov-red))" }}
          />
          <div>
            <div className="text-xs text-muted-foreground uppercase font-semibold">
              Validation Errors
            </div>
            <div
              className="text-2xl font-bold"
              style={{ color: "oklch(var(--gov-red))" }}
            >
              {validationErrors}
            </div>
          </div>
        </div>
        <div className="ds-card p-3 flex items-center gap-3">
          <Activity
            className="w-6 h-6 flex-shrink-0"
            style={{ color: "oklch(var(--gov-blue))" }}
          />
          <div>
            <div className="text-xs text-muted-foreground uppercase font-semibold">
              Avg Quality Score
            </div>
            <div
              className="text-2xl font-bold"
              style={{ color: "oklch(var(--gov-blue))" }}
            >
              {avgQuality.toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      {/* Pipeline status */}
      <div className="ds-card overflow-hidden">
        <div
          style={{
            padding: "12px 16px",
            borderBottom: "1px solid oklch(0.90 0.01 252)",
            background: "oklch(0.97 0.008 258)",
          }}
        >
          <h3
            style={{
              fontSize: "13px",
              fontWeight: 700,
              color: "oklch(0.18 0.055 258)",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            Ingestion Pipeline Status
          </h3>
        </div>
        <div style={{ padding: "16px" }}>
          <div className="flex items-center justify-center gap-0">
            {PIPELINE_STAGES.map((stage, idx) => (
              <div key={stage.label} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className="w-20 h-14 flex flex-col items-center justify-center border rounded-none font-semibold text-sm"
                    style={{
                      background:
                        stage.status === "done"
                          ? "oklch(var(--gov-green-bg))"
                          : "oklch(var(--gov-blue-bg))",
                      borderColor:
                        stage.status === "done"
                          ? "oklch(0.72 0.12 145)"
                          : "oklch(0.65 0.14 250)",
                      color:
                        stage.status === "done"
                          ? "oklch(0.35 0.15 145)"
                          : "oklch(0.35 0.16 250)",
                    }}
                  >
                    <div className="text-xl font-bold">{stage.count}</div>
                    <div className="text-xs">{stage.label}</div>
                  </div>
                </div>
                {idx < PIPELINE_STAGES.length - 1 && (
                  <div
                    className="w-8 h-0.5 mx-0"
                    style={{ background: "oklch(var(--border))" }}
                  >
                    <div
                      className="text-center"
                      style={{
                        fontSize: "16px",
                        lineHeight: "1",
                        marginTop: "-8px",
                        color: "oklch(var(--muted-foreground))",
                      }}
                    >
                      →
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="ds-card overflow-hidden">
        <div
          style={{
            padding: "12px 16px",
            borderBottom: "1px solid oklch(0.90 0.01 252)",
            background: "oklch(0.97 0.008 258)",
          }}
        >
          <h3
            style={{
              fontSize: "13px",
              fontWeight: 700,
              color: "oklch(0.18 0.055 258)",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            Data Submissions Log
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Quality score:{" "}
            <span className="text-gov-green font-semibold">≥90% Good</span> ·{" "}
            <span className="text-gov-amber font-semibold">
              75–89% Moderate
            </span>{" "}
            · <span className="text-gov-red font-semibold">&lt;75% Poor</span>
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full gov-table">
            <thead>
              <tr>
                <th className="text-left">Submission ID</th>
                <th className="text-left">Provider</th>
                <th className="text-left">Quarter</th>
                <th className="text-left">Type</th>
                <th className="text-right">Records</th>
                <th className="text-right">Validation Errors</th>
                <th className="text-right">Quality Score</th>
                <th className="text-left">Submitted</th>
                <th className="text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {DATA_QUALITY_RECORDS.map((record, idx) => (
                <tr
                  key={record.id}
                  data-ocid={`data_quality.table.row.${idx + 1}`}
                >
                  <td className="font-mono text-xs">{record.id}</td>
                  <td className="font-medium">{record.provider}</td>
                  <td>{record.quarter}</td>
                  <td>
                    <SubmissionTypeBadge type={record.type} />
                  </td>
                  <td className="text-right">
                    {record.records.toLocaleString()}
                  </td>
                  <td className="text-right">
                    {record.validationErrors > 0 ? (
                      <span
                        className="font-semibold"
                        style={{ color: "oklch(var(--gov-red))" }}
                      >
                        {record.validationErrors}
                      </span>
                    ) : (
                      <span className="text-gov-green font-semibold">0</span>
                    )}
                  </td>
                  <td className="text-right">
                    <QualityScore score={record.qualityScore} />
                  </td>
                  <td>{record.submittedDate}</td>
                  <td>
                    <StatusBadge status={record.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
