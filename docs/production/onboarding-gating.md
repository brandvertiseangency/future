# Onboarding and Auth Gating

## Frontend gating points
- `frontend/src/lib/auth-context.tsx`
  - Post-login routing checks `GET /api/users/me` and sends incomplete users to `/onboarding`.
- `frontend/src/components/AuthGuard.tsx`
  - Protects app routes from unauthenticated users (unless demo bypass is enabled).
- `frontend/src/middleware.ts`
  - Edge route gating and redirect to `/auth`.

## Backend gating points
- `src/middleware/auth.js`
  - API-level token verification and user attachment.
- `src/routes/onboarding.js`
  - `POST /api/onboarding/complete` validates required sections and returns `422 ONBOARDING_INCOMPLETE` when missing.
- `src/routes/calendarPlan.js`
  - `POST /api/calendar/generate-plan` blocks planning with `422 ONBOARDING_INCOMPLETE` if required brand/pref data is missing.

## Required completion matrix (production intent)
- **Brand**: name + description
- **Industry**: industry key
- **Voice/personality**: tone + style keywords
- **Audience**: location + interests + valid range metadata
- **Goals**: at least one
- **Industry module**: required industry answers
- **Publishing plan**: active platforms + mix total 100

## Current operational caveats
- Temporary auth demo bypass flags exist in frontend and backend and must be disabled for production.
- Skip flows must persist onboarding before navigation if brand prefill/edit experiences depend on backend data.
