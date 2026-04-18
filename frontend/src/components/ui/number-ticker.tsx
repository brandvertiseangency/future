'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface NumberTickerProps {
  value: number
  className?: string
  style?: React.CSSProperties
  duration?: number
  delay?: number
  decimalPlaces?: number
}

export function NumberTicker({
  value,
  className,
  style,
  duration = 1200,
  delay = 0,
  decimalPlaces = 0,
}: NumberTickerProps) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let start: number | null = null
    let raf: number

    const step = (ts: number) => {
      if (!start) start = ts + delay
      const elapsed = Math.max(0, ts - start)
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      el.textContent = (eased * value).toFixed(decimalPlaces)
      if (progress < 1) raf = requestAnimationFrame(step)
      else el.textContent = value.toFixed(decimalPlaces)
    }

    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [value, duration, delay, decimalPlaces])

  return <span ref={ref} className={cn('tabular-nums', className)} style={style}>0</span>
}
