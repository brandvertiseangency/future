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

### 3. Redis (Job Queues — for AI generation)
- Use [Upstash Redis](https://upstash.com/) (free tier, works on Vercel/Railway)
- Add to `.env`:
  ```
  REDIS_HOST=your-upstash-host.upstash.io
  REDIS_PORT=6379
  REDIS_PASSWORD=your-upstash-password
  ```
- OR disable queues entirely (sync generation only):
  ```
  REDIS_DISABLED=true
  ```

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

### Backend (Express API) — Railway

> ⚠️ The `railway.json`, `Procfile`, and `.railwayignore` files are now committed.
> Railway will auto-detect the Express app and run `node src/server.js`.

#### First-time setup (if no Railway project exists)
1. Go to https://railway.app → **New Project** → **Deploy from GitHub repo**
2. Select `brandvertiseangency/future`
3. Railway will detect `railway.json` automatically
4. **Service Settings** → confirm:
   - Start command: `node src/server.js`
   - Health check: `/health`
   - Root directory: *(leave blank — repo root)*
5. Add all env vars (see table below) in **Variables** tab
6. Click **Deploy** — Railway will build and start the server
7. Copy the generated domain (e.g. `https://future-production.up.railway.app`)

#### If a Railway project already exists but is broken
1. Open your Railway project → **Settings** → **Danger** → Delete this service
2. Re-add service: **+ New** → **GitHub Repo** → `brandvertiseangency/future`
3. Repeat steps 4–7 above

#### After deploy — update Vercel
- Set `NEXT_PUBLIC_API_URL` in Vercel to the new Railway URL
- Update `frontend/vercel.json` rewrite `destination` to match
- Redeploy Vercel frontend (`git push` or click Redeploy in dashboard)

### Frontend (Next.js) — Recommended: Vercel
1. Push `frontend/` to GitHub (or same repo)
2. Import project at [vercel.com](https://vercel.com)
3. Set root directory to `frontend`
4. Add env vars: `NEXT_PUBLIC_API_URL=https://your-railway-backend.up.railway.app`
5. Deploy

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
| `OPENAI_API_KEY` | ✅ Set | Yes |
| `GOOGLE_AI_API_KEY` | ✅ Set | Yes |
| `DATABASE_URL` | ✅ Set (Neon) | Yes |
| `JWT_SECRET` | ✅ Generated | Yes |
| `SESSION_SECRET` | ✅ Generated | Yes |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | ❌ Missing | Yes |
| `RAZORPAY_KEY_ID` | ❌ Missing | For payments |
| `REDIS_HOST` or `REDIS_DISABLED=true` | ❌ Missing | For AI queue |
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
| `NEXT_PUBLIC_API_URL` | Your Railway backend URL, e.g. `https://brandvertise-backend.up.railway.app` |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase web app API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `future-brandvertise-agency.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `future-brandvertise-agency` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID |

### API proxy
`vercel.json` rewrites `/api/*` requests to the Railway backend — no CORS issues.
Update the `destination` URL in `frontend/vercel.json` after you get your Railway URL.

### Deploy
```bash
cd frontend
npx vercel --prod
```
Or push to `main` — Vercel auto-deploys on every push.
