import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertTriangle,
  Bell,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  History,
  Info,
  LifeBuoy,
  Mail,
  MessageSquare,
  Phone,
  Plus,
  Send,
  Shield,
  Ticket,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import type { AppRole } from "../../App";
import {
  type TicketCategory,
  type TicketPriority,
  type TicketStatus,
  useSupportContext,
} from "../../context/SupportContext";
import {
  PROVIDER_MASTER,
  getProviderRatingForQuarter,
} from "../../data/mockData";
import { PROVIDER_CONTACTS } from "../../data/providerContacts";
import ContactProviderModal from "../ContactProviderModal";

interface ContactSupportProps {
  currentRole: AppRole;
  currentQuarter: string;
}

const FAQS = [
  {
    q: "How is my provider's star rating calculated?",
    a: "Ratings are calculated using a weighted domain model: Safety (30%), Preventive Care (20%), Quality (20%), Staffing (15%), Compliance (10%), and Resident Experience (5%). Each indicator is compared against national benchmarks and converted to a 0–100 domain score, then mapped to a 1–5 star scale.",
  },
  {
    q: "How do I book a service with a provider?",
    a: "Navigate to Find Providers in the Public portal, select a provider, scroll to 'Available Services', and click 'Book Appointment'. You'll be guided through a 3-step booking wizard to choose your service, date/time, and confirm details.",
  },
  {
    q: "What does 'Not Eligible' for Pay-for-Improvement mean?",
    a: "Pay-for-Improvement eligibility requires a provider to have ≥4.0 stars and a positive improvement trend with majority indicators above benchmark. Providers below these thresholds are marked 'Not Eligible' and receive no funding allocation.",
  },
  {
    q: "How do I raise an issue or dispute a rating?",
    a: "Use the 'My Tickets' tab on this page to raise a support ticket. Select category 'Rating' and describe the discrepancy. The Regulator team will review your submission within 2 business days.",
  },
  {
    q: "What are the working hours for support?",
    a: "The National Aged Care Support Centre operates Monday to Friday, 8:00am to 6:00pm AEST. For urgent after-hours matters involving resident safety, contact 1800 AGED CARE (1800 243 227) which operates 24/7.",
  },
  {
    q: "How can I update my provider's indicator data?",
    a: "Provider administrators can navigate to their Provider Dashboard and select the 'Indicators' tab. Indicator values can be edited directly. Changes trigger an immediate recalculation and update the rating engine within seconds.",
  },
  {
    q: "How do I compare providers side by side?",
    a: "Use the 'Provider Comparison' feature in the Analytics section of your sidebar. Select 2–5 providers from the dropdown to compare their domain scores, ratings, risk levels, and quarterly trends in a visual chart.",
  },
  {
    q: "Who do I contact for a privacy or data request?",
    a: "For Privacy Act 1988 data requests or complaints, contact the N-ACRM Data Governance team at data.governance@nacrm.gov.au or raise a ticket with category 'DataQuery' for formal data access requests.",
  },
];

function formatDate(d: Date): string {
  return new Date(d).toLocaleDateString("en-AU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatusBadge({ status }: { status: TicketStatus }) {
  const cfg = {
    Open: {
      bg: "oklch(0.78 0.15 68 / 0.15)",
      color: "oklch(0.78 0.15 68)",
      border: "oklch(0.78 0.15 68 / 0.35)",
    },
    InProgress: {
      bg: "oklch(0.62 0.18 260 / 0.15)",
      color: "oklch(0.62 0.18 260)",
      border: "oklch(0.62 0.18 260 / 0.35)",
    },
    Resolved: {
      bg: "oklch(0.72 0.18 142 / 0.15)",
      color: "oklch(0.72 0.18 142)",
      border: "oklch(0.72 0.18 142 / 0.35)",
    },
  }[status];
  const labels = {
    Open: "Open",
    InProgress: "In Progress",
    Resolved: "Resolved",
  };
  return (
    <span
      style={{
        padding: "3px 9px",
        borderRadius: "12px",
        fontSize: "11px",
        fontWeight: 600,
        background: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.border}`,
        whiteSpace: "nowrap",
      }}
    >
      {labels[status]}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: TicketPriority }) {
  const cfg = {
    Critical: {
      bg: "oklch(0.65 0.22 25 / 0.15)",
      color: "oklch(0.65 0.22 25)",
      border: "oklch(0.65 0.22 25 / 0.35)",
    },
    High: {
      bg: "oklch(0.70 0.18 50 / 0.15)",
      color: "oklch(0.70 0.18 50)",
      border: "oklch(0.70 0.18 50 / 0.35)",
    },
    Medium: {
      bg: "oklch(0.78 0.15 68 / 0.15)",
      color: "oklch(0.78 0.15 68)",
      border: "oklch(0.78 0.15 68 / 0.35)",
    },
    Low: {
      bg: "oklch(0.55 0.025 252 / 0.15)",
      color: "oklch(0.55 0.025 252)",
      border: "oklch(0.55 0.025 252 / 0.35)",
    },
  }[priority];
  return (
    <span
      style={{
        padding: "3px 9px",
        borderRadius: "12px",
        fontSize: "11px",
        fontWeight: 600,
        background: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.border}`,
        whiteSpace: "nowrap",
      }}
    >
      {priority}
    </span>
  );
}

function AlertSeverityIcon({ severity }: { severity: string }) {
  if (severity === "critical")
    return (
      <AlertTriangle
        style={{ width: "16px", height: "16px", color: "oklch(0.65 0.22 25)" }}
      />
    );
  if (severity === "warning")
    return (
      <AlertTriangle
        style={{ width: "16px", height: "16px", color: "oklch(0.78 0.15 68)" }}
      />
    );
  return (
    <Info
      style={{ width: "16px", height: "16px", color: "oklch(0.62 0.18 260)" }}
    />
  );
}

export default function ContactSupport({
  currentRole,
  currentQuarter,
}: ContactSupportProps) {
  const {
    supportStatus,
    createTicket,
    updateTicketStatus,
    addTicketResponse,
    dismissAlert,
    getTicketsForRole,
    getAlertsForRole,
    communicationHistory,
  } = useSupportContext();

  const [activeTab, setActiveTab] = useState("overview");
  const [ticketFilter, setTicketFilter] = useState<"All" | TicketStatus>("All");
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null);
  const [responseText, setResponseText] = useState<Record<string, string>>({});

  // New ticket form state
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newCategory, setNewCategory] = useState<TicketCategory>("System");
  const [newPriority, setNewPriority] = useState<TicketPriority>("Medium");
  const [ticketSubmitted, setTicketSubmitted] = useState(false);

  // Contact provider modal
  const [contactProvider, setContactProvider] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const myTickets = getTicketsForRole(currentRole);
  const myAlerts = getAlertsForRole(currentRole);

  const filteredTickets =
    ticketFilter === "All"
      ? myTickets
      : myTickets.filter((t) => t.status === ticketFilter);

  const handleSubmitTicket = () => {
    if (!newTitle.trim() || !newDesc.trim()) return;
    createTicket({
      title: newTitle,
      description: newDesc,
      category: newCategory,
      priority: newPriority,
      status: "Open",
      submitterRole: currentRole,
    });
    setNewTitle("");
    setNewDesc("");
    setNewCategory("System");
    setNewPriority("Medium");
    setShowNewTicketForm(false);
    setTicketSubmitted(true);
    setTimeout(() => setTicketSubmitted(false), 4000);
    setActiveTab("tickets");
    setTicketFilter("Open");
  };

  const handleAddResponse = (ticketId: string) => {
    const msg = responseText[ticketId];
    if (!msg?.trim()) return;
    addTicketResponse(ticketId, {
      authorRole: currentRole,
      message: msg,
      timestamp: new Date(),
    });
    setResponseText((prev) => ({ ...prev, [ticketId]: "" }));
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: LifeBuoy },
    { id: "tickets", label: "My Tickets", icon: Ticket },
    { id: "history", label: "Communication History", icon: History },
    { id: "alerts", label: "System Alerts", icon: Bell },
    ...(currentRole === "Regulator"
      ? [{ id: "escalation", label: "Escalation Tools", icon: Users }]
      : []),
  ];

  const cardStyle: React.CSSProperties = {
    background: "oklch(0.16 0.052 258 / 0.8)",
    border: "1px solid oklch(0.22 0.055 258)",
    borderRadius: "12px",
    padding: "20px",
    backdropFilter: "blur(8px)",
  };

  const sectionLabel: React.CSSProperties = {
    fontSize: "11px",
    fontWeight: 700,
    color: "oklch(0.50 0.04 258)",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    marginBottom: "10px",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      {/* Hero */}
      <div
        style={{
          background:
            "linear-gradient(135deg, oklch(0.14 0.055 258) 0%, oklch(0.10 0.042 258) 100%)",
          padding: "28px",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              background:
                "linear-gradient(135deg, oklch(0.48 0.18 260), oklch(0.40 0.22 290))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <LifeBuoy
              style={{
                width: "22px",
                height: "22px",
                color: "oklch(0.74 0.14 86)",
              }}
            />
          </div>
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#fff" }}>
              Contact &amp; Support
            </h1>
            <p
              style={{
                fontSize: "13px",
                color: "oklch(0.65 0.025 252)",
                marginTop: "3px",
              }}
            >
              {currentRole === "Regulator" &&
                "Manage provider communications, monitor complaints, and escalate issues"}
              {currentRole === "Provider" &&
                "Get help, raise issues, and track your support requests"}
              {currentRole === "Policy Analyst" &&
                "Contact regulators, raise data queries, and access support resources"}
              {currentRole === "Public" &&
                "Find help, contact providers, and track your support requests"}
            </p>
          </div>
          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 14px",
              borderRadius: "20px",
              background: supportStatus.online
                ? "oklch(0.72 0.18 142 / 0.15)"
                : "oklch(0.65 0.22 25 / 0.15)",
              border: `1px solid ${supportStatus.online ? "oklch(0.72 0.18 142 / 0.35)" : "oklch(0.65 0.22 25 / 0.35)"}`,
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: supportStatus.online
                  ? "oklch(0.72 0.18 142)"
                  : "oklch(0.65 0.22 25)",
                boxShadow: `0 0 8px ${supportStatus.online ? "oklch(0.72 0.18 142)" : "oklch(0.65 0.22 25)"}`,
                animation: supportStatus.online
                  ? "pulse-dot 2s infinite"
                  : "none",
              }}
            />
            <span
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: supportStatus.online
                  ? "oklch(0.72 0.18 142)"
                  : "oklch(0.65 0.22 25)",
              }}
            >
              {supportStatus.online ? "Support Online" : "Support Offline"}
            </span>
          </div>
        </div>
      </div>

      {/* Tab Bar */}
      <div
        style={{
          display: "flex",
          background: "oklch(0.12 0.048 258)",
          borderBottom: "1px solid oklch(0.18 0.048 258)",
          flexShrink: 0,
          overflowX: "auto",
        }}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "7px",
                padding: "12px 18px",
                fontSize: "13px",
                fontWeight: isActive ? 600 : 500,
                color: isActive
                  ? "oklch(0.74 0.14 86)"
                  : "oklch(0.55 0.025 252)",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                borderBottom: isActive
                  ? "2px solid oklch(0.74 0.14 86)"
                  : "2px solid transparent",
                whiteSpace: "nowrap",
                transition: "all 150ms ease",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              <Icon style={{ width: "14px", height: "14px" }} />
              {tab.label}
              {tab.id === "alerts" && myAlerts.length > 0 && (
                <span
                  style={{
                    padding: "1px 6px",
                    borderRadius: "10px",
                    background: "oklch(0.65 0.22 25)",
                    color: "#fff",
                    fontSize: "10px",
                    fontWeight: 700,
                  }}
                >
                  {myAlerts.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          background: "oklch(0.11 0.042 258)",
          padding: "24px",
        }}
      >
        {/* ── OVERVIEW ── */}
        {activeTab === "overview" && (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "24px" }}
          >
            {/* Support Status */}
            <div style={cardStyle}>
              <div style={sectionLabel}>Live Support Status</div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                  gap: "14px",
                }}
              >
                {[
                  {
                    label: "Status",
                    value: supportStatus.online ? "Online" : "Offline",
                    color: supportStatus.online
                      ? "oklch(0.72 0.18 142)"
                      : "oklch(0.65 0.22 25)",
                    icon: <Shield style={{ width: "18px", height: "18px" }} />,
                  },
                  {
                    label: "Avg Response",
                    value: supportStatus.avgResponseTime,
                    color: "oklch(0.74 0.14 86)",
                    icon: <Clock style={{ width: "18px", height: "18px" }} />,
                  },
                  {
                    label: "Open Tickets",
                    value: String(supportStatus.openTickets),
                    color: "oklch(0.62 0.18 260)",
                    icon: <Ticket style={{ width: "18px", height: "18px" }} />,
                  },
                  {
                    label: "Resolved Today",
                    value: String(supportStatus.resolvedToday),
                    color: "oklch(0.72 0.18 142)",
                    icon: (
                      <CheckCircle style={{ width: "18px", height: "18px" }} />
                    ),
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    style={{
                      background: "oklch(0.14 0.048 258 / 0.6)",
                      border: "1px solid oklch(0.20 0.052 258)",
                      borderRadius: "10px",
                      padding: "14px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                    }}
                  >
                    <div style={{ color: stat.color }}>{stat.icon}</div>
                    <div
                      style={{
                        fontSize: "20px",
                        fontWeight: 700,
                        color: stat.color,
                      }}
                    >
                      {stat.value}
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "oklch(0.55 0.025 252)",
                      }}
                    >
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Contact */}
            <div style={cardStyle}>
              <div style={sectionLabel}>Quick Contact</div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: "12px",
                }}
              >
                {[
                  {
                    icon: Phone,
                    color: "oklch(0.62 0.18 260)",
                    title: "National Support Line",
                    sub: "+61 1800 200 422",
                    note: "Mon-Fri 8am–6pm AEST",
                  },
                  {
                    icon: Mail,
                    color: "oklch(0.74 0.14 86)",
                    title: "Email Support",
                    sub: "support@nacrm.gov.au",
                    note: "Response within 24 hours",
                  },
                  {
                    icon: Phone,
                    color: "oklch(0.65 0.22 25)",
                    title: "Emergency Line",
                    sub: "1800 AGED CARE",
                    note: "24/7 availability",
                  },
                ].map((c) => {
                  const Icon = c.icon;
                  return (
                    <div
                      key={c.title}
                      style={{
                        background: "oklch(0.14 0.048 258 / 0.6)",
                        border: "1px solid oklch(0.20 0.052 258)",
                        borderRadius: "10px",
                        padding: "16px",
                        display: "flex",
                        gap: "12px",
                        alignItems: "flex-start",
                      }}
                    >
                      <div
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "8px",
                          background: `${c.color} / 0.15`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          border: `1px solid ${c.color} / 0.3`,
                        }}
                      >
                        <Icon
                          style={{
                            width: "16px",
                            height: "16px",
                            color: c.color,
                          }}
                        />
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: "13px",
                            fontWeight: 600,
                            color: "#fff",
                            marginBottom: "3px",
                          }}
                        >
                          {c.title}
                        </div>
                        <div
                          style={{
                            fontSize: "14px",
                            fontWeight: 700,
                            color: c.color,
                            marginBottom: "2px",
                          }}
                        >
                          {c.sub}
                        </div>
                        <div
                          style={{
                            fontSize: "11px",
                            color: "oklch(0.55 0.025 252)",
                          }}
                        >
                          {c.note}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* FAQs */}
            <div style={cardStyle}>
              <div style={sectionLabel}>Frequently Asked Questions</div>
              <Accordion type="single" collapsible>
                {FAQS.map((faq) => (
                  <AccordionItem
                    key={faq.q.substring(0, 30)}
                    value={faq.q.substring(0, 30)}
                    style={{ borderBottom: "1px solid oklch(0.20 0.048 258)" }}
                  >
                    <AccordionTrigger
                      style={{
                        color: "oklch(0.88 0.018 252)",
                        fontSize: "13px",
                        fontWeight: 500,
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        textAlign: "left",
                      }}
                    >
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent
                      style={{
                        color: "oklch(0.68 0.022 252)",
                        fontSize: "13px",
                        lineHeight: 1.6,
                        paddingBottom: "12px",
                      }}
                    >
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        )}

        {/* ── TICKETS ── */}
        {activeTab === "tickets" && (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            {ticketSubmitted && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "12px 16px",
                  borderRadius: "10px",
                  background: "oklch(0.72 0.18 142 / 0.15)",
                  border: "1px solid oklch(0.72 0.18 142 / 0.35)",
                }}
              >
                <CheckCircle
                  style={{
                    width: "16px",
                    height: "16px",
                    color: "oklch(0.72 0.18 142)",
                  }}
                />
                <span
                  style={{
                    fontSize: "13px",
                    color: "oklch(0.72 0.18 142)",
                    fontWeight: 500,
                  }}
                >
                  Ticket submitted successfully. Our team will respond within{" "}
                  {supportStatus.avgResponseTime}.
                </span>
              </div>
            )}

            {/* Header row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              <div style={{ display: "flex", gap: "6px" }}>
                {(["All", "Open", "InProgress", "Resolved"] as const).map(
                  (f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setTicketFilter(f)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "8px",
                        fontSize: "12px",
                        fontWeight: 500,
                        cursor: "pointer",
                        border: "1px solid",
                        transition: "all 150ms ease",
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        background:
                          ticketFilter === f
                            ? "oklch(0.52 0.18 260 / 0.2)"
                            : "oklch(0.16 0.048 258 / 0.6)",
                        color:
                          ticketFilter === f
                            ? "oklch(0.78 0.15 260)"
                            : "oklch(0.60 0.025 252)",
                        borderColor:
                          ticketFilter === f
                            ? "oklch(0.52 0.18 260 / 0.5)"
                            : "oklch(0.22 0.048 258)",
                      }}
                    >
                      {f === "InProgress" ? "In Progress" : f}
                    </button>
                  ),
                )}
              </div>
              <button
                type="button"
                onClick={() => setShowNewTicketForm(!showNewTicketForm)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  background:
                    "linear-gradient(135deg, oklch(0.52 0.18 260), oklch(0.44 0.22 285))",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: 600,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                <Plus style={{ width: "14px", height: "14px" }} />
                Raise New Ticket
              </button>
            </div>

            {/* New Ticket Form */}
            {showNewTicketForm && (
              <div
                style={{
                  ...cardStyle,
                  border: "1px solid oklch(0.52 0.18 260 / 0.4)",
                }}
              >
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "#fff",
                    marginBottom: "16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <Plus
                    style={{
                      width: "14px",
                      height: "14px",
                      color: "oklch(0.62 0.18 260)",
                    }}
                  />
                  New Support Ticket
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  <div>
                    <Label
                      style={{
                        color: "oklch(0.75 0.022 252)",
                        fontSize: "12px",
                        marginBottom: "5px",
                        display: "block",
                      }}
                    >
                      Title *
                    </Label>
                    <Input
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="Brief description of your issue"
                      style={{
                        background: "oklch(0.18 0.052 258)",
                        border: "1px solid oklch(0.28 0.055 258)",
                        color: "#fff",
                        fontSize: "13px",
                      }}
                    />
                  </div>
                  <div>
                    <Label
                      style={{
                        color: "oklch(0.75 0.022 252)",
                        fontSize: "12px",
                        marginBottom: "5px",
                        display: "block",
                      }}
                    >
                      Description *
                    </Label>
                    <Textarea
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                      placeholder="Please provide full details about your issue..."
                      rows={3}
                      style={{
                        background: "oklch(0.18 0.052 258)",
                        border: "1px solid oklch(0.28 0.055 258)",
                        color: "#fff",
                        fontSize: "13px",
                        resize: "vertical",
                      }}
                    />
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "10px",
                    }}
                  >
                    <div>
                      <Label
                        style={{
                          color: "oklch(0.75 0.022 252)",
                          fontSize: "12px",
                          marginBottom: "5px",
                          display: "block",
                        }}
                      >
                        Category
                      </Label>
                      <Select
                        value={newCategory}
                        onValueChange={(v) =>
                          setNewCategory(v as TicketCategory)
                        }
                      >
                        <SelectTrigger
                          style={{
                            background: "oklch(0.18 0.052 258)",
                            border: "1px solid oklch(0.28 0.055 258)",
                            color: "#fff",
                            fontSize: "13px",
                          }}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {(
                            [
                              "Provider",
                              "Booking",
                              "Rating",
                              "System",
                              "DataQuery",
                            ] as TicketCategory[]
                          ).map((c) => (
                            <SelectItem key={c} value={c}>
                              {c === "DataQuery" ? "Data Query" : c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label
                        style={{
                          color: "oklch(0.75 0.022 252)",
                          fontSize: "12px",
                          marginBottom: "5px",
                          display: "block",
                        }}
                      >
                        Priority
                      </Label>
                      <Select
                        value={newPriority}
                        onValueChange={(v) =>
                          setNewPriority(v as TicketPriority)
                        }
                      >
                        <SelectTrigger
                          style={{
                            background: "oklch(0.18 0.052 258)",
                            border: "1px solid oklch(0.28 0.055 258)",
                            color: "#fff",
                            fontSize: "13px",
                          }}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {(
                            [
                              "Low",
                              "Medium",
                              "High",
                              "Critical",
                            ] as TicketPriority[]
                          ).map((p) => (
                            <SelectItem key={p} value={p}>
                              {p}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      justifyContent: "flex-end",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setShowNewTicketForm(false)}
                      style={{
                        padding: "8px 14px",
                        borderRadius: "7px",
                        background: "oklch(0.22 0.048 258)",
                        border: "1px solid oklch(0.28 0.048 258)",
                        color: "oklch(0.70 0.022 252)",
                        fontSize: "13px",
                        cursor: "pointer",
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmitTicket}
                      disabled={!newTitle.trim() || !newDesc.trim()}
                      style={{
                        padding: "8px 16px",
                        borderRadius: "7px",
                        background:
                          newTitle.trim() && newDesc.trim()
                            ? "linear-gradient(135deg, oklch(0.52 0.18 260), oklch(0.44 0.22 285))"
                            : "oklch(0.24 0.035 258)",
                        color: "#fff",
                        border: "none",
                        fontSize: "13px",
                        fontWeight: 600,
                        cursor:
                          newTitle.trim() && newDesc.trim()
                            ? "pointer"
                            : "not-allowed",
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                      }}
                    >
                      Submit Ticket
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Ticket List */}
            {filteredTickets.length === 0 ? (
              <div
                style={{
                  ...cardStyle,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "10px",
                  padding: "40px",
                }}
              >
                <Ticket
                  style={{
                    width: "36px",
                    height: "36px",
                    color: "oklch(0.40 0.04 258)",
                  }}
                />
                <div
                  style={{
                    fontSize: "15px",
                    fontWeight: 600,
                    color: "oklch(0.55 0.025 252)",
                  }}
                >
                  No tickets found
                </div>
                <div
                  style={{ fontSize: "13px", color: "oklch(0.45 0.022 252)" }}
                >
                  Raise a new ticket to get help from our support team.
                </div>
              </div>
            ) : (
              filteredTickets.map((ticket) => {
                const isExpanded = expandedTicket === ticket.id;
                return (
                  <div
                    key={ticket.id}
                    style={{ ...cardStyle, padding: "0", overflow: "hidden" }}
                  >
                    <div style={{ padding: "16px 20px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          justifyContent: "space-between",
                          gap: "10px",
                          flexWrap: "wrap",
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              marginBottom: "5px",
                              flexWrap: "wrap",
                            }}
                          >
                            <span
                              style={{
                                fontSize: "11px",
                                color: "oklch(0.50 0.04 258)",
                                fontWeight: 600,
                              }}
                            >
                              {ticket.id}
                            </span>
                            <StatusBadge status={ticket.status} />
                            <PriorityBadge priority={ticket.priority} />
                            <span
                              style={{
                                padding: "2px 8px",
                                borderRadius: "10px",
                                fontSize: "10px",
                                fontWeight: 600,
                                background: "oklch(0.22 0.048 258)",
                                color: "oklch(0.60 0.025 252)",
                              }}
                            >
                              {ticket.category === "DataQuery"
                                ? "Data Query"
                                : ticket.category}
                            </span>
                          </div>
                          <div
                            style={{
                              fontSize: "14px",
                              fontWeight: 600,
                              color: "#fff",
                              marginBottom: "4px",
                            }}
                          >
                            {ticket.title}
                          </div>
                          <div
                            style={{
                              fontSize: "12px",
                              color: "oklch(0.60 0.022 252)",
                              lineHeight: 1.5,
                            }}
                          >
                            {!isExpanded
                              ? ticket.description.substring(0, 120) +
                                (ticket.description.length > 120 ? "..." : "")
                              : ticket.description}
                          </div>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-end",
                            gap: "6px",
                            flexShrink: 0,
                          }}
                        >
                          <div
                            style={{
                              fontSize: "11px",
                              color: "oklch(0.45 0.022 252)",
                            }}
                          >
                            {formatDate(ticket.createdAt)}
                          </div>
                          {ticket.providerName && (
                            <span
                              style={{
                                fontSize: "11px",
                                color: "oklch(0.62 0.12 260)",
                                fontWeight: 500,
                              }}
                            >
                              {ticket.providerName}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedTicket(isExpanded ? null : ticket.id)
                            }
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              padding: "4px 10px",
                              borderRadius: "6px",
                              background: "oklch(0.20 0.048 258)",
                              border: "1px solid oklch(0.26 0.048 258)",
                              color: "oklch(0.65 0.025 252)",
                              fontSize: "12px",
                              cursor: "pointer",
                              fontFamily: "'Plus Jakarta Sans', sans-serif",
                            }}
                          >
                            {isExpanded ? (
                              <ChevronUp
                                style={{ width: "12px", height: "12px" }}
                              />
                            ) : (
                              <ChevronDown
                                style={{ width: "12px", height: "12px" }}
                              />
                            )}
                            {isExpanded ? "Less" : "View Thread"}
                          </button>
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div
                        style={{
                          borderTop: "1px solid oklch(0.20 0.048 258)",
                          padding: "16px 20px",
                          background: "oklch(0.13 0.045 258 / 0.5)",
                        }}
                      >
                        {/* Status actions */}
                        {currentRole === "Regulator" &&
                          ticket.status !== "Resolved" && (
                            <div
                              style={{
                                display: "flex",
                                gap: "6px",
                                marginBottom: "14px",
                                flexWrap: "wrap",
                              }}
                            >
                              <span
                                style={{
                                  fontSize: "12px",
                                  color: "oklch(0.55 0.025 252)",
                                  alignSelf: "center",
                                }}
                              >
                                Update status:
                              </span>
                              {ticket.status === "Open" && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateTicketStatus(ticket.id, "InProgress")
                                  }
                                  style={{
                                    padding: "5px 12px",
                                    borderRadius: "6px",
                                    background: "oklch(0.62 0.18 260 / 0.2)",
                                    border:
                                      "1px solid oklch(0.62 0.18 260 / 0.4)",
                                    color: "oklch(0.62 0.18 260)",
                                    fontSize: "12px",
                                    cursor: "pointer",
                                    fontFamily:
                                      "'Plus Jakarta Sans', sans-serif",
                                    fontWeight: 500,
                                  }}
                                >
                                  Mark In Progress
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() =>
                                  updateTicketStatus(ticket.id, "Resolved")
                                }
                                style={{
                                  padding: "5px 12px",
                                  borderRadius: "6px",
                                  background: "oklch(0.72 0.18 142 / 0.2)",
                                  border:
                                    "1px solid oklch(0.72 0.18 142 / 0.4)",
                                  color: "oklch(0.72 0.18 142)",
                                  fontSize: "12px",
                                  cursor: "pointer",
                                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                                  fontWeight: 500,
                                }}
                              >
                                Mark Resolved
                              </button>
                            </div>
                          )}

                        {/* Responses */}
                        {ticket.responses.length > 0 && (
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "10px",
                              marginBottom: "14px",
                            }}
                          >
                            {ticket.responses.map((r) => (
                              <div
                                key={r.id}
                                style={{
                                  display: "flex",
                                  gap: "10px",
                                  alignItems: "flex-start",
                                }}
                              >
                                <div
                                  style={{
                                    width: "28px",
                                    height: "28px",
                                    borderRadius: "50%",
                                    background:
                                      "linear-gradient(135deg, oklch(0.48 0.18 260), oklch(0.40 0.22 290))",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                  }}
                                >
                                  <MessageSquare
                                    style={{
                                      width: "12px",
                                      height: "12px",
                                      color: "#fff",
                                    }}
                                  />
                                </div>
                                <div
                                  style={{
                                    flex: 1,
                                    background: "oklch(0.15 0.048 258 / 0.8)",
                                    border: "1px solid oklch(0.22 0.048 258)",
                                    borderRadius: "8px",
                                    padding: "10px 12px",
                                  }}
                                >
                                  <div
                                    style={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      marginBottom: "5px",
                                    }}
                                  >
                                    <span
                                      style={{
                                        fontSize: "11px",
                                        fontWeight: 600,
                                        color: "oklch(0.62 0.12 260)",
                                      }}
                                    >
                                      {r.authorRole}
                                    </span>
                                    <span
                                      style={{
                                        fontSize: "10px",
                                        color: "oklch(0.45 0.022 252)",
                                      }}
                                    >
                                      {formatDate(r.timestamp)}
                                    </span>
                                  </div>
                                  <p
                                    style={{
                                      fontSize: "12px",
                                      color: "oklch(0.78 0.018 252)",
                                      lineHeight: 1.5,
                                      margin: 0,
                                    }}
                                  >
                                    {r.message}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Add response */}
                        {ticket.status !== "Resolved" && (
                          <div
                            style={{
                              display: "flex",
                              gap: "8px",
                              alignItems: "flex-end",
                            }}
                          >
                            <Textarea
                              value={responseText[ticket.id] || ""}
                              onChange={(e) =>
                                setResponseText((prev) => ({
                                  ...prev,
                                  [ticket.id]: e.target.value,
                                }))
                              }
                              placeholder="Add a response..."
                              rows={2}
                              style={{
                                flex: 1,
                                background: "oklch(0.18 0.052 258)",
                                border: "1px solid oklch(0.28 0.055 258)",
                                color: "#fff",
                                fontSize: "12px",
                                resize: "none",
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => handleAddResponse(ticket.id)}
                              disabled={!responseText[ticket.id]?.trim()}
                              style={{
                                padding: "8px 12px",
                                borderRadius: "8px",
                                background: responseText[ticket.id]?.trim()
                                  ? "linear-gradient(135deg, oklch(0.52 0.18 260), oklch(0.44 0.22 285))"
                                  : "oklch(0.22 0.048 258)",
                                border: "none",
                                color: "#fff",
                                cursor: responseText[ticket.id]?.trim()
                                  ? "pointer"
                                  : "not-allowed",
                                height: "64px",
                                flexShrink: 0,
                              }}
                            >
                              <Send style={{ width: "14px", height: "14px" }} />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ── COMMUNICATION HISTORY ── */}
        {activeTab === "history" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={cardStyle}>
              <div style={sectionLabel}>All Communication Events</div>
              {communicationHistory.length === 0 ? (
                <div
                  style={{ color: "oklch(0.50 0.022 252)", fontSize: "13px" }}
                >
                  No communication history yet.
                </div>
              ) : (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: "0" }}
                >
                  {communicationHistory.map((entry, i) => (
                    <div
                      key={entry.id}
                      style={{
                        display: "flex",
                        gap: "12px",
                        alignItems: "flex-start",
                        padding: "12px 0",
                        borderBottom:
                          i < communicationHistory.length - 1
                            ? "1px solid oklch(0.18 0.042 258)"
                            : "none",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          flexShrink: 0,
                          gap: "4px",
                        }}
                      >
                        <div
                          style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            background: "oklch(0.52 0.18 260)",
                            marginTop: "5px",
                          }}
                        />
                        {i < communicationHistory.length - 1 && (
                          <div
                            style={{
                              width: "1px",
                              flex: 1,
                              minHeight: "20px",
                              background: "oklch(0.22 0.042 258)",
                            }}
                          />
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: "3px",
                            flexWrap: "wrap",
                            gap: "4px",
                          }}
                        >
                          <span
                            style={{
                              padding: "2px 8px",
                              borderRadius: "8px",
                              fontSize: "10px",
                              fontWeight: 600,
                              background: "oklch(0.52 0.18 260 / 0.2)",
                              color: "oklch(0.72 0.12 260)",
                            }}
                          >
                            {entry.authorRole}
                          </span>
                          <span
                            style={{
                              fontSize: "10px",
                              color: "oklch(0.45 0.022 252)",
                            }}
                          >
                            {formatDate(entry.timestamp)}
                          </span>
                        </div>
                        <p
                          style={{
                            fontSize: "12px",
                            color: "oklch(0.72 0.018 252)",
                            margin: 0,
                            lineHeight: 1.5,
                          }}
                        >
                          {entry.message}
                        </p>
                        <span
                          style={{
                            fontSize: "10px",
                            color: "oklch(0.45 0.022 252)",
                            marginTop: "2px",
                            display: "block",
                          }}
                        >
                          Ref: {entry.ticketId}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── ALERTS ── */}
        {activeTab === "alerts" && (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            {myAlerts.length === 0 ? (
              <div
                style={{
                  ...cardStyle,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "10px",
                  padding: "40px",
                }}
              >
                <CheckCircle
                  style={{
                    width: "36px",
                    height: "36px",
                    color: "oklch(0.72 0.18 142)",
                  }}
                />
                <div
                  style={{
                    fontSize: "15px",
                    fontWeight: 600,
                    color: "oklch(0.55 0.025 252)",
                  }}
                >
                  No active alerts
                </div>
                <div
                  style={{ fontSize: "13px", color: "oklch(0.45 0.022 252)" }}
                >
                  All systems are operating normally.
                </div>
              </div>
            ) : (
              myAlerts.map((alert) => {
                const severityBorder = {
                  critical: "oklch(0.65 0.22 25)",
                  warning: "oklch(0.78 0.15 68)",
                  info: "oklch(0.62 0.18 260)",
                }[alert.severity];
                const severityBg = {
                  critical: "oklch(0.65 0.22 25 / 0.08)",
                  warning: "oklch(0.78 0.15 68 / 0.08)",
                  info: "oklch(0.62 0.18 260 / 0.08)",
                }[alert.severity];
                return (
                  <div
                    key={alert.id}
                    style={{
                      ...cardStyle,
                      background: severityBg,
                      borderLeft: `4px solid ${severityBorder}`,
                      borderColor: `${severityBorder}`,
                      padding: "16px 20px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        gap: "10px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          gap: "10px",
                          alignItems: "flex-start",
                          flex: 1,
                        }}
                      >
                        <AlertSeverityIcon severity={alert.severity} />
                        <div>
                          <div
                            style={{
                              fontSize: "12px",
                              fontWeight: 700,
                              textTransform: "uppercase",
                              letterSpacing: "0.05em",
                              color: severityBorder,
                              marginBottom: "4px",
                            }}
                          >
                            {alert.type.replace(/([A-Z])/g, " $1").trim()}
                          </div>
                          <p
                            style={{
                              fontSize: "13px",
                              color: "oklch(0.82 0.018 252)",
                              margin: 0,
                              lineHeight: 1.5,
                            }}
                          >
                            {alert.message}
                          </p>
                          <div
                            style={{
                              fontSize: "11px",
                              color: "oklch(0.50 0.022 252)",
                              marginTop: "5px",
                            }}
                          >
                            {formatDate(alert.timestamp)}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => dismissAlert(alert.id)}
                        style={{
                          padding: "4px",
                          borderRadius: "6px",
                          background: "oklch(0.22 0.048 258 / 0.6)",
                          border: "none",
                          color: "oklch(0.55 0.025 252)",
                          cursor: "pointer",
                          flexShrink: 0,
                        }}
                      >
                        <X style={{ width: "14px", height: "14px" }} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ── ESCALATION TOOLS (Regulator only) ── */}
        {activeTab === "escalation" && currentRole === "Regulator" && (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <div style={cardStyle}>
              <div style={sectionLabel}>Provider Contact Directory</div>
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "13px",
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        borderBottom: "1px solid oklch(0.22 0.048 258)",
                      }}
                    >
                      {[
                        "Provider",
                        "State",
                        "Phone",
                        "Email",
                        "Current Rating",
                        "Actions",
                      ].map((h) => (
                        <th
                          key={h}
                          style={{
                            textAlign: "left",
                            padding: "10px 12px",
                            color: "oklch(0.50 0.04 258)",
                            fontSize: "11px",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {PROVIDER_MASTER.slice(0, 12).map((p) => {
                      const contact = PROVIDER_CONTACTS[p.id];
                      const rating = getProviderRatingForQuarter(
                        p.id,
                        currentQuarter,
                      );
                      return (
                        <tr
                          key={p.id}
                          style={{
                            borderBottom: "1px solid oklch(0.18 0.042 258)",
                            transition: "background 150ms ease",
                          }}
                          onMouseEnter={(e) => {
                            (
                              e.currentTarget as HTMLTableRowElement
                            ).style.background = "oklch(0.16 0.048 258 / 0.5)";
                          }}
                          onMouseLeave={(e) => {
                            (
                              e.currentTarget as HTMLTableRowElement
                            ).style.background = "transparent";
                          }}
                        >
                          <td
                            style={{
                              padding: "10px 12px",
                              color: "#fff",
                              fontWeight: 500,
                            }}
                          >
                            {p.name}
                          </td>
                          <td
                            style={{
                              padding: "10px 12px",
                              color: "oklch(0.65 0.025 252)",
                            }}
                          >
                            {p.state}
                          </td>
                          <td
                            style={{
                              padding: "10px 12px",
                              color: "oklch(0.62 0.12 260)",
                            }}
                          >
                            {contact?.phone ?? "—"}
                          </td>
                          <td
                            style={{
                              padding: "10px 12px",
                              color: "oklch(0.62 0.12 260)",
                              maxWidth: "200px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {contact?.email ?? "—"}
                          </td>
                          <td style={{ padding: "10px 12px" }}>
                            <span
                              style={{
                                color:
                                  rating.stars >= 4
                                    ? "oklch(0.72 0.18 142)"
                                    : rating.stars >= 3
                                      ? "oklch(0.78 0.15 68)"
                                      : "oklch(0.65 0.22 25)",
                                fontWeight: 600,
                              }}
                            >
                              {rating.stars.toFixed(1)}★
                            </span>
                          </td>
                          <td style={{ padding: "10px 12px" }}>
                            <button
                              type="button"
                              onClick={() =>
                                setContactProvider({ id: p.id, name: p.name })
                              }
                              style={{
                                padding: "5px 10px",
                                borderRadius: "6px",
                                background: "oklch(0.52 0.18 260 / 0.2)",
                                border: "1px solid oklch(0.52 0.18 260 / 0.4)",
                                color: "oklch(0.72 0.14 260)",
                                fontSize: "11px",
                                fontWeight: 600,
                                cursor: "pointer",
                                fontFamily: "'Plus Jakarta Sans', sans-serif",
                              }}
                            >
                              Contact
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Contact Provider Modal */}
      {contactProvider && (
        <ContactProviderModal
          providerId={contactProvider.id}
          providerName={contactProvider.name}
          open={!!contactProvider}
          onClose={() => setContactProvider(null)}
        />
      )}

      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.3); }
        }
      `}</style>
    </div>
  );
}
