'use client'

import { motion } from 'framer-motion'
import { Building2, Coffee, Shirt, Scissors, Sofa, Dumbbell, GraduationCap, ShoppingBag, Gem, Briefcase, MoreHorizontal, Home } from 'lucide-react'
import { IconCheck } from '@tabler/icons-react'
import { useOnboardingStore, type Industry } from '@/stores/onboarding'
import { INDUSTRY_LABELS } from '@/lib/industry-questions'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

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
        <h2 className="text-[#111111] font-bold text-3xl tracking-tight">What industry are you in?</h2>
        <p className="text-[#6B7280] text-sm mt-2">
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
                  ? 'border-[#111111] bg-[#F3F4F6]'
                  : 'border-[#E5E7EB] bg-white hover:border-[#D1D5DB] hover:bg-[#F7F7F8]'
              )}
            >
              {selected && (
                <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#111111] flex items-center justify-center">
                  <IconCheck size={11} className="text-white" />
                </span>
              )}
              <Icon size={22} className={selected ? 'text-[#111111]' : 'text-[#6B7280]'} />
              <div>
                <p className={cn('font-semibold text-sm', selected ? 'text-[#111111]' : 'text-[#111111]')}>{ind.label}</p>
                <p className="text-[#6B7280] text-[11px] mt-0.5 leading-tight">{ind.desc}</p>
              </div>
            </motion.button>
          )
        })}
      </div>

      <div className="flex items-center justify-between pt-2">
        <button onClick={() => setStep(2)} className="text-[#6B7280] hover:text-[#111111] text-sm transition-colors">← Back</button>
        <Button
          onClick={() => setStep(4)}
          disabled={!data.industry}
          className="px-6 py-2.5 text-sm font-semibold"
        >
          Continue →
        </Button>
      </div>
    </div>
  )
}
