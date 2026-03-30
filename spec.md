# N-ACRM National Aged Care Framework

## Current State
The Public Dashboard (`PublicView.tsx`) is a read-only viewer showing provider cards with star ratings, trust badges, comparison tool, smart recommendations, and popup detail modals. The popup shows provider name, rating, key indicators, strengths/improvements. No booking, feedback, or rating submission system exists.

## Requested Changes (Diff)

### Add
- **Service Listing section** inside the provider detail popup: 5 service cards (General Care, Physiotherapy, Medication Review, Home Care, Mental Health Support) with name, description, availability, and "Book Appointment" button
- **Appointment Booking Modal**: multi-step form — select service (pre-filled), pick date/time, enter name/contact details, confirm booking; shows animated success confirmation; stores bookings in React state
- **Service Completion Trigger**: simulated "Mark as Completed" button per booking in a "My Bookings" mini-panel; triggers feedback notification banner
- **Feedback & Rating Modal**: interactive star rating for Overall Provider + 4 domain indicators (Safety, Preventive Care, Experience, Quality); optional text comment; submit stores feedback
- **Rating Integration**: submitted user feedback scores blend into the provider's indicator scores in local state (satisfaction-weighted merge), triggering recalculation via `getProviderRatingForQuarter`-compatible logic, updating the displayed stars and domain scores across the public view
- **Synchronization**: after rating submission, update the displayed ratings in provider cards, popup, comparison panel, and KPI summary counts
- **Validation**: one feedback per booking per user (tracked by booking ID in local state); feedback only enabled after service marked complete; duplicate prevention
- **My Bookings panel**: collapsible section showing active bookings, status (Pending/Completed), and feedback action button

### Modify
- **Provider detail popup** (`ProviderDetailModal`): add "Available Services" section below indicator summary; retain all existing content
- **PublicView state**: add bookings state array, feedbacks state array, userRatingOverrides state map (providerId → blended scores)

### Remove
- Nothing removed; all existing features preserved

## Implementation Plan
1. Define TypeScript types: `ServiceDef`, `Booking`, `FeedbackEntry`, `UserRatingOverride` in `PublicView.tsx`
2. Define `AVAILABLE_SERVICES` constant (5 services with id, name, description, availability, icon)
3. Add booking/feedback/override state to `PublicView` component
4. Build `ServiceCard` sub-component with Book button
5. Build `BookingModal` — 3-step wizard: Service confirmation → Date/Time picker → Contact details → Success screen
6. Build `FeedbackModal` — interactive star pickers for 5 dimensions + text area + submit
7. Build `MyBookingsPanel` — collapsible list, Mark Complete button, Leave Feedback button
8. Integrate `ServiceCard` grid into existing `ProviderDetailModal` popup
9. Wire rating overrides: on feedback submit, blend user scores with provider's existing indicator values (weighted 80% existing / 20% user), recompute stars, update provider card display
10. Add feedback notification banner that appears when a booking is completed
11. Ensure no sensitive data is exposed; all UI uses public-friendly language
12. Validate and build
