'use client'

import { useState } from 'react'
import useSWR from 'swr'
import {
  Gift,
  Copy,
  Check,
  Share2,
  Users,
  Sparkles,
  CreditCard,
  Star,
  Mail,
} from 'lucide-react'

function XIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-label="X / Twitter">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.259 5.631zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}
import { toast } from 'sonner'
import { useAuth } from '@/lib/auth-context'
import { apiCall } from '@/lib/api'
import { PageContainer } from '@/components/ui/page-primitives'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Share your link',
    description: 'Copy your unique referral link and share it with friends, clients, or followers.',
    icon: <Share2 size={18} />,
  },
  {
    step: '02',
    title: 'They sign up & upgrade',
    description: 'When someone uses your link and upgrades to a paid plan, you both benefit.',
    icon: <Users size={18} />,
  },
  {
    step: '03',
    title: 'Earn 100 credits',
    description: 'You receive 100 credits automatically added to your account — no waiting.',
    icon: <CreditCard size={18} />,
  },
]

const SHARE_TEMPLATES = [
  {
    label: 'Copy message',
    icon: <Copy size={13} />,
    getText: (link: string) =>
      `Hey! I've been using Brandvertise to create and schedule social media content with AI. Give it a try — here's my referral link: ${link}`,
  },
  {
    label: 'Tweet it',
    icon: <XIcon size={13} />,
    getText: (link: string) =>
      `I've been using @brandvertise to create stunning social content with AI. Check it out 👇\n${link}`,
  },
  {
    label: 'Email template',
    icon: <Mail size={13} />,
    getText: (link: string) =>
      `Subject: You need to try Brandvertise!\n\nHi,\n\nI've been using Brandvertise to create and schedule social media content with AI — it's been a game changer. Check it out:\n\n${link}\n\nBest,`,
  },
]

export default function ReferPage() {
  const { user } = useAuth()
  const [copied, setCopied] = useState(false)
  const [copiedTemplate, setCopiedTemplate] = useState<number | null>(null)

  const { data: creditsData } = useSWR('/api/credits/balance', (url: string) => apiCall<{ balance: number; plan: string }>(url), { revalidateOnFocus: false })
  const credits = creditsData?.balance ?? 0

  // Generate a deterministic referral link from user email
  const referralCode = user?.email
    ? btoa(user.email).replace(/[^a-z0-9]/gi, '').slice(0, 12).toLowerCase()
    : 'your-code'
  const referralLink = `https://brandvertise.ai?ref=${referralCode}`

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink)
      setCopied(true)
      toast.success('Referral link copied!')
      setTimeout(() => setCopied(false), 2500)
    } catch {
      toast.error('Could not copy — please copy manually')
    }
  }

  const copyTemplate = async (idx: number, text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedTemplate(idx)
      toast.success('Message copied!')
      setTimeout(() => setCopiedTemplate(null), 2500)
    } catch {
      toast.error('Could not copy')
    }
  }

  return (
    <PageContainer className="max-w-3xl space-y-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5 p-8 text-center">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(74,125,255,0.12),transparent)]" />
        <div className="relative">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/20 text-primary">
            <Gift size={28} />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Refer & Earn</h1>
          <p className="mx-auto mt-3 max-w-md text-base text-muted-foreground">
            Share Brandvertise with your network and earn <span className="font-bold text-foreground">100 credits</span> for every friend who upgrades to a paid plan.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary/15 px-4 py-2 text-sm font-semibold text-primary">
            <CreditCard size={14} /> Your balance: {credits.toLocaleString()} credits
          </div>
        </div>
      </div>

      {/* Referral link */}
      <div className="app-card-elevated p-6 space-y-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Your Referral Link</p>
          <p className="mt-1 text-sm text-muted-foreground">Share this unique link — you earn 100 credits for every paid sign-up.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1 truncate rounded-xl border border-border bg-muted/30 px-4 py-3 font-mono text-sm text-foreground">
            {referralLink}
          </div>
          <Button onClick={copyLink} className="shrink-0 gap-2">
            {copied ? <Check size={15} /> : <Copy size={15} />}
            {copied ? 'Copied!' : 'Copy'}
          </Button>
        </div>
      </div>

      {/* How it works */}
      <div className="app-card-elevated p-6 space-y-5">
        <p className="text-base font-semibold text-foreground">How it works</p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {HOW_IT_WORKS.map(({ step, title, description, icon }) => (
            <div key={step} className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  {icon}
                </span>
                <span className="text-[11px] font-bold tabular-nums text-primary">{step}</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{title}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Share templates */}
      <div className="app-card-elevated p-6 space-y-4">
        <div>
          <p className="text-base font-semibold text-foreground">Ready-to-share messages</p>
          <p className="mt-1 text-sm text-muted-foreground">Use these templates to share with your network.</p>
        </div>
        <div className="space-y-3">
          {SHARE_TEMPLATES.map(({ label, icon, getText }, idx) => {
            const text = getText(referralLink)
            return (
              <div key={label} className="rounded-xl border border-border bg-card/60 p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm leading-relaxed text-muted-foreground line-clamp-3">{text}</p>
                  <button
                    type="button"
                    onClick={() => void copyTemplate(idx, text)}
                    className={cn(
                      'flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors',
                      copiedTemplate === idx ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500' : 'border-border text-muted-foreground hover:bg-muted',
                    )}
                  >
                    {copiedTemplate === idx ? <Check size={12} /> : icon}
                    {copiedTemplate === idx ? 'Copied' : label}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Rewards card */}
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Star size={18} className="text-primary" />
          <p className="text-base font-semibold text-foreground">Rewards</p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[
            { title: '100 credits per referral', desc: 'Credited instantly when your friend upgrades' },
            { title: 'No limit', desc: 'Refer as many people as you like' },
            { title: 'Your friend gets a bonus', desc: 'New users from your link get 50 extra credits' },
            { title: 'Coming: cash rewards', desc: 'Affiliate payouts launching for Agency plan users' },
          ].map(({ title, desc }) => (
            <div key={title} className="flex items-start gap-2">
              <Sparkles size={14} className="mt-0.5 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-semibold text-foreground">{title}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageContainer>
  )
}
