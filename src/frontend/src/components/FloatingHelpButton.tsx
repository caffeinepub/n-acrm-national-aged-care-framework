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
  Headphones,
  HelpCircle,
  Info,
  LifeBuoy,
  Plus,
  Send,
  Ticket,
  X,
} from "lucide-react";
import { useState } from "react";
import type { ActivePage, AppRole } from "../App";
import {
  type TicketCategory,
  type TicketPriority,
  useSupportContext,
} from "../context/SupportContext";

interface FloatingHelpButtonProps {
  currentRole: AppRole;
  currentQuarter: string;
  setActivePage: (page: ActivePage) => void;
}

export default function FloatingHelpButton({
  currentRole,
  setActivePage,
}: FloatingHelpButtonProps) {
  const { supportStatus, getAlertsForRole, createTicket, dismissAlert } =
    useSupportContext();
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<"home" | "ticket">("home");
  const [ticketTitle, setTicketTitle] = useState("");
  const [ticketDesc, setTicketDesc] = useState("");
  const [ticketCategory, setTicketCategory] =
    useState<TicketCategory>("System");
  const [ticketPriority, setTicketPriority] =
    useState<TicketPriority>("Medium");
  const [ticketSuccess, setTicketSuccess] = useState(false);

  const alerts = getAlertsForRole(currentRole);
  const hasAlerts = alerts.length > 0;
  const criticalAlerts = alerts.filter((a) => a.severity === "critical");

  const handleSubmitTicket = () => {
    if (!ticketTitle.trim() || !ticketDesc.trim()) return;
    createTicket({
      title: ticketTitle,
      description: ticketDesc,
      category: ticketCategory,
      priority: ticketPriority,
      status: "Open",
      submitterRole: currentRole,
    });
    setTicketTitle("");
    setTicketDesc("");
    setTicketSuccess(true);
    setTimeout(() => {
      setTicketSuccess(false);
      setView("home");
    }, 2500);
  };

  const goToSupport = () => {
    setActivePage("contact_support");
    setIsOpen(false);
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "oklch(0 0 0 / 0.35)",
            zIndex: 9997,
          }}
          onClick={() => setIsOpen(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setIsOpen(false);
          }}
          role="presentation"
        />
      )}

      {/* Slide-in Panel */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          height: "100%",
          width: "360px",
          zIndex: 9998,
          background: "oklch(0.13 0.052 258)",
          borderLeft: "1px solid oklch(0.22 0.055 258)",
          boxShadow: "-8px 0 32px oklch(0 0 0 / 0.4)",
          display: "flex",
          flexDirection: "column",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 280ms cubic-bezier(0.32, 0, 0.67, 0)",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          overflow: "hidden",
        }}
      >
        {/* Panel Header */}
        <div
          style={{
            padding: "18px 20px",
            borderBottom: "1px solid oklch(0.20 0.052 258)",
            background:
              "linear-gradient(135deg, oklch(0.14 0.055 258), oklch(0.10 0.042 258))",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  background:
                    "linear-gradient(135deg, oklch(0.48 0.18 260), oklch(0.40 0.22 290))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Headphones
                  style={{
                    width: "15px",
                    height: "15px",
                    color: "oklch(0.74 0.14 86)",
                  }}
                />
              </div>
              <div>
                <div
                  style={{ fontSize: "15px", fontWeight: 700, color: "#fff" }}
                >
                  Help &amp; Support
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    marginTop: "2px",
                  }}
                >
                  <span
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: supportStatus.online
                        ? "oklch(0.72 0.18 142)"
                        : "oklch(0.65 0.22 25)",
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontSize: "11px",
                      color: supportStatus.online
                        ? "oklch(0.72 0.18 142)"
                        : "oklch(0.65 0.22 25)",
                      fontWeight: 500,
                    }}
                  >
                    {supportStatus.online
                      ? "Support Online"
                      : "Support Offline"}{" "}
                    · Avg {supportStatus.avgResponseTime}
                  </span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              style={{
                padding: "6px",
                borderRadius: "6px",
                background: "oklch(0.20 0.048 258)",
                border: "none",
                color: "oklch(0.60 0.025 252)",
                cursor: "pointer",
              }}
            >
              <X style={{ width: "14px", height: "14px" }} />
            </button>
          </div>
        </div>

        {/* Panel Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
          {view === "home" ? (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "14px" }}
            >
              {/* Critical alert banner */}
              {criticalAlerts.length > 0 && (
                <div
                  style={{
                    background: "oklch(0.65 0.22 25 / 0.15)",
                    border: "1px solid oklch(0.65 0.22 25 / 0.4)",
                    borderRadius: "10px",
                    padding: "12px 14px",
                    display: "flex",
                    gap: "8px",
                    alignItems: "flex-start",
                  }}
                >
                  <AlertTriangle
                    style={{
                      width: "14px",
                      height: "14px",
                      color: "oklch(0.65 0.22 25)",
                      flexShrink: 0,
                      marginTop: "1px",
                    }}
                  />
                  <div>
                    <div
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "oklch(0.65 0.22 25)",
                        marginBottom: "2px",
                      }}
                    >
                      CRITICAL ALERT
                    </div>
                    <p
                      style={{
                        fontSize: "12px",
                        color: "oklch(0.78 0.018 252)",
                        margin: 0,
                        lineHeight: 1.4,
                      }}
                    >
                      {criticalAlerts[0].message.substring(0, 100)}
                      {criticalAlerts[0].message.length > 100 ? "..." : ""}
                    </p>
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div>
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "oklch(0.50 0.04 258)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginBottom: "8px",
                  }}
                >
                  Quick Actions
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setView("ticket")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "11px 14px",
                      borderRadius: "9px",
                      background: "oklch(0.52 0.18 260 / 0.15)",
                      border: "1px solid oklch(0.52 0.18 260 / 0.3)",
                      color: "#fff",
                      cursor: "pointer",
                      textAlign: "left",
                      fontSize: "13px",
                      fontWeight: 500,
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      transition: "all 150ms ease",
                    }}
                  >
                    <Plus
                      style={{
                        width: "15px",
                        height: "15px",
                        color: "oklch(0.62 0.18 260)",
                      }}
                    />
                    Raise a Ticket
                  </button>
                  <button
                    type="button"
                    onClick={goToSupport}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "11px 14px",
                      borderRadius: "9px",
                      background: "oklch(0.16 0.052 258)",
                      border: "1px solid oklch(0.22 0.055 258)",
                      color: "#fff",
                      cursor: "pointer",
                      textAlign: "left",
                      fontSize: "13px",
                      fontWeight: 500,
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      transition: "all 150ms ease",
                    }}
                  >
                    <Ticket
                      style={{
                        width: "15px",
                        height: "15px",
                        color: "oklch(0.74 0.14 86)",
                      }}
                    />
                    View My Tickets
                  </button>
                  <button
                    type="button"
                    onClick={goToSupport}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "11px 14px",
                      borderRadius: "9px",
                      background: "oklch(0.16 0.052 258)",
                      border: "1px solid oklch(0.22 0.055 258)",
                      color: "#fff",
                      cursor: "pointer",
                      textAlign: "left",
                      fontSize: "13px",
                      fontWeight: 500,
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      transition: "all 150ms ease",
                    }}
                  >
                    <LifeBuoy
                      style={{
                        width: "15px",
                        height: "15px",
                        color: "oklch(0.62 0.22 142)",
                      }}
                    />
                    Support Center
                  </button>
                </div>
              </div>

              {/* Active Alerts */}
              {alerts.length > 0 && (
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "8px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "oklch(0.50 0.04 258)",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                      }}
                    >
                      Active Alerts
                    </div>
                    <span
                      style={{
                        padding: "1px 7px",
                        borderRadius: "10px",
                        background: "oklch(0.65 0.22 25)",
                        color: "#fff",
                        fontSize: "10px",
                        fontWeight: 700,
                      }}
                    >
                      {alerts.length}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                    }}
                  >
                    {alerts.slice(0, 2).map((alert) => {
                      const severityColor = {
                        critical: "oklch(0.65 0.22 25)",
                        warning: "oklch(0.78 0.15 68)",
                        info: "oklch(0.62 0.18 260)",
                      }[alert.severity];
                      return (
                        <div
                          key={alert.id}
                          style={{
                            background: "oklch(0.16 0.048 258)",
                            border: `1px solid ${severityColor} / 0.3`,
                            borderLeft: `3px solid ${severityColor}`,
                            borderRadius: "8px",
                            padding: "10px 12px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            gap: "8px",
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            <div
                              style={{
                                fontSize: "11px",
                                fontWeight: 600,
                                color: severityColor,
                                marginBottom: "2px",
                              }}
                            >
                              {alert.type.replace(/([A-Z])/g, " $1").trim()}
                            </div>
                            <p
                              style={{
                                fontSize: "11px",
                                color: "oklch(0.68 0.018 252)",
                                margin: 0,
                                lineHeight: 1.4,
                              }}
                            >
                              {alert.message.substring(0, 80)}
                              {alert.message.length > 80 ? "..." : ""}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => dismissAlert(alert.id)}
                            style={{
                              background: "none",
                              border: "none",
                              color: "oklch(0.45 0.022 252)",
                              cursor: "pointer",
                              padding: "2px",
                              flexShrink: 0,
                            }}
                          >
                            <X style={{ width: "12px", height: "12px" }} />
                          </button>
                        </div>
                      );
                    })}
                    {alerts.length > 2 && (
                      <button
                        type="button"
                        onClick={goToSupport}
                        style={{
                          fontSize: "11px",
                          color: "oklch(0.62 0.12 260)",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          textAlign: "left",
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          padding: "2px 0",
                        }}
                      >
                        +{alerts.length - 2} more alerts → View all
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Support Info */}
              <div
                style={{
                  background: "oklch(0.15 0.048 258 / 0.6)",
                  border: "1px solid oklch(0.20 0.048 258)",
                  borderRadius: "8px",
                  padding: "12px 14px",
                }}
              >
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "oklch(0.55 0.025 252)",
                    marginBottom: "5px",
                  }}
                >
                  SUPPORT HOURS
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "oklch(0.72 0.018 252)",
                    lineHeight: 1.5,
                  }}
                >
                  Mon–Fri, 8:00am – 6:00pm AEST
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "oklch(0.55 0.025 252)",
                    marginTop: "2px",
                  }}
                >
                  Emergency: 1800 AGED CARE (24/7)
                </div>
              </div>
            </div>
          ) : (
            /* Ticket Form View */
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              <button
                type="button"
                onClick={() => setView("home")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  fontSize: "12px",
                  color: "oklch(0.62 0.12 260)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  padding: 0,
                  marginBottom: "4px",
                }}
              >
                ← Back
              </button>

              {ticketSuccess ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "12px",
                    padding: "30px 20px",
                  }}
                >
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      background: "oklch(0.72 0.18 142 / 0.2)",
                      border: "2px solid oklch(0.72 0.18 142)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <HelpCircle
                      style={{
                        width: "22px",
                        height: "22px",
                        color: "oklch(0.72 0.18 142)",
                      }}
                    />
                  </div>
                  <div
                    style={{
                      fontSize: "15px",
                      fontWeight: 600,
                      color: "#fff",
                      textAlign: "center",
                    }}
                  >
                    Ticket Submitted!
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "oklch(0.60 0.022 252)",
                      textAlign: "center",
                    }}
                  >
                    Our team will respond within ~2 hours during business hours.
                  </div>
                </div>
              ) : (
                <>
                  <div
                    style={{ fontSize: "14px", fontWeight: 700, color: "#fff" }}
                  >
                    Raise a Support Ticket
                  </div>
                  <div>
                    <Label
                      style={{
                        color: "oklch(0.72 0.022 252)",
                        fontSize: "12px",
                        marginBottom: "5px",
                        display: "block",
                      }}
                    >
                      Title *
                    </Label>
                    <Input
                      value={ticketTitle}
                      onChange={(e) => setTicketTitle(e.target.value)}
                      placeholder="Brief description"
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
                        color: "oklch(0.72 0.022 252)",
                        fontSize: "12px",
                        marginBottom: "5px",
                        display: "block",
                      }}
                    >
                      Description *
                    </Label>
                    <Textarea
                      value={ticketDesc}
                      onChange={(e) => setTicketDesc(e.target.value)}
                      placeholder="Please describe your issue..."
                      rows={3}
                      style={{
                        background: "oklch(0.18 0.052 258)",
                        border: "1px solid oklch(0.28 0.055 258)",
                        color: "#fff",
                        fontSize: "13px",
                        resize: "none",
                      }}
                    />
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "8px",
                    }}
                  >
                    <div>
                      <Label
                        style={{
                          color: "oklch(0.72 0.022 252)",
                          fontSize: "11px",
                          marginBottom: "4px",
                          display: "block",
                        }}
                      >
                        Category
                      </Label>
                      <Select
                        value={ticketCategory}
                        onValueChange={(v) =>
                          setTicketCategory(v as TicketCategory)
                        }
                      >
                        <SelectTrigger
                          style={{
                            background: "oklch(0.18 0.052 258)",
                            border: "1px solid oklch(0.28 0.055 258)",
                            color: "#fff",
                            fontSize: "12px",
                            height: "34px",
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
                          color: "oklch(0.72 0.022 252)",
                          fontSize: "11px",
                          marginBottom: "4px",
                          display: "block",
                        }}
                      >
                        Priority
                      </Label>
                      <Select
                        value={ticketPriority}
                        onValueChange={(v) =>
                          setTicketPriority(v as TicketPriority)
                        }
                      >
                        <SelectTrigger
                          style={{
                            background: "oklch(0.18 0.052 258)",
                            border: "1px solid oklch(0.28 0.055 258)",
                            color: "#fff",
                            fontSize: "12px",
                            height: "34px",
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
                  <button
                    type="button"
                    onClick={handleSubmitTicket}
                    disabled={!ticketTitle.trim() || !ticketDesc.trim()}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "7px",
                      padding: "10px",
                      borderRadius: "8px",
                      background:
                        ticketTitle.trim() && ticketDesc.trim()
                          ? "linear-gradient(135deg, oklch(0.52 0.18 260), oklch(0.44 0.22 285))"
                          : "oklch(0.22 0.048 258)",
                      border: "none",
                      color: "#fff",
                      fontSize: "13px",
                      fontWeight: 600,
                      cursor:
                        ticketTitle.trim() && ticketDesc.trim()
                          ? "pointer"
                          : "not-allowed",
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                    }}
                  >
                    <Send style={{ width: "13px", height: "13px" }} />
                    Submit Ticket
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Floating Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open Help & Support"
        style={{
          position: "fixed",
          bottom: "88px",
          right: "24px",
          zIndex: 9999,
          width: "52px",
          height: "52px",
          borderRadius: "50%",
          background:
            "linear-gradient(135deg, oklch(0.52 0.18 260), oklch(0.44 0.22 285))",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 20px oklch(0.44 0.22 285 / 0.5)",
          transition: "all 200ms ease",
          outline: "none",
        }}
      >
        {isOpen ? (
          <X style={{ width: "20px", height: "20px", color: "#fff" }} />
        ) : (
          <Headphones
            style={{ width: "20px", height: "20px", color: "#fff" }}
          />
        )}
        {hasAlerts && !isOpen && (
          <span
            style={{
              position: "absolute",
              top: "-2px",
              right: "-2px",
              width: "16px",
              height: "16px",
              borderRadius: "50%",
              background: "oklch(0.65 0.22 25)",
              border: "2px solid oklch(0.11 0.042 258)",
              fontSize: "9px",
              fontWeight: 700,
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {alerts.length > 9 ? "9+" : alerts.length}
          </span>
        )}
      </button>
    </>
  );
}
