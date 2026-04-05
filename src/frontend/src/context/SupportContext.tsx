import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";

export type TicketStatus = "Open" | "InProgress" | "Resolved";
export type TicketCategory =
  | "Provider"
  | "Booking"
  | "Rating"
  | "System"
  | "DataQuery";
export type TicketPriority = "Low" | "Medium" | "High" | "Critical";
export type AlertType =
  | "HighRiskProvider"
  | "PoorRating"
  | "MissedBooking"
  | "CriticalIssue";
export type AlertSeverity = "critical" | "warning" | "info";

export interface TicketResponse {
  id: string;
  authorRole: string;
  message: string;
  timestamp: Date;
}

export interface SupportTicket {
  id: string;
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  submitterRole: string;
  providerId?: string;
  providerName?: string;
  createdAt: Date;
  updatedAt: Date;
  responses: TicketResponse[];
}

export interface SystemAlert {
  id: string;
  type: AlertType;
  message: string;
  providerId?: string;
  severity: AlertSeverity;
  timestamp: Date;
  dismissed: boolean;
  targetRoles: string[];
}

export interface CommunicationEntry {
  id: string;
  ticketId: string;
  message: string;
  authorRole: string;
  timestamp: Date;
}

export interface SupportStatus {
  online: boolean;
  avgResponseTime: string;
  openTickets: number;
  resolvedToday: number;
}

const now = new Date();
const d = (daysAgo: number, hoursAgo = 0) => {
  const t = new Date(now);
  t.setDate(t.getDate() - daysAgo);
  t.setHours(t.getHours() - hoursAgo);
  return t;
};

const SEED_TICKETS: SupportTicket[] = [
  {
    id: "TKT-001",
    title: "Rating discrepancy for Bondi Aged Care",
    description:
      "Provider rating in Q3 appears inconsistent with indicator data. Requesting review of calculation.",
    category: "Rating",
    priority: "High",
    status: "Open",
    submitterRole: "Regulator",
    providerId: "SYD-001",
    providerName: "Bondi Aged Care",
    createdAt: d(2),
    updatedAt: d(2),
    responses: [],
  },
  {
    id: "TKT-002",
    title: "Booking cancellation issue",
    description:
      "A patient booking was cancelled but still shows as active in the system. Needs manual correction.",
    category: "Booking",
    priority: "Medium",
    status: "InProgress",
    submitterRole: "Public",
    createdAt: d(4),
    updatedAt: d(1),
    responses: [
      {
        id: "RSP-001",
        authorRole: "Regulator",
        message:
          "We are investigating this booking issue. Our team has been notified and will resolve within 24 hours.",
        timestamp: d(1),
      },
    ],
  },
  {
    id: "TKT-003",
    title: "Unable to submit indicator data for Q4",
    description:
      "The data submission form is not accepting our Q4 falls prevention figures. Error code 422.",
    category: "System",
    priority: "Critical",
    status: "Resolved",
    submitterRole: "Provider",
    providerId: "MEL-001",
    providerName: "Yarra Valley Life Care",
    createdAt: d(7),
    updatedAt: d(3),
    responses: [
      {
        id: "RSP-002",
        authorRole: "Regulator",
        message:
          "The issue has been identified as a validation rule conflict. We have updated the submission form.",
        timestamp: d(5),
      },
      {
        id: "RSP-003",
        authorRole: "Provider",
        message:
          "Confirmed resolved. Data submitted successfully now. Thank you.",
        timestamp: d(3),
      },
    ],
  },
  {
    id: "TKT-004",
    title: "Request for policy impact data export",
    description:
      "Need Q1-Q4 regional comparison data for upcoming parliamentary review. Please advise format.",
    category: "DataQuery",
    priority: "Low",
    status: "Open",
    submitterRole: "Policy Analyst",
    createdAt: d(1),
    updatedAt: d(1),
    responses: [],
  },
  {
    id: "TKT-005",
    title: "High fall rate alert - Harbour View Care",
    description:
      "Falls rate has increased 28% compared to previous quarter. Requesting urgent review and support.",
    category: "Provider",
    priority: "Critical",
    status: "InProgress",
    submitterRole: "Regulator",
    providerId: "SYD-003",
    providerName: "Harbour View Care Centre",
    createdAt: d(3),
    updatedAt: d(0, 2),
    responses: [
      {
        id: "RSP-004",
        authorRole: "Regulator",
        message:
          "Escalated to compliance team. Site visit scheduled for next week.",
        timestamp: d(0, 2),
      },
    ],
  },
  {
    id: "TKT-006",
    title: "Pay-for-Improvement eligibility query",
    description:
      "Our current Q4 rating shows 3.9 stars. We believe we should qualify for eligible tier based on improvement trend.",
    category: "Rating",
    priority: "Medium",
    status: "Resolved",
    submitterRole: "Provider",
    providerId: "BNE-001",
    providerName: "South Bank Elders",
    createdAt: d(10),
    updatedAt: d(6),
    responses: [
      {
        id: "RSP-005",
        authorRole: "Regulator",
        message:
          "Eligibility requires ≥4.0 stars in the current quarter. Your Q4 rating of 3.9 falls below the threshold. Improvement in Q1 next year will be reassessed.",
        timestamp: d(6),
      },
    ],
  },
];

const SEED_ALERTS: SystemAlert[] = [
  {
    id: "ALT-001",
    type: "HighRiskProvider",
    message:
      "Northern Beaches Elder Support (SYD-002) has been flagged as High Risk in Q4-2025. Immediate review recommended.",
    providerId: "SYD-002",
    severity: "critical",
    timestamp: d(0, 3),
    dismissed: false,
    targetRoles: ["Regulator"],
  },
  {
    id: "ALT-002",
    type: "PoorRating",
    message:
      "3 providers in NSW have fallen below 2.5 stars this quarter. Policy intervention may be required.",
    severity: "warning",
    timestamp: d(1),
    dismissed: false,
    targetRoles: ["Regulator", "Policy Analyst"],
  },
  {
    id: "ALT-003",
    type: "CriticalIssue",
    message:
      "Yarra Valley Life Care (MEL-001): Data submission error detected. Please re-submit Q4 indicator data.",
    providerId: "MEL-001",
    severity: "critical",
    timestamp: d(0, 1),
    dismissed: false,
    targetRoles: ["Provider"],
  },
  {
    id: "ALT-004",
    type: "MissedBooking",
    message:
      "12 service appointments were missed or cancelled in the past 7 days across Sydney providers.",
    severity: "warning",
    timestamp: d(2),
    dismissed: false,
    targetRoles: ["Regulator", "Public"],
  },
  {
    id: "ALT-005",
    type: "PoorRating",
    message:
      "National average screening compliance dropped by 4.2% this quarter. Review regional data.",
    severity: "info",
    timestamp: d(3),
    dismissed: false,
    targetRoles: ["Policy Analyst", "Regulator"],
  },
];

const SEED_HISTORY: CommunicationEntry[] = [
  {
    id: "COM-001",
    ticketId: "TKT-001",
    message:
      "Ticket TKT-001 created by Regulator: Rating discrepancy for Bondi Aged Care",
    authorRole: "Regulator",
    timestamp: d(2),
  },
  {
    id: "COM-002",
    ticketId: "TKT-002",
    message: "Ticket TKT-002 created by Public: Booking cancellation issue",
    authorRole: "Public",
    timestamp: d(4),
  },
  {
    id: "COM-003",
    ticketId: "TKT-002",
    message: "Status updated to In Progress. Support team assigned.",
    authorRole: "Regulator",
    timestamp: d(2),
  },
  {
    id: "COM-004",
    ticketId: "TKT-002",
    message:
      "Response added by Regulator: We are investigating this booking issue.",
    authorRole: "Regulator",
    timestamp: d(1),
  },
  {
    id: "COM-005",
    ticketId: "TKT-003",
    message:
      "Ticket TKT-003 created by Provider: Unable to submit indicator data for Q4",
    authorRole: "Provider",
    timestamp: d(7),
  },
  {
    id: "COM-006",
    ticketId: "TKT-003",
    message: "Status updated to In Progress.",
    authorRole: "Regulator",
    timestamp: d(6),
  },
  {
    id: "COM-007",
    ticketId: "TKT-003",
    message: "Issue identified and resolved. Validation rule updated.",
    authorRole: "Regulator",
    timestamp: d(5),
  },
  {
    id: "COM-008",
    ticketId: "TKT-003",
    message: "Ticket TKT-003 marked as Resolved.",
    authorRole: "Provider",
    timestamp: d(3),
  },
];

interface SupportContextType {
  tickets: SupportTicket[];
  systemAlerts: SystemAlert[];
  communicationHistory: CommunicationEntry[];
  supportStatus: SupportStatus;
  createTicket: (
    data: Omit<SupportTicket, "id" | "createdAt" | "updatedAt" | "responses">,
  ) => void;
  updateTicketStatus: (id: string, status: TicketStatus) => void;
  addTicketResponse: (
    ticketId: string,
    response: Omit<TicketResponse, "id">,
  ) => void;
  dismissAlert: (id: string) => void;
  getTicketsForRole: (role: string) => SupportTicket[];
  getAlertsForRole: (role: string) => SystemAlert[];
}

const SupportContext = createContext<SupportContextType | null>(null);

export function SupportProvider({ children }: { children: ReactNode }) {
  const [tickets, setTickets] = useState<SupportTicket[]>(SEED_TICKETS);
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>(SEED_ALERTS);
  const [communicationHistory, setCommunicationHistory] =
    useState<CommunicationEntry[]>(SEED_HISTORY);

  const supportStatus = useMemo((): SupportStatus => {
    const now = new Date();
    // AEST is UTC+10
    const aestOffset = 10 * 60;
    const localOffset = now.getTimezoneOffset();
    const aestMs = now.getTime() + (aestOffset + localOffset) * 60 * 1000;
    const aestDate = new Date(aestMs);
    const dayOfWeek = aestDate.getDay(); // 0=Sun, 6=Sat
    const hour = aestDate.getHours();
    const online = dayOfWeek >= 1 && dayOfWeek <= 5 && hour >= 8 && hour < 18;
    const openTickets = tickets.filter(
      (t) => t.status === "Open" || t.status === "InProgress",
    ).length;
    const resolvedToday = tickets.filter((t) => {
      if (t.status !== "Resolved") return false;
      const updated = new Date(t.updatedAt);
      return updated.toDateString() === now.toDateString();
    }).length;
    return { online, avgResponseTime: "~2 hours", openTickets, resolvedToday };
  }, [tickets]);

  const createTicket = (
    data: Omit<SupportTicket, "id" | "createdAt" | "updatedAt" | "responses">,
  ) => {
    const newTicket: SupportTicket = {
      ...data,
      id: `TKT-${String(tickets.length + 1).padStart(3, "0")}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      responses: [],
    };
    setTickets((prev) => [newTicket, ...prev]);
    setCommunicationHistory((prev) => [
      {
        id: `COM-${Date.now()}`,
        ticketId: newTicket.id,
        message: `Ticket ${newTicket.id} created by ${data.submitterRole}: ${data.title}`,
        authorRole: data.submitterRole,
        timestamp: new Date(),
      },
      ...prev,
    ]);
  };

  const updateTicketStatus = (id: string, status: TicketStatus) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status, updatedAt: new Date() } : t,
      ),
    );
    setCommunicationHistory((prev) => [
      {
        id: `COM-${Date.now()}`,
        ticketId: id,
        message: `Ticket ${id} status updated to ${status}.`,
        authorRole: "System",
        timestamp: new Date(),
      },
      ...prev,
    ]);
  };

  const addTicketResponse = (
    ticketId: string,
    response: Omit<TicketResponse, "id">,
  ) => {
    const newResponse: TicketResponse = {
      ...response,
      id: `RSP-${Date.now()}`,
    };
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              responses: [...t.responses, newResponse],
              updatedAt: new Date(),
            }
          : t,
      ),
    );
    setCommunicationHistory((prev) => [
      {
        id: `COM-${Date.now()}`,
        ticketId,
        message: `Response added by ${response.authorRole}: ${response.message.substring(0, 80)}${response.message.length > 80 ? "..." : ""}`,
        authorRole: response.authorRole,
        timestamp: new Date(),
      },
      ...prev,
    ]);
  };

  const dismissAlert = (id: string) => {
    setSystemAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, dismissed: true } : a)),
    );
  };

  const getTicketsForRole = (role: string): SupportTicket[] => {
    if (role === "Regulator") return tickets;
    return tickets.filter((t) => t.submitterRole === role);
  };

  const getAlertsForRole = (role: string): SystemAlert[] => {
    return systemAlerts.filter(
      (a) => !a.dismissed && a.targetRoles.includes(role),
    );
  };

  return (
    <SupportContext.Provider
      value={{
        tickets,
        systemAlerts,
        communicationHistory,
        supportStatus,
        createTicket,
        updateTicketStatus,
        addTicketResponse,
        dismissAlert,
        getTicketsForRole,
        getAlertsForRole,
      }}
    >
      {children}
    </SupportContext.Provider>
  );
}

export function useSupportContext(): SupportContextType {
  const ctx = useContext(SupportContext);
  if (!ctx)
    throw new Error("useSupportContext must be used inside SupportProvider");
  return ctx;
}
