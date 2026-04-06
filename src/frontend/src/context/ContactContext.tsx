import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

export type CallbackStatus = "Pending" | "Accepted" | "Completed";

export interface CallbackRequest {
  id: string;
  providerId: string;
  providerName: string;
  userName: string;
  userPhone?: string;
  preferredDate: string;
  preferredTimeSlot: string;
  topic: string;
  service?: string;
  status: CallbackStatus;
  createdAt: number;
  resolvedAt?: number;
  providerNote?: string;
}

export type ContactInteractionType = "call" | "email" | "callback";
export type InteractionOutcome = "resolved" | "unresolved" | "pending";

export interface ContactInteraction {
  id: string;
  providerId: string;
  providerName: string;
  type: ContactInteractionType;
  topic: string;
  service?: string;
  outcome: InteractionOutcome;
  createdAt: number;
  feedbackSubmitted: boolean;
}

export interface ContactFeedback {
  interactionId: string;
  providerId: string;
  resolved: boolean;
  rating: number; // 1-5, 0 = not rated
  comment: string;
  createdAt: number;
}

interface ContactContextValue {
  callbackRequests: CallbackRequest[];
  interactions: ContactInteraction[];
  feedbacks: ContactFeedback[];
  // Callback actions
  submitCallbackRequest: (
    req: Omit<CallbackRequest, "id" | "createdAt" | "status">,
  ) => CallbackRequest;
  updateCallbackStatus: (
    id: string,
    status: CallbackStatus,
    note?: string,
  ) => void;
  // Interaction logging
  logInteraction: (
    entry: Omit<ContactInteraction, "id" | "createdAt" | "feedbackSubmitted">,
  ) => ContactInteraction;
  // Feedback
  submitContactFeedback: (fb: Omit<ContactFeedback, "createdAt">) => void;
  // Helpers
  getProviderCallbacks: (providerId: string) => CallbackRequest[];
  getProviderInteractions: (providerId: string) => ContactInteraction[];
  pendingFeedbackInteraction: ContactInteraction | null;
  clearPendingFeedback: () => void;
}

const ContactContext = createContext<ContactContextValue | null>(null);

// Seed data ─ realistic initial state
const now = Date.now();
const SEED_INTERACTIONS: ContactInteraction[] = [
  {
    id: "CI-001",
    providerId: "SYD-001",
    providerName: "Bondi Aged Care Centre",
    type: "call",
    topic: "Appointment Slots",
    service: "General Care",
    outcome: "resolved",
    createdAt: now - 1000 * 60 * 60 * 24 * 5,
    feedbackSubmitted: true,
  },
  {
    id: "CI-002",
    providerId: "MEL-001",
    providerName: "Yarra Valley Life Care",
    type: "email",
    topic: "Pricing & Fees",
    outcome: "resolved",
    createdAt: now - 1000 * 60 * 60 * 24 * 10,
    feedbackSubmitted: true,
  },
  {
    id: "CI-003",
    providerId: "BNE-001",
    providerName: "Southbank Senior Living",
    type: "callback",
    topic: "Service Availability",
    service: "Physiotherapy",
    outcome: "unresolved",
    createdAt: now - 1000 * 60 * 60 * 24 * 2,
    feedbackSubmitted: false,
  },
];

const SEED_CALLBACKS: CallbackRequest[] = [
  {
    id: "CB-001",
    providerId: "BNE-001",
    providerName: "Southbank Senior Living",
    userName: "Alex Chen",
    userPhone: "0412 345 678",
    preferredDate: "2026-05-15",
    preferredTimeSlot: "Morning (8am–12pm)",
    topic: "Service Availability",
    service: "Physiotherapy",
    status: "Pending",
    createdAt: now - 1000 * 60 * 60 * 24 * 2,
  },
  {
    id: "CB-002",
    providerId: "MEL-003",
    providerName: "Bayside Elders Care",
    userName: "Alex Chen",
    preferredDate: "2026-05-10",
    preferredTimeSlot: "Afternoon (12pm–4pm)",
    topic: "Eligibility & Assessment",
    status: "Accepted",
    createdAt: now - 1000 * 60 * 60 * 24 * 8,
    providerNote: "We will call you at 2:00 PM on the requested date.",
  },
  {
    id: "CB-003",
    providerId: "SYD-001",
    providerName: "Bondi Aged Care Centre",
    userName: "Alex Chen",
    preferredDate: "2026-04-28",
    preferredTimeSlot: "Morning (8am–12pm)",
    topic: "Appointment Slots",
    service: "General Care",
    status: "Completed",
    createdAt: now - 1000 * 60 * 60 * 24 * 14,
    resolvedAt: now - 1000 * 60 * 60 * 24 * 13,
  },
];

const SEED_FEEDBACKS: ContactFeedback[] = [
  {
    interactionId: "CI-001",
    providerId: "SYD-001",
    resolved: true,
    rating: 5,
    comment: "Very helpful, appointment booked quickly.",
    createdAt: now - 1000 * 60 * 60 * 24 * 5,
  },
  {
    interactionId: "CI-002",
    providerId: "MEL-001",
    resolved: true,
    rating: 4,
    comment: "Clear pricing info provided.",
    createdAt: now - 1000 * 60 * 60 * 24 * 10,
  },
];

export function ContactProvider({ children }: { children: ReactNode }) {
  const [callbackRequests, setCallbackRequests] =
    useState<CallbackRequest[]>(SEED_CALLBACKS);
  const [interactions, setInteractions] =
    useState<ContactInteraction[]>(SEED_INTERACTIONS);
  const [feedbacks, setFeedbacks] = useState<ContactFeedback[]>(SEED_FEEDBACKS);
  const [pendingFeedbackInteraction, setPendingFeedbackInteraction] =
    useState<ContactInteraction | null>(null);

  function submitCallbackRequest(
    req: Omit<CallbackRequest, "id" | "createdAt" | "status">,
  ): CallbackRequest {
    const newReq: CallbackRequest = {
      ...req,
      id: `CB-${String(Date.now()).slice(-6)}`,
      status: "Pending",
      createdAt: Date.now(),
    };
    setCallbackRequests((prev) => [newReq, ...prev]);
    return newReq;
  }

  function updateCallbackStatus(
    id: string,
    status: CallbackStatus,
    note?: string,
  ) {
    setCallbackRequests((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status,
              providerNote: note ?? r.providerNote,
              resolvedAt: status === "Completed" ? Date.now() : r.resolvedAt,
            }
          : r,
      ),
    );
  }

  function logInteraction(
    entry: Omit<ContactInteraction, "id" | "createdAt" | "feedbackSubmitted">,
  ): ContactInteraction {
    const interaction: ContactInteraction = {
      ...entry,
      id: `CI-${String(Date.now()).slice(-6)}`,
      createdAt: Date.now(),
      feedbackSubmitted: false,
    };
    setInteractions((prev) => [interaction, ...prev]);
    setPendingFeedbackInteraction(interaction);
    return interaction;
  }

  function submitContactFeedback(fb: Omit<ContactFeedback, "createdAt">) {
    const newFb: ContactFeedback = { ...fb, createdAt: Date.now() };
    setFeedbacks((prev) => [
      ...prev.filter((f) => f.interactionId !== fb.interactionId),
      newFb,
    ]);
    setInteractions((prev) =>
      prev.map((i) =>
        i.id === fb.interactionId ? { ...i, feedbackSubmitted: true } : i,
      ),
    );
    setPendingFeedbackInteraction(null);
  }

  function clearPendingFeedback() {
    setPendingFeedbackInteraction(null);
  }

  function getProviderCallbacks(providerId: string) {
    return callbackRequests.filter((r) => r.providerId === providerId);
  }

  function getProviderInteractions(providerId: string) {
    return interactions.filter((i) => i.providerId === providerId);
  }

  return (
    <ContactContext.Provider
      value={{
        callbackRequests,
        interactions,
        feedbacks,
        submitCallbackRequest,
        updateCallbackStatus,
        logInteraction,
        submitContactFeedback,
        getProviderCallbacks,
        getProviderInteractions,
        pendingFeedbackInteraction,
        clearPendingFeedback,
      }}
    >
      {children}
    </ContactContext.Provider>
  );
}

export function useContactContext(): ContactContextValue {
  const ctx = useContext(ContactContext);
  if (!ctx) throw new Error("useContactContext must be inside ContactProvider");
  return ctx;
}
