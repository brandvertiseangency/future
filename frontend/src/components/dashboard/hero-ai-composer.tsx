'use client'

import Image from 'next/image'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import {
  IconAdjustmentsHorizontal,
  IconArrowUp,
  IconCalendarWeek,
  IconCirclePlus,
  IconClockHour4,
  IconPhoto,
  IconRobot,
  IconPaperclip,
  IconSparkles,
  IconPlus,
  IconTable,
  IconX,
} from '@tabler/icons-react'

interface AttachedFile {
  id: string
  name: string
  file: File
  preview?: string
}

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  reasoning?: string[]
  sources?: string[]
  isStreaming?: boolean
}

const ACTIONS = [
  { id: 'generate-post', icon: IconSparkles, label: 'Generate post' },
  { id: 'content-calendar', icon: IconCalendarWeek, label: 'Content calendar' },
  { id: 'review-outputs', icon: IconTable, label: 'Review outputs' },
  { id: 'schedule', icon: IconClockHour4, label: 'Schedule queue' },
]

export function HeroAiComposer({ showHeadline = false }: { showHeadline?: boolean }) {
  const [prompt, setPrompt] = useState('')
  const [isDragOver, setIsDragOver] = useState(false)
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const [isFullscreenChat, setIsFullscreenChat] = useState(false)
  const [chatLoading, setChatLoading] = useState(false)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  const [typedPlaceholder, setTypedPlaceholder] = useState('')

  const [settings, setSettings] = useState({
    prioritizeBrandVoice: true,
    includeCalendarContext: true,
    suggestBestPostingTimes: false,
  })

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

  const buildReasoningSummary = (input: string) => {
    const trimmed = input.trim()
    const action = settings.prioritizeBrandVoice
      ? 'Aligned the response with your saved brand voice before drafting.'
      : 'Focused on clear execution steps first, then copy refinements.'
    const context = settings.includeCalendarContext
      ? 'Used campaign sequencing so ideas can map into calendar slots.'
      : 'Kept the output prompt-centric without calendar assumptions.'
    const timing = settings.suggestBestPostingTimes
      ? 'Added timing guidance for when each post should be published.'
      : 'Skipped posting-time optimization to keep output concise.'
    return [
      `Parsed your objective: "${trimmed.slice(0, 90)}${trimmed.length > 90 ? '…' : ''}".`,
      action,
      context,
      timing,
    ]
  }

  const extractSources = (text: string) => {
    const linkRegex = /\bhttps?:\/\/[^\s)]+/g
    const links = text.match(linkRegex) ?? []
    return Array.from(new Set(links)).slice(0, 3)
  }

  const generateFileId = () => Math.random().toString(36).substring(7)
  const placeholderPrompts = useMemo(
    () => [
      'Ask Brand AI to create a landing page for my offer...',
      'Plan a 2-week Instagram + LinkedIn content sprint...',
      'Write 5 hooks for our next product launch campaign...',
      'Turn this feature into 3 high-performing post ideas...',
    ],
    [],
  )

  useEffect(() => {
    let mounted = true
    let typeTimer: ReturnType<typeof setTimeout> | null = null
    let rotateTimer: ReturnType<typeof setTimeout> | null = null
    const source = placeholderPrompts[placeholderIndex] ?? ''

    const typeNext = (idx: number) => {
      if (!mounted) return
      setTypedPlaceholder(source.slice(0, idx))
      if (idx < source.length) {
        typeTimer = setTimeout(() => typeNext(idx + 1), 26)
      } else {
        rotateTimer = setTimeout(() => {
          setPlaceholderIndex((prev) => (prev + 1) % placeholderPrompts.length)
        }, 1500)
      }
    }

    typeNext(1)

    return () => {
      mounted = false
      if (typeTimer) clearTimeout(typeTimer)
      if (rotateTimer) clearTimeout(rotateTimer)
    }
  }, [placeholderIndex, placeholderPrompts])

  const processFiles = (files: File[]) => {
    for (const file of files) {
      const fileId = generateFileId()
      const attachedFile: AttachedFile = { id: fileId, name: file.name, file }

      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = () => {
          setAttachedFiles((prev) =>
            prev.map((f) => (f.id === fileId ? { ...f, preview: reader.result as string } : f)),
          )
        }
        reader.readAsDataURL(file)
      }

      setAttachedFiles((prev) => [...prev, attachedFile])
    }
  }

  const submitPrompt = async () => {
    if (!prompt.trim()) return
    const text = prompt.trim()
    const userMessage: ChatMessage = { id: `${Date.now()}-u`, role: 'user', content: text }
    const assistantId = `${Date.now()}-a`
    const assistantPlaceholder: ChatMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      isStreaming: true,
      reasoning: buildReasoningSummary(text),
    }
    setChatMessages((prev) => [...prev, userMessage, assistantPlaceholder])
    setIsFullscreenChat(true)
    setChatLoading(true)
    setPrompt('')
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text,
          history: chatMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      })
      if (!res.ok || !res.body) {
        const fallback = 'I could not respond right now. Please try again.'
        setChatMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantId
              ? {
                  ...msg,
                  content: fallback,
                  sources: [],
                  isStreaming: false,
                }
              : msg,
          ),
        )
        return
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let aggregate = ''

      while (true) {
        const { value, done } = await reader.read()
        if (value) {
          aggregate += decoder.decode(value, { stream: !done })
          setChatMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantId
                ? {
                    ...msg,
                    content: aggregate,
                    sources: extractSources(aggregate),
                    isStreaming: true,
                  }
                : msg,
            ),
          )
        }
        if (done) break
        await sleep(1)
      }

      const flushed = decoder.decode()
      if (flushed) {
        aggregate += flushed
      }

      const finalText = aggregate.trim() || 'I could not respond right now. Please try again.'
      setChatMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantId
            ? {
                ...msg,
                content: finalText,
                sources: extractSources(finalText),
                isStreaming: false,
              }
            : msg,
        ),
      )
    } catch {
      setChatMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantId
            ? {
                ...msg,
                content: 'Connection issue. Please try again.',
                isStreaming: false,
              }
            : msg,
        ),
      )
    } finally {
      setChatLoading(false)
    }
  }

  const updateSetting = (key: keyof typeof settings, value: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
      <AnimatePresence>
        {isFullscreenChat ? (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/55 px-4 py-6 backdrop-blur-md md:px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <motion.div
              className="flex h-[78vh] w-full max-w-3xl flex-col overflow-hidden rounded-[24px] border border-border/60 bg-card/74 shadow-[0_28px_90px_rgba(8,16,52,0.32)] backdrop-blur-xl"
              initial={{ opacity: 0, y: 16, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.985 }}
              transition={{ duration: 0.24, ease: 'easeOut' }}
            >
              <div className="border-b border-border/55 px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">Chat</p>
                    <p className="text-xs text-muted-foreground">Ask for strategy, copy, calendar ideas, and execution plans.</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setIsFullscreenChat(false)}>
                    Close
                  </Button>
                </div>
              </div>
              <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {chatMessages.map((msg) => (
                <div key={msg.id} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                  <div
                    className={cn(
                      'max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-md'
                        : 'rounded-bl-md border border-border/70 bg-card/85 text-foreground backdrop-blur-sm',
                    )}
                  >
                    {msg.content || (msg.isStreaming ? 'Preparing response…' : '')}
                    {msg.role === 'assistant' && msg.isStreaming ? (
                      <span className="ml-1 inline-block h-4 w-2 animate-pulse rounded-sm bg-foreground/50 align-middle" />
                    ) : null}
                    {msg.role === 'assistant' && msg.reasoning?.length ? (
                      <details className="mt-3 rounded-lg border border-border/60 bg-muted/35 px-3 py-2">
                        <summary className="cursor-pointer text-xs font-medium text-muted-foreground">
                          Chain of thought (summary)
                        </summary>
                        <ul className="mt-2 space-y-1 text-xs text-foreground/85">
                          {msg.reasoning.map((item, idx) => (
                            <li key={`${msg.id}-r-${idx}`}>- {item}</li>
                          ))}
                        </ul>
                      </details>
                    ) : null}
                    {msg.role === 'assistant' && msg.sources?.length ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {msg.sources.map((source) => (
                          <a
                            key={`${msg.id}-${source}`}
                            href={source}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-md border border-border/70 bg-card px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground"
                          >
                            Source
                          </a>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
              {chatLoading ? (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Brand AI is thinking</span>
                  <span className="bv-chat-dot-loader inline-flex items-center gap-1">
                    <span />
                    <span />
                    <span />
                  </span>
                </div>
              ) : null}
            </div>
              <div className="border-t border-border/55 bg-card/74 p-3">
                <div className="rounded-[22px] border border-white/55 bg-card/92 p-2 shadow-[0_14px_36px_rgba(10,18,52,0.18)] backdrop-blur-md">
                  <div className="flex items-center gap-2">
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          void submitPrompt()
                        }
                      }}
                      placeholder={typedPlaceholder || 'Ask follow-up...'}
                      className="min-h-11 flex-1 resize-none rounded-2xl border border-border/60 bg-background/85 px-4 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground/90 focus:border-primary/45"
                    />
                    <Button
                      onClick={() => void submitPrompt()}
                      disabled={!prompt.trim() || chatLoading}
                      className="h-12 w-12 rounded-full bg-gradient-to-r from-[#70b0ff] via-[#5f92f6] to-[#7384d2] p-0 text-white shadow-[0_10px_24px_rgba(54,107,255,0.5)] hover:brightness-105"
                    >
                      <IconArrowUp size={17} />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {showHeadline ? (
        <div className="text-center">
          <h1 className="text-balance text-pretty font-heading font-semibold text-[29px] tracking-tighter text-white drop-shadow-[0_2px_14px_rgba(0,0,0,0.35)] sm:text-[32px] md:text-[46px]">
            Prompt. Refine. Ship.
          </h1>
          <h2 className="-my-1 text-balance pb-2 text-center text-base text-white/90 md:text-lg">
            Build real, working software just by describing it
          </h2>
        </div>
      ) : null}

      <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-col content-center">
        <form
          className="relative overflow-visible rounded-[26px] border border-white/45 bg-card/92 p-3 shadow-[0_28px_70px_rgba(5,12,52,0.28)] backdrop-blur-xl transition-colors duration-200"
          onDragLeave={(e) => {
            e.preventDefault()
            setIsDragOver(false)
          }}
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragOver(true)
          }}
          onDrop={(e) => {
            e.preventDefault()
            setIsDragOver(false)
            const files = Array.from(e.dataTransfer.files)
            if (files.length > 0) processFiles(files)
          }}
          onSubmit={(e) => {
            e.preventDefault()
            submitPrompt()
          }}
        >
          {attachedFiles.length > 0 ? (
            <div className="relative mb-2 flex w-fit items-center gap-2 overflow-hidden">
              {attachedFiles.map((file) => (
                <Badge
                  variant="outline"
                  className="group relative h-6 max-w-32 cursor-pointer overflow-hidden px-0 text-[13px] transition-colors hover:bg-accent"
                  key={file.id}
                >
                  <span className="flex h-full items-center gap-1.5 overflow-hidden pl-1 font-normal">
                    <div className="relative flex h-4 min-w-4 items-center justify-center">
                      {file.preview ? (
                        <Image
                          alt={file.name}
                          className="absolute inset-0 h-4 w-4 rounded border object-cover"
                          src={file.preview}
                          width={16}
                          height={16}
                        />
                      ) : (
                        <IconPaperclip className="opacity-60" size={12} />
                      )}
                    </div>
                    <span className="inline overflow-hidden truncate pr-1.5">{file.name}</span>
                  </span>
                  <button
                    className="absolute right-1 z-10 rounded-sm p-0.5 text-muted-foreground opacity-0 focus-visible:bg-accent focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-background group-hover:opacity-100"
                    onClick={() => setAttachedFiles((prev) => prev.filter((f) => f.id !== file.id))}
                    type="button"
                  >
                    <IconX size={12} />
                  </button>
                </Badge>
              ))}
            </div>
          ) : null}

          <textarea
            className="max-h-52 min-h-14 w-full resize-none rounded-2xl border border-border/65 bg-background/70 px-3 py-3 text-sm text-foreground outline-none ring-0 placeholder:text-muted-foreground/90 focus:border-primary/50"
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                void submitPrompt()
              }
            }}
            placeholder={typedPlaceholder || 'Ask Brand AI to create a landing page for my offer...'}
            value={prompt}
          />

          <div className="mt-2 flex items-center gap-1.5">
            <div className="flex items-end gap-1">
              <input
                className="sr-only"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || [])
                  processFiles(files)
                  if (fileInputRef.current) fileInputRef.current.value = ''
                }}
                ref={fileInputRef}
                type="file"
              />

              <DropdownMenu>
                <DropdownMenuTrigger
                  type="button"
                  className="ml-[-2px] inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-card/85 text-foreground transition hover:bg-accent"
                >
                  <IconPlus size={16} />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="max-w-xs rounded-2xl p-1.5">
                  <DropdownMenuGroup className="space-y-1">
                    <DropdownMenuItem className="rounded-md text-xs" onClick={() => fileInputRef.current?.click()}>
                      <div className="flex items-center gap-2">
                        <IconPaperclip className="text-muted-foreground" size={16} />
                        <span>Attach assets</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="rounded-md text-xs" onClick={() => router.push('/assets')}>
                      <div className="flex items-center gap-2">
                        <IconPhoto className="text-muted-foreground" size={16} />
                        <span>Open asset library</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="rounded-md text-xs" onClick={() => router.push('/calendar/generate')}>
                      <div className="flex items-center gap-2">
                        <IconCalendarWeek className="text-muted-foreground" size={16} />
                        <span>Generate calendar</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="rounded-md text-xs" onClick={() => router.push('/generate')}>
                      <div className="flex items-center gap-2">
                        <IconRobot className="text-muted-foreground" size={16} />
                        <span>Open generate studio</span>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger
                  type="button"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-card/85 text-foreground transition hover:bg-accent"
                >
                  <IconAdjustmentsHorizontal size={16} />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-52 rounded-2xl p-3">
                  <DropdownMenuGroup className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <IconSparkles className="text-muted-foreground" size={16} />
                        <Label className="text-xs">Prioritize brand voice</Label>
                      </div>
                      <Switch
                        checked={settings.prioritizeBrandVoice}
                        className="scale-75"
                        onCheckedChange={(v) => updateSetting('prioritizeBrandVoice', v)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <IconCalendarWeek className="text-muted-foreground" size={16} />
                        <Label className="text-xs">Use calendar context</Label>
                      </div>
                      <Switch
                        checked={settings.includeCalendarContext}
                        className="scale-75"
                        onCheckedChange={(v) => updateSetting('includeCalendarContext', v)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <IconClockHour4 className="text-muted-foreground" size={16} />
                        <Label className="text-xs">Suggest best post times</Label>
                      </div>
                      <Switch
                        checked={settings.suggestBestPostingTimes}
                        className="scale-75"
                        onCheckedChange={(v) => updateSetting('suggestBestPostingTimes', v)}
                      />
                    </div>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="ml-auto flex items-center gap-0.5 sm:gap-1">
              <Button
                className="h-11 w-11 rounded-full bg-gradient-to-r from-[#6da7ff] via-[#5b8df4] to-[#687ccf] p-0 text-white shadow-[0_8px_22px_rgba(45,98,255,0.45)] hover:brightness-105"
                disabled={!prompt.trim()}
                size="icon-sm"
                type="submit"
                variant="default"
              >
                <IconArrowUp size={16} />
              </Button>
            </div>
          </div>

          <div
            className={cn(
              'pointer-events-none absolute inset-0 z-20 flex items-center justify-center rounded-[inherit] border border-border border-dashed bg-muted text-sm text-foreground transition-opacity duration-200',
              isDragOver ? 'opacity-100' : 'opacity-0',
            )}
          >
            <span className="flex w-full items-center justify-center gap-1 font-medium">
              <IconCirclePlus className="min-w-4" size={16} />
              Drop files here to add as attachments
            </span>
          </div>
        </form>
      </div>

      <div className="mx-auto flex min-h-0 max-w-[980px] shrink-0 flex-wrap items-center justify-center gap-3">
        {ACTIONS.map((action) => (
          <Button
            className="gap-2 rounded-full border border-border/70 bg-card/88 shadow-sm hover:bg-card"
            key={action.id}
            size="sm"
            variant="outline"
            onClick={() => {
              if (action.id === 'generate-post') router.push('/generate')
              if (action.id === 'content-calendar') router.push('/calendar/generate')
              if (action.id === 'review-outputs') router.push('/outputs')
              if (action.id === 'schedule') router.push('/scheduler')
            }}
          >
            <action.icon size={16} />
            {action.label}
          </Button>
        ))}
      </div>
    </div>
  )
}
