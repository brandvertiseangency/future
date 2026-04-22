# Smart Brand Intelligence System — Complete Build Prompt
## Brandvertise AI · Phase 2 · Adaptive Onboarding + Vision AI + Intelligent Prompt Engine
### For Claude Code Agent — Full Execution Document

---

## WHAT YOU ARE BUILDING

You are replacing the existing 7-step generic onboarding with an **intelligent brand brief system** that:

1. **Adapts its questions based on the user's industry** — a real estate developer and a café owner see completely different questions
2. **Analyses uploaded competitor/reference/inspiration images** using Gemini Vision to extract their brand's visual DNA
3. **Stores a complete brand style profile** in the database — colours, typography mood, photography style, layout preferences
4. **Feeds this profile into the prompt engine** so every piece of generated content (caption + image) is calibrated to the brand's actual aesthetic — not generic AI output
5. **Connects to the content calendar** so generated posts match the right content type (promotional, educational, festive, testimonial) based on a weekly rotation the user sets up

This is the feature that transforms Brandvertise AI from "an AI that generates posts" into "an AI that understands your brand and generates posts that look like yours."

---

## DO NOT TOUCH

- `/api/post/generate` route logic — only extend the prompt building
- Existing brand CRUD routes — extend the schema, don't replace
- Calendar page frontend — it reads from `posts` table which stays the same
- Auth flow — onboarding routing logic stays, only the wizard content changes
- Existing Zustand stores structure — extend `onboarding.ts`, don't rewrite

---

## FILES TO CREATE OR MODIFY

```
CREATE:  src/app/(app)/onboarding/steps/           ← new directory for step components
CREATE:  src/app/(app)/onboarding/steps/step-identity.tsx
CREATE:  src/app/(app)/onboarding/steps/step-industry.tsx
CREATE:  src/app/(app)/onboarding/steps/step-personality.tsx
CREATE:  src/app/(app)/onboarding/steps/step-visual-identity.tsx
CREATE:  src/app/(app)/onboarding/steps/step-audience.tsx
CREATE:  src/app/(app)/onboarding/steps/step-industry-config.tsx  ← the adaptive step
CREATE:  src/app/(app)/onboarding/steps/step-references.tsx       ← vision AI upload step
CREATE:  src/app/(app)/onboarding/steps/step-calendar-prefs.tsx
MODIFY:  src/app/(app)/onboarding/page.tsx          ← orchestrates all 8 steps
MODIFY:  src/stores/onboarding.ts                   ← extend with new fields
MODIFY:  src/lib/prompt-engine.ts                   ← full rewrite with brand context layers
CREATE:  src/lib/vision-analyser.ts                 ← Gemini Vision image analysis
CREATE:  src/components/onboarding/industry-grid.tsx
CREATE:  src/components/onboarding/reference-uploader.tsx
CREATE:  src/components/onboarding/vibe-cards.tsx
CREATE:  src/components/onboarding/colour-picker.tsx
CREATE:  src/components/onboarding/font-mood-selector.tsx
CREATE:  src/components/onboarding/industry-config-renderer.tsx  ← renders adaptive questions

MODIFY:  backend/routes/onboarding.js               ← new endpoints
CREATE:  backend/lib/vision-analyser.js             ← server-side Gemini Vision call
MODIFY:  backend/lib/prompt-engine.js               ← rewrite with full brand context
CREATE:  backend/migrations/brand-intelligence.sql  ← new tables
MODIFY:  backend/server.js                          ← register new routes
```

---

## STEP 1 — DATABASE MIGRATIONS

Create file: `backend/migrations/brand-intelligence.sql`

Run this migration. It is ADDITIVE — it does not drop existing columns.

```sql
-- Extend brands table with visual identity fields
ALTER TABLE brands
  ADD COLUMN IF NOT EXISTS color_primary    TEXT,
  ADD COLUMN IF NOT EXISTS color_secondary  TEXT,
  ADD COLUMN IF NOT EXISTS color_accent     TEXT,
  ADD COLUMN IF NOT EXISTS font_mood        TEXT,
  ADD COLUMN IF NOT EXISTS visual_style     TEXT,
  ADD COLUMN IF NOT EXISTS industry_subtype TEXT,
  ADD COLUMN IF NOT EXISTS price_segment    TEXT,
  ADD COLUMN IF NOT EXISTS posting_frequency INTEGER DEFAULT 4,
  ADD COLUMN IF NOT EXISTS content_mix      JSONB DEFAULT '{"promotional":30,"educational":25,"testimonial":20,"bts":15,"festive":10}',
  ADD COLUMN IF NOT EXISTS platform_priority TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS onboarding_version INTEGER DEFAULT 2;

-- Brand visual style profile — extracted from reference images by Gemini Vision
CREATE TABLE IF NOT EXISTS brand_style_profiles (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id              UUID REFERENCES brands(id) ON DELETE CASCADE,
  extracted_colors      TEXT[]    DEFAULT '{}',
  font_mood_detected    TEXT,
  layout_style          TEXT,
  photography_style     TEXT,
  mood_keywords         TEXT[]    DEFAULT '{}',
  composition_style     TEXT,
  text_density          TEXT,
  dominant_aesthetic    TEXT,
  reference_image_urls  TEXT[]    DEFAULT '{}',
  raw_vision_response   JSONB,
  analysed_at           TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(brand_id)
);

-- Industry-specific configuration per brand
CREATE TABLE IF NOT EXISTS brand_industry_configs (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id            UUID REFERENCES brands(id) ON DELETE CASCADE,
  industry            TEXT NOT NULL,
  subtype             TEXT,
  price_segment       TEXT,
  audience_lifestyle  TEXT[]  DEFAULT '{}',
  usp_keywords        TEXT[]  DEFAULT '{}',
  special_flags       JSONB   DEFAULT '{}',
  industry_answers    JSONB   DEFAULT '{}',
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(brand_id)
);

-- Content calendar preferences
CREATE TABLE IF NOT EXISTS content_calendar_preferences (
  brand_id                UUID PRIMARY KEY REFERENCES brands(id) ON DELETE CASCADE,
  weekly_post_count       INTEGER DEFAULT 4,
  content_type_mix        JSONB DEFAULT '{"promotional":30,"educational":25,"testimonial":20,"bts":15,"festive":10}',
  auto_schedule           BOOLEAN DEFAULT FALSE,
  preferred_posting_times TEXT[]  DEFAULT '{"09:00","12:00","18:00","20:00"}',
  active_platforms        TEXT[]  DEFAULT '{}',
  updated_at              TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_style_profiles_brand ON brand_style_profiles(brand_id);
CREATE INDEX IF NOT EXISTS idx_industry_configs_brand ON brand_industry_configs(brand_id);
```

---

## STEP 2 — EXTEND ONBOARDING ZUSTAND STORE

File: `src/stores/onboarding.ts` — replace entirely:

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ─── Types ────────────────────────────────────────────────────────────────────

export type Industry =
  | 'real_estate' | 'restaurant_cafe' | 'fashion_clothing' | 'salon_beauty'
  | 'interior_design' | 'gym_fitness' | 'education_coaching' | 'ecommerce'
  | 'jewellery' | 'consultant' | 'other';

export type FontMood =
  | 'serif_elegant' | 'sans_modern' | 'display_bold' | 'script_personal' | 'mono_technical';

export type VibeStyle =
  | 'luxury' | 'energetic' | 'minimal' | 'playful' | 'bold'
  | 'trustworthy' | 'warm' | 'edgy' | 'inspirational' | 'professional';

export interface ContentMix {
  promotional: number;
  educational: number;
  testimonial: number;
  bts: number;
  festive: number;
}

export interface ReferenceImage {
  url: string;              // base64 or storage URL after upload
  fileName: string;
  analysed: boolean;
}

export interface OnboardingState {
  currentStep: number;

  // Step 1 — Identity
  brandName: string;
  tagline: string;
  city: string;
  website: string;

  // Step 2 — Industry
  industry: Industry | null;
  industryLabel: string;

  // Step 3 — Personality
  tone: number;              // 0-100
  vibeStyles: VibeStyle[];   // max 3
  personalityKeywords: string[];

  // Step 4 — Visual Identity
  colorPrimary: string;
  colorSecondary: string;
  colorAccent: string;
  fontMood: FontMood | null;
  logoUrl: string;

  // Step 5 — Audience
  audienceAgeMin: number;
  audienceAgeMax: number;
  audienceGender: 'mixed' | 'mostly_male' | 'mostly_female';
  audienceCity: string;
  audienceRegion: 'metro' | 'tier2' | 'pan_india';
  audienceLifestyle: string[];

  // Step 6 — Industry Config (adaptive answers)
  industryAnswers: Record<string, string | string[] | boolean | number>;
  uspKeywords: string[];
  priceSegment: 'budget' | 'mid' | 'premium' | 'luxury' | '';
  industrySubtype: string;

  // Step 7 — References
  referenceImages: ReferenceImage[];
  referenceAnalysisComplete: boolean;
  extractedStyleProfile: ExtractedStyleProfile | null;

  // Step 8 — Calendar Prefs
  weeklyPostCount: number;
  contentMix: ContentMix;
  activePlatforms: string[];
  preferredPostingTimes: string[];
  autoSchedule: boolean;

  // Actions
  setStep: (step: number) => void;
  setField: <K extends keyof OnboardingState>(key: K, value: OnboardingState[K]) => void;
  setIndustryAnswer: (key: string, value: string | string[] | boolean | number) => void;
  addReferenceImage: (img: ReferenceImage) => void;
  removeReferenceImage: (index: number) => void;
  setExtractedStyleProfile: (profile: ExtractedStyleProfile) => void;
  reset: () => void;
}

export interface ExtractedStyleProfile {
  extractedColors: string[];
  fontMoodDetected: string;
  layoutStyle: string;
  photographyStyle: string;
  moodKeywords: string[];
  compositionStyle: string;
  textDensity: string;
  dominantAesthetic: string;
}

const DEFAULTS: Omit<OnboardingState, 'setStep' | 'setField' | 'setIndustryAnswer' | 'addReferenceImage' | 'removeReferenceImage' | 'setExtractedStyleProfile' | 'reset'> = {
  currentStep: 1,
  brandName: '', tagline: '', city: '', website: '',
  industry: null, industryLabel: '',
  tone: 50, vibeStyles: [], personalityKeywords: [],
  colorPrimary: '#000000', colorSecondary: '#ffffff', colorAccent: '',
  fontMood: null, logoUrl: '',
  audienceAgeMin: 22, audienceAgeMax: 45,
  audienceGender: 'mixed', audienceCity: '', audienceRegion: 'metro',
  audienceLifestyle: [],
  industryAnswers: {}, uspKeywords: [], priceSegment: '', industrySubtype: '',
  referenceImages: [], referenceAnalysisComplete: false, extractedStyleProfile: null,
  weeklyPostCount: 4,
  contentMix: { promotional: 30, educational: 25, testimonial: 20, bts: 15, festive: 10 },
  activePlatforms: ['instagram'], preferredPostingTimes: ['09:00', '18:00'],
  autoSchedule: false,
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      ...DEFAULTS,
      setStep: (step) => set({ currentStep: step }),
      setField: (key, value) => set({ [key]: value }),
      setIndustryAnswer: (key, value) =>
        set((s) => ({ industryAnswers: { ...s.industryAnswers, [key]: value } })),
      addReferenceImage: (img) =>
        set((s) => ({ referenceImages: [...s.referenceImages, img] })),
      removeReferenceImage: (index) =>
        set((s) => ({ referenceImages: s.referenceImages.filter((_, i) => i !== index) })),
      setExtractedStyleProfile: (profile) =>
        set({ extractedStyleProfile: profile, referenceAnalysisComplete: true }),
      reset: () => set(DEFAULTS),
    }),
    { name: 'brandvertise_onboarding_v2' }
  )
);
```

---

## STEP 3 — THE 8-STEP ONBOARDING PAGE

File: `src/app/(app)/onboarding/page.tsx`

```tsx
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { useOnboardingStore } from '@/stores/onboarding';
import { useAuth } from '@/context/auth-context';

import { StepIdentity }       from './steps/step-identity';
import { StepIndustry }       from './steps/step-industry';
import { StepPersonality }    from './steps/step-personality';
import { StepVisualIdentity } from './steps/step-visual-identity';
import { StepAudience }       from './steps/step-audience';
import { StepIndustryConfig } from './steps/step-industry-config';
import { StepReferences }     from './steps/step-references';
import { StepCalendarPrefs }  from './steps/step-calendar-prefs';

const STEPS = [
  { id: 1, label: 'Identity',       component: StepIdentity },
  { id: 2, label: 'Industry',       component: StepIndustry },
  { id: 3, label: 'Personality',    component: StepPersonality },
  { id: 4, label: 'Visual Style',   component: StepVisualIdentity },
  { id: 5, label: 'Audience',       component: StepAudience },
  { id: 6, label: 'Your Brand',     component: StepIndustryConfig },
  { id: 7, label: 'References',     component: StepReferences },
  { id: 8, label: 'Content Plan',   component: StepCalendarPrefs },
];

const SLIDE = {
  enter:  { opacity: 0, x: 40 },
  center: { opacity: 1, x: 0 },
  exit:   { opacity: 0, x: -40 },
};

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { currentStep, setStep, reset } = useOnboardingStore();

  // Guard: if already complete, redirect
  useEffect(() => {
    if (user?.onboardingComplete) router.replace('/dashboard');
  }, [user, router]);

  const StepComponent = STEPS[currentStep - 1]?.component;
  if (!StepComponent) return null;

  const goNext = () => {
    if (currentStep < STEPS.length) setStep(currentStep + 1);
  };

  const goBack = () => {
    if (currentStep > 1) setStep(currentStep - 1);
  };

  const handleComplete = async () => {
    // Submit to /api/onboarding/complete — implementation below
    await submitOnboarding();
    router.push('/dashboard');
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--canvas)',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Progress bar — thin top line */}
      <div style={{ height: 2, background: 'var(--border-dim)', position: 'relative' }}>
        <motion.div
          style={{ position: 'absolute', top: 0, left: 0, height: 2, background: 'var(--ai)', borderRadius: 1 }}
          animate={{ width: `${(currentStep / STEPS.length) * 100}%` }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
        />
      </div>

      {/* Step indicator */}
      <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--ai)', boxShadow: '0 0 8px var(--ai)' }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', letterSpacing: '-0.02em' }}>
            brandvertise.ai
          </span>
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-4)', letterSpacing: '0.04em' }}>
          Step {currentStep} of {STEPS.length} — {STEPS[currentStep - 1].label}
        </div>
        {currentStep > 1 && (
          <button
            onClick={() => { reset(); router.push('/dashboard'); }}
            style={{ fontSize: 11, color: 'var(--text-4)', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Skip setup →
          </button>
        )}
      </div>

      {/* Step content */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            variants={SLIDE}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            style={{ width: '100%', maxWidth: 640 }}
          >
            <StepComponent
              onNext={goNext}
              onBack={goBack}
              onComplete={handleComplete}
              isLast={currentStep === STEPS.length}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

async function submitOnboarding() {
  const state = useOnboardingStore.getState();
  const token = await getFirebaseToken(); // use your auth context
  await fetch('/api/onboarding/complete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      // Identity
      brandName:     state.brandName,
      tagline:       state.tagline,
      city:          state.city,
      website:       state.website,
      // Industry
      industry:      state.industry,
      industrySubtype: state.industrySubtype,
      priceSegment:  state.priceSegment,
      // Personality
      tone:          state.tone,
      vibeStyles:    state.vibeStyles,
      // Visual
      colorPrimary:  state.colorPrimary,
      colorSecondary: state.colorSecondary,
      colorAccent:   state.colorAccent,
      fontMood:      state.fontMood,
      logoUrl:       state.logoUrl,
      // Audience
      audienceAgeMin:    state.audienceAgeMin,
      audienceAgeMax:    state.audienceAgeMax,
      audienceGender:    state.audienceGender,
      audienceCity:      state.audienceCity,
      audienceRegion:    state.audienceRegion,
      audienceLifestyle: state.audienceLifestyle,
      // Industry config
      industryAnswers: state.industryAnswers,
      uspKeywords:     state.uspKeywords,
      // Style profile (from vision analysis)
      styleProfile:    state.extractedStyleProfile,
      // Calendar
      weeklyPostCount:        state.weeklyPostCount,
      contentMix:             state.contentMix,
      activePlatforms:        state.activePlatforms,
      preferredPostingTimes:  state.preferredPostingTimes,
      autoSchedule:           state.autoSchedule,
    }),
  });
}
```

---

## STEP 4 — INDUSTRY CONFIG QUESTIONS (THE ADAPTIVE STEP)

File: `src/lib/industry-questions.ts`

This is the intelligence layer. Every industry has its own question set.

```typescript
export interface IndustryQuestion {
  key: string;
  label: string;
  type: 'select' | 'multi_select' | 'text' | 'toggle' | 'chips';
  options?: string[];
  placeholder?: string;
  helpText?: string;
  required?: boolean;
}

export const INDUSTRY_QUESTIONS: Record<string, IndustryQuestion[]> = {
  real_estate: [
    {
      key: 'project_type',
      label: 'What type of property do you deal in?',
      type: 'multi_select',
      options: ['Residential apartments', 'Villas / bungalows', 'Plots / land', 'Commercial office', 'Retail / shops', 'Warehouse / industrial'],
    },
    {
      key: 'price_segment',
      label: 'Your price segment?',
      type: 'select',
      options: ['Affordable (< ₹50L)', 'Mid-range (₹50L–₹1.5Cr)', 'Premium (₹1.5Cr–₹5Cr)', 'Luxury (> ₹5Cr)'],
    },
    {
      key: 'project_status',
      label: 'Project status?',
      type: 'multi_select',
      options: ['Under construction', 'Ready to move', 'New launch', 'Resale'],
    },
    {
      key: 'target_buyer',
      label: 'Primary target buyer?',
      type: 'multi_select',
      options: ['First-time home buyer', 'Investor', 'Upgrader', 'NRI buyer', 'End-user family'],
    },
    {
      key: 'rera_approved',
      label: 'RERA approved?',
      type: 'toggle',
    },
    {
      key: 'key_usps',
      label: 'Key selling points (select up to 5)',
      type: 'multi_select',
      options: ['Location advantage', 'Premium amenities', 'Green building', 'Vastu compliant', 'Gated community', 'Metro connectivity', 'School proximity', 'Hospital proximity', 'Sea/lake view', 'Low maintenance'],
    },
  ],

  restaurant_cafe: [
    {
      key: 'cuisine_type',
      label: 'Cuisine / food type?',
      type: 'multi_select',
      options: ['North Indian', 'South Indian', 'Pan-Asian', 'Continental / Italian', 'Biryani / Mughlai', 'Chinese / Thai', 'Café / Bakery', 'Burgers / Sandwiches', 'Healthy / Salads', 'Desserts / Ice cream', 'Beverages only'],
    },
    {
      key: 'format',
      label: 'Restaurant format?',
      type: 'select',
      options: ['Fine dining', 'Casual dining', 'Café / Bistro', 'Quick service (QSR)', 'Cloud kitchen / Delivery only', 'Food truck', 'Tiffin service'],
    },
    {
      key: 'delivery_platforms',
      label: 'Active on delivery platforms?',
      type: 'multi_select',
      options: ['Swiggy', 'Zomato', 'Dunzo', 'Own delivery', 'Dine-in only'],
    },
    {
      key: 'signature_items',
      label: 'Your 2-3 signature dishes or drinks',
      type: 'text',
      placeholder: 'e.g. Masala Chai, Chicken Biryani, Dark Chocolate Brownie',
    },
    {
      key: 'ambience_vibe',
      label: 'Ambience vibe?',
      type: 'chips',
      options: ['Cozy & intimate', 'Rustic / earthy', 'Modern minimal', 'Vibrant / colorful', 'Traditional', 'Industrial', 'Rooftop / outdoor', 'Family-friendly', 'Romantic'],
    },
    {
      key: 'festive_importance',
      label: 'How important are festive offers for your business?',
      type: 'select',
      options: ['Very important (core revenue)', 'Moderate (seasonal boost)', 'Not very important'],
    },
  ],

  fashion_clothing: [
    {
      key: 'clothing_category',
      label: 'What do you sell?',
      type: 'multi_select',
      options: ['Ethnic wear (women)', 'Western wear (women)', 'Ethnic wear (men)', 'Western wear (men)', 'Kids wear', 'Fusion / Indo-western', 'Bridal & occasion', 'Activewear', 'Accessories'],
    },
    {
      key: 'price_range',
      label: 'Price range per piece?',
      type: 'select',
      options: ['Budget (< ₹500)', 'Mid (₹500–₹2000)', 'Premium (₹2000–₹8000)', 'Luxury (> ₹8000)'],
    },
    {
      key: 'business_model',
      label: 'How do you sell?',
      type: 'multi_select',
      options: ['Own website / D2C', 'Instagram / social selling', 'Physical store', 'Amazon / Flipkart / Meesho', 'Wholesale to retailers'],
    },
    {
      key: 'sustainability_angle',
      label: 'Sustainability or ethical angle?',
      type: 'chips',
      options: ['Handloom / handcrafted', 'Sustainable fabrics', 'Women artisans', 'Slow fashion', 'Organic / natural dyes', 'None of these'],
    },
    {
      key: 'launch_frequency',
      label: 'How often do you launch new collections?',
      type: 'select',
      options: ['Every week', 'Monthly', 'Seasonally (4x/year)', 'On festivals only', 'As available'],
    },
    {
      key: 'festive_revenue_share',
      label: 'What % of revenue comes during festive season?',
      type: 'select',
      options: ['Less than 20%', '20–40%', '40–60%', 'More than 60%'],
    },
  ],

  salon_beauty: [
    {
      key: 'services',
      label: 'Services offered?',
      type: 'multi_select',
      options: ['Haircut & styling', 'Colour & highlights', 'Keratin / straightening', 'Hair spa & treatments', 'Facial & skin treatments', 'Bridal makeup', 'Nail art & gel nails', 'Body waxing & threading', 'Massage & spa', 'Microblading / PMU', 'Laser treatments'],
    },
    {
      key: 'client_gender',
      label: 'Primary clientele?',
      type: 'select',
      options: ['Women only', 'Men only', 'Unisex', 'Family salon'],
    },
    {
      key: 'positioning',
      label: 'Salon positioning?',
      type: 'select',
      options: ['Budget / value (< ₹500 haircut)', 'Mid-range (₹500–₹1500)', 'Premium (₹1500–₹4000)', 'Luxury (> ₹4000)'],
    },
    {
      key: 'bridal_important',
      label: 'Is bridal work a major revenue source?',
      type: 'toggle',
    },
    {
      key: 'transformation_content',
      label: 'Open to sharing before/after transformation posts?',
      type: 'toggle',
    },
    {
      key: 'brand_products',
      label: 'Key product brands you use?',
      type: 'text',
      placeholder: 'e.g. Schwarzkopf, L\'Oréal, Wella, O3+',
    },
  ],

  gym_fitness: [
    {
      key: 'gym_type',
      label: 'Type of fitness facility?',
      type: 'multi_select',
      options: ['Strength & weights gym', 'CrossFit / functional', 'Yoga studio', 'Dance / Zumba studio', 'Mixed fitness', 'Personal training studio', 'Sports-specific training', 'Online / hybrid coaching'],
    },
    {
      key: 'membership_model',
      label: 'Membership model?',
      type: 'multi_select',
      options: ['Monthly membership', 'Annual membership', 'Per session / drop-in', 'Group classes', 'Personal training packages', 'Corporate fitness'],
    },
    {
      key: 'target_fitness_goal',
      label: 'Primary member goal?',
      type: 'multi_select',
      options: ['Weight loss', 'Muscle building', 'General fitness', 'Athletic performance', 'Flexibility & mobility', 'Mental wellness', 'Rehabilitation'],
    },
    {
      key: 'transformation_content',
      label: 'Share member transformation stories?',
      type: 'toggle',
    },
    {
      key: 'challenges_campaigns',
      label: 'Run fitness challenges or campaigns?',
      type: 'toggle',
    },
    {
      key: 'nutrition_supplements',
      label: 'Sell supplements or nutrition products?',
      type: 'toggle',
    },
  ],

  education_coaching: [
    {
      key: 'education_type',
      label: 'Type of education/coaching?',
      type: 'multi_select',
      options: ['School subject tuition', 'Competitive exam (JEE/NEET/UPSC/CAT)', 'Language learning', 'Skill-based course (coding/design/finance)', 'Professional certification', 'Soft skills / personality development', 'Sports coaching', 'Music / arts / dance', 'Early childhood education'],
    },
    {
      key: 'student_age_group',
      label: 'Primary student age group?',
      type: 'multi_select',
      options: ['Age 5–10', 'Age 11–15', 'Age 16–18', 'College students (18–22)', 'Working professionals (22–35)', 'Adults 35+'],
    },
    {
      key: 'delivery_mode',
      label: 'How do you teach?',
      type: 'select',
      options: ['100% offline / classroom', '100% online / live', 'Hybrid (online + offline)', 'Recorded course / self-paced'],
    },
    {
      key: 'highlight_results',
      label: 'Best results to highlight?',
      type: 'text',
      placeholder: 'e.g. 95% selection rate, 100 IIT selections in 2024, ₹15L avg placement',
    },
    {
      key: 'parent_vs_student',
      label: 'Who makes the buying decision?',
      type: 'select',
      options: ['Student decides', 'Parent decides', 'Both equally'],
    },
    {
      key: 'batch_size',
      label: 'Batch model?',
      type: 'select',
      options: ['1:1 personal coaching', 'Small batch (< 15)', 'Medium batch (15–40)', 'Large batch (40+)', 'Self-paced (no batch)'],
    },
  ],

  ecommerce: [
    {
      key: 'product_category',
      label: 'What do you sell?',
      type: 'multi_select',
      options: ['Skincare / beauty', 'Health & supplements', 'Food & beverages', 'Home decor & furnishing', 'Electronics & gadgets', 'Fashion & accessories', 'Baby & kids', 'Pet products', 'Stationery & books', 'Sports & fitness gear', 'Other'],
    },
    {
      key: 'sales_channels',
      label: 'Where do you sell?',
      type: 'multi_select',
      options: ['Own website', 'Amazon India', 'Flipkart', 'Meesho', 'Nykaa', 'Instagram / Social commerce', 'WhatsApp business', 'Offline retail + online'],
    },
    {
      key: 'avg_order_value',
      label: 'Average order value?',
      type: 'select',
      options: ['< ₹300', '₹300–₹800', '₹800–₹2000', '₹2000–₹5000', '> ₹5000'],
    },
    {
      key: 'india_origin',
      label: 'Made in India / local brand?',
      type: 'toggle',
    },
    {
      key: 'key_claim',
      label: 'Your strongest product claim?',
      type: 'text',
      placeholder: 'e.g. No artificial preservatives, Dermatologist tested, 50,000 customers served',
    },
    {
      key: 'subscription_model',
      label: 'Offer subscription / repeat purchase?',
      type: 'toggle',
    },
  ],

  jewellery: [
    {
      key: 'jewellery_type',
      label: 'Type of jewellery?',
      type: 'multi_select',
      options: ['Gold jewellery', 'Diamond jewellery', 'Silver jewellery', 'Kundan / polki', 'Fashion / imitation', 'Gemstone jewellery', 'Lab-grown diamonds', 'Platinum', 'Temple jewellery'],
    },
    {
      key: 'primary_occasions',
      label: 'Primary purchase occasions?',
      type: 'multi_select',
      options: ['Bridal / wedding', 'Festive gifting', 'Everyday wear', 'Investment purchase', 'Anniversary / birthday', 'Corporate gifting'],
    },
    {
      key: 'hallmark_certified',
      label: 'BIS Hallmarked / certified?',
      type: 'toggle',
    },
    {
      key: 'price_segment',
      label: 'Price segment?',
      type: 'select',
      options: ['Budget fashion jewellery', 'Mid-range silver/gold', 'Premium gold/diamond', 'Luxury / bespoke'],
    },
    {
      key: 'bridal_collections',
      label: 'Specialise in bridal collections?',
      type: 'toggle',
    },
    {
      key: 'design_style',
      label: 'Design aesthetic?',
      type: 'chips',
      options: ['Traditional / temple', 'Contemporary / modern', 'Fusion', 'Minimalist / everyday', 'Statement / bold', 'Heritage / antique'],
    },
  ],

  interior_design: [
    {
      key: 'service_type',
      label: 'What services do you offer?',
      type: 'multi_select',
      options: ['Full home interior design', 'Modular kitchen', 'Bedroom design', 'Office / commercial', '3D visualisation', 'Renovation & refurbishment', 'Vastu-compliant design', 'Landscape / outdoor'],
    },
    {
      key: 'price_range',
      label: 'Per sqft cost range?',
      type: 'select',
      options: ['Economy (< ₹800/sqft)', 'Mid-range (₹800–₹1800/sqft)', 'Premium (₹1800–₹3500/sqft)', 'Luxury (> ₹3500/sqft)'],
    },
    {
      key: 'design_style',
      label: 'Your signature design style?',
      type: 'chips',
      options: ['Modern minimal', 'Contemporary', 'Traditional / ethnic', 'Scandinavian', 'Industrial', 'Japandi', 'Maximalist / bold', 'Luxury / opulent', 'Nature-inspired'],
    },
    {
      key: 'project_type',
      label: 'Typical projects?',
      type: 'multi_select',
      options: ['New flat / apartment', 'Independent villa / house', 'Penthouse / luxury home', 'Office space', 'Retail store / showroom', 'Hotel / hospitality'],
    },
    {
      key: 'portfolio_sharing',
      label: 'Ready to share before/after project photos regularly?',
      type: 'toggle',
    },
  ],

  consultant: [
    {
      key: 'consulting_domain',
      label: 'Area of expertise?',
      type: 'multi_select',
      options: ['Business strategy', 'Marketing & branding', 'Financial / CA / tax', 'Legal / compliance', 'HR & talent', 'Technology / IT consulting', 'Startup / growth consulting', 'Export / import', 'Real estate consulting', 'Life / executive coaching'],
    },
    {
      key: 'client_type',
      label: 'Primary clients?',
      type: 'multi_select',
      options: ['Startups', 'SMEs / MSMEs', 'Corporates', 'Individuals / professionals', 'Non-profits / NGOs', 'Government bodies'],
    },
    {
      key: 'engagement_model',
      label: 'How do you work?',
      type: 'multi_select',
      options: ['Project-based consulting', 'Monthly retainer', 'Per session / hourly', 'Online / remote only', 'In-person / on-site', 'Workshops & training'],
    },
    {
      key: 'key_result',
      label: 'Strongest result you\'ve delivered for a client?',
      type: 'text',
      placeholder: 'e.g. 3x revenue growth in 6 months, saved ₹40L in tax, secured ₹2Cr funding',
    },
    {
      key: 'thought_leadership',
      label: 'Open to posting educational / thought leadership content?',
      type: 'toggle',
    },
  ],
};
```

---

## STEP 5 — REFERENCE IMAGE UPLOAD & VISION ANALYSIS

### Frontend: `src/components/onboarding/reference-uploader.tsx`

```tsx
'use client';
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, CheckCircle2, Loader2, Image as ImageIcon } from 'lucide-react';
import { useOnboardingStore } from '@/stores/onboarding';

export function ReferenceUploader() {
  const { referenceImages, addReferenceImage, removeReferenceImage } = useOnboardingStore();
  const [analysing, setAnalysing] = useState(false);
  const [analysisError, setAnalysisError] = useState('');

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (referenceImages.length + acceptedFiles.length > 10) {
      setAnalysisError('Maximum 10 reference images allowed');
      return;
    }

    for (const file of acceptedFiles) {
      // Convert to base64
      const base64 = await fileToBase64(file);
      addReferenceImage({
        url: base64,
        fileName: file.name,
        analysed: false,
      });
    }
  }, [referenceImages, addReferenceImage]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': [], 'image/png': [], 'image/webp': [] },
    maxSize: 5 * 1024 * 1024, // 5MB per image
  });

  const analyseAll = async () => {
    if (referenceImages.length === 0) return;
    setAnalysing(true);
    setAnalysisError('');

    try {
      const token = await getFirebaseToken();
      const res = await fetch('/api/vision/analyse-references', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          images: referenceImages.map(img => ({
            base64: img.url,
            fileName: img.fileName,
          })),
        }),
      });

      if (!res.ok) throw new Error('Analysis failed');
      const { styleProfile } = await res.json();
      useOnboardingStore.getState().setExtractedStyleProfile(styleProfile);
    } catch (err) {
      setAnalysisError('Analysis failed. You can skip this step and continue.');
    } finally {
      setAnalysing(false);
    }
  };

  const { extractedStyleProfile, referenceAnalysisComplete } = useOnboardingStore();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Drop zone */}
      <div
        {...getRootProps()}
        style={{
          border: `1.5px dashed ${isDragActive ? 'var(--ai)' : 'var(--border-loud)'}`,
          borderRadius: 12,
          padding: '32px 24px',
          textAlign: 'center',
          cursor: 'pointer',
          background: isDragActive ? 'var(--ai-bg)' : 'var(--surface-1)',
          transition: 'all 0.2s',
        }}
      >
        <input {...getInputProps()} />
        <Upload size={24} color="var(--text-4)" style={{ margin: '0 auto 10px' }} />
        <p style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 4, fontWeight: 500 }}>
          Drop inspiration images here
        </p>
        <p style={{ fontSize: 12, color: 'var(--text-4)', lineHeight: 1.5 }}>
          Upload competitor posts, ads, mood boards — anything that shows the style you like.<br />
          Up to 10 images · JPG, PNG, WebP · Max 5MB each
        </p>
      </div>

      {/* Uploaded images grid */}
      {referenceImages.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
          {referenceImages.map((img, i) => (
            <div key={i} style={{ position: 'relative', aspectRatio: '1', borderRadius: 8, overflow: 'hidden' }}>
              <img src={img.url} alt={img.fileName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <button
                onClick={() => removeReferenceImage(i)}
                style={{
                  position: 'absolute', top: 4, right: 4,
                  width: 20, height: 20, borderRadius: '50%',
                  background: 'rgba(0,0,0,0.7)', border: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <X size={11} color="#fff" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Analyse button */}
      {referenceImages.length > 0 && !referenceAnalysisComplete && (
        <button
          onClick={analyseAll}
          disabled={analysing}
          style={{
            padding: '10px 20px',
            background: 'var(--ai)',
            border: 'none',
            borderRadius: 8,
            color: '#000',
            fontSize: 13,
            fontWeight: 500,
            cursor: analysing ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          {analysing ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <ImageIcon size={14} />}
          {analysing ? 'Analysing your style...' : `Analyse ${referenceImages.length} image${referenceImages.length > 1 ? 's' : ''}`}
        </button>
      )}

      {/* Analysis complete */}
      {referenceAnalysisComplete && extractedStyleProfile && (
        <div style={{
          background: 'var(--success-bg)',
          border: '1px solid rgba(16,185,129,0.25)',
          borderRadius: 10,
          padding: '14px 16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <CheckCircle2 size={16} color="var(--success)" />
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--success)' }}>Style profile extracted</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {extractedStyleProfile.moodKeywords.map((kw, i) => (
              <span key={i} style={{
                fontSize: 11, padding: '2px 8px', borderRadius: 4,
                background: 'rgba(16,185,129,0.1)', color: 'var(--success)',
                border: '1px solid rgba(16,185,129,0.2)',
              }}>
                {kw}
              </span>
            ))}
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 8 }}>
            {extractedStyleProfile.dominantAesthetic} · {extractedStyleProfile.photographyStyle} · {extractedStyleProfile.layoutStyle}
          </p>
        </div>
      )}

      {analysisError && (
        <p style={{ fontSize: 12, color: 'var(--alert)' }}>{analysisError}</p>
      )}
    </div>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
```

---

## STEP 6 — BACKEND: VISION ANALYSER

File: `backend/lib/vision-analyser.js`

```javascript
const { GoogleGenAI } = require('@google/genai');
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const VISION_SYSTEM_PROMPT = `You are a professional brand visual analyst and creative director. 
You analyse social media content, advertisements, and brand imagery to extract precise visual style characteristics.
Always respond with valid JSON only — no markdown, no explanation.`;

const VISION_USER_PROMPT = `Analyse these brand reference images and extract the visual style profile.

Look for:
1. Dominant colour palette (list top 5 hex colours approximately)
2. Typography mood (serif_elegant / sans_modern / display_bold / script_personal / mono_technical)
3. Layout style (minimal_clean / busy_energetic / editorial_structured / grid_based / fullbleed_hero)
4. Photography style (lifestyle_candid / product_studio / editorial_fashion / food_closeup / architectural / documentary)
5. Mood keywords (list 5–8 words describing the overall feeling: e.g. warm, aspirational, energetic, luxurious, trustworthy)
6. Composition style (centered_hero / rule_of_thirds / flat_lay_overhead / portrait_close / wide_establishing)
7. Text density on images (heavy_text / moderate_text / minimal_text / text_free)
8. Dominant aesthetic label (one phrase: e.g. "warm luxury editorial", "bold energetic youth", "minimal clean modern", "traditional festive Indian")

Respond ONLY with this JSON:
{
  "extractedColors": ["#hex1", "#hex2", "#hex3", "#hex4", "#hex5"],
  "fontMoodDetected": "one of the 5 options",
  "layoutStyle": "one of the 4 options",
  "photographyStyle": "one of the 6 options",
  "moodKeywords": ["word1", "word2", "word3", "word4", "word5"],
  "compositionStyle": "one of the 5 options",
  "textDensity": "one of the 4 options",
  "dominantAesthetic": "short descriptive phrase"
}`;

async function analyseReferenceImages(imageBase64Array) {
  // Build content parts — text + all images
  const parts = [
    { text: VISION_USER_PROMPT },
    ...imageBase64Array.slice(0, 10).map(({ base64, fileName }) => {
      // Extract just the base64 data (remove data:image/jpeg;base64, prefix)
      const mimeMatch = base64.match(/data:([^;]+);base64,/);
      const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
      const data = base64.replace(/^data:[^;]+;base64,/, '');
      return {
        inlineData: { data, mimeType }
      };
    })
  ];

  const result = await genAI.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [{ role: 'user', parts }],
    config: {
      systemInstruction: VISION_SYSTEM_PROMPT,
      temperature: 0.2, // Low temperature for consistent extraction
      maxOutputTokens: 500,
    }
  });

  const raw = result.candidates[0].content.parts[0].text;
  const clean = raw.replace(/```json\n?|\n?```/g, '').trim();

  try {
    return JSON.parse(clean);
  } catch {
    // Fallback with sensible defaults if parsing fails
    return {
      extractedColors: ['#000000', '#ffffff', '#888888'],
      fontMoodDetected: 'sans_modern',
      layoutStyle: 'minimal_clean',
      photographyStyle: 'lifestyle_candid',
      moodKeywords: ['professional', 'clean', 'modern'],
      compositionStyle: 'centered_hero',
      textDensity: 'moderate_text',
      dominantAesthetic: 'clean modern professional',
    };
  }
}

module.exports = { analyseReferenceImages };
```

---

## STEP 7 — BACKEND: NEW API ROUTES

File: `backend/routes/onboarding.js` — ADD these routes (keep existing `/complete`):

```javascript
const { analyseReferenceImages } = require('../lib/vision-analyser');
const { verifyFirebaseToken } = require('../middleware/auth');
const db = require('../db');

// ─── Vision Analysis ──────────────────────────────────────────────────────────
router.post('/vision/analyse-references', verifyFirebaseToken, async (req, res) => {
  try {
    const { images } = req.body;
    if (!images || images.length === 0) {
      return res.status(400).json({ error: 'No images provided' });
    }
    if (images.length > 10) {
      return res.status(400).json({ error: 'Maximum 10 images' });
    }

    const styleProfile = await analyseReferenceImages(images);
    res.json({ styleProfile });
  } catch (err) {
    console.error('Vision analysis error:', err);
    res.status(500).json({ error: 'Analysis failed', message: err.message });
  }
});

// ─── Complete onboarding — REWRITE existing handler ──────────────────────────
router.post('/complete', verifyFirebaseToken, async (req, res) => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');

    const uid = req.user.uid;
    const {
      brandName, tagline, city, website,
      industry, industrySubtype, priceSegment,
      tone, vibeStyles,
      colorPrimary, colorSecondary, colorAccent, fontMood, logoUrl,
      audienceAgeMin, audienceAgeMax, audienceGender, audienceCity, audienceRegion, audienceLifestyle,
      industryAnswers, uspKeywords,
      styleProfile,
      weeklyPostCount, contentMix, activePlatforms, preferredPostingTimes, autoSchedule,
    } = req.body;

    // 1. Get user's DB id
    const userRow = await client.query('SELECT id FROM users WHERE firebase_uid = $1', [uid]);
    if (userRow.rows.length === 0) return res.status(404).json({ error: 'user_not_found' });
    const userId = userRow.rows[0].id;

    // 2. Upsert brand
    const brandRes = await client.query(`
      INSERT INTO brands (
        user_id, name, description, industry, tone, styles, platforms, goals,
        color_primary, color_secondary, color_accent, font_mood, visual_style,
        industry_subtype, price_segment, posting_frequency, content_mix, platform_priority,
        audience_age_min, audience_age_max, audience_gender, audience_location, audience_interests,
        is_default, onboarding_version
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,true,2)
      ON CONFLICT (user_id) WHERE is_default = true
      DO UPDATE SET
        name=$2, description=$3, industry=$4, tone=$5, styles=$6, platforms=$7, goals=$8,
        color_primary=$9, color_secondary=$10, color_accent=$11, font_mood=$12, visual_style=$13,
        industry_subtype=$14, price_segment=$15, posting_frequency=$16, content_mix=$17, platform_priority=$18,
        audience_age_min=$19, audience_age_max=$20, audience_gender=$21, audience_location=$22,
        audience_interests=$23, updated_at=NOW(), onboarding_version=2
      RETURNING id
    `, [
      userId, brandName, tagline, industry, tone,
      JSON.stringify(vibeStyles || []),
      JSON.stringify(activePlatforms || []),
      JSON.stringify([]),
      colorPrimary, colorSecondary, colorAccent, fontMood, null,
      industrySubtype, priceSegment, weeklyPostCount,
      JSON.stringify(contentMix || {}),
      JSON.stringify(activePlatforms || []),
      audienceAgeMin, audienceAgeMax, audienceGender,
      [audienceCity, audienceRegion].filter(Boolean).join(', '),
      JSON.stringify(audienceLifestyle || []),
    ]);
    const brandId = brandRes.rows[0].id;

    // 3. Upsert style profile (if vision analysis was done)
    if (styleProfile) {
      await client.query(`
        INSERT INTO brand_style_profiles (
          brand_id, extracted_colors, font_mood_detected, layout_style,
          photography_style, mood_keywords, composition_style, text_density,
          dominant_aesthetic, analysed_at
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW())
        ON CONFLICT (brand_id) DO UPDATE SET
          extracted_colors=$2, font_mood_detected=$3, layout_style=$4,
          photography_style=$5, mood_keywords=$6, composition_style=$7,
          text_density=$8, dominant_aesthetic=$9, analysed_at=NOW()
      `, [
        brandId,
        JSON.stringify(styleProfile.extractedColors || []),
        styleProfile.fontMoodDetected,
        styleProfile.layoutStyle,
        styleProfile.photographyStyle,
        JSON.stringify(styleProfile.moodKeywords || []),
        styleProfile.compositionStyle,
        styleProfile.textDensity,
        styleProfile.dominantAesthetic,
      ]);
    }

    // 4. Upsert industry config
    await client.query(`
      INSERT INTO brand_industry_configs (brand_id, industry, subtype, price_segment, usp_keywords, industry_answers)
      VALUES ($1,$2,$3,$4,$5,$6)
      ON CONFLICT (brand_id) DO UPDATE SET
        industry=$2, subtype=$3, price_segment=$4, usp_keywords=$5, industry_answers=$6, updated_at=NOW()
    `, [
      brandId, industry, industrySubtype, priceSegment,
      JSON.stringify(uspKeywords || []),
      JSON.stringify(industryAnswers || {}),
    ]);

    // 5. Upsert calendar preferences
    await client.query(`
      INSERT INTO content_calendar_preferences (brand_id, weekly_post_count, content_type_mix, auto_schedule, preferred_posting_times, active_platforms)
      VALUES ($1,$2,$3,$4,$5,$6)
      ON CONFLICT (brand_id) DO UPDATE SET
        weekly_post_count=$2, content_type_mix=$3, auto_schedule=$4,
        preferred_posting_times=$5, active_platforms=$6, updated_at=NOW()
    `, [
      brandId, weeklyPostCount,
      JSON.stringify(contentMix || {}),
      autoSchedule,
      JSON.stringify(preferredPostingTimes || []),
      JSON.stringify(activePlatforms || []),
    ]);

    // 6. Mark user onboarding complete
    await client.query(
      'UPDATE users SET onboarding_complete=true, updated_at=NOW() WHERE firebase_uid=$1',
      [uid]
    );

    await client.query('COMMIT');
    res.json({ success: true, brandId });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Onboarding complete error:', err);
    res.status(500).json({ error: 'onboarding_failed', message: err.message });
  } finally {
    client.release();
  }
});
```

Register in `backend/server.js`:
```javascript
// Add this line (the vision route is on the same onboarding router):
app.use('/api/vision', require('./routes/onboarding'));
// The /api/onboarding route is already registered
```

---

## STEP 8 — THE INTELLIGENT PROMPT ENGINE

File: `backend/lib/prompt-engine.js` — COMPLETE REWRITE

```javascript
/**
 * BRANDVERTISE AI — INTELLIGENT PROMPT ENGINE v2
 * 
 * This engine builds multi-layer prompts from a brand's complete intelligence profile.
 * It combines: identity + visual DNA + industry context + calendar type + platform rules.
 * 
 * Every generation call fetches the full brand context from DB in a single JOIN query.
 */

// ─── Fetch complete brand context ─────────────────────────────────────────────

async function fetchCompleteBrandContext(userId, db) {
  const result = await db.query(`
    SELECT
      b.*,
      bsp.extracted_colors,
      bsp.font_mood_detected,
      bsp.layout_style,
      bsp.photography_style,
      bsp.mood_keywords,
      bsp.composition_style,
      bsp.text_density,
      bsp.dominant_aesthetic,
      bic.industry_answers,
      bic.usp_keywords,
      bic.subtype as industry_subtype,
      ccp.weekly_post_count,
      ccp.content_type_mix,
      ccp.active_platforms
    FROM brands b
    LEFT JOIN brand_style_profiles bsp ON bsp.brand_id = b.id
    LEFT JOIN brand_industry_configs bic ON bic.brand_id = b.id
    LEFT JOIN content_calendar_preferences ccp ON ccp.brand_id = b.id
    WHERE b.user_id = (SELECT id FROM users WHERE firebase_uid = $1)
      AND b.is_default = true
    LIMIT 1
  `, [userId]);

  return result.rows[0] || null;
}

// ─── Main prompt builder ──────────────────────────────────────────────────────

function buildSystemPrompt(brand) {
  const tone = getToneDescriptor(brand.tone || 50);
  const vibeStyles = parseJsonField(brand.styles, []);
  const moodKeywords = brand.mood_keywords || [];
  const uspKeywords = brand.usp_keywords || [];
  const industryRules = getIndustryRules(brand.industry);

  return `You are the AI content engine for ${brand.name || 'this brand'}.

═══ BRAND IDENTITY ═══
Business: ${brand.name}
Description: ${brand.description || 'A growing Indian brand'}
Industry: ${brand.industry || 'general'} ${brand.industry_subtype ? `(${brand.industry_subtype})` : ''}
Location: ${brand.audience_location || 'India'}
${uspKeywords.length > 0 ? `Key USPs: ${uspKeywords.join(', ')}` : ''}
${brand.price_segment ? `Price positioning: ${brand.price_segment}` : ''}

═══ BRAND VOICE ═══
Tone: ${tone} (${brand.tone || 50}/100 — 0=casual, 100=professional)
Personality: ${vibeStyles.join(', ') || 'professional'}
${getToneInstructions(brand.tone, vibeStyles)}

═══ VISUAL DNA (from reference analysis) ═══
${brand.dominant_aesthetic ? `Overall aesthetic: ${brand.dominant_aesthetic}` : ''}
${brand.photography_style ? `Photography style: ${formatPhotographyStyle(brand.photography_style)}` : ''}
${brand.layout_style ? `Layout preference: ${formatLayoutStyle(brand.layout_style)}` : ''}
${brand.font_mood || brand.font_mood_detected ? `Typography feel: ${formatFontMood(brand.font_mood || brand.font_mood_detected)}` : ''}
${moodKeywords.length > 0 ? `Visual mood: ${moodKeywords.join(', ')}` : ''}
${parseJsonField(brand.extracted_colors, []).length > 0 ? `Brand colours: ${parseJsonField(brand.extracted_colors, []).join(', ')}` : ''}
Brand primary colour: ${brand.color_primary || 'not set'}
Brand secondary colour: ${brand.color_secondary || 'not set'}

═══ TARGET AUDIENCE ═══
Age: ${brand.audience_age_min || 22}–${brand.audience_age_max || 45} years
Gender: ${formatGender(brand.audience_gender)}
Location: ${brand.audience_location || 'India'}
Lifestyle: ${parseJsonField(brand.audience_interests, []).join(', ') || 'general Indian consumer'}

═══ INDUSTRY-SPECIFIC RULES ═══
${industryRules}

═══ OUTPUT FORMAT ═══
Always respond with valid JSON only. No markdown, no explanation outside the JSON.
{
  "caption": "Full post caption with appropriate emojis",
  "hashtags": ["tag1", "tag2"],
  "imagePrompt": "Detailed image generation prompt",
  "suggestedFont": "Font recommendation for text overlay",
  "suggestedLayout": "Layout description for designer",
  "colorUsage": "How to use brand colours in this post"
}

CRITICAL RULES:
- Caption must feel written by a real human, not an AI
- Never start caption with the brand name
- First line must hook immediately — no preamble
- Image prompt must reference the brand's visual style, not just the content
- Hashtags: 8–12, mix of broad (high volume) and niche (community)
- Always write in English unless brand is clearly non-English`;
}

function buildUserPrompt(brand, request) {
  const { platform, contentType, brief, contentCategory, mood, imageRatio } = request;
  const platformGuide = getPlatformGuide(platform, contentType);
  const contentCategoryInstructions = getContentCategoryInstructions(contentCategory, brand);
  const photographyStyle = brand.photography_style || 'lifestyle_candid';
  const dominantAesthetic = brand.dominant_aesthetic || 'clean modern professional';
  const extractedColors = parseJsonField(brand.extracted_colors, []);

  return `Create a ${contentType} post for ${platform}.

POST BRIEF: ${brief}
${contentCategory ? `CONTENT CATEGORY: ${contentCategory}` : ''}
${mood ? `MOOD OVERRIDE: ${mood}` : ''}
${imageRatio ? `IMAGE FORMAT: ${imageRatio}` : ''}

${platformGuide}

${contentCategoryInstructions}

IMAGE PROMPT REQUIREMENTS:
- Visual style: ${dominantAesthetic}
- Photography approach: ${formatPhotographyStyle(photographyStyle)}
- Colour references: ${extractedColors.length > 0 ? extractedColors.slice(0, 3).join(', ') : `${brand.color_primary || '#000'} as primary`}
- The image should feel like it belongs in the brand's existing feed
- ${getIndiaCulturalContext(brand)}
- End with: "Commercial quality, ultra-sharp, 8K resolution"

INDIA MARKET CONTEXT:
- Prices in ₹ (Indian Rupees) always
- Indian cultural sensitivities respected
- Indian urban/suburban lifestyle references where relevant`;
}

// ─── Helper functions ─────────────────────────────────────────────────────────

function getToneDescriptor(tone) {
  if (tone <= 20) return 'Very casual — like texting a close friend';
  if (tone <= 40) return 'Conversational — warm, approachable, friendly';
  if (tone <= 60) return 'Balanced — friendly yet credible';
  if (tone <= 80) return 'Professional — authoritative but approachable';
  return 'Very professional — formal, precise, corporate';
}

function getToneInstructions(tone, vibeStyles) {
  const instructions = [];
  if (tone <= 40) {
    instructions.push('Use contractions, casual language, short punchy sentences');
    instructions.push('Emojis are encouraged and expected by this audience');
  } else if (tone >= 70) {
    instructions.push('Complete sentences, no slang, measured language');
    instructions.push('Minimal emojis — only where genuinely appropriate');
  }
  if (vibeStyles.includes('luxury') || vibeStyles.includes('Luxury'))
    instructions.push('Aspirational language — exclusivity, craftsmanship, timeless value');
  if (vibeStyles.includes('energetic') || vibeStyles.includes('Energetic'))
    instructions.push('High-energy language — action verbs, exclamation, urgency');
  if (vibeStyles.includes('warm') || vibeStyles.includes('Warm'))
    instructions.push('Warm, human, empathetic — speak to emotions not just features');
  if (vibeStyles.includes('bold') || vibeStyles.includes('Bold'))
    instructions.push('Strong confident statements — no hedging, no "we think", direct assertions');
  if (vibeStyles.includes('minimal') || vibeStyles.includes('Minimal'))
    instructions.push('Fewer words, more impact — every word must earn its place');
  return instructions.join('. ');
}

function getPlatformGuide(platform, contentType) {
  const guides = {
    instagram: `INSTAGRAM RULES:
- Caption: 150–300 chars for feed posts (first 125 visible before "more")
- Line breaks for readability (separate paragraphs)
- End with a clear CTA or question to drive comments
- Hashtags as first comment OR at end of caption`,

    linkedin: `LINKEDIN RULES:
- Open with a bold statement or insight (drives comments)
- Single-line paragraphs with space between (LinkedIn format)
- Professional insight or personal story — no promotional tone on first post
- End with a direct question to drive engagement
- Max 3–5 hashtags, professional only`,

    twitter: `TWITTER/X RULES:
- Main hook: under 220 chars (leave room for engagement)
- Punchy, opinionated, or surprising opening
- Max 2 hashtags, integrated naturally
- Conversational, real-time feeling`,

    facebook: `FACEBOOK RULES:
- Longer form works — community feel
- Speak to "our customers" / "our community" language
- Questions and polls drive engagement
- Local references work well`,

    tiktok: `TIKTOK RULES:
- Caption is secondary (video-first platform)
- Short hook: what's the video about in 1 line
- Trending audio/format references are a bonus
- Image prompt = thumbnail concept`,

    youtube: `YOUTUBE RULES:
- Caption = video description (informative, keyword-rich)
- Include what the video covers in first 100 chars
- Image prompt = compelling thumbnail concept`,
  };
  return guides[platform?.toLowerCase()] || `Create engaging ${contentType} content for ${platform}.`;
}

function getContentCategoryInstructions(category, brand) {
  const instructions = {
    promotional: `This is a PROMOTIONAL post. Goal: drive immediate action (purchase, enquiry, visit, booking).
- Lead with the offer or value proposition
- Include specific details: price, deadline, what they get
- Strong CTA: "Book now", "Shop today", "Call us", "DM for details"`,

    educational: `This is an EDUCATIONAL post. Goal: position the brand as an expert, build trust.
- Teach something genuinely useful (tip, myth-bust, how-to, insight)
- No hard selling — the expertise IS the value
- CTA: "Save this", "Share with someone who needs this"`,

    testimonial: `This is a TESTIMONIAL/SOCIAL PROOF post. Goal: build trust through real customer stories.
- Feature a specific result or transformation
- Make it feel authentic, not scripted
- CTA: "Your success story could be next →"`,

    bts: `This is a BEHIND-THE-SCENES post. Goal: humanise the brand, build connection.
- Show the process, the team, or the craft
- Conversational, candid, no-filter feeling
- "This is how we do it" energy`,

    festive: `This is a FESTIVE post. Identify the current Indian festival context from the brand's industry and create appropriate festive content.
- Warm, celebratory, inclusive
- Brand is secondary — emotion is primary
- Optional: tie in a relevant offer if promotional festive`,
  };
  return category ? (instructions[category] || '') : '';
}

function getIndustryRules(industry) {
  const rules = {
    real_estate: `- Always mention location (city/area) in caption
- Include RERA mention if available (builds legal trust)
- Prices in ₹ with unit (₹85 Lakhs, ₹1.2 Cr)
- Image prompts: architectural photography, golden hour preferred, lush greenery around building
- Never show empty buildings — show life, aspiration, community`,

    restaurant_cafe: `- Mention specific food/drink items by name
- Include pricing if it's a specific offer
- Location and hours if event-based
- Image prompts: warm amber food photography, steam rising, close-up textures, lifestyle settings
- Emojis expected: ☕ 🍽️ 🌶️ etc.`,

    fashion_clothing: `- Mention the collection name or specific piece
- Size inclusivity language where appropriate
- Include price range or "Shop now" CTA
- Image prompts: editorial fashion photography, Indian model, Indian setting or minimal studio
- Indian fashion context: note ethnic wear specifically`,

    salon_beauty: `- Specific treatment names and prices
- Before/after transformation signal when relevant
- Booking CTA: "DM to book" / "Call to book"
- Image prompts: beauty portrait close-ups, soft diffused light, skin/hair detail`,

    gym_fitness: `- Motivational, action-oriented language
- Class name, timing, batch details if relevant
- Membership pricing if offer post
- Image prompts: high contrast gym photography, dramatic lighting, action shots`,

    education_coaching: `- Course/batch name and key result claims
- Enrollment deadline creates urgency
- Success stats (pass rates, placements) build credibility
- Image prompts: bright aspirational student photography, achievement moments`,

    ecommerce: `- Product name + key claim in first line
- Price + offer clearly stated
- "Free shipping across India" if applicable
- Image prompts: clean product photography on white or marble, or lifestyle usage shot`,

    jewellery: `- Metal purity (916 gold, 18K, 92.5 silver) builds trust
- Occasion tagging (bridal, gifting, everyday)
- Collection name
- Image prompts: macro jewellery photography, velvet backgrounds, natural highlights`,

    interior_design: `- Project location and type if portfolio post
- Budget range if service post
- "Schedule a free consultation" CTA
- Image prompts: ultra-high-end interior photography, natural light, no people`,

    consultant: `- Specific result or insight — vague claims don't convert
- Professional authority tone
- "Book a discovery call" CTA
- Image prompts: professional portrait or clean minimal brand imagery`,
  };
  return rules[industry] || `Create content appropriate for the ${industry || 'general'} industry in India.`;
}

function getIndiaCulturalContext(brand) {
  const location = brand.audience_location || 'India';
  if (location.toLowerCase().includes('mumbai'))
    return 'Mumbai urban context — fast-paced, cosmopolitan, aspiration-driven';
  if (location.toLowerCase().includes('delhi') || location.toLowerCase().includes('ncr'))
    return 'Delhi/NCR context — power, prestige, family values';
  if (location.toLowerCase().includes('bangalore') || location.toLowerCase().includes('bengaluru'))
    return 'Bangalore context — tech-forward, young professional, startup culture';
  if (location.toLowerCase().includes('chennai'))
    return 'Chennai context — traditional values with modern outlook, Tamil cultural sensitivity';
  if (location.toLowerCase().includes('hyderabad'))
    return 'Hyderabad context — blend of tradition and tech, Telangana cultural sensitivity';
  return 'Indian urban consumer context — aspirational, value-conscious, digital-first';
}

function formatPhotographyStyle(style) {
  const map = {
    lifestyle_candid: 'candid lifestyle photography — real moments, natural light',
    product_studio: 'clean product studio photography — white/marble background, perfect lighting',
    editorial_fashion: 'editorial fashion photography — styled, high-fashion aesthetic',
    food_closeup: 'macro food photography — texture, steam, close-up detail, warm tones',
    architectural: 'architectural photography — dramatic angles, wide-angle, golden hour',
    documentary: 'documentary photography — authentic, raw, real people and moments',
  };
  return map[style] || style;
}

function formatLayoutStyle(style) {
  const map = {
    minimal_clean: 'minimal layout with generous white space, content breathes',
    busy_energetic: 'dynamic multi-element layout, high energy composition',
    editorial_structured: 'editorial grid layout, structured hierarchy',
    grid_based: 'organized grid composition',
    fullbleed_hero: 'full-bleed hero image with text overlay',
  };
  return map[style] || style;
}

function formatFontMood(mood) {
  const map = {
    serif_elegant: 'serif typeface — elegant, traditional, timeless (Playfair Display, Cormorant)',
    sans_modern: 'clean sans-serif — modern, accessible, clear (Geist, DM Sans)',
    display_bold: 'bold display face — impact, energy, statement (Bebas Neue, Syne ExtraBold)',
    script_personal: 'script / handwritten — personal, warm, artisanal',
    mono_technical: 'monospace — technical, precise, data-driven',
  };
  return map[mood] || mood;
}

function formatGender(gender) {
  const map = { mixed: 'all genders', mostly_male: 'predominantly male', mostly_female: 'predominantly female' };
  return map[gender] || 'all genders';
}

function parseJsonField(field, defaultValue) {
  if (!field) return defaultValue;
  if (typeof field === 'string') {
    try { return JSON.parse(field); } catch { return defaultValue; }
  }
  return Array.isArray(field) ? field : defaultValue;
}

function getToneTemperature(tone) {
  // Casual = creative = higher temp (0.9)
  // Professional = controlled = lower temp (0.5)
  return 0.9 - ((tone || 50) / 100) * 0.4;
}

module.exports = {
  fetchCompleteBrandContext,
  buildSystemPrompt,
  buildUserPrompt,
  getToneTemperature,
};
```

---

## STEP 9 — UPDATE THE GENERATE ROUTE

In `backend/routes/post.js`, update `generatePost` to use the new engine:

```javascript
const { fetchCompleteBrandContext, buildSystemPrompt, buildUserPrompt, getToneTemperature } = require('../lib/prompt-engine');

async function generatePost(req, res) {
  const { platform, contentType, brief, contentCategory, mood, imageRatio } = req.body;

  // 1. Fetch COMPLETE brand context (one JOIN query)
  const brand = await fetchCompleteBrandContext(req.user.uid, db);
  if (!brand) return res.status(404).json({ error: 'brand_not_found', message: 'Complete brand setup first' });

  // 2. Check credits
  if (brand.credits < 2) return res.status(402).json({ error: 'insufficient_credits' });

  // 3. Build intelligent prompts
  const systemPrompt = buildSystemPrompt(brand);
  const userPrompt   = buildUserPrompt(brand, { platform, contentType, brief, contentCategory, mood, imageRatio });

  // 4. Generate with calibrated temperature
  const temperature = getToneTemperature(brand.tone);
  const textResult = await genAI.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
    config: { systemInstruction: systemPrompt, temperature, maxOutputTokens: 1000 }
  });

  // ... rest of generation logic stays the same
}
```

---

## STEP 10 — REGISTER ALL NEW ROUTES IN SERVER.JS

```javascript
// backend/server.js — add these if not already present:
app.use('/api/onboarding', require('./routes/onboarding'));
app.use('/api/vision',     require('./routes/onboarding')); // same router handles /vision/*
```

---

## DONE CHECKLIST

- [ ] Migration SQL runs clean on Neon — 4 new tables/columns created
- [ ] `useOnboardingStore` has all new fields and persists to localStorage
- [ ] Onboarding page renders 8 steps with smooth AnimatePresence transitions
- [ ] Step 2 (Industry) renders visual tile grid with 10+ industries
- [ ] Step 6 renders adaptive questions based on selected industry — real estate questions ≠ café questions
- [ ] Step 7 (References) allows drag/drop upload of up to 10 images
- [ ] Analyse button calls `/api/vision/analyse-references` with Gemini Vision
- [ ] Style profile is displayed after analysis (colour chips, mood keywords, aesthetic label)
- [ ] `/api/onboarding/complete` saves to all 4 DB tables in a transaction
- [ ] `fetchCompleteBrandContext` does a single JOIN across all brand tables
- [ ] `buildSystemPrompt` includes visual DNA from reference analysis
- [ ] `buildUserPrompt` adapts by platform, contentType, and contentCategory
- [ ] Temperature is calibrated by tone (casual=0.9, professional=0.5)
- [ ] Image prompt in output references the brand's detected photography style
- [ ] No TypeScript errors, Vercel build passes
- [ ] Existing generate page works without any changes to the frontend form

## TEST INSTRUCTIONS

1. Create new account → hit `/onboarding`
2. Step 2: Select "Restaurant / Café" → verify Step 6 shows café-specific questions (cuisine, format, delivery platforms)
3. Step 2: Go back, select "Real Estate" → verify Step 6 shows real estate questions (project type, RERA, buyer type)
4. Step 7: Upload 3–5 Instagram screenshots from a competitor café → click Analyse → verify style profile appears with mood keywords and aesthetic label
5. Complete onboarding → check Neon DB: brands, brand_style_profiles, brand_industry_configs, content_calendar_preferences all have rows
6. Go to `/generate` → generate a post → verify the generated imagePrompt references the photography style from the uploaded references (e.g. "warm food photography" not just generic)
7. Check the caption tone matches the slider setting from onboarding
