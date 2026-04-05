# N-ACRM Public User Journey System

## Current State

The application has:
- `PublicView.tsx`: Large component (~2000+ lines) containing internal booking wizard state, provider cards, comparison tool, AI chatbot, Care Journey tracker, Trust Score, Outcome Prediction, and rating feedback modal. All state is local (useState) — bookings created here never leave this component.
- `PublicBookings.tsx`: A completely separate page with its own incompatible `Booking` type (status: `upcoming|completed|cancelled`, no `providerId`, no `feedbackSubmitted`), seeded with hardcoded static data. "Leave Review" button only fires a toast.
- No shared booking store — the two systems are entirely disconnected.
- Rating submissions in `PublicView.tsx` update local state via a blending formula but are not stored in any persistent/shared layer.
- Backend (`main.mo`) has no Booking or PublicRating types — only RatingEngineResult, AuditLog, IndicatorResults, etc.
- `mockData.ts` has `getProviderRatingForQuarter(id, quarter)` as the central rating function but user ratings are applied only to local component state.

## Requested Changes (Diff)

### Add
- **Motoko backend**: `Booking` and `PublicRating` types with full CRUD:
  - `createBooking(booking)` → stores booking with userId, providerId, service, date, time, status
  - `getUserBookings(userId)` → returns all bookings for a user
  - `updateBookingStatus(id, status)` → updates status (Booked/Completed/Cancelled)
  - `submitPublicRating(rating)` → stores rating with bookingId, providerId, overall+indicators scores, feedback text
  - `getProviderPublicRatings(providerId)` → returns all ratings for a provider
  - `getPublicRatingAverage(providerId)` → returns aggregated average scores
  - Validation: prevent duplicate ratings for same booking
- **Shared booking context** (`BookingContext.tsx`): React context that holds all bookings in memory, shared between `PublicView.tsx` and `PublicBookings.tsx`
- **Unified `Booking` type**: Single type with fields: id, userId, providerId, providerName, service, date, time, userName, userPhone, address, confirmationNumber, status (`Booked|Completed|Cancelled`), feedbackSubmitted
- **Real-time rating sync**: After rating submission, `userRatingOverrides` map in BookingContext updates the provider's blended score, which `getProviderRatingForQuarter` reads — syncing Public view, Provider Dashboard, Regulator, and Policy Analyst
- **Feedback popup trigger**: When a booking status changes to Completed (via `markComplete` in My Bookings), automatically open the rating modal
- **Validation engine**: Prevent rating if booking not Completed, prevent duplicate ratings per booking, validate required fields

### Modify
- **`PublicView.tsx`**: 
  - Replace local `bookings` state with BookingContext `bookings` array
  - Replace local `addBooking()` with `createBooking()` from context
  - Replace local `userRatings` state with context-shared `userRatingOverrides`
  - After feedback submit, call `submitRating()` from context which persists and syncs
  - Remove the local Care Journey inline panel — bookings now live in shared context (My Bookings page reads them)
  - Keep all existing UI: provider cards, comparison tool, AI chatbot, Trust Score, Outcome Prediction, search/filter, smart recommendations
- **`PublicBookings.tsx`**:
  - Replace `SEED_BOOKINGS` static array with bookings from `BookingContext`
  - Add `markComplete(id)` action that sets status to Completed AND triggers feedback modal
  - "Leave Review" button opens the full rating modal (stars + indicators + text) instead of a toast
  - Reschedule and cancel actions update the shared context
  - Show real booking data from context (no more disconnected static seed)
- **`App.tsx`**: Wrap the app in `BookingProvider` so context is available to all pages
- **`main.mo`**: Add Booking and PublicRating actor types and methods

### Remove
- Static `SEED_BOOKINGS` array from `PublicBookings.tsx`
- The disconnected local `bookings` useState in `PublicView.tsx` (replaced by context)
- The local `userRatings` useState in `PublicView.tsx` (replaced by context-level override map)

## Implementation Plan

1. **Backend** (`main.mo`): Add `Booking`, `PublicRating` types and CRUD methods (`createBooking`, `getUserBookings`, `updateBookingStatus`, `submitPublicRating`, `getProviderPublicRatings`, `getPublicRatingAverage`). Validation: one rating per booking.

2. **BookingContext** (`src/frontend/src/context/BookingContext.tsx`): 
   - Holds `bookings: Booking[]` in state
   - Holds `userRatingOverrides: Record<string, BlendedRating>` in state
   - Exports: `createBooking`, `cancelBooking`, `rescheduleBooking`, `markComplete`, `submitRating`, `hasRated(bookingId)`
   - `submitRating` blends user score (30%) with existing provider score (70%) and stores result in `userRatingOverrides`
   - `userRatingOverrides` is exported so `getProviderRatingForQuarter` callers can apply the override

3. **Update `mockData.ts`**: Export a `applyUserRatingOverride(providerId, override)` helper that merges user ratings into the provider's score — used by both PublicView and all other modules that call `getProviderRatingForQuarter`.

4. **Update `PublicView.tsx`**: Use BookingContext for bookings and rating overrides. Rating modal on feedback submit calls `context.submitRating()`. Capacity tracking still managed locally per-session.

5. **Rebuild `PublicBookings.tsx`**: Reads from BookingContext. `markComplete(id)` → status = Completed + opens FeedbackModal. Rating modal is the same component as used in PublicView (extracted to shared component). Full timeline/status display with card-based UI.

6. **Extract `FeedbackModal`** to `src/frontend/src/components/ui/FeedbackModal.tsx`: Shared between PublicView and PublicBookings. Props: providerId, providerName, bookingId, onSubmit(data), onClose.

7. **Update `App.tsx`**: Wrap with `<BookingProvider>`. Seed 5 realistic bookings (mix of Booked, Completed with feedback not yet submitted) into context on initialization so My Bookings page is not empty.

8. **UI Design**: Light-theme card-based booking list, animated rating popup with star pickers + sliders for indicators, success/error toast messages, hover effects throughout. Consistent with global DS design system (design-system.css / components/ds/index.tsx).
