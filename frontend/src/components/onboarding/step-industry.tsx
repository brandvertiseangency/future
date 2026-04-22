'use client'

import { motion } from 'framer-motion'
import { Building2, Coffee, Shirt, Scissors, Sofa, Dumbbell, GraduationCap, ShoppingBag, Gem, Briefcase, MoreHorizontal, Home } from 'lucide-react'
import { IconCheck } from '@tabler/icons-react'
import { useOnboardingStore, type Industry } from '@/stores/onboarding'
import { INDUSTRY_LABELS } from '@/lib/industry-questions'
import { cn } from '@/lib/utils'
import { AIButton } from '@/components/ui/ai-button'

const INDUSTRIES: { id: Industry; label: string; icon: React.ComponentType<{ size?: number; className?: string }>; desc: string }[] = [
  { id: 'real_estate', label: 'Real Estate', icon: Home, desc: 'Properties, projects, developers' },
  { id: 'restaurant_cafe', label: 'Restaurant / Café', icon: Coffee, desc: 'Food service, delivery, QSR' },
  { id: 'fashion_clothing', label: 'Fashion & Clothing', icon: Shirt, desc: 'Apparel, accessories, boutiques' },
  { id: 'salon_beauty', label: 'Salon & Beauty', icon: Scissors, desc: 'Hair, skin, nail, spa services' },
  { id: 'interior_design', label: 'Interior Design', icon: Sofa, desc: 'Residential & commercial spaces' },
  { id: 'gym_fitness', label: 'Gym & Fitness', icon: Dumbbell, desc: 'Training, wellness, yoga studios' },
  { id: 'education_coaching', label: 'Education', icon: GraduationCap, desc: 'Coaching, online courses, tutoring' },
  { id: 'ecommerce', label: 'E-commerce', icon: ShoppingBag, desc: 'Online store, D2C brand' },
  { id: 'jewellery', label: 'Jewellery', icon: Gem, desc: 'Gold, silver, diamonds, fashion' },
  { id: 'consultant', label: 'Consulting', icon: Briefcase, desc: 'Advisory, coaching, professional services' },
  { id: 'other', label: 'Other', icon: MoreHorizontal, desc: "Something else — we'll adapt" },
]

export function StepIndustry() {
  const { data, updateData, setStep } = useOnboardingStore()

  const select = (id: Industry) => {
    updateData({ industry: id, industryLabel: INDUSTRY_LABELS[id] })
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-white font-bold text-3xl tracking-tight">What industry are you in?</h2>
        <p className="text-white/40 text-sm mt-2">
          This unlocks industry-specific questions and content strategies.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {INDUSTRIES.map((ind) => {
          const selected = data.industry === ind.id
          const Icon = ind.icon
          return (
            <motion.button
              key={ind.id}
              whileTap={{ scale: 0.96 }}
              onClick={() => select(ind.id)}
              className={cn(
                'relative flex flex-col items-start gap-2 p-4 rounded-2xl border text-left transition-all',
                selected
                  ? 'border-[var(--ai-border)]/60 bg-[var(--ai-color)]/[0.1]'
                  : 'border-white/[0.08] bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'
              )}
            >
              {selected && (
                <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[var(--ai-color)] flex items-center justify-center">
                  <IconCheck size={11} className="text-black" />
                </span>
              )}
              <Icon size={22} className={selected ? 'text-[var(--ai-color)]' : 'text-white/50'} />
              <div>
                <p className={cn('font-semibold text-sm', selected ? 'text-[var(--ai-color)]' : 'text-white')}>{ind.label}</p>
                <p className="text-white/35 text-[11px] mt-0.5 leading-tight">{ind.desc}</p>
              </div>
            </motion.button>
          )
        })}
      </div>

      <div className="flex items-center justify-between pt-2">
        <button onClick={() => setStep(1)} className="text-white/30 hover:text-white/60 text-sm transition-colors">← Back</button>
        <AIButton
          onClick={() => setStep(3)}
          disabled={!data.industry}
          className="px-6 py-2.5 rounded-xl text-sm font-semibold"
        >
          Continue →
        </AIButton>
      </div>
    </div>
  )
}
