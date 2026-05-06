'use client'

import type { UseFormReturn } from 'react-hook-form'
import { Upload } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { SectionCard } from '@/components/ui/saas-primitives'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { FormValues } from './brand-identity-editor'

const styleOptions = ['minimal', 'luxury', 'bold'] as const
const toneOptions = ['Neutral', 'Warm', 'Professional', 'Friendly'] as const

type Props = {
  brandTab: string
  onBrandTabChange: (v: string) => void
  form: UseFormReturn<FormValues>
  errors: UseFormReturn<FormValues>['formState']['errors']
  isSubmitted: boolean
  field: string
  fieldWithError: (name: keyof FormValues) => string
  logoUrl: string
  uploadingLogo: boolean
  onLogoFile: (file: File) => void
  toggleGoal: (goal: string) => void
  goalOptions: string[]
  watchedGoals: string[]
}

export function BrandIdentityTabbedLeft({
  brandTab,
  onBrandTabChange,
  form,
  errors,
  isSubmitted,
  field,
  fieldWithError,
  logoUrl,
  uploadingLogo,
  onLogoFile,
  toggleGoal,
  goalOptions,
  watchedGoals,
}: Props) {
  return (
    <div className="space-y-4">
      <Tabs value={brandTab} onValueChange={onBrandTabChange} className="space-y-4">
        <TabsList variant="line" className="flex h-auto w-full max-w-full flex-wrap justify-start gap-1 rounded-xl border border-border/80 bg-muted/30 p-1">
          <TabsTrigger value="identity" className="text-xs">
            Identity
          </TabsTrigger>
          <TabsTrigger value="dna" className="text-xs">
            DNA
          </TabsTrigger>
          <TabsTrigger value="visual" className="text-xs">
            Visual
          </TabsTrigger>
          <TabsTrigger value="voice" className="text-xs">
            Voice
          </TabsTrigger>
          <TabsTrigger value="products" className="text-xs">
            Products
          </TabsTrigger>
          <TabsTrigger value="integrations" className="text-xs">
            Integrations
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className={cn(brandTab !== 'identity' && 'hidden')}>
        <SectionCard title="Identity" subtitle="Name, industry, story, and contact.">
          <div className="mb-4 flex items-center gap-3 rounded-xl border border-border bg-muted/40 p-3">
            <div className="h-16 w-16 overflow-hidden rounded-xl border border-border bg-card">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt="Brand logo" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground/80">No logo</div>
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Brand logo</p>
              <p className="text-xs text-muted-foreground">Used in previews and generation.</p>
            </div>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs text-foreground hover:bg-muted">
              <Upload className="h-3.5 w-3.5" />
              {uploadingLogo ? 'Uploading...' : 'Upload'}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) onLogoFile(file)
                  e.currentTarget.value = ''
                }}
              />
            </label>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Brand name</label>
              <input className={fieldWithError('name')} {...form.register('name')} />
              {isSubmitted && errors.name ? <p className="mt-1 text-xs text-red-600">{errors.name.message as string}</p> : null}
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Tagline</label>
              <input className={field} {...form.register('tagline')} />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Industry</label>
              <input className={fieldWithError('industry')} {...form.register('industry')} />
              {isSubmitted && errors.industry ? <p className="mt-1 text-xs text-red-600">{errors.industry.message as string}</p> : null}
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Industry subtype</label>
              <input className={field} {...form.register('industrySubtype')} />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs text-muted-foreground">Brand description</label>
              <textarea
                className={cn(
                  'min-h-24 w-full rounded-lg border bg-card px-3 py-2 text-sm outline-none focus:border-primary',
                  isSubmitted && errors.description ? 'border-red-300 focus:border-red-500' : 'border-border',
                )}
                {...form.register('description')}
              />
              {isSubmitted && errors.description ? <p className="mt-1 text-xs text-red-600">{errors.description.message as string}</p> : null}
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Website / competitor link</label>
              <input className={field} {...form.register('website')} />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Phone</label>
              <input className={field} {...form.register('phone')} />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs text-muted-foreground">Address</label>
              <input className={field} {...form.register('address')} />
            </div>
          </div>
        </SectionCard>
      </div>

      <div className={cn(brandTab !== 'dna' && 'hidden')}>
        <SectionCard title="Brand DNA" subtitle="Audience, differentiation, and goals.">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Audience location</label>
              <input className={fieldWithError('audienceLocation')} {...form.register('audienceLocation')} />
              {isSubmitted && errors.audienceLocation ? (
                <p className="mt-1 text-xs text-red-600">{errors.audienceLocation.message as string}</p>
              ) : null}
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Audience interests (comma separated)</label>
              <input className={field} {...form.register('audienceInterests')} />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Audience age min</label>
              <input type="number" className={field} {...form.register('audienceAgeMin')} />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Audience age max</label>
              <input type="number" className={field} {...form.register('audienceAgeMax')} />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Audience gender</label>
              <select className={field} {...form.register('audienceGender')}>
                <option value="mixed">Mixed</option>
                <option value="mostly_male">Mostly male</option>
                <option value="mostly_female">Mostly female</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs text-muted-foreground">USP keywords (comma separated)</label>
              <input className={field} {...form.register('uspKeywords')} />
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-xs text-muted-foreground">Goals</label>
              <div className="flex flex-wrap gap-2">
                {goalOptions.map((goal) => (
                  <button
                    type="button"
                    key={goal}
                    onClick={() => toggleGoal(goal)}
                    className={cn(
                      'rounded-full border px-3 py-1 text-xs',
                      watchedGoals.includes(goal) ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-muted-foreground',
                    )}
                  >
                    {goal}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </SectionCard>
      </div>

      <div className={cn(brandTab !== 'visual' && 'hidden')}>
        <SectionCard title="Visual system" subtitle="Palette, type mood, and style keywords.">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-2 block text-xs text-muted-foreground">Style</label>
              <div className="grid grid-cols-3 gap-2">
                {styleOptions.map((style) => (
                  <button
                    type="button"
                    key={style}
                    onClick={() => form.setValue('style', style)}
                    className={cn(
                      'h-10 rounded-lg border text-sm capitalize',
                      form.watch('style') === style ? 'border-primary bg-muted text-foreground' : 'border-border text-muted-foreground',
                    )}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs text-muted-foreground">Style keywords (comma separated)</label>
              <input className={field} {...form.register('styleKeywords')} />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Primary color</label>
              <input className={field} {...form.register('colorPrimary')} />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Secondary color</label>
              <input className={field} {...form.register('colorSecondary')} />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Accent color</label>
              <input className={field} {...form.register('colorAccent')} />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Font mood</label>
              <input className={field} {...form.register('fontMood')} />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Price segment</label>
              <input className={field} {...form.register('priceSegment')} />
            </div>
          </div>
        </SectionCard>
      </div>

      <div className={cn(brandTab !== 'voice' && 'hidden')}>
        <SectionCard title="Voice" subtitle="How your brand sounds in captions.">
          <div>
            <label className="mb-2 block text-xs text-muted-foreground">Tone</label>
            <select className={field} {...form.register('tone')}>
              {toneOptions.map((tone) => (
                <option key={tone} value={tone}>
                  {tone}
                </option>
              ))}
            </select>
          </div>
        </SectionCard>
      </div>

      <div className={cn(brandTab !== 'products' && 'hidden')}>
        <SectionCard title="Products" subtitle="Featured products and catalog references.">
          <p className="text-sm text-muted-foreground">
            Link product imagery and specs from your asset library. Structured product slots are on the roadmap—use{' '}
            <Link href="/assets" className="font-medium text-primary underline-offset-4 hover:underline">
              Assets
            </Link>{' '}
            for now.
          </p>
        </SectionCard>
      </div>

      <div className={cn(brandTab !== 'integrations' && 'hidden')}>
        <SectionCard title="Integrations & cadence" subtitle="Platforms, cadence, and automation.">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Weekly post count</label>
              <input type="number" className={field} {...form.register('weeklyPostCount')} />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Active platforms (comma separated)</label>
              <input className={field} {...form.register('activePlatforms')} />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs text-muted-foreground">Content mix JSON</label>
              <textarea
                className="min-h-20 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary"
                {...form.register('contentMix')}
              />
            </div>
            <div className="md:col-span-2 flex items-center gap-2">
              <input id="auto-schedule-tabbed" type="checkbox" {...form.register('autoSchedule')} />
              <label htmlFor="auto-schedule-tabbed" className="text-sm text-foreground">
                Auto schedule enabled
              </label>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
