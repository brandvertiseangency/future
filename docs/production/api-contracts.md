# API Contracts

## Auth
- **Frontend guard**: `frontend/src/components/AuthGuard.tsx`, `frontend/src/middleware.ts`.
- **Backend guard**: `src/middleware/auth.js`.
- **Current note**: demo bypass flags exist and must be disabled before production release.

## Onboarding

### `POST /api/onboarding/complete`
- **Handler**: `src/routes/onboarding.js`.
- **Purpose**: Persist full onboarding payload across brand + intelligence tables.
- **Required sections**: brand, personality, audience, goals, industry config, calendar.
- **Key errors**:
  - `422 ONBOARDING_INCOMPLETE` with `missingBySection`
  - `400` for required basics (`brandName`, `industry`) in invalid payloads
  - `500` persistence failures

### `POST /api/onboarding/preview-caption`
- **Purpose**: Generate tone/style preview text.
- **Error**: `500` fallback supported in UI.

### `POST /api/onboarding/vision/analyse-references`
- **Purpose**: Analyze reference images into style profile.
- **Errors**: `400` (invalid images), `500` analysis failure.

## Calendar planning

### `POST /api/calendar/generate-plan`
- **Handler**: `src/routes/calendarPlan.js`.
- **Purpose**: Generate month plan slots from brief + mix.
- **Guards**:
  - `422 ONBOARDING_INCOMPLETE` if critical brand/pref fields missing
  - `402 insufficient_credits`
  - `400` invalid month/mix
- **Response**: plan metadata + slots.

### `GET /api/calendar/plans/latest`
- Returns latest plan summary for user.

### `GET /api/calendar/jobs/recent`
- Returns job status for calendar-generation workflow.

## Posts

### `GET /api/posts`
- **Purpose**: list outputs/posts by status and pagination.
- **Consumers**: outputs, scheduler, dashboard widgets.

### `PATCH /api/posts/:id`
- **Purpose**: update editable post fields.
- **Risk area**: frontend pages must only send fields backend accepts; otherwise silent no-op can occur.

### `POST /api/posts/:id/regenerate`
- Regenerates a post/version and consumes credits as applicable.

## Brand APIs

### `GET /api/brand/me`
- **Handler**: `src/routes/brand.js`.
- Returns default brand + joined intelligence/config/calendar preference fields.

### `PATCH /api/brand/me`
- Updates canonical brand and related config/pref tables.
- Supports fields like:
  - brand: name/description/tagline/website/phone/address/industry/tone/styles/goals/colors/font
  - audience: age range/gender/location/interests
  - industry config: subtype/price segment/USP/answers
  - calendar prefs: weekly count/content mix/auto schedule/platforms

### `GET /api/brands/current`
- Returns default brand record (lightweight fallback).

## Settings/User

### `GET /api/users/me`
- Ensures user row exists and returns account metadata (`onboarding_complete` etc).

### `PATCH /api/users/me`
- Updates account profile fields (display name, website, photo URL).

### `GET /api/credits/balance`
- Used across dashboard/topbar/generation for credit gating and UI state.

## Error taxonomy used by frontend
- `401`: auth invalid/missing
- `402`: insufficient credits
- `422`: semantic validation/gating (onboarding incomplete)
- `500`: server failure, show retry/fallback UI
