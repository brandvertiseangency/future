'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { siFacebook, siInstagram, siTiktok, siX, siYoutube } from 'simple-icons'
import { ArrowRight, Search } from 'lucide-react'
import { BrandSiIcon } from '@/components/ui/brand-si-icon'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
type ConnectorStatus = 'soon' | 'settings'

type Si = typeof siInstagram

const CONNECTORS: {
  id: string
  name: string
  blurb: string
  icon?: Si
  status: ConnectorStatus
  settingsHref: string
}[] = [
  {
    id: 'instagram',
    name: 'Instagram',
    blurb: 'Plan and publish feed, stories, and reels.',
    icon: siInstagram,
    status: 'soon',
    settingsHref: '/settings#notifications',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    blurb: 'Company updates and thought leadership.',
    status: 'soon',
    settingsHref: '/settings#notifications',
  },
  {
    id: 'facebook',
    name: 'Facebook',
    blurb: 'Page posts and ad-ready creative.',
    icon: siFacebook,
    status: 'soon',
    settingsHref: '/settings#notifications',
  },
  {
    id: 'x',
    name: 'X',
    blurb: 'Short-form updates and threads.',
    icon: siX,
    status: 'soon',
    settingsHref: '/settings#notifications',
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    blurb: 'Hooks-first vertical video.',
    icon: siTiktok,
    status: 'soon',
    settingsHref: '/settings#notifications',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    blurb: 'Long-form and shorts packaging.',
    icon: siYoutube,
    status: 'soon',
    settingsHref: '/settings#notifications',
  },
]

export function SocialPublishingConnectors() {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return CONNECTORS
    return CONNECTORS.filter((c) => c.name.toLowerCase().includes(s) || c.blurb.toLowerCase().includes(s))
  }, [q])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mx-auto mb-5 flex w-full max-w-lg items-center justify-between gap-3 rounded-full border border-white/55 bg-card/88 py-2.5 pl-3 pr-3 text-left shadow-[0_12px_40px_rgba(8,16,52,0.22)] backdrop-blur-md transition hover:bg-card/95 md:pl-4"
      >
        <span className="flex min-w-0 items-center gap-3">
          <span className="flex shrink-0 -space-x-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-border/60 bg-card ring-2 ring-card">
              <BrandSiIcon icon={siInstagram} size={16} monochrome className="text-foreground" />
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-border/60 bg-card ring-2 ring-card">
              <span className="text-[11px] font-semibold text-[#0A66C2]" aria-hidden>
                in
              </span>
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-border/60 bg-card ring-2 ring-card">
              <BrandSiIcon icon={siYoutube} size={16} monochrome className="text-foreground" />
            </span>
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-foreground">Connect publishing channels</span>
            <span className="block truncate text-xs text-muted-foreground">Link social accounts when you are ready</span>
          </span>
        </span>
        <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showCloseButton
          className="flex max-h-[min(90vh,720px)] max-w-lg flex-col gap-0 overflow-hidden p-0 sm:max-w-xl"
        >
          <DialogHeader className="border-b border-border/80 px-5 py-4 text-left">
            <DialogTitle>Publishing connectors</DialogTitle>
            <DialogDescription>
              Choose where Brandvertise should plan and ship content. OAuth connections ship next; for now, open
              settings for notifications and workspace defaults.
            </DialogDescription>
          </DialogHeader>
          <div className="border-b border-border/60 px-5 py-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search channels"
                className="h-10 w-full rounded-lg border border-border bg-muted/40 pl-9 pr-3 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Channels</p>
            <ul className="space-y-2">
              {filtered.map((c) => (
                <li
                  key={c.id}
                  className="flex items-center gap-3 rounded-xl border border-border/70 bg-card/90 px-3 py-3 backdrop-blur-sm"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-background/80">
                    {c.id === 'linkedin' ? (
                      <span className="text-sm font-semibold text-[#0A66C2]" aria-hidden>
                        in
                      </span>
                    ) : c.icon ? (
                      <BrandSiIcon icon={c.icon} size={22} />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.blurb}</p>
                  </div>
                  <Badge variant="secondary" className="shrink-0 capitalize">
                    {c.status === 'soon' ? 'Soon' : 'Settings'}
                  </Badge>
                  <Link
                    href={c.settingsHref}
                    onClick={() => setOpen(false)}
                    className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'shrink-0 no-underline')}
                  >
                    Open
                  </Link>
                </li>
              ))}
            </ul>
            {filtered.length === 0 ? <p className="py-6 text-center text-sm text-muted-foreground">No matches.</p> : null}
          </div>
          <div className="flex justify-end gap-2 border-t border-border/60 bg-muted/30 px-5 py-3">
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Close
            </Button>
            <Link
              href="/settings#notifications"
              onClick={() => setOpen(false)}
              className={cn(buttonVariants({ variant: 'secondary', size: 'sm' }), 'inline-flex no-underline')}
            >
              Workspace settings
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
