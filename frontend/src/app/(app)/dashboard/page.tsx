'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import useSWR from 'swr'
import {
  Users, ImageIcon, TrendingUp, Clock,
  Sparkles, CalendarDays, BarChart2, Wand2,
  Volume2, Palette, Target, AlertTriangle,
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { apiCall } from '@/lib/api'
import { NumberTicker } from '@/components/ui/number-ticker'
import { BlurFade } from '@/components/ui/blur-fade'
import { DotPattern } from '@/components/ui/dot-pattern'
import { AIButton } from '@/components/ui/ai-button'
import { cn } from '@/lib/utils'

// ── Types ──────────────────────────────────────────
interface Brand {
  name: string; industry: string; tone: number; styles: string[];
  audience_age_min: number; audience_age_max: number; audience_gender: string; goals: string[]
}
interface Post { id: string; platform: string; caption: string; image_url?: string; status: string; scheduled_at?: string; created_at: string }

// ── SWR Fetcher ─────────────────────────────────────
const fetcher = <T,>(url: string): Promise<T> => apiCall(url) as Promise<T>

const PLATFORM_COLORS: Record<string, string> = {
  instagram: '#f43f5e', linkedin: '#3b82f6', twitter: '#94a3b8',
  facebook: '#2563eb', tiktok: '#10b981', youtube: '#ef4444',
  pinterest: '#e11d48', threads: '#a1a1aa',
}

function useGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function calcTrialDays(trialStartedAt?: string): number {
  if (!trialStartedAt) return 14
  const start = new Date(trialStartedAt).getTime()
  const now = Date.now()
  const daysLeft = 14 - Math.floor((now - start) / 86400000)
  return Math.max(0, daysLeft)
}

export default function DashboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const greeting = useGreeting()

  // Prefetch key routes
  useEffect(() => {
    router.prefetch('/generate')
    router.prefetch('/calendar')
    router.prefetch('/assets')
  }, [router])

  // Real data
  const { data: brandData } = useSWR('/api/brands/current', fetcher<{ brand: Brand }>, { revalidateOnFocus: false })
  const { data: brandCountData } = useSWR('/api/brands/count', fetcher<{ count: number }>, { revalidateOnFocus: false, dedupingInterval: 60000 })
  const { data: postsStatsData } = useSWR('/api/posts/stats', fetcher<{ total: number }>, { dedupingInterval: 60000 })
  const { data: recentPostsData } = useSWR('/api/posts/recent?limit=6', fetcher<{ posts: Post[] }>, { dedupingInterval: 30000 })
  const { data: weekPostsData } = useSWR('/api/posts/scheduled?week=current', fetcher<{ posts: Post[] }>, { dedupingInterval: 30000 })
  const { data: creditsData } = useSWR('/api/credits/balance', fetcher<{ balance: number; plan: string }>, { revalidateOnFocus: false, dedupingInterval: 60000 })
  const { data: userData } = useSWR('/api/users/me', fetcher<{ user: { trial_started_at?: string; onboarding_complete?: boolean; display_name?: string } }>, { revalidateOnFocus: false })

  const brand = brandData?.brand
  const activeBrands = brandCountData?.count ?? 0
  const totalPosts = postsStatsData?.total ?? 0
  const recentPosts = recentPostsData?.posts ?? []
  const weekPosts = weekPostsData?.posts ?? []
  const credits = creditsData?.balance ?? 0
  const maxCredits = creditsData?.plan === 'pro' ? 2000 : creditsData?.plan === 'agency' ? 5000 : 500
  const trialDays = calcTrialDays(userData?.user?.trial_started_at)
  const displayName = user?.displayName || userData?.user?.display_name || 'Creator'
  const onboardingComplete = userData?.user?.onboarding_complete ?? true

  // Week strip
  const today = new Date()
  const todayDow = (today.getDay() + 6) % 7
  const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const weekDates = DAY_NAMES.map((name, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - todayDow + i)
    const dayPosts = weekPosts.filter((p) => {
      if (!p.scheduled_at) return false
      const pd = new Date(p.scheduled_at)
      return pd.getDate() === d.getDate() && pd.getMonth() === d.getMonth()
    })
    return { name, date: d.getDate(), isToday: i === todayDow, posts: dayPosts }
  })

  const todayPostCount = weekDates.find((d) => d.isToday)?.posts.length ?? 0

  const STATS = [
    {
      label: 'Active Brands', value: activeBrands, suffix: '',
      icon: Users, color: 'var(--stat-1)', bg: 'rgba(0,212,255,0.08)', border: 'rgba(0,212,255,0.15)',
      trendUp: true, trend: activeBrands > 0 ? 'Active' : 'No brands yet',
    },
    {
      label: 'Posts Generated', value: totalPosts, suffix: '',
      icon: ImageIcon, color: 'var(--stat-2)', bg: 'rgba(96,165,250,0.08)', border: 'rgba(96,165,250,0.15)',
      trendUp: true, trend: totalPosts > 0 ? 'Generated' : 'None yet',
    },
    {
      label: 'Avg Engagement', value: 0, suffix: '',
      icon: TrendingUp, color: 'var(--stat-3)', bg: 'rgba(52,211,153,0.08)', border: 'rgba(52,211,153,0.15)',
      trendUp: null, trend: '—',
      placeholder: '—', tooltip: 'Available after 30 days of data',
    },
    {
      label: 'Trial Days Left', value: trialDays, suffix: ' days',
      icon: Clock, color: 'var(--stat-4)', bg: 'rgba(251,146,60,0.08)', border: 'rgba(251,146,60,0.15)',
      trendUp: false, trend: trialDays <= 3 ? 'Expiring soon' : 'Remaining',
      urgent: trialDays <= 3,
    },
  ]

  const DNA_ROWS = brand ? [
    { label: 'Tone', value: brand.tone <= 25 ? 'Casual' : brand.tone <= 50 ? 'Conversational' : brand.tone <= 74 ? 'Balanced' : 'Professional', icon: Volume2 },
    { label: 'Style', value: (brand.styles || []).slice(0, 2).join(', ') || '—', icon: Palette },
    { label: 'Audience', value: `${brand.audience_age_min}–${brand.audience_age_max}, ${brand.audience_gender}`, icon: Users },
    { label: 'Goals', value: (brand.goals || []).map((g) => g.charAt(0).toUpperCase() + g.slice(1)).join(', ') || '—', icon: Target },
  ] : []

  return (
    <div className="p-7 space-y-5 max-w-[1400px]">

      {/* Onboarding incomplete banner */}
      {!onboardingComplete && (
        <BlurFade delay={0}>
          <div className="flex items-center justify-between px-5 py-3.5 rounded-xl bg-[var(--ai-glow)] border border-[var(--ai-border)]">
            <p className="text-sm text-[var(--ai-color)]">
              <Sparkles size={14} className="inline mr-1.5 -mt-0.5" />Finish setting up your brand for better AI results
            </p>
            <Link href="/onboarding" className="text-xs text-[var(--ai-color)] hover:text-white font-medium transition-colors">
              Complete setup
            </Link>
          </div>
        </BlurFade>
      )}

      {/* Welcome Banner */}
      <BlurFade delay={0}>
        <div className="relative overflow-hidden rounded-2xl border border-[var(--border-base)] bg-[var(--card-bg)] p-7">
          <div className="absolute -top-20 -left-10 w-72 h-72 rounded-full pointer-events-none"
               style={{ background: 'radial-gradient(circle,rgba(0,212,255,0.06) 0%,transparent 65%)' }} />
          <div className="absolute -bottom-16 right-20 w-56 h-56 rounded-full pointer-events-none"
               style={{ background: 'radial-gradient(circle,rgba(59,130,246,0.07) 0%,transparent 65%)' }} />
          <div className="relative flex items-start justify-between gap-6">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--text-3)] mb-2">Welcome back</p>
              <h2 className="text-[28px] font-bold text-[var(--text-1)] leading-tight">
                {greeting},{' '}
                <span className="font-semibold">
                  {displayName}
                </span>
              </h2>
              <p className="mt-1.5 text-[13.5px] text-[var(--text-2)] max-w-md">
                {brand ? `${brand.name} is ready to create content.` : "Let's build your brand and start creating."}
              </p>
              <div className="flex items-center gap-5 mt-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[12px] text-[var(--text-3)]">
                    {todayPostCount > 0 ? `${todayPostCount} post${todayPostCount !== 1 ? 's' : ''} scheduled today` : 'No posts scheduled today'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--credit-color)]" />
                  <span className="text-[12px] text-[var(--text-3)]">{credits} credits available</span>
                </div>
              </div>
            </div>
            <Link href="/generate" className="flex-shrink-0">
              <AIButton className="rounded-xl px-5 py-2.5 text-[13px] font-medium">
                <Sparkles size={14} className="mr-2 text-[var(--ai-color)]" />
                Generate Now
              </AIButton>
            </Link>
          </div>
        </div>
      </BlurFade>

      {/* Stats Strip */}
      <div className="grid grid-cols-4 gap-4">
        {STATS.map((stat, i) => {
          const Icon = stat.icon
          return (
            <BlurFade key={stat.label} delay={0.05 + i * 0.07}>
              <div
                className="relative rounded-2xl p-5 overflow-hidden cursor-default group"
                style={{ background: stat.bg, border: `1px solid ${stat.border}` }}
                title={stat.tooltip}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                       style={{ background: stat.bg, border: `1px solid ${stat.border}` }}>
                    <Icon size={16} style={{ color: stat.color }} />
                  </div>
                  {stat.urgent && (
                    <div className="w-2 h-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-500" />
                    </div>
                  )}
                </div>
                {stat.placeholder ? (
                  <div className="text-[32px] font-bold leading-none" style={{ color: stat.color }}>—</div>
                ) : (
                  <div className="flex items-baseline gap-0.5">
                    <NumberTicker value={stat.value} className="text-[32px] font-bold leading-none tabular-nums" style={{ color: stat.color }} delay={200 + i * 100} />
                    <span className="text-[16px] font-bold" style={{ color: stat.color }}>{stat.suffix}</span>
                  </div>
                )}
                <p className="mt-1.5 text-[12px] text-[var(--text-3)] font-medium uppercase tracking-wide">{stat.label}</p>
              </div>
            </BlurFade>
          )
        })}
      </div>

      {/* Main two-column grid */}
      <div className="grid grid-cols-[1fr_360px] gap-5">
        {/* LEFT */}
        <div className="space-y-5">
          {/* This Week Strip */}
          <BlurFade delay={0.25}>
            <div className="rounded-2xl border border-[var(--border-base)] bg-[var(--card-bg)] p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[13px] font-semibold text-[var(--text-1)]">This Week</h3>
                <Link href="/calendar" className="text-[12px] text-[var(--ai-color)] hover:text-[var(--ai-color)] transition-colors">Full Calendar →</Link>
              </div>
              <div className="grid grid-cols-7 gap-1.5">
                {weekDates.map((day) => (
                  <div key={day.name}
                    className={cn('flex flex-col items-center gap-1.5 p-2 rounded-xl cursor-pointer transition-all duration-150',
                      day.isToday ? 'bg-[var(--ai-glow)] border border-[var(--ai-border)]' : 'hover:bg-[var(--bg-subtle)]'
                    )}>
                    <span className={cn('text-[10px] font-medium uppercase tracking-wide', day.isToday ? 'text-[var(--ai-color)]' : 'text-[var(--text-3)]')}>{day.name}</span>
                    <span className={cn('text-[15px] font-semibold', day.isToday ? 'text-[var(--ai-color)]' : 'text-[var(--text-1)]')}>{day.date}</span>
                    <div className="flex gap-0.5 flex-wrap justify-center min-h-[8px]">
                      {day.posts.map((p, j) => (
                        <div key={j} className="w-1.5 h-1.5 rounded-full" style={{ background: PLATFORM_COLORS[p.platform] || '#888' }} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </BlurFade>

          {/* Recent Outputs */}
          <BlurFade delay={0.3}>
            <div className="rounded-2xl border border-[var(--border-base)] bg-[var(--card-bg)] overflow-hidden">
              <div className="flex items-center justify-between p-5 border-b border-[var(--border-dim)]">
                <h3 className="text-[13px] font-semibold text-[var(--text-1)]">Recent Outputs</h3>
                <Link href="/assets" className="text-[12px] text-[var(--ai-color)] hover:text-[var(--ai-color)] transition-colors">View All →</Link>
              </div>
              {recentPosts.length === 0 ? (
                <div className="relative flex flex-col items-center justify-center py-16 gap-4">
                  <DotPattern className="text-[var(--text-4)] opacity-40" width={20} height={20} />
                  <div className="relative z-10 flex flex-col items-center gap-4">
                    <div className="relative w-16 h-16 flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full bg-[var(--ai-glow)] border border-[var(--ai-border)] animate-pulse" />
                      <Wand2 size={24} className="text-[var(--ai-color)] relative z-10" />
                    </div>
                    <div className="text-center">
                      <p className="text-[13px] font-medium text-[var(--text-2)]">No content generated yet</p>
                      <p className="text-[12px] text-[var(--text-3)] mt-0.5">Generate your first post to see it here</p>
                    </div>
                    <Link href="/generate">
                      <AIButton className="text-[12px] px-4 py-2 rounded-lg">
                        <Sparkles size={12} className="mr-1.5 text-[var(--ai-color)]" />
                        Generate First Post
                      </AIButton>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-0">
                  {recentPosts.map((post) => (
                    <div key={post.id} className="group relative p-4 border-b border-r border-[var(--border-dim)] last:border-r-0 hover:bg-[var(--bg-subtle)] transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center text-white text-xs font-bold"
                          style={{ background: PLATFORM_COLORS[post.platform] || '#888' }}>
                          {post.platform[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[var(--text-2)] text-xs capitalize font-medium">{post.platform}</p>
                          <p className="text-[var(--text-3)] text-xs line-clamp-2 mt-0.5">{post.caption}</p>
                          <p className="text-[var(--text-4)] text-[10px] mt-1">
                            {post.scheduled_at ? new Date(post.scheduled_at).toLocaleDateString() : 'Draft'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </BlurFade>
        </div>

        {/* RIGHT */}
        <div className="space-y-4">
          {/* Brand DNA */}
          <BlurFade delay={0.2}>
            <div className="rounded-2xl border border-[var(--border-base)] bg-[var(--card-bg)] overflow-hidden">
              <div className="h-1 w-full bg-gradient-to-r from-[var(--ai-color)] via-[var(--success-color)] to-[var(--credit-color)]" />
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--text-3)]">Brand DNA</span>
                  {brand ? (
                    <Link href="/settings#brand-identity" className="text-[11px] text-[var(--ai-color)] hover:text-[var(--ai-color)] transition-colors">Edit →</Link>
                  ) : (
                    <Link href="/onboarding" className="text-[11px] text-[var(--ai-color)] hover:text-[var(--ai-color)] transition-colors">Complete setup →</Link>
                  )}
                </div>
                {brand ? (
                  <>
                    <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[var(--border-dim)]">
                      <div className="w-10 h-10 rounded-full bg-[var(--ai-color)] flex items-center justify-center text-white font-bold text-sm">
                        {brand.name.slice(0, 2).toUpperCase()}
                      </div>
                      <p className="text-[var(--text-1)] font-semibold text-sm">{brand.name}</p>
                    </div>
                    {DNA_ROWS.map((row) => (
                      <div key={row.label} className="flex items-center justify-between py-2.5 border-b border-[var(--border-dim)] last:border-0">
                        <div className="flex items-center gap-2">
                          <row.icon size={13} className="text-[var(--text-3)]" />
                          <span className="text-[12px] text-[var(--text-3)] font-medium">{row.label}</span>
                        </div>
                        <span className="text-[12px] text-[var(--text-1)] font-medium">{row.value}</span>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-[var(--text-3)] text-sm">No brand set up yet</p>
                    <Link href="/onboarding" className="text-[var(--ai-color)] text-xs mt-2 inline-block">Set up your brand →</Link>
                  </div>
                )}
              </div>
            </div>
          </BlurFade>

          {/* Quick Actions */}
          <BlurFade delay={0.27}>
            <div className="rounded-2xl border border-[var(--border-base)] bg-[var(--card-bg)] p-4 space-y-2">
              <Link href="/generate" className="block">
                <AIButton className="w-full rounded-xl py-3 text-[13px] font-semibold justify-center">
                  <Sparkles size={14} className="mr-2 text-[var(--ai-color)]" />
                  Generate New Content
                </AIButton>
              </Link>
              <Link href="/calendar"
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[var(--border-base)] text-[13px] text-[var(--text-2)] hover:bg-[var(--bg-subtle)] hover:border-[var(--border-loud)] hover:text-[var(--text-1)] transition-all duration-150">
                <CalendarDays size={14} />
                View Full Calendar
              </Link>
              <Link href="/assets"
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] text-[var(--text-3)] hover:text-[var(--text-2)] transition-colors">
                <BarChart2 size={14} />
                Asset Library
              </Link>
            </div>
          </BlurFade>

          {/* Credits */}
          <BlurFade delay={0.32}>
            <div className="rounded-2xl border border-[var(--border-base)] bg-[var(--card-bg)] p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[12px] font-semibold text-[var(--text-2)]">Credits</span>
                <span className="text-[12px] font-medium text-[var(--text-1)]">{credits} / {maxCredits}</span>
              </div>
              <div className="h-2 rounded-full bg-[var(--bg-muted)] overflow-hidden mb-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((credits / maxCredits) * 100, 100)}%` }}
                  transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full rounded-full bg-gradient-to-r from-[var(--ai-color)] to-[var(--credit-color)]"
                />
              </div>
              <p className="text-[11px] text-[var(--text-3)] mb-3">
                ~{Math.floor(credits / 2)} posts remaining
              </p>
              {credits < 50 && (
                <p className="text-[11px] text-orange-400 mb-2 flex items-center gap-1"><AlertTriangle size={11} /> Running low on credits</p>
              )}
              <Link href="/settings#billing">
                <button className="w-full py-2 rounded-xl border border-[var(--ai-border)] bg-[var(--ai-glow)] text-[12px] font-medium text-[var(--ai-color)] hover:bg-[var(--ai-glow)] hover:border-[var(--ai-border)] transition-all duration-150">
                  Buy More Credits →
                </button>
              </Link>
            </div>
          </BlurFade>
        </div>
      </div>
    </div>
  )
}
