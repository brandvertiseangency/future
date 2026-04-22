'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Plus, Image, Sparkles, Calendar } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { getFirebaseAuth } from '@/lib/firebase'

interface Message {
  role: 'user' | 'assistant'
  content: string
  id: string
}

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

  // Auto-resize textarea
  useEffect(() => {
    if (!textareaRef.current) return
    textareaRef.current.style.height = 'auto'
    textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 140) + 'px'
  }, [input])

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    // Calendar intent → redirect
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
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
        }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response ?? "I couldn't connect right now. Please try again.",
        id: Date.now().toString(),
      }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Couldn't connect. Please try again.",
        id: Date.now().toString(),
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  const sendPrompt = (prompt: string) => {
    setInput(prompt)
    setTimeout(() => textareaRef.current?.focus(), 50)
  }

  const brandName = brand?.name ?? 'your brand'

  return (
    <div
      className="card-silver"
      style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 16 }}
    >
      {/* Tabs row */}
      <div style={{
        display: 'flex', gap: 2, padding: '10px 12px 0',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        {[
          { id: 'chat',     label: 'Brand AI',          icon: Sparkles },
          { id: 'calendar', label: 'Generate Calendar', icon: Calendar },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => id === 'calendar' ? router.push('/calendar/generate') : undefined}
            style={{
              padding: '6px 12px',
              fontSize: 11, fontWeight: 500,
              color: id === 'chat' ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.3)',
              background: id === 'chat' ? 'rgba(255,255,255,0.06)' : 'transparent',
              border: 'none', borderRadius: '8px 8px 0 0',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 5,
              letterSpacing: '0.01em',
              transition: 'color 0.15s',
            }}
          >
            <Icon size={11} strokeWidth={1.5} />
            {label}
          </button>
        ))}
      </div>

      {/* Messages */}
      {messages.length > 0 && (
        <div style={{
          maxHeight: 340, overflowY: 'auto',
          padding: '16px 16px 8px',
          display: 'flex', flexDirection: 'column', gap: 10,
        }}>
          {messages.map(msg => (
            <div key={msg.id} style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
            }}>
              <div style={{
                maxWidth: '82%',
                padding: '9px 13px',
                borderRadius: msg.role === 'user' ? '13px 13px 4px 13px' : '13px 13px 13px 4px',
                background: msg.role === 'user'
                  ? 'linear-gradient(135deg, #ffffff 0%, #d8d8d8 100%)'
                  : 'rgba(255,255,255,0.05)',
                border: msg.role === 'user' ? 'none' : '1px solid rgba(255,255,255,0.07)',
                color: msg.role === 'user' ? '#000' : 'rgba(255,255,255,0.75)',
                fontSize: 13, lineHeight: 1.55,
                whiteSpace: 'pre-wrap',
              }}>
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: 'flex', padding: '4px 4px' }}>
              <div
                className="dot-loader"
                style={{ display: 'flex', gap: 4, alignItems: 'center', padding: '8px 12px', background: 'rgba(255,255,255,0.04)', borderRadius: 10 }}
              >
                <span /><span /><span />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Input */}
      <div style={{ padding: '14px 16px 6px' }}>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            messages.length === 0
              ? `Ask anything about ${brandName} — post ideas, captions, strategy, competitor analysis...`
              : 'Continue the conversation...'
          }
          rows={1}
          style={{
            width: '100%', background: 'transparent', border: 'none', outline: 'none',
            color: 'rgba(255,255,255,0.8)', fontSize: 14, resize: 'none',
            fontFamily: 'inherit', lineHeight: 1.55, minHeight: 44,
          }}
        />
      </div>

      {/* Action row */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '4px 12px 14px',
      }}>
        <div style={{ display: 'flex', gap: 5 }}>
          {([
            { icon: Plus,     title: 'Add context' },
            { icon: Image,    title: 'Upload image' },
            { icon: Sparkles, title: 'Suggestions' },
          ] as const).map(({ icon: Icon, title }) => (
            <button
              key={title}
              title={title}
              style={{
                width: 30, height: 30, borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'none',
                color: 'rgba(255,255,255,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'border-color 0.15s, color 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.2)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.6)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.3)' }}
            >
              <Icon size={13} strokeWidth={1.5} />
            </button>
          ))}
        </div>

        {/* Send button */}
        <button
          onClick={sendMessage}
          disabled={!input.trim() || loading}
          className={input.trim() ? 'btn-silver' : ''}
          style={{
            width: 32, height: 32, borderRadius: 9,
            background: input.trim() ? undefined : 'rgba(255,255,255,0.06)',
            border: 'none',
            cursor: input.trim() ? 'pointer' : 'default',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.15s',
          }}
        >
          <Send size={13} strokeWidth={2} color={input.trim() ? '#000' : 'rgba(255,255,255,0.25)'} />
        </button>
      </div>

      {/* Platform connect bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '8px 14px',
        background: 'rgba(255,255,255,0.015)',
        borderTop: '1px solid rgba(255,255,255,0.04)',
        fontSize: 11, color: 'rgba(255,255,255,0.25)',
      }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.10)', 'rgba(255,255,255,0.08)'].map((bg, i) => (
            <div key={i} style={{ width: 16, height: 16, borderRadius: 4, background: bg, border: '1px solid rgba(255,255,255,0.1)' }} />
          ))}
        </div>
        <span>Connect your platforms to extend Brand AI</span>
      </div>
    </div>
  )
}
