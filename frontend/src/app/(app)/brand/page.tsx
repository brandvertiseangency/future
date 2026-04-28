'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Upload, Globe, Phone, MapPin, Tag, Save, Loader2,
  Building2, Pencil, CheckCircle2, AlertCircle, X,
  Palette, Users, Target, Megaphone,
} from 'lucide-react'
import useSWR, { mutate } from 'swr'
import { apiCall } from '@/lib/api'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { BlurFade } from '@/components/ui/blur-fade'
import { PageHeader } from '@/components/ui/page-primitives'

// ─── Types ────────────────────────────────────────────────────────────────────
interface BrandData {
  id: string
  name: string
  description: string
  tagline: string
  website: string
  phone: string
  address: string
  logo_url: string
  industry: string
  tone: number
  color_primary: string
  color_secondary: string
  color_accent: string
  font_mood: string
  audience_age_min: number
  audience_age_max: number
  audience_gender: string
  audience_location: string
  goals: string[]
  platforms: string[]
  usp_keywords: string[]
  price_segment: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const inputBase =
  'w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white placeholder:text-white/20 text-sm focus:outline-none focus:border-white/[0.22] transition-all'

const inputWithIcon =
  'w-full bg-white/[0.03] border border-white/[0.08] rounded-xl pl-9 pr-4 py-2.5 text-white placeholder:text-white/20 text-sm focus:outline-none focus:border-white/[0.22] transition-all'

function SectionCard({ title, icon: Icon, children }: { title: string; icon: React.ComponentType<{ size?: number; className?: string }>; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#0a0a0a] overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-white/[0.05]">
        <Icon size={14} className="text-white/40" />
        <h3 className="text-[13px] font-semibold text-white/80 tracking-[-0.01em]">{title}</h3>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  )
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10.5px] font-medium text-white/30 uppercase tracking-[0.1em] mb-1.5">{label}</label>
      {children}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function BrandDetailsPage() {
  const { data: brandRes, isLoading } = useSWR(
    '/api/brand/me',
    (url: string) => apiCall<{ brand: BrandData }>(url),
    { revalidateOnFocus: false }
  )

  const [form, setForm] = useState<Partial<BrandData>>({})
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)
  const logoInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (brandRes?.brand) {
      setForm(brandRes.brand)
      setDirty(false)
    }
  }, [brandRes])

  const update = (patch: Partial<BrandData>) => {
    setForm((f) => ({ ...f, ...patch }))
    setDirty(true)
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => update({ logo_url: reader.result as string })
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await apiCall('/api/brand/me', {
        method: 'PATCH',
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          tagline: form.tagline,
          website: form.website,
          phone: form.phone,
          address: form.address,
          logo_url: form.logo_url,
          industry: form.industry,
          tone: form.tone,
          color_primary: form.color_primary,
          color_secondary: form.color_secondary,
          color_accent: form.color_accent,
          font_mood: form.font_mood,
          audience_age_min: form.audience_age_min,
          audience_age_max: form.audience_age_max,
          audience_gender: form.audience_gender,
          audience_location: form.audience_location,
          goals: form.goals,
          platforms: form.platforms,
          usp_keywords: form.usp_keywords,
          price_segment: form.price_segment,
        }),
      })
      await mutate('/api/brand/me')
      setDirty(false)
      toast.success('Brand details saved!')
    } catch {
      toast.error('Failed to save — please try again')
    } finally {
      setSaving(false)
    }
  }

  const initials = form.name?.slice(0, 2).toUpperCase() ?? 'BV'

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-56px)] flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-white/20" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 space-y-6 pb-24">
      {/* Header */}
      <BlurFade delay={0}>
        <div className="flex items-start justify-between">
          <PageHeader
            title="Your Brand"
            description="Update your brand details used across all AI-generated content."
          />
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSave}
            disabled={!dirty || saving}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all',
              dirty
                ? 'bg-white text-black hover:bg-white/90'
                : 'bg-white/[0.05] text-white/25 cursor-default'
            )}
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? 'Saving…' : 'Save Changes'}
          </motion.button>
        </div>
      </BlurFade>

      {/* Unsaved changes banner */}
      {dirty && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/[0.08] border border-amber-500/20 text-amber-400 text-sm"
        >
          <AlertCircle size={14} />
          You have unsaved changes
        </motion.div>
      )}

      {/* Brand Identity */}
      <BlurFade delay={0.04}>
        <SectionCard title="Brand Identity" icon={Building2}>
          {/* Logo + name row */}
          <div className="flex items-start gap-4">
            {/* Logo */}
            <div className="flex-shrink-0 space-y-1">
              <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
              <button
                onClick={() => logoInputRef.current?.click()}
                className={cn(
                  'w-16 h-16 rounded-2xl border-2 border-dashed flex items-center justify-center overflow-hidden group transition-all relative',
                  form.logo_url ? 'border-white/15' : 'border-white/[0.10] hover:border-white/25'
                )}
              >
                {form.logo_url ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={form.logo_url} alt="Logo" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Pencil size={13} className="text-white" />
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    <Upload size={15} className="text-white/30 group-hover:text-white/60 transition-colors" />
                    <span className="text-[9px] text-white/20">Logo</span>
                  </div>
                )}
              </button>
              {form.logo_url && (
                <button onClick={() => update({ logo_url: '' })} className="flex items-center gap-1 text-[9px] text-white/20 hover:text-red-400 transition-colors mx-auto">
                  <X size={9} />Remove
                </button>
              )}
            </div>

            {/* Name + tagline */}
            <div className="flex-1 space-y-3">
              <FieldRow label="Brand Name *">
                <input className={inputBase} value={form.name ?? ''} onChange={(e) => update({ name: e.target.value })} placeholder="e.g. Acme Studio" />
              </FieldRow>
              <FieldRow label="Tagline">
                <div className="relative">
                  <Tag size={13} className="absolute left-3 top-3 text-white/25 pointer-events-none" />
                  <input className={inputWithIcon} value={form.tagline ?? ''} onChange={(e) => update({ tagline: e.target.value })} placeholder="e.g. Wear your story" />
                </div>
              </FieldRow>
            </div>
          </div>

          {/* Description */}
          <FieldRow label="Brand Description *">
            <textarea
              rows={3}
              className={`${inputBase} resize-none`}
              value={form.description ?? ''}
              onChange={(e) => update({ description: e.target.value })}
              placeholder="What does your brand do? Who do you serve?"
            />
          </FieldRow>

          {/* Industry + price segment */}
          <div className="grid grid-cols-2 gap-3">
            <FieldRow label="Industry">
              <input className={inputBase} value={form.industry ?? ''} onChange={(e) => update({ industry: e.target.value })} placeholder="e.g. Fashion" />
            </FieldRow>
            <FieldRow label="Price Segment">
              <select
                className={inputBase}
                value={form.price_segment ?? ''}
                onChange={(e) => update({ price_segment: e.target.value })}
              >
                <option value="">Select…</option>
                <option value="budget">Budget</option>
                <option value="mid">Mid-range</option>
                <option value="premium">Premium</option>
                <option value="luxury">Luxury</option>
              </select>
            </FieldRow>
          </div>
        </SectionCard>
      </BlurFade>

      {/* Contact & Location */}
      <BlurFade delay={0.08}>
        <SectionCard title="Contact & Location" icon={MapPin}>
          <div className="grid grid-cols-2 gap-3">
            <FieldRow label="Website">
              <div className="relative">
                <Globe size={13} className="absolute left-3 top-3 text-white/25 pointer-events-none" />
                <input className={inputWithIcon} value={form.website ?? ''} onChange={(e) => update({ website: e.target.value })} placeholder="https://yourbrand.com" />
              </div>
            </FieldRow>
            <FieldRow label="Phone">
              <div className="relative">
                <Phone size={13} className="absolute left-3 top-3 text-white/25 pointer-events-none" />
                <input className={inputWithIcon} value={form.phone ?? ''} onChange={(e) => update({ phone: e.target.value })} placeholder="+91 98765 43210" />
              </div>
            </FieldRow>
          </div>
          <FieldRow label="Address / City">
            <div className="relative">
              <MapPin size={13} className="absolute left-3 top-3 text-white/25 pointer-events-none" />
              <input className={inputWithIcon} value={form.address ?? ''} onChange={(e) => update({ address: e.target.value })} placeholder="123 Main Street, Mumbai, India" />
            </div>
          </FieldRow>
        </SectionCard>
      </BlurFade>

      {/* Visual Identity */}
      <BlurFade delay={0.12}>
        <SectionCard title="Visual Identity" icon={Palette}>
          <div className="grid grid-cols-3 gap-3">
            {([
              { label: 'Primary Color', field: 'color_primary' },
              { label: 'Secondary Color', field: 'color_secondary' },
              { label: 'Accent Color', field: 'color_accent' },
            ] as const).map(({ label, field }) => (
              <FieldRow key={field} label={label}>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={form[field] ?? '#000000'}
                    onChange={(e) => update({ [field]: e.target.value })}
                    className="w-9 h-9 rounded-lg border border-white/[0.08] bg-transparent cursor-pointer p-0.5"
                  />
                  <input
                    className="flex-1 bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-white/[0.22] transition-all uppercase"
                    value={form[field] ?? ''}
                    onChange={(e) => update({ [field]: e.target.value })}
                    placeholder="#000000"
                    maxLength={7}
                  />
                </div>
              </FieldRow>
            ))}
          </div>
          <FieldRow label="Font Mood">
            <select
              className={inputBase}
              value={form.font_mood ?? ''}
              onChange={(e) => update({ font_mood: e.target.value })}
            >
              <option value="">Select…</option>
              <option value="modern">Modern (clean, geometric sans-serif)</option>
              <option value="classic">Classic (elegant serif)</option>
              <option value="playful">Playful (rounded, bubbly)</option>
              <option value="luxury">Luxury (high-contrast, editorial)</option>
              <option value="tech">Tech (monospace / futuristic)</option>
              <option value="handwritten">Handwritten (organic, personal)</option>
            </select>
          </FieldRow>

          {/* Color preview */}
          <div className="flex items-center gap-2 pt-1">
            {[form.color_primary, form.color_secondary, form.color_accent].filter(Boolean).map((c, i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-lg border border-white/10 shadow-sm"
                style={{ background: c }}
                title={c}
              />
            ))}
            <span className="text-[11px] text-white/20 ml-1">Your brand palette</span>
          </div>
        </SectionCard>
      </BlurFade>

      {/* Audience */}
      <BlurFade delay={0.16}>
        <SectionCard title="Target Audience" icon={Users}>
          <div className="grid grid-cols-2 gap-3">
            <FieldRow label="Age Range">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  className={inputBase}
                  value={form.audience_age_min ?? 22}
                  onChange={(e) => update({ audience_age_min: Number(e.target.value) })}
                  min={13} max={80}
                  placeholder="Min age"
                />
                <span className="text-white/20 text-sm flex-shrink-0">–</span>
                <input
                  type="number"
                  className={inputBase}
                  value={form.audience_age_max ?? 45}
                  onChange={(e) => update({ audience_age_max: Number(e.target.value) })}
                  min={13} max={80}
                  placeholder="Max age"
                />
              </div>
            </FieldRow>
            <FieldRow label="Gender">
              <select className={inputBase} value={form.audience_gender ?? 'mixed'} onChange={(e) => update({ audience_gender: e.target.value })}>
                <option value="mixed">Mixed / All</option>
                <option value="mostly_female">Mostly Female</option>
                <option value="mostly_male">Mostly Male</option>
              </select>
            </FieldRow>
          </div>
          <FieldRow label="Location / City">
            <div className="relative">
              <MapPin size={13} className="absolute left-3 top-3 text-white/25 pointer-events-none" />
              <input className={inputWithIcon} value={form.audience_location ?? ''} onChange={(e) => update({ audience_location: e.target.value })} placeholder="e.g. Mumbai, India" />
            </div>
          </FieldRow>
        </SectionCard>
      </BlurFade>

      {/* Brand Voice */}
      <BlurFade delay={0.20}>
        <SectionCard title="Brand Voice & Goals" icon={Megaphone}>
          <FieldRow label={`Tone of Voice — ${form.tone ?? 50}%`}>
            <div className="space-y-2">
              <input
                type="range" min={0} max={100}
                value={form.tone ?? 50}
                onChange={(e) => update({ tone: Number(e.target.value) })}
                className="w-full accent-white"
              />
              <div className="flex justify-between text-[10px] text-white/20">
                <span>Casual</span>
                <span>Balanced</span>
                <span>Professional</span>
              </div>
            </div>
          </FieldRow>
          <FieldRow label="USP Keywords">
            <input
              className={inputBase}
              value={(form.usp_keywords ?? []).join(', ')}
              onChange={(e) => update({ usp_keywords: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
              placeholder="e.g. handcrafted, sustainable, premium, local"
            />
            <p className="text-[10px] text-white/20 mt-1">Separate with commas</p>
          </FieldRow>
        </SectionCard>
      </BlurFade>

      {/* Save button (bottom sticky) */}
      {dirty && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
        >
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-white text-black font-semibold text-sm shadow-[0_8px_32px_rgba(0,0,0,0.6)] hover:bg-white/90 transition-all"
          >
            {saving
              ? <><Loader2 size={15} className="animate-spin" /> Saving…</>
              : <><CheckCircle2 size={15} /> Save Brand Details</>
            }
          </button>
        </motion.div>
      )}
    </div>
  )
}
