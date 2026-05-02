'use client'

import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import useSWR from 'swr'
import { Loader2, Upload } from 'lucide-react'
import { apiCall, apiUpload } from '@/lib/api'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useBrandStore } from '@/stores/brand'
import { PageContainer, PageHeader } from '@/components/ui/page-primitives'
import { SectionCard } from '@/components/ui/saas-primitives'
import { Button } from '@/components/ui/button'
import { PageIntroModal } from '@/components/app/page-intro-modal'
import { SkeletonCard } from '@/components/ui/skeleton-card'
import { logUxEvent } from '@/lib/ux-events'

const styleOptions = ['minimal', 'luxury', 'bold'] as const
const toneOptions = ['Neutral', 'Warm', 'Professional', 'Friendly'] as const
const goalLibrary = ['Increase Brand Awareness', 'Drive Sales', 'Engagement', 'Product Launch']

const schema = z.object({
  name: z.string().min(2, 'Brand name is required'),
  tagline: z.string().optional(),
  industry: z.string().min(2, 'Industry is required'),
  description: z.string().min(5, 'Brand description is required'),
  phone: z.string().optional(),
  address: z.string().optional(),
  audienceLocation: z.string().min(2, 'Audience location is required'),
  audienceAgeMin: z.coerce.number().min(18).max(100),
  audienceAgeMax: z.coerce.number().min(18).max(100),
  audienceGender: z.enum(['mixed', 'mostly_male', 'mostly_female']),
  audienceInterests: z.string().optional(),
  goals: z.array(z.string()).min(1, 'Select at least one goal'),
  styleKeywords: z.string().optional(),
  style: z.enum(styleOptions),
  colorPrimary: z.string().optional(),
  colorSecondary: z.string().optional(),
  colorAccent: z.string().optional(),
  fontMood: z.string().optional(),
  tone: z.enum(toneOptions),
  industrySubtype: z.string().optional(),
  priceSegment: z.string().optional(),
  uspKeywords: z.string().optional(),
  weeklyPostCount: z.coerce.number().min(1).max(50),
  activePlatforms: z.string().optional(),
  contentMix: z.string().optional(),
  autoSchedule: z.boolean().default(false),
  website: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

const field = 'h-10 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm text-[#111111] outline-none placeholder:text-[#9CA3AF] focus:border-[#111111]'

function styleFromFontMood(fontMood?: string): FormValues['style'] {
  if (!fontMood) return 'minimal'
  if (fontMood.includes('serif')) return 'luxury'
  if (fontMood.includes('display')) return 'bold'
  return 'minimal'
}

function toneFromNumber(tone?: number): FormValues['tone'] {
  const t = Number(tone ?? 50)
  if (t <= 25) return 'Friendly'
  if (t <= 50) return 'Neutral'
  if (t <= 75) return 'Warm'
  return 'Professional'
}

function toneToNumber(tone: FormValues['tone']): number {
  if (tone === 'Friendly') return 25
  if (tone === 'Neutral') return 50
  if (tone === 'Warm') return 65
  return 85
}

function parseApiError(error: unknown): string {
  const raw = error instanceof Error ? error.message : 'Something went wrong'
  try {
    const parsed = JSON.parse(raw)
    if (typeof parsed?.details === 'string' && parsed.details.trim()) return parsed.details
    if (typeof parsed?.message === 'string' && parsed.message.trim()) return parsed.message
    if (typeof parsed?.error === 'string' && parsed.error.trim()) return parsed.error
  } catch {
    // ignore parse errors
  }
  if (raw.includes('<!doctype html') || raw.includes('<html')) return 'Server returned an unexpected response. Please try again.'
  return raw
}

export default function BrandDetailsPage() {
  const { setBrand } = useBrandStore()
  const [saving, setSaving] = useState(false)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [logoUrl, setLogoUrl] = useState('')
  const [uploadingLogo, setUploadingLogo] = useState(false)

  const { data: brandMeRes, isLoading: loadingBrandMe, mutate: mutateBrandMe } = useSWR(
    '/api/brand/me',
    (url: string) => apiCall<{ brand?: Record<string, any> }>(url),
    { revalidateOnFocus: false }
  )
  const { data: brandCurrentRes, isLoading: loadingCurrent } = useSWR(
    '/api/brands/current',
    (url: string) => apiCall<{ brand?: Record<string, any> }>(url),
    { revalidateOnFocus: false }
  )

  const brand = brandMeRes?.brand ?? brandCurrentRes?.brand ?? null

  const form = useForm<FormValues>({
    defaultValues: {
      name: '',
      tagline: '',
      industry: '',
      description: '',
      phone: '',
      address: '',
      audienceLocation: '',
      audienceAgeMin: 22,
      audienceAgeMax: 45,
      audienceGender: 'mixed',
      audienceInterests: '',
      goals: [],
      styleKeywords: '',
      style: 'minimal',
      colorPrimary: '#111111',
      colorSecondary: '#ffffff',
      colorAccent: '#9CA3AF',
      fontMood: 'sans_modern',
      tone: 'Neutral',
      industrySubtype: '',
      priceSegment: '',
      uspKeywords: '',
      weeklyPostCount: 4,
      activePlatforms: '',
      contentMix: '',
      autoSchedule: false,
      website: '',
    },
    mode: 'onChange',
  })

  useEffect(() => {
    if (!brand) return
    setLogoUrl(brand.logo_url ?? '')
    form.reset({
      name: brand.name ?? '',
      tagline: brand.tagline ?? '',
      industry: brand.industry ?? '',
      description: brand.description ?? '',
      phone: brand.phone ?? '',
      address: brand.address ?? '',
      audienceLocation: brand.audience_location ?? '',
      audienceAgeMin: Number(brand.audience_age_min ?? 22),
      audienceAgeMax: Number(brand.audience_age_max ?? 45),
      audienceGender: (brand.audience_gender ?? 'mixed') as 'mixed' | 'mostly_male' | 'mostly_female',
      audienceInterests: Array.isArray(brand.audience_interests) ? brand.audience_interests.join(', ') : '',
      goals: Array.isArray(brand.goals) ? brand.goals : [],
      styleKeywords: Array.isArray(brand.styles) ? brand.styles.join(', ') : '',
      style: styleFromFontMood(brand.font_mood),
      colorPrimary: brand.color_primary ?? '#111111',
      colorSecondary: brand.color_secondary ?? '#ffffff',
      colorAccent: brand.color_accent ?? '#9CA3AF',
      fontMood: brand.font_mood ?? '',
      tone: toneFromNumber(brand.tone),
      industrySubtype: brand.industry_subtype ?? '',
      priceSegment: brand.price_segment ?? '',
      uspKeywords: Array.isArray(brand.industry_usp) ? brand.industry_usp.join(', ') : '',
      weeklyPostCount: Number(brand.weekly_post_count ?? 4),
      activePlatforms: Array.isArray(brand.active_platforms) ? brand.active_platforms.join(', ') : '',
      contentMix: brand.content_type_mix ? JSON.stringify(brand.content_type_mix) : '',
      autoSchedule: Boolean(brand.auto_schedule),
      website: brand.website ?? '',
    })
    setBrand({
      id: String(brand.id ?? 'default'),
      name: brand.name ?? 'My Brand',
      website: brand.website ?? '',
      industry: brand.industry ?? '',
      voice: brand.description ?? '',
      goals: Array.isArray(brand.goals) ? brand.goals : [],
      audience: {
        ageMin: brand.audience_age_min,
        ageMax: brand.audience_age_max,
        location: brand.audience_location,
        interests: brand.audience_interests,
      },
      designPrefs: {
        colorPrimary: brand.color_primary,
        colorSecondary: brand.color_secondary,
        colorAccent: brand.color_accent,
        fontMood: brand.font_mood,
      },
    })
  }, [brand, form, setBrand])

  const watchedGoals = form.watch('goals')
  const goalOptions = useMemo(() => Array.from(new Set([...(watchedGoals || []), ...goalLibrary])), [watchedGoals])
  const { errors, isSubmitted } = form.formState
  const fieldWithError = (name: keyof FormValues) =>
    cn(field, isSubmitted && errors[name] ? 'border-red-300 focus:border-red-500' : '')

  const toggleGoal = (goal: string) => {
    const current = form.getValues('goals')
    form.setValue('goals', current.includes(goal) ? current.filter((g) => g !== goal) : [...current, goal], { shouldValidate: true })
  }

  const onSubmit = async (values: FormValues) => {
    const parsed = schema.safeParse(values)
    if (!parsed.success) {
      logUxEvent('brand_form_validation_failed', { issue: parsed.error.issues[0]?.message ?? 'invalid_form' })
      toast.error(parsed.error.issues[0]?.message ?? 'Please complete all required fields')
      return
    }
    setSaving(true)
    setSaveState('saving')
    try {
      await apiCall('/api/brand/me', {
        method: 'PATCH',
        body: JSON.stringify({
          name: values.name.trim(),
          tagline: (values.tagline ?? '').trim(),
          industry: values.industry.trim(),
          description: values.description.trim(),
          phone: (values.phone ?? '').trim(),
          address: (values.address ?? '').trim(),
          goals: values.goals,
          tone: toneToNumber(values.tone),
          styles: (values.styleKeywords ?? '').split(',').map((s) => s.trim()).filter(Boolean),
          font_mood: values.style === 'luxury' ? 'serif_elegant' : values.style === 'bold' ? 'display_bold' : 'sans_modern',
          color_primary: (values.colorPrimary ?? '').trim() || null,
          color_secondary: (values.colorSecondary ?? '').trim() || null,
          color_accent: (values.colorAccent ?? '').trim() || null,
          audience_location: values.audienceLocation.trim(),
          audience_age_min: values.audienceAgeMin,
          audience_age_max: values.audienceAgeMax,
          audience_gender: values.audienceGender,
          audience_interests: (values.audienceInterests ?? '').split(',').map((s) => s.trim()).filter(Boolean),
          industry_subtype: (values.industrySubtype ?? '').trim() || null,
          price_segment: (values.priceSegment ?? '').trim() || null,
          usp_keywords: (values.uspKeywords ?? '').split(',').map((s) => s.trim()).filter(Boolean),
          weekly_post_count: values.weeklyPostCount,
          active_platforms: (values.activePlatforms ?? '').split(',').map((s) => s.trim()).filter(Boolean),
          content_type_mix: (() => {
            try { return values.contentMix ? JSON.parse(values.contentMix) : undefined } catch { return undefined }
          })(),
          auto_schedule: values.autoSchedule,
          website: (values.website ?? '').trim(),
          logo_url: logoUrl || null,
        }),
      })
      await mutateBrandMe()
      setLastSavedAt(new Date().toLocaleTimeString())
      setSaveState('saved')
      toast.success('Brand profile updated')
    } catch (error) {
      setSaveState('error')
      toast.error(parseApiError(error) || 'Unable to update brand profile')
    } finally {
      setSaving(false)
    }
  }

  const handleLogoUpload = async (file: File) => {
    if (!file) return
    const formData = new FormData()
    formData.append('file', file)
    setUploadingLogo(true)
    try {
      const res = await apiUpload('/api/brand/me/logo', formData) as { logoUrl?: string }
      const nextLogoUrl = res?.logoUrl || ''
      setLogoUrl(nextLogoUrl)
      await mutateBrandMe()
      toast.success('Logo uploaded')
    } catch (error) {
      toast.error(parseApiError(error) || 'Logo upload failed')
    } finally {
      setUploadingLogo(false)
    }
  }

  const qualityParts = [
    form.watch('name')?.trim(),
    form.watch('tagline')?.trim(),
    form.watch('industry')?.trim(),
    form.watch('description')?.trim(),
    form.watch('audienceLocation')?.trim(),
    form.watch('goals')?.length ? 'goals' : '',
    form.watch('styleKeywords')?.trim(),
    form.watch('colorPrimary')?.trim(),
    form.watch('website')?.trim(),
  ].filter(Boolean).length
  const qualityScore = Math.round((qualityParts / 9) * 100)

  if (loadingBrandMe || loadingCurrent) {
    return (
      <PageContainer className="space-y-4">
        <SkeletonCard lines={2} />
        <SkeletonCard lines={8} />
        <div className="flex items-center justify-center text-xs text-[#6B7280]">
          <Loader2 className="mr-2 h-4 w-4 animate-spin text-[#111111]" />
          Loading brand profile...
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer className="space-y-6">
      <PageIntroModal
        pageKey="brand"
        title="Keep your brand profile fresh"
        description="These edits directly improve generated calendars, captions, and visual prompts."
      />
      <PageHeader
        title={<>Edit <span className="text-highlight">Brand</span></>}
        description="Update the brand profile created during onboarding."
      />

      <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_340px]">
        <SectionCard title="Brand Profile" subtitle="This data is pulled from onboarding and remains editable.">
          <div className="mb-4 flex items-center gap-3 rounded-xl border border-[#E5E7EB] bg-[#F7F7F8] p-3">
            <div className="h-16 w-16 overflow-hidden rounded-xl border border-[#E5E7EB] bg-white">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt="Brand logo" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-[#9CA3AF]">No logo</div>
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-[#111111]">Brand logo</p>
              <p className="text-xs text-[#6B7280]">Uploaded to cloud storage and used during content generation.</p>
            </div>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-xs text-[#111111] hover:bg-[#F3F4F6]">
              <Upload className="h-3.5 w-3.5" />
              {uploadingLogo ? 'Uploading...' : 'Upload'}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) void handleLogoUpload(file)
                  e.currentTarget.value = ''
                }}
              />
            </label>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-[#6B7280]">Brand name</label>
              <input className={fieldWithError('name')} {...form.register('name')} />
              {isSubmitted && errors.name ? <p className="mt-1 text-xs text-red-600">{errors.name.message as string}</p> : null}
            </div>
            <div>
              <label className="mb-1 block text-xs text-[#6B7280]">Tagline</label>
              <input className={field} {...form.register('tagline')} />
            </div>
            <div>
              <label className="mb-1 block text-xs text-[#6B7280]">Industry</label>
              <input className={fieldWithError('industry')} {...form.register('industry')} />
              {isSubmitted && errors.industry ? <p className="mt-1 text-xs text-red-600">{errors.industry.message as string}</p> : null}
            </div>
            <div>
              <label className="mb-1 block text-xs text-[#6B7280]">Industry subtype</label>
              <input className={field} {...form.register('industrySubtype')} />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs text-[#6B7280]">Brand description</label>
              <textarea className={cn('min-h-24 w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:border-[#111111]', isSubmitted && errors.description ? 'border-red-300 focus:border-red-500' : 'border-[#E5E7EB]')} {...form.register('description')} />
              {isSubmitted && errors.description ? <p className="mt-1 text-xs text-red-600">{errors.description.message as string}</p> : null}
            </div>
            <div>
              <label className="mb-1 block text-xs text-[#6B7280]">Audience location</label>
              <input className={fieldWithError('audienceLocation')} {...form.register('audienceLocation')} />
              {isSubmitted && errors.audienceLocation ? <p className="mt-1 text-xs text-red-600">{errors.audienceLocation.message as string}</p> : null}
            </div>
            <div>
              <label className="mb-1 block text-xs text-[#6B7280]">Audience interests (comma separated)</label>
              <input className={field} {...form.register('audienceInterests')} />
            </div>
            <div>
              <label className="mb-1 block text-xs text-[#6B7280]">Audience age min</label>
              <input type="number" className={field} {...form.register('audienceAgeMin')} />
            </div>
            <div>
              <label className="mb-1 block text-xs text-[#6B7280]">Audience age max</label>
              <input type="number" className={field} {...form.register('audienceAgeMax')} />
            </div>
            <div>
              <label className="mb-1 block text-xs text-[#6B7280]">Audience gender</label>
              <select className={field} {...form.register('audienceGender')}>
                <option value="mixed">Mixed</option>
                <option value="mostly_male">Mostly male</option>
                <option value="mostly_female">Mostly female</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-[#6B7280]">Website / competitor link</label>
              <input className={field} {...form.register('website')} />
            </div>
            <div className="md:col-span-2">
              <button
                type="button"
                className="rounded-lg border border-[#E5E7EB] px-3 py-2 text-xs text-[#111111] hover:bg-[#F7F7F8]"
                onClick={() => setShowAdvanced((v) => !v)}
              >
                {showAdvanced ? 'Hide advanced settings' : 'Show advanced settings'}
              </button>
            </div>
            {showAdvanced ? (
              <>
            <div>
              <label className="mb-1 block text-xs text-[#6B7280]">Phone</label>
              <input className={field} {...form.register('phone')} />
            </div>
            <div>
              <label className="mb-1 block text-xs text-[#6B7280]">Address</label>
              <input className={field} {...form.register('address')} />
            </div>
            <div>
              <label className="mb-2 block text-xs text-[#6B7280]">Style</label>
              <div className="grid grid-cols-3 gap-2">
                {styleOptions.map((style) => (
                  <button
                    type="button"
                    key={style}
                    onClick={() => form.setValue('style', style)}
                    className={cn(
                      'h-10 rounded-lg border text-sm capitalize',
                      form.watch('style') === style ? 'border-[#111111] bg-[#F3F4F6] text-[#111111]' : 'border-[#E5E7EB] text-[#6B7280]'
                    )}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-2 block text-xs text-[#6B7280]">Tone</label>
              <select className={field} {...form.register('tone')}>
                {toneOptions.map((tone) => (
                  <option key={tone} value={tone}>{tone}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs text-[#6B7280]">Style keywords (comma separated)</label>
              <input className={field} {...form.register('styleKeywords')} />
            </div>
            <div>
              <label className="mb-1 block text-xs text-[#6B7280]">Primary color</label>
              <input className={field} {...form.register('colorPrimary')} />
            </div>
            <div>
              <label className="mb-1 block text-xs text-[#6B7280]">Secondary color</label>
              <input className={field} {...form.register('colorSecondary')} />
            </div>
            <div>
              <label className="mb-1 block text-xs text-[#6B7280]">Accent color</label>
              <input className={field} {...form.register('colorAccent')} />
            </div>
            <div>
              <label className="mb-1 block text-xs text-[#6B7280]">Font mood</label>
              <input className={field} {...form.register('fontMood')} />
            </div>
            <div>
              <label className="mb-1 block text-xs text-[#6B7280]">Price segment</label>
              <input className={field} {...form.register('priceSegment')} />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs text-[#6B7280]">USP keywords (comma separated)</label>
              <input className={field} {...form.register('uspKeywords')} />
            </div>
            <div>
              <label className="mb-1 block text-xs text-[#6B7280]">Weekly post count</label>
              <input type="number" className={field} {...form.register('weeklyPostCount')} />
            </div>
            <div>
              <label className="mb-1 block text-xs text-[#6B7280]">Active platforms (comma separated)</label>
              <input className={field} {...form.register('activePlatforms')} />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs text-[#6B7280]">Content mix JSON</label>
              <textarea className="min-h-20 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm outline-none focus:border-[#111111]" {...form.register('contentMix')} />
            </div>
            <div className="md:col-span-2 flex items-center gap-2">
              <input id="auto-schedule" type="checkbox" {...form.register('autoSchedule')} />
              <label htmlFor="auto-schedule" className="text-sm text-[#111111]">Auto schedule enabled</label>
            </div>
              </>
            ) : null}
            <div className="md:col-span-2">
              <label className="mb-2 block text-xs text-[#6B7280]">Goals</label>
              <div className="flex flex-wrap gap-2">
                {goalOptions.map((goal) => (
                  <button
                    type="button"
                    key={goal}
                    onClick={() => toggleGoal(goal)}
                    className={cn(
                      'rounded-full border px-3 py-1 text-xs',
                      watchedGoals.includes(goal) ? 'border-[#111111] bg-[#111111] text-white' : 'border-[#E5E7EB] bg-white text-[#6B7280]'
                    )}
                  >
                    {goal}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-5 flex justify-end">
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Brand Changes'}
            </Button>
          </div>
          <p className="mt-2 text-xs text-[#6B7280]">
            {saveState === 'saving' ? 'Saving changes...' : saveState === 'saved' ? `Saved at ${lastSavedAt}` : saveState === 'error' ? 'Save failed. Please retry.' : 'No recent save.'}
          </p>
        </SectionCard>

        <SectionCard title="Brand Preview" subtitle="Live preview from current form values." className="xl:sticky xl:top-20 h-fit">
          <div className="space-y-4">
            <div className="rounded-xl border border-[#E5E7EB] bg-[#F7F7F8] p-4 text-center">
              <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-[#E5E7EB] bg-white text-lg font-semibold text-[#111111]">
                {logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoUrl} alt="Brand logo" className="h-full w-full object-cover" />
                ) : (
                  (form.watch('name') || 'BV').slice(0, 2).toUpperCase()
                )}
              </div>
              <p className="text-sm font-semibold text-[#111111]">{form.watch('name') || 'Brand Name'}</p>
              <p className="text-xs text-[#6B7280]">{form.watch('industry') || 'Industry'}</p>
            </div>
            <div className="rounded-xl border border-[#E5E7EB] bg-white p-3">
              <p className="mb-2 text-xs font-medium text-[#6B7280]">Goals</p>
              <div className="flex flex-wrap gap-2">
                {(watchedGoals.length ? watchedGoals : ['No goals selected']).slice(0, 4).map((goal) => (
                  <span key={goal} className="rounded-full border border-[#E5E7EB] bg-[#F7F7F8] px-2 py-1 text-[11px] text-[#6B7280]">{goal}</span>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-[#E5E7EB] bg-white p-3">
              <div className="mb-1 flex items-center justify-between">
                <p className="text-xs font-medium text-[#6B7280]">Brand Quality Score</p>
                <p className="text-xs font-semibold text-[#111111]">{qualityScore}%</p>
              </div>
              <div className="h-2 rounded-full bg-[#EFEFF1]">
                <div className="h-2 rounded-full bg-[#111111] transition-all" style={{ width: `${qualityScore}%` }} />
              </div>
            </div>
          </div>
        </SectionCard>
      </form>
    </PageContainer>
  )
}
