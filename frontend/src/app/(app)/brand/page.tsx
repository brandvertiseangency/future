'use client'

import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { ChevronLeft, ChevronRight, Upload, X } from 'lucide-react'
import useSWR from 'swr'
import { apiCall } from '@/lib/api'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { PageContainer, PageHeader } from '@/components/ui/page-primitives'
import { SectionCard } from '@/components/ui/saas-primitives'
import { Button } from '@/components/ui/button'

const goals = ['Increase Brand Awareness', 'Drive Sales', 'Engagement', 'Product Launch']
const styles = ['minimal', 'luxury', 'bold'] as const
const tones = ['Neutral', 'Warm', 'Professional', 'Friendly']

const brandSchema = z.object({
  name: z.string().min(2, 'Brand name is required'),
  industry: z.string().min(2, 'Industry is required'),
  audience: z.string().min(5, 'Audience details are required'),
  goals: z.array(z.string()).min(1, 'Select at least one goal'),
  style: z.enum(styles),
  tone: z.string().min(1, 'Select a tone'),
  visualBalance: z.enum(['text', 'balanced', 'visual']),
  competitorLinks: z.string().optional(),
})

type BrandSetupForm = z.infer<typeof brandSchema>

const field = 'h-10 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm text-[#111111] outline-none placeholder:text-[#9CA3AF] focus:border-[#111111]'

export default function BrandDetailsPage() {
  const [step, setStep] = useState(1)
  const [assets, setAssets] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  const { data: brandRes } = useSWR('/api/brand/me', (url: string) => apiCall<{ brand?: { name?: string; industry?: string; description?: string } }>(url), { revalidateOnFocus: false })
  const defaults = useMemo(
    () => ({
      name: brandRes?.brand?.name ?? '',
      industry: brandRes?.brand?.industry ?? '',
      audience: '',
      goals: [] as string[],
      style: 'minimal' as const,
      tone: '',
      visualBalance: 'balanced' as const,
      competitorLinks: '',
    }),
    [brandRes]
  )

  const form = useForm<BrandSetupForm>({
    defaultValues: defaults,
    values: defaults,
    mode: 'onChange',
  })

  const onSubmit = async (values: BrandSetupForm) => {
    const parsed = brandSchema.safeParse(values)
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? 'Please complete all required fields')
      return
    }
    setSaving(true)
    try {
      await apiCall('/api/brand/me', {
        method: 'PATCH',
        body: JSON.stringify({
          name: values.name,
          industry: values.industry,
          description: values.audience,
          goals: values.goals,
          tone: 50,
          font_mood: values.style,
          audience_location: values.audience,
          website: values.competitorLinks ?? '',
        }),
      })
      toast.success('Brand setup saved')
    } catch {
      toast.error('Unable to save brand setup')
    } finally {
      setSaving(false)
    }
  }

  const toggleGoal = (goal: string) => {
    const current = form.getValues('goals')
    form.setValue(
      'goals',
      current.includes(goal) ? current.filter((g) => g !== goal) : [...current, goal],
      { shouldValidate: true }
    )
  }

  const onAssetUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    const urls = files.map((file) => URL.createObjectURL(file))
    setAssets((prev) => [...prev, ...urls].slice(0, 8))
  }

  return (
    <PageContainer className="space-y-6">
      <PageHeader title="Create New Brand" description="Set up your brand details, style and assets for high-quality generation." />

      <div className="app-card p-4">
        <div className="flex items-center justify-between text-xs text-[#6B7280]">
          <span className={cn(step >= 1 && 'text-[#111111]')}>1. Brand Details</span>
          <span className={cn(step >= 2 && 'text-[#111111]')}>2. Brand Assets</span>
          <span className={cn(step >= 3 && 'text-[#111111]')}>3. Review</span>
        </div>
        <div className="mt-2 h-1 rounded-full bg-[#EFEFF1]">
          <div className="h-1 rounded-full bg-[#111111] transition-all" style={{ width: `${(step / 3) * 100}%` }} />
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {step === 1 && (
          <SectionCard title="Brand Details" subtitle="Tell us about your brand and audience.">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs text-[#6B7280]">Brand name</label>
                <input className={field} {...form.register('name')} />
              </div>
              <div>
                <label className="mb-1 block text-xs text-[#6B7280]">Industry</label>
                <input className={field} {...form.register('industry')} />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-xs text-[#6B7280]">Target audience</label>
                <textarea className="min-h-24 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm outline-none focus:border-[#111111]" {...form.register('audience')} />
              </div>
              <div className="md:col-span-2">
                <label className="mb-2 block text-xs text-[#6B7280]">Goals</label>
                <div className="flex flex-wrap gap-2">
                  {goals.map((goal) => (
                    <button
                      type="button"
                      key={goal}
                      onClick={() => toggleGoal(goal)}
                      className={cn(
                        'rounded-full border px-3 py-1 text-xs',
                        form.watch('goals').includes(goal) ? 'border-[#111111] bg-[#111111] text-white' : 'border-[#E5E7EB] bg-white text-[#6B7280]'
                      )}
                    >
                      {goal}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </SectionCard>
        )}

        {step === 2 && (
          <SectionCard title="Style Preferences and Assets" subtitle="Select visual direction and upload references.">
            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-xs text-[#6B7280]">Style</label>
                <div className="grid grid-cols-3 gap-2">
                  {styles.map((style) => (
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
                  <option value="">Select tone</option>
                  {tones.map((tone) => (
                    <option key={tone} value={tone}>{tone}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs text-[#6B7280]">Visual vs text balance</label>
                <div className="grid grid-cols-3 gap-2">
                  {['text', 'balanced', 'visual'].map((balance) => (
                    <button
                      type="button"
                      key={balance}
                      onClick={() => form.setValue('visualBalance', balance as 'text' | 'balanced' | 'visual')}
                      className={cn(
                        'h-10 rounded-lg border text-sm capitalize',
                        form.watch('visualBalance') === balance ? 'border-[#111111] bg-[#F3F4F6] text-[#111111]' : 'border-[#E5E7EB] text-[#6B7280]'
                      )}
                    >
                      {balance}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs text-[#6B7280]">Upload assets</label>
                <label className="flex h-24 cursor-pointer items-center justify-center rounded-lg border border-dashed border-[#E5E7EB] bg-[#F7F7F8] text-sm text-[#6B7280]">
                  <Upload className="mr-2 h-4 w-4" />
                  Drag & drop or browse
                  <input type="file" multiple accept="image/*" className="hidden" onChange={onAssetUpload} />
                </label>
                {assets.length > 0 && (
                  <div className="mt-3 grid grid-cols-4 gap-2">
                    {assets.map((asset, index) => (
                      <div key={asset} className="relative overflow-hidden rounded-lg border border-[#E5E7EB]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={asset} alt={`Asset ${index + 1}`} className="h-16 w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setAssets((prev) => prev.filter((_, i) => i !== index))}
                          className="absolute right-1 top-1 rounded bg-white p-0.5 text-[#6B7280]"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </SectionCard>
        )}

        {step === 3 && (
          <SectionCard title="Competitor Input and Review" subtitle="Add competitor links and review before saving.">
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs text-[#6B7280]">Competitor links</label>
                <input className={field} placeholder="https://example.com, https://instagram.com/example" {...form.register('competitorLinks')} />
              </div>
              <div className="rounded-lg border border-[#E5E7EB] bg-[#F7F7F8] p-4 text-sm">
                <p className="font-medium text-[#111111]">{form.watch('name') || 'Brand name'}</p>
                <p className="mt-1 text-[#6B7280]">{form.watch('industry') || 'Industry'}</p>
                <p className="mt-2 text-[#6B7280]">Goals: {form.watch('goals').join(', ') || 'None selected'}</p>
              </div>
            </div>
          </SectionCard>
        )}

        <div className="flex items-center justify-between">
          <Button type="button" variant="secondary" onClick={() => setStep((s) => Math.max(1, s - 1))} disabled={step === 1}>
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
          {step < 3 ? (
            <Button type="button" onClick={() => setStep((s) => Math.min(3, s + 1))}>
              Continue
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save & Continue'}
            </Button>
          )}
        </div>
      </form>
    </PageContainer>
  )
}
