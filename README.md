# 🎨 Brandvertise AI Design Hub

> AI-powered SaaS creative agency — generates social media content (posts, carousels, reels) from brand input.

## Architecture

```
src/
├── config/           # App config, Firebase, Redis
│   ├── index.js      # Centralized config from env
│   ├── firebase.js   # Firestore + Auth + GCS
│   └── redis.js      # Redis for BullMQ
├── middleware/        # Express middleware
│   ├── auth.js       # Firebase Auth token verification
│   ├── validate.js   # Joi request validation
│   └── creditCheck.js # Credit balance enforcement
├── validators/
│   └── schemas.js    # Joi schemas for all endpoints
├── routes/           # API endpoints
│   ├── user.js       # Registration, profile, credits
│   ├── brand.js      # Brand CRUD
│   ├── assets.js     # File upload to GCS
│   ├── calendar.js   # Content calendar generation
│   ├── generate.js   # Async creative generation
│   ├── post.js       # Regeneration + post management
│   ├── schedule.js   # Buffer API scheduling
│   └── payment.js    # Razorpay integration
├── services/         # Business logic
│   ├── userService.js
│   ├── brandService.js
│   ├── calendarService.js   # OpenAI content strategy
│   ├── promptService.js     # 🔥 Prompt Engine
│   ├── imageService.js      # Google AI image generation
│   ├── storageService.js    # GCS uploads
│   ├── assetService.js
│   ├── creditService.js
│   ├── regenerationService.js
│   ├── notificationService.js # Email + WhatsApp
│   ├── schedulingService.js   # Buffer API
│   └── paymentService.js     # Razorpay
├── queues/
│   └── generationQueue.js   # BullMQ queue
├── workers/
│   └── generationWorker.js  # Job processor
├── utils/
│   ├── logger.js     # Winston logger
│   └── sessionStore.js
└── server.js         # Express app entry
```

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy and configure environment
cp .env.example .env
# Edit .env with your API keys

# 3. Start server
npm run dev

# 4. (Optional) Start worker for async generation
npm run worker:dev
```

## API Endpoints

### User & Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/user/register` | Register user (requires Firebase Auth token) |
| GET | `/api/user/profile` | Get user profile |
| GET | `/api/user/credits` | Get credit balance + history |

### Brand
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/brand/create` | Create brand profile |
| GET | `/api/brand/list` | List user's brands |
| GET | `/api/brand/:id` | Get brand details |
| PUT | `/api/brand/:id` | Update brand |

### Assets
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/assets/upload` | Upload asset (multipart/form-data) |
| GET | `/api/assets/:brand_id` | List brand assets |
| DELETE | `/api/assets/:asset_id` | Delete asset |

### Content Calendar
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/calendar/generate` | Generate AI content calendar |
| GET | `/api/calendar/:id` | Get calendar with posts |
| POST | `/api/calendar/update` | Approve/edit calendar |

### Creative Generation
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/generate` | Start async generation (BullMQ) |
| GET | `/api/generate/status` | Queue status |

### Post & Regeneration
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/post/:id` | Get post details |
| PATCH | `/api/post/:id/status` | Update post status |
| POST | `/api/post/regenerate` | Regenerate with feedback |

### Scheduling
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/schedule/profiles` | Get Buffer profiles |
| POST | `/api/schedule` | Schedule posts |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/payment/plans` | Get plan pricing |
| POST | `/api/payment/create-order` | Create Razorpay order |
| POST | `/api/payment/verify` | Verify payment |
| POST | `/api/payment/webhook` | Razorpay webhook |

### System
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | System health + module status |

## Postman Testing

### 1. Create Brand
```json
POST /api/brand/create
Authorization: Bearer <firebase-id-token>

{
  "brand_name": "TechNova",
  "industry": "SaaS Technology",
  "target_audience": "Startup founders, CTOs, developers aged 25-45",
  "goals": "Build brand awareness and drive demo signups",
  "tone": "innovative, confident, approachable",
  "design_preference": "dark mode, futuristic, clean"
}
```

### 2. Upload Assets
```
POST /api/assets/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: [image file]
brand_id: <brand_id>
type: product
tags: "main product screenshot"
```

### 3. Generate Calendar
```json
POST /api/calendar/generate
Authorization: Bearer <token>

{
  "brand_id": "<brand_id>",
  "plan_type": "standard"
}
```

### 4. Approve Calendar
```json
POST /api/calendar/update
Authorization: Bearer <token>

{
  "calendar_id": "<calendar_id>",
  "approved": true
}
```

### 5. Generate Creatives
```json
POST /api/generate
Authorization: Bearer <token>

{
  "calendar_id": "<calendar_id>"
}
```

### 6. Regenerate Post
```json
POST /api/post/regenerate
Authorization: Bearer <token>

{
  "post_id": "<post_id>",
  "feedback": "Make it warmer, add more golden hour lighting, show the product larger"
}
```

### 7. Schedule Posts
```json
POST /api/schedule
Authorization: Bearer <token>

{
  "calendar_id": "<calendar_id>",
  "profile_ids": ["buffer_profile_id_1"]
}
```

## Credit System

| Plan | Credits | Regen Limit | Brands | Posts/Calendar |
|------|---------|-------------|--------|----------------|
| Free | 10 | 2/post | 1 | 7 |
| Standard (₹999) | 100 | 5/post | 5 | 15 |
| Premium (₹2,499) | 500 | 10/post | 20 | 30 |

## Legacy Endpoints

For backward compatibility:
- `POST /generate` → redirects to `/api/generate/legacy`
- `POST /regenerate` → redirects to `/api/generate/regenerate-legacy`
