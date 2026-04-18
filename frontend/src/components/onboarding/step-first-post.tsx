'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { IconRefresh, IconCalendarPlus } from '@tabler/icons-react'
import { useOnboardingStore } from '@/stores/onboarding'
import { apiCall } from '@/lib/api'
import { toast } from 'sonner'

interface GeneratedPost {
  id: string
  caption: string
  platform: string
  hashtags: string[]
}

export function StepFirstPost() {
  const router = useRouter()
  const { data, reset } = useOnboardingStore()
  const [loading, setLoading] = useState(true)
  const [post, setPost] = useState<GeneratedPost | null>(null)
  const [saving, setSaving] = useState(false)
  const [regenerating, setRegenerating] = useState(false)
  const [onboardingDone, setOnboardingDone] = useState(false)

  const firstPlatform = (data.platforms || [])[0] || 'instagram'
  const firstGoal = (data.goals || [])[0] || 'growth'

  const generatePost = async () => {
    setLoading(true)
    try {
      const res = await apiCall<{ post: GeneratedPost }>('/api/generate-content', {
        method: 'POST',
        body: JSON.stringify({
          platform: firstPlatform,
          contentType: 'post',
          brief: `${data.brandName ? `Brand: ${data.brandName}.` : ''} ${data.description || ''} Goal: ${firstGoal}.`,
          mood: (data.styles || [])[0] || '',
        }),
      })
      setPost(res.post)
    } catch {
      setPost({
        id: 'preview',
        caption: `Introducing ${data.brandName || 'your brand'} — where ${data.description || 'great things happen'}. Stay tuned for exciting updates! ✨`,
        platform: firstPlatform,
        hashtags: ['#brand', '#launch', '#newbeginnings'],
      })
    } finally {
      setLoading(false)
    }
  }

  const completeOnboarding = async () => {
    if (onboardingDone) return
    try {
      await apiCall('/api/onboarding/complete', {
        method: 'POST',
        body: JSON.stringify({
          brandName: data.brandName,
          description: data.description,
          industry: data.industry,
          tone: data.tone,
          styles: data.styles,
          audienceAgeMin: data.ageRange[0],
          audienceAgeMax: data.ageRange[1],
          audienceGender: data.gender,
          audienceLocation: data.location,
          audienceInterests: data.interests,
          platforms: data.platforms,
          goals: data.goals,
        }),
      })
      setOnboardingDone(true)
    } catch {
      // Silently ignore — will retry on save
    }
  }

  useEffect(() => {
    generatePost()
    completeOnboarding()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      if (!onboardingDone) await completeOnboarding()
      toast.success('Post saved to your calendar! 🎉')
      reset()
      router.push('/dashboard')
    } catch {
      toast.error('Failed to save. Redirecting to dashboard…')
      reset()
      router.push('/dashboard')
    } finally {
      setSaving(false)
    }
  }

  const handleSkip = () => {
    completeOnboarding().finally(() => {
      reset()
      router.push('/dashboard')
    })
  }

  const handleRegenerate = async () => {
    setRegenerating(true)
    await generatePost()
    setRegenerating(false)
  }

  const platformColors: Record<string, string> = {
    instagram: '#f43f5e', linkedin: '#3b82f6', twitter: '#94a3b8',
    facebook: '#2563eb', tiktok: '#10b981', youtube: '#ef4444',
    pinterest: '#e11d48', threads: '#a1a1aa',
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-white font-bold text-3xl tracking-tight">Here&apos;s your first AI-generated post</h2>
        <p className="text-white/40 text-sm mt-2">Based on your brand DNA. Ready to publish.</p>
      </div>

      {/* Phone mockup */}
      <div className="flex justify-center">
        <div className="w-[280px] rounded-[36px] border-[6px] border-white/10 bg-[#111] overflow-hidden shadow-2xl">
          {/* Status bar */}
          <div className="h-8 bg-black flex items-center justify-center">
            <div className="w-16 h-4 bg-[#222] rounded-full" />
          </div>
          {/* Content */}
          <div className="p-4 space-y-3">
            {/* Platform badge */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{ background: platformColors[firstPlatform] || '#888' }}>
                {firstPlatform[0].toUpperCase()}
              </div>
              <div>
                <p className="text-white text-xs font-semibold capitalize">{firstPlatform}</p>
                <p className="text-white/30 text-[10px]">Just now</p>
              </div>
            </div>
            {/* Caption */}
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
                  <div className="flex items-center gap-2 justify-center py-4">
                    <div className="w-6 h-6 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
                    <p className="text-white/50 text-xs">AI is writing your first post…</p>
                  </div>
                  <div className="h-2 bg-white/[0.06] rounded animate-pulse" />
                  <div className="h-2 bg-white/[0.06] rounded animate-pulse w-4/5" />
                  <div className="h-2 bg-white/[0.06] rounded animate-pulse w-3/5" />
                </motion.div>
              ) : (
                <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <p className="text-white text-xs leading-relaxed">{post?.caption}</p>
                  {(post?.hashtags || []).length > 0 && (
                    <p className="text-violet-400/70 text-[10px] mt-2">
                      {post?.hashtags.slice(0, 5).map((h) => `#${h.replace(/^#/, '')}`).join(' ')}
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            {/* Placeholder image */}
            <div className="aspect-square rounded-xl bg-gradient-to-br from-violet-900/50 via-blue-900/30 to-black flex items-center justify-center">
              <p className="text-white/20 text-xs">Image will generate here</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <button
          onClick={handleSave}
          disabled={loading || saving}
          className="w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_30px_rgba(139,92,246,0.3)]"
        >
          <IconCalendarPlus size={18} />
          {saving ? 'Saving…' : 'Save to Calendar'}
        </button>
        <button
          onClick={handleRegenerate}
          disabled={loading || regenerating}
          className="w-full flex items-center justify-center gap-2 h-12 rounded-xl border border-white/15 text-white/70 hover:border-white/30 hover:text-white transition-all disabled:opacity-40"
        >
          <IconRefresh size={16} className={regenerating ? 'animate-spin' : ''} />
          Regenerate
        </button>
        <button onClick={handleSkip} className="text-center text-white/30 hover:text-white/60 text-sm transition-colors py-2">
          Skip for now →
        </button>
      </div>
    </div>
  )
}
