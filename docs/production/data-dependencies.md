# Data Dependencies

## Core tables by feature

## Identity and access
- `users`
- `user_preferences`

## Brand profile system
- `brands`
- `brand_style_profiles`
- `brand_industry_configs`
- `content_calendar_preferences`
- `brand_products`

## Content generation and planning
- `content_plans`
- `calendar_slots`
- `posts`
- `post_versions`

## Route-to-table matrix

- **`/onboarding`**
  - Writes: `users`, `brands`, `brand_style_profiles`, `brand_industry_configs`, `content_calendar_preferences`
  - Optional writes: `brand_products`
  - Optional generation writes: `content_plans`, `calendar_slots`, `posts`

- **`/brand`**
  - Reads/updates: `brands`
  - Reads/updates joined config: `brand_industry_configs`, `brand_style_profiles`, `content_calendar_preferences`

- **`/calendar/generate`**
  - Reads: brand + preference tables, `users` credits
  - Writes: `content_plans`, `calendar_slots`, `posts`

- **`/generate`**
  - Reads: brand + preference tables, `users` credits
  - Writes: `posts`, `post_versions`

- **`/calendar` / `/outputs` / `/scheduler`**
  - Primary dependency: `posts` (+ `post_versions` for outputs)

- **`/dashboard`**
  - Reads aggregate from `posts`, `users`, `brands`

## Data invariants (must hold)
- Default brand exists for active users who completed onboarding.
- `content_calendar_preferences.active_platforms` not empty for generation-ready users.
- `content_calendar_preferences.content_type_mix` totals 100 for planning-ready users.
- Post status transitions remain consistent across all page consumers.
