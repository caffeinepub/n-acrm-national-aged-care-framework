import type { ProviderContact } from "../data/providerContacts";

export interface ContactIntelligence {
  responseTimeLabel: string; // e.g. "~18 mins"
  responseRate: number; // 0-100
  availabilityStatus: "available" | "busy" | "closed";
  availabilityLabel: string;
  bestTimeLabel: string; // e.g. "10:00 AM – 12:00 PM"
  bestTimeRationale: string;
}

function fmt12(hour: number): string {
  const h = hour % 12 || 12;
  const ampm = hour < 12 || hour === 24 ? "AM" : "PM";
  return `${h}:00 ${ampm}`;
}

export function deriveContactIntelligence(
  contact: ProviderContact,
  bookingLoad: number, // 0-100: how busy (% slots booked across services)
): ContactIntelligence {
  const now = new Date();
  const currentHour = now.getHours();
  const dayOfWeek = now.getDay(); // 0=Sun, 6=Sat

  // Determine if within operating days
  const hasSat = contact.operatingDays.includes("Sat");
  const isOperatingDay =
    (dayOfWeek >= 1 && dayOfWeek <= 5) || (hasSat && dayOfWeek === 6);

  // Operating hours: derive start/end from operatingHours string
  // e.g. "8:30am–5:00pm" → 8 and 17
  const hoursMatch = contact.operatingHours.match(
    /(\d+)(?::\d+)?(?:am|AM).*?(\d+)(?::\d+)?(?:pm|PM)/i,
  );
  const opStart = hoursMatch ? Number.parseInt(hoursMatch[1]) : 9;
  const opEnd = hoursMatch ? Number.parseInt(hoursMatch[2]) + 12 : 17;

  const isWithinHours = currentHour >= opStart && currentHour < opEnd;

  // Availability
  let availabilityStatus: "available" | "busy" | "closed";
  let availabilityLabel: string;
  if (!isOperatingDay || !isWithinHours) {
    availabilityStatus = "closed";
    availabilityLabel = "Closed";
  } else if (bookingLoad > 75) {
    availabilityStatus = "busy";
    availabilityLabel = "Busy – limited availability";
  } else {
    availabilityStatus = "available";
    availabilityLabel = "Available Now";
  }

  // Adjust response time based on load
  const loadFactor = 1 + (bookingLoad / 100) * 0.6;
  const adjustedTime = Math.round(contact.responseTimeMinutes * loadFactor);
  const responseTimeLabel =
    adjustedTime < 60
      ? `~${adjustedTime} mins`
      : `~${Math.round(adjustedTime / 60)} hrs`;

  // Best time: peak hours + low load window
  const bestStart = contact.peakHoursStart;
  const bestEnd = contact.peakHoursEnd;
  const bestTimeLabel = `${fmt12(bestStart)} – ${fmt12(bestEnd)}`;

  let bestTimeRationale = "Based on historical response patterns";
  if (bookingLoad < 40) {
    bestTimeRationale =
      "Historically high staff availability during this window";
  } else if (bookingLoad > 70) {
    bestTimeRationale = "Morning window avoids peak booking load";
  } else {
    bestTimeRationale = `Provider most responsive between ${fmt12(bestStart)} and ${fmt12(bestEnd)} AEST`;
  }

  return {
    responseTimeLabel,
    responseRate: contact.responseRate,
    availabilityStatus,
    availabilityLabel,
    bestTimeLabel,
    bestTimeRationale,
  };
}

export const CALL_TOPICS = [
  { id: "availability", label: "Service Availability", icon: "📋" },
  { id: "pricing", label: "Pricing & Fees", icon: "💰" },
  { id: "slots", label: "Appointment Slots", icon: "📅" },
  { id: "eligibility", label: "Eligibility & Assessment", icon: "✅" },
  { id: "quality", label: "Quality of Care", icon: "⭐" },
  { id: "location", label: "Location & Transport", icon: "📍" },
];

export function generateCallSummary(
  providerName: string,
  topicId: string,
  service?: string,
): string {
  const summaries: Record<string, string> = {
    availability: `Ask ${providerName} about current availability for ${
      service ? service : "your required service"
    }. Confirm whether they are accepting new clients and expected wait times.`,
    pricing:
      "Enquire about the fee structure and any government subsidies available. Ask if there are package options or concession rates.",
    slots: `Check available appointment times for ${service ?? "your preferred service"}. Have your preferred dates ready to share with the provider.`,
    eligibility:
      "Discuss eligibility criteria and what documents you may need for assessment. Ask about the intake process and timeline.",
    quality:
      "Ask about staff qualifications, care ratios, and how they handle quality complaints. Request a copy of their latest quality report if available.",
    location:
      "Confirm the physical address and any parking or public transport options. Ask if home visits or transport assistance is available.",
  };
  return (
    summaries[topicId] ??
    `Discuss your query with ${providerName} and note any key information for follow-up.`
  );
}
