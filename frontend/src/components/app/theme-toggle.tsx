'use client'

import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return <div className="w-8 h-8" />

  const isDark = theme === 'dark'

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="relative w-8 h-8 rounded-lg flex items-center justify-center
                 bg-[var(--bg-subtle)] border border-[var(--border-base)]
                 hover:border-[var(--border-loud)] transition-all duration-150"
      aria-label="Toggle theme"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={theme}
          initial={{ opacity: 0, rotate: -30, scale: 0.8 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 30, scale: 0.8 }}
          transition={{ duration: 0.15 }}
        >
          {isDark
            ? <Sun size={15} className="text-[var(--text-2)]" />
            : <Moon size={15} className="text-[var(--text-2)]" />
          }
        </motion.div>
      </AnimatePresence>
    </button>
  )
}
