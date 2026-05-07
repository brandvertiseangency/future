'use client'

import * as React from 'react'
import { PanelLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

type SidebarContextValue = {
  open: boolean
  setOpen: (open: boolean) => void
  toggleSidebar: () => void
  state: 'expanded' | 'collapsed'
}

const SidebarContext = React.createContext<SidebarContextValue | null>(null)

export function useSidebar() {
  const ctx = React.useContext(SidebarContext)
  if (!ctx) throw new Error('useSidebar must be used within SidebarProvider')
  return ctx
}

export function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange,
  children,
}: {
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}) {
  const [openState, setOpenState] = React.useState(defaultOpen)
  const open = openProp ?? openState
  const setOpen = React.useCallback(
    (next: boolean) => {
      onOpenChange?.(next)
      if (openProp === undefined) setOpenState(next)
    },
    [onOpenChange, openProp],
  )
  const toggleSidebar = React.useCallback(() => setOpen(!open), [open, setOpen])
  const value = React.useMemo(
    () => ({ open, setOpen, toggleSidebar, state: open ? ('expanded' as const) : ('collapsed' as const) }),
    [open, setOpen, toggleSidebar],
  )

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
}

export function Sidebar({ className, ...props }: React.ComponentProps<'aside'>) {
  const { state } = useSidebar()
  return (
    <aside
      data-slot="sidebar"
      data-state={state}
      className={cn(
        'group/sidebar fixed left-0 top-0 z-40 hidden h-screen flex-col border-r border-border/80 bg-card transition-[width] duration-200 md:flex',
        state === 'expanded' ? 'w-[260px]' : 'w-[74px]',
        className,
      )}
      {...props}
    />
  )
}

export function SidebarHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="sidebar-header" className={cn('shrink-0', className)} {...props} />
}

export function SidebarContent({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="sidebar-content" className={cn('min-h-0 flex-1 overflow-y-auto', className)} {...props} />
}

export function SidebarFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="sidebar-footer" className={cn('shrink-0', className)} {...props} />
}

export function SidebarGroup({ className, ...props }: React.ComponentProps<'section'>) {
  return <section data-slot="sidebar-group" className={cn('relative py-0.5', className)} {...props} />
}

export function SidebarGroupLabel({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      data-slot="sidebar-group-label"
      className={cn(
        'mb-1 pl-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground transition-opacity group-data-[state=collapsed]/sidebar:opacity-0',
        className,
      )}
      {...props}
    />
  )
}

export function SidebarGroupContent({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="sidebar-group-content" className={cn('space-y-0.5 pl-1', className)} {...props} />
}

export function SidebarMenu({ className, ...props }: React.ComponentProps<'nav'>) {
  return <nav data-slot="sidebar-menu" className={cn('space-y-0.5', className)} {...props} />
}

export function SidebarMenuItem({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="sidebar-menu-item" className={cn(className)} {...props} />
}

export function SidebarInset({ className, ...props }: React.ComponentProps<'div'>) {
  const { state } = useSidebar()
  return (
    <div
      data-slot="sidebar-inset"
      className={cn('transition-[margin-left] duration-200 md:min-h-screen', state === 'expanded' ? 'md:ml-[260px]' : 'md:ml-[74px]', className)}
      {...props}
    />
  )
}

export function SidebarTrigger({ className, ...props }: React.ComponentProps<typeof Button>) {
  const { toggleSidebar, state } = useSidebar()
  return (
    <Button
      variant="secondary"
      size="icon-sm"
      onClick={toggleSidebar}
      title={state === 'expanded' ? 'Collapse sidebar' : 'Expand sidebar'}
      className={cn('h-8 w-8 rounded-lg', className)}
      {...props}
    >
      <PanelLeft className="h-4 w-4 rtl:rotate-180" />
      <span className="sr-only">Toggle sidebar</span>
    </Button>
  )
}

export function SidebarRail({ className, ...props }: React.ComponentProps<'button'>) {
  const { toggleSidebar } = useSidebar()
  return (
    <button
      type="button"
      aria-label="Toggle sidebar"
      onClick={toggleSidebar}
      data-slot="sidebar-rail"
      className={cn(
        'absolute inset-y-0 -right-2 hidden w-2 cursor-col-resize rounded-full bg-transparent transition hover:bg-border/70 md:block',
        className,
      )}
      {...props}
    />
  )
}
