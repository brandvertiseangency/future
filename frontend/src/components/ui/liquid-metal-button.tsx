'use client'

import type React from 'react'
import { useEffect, useRef, useState } from 'react'
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

  // Inject styles once
  useEffect(() => {
    const id = 'lmb-styles'
    if (document.getElementById(id)) return
    const s = document.createElement('style')
    s.id = id
    s.textContent = `
      @keyframes lmb-spin {
        from { transform: rotate(0deg); }
        to   { transform: rotate(360deg); }
      }
      @keyframes lmb-ripple {
        0%   { transform: translate(-50%,-50%) scale(0); opacity: 0.5; }
        100% { transform: translate(-50%,-50%) scale(5); opacity: 0; }
      }
      .lmb-spinner {
        position: absolute;
        inset: -200%;
        width: 500%;
        height: 500%;
        animation: lmb-spin 3s linear infinite;
        background: conic-gradient(
          from 90deg at 50% 50%,
          transparent    0%,
          rgba(255,255,255,0.08)  20%,
          rgba(255,255,255,0.9)   45%,
          #fff           50%,
          rgba(255,255,255,0.9)   55%,
          rgba(255,255,255,0.08)  80%,
          transparent    100%
        );
      }
    `
    document.head.appendChild(s)
  }, [])

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (buttonRef.current) {
      const r = buttonRef.current.getBoundingClientRect()
      const rpl = { x: e.clientX - r.left, y: e.clientY - r.top, id: rippleId.current++ }
      setRipples(p => [...p, rpl])
      setTimeout(() => setRipples(p => p.filter(x => x.id !== rpl.id)), 700)
    }
    onClick?.(e)
  }

  const content = children ?? (viewMode === 'icon'
    ? <Sparkles size={16} className="text-white/70" />
    : <span style={{ fontSize: 14, fontWeight: 600, color: '#ccc', letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>{label}</span>)

  const sizeStyle: React.CSSProperties = fullWidth
    ? { width: '100%', height: 46 }
    : { minHeight: 46, minWidth: viewMode === 'icon' ? 46 : 46, width: 'fit-content' }

  return (
    <div
      className={cn('align-middle', className)}
      style={{
        ...sizeStyle,
        position: 'relative',
        borderRadius: 100,
        padding: 1,
        overflow: 'hidden',
        display: fullWidth ? 'block' : 'inline-block',
        flexShrink: 0,
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {/* Spinning conic gradient border */}
      <div className="lmb-spinner" />

      {/* Inner dark pill */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: 46,
        borderRadius: 100,
        background: 'linear-gradient(180deg, #1c1c1c 0%, #0a0a0a 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        paddingInline: fullWidth ? 0 : 20,
        color: '#f5f5f5',
        zIndex: 1,
        overflow: 'hidden',
      }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: '#f5f5f5', fontWeight: 600, fontSize: 14, lineHeight: 1, whiteSpace: 'nowrap' }}>
          {content}
        </span>

        {/* Clickable surface with ripple */}
        <button
          ref={buttonRef}
          type={type}
          onClick={handleClick}
          disabled={disabled}
          style={{
            position: 'absolute', inset: 0,
            background: 'transparent', border: 'none',
            cursor: disabled ? 'not-allowed' : 'pointer', borderRadius: 100, overflow: 'hidden',
          }}
          aria-label={typeof label === 'string' ? label : undefined}
        >
          {ripples.map(r => (
            <span key={r.id} style={{
              position: 'absolute', left: r.x, top: r.y,
              width: 16, height: 16, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.35) 0%, transparent 70%)',
              pointerEvents: 'none',
              animation: 'lmb-ripple 0.7s ease-out',
            }} />
          ))}
        </button>
      </div>
    </div>
  )
}
