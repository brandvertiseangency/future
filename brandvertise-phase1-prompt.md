# Brandvertise AI — Phase 1 Full Build Prompt
### Brand Onboarding → Dashboard + Calendar → AI Creative Generation

---

## ⚠️ CRITICAL CONTEXT — READ BEFORE WRITING ANY CODE

**Stack:** Next.js 15, TypeScript, Tailwind CSS, Framer Motion, shadcn/ui  
**Backend:** Express on port 4000 — routes for auth, brand, post, calendar, asset, payment, schedule  
**DB:** Neon PostgreSQL — tables: users, brands, posts, calendar_events, assets, credit_transactions, payments, job_queue  
**Storage:** Google Cloud Storage — bucket: design-brandvertiseagency  
**AI:** Google Vertex AI (asia-south1) + OpenAI  
**Auth:** Firebase Admin SDK  

**SikandarJODD/animations is Svelte 5 — it cannot be used in Next.js.**  
Use these React equivalents instead (they are the direct inspiration source):

### Install These Now — All Required
```bash
# Core animation + UI
npm install framer-motion
npm install magic-ui           # NOT a real package — see below
npm install @tabler/icons-react
npm install clsx tailwind-merge
npm install react-dropzone
npm install sonner             # toast notifications
npm install zustand            # lightweight state
npm install @radix-ui/react-progress
npm install @radix-ui/react-tabs
npm install @radix-ui/react-dialog
npm install @radix-ui/react-tooltip
npm install @radix-ui/react-select
npm install @radix-ui/react-slider
npm install date-fns
npm install react-day-picker

# shadcn/ui (run these CLI commands)
npx shadcn@latest add button input label textarea card badge
npx shadcn@latest add dialog sheet tabs progress skeleton
npx shadcn@latest add tooltip select avatar separator
npx shadcn@latest add calendar popover
```

### Magic UI Components — Install via CLI (React/Next.js native)
```bash
# These are the React equivalents of SikandarJODD's Svelte components
npx magicui-cli@latest add animated-beam
npx magicui-cli@latest add animated-shiny-text
npx magicui-cli@latest add border-beam
npx magicui-cli@latest add shimmer-button
npx magicui-cli@latest add number-ticker
npx magicui-cli@latest add blur-fade
npx magicui-cli@latest add animated-gradient-text
npx magicui-cli@latest add marquee
npx magicui-cli@latest add orbiting-circles
npx magicui-cli@latest add dot-pattern
npx magicui-cli@latest add grid-pattern
npx magicui-cli@latest add morphing-text
npx magicui-cli@latest add text-animate
npx magicui-cli@latest add ripple
npx magicui-cli@latest add pulsating-button
npx magicui-cli@latest add neon-gradient-card
```
> If magicui-cli is not available: `npm install @magicui/react` and copy components from https://magicui.design/docs

---

## Global Design System — Apple-Style Dark

### Colors
```css
/* globals.css */
:root {
  --bg-base: #000000;
  --bg-raised: #0a0a0a;
  --bg-overlay: #111111;
  --bg-subtle: #1a1a1a;
  --bg-muted: #222222;

  --border-default: rgba(255,255,255,0.08);
  --border-subtle:  rgba(255,255,255,0.05);
  --border-strong:  rgba(255,255,255,0.15);
  --border-accent:  rgba(139,92,246,0.3);

  --text-primary:   #FFFFFF;
  --text-secondary: rgba(255,255,255,0.6);
  --text-tertiary:  rgba(255,255,255,0.35);
  --text-accent:    #a78bfa;

  --accent-violet:  #8b5cf6;
  --accent-blue:    #3b82f6;
  --accent-emerald: #10b981;
  --accent-amber:   #f59e0b;
  --accent-rose:    #f43f5e;

  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-2xl: 32px;
}
```

### Typography
```css
/* Inter for UI, Playfair Display italic for accent words */
body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-feature-settings: 'cv11', 'ss01';
  -webkit-font-smoothing: antialiased;
}

.font-display {
  font-family: var(--font-playfair);
  font-style: italic;
  font-weight: 700;
}

/* Text scale */
.text-hero   { font-size: clamp(32px, 4vw, 56px); font-weight: 700; letter-spacing: -0.03em; line-height: 1.05; }
.text-title  { font-size: clamp(20px, 2vw, 28px); font-weight: 600; letter-spacing: -0.02em; }
.text-body   { font-size: 14px; line-height: 1.6; color: var(--text-secondary); }
.text-label  { font-size: 11px; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; }
```

### Utility Classes
```css
/* Glassmorphism card */
.glass {
  background: rgba(255,255,255,0.03);
  backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid var(--border-default);
}

/* Gradient border card */
.card-gradient-border {
  position: relative;
  background: var(--bg-overlay);
  border-radius: var(--radius-lg);
}
.card-gradient-border::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: var(--radius-lg);
  padding: 1px;
  background: linear-gradient(135deg,
    rgba(139,92,246,0.5),
    rgba(59,130,246,0.3),
    rgba(16,185,129,0.2));
  -webkit-mask: linear-gradient(#fff 0 0) content-box,
                linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}

/* Apple-style subtle surface */
.surface {
  background: var(--bg-raised);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
}

/* Ambient glow */
.glow-violet { box-shadow: 0 0 80px rgba(139,92,246,0.12), 0 0 160px rgba(139,92,246,0.06); }
.glow-blue   { box-shadow: 0 0 80px rgba(59,130,246,0.10); }
.glow-emerald{ box-shadow: 0 0 80px rgba(16,185,129,0.08); }

/* Scroll fade-up */
.fade-up {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.7s cubic-bezier(0.16,1,0.3,1),
              transform 0.7s cubic-bezier(0.16,1,0.3,1);
}
.fade-up.visible { opacity: 1; transform: none; }
```

---

## App Architecture — File Structure

Create this structure inside `frontend/app/(app)/`:

```
app/
├── (app)/
│   ├── layout.tsx              ← App shell: sidebar + topbar
│   ├── dashboard/
│   │   └── page.tsx            ← PHASE 1B: Dashboard home
│   ├── onboarding/
│   │   └── page.tsx            ← PHASE 1A: Brand onboarding flow
│   ├── calendar/
│   │   └── page.tsx            ← PHASE 1B: Content calendar
│   ├── generate/
│   │   └── page.tsx            ← PHASE 1C: AI creative generation
│   ├── assets/
│   │   └── page.tsx            ← Output grid / asset library
│   └── settings/
│       └── page.tsx            ← Brand settings
components/
├── app/
│   ├── sidebar.tsx
│   ├── topbar.tsx
│   ├── brand-avatar.tsx
│   └── credit-badge.tsx
├── onboarding/
│   ├── step-indicator.tsx
│   ├── step-brand-identity.tsx
│   ├── step-audience.tsx
│   ├── step-goals.tsx
│   ├── step-design-prefs.tsx
│   ├── step-uploads.tsx
│   └── step-review.tsx
├── dashboard/
│   ├── stats-strip.tsx
│   ├── quick-actions.tsx
│   ├── recent-content.tsx
│   └── upcoming-posts.tsx
├── calendar/
│   ├── calendar-grid.tsx
│   ├── post-slot.tsx
│   └── post-drawer.tsx
├── generate/
│   ├── generation-form.tsx
│   ├── output-grid.tsx
│   ├── output-card.tsx
│   └── feedback-panel.tsx
└── ui/
    ├── step-pill.tsx
    ├── platform-badge.tsx
    ├── credit-meter.tsx
    └── empty-state.tsx
```

---

## PHASE 1A — Brand Onboarding Flow
### `/app/(app)/onboarding/page.tsx`

**Concept:** A beautiful 6-step wizard. Apple Keynote-like. Each step slides in from the right. Progress shown as a minimal dot indicator + step name at top. White space is aggressive. Every input feels premium.

### Overall Layout
```
┌─────────────────────────────────────────────────┐
│  ● ● ● ○ ○ ○   Step 2 of 6 — Target Audience   │  ← top bar
├─────────────────────────────────────────────────┤
│                                                 │
│         [Step content — centered, wide]         │
│                                                 │
├─────────────────────────────────────────────────┤
│  [← Back]                    [Continue →]       │  ← footer nav
└─────────────────────────────────────────────────┘
```

### Step Indicator Component
```tsx
// components/onboarding/step-indicator.tsx
// Horizontal row of 6 dots — active dot is accent violet, filled
// Completed dots are white/dim, future dots are white/10
// Step name text in Inter 13px, weight 500, text-white/60
// Uses framer-motion: active dot scales to 1.4x with spring
// Add BlurFade (Magic UI) on mount for the whole indicator
```

### Step 1 — Brand Identity
```
Visual layout:
┌──────────────────────────────────┐
│                                  │
│  Step label pill: "Brand Setup"  │
│                                  │
│  H2: "Tell us about your brand"  │
│  Subtext: "We'll use this to..   │
│                                  │
│  [Brand Name input]              │
│  [Brand website URL input]       │
│  [Industry dropdown — shadcn Select] │
│  [Brand voice — 4 option cards:  │
│    Professional | Playful |      │
│    Bold | Luxurious ]            │
│                                  │
└──────────────────────────────────┘
```

**Brand voice cards:** 4 cards in a 2×2 grid. Each card:
- 40×40 emoji or icon
- Label + 1 line description
- On select: `border-violet-500/50 bg-violet-500/8` + checkmark top-right
- Hover: `border-white/20 bg-white/[0.03]`
- Use `motion.div` with `whileHover={{ scale: 1.02 }}` and `whileTap={{ scale: 0.98 }}`
- Transition: spring, stiffness 400, damping 25

**Inputs:** All inputs use custom styled version — NOT default browser:
```tsx
// Base input class:
"w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3
 text-white placeholder:text-white/25 text-sm
 focus:outline-none focus:border-violet-500/50 focus:bg-white/[0.05]
 transition-all duration-200"
```

### Step 2 — Target Audience
```
H2: "Who are you trying to reach?"

[Age range — shadcn Slider, dual handle, violet accent track]

Gender targeting:
  [ All ] [ Male ] [ Female ] — pill toggle buttons

[Location input with tag chips — type and press Enter to add]
  Tags: small pills "bg-violet-500/10 border-violet-500/20 text-violet-300"
  × to remove each tag

[Interests — multi-select grid of 12 interest chips]
  Options: Fashion, Tech, Food, Travel, Fitness, Beauty,
           Business, Finance, Gaming, Education, Lifestyle, Other
  Selected state: violet filled pill
  Unselected: white/5 border white/10
```

### Step 3 — Goals & KPIs
```
H2: "What do you want to achieve?"

3 large goal cards (full width, stacked):
  ┌─────────────────────────────────────────┐
  │ 🔥  Viral Growth & Brand Awareness      │
  │      Maximise reach and impressions     │
  └─────────────────────────────────────────┘
  ┌─────────────────────────────────────────┐
  │ 💬  Community & Engagement              │
  │      Build loyal followers and trust    │
  └─────────────────────────────────────────┘
  ┌─────────────────────────────────────────┐
  │ 💰  Leads & Revenue                     │
  │      Drive traffic and sales            │
  └─────────────────────────────────────────┘

Multi-select allowed. Selected = violet border + checkmark + bg tint.
Use BorderBeam (Magic UI) on the selected card — continuous animated border.

Posting frequency (below):
  Label: "How often do you want to post?"
  [ 3x/week ] [ Daily ] [ 2x/day ] — pill toggle
```

### Step 4 — Design Preferences
```
H2: "What's your visual style?"

4 style cards in 2×2 grid with IMAGE previews:
  Minimal — clean, white space, typography-led
  Luxury  — dark, gold, editorial
  Bold    — high contrast, vivid colors
  Playful — colorful, fun, dynamic

Each card: 
  - 120px tall image preview area (use gradient placeholders)
  - Style name + description below
  - Same selection state as Step 1 voice cards

Color palette preference:
  H3: "Pick your dominant colors"
  12 color swatches in a row (circle buttons, 36px each)
  User can select up to 3. Selected shows white ring + checkmark.
  Colors: pure black, white, violet, blue, emerald, amber,
          rose, orange, teal, gray, gold, custom

Custom color input: appears when "custom" clicked — native color picker
```

### Step 5 — Brand Asset Uploads
```
H2: "Upload your brand assets"

3 upload zones stacked:

Zone 1 — Logo
  react-dropzone with custom UI:
  ┌─────────────────────────────────────────────┐
  │                                             │
  │    [icon]  Drop your logo here              │
  │            SVG, PNG, or JPG — max 5MB       │
  │            [Browse files]                   │
  │                                             │
  └─────────────────────────────────────────────┘
  Border: 1px dashed rgba(255,255,255,0.12)
  Background: rgba(255,255,255,0.02)
  On drag-over: border-violet-500/40 bg-violet-500/5
  On upload: show thumbnail preview with filename + size + × to remove
  Animate file-in: BlurFade from Magic UI

Zone 2 — Product Images (multi-upload, up to 10)
  Same dropzone style
  After upload: show image grid (3 per row) with × on each

Zone 3 — Brand References (optional)
  Accept: images, PDFs
  Label: "Inspiration / mood board images"

All uploads POST to Express /api/assets with Firebase auth header
Store in GCS bucket: design-brandvertiseagency
Save URLs to assets table
```

### Step 6 — Review & Launch
```
H2: "Your brand is ready."
Subtext (Playfair italic highlight): "Let's build something <remarkable>."

Split layout:
Left: Brand DNA Summary card
  - Shows all inputs back in a clean card
  - Brand name, industry, voice, goals, audience
  - Small edit icon next to each section → jumps back to that step
  - Card style: card-gradient-border + glow-violet

Right: What happens next
  3 steps in a vertical timeline:
  ① Brand DNA generated
  ② Content strategy built
  ③ First posts ready in 60 seconds

  Use AnimatedBeam (Magic UI) connecting the 3 nodes

[Launch My Brand] button:
  Use ShimmerButton (Magic UI) — full width, large
  On click: 
    1. POST all brand data to /api/brand
    2. POST brand DNA generation job to /api/brand/generate-dna
    3. Show loading overlay with Ripple (Magic UI) + progress message
    4. On success: redirect to /dashboard
```

### Animations — Onboarding
```tsx
// Page-level: each step slides in from right
// Use framer-motion AnimatePresence + variants:
const variants = {
  enter: { x: 40, opacity: 0 },
  center: { x: 0, opacity: 1 },
  exit: { x: -40, opacity: 0 }
}
// transition: { type: 'spring', stiffness: 300, damping: 30 }

// Continue button: whileTap scale 0.97, whileHover slight lift
// Back button: simple fade opacity transition

// Step indicator: active dot grows with spring animation
// Input focus: border color + background transitions 200ms ease
```

---

## App Shell — Sidebar + Topbar
### `/app/(app)/layout.tsx`

**Sidebar — 220px wide, fixed left**
```
Logo area (top, 64px tall):
  brandvertise.ai — Inter bold 15px
  Dot: pulsating violet (PulsatingButton concept — just the dot)

Nav items (below logo):
  Dashboard        [icon: LayoutDashboard]
  Calendar         [icon: CalendarDays]
  Generate         [icon: Sparkles]
  Assets           [icon: Images]
  ─────────────────
  Settings         [icon: Settings2]

  Each nav item:
  - 40px tall, 12px horizontal padding
  - Active: bg-white/[0.06] text-white border-l-2 border-violet-500
  - Hover: bg-white/[0.03] text-white/80
  - Icon: 18px, same color as text
  - Transition: all 150ms ease

Brand selector (bottom of sidebar):
  Shows current brand avatar + name
  Click → dropdown to switch brands or add new
  Small "+" button to add brand — icon only

Credits remaining:
  Below brand selector
  "247 credits left" — text-white/40 text-xs
  Thin progress bar — violet fill
  [Buy Credits] text link — violet, 11px
```

**Topbar — 64px tall, right of sidebar**
```
Left: Page title — Inter 17px weight 600 text-white
      Breadcrumb: Dashboard > Calendar — text-white/40

Right:
  [Notifications bell icon] — badge if unread
  [User avatar — 32px circle, initials fallback]
  [New Post] button — ShimmerButton small variant
```

**Sidebar styling:**
```tsx
// bg-black border-r border-white/[0.06]
// No shadow — border only
// Topbar: bg-black/95 backdrop-blur-xl border-b border-white/[0.06]
```

---

## PHASE 1B — Dashboard + Content Calendar

### Dashboard Page — `/dashboard/page.tsx`

**Layout: Full page, no max-width restriction — use full canvas**

```
Section 1: Welcome strip (top, full width)
┌──────────────────────────────────────────────────────────────┐
│  Good morning, [Name]. ✦                                     │
│  Your brand is generating content. Here's today's overview. │
│                              [Generate Now →]                │
└──────────────────────────────────────────────────────────────┘
bg: card-gradient-border, padding 32px
"Good morning" — 22px weight 600
"[Name]" — font-display (Playfair italic) text-white
Sub text — text-white/50 14px

Section 2: Stats strip (4 cards, equal width)
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ 2,400+   │ │ 10M+     │ │ +47%     │ │ 14 days  │
│ Brands   │ │ Posts    │ │ Avg Lift │ │ Trial    │
└──────────┘ └──────────┘ └──────────┘ └──────────┘
Each card:
- surface class
- Number: NumberTicker (Magic UI) — animates from 0 on mount
- Label: text-white/40 text-xs uppercase tracking-wider
- Small trend indicator: ↑ +12% in emerald or ↓ in rose

Section 3: Two-column layout (left 60%, right 40%)

LEFT COL:
  A) "This Week" mini calendar
     7-day strip with day labels
     Each day shows a dot count for scheduled posts
     Today: violet circle highlight
     Click day → scroll calendar to that day

  B) Recent Outputs grid (2×3 thumbnails)
     6 most recent generated posts
     Each: rounded-xl, aspect-square, dark surface if no image
     Hover: scale 1.02 + border-white/20
     Bottom: platform badge + date
     [View All Assets →] link

RIGHT COL:
  A) Brand DNA card
     Shows: tone, style, audience, goals
     Small edit icon
     Color: card-gradient-border

  B) Quick Actions
     ┌──────────────────────────┐
     │ ✦ Generate New Content   │ ← ShimmerButton full width
     │ 📅 View Full Calendar    │ ← secondary outlined button
     │ 📊 Analytics             │ ← text link
     └──────────────────────────┘

  C) Credit usage
     Circular progress (use @radix-ui/react-progress styled as arc)
     "247 / 500 credits used"
     [Buy More Credits] link
```

### Calendar Page — `/calendar/page.tsx`

**Concept:** A full-page content planning grid. Feels like Notion Calendar meets Linear.

```
Top bar:
  Left: Month/Year selector ← March 2026 →
  Right: [+ Schedule Post] [Week | Month view toggle]

Calendar Grid (Month view):
  7 columns (Mon→Sun), header row with day names
  Each cell = one day
  
  Day cell anatomy:
  ┌───────────────────┐
  │ 15                │  ← date number (top-left, 13px)
  │                   │
  │ ●● Instagram      │  ← post slot pill
  │ ● LinkedIn        │
  │                   │
  │ [+ Add]           │  ← shows on hover only
  └───────────────────┘
  
  Today: subtle violet bg tint (bg-violet-500/8)
  Past days: opacity-50 on content
  
  Post slot pill:
  "bg-violet-500/15 border border-violet-500/25 text-violet-300 text-xs
   px-2 py-0.5 rounded-md truncate cursor-pointer"
  Platform color variants:
    Instagram: rose/pink palette
    LinkedIn:  blue palette
    Twitter/X: white/neutral
    Facebook:  blue palette
    TikTok:    emerald palette
  
  Hover on pill → show Tooltip (shadcn) with post preview:
    Thumbnail + caption preview + status badge

Post Drawer (slides in from right when post clicked):
  Use shadcn Sheet — 480px wide
  Contains:
  - Post thumbnail (full width, aspect-video)
  - Platform badges (multi-select if cross-posting)
  - Caption (editable textarea)
  - Schedule date/time picker
  - Status: Draft | Scheduled | Published | Failed
  - [Regenerate Visual] button
  - [Save Changes] button
  - [Delete] destructive text link

AI-generated post slots:
  Show as slightly different style — small "AI" badge top-right on pill
  
Animations:
  - Calendar grid: stagger fade-up on mount (BlurFade from Magic UI, staggerChildren 0.02s)
  - Post drawer: framer-motion slide from right (x: 480 → 0)
  - New post added: pill appears with scale spring (0.8 → 1)
  - Day hover: bg-white/[0.02] transition 150ms
```

---

## PHASE 1C — AI Creative Generation
### `/generate/page.tsx`

**This is the most important screen. It is the core product experience.**

### Layout: Two-panel split
```
┌─────────────────────────────┬──────────────────────────────┐
│                             │                              │
│   LEFT: Generation Form     │   RIGHT: Output Grid         │
│   (40% width, scrollable)   │   (60% width, scrollable)    │
│                             │                              │
└─────────────────────────────┴──────────────────────────────┘
```

### LEFT PANEL — Generation Form

```
Header:
  "Generate Content" — 20px weight 600
  Subtitle: "AI will use your brand DNA" — text-white/40 13px

Section 1 — What to create:
  Label: "Content Type"
  4 tab buttons (custom, not shadcn Tabs):
    [ Post ] [ Carousel ] [ Reel Script ] [ Story ]
  Active: bg-white/8 border-white/15 text-white
  Inactive: text-white/40 hover:text-white/60
  
Section 2 — Platform:
  Label: "Target Platform"
  Platform icon grid (3×3):
    Instagram | LinkedIn | Twitter/X
    Facebook  | TikTok   | YouTube
    Pinterest | Threads  | —
  Each: 48×48 card, platform logo icon (use SVG inline or @tabler/icons)
  Multi-select: violet ring + checkmark
  Single-select for Reel Script / Story

Section 3 — Content Brief:
  Label: "What is this post about?"
  Large textarea:
    placeholder: "e.g. Launching our new feature — show the team celebrating..."
    6 rows min, auto-resize
    Bottom of textarea: character count (200 max)
  
  Quick prompts (below textarea):
    3 pill chips: "Product Launch" "Behind the Scenes" "Tip / Hack"
    Click → appends to textarea
    style: bg-white/5 border-white/10 text-white/50 text-xs rounded-full px-3 py-1

Section 4 — Style Override (collapsible):
  Accordion toggle: "Style Override ↓"
  Inside:
    Mood: [ Energetic ] [ Calm ] [ Professional ] [ Playful ]
    Color emphasis: same swatch row from onboarding
    Text overlay: [ Yes ] [ No ]
    Font style: [ Minimal ] [ Bold ] [ Handwritten ]

Section 5 — Reference Images (optional):
  Mini dropzone (compact, 80px tall):
    "Drag reference image or [browse]"
  Shows thumbnail row if uploaded

[Generate] Button:
  Full width, 52px tall
  ShimmerButton (Magic UI) variant
  Label changes:
    Idle:      "✦  Generate Content"
    Loading:   "Generating..." + spinner
    Streaming: "Creating visuals..."
  
  On click:
    1. Validate: platform + brief required
    2. POST to /api/post/generate with all form data + brand_id
    3. Express job goes to job_queue table
    4. Poll /api/post/status/:jobId every 2 seconds
    5. As each image comes back, stream into output grid
    6. Deduct credits: show credit animation (number ticks down)

Credit cost preview (below button):
  "This will use ~4 credits (247 remaining)"
  text-white/30 text-xs text-center
```

### RIGHT PANEL — Output Grid

**States:**

**Empty state (no generations yet):**
```tsx
// Centered vertically in panel
// DotPattern (Magic UI) as background
// Icon: Sparkles 48px text-white/10
// Text: "Your generated content will appear here"
// text-white/30 text-center
// Subtext: "Fill out the form and click Generate"
// text-white/20 text-sm
```

**Loading state:**
```tsx
// 6 skeleton cards in 2×3 grid
// Each skeleton: rounded-xl aspect-square
// Use shimmer animation:
// "bg-gradient-to-r from-white/5 via-white/10 to-white/5
//  bg-[length:200%_100%] animate-[shimmer_1.5s_ease_infinite]"
// Add to globals.css:
// @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
```

**Results state:**
```tsx
// 2-column grid, gap-3
// Each output card:

interface OutputCard {
  id: string
  imageUrl: string        // GCS URL
  platform: string
  caption: string
  hashtags: string[]
  status: 'new' | 'saved' | 'scheduled'
}
```

**Output Card Component — `/components/generate/output-card.tsx`**
```
┌─────────────────────────┐
│                         │  ← aspect-square, rounded-xl
│   [Generated Image]     │  ← object-cover
│                         │
│  ━━━━━━━━━━━━━━━━━━━━━  │  ← 1px separator
│  ig  Caption preview... │  ← platform icon + truncated caption
│  [💾] [🔄] [📅] [↗]   │  ← action icons
└─────────────────────────┘

Card hover behavior:
- scale: 1.01 (framer-motion whileHover)
- Show overlay with actions more prominently
- Border becomes border-white/20

Card appears with BlurFade (Magic UI):
- delay increments by 0.05s per card
- from below (y: 16 → 0)

Action icons (bottom row):
  💾 Save to assets → POST /api/assets
  🔄 Regenerate → re-runs same prompt
  📅 Schedule → opens PostDrawer with this post
  ↗ Download → direct GCS URL download

Status badge (top-right):
  "NEW" — emerald pill (fades after 5 seconds)
  "SAVED" — white/30 pill
  "SCHEDULED" — violet pill
```

**Feedback Panel (slides up from bottom of output card):**
When user clicks 🔄 Regenerate:
```
Small panel appears inside/below card:
  "What should we change?"
  [ More premium ] [ Darker ] [ Add text ] [ Different angle ]
  [Custom feedback textarea — 1 row]
  [Apply & Regenerate] button

On submit:
  POST to /api/post/regenerate with feedback string
  Old card stays, new card appears next to it with "v2" badge
  Store version history in assets table (version_of: originalId)
```

---

## API Integration Map

All API calls from frontend use this base pattern:

```tsx
// lib/api.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

async function apiCall(path: string, options?: RequestInit) {
  const token = await getFirebaseToken()  // Firebase current user
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options?.headers,
    }
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}
```

### Endpoints to call per phase:

| Action | Method | Route |
|--------|--------|-------|
| Save brand | POST | /api/brand |
| Generate brand DNA | POST | /api/brand/generate-dna |
| Upload asset | POST | /api/assets/upload |
| Get calendar | GET | /api/calendar?month=&year= |
| Create post | POST | /api/post |
| Generate content | POST | /api/post/generate |
| Poll job status | GET | /api/post/status/:jobId |
| Regenerate | POST | /api/post/regenerate |
| Schedule post | POST | /api/schedule |

---

## State Management — Zustand Stores

Create these stores in `stores/`:

```tsx
// stores/brand.ts
interface BrandStore {
  currentBrand: Brand | null
  brands: Brand[]
  setBrand: (brand: Brand) => void
  addBrand: (brand: Brand) => void
}

// stores/onboarding.ts
interface OnboardingStore {
  step: number
  data: OnboardingData
  setStep: (n: number) => void
  updateData: (partial: Partial<OnboardingData>) => void
  reset: () => void
}

// stores/generation.ts
interface GenerationStore {
  form: GenerationForm
  outputs: OutputCard[]
  isGenerating: boolean
  jobId: string | null
  setForm: (partial: Partial<GenerationForm>) => void
  addOutput: (card: OutputCard) => void
  setGenerating: (b: boolean) => void
}
```

---

## Notification System

Use `sonner` for all toasts:

```tsx
// In layout.tsx: <Toaster theme="dark" position="bottom-right" />

// Usage patterns:
toast.success('Brand saved successfully')
toast.error('Generation failed — please try again')
toast.loading('Generating your content...')
toast.promise(generateFn(), {
  loading: 'Creating visuals...',
  success: 'Content ready!',
  error: 'Something went wrong'
})
```

---

## Animation Reference — What to Use Where

| Location | Animation | Source |
|----------|-----------|--------|
| Onboarding step transitions | `AnimatePresence` + slide variants | Framer Motion |
| Step indicator dot | spring scale | Framer Motion |
| Card hover | `whileHover` scale + shadow | Framer Motion |
| Section entrance | `BlurFade` | Magic UI |
| Stats numbers | `NumberTicker` | Magic UI |
| Selected card border | `BorderBeam` | Magic UI |
| Launch button | `ShimmerButton` | Magic UI |
| Generate button | `ShimmerButton` | Magic UI |
| Empty state bg | `DotPattern` | Magic UI |
| Hero floating cards | custom `floatY` keyframe | CSS |
| Sidebar pulsing dot | `PulsatingButton` concept | CSS keyframe |
| Post drawer slide-in | `motion.div` x: 480→0 | Framer Motion |
| Output card appear | `BlurFade` staggered | Magic UI |
| Skeleton loading | `shimmer` keyframe | CSS |
| Credit number tick-down | `NumberTicker` reversed | Magic UI |
| FAQ toggle | `motion.div` rotate | Framer Motion |
| Text headline accent | Playfair italic gradient | CSS |

---

## Final Checklist Before Pushing

- [ ] All 6 onboarding steps render and navigate correctly
- [ ] Data from all steps is stored in Zustand `onboardingStore`
- [ ] Final step POSTs to `/api/brand` with correct payload
- [ ] File uploads use `react-dropzone` and POST to `/api/assets/upload`
- [ ] GCS URLs returned are saved to `assets` table
- [ ] Sidebar shows correct active state per route
- [ ] Credit badge in sidebar pulls from `/api/user/credits`
- [ ] Dashboard stats use `NumberTicker` with real API data
- [ ] Calendar renders current month, highlights today
- [ ] Post slots show correct platform color coding
- [ ] Post drawer opens with correct post data
- [ ] Generation form validates before submit
- [ ] Job polling works: 2s interval, stops on complete/error
- [ ] Output cards appear with staggered `BlurFade`
- [ ] Feedback panel regenerates with prompt injection
- [ ] All API calls include Firebase auth header
- [ ] `sonner` toaster renders in layout.tsx
- [ ] No layout shift on hydration (use `suppressHydrationWarning` where needed)
- [ ] Mobile: sidebar collapses to bottom nav on < 768px
- [ ] Vercel env vars set: NEXT_PUBLIC_API_URL, Firebase config

---

## Do Not Touch

- `app/(marketing)/` — homepage and public pages, already polished
- `globals.css` gradient-border, glow, fade-up classes already exist
- `hooks/useInView.ts` already exists
- Existing Tailwind config, PostCSS, next.config.js
- `.env` file — never committed
- Express backend routes — only call them, do not modify
