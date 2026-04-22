'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Loader2, CheckCircle, MailCheck, ChevronLeft } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { cn } from '@/lib/utils'
import { LiquidMetalButton } from '@/components/ui/liquid-metal-button'

// ── Vertical scrolling card images (same as ScrollGallery) ────────────────────
const GALLERY_IMAGES = [
  "https://res.cloudinary.com/dcyn6md7x/image/upload/v1776780178/Generated_Image_April_21_2026_-_6_52PM_u0fcyb.jpg",
  "https://res.cloudinary.com/dcyn6md7x/image/upload/v1776780175/Generated_Image_April_21_2026_-_6_48PM_zwsgek.jpg",
  "https://res.cloudinary.com/dcyn6md7x/image/upload/v1776780177/Generated_Image_April_21_2026_-_6_49PM_viceqr.jpg",
  "https://res.cloudinary.com/dcyn6md7x/image/upload/v1776780176/Generated_Image_April_21_2026_-_6_47PM_g5bnxl.jpg",
  "https://res.cloudinary.com/dcyn6md7x/image/upload/v1776780174/Generated_Image_April_21_2026_-_6_40PM_wzyi9p.jpg",
  "https://res.cloudinary.com/dcyn6md7x/image/upload/v1776780174/Generated_Image_April_21_2026_-_6_46PM_cqc2pq.jpg",
  "https://res.cloudinary.com/dcyn6md7x/image/upload/v1776780175/Generated_Image_April_21_2026_-_6_39PM_rsdugh.jpg",
  "https://res.cloudinary.com/dcyn6md7x/image/upload/v1776780174/Generated_Image_April_21_2026_-_6_42PM_fypdfe.jpg",
  "https://res.cloudinary.com/dcyn6md7x/image/upload/v1776780171/Generated_Image_April_21_2026_-_6_32PM_pa05ud.jpg",
  "https://res.cloudinary.com/dcyn6md7x/image/upload/v1776780170/Generated_Image_April_21_2026_-_6_27PM_ywwyy9.jpg",
  "https://res.cloudinary.com/dcyn6md7x/image/upload/v1776780170/Generated_Image_April_21_2026_-_6_30PM_nkk8af.jpg",
  "https://res.cloudinary.com/dcyn6md7x/image/upload/v1776780169/Generated_Image_April_21_2026_-_6_36PM_em54t7.jpg",
  "https://res.cloudinary.com/dcyn6md7x/image/upload/v1776780168/Generated_Image_April_21_2026_-_6_35PM_ztn4ae.jpg",
  "https://res.cloudinary.com/dcyn6md7x/image/upload/v1776780169/Generated_Image_April_21_2026_-_6_25PM_ynrlfo.jpg",
  "https://res.cloudinary.com/dcyn6md7x/image/upload/v1776780168/Generated_Image_April_21_2026_-_6_26PM_jojegl.jpg",
  "https://res.cloudinary.com/dcyn6md7x/image/upload/v1776780166/Ecommerce_w0qvex.jpg",
]

const LEFT_IMAGES  = GALLERY_IMAGES.slice(0, 8)
const RIGHT_IMAGES = GALLERY_IMAGES.slice(8)

// ── Vertical scrolling column ──────────────────────────────────────────────────
function VerticalScrollColumn({ images, direction }: { images: string[]; direction: 'up' | 'down' }) {
  const tripled = [...images, ...images, ...images]
  const cardW = 120
  const cardH = Math.round(cardW * 16 / 9) // true 9:16
  const gap = 8
  const trackH = images.length * (cardH + gap)

  return (
    <div className="relative flex-1 min-w-0 overflow-hidden" style={{ height: '100%' }}>
      {/* Top fade */}
      <div className="absolute top-0 left-0 right-0 h-28 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, #0a0a0a 30%, transparent)' }} />
      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-28 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to top, #0a0a0a 30%, transparent)' }} />

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap,
          width: '100%',
          animation: `auth-scroll-${direction} ${images.length * 4}s linear infinite`,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ['--track-h' as any]: `${trackH + gap}px`,
        }}
      >
        {tripled.map((src, i) => (
          <div
            key={i}
            style={{
              width: '100%',
              height: cardH,
              borderRadius: 10,
              overflow: 'hidden',
              flexShrink: 0,
              background: '#111',
              aspectRatio: '9/16',
            }}
          >
            <img
              src={src}
              alt=""
              loading="lazy"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

type Step = 'entry' | 'password' | 'signup' | 'reset' | 'reset-sent' | 'verify'
type FirebaseError = { code?: string; message?: string }

const ERROR_MESSAGES: Record<string, string> = {
  'auth/email-already-in-use': 'An account with this email already exists.',
  'auth/wrong-password': 'Incorrect password. Try again or reset it.',
  'auth/user-not-found': 'No account found with this email.',
  'auth/too-many-requests': 'Too many attempts. Please try again later.',
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

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}

function MicrosoftIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18">
      <path fill="#F25022" d="M1 1h10v10H1z"/>
      <path fill="#7FBA00" d="M13 1h10v10H13z"/>
      <path fill="#00A4EF" d="M1 13h10v10H1z"/>
      <path fill="#FFB900" d="M13 13h10v10H13z"/>
    </svg>
  )
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="white">
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.4c1.32.07 2.24.72 3 .76 1.17-.21 2.3-.91 3.56-.84 1.53.1 2.68.74 3.43 1.89-3.26 1.96-2.74 6.07.48 7.44-.58 1.55-1.32 3.06-2.47 3.63zM12.03 7.25c-.14-2.3 1.8-4.23 3.98-4.25.3 2.58-2.34 4.5-3.98 4.25z"/>
    </svg>
  )
}

const slideVariants = {
  enter: (dir: number) => ({ x: dir * 40, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir * -40, opacity: 0 }),
}

function AuthPageContent() {
  const { user, loading, signIn, signUp, signInWithGoogle, resetPassword, sendVerification } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/dashboard'

  const [step, setStep] = useState<Step>('entry')
  const [dir, setDir] = useState(1)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const [verifyEmail, setVerifyEmail] = useState('')
  const [verifyResent, setVerifyResent] = useState(false)

  useEffect(() => {
    if (!loading && user && step !== 'verify') router.replace(redirectTo)
  }, [user, loading, router, redirectTo, step])

  const goTo = (s: Step, d = 1) => { setDir(d); setError(''); setStep(s) }
  const strength = getStrength(password)

  const handleEmailContinue = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    goTo('password', 1)
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(''); setIsSubmitting(true)
    try {
      await signIn(email, password)
    } catch (err) {
      const fbErr = err as FirebaseError
      if (fbErr.code === 'auth/user-not-found') goTo('signup', 1)
      else setError(ERROR_MESSAGES[fbErr.code ?? ''] ?? fbErr.message ?? 'Something went wrong.')
    } finally { setIsSubmitting(false) }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(''); setIsSubmitting(true)
    try {
      await signUp(email, password, name)
      setVerifyEmail(email)
      goTo('verify', 1)
    } catch (err) {
      const fbErr = err as FirebaseError
      setError(ERROR_MESSAGES[fbErr.code ?? ''] ?? fbErr.message ?? 'Something went wrong.')
    } finally { setIsSubmitting(false) }
  }

  const handleGoogle = async () => {
    setError(''); setGoogleLoading(true)
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
    setError(''); setIsSubmitting(true)
    try {
      await resetPassword(email)
      goTo('reset-sent', 1)
    } catch (err) {
      const fbErr = err as FirebaseError
      setError(ERROR_MESSAGES[fbErr.code ?? ''] ?? 'Failed to send reset email.')
    } finally { setIsSubmitting(false) }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 size={28} className="text-white/30 animate-spin" />
      </div>
    )
  }

  const inputCls = `w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/[0.10]
    text-white text-[15px] placeholder:text-white/30
    focus:outline-none focus:border-white/25 focus:bg-white/[0.08] transition-all`

  const socialCls = `w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-white/[0.12]
    bg-white/[0.04] hover:bg-white/[0.08] text-white/80 text-[14px] font-medium
    transition-all cursor-pointer select-none`

  const Logo = () => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/Brandvertise-Light-Logo.webp"
      alt="Brandvertise"
      className="object-contain mb-7"
      style={{ width: 120, height: 120 }}
    />
  )

  return (
    <div className="h-screen bg-[#0a0a0a] flex items-stretch relative overflow-hidden">
      {/* Subtle background dot grid */}
      <div className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />
      {/* Soft center glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_700px_500px_at_50%_45%,rgba(255,255,255,0.025),transparent)]" />

      {/* ── Left scrolling columns ── */}
      <div className="hidden lg:flex items-stretch w-[20%] shrink-0 overflow-hidden gap-2 px-2 py-2">
        <VerticalScrollColumn images={LEFT_IMAGES} direction="up" />
        <VerticalScrollColumn images={LEFT_IMAGES.slice().reverse()} direction="down" />
      </div>

      {/* ── Center: Auth Form ── */}
      <div className="relative z-10 flex items-center justify-center flex-1 p-6 lg:p-10 overflow-y-auto">
        <div className="w-full max-w-[400px]">
        <AnimatePresence mode="wait" custom={dir}>

          {/* ── ENTRY ─────────────────────────── */}
          {step === 'entry' && (
            <motion.div key="entry" custom={dir} variants={slideVariants}
              initial="enter" animate="center" exit="exit"
              transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center"
            >
              <Logo />
              <h1 className="text-white text-[22px] font-semibold tracking-tight mb-1">Sign in or sign up</h1>
              <p className="text-white/40 text-[14px] mb-8">Start creating with Brandvertise</p>

              <div className="w-full space-y-2.5 mb-6">
                <button onClick={handleGoogle} disabled={googleLoading} className={socialCls}>
                  {googleLoading ? <Loader2 size={18} className="animate-spin text-white/40" /> : <GoogleIcon />}
                  <span>Continue with Google</span>
                </button>
                <button className={socialCls} onClick={() => setError('Microsoft sign-in coming soon.')}>
                  <MicrosoftIcon />
                  <span>Continue with Microsoft</span>
                </button>
                <button className={socialCls} onClick={() => setError('Apple sign-in coming soon.')}>
                  <AppleIcon />
                  <span>Continue with Apple</span>
                </button>
              </div>

              <div className="flex items-center gap-3 w-full mb-5">
                <div className="flex-1 h-px bg-white/[0.08]" />
                <span className="text-white/25 text-[12px]">Or</span>
                <div className="flex-1 h-px bg-white/[0.08]" />
              </div>

              <form onSubmit={handleEmailContinue} className="w-full space-y-2.5">
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  required placeholder="Enter your email address" className={inputCls} autoFocus />
                {error && <p className="text-[12px] text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">{error}</p>}
                <LiquidMetalButton label="Continue" fullWidth onClick={() => {
                  if (email.trim()) goTo('password', 1)
                }} />
              </form>

              <p className="text-center text-[11px] text-white/20 mt-8 leading-relaxed">
                By continuing you agree to our{' '}
                <span className="text-white/40 cursor-pointer hover:text-white/60 transition-colors">Terms</span>
                {' '}·{' '}
                <span className="text-white/40 cursor-pointer hover:text-white/60 transition-colors">Privacy Policy</span>
              </p>
            </motion.div>
          )}

          {/* ── SIGN IN ────────────────────────── */}
          {step === 'password' && (
            <motion.div key="password" custom={dir} variants={slideVariants}
              initial="enter" animate="center" exit="exit"
              transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center"
            >
              <Logo />
              <h1 className="text-white text-[22px] font-semibold tracking-tight mb-1">Welcome back</h1>
              <p className="text-white/35 text-[13px] mb-8 font-mono">{email}</p>

              <form onSubmit={handleSignIn} className="w-full space-y-3">
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} value={password}
                    onChange={e => setPassword(e.target.value)}
                    required placeholder="Password" minLength={6}
                    className={cn(inputCls, 'pr-11')} autoFocus />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/55 transition-colors">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {error && <p className="text-[12px] text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">{error}</p>}

                <LiquidMetalButton
                  label={isSubmitting ? 'Signing in…' : 'Sign in'}
                  fullWidth
                  onClick={() => handleSignIn({ preventDefault: () => {} } as React.FormEvent)}
                />

                <div className="flex items-center justify-between pt-0.5">
                  <button type="button" onClick={() => goTo('entry', -1)}
                    className="flex items-center gap-0.5 text-[12px] text-white/25 hover:text-white/55 transition-colors">
                    <ChevronLeft size={13} /> Back
                  </button>
                  <div className="flex gap-3 text-[12px]">
                    <button type="button" onClick={() => goTo('signup', 1)}
                      className="text-white/35 hover:text-white/65 transition-colors">Create account</button>
                    <span className="text-white/15">·</span>
                    <button type="button" onClick={() => goTo('reset', 1)}
                      className="text-white/35 hover:text-white/65 transition-colors">Forgot password?</button>
                  </div>
                </div>
              </form>
            </motion.div>
          )}

          {/* ── SIGN UP ────────────────────────── */}
          {step === 'signup' && (
            <motion.div key="signup" custom={dir} variants={slideVariants}
              initial="enter" animate="center" exit="exit"
              transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center"
            >
              <Logo />
              <h1 className="text-white text-[22px] font-semibold tracking-tight mb-1">Create your account</h1>
              <p className="text-white/35 text-[13px] mb-8 font-mono">{email}</p>

              <form onSubmit={handleSignUp} className="w-full space-y-3">
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  required placeholder="Your full name" className={inputCls} autoFocus />

                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} value={password}
                    onChange={e => setPassword(e.target.value)}
                    required placeholder="Choose a password" minLength={6}
                    className={cn(inputCls, 'pr-11')} />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/55 transition-colors">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {password.length > 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-1.5">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className={cn('h-[3px] flex-1 rounded-full transition-all duration-300',
                          i <= strength.score ? strength.color : 'bg-white/[0.08]')} />
                      ))}
                    </div>
                    {strength.label && <p className="text-[11px] text-white/30">{strength.label} password</p>}
                  </motion.div>
                )}

                {error && <p className="text-[12px] text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">{error}</p>}

                <LiquidMetalButton
                  label={isSubmitting ? 'Creating account…' : 'Create account'}
                  fullWidth
                  onClick={() => handleSignUp({ preventDefault: () => {} } as React.FormEvent)}
                />

                <button type="button" onClick={() => goTo('entry', -1)}
                  className="w-full flex items-center justify-center gap-0.5 text-[12px] text-white/25 hover:text-white/55 transition-colors pt-0.5">
                  <ChevronLeft size={13} /> Back
                </button>
              </form>

              <p className="text-center text-[11px] text-white/20 mt-8 leading-relaxed">
                By continuing you agree to our{' '}
                <span className="text-white/40 cursor-pointer hover:text-white/60 transition-colors">Terms</span>
                {' '}·{' '}
                <span className="text-white/40 cursor-pointer hover:text-white/60 transition-colors">Privacy Policy</span>
              </p>
            </motion.div>
          )}

          {/* ── RESET PASSWORD ─────────────────── */}
          {step === 'reset' && (
            <motion.div key="reset" custom={dir} variants={slideVariants}
              initial="enter" animate="center" exit="exit"
              transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center"
            >
              <Logo />
              <h1 className="text-white text-[22px] font-semibold tracking-tight mb-1">Reset your password</h1>
              <p className="text-white/40 text-[14px] mb-8">We&apos;ll send a reset link to your inbox.</p>

              <form onSubmit={handleReset} className="w-full space-y-3">
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  required placeholder="you@example.com" className={inputCls} autoFocus />
                {error && <p className="text-[12px] text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">{error}</p>}
                <LiquidMetalButton
                  label={isSubmitting ? 'Sending…' : 'Send Reset Link'}
                  fullWidth
                  onClick={() => handleReset({ preventDefault: () => {} } as React.FormEvent)}
                />
                <button type="button" onClick={() => goTo('password', -1)}
                  className="w-full flex items-center justify-center gap-0.5 text-[12px] text-white/25 hover:text-white/55 transition-colors pt-0.5">
                  <ChevronLeft size={13} /> Back
                </button>
              </form>
            </motion.div>
          )}

          {/* ── RESET SENT ─────────────────────── */}
          {step === 'reset-sent' && (
            <motion.div key="reset-sent" custom={dir} variants={slideVariants}
              initial="enter" animate="center" exit="exit"
              transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center text-center"
            >
              <div className="mb-6 p-4 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle size={34} className="text-emerald-400" />
              </div>
              <h1 className="text-white text-[22px] font-semibold tracking-tight mb-2">Check your inbox</h1>
              <p className="text-white/40 text-[14px] mb-8 max-w-[280px] leading-relaxed">
                We sent a reset link to <span className="text-white/65">{email}</span>.
              </p>
              <button onClick={() => goTo('entry', -1)}
                className="text-[13px] text-white/35 hover:text-white/65 transition-colors flex items-center gap-1">
                <ChevronLeft size={13} /> Back to sign in
              </button>
            </motion.div>
          )}

          {/* ── VERIFY EMAIL ───────────────────── */}
          {step === 'verify' && (
            <motion.div key="verify" custom={dir} variants={slideVariants}
              initial="enter" animate="center" exit="exit"
              transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center text-center"
            >
              <div className="mb-6 p-4 rounded-full bg-white/[0.06] border border-white/[0.10]">
                <MailCheck size={34} className="text-white/60" />
              </div>
              <h1 className="text-white text-[22px] font-semibold tracking-tight mb-2">Verify your email</h1>
              <p className="text-white/40 text-[14px] mb-8 max-w-[300px] leading-relaxed">
                We sent a verification link to <span className="text-white/65">{verifyEmail || email}</span>. Click the link to activate your account.
              </p>
              <div className="w-full space-y-2.5">
                <LiquidMetalButton
                  label="Continue to onboarding"
                  fullWidth
                  onClick={() => router.push('/onboarding')}
                />
                <button
                  onClick={async () => { try { await sendVerification(); setVerifyResent(true) } catch { /* ignore */ } }}
                  disabled={verifyResent}
                  className="w-full py-3 rounded-xl border border-white/[0.10] bg-white/[0.04]
                    text-white/40 text-[14px] hover:bg-white/[0.08] hover:text-white/60 transition-all disabled:opacity-40">
                  {verifyResent ? '✓ Sent again' : 'Resend verification email'}
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
        </div>
      </div>

      {/* ── Right scrolling columns ── */}
      <div className="hidden lg:flex items-stretch w-[20%] shrink-0 overflow-hidden gap-2 px-2 py-2">
        <VerticalScrollColumn images={RIGHT_IMAGES} direction="down" />
        <VerticalScrollColumn images={RIGHT_IMAGES.slice().reverse()} direction="up" />
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
