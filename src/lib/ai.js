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
const logger = require('../utils/logger');
const { checkImageGenerationPrompt } = require('./contentSafety');
const NANO_BANANA_ALIASES = new Set([
  'nanobana',
  'nano-banana',
  'nano banana',
  'nano banana pro',
  'nanobanana',
  'nanobanana pro',
  'gemini-3-pro-image-preview',
]);

const normalizeNativeImageModel = (raw) => {
  const value = String(raw || '').trim();
  if (!value) return 'gemini-3-pro-image-preview';
  const key = value.toLowerCase();
  if (NANO_BANANA_ALIASES.has(key)) return 'gemini-3-pro-image-preview';
  return value;
};

const parseEnvBool = (raw, fallback = true) => {
  if (raw == null) return fallback;
  const value = String(raw).trim().toLowerCase();
  if (['false', '0', 'no', 'off'].includes(value)) return false;
  if (['true', '1', 'yes', 'on'].includes(value)) return true;
  return fallback;
};
/** Gemini native image (Nano Banana Pro line). */
const GOOGLE_NATIVE_IMAGE_MODEL = normalizeNativeImageModel(process.env.GOOGLE_NATIVE_IMAGE_MODEL);

/** Imagen tier → default model id when `GOOGLE_IMAGEN_MODEL` is unset. */
const IMAGEN_TIER_MODELS = {
  fast: 'imagen-4.0-fast-generate-001',
  standard: 'imagen-4.0-generate-001',
  ultra: 'imagen-4.0-ultra-generate-001',
};
const imagenTierRaw = String(process.env.GOOGLE_IMAGEN_TIER || 'fast').trim().toLowerCase();
const IMAGEN_TIER = ['fast', 'standard', 'ultra'].includes(imagenTierRaw) ? imagenTierRaw : 'fast';

const resolveImagenModelId = () => {
  const explicit = process.env.GOOGLE_IMAGEN_MODEL && String(process.env.GOOGLE_IMAGEN_MODEL).trim();
  if (explicit) return explicit;
  return IMAGEN_TIER_MODELS[IMAGEN_TIER] || IMAGEN_TIER_MODELS.fast;
};

/** Imagen text-to-image (optional second step). */
const GOOGLE_IMAGEN_MODEL = resolveImagenModelId();

/** When true (default), try Imagen if native returns no image or errors. */
const GOOGLE_IMAGE_IMAGEN_FALLBACK = parseEnvBool(process.env.GOOGLE_IMAGE_IMAGEN_FALLBACK, true);

/** Google API: `dont_allow` | `allow_adult` | `allow_all` (EU/MENA may forbid allow_all). */
const GOOGLE_IMAGEN_PERSON_GENERATION = (() => {
  const v = String(process.env.GOOGLE_IMAGEN_PERSON_GENERATION || 'allow_adult').trim().toLowerCase();
  if (['dont_allow', 'allow_adult', 'allow_all'].includes(v)) return v;
  return 'allow_adult';
})();

/** `1K` | `2K` — 2K only applied when the resolved model supports it (Standard/Ultra per Google docs). */
const GOOGLE_IMAGEN_IMAGE_SIZE = (() => {
  const v = String(process.env.GOOGLE_IMAGEN_IMAGE_SIZE || '2K').trim().toUpperCase();
  if (v === '1K' || v === '2K') return v;
  return '2K';
})();

let googleImageRateLimitedUntil = 0;

const imagenModelSupportsConfigurableImageSize = (modelId) => {
  const m = String(modelId || '').toLowerCase();
  if (m.includes('fast')) return false;
  return m.includes('imagen-4.0-generate-001') || m.includes('ultra-generate');
};

/** Appended to Gemini native image prompts only (not Imagen — token limits). */
const NATIVE_QUALITY_PRESET = String(process.env.GOOGLE_NATIVE_IMAGE_QUALITY_PRESET || 'balanced')
  .trim()
  .toLowerCase();
const NATIVE_QUALITY_SUFFIX = {
  speed: '',
  balanced:
    ' Photographic realism: natural color, subtle grain, avoid plastic HDR or oversharpening.',
  detail:
    ' High perceived detail: crisp materials, realistic shadow falloff, editorial color grade, no halos, no synthetic glow.',
};
const nativeImageQualitySuffix =
  NATIVE_QUALITY_SUFFIX[NATIVE_QUALITY_PRESET] ?? NATIVE_QUALITY_SUFFIX.balanced;

logger.info('AI image config resolved', {
  nativeModel: GOOGLE_NATIVE_IMAGE_MODEL,
  nativeQualityPreset: NATIVE_QUALITY_PRESET,
  imagenModel: GOOGLE_IMAGEN_MODEL,
  imagenTier: IMAGEN_TIER,
  imagenPersonGeneration: GOOGLE_IMAGEN_PERSON_GENERATION,
  imagenImageSize: GOOGLE_IMAGEN_IMAGE_SIZE,
  imagenSupportsImageSizeParam: imagenModelSupportsConfigurableImageSize(GOOGLE_IMAGEN_MODEL),
  imagenFallbackEnabled: GOOGLE_IMAGE_IMAGEN_FALLBACK,
});

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

const aspectRatioHint = (aspectRatio = '1:1') =>
  aspectRatio && aspectRatio !== '1:1' ? ` Target composition aspect ratio: ${aspectRatio}.` : '';

/** Imagen `generateImages` only allows these `config.aspectRatio` values (API rejects e.g. 4:5). */
const IMAGEN_API_ASPECT_RATIOS = new Set(['1:1', '9:16', '16:9', '4:3', '3:4']);

/**
 * Map requested ratio to the closest Imagen-supported value; keep original intent in the text prompt.
 * @param {string} aspectRatio
 * @returns {string}
 */
const normalizeAspectRatioForImagen = (aspectRatio) => {
  const r = String(aspectRatio || '1:1').trim();
  if (IMAGEN_API_ASPECT_RATIOS.has(r)) return r;
  if (r === '4:5' || r === '5:4') return '3:4';
  return '1:1';
};

/** Imagen prompt input limit ~480 tokens; stay conservative in characters (no tokenizer in-path). */
const IMAGEN_PROMPT_MAX_CHARS = 2000;

/**
 * Shorten long prompts for Imagen: keep start (subject/brand) and end (constraints).
 * @param {string} text
 * @returns {string}
 */
const shortenPromptForImagen = (text) => {
  const s = String(text || '').replace(/\s+/g, ' ').trim();
  if (s.length <= IMAGEN_PROMPT_MAX_CHARS) return s;
  const head = 950;
  const tail = 950;
  return `${s.slice(0, head)}\n\n[...]\n\n${s.slice(-tail)}`;
};

/**
 * Defensive extraction of base64 image bytes from generateImages SDK response.
 * @param {object} response
 * @returns {string|null}
 */
const extractImagenImageBase64 = (response) => {
  const imgs = response?.generatedImages ?? response?.generated_images;
  if (!Array.isArray(imgs) || imgs.length === 0) {
    const topKeys = response && typeof response === 'object' ? Object.keys(response) : [];
    logger.warn('Imagen response missing or empty generatedImages', {
      topKeys,
      generatedImagesLength: Array.isArray(imgs) ? imgs.length : null,
    });
    return null;
  }
  const first = imgs[0];
  const img = first?.image ?? first?.Image;
  const bytes =
    img?.imageBytes ??
    img?.image_bytes ??
    img?.bytes ??
    (typeof img === 'string' ? img : null);
  if (bytes) return bytes;
  logger.warn('Imagen first image missing imageBytes', {
    firstKeys: first && typeof first === 'object' ? Object.keys(first) : [],
    imageKeys: img && typeof img === 'object' ? Object.keys(img) : [],
  });
  return null;
};

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
  const text = `${imagePrompt}${aspectRatioHint(aspectRatio)}${nativeImageQualitySuffix}`;
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
  const imagenAspect = normalizeAspectRatioForImagen(aspectRatio);
  const ratioNote =
    imagenAspect !== String(aspectRatio || '').trim()
      ? ` (Output canvas is ${imagenAspect} per image API; preserve ${aspectRatio} vertical-feed composition intent.)`
      : '';
  const fullPrompt = `${imagePrompt}${aspectRatioHint(aspectRatio)}${ratioNote}`;
  const promptForImagen = shortenPromptForImagen(fullPrompt);

  const config = {
    numberOfImages: 1,
    aspectRatio: imagenAspect,
    outputMimeType: 'image/jpeg',
    personGeneration: GOOGLE_IMAGEN_PERSON_GENERATION,
  };
  if (imagenModelSupportsConfigurableImageSize(GOOGLE_IMAGEN_MODEL)) {
    config.imageSize = GOOGLE_IMAGEN_IMAGE_SIZE === '2K' ? '2K' : '1K';
  }

  const response = await withTimeout(
    ai.models.generateImages({
      model: GOOGLE_IMAGEN_MODEL,
      prompt: promptForImagen,
      config,
    }),
    timeoutMs
  );

  const b64 = extractImagenImageBase64(response);
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
  const policy = checkImageGenerationPrompt(imagePrompt);
  if (!policy.ok) {
    logger.warn('Image generation blocked by content policy', {
      code: policy.code,
      promptPreview: String(imagePrompt || '').slice(0, 120),
    });
    return {
      imageData: null,
      error: policy.message,
      provider: 'policy-blocked',
      model: null,
    };
  }
  const { timeoutMs = DEFAULT_TIMEOUT_MS, aspectRatio = '1:1', referenceImageUrls = [] } = opts;
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
    logger.info('Image generation started', {
      nativeModel: GOOGLE_NATIVE_IMAGE_MODEL,
      imagenFallbackEnabled: GOOGLE_IMAGE_IMAGEN_FALLBACK,
      aspectRatio,
      promptPreview: String(imagePrompt || '').slice(0, 120),
    });
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
      logger.warn('Native image returned no result and Imagen fallback is disabled', {
        nativeModel: GOOGLE_NATIVE_IMAGE_MODEL,
        nativeError: lastError || null,
      });
      return {
        imageData: null,
        error: lastError || 'Native image model returned no image (Imagen fallback disabled).',
        provider: 'google-native',
        model: GOOGLE_NATIVE_IMAGE_MODEL,
      };
    }

    try {
      logger.warn('Falling back to Imagen after native image miss/failure', {
        nativeModel: GOOGLE_NATIVE_IMAGE_MODEL,
        imagenModel: GOOGLE_IMAGEN_MODEL,
        nativeError: lastError || null,
      });
      const imagenResult = await generateImageWithGoogleImagen(imagePrompt, timeoutMs, aspectRatio);
      if (imagenResult?.imageData) {
        logger.info('Imagen fallback succeeded', { imagenModel: imagenResult.model });
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
