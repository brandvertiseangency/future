/**
 * Server-side checks for image-generation prompts before calling Google image APIs.
 * Conservative keyword / pattern matching — not a substitute for provider safety filters
 * or human review for edge cases.
 */

const BLOCKS = [
  { re: /\bdeep[\s_-]*fake(s)?\b/i, code: 'DEEPFAKE' },
  { re: /\bdeepfakes?\b/i, code: 'DEEPFAKE' },
  { re: /\bface[\s_-]*swap(ping|ped|s)?\b/i, code: 'FACE_SWAP' },
  { re: /\bfaceswap\b/i, code: 'FACE_SWAP' },
  { re: /\bundress(ing|er)?\b/i, code: 'NCII' },
  { re: /\bnude[\s_-]*if(y|ication)?\b/i, code: 'NCII' },
  { re: /\bremove\s+(her|his|their|the)\s+clothes\b/i, code: 'NCII' },
  { re: /\bwithout\s+clothes\b/i, code: 'NCII' },
  { re: /\bnon[\s_-]*consensual\b/i, code: 'NCII' },
  { re: /\brevenge\s+porn\b/i, code: 'NCII' },
  { re: /\bupskirt\b/i, code: 'NCII' },
  { re: /\bdownblouse\b/i, code: 'NCII' },
  { re: /\bhidden\s+camera\b/i, code: 'NCII' },
  { re: /\bpeeping\b/i, code: 'NCII' },
  { re: /\b(child|kid|minor|underage|loli|shota)\b.*\b(nude|naked|sex|porn)\b/i, code: 'CSAM' },
  { re: /\b(nude|naked|sex|porn)\b.*\b(child|kid|minor|underage)\b/i, code: 'CSAM' },
  { re: /\b(behead|beheading|gore|snuff|isis execution)\b/i, code: 'VIOLENCE' },
];

const DEFAULT_MESSAGE =
  'This image request was blocked because it may violate our Acceptable Use Policy (including rules against non-consensual or deceptive synthetic media). Please revise your brief.';

/**
 * @param {string} imagePrompt
 * @returns {{ ok: true } | { ok: false, code: string, message: string }}
 */
function checkImageGenerationPrompt(imagePrompt) {
  const text = String(imagePrompt ?? '');
  if (text.length > 400_000) {
    return {
      ok: false,
      code: 'PROMPT_TOO_LONG',
      message: 'Image prompt exceeds maximum length.',
    };
  }
  const normalized = text.toLowerCase();
  for (const { re, code } of BLOCKS) {
    if (re.test(normalized) || re.test(text)) {
      return { ok: false, code, message: DEFAULT_MESSAGE };
    }
  }
  return { ok: true };
}

module.exports = {
  checkImageGenerationPrompt,
  BLOCKS,
};
