# Regression Watchlist

## Critical (P0)
- **Auth bypass left enabled**
  - Files: `frontend/src/middleware.ts`, `frontend/src/components/AuthGuard.tsx`, `src/middleware/auth.js`
  - Impact: production data exposed without auth.

- **Calendar edit payload mismatch**
  - Frontend can send fields backend does not persist for `PATCH /api/posts/:id`.
  - Impact: user edits appear saved in UI but not in DB.

- **Status lifecycle inconsistency**
  - Different pages treat `approved/scheduled/published` differently.
  - Impact: conflicting metrics and post visibility.

## High (P1)
- **Generate queue linkage mismatch**
  - `/generate` flow references calendar jobs, causing misleading progress states.

- **Scheduler metadata no-op risk**
  - Scheduler UI may send unsupported fields to posts patch route.

- **Brand hydration drift**
  - If API fallback fails or payload mapping diverges, `/brand` appears empty.

## Medium (P2)
- **Theme override bleed**
  - Residual broad CSS overrides can alter unrelated pages.

- **Shared store assumptions**
  - Cross-page store hydration order can show stale labels/values.

## Ongoing checks
- Fresh user onboarding → skip/generate → `/brand` prefill.
- Dashboard stats match outputs/calendar status counts.
- Scheduler updates visible in calendar and outputs consistently.
