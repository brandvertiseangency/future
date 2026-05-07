import { streamText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { access, readFile } from 'node:fs/promises'
import path from 'node:path'

type ReqBody = {
  prompt?: string
  history?: Array<{ role: 'user' | 'assistant'; content: string }>
}

const CANDIDATE_KEYS = ['OPENAI_API_KEY', 'OPEN_API_KEY', 'OPENAI_KEY', 'NEXT_PUBLIC_OPENAI_API_KEY'] as const

async function readKeyFromEnvFiles(): Promise<string | null> {
  const cwd = process.cwd()
  const candidates = [
    path.join(cwd, '.env.local'),
    path.join(cwd, '.env'),
    path.join(cwd, 'frontend/.env.local'),
    path.join(cwd, 'frontend/.env'),
    path.join(cwd, '../.env.local'),
    path.join(cwd, '../.env'),
  ]

  for (const filePath of candidates) {
    try {
      await access(filePath)
      const raw = await readFile(filePath, 'utf8')
      for (const key of CANDIDATE_KEYS) {
        const m = raw.match(new RegExp(`^\\s*${key}\\s*=\\s*(.+)\\s*$`, 'm'))
        if (!m?.[1]) continue
        const v = m[1].trim().replace(/^['"]|['"]$/g, '')
        if (v) return v
      }
    } catch {
      // Ignore missing/unreadable files.
    }
  }

  return null
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ReqBody
    const prompt = (body.prompt ?? '').trim()
    const history = Array.isArray(body.history) ? body.history : []

    if (!prompt) {
      return new Response('Prompt is required', { status: 400 })
    }

    const envApiKey =
      process.env.OPENAI_API_KEY ??
      process.env.OPEN_API_KEY ??
      process.env.OPENAI_KEY ??
      process.env.NEXT_PUBLIC_OPENAI_API_KEY
    const apiKey = envApiKey || (await readKeyFromEnvFiles())

    if (!apiKey) {
      return new Response(
        "I'm ready to help, but OpenAI isn't configured yet. Add OPENAI_API_KEY (or OPEN_API_KEY) to frontend/.env.local, then restart the frontend dev server.",
      )
    }

    const msgs = history
      .filter((m) => m?.content?.trim())
      .slice(-10)
      .map((m) => `${m.role === 'assistant' ? 'Assistant' : 'User'}: ${m.content.trim()}`)
      .join('\n')

    const fullPrompt = msgs ? `${msgs}\nUser: ${prompt}` : prompt

    const provider = createOpenAI({ apiKey })
    const result = streamText({
      model: provider('gpt-4o-mini'),
      system:
        'You are Brandvertise AI. Give practical, concise marketing help focused on social content strategy, calendar planning, captions, and execution.',
      prompt: fullPrompt,
    })

    return result.toTextStreamResponse()
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Chat failed'
    const lowered = message.toLowerCase()
    if (lowered.includes('quota') || lowered.includes('billing') || lowered.includes('insufficient_quota')) {
      return new Response(
        "OpenAI is connected but quota/billing is currently unavailable. You can keep designing UI while this is resolved. For now, try: 'Create 3 campaign hooks + CTA + ideal platform'.",
      )
    }

    return new Response(
      "I couldn't reach the AI service right now. Please retry in a few seconds, or continue drafting your prompt and generate from studio.",
    )
  }
}
