# Brandvertise — Project Context

> Paste this file into the root of your new project directory. When starting a new Cursor session, reference this file so the assistant has full context to continue work seamlessly.

---

## What Is Brandvertise

A **premium AI SaaS platform** for brand-driven content creation and social media management. Not a basic dashboard — a highly interactive, workflow-driven product that feels polished, intelligent, and emotionally satisfying to use.

The product vision is comparable to: ElevenLabs, Linear, Notion AI, Jasper, Framer, Raycast.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router), React 19 |
| Styling | Tailwind v4, shadcn (base-nova theme), Framer Motion |
| State | Zustand (client), SWR (server data), React Context (auth) |
| Auth | Firebase (client) + Firebase Admin (backend), `__session` cookie |
| Backend | Express 4, Node.js — `src/server.js` |
| Database | PostgreSQL (`pg`) |
| AI | OpenAI, Anthropic, Google GenAI |
| Payments | Razorpay (integrated, checkout UI pending live keys) |
| Comms | Twilio (SMS), Nodemailer (email) |
| Queue | Postgres-based queue (`src/queues/`) — BullMQ/Redis removed |
| Deploy | Vercel (`vercel.json` rewrites to `src/server.js`) |

---

## Repository Structure

```
/
├── src/                    # Express backend
│   ├── server.js           # Entry point
│   ├── routes/             # API route handlers
│   ├── middleware/         # Auth, rate limiting
│   ├── services/           # AI, email, storage services
│   ├── workers/            # Background job workers
│   ├── queues/             # Postgres-based job queue
│   ├── db/                 # Migrations, DB helpers
│   ├── config/             # App config (Firebase Admin, etc.)
│   └── validators/         # Joi schemas
├── frontend/               # Next.js app
│   └── src/
│       ├── app/            # App Router pages
│       │   ├── (app)/      # Protected routes (auth-gated)
│       │   ├── auth/       # Login / signup
│       │   ├── landing/    # Marketing landing page
│       │   └── legal/      # Terms, Privacy
│       ├── components/
│       │   ├── ui/         # Reusable primitives (28 components)
│       │   ├── app/        # Sidebar, bottom nav, topbar, etc.
│       │   ├── dashboard/  # Dashboard-specific components
│       │   ├── landing/    # Marketing page sections
│       │   └── onboarding/ # Onboarding step components
│       ├── lib/            # Utilities, API wrapper, onboarding flow
│       ├── hooks/          # Custom React hooks
│       └── store/          # Zustand stores
├── public/                 # Brand logos and favicons (webp)
├── docs/                   # Internal docs (compliance, production, design)
├── scripts/                # Utility scripts
├── package.json            # Backend dependencies
├── vercel.json             # Vercel deployment config
└── DEPLOY.md               # Deployment checklist
```

---

## App Routes (Protected — `/app/`)

| Route | Purpose |
|---|---|
| `/dashboard` | Command center — contextual next-action guidance |
| `/onboarding` | Multi-step brand setup wizard |
| `/brand` | Read-only brand profile overview |
| `/generate` | AI content generation studio |
| `/generate/queue` | Generation job queue |
| `/calendar` | Content calendar overview |
| `/calendar/generate` | Generate a content plan |
| `/calendar/review` | Approve/reject planned posts |
| `/calendar/content` | Content studio (edit/finalize) |
| `/outputs` | All generated content outputs |
| `/outputs/[postId]` | Individual post detail + edit |
| `/scheduler` | Schedule approved content |
| `/agents` | AI agent cards (locked/unlocked by plan) |
| `/assets` | Brand asset management |
| `/settings` | Profile, billing, notifications, security |

---

## Design System

- **Tokens**: All colors use CSS variables wired into Tailwind `@theme inline` in `globals.css`
- **No hardcoded hex values** anywhere in the app — semantic tokens only
- **Dark/light mode**: Fully supported via `next-themes`; `<Toaster>` follows resolved theme
- **Spacing tokens**: `--space-2` through `--space-8` wired into Tailwind
- **Surface tokens**: `--surface-page`, `--surface-hero`, `--surface-elevated`
- **Radius tokens**: `--radius-card`, `--radius-card-lg`
- **Typography**: Premium, minimal hierarchy

### Key UI Primitives (`components/ui/`)
`button`, `dialog`, `tabs`, `switch`, `select`, `slider`, `input`, `textarea`, `label`, `badge`, `skeleton-card`, `page-primitives`, `saas-primitives`, `confirm-dialog`, `data-table-shell`, `sidebar`, `dropdown-menu`, `popover`, `blur-fade`, `dot-pattern`, `spotlight`, `ai-button`, `brand-si-icon`, `liquid-metal-button`, `hover-border-gradient`, `TextReveal`, `flip-words`, `apple-cards-carousel`

---

## What Has Been Built (Completed)

### Phase 1 — Design System Foundation ✅
- Spacing + surface + radius tokens wired into Tailwind
- All hardcoded hex values replaced with semantic tokens (command palette, legal layout, landing)
- `<Toaster>` dynamically follows `next-themes` resolved theme

### Phase 2 — Navigation & Information Architecture ✅
- Mobile bottom bar: added "More" tab → slide-up sheet exposing Agents, Brand, Settings, and calendar subflows
- Calendar sidebar active state: all `/calendar/*` routes correctly highlight the Calendar nav item
- Sidebar footer: contextual "N posts scheduled" chip + low-credit warning (amber) + dynamic button text

### Phase 3 — Onboarding Experience ✅
- Emotional milestones at steps 6, 10, 12 (animated contextual banners)
- Header shows active section title + subtitle
- Progress bar label reflects onboarding phase dynamically

### Phase 4 — Dashboard as Intelligent Command Center ✅
- `deriveWorkflowState()` drives a contextual "Next best action" primary CTA
- States: `no-brand`, `no-plan`, `needs-approval`, `needs-scheduling`, `active`
- Getting started checklist for new users
- Skeleton loading states matching actual layout
- Credits card with inline low-credit warning + upgrade link

### Phase 5 — Calendar + Plan + Studio Flow ✅
- `CalendarWorkflowStepper` component (`components/app/calendar-workflow-stepper.tsx`) injected into all calendar subpages
- Visual "Plan → Review → Studio → Calendar" flow indicator, active step highlighted

### Phase 6 — Generate Flow ✅
- Credit check before submission: `isLowCredits` (amber warning) + `isOutOfCredits` (red block + disabled button)
- Generation progress: animated state with `Sparkles` icon, stage message, completed count, progress bar
- Generate button disabled when out of credits

### Phase 7 — Outputs + Scheduler ✅
- Outputs: context-aware empty states — "No outputs match filters" (with clear CTA) vs "No outputs yet" (with dual CTAs)
- Scheduler: tab-specific empty states with contextual CTAs for each tab (Schedule, Queue, Posted)

### Phase 8 — Brand, Agents, Settings ✅
- Agents: upgrade banner tied to backend plan, "How agents work" section, capability hints on cards
- Settings Billing tab: restructured into "Current plan", "Upgrade", and "Payment" section cards; Razorpay placeholder built out

---

## Key Architectural Patterns

### API Calls (Frontend)
```ts
import { apiCall } from '@/lib/api'
// Automatically attaches Firebase bearer token
const data = await apiCall('/api/some-endpoint')
```

### SWR Data Fetching
```ts
const { data, error } = useSWR('/api/credits/balance', apiCall)
```

### Auth Guard
All `(app)/` routes are wrapped in `AuthGuard` — redirects to `/auth` if no session cookie.

### Zustand Stores
- `useOnboardingStore` — onboarding step + data (localStorage persisted)
- `useAgentStore` — agent unlock state (localStorage persisted; should eventually sync with backend entitlements)

### Backend API Base
All routes mounted at `/api/*` in `src/server.js`. Firebase Admin verifies the `__session` cookie in `src/middleware/auth.js`.

---

## Environment Variables

### Backend (root `.env`)
```
DATABASE_URL=
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GOOGLE_GENAI_API_KEY=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
SMTP_HOST=
SMTP_USER=
SMTP_PASS=
```

### Frontend (`frontend/.env.local`)
```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_API_URL=
```

---

## Running Locally

```bash
# Backend
npm install
npm run dev          # starts Express on port 3001 (or configured port)

# Frontend (separate terminal)
cd frontend
npm install
npm run dev          # starts Next.js on port 3000
```

---

## Known Pending Work

- **Razorpay live checkout**: Settings billing section has the UI built out; needs live Razorpay key wiring and webhook handler
- **Agent entitlements from backend**: Currently agent unlock state uses Zustand/localStorage; should be driven by `/api/user/plan` or similar endpoint
- **`/api/assets-legacy` route**: Still mounted in `server.js` for backward compatibility — audit and remove once confirmed no clients use it
- **Output detail page** (`/outputs/[postId]`): Side-by-side preview + edit panel could be further enhanced
- **Drag-and-drop scheduler**: `@dnd-kit/core` is installed; scheduler DnD is partially wired

---

## What Was Cleaned Up (Pre-Deploy)

- Removed 29 dead UI components (Three.js chain, particle effects, unused shadcn primitives)
- Removed 12 dead non-UI components (old dashboard widgets, duplicate ThemeToggle, unused landing sections)
- Removed all root-level AI prompt `.md` files and `.docx` planning docs
- Removed design reference screenshot folders
- Removed `ai-chatbot/` (unused second Next.js app)
- Removed `logs/`, `outputs/` runtime data dirs
- Removed `docs/investigations/` dev SQL notes
- Removed all unused public images and default Next.js SVGs
- Pruned 19 unused frontend npm packages (all `@radix-ui/*`, Three.js stack, tsparticles, embla, vaul, etc.)
- Pruned 10 unused backend npm packages (`bullmq`, `ioredis`, misplaced React/AI deps, etc.)
