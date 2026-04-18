'use client'

import { Loader2 } from 'lucide-react'
import { HoverBorderGradient } from '@/components/ui/hover-border-gradient'
import { cn } from '@/lib/utils'

interface AIButtonProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
  loading?: boolean
  disabled?: boolean
  type?: 'button' | 'submit'
}

export function AIButton({ children, onClick, className, loading, disabled, type = 'button' }: AIButtonProps) {
  return (
    <HoverBorderGradient
      containerClassName={cn('rounded-lg', disabled && 'opacity-50 pointer-events-none')}
      as="button"
      type={type}
      className={cn(
        'bg-black text-white flex items-center gap-2 px-5 py-2.5 text-sm font-medium',
        className
      )}
      onClick={disabled ? undefined : onClick}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
      {children}
    </HoverBorderGradient>
  )
}
