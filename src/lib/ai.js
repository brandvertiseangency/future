/**
 * Shared AI helper — OpenAI primary, Gemini flash fallback
 *
 * callAI(prompt, opts)     → text string
 * callAIJSON(prompt, opts) → parsed object (auto-extracts + strips markdown fences)
 * generateImage(prompt)    → base64 data URL or null
 */

const DEFAULT_TIMEOUT_MS = 45_000;
const OPENAI_MODEL = 'gpt-4o';
const GEMINI_TEXT_MODEL = 'gemini-2.5-flash';
const IMAGEN_MODEL = 'imagen-4.0-fast-generate-001';
const NANO_BANANA_MODEL = 'gemini-2.0-flash-preview-image-generation';
const OPENAI_IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1';
const IMAGE_MODEL = (process.env.IMAGE_MODEL || 'chatgpt-image-2').toLowerCase();
let nanoModelUnavailable = false;
let googleImageRateLimitedUntil = 0;

const withTimeout = (promise, ms = DEFAULT_TIMEOUT_MS) => {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error('AI_TIMEOUT')), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
};

/** Strip BOM, markdown fences, and outer whitespace (models often wrap JSON). */
function stripAiJsonWrappers(raw) {
  if (typeof raw !== 'string') return '';
  return raw
    .replace(/^\uFEFF/, '')
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .trim();
}

/**
 * Extract first complete top-level JSON object or array using bracket matching
 * (respects strings). Avoids greedy /\{[\s\S]*\}/ which breaks on extra braces or preamble text.
 */
function extractBalancedJsonSlice(s) {
  const trimmed = s.trim();
  const firstBrace = trimmed.indexOf('{');
  const firstBracket = trimmed.indexOf('[');
  let start = -1;
  if (firstBrace >= 0 && (firstBracket < 0 || firstBrace <= firstBracket)) start = firstBrace;
  else if (firstBracket >= 0) start = firstBracket;
  else return null;

  const stack = [];
  const c0 = trimmed[start];
  if (c0 === '{') stack.push('}');
  else if (c0 === '[') stack.push(']');
  else return null;

  let inString = false;
  let escape = false;

  for (let i = start + 1; i < trimmed.length; i += 1) {
    const c = trimmed[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (inString) {
      if (c === '\\') {
        escape = true;
        continue;
      }
      if (c === '"') inString = false;
      continue;
    }
    if (c === '"') {
      inString = true;
      continue;
    }
    if (c === '{') {
      stack.push('}');
      continue;
    }
    if (c === '[') {
      stack.push(']');
      continue;
    }
    if (c === '}' || c === ']') {
      if (stack.length && stack[stack.length - 1] === c) {
        stack.pop();
        if (!stack.length) return trimmed.slice(start, i + 1);
      }
    }
  }
  return null;
}

/**
 * Parse JSON from an AI text response: full document, then first balanced object/array.
 * @param {string} raw
 * @returns {object|Array<unknown>}
 */
function parseAiJsonLoose(raw) {
  const cleaned = stripAiJsonWrappers(String(raw || ''));
  if (!cleaned) throw new Error('AI returned empty response');
  try {
    return JSON.parse(cleaned);
  } catch {
    const slice = extractBalancedJsonSlice(cleaned);
    if (slice) {
      try {
        return JSON.parse(slice);
      } catch {
        /* fall through */
      }
    }
    throw new Error(`AI returned invalid JSON. Raw: ${String(raw).slice(0, 240)}`);
  }
}

/**
 * Call OpenAI gpt-4o (primary) or Gemini 2.5 Flash (fallback).
 * @param {string|{system:string,user:string}} prompt
 * @param {{ maxTokens?: number, timeoutMs?: number }} opts
 * @returns {Promise<string>}
 */
const callAI = async (prompt, opts = {}) => {
  const { maxTokens = 2048, timeoutMs = DEFAULT_TIMEOUT_MS } = opts;
  const systemPrompt = typeof prompt === 'object' ? prompt.system : undefined;
  const userPrompt   = typeof prompt === 'object' ? prompt.user   : prompt;

  // ── OpenAI (primary) ──────────────────────────────────────────────────────
  if (process.env.OPENAI_API_KEY) {
    try {
      const OpenAI = require('openai');
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: timeoutMs });
      const messages = [];
      if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
      messages.push({ role: 'user', content: userPrompt });
      const completion = await openai.chat.completions.create({
        model: OPENAI_MODEL,
        max_tokens: maxTokens,
        messages,
      });
      return completion.choices[0].message.content;
    } catch (openaiErr) {
      if (openaiErr.message === 'AI_TIMEOUT') throw openaiErr;
      const logger = require('../utils/logger');
      logger.warn('OpenAI unavailable, falling back to Gemini', { error: openaiErr.message });
    }
  }

  // ── Gemini (fallback) ─────────────────────────────────────────────────────
  if (process.env.GOOGLE_AI_API_KEY) {
    const { GoogleGenAI } = require('@google/genai');
    const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY });
    const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${userPrompt}` : userPrompt;
    const response = await withTimeout(
      ai.models.generateContent({
        model: GEMINI_TEXT_MODEL,
        contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
        config: { maxOutputTokens: maxTokens },
      }),
      timeoutMs
    );
    return response.text;
  }

  throw new Error('No AI provider configured. Set OPENAI_API_KEY or GOOGLE_AI_API_KEY.');
};

/**
 * Same as callAI but automatically parses and returns JSON.
 * Strips markdown fences that Gemini/OpenAI sometimes wrap around JSON.
 */
const callAIJSON = async (prompt, opts = {}) => {
  const raw = await callAI(prompt, opts);
  return parseAiJsonLoose(raw);
};

/**
 * Convert remote image URL to Gemini inlineData part.
 */
const buildInlineImagePartFromUrl = async (url) => {
  try {
    const axios = require('axios');
    const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 15_000 });
    const mimeType = response.headers['content-type'] || 'image/jpeg';
    const data = Buffer.from(response.data).toString('base64');
    return { inlineData: { mimeType, data } };
  } catch {
    return null;
  }
};

/**
 * OpenAI image fallback generator.
 * Returns data URL or null.
 */
const openAiSizeFromAspectRatio = (aspectRatio = '1:1') => {
  if (aspectRatio === '9:16') return '1024x1536';
  if (aspectRatio === '4:5') return '1024x1536';
  if (aspectRatio === '16:9') return '1536x1024';
  return '1024x1024';
};

const generateImageWithOpenAI = async (prompt, timeoutMs, aspectRatio = '1:1') => {
  if (!process.env.OPENAI_API_KEY) return null;
  try {
    const OpenAI = require('openai');
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: timeoutMs });
    const response = await withTimeout(
      openai.images.generate({
        model: OPENAI_IMAGE_MODEL,
        prompt,
        size: openAiSizeFromAspectRatio(aspectRatio),
        quality: 'high',
      }),
      timeoutMs
    );
    const b64 = response?.data?.[0]?.b64_json;
    return b64 ? `data:image/png;base64,${b64}` : null;
  } catch (err) {
    const logger = require('../utils/logger');
    logger.warn('OpenAI image generation failed', { error: err?.message || 'unknown_error' });
    return null;
  }
};

/**
 * Generate image with metadata for debug visibility.
 * Returns { imageData, error, provider, model }.
 */
const generateImageDetailed = async (imagePrompt, opts = {}) => {
  const hasGoogle = !!process.env.GOOGLE_AI_API_KEY;
  const hasOpenAI = !!process.env.OPENAI_API_KEY;
  if (!hasGoogle && !hasOpenAI) {
    return { imageData: null, error: 'No image providers configured (OPENAI_API_KEY / GOOGLE_AI_API_KEY).', provider: 'none', model: null };
  }
  const { timeoutMs = DEFAULT_TIMEOUT_MS, aspectRatio = '1:1', referenceImageUrls = [] } = opts;
  const logger = require('../utils/logger');
  let lastError = '';
  // Hard-prioritize OpenAI for production stability and quality.
  const openAiImage = await generateImageWithOpenAI(imagePrompt, timeoutMs, aspectRatio);
  if (openAiImage) return { imageData: openAiImage, error: null, provider: 'openai', model: OPENAI_IMAGE_MODEL };
  lastError = `OpenAI image generation failed (model: ${OPENAI_IMAGE_MODEL})`;

  // Only use Google as a temporary fallback if not currently rate-limited.
  if (!hasGoogle) {
    return { imageData: null, error: lastError || 'Google AI key is not configured for fallback.', provider: 'openai', model: OPENAI_IMAGE_MODEL };
  }
  const now = Date.now();
  if (googleImageRateLimitedUntil > now) {
    return {
      imageData: null,
      error: `${lastError}; google_image_temporarily_rate_limited`,
      provider: 'openai',
      model: OPENAI_IMAGE_MODEL,
    };
  }

  try {
    const { GoogleGenAI } = require('@google/genai');
    const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY });

    const shouldUseNano = IMAGE_MODEL === 'nano-banana' && !nanoModelUnavailable;
    if (shouldUseNano) {
      const inlineParts = [];
      const refs = Array.isArray(referenceImageUrls) ? referenceImageUrls.slice(0, 3) : [];
      for (const refUrl of refs) {
        const part = await buildInlineImagePartFromUrl(refUrl);
        if (part) inlineParts.push(part);
      }
      const response = await withTimeout(
        ai.models.generateContent({
          model: NANO_BANANA_MODEL,
          contents: [
            {
              role: 'user',
              parts: [
                { text: imagePrompt },
                ...inlineParts,
              ],
            },
          ],
          config: { responseModalities: ['IMAGE', 'TEXT'] },
        }),
        timeoutMs
      );
      const parts = response?.candidates?.[0]?.content?.parts || [];
      const imagePart = parts.find((p) => p.inlineData?.data);
      if (imagePart?.inlineData?.data) {
        const mimeType = imagePart.inlineData.mimeType || 'image/jpeg';
        return { imageData: `data:${mimeType};base64,${imagePart.inlineData.data}`, error: null, provider: 'google-nano', model: NANO_BANANA_MODEL };
      }
      logger.warn('Nano Banana returned no image payload');
      const openAiFallback = await generateImageWithOpenAI(imagePrompt, timeoutMs, aspectRatio);
      if (openAiFallback) return { imageData: openAiFallback, error: null, provider: 'openai-fallback', model: OPENAI_IMAGE_MODEL };
      return { imageData: null, error: 'Nano Banana returned no image payload and OpenAI fallback failed.', provider: 'google-nano', model: NANO_BANANA_MODEL };
    }

    const response = await withTimeout(
      ai.models.generateImages({
        model: IMAGEN_MODEL,
        prompt: imagePrompt,
        config: { numberOfImages: 1, aspectRatio, outputMimeType: 'image/jpeg' },
      }),
      timeoutMs
    );
    const b64 = response?.generatedImages?.[0]?.image?.imageBytes;
    if (b64) return { imageData: `data:image/jpeg;base64,${b64}`, error: null, provider: 'google-imagen', model: IMAGEN_MODEL };
    const openAiFallback = await generateImageWithOpenAI(imagePrompt, timeoutMs, aspectRatio);
    if (openAiFallback) return { imageData: openAiFallback, error: null, provider: 'openai-fallback', model: OPENAI_IMAGE_MODEL };
    return { imageData: null, error: 'Imagen returned empty payload and OpenAI fallback failed.', provider: 'google-imagen', model: IMAGEN_MODEL };
  } catch (err) {
    logger.warn('Image generation failed', { model: IMAGE_MODEL, error: err.message });
    lastError = err?.message || String(err);
    if (/resource_exhausted|quota|429|rate.?limit/i.test(lastError)) {
      // Pause Google image calls for one minute after quota/rate-limit failure.
      googleImageRateLimitedUntil = Date.now() + 60_000;
    }
    // If the model is unavailable in this API/version, stop retrying Nano in this process.
    if (IMAGE_MODEL === 'nano-banana' && /not found|not supported for generatecontent/i.test(lastError)) {
      nanoModelUnavailable = true;
      logger.warn('Nano Banana unavailable; disabling for current process and using fallbacks');
    }
    if (IMAGE_MODEL === 'nano-banana') {
      const openAiFallbackFirst = await generateImageWithOpenAI(imagePrompt, timeoutMs, aspectRatio);
      if (openAiFallbackFirst) return { imageData: openAiFallbackFirst, error: null, provider: 'openai-fallback', model: OPENAI_IMAGE_MODEL };
      // Fallback for resilience.
      try {
        const { GoogleGenAI } = require('@google/genai');
        const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY });
        const response = await withTimeout(
          ai.models.generateImages({
            model: IMAGEN_MODEL,
            prompt: imagePrompt,
            config: { numberOfImages: 1, aspectRatio, outputMimeType: 'image/jpeg' },
          }),
          timeoutMs
        );
        const b64 = response?.generatedImages?.[0]?.image?.imageBytes;
        if (b64) return { imageData: `data:image/jpeg;base64,${b64}`, error: null, provider: 'google-imagen-fallback', model: IMAGEN_MODEL };
      } catch (fallbackErr) {
        logger.warn('Imagen fallback also failed', { error: fallbackErr.message });
        lastError = `${lastError}; imagen_fallback: ${fallbackErr?.message || fallbackErr}`;
      }
    }
    const openAiFallback = await generateImageWithOpenAI(imagePrompt, timeoutMs, aspectRatio);
    if (openAiFallback) return { imageData: openAiFallback, error: null, provider: 'openai-fallback', model: OPENAI_IMAGE_MODEL };
    return { imageData: null, error: lastError || 'Unknown image generation failure', provider: IMAGE_MODEL, model: IMAGE_MODEL };
  }
};

/**
 * Backwards-compatible image helper.
 */
const generateImage = async (imagePrompt, opts = {}) => {
  const result = await generateImageDetailed(imagePrompt, opts);
  return result?.imageData || null;
};

module.exports = {
  callAI,
  callAIJSON,
  parseAiJsonLoose,
  generateImage,
  generateImageDetailed,
  withTimeout,
  DEFAULT_TIMEOUT_MS,
};
