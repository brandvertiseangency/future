/**
 * Shared AI helper — OpenAI for text, Google (Gemini / Imagen) for images
 *
 * callAI(prompt, opts)     → text string
 * callAIJSON(prompt, opts) → parsed object (auto-extracts + strips markdown fences)
 * generateImage(prompt)    → base64 data URL or null
 */

const DEFAULT_TIMEOUT_MS = 45_000;
const OPENAI_MODEL = 'gpt-4o';
const GEMINI_TEXT_MODEL = 'gemini-2.5-flash';
/** Gemini native image (Nano Banana Pro line). */
const GOOGLE_NATIVE_IMAGE_MODEL =
  process.env.GOOGLE_NATIVE_IMAGE_MODEL || 'gemini-3-pro-image-preview';
/** Imagen text-to-image (optional second step). */
const GOOGLE_IMAGEN_MODEL = process.env.GOOGLE_IMAGEN_MODEL || 'imagen-4.0-fast-generate-001';
/** When true (default), try Imagen if native returns no image or errors. */
const GOOGLE_IMAGE_IMAGEN_FALLBACK = process.env.GOOGLE_IMAGE_IMAGEN_FALLBACK !== 'false';
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
const aspectRatioHint = (aspectRatio = '1:1') =>
  aspectRatio && aspectRatio !== '1:1' ? ` Target composition aspect ratio: ${aspectRatio}.` : '';

/**
 * Gemini native image (generateContent + IMAGE modality).
 * @returns {Promise<{ imageData: string, model: string } | null>}
 */
const generateImageWithGoogleNative = async (imagePrompt, timeoutMs, aspectRatio, referenceImageUrls) => {
  const { GoogleGenAI } = require('@google/genai');
  const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY });
  const inlineParts = [];
  const refs = Array.isArray(referenceImageUrls) ? referenceImageUrls.slice(0, 3) : [];
  for (const refUrl of refs) {
    const part = await buildInlineImagePartFromUrl(refUrl);
    if (part) inlineParts.push(part);
  }
  const text = `${imagePrompt}${aspectRatioHint(aspectRatio)}`;
  const response = await withTimeout(
    ai.models.generateContent({
      model: GOOGLE_NATIVE_IMAGE_MODEL,
      contents: [
        {
          role: 'user',
          parts: [{ text }, ...inlineParts],
        },
      ],
      config: { responseModalities: ['IMAGE', 'TEXT'] },
    }),
    timeoutMs
  );
  const parts = response?.candidates?.[0]?.content?.parts || [];
  const imagePart = parts.find((p) => p.inlineData?.data);
  if (!imagePart?.inlineData?.data) return null;
  const mimeType = imagePart.inlineData.mimeType || 'image/jpeg';
  return { imageData: `data:${mimeType};base64,${imagePart.inlineData.data}`, model: GOOGLE_NATIVE_IMAGE_MODEL };
};

/**
 * Google Imagen (generateImages).
 * @returns {Promise<{ imageData: string, model: string } | null>}
 */
const generateImageWithGoogleImagen = async (imagePrompt, timeoutMs, aspectRatio) => {
  const { GoogleGenAI } = require('@google/genai');
  const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY });
  const response = await withTimeout(
    ai.models.generateImages({
      model: GOOGLE_IMAGEN_MODEL,
      prompt: `${imagePrompt}${aspectRatioHint(aspectRatio)}`,
      config: { numberOfImages: 1, aspectRatio, outputMimeType: 'image/jpeg' },
    }),
    timeoutMs
  );
  const b64 = response?.generatedImages?.[0]?.image?.imageBytes;
  if (!b64) return null;
  return { imageData: `data:image/jpeg;base64,${b64}`, model: GOOGLE_IMAGEN_MODEL };
};

const markGoogleImageRateLimitedIfNeeded = (message) => {
  const m = String(message || '');
  if (/resource_exhausted|quota|429|rate.?limit/i.test(m)) {
    googleImageRateLimitedUntil = Date.now() + 60_000;
  }
};

/**
 * Generate image with metadata for debug visibility.
 * Google-only: native Gemini image first, optional Imagen fallback.
 * Returns { imageData, error, provider, model }.
 */
const generateImageDetailed = async (imagePrompt, opts = {}) => {
  if (!process.env.GOOGLE_AI_API_KEY) {
    return {
      imageData: null,
      error: 'Image generation requires GOOGLE_AI_API_KEY (Google AI Studio / Gemini API key).',
      provider: 'none',
      model: null,
    };
  }
  const { timeoutMs = DEFAULT_TIMEOUT_MS, aspectRatio = '1:1', referenceImageUrls = [] } = opts;
  const logger = require('../utils/logger');
  const now = Date.now();
  if (googleImageRateLimitedUntil > now) {
    return {
      imageData: null,
      error: 'Google image API temporarily rate-limited; retry in about one minute.',
      provider: 'google',
      model: GOOGLE_NATIVE_IMAGE_MODEL,
    };
  }

  let lastError = '';

  try {
    let nativeResult = null;
    try {
      nativeResult = await generateImageWithGoogleNative(
        imagePrompt,
        timeoutMs,
        aspectRatio,
        referenceImageUrls
      );
    } catch (err) {
      markGoogleImageRateLimitedIfNeeded(err?.message);
      lastError = err?.message || String(err);
      logger.warn('Google native image generation failed', {
        model: GOOGLE_NATIVE_IMAGE_MODEL,
        error: lastError,
      });
    }
    if (nativeResult?.imageData) {
      return {
        imageData: nativeResult.imageData,
        error: null,
        provider: 'google-native',
        model: nativeResult.model,
      };
    }

    if (!GOOGLE_IMAGE_IMAGEN_FALLBACK) {
      return {
        imageData: null,
        error: lastError || 'Native image model returned no image (Imagen fallback disabled).',
        provider: 'google-native',
        model: GOOGLE_NATIVE_IMAGE_MODEL,
      };
    }

    try {
      const imagenResult = await generateImageWithGoogleImagen(imagePrompt, timeoutMs, aspectRatio);
      if (imagenResult?.imageData) {
        return {
          imageData: imagenResult.imageData,
          error: null,
          provider: 'google-imagen',
          model: imagenResult.model,
        };
      }
      lastError = lastError || 'Imagen returned empty payload.';
    } catch (err) {
      markGoogleImageRateLimitedIfNeeded(err?.message);
      logger.warn('Google Imagen generation failed', { model: GOOGLE_IMAGEN_MODEL, error: err.message });
      lastError = `${lastError || 'native_failed'}; imagen: ${err?.message || err}`;
    }

    return {
      imageData: null,
      error: lastError || 'Google image generation failed (native + Imagen).',
      provider: 'google',
      model: GOOGLE_IMAGEN_MODEL,
    };
  } catch (err) {
    markGoogleImageRateLimitedIfNeeded(err?.message);
    logger.warn('Image generation failed', { error: err.message });
    return {
      imageData: null,
      error: err?.message || String(err),
      provider: 'google',
      model: GOOGLE_NATIVE_IMAGE_MODEL,
    };
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
