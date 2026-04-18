'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Users, ImageIcon, TrendingUp, Clock,
  Sparkles, CalendarDays, BarChart2,
  Wand2,
} from 'lucide-react'
import { NumberTicker } from '@/components/ui/number-ticker'
import { BlurFade } from '@/components/ui/blur-fade'
import { DotPattern } from '@/components/ui/dot-pattern'
import { ShimmerButton } from '@/components/ui/shimmer-button'

const STATS = [
  {
    label: 'Active Brands',
    value: 2400,
    suffix: '+',
    trend: '+12%',
    trendUp: true,
    icon: Users,
    color: 'var(--stat-1)',
    bg: 'rgba(139,92,246,0.08)',
    border: 'rgba(139,92,246,0.15)',
  },
  {
    label: 'Posts Generated',
    value: 10,
    suffix: 'M+',
    trend: '+8%',
    trendUp: true,
    icon: ImageIcon,
    color: 'var(--stat-2)',
    bg: 'rgba(96,165,250,0.08)',
    border: 'rgba(96,165,250,0.15)',
  },
  {
    label: 'Avg Engagement Lift',
    value: 47,
    suffix: '%',
    trend: '+5%',
    trendUp: true,
    icon: TrendingUp,
    color: 'var(--stat-3)',
    bg: 'rgba(52,211,153,0.08)',
    border: 'rgba(52,211,153,0.15)',
  },
  {
    label: 'Trial Days Left',
    value: 14,
    suffix: '',
    trend: '−2 days',
    trendUp: false,
    icon: Clock,
    color: 'var(--stat-4)',
    bg: 'rgba(251,146,60,0.08)',
    border: 'rgba(251,146,60,0.15)',
    urgent: true,
  },
]

const PLATFORM_COLORS: Record<string, string> = {
  instagram: '#f43f5e',
  linkedin: '#3b82f6',
  twitter: '#94a3b8',
  tiktok: '#10b981',
  facebook: '#2563eb',
}

const DEMO_WEEK_POSTS: Record<number, { platform: string }[]> = {
  0: [{ platform: 'instagram' }, { platform: 'linkedin' }],
  1: [{ platform: 'twitter' }],
  2: [],
  3: [{ platform: 'instagram' }, { platform: 'tiktok' }, { platform: 'linkedin' }],
  4: [{ platform: 'instagram' }],
  5: [],
  6: [{ platform: 'twitter' }, { platform: 'instagram' }],
}

const DNA_ROWS = [
  { label: 'Tone', value: 'Professional', icon: '🎯' },
  { label: 'Style', value: 'Minimal', icon: '✦' },
  { label: 'Audience', value: '25–40, Mixed', icon: '👥' },
  { label: 'Goals', value: 'Growth, Revenue', icon: '📈' },
]

function useGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function DashboardPage() {
  const greeting = useGreeting()
  const credits = 247
  const maxCredits = 500

  const today = new Date()
  const todayDow = (today.getDay() + 6) % 7 // Mon=0
  const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const weekDates = DAY_NAMES.map((name, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - todayDow + i)
    return { name, date: d.getDate(), isToday: i === todayDow, posts: DEMO_WEEK_POSTS[i] ?? [] }
  })

  return (
    <div className="p-7 space-y-5 max-w-[1400px]">

      {/* ── Welcome Banner ── */}
      <BlurFade delay={0}>
        <div className="relative overflow-hidden rounded-2xl border border-[var(--border-base)] bg-[var(--card-bg)] p-7">
          {/* Mesh glows */}
          <div className="absolute -top-20 -left-10 w-72 h-72 rounded-full pointer-events-none"
               style={{ background: 'radial-gradient(circle,rgba(139,92,246,0.12) 0%,transparent 65%)' }} />
          <div className="absolute -bottom-16 right-20 w-56 h-56 rounded-full pointer-events-none"
               style={{ background: 'radial-gradient(circle,rgba(59,130,246,0.07) 0%,transparent 65%)' }} />

          <div className="relative flex items-start justify-between gap-6">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--text-3)] mb-2">
                Welcome back
              </p>
              <h2 className="text-[28px] font-bold text-[var(--text-1)] leading-tight">
                {greeting},{' '}
                <span className="font-playfair italic bg-gradient-to-r from-violet-400 via-fuchsia-400 to-blue-400 bg-clip-text text-transparent">
                  Creator
                </span>
                {' '}✦
              </h2>
              <p className="mt-1.5 text-[13.5px] text-[var(--text-2)] max-w-md">
                Your brand is generating content. Here&apos;s today&apos;s overview.
              </p>
              <div className="flex items-center gap-5 mt-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[12px] text-[var(--text-3)]">3 posts scheduled today</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                  <span className="text-[12px] text-[var(--text-3)]">247 credits available</span>
                </div>
              </div>
            </div>
            <Link href="/generate" className="flex-shrink-0">
              <ShimmerButton className="rounded-xl px-5 py-2.5 text-[13px] font-medium">
                <Sparkles size={14} className="mr-2 text-violet-300" />
                Generate Now
              </ShimmerButton>
            </Link>
          </div>
        </div>
      </BlurFade>

      {/* ── Stats Strip ── */}
      <div className="grid grid-cols-4 gap-4">
        {STATS.map((stat, i) => {
          const Icon = stat.icon
          return (
            <BlurFade key={stat.label} delay={0.05 + i * 0.07}>
              <div
                className="relative rounded-2xl p-5 overflow-hidden cursor-default group"
                style={{ background: stat.bg, border: `1px solid ${stat.border}` }}
              >
                {/* Top row */}
                <div className="flex items-start justify-between mb-4">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                       style={{ background: stat.bg, border: `1px solid ${stat.border}` }}>
                    <Icon size={16} style={{ color: stat.color }} />
                  </div>
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                    stat.trendUp
                      ? 'text-emerald-400 bg-emerald-500/10'
                      : 'text-orange-400 bg-orange-500/10'
                  }`}>
                    {stat.trendUp ? '↑' : '↓'} {stat.trend}
                  </span>
                </div>

                {/* Number */}
                <div className="flex items-baseline gap-0.5">
                  <NumberTicker
                    value={stat.value}
                    className="text-[32px] font-bold leading-none tabular-nums"
                    style={{ color: stat.color }}
                    delay={200 + i * 100}
                  />
                  <span className="text-[20px] font-bold" style={{ color: stat.color }}>
                    {stat.suffix}
                  </span>
                </div>

                <p className="mt-1.5 text-[12px] text-[var(--text-3)] font-medium uppercase tracking-wide">
                  {stat.label}
                </p>

                {/* Urgent pulse — Trial card */}
                {stat.urgent && (
                  <div className="absolute top-3 right-3 w-2 h-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-500" />
                  </div>
                )}

                {/* Hover glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"
                     style={{ boxShadow: `inset 0 0 40px ${stat.bg}` }} />
              </div>
            </BlurFade>
          )
        })}
      </div>

      {/* ── Main two-column grid ── */}
      <div className="grid grid-cols-[1fr_360px] gap-5">

        {/* LEFT */}
        <div className="space-y-5">

          {/* This Week Calendar Strip */}
          <BlurFade delay={0.25}>
            <div className="rounded-2xl border border-[var(--border-base)] bg-[var(--card-bg)] p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[13px] font-semibold text-[var(--text-1)]">This Week</h3>
                <Link href="/calendar" className="text-[12px] text-violet-400 hover:text-violet-300 transition-colors">
                  Full Calendar →
                </Link>
              </div>
              <div className="grid grid-cols-7 gap-1.5">
                {weekDates.map((day) => (
                  <div
                    key={day.name}
                    className={`flex flex-col items-center gap-1.5 p-2 rounded-xl cursor-pointer transition-all duration-150 ${
                      day.isToday
                        ? 'bg-violet-500/15 border border-violet-500/25'
                        : 'hover:bg-[var(--bg-subtle)]'
                    }`}
                  >
                    <span className={`text-[10px] font-medium uppercase tracking-wide ${
                      day.isToday ? 'text-violet-400' : 'text-[var(--text-3)]'
                    }`}>{day.name}</span>
                    <span className={`text-[15px] font-semibold ${
                      day.isToday ? 'text-violet-300' : 'text-[var(--text-1)]'
                    }`}>{day.date}</span>
                    <div className="flex gap-0.5 flex-wrap justify-center min-h-[8px]">
                      {day.posts.map((p, j) => (
                        <div key={j} className="w-1.5 h-1.5 rounded-full"
                             style={{ background: PLATFORM_COLORS[p.platform] }} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-4 mt-4 pt-3 border-t border-[var(--border-dim)]">
                {['instagram', 'linkedin', 'twitter'].map((p) => (
                  <div key={p} className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: PLATFORM_COLORS[p] }} />
                    <span className="text-[10px] text-[var(--text-3)] capitalize">{p}</span>
                  </div>
                ))}
              </div>
            </div>
          </BlurFade>

          {/* Recent Outputs — Empty State */}
          <BlurFade delay={0.3}>
            <div className="rounded-2xl border border-[var(--border-base)] bg-[var(--card-bg)] overflow-hidden">
              <div className="flex items-center justify-between p-5 border-b border-[var(--border-dim)]">
                <h3 className="text-[13px] font-semibold text-[var(--text-1)]">Recent Outputs</h3>
                <Link href="/assets" className="text-[12px] text-violet-400 hover:text-violet-300 transition-colors">
                  View All →
                </Link>
              </div>
              {/* Empty state */}
              <div className="relative flex flex-col items-center justify-center py-16 gap-4">
                <DotPattern className="text-[var(--text-4)] opacity-40" width={20} height={20} />
                <div className="relative z-10 flex flex-col items-center gap-4">
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full bg-violet-500/10 border border-violet-500/20 animate-pulse" />
                    <Wand2 size={24} className="text-violet-400 relative z-10" />
                  </div>
                  <div className="text-center">
                    <p className="text-[13px] font-medium text-[var(--text-2)]">No content generated yet</p>
                    <p className="text-[12px] text-[var(--text-3)] mt-0.5">Generate your first post to see it here</p>
                  </div>
                  <Link href="/generate">
                    <ShimmerButton className="text-[12px] px-4 py-2 rounded-lg">
                      <Sparkles size={12} className="mr-1.5 text-violet-300" />
                      Generate First Post
                    </ShimmerButton>
                  </Link>
                </div>
              </div>
            </div>
          </BlurFade>
        </div>

        {/* RIGHT */}
        <div className="space-y-4">

          {/* Brand DNA */}
          <BlurFade delay={0.2}>
            <div className="rounded-2xl border border-[var(--border-base)] bg-[var(--card-bg)] overflow-hidden">
              <div className="h-1 w-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-blue-600" />
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--text-3)]">
                    Brand DNA
                  </span>
                  <Link href="/settings" className="text-[11px] text-violet-400 hover:text-violet-300 transition-colors">
                    Edit →
                  </Link>
                </div>
                {DNA_ROWS.map((row) => (
                  <div key={row.label}
                       className="flex items-center justify-between py-2.5 border-b border-[var(--border-dim)] last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px]">{row.icon}</span>
                      <span className="text-[12px] text-[var(--text-3)] font-medium">{row.label}</span>
                    </div>
                    <span className="text-[12px] text-[var(--text-1)] font-medium">{row.value}</span>
                  </div>
                ))}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {['Growth', 'Revenue', 'Viral'].map((tag) => (
                    <span key={tag}
                          className="text-[11px] px-2.5 py-0.5 rounded-full font-medium
                                     bg-violet-500/10 border border-violet-500/20 text-violet-400">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </BlurFade>

          {/* Quick Actions */}
          <BlurFade delay={0.27}>
            <div className="rounded-2xl border border-[var(--border-base)] bg-[var(--card-bg)] p-4 space-y-2">
              <Link href="/generate" className="block">
                <ShimmerButton className="w-full rounded-xl py-3 text-[13px] font-semibold justify-center">
                  <Sparkles size={14} className="mr-2 text-violet-300" />
                  Generate New Content
                </ShimmerButton>
              </Link>
              <Link
                href="/calendar"
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl
                           border border-[var(--border-base)] text-[13px] text-[var(--text-2)]
                           hover:bg-[var(--bg-subtle)] hover:border-[var(--border-loud)]
                           hover:text-[var(--text-1)] transition-all duration-150"
              >
                <CalendarDays size={14} />
                View Full Calendar
              </Link>
              <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl
                                 text-[13px] text-[var(--text-3)] hover:text-[var(--text-2)] transition-colors">
                <BarChart2 size={14} />
                Analytics
              </button>
            </div>
          </BlurFade>

          {/* Credits */}
          <BlurFade delay={0.32}>
            <div className="rounded-2xl border border-[var(--border-base)] bg-[var(--card-bg)] p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[12px] font-semibold text-[var(--text-2)]">Credits</span>
                <span className="text-[12px] font-medium text-[var(--text-1)]">
                  <NumberTicker value={credits} delay={400} /> / {maxCredits}
                </span>
              </div>
              <div className="h-2 rounded-full bg-[var(--bg-muted)] overflow-hidden mb-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(credits / maxCredits) * 100}%` }}
                  transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full rounded-full bg-gradient-to-r from-violet-600 to-violet-400"
                />
              </div>
              <p className="text-[11px] text-[var(--text-3)] mb-3">
                ~62 posts remaining at current usage
              </p>
              <button className="w-full py-2 rounded-xl border border-violet-500/25
                                 bg-violet-500/[0.08] text-[12px] font-medium text-violet-400
                                 hover:bg-violet-500/15 hover:border-violet-500/40
                                 transition-all duration-150">
                Buy More Credits →
              </button>
            </div>
          </BlurFade>

        </div>
      </div>
    </div>
  )
}
