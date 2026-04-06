# N-ACRM Provider Contact System

## Current State

The Public module has a `ContactProviderModal` (dark-themed, minimal) that shows provider contact info and a basic callback form. It is NOT integrated into the `ProviderDetailModal` inside `PublicView.tsx`. The `PROVIDER_CONTACTS` dataset contains phone/email/address for all 29 providers. There is no contact intelligence, AI Call Assist, contact history, post-contact feedback, or callback status tracking.

## Requested Changes (Diff)

### Add
- `ContactContext.tsx` — centralized state for callback requests (Pending/Accepted/Completed), contact interaction logs, and post-contact feedback. Seeded with realistic data.
- `providerContactIntelligence.ts` — utility to derive smart contact insights (response time, response rate, availability status, best time to contact) from booking load and historical interaction patterns.
- `ProviderContactPanel` component (in PublicView.tsx) — a full-featured contact panel added as a new `"contact"` tab inside `ProviderDetailModal`. Contains:
  - Contact details card (phone, email, address with click-to-call/email)
  - Smart Contact Insights card (response time, response rate, availability badge)
  - Best Time to Contact card (predictive suggestion)
  - AI Call Assist section (pre-call helper: select topic, get a brief summary)
  - Direct action buttons: Call Provider, Email Provider, Request Callback
  - Callback Request form (date/time picker, stored in ContactContext with status tracking)
  - Post-Contact Feedback prompt (resolved?, star rating, comment)
  - Contact History timeline (past interactions, outcomes)
- Callback requests now visible to Provider role (in ProviderDashboard sidebar menu item or tab)

### Modify
- `ProviderDetailModal` in `PublicView.tsx` — add `"contact"` tab to the existing tab row (overview/trends/services/reviews → add contact)
- `App.tsx` — wrap with `ContactContextProvider`
- `data/providerContacts.ts` — augment `ProviderContact` interface with `responseTimeMinutes`, `responseRate`, `peakHoursStart`, `peakHoursEnd`, `operatingDays` fields for intelligence calculations

### Remove
- `ContactProviderModal.tsx` (the standalone dark modal) — replaced by the richer in-modal panel

## Implementation Plan

1. Augment `providerContacts.ts` with intelligence fields
2. Create `providerContactIntelligence.ts` utility
3. Create `context/ContactContext.tsx` with callback requests, contact logs, post-contact feedback
4. Build the `ProviderContactPanel` component (all 9 features) inside `PublicView.tsx`
5. Add `"contact"` tab to `ProviderDetailModal`
6. Wire `ContactContextProvider` in `App.tsx`
7. Validate build (lint + typecheck)
