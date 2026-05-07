'use client'

import { motion } from 'framer-motion'
import { Building2, Coffee, Shirt, Scissors, Sofa, Dumbbell, GraduationCap, ShoppingBag, Gem, Briefcase, MoreHorizontal, Home } from 'lucide-react'
import { IconCheck } from '@tabler/icons-react'
import { useOnboardingStore, type Industry } from '@/stores/onboarding'
import { INDUSTRY_LABELS } from '@/lib/industry-questions'
import { cn } from '@/lib/utils'
import { StepHeader, StepFooter } from '@/components/onboarding/primitives/onboarding-shell'

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
    <div className="flex h-full flex-col">
      <StepHeader
        eyebrow="Step 3"
        title="What industry are you in?"
        description="This unlocks industry-specific questions and content strategies."
      />

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {INDUSTRIES.map((ind) => {
          const selected = data.industry === ind.id
          const Icon = ind.icon
          return (
            <motion.button
              key={ind.id}
              whileTap={{ scale: 0.96 }}
              onClick={() => select(ind.id)}
              className={cn(
                'relative flex flex-col items-start gap-2 rounded-xl border p-3.5 text-left transition-all',
                selected
                  ? 'border-foreground bg-muted/60'
                  : 'border-border bg-background hover:border-border/80 hover:bg-muted/30',
              )}
            >
              {selected && (
                <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-foreground">
                  <IconCheck size={11} className="text-background" />
                </span>
              )}
              <Icon size={20} className={selected ? 'text-foreground' : 'text-muted-foreground'} />
              <div>
                <p className="text-sm font-semibold text-foreground">{ind.label}</p>
                <p className="mt-0.5 text-[11px] leading-tight text-muted-foreground">{ind.desc}</p>
              </div>
            </motion.button>
          )
        })}
      </div>

      <StepFooter
        onBack={() => setStep(2)}
        onContinue={() => setStep(4)}
        continueDisabled={!data.industry}
        showAi={false}
      />
    </div>
  )
}
