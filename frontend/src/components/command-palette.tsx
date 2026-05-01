'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Command } from 'cmdk'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, CalendarDays, Sparkles, Images, Settings, Clock3, BriefcaseBusiness, Bot,
  LogOut, CreditCard, Bell, Search, User,
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

const NAVIGATE = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Brand Setup', icon: BriefcaseBusiness, href: '/brand' },
  { label: 'Content Calendar', icon: CalendarDays, href: '/calendar' },
  { label: 'Generate', icon: Sparkles, href: '/generate' },
  { label: 'Outputs', icon: Images, href: '/outputs' },
  { label: 'Scheduler', icon: Clock3, href: '/scheduler' },
  { label: 'Agents', icon: Bot, href: '/agents' },
  { label: 'Settings', icon: Settings, href: '/settings' },
]

const ACTIONS = [
  { label: 'Generate new post', icon: Sparkles, href: '/generate' },
  { label: 'Buy credits', icon: CreditCard, href: '/settings#billing' },
  { label: 'View notifications', icon: Bell, href: '/dashboard' },
  { label: 'Edit profile', icon: User, href: '/settings' },
]

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const { signOut } = useAuth()

  const toggle = useCallback(() => setOpen(o => !o), [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        toggle()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [toggle])

  const go = (href: string) => {
    setOpen(false)
    router.push(href)
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            onClick={() => setOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -20 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-[520px] z-[61]"
          >
            <Command
              className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-2xl"
              label="Command menu"
            >
              <div className="flex items-center gap-2 border-b border-[#E5E7EB] px-4">
                <Search size={15} className="text-[#6B7280]" />
                <Command.Input
                  placeholder="Type a command or search..."
                  className="flex-1 bg-transparent py-3.5 text-sm text-[#111111] placeholder:text-[#9CA3AF] outline-none"
                />
                <kbd className="hidden rounded border border-[#E5E7EB] bg-[#F3F4F6] px-1.5 py-0.5 text-[10px] text-[#6B7280] sm:inline-flex">ESC</kbd>
              </div>
              <Command.List className="max-h-[320px] overflow-y-auto p-2">
                <Command.Empty className="py-6 text-center text-sm text-[#6B7280]">No results found.</Command.Empty>
                <Command.Group heading="Navigate" className="px-2 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-[#6B7280]">
                  {NAVIGATE.map(item => (
                    <Command.Item key={item.href} value={item.label} onSelect={() => go(item.href)}
                      className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#6B7280] transition-colors data-[selected=true]:bg-[#F3F4F6] data-[selected=true]:text-[#111111]">
                      <item.icon size={15} className="flex-shrink-0" />
                      {item.label}
                    </Command.Item>
                  ))}
                </Command.Group>
                <Command.Separator className="my-1 h-px bg-[#E5E7EB]" />
                <Command.Group heading="Actions" className="px-2 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-[#6B7280]">
                  {ACTIONS.map(item => (
                    <Command.Item key={item.label} value={item.label} onSelect={() => go(item.href)}
                      className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#6B7280] transition-colors data-[selected=true]:bg-[#F3F4F6] data-[selected=true]:text-[#111111]">
                      <item.icon size={15} className="flex-shrink-0" />
                      {item.label}
                    </Command.Item>
                  ))}
                </Command.Group>
                <Command.Separator className="my-1 h-px bg-[#E5E7EB]" />
                <Command.Group heading="Account" className="px-2 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-[#6B7280]">
                  <Command.Item value="Sign out" onSelect={() => { setOpen(false); signOut() }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-rose-400 cursor-pointer data-[selected=true]:bg-rose-500/10 transition-colors">
                    <LogOut size={15} className="flex-shrink-0" />
                    Sign out
                  </Command.Item>
                </Command.Group>
              </Command.List>
            </Command>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
