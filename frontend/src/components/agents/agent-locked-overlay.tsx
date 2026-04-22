'use client'

import { Lock, Zap } from 'lucide-react'
import { motion } from 'framer-motion'

interface AgentLockedOverlayProps {
  agentName: string
  description: string
  onUnlock?: () => void
}

export function AgentLockedOverlay({ agentName, description, onUnlock }: AgentLockedOverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 z-20 flex flex-col items-center justify-center
                 bg-[var(--bg-canvas)]/80 backdrop-blur-md rounded-2xl"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center gap-5 max-w-sm text-center px-6"
      >
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
          <Lock size={28} className="text-[var(--text-3)]" />
        </div>
        <div>
          <h3 className="text-[18px] font-semibold text-[var(--text-1)] mb-2">
            {agentName} is Locked
          </h3>
          <p className="text-[13.5px] text-[var(--text-3)] leading-relaxed">
            {description}
          </p>
        </div>
        <button
          onClick={onUnlock}
          className="flex items-center gap-2 px-6 py-3 rounded-xl
                     bg-gradient-to-r from-violet-600 to-violet-500
                     text-white text-[13.5px] font-semibold
                     hover:from-violet-500 hover:to-violet-400
                     transition-all duration-200 shadow-lg shadow-violet-500/25
                     active:scale-95"
        >
          <Zap size={15} />
          Unlock Agent
        </button>
        <p className="text-[11px] text-[var(--text-4)]">
          Upgrade to Pro or Business to access all agents
        </p>
      </motion.div>
    </motion.div>
  )
}
