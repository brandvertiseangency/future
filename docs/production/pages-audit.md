# Pages Audit

## `/onboarding`
- **Purpose**: Collect complete brand brief and persist onboarding before generation.
- **Frontend ownership**: `frontend/src/app/(app)/onboarding/page.tsx` + `frontend/src/components/onboarding/*`.
- **Flow**: Multi-step wizard (identity, industry, voice, visual, audience, goals, industry module, references, products, publishing, generate).
- **APIs**: `/api/users/me`, `/api/onboarding/preview-caption`, `/api/onboarding/vision/analyse-references`, `/api/onboarding/complete`, `/api/brand-products/sync-from-onboarding`, `/api/calendar/generate-plan`, `/api/credits/balance`, `/api/brands/current`.
- **DB dependencies**: `users`, `brands`, `brand_style_profiles`, `brand_industry_configs`, `content_calendar_preferences`, `brand_products`, `content_plans`, `calendar_slots`.
- **Expected states**: step-level validation, non-blocking product sync, blocking onboarding persist before completion.

## `/dashboard`
- **Purpose**: Operational overview (credits, outputs, activity, next actions).
- **Frontend ownership**: `frontend/src/app/(app)/dashboard/page.tsx`.
- **Flow**: Fetch cards/stats, route user to generate/calendar/brand actions.
- **APIs**: `/api/brands/current`, `/api/credits/balance`, `/api/posts/stats`, `/api/posts/scheduled`, `/api/posts`.
- **DB dependencies**: `users`, `brands`, `posts`.
- **Expected states**: useful empty states if no posts/brand.

## `/calendar`
- **Purpose**: Review and edit planned/scheduled posts.
- **Frontend ownership**: `frontend/src/app/(app)/calendar/page.tsx`.
- **Flow**: Table/grid review, per-row edits, approvals, quick actions.
- **APIs**: `/api/posts/scheduled`, `/api/posts/:id` (PATCH).
- **DB dependencies**: `posts`.
- **Expected states**: edits must persist for editable fields only.

## `/generate`
- **Purpose**: Generate content creatives from brief/platform setup.
- **Frontend ownership**: `frontend/src/app/(app)/generate/page.tsx`.
- **Flow**: collect generation input, trigger generation, navigate to progress/review.
- **APIs**: `/api/generate-content`, `/api/credits/balance`, `/api/calendar/jobs/recent`.
- **DB dependencies**: `users`, `brands`, `posts`, brand intelligence tables.
- **Expected states**: handle credits/errors/retry consistently.

## `/calendar/generate`
- **Purpose**: Generate month content plan (slots + captions + ideas).
- **Frontend ownership**: `frontend/src/app/(app)/calendar/generate/page.tsx`.
- **Flow**: configure month/count/mix, generate plan, route to review.
- **APIs**: `/api/brands/current`, `/api/credits/balance`, `/api/calendar/plans/latest`, `/api/calendar/generate-plan`.
- **DB dependencies**: `content_plans`, `calendar_slots`, `users`, `brands`, related preference tables.
- **Expected states**: strict onboarding/brief gate, clear actionable errors.

## `/outputs`
- **Purpose**: Manage generated outputs and regenerate/publish candidates.
- **Frontend ownership**: `frontend/src/app/(app)/outputs/page.tsx`.
- **Flow**: filter/search/select outputs, preview/regenerate, send to scheduler.
- **APIs**: `/api/posts`, `/api/posts/:id/regenerate`.
- **DB dependencies**: `posts`, `post_versions`, `users`, `brands`.
- **Expected states**: consistent status labels with calendar/dashboard.

## `/scheduler`
- **Purpose**: Place approved content into publish schedule.
- **Frontend ownership**: `frontend/src/app/(app)/scheduler/page.tsx`.
- **Flow**: pick post and schedule time, persist schedule metadata.
- **APIs**: `/api/posts`, `/api/posts/:id` (PATCH).
- **DB dependencies**: `posts`.
- **Expected states**: no silent field drops on PATCH.

## `/agents`
- **Purpose**: Surface agent capabilities and upsell/entry points.
- **Frontend ownership**: `frontend/src/app/(app)/agents/page.tsx`.
- **Flow**: browse cards and navigate to agent-specific pages.
- **APIs**: none directly on page (shared shell APIs still run).
- **DB dependencies**: indirect via shell (`users`, `notifications`, credits).
- **Expected states**: no auth/store coupling regressions.

## `/settings`
- **Purpose**: Profile/account/billing/preferences management.
- **Frontend ownership**: `frontend/src/app/(app)/settings/page.tsx`.
- **Flow**: edit profile and preferences, view billing/plan data.
- **APIs**: `/api/users/me` (PATCH), `/api/credits/balance`.
- **DB dependencies**: `users`, `user_preferences`.
- **Expected states**: robust save and field-level feedback.

## `/brand`
- **Purpose**: Edit persisted brand profile created during onboarding.
- **Frontend ownership**: `frontend/src/app/(app)/brand/page.tsx`.
- **Flow**: load persisted brand, edit canonical fields, save back to backend.
- **APIs**: `/api/brand/me`, fallback `/api/brands/current`, `/api/brand/me` (PATCH).
- **DB dependencies**: `brands`, `brand_industry_configs`, `brand_style_profiles`, `content_calendar_preferences`.
- **Expected states**: always prefill with persisted values, no setup fallback behavior.
