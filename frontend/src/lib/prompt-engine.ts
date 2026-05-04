// lib/prompt-engine.ts
// Converts brand DNA into optimized AI system + user prompts

export interface BrandDNA {
  name: string
  description: string
  industry: string
  tone: number           // 0-100: 0=Casual, 100=Professional
  styles: string[]       // ['Bold', 'Minimal', 'Witty'] etc.
  audience_age_min: number
  audience_age_max: number
  audience_gender: string // 'mixed' | 'mostly_male' | 'mostly_female'
  audience_location?: string
  audience_interests?: string[]
  platforms: string[]
  goals: string[]        // ['growth', 'revenue', 'engagement']
}

export interface GenerationRequest {
  platform: string
  contentType: string    // 'post' | 'carousel' | 'reel' | 'story'
  brief: string
  mood?: string
  imageRatio?: string
  referenceImageBase64?: string
}

export function buildSystemPrompt(brand: BrandDNA): string {
  const toneDescriptor = getToneDescriptor(brand.tone)
  const audienceDesc = buildAudienceDescription(brand)
  const goalInstruction = getGoalInstruction(brand.goals)

  return `You are the AI content engine for ${brand.name}, a ${brand.industry} brand.

BRAND IDENTITY:
${brand.description}

VOICE & TONE:
- Tone level: ${brand.tone}/100 (${toneDescriptor})
- Style attributes: ${brand.styles.join(', ')}
- ${getToneInstructions(brand.tone, brand.styles)}

TARGET AUDIENCE:
${audienceDesc}

CONTENT GOALS:
${goalInstruction}

OUTPUT REQUIREMENTS:
- Always respond with valid JSON only — no markdown, no explanation
- JSON format: { "caption": "string", "hashtags": ["string"], "imagePrompt": "string", "carouselSlides": [{ "headline": "string", "body": "string" }] | null }
- caption: The full post caption. Include emojis where appropriate for the tone. No hashtags in caption.
- hashtags: 5-10 relevant hashtags without the # symbol. Mix popular and niche.
- imagePrompt: A detailed prompt for image generation. Describe composition, lighting, mood, style. Never include text in the image prompt unless text overlay is requested.
- imagePrompt must match the TARGET AUDIENCE (setting, age-appropriate styling, platform-native vibe) — never generic unrelated scenes.
- imagePrompt should read like a creative brief for a real photoshoot: lens feel (e.g. 35mm / 85mm), lighting setup, art direction. Avoid "stock photo of happy people" clichés and hyper-polished AI-HDR looks.
- carouselSlides: Only populate if contentType is 'carousel'. 4-6 slides with headline + body each.`
}

export function buildUserPrompt(request: GenerationRequest, brand: BrandDNA): string {
  const platformSpecific = getPlatformSpecificInstructions(request.platform, request.contentType)

  return `Create a ${request.contentType} for ${request.platform}.

BRIEF: ${request.brief}
${request.mood ? `MOOD: ${request.mood}` : ''}
${request.imageRatio ? `IMAGE FORMAT: ${request.imageRatio}` : ''}

${platformSpecific}

CRITICAL RULES:
- Caption length: ${getCaptionLength(request.platform)}
- Hashtag style: ${getHashtagStyle(request.platform)}
- CTA: ${getCTA(brand.goals, request.platform)}
- Never start the caption with the brand name
- The first line must hook the reader immediately — no preamble
- Make it feel like a real human wrote it for this specific brand
- imagePrompt: tie visual story to audience (${buildAudienceDescription(brand)}) and brand styles (${brand.styles.join(', ') || 'on-brand'}); explicit negatives: no watermark, no UI mockups, no extra random text in frame`
}

export function getToneDescriptor(tone: number): string {
  if (tone < 20) return 'Very casual — like texting a friend'
  if (tone < 40) return 'Conversational — warm and approachable'
  if (tone < 60) return 'Balanced — friendly but credible'
  if (tone < 80) return 'Professional — authoritative but accessible'
  return 'Very professional — formal, precise, corporate'
}

function getToneInstructions(tone: number, styles: string[]): string {
  const instructions: string[] = []

  if (tone < 40) {
    instructions.push('Use contractions, short sentences, casual language')
    instructions.push('Emojis are welcome and expected')
  } else if (tone > 70) {
    instructions.push('Avoid slang, use complete sentences')
    instructions.push('Minimal emojis — only where genuinely appropriate')
  }

  if (styles.includes('Witty')) instructions.push('Incorporate wordplay or a clever twist')
  if (styles.includes('Bold')) instructions.push('Make strong, confident statements. No hedging.')
  if (styles.includes('Luxury')) instructions.push('Aspirational language. Exclusivity, quality, experience.')
  if (styles.includes('Educational')) instructions.push('Teach something. Include a takeaway or statistic.')
  if (styles.includes('Inspirational')) instructions.push('Uplift the reader. End on an emotionally resonant note.')
  if (styles.includes('Minimal')) instructions.push('Fewer words, more impact. Every word earns its place.')
  if (styles.includes('Playful')) instructions.push('Light-hearted, fun energy. Use questions and exclamations.')
  if (styles.includes('Authoritative')) instructions.push('Lead with expertise. Cite data or strong opinions.')

  return instructions.join('. ')
}

function getPlatformSpecificInstructions(platform: string, contentType: string): string {
  const guides: Record<string, string> = {
    instagram: `Instagram caption best practices:
- Lead with the most important information (first 125 chars visible before "more")
- Line breaks for readability (use \\n\\n between paragraphs)
- Story-driven or aspirational tone performs best
- Strong visual description in imagePrompt — composition matters`,

    linkedin: `LinkedIn post best practices:
- Open with a bold statement or controversial opinion (drives comments)
- Use single-line paragraphs with space between each (LinkedIn formatting)
- Professional insights, industry perspective, or personal story
- End with a question to drive engagement
- imagePrompt: professional setting, clean, corporate-adjacent`,

    twitter: `Twitter/X post best practices:
- Maximum 280 characters for the main hook (though caption can be longer for thread-style)
- Punchy, opinionated, or surprising opening
- Hashtags minimal (1-2 max)
- imagePrompt: eye-catching, bold, high contrast`,

    tiktok: `TikTok caption best practices:
- Short hook in caption (TikTok is video-first, caption is secondary)
- Caption supports the video concept described in brief
- Trending sounds/formats can be referenced
- imagePrompt: dynamic, energetic, bold composition for thumbnail`,

    facebook: `Facebook post best practices:
- Longer-form content is accepted and performs well
- Community feel — speak to "our audience" not "consumers"
- Questions and polls work well
- imagePrompt: relatable, lifestyle-oriented`,

    threads: `Threads post best practices:
- Conversational, intimate tone
- Shorter is better
- Hot takes and personal opinions perform well`,

    youtube: `YouTube description/thumbnail best practices:
- Caption used as video description — informative with timestamps
- imagePrompt: thumbnail-style — large text, high contrast face/subject, clear CTA element`,

    pinterest: `Pinterest caption best practices:
- Searchable keywords naturally integrated
- Instructional or inspirational framing
- imagePrompt: vertical (2:3), beautiful, editorial, high production value`,
  }

  return guides[platform.toLowerCase()] || `Create engaging ${contentType} content optimized for ${platform}.`
}

function getCaptionLength(platform: string): string {
  const lengths: Record<string, string> = {
    instagram: '150-300 characters for feed posts (exclude hashtags)',
    linkedin: '150-500 characters — thought leadership pieces can go longer',
    twitter: '200-260 characters (leave room for hashtags)',
    tiktok: '50-150 characters',
    facebook: '40-400 characters',
    threads: '50-200 characters',
    youtube: '200-500 characters for description',
    pinterest: '100-300 characters',
  }
  return lengths[platform.toLowerCase()] || '150-300 characters'
}

function getHashtagStyle(platform: string): string {
  if (platform === 'linkedin') return 'Maximum 3-5 professional hashtags placed at the end'
  if (platform === 'twitter') return 'Maximum 2 hashtags, integrated naturally or at end'
  if (platform === 'instagram') return '8-10 hashtags — mix of high-volume and niche'
  return '5-8 relevant hashtags'
}

function getCTA(goals: string[], _platform: string): string {
  if (goals.includes('revenue')) return 'Drive to purchase or lead — "Shop now", "Book a call", "Learn more"'
  if (goals.includes('growth')) return 'Drive follows or shares — "Follow for more", "Share this with someone who needs it"'
  if (goals.includes('engagement')) return 'Drive comments — ask a question, request an opinion'
  return 'End with a clear next step for the reader'
}

function buildAudienceDescription(brand: BrandDNA): string {
  const genderMap: Record<string, string> = { mixed: 'all genders', mostly_male: 'predominantly male', mostly_female: 'predominantly female' }
  return `Age: ${brand.audience_age_min}–${brand.audience_age_max}
Gender: ${genderMap[brand.audience_gender] || 'all genders'}
Location: ${brand.audience_location || 'global'}
Interests: ${(brand.audience_interests || []).join(', ') || 'general'}
Speak directly to their mindset and daily life.`
}

function getGoalInstruction(goals: string[]): string {
  const goalMap: Record<string, string> = {
    growth: 'Prioritize shareable content that earns organic reach',
    revenue: 'Every post should move the reader toward a purchase or conversion',
    engagement: 'Optimize for comments and saves over reach',
    awareness: 'Focus on memorable, distinctive brand moments',
  }
  return goals.map((g) => goalMap[g] || g).join('. ')
}

export function getToneTemperature(tone: number): number {
  // Casual (0) = more creative = 0.9, Professional (100) = more controlled = 0.5
  return 0.9 - (tone / 100) * 0.4
}

export function imageRatioToAspect(ratio: string): string {
  const map: Record<string, string> = { '1:1': '1:1', '4:5': '4:5', '9:16': '9:16', '16:9': '16:9' }
  return map[ratio] || '1:1'
}

// ─── AGENT PROMPT ENGINE ───────────────────────────────────────────────────

export interface AgentBrandContext {
  name: string
  description?: string
  industry?: string
  voice?: string
  goals?: string[]
  audience?: Record<string, unknown>
  designPrefs?: Record<string, unknown>
}

function getAgentToneLabel(voice?: string): string {
  if (!voice) return 'professional and approachable'
  const map: Record<string, string> = {
    bold: 'bold and confident',
    minimal: 'clean and minimal',
    luxury: 'premium and aspirational',
    playful: 'fun and energetic',
    professional: 'formal and authoritative',
    conversational: 'warm and conversational',
  }
  return map[voice.toLowerCase()] || voice
}

export function buildWebsitePrompt(brand: AgentBrandContext): string {
  const tone = getAgentToneLabel(brand.voice)
  const industry = brand.industry || 'technology'
  const audience = brand.audience
    ? `${(brand.audience.age_min as number) ?? 25}–${(brand.audience.age_max as number) ?? 44} year olds in ${(brand.audience.location as string) ?? 'global markets'}`
    : 'a broad professional audience'
  const goals = (brand.goals || ['awareness', 'growth']).join(', ')

  return `You are a world-class web strategist and copywriter. Build a complete landing page structure for the following brand:

BRAND: ${brand.name}
INDUSTRY: ${industry}
DESCRIPTION: ${brand.description || 'A modern brand focused on delivering exceptional value'}
TONE: ${tone}
TARGET AUDIENCE: ${audience}
GOALS: ${goals}

Generate a complete landing page architecture with the following sections. For each section provide:
- Section name
- Headline copy
- Subheadline / supporting copy
- Key elements / components to include
- Design direction

REQUIRED SECTIONS:
1. Hero — Above-the-fold. Make the value proposition crystal clear in under 8 words. Include CTA.
2. Problem / Pain Point — Why does the audience need this? Agitate the problem.
3. Solution / Features — 3–4 core feature cards with icons, headlines, and 2-line descriptions.
4. Social Proof — Testimonials, logos, or stats that build trust.
5. How It Works — 3-step process. Simple, scannable.
6. Pricing — Tiered pricing table (3 tiers recommended).
7. FAQ — 5 most common objections, answered concisely.
8. Final CTA — Urgency-driven close. Repeat the core value prop.

OUTPUT FORMAT: Structured JSON with each section as a key. Be specific with copy — write actual headlines, not placeholders.`
}

export function buildBrandingPrompt(brand: AgentBrandContext, format: 'poster' | 'banner' | 'visiting-card'): string {
  const tone = getAgentToneLabel(brand.voice)
  const industry = brand.industry || 'technology'

  const formatGuide: Record<string, string> = {
    poster: `ASSET TYPE: Marketing Poster (A3 / 18×24" print or digital)
LAYOUT: Single bold visual with headline, subheadline, brand mark, CTA
HIERARCHY: Headline (largest) → Visual → Subheadline → CTA → Logo
STYLE: High contrast, impactful, bold typography
OUTPUT: Provide headline copy, body copy, CTA text, color palette (hex codes), typography direction, and a detailed image generation prompt for the visual element.`,

    banner: `ASSET TYPE: Digital Banner Ad (Multiple sizes: 728×90, 300×250, 160×600, 1200×628)
LAYOUT: Brand mark + short headline + CTA button
HIERARCHY: Logo → Hook (5 words max) → CTA
STYLE: Clean, fast to read, brand-aligned
OUTPUT: For each banner size provide: headline, CTA copy, color palette, layout direction, and image prompt.`,

    'visiting-card': `ASSET TYPE: Business / Visiting Card (3.5×2" standard)
LAYOUT FRONT: Logo / brand mark, name, title — clean and premium
LAYOUT BACK: Contact details, optional QR / tagline
STYLE: Minimal, premium, memorable
OUTPUT: Provide front copy, back copy, color palette (hex), typography suggestion, finishing notes (matte/gloss/foil), and logo placement direction.`,
  }

  return `You are a senior brand designer and creative director. Create a complete branding asset brief for:

BRAND: ${brand.name}
INDUSTRY: ${industry}
DESCRIPTION: ${brand.description || 'A modern brand delivering exceptional experiences'}
TONE: ${tone}
DESIGN PREFERENCES: ${JSON.stringify(brand.designPrefs || { style: 'modern', colors: 'auto-generate' })}

${formatGuide[format]}

Ensure all copy and design direction is:
- Consistent with the brand voice (${tone})
- Suitable for the ${industry} industry
- Differentiated and memorable
- Ready to hand off to a designer or AI image tool

Be specific. Write actual copy, actual hex codes, actual font pairings. No generic placeholders.`
}

export function buildPresentationPrompt(brand: AgentBrandContext, type: 'company-profile' | 'pitch-deck'): string {
  const tone = getAgentToneLabel(brand.voice)
  const industry = brand.industry || 'technology'
  const audience = brand.audience
    ? `${(brand.audience.location as string) ?? 'global'} market`
    : 'investors and stakeholders'

  const typeGuide: Record<string, string> = {
    'company-profile': `PRESENTATION TYPE: Company Profile (10–14 slides)
PURPOSE: Introduce the company to potential partners, clients, or investors
AUDIENCE: B2B decision-makers, procurement teams, enterprise clients
REQUIRED SLIDES:
1. Cover — Brand name, tagline, logo, visual
2. Executive Summary — 3 bullet points: Who, What, Why
3. Our Story — Founding story, mission, vision
4. The Problem — Market gap or pain point addressed
5. Our Solution — Core product/service overview
6. Why Us — Competitive differentiators (3–4 points)
7. Products / Services — Key offerings with brief descriptions
8. Our Process — How you deliver value (3–5 steps)
9. Team — Key team members with roles and 1-line bios
10. Clients / Partners — Logos or case study highlights
11. Achievements / Milestones — Awards, metrics, traction
12. Contact — CTA, website, email, LinkedIn`,

    'pitch-deck': `PRESENTATION TYPE: Investor Pitch Deck (10–12 slides)
PURPOSE: Raise funding — seed to Series A
AUDIENCE: Venture capitalists, angel investors, accelerator panels
REQUIRED SLIDES:
1. Cover — Company name, tagline, contact
2. Problem — The pain. Make it visceral. Data-backed.
3. Solution — The "aha" moment. Clear and compelling.
4. Market Opportunity — TAM / SAM / SOM with sources
5. Product — Demo or product highlights. What makes it sticky?
6. Business Model — How you make money. Unit economics.
7. Traction — Key metrics, growth rate, notable customers
8. Go-to-Market — How you acquire customers at scale
9. Competition — Competitive landscape map or matrix
10. Team — Founders + key hires. Why you?
11. The Ask — Amount raising, use of funds (% breakdown)
12. Vision — Where are you in 5 years?`,
  }

  return `You are a world-class pitch consultant and presentation strategist. Create a complete ${type === 'pitch-deck' ? 'investor pitch deck' : 'company profile'} for:

COMPANY: ${brand.name}
INDUSTRY: ${industry}
DESCRIPTION: ${brand.description || 'An innovative company solving real-world problems'}
TONE: ${tone}
TARGET MARKET: ${audience}
GOALS: ${(brand.goals || ['growth', 'revenue']).join(', ')}

${typeGuide[type]}

For EACH slide provide:
- Slide title
- Headline copy (the main statement)
- Supporting copy (2–4 bullet points or paragraph)
- Suggested visual direction
- Speaker notes (2–3 sentences for the presenter)

Make the copy punchy, specific, and investor-ready. No corporate fluff. Every word must earn its place.
Tone throughout: ${tone}.`
}
