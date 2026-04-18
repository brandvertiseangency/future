# Brandvertise AI — Complete Web App Enhancement Prompt
## Master Build Prompt · Production-Ready · End-to-End

---

> **Context for the AI executing this prompt:**
> You are taking over a partially-built Next.js 15 web app called **Brandvertise AI** — an AI-powered social media content generation platform. The visual shell exists (dark theme, sidebar, all pages render). Almost nothing is functionally connected. Your job is to make every single part of this app production-ready, end-to-end — real data, real auth, real AI, real DB persistence, real UX, real error handling. No mocks, no placeholders, no TODOs left behind.
>
> **Live URL:** `https://future-gilt-psi.vercel.app`
> **Stack:** Next.js 15 · TypeScript · Tailwind CSS · shadcn/ui · Framer Motion · Zustand · Node.js/Express · PostgreSQL · Redis · BullMQ · Firebase Auth

---

## 0. Read This First — Ground Rules

Before touching a single file, internalize these rules. They are non-negotiable:

1. **Zero placeholder data.** Remove every hardcoded number (2400+ brands, 10M+ posts, 47% engagement). All stats must come from real DB queries or be 0 on a fresh account.
2. **Zero broken states.** Every empty state must have a clear CTA. No broken image icons, no undefined errors in console, no unhandled promise rejections.
3. **TypeScript strict mode stays on.** Fix types, never use `any` unless absolutely unavoidable and commented why.
4. **Every user action must persist.** If a user saves something, it must survive a page refresh.
5. **Every destructive action needs confirmation.** Delete post, cancel plan, disconnect account — all need a confirm dialog.
6. **Mobile-first, but desktop-polished.** The bottom tab bar already exists. Make sure all pages work flawlessly on 375px screens.
7. **Auth gates everything.** No page (except `/` landing and `/auth`) is accessible without a valid session. Redirect to `/auth` with a `?redirect=` param.
8. **Optimistic UI everywhere.** Never disable the whole UI while waiting for a server response. Use optimistic updates, then reconcile.
9. **Loading states are required.** Every async operation needs a skeleton, spinner, or progress indicator — never a blank screen.
10. **Error states are required.** Every async operation needs a user-facing error message with a retry action.

---

## 1. Authentication — Firebase Auth, Real Sessions

### 1.1 Auth Page (`/auth`)
Build a single `/auth` page that handles both sign-in and sign-up with tab switching.

**Sign-up flow:**
- Email + password fields with inline validation (real-time, not on submit)
- Password strength indicator (4 levels: weak → strong) using color bar
- "Continue with Google" OAuth button (Firebase Google provider)
- After successful sign-up → redirect to `/onboarding`

**Sign-in flow:**
- Email + password
- "Forgot password?" link → inline email input for reset (Firebase `sendPasswordResetEmail`)
- "Continue with Google" → if new user, go to `/onboarding`; if existing, go to `/dashboard`
- Remember me checkbox (persist Firebase session)

**Session management:**
- Use Firebase `onAuthStateChanged` in a root `AuthProvider` context
- Store the Firebase ID token in an httpOnly cookie (use a Next.js middleware `/middleware.ts` to verify on every request)
- `middleware.ts` must protect all routes except `/`, `/auth`, `/api/webhooks/*`
- On token expiry, silently refresh using Firebase's `getIdToken(user, true)`

**Error handling:**
- `auth/email-already-in-use` → "An account with this email already exists. Sign in instead?"
- `auth/wrong-password` → "Incorrect password. Try again or reset it."
- `auth/too-many-requests` → "Too many attempts. Try again in a few minutes."
- Network errors → "Connection failed. Check your internet and retry."

---

## 2. Onboarding — 7-Step Wizard

Build a completely new `/onboarding` page replacing the current 6-step placeholder. This is a full-screen experience — no sidebar, no topbar. Progress is shown as a named step indicator: **"Step 3 of 7 — Brand voice"** with a thin violet progress bar across the top.

Every step has a "Skip for now →" ghost link bottom-right. Skipped steps use sensible defaults. Navigation: Back (ghost button) + Continue (ShimmerButton). Keyboard: `Enter` advances, `Escape` goes back.

Persist the entire wizard state to Zustand AND to `localStorage` (so a page refresh resumes where they left off). On final submission, write all data to PostgreSQL via `POST /api/onboarding/complete`.

### Step 1 — Welcome
- Full-bleed dark screen. Violet radial glow background (CSS only, no image).
- Headline: `"Your brand. Every platform. On autopilot."`
- Subtitle: `"Set up your brand in 3 minutes and watch AI write your first post."`
- Single CTA: `"Let's build your brand →"` (ShimmerButton)
- Bottom: `"Already have an account? Sign in"` link
- Animate in with Framer Motion: headline slides up, subtitle fades in 200ms later, button fades in 400ms later.

### Step 2 — Brand Identity
Fields:
- **Brand name** (required, max 50 chars, live char counter)
- **One-line description** (required, max 120 chars, e.g. "We make sustainable sneakers for urban runners")
- **Industry** — visual tile grid with icons, 12 options: Fashion, Food & Beverage, Tech & SaaS, Health & Wellness, Finance, Education, Real Estate, Beauty, Travel, Sports, Entertainment, Other. Single select. Tapping a tile selects it with a violet border + checkmark.
- Auto-generate brand avatar initials from brand name, shown live in sidebar preview panel on the right side of the screen.

### Step 3 — Brand Voice
- **Tone slider**: a single horizontal slider from 0–100, labeled "Casual" on the left and "Professional" on the right. Show the current value as a descriptor at the midpoint: Casual (0–25) / Conversational (26–50) / Balanced (51–74) / Professional (75–100).
- **Style chips**: multi-select pill chips — Bold, Minimal, Playful, Authoritative, Witty, Inspirational, Educational, Luxury. Up to 3 selectable.
- **Live caption preview**: below the controls, show a sample AI-generated caption that updates 800ms after the user stops adjusting. Call `POST /api/onboarding/preview-caption` with `{tone, styles, industry}`. Show a pulsing skeleton while loading. This is the first time the user sees the AI working.

### Step 4 — Target Audience
- **Age range**: dual-handle range slider, 18–65+. Show `"25–44"` etc. as a badge.
- **Gender mix**: 3 toggle pills — Mostly men / Mixed / Mostly women.
- **Location**: single text input with autocomplete (use a simple country/city list, no external API needed).
- **Interests**: tag input — type to add, max 5 tags. Show suggestions: Fitness, Luxury, Tech, Family, Career, Fashion, Food, Gaming, Travel, Sustainability.

### Step 5 — Platform Selection
- Exact same platform grid from `/generate` — Instagram, LinkedIn, Twitter/X, Facebook, TikTok, YouTube, Pinterest, Threads.
- Multi-select. Each platform card shows: platform icon + name + when selected, show a recommended posting frequency badge (`"4–5×/week"`).
- At least 1 platform required to continue.

### Step 6 — Goals
- 4 large visual cards in a 2×2 grid:
  - 🚀 **Growth** — "Grow your follower count and reach new audiences"
  - 💰 **Revenue** — "Drive sales, leads, and direct conversions"
  - 💬 **Engagement** — "Build community and deepen relationships"
  - 📣 **Awareness** — "Get your brand seen by as many people as possible"
- Multi-select, max 2. Selected cards get a violet border + checkmark badge.

### Step 7 — Your First Post (Aha Moment)
This is the most important screen. Do not rush it.

- Heading: `"Here's your first AI-generated post"`
- Subtitle: `"Based on your brand DNA. Ready to publish."` 
- Call `POST /api/generate` immediately when this step mounts, using the brand DNA just collected. Show a loading state: animated violet pulse ring + `"AI is writing your first post..."` text for 2–4 seconds.
- Display the generated post in a **phone mockup frame** (CSS-only, no image). Show the platform icon, the generated caption, and a placeholder image area.
- Three action buttons:
  - `"Save to Calendar"` (ShimmerButton) → saves post to DB, redirects to `/dashboard`
  - `"Regenerate"` (outlined button) → calls the API again, animates swap
  - `"Skip for now →"` (ghost link) → goes to `/dashboard` without saving
- Completing this step = onboarding done. Set `user.onboardingComplete = true` in DB.

---

## 3. Dashboard (`/dashboard`) — Real Data

Replace every hardcoded value with real data from the API.

### 3.1 Stat Cards
All 4 stat cards must show real data:

- **Active Brands** → `GET /api/brands/count` — count of brands owned by current user (starts at 1)
- **Posts Generated** → `GET /api/posts/stats` — total posts generated, ever
- **Avg Engagement Lift** → Show `"—"` with tooltip `"Available after 30 days of data"` until there's enough data. Never fake a percentage.
- **Trial Days Left** → Calculate from `user.trialStartedAt + 14 days - now`. Show pulsing orange dot when < 3 days. When trial expires, show `"Trial ended"` with a "Upgrade" CTA instead.

NumberTicker animation must only run once per mount, not on every re-render.

### 3.2 "This Week" Strip
Pull real scheduled posts from `GET /api/posts/scheduled?week=current`. Each day cell shows real platform dots (color-coded). Today is always highlighted. Clicking a day with posts opens a mini popover listing those posts.

### 3.3 Recent Outputs
Pull from `GET /api/posts/recent?limit=6`. Each card shows:
- Platform color label + icon
- Truncated caption (2 lines, `line-clamp-2`)
- Scheduled date or "Draft"
- Thumbnail (if image was generated) or platform-colored gradient placeholder
- Hover overlay: Edit / Schedule / Download icons

Empty state (no posts yet): DotPattern background + orbiting sparkle icon + `"Generate your first post →"` CTA. This already exists visually — wire it to the real data check.

### 3.4 Brand DNA Card
Pull from `GET /api/brands/current`. Show real values from onboarding. "Edit →" links to `/settings#brand-identity`. If onboarding was skipped, show `"Complete setup →"` instead.

### 3.5 Credits Card
- Pull from `GET /api/credits/balance`
- Animated progress bar (Framer Motion `animate={{ width: percentage }}`)
- `"~X posts remaining"` calculated as `Math.floor(balance / 2)` (each post costs 2 credits)
- `"Buy More Credits →"` opens a modal (build this modal — see Section 8)

### 3.6 Welcome Banner
- `"Good morning/afternoon/evening"` based on local time — this already works
- Replace `"Creator"` with the actual user's `displayName` from Firebase Auth
- `"3 posts scheduled today"` → real count from DB
- `"247 credits available"` → real credits balance

---

## 4. Generate Page (`/generate`) — Full AI Pipeline

This is the core feature. The entire generate flow must work end-to-end.

### 4.1 Form State
Use Zustand `generationStore`. Persist form state to `sessionStorage` so a page refresh doesn't clear the form.

All form fields:
- Content type: Post / Carousel / Reel / Story (tab selector)
- Target platform: single-select from the platform grid (pre-selected from user's onboarding platforms)
- Brief: textarea, 200 char limit, live counter that turns orange at 180, red at 200
- Quick prompts: `Product Launch`, `Behind the Scenes`, `Tip / Hack` — clicking appends a starter text to the textarea
- Style Override accordion (collapsed by default): Mood chips + Font style + Text overlay toggle
- Reference image: react-dropzone, accept jpg/png/webp, max 5MB, show preview thumbnail after upload

### 4.2 Generate Action
On `"Generate Content"` click:
1. Validate: platform selected + brief not empty. Show inline field errors if not.
2. Deduct 2 credits optimistically from the UI. Revert if API fails.
3. Call `POST /api/generate` with full form state + brand DNA (fetched from Zustand/DB).
4. Show skeleton cards in the right panel while generating (2 skeleton cards, pulsing).
5. On success: display output cards with `BlurFade` animation. Save result to DB (`posts` table, status `draft`).
6. On failure: show a toast error + `"Try again"` button. Restore credits.

### 4.3 Output Cards
Each generated output card shows:
- Platform color pill + content type badge
- Generated caption (full text, not truncated)
- Generated image (if applicable) or a styled gradient placeholder
- Action row: `Save` (heart icon) / `Schedule` (calendar icon) / `Regenerate this one` (refresh icon) / `Download` (download icon) / `Copy` (clipboard icon)
- Feedback row: thumbs up / thumbs down (calls `POST /api/feedback` with rating)

**Schedule action** → opens an inline date/time picker (use `react-day-picker`). On confirm, saves to `posts` table with `status: scheduled` and `scheduledAt` timestamp.

**Download action** → for captions, downloads as `.txt`. For images, downloads the image file.

**Copy action** → copies caption to clipboard, shows `"Copied!"` tooltip for 2 seconds.

### 4.4 Credit Guard
If user has < 2 credits:
- Disable the Generate button
- Show a banner above the form: `"You're out of credits. Buy more to keep generating."`
- CTA button opens the Credits modal (Section 8)

---

## 5. Calendar Page (`/calendar`) — Full CRUD

### 5.1 Calendar Grid
- Replace all hardcoded posts (Behind the Scenes, Product Launch, etc.) with real data from `GET /api/posts/scheduled?month=YYYY-MM`
- Navigate months with `<` `>` arrows — each navigation fetches the new month's data
- Today cell always highlighted in violet
- Each post pill shows: platform color + truncated title + `✦` prefix for AI-generated posts
- Cells with no posts show a `+` button on hover to quick-create

### 5.2 Post Drawer
Clicking any post pill opens the slide-in drawer (this already exists visually). Wire it up:
- Show real post data: platform, caption, scheduled time, status badge (Draft / Scheduled / Published)
- **Caption editor**: `contenteditable` div or textarea — edits auto-save after 1s debounce (`PUT /api/posts/:id`)
- **Reschedule**: date/time picker to change `scheduledAt`
- **Publish now**: `POST /api/posts/:id/publish` → sets status to Published, shows success toast
- **Delete**: confirmation dialog → `DELETE /api/posts/:id` → removes post from calendar with animation

### 5.3 Schedule Post Modal
`"Schedule Post"` button (top right) opens a modal:
- Same platform picker as /generate
- Brief textarea
- Date/time picker (defaults to tomorrow 10am)
- `"Generate & Schedule"` → calls `/api/generate` then saves with `scheduledAt`
- `"Schedule existing"` tab → lets user pick from their draft posts

### 5.4 Drag to Reschedule
Posts on the calendar must be draggable to other date cells. Use `@dnd-kit/core`. On drop:
- Optimistically move the pill to the new date
- Call `PUT /api/posts/:id` with new `scheduledAt`
- On failure: snap back to original position with a toast error

---

## 6. Assets Page (`/assets`) — Full Library

### 6.1 Grid
Replace the empty state with real data from `GET /api/assets?filter=all&page=1&limit=24`.

Each asset card:
- Thumbnail (generated image or platform-colored gradient if text-only)
- Platform badge (top-left corner)
- Post type badge (top-right): AI / Uploaded
- On hover overlay: Download icon + Delete icon + `"View full"` expand icon
- Click → opens a full-screen lightbox with caption, metadata, actions

### 6.2 Filter Bar
The filter pills (All / Instagram / LinkedIn / Twitter / Carousel / Story) must actually filter. Use URL query params (`?platform=instagram`) so filters are shareable and survive refresh. Each filter calls `GET /api/assets?platform=instagram`.

### 6.3 Search
Search input calls `GET /api/assets?q=sneaker` with 300ms debounce. Highlight matching text in results.

### 6.4 Upload
`"Upload"` button opens a file picker. Accept: jpg, png, webp, mp4 (video preview). Upload to your storage (Firebase Storage or S3 — use whatever is already configured). Show upload progress bar. On complete, add to `assets` table and insert card at top of grid with a BlurFade animation.

### 6.5 Pagination / Infinite Scroll
Implement infinite scroll: when the user scrolls within 200px of the bottom of the grid, fetch the next page. Show a loading spinner at the bottom during fetch. When no more pages, show `"You've seen all your assets"`.

### 6.6 Empty State
Keep the existing DotPattern + icon empty state. Wire the `"Generate First Post"` CTA to navigate to `/generate`. Wire the `"Upload Assets"` CTA to trigger the file picker.

---

## 7. Settings Page (`/settings`) — Real Persistence

### 7.1 Profile Tab
- Populate all fields from Firebase Auth + DB: `displayName`, `email`, `website`
- **Avatar**: clicking `"Change photo"` opens file picker. Upload to Firebase Storage. Update `photoURL` via `updateProfile(user, { photoURL })`. Show upload progress.
- **Full Name**: `updateProfile(user, { displayName: value })` + `PUT /api/users/me`
- **Email**: use `updateEmail(user, newEmail)` — requires re-authentication. Show a re-auth modal (enter current password) before calling.
- **Website**: saved to DB only, not Firebase
- `"Save Changes"` shows a checkmark animation for 2 seconds on success, error toast on failure
- Unsaved changes: show a `"You have unsaved changes"` sticky banner at the bottom

### 7.2 Brand Identity Tab
This is where users can update everything from onboarding:
- Brand name, description, industry tile grid
- Tone slider + style chips
- Target audience (age, gender, interests)
- Active platforms (same grid as onboarding)
- Goals (same card grid as onboarding)
- All changes call `PUT /api/brands/:id`
- Saving re-generates the Brand DNA card on dashboard

### 7.3 Billing Tab
Show real subscription data from DB:
- Current plan: Free / Pro / Agency (with feature list)
- Current credits: progress bar (same as dashboard)
- Plan upgrade cards: show Free / Pro ($29/mo) / Agency ($99/mo) with feature comparison
- `"Upgrade"` button opens Stripe checkout (see Section 8)
- `"Cancel subscription"` → confirmation dialog → calls `POST /api/billing/cancel`
- Invoice history table: date, amount, plan, `"Download PDF"` link (Stripe customer portal)

### 7.4 Notifications Tab
Toggle switches for:
- Email: Post scheduled reminder / Credit low warning (< 50 credits) / Weekly digest / Product updates
- In-app: All of the above
- Persist to `user_preferences` table via `PUT /api/users/me/preferences`

### 7.5 Security Tab
- **Change password**: current password + new password + confirm. Call Firebase `updatePassword` after re-auth.
- **Active sessions**: list of recent sign-ins (timestamp, device/browser, location). Source from `user_sessions` table. `"Sign out everywhere"` button calls `revokeRefreshTokens` via Firebase Admin.
- **Delete account**: two-step: enter `"DELETE"` to confirm → call `DELETE /api/users/me` (soft delete in DB, Firebase `deleteUser`).

---

## 8. Global Modals & Shared Components

### 8.1 Credits Purchase Modal
Triggered from dashboard credits card, generate page banner, topbar credit count.

Layout:
- 3 credit pack options: 100 credits ($5) / 500 credits ($19) / 1500 credits ($45) — displayed as cards, middle option highlighted as `"Most popular"`
- Selected pack gets violet border
- `"Buy Now"` → Stripe Checkout session (`POST /api/billing/create-checkout`)
- After payment success (`/payment-success?session_id=xxx`): `GET /api/billing/verify-session` → update credits in DB → show success toast → close modal

### 8.2 "New Post" Quick Modal
The topbar `"New Post"` ShimmerButton opens a slide-over panel (not a full page nav):
- Same form as `/generate` but compact
- `"Open in full generator →"` link at the bottom

### 8.3 Toast System
Use `sonner` (already installed). All toasts must:
- Success: green dot + message + optional action
- Error: red dot + message + `"Retry"` action
- Info: blue dot + message
- Duration: 4s for success/info, 8s for errors (so users can read them)
- Position: bottom-right on desktop, bottom-center on mobile

### 8.4 Command Palette
Implement a `Cmd+K` (Mac) / `Ctrl+K` (Windows) command palette using `cmdk` library:
- Navigation: `"Go to Dashboard"`, `"Go to Calendar"`, etc.
- Actions: `"Generate new post"`, `"Schedule post"`, `"Buy credits"`
- Search posts: fuzzy search through the user's post history
- Press `Escape` to close

---

## 9. Backend API — Express Routes

All routes require the Firebase ID token in `Authorization: Bearer <token>` header. Middleware `verifyFirebaseToken` decodes and attaches `req.user`.

### Database Schema (PostgreSQL)
Run these migrations in order:

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firebase_uid TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  display_name TEXT,
  photo_url TEXT,
  website TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'agency')),
  credits INTEGER DEFAULT 500,
  trial_started_at TIMESTAMPTZ DEFAULT NOW(),
  onboarding_complete BOOLEAN DEFAULT FALSE,
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Brands
CREATE TABLE brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  industry TEXT,
  tone INTEGER DEFAULT 50,
  styles TEXT[] DEFAULT '{}',
  audience_age_min INTEGER DEFAULT 18,
  audience_age_max INTEGER DEFAULT 65,
  audience_gender TEXT DEFAULT 'mixed',
  audience_location TEXT,
  audience_interests TEXT[] DEFAULT '{}',
  platforms TEXT[] DEFAULT '{}',
  goals TEXT[] DEFAULT '{}',
  is_default BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Posts
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  content_type TEXT DEFAULT 'post',
  caption TEXT,
  image_url TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published', 'failed')),
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  is_ai_generated BOOLEAN DEFAULT TRUE,
  generation_prompt TEXT,
  feedback INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assets
CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE SET NULL,
  type TEXT CHECK (type IN ('image', 'video', 'text')),
  url TEXT NOT NULL,
  platform TEXT,
  file_size INTEGER,
  mime_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Credit Transactions
CREATE TABLE credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type TEXT CHECK (type IN ('purchase', 'usage', 'bonus', 'refund')),
  description TEXT,
  stripe_payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Preferences
CREATE TABLE user_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  email_post_reminder BOOLEAN DEFAULT TRUE,
  email_credit_warning BOOLEAN DEFAULT TRUE,
  email_weekly_digest BOOLEAN DEFAULT TRUE,
  email_product_updates BOOLEAN DEFAULT FALSE,
  inapp_post_reminder BOOLEAN DEFAULT TRUE,
  inapp_credit_warning BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Required API Routes

```
# Auth & Users
POST   /api/auth/session          — Exchange Firebase token for session cookie
DELETE /api/auth/session          — Sign out (clear cookie)
GET    /api/users/me              — Get current user profile
PUT    /api/users/me              — Update profile (website, displayName)
PUT    /api/users/me/preferences  — Update notification preferences
DELETE /api/users/me              — Delete account (soft delete)

# Onboarding
POST   /api/onboarding/complete        — Save all onboarding data, create brand
POST   /api/onboarding/preview-caption — Generate a sample caption for step 3 live preview

# Brands
GET    /api/brands/current        — Get user's default brand
GET    /api/brands/count          — Count of user's brands
PUT    /api/brands/:id            — Update brand settings
POST   /api/brands                — Create new brand

# Posts / Generation
POST   /api/generate              — Generate AI content (uses OpenAI or Anthropic)
GET    /api/posts/recent          — Recent posts, limit param
GET    /api/posts/scheduled       — Posts by week or month
GET    /api/posts/stats           — Total count of generated posts
PUT    /api/posts/:id             — Update post (caption, scheduledAt, status)
POST   /api/posts/:id/publish     — Mark as published
DELETE /api/posts/:id             — Delete post
POST   /api/feedback              — Submit thumbs up/down on a generation

# Assets
GET    /api/assets                — List assets (with filter, search, pagination)
POST   /api/assets/upload-url     — Get presigned S3/Firebase URL for upload
POST   /api/assets                — Save asset record after upload
DELETE /api/assets/:id            — Delete asset

# Credits
GET    /api/credits/balance       — Get current credit balance
POST   /api/billing/create-checkout    — Create Stripe checkout session
POST   /api/billing/verify-session     — Verify payment and top up credits
POST   /api/billing/cancel             — Cancel subscription
POST   /api/webhooks/stripe            — Stripe webhook (no auth, uses webhook secret)
```

### AI Generation Route (`POST /api/generate`)
This is the most critical route. Implement it with care:

```typescript
// Pseudocode — implement fully
async function generateContent(req, res) {
  const { platform, contentType, brief, tone, styles, mood, referenceImageUrl } = req.body;
  const brand = await getBrandForUser(req.user.uid);
  
  // Check credits
  if (brand.user.credits < 2) {
    return res.status(402).json({ error: 'insufficient_credits' });
  }

  // Build system prompt from brand DNA
  const systemPrompt = buildBrandSystemPrompt(brand); 
  // This should include: brand name, description, industry, tone level,
  // style preferences, audience demographics, active platforms, goals

  // Build user prompt
  const userPrompt = buildGenerationPrompt({ platform, contentType, brief, mood });

  // Call AI (Anthropic claude-sonnet-4-20250514 or OpenAI gpt-4o)
  const result = await callAI(systemPrompt, userPrompt);
  
  // Parse result — AI should return JSON: { caption, hashtags, imagePrompt }
  const parsed = parseAIResponse(result);

  // If image generation enabled: call DALL-E 3 or Replicate with imagePrompt
  // const imageUrl = await generateImage(parsed.imagePrompt);

  // Deduct credits
  await deductCredits(req.user.uid, 2, `Generated ${contentType} for ${platform}`);

  // Save to posts table
  const post = await savePost({ ...parsed, userId, brandId, platform, contentType, status: 'draft' });

  return res.json({ post, creditsRemaining: user.credits - 2 });
}
```

**System prompt template for brand DNA:**
```
You are a social media content expert for {{brandName}}, a {{industry}} brand.

Brand voice: {{toneDescriptor}} ({{tone}}/100 on casual-to-professional scale)
Style: {{styles.join(', ')}}
Target audience: {{ageMin}}–{{ageMax}} year olds, {{gender}}, interested in {{interests.join(', ')}}
Goals: {{goals.join(', ')}}

Generate content that is authentic to this brand, uses natural language for the platform,
includes relevant hashtags (5–10), and has a clear call-to-action.

Always respond in valid JSON: { "caption": "...", "hashtags": ["...", "..."], "imagePrompt": "..." }
```

### BullMQ Queue (Redis) — Scheduled Post Publishing
Set up a BullMQ worker (`workers/post-publisher.ts`) that:
1. Every 1 minute, queries posts where `status = 'scheduled' AND scheduled_at <= NOW()`
2. For each post, creates a BullMQ job
3. Worker processes job: marks post as `published`, logs to `post_publish_log`
4. (Phase 2: actually call platform APIs — for now, just mark as published and notify user via in-app notification)

---

## 10. Real-Time & Notifications

### 10.1 In-App Notification Bell
The bell icon in the topbar (already rendered) must work:
- `GET /api/notifications` → list of unread notifications
- Red dot shows count (cap at `9+`)
- Clicking bell opens a dropdown: list of notifications with timestamp and action links
- `"Mark all as read"` button → `PUT /api/notifications/read-all`

Notification types to implement:
- Post published: `"Your Instagram post 'Product Launch' was published"`
- Low credits: `"You have 50 credits left. Buy more to keep generating."`
- Onboarding incomplete: `"Complete your brand setup to unlock all features"`

### 10.2 Credit Balance in Topbar (Mobile)
On mobile (< 768px), show credits balance in the bottom tab bar's Generate tab as a small badge.

---

## 11. Performance & Quality

### 11.1 Data Fetching
- Use SWR or React Query for all client-side data fetching
- Set `revalidateOnFocus: false` for infrequently-changing data (brand DNA, user profile)
- Cache dashboard stats for 60 seconds
- Cache assets list for 30 seconds with optimistic updates on delete/add

### 11.2 Images
- All user-generated images must use `next/image` with proper `width`, `height`, and `priority` on above-fold images
- Blur placeholder on all images: use `placeholder="blur"` with a tiny base64 placeholder
- Lazy load all asset grid images

### 11.3 Route Prefetching
- Prefetch `/generate` and `/calendar` on dashboard mount
- Use `router.prefetch()` for the 3 most likely next routes

### 11.4 Bundle Size
- Dynamic import the command palette: `const CommandPalette = dynamic(() => import('@/components/command-palette'))`
- Dynamic import all modals
- Dynamic import the calendar grid component

---

## 12. Error Boundaries & Edge Cases

Wrap every page in an error boundary (`components/error-boundary.tsx`):
```tsx
// Shows: "Something went wrong" + error message (dev only) + "Reload page" button
```

Handle these specific edge cases explicitly:
- **User deletes their brand** → redirect to `/onboarding` to create a new one
- **Credits hit 0 mid-generation** → generation fails gracefully, credits not deducted, explain why
- **Session expires while user is on a page** → show a non-blocking banner `"Your session expired. Sign in again."` with a button, not a hard redirect
- **API returns 500** → show toast with request ID for support: `"Error: something went wrong (ref: abc123)"`
- **Network offline** → detect via `navigator.onLine` + `offline` event, show a sticky `"You're offline"` banner, disable all write actions, queue reads for retry
- **Onboarding incomplete** → show a dismissable banner on dashboard: `"Finish setting up your brand for better AI results →"`

---

## 13. Testing

### 13.1 Unit Tests (Vitest)
Write unit tests for:
- `buildBrandSystemPrompt(brand)` — test with various brand configs
- `parseAIResponse(rawText)` — test valid JSON, malformed JSON, empty response
- `calculateTrialDaysLeft(startDate)` — boundary cases: day 0, day 14, day 15
- `deductCredits(userId, amount)` — test insufficient credits throws correctly
- Credit balance calculation utils

### 13.2 Integration Tests (Vitest + Supertest)
Test API routes:
- `POST /api/generate` — mock AI call, verify credits deducted, post saved
- `POST /api/onboarding/complete` — verify brand created, user updated
- `DELETE /api/posts/:id` — verify only owner can delete
- `PUT /api/brands/:id` — verify only owner can update

### 13.3 E2E Tests (Playwright)
Write 5 critical path tests:
1. **Full onboarding**: sign up → complete all 7 steps → see first generated post → land on dashboard with real data
2. **Generate flow**: fill form → click generate → see output cards → save to calendar → verify on calendar page
3. **Calendar CRUD**: create post → drag to new date → edit caption → delete → verify gone
4. **Settings persistence**: update brand name → refresh page → verify name persisted
5. **Credits flow**: deplete credits to 0 → try to generate → see error → buy credits modal → (mock payment) → generate again

Place all tests in `__tests__/` with clear filenames matching what they test.

---

## 14. Environment Variables

Ensure `.env.local` has all of these. Add `.env.example` with placeholder values for every variable:

```bash
# Firebase (Frontend)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin (Backend)
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=

# Database
DATABASE_URL=postgresql://...

# Redis
REDIS_URL=redis://...

# AI
ANTHROPIC_API_KEY=          # preferred — use claude-sonnet-4-20250514
OPENAI_API_KEY=             # fallback for image generation (DALL-E 3)

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Storage
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=   # or AWS_S3_BUCKET
AWS_ACCESS_KEY_ID=                     # if using S3
AWS_SECRET_ACCESS_KEY=
AWS_S3_REGION=

# App
NEXT_PUBLIC_APP_URL=https://future-gilt-psi.vercel.app
```

---

## 15. Deployment Checklist

Before marking this complete, verify every item:

**Auth**
- [ ] Sign up creates user in Firebase + PostgreSQL
- [ ] Sign in works with email/password and Google OAuth
- [ ] Password reset email is sent
- [ ] All pages redirect to `/auth` when unauthenticated
- [ ] Session cookie is httpOnly, SameSite=Strict

**Onboarding**
- [ ] All 7 steps save data correctly
- [ ] Live caption preview works (step 3)
- [ ] First post generates and displays (step 7)
- [ ] Onboarding state persists on page refresh
- [ ] Skipping works on every step

**Dashboard**
- [ ] All 4 stat cards show real data (no hardcoded numbers)
- [ ] This Week shows real scheduled posts
- [ ] Recent Outputs shows real posts
- [ ] Brand DNA shows real onboarding data
- [ ] Credits bar shows real balance

**Generate**
- [ ] Form validates before submit
- [ ] Credits deducted on generation
- [ ] Output appears with real AI content
- [ ] Save / Schedule / Download / Copy all work
- [ ] Feedback (thumbs) saves to DB

**Calendar**
- [ ] All posts come from DB
- [ ] Month navigation fetches new data
- [ ] Drawer shows real post, edits persist
- [ ] Drag to reschedule works
- [ ] Delete with confirmation works

**Assets**
- [ ] Grid loads real assets
- [ ] Filters work via URL params
- [ ] Search works with debounce
- [ ] Upload works with progress
- [ ] Infinite scroll loads more

**Settings**
- [ ] All profile changes persist
- [ ] Brand identity updates Brand DNA on dashboard
- [ ] Notification toggles save
- [ ] Password change works
- [ ] Account deletion works

**Global**
- [ ] Command palette opens with Cmd+K / Ctrl+K
- [ ] Notification bell shows real notifications
- [ ] Credit purchase modal works
- [ ] All toasts show for success/error states
- [ ] Offline banner appears when network drops
- [ ] Error boundaries catch crashes gracefully
- [ ] All pages are mobile-responsive
- [ ] TypeScript compiles with zero errors
- [ ] All Playwright E2E tests pass

---

## Priority Order

If you need to implement this incrementally, follow this order:

1. **Auth** (nothing works without it)
2. **DB schema + migrations** (all data flows through this)
3. **Onboarding** (first thing new users see; populates Brand DNA)
4. **Generate page + AI route** (core value proposition)
5. **Dashboard real data** (makes the app feel alive)
6. **Calendar CRUD** (closes the generate → schedule → publish loop)
7. **Assets page** (library of all work done)
8. **Settings persistence** (trust builder)
9. **Credits + Billing** (monetization)
10. **Notifications + Command palette** (polish)
11. **Tests** (confidence)
12. **Performance + Error boundaries** (production readiness)

---

*This prompt was generated for Brandvertise AI based on full audit of the live app at `future-gilt-psi.vercel.app` and the project build summary. All page structures, component names, and Zustand store names match the existing codebase.*
