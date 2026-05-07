'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import useSWR, { useSWRConfig } from 'swr'
import {
  Save,
  Upload,
  Loader2,
  Check,
  Minus,
  Plus,
  ChevronLeft,
  Globe,
  Phone,
  MapPin,
  Building2,
  Target,
  Palette,
  Megaphone,
  Users,
  AlertCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { apiCall, apiUpload } from '@/lib/api'
import { useBrandStore } from '@/stores/brand'
import { PageContainer } from '@/components/ui/page-primitives'
import { Button } from '@/components/ui/button'
import { SocialIcon } from '@/components/ui/social-icon'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

type BrandApiData = Record<string, unknown>

type BrandFormState = {
  // Identity
  name: string
  tagline: string
  industry: string
  description: string
  website: string
  phone: string
  address: string
  // Audience
  audienceLocation: string
  audienceAgeMin: number
  audienceAgeMax: number
  audienceGender: 'mixed' | 'mostly_male' | 'mostly_female'
  audienceInterests: string[]
  // Voice & tone
  tone: 'Neutral' | 'Warm' | 'Professional' | 'Friendly'
  goals: string[]
  styleKeywords: string[]
  // Visual
  colorPrimary: string
  colorSecondary: string
  colorAccent: string
  fontMood: string
  // Publishing
  activePlatforms: string[]
  weeklyPostCount: number
  contentMix: Record<string, number>
  autoSchedule: boolean
  // Positioning
  industrySubtype: string
  priceSegment: string
  uspKeywords: string[]
}

const PLATFORMS = ['instagram', 'facebook', 'linkedin', 'twitter', 'tiktok', 'youtube'] as const
const GOALS = ['Increase Brand Awareness', 'Drive Sales', 'Engagement', 'Product Launch', 'Customer Retention', 'Community Building']
const TONES = ['Neutral', 'Warm', 'Professional', 'Friendly'] as const
const FONT_MOODS = [
  { value: 'sans_modern', label: 'Modern Sans' },
  { value: 'serif_elegant', label: 'Elegant Serif' },
  { value: 'display_bold', label: 'Bold Display' },
  { value: 'mono_tech', label: 'Tech Mono' },
]
const PRICE_SEGMENTS = [
  { value: 'budget', label: 'Budget-friendly' },
  { value: 'mid', label: 'Mid-range' },
  { value: 'premium', label: 'Premium' },
  { value: 'luxury', label: 'Luxury' },
]
const GENDER_OPTIONS = [
  { value: 'mixed', label: 'Mixed / All genders' },
  { value: 'mostly_male', label: 'Mostly male' },
  { value: 'mostly_female', label: 'Mostly female' },
]
const MIX_TYPES = ['promotional', 'educational', 'engagement', 'bts', 'inspirational']
const MIX_LABELS: Record<string, string> = {
  promotional: 'Promotional',
  educational: 'Educational',
  engagement: 'Engagement',
  bts: 'Behind the Scenes',
  inspirational: 'Inspirational',
}
const INTEREST_SUGGESTIONS = ['Technology', 'Fashion', 'Food', 'Travel', 'Sports', 'Health', 'Finance', 'Education', 'Entertainment', 'Sustainability']

const EMPTY_FORM: BrandFormState = {
  name: '', tagline: '', industry: '', description: '', website: '', phone: '', address: '',
  audienceLocation: '', audienceAgeMin: 22, audienceAgeMax: 45, audienceGender: 'mixed', audienceInterests: [],
  tone: 'Neutral', goals: [], styleKeywords: [], colorPrimary: '#003bff', colorSecondary: '#ffffff', colorAccent: '#6b7280', fontMood: 'sans_modern',
  activePlatforms: [], weeklyPostCount: 4, contentMix: { promotional: 30, educational: 25, engagement: 20, bts: 15, inspirational: 10 }, autoSchedule: false,
  industrySubtype: '', priceSegment: 'mid', uspKeywords: [],
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseApiError(error: unknown): string {
  const raw = error instanceof Error ? error.message : 'Something went wrong'
  try {
    const p = JSON.parse(raw)
    return p?.details ?? p?.message ?? p?.error ?? raw
  } catch { return raw }
}

function toneFromNumber(t?: number): BrandFormState['tone'] {
  const n = Number(t ?? 50)
  if (n <= 25) return 'Friendly'
  if (n <= 50) return 'Neutral'
  if (n <= 65) return 'Warm'
  return 'Professional'
}
function toneToNumber(t: BrandFormState['tone']): number {
  if (t === 'Friendly') return 25
  if (t === 'Neutral') return 50
  if (t === 'Warm') return 65
  return 85
}

// ─── Form sub-components ──────────────────────────────────────────────────────

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
      {children} {required && <span className="text-destructive">*</span>}
    </label>
  )
}

function TextInput({ value, onChange, placeholder, className }: { value: string; onChange: (v: string) => void; placeholder?: string; className?: string }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={cn('h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground/60 focus:border-primary', className)}
    />
  )
}

function Stepper({ value, min, max, onChange }: { value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center">
      <button type="button" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} className="flex h-9 w-9 items-center justify-center rounded-l-lg border border-border bg-muted/40 text-muted-foreground hover:bg-muted disabled:opacity-40">
        <Minus size={13} />
      </button>
      <div className="flex h-9 min-w-[3rem] items-center justify-center border-y border-border bg-background px-3 text-sm font-semibold text-foreground">{value}</div>
      <button type="button" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} className="flex h-9 w-9 items-center justify-center rounded-r-lg border border-border bg-muted/40 text-muted-foreground hover:bg-muted disabled:opacity-40">
        <Plus size={13} />
      </button>
    </div>
  )
}

function ColorPicker({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className="flex items-center gap-2">
        <label className="relative h-10 w-10 shrink-0 cursor-pointer overflow-hidden rounded-lg border border-border shadow-sm">
          <div className="h-full w-full rounded-lg" style={{ backgroundColor: value }} />
          <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" />
        </label>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="h-10 flex-1 rounded-lg border border-border bg-background px-3 font-mono text-sm text-foreground outline-none focus:border-primary"
        />
      </div>
    </div>
  )
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ id, icon: Icon, title, description, children }: { id: string; icon: React.ComponentType<{ size?: number; className?: string }>; title: string; description: string; children: React.ReactNode }) {
  return (
    <div id={id} className="app-card-elevated p-5 space-y-4 scroll-mt-6">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon size={17} />
        </div>
        <div>
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="border-t border-border pt-4 space-y-4">{children}</div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function BrandEditPage() {
  const router = useRouter()
  const { mutate: globalMutate } = useSWRConfig()
  const { setBrand } = useBrandStore()
  const [form, setForm] = useState<BrandFormState>(EMPTY_FORM)
  const [logoUrl, setLogoUrl] = useState('')
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [customInterest, setCustomInterest] = useState('')
  const [customUsp, setCustomUsp] = useState('')

  const { data: brandMeRes, isLoading, mutate: mutateBrand } = useSWR('/api/brand/me', (url: string) => apiCall<{ brand?: BrandApiData }>(url), { revalidateOnFocus: false })
  const { data: brandCurrentRes } = useSWR('/api/brands/current', (url: string) => apiCall<{ brand?: BrandApiData }>(url), { revalidateOnFocus: false })

  const brand = brandMeRes?.brand ?? brandCurrentRes?.brand ?? null

  useEffect(() => {
    if (!brand) return
    const str = (v: unknown, fb = '') => (typeof v === 'string' ? v : fb)
    const num = (v: unknown, fb: number) => (typeof v === 'number' ? v : typeof v === 'string' ? Number(v) || fb : fb)
    const strArr = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [])
    const genderVal = str(brand.audience_gender, 'mixed') as BrandFormState['audienceGender']
    const mix = (brand.content_type_mix && typeof brand.content_type_mix === 'object' && !Array.isArray(brand.content_type_mix))
      ? (brand.content_type_mix as Record<string, unknown>)
      : ({} as Record<string, unknown>)
    setLogoUrl(str(brand.logo_url))
    setForm({
      name: str(brand.name),
      tagline: str(brand.tagline),
      industry: str(brand.industry),
      description: str(brand.description),
      website: str(brand.website),
      phone: str(brand.phone),
      address: str(brand.address),
      audienceLocation: str(brand.audience_location),
      audienceAgeMin: num(brand.audience_age_min, 22),
      audienceAgeMax: num(brand.audience_age_max, 45),
      audienceGender: genderVal,
      audienceInterests: strArr(brand.audience_interests),
      tone: toneFromNumber(num(brand.tone, 50)),
      goals: strArr(brand.goals),
      styleKeywords: strArr(brand.styles),
      colorPrimary: str(brand.color_primary, '#003bff'),
      colorSecondary: str(brand.color_secondary, '#ffffff'),
      colorAccent: str(brand.color_accent, '#6b7280'),
      fontMood: str(brand.font_mood, 'sans_modern'),
      activePlatforms: strArr(brand.active_platforms),
      weeklyPostCount: num(brand.weekly_post_count, 4),
      contentMix: {
        promotional: num(mix.promotional, 30),
        educational: num(mix.educational, 25),
        engagement: num(mix.engagement, 20),
        bts: num(mix.bts, 15),
        inspirational: num(mix.inspirational, 10),
      },
      autoSchedule: Boolean(brand.auto_schedule),
      industrySubtype: str(brand.industry_subtype),
      priceSegment: str(brand.price_segment, 'mid'),
      uspKeywords: strArr(brand.industry_usp),
    })
  }, [brand])

  const set = useCallback(<K extends keyof BrandFormState>(key: K, value: BrandFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }, [])

  const togglePlatform = (p: string) => {
    set('activePlatforms', form.activePlatforms.includes(p) ? form.activePlatforms.filter((x) => x !== p) : [...form.activePlatforms, p])
  }
  const toggleGoal = (g: string) => {
    set('goals', form.goals.includes(g) ? form.goals.filter((x) => x !== g) : [...form.goals, g])
  }
  const toggleInterest = (i: string) => {
    set('audienceInterests', form.audienceInterests.includes(i) ? form.audienceInterests.filter((x) => x !== i) : [...form.audienceInterests, i])
  }
  const toggleStyle = (s: string) => {
    set('styleKeywords', form.styleKeywords.includes(s) ? form.styleKeywords.filter((x) => x !== s) : [...form.styleKeywords, s])
  }
  const updateMix = (key: string, delta: number) => {
    set('contentMix', { ...form.contentMix, [key]: Math.max(0, Math.min(100, (form.contentMix[key] ?? 0) + delta)) })
  }
  const mixTotal = Object.values(form.contentMix).reduce((a, b) => a + b, 0)

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingLogo(true)
    try {
      const fd = new FormData(); fd.append('file', file)
      const res = await apiUpload('/api/brand-products/upload-image', fd, 60_000) as { url?: string }
      if (res?.url) { setLogoUrl(res.url); toast.success('Logo uploaded') }
    } catch { toast.error('Upload failed') } finally { setUploadingLogo(false) }
  }

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Brand name is required'); return }
    setSaving(true)
    try {
      await apiCall('/api/brand/me', {
        method: 'PATCH',
        body: JSON.stringify({
          name: form.name.trim(),
          tagline: form.tagline.trim(),
          industry: form.industry.trim(),
          description: form.description.trim(),
          website: form.website.trim(),
          phone: form.phone.trim(),
          address: form.address.trim(),
          goals: form.goals,
          tone: toneToNumber(form.tone),
          styles: form.styleKeywords,
          font_mood: form.fontMood,
          color_primary: form.colorPrimary || null,
          color_secondary: form.colorSecondary || null,
          color_accent: form.colorAccent || null,
          audience_location: form.audienceLocation.trim(),
          audience_age_min: form.audienceAgeMin,
          audience_age_max: form.audienceAgeMax,
          audience_gender: form.audienceGender,
          audience_interests: form.audienceInterests,
          industry_subtype: form.industrySubtype.trim() || null,
          price_segment: form.priceSegment || null,
          usp_keywords: form.uspKeywords,
          weekly_post_count: form.weeklyPostCount,
          active_platforms: form.activePlatforms,
          content_type_mix: form.contentMix,
          auto_schedule: form.autoSchedule,
          logo_url: logoUrl || null,
        }),
      })
      await mutateBrand()
      await globalMutate('/api/brands/current')
      await globalMutate('/api/brand/me')
      setBrand({ id: 'default', name: form.name, website: form.website, industry: form.industry, voice: form.description, goals: form.goals })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      toast.success('Brand profile saved')
    } catch (e) { toast.error(parseApiError(e)) } finally { setSaving(false) }
  }

  if (isLoading) {
    return (
      <PageContainer className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-muted-foreground" />
      </PageContainer>
    )
  }

  return (
    <PageContainer className="max-w-3xl space-y-5 pb-24">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <button type="button" onClick={() => router.push('/brand')} className="mb-2 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft size={15} /> Back to overview
          </button>
          <h1 className="text-2xl font-bold text-foreground">Brand Setup</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">This profile drives every AI generation. Keep it accurate for best results.</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-2 shrink-0">
          {saving ? <Loader2 size={15} className="animate-spin" /> : saved ? <Check size={15} /> : <Save size={15} />}
          {saving ? 'Saving…' : saved ? 'Saved!' : 'Save Brand'}
        </Button>
      </div>

      {/* Quick nav */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'identity', label: 'Identity' },
          { id: 'audience', label: 'Audience' },
          { id: 'voice', label: 'Voice & Goals' },
          { id: 'visual', label: 'Visual System' },
          { id: 'publishing', label: 'Publishing' },
        ].map(({ id, label }) => (
          <a
            key={id}
            href={`#${id}`}
            className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors"
          >
            {label}
          </a>
        ))}
      </div>

      {/* ── Identity ── */}
      <Section id="identity" icon={Building2} title="Identity" description="Your brand's core profile and contact details.">
        {/* Logo */}
        <div>
          <FieldLabel>Brand Logo</FieldLabel>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 overflow-hidden rounded-xl border border-border bg-muted">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt="Brand logo" className="h-full w-full object-contain p-1" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">No logo</div>
              )}
            </div>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
              {uploadingLogo ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
              {uploadingLogo ? 'Uploading…' : 'Upload Logo'}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => void handleLogoUpload(e)} />
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <FieldLabel required>Brand Name</FieldLabel>
            <TextInput value={form.name} onChange={(v) => set('name', v)} placeholder="e.g. Brandvertise" />
          </div>
          <div className="sm:col-span-2">
            <FieldLabel>Tagline</FieldLabel>
            <TextInput value={form.tagline} onChange={(v) => set('tagline', v)} placeholder="e.g. Where creativity meets strategy" />
          </div>
          <div>
            <FieldLabel required>Industry</FieldLabel>
            <TextInput value={form.industry} onChange={(v) => set('industry', v)} placeholder="e.g. Technology" />
          </div>
          <div>
            <FieldLabel>Industry Subtype</FieldLabel>
            <TextInput value={form.industrySubtype} onChange={(v) => set('industrySubtype', v)} placeholder="e.g. SaaS, E-commerce" />
          </div>
          <div className="sm:col-span-2">
            <FieldLabel required>Brand Description</FieldLabel>
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              rows={4}
              placeholder="Describe your brand — what you do, who you serve, and what makes you unique."
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground/60 focus:border-primary resize-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <FieldLabel>Website</FieldLabel>
            <div className="relative">
              <Globe size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input value={form.website} onChange={(e) => set('website', e.target.value)} placeholder="https://example.com" className="h-10 w-full rounded-lg border border-border bg-background pl-8 pr-3 text-sm text-foreground outline-none focus:border-primary" />
            </div>
          </div>
          <div>
            <FieldLabel>Phone</FieldLabel>
            <div className="relative">
              <Phone size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+91 xxxxxxxxxx" className="h-10 w-full rounded-lg border border-border bg-background pl-8 pr-3 text-sm text-foreground outline-none focus:border-primary" />
            </div>
          </div>
          <div>
            <FieldLabel>Address / City</FieldLabel>
            <div className="relative">
              <MapPin size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input value={form.address} onChange={(e) => set('address', e.target.value)} placeholder="Mumbai, India" className="h-10 w-full rounded-lg border border-border bg-background pl-8 pr-3 text-sm text-foreground outline-none focus:border-primary" />
            </div>
          </div>
        </div>
      </Section>

      {/* ── Audience ── */}
      <Section id="audience" icon={Users} title="Audience" description="Define who your content is for.">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <FieldLabel required>Audience Location</FieldLabel>
            <TextInput value={form.audienceLocation} onChange={(v) => set('audienceLocation', v)} placeholder="e.g. India, Southeast Asia" />
          </div>
          <div>
            <FieldLabel>Gender Split</FieldLabel>
            <select value={form.audienceGender} onChange={(e) => set('audienceGender', e.target.value as BrandFormState['audienceGender'])} className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary">
              {GENDER_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <FieldLabel>Min Age</FieldLabel>
            <Stepper value={form.audienceAgeMin} min={13} max={form.audienceAgeMax - 1} onChange={(v) => set('audienceAgeMin', v)} />
          </div>
          <div>
            <FieldLabel>Max Age</FieldLabel>
            <Stepper value={form.audienceAgeMax} min={form.audienceAgeMin + 1} max={100} onChange={(v) => set('audienceAgeMax', v)} />
          </div>
        </div>

        <div>
          <FieldLabel>Audience Interests</FieldLabel>
          <div className="flex flex-wrap gap-2">
            {INTEREST_SUGGESTIONS.map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => toggleInterest(i)}
                className={cn('rounded-full border px-3 py-1.5 text-xs font-medium transition-colors', form.audienceInterests.includes(i) ? 'border-primary bg-primary/10 text-foreground' : 'border-border text-muted-foreground hover:bg-muted')}
              >
                {i}
              </button>
            ))}
            <div className="flex items-center gap-1">
              <input
                value={customInterest}
                onChange={(e) => setCustomInterest(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && customInterest.trim()) {
                    toggleInterest(customInterest.trim())
                    setCustomInterest('')
                  }
                }}
                placeholder="+ Add custom"
                className="h-8 w-28 rounded-full border border-dashed border-border bg-transparent px-3 text-xs text-muted-foreground outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>
      </Section>

      {/* ── Voice & Goals ── */}
      <Section id="voice" icon={Target} title="Voice & Goals" description="What you're working towards and how you communicate.">
        <div>
          <FieldLabel>Brand Goals</FieldLabel>
          <div className="flex flex-wrap gap-2">
            {GOALS.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => toggleGoal(g)}
                className={cn('rounded-full border px-3 py-1.5 text-xs font-medium transition-colors', form.goals.includes(g) ? 'border-primary bg-primary/10 text-foreground' : 'border-border text-muted-foreground hover:bg-muted')}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        <div>
          <FieldLabel>Tone of Voice</FieldLabel>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {TONES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => set('tone', t)}
                className={cn('rounded-xl border py-3 text-sm font-medium transition-colors', form.tone === t ? 'border-primary bg-primary/10 text-foreground' : 'border-border text-muted-foreground hover:bg-muted')}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div>
          <FieldLabel>Style Keywords</FieldLabel>
          <div className="flex flex-wrap gap-2">
            {['minimal', 'luxury', 'bold', 'playful', 'modern', 'classic', 'vibrant', 'clean'].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => toggleStyle(s)}
                className={cn('rounded-full border px-3 py-1.5 text-xs font-medium capitalize transition-colors', form.styleKeywords.includes(s) ? 'border-primary bg-primary/10 text-foreground' : 'border-border text-muted-foreground hover:bg-muted')}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <FieldLabel>Unique Selling Points</FieldLabel>
          </div>
          <div className="flex flex-wrap gap-2">
            {form.uspKeywords.map((u) => (
              <button key={u} type="button" onClick={() => set('uspKeywords', form.uspKeywords.filter((x) => x !== u))} className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-foreground">
                {u} <span className="opacity-60">×</span>
              </button>
            ))}
            <div className="flex items-center gap-1">
              <input
                value={customUsp}
                onChange={(e) => setCustomUsp(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && customUsp.trim()) {
                    if (!form.uspKeywords.includes(customUsp.trim())) set('uspKeywords', [...form.uspKeywords, customUsp.trim()])
                    setCustomUsp('')
                  }
                }}
                placeholder="+ Add USP"
                className="h-8 w-32 rounded-full border border-dashed border-border bg-transparent px-3 text-xs text-muted-foreground outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        <div>
          <FieldLabel>Price Positioning</FieldLabel>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {PRICE_SEGMENTS.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => set('priceSegment', p.value)}
                className={cn('rounded-xl border py-2.5 text-xs font-medium transition-colors', form.priceSegment === p.value ? 'border-primary bg-primary/10 text-foreground' : 'border-border text-muted-foreground hover:bg-muted')}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </Section>

      {/* ── Visual System ── */}
      <Section id="visual" icon={Palette} title="Visual System" description="Colors and typography that define your brand identity.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <ColorPicker label="Primary Color" value={form.colorPrimary} onChange={(v) => set('colorPrimary', v)} />
          <ColorPicker label="Secondary Color" value={form.colorSecondary} onChange={(v) => set('colorSecondary', v)} />
          <ColorPicker label="Accent Color" value={form.colorAccent} onChange={(v) => set('colorAccent', v)} />
        </div>

        <div>
          <FieldLabel>Typography Mood</FieldLabel>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {FONT_MOODS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => set('fontMood', f.value)}
                className={cn('rounded-xl border py-3 text-xs font-medium transition-colors', form.fontMood === f.value ? 'border-primary bg-primary/10 text-foreground' : 'border-border text-muted-foreground hover:bg-muted')}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </Section>

      {/* ── Publishing ── */}
      <Section id="publishing" icon={Megaphone} title="Publishing" description="Where and how often you publish content.">
        <div>
          <FieldLabel>Active Platforms</FieldLabel>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map((p) => {
              const active = form.activePlatforms.includes(p)
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => togglePlatform(p)}
                  className={cn(
                    'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium capitalize transition-colors',
                    active ? 'border-primary bg-primary/10 text-foreground' : 'border-border text-muted-foreground hover:border-primary/40 hover:bg-muted/60',
                  )}
                >
                  <SocialIcon platform={p} size={15} />
                  {p === 'twitter' ? 'X / Twitter' : p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <FieldLabel>Weekly Post Target</FieldLabel>
          <div className="flex items-center gap-4">
            <Stepper value={form.weeklyPostCount} min={1} max={50} onChange={(v) => set('weeklyPostCount', v)} />
            <span className="text-sm text-muted-foreground">posts per week</span>
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <FieldLabel>Content Mix</FieldLabel>
            <span className={cn('text-xs font-semibold', mixTotal === 100 ? 'text-emerald-500' : 'text-amber-500')}>
              Total: {mixTotal}%
            </span>
          </div>
          {mixTotal !== 100 && (
            <div className="mb-3 flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-xs text-amber-600 dark:text-amber-400">
              <AlertCircle size={13} /> Content mix must total 100%. Currently {mixTotal}%.
            </div>
          )}
          <div className="space-y-2.5">
            {MIX_TYPES.map((key) => (
              <div key={key} className="flex items-center gap-3">
                <span className="w-32 shrink-0 text-sm text-muted-foreground">{MIX_LABELS[key]}</span>
                <button type="button" onClick={() => updateMix(key, -5)} disabled={(form.contentMix[key] ?? 0) <= 0} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/60 text-muted-foreground hover:bg-muted disabled:opacity-40">
                  <Minus size={12} />
                </button>
                <div className="flex-1">
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${form.contentMix[key] ?? 0}%` }} />
                  </div>
                </div>
                <button type="button" onClick={() => updateMix(key, 5)} disabled={(form.contentMix[key] ?? 0) >= 100} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/60 text-muted-foreground hover:bg-muted disabled:opacity-40">
                  <Plus size={12} />
                </button>
                <span className="w-10 shrink-0 text-right text-sm font-bold tabular-nums text-foreground">{form.contentMix[key] ?? 0}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/20 px-4 py-3">
          <div>
            <p className="text-sm font-medium text-foreground">Auto-Schedule</p>
            <p className="text-xs text-muted-foreground">Automatically schedule approved posts based on your weekly target</p>
          </div>
          <button
            type="button"
            onClick={() => set('autoSchedule', !form.autoSchedule)}
            className={cn('relative h-6 w-11 rounded-full transition-colors', form.autoSchedule ? 'bg-primary' : 'bg-muted')}
          >
            <span className={cn('absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform', form.autoSchedule ? 'translate-x-5' : 'translate-x-0.5')} />
          </button>
        </div>
      </Section>

      {/* Footer save */}
      <div className="flex justify-end border-t border-border pt-4">
        <Button onClick={handleSave} disabled={saving} size="lg" className="gap-2 px-8">
          {saving ? <Loader2 size={15} className="animate-spin" /> : saved ? <Check size={15} /> : <Save size={15} />}
          {saving ? 'Saving…' : saved ? 'Saved!' : 'Save Brand Profile'}
        </Button>
      </div>
    </PageContainer>
  )
}
