'use client'

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface ShimmerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  shimmerColor?: string
  shimmerSize?: string
  className?: string
  children: React.ReactNode
  asChild?: boolean
}

export function ShimmerButton({
  shimmerColor = 'rgba(255,255,255,0.12)',
  className,
  children,
  ...props
}: ShimmerButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      {...(props as React.ComponentProps<typeof motion.button>)}
      className={cn(
        'relative inline-flex items-center justify-center overflow-hidden',
        'rounded-xl px-5 py-2.5',
        'bg-[var(--bg-overlay)] border border-[var(--border-base)]',
        'text-[var(--text-1)] text-sm font-medium',
        'shadow-[0_0_0_1px_rgba(139,92,246,0.06)]',
        'transition-all duration-200',
        'hover:border-violet-500/40 hover:shadow-[0_0_24px_rgba(139,92,246,0.18)]',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
        'group',
        className
      )}
    >
      {/* Shimmer sweep */}
      <span
        className="pointer-events-none absolute inset-0 -translate-x-full
                   bg-gradient-to-r from-transparent via-white/10 to-transparent
                   group-hover:translate-x-full transition-transform duration-700 ease-in-out"
      />
      {/* Violet glow orb */}
      <span className="pointer-events-none absolute inset-0 rounded-xl opacity-0
                       group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: 'radial-gradient(circle at 50% 0%,rgba(139,92,246,0.2),transparent 70%)' }} />
      <span className="relative flex items-center gap-1.5">{children}</span>
    </motion.button>
  )
}
