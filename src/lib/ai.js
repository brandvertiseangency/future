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
 * Generate an image using Imagen (requires GOOGLE_AI_API_KEY).
 * Returns base64 data URL or null.
 */
const generateImage = async (imagePrompt, opts = {}) => {
  if (!process.env.GOOGLE_AI_API_KEY) return null;
  const { timeoutMs = DEFAULT_TIMEOUT_MS, aspectRatio = '1:1' } = opts;
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
    return b64 ? `data:image/jpeg;base64,${b64}` : null;
  } catch (err) {
    const logger = require('../utils/logger');
    logger.warn('Imagen generation failed', { error: err.message });
    return null;
  }
};

module.exports = { callAI, callAIJSON, generateImage, withTimeout, DEFAULT_TIMEOUT_MS };
