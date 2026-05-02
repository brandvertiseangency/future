// src/lib/prompt-engine.js
// Backend equivalent of frontend/src/lib/prompt-engine.ts
// v2 — utilises full Brand Intelligence fields from onboarding overhaul

// ─── Tone helpers ──────────────────────────────────────────────────────────────

function getToneDescriptor(tone) {
  if (tone < 20) return 'Very casual — like texting a friend';
  if (tone < 40) return 'Conversational — warm and approachable';
  if (tone < 60) return 'Balanced — friendly but credible';
  if (tone < 80) return 'Professional — authoritative but accessible';
  return 'Very professional — formal, precise, corporate';
}

function getToneInstructions(tone, styles) {
  const instructions = [];
  if (tone < 40) {
    instructions.push('Use contractions, short sentences, casual language');
    instructions.push('Emojis are welcome and expected');
  } else if (tone > 70) {
    instructions.push('Avoid slang, use complete sentences');
    instructions.push('Minimal emojis — only where genuinely appropriate');
  }
  if (styles.includes('Witty')) instructions.push('Incorporate wordplay or a clever twist');
  if (styles.includes('Bold')) instructions.push('Make strong, confident statements. No hedging.');
  if (styles.includes('Luxury')) instructions.push('Aspirational language. Exclusivity, quality, experience.');
  if (styles.includes('Educational')) instructions.push('Teach something. Include a takeaway or statistic.');
  if (styles.includes('Inspirational')) instructions.push('Uplift the reader. End on an emotionally resonant note.');
  if (styles.includes('Minimal')) instructions.push('Fewer words, more impact. Every word earns its place.');
  if (styles.includes('Storytelling')) instructions.push('Open with a micro-story or personal anecdote.');
  if (styles.includes('Data-driven')) instructions.push('Anchor claims with numbers, stats, or research.');
  if (styles.includes('Conversational')) instructions.push('Write like you are talking to one person, not broadcasting.');
  return instructions.join('. ');
}

// ─── Audience helpers ──────────────────────────────────────────────────────────

function buildAudienceDescription(brand) {
  const genderMap = {
    mixed: 'all genders',
    mostly_male: 'predominantly male',
    mostly_female: 'predominantly female',
    'mostly-men': 'predominantly male',
    'mostly-women': 'predominantly female',
  };
  const lines = [
    `Age: ${brand.audienceAgeMin || brand.audience_age_min || 25}–${brand.audienceAgeMax || brand.audience_age_max || 44}`,
    `Gender: ${genderMap[brand.audienceGender || brand.audience_gender] || 'all genders'}`,
    `Location: ${brand.audienceLocation || brand.audience_location || 'global'}`,
    `Interests: ${(brand.audienceInterests || brand.audience_interests || []).join(', ') || 'general'}`,
  ];

  // v2: persona enrichment
  const persona = brand.persona || brand.target_persona;
  if (persona) lines.push(`Persona archetype: ${persona}`);

  const painPoints = brand.painPoints || brand.pain_points;
  if (painPoints && painPoints.length) lines.push(`Pain points: ${painPoints.join(', ')}`);

  const motivations = brand.motivations || brand.audience_motivations;
  if (motivations && motivations.length) lines.push(`Motivations: ${motivations.join(', ')}`);

  lines.push('Speak directly to their mindset and daily life.');
  return lines.join('\n');
}

// ─── Goal / CTA helpers ────────────────────────────────────────────────────────

function getGoalInstruction(goals) {
  const goalMap = {
    Growth: 'Prioritize shareable content that earns organic reach',
    Revenue: 'Every post should move the reader toward a purchase or conversion',
    Engagement: 'Optimize for comments and saves over reach',
    Awareness: 'Focus on memorable, distinctive brand moments',
    growth: 'Prioritize shareable content that earns organic reach',
    revenue: 'Every post should move the reader toward a purchase or conversion',
    engagement: 'Optimize for comments and saves over reach',
    awareness: 'Focus on memorable, distinctive brand moments',
    'Lead Generation': 'Drive enquiries, sign-ups, or DMs — every post has a soft ask',
    'Community Building': 'Foster belonging, conversation, and return visits',
    'Brand Authority': 'Establish expertise through insights, proof, and distinctive POV',
  };
  return (goals || []).map(g => goalMap[g] || g).join('. ');
}

function getCTA(goals, platform) {
  if ((goals || []).some(g => ['Revenue', 'revenue'].includes(g)))
    return 'Drive to purchase — "Shop now", "Book a call", "Learn more"';
  if ((goals || []).some(g => ['Growth', 'growth'].includes(g)))
    return 'Drive follows or shares — "Follow for more", "Share this"';
  if ((goals || []).some(g => ['Engagement', 'engagement'].includes(g)))
    return 'Drive comments — ask a question';
  if ((goals || []).some(g => g === 'Lead Generation'))
    return 'Soft CTA — "DM us", "Drop your email", "Click the link in bio"';
  return 'End with a clear next step for the reader';
}

// ─── Platform helpers ──────────────────────────────────────────────────────────

function getCaptionLength(platform) {
  const lengths = {
    instagram: '150-300 characters for feed posts (exclude hashtags)',
    linkedin: '150-500 characters — thought leadership pieces can go longer',
    twitter: '200-260 characters (leave room for hashtags)',
    tiktok: '50-150 characters',
    facebook: '40-400 characters',
    threads: '50-200 characters',
    youtube: '200-500 characters for description',
    pinterest: '100-300 characters',
  };
  return lengths[platform.toLowerCase()] || '150-300 characters';
}

function getHashtagStyle(platform) {
  if (platform === 'linkedin') return 'Maximum 3-5 professional hashtags placed at the end';
  if (platform === 'twitter') return 'Maximum 2 hashtags, integrated naturally or at end';
  if (platform === 'instagram') return '8-10 hashtags — mix of high-volume and niche';
  return '5-8 relevant hashtags';
}

function getPlatformSpecificInstructions(platform, contentType) {
  const guides = {
    instagram: `Instagram caption best practices:
- Lead with the most important information (first 125 chars visible before "more")
- Line breaks for readability
- Story-driven or aspirational tone performs best
- Strong visual description in imagePrompt`,
    linkedin: `LinkedIn post best practices:
- Open with a bold statement or controversial opinion
- Use single-line paragraphs with space between each
- Professional insights, industry perspective, or personal story
- End with a question to drive engagement`,
    twitter: `Twitter/X post best practices:
- Maximum 280 characters for the main hook
- Punchy, opinionated, or surprising opening
- Hashtags minimal (1-2 max)`,
    tiktok: `TikTok caption best practices:
- Short hook in caption
- Caption supports the video concept
- Trending sounds/formats can be referenced`,
    facebook: `Facebook post best practices:
- Longer-form content performs well
- Community feel
- Questions and polls work well`,
    threads: `Threads post best practices:
- Conversational, intimate tone
- Shorter is better
- Hot takes and personal opinions perform well`,
    youtube: `YouTube description best practices:
- Informative with timestamps
- Thumbnail-style imagePrompt`,
    pinterest: `Pinterest caption best practices:
- Searchable keywords naturally integrated
- Instructional or inspirational framing`,
  };
  return guides[platform.toLowerCase()] || `Create engaging ${contentType} content optimized for ${platform}.`;
}

// ─── Visual DNA helpers ────────────────────────────────────────────────────────

function buildVisualDNA(brand) {
  const sections = [];

  // Colour palette
  const colors = brand.brandColors || brand.brand_colors;
  if (colors && colors.length) {
    sections.push(`Brand colours: ${colors.join(', ')}`);
  }

  // Font mood
  const fontMood = brand.fontMood || brand.font_mood;
  const fontMoodMap = {
    modern: 'clean, geometric, sans-serif typography',
    classic: 'traditional serif typography with timeless elegance',
    playful: 'rounded, bubbly, expressive typography',
    luxury: 'high-contrast, refined, editorial typography',
    tech: 'monospace or futuristic, technical typography',
    handwritten: 'organic, personal, handcrafted typography',
  };
  if (fontMood) sections.push(`Typography mood: ${fontMoodMap[fontMood] || fontMood}`);

  // Visual vibe
  const vibes = brand.visualVibes || brand.visual_vibes || brand.vibes;
  if (vibes && vibes.length) sections.push(`Visual vibe: ${vibes.join(', ')}`);

  // Reference analysis from vision AI
  const visualDNA = brand.visualDNA || brand.visual_dna;
  if (visualDNA) {
    if (visualDNA.colorPalette?.length) sections.push(`Detected palette: ${visualDNA.colorPalette.join(', ')}`);
    if (visualDNA.aestheticStyle) sections.push(`Aesthetic style: ${visualDNA.aestheticStyle}`);
    if (visualDNA.designElements?.length) sections.push(`Design elements: ${visualDNA.designElements.join(', ')}`);
    if (visualDNA.moodKeywords?.length) sections.push(`Mood keywords: ${visualDNA.moodKeywords.join(', ')}`);
    if (visualDNA.contentStyle) sections.push(`Content style: ${visualDNA.contentStyle}`);
  }

  return sections.length ? sections.join('\n') : null;
}

// ─── Industry config helpers ───────────────────────────────────────────────────

function buildIndustryContext(brand) {
  const industryConfig = brand.industryConfig || brand.industry_config;
  if (!industryConfig) return null;

  const lines = [];
  for (const [key, value] of Object.entries(industryConfig)) {
    if (Array.isArray(value) && value.length) {
      lines.push(`${key}: ${value.join(', ')}`);
    } else if (typeof value === 'string' && value) {
      lines.push(`${key}: ${value}`);
    } else if (typeof value === 'number') {
      lines.push(`${key}: ${value}`);
    }
  }
  return lines.length ? lines.join('\n') : null;
}

// ─── Calendar / content mix helpers ────────────────────────────────────────────

function buildCalendarContext(brand) {
  const prefs = brand.calendarPrefs || brand.calendar_prefs;
  if (!prefs) return null;

  const lines = [];
  if (prefs.postsPerWeek) lines.push(`Posting cadence: ${prefs.postsPerWeek} posts/week`);
  if (prefs.preferredDays?.length) lines.push(`Preferred days: ${prefs.preferredDays.join(', ')}`);
  if (prefs.bestTimes?.length) lines.push(`Best posting times: ${prefs.bestTimes.join(', ')}`);
  if (prefs.contentMix) {
    const mix = Object.entries(prefs.contentMix).map(([k, v]) => `${k} ${v}%`).join(', ');
    lines.push(`Content mix: ${mix}`);
  }
  if (prefs.primaryPlatforms?.length) lines.push(`Primary platforms: ${prefs.primaryPlatforms.join(', ')}`);
  return lines.length ? lines.join('\n') : null;
}

// ─── System prompt ─────────────────────────────────────────────────────────────

function buildSystemPrompt(brand) {
  const toneDescriptor = getToneDescriptor(brand.tone);
  const audienceDesc = buildAudienceDescription(brand);
  const goalInstruction = getGoalInstruction(brand.goals);
  const visualDNA = buildVisualDNA(brand);
  const industryCtx = buildIndustryContext(brand);
  const calendarCtx = buildCalendarContext(brand);

  let prompt = `You are the AI content engine for ${brand.name}, a ${brand.industry} brand.

BRAND IDENTITY:
${brand.description}
`;

  // Unique selling proposition
  const usp = brand.usp || brand.unique_selling_proposition;
  if (usp) prompt += `Unique selling proposition: ${usp}\n`;

  // Brand story / mission
  const mission = brand.mission || brand.brand_mission;
  if (mission) prompt += `Brand mission: ${mission}\n`;

  // Competitors
  const competitors = brand.competitors || brand.competitor_brands;
  if (competitors?.length) prompt += `Key competitors: ${competitors.join(', ')} — differentiate from them.\n`;

  prompt += `
VOICE & TONE:
- Tone level: ${brand.tone}/100 (${toneDescriptor})
- Style attributes: ${(brand.styles || []).join(', ')}
- ${getToneInstructions(brand.tone, brand.styles || [])}
`;

  // Persona / archetype
  const persona = brand.persona || brand.brand_persona;
  if (persona) prompt += `- Brand persona: ${persona}\n`;

  // Words to use / avoid
  const useWords = brand.wordsToUse || brand.words_to_use;
  const avoidWords = brand.wordsToAvoid || brand.words_to_avoid;
  if (useWords?.length) prompt += `- ALWAYS use: ${useWords.join(', ')}\n`;
  if (avoidWords?.length) prompt += `- NEVER use: ${avoidWords.join(', ')}\n`;

  prompt += `
TARGET AUDIENCE:
${audienceDesc}

CONTENT GOALS:
${goalInstruction}
`;

  if (visualDNA) {
    prompt += `
VISUAL IDENTITY (inform imagePrompt only):
${visualDNA}
`;
  }

  if (industryCtx) {
    prompt += `
INDUSTRY CONTEXT:
${industryCtx}
`;
  }

  if (calendarCtx) {
    prompt += `
CONTENT STRATEGY:
${calendarCtx}
`;
  }

  prompt += `
OUTPUT REQUIREMENTS:
- Always respond with valid JSON only — no markdown, no explanation
- JSON format: { "caption": "string", "hashtags": ["string"], "imagePrompt": "string", "carouselSlides": [{ "headline": "string", "body": "string" }] | null }
- caption: The full post caption. Include emojis where appropriate for the tone. No hashtags in caption.
- hashtags: 5-10 relevant hashtags without the # symbol. Mix popular and niche.
- imagePrompt: A detailed prompt for image generation. Describe composition, lighting, mood, style. Incorporate the brand's visual DNA. For brand social posts, include logo placement guidance and concise, readable text-overlay direction.
- carouselSlides: Only populate if contentType is 'carousel'. 4-6 slides with headline + body each.`;

  return prompt;
}

// ─── User prompt ───────────────────────────────────────────────────────────────

function buildUserPrompt(request, brand) {
  const platformSpecific = getPlatformSpecificInstructions(request.platform, request.contentType);

  let prompt = `Create a ${request.contentType} for ${request.platform}.

BRIEF: ${request.brief}
`;
  if (request.mood) prompt += `MOOD: ${request.mood}\n`;
  if (request.imageRatio) prompt += `IMAGE FORMAT: ${request.imageRatio}\n`;
  if (request.theme) prompt += `CONTENT THEME: ${request.theme}\n`;
  if (request.campaign) prompt += `CAMPAIGN: ${request.campaign}\n`;

  prompt += `
${platformSpecific}

CRITICAL RULES:
- Caption length: ${getCaptionLength(request.platform)}
- Hashtag style: ${getHashtagStyle(request.platform)}
- CTA: ${getCTA(brand.goals, request.platform)}
- Never start the caption with the brand name
- The first line must hook the reader immediately — no preamble
- Make it feel like a real human wrote it for this specific brand`;

  return prompt;
}

// ─── Utility helpers ───────────────────────────────────────────────────────────

function getToneTemperature(tone) {
  return 0.9 - (tone / 100) * 0.4;
}

function imageRatioToAspect(ratio) {
  const map = { '1:1': '1:1', '4:5': '4:5', '9:16': '9:16', '16:9': '16:9' };
  return map[ratio] || '1:1';
}

module.exports = {
  buildSystemPrompt,
  buildUserPrompt,
  getToneDescriptor,
  getToneTemperature,
  imageRatioToAspect,
};
