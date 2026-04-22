'use client'

import { motion } from 'framer-motion'
import { Lock, LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AgentHeroProps {
  icon: LucideIcon
  iconColor?: string
  badge?: string
  title: string
  description: string
  isLocked?: boolean
}

export function AgentHero({ icon: Icon, iconColor = 'violet', badge, title, description, isLocked }: AgentHeroProps) {
  const colorMap: Record<string, string> = {
    violet: 'from-violet-600/20 to-violet-500/5 border-violet-500/20 text-violet-400',
    cyan: 'from-cyan-600/20 to-cyan-500/5 border-cyan-500/20 text-cyan-400',
    amber: 'from-amber-600/20 to-amber-500/5 border-amber-500/20 text-amber-400',
  }
  const colors = colorMap[iconColor] || colorMap.violet

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[var(--border-dim)] bg-[var(--bg-card)] p-8 mb-6">
      {/* Background glow */}
      <div className={cn(
        "absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl opacity-30",
        iconColor === 'violet' ? 'bg-violet-600' : iconColor === 'cyan' ? 'bg-cyan-600' : 'bg-amber-600'
      )} />

      <div className="relative flex flex-col md:flex-row md:items-center gap-6">
        {/* Icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className={cn(
            'w-16 h-16 rounded-2xl bg-gradient-to-br border flex items-center justify-center flex-shrink-0',
            colors
          )}
        >
          <Icon size={28} />
        </motion.div>

        {/* Text */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {badge && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider
                               bg-white/5 text-[var(--text-4)] border border-white/10">
                {badge}
              </span>
            )}
            {isLocked && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold
                               bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Lock size={10} />
                Locked
              </span>
            )}
          </div>
          <h1 className="text-[24px] font-bold text-[var(--text-1)] mb-2">{title}</h1>
          <p className="text-[14px] text-[var(--text-3)] leading-relaxed max-w-lg">{description}</p>
        </div>
      </div>
    </div>
  )
}
