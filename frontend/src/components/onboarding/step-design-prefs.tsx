'use client'

import { motion } from 'framer-motion'
import { IconCheck } from '@tabler/icons-react'
import { useOnboardingStore } from '@/stores/onboarding'
import { cn } from '@/lib/utils'

const STYLES = [
  {
    id: 'minimal',
    label: 'Minimal',
    desc: 'Clean, white space, typography-led',
    gradient: 'from-white/5 to-white/[0.02]',
  },
  {
    id: 'luxury',
    label: 'Luxury',
    desc: 'Dark, gold, editorial',
    gradient: 'from-amber-500/10 to-amber-900/5',
  },
  {
    id: 'bold',
    label: 'Bold',
    desc: 'High contrast, vivid colors',
    gradient: 'from-rose-500/10 to-orange-500/5',
  },
  {
    id: 'playful',
    label: 'Playful',
    desc: 'Colorful, fun, dynamic',
    gradient: 'from-emerald-500/10 to-blue-500/5',
  },
]

const COLORS = [
  { id: 'black', hex: '#000000', label: 'Black' },
  { id: 'white', hex: '#FFFFFF', label: 'White' },
  { id: 'violet', hex: '#8B5CF6', label: 'Violet' },
  { id: 'blue', hex: '#3B82F6', label: 'Blue' },
  { id: 'emerald', hex: '#10B981', label: 'Emerald' },
  { id: 'amber', hex: '#F59E0B', label: 'Amber' },
  { id: 'rose', hex: '#F43F5E', label: 'Rose' },
  { id: 'orange', hex: '#F97316', label: 'Orange' },
  { id: 'teal', hex: '#14B8A6', label: 'Teal' },
  { id: 'gray', hex: '#6B7280', label: 'Gray' },
  { id: 'gold', hex: '#D4AF37', label: 'Gold' },
  { id: 'custom', hex: null, label: 'Custom' },
]

export function StepDesignPrefs() {
  const { data, updateData } = useOnboardingStore()

  const toggleColor = (id: string) => {
    if (data.colors.includes(id)) {
      updateData({ colors: data.colors.filter((c) => c !== id) })
    } else if (data.colors.length < 3) {
      updateData({ colors: [...data.colors, id] })
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <span className="section-tag">Design Preferences</span>
        <h2 className="text-white font-semibold text-3xl tracking-tight">
          What&apos;s your visual style?
        </h2>
        <p className="text-white/50 text-sm mt-2">Choose the aesthetic that best represents your brand.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {STYLES.map((style) => {
          const selected = data.visualStyle === style.id
          return (
            <motion.button
              key={style.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              onClick={() => updateData({ visualStyle: style.id })}
              className={cn(
                'relative text-left rounded-xl border overflow-hidden transition-all duration-200',
                selected
                  ? 'border-violet-500/50'
                  : 'border-white/[0.08] hover:border-white/20'
              )}
            >
              {selected && (
                <span className="absolute top-3 right-3 z-10 w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center">
                  <IconCheck size={11} className="text-white" />
                </span>
              )}
              <div className={cn('h-[120px] bg-gradient-to-br', style.gradient)} />
              <div className="p-3 bg-white/[0.02]">
                <p className="text-white font-medium text-sm">{style.label}</p>
                <p className="text-white/40 text-xs mt-0.5">{style.desc}</p>
              </div>
            </motion.button>
          )
        })}
      </div>

      <div>
        <p className="text-white/60 text-sm font-medium mb-3">
          Pick your dominant colors{' '}
          <span className="text-white/30">(up to 3)</span>
        </p>
        <div className="flex flex-wrap gap-3">
          {COLORS.map((color) => {
            const selected = data.colors.includes(color.id)
            return (
              <button
                key={color.id}
                onClick={() => toggleColor(color.id)}
                title={color.label}
                className={cn(
                  'relative w-9 h-9 rounded-full border-2 transition-all duration-200 flex items-center justify-center',
                  selected ? 'border-white scale-110' : 'border-white/20 hover:border-white/40',
                  color.id === 'custom' && 'bg-gradient-to-br from-violet-500 via-rose-500 to-amber-500'
                )}
                style={color.hex ? { backgroundColor: color.hex } : undefined}
              >
                {selected && (
                  <IconCheck
                    size={12}
                    className={cn(
                      'text-white',
                      color.id === 'white' && 'text-black'
                    )}
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
