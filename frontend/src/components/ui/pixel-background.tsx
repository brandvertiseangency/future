'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface PixelBackgroundProps {
  children?: React.ReactNode
  className?: string
  gap?: number
  speed?: number
  colors?: string[]
  fadeOpacity?: number
  pattern?: 'cursor' | 'pulse' | 'rain'
}

interface Pixel {
  x: number
  y: number
  opacity: number
  targetOpacity: number
  size: number
  color: string
  life: number
}

export function PixelBackground({
  children,
  className,
  gap = 14,
  speed = 0.04,
  colors = ['#1a1a1a', '#222222', '#2a2a2a', '#141414'],
  fadeOpacity = 0.06,
  pattern = 'cursor',
}: PixelBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const pixelsRef = useRef<Pixel[]>([])
  const mouseRef = useRef({ x: -999, y: -999 })
  const frameRef = useRef<number>(0)
  const tickRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const palette = colors
    const pickColor = () => palette[Math.floor(Math.random() * palette.length)] ?? '#1a1a1a'

    const initPixels = (w: number, h: number) => {
      const pixels: Pixel[] = []
      const rows = Math.ceil(h / gap)
      const cols = Math.ceil(w / gap)
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          pixels.push({
            x: c * gap + gap / 2,
            y: r * gap + gap / 2,
            opacity: 0,
            targetOpacity: 0,
            size: Math.random() * 1.5 + 0.5,
            color: pickColor(),
            life: 0,
          })
        }
      }
      pixelsRef.current = pixels
    }

    const resize = () => {
      const { width, height } = container.getBoundingClientRect()
      canvas.width = width
      canvas.height = height
      initPixels(width, height)
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(container)

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect()
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }
    container.addEventListener('mousemove', onMouseMove)

    const draw = () => {
      frameRef.current = requestAnimationFrame(draw)
      tickRef.current++

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const mx = mouseRef.current.x
      const my = mouseRef.current.y

      for (const p of pixelsRef.current) {
        if (pattern === 'cursor') {
          const dist = Math.hypot(p.x - mx, p.y - my)
          const radius = 120
          if (dist < radius) {
            p.targetOpacity = (1 - dist / radius) * 0.85
            if (Math.random() < 0.05) p.color = pickColor()
          } else {
            p.targetOpacity = 0
          }
        } else if (pattern === 'rain') {
          if (Math.random() < 0.0008) {
            p.targetOpacity = Math.random() * 0.7 + 0.1
            p.life = 60
          }
          if (p.life > 0) {
            p.life--
            if (p.life === 0) p.targetOpacity = 0
          }
        } else if (pattern === 'pulse') {
          const dist = Math.hypot(p.x - canvas.width / 2, p.y - canvas.height / 2)
          const wave = (Math.sin(dist * 0.03 - tickRef.current * 0.04) + 1) / 2
          p.targetOpacity = wave * fadeOpacity * 3
        }

        p.opacity += (p.targetOpacity - p.opacity) * speed * 0.8

        if (p.opacity > 0.01) {
          ctx.beginPath()
          ctx.rect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size)
          ctx.fillStyle = p.color
          ctx.globalAlpha = p.opacity
          ctx.fill()
          ctx.globalAlpha = 1
        }
      }
    }

    draw()

    return () => {
      cancelAnimationFrame(frameRef.current)
      ro.disconnect()
      container.removeEventListener('mousemove', onMouseMove)
    }
  }, [gap, speed, colors, fadeOpacity, pattern])

  return (
    <div ref={containerRef} className={cn('relative overflow-hidden', className)}>
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0"
        style={{ zIndex: 0 }}
      />
      <div className="relative z-10 h-full w-full">{children}</div>
    </div>
  )
}
