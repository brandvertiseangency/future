/**
 * Shared AI helper — Claude claude-sonnet-4-20250514 primary, Gemini flash fallback
 *
 * callAI(prompt, opts)   → text string
 * callAIJSON(prompt, opts) → parsed object (auto-extracts JSON)
 */

const DEFAULT_TIMEOUT_MS = 45_000;
const TEXT_MODEL = 'claude-sonnet-4-20250514';
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
 * Call Claude claude-sonnet-4-20250514 (primary) or Gemini flash (fallback).
 * @param {string|{system:string,user:string}} prompt
 * @param {{ maxTokens?: number, timeoutMs?: number, jsonMode?: boolean }} opts
 * @returns {Promise<string>}
 */
const callAI = async (prompt, opts = {}) => {
  const { maxTokens = 2048, timeoutMs = DEFAULT_TIMEOUT_MS } = opts;
  const systemPrompt = typeof prompt === 'object' ? prompt.system : undefined;
  const userPrompt = typeof prompt === 'object' ? prompt.user : prompt;

  // ── Claude (primary) ──────────────────────────────────────────────────────
  if (process.env.ANTHROPIC_API_KEY) {
    const Anthropic = require('@anthropic-ai/sdk');
    const client = new Anthropic.default({ apiKey: process.env.ANTHROPIC_API_KEY });
    const messages = [{ role: 'user', content: userPrompt }];
    const params = { model: TEXT_MODEL, max_tokens: maxTokens, messages };
    if (systemPrompt) params.system = systemPrompt;
    const response = await withTimeout(client.messages.create(params), timeoutMs);
    return response.content[0].text;
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

  throw new Error('No AI provider configured. Set ANTHROPIC_API_KEY or GOOGLE_AI_API_KEY.');
};

/**
 * Same as callAI but automatically parses and returns JSON.
 */
const callAIJSON = async (prompt, opts = {}) => {
  const raw = await callAI(prompt, opts);
  try {
    const match = raw.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    return JSON.parse(match ? match[0] : raw);
  } catch {
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
