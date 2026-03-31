# N-ACRM National Aged Care Framework

## Current State
- App starts with full-screen `RoleSelectionDashboard` (glassmorphic cards, animated)
- After selecting role → `Layout` (Header + Sidebar + page content)
- Header has role badge (read-only) — no way to switch roles once inside
- Sidebar has unified dark navy design across all roles
- Public role has 4 sidebar items: Find Providers, My Bookings, Care Resources, My Reviews — but all map to existing ActivePage IDs (`national_overview`, `pay_for_improvement`, `policy_analytics`, `audit_governance`) which show non-public content
- `PublicView.tsx` handles Find Providers with full provider search/booking/comparison/AI chatbot features
- My Bookings, Care Resources, My Reviews currently show non-public-specific pages

## Requested Changes (Diff)

### Add
- **Scrollable Home Page**: A new `HomePage` component that replaces the role selection screen as the entry point. Multi-section layout:
  - Hero section with N-ACRM branding, tagline, animated role cards
  - Role selection section with interactive cards
  - Platform capabilities/features section
  - Insights preview section
  - Footer section
  - Smooth section scroll, animations, responsive design
- **Global Role Switcher** in Header: Replace the read-only role badge with a clickable role switcher. Clicking it opens a dropdown/modal showing all 4 roles. Switching role instantly updates context and navigates to appropriate default page. Must work from ANY page.
- **Public Bookings Page** (`PublicBookings.tsx`): Dedicated My Bookings module with:
  - Tab system: Upcoming / Completed / Cancelled
  - Booking cards with status badges, provider name, service, date/time
  - Actions: Cancel booking, Reschedule (date picker), View details modal
  - Timeline or card-based UI
  - Empty states per tab
- **Care Resources Page** (`CareResources.tsx`): Dedicated care content module:
  - Categories: Fall Prevention, Medication Safety, Mental Health, Dementia Care, Exercise & Mobility
  - Article cards with title, excerpt, read time, category chip
  - Search bar + category filter
  - Full article detail view/modal
  - Independent content system (not linked to provider data)
- **My Reviews Page** (`MyReviews.tsx`): Dedicated reviews module:
  - List of user-submitted reviews with provider name, date, star rating, comment
  - Edit review (open edit modal with star picker + text input)
  - Delete review (with confirmation)
  - Aggregate rating summary
  - Empty state
- **New ActivePage types**: Add `public_bookings`, `care_resources`, `my_reviews` to `ActivePage` type in `App.tsx`

### Modify
- **`App.tsx`**: 
  - Change initial state to show `HomePage` instead of `RoleSelectionDashboard`
  - Pass `onRoleSelect` and `onGoHome` to components
  - Add new ActivePage types
  - Pass `setCurrentRole` down to Header for global role switching
- **`Header.tsx`**: 
  - Replace read-only role badge with a clickable role switcher button
  - Clicking opens inline dropdown showing 4 role options
  - Smooth transition when switching
  - Keep same header visual design
- **`Sidebar.tsx`**: 
  - Update Public Portal nav items to use new page IDs: `public_bookings`, `care_resources`, `my_reviews`
  - Keep all existing nav items for other roles unchanged
  - Add "Home" button/link at top or footer area
- **`Layout.tsx`**: 
  - Add rendering for new public pages: `public_bookings` → `PublicBookings`, `care_resources` → `CareResources`, `my_reviews` → `MyReviews`
  - Add `onSwitchRole` and `onGoHome` props

### Remove
- Remove the `RoleSelectionDashboard` as the app entry point (keep the component but access it via Home page or role switcher)
- Remove the lock that prevents role switching once inside dashboard

## Implementation Plan
1. Update `App.tsx`: add HomePage state, new ActivePage types, pass role-switch capability to Header
2. Create `HomePage.tsx`: multi-section scrollable landing with hero, role cards (that navigate into dashboard), features, insights preview, footer
3. Update `Header.tsx`: add role switcher dropdown with smooth animations
4. Update `Sidebar.tsx`: fix public nav IDs to new page keys; add optional Home button
5. Update `Layout.tsx`: route new public page IDs to new components
6. Create `PublicBookings.tsx`: full bookings system with Upcoming/Completed/Cancelled tabs, reschedule/cancel/details actions
7. Create `CareResources.tsx`: articles with search, category filter, detail modal
8. Create `MyReviews.tsx`: reviews list with edit/delete, star ratings, aggregate summary
9. Ensure all new public pages use the same DS design system (glassmorphism, navy gradient hero, consistent cards, badges)
