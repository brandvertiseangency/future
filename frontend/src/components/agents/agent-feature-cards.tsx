'use client'

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface Feature {
  icon: LucideIcon
  title: string
  description: string
}

interface AgentFeatureCardsProps {
  features: Feature[]
}

export function AgentFeatureCards({ features }: AgentFeatureCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {features.map((feat, i) => (
        <motion.div
          key={feat.title}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="p-5 rounded-2xl border border-[var(--border-dim)] bg-[var(--bg-card)]
                     hover:bg-white/3 hover:border-white/10 transition-all duration-200 group"
        >
          <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center mb-3
                          group-hover:bg-violet-500/10 group-hover:border-violet-500/20 transition-all duration-200">
            <feat.icon size={17} className="text-[var(--text-3)] group-hover:text-violet-400 transition-colors" />
          </div>
          <h3 className="text-[13.5px] font-semibold text-[var(--text-1)] mb-1">{feat.title}</h3>
          <p className="text-[12.5px] text-[var(--text-3)] leading-relaxed">{feat.description}</p>
        </motion.div>
      ))}
    </div>
  )
}
