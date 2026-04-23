/**
 * Brandvertise AI — Vision Analyser
 * Uses Claude Vision (primary) or Gemini Vision (fallback) to extract brand style
 */

const VISION_USER_PROMPT = `Analyse these brand reference images and extract the visual style profile.

Look for:
1. Dominant colour palette (list top 5 hex colours approximately)
2. Typography mood (serif_elegant / sans_modern / display_bold / script_personal / mono_technical)
3. Layout style (minimal_clean / busy_energetic / editorial_structured / grid_based / fullbleed_hero)
4. Photography style (lifestyle_candid / product_studio / editorial_fashion / food_closeup / architectural / documentary)
5. Mood keywords (list 5–8 words describing the overall feeling: e.g. warm, aspirational, energetic, luxurious, trustworthy)
6. Composition style (centered_hero / rule_of_thirds / flat_lay_overhead / portrait_close / wide_establishing)
7. Text density on images (heavy_text / moderate_text / minimal_text / text_free)
8. Dominant aesthetic label (one short phrase: e.g. "warm luxury editorial", "bold energetic youth", "minimal clean modern", "traditional festive Indian")

Respond ONLY with this exact JSON structure (no markdown, no explanation):
{
  "extractedColors": ["#hex1", "#hex2", "#hex3", "#hex4", "#hex5"],
  "fontMoodDetected": "one of the 5 options above",
  "layoutStyle": "one of the 5 options above",
  "photographyStyle": "one of the 6 options above",
  "moodKeywords": ["word1", "word2", "word3", "word4", "word5"],
  "compositionStyle": "one of the 5 options above",
  "textDensity": "one of the 4 options above",
  "dominantAesthetic": "short descriptive phrase"
}`;

const FALLBACK_PROFILE = {
  extractedColors: ['#000000', '#ffffff', '#888888', '#333333', '#cccccc'],
  fontMoodDetected: 'sans_modern',
  layoutStyle: 'minimal_clean',
  photographyStyle: 'lifestyle_candid',
  moodKeywords: ['modern', 'clean', 'professional', 'trustworthy', 'aspirational'],
  compositionStyle: 'rule_of_thirds',
  textDensity: 'minimal_text',
  dominantAesthetic: 'clean modern professional',
};

const { GoogleGenAI } = require('@google/genai');

async function analyseReferenceImages(imageBase64Array) {
  try {
    // ── Claude Vision (primary) ───────────────────────────────────────────────
    if (process.env.ANTHROPIC_API_KEY) {
      const Anthropic = require('@anthropic-ai/sdk');
      const client = new Anthropic.default({ apiKey: process.env.ANTHROPIC_API_KEY });
      const imageContents = imageBase64Array.slice(0, 8).map(base64 => {
        const mimeMatch = base64.match(/^data:([^;]+);base64,/);
        const media_type = (mimeMatch ? mimeMatch[1] : 'image/jpeg');
        const data = base64.replace(/^data:[^;]+;base64,/, '');
        return { type: 'image', source: { type: 'base64', media_type, data } };
      });
      const response = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 600,
        messages: [{ role: 'user', content: [...imageContents, { type: 'text', text: VISION_USER_PROMPT }] }],
      });
      const raw = response.content[0].text.replace(/```json\n?|\n?```/g, '').trim();
      try {
        const parsed = JSON.parse(raw);
        if (parsed.dominantAesthetic && parsed.moodKeywords) return parsed;
      } catch { /* fall through */ }
    }

    // ── Gemini Vision (fallback) ──────────────────────────────────────────────
    if (!process.env.GOOGLE_AI_API_KEY) {
      console.warn('Vision analysis skipped — no vision API key set');
      return FALLBACK_PROFILE;
    }

    const genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY });
    const parts = [{ text: VISION_USER_PROMPT }];
    for (const base64 of imageBase64Array.slice(0, 8)) {
      const mimeMatch = base64.match(/^data:([^;]+);base64,/);
      parts.push({ inlineData: { mimeType: mimeMatch ? mimeMatch[1] : 'image/jpeg', data: base64.replace(/^data:[^;]+;base64,/, '') } });
    }
    const result = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts }],
      config: { temperature: 0.1, maxOutputTokens: 500 },
    });
    const raw = (result.candidates?.[0]?.content?.parts?.[0]?.text || '').replace(/```json\n?|\n?```/g, '').trim();
    try {
      const parsed = JSON.parse(raw);
      if (parsed.dominantAesthetic && parsed.moodKeywords) return parsed;
    } catch { /* fall through */ }

    return FALLBACK_PROFILE;
  } catch (err) {
    console.error('Vision analysis failed:', err.message);
    return FALLBACK_PROFILE;
  }
}

module.exports = { analyseReferenceImages };
