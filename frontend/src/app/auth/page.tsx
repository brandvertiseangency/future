'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Loader2, CheckCircle, MailCheck } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { cn } from '@/lib/utils'
import { Spotlight } from '@/components/ui/spotlight'
import { TextGenerateEffect } from '@/components/ui/text-generate-effect'
import { FlipWords } from '@/components/ui/flip-words'

type Tab = 'signin' | 'signup'
type FirebaseError = { code?: string; message?: string }

const ERROR_MESSAGES: Record<string, string> = {
  'auth/email-already-in-use': 'An account with this email already exists. Sign in instead?',
  'auth/wrong-password': 'Incorrect password. Try again or reset it.',
  'auth/user-not-found': 'No account found with this email. Sign up instead?',
  'auth/too-many-requests': 'Too many attempts. Please try again in a few minutes.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/weak-password': 'Password must be at least 6 characters.',
  'auth/popup-closed-by-user': 'Sign-in cancelled. Please try again.',
  'auth/network-request-failed': 'Connection failed. Check your internet and retry.',
  'auth/invalid-credential': 'Incorrect email or password. Please try again.',
}

function getStrength(password: string): { score: number; label: string; color: string } {
  if (password.length === 0) return { score: 0, label: '', color: '' }
  let score = 0
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  const levels = [
    { score: 1, label: 'Weak', color: 'bg-rose-500' },
    { score: 2, label: 'Fair', color: 'bg-orange-400' },
    { score: 3, label: 'Good', color: 'bg-yellow-400' },
    { score: 4, label: 'Strong', color: 'bg-emerald-500' },
  ]
  return levels[Math.min(score - 1, 3)] ?? { score: 0, label: '', color: '' }
}

const PLATFORM_WORDS = ['Instagram', 'LinkedIn', 'TikTok', 'Twitter', 'Threads', 'Pinterest']

function AuthPageContent() {
  const { user, loading, signIn, signUp, signInWithGoogle, resetPassword, sendVerification } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/dashboard'

  const [tab, setTab] = useState<Tab>(() =>
    searchParams.get('tab') === 'signup' ? 'signup' : 'signin'
  )
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [resetMode, setResetMode] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetSent, setResetSent] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [showVerifyBanner, setShowVerifyBanner] = useState(false)
  const [verifyResent, setVerifyResent] = useState(false)

  useEffect(() => {
    if (!loading && user && !showVerifyBanner) router.replace(redirectTo)
  }, [user, loading, router, redirectTo, showVerifyBanner])

  const strength = getStrength(password)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      if (tab === 'signup') {
        await signUp(email, password, name)
        setShowVerifyBanner(true)
      } else {
        await signIn(email, password)
      }
    } catch (err) {
      const fbErr = err as FirebaseError
      setError(ERROR_MESSAGES[fbErr.code ?? ''] ?? fbErr.message ?? 'Something went wrong.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogle = async () => {
    setError('')
    setGoogleLoading(true)
    try {
      await signInWithGoogle()
    } catch (err) {
      const fbErr = err as FirebaseError
      setError(ERROR_MESSAGES[fbErr.code ?? ''] ?? 'Google sign-in failed.')
      setGoogleLoading(false)
    }
  }

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      await resetPassword(resetEmail)
      setResetSent(true)
    } catch (err) {
      const fbErr = err as FirebaseError
      setError(ERROR_MESSAGES[fbErr.code ?? ''] ?? 'Failed to send reset email.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 size={32} className="text-[var(--ai-color)] animate-spin" />
      </div>
    )
  }

  if (showVerifyBanner) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[380px] rounded-2xl border border-[var(--border-base)] bg-white/[0.04] backdrop-blur-xl p-8 text-center shadow-2xl"
        >
          <MailCheck size={44} className="text-[var(--ai-color)] mx-auto mb-4" />
          <h2 className="text-white font-semibold text-lg mb-2">Verify your email</h2>
          <p className="text-white/50 text-sm mb-6">
            We&apos;ve sent a verification link to <strong className="text-white/70">{email}</strong>.
            Check your inbox and click the link, then come back to continue.
          </p>
          <button
            onClick={async () => {
              try { await sendVerification(); setVerifyResent(true) } catch { /* ignore */ }
            }}
            disabled={verifyResent}
            className="w-full mb-3 py-2.5 rounded-xl border border-[var(--border-base)] text-white/60 text-sm
                       hover:bg-white/5 transition-colors disabled:opacity-50"
          >
            {verifyResent ? 'Sent again' : 'Resend verification email'}
          </button>
          <button
            onClick={() => { setShowVerifyBanner(false); router.push('/onboarding') }}
            className="w-full py-2.5 rounded-xl bg-[var(--ai-color)] hover:opacity-90 text-white text-sm font-semibold transition-colors"
          >
            Continue to onboarding →
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black flex">
      {/* LEFT — Hero with Spotlight */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden items-center justify-center p-16">
        <Spotlight className="top-0 left-0" fill="rgba(0,212,255,0.12)" />
        <div className="relative z-10 max-w-md">
          <div className="flex items-center gap-2 mb-10">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--ai-color)] opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--ai-color)]" />
            </span>
            <span className="text-[14px] font-semibold tracking-tight text-white">brandvertise.ai</span>
          </div>
          <TextGenerateEffect
            words="The AI that posts for your brand."
            className="text-[40px] font-semibold text-white leading-[1.1] tracking-tight"
          />
          <p className="text-white/40 text-base mt-4 leading-relaxed">
            Generate, schedule, publish — all from your brand DNA.
          </p>
          <div className="mt-8 flex items-center gap-2 text-white/30 text-sm">
            <span>Built for</span>
            <FlipWords words={PLATFORM_WORDS} className="text-[var(--ai-color)] font-medium" />
          </div>
        </div>
      </div>

      {/* RIGHT — Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[400px]"
        >
          {/* Logo — mobile only */}
          <div className="flex items-center gap-2 mb-8 justify-center lg:hidden">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--ai-color)] opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--ai-color)]" />
            </span>
            <span className="text-[15px] font-semibold tracking-tight text-white">brandvertise.ai</span>
          </div>

          <div className="rounded-2xl border border-[var(--border-base)] bg-white/[0.04] backdrop-blur-xl p-8 shadow-2xl">
            <AnimatePresence mode="wait">
              {resetMode ? (
                <motion.div key="reset"
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <button onClick={() => { setResetMode(false); setResetSent(false); setError('') }}
                    className="text-[12px] text-[var(--ai-color)] mb-6 flex items-center gap-1 transition-colors">
                    ← Back to sign in
                  </button>
                  {resetSent ? (
                    <div className="text-center py-4">
                      <CheckCircle size={40} className="text-emerald-500 mx-auto mb-3" />
                      <p className="text-white font-semibold mb-1">Check your inbox</p>
                      <p className="text-white/40 text-sm">We sent a reset link to {resetEmail}</p>
                    </div>
                  ) : (
                    <form onSubmit={handleReset} className="space-y-4">
                      <div>
                        <p className="text-white font-semibold text-lg mb-1">Reset password</p>
                        <p className="text-white/40 text-sm mb-5">Enter your email and we&apos;ll send a reset link.</p>
                      </div>
                      <div className="relative">
                        <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
                        <input type="email" value={resetEmail} onChange={e => setResetEmail(e.target.value)}
                          required placeholder="you@example.com"
                          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-[var(--border-base)]
                                     text-white text-sm placeholder:text-white/25
                                     focus:outline-none focus:border-[var(--ai-border)] transition-colors" />
                      </div>
                      {error && <p className="text-[12px] text-rose-400">{error}</p>}
                      <button type="submit" disabled={isSubmitting}
                        className="w-full py-2.5 rounded-xl bg-[var(--ai-color)] hover:opacity-90 text-white text-sm font-semibold
                                   transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                        {isSubmitting ? <Loader2 size={15} className="animate-spin" /> : 'Send Reset Link'}
                      </button>
                    </form>
                  )}
                </motion.div>
              ) : (
                <motion.div key="auth"
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                  {/* Tabs */}
                  <div className="flex p-1 rounded-xl bg-white/[0.04] mb-6">
                    {(['signin', 'signup'] as const).map(t => (
                      <button key={t} onClick={() => { setTab(t); setError('') }}
                        className={cn(
                          'flex-1 py-2 rounded-lg text-[13px] font-medium transition-all',
                          tab === t
                            ? 'bg-white/[0.08] border border-[var(--border-loud)] text-white shadow-sm'
                            : 'text-white/40 hover:text-white/60'
                        )}>
                        {t === 'signin' ? 'Sign in' : 'Sign up'}
                      </button>
                    ))}
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-3">
                    <AnimatePresence>
                      {tab === 'signup' && (
                        <motion.div key="name-field"
                          initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                          <div className="relative pt-1 pb-1">
                            <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
                            <input type="text" value={name} onChange={e => setName(e.target.value)}
                              required={tab === 'signup'} placeholder="Full name"
                              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-[var(--border-base)]
                                         text-white text-sm placeholder:text-white/25
                                         focus:outline-none focus:border-[var(--ai-border)] transition-colors" />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="relative">
                      <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                        required placeholder="you@example.com"
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-[var(--border-base)]
                                   text-white text-sm placeholder:text-white/25
                                   focus:outline-none focus:border-[var(--ai-border)] transition-colors" />
                    </div>

                    <div className="relative">
                      <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
                      <input type={showPass ? 'text' : 'password'} value={password}
                        onChange={e => setPassword(e.target.value)}
                        required placeholder="Password" minLength={6}
                        className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-white/[0.04] border border-[var(--border-base)]
                                   text-white text-sm placeholder:text-white/25
                                   focus:outline-none focus:border-[var(--ai-border)] transition-colors" />
                      <button type="button" onClick={() => setShowPass(!showPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors">
                        {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>

                    <AnimatePresence>
                      {tab === 'signup' && password.length > 0 && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          className="space-y-1">
                          <div className="flex gap-1">
                            {[1, 2, 3, 4].map(i => (
                              <div key={i} className={cn('h-1 flex-1 rounded-full transition-all duration-300',
                                i <= strength.score ? strength.color : 'bg-white/[0.08]')} />
                            ))}
                          </div>
                          {strength.label && (
                            <p className="text-[11px] text-white/40">{strength.label} password</p>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {tab === 'signin' && (
                      <div className="text-right">
                        <button type="button" onClick={() => { setResetMode(true); setResetEmail(email); setError('') }}
                          className="text-[12px] text-[var(--ai-color)] transition-colors">
                          Forgot password?
                        </button>
                      </div>
                    )}

                    {error && (
                      <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                        className="text-[12px] text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
                        {error}
                      </motion.p>
                    )}

                    <button type="submit" disabled={isSubmitting}
                      className="w-full py-2.5 rounded-xl bg-[var(--ai-color)] hover:opacity-90 text-white text-sm font-semibold
                                 transition-all flex items-center justify-center gap-2 disabled:opacity-60 mt-2
                                 shadow-[0_0_20px_rgba(0,212,255,0.20)]">
                      {isSubmitting ? (
                        <Loader2 size={15} className="animate-spin" />
                      ) : (
                        <>
                          {tab === 'signin' ? 'Sign in' : 'Create account'}
                          <ArrowRight size={14} />
                        </>
                      )}
                    </button>
                  </form>

                  <div className="flex items-center gap-3 my-4">
                    <div className="flex-1 h-px bg-white/[0.06]" />
                    <span className="text-[11px] text-white/25">or</span>
                    <div className="flex-1 h-px bg-white/[0.06]" />
                  </div>

                  <button onClick={handleGoogle} disabled={googleLoading}
                    className="w-full py-2.5 rounded-xl border border-[var(--border-base)] bg-white
                               text-black text-sm font-medium hover:bg-white/90
                               transition-all flex items-center justify-center gap-2
                               disabled:opacity-60">
                    {googleLoading
                      ? <Loader2 size={15} className="animate-spin" />
                      : <svg viewBox="0 0 24 24" width="15" height="15"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                    }
                    Continue with Google
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <p className="text-center text-[12px] text-white/20 mt-5">
            By continuing you agree to our{' '}
            <span className="text-[var(--ai-color)] cursor-pointer hover:underline">Terms</span> &amp;{' '}
            <span className="text-[var(--ai-color)] cursor-pointer hover:underline">Privacy Policy</span>
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense>
      <AuthPageContent />
    </Suspense>
  )
}
