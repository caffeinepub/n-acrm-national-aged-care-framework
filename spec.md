# N-ACRM Contact & Support System

## Current State

The application has four role-based dashboards (Regulator, Provider, Policy Analyst, Public) with the following existing features:
- AI Assistant page available to all roles with chat interface
- Booking system with BookingContext for public users
- Sidebar navigation across all roles with consistent Figma-level design
- Centralized rating engine and provider master dataset
- Audit & Governance module for data tracking
- Layout.tsx routes pages; Sidebar.tsx manages navigation groups per role
- App.tsx has `ActivePage` union type controlling which page renders

No contact, support, ticketing, or help system currently exists anywhere in the application.

## Requested Changes (Diff)

### Add
- `ContactSupport` page component — full-page dedicated Contact & Support center, accessible to all roles
- `SupportContext` — shared React context managing: tickets (Open/In Progress/Resolved), support status (online/offline), communication history, alert notifications
- `FloatingHelpButton` — persistent floating button (bottom-right, above any z-index) on every dashboard page, opens a slide-in panel with support options, chatbot, issue tracker
- `HelpSupportPanel` — slide-in drawer/modal opened by the floating button: support status, quick contact, AI chat, raise ticket, view history
- `ContactProviderModal` — modal for contacting a specific provider (Call / Email / Request Callback) with provider phone/email/address; used in Public role's provider detail view and Regulator dashboards
- `SupportTicketModal` — modal to raise a new issue/ticket: category, description, priority, auto-assign by role
- Provider contact data added to `PROVIDER_MASTER` entries: phone, email, address fields
- Alert notification system: auto-triggered alerts for high-risk providers, poor ratings, missed bookings; stored in SupportContext
- Communication history log: all tickets, interactions, responses stored and viewable
- "Contact & Support" navigation item added to all role sidebars under a new SUPPORT group
- `contact_support` added to `ActivePage` type in App.tsx
- Public role Help & Support page section with FAQs, working hours, support phone/email
- Provider role "Need Help" section within the Contact & Support page with ticket raising and status tracking
- Regulator role escalation tools: contact provider directly, respond to issues, monitor complaints tab
- Policy Analyst role: contact regulator/support, raise data/query issues
- Live Support Status widget: online/offline indicator, average response time, ticket counts

### Modify
- `App.tsx` — add `contact_support` to `ActivePage` type
- `Sidebar.tsx` — add SUPPORT nav group with Contact & Support item visible to all roles
- `Layout.tsx` — add import and route for `ContactSupport` page; add `FloatingHelpButton` rendered globally inside the layout
- `PublicView.tsx` — add provider contact details (phone, email, address) in the provider detail modal; add Contact Provider button with Call/Email/Request Callback options
- `data/mockData.ts` — extend UNIFIED_PROVIDERS with phone, email, address fields per provider
- `NationalOverview.tsx` (Regulator) — add provider contact details column/action in provider table

### Remove
- Nothing removed; all additions are purely additive

## Implementation Plan

1. Extend `PROVIDER_MASTER`/`UNIFIED_PROVIDERS` in mockData.ts with contact fields (phone, email, address) for all 29 providers
2. Create `SupportContext.tsx` — manages tickets state (create, update status), communication history, support status (online hours), system alerts
3. Create `ContactSupport.tsx` page — tabbed layout:
   - Overview: live support status, quick contact cards, FAQs
   - My Tickets: raise ticket, view/filter ticket list with status badges
   - Communication History: timeline of all interactions
   - Alerts (Regulator/Provider): system-triggered alerts for risk/rating events
   - Escalation Tools (Regulator only): contact providers, respond to issues
4. Create `FloatingHelpButton.tsx` — fixed position button with slide-in `HelpSupportPanel` containing: support status, quick actions, mini AI chat, raise ticket form
5. Update `App.tsx` to add `contact_support` to `ActivePage` type
6. Update `Sidebar.tsx` to add SUPPORT group with Contact & Support nav item for all roles
7. Update `Layout.tsx` to route to ContactSupport page and render FloatingHelpButton globally
8. Update `PublicView.tsx` to show provider contact details and Contact Provider button in the provider modal
9. Update `mockData.ts` with contact fields for all providers
10. Wrap app in `SupportProvider` in `main.tsx` or `App.tsx`
