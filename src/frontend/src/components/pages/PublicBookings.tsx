import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  CheckCircle,
  Clock,
  MapPin,
  RotateCcw,
  Star,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Booking {
  id: string;
  providerName: string;
  service: string;
  date: string;
  time: string;
  status: "upcoming" | "completed" | "cancelled";
  address: string;
  confirmationNumber: string;
}

const SEED_BOOKINGS: Booking[] = [
  {
    id: "BK001",
    providerName: "Yarra Valley Life Care",
    service: "General Care",
    date: "2026-04-14",
    time: "10:00 AM",
    status: "upcoming",
    address: "12 Yarra Road, Melbourne VIC 3000",
    confirmationNumber: "YVC-2026-1401",
  },
  {
    id: "BK002",
    providerName: "Bondi Aged Care Centre",
    service: "Physiotherapy",
    date: "2026-04-22",
    time: "2:30 PM",
    status: "upcoming",
    address: "88 Campbell Parade, Bondi NSW 2026",
    confirmationNumber: "BAC-2026-2201",
  },
  {
    id: "BK003",
    providerName: "Southbank Senior Living",
    service: "Medication Review",
    date: "2026-05-05",
    time: "9:00 AM",
    status: "upcoming",
    address: "3 Southbank Blvd, Brisbane QLD 4101",
    confirmationNumber: "SSL-2026-0501",
  },
  {
    id: "BK004",
    providerName: "Glenelg Senior Services",
    service: "Home Care",
    date: "2026-03-10",
    time: "11:00 AM",
    status: "completed",
    address: "47 Glenelg Drive, Adelaide SA 5045",
    confirmationNumber: "GSS-2026-1001",
  },
  {
    id: "BK005",
    providerName: "Fremantle Aged Care",
    service: "Mental Health Support",
    date: "2026-02-28",
    time: "3:00 PM",
    status: "completed",
    address: "22 Marine Terrace, Fremantle WA 6160",
    confirmationNumber: "FAC-2026-2801",
  },
  {
    id: "BK006",
    providerName: "Darwin Senior Hub",
    service: "Physiotherapy",
    date: "2026-03-20",
    time: "1:00 PM",
    status: "cancelled",
    address: "5 Mitchell Street, Darwin NT 0800",
    confirmationNumber: "DSH-2026-2001",
  },
  {
    id: "BK007",
    providerName: "Hobart Care Connect",
    service: "General Care",
    date: "2026-03-15",
    time: "10:30 AM",
    status: "cancelled",
    address: "18 Elizabeth Street, Hobart TAS 7000",
    confirmationNumber: "HCC-2026-1501",
  },
];

const TIME_SLOTS = [
  "9:00 AM",
  "9:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "1:00 PM",
  "1:30 PM",
  "2:00 PM",
  "2:30 PM",
  "3:00 PM",
  "3:30 PM",
];

const STATUS_CONFIG = {
  upcoming: {
    label: "Upcoming",
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.12)",
    border: "rgba(59,130,246,0.3)",
    icon: Calendar,
  },
  completed: {
    label: "Completed",
    color: "#10b981",
    bg: "rgba(16,185,129,0.12)",
    border: "rgba(16,185,129,0.3)",
    icon: CheckCircle,
  },
  cancelled: {
    label: "Cancelled",
    color: "#ef4444",
    bg: "rgba(239,68,68,0.12)",
    border: "rgba(239,68,68,0.3)",
    icon: XCircle,
  },
};

const CARD_STYLE = {
  background: "rgba(255,255,255,0.06)",
  backdropFilter: "blur(12px)" as const,
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: "16px",
  color: "white",
};

export default function PublicBookings({
  currentQuarter: _currentQuarter,
}: { currentQuarter: string }) {
  const [bookings, setBookings] = useState<Booking[]>(SEED_BOOKINGS);
  const [activeTab, setActiveTab] = useState<
    "upcoming" | "completed" | "cancelled"
  >("upcoming");
  const [cancelConfirm, setCancelConfirm] = useState<string | null>(null);
  const [detailsBooking, setDetailsBooking] = useState<Booking | null>(null);
  const [rescheduleBooking, setRescheduleBooking] = useState<Booking | null>(
    null,
  );
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");

  const filtered = bookings.filter((b) => b.status === activeTab);

  const counts = {
    upcoming: bookings.filter((b) => b.status === "upcoming").length,
    completed: bookings.filter((b) => b.status === "completed").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
  };

  const handleCancel = (id: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: "cancelled" } : b)),
    );
    setCancelConfirm(null);
    toast.success("Booking cancelled successfully");
  };

  const handleRebook = (booking: Booking) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === booking.id
          ? {
              ...b,
              status: "upcoming",
              date: new Date(Date.now() + 14 * 86400000)
                .toISOString()
                .split("T")[0],
            }
          : b,
      ),
    );
    toast.success(
      "Booking reinstated. Please confirm a new date with the provider.",
    );
  };

  const handleRescheduleConfirm = () => {
    if (!rescheduleBooking || !rescheduleDate || !rescheduleTime) return;
    setBookings((prev) =>
      prev.map((b) =>
        b.id === rescheduleBooking.id
          ? { ...b, date: rescheduleDate, time: rescheduleTime }
          : b,
      ),
    );
    setRescheduleBooking(null);
    setRescheduleDate("");
    setRescheduleTime("");
    toast.success("Booking rescheduled successfully");
  };

  const formatDate = (d: string) => {
    const dt = new Date(d);
    return dt.toLocaleDateString("en-AU", {
      weekday: "short",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const PAGE_BG = "#0a0f1e";

  return (
    <div
      style={{
        background: PAGE_BG,
        minHeight: "100vh",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      {/* Hero */}
      <div
        style={{
          background:
            "linear-gradient(135deg, #0f1b35 0%, #1a2d5a 50%, #0d1540 100%)",
          padding: "40px 32px 32px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "8px",
            }}
          >
            <Calendar size={20} color="#3b82f6" />
            <h1
              style={{
                fontSize: "28px",
                fontWeight: 800,
                color: "#fff",
                margin: 0,
              }}
            >
              My Bookings
            </h1>
          </div>
          <p
            style={{
              color: "rgba(255,255,255,0.5)",
              fontSize: "14px",
              margin: 0,
            }}
          >
            Manage your aged care appointments — reschedule, cancel, or review
            completed visits.
          </p>
        </div>
      </div>

      <div
        style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 24px" }}
      >
        {/* Tab bar */}
        <div
          style={{
            display: "flex",
            gap: "4px",
            background: "rgba(255,255,255,0.04)",
            borderRadius: "12px",
            padding: "4px",
            marginBottom: "28px",
            width: "fit-content",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {(["upcoming", "completed", "cancelled"] as const).map((tab) => {
            const cfg = STATUS_CONFIG[tab];
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                data-ocid={`bookings.${tab}.tab`}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: "8px 20px",
                  borderRadius: "8px",
                  border: "none",
                  background: isActive ? cfg.bg : "transparent",
                  color: isActive ? cfg.color : "rgba(255,255,255,0.45)",
                  fontWeight: isActive ? 700 : 500,
                  fontSize: "13px",
                  cursor: "pointer",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  transition: "all 0.15s",
                  whiteSpace: "nowrap",
                }}
              >
                {cfg.label} ({counts[tab]})
              </button>
            );
          })}
        </div>

        {/* Booking cards */}
        {filtered.length === 0 ? (
          <div
            data-ocid="bookings.empty_state"
            style={{
              ...CARD_STYLE,
              padding: "60px 24px",
              textAlign: "center",
            }}
          >
            <Calendar
              size={40}
              color="rgba(255,255,255,0.2)"
              style={{ margin: "0 auto 12px" }}
            />
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "14px" }}>
              No {activeTab} bookings to display.
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "16px" }}>
            {filtered.map((booking, idx) => {
              const cfg = STATUS_CONFIG[booking.status];
              const StatusIcon = cfg.icon;
              const isCancelConfirming = cancelConfirm === booking.id;

              return (
                <div
                  key={booking.id}
                  data-ocid={`bookings.item.${idx + 1}`}
                  style={{
                    ...CARD_STYLE,
                    padding: "24px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      flexWrap: "wrap",
                      gap: "12px",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          flexWrap: "wrap",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "17px",
                            fontWeight: 800,
                            color: "#fff",
                          }}
                        >
                          {booking.providerName}
                        </span>
                        <span
                          style={{
                            padding: "2px 10px",
                            borderRadius: "12px",
                            background: "rgba(59,130,246,0.15)",
                            border: "1px solid rgba(59,130,246,0.3)",
                            fontSize: "11px",
                            fontWeight: 600,
                            color: "#60a5fa",
                          }}
                        >
                          {booking.service}
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: "16px",
                          marginTop: "8px",
                          flexWrap: "wrap",
                        }}
                      >
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                            fontSize: "12px",
                            color: "rgba(255,255,255,0.5)",
                          }}
                        >
                          <Calendar size={12} /> {formatDate(booking.date)}
                        </span>
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                            fontSize: "12px",
                            color: "rgba(255,255,255,0.5)",
                          }}
                        >
                          <Clock size={12} /> {booking.time}
                        </span>
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                            fontSize: "12px",
                            color: "rgba(255,255,255,0.5)",
                          }}
                        >
                          <MapPin size={12} /> {booking.address}
                        </span>
                      </div>
                      <div
                        style={{
                          marginTop: "6px",
                          fontSize: "11px",
                          color: "rgba(255,255,255,0.3)",
                        }}
                      >
                        Confirmation: {booking.confirmationNumber}
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        padding: "5px 12px",
                        borderRadius: "20px",
                        background: cfg.bg,
                        border: `1px solid ${cfg.border}`,
                        fontSize: "11px",
                        fontWeight: 700,
                        color: cfg.color,
                        flexShrink: 0,
                      }}
                    >
                      <StatusIcon size={11} />
                      {cfg.label}
                    </div>
                  </div>

                  {/* Actions */}
                  <div
                    style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}
                  >
                    <Button
                      size="sm"
                      variant="outline"
                      data-ocid={`bookings.view_detail.button.${idx + 1}`}
                      onClick={() => setDetailsBooking(booking)}
                      style={{
                        fontSize: "12px",
                        borderColor: "rgba(255,255,255,0.15)",
                        color: "rgba(255,255,255,0.7)",
                        background: "transparent",
                      }}
                    >
                      View Details
                    </Button>

                    {booking.status === "upcoming" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          data-ocid={`bookings.reschedule.button.${idx + 1}`}
                          onClick={() => {
                            setRescheduleBooking(booking);
                            setRescheduleDate(booking.date);
                            setRescheduleTime(booking.time);
                          }}
                          style={{
                            fontSize: "12px",
                            borderColor: "rgba(59,130,246,0.4)",
                            color: "#60a5fa",
                            background: "transparent",
                          }}
                        >
                          <RotateCcw size={12} className="mr-1" /> Reschedule
                        </Button>
                        {!isCancelConfirming ? (
                          <Button
                            size="sm"
                            variant="outline"
                            data-ocid={`bookings.cancel.button.${idx + 1}`}
                            onClick={() => setCancelConfirm(booking.id)}
                            style={{
                              fontSize: "12px",
                              borderColor: "rgba(239,68,68,0.4)",
                              color: "#f87171",
                              background: "transparent",
                            }}
                          >
                            <XCircle size={12} className="mr-1" /> Cancel
                          </Button>
                        ) : (
                          <div
                            style={{
                              display: "flex",
                              gap: "6px",
                              alignItems: "center",
                            }}
                          >
                            <span
                              style={{
                                fontSize: "12px",
                                color: "rgba(255,255,255,0.5)",
                              }}
                            >
                              Confirm cancel?
                            </span>
                            <Button
                              size="sm"
                              data-ocid={`bookings.cancel_confirm.button.${idx + 1}`}
                              onClick={() => handleCancel(booking.id)}
                              style={{
                                fontSize: "11px",
                                background: "#ef4444",
                                color: "#fff",
                                border: "none",
                              }}
                            >
                              Yes, Cancel
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              data-ocid={`bookings.cancel_abort.button.${idx + 1}`}
                              onClick={() => setCancelConfirm(null)}
                              style={{
                                fontSize: "11px",
                                borderColor: "rgba(255,255,255,0.15)",
                                color: "rgba(255,255,255,0.6)",
                                background: "transparent",
                              }}
                            >
                              Keep
                            </Button>
                          </div>
                        )}
                      </>
                    )}

                    {booking.status === "completed" && (
                      <Button
                        size="sm"
                        variant="outline"
                        data-ocid={`bookings.leave_review.button.${idx + 1}`}
                        onClick={() =>
                          toast.info(
                            "Navigate to My Reviews to manage your reviews",
                          )
                        }
                        style={{
                          fontSize: "12px",
                          borderColor: "rgba(251,191,36,0.4)",
                          color: "#fbbf24",
                          background: "transparent",
                        }}
                      >
                        <Star size={12} className="mr-1" /> Leave Review
                      </Button>
                    )}

                    {booking.status === "cancelled" && (
                      <Button
                        size="sm"
                        variant="outline"
                        data-ocid={`bookings.rebook.button.${idx + 1}`}
                        onClick={() => handleRebook(booking)}
                        style={{
                          fontSize: "12px",
                          borderColor: "rgba(16,185,129,0.4)",
                          color: "#34d399",
                          background: "transparent",
                        }}
                      >
                        <RotateCcw size={12} className="mr-1" /> Rebook
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Details Dialog */}
      <Dialog
        open={!!detailsBooking}
        onOpenChange={() => setDetailsBooking(null)}
      >
        <DialogContent
          data-ocid="bookings.details.dialog"
          style={{
            background: "#0f1b35",
            border: "1px solid rgba(255,255,255,0.12)",
            color: "white",
            maxWidth: "480px",
          }}
        >
          <DialogHeader>
            <DialogTitle style={{ color: "#fff" }}>Booking Details</DialogTitle>
          </DialogHeader>
          {detailsBooking && (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              {(
                [
                  ["Provider", detailsBooking.providerName],
                  ["Service", detailsBooking.service],
                  ["Date", formatDate(detailsBooking.date)],
                  ["Time", detailsBooking.time],
                  ["Address", detailsBooking.address],
                  ["Confirmation #", detailsBooking.confirmationNumber],
                  ["Status", STATUS_CONFIG[detailsBooking.status].label],
                ] as [string, string][]
              ).map(([key, val]) => (
                <div key={key} style={{ display: "flex", gap: "12px" }}>
                  <span
                    style={{
                      minWidth: "120px",
                      fontSize: "12px",
                      color: "rgba(255,255,255,0.4)",
                      fontWeight: 600,
                    }}
                  >
                    {key}
                  </span>
                  <span
                    style={{
                      fontSize: "13px",
                      color: "rgba(255,255,255,0.85)",
                    }}
                  >
                    {val}
                  </span>
                </div>
              ))}
            </div>
          )}
          <DialogFooter>
            <Button
              data-ocid="bookings.details.close_button"
              onClick={() => setDetailsBooking(null)}
              style={{
                background: "rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.8)",
                border: "1px solid rgba(255,255,255,0.15)",
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reschedule Dialog */}
      <Dialog
        open={!!rescheduleBooking}
        onOpenChange={() => setRescheduleBooking(null)}
      >
        <DialogContent
          data-ocid="bookings.reschedule.dialog"
          style={{
            background: "#0f1b35",
            border: "1px solid rgba(255,255,255,0.12)",
            color: "white",
            maxWidth: "400px",
          }}
        >
          <DialogHeader>
            <DialogTitle style={{ color: "#fff" }}>
              Reschedule Appointment
            </DialogTitle>
          </DialogHeader>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <div>
              <Label
                style={{
                  color: "rgba(255,255,255,0.6)",
                  fontSize: "12px",
                  marginBottom: "6px",
                  display: "block",
                }}
              >
                New Date
              </Label>
              <input
                type="date"
                value={rescheduleDate}
                data-ocid="bookings.reschedule.input"
                onChange={(e) => setRescheduleDate(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "white",
                  fontSize: "13px",
                  outline: "none",
                }}
              />
            </div>
            <div>
              <Label
                style={{
                  color: "rgba(255,255,255,0.6)",
                  fontSize: "12px",
                  marginBottom: "6px",
                  display: "block",
                }}
              >
                New Time
              </Label>
              <Select value={rescheduleTime} onValueChange={setRescheduleTime}>
                <SelectTrigger
                  data-ocid="bookings.reschedule_time.select"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    color: "white",
                    borderRadius: "8px",
                  }}
                >
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  {TIME_SLOTS.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter style={{ marginTop: "8px" }}>
            <Button
              variant="outline"
              data-ocid="bookings.reschedule.cancel_button"
              onClick={() => setRescheduleBooking(null)}
              style={{
                borderColor: "rgba(255,255,255,0.15)",
                color: "rgba(255,255,255,0.6)",
                background: "transparent",
              }}
            >
              Cancel
            </Button>
            <Button
              data-ocid="bookings.reschedule.confirm_button"
              disabled={!rescheduleDate || !rescheduleTime}
              onClick={handleRescheduleConfirm}
              style={{ background: "#3b82f6", color: "#fff", border: "none" }}
            >
              Confirm Reschedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
