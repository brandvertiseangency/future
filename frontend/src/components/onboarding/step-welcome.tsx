'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useOnboardingStore } from '@/stores/onboarding'

export function StepWelcome() {
  const { setStep } = useOnboardingStore()

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center relative">
      {/* Radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(139,92,246,0.18) 0%, transparent 70%)',
        }}
      />
      <div className="relative z-10 space-y-6 max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="text-[44px] font-bold text-white leading-[1.1] tracking-tight">
            Your brand. Every platform.{' '}
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-blue-400 bg-clip-text text-transparent">
              On autopilot.
            </span>
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-white/50 text-lg leading-relaxed"
        >
          Set up your brand in 3 minutes and watch AI write your first post.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="pt-2"
        >
          <button
            onClick={() => setStep(2)}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-base transition-colors shadow-[0_0_40px_rgba(139,92,246,0.35)]"
          >
            Let&apos;s build your brand →
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <Link href="/auth" className="text-white/30 hover:text-white/60 text-sm transition-colors">
            Already have an account? Sign in
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
