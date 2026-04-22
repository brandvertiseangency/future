'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Sparkles } from 'lucide-react'
import { useOnboardingStore } from '@/stores/onboarding'
import { Spotlight } from '@/components/ui/spotlight'
import { FlipWords } from '@/components/ui/flip-words'

const PLATFORM_WORDS = ['Instagram', 'LinkedIn', 'TikTok', 'X', 'Pinterest', 'Threads']

export function StepWelcome() {
  const { setStep } = useOnboardingStore()

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center relative">
      <Spotlight className="top-0 left-1/4" fill="rgba(0,212,255,0.08)" />

      <div className="relative z-10 space-y-6 max-w-lg">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <span className="text-[15px] font-semibold tracking-tight text-white/80">
            <Image
              src="/Brandvertise-Light-Logo.webp"
              alt="Brandvertise"
              width={130}
              height={30}
              className="object-contain mx-auto"
              priority
            />
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="text-[42px] font-semibold text-white leading-[1.1] tracking-tight">
            Your brand.
            <br />
            <span className="inline-flex items-baseline gap-2">
              Every<FlipWords words={PLATFORM_WORDS} className="text-[var(--ai-color)]" />.
            </span>
            <br />
            On autopilot.
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-white/40 text-base leading-relaxed"
        >
          Set up your brand once. AI does the rest.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="pt-2"
        >
          <button
            onClick={() => setStep(2)}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[var(--ai-color)] hover:opacity-90 text-white font-semibold text-base transition-all shadow-[0_0_40px_rgba(0,212,255,0.25)]"
          >
            <Sparkles size={16} />
            Build your brand →
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
        >
          <Link href="/auth" className="text-white/25 hover:text-white/50 text-sm transition-colors">
            Already have an account? Sign in →
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
