'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  IconEdit,
  IconLoader2,
  IconSparkles,
  IconCalendarEvent,
  IconPhoto,
} from '@tabler/icons-react'
import { useOnboardingStore } from '@/stores/onboarding'
import { useBrandStore } from '@/stores/brand'
import { apiCall } from '@/lib/api'
import { toast } from 'sonner'

export function StepReview() {
  const { data, setStep } = useOnboardingStore()
  const { setBrand } = useBrandStore()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState('')

  const launch = async () => {
    setLoading(true)
    try {
      setProgress('Saving your brand...')
      const brand = await apiCall<{ id: string; name: string }>('/api/brand', {
        method: 'POST',
        body: JSON.stringify(data),
      })

      setProgress('Generating brand DNA...')
      await apiCall('/api/brand/generate-dna', {
        method: 'POST',
        body: JSON.stringify({ brandId: brand.id }),
      })

      setBrand(brand)
      toast.success('Brand launched! 🚀')
      router.push('/dashboard')
    } catch {
      toast.error('Launch failed — please try again')
      setLoading(false)
    }
  }

  const sections = [
    { label: 'Brand Name', value: data.brandName, step: 1 },
    { label: 'Industry', value: data.industry, step: 1 },
    { label: 'Voice', value: data.voice, step: 1 },
    { label: 'Goals', value: data.goals.join(', '), step: 3 },
    { label: 'Audience', value: `${data.gender}, ages ${data.ageRange[0]}–${data.ageRange[1]}`, step: 2 },
    { label: 'Visual Style', value: data.visualStyle, step: 4 },
  ]

  const timeline = [
    { icon: IconSparkles, label: 'Brand DNA generated' },
    { icon: IconCalendarEvent, label: 'Content strategy built' },
    { icon: IconPhoto, label: 'First posts ready in 60 seconds' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <span className="section-tag">Review</span>
        <h2 className="text-white font-semibold text-3xl tracking-tight">
          Your brand is ready.
        </h2>
        <p className="text-white/50 text-sm mt-2">
          Let&apos;s build something{' '}
          <em className="font-playfair text-white/80 italic">remarkable.</em>
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Brand DNA Summary */}
        <div className="gradient-border p-5 space-y-3">
          <p className="text-white/60 text-xs uppercase tracking-wider font-medium mb-4">Brand DNA</p>
          {sections.map((s) => (
            <div key={s.label} className="flex items-start justify-between gap-3">
              <div>
                <p className="text-white/40 text-xs">{s.label}</p>
                <p className="text-white text-sm font-medium capitalize">{s.value || '—'}</p>
              </div>
              <button
                onClick={() => setStep(s.step)}
                className="text-white/30 hover:text-white/60 transition-colors mt-0.5"
              >
                <IconEdit size={13} />
              </button>
            </div>
          ))}
        </div>

        {/* What happens next */}
        <div className="space-y-4">
          <p className="text-white/60 text-xs uppercase tracking-wider font-medium">What happens next</p>
          <div className="space-y-4">
            {timeline.map((item, i) => {
              const Icon = item.icon
              return (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-violet-500/15 border border-violet-500/30 flex items-center justify-center flex-shrink-0">
                    <Icon size={15} className="text-violet-400" />
                  </div>
                  <p className="text-white/70 text-sm">
                    <span className="text-white/30 mr-2">0{i + 1}</span>
                    {item.label}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Launch button */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        whileHover={{ scale: 1.01 }}
        onClick={launch}
        disabled={loading}
        className="w-full h-14 rounded-xl bg-white text-black font-semibold text-base flex items-center justify-center gap-2 hover:bg-white/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <IconLoader2 size={18} className="animate-spin" />
            {progress}
          </>
        ) : (
          <>
            <span className="text-violet-600">✦</span>
            Launch My Brand
          </>
        )}
      </motion.button>
    </div>
  )
}
