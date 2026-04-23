'use client'

import { AlertCircle, ArrowRight, Layers, TrendingUp, ImageIcon, CalendarDays, Sparkles } from 'lucide-react'
import useSWR from 'swr'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { apiCall } from '@/lib/api'
import { BrandChat } from '@/components/dashboard/brand-chat'
import { IdeasGrid } from '@/components/dashboard/ideas-grid'
import { GenQueue } from '@/components/dashboard/gen-queue'
import { QuickActions } from '@/components/dashboard/quick-actions'
import { RecentOutputs } from '@/components/dashboard/recent-outputs'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fetcher = (url: string) => apiCall<any>(url)

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function DashboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { data: brandData } = useSWR('/api/brands/current', fetcher, { revalidateOnFocus: false })
  const { data: userData } = useSWR('/api/users/me', fetcher, { revalidateOnFocus: false })
  const { data: postsData } = useSWR('/api/posts?limit=3&status=approved', fetcher, { revalidateOnFocus: false })
  const { data: creditsData } = useSWR('/api/credits/balance', fetcher, { revalidateOnFocus: false })

  const brand = (brandData as any)?.brand ?? brandData
  const onboardingComplete = (userData as any)?.user?.onboarding_complete ?? true
  const recentPosts = (postsData as any)?.posts ?? []
  const credits = (creditsData as any)?.balance ?? 0

  const firstName = user?.displayName?.split(' ')[0] ?? 'there'
  const brandName = brand?.name ?? 'My Brand'
  const greeting = getGreeting()

  return (
    <div className="max-w-[820px] mx-auto px-6 py-8 pb-20 space-y-5">

      {/* Onboarding banner */}
      {!onboardingComplete && (
        <Link href="/onboarding" className="block no-underline">
          <div className="flex items-center justify-between rounded-2xl border border-white/[0.10] bg-white/[0.025] px-4 py-3.5 gap-3 hover:border-white/[0.18] transition-all group">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-white/[0.06] border border-white/[0.10] flex items-center justify-center flex-shrink-0">
                <AlertCircle size={14} className="text-white/50" />
              </div>
              <div>
                <p className="text-[13px] font-medium text-white/80">Complete your brand setup</p>
                <p className="text-[11.5px] text-white/35 mt-0.5">Unlock personalised AI-generated content</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-white/35 text-[12px] font-medium group-hover:text-white/60 transition-colors flex-shrink-0">
              Set up <ArrowRight size={12} />
            </div>
          </div>
        </Link>
      )}

      {/* Hero greeting */}
      <div className="pt-1 pb-2">
        <div className="flex items-center gap-1.5 text-[10px] text-white/20 uppercase tracking-[0.12em] mb-3">
          <Layers size={9} strokeWidth={1.5} />
          {brandName}
        </div>
        <h1 className="text-[34px] font-semibold tracking-[-0.035em] text-white leading-[1.1] mb-2">
          {greeting},{' '}
          <span className="silver-text-anim italic font-normal">{firstName}</span>
        </h1>
        <p className="text-[13.5px] text-white/35 leading-relaxed">
          {onboardingComplete
            ? 'Your brand AI is ready. What would you like to create today?'
            : 'Finish setting up your brand to unlock the full experience.'}
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Posts generated', value: recentPosts.length > 0 ? '12+' : '0', icon: ImageIcon, href: '/outputs' },
          { label: 'Credits remaining', value: credits.toString(), icon: Sparkles, href: '/pricing' },
          { label: 'Scheduled posts', value: '0', icon: CalendarDays, href: '/calendar' },
        ].map(({ label, value, icon: Icon, href }) => (
          <button
            key={label}
            onClick={() => router.push(href)}
            className="bento-card rounded-2xl p-4 text-left hover:cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-3">
              <Icon size={14} className="text-white/25 group-hover:text-white/50 transition-colors" />
              <TrendingUp size={10} className="text-white/15" />
            </div>
            <p className="text-[22px] font-semibold tracking-[-0.02em] text-white">{value}</p>
            <p className="text-[11px] text-white/30 mt-0.5">{label}</p>
          </button>
        ))}
      </div>

      {/* Brand AI Chat */}
      <BrandChat brand={brand} />

      {/* Content Ideas */}
      <IdeasGrid brand={brand} />

      {/* Quick Actions + Queue */}
      <div className="grid grid-cols-2 gap-3">
        <QuickActions />
        <GenQueue />
      </div>

      {/* Recent Outputs */}
      <RecentOutputs />
    </div>
  )
}
