# Brandvertise AI — Deployment Checklist

## ✅ Already Done
- [x] Neon PostgreSQL connected (pooled + unpooled)
- [x] All 7 DB tables created (users, brands, posts, calendar_events, assets, credit_transactions, payments)
- [x] JWT_SECRET & SESSION_SECRET generated (96-char hex)
- [x] OpenAI API key set
- [x] Google AI API key set
- [x] Firebase Admin SDK connected
- [x] Backend health endpoint: `GET /health`
- [x] Frontend (Next.js) builds successfully

---

## 🔴 Required Before Deploy (Must Have)

### 1. Firebase Service Account
- Go to: Firebase Console → Project Settings → Service Accounts → Generate New Private Key
- Add to `.env`:
  ```
  FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"..."}
  ```

### 2. Razorpay (Payments)
- Go to: https://dashboard.razorpay.com/app/keys
- Add to `.env`:
  ```
  RAZORPAY_KEY_ID=rzp_live_xxxx
  RAZORPAY_KEY_SECRET=xxxx
  RAZORPAY_WEBHOOK_SECRET=xxxx
  ```

### 3. Async generation queue (Neon — no separate Redis required)

Creative generation jobs use a **Postgres-backed queue** (`job_queue` on your existing Neon database), not Redis/BullMQ. If `DATABASE_URL` is set and migrations have run, you **do not** need to create Redis for AI generation.

- Run migrations so `job_queue` exists (`npm run db:migrate:files` and additive migrations as in **Pre-Deploy Commands** below).
- Run at least one **worker** process in production (`npm run worker`) so queued jobs are claimed and processed; otherwise jobs stay pending.

Optional: `REDIS_HOST` / `REDIS_DISABLED` in this repo are legacy config surface; generation queue code paths are Postgres-based. You can ignore Redis unless you add a separate feature that uses it.

---

### Image generation (production)

All server-side image generation uses the **Google Gemini / Imagen** APIs (`GOOGLE_AI_API_KEY`). OpenAI is not used for images.

1. In [Google AI Studio](https://aistudio.google.com/apikey) (or Google Cloud), create an API key with billing enabled if required for your chosen models.
2. In your host’s **environment variables** (Vercel project settings, Railway, etc.), set:
   - `GOOGLE_AI_API_KEY` — required for any image from calendar, queue, posts, or workers.
   - Optional tuning:
     - `GOOGLE_NATIVE_IMAGE_MODEL` — default `gemini-3-pro-image-preview` (Nano Banana Pro). Alternatives: `gemini-3.1-flash-image-preview`, `gemini-2.5-flash-image` (see [Gemini image models](https://ai.google.dev/gemini-api/docs/image-generation)).
     - `GOOGLE_IMAGEN_MODEL` — default `imagen-4.0-fast-generate-001` when native returns no image.
     - `GOOGLE_IMAGE_IMAGEN_FALLBACK=false` — disable Imagen and fail if native alone does not return an image.
3. Redeploy the API service after changing variables.
4. Smoke test: run one calendar slot or `/api` flow that generates an image; confirm logs show `google-native` or `google-imagen` and no OpenAI image errors.

`OPENAI_API_KEY` remains used for **text** (`callAI` / captions / JSON), not for images.

---

## 🟡 Optional (Enable Features)

### 4. SMTP Email (Notifications)
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your-app-password        # Gmail App Password (not your login)
EMAIL_FROM=Brandvertise AI <noreply@brandvertise.ai>
```

### 5. Twilio WhatsApp (Alerts)
```
TWILIO_ACCOUNT_SID=ACxxxx
TWILIO_AUTH_TOKEN=xxxx
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

### 6. Google Cloud Storage (Media uploads)
```
GCS_BUCKET_NAME=brandvertise-media
GCS_PROJECT_ID=your-gcp-project-id
```

### 7. Buffer (Social auto-publishing)
```
BUFFER_ACCESS_TOKEN=xxxx
```

---

## 🚀 Deployment Platforms

`DEPLOY.md` used to recommend **Railway** because it is a simple place to run a **long-lived** Node process (`node src/server.js`). **You do not need Railway** if you already run the API elsewhere (for example **Vercel**).

### Backend (Express API)

**Option A — Vercel (matches the root `vercel.json` in this repo)**  
The repo root includes `vercel.json` that routes requests to `src/server.js`. You can deploy the **API as its own Vercel project** (import the same GitHub repo, leave **Root Directory** empty so the root `vercel.json` applies, set Node version and all server env vars from the table below). Use the deployed URL as your backend base (for example `https://your-api.vercel.app`).

Be aware: on serverless, **very long** generations can hit platform **timeouts**. The **Postgres job worker** (`npm run worker`) is a separate long-running process; Vercel does not keep that alive for you. If you rely on `job_queue`, run `npm run worker` on an **always-on** host (small VPS, [Render](https://render.com/), [Fly.io](https://fly.io/), Railway, etc.) **in addition** to the API, or use flows that complete within your serverless limits.

**Option B — Railway, Render, Fly.io, a VM, etc.**  
Useful when you want the API and optionally the worker on a normal always-on Node host. Optional files in the repo (`railway.json`, `Procfile`) help some providers auto-detect the start command; they are **not** a requirement to use Railway.

### Frontend (Next.js) — Vercel
1. Push `frontend/` to GitHub (or use the monorepo)
2. Import the project at [vercel.com](https://vercel.com)
3. Set **Root Directory** to `frontend`
4. Set `NEXT_PUBLIC_API_URL` to **wherever your Express API is deployed** (your Vercel API URL, or another host)
5. In `frontend/vercel.json`, set the rewrite `destination` to that same API origin if you proxy `/api/*` through the frontend (see **API proxy** below)

### Database — Already on Neon ✅
- No action needed — Neon is serverless and auto-scales

---

## 🔧 Pre-Deploy Commands
```bash
# 1. Run tracked SQL migrations first
npm run db:migrate:files

# 2. (Optional) run additive fallback migration for older databases
npm run db:migrate:additive

# 3. Test all connections
node -e "require('./src/config/postgres').testConnection()"

# 4. Build frontend
cd frontend && npm run build

# 5. Start production server
NODE_ENV=production npm start
```

## ✅ Public V1 Release Order
1. Apply migrations (`db:migrate:files`) on production database.
2. Deploy backend API and ensure `/health` returns `status: ok`.
3. Run frontend CI gates (lint + typecheck + build).
4. Deploy frontend and verify onboarding -> calendar -> generation -> outputs flow.

---

## 📋 Environment Variables Summary

| Variable | Status | Required |
|---|---|---|
| `OPENAI_API_KEY` | ✅ Set | Yes (text / JSON generation) |
| `GOOGLE_AI_API_KEY` | ✅ Set | Yes (**image** generation uses Google only) |
| `GOOGLE_NATIVE_IMAGE_MODEL` | optional | Default `gemini-3-pro-image-preview` |
| `GOOGLE_IMAGEN_MODEL` | optional | Default `imagen-4.0-fast-generate-001` (fallback) |
| `GOOGLE_IMAGE_IMAGEN_FALLBACK` | optional | Default `true`; set `false` to use native only |
| `DATABASE_URL` | ✅ Set (Neon) | Yes |
| `JWT_SECRET` | ✅ Generated | Yes |
| `SESSION_SECRET` | ✅ Generated | Yes |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | ❌ Missing | Yes |
| `RAZORPAY_KEY_ID` | ❌ Missing | For payments |
| `REDIS_*` | not used for generation queue | Jobs use Neon `job_queue` + `npm run worker` |
| `SMTP_USER` / `SMTP_PASS` | ❌ Missing | For emails |
| `TWILIO_ACCOUNT_SID` | ❌ Missing | For WhatsApp |
| `GCS_BUCKET_NAME` | ❌ Missing | For file storage |
| `BUFFER_ACCESS_TOKEN` | ❌ Missing | For auto-publish |

---

## 🔺 Vercel — Frontend Deployment

### One-time setup
1. Go to https://vercel.com/new and import this GitHub repo.
2. **Set Root Directory** → `frontend`
3. **Framework Preset** → Next.js (auto-detected)
4. **Build Command** → `npm run build` (default)
5. **Output Directory** → `.next` (default)

### Environment Variables (add in Vercel Dashboard → Settings → Environment Variables)

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_API_URL` | Your Express API base URL (e.g. `https://your-api.vercel.app` or any other host) |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase web app API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `future-brandvertise-agency.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `future-brandvertise-agency` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID |

### API proxy
`frontend/vercel.json` can rewrite `/api/*` to your backend so the browser talks to one origin. Update the `destination` host whenever your API URL changes (Vercel or otherwise).

### Deploy
```bash
cd frontend
npx vercel --prod
```
Or push to `main` — Vercel auto-deploys on every push.
