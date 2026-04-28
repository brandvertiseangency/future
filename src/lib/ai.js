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

const withTimeout = (promise, ms = DEFAULT_TIMEOUT_MS) => {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error('AI_TIMEOUT')), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
};

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
  const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (match) {
      try { return JSON.parse(match[0]); } catch { /* fall through */ }
    }
    throw new Error(`AI returned invalid JSON. Raw: ${raw.slice(0, 200)}`);
  }
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
const generateImageWithOpenAI = async (prompt, timeoutMs) => {
  if (!process.env.OPENAI_API_KEY) return null;
  try {
    const OpenAI = require('openai');
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: timeoutMs });
    const response = await withTimeout(
      openai.images.generate({
        model: OPENAI_IMAGE_MODEL,
        prompt,
        size: '1024x1024',
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
 * Returns { imageData, error, provider }.
 */
const generateImageDetailed = async (imagePrompt, opts = {}) => {
  const hasGoogle = !!process.env.GOOGLE_AI_API_KEY;
  const hasOpenAI = !!process.env.OPENAI_API_KEY;
  if (!hasGoogle && !hasOpenAI) {
    return { imageData: null, error: 'No image providers configured (OPENAI_API_KEY / GOOGLE_AI_API_KEY).', provider: 'none' };
  }
  const { timeoutMs = DEFAULT_TIMEOUT_MS, aspectRatio = '1:1', referenceImageUrls = [] } = opts;
  const logger = require('../utils/logger');
  let lastError = '';
  const openAiPrimary =
    IMAGE_MODEL === 'chatgpt-image-2' ||
    IMAGE_MODEL === 'openai' ||
    IMAGE_MODEL === 'openai-image' ||
    IMAGE_MODEL === 'gpt-image-1';

  // OpenAI primary path (ChatGPT image model)
  if (openAiPrimary) {
    const openAiImage = await generateImageWithOpenAI(imagePrompt, timeoutMs);
    if (openAiImage) return { imageData: openAiImage, error: null, provider: 'openai' };
    lastError = `OpenAI image generation failed (model: ${OPENAI_IMAGE_MODEL})`;
    if (!hasGoogle) {
      logger.warn('OpenAI image generation failed and Google fallback unavailable');
      return { imageData: null, error: lastError, provider: 'openai' };
    }
    logger.warn('OpenAI image generation failed, falling back to Google models');
  }
  if (!hasGoogle) {
    return { imageData: null, error: lastError || 'Google AI key is not configured for fallback.', provider: 'openai' };
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
        return { imageData: `data:${mimeType};base64,${imagePart.inlineData.data}`, error: null, provider: 'google-nano' };
      }
      logger.warn('Nano Banana returned no image payload');
      const openAiFallback = await generateImageWithOpenAI(imagePrompt, timeoutMs);
      if (openAiFallback) return { imageData: openAiFallback, error: null, provider: 'openai-fallback' };
      return { imageData: null, error: 'Nano Banana returned no image payload and OpenAI fallback failed.', provider: 'google-nano' };
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
    if (b64) return { imageData: `data:image/jpeg;base64,${b64}`, error: null, provider: 'google-imagen' };
    const openAiFallback = await generateImageWithOpenAI(imagePrompt, timeoutMs);
    if (openAiFallback) return { imageData: openAiFallback, error: null, provider: 'openai-fallback' };
    return { imageData: null, error: 'Imagen returned empty payload and OpenAI fallback failed.', provider: 'google-imagen' };
  } catch (err) {
    logger.warn('Image generation failed', { model: IMAGE_MODEL, error: err.message });
    lastError = err?.message || String(err);
    // If the model is unavailable in this API/version, stop retrying Nano in this process.
    if (IMAGE_MODEL === 'nano-banana' && /not found|not supported for generatecontent/i.test(lastError)) {
      nanoModelUnavailable = true;
      logger.warn('Nano Banana unavailable; disabling for current process and using fallbacks');
    }
    if (IMAGE_MODEL === 'nano-banana') {
      const openAiFallbackFirst = await generateImageWithOpenAI(imagePrompt, timeoutMs);
      if (openAiFallbackFirst) return { imageData: openAiFallbackFirst, error: null, provider: 'openai-fallback' };
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
        if (b64) return { imageData: `data:image/jpeg;base64,${b64}`, error: null, provider: 'google-imagen-fallback' };
      } catch (fallbackErr) {
        logger.warn('Imagen fallback also failed', { error: fallbackErr.message });
        lastError = `${lastError}; imagen_fallback: ${fallbackErr?.message || fallbackErr}`;
      }
    }
    const openAiFallback = await generateImageWithOpenAI(imagePrompt, timeoutMs);
    if (openAiFallback) return { imageData: openAiFallback, error: null, provider: 'openai-fallback' };
    return { imageData: null, error: lastError || 'Unknown image generation failure', provider: IMAGE_MODEL };
  }
};

/**
 * Backwards-compatible image helper.
 */
const generateImage = async (imagePrompt, opts = {}) => {
  const result = await generateImageDetailed(imagePrompt, opts);
  return result?.imageData || null;
};

module.exports = { callAI, callAIJSON, generateImage, generateImageDetailed, withTimeout, DEFAULT_TIMEOUT_MS };
