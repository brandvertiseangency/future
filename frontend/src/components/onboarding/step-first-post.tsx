'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { RefreshCw, CalendarPlus, Sparkles } from 'lucide-react'
import { useOnboardingStore } from '@/stores/onboarding'
import { apiCall } from '@/lib/api'
import { toast } from 'sonner'
import { MultiStepLoader } from '@/components/ui/multi-step-loader'
import { AIButton } from '@/components/ui/ai-button'

interface GeneratedPost {
  id: string
  caption: string
  platform: string
  hashtags: string[]
}

const LOADER_STEPS = [
  { text: 'Analyzing your brand DNA...' },
  { text: 'Crafting your voice...' },
  { text: 'Generating your first post...' },
  { text: 'Adding final touches...' },
]

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
        caption: `Introducing ${data.brandName || 'your brand'} — where ${data.description || 'great things happen'}. Stay tuned for exciting updates!`,
        platform: firstPlatform,
        hashtags: ['brand', 'launch', 'newbeginnings'],
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
      // Will retry on save
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
      // Fire confetti
      const confetti = (await import('canvas-confetti')).default
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } })
      toast.success('Post saved to your calendar!')
      setTimeout(() => {
        reset()
        router.push('/dashboard')
      }, 1500)
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
    instagram: '#e1306c', linkedin: '#0077b5', twitter: '#1da1f2',
    facebook: '#1877f2', tiktok: '#ff0050', youtube: '#ff0000',
    pinterest: '#e60023', threads: '#ffffff',
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <MultiStepLoader loadingStates={LOADER_STEPS} loading={true} duration={1200} />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-white font-semibold text-3xl tracking-tight">Your first post is ready</h2>
        <p className="text-white/40 text-sm mt-2">Based on your brand DNA. Ready to publish.</p>
      </div>

      {/* Phone mockup */}
      <div className="flex justify-center">
        <div className="w-[280px] rounded-[44px] border-2 border-white/10 bg-[#0a0a0a] overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.5)]">
          {/* Notch */}
          <div className="h-8 bg-black flex items-center justify-center">
            <div className="w-20 h-5 bg-black rounded-full border border-white/5" />
          </div>
          {/* Content */}
          <div className="p-4 space-y-3">
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

            <AnimatePresence mode="wait">
              <motion.div key={post?.caption} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <p className="text-white text-xs leading-relaxed">{post?.caption}</p>
                {(post?.hashtags || []).length > 0 && (
                  <p className="text-[var(--ai-color)] text-[10px] mt-2 opacity-70">
                    {post?.hashtags.slice(0, 5).map((h) => `#${h.replace(/^#/, '')}`).join(' ')}
                  </p>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="aspect-square rounded-xl bg-gradient-to-br from-cyan-900/30 via-blue-900/20 to-black flex items-center justify-center border border-white/5">
              <Sparkles size={24} className="text-white/15" />
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col items-center gap-3 max-w-xs mx-auto">
        <AIButton
          onClick={handleSave}
          loading={saving}
          disabled={saving}
          className="w-full justify-center"
        >
          <CalendarPlus size={16} />
          Save to Calendar
        </AIButton>
        <button
          onClick={handleRegenerate}
          disabled={regenerating}
          className="w-full flex items-center justify-center gap-2 h-11 rounded-xl border border-white/10 text-white/60 hover:border-white/20 hover:text-white transition-all disabled:opacity-40"
        >
          <RefreshCw size={14} className={regenerating ? 'animate-spin' : ''} />
          Regenerate
        </button>
        <button onClick={handleSkip} className="text-center text-white/25 hover:text-white/50 text-sm transition-colors py-2">
          Skip for now →
        </button>
      </div>
    </div>
  )
}
