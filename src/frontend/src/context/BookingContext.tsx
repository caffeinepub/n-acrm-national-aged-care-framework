import {
  applyRatingOverride,
  getProviderRatingForQuarter,
} from "@/data/mockData";
import { type ReactNode, createContext, useContext, useState } from "react";

export interface UnifiedBooking {
  id: string;
  userId: string;
  providerId: string;
  providerName: string;
  service: string;
  date: string;
  time: string;
  userName: string;
  userPhone: string;
  address: string;
  confirmationNumber: string;
  status: "Booked" | "Completed" | "Cancelled";
  feedbackSubmitted: boolean;
}

export interface FeedbackData {
  overall: number;
  safety: number;
  quality: number;
  experience: number;
  preventive: number;
  comment: string;
}

export interface RatingOverride {
  overallStars: number;
  safetyScore: number;
  qualityScore: number;
  experienceScore: number;
  preventiveScore: number;
  submittedAt: number;
  userRating: number;
}

interface BookingContextValue {
  bookings: UnifiedBooking[];
  ratingOverrides: Record<string, RatingOverride>;
  currentQuarter: string;
  createBooking: (
    booking: Omit<UnifiedBooking, "id" | "confirmationNumber">,
  ) => UnifiedBooking;
  cancelBooking: (id: string) => void;
  rescheduleBooking: (id: string, date: string, time: string) => void;
  markComplete: (id: string) => void;
  submitRating: (
    bookingId: string,
    providerId: string,
    providerName: string,
    data: FeedbackData,
  ) => void;
  hasRated: (bookingId: string) => boolean;
  pendingFeedbackBookingId: string | null;
  clearPendingFeedback: () => void;
}

const BookingContext = createContext<BookingContextValue | null>(null);

const INITIAL_BOOKINGS: UnifiedBooking[] = [
  {
    id: "BK001",
    userId: "guest_user",
    providerId: "SYD-001",
    providerName: "Bondi Aged Care Centre",
    service: "General Care",
    date: "2026-05-14",
    time: "10:00 AM",
    userName: "Alex Chen",
    userPhone: "0412 345 678",
    address: "88 Campbell Parade, Bondi NSW 2026",
    confirmationNumber: "BAC-2026-1401",
    status: "Booked",
    feedbackSubmitted: false,
  },
  {
    id: "BK002",
    userId: "guest_user",
    providerId: "MEL-001",
    providerName: "Yarra Valley Life Care",
    service: "Physiotherapy",
    date: "2026-05-22",
    time: "2:30 PM",
    userName: "Alex Chen",
    userPhone: "0412 345 678",
    address: "12 Yarra Road, Melbourne VIC 3000",
    confirmationNumber: "YVC-2026-2201",
    status: "Booked",
    feedbackSubmitted: false,
  },
  {
    id: "BK003",
    userId: "guest_user",
    providerId: "BRI-001",
    providerName: "Southbank Senior Living",
    service: "Medication Review",
    date: "2026-04-05",
    time: "9:00 AM",
    userName: "Alex Chen",
    userPhone: "0412 345 678",
    address: "3 Southbank Blvd, Brisbane QLD 4101",
    confirmationNumber: "SSL-2026-0501",
    status: "Completed",
    feedbackSubmitted: false,
  },
  {
    id: "BK004",
    userId: "guest_user",
    providerId: "ADL-001",
    providerName: "Glenelg Senior Services",
    service: "Home Care",
    date: "2026-03-10",
    time: "11:00 AM",
    userName: "Alex Chen",
    userPhone: "0412 345 678",
    address: "47 Glenelg Drive, Adelaide SA 5045",
    confirmationNumber: "GSS-2026-1001",
    status: "Completed",
    feedbackSubmitted: true,
  },
  {
    id: "BK005",
    userId: "guest_user",
    providerId: "PER-001",
    providerName: "Fremantle Aged Care",
    service: "Mental Health Support",
    date: "2026-03-20",
    time: "1:00 PM",
    userName: "Alex Chen",
    userPhone: "0412 345 678",
    address: "22 Marine Terrace, Fremantle WA 6160",
    confirmationNumber: "FAC-2026-2001",
    status: "Cancelled",
    feedbackSubmitted: false,
  },
];

function genConfirmationNumber(providerName: string): string {
  const initials = providerName
    .split(" ")
    .map((w) => w[0] ?? "X")
    .join("");
  const year = new Date().getFullYear();
  const rand = Math.floor(Math.random() * 9000 + 1000);
  return `${initials}-${year}-${rand}`;
}

export function BookingProvider({
  children,
  currentQuarter,
}: {
  children: ReactNode;
  currentQuarter: string;
}) {
  const [bookings, setBookings] = useState<UnifiedBooking[]>(INITIAL_BOOKINGS);
  const [ratingOverrides, setRatingOverrides] = useState<
    Record<string, RatingOverride>
  >({});
  const [pendingFeedbackBookingId, setPendingFeedbackBookingId] = useState<
    string | null
  >(null);

  function createBooking(
    booking: Omit<UnifiedBooking, "id" | "confirmationNumber">,
  ): UnifiedBooking {
    const newBooking: UnifiedBooking = {
      ...booking,
      id: `BK${Date.now()}`,
      confirmationNumber: genConfirmationNumber(booking.providerName),
    };
    setBookings((prev) => [...prev, newBooking]);
    return newBooking;
  }

  function cancelBooking(id: string) {
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b;
        if (b.status === "Completed" || b.status === "Cancelled") return b;
        return { ...b, status: "Cancelled" as const };
      }),
    );
  }

  function rescheduleBooking(id: string, date: string, time: string) {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, date, time } : b)),
    );
  }

  function markComplete(id: string) {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === id ? { ...b, status: "Completed" as const } : b,
      ),
    );
    setPendingFeedbackBookingId(id);
  }

  function submitRating(
    bookingId: string,
    providerId: string,
    _providerName: string,
    data: FeedbackData,
  ) {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;
    if (booking.status !== "Completed") return;
    if (booking.feedbackSubmitted) return;

    // Blend with existing score
    const existing = getProviderRatingForQuarter(providerId, currentQuarter);
    const existingStars = existing.stars;
    const newOverallStars = 0.7 * existingStars + 0.3 * data.overall;
    const safetyScore =
      0.7 * existing.domainScores.safety + 0.3 * (data.safety * 20);
    const qualityScore =
      0.7 * existing.domainScores.quality + 0.3 * (data.quality * 20);
    const experienceScore =
      0.7 * existing.domainScores.experience + 0.3 * (data.experience * 20);
    const preventiveScore =
      0.7 * existing.domainScores.preventive + 0.3 * (data.preventive * 20);

    const override: RatingOverride = {
      overallStars: newOverallStars,
      safetyScore,
      qualityScore,
      experienceScore,
      preventiveScore,
      submittedAt: Date.now(),
      userRating: data.overall,
    };

    // Apply to global mockData store for cross-module sync
    applyRatingOverride(providerId, newOverallStars, {
      safety: safetyScore,
      quality: qualityScore,
      experience: experienceScore,
      preventive: preventiveScore,
    });

    setRatingOverrides((prev) => ({ ...prev, [providerId]: override }));
    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId ? { ...b, feedbackSubmitted: true } : b,
      ),
    );
  }

  function hasRated(bookingId: string): boolean {
    const b = bookings.find((x) => x.id === bookingId);
    return b?.feedbackSubmitted ?? false;
  }

  function clearPendingFeedback() {
    setPendingFeedbackBookingId(null);
  }

  return (
    <BookingContext.Provider
      value={{
        bookings,
        ratingOverrides,
        currentQuarter,
        createBooking,
        cancelBooking,
        rescheduleBooking,
        markComplete,
        submitRating,
        hasRated,
        pendingFeedbackBookingId,
        clearPendingFeedback,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBookingContext(): BookingContextValue {
  const ctx = useContext(BookingContext);
  if (!ctx)
    throw new Error("useBookingContext must be used inside BookingProvider");
  return ctx;
}
