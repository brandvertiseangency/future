'use client'

import { GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface GoalOption {
  id: string
  label: string
  description: string
}

export function GoalPriorityPicker({
  options,
  selected,
  onToggle,
}: {
  options: GoalOption[]
  selected: string[]
  onToggle: (id: string) => void
}) {
  return (
    <div className="space-y-2">
      {options.map((goal) => {
        const active = selected.includes(goal.id)
        return (
          <button
            key={goal.id}
            onClick={() => onToggle(goal.id)}
            className={cn(
              'w-full rounded-xl border p-3 text-left transition-all',
              active ? 'border-[#111111] bg-[#F3F4F6]' : 'border-[#E5E7EB] bg-white'
            )}
          >
            <div className="flex items-start gap-2">
              <GripVertical size={14} className="mt-0.5 text-[#9CA3AF]" />
              <div>
                <p className="text-sm font-medium text-[#111111]">{goal.label}</p>
                <p className="text-xs text-[#6B7280]">{goal.description}</p>
              </div>
            </div>
          </button>
        )
      })}
      <p className="text-xs text-[#6B7280]">Pick up to 2 priorities. This directly changes strategy prompts.</p>
    </div>
  )
}
