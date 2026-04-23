'use client'

import { useRef } from 'react'
import { motion } from 'framer-motion'
import { IconCheck } from '@tabler/icons-react'
import { Shirt, UtensilsCrossed, Monitor, HeartPulse, DollarSign, GraduationCap, Home, Sparkles as SparklesIcon, Plane, Trophy, Film, MoreHorizontal, Upload, Globe, Phone, MapPin, Tag, X } from 'lucide-react'
import { useOnboardingStore } from '@/stores/onboarding'
import { cn } from '@/lib/utils'
import { AIButton } from '@/components/ui/ai-button'

const INDUSTRIES = [
  { id: 'Fashion', label: 'Fashion', Icon: Shirt },
  { id: 'Food & Beverage', label: 'Food & Bev', Icon: UtensilsCrossed },
  { id: 'Tech & SaaS', label: 'Tech & SaaS', Icon: Monitor },
  { id: 'Health & Wellness', label: 'Health', Icon: HeartPulse },
  { id: 'Finance', label: 'Finance', Icon: DollarSign },
  { id: 'Education', label: 'Education', Icon: GraduationCap },
  { id: 'Real Estate', label: 'Real Estate', Icon: Home },
  { id: 'Beauty', label: 'Beauty', Icon: SparklesIcon },
  { id: 'Travel', label: 'Travel', Icon: Plane },
  { id: 'Sports', label: 'Sports', Icon: Trophy },
  { id: 'Entertainment', label: 'Entertainment', Icon: Film },
  { id: 'Other', label: 'Other', Icon: MoreHorizontal },
]

const inputClass =
  'w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/25 text-sm focus:outline-none focus:border-[var(--ai-border)]/50 focus:bg-white/[0.05] transition-all duration-200'

const inputWithIcon =
  'w-full bg-white/[0.03] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-white/25 text-sm focus:outline-none focus:border-[var(--ai-border)]/50 focus:bg-white/[0.05] transition-all duration-200'

export function StepBrandIdentity() {
  const { data, updateData, setStep } = useOnboardingStore()
  const logoInputRef = useRef<HTMLInputElement>(null)

  const initials = data.brandName
    ? data.brandName.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  const canContinue = data.brandName.trim() && data.description.trim() && data.industry

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => updateData({ logoUrl: reader.result as string })
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-white font-bold text-3xl tracking-tight">Tell us about your brand</h2>
        <p className="text-white/40 text-sm mt-2">
          We&apos;ll use this to craft your unique brand DNA.
        </p>
      </div>

      {/* Logo upload + brand name row */}
      <div className="flex items-start gap-4">
        {/* Logo uploader */}
        <div className="flex-shrink-0">
          <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
          <button
            onClick={() => logoInputRef.current?.click()}
            className={cn(
              'w-16 h-16 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all group overflow-hidden',
              data.logoUrl
                ? 'border-white/20'
                : 'border-white/[0.12] hover:border-[var(--ai-border)]/50 hover:bg-white/[0.03]'
            )}
          >
            {data.logoUrl ? (
              <div className="relative w-full h-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={data.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <X size={14} className="text-white" />
                </div>
              </div>
            ) : (
              <>
                <Upload size={16} className="text-white/30 group-hover:text-white/60 transition-colors" />
                <span className="text-[9px] text-white/20 mt-1">Logo</span>
              </>
            )}
          </button>
          {data.logoUrl && (
            <button onClick={() => updateData({ logoUrl: '' })} className="text-[10px] text-white/20 hover:text-red-400 mt-1 w-full text-center transition-colors">
              Remove
            </button>
          )}
        </div>

        {/* Brand name + tagline */}
        <div className="flex-1 space-y-3">
          <div className="relative">
            <input
              className={inputClass}
              placeholder="Brand name *"
              maxLength={50}
              value={data.brandName}
              onChange={(e) => updateData({ brandName: e.target.value })}
            />
            <span className="absolute right-3 top-3 text-xs text-white/20">{data.brandName.length}/50</span>
          </div>
          <div className="relative">
            <Tag size={14} className="absolute left-3.5 top-3.5 text-white/25 pointer-events-none" />
            <input
              className={inputWithIcon}
              placeholder="Tagline (optional) — e.g. Wear your story"
              maxLength={80}
              value={data.tagline}
              onChange={(e) => updateData({ tagline: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="relative">
        <input
          className={inputClass}
          placeholder="One-line description * (e.g. We make sustainable sneakers for urban runners)"
          maxLength={120}
          value={data.description}
          onChange={(e) => updateData({ description: e.target.value })}
        />
        <span className="absolute right-3 top-3 text-xs text-white/20">{data.description.length}/120</span>
      </div>

      {/* Contact & location row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="relative">
          <Globe size={14} className="absolute left-3.5 top-3.5 text-white/25 pointer-events-none" />
          <input
            className={inputWithIcon}
            placeholder="Website (optional)"
            value={data.website}
            onChange={(e) => updateData({ website: e.target.value })}
          />
        </div>
        <div className="relative">
          <Phone size={14} className="absolute left-3.5 top-3.5 text-white/25 pointer-events-none" />
          <input
            className={inputWithIcon}
            placeholder="Phone (optional)"
            value={(data as unknown as { phone: string }).phone ?? ''}
            onChange={(e) => updateData({ phone: e.target.value } as never)}
          />
        </div>
        <div className="relative col-span-2">
          <MapPin size={14} className="absolute left-3.5 top-3.5 text-white/25 pointer-events-none" />
          <input
            className={inputWithIcon}
            placeholder="Address / City (optional) — e.g. 123 Main St, Mumbai"
            value={(data as unknown as { address: string }).address ?? data.city ?? ''}
            onChange={(e) => updateData({ address: e.target.value, city: e.target.value } as never)}
          />
        </div>
      </div>

      {/* Industry tiles */}
      <div>
        <p className="text-white/50 text-xs uppercase tracking-wider font-medium mb-3">Industry *</p>
        <div className="grid grid-cols-4 gap-2">
          {INDUSTRIES.map((ind) => {
            const selected = data.industry === ind.id
            return (
              <motion.button
                key={ind.id}
                whileTap={{ scale: 0.96 }}
                onClick={() => updateData({ industry: ind.id as import('@/stores/onboarding').Industry })}
                className={cn(
                  'relative flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all',
                  selected
                    ? 'border-[var(--ai-border)]/60 bg-[var(--ai-color)]/[0.1]'
                    : 'border-white/[0.08] bg-white/[0.02] hover:border-white/20'
                )}
              >
                {selected && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[var(--ai-color)] flex items-center justify-center">
                    <IconCheck size={9} className="text-white" />
                  </span>
                )}
                <ind.Icon size={20} className="text-[var(--text-2)]" />
                <span className="text-[11px] text-white/60 font-medium leading-tight">{ind.label}</span>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Live preview */}
      {data.brandName && (
        <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.07]">
          <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-cyan-500 to-blue-500">
            {data.logoUrl
              ? <img src={data.logoUrl} alt="" className="w-full h-full object-cover" />
              : <span className="text-white font-bold text-lg">{initials}</span>
            }
          </div>
          <div>
            <p className="text-white font-semibold text-sm">{data.brandName}</p>
            {data.tagline && <p className="text-[var(--ai-color)] text-xs mt-0.5 italic">{data.tagline}</p>}
            {data.description && (
              <p className="text-white/40 text-xs mt-0.5 line-clamp-1">{data.description}</p>
            )}
            {data.website && <p className="text-white/25 text-[10px] mt-0.5">{data.website}</p>}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-2">
        <button onClick={() => setStep(1)} className="text-white/30 hover:text-white/60 text-sm transition-colors">
          ← Back
        </button>
        <div className="flex items-center gap-4">
          <button onClick={() => setStep(3)} className="text-white/30 hover:text-white/60 text-sm transition-colors">
            Skip for now →
          </button>
          <AIButton
            onClick={() => setStep(3)}
            disabled={!canContinue}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold"
          >
            Continue →
          </AIButton>
        </div>
      </div>
    </div>
  )
}
