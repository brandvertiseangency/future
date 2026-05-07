'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Sparkles, CalendarDays, ArrowUpRight, Target, Megaphone, Lightbulb, MessagesSquare } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { getFirebaseAuth } from '@/lib/firebase'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface Message {
  role: 'user' | 'assistant'
  content: string
  id: string
  reasoning?: string
  sources?: Array<{ title: string; url: string }>
}

type QuickAction = {
  label: string
  icon: React.ReactNode
  action: 'fill' | 'calendar' | 'generate'
  value?: string
}

type BrandChatBrand = { name?: string | null } | null | undefined

const QUICK_ACTIONS: QuickAction[] = [
  {
    label: 'Brand strategy',
    icon: <Target className="h-3.5 w-3.5" />,
    action: 'fill',
    value:
      'Given our full brand context, suggest 3 strategic priorities for the next quarter and how content should support each.',
  },
  {
    label: 'Campaign plan',
    icon: <Megaphone className="h-3.5 w-3.5" />,
    action: 'fill',
    value:
      'Outline a simple campaign structure (objective, audience, key messages, channels, 2-week timeline) for our next push.',
  },
  {
    label: 'Content ideas',
    icon: <Lightbulb className="h-3.5 w-3.5" />,
    action: 'fill',
    value: 'Give me 5 scroll-stopping post ideas for this week with a one-line hook each.',
  },
  {
    label: 'Brainstorm',
    icon: <MessagesSquare className="h-3.5 w-3.5" />,
    action: 'fill',
    value: 'Brainstorm angles and taglines for our core offer; keep options short and distinctive.',
  },
  {
    label: 'Calendar',
    icon: <CalendarDays className="h-3.5 w-3.5" />,
    action: 'calendar',
    value: 'Plan my content calendar for the next month based on our goals and audience.',
  },
]

async function getToken(): Promise<string | null> {
  try {
    const auth = getFirebaseAuth()
    return (await auth?.currentUser?.getIdToken()) ?? null
  } catch {
    return null
  }
}

export function BrandChat({ brand }: { brand: BrandChatBrand }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [model, setModel] = useState('brand-ai')
  const [webSearch, setWebSearch] = useState(false)
  const router = useRouter()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const API_BASE =
    process.env.NEXT_PUBLIC_API_URL ??
    (typeof window !== 'undefined' && window.location.hostname !== 'localhost' ? '' : 'http://localhost:4000')

  useEffect(() => {
    if (!textareaRef.current) return
    textareaRef.current.style.height = 'auto'
    textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px'
  }, [input])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const prefill = sessionStorage.getItem('bv_chat_prefill')
    if (prefill) {
      setInput(prefill)
      sessionStorage.removeItem('bv_chat_prefill')
    }
  }, [])

  const sendMessage = async () => {
    if (!input.trim() || loading) return
    if (/calendar|content plan|schedule|next month|posts for/i.test(input)) {
      router.push('/calendar/generate?brief=' + encodeURIComponent(input))
      return
    }
    const userMsg: Message = { role: 'user', content: input, id: Date.now().toString() }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)
    try {
      const token = await getToken()
      const history = [...messages, userMsg].map((m) => ({ role: m.role, content: m.content }))
      const res = await fetch(`${API_BASE}/api/chat/brand`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ messages: history, model, webSearch }),
      })
      const data = await res.json()
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.response ?? "I couldn't connect right now. Please try again.",
          reasoning: typeof data.reasoning === 'string' ? data.reasoning : undefined,
          sources: Array.isArray(data.sources) ? data.sources : undefined,
          id: Date.now().toString(),
        },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: "Couldn't connect. Please try again.", id: Date.now().toString() },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void sendMessage()
    }
  }

  const runQuickAction = (qa: QuickAction) => {
    if (qa.action === 'calendar') {
      const q = qa.value ?? ''
      router.push('/calendar/generate' + (q ? `?brief=${encodeURIComponent(q)}` : ''))
      return
    }
    if (qa.action === 'generate') {
      const q = qa.value ?? ''
      router.push('/generate' + (q ? `?brief=${encodeURIComponent(q)}` : ''))
      return
    }
    if (qa.value) {
      setInput(qa.value)
      setTimeout(() => textareaRef.current?.focus(), 50)
    }
  }

  const brandName = brand?.name ?? 'your brand'

  return (
    <div className="relative mx-auto w-full max-w-3xl overflow-hidden rounded-2xl border border-border shadow-[0_1px_3px_rgba(25,25,25,0.06)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.35)]">
      <div className="bv-chat-surface-grid relative rounded-2xl">
        <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-b from-primary/[0.04] to-transparent" aria-hidden />

        <div className="relative border-b border-border px-5 py-4 md:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-col items-center text-center sm:block sm:text-left">
              <div
                className="bv-gradient-border mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-card sm:mb-2"
                aria-hidden
              >
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <p className="font-display text-lg font-medium tracking-tight text-foreground md:text-xl">
                Hey! I&apos;m your <span className="text-primary">Brand AI</span>
              </p>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                Strategy, campaigns, captions, and ideas — everything I know comes from your onboarding and brand profile.
                For images, use{' '}
                <button
                  type="button"
                  onClick={() => router.push('/generate')}
                  className="font-medium text-primary underline-offset-2 hover:underline"
                >
                  Quick generate
                </button>{' '}
                or the content calendar.
              </p>
            </div>
            <div className="flex flex-col gap-2 self-center sm:self-start">
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Model</span>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="h-8 rounded-md border border-border bg-card px-2 text-xs text-foreground"
                >
                  <option value="brand-ai">Brand AI</option>
                  <option value="strategy">Strategy</option>
                  <option value="creative">Creative</option>
                </select>
              </label>
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={webSearch}
                  onChange={(e) => setWebSearch(e.target.checked)}
                />
                Web search
              </label>
              <Button
                variant="outline"
                size="sm"
                className="shrink-0 gap-1.5"
                onClick={() => router.push('/calendar/generate')}
              >
                <CalendarDays className="h-3.5 w-3.5" />
                Calendar
                <ArrowUpRight className="h-3 w-3 opacity-60" />
              </Button>
            </div>
          </div>
        </div>

        {messages.length > 0 && (
          <div className="scrollbar-hide relative max-h-72 overflow-y-auto px-4 py-4 md:px-6">
            <div className="flex flex-col gap-3">
              {messages.map((msg) => (
                <div key={msg.id} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                  <div
                    className={cn(
                      'max-w-[88%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed md:max-w-[84%]',
                      msg.role === 'user'
                        ? 'rounded-br-md bg-primary text-primary-foreground'
                        : 'rounded-bl-md border border-border bg-muted/50 text-foreground',
                    )}
                  >
                    {msg.content}
                    {msg.reasoning ? (
                      <div className="mt-2 rounded-md border border-border/60 bg-card/70 p-2 text-[11px] text-muted-foreground">
                        <p className="mb-1 font-medium text-foreground">Reasoning</p>
                        {msg.reasoning}
                      </div>
                    ) : null}
                    {msg.sources?.length ? (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {msg.sources.map((source, idx) => (
                          <a
                            key={`${msg.id}-source-${idx}`}
                            href={source.url}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-full border border-border px-2 py-1 text-[10px] text-primary hover:bg-primary/10"
                          >
                            {source.title || `Source ${idx + 1}`}
                          </a>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bv-chat-dot-loader flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-border bg-muted/50 px-3.5 py-3">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}

        {messages.length === 0 && (
          <div className="relative flex flex-wrap justify-center gap-2 px-4 pb-2 pt-2 md:px-6">
            {QUICK_ACTIONS.map((qa) => (
              <button
                key={qa.label}
                type="button"
                onClick={() => runQuickAction(qa)}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/80 px-3 py-2 text-left text-[11.5px] font-medium text-muted-foreground shadow-sm transition-colors hover:border-primary/30 hover:bg-accent/50 hover:text-foreground"
              >
                {qa.icon}
                {qa.label}
              </button>
            ))}
          </div>
        )}

        <div className="relative border-t border-border px-4 pb-2 pt-3 md:px-6">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              messages.length === 0 ? `Ask anything about ${brandName}…` : 'Continue the conversation…'
            }
            rows={1}
            className="w-full resize-none border-0 bg-transparent py-1 text-sm leading-relaxed text-foreground outline-none placeholder:text-muted-foreground md:text-[15px]"
            style={{ minHeight: 44 }}
          />
        </div>

        <div className="relative flex items-center justify-between gap-3 px-4 pb-4 md:px-6">
          <p className="text-[10.5px] text-muted-foreground">Brand AI can make mistakes; verify important details.</p>
          <button
            type="button"
            onClick={() => void sendMessage()}
            disabled={!input.trim() || loading}
            className={cn(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all',
              input.trim()
                ? 'bg-primary text-primary-foreground hover:opacity-90'
                : 'cursor-not-allowed bg-muted text-muted-foreground',
            )}
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
