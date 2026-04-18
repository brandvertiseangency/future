// src/lib/prompt-engine.js
// Backend equivalent of frontend/src/lib/prompt-engine.ts

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
  return instructions.join('. ');
}

function buildAudienceDescription(brand) {
  const genderMap = { mixed: 'all genders', mostly_male: 'predominantly male', mostly_female: 'predominantly female', 'mostly-men': 'predominantly male', 'mostly-women': 'predominantly female' };
  return `Age: ${brand.audienceAgeMin || brand.audience_age_min || 25}–${brand.audienceAgeMax || brand.audience_age_max || 44}
Gender: ${genderMap[brand.audienceGender || brand.audience_gender] || 'all genders'}
Location: ${brand.audienceLocation || brand.audience_location || 'global'}
Interests: ${(brand.audienceInterests || brand.audience_interests || []).join(', ') || 'general'}
Speak directly to their mindset and daily life.`;
}

function getGoalInstruction(goals) {
  const goalMap = {
    'Growth': 'Prioritize shareable content that earns organic reach',
    'Revenue': 'Every post should move the reader toward a purchase or conversion',
    'Engagement': 'Optimize for comments and saves over reach',
    'Awareness': 'Focus on memorable, distinctive brand moments',
    'growth': 'Prioritize shareable content that earns organic reach',
    'revenue': 'Every post should move the reader toward a purchase or conversion',
    'engagement': 'Optimize for comments and saves over reach',
    'awareness': 'Focus on memorable, distinctive brand moments',
  };
  return (goals || []).map(g => goalMap[g] || g).join('. ');
}

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

function getCTA(goals, platform) {
  if ((goals || []).includes('Revenue') || (goals || []).includes('revenue')) return 'Drive to purchase — "Shop now", "Book a call", "Learn more"';
  if ((goals || []).includes('Growth') || (goals || []).includes('growth')) return 'Drive follows or shares — "Follow for more", "Share this"';
  if ((goals || []).includes('Engagement') || (goals || []).includes('engagement')) return 'Drive comments — ask a question';
  return 'End with a clear next step for the reader';
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

function buildSystemPrompt(brand) {
  const toneDescriptor = getToneDescriptor(brand.tone);
  const audienceDesc = buildAudienceDescription(brand);
  const goalInstruction = getGoalInstruction(brand.goals);

  return `You are the AI content engine for ${brand.name}, a ${brand.industry} brand.

BRAND IDENTITY:
${brand.description}

VOICE & TONE:
- Tone level: ${brand.tone}/100 (${toneDescriptor})
- Style attributes: ${(brand.styles || []).join(', ')}
- ${getToneInstructions(brand.tone, brand.styles || [])}

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
- carouselSlides: Only populate if contentType is 'carousel'. 4-6 slides with headline + body each.`;
}

function buildUserPrompt(request, brand) {
  const platformSpecific = getPlatformSpecificInstructions(request.platform, request.contentType);

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
- Make it feel like a real human wrote it for this specific brand`;
}

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
