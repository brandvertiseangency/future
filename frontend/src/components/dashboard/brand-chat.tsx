'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Sparkles, Calendar, ArrowUpRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { getFirebaseAuth } from '@/lib/firebase'
import { cn } from '@/lib/utils'

interface Message {
  role: 'user' | 'assistant'
  content: string
  id: string
}

const QUICK_PROMPTS = [
  { label: 'Post ideas for this week', icon: '💡' },
  { label: 'Write a caption for Instagram', icon: '✍️' },
  { label: 'Plan next month\'s content', icon: '📅' },
]

async function getToken(): Promise<string | null> {
  try {
    const auth = getFirebaseAuth()
    return (await auth?.currentUser?.getIdToken()) ?? null
  } catch { return null }
}

export function BrandChat({ brand }: { brand: any }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? (typeof window !== 'undefined' && window.location.hostname !== 'localhost' ? '' : 'http://localhost:4000')

  useEffect(() => {
    if (!textareaRef.current) return
    textareaRef.current.style.height = 'auto'
    textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px'
  }, [input])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Pick up prefill from ideas grid
  useEffect(() => {
    if (typeof window === 'undefined') return
    const prefill = sessionStorage.getItem('bv_chat_prefill')
    if (prefill) { setInput(prefill); sessionStorage.removeItem('bv_chat_prefill') }
  }, [])

  const sendMessage = async () => {
    if (!input.trim() || loading) return
    if (/calendar|content plan|schedule|next month|posts for/i.test(input)) {
      router.push('/calendar/generate?brief=' + encodeURIComponent(input))
      return
    }
    const userMsg: Message = { role: 'user', content: input, id: Date.now().toString() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)
    try {
      const token = await getToken()
      const res = await fetch(`${API_BASE}/api/chat/brand`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })) }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response ?? "I couldn't connect right now. Please try again.",
        id: Date.now().toString(),
      }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "Couldn't connect. Please try again.", id: Date.now().toString() }])
    } finally { setLoading(false) }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  const brandName = brand?.name ?? 'your brand'

  return (
    <div className="bento-hero" style={{ padding: 1 }}>
    <div className="bento-hero-inner" style={{ background: '#0a0a0a' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-white/[0.07] border border-white/[0.12] flex items-center justify-center">
            <Sparkles size={12} className="text-white/70" />
          </div>
          <span className="text-[13px] font-semibold text-white/85">Brand AI</span>
          <span className="flex items-center gap-1.5 text-[10.5px] text-white/35 ml-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/70 animate-pulse-glow" />
            Ready
          </span>
        </div>
        <button
          onClick={() => router.push('/calendar/generate')}
          className="flex items-center gap-1.5 text-[11px] text-white/30 hover:text-white/60 transition-colors"
        >
          <Calendar size={11} />
          Generate calendar
          <ArrowUpRight size={10} />
        </button>
      </div>

      {/* Messages */}
      {messages.length > 0 && (
        <div className="max-h-72 overflow-y-auto px-4 py-4 flex flex-col gap-3 scrollbar-hide">
          {messages.map(msg => (
            <div key={msg.id} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
              <div className={cn(
                'max-w-[84%] px-3.5 py-2.5 text-[13px] leading-relaxed whitespace-pre-wrap',
                msg.role === 'user'
                  ? 'rounded-[14px_14px_4px_14px] text-black font-medium'
                  : 'rounded-[14px_14px_14px_4px] text-white/70 border border-white/[0.07] bg-white/[0.04]'
              )}
              style={msg.role === 'user' ? { background: 'linear-gradient(135deg, #ffffff 0%, #d8d8d8 100%)' } : undefined}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex">
              <div className="dot-loader flex gap-1 items-center px-3.5 py-2.5 bg-white/[0.04] rounded-[14px_14px_14px_4px] border border-white/[0.07]">
                <span /><span /><span />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Quick prompts — show only when no messages */}
      {messages.length === 0 && (
        <div className="flex gap-2 px-4 pt-4 pb-2 flex-wrap">
          {QUICK_PROMPTS.map(({ label, icon }) => (
            <button
              key={label}
              onClick={() => { setInput(label); setTimeout(() => textareaRef.current?.focus(), 50) }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/[0.09] bg-white/[0.04]
                         text-[11.5px] text-white/50 hover:text-white/80 hover:border-white/[0.18] hover:bg-white/[0.07] transition-all"
            >
              <span className="text-[13px]">{icon}</span>
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Input area */}
      <div className="px-4 pt-4 pb-2 border-t border-white/[0.04] mt-1">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            messages.length === 0
              ? `Ask anything about ${brandName}...`
              : 'Continue the conversation...'
          }
          rows={1}
          className="w-full bg-transparent border-none outline-none text-white/75 text-[14px] resize-none font-sans leading-relaxed placeholder:text-white/22"
          style={{ minHeight: 40 }}
        />
      </div>

      {/* Footer bar */}
      <div className="flex items-center justify-between px-3.5 pb-3.5">
        <p className="text-[10.5px] text-white/18">↵ Enter to send · Shift+Enter for newline</p>
        <button
          onClick={sendMessage}
          disabled={!input.trim() || loading}
          className={cn(
            'w-8 h-8 rounded-xl flex items-center justify-center transition-all',
            input.trim()
              ? 'bg-white text-black hover:opacity-90'
              : 'bg-white/[0.05] text-white/20 cursor-default'
          )}
        >
          <Send size={13} strokeWidth={2} />
        </button>
      </div>
    </div>
    </div>
  )
}
