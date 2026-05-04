'use client'

import type React from 'react'
import { useRef, useState } from 'react'
import { Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LiquidMetalButtonProps {
  children?: React.ReactNode
  label?: string
  viewMode?: 'text' | 'icon'
  fullWidth?: boolean
  className?: string
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  onClick?: React.MouseEventHandler<HTMLButtonElement>
}

/**
 * Primary CTA — Behance-style blue gradient (tokens in globals.css).
 */
export function LiquidMetalButton({
  children,
  label = 'Get Started',
  onClick,
  viewMode = 'text',
  fullWidth = false,
  className,
  disabled = false,
  type = 'button',
}: LiquidMetalButtonProps) {
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([])
  const buttonRef = useRef<HTMLButtonElement>(null)
  const rippleId = useRef(0)

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (buttonRef.current) {
      const r = buttonRef.current.getBoundingClientRect()
      const rpl = { x: e.clientX - r.left, y: e.clientY - r.top, id: rippleId.current++ }
      setRipples((p) => [...p, rpl])
      setTimeout(() => setRipples((p) => p.filter((x) => x.id !== rpl.id)), 600)
    }
    onClick?.(e)
  }

  const content =
    children ??
    (viewMode === 'icon' ? (
      <Sparkles size={16} className="text-white" />
    ) : (
      <span className="text-sm font-semibold tracking-tight text-white">{label}</span>
    ))

  return (
    <button
      ref={buttonRef}
      type={type}
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        'relative overflow-hidden rounded-xl px-5 py-2.5 font-medium text-white shadow-md transition-transform duration-200',
        'hover:brightness-105 hover:shadow-lg active:scale-[0.99]',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]',
        'disabled:pointer-events-none disabled:opacity-50',
        fullWidth ? 'w-full' : 'inline-flex min-h-11 min-w-[120px] items-center justify-center',
        className
      )}
      style={{
        backgroundImage: 'var(--gradient-cta)',
        backgroundColor: 'var(--brand-blue)',
      }}
      aria-label={typeof label === 'string' ? label : undefined}
    >
      <span className="relative z-[1] inline-flex items-center justify-center gap-2">{content}</span>
      {ripples.map((r) => (
        <span
          key={r.id}
          className="pointer-events-none absolute animate-[bv-ripple_0.55s_ease-out_forwards] rounded-full bg-white/30"
          style={{
            left: r.x,
            top: r.y,
            width: 12,
            height: 12,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}
    </button>
  )
}
