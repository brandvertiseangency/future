/**
 * Prompt Engine — The heart of creative quality.
 * Builds highly detailed generation prompts for AI image/video models.
 *
 * buildPrompt(post, brand, assets) → string
 */
const logger = require("../utils/logger");

/**
 * Build a comprehensive AI image generation prompt.
 *
 * @param {object} post    - Post object from calendar
 * @param {object} brand   - Brand profile
 * @param {object[]} assets - Array of asset objects (logos, products, references)
 * @param {string} [feedback] - Optional regeneration feedback
 * @returns {string}
 */
function buildPrompt(post, brand, assets = [], feedback = null) {
  const {
    type = "static",
    idea = "",
    visual_direction = "",
    product_tag = "",
  } = post;

  const {
    brand_name = "Brand",
    industry = "General",
    target_audience = "General audience",
    tone = "professional and engaging",
    color_style = "",
    design_preference = "modern and minimal",
    goals = "",
  } = brand;

  // ── Categorize assets ─────────────────────────────────────────────────
  const logos = assets.filter((a) => a.type === "logo");
  const products = assets.filter((a) => a.type === "product");
  const references = assets.filter((a) => a.type === "reference");

  // ── Reference block ───────────────────────────────────────────────────
  const referenceBlock =
    references.length > 0
      ? `Style References (draw visual inspiration from these):
${references.map((r, i) => `  - Reference ${i + 1}: ${r.file_url}${r.tags ? ` (${r.tags})` : ""}`).join("\n")}
Emulate the lighting, color palette, composition, and overall aesthetic.`
      : `No external references. Use premium ${industry} industry aesthetics.`;

  // ── Product placement ─────────────────────────────────────────────────
  const productBlock =
    products.length > 0
      ? `Product Placement (feature prominently):
${products.map((p, i) => `  - Product ${i + 1}: ${p.file_url}${p.tags ? ` (${p.tags})` : ""}`).join("\n")}
Product must be the hero — well-lit, clearly visible, center of composition.`
      : product_tag
        ? `Product Focus: ${product_tag}. Show it as the hero of the composition.`
        : "Focus on lifestyle/brand storytelling imagery.";

  // ── Logo integration ──────────────────────────────────────────────────
  const logoBlock =
    logos.length > 0
      ? `Brand Identity: Subtly integrate brand visual identity. Do NOT overlay logo as text.`
      : "";

  // ── Color guidance ────────────────────────────────────────────────────
  const colorBlock = color_style
    ? `Color Palette: ${color_style}. Maintain strict color consistency.`
    : `Color Palette: Use sophisticated, industry-appropriate tones for ${industry}.`;

  // ── Post type specific guidance ───────────────────────────────────────
  const typeGuidance = getTypeGuidance(type);

  // ── Feedback modifier ─────────────────────────────────────────────────
  const feedbackBlock = feedback
    ? `\n🔄 REGENERATION FEEDBACK (PRIORITY — override defaults):\n${feedback}\n`
    : "";

  // ── Build the final prompt ────────────────────────────────────────────
  const prompt = `Professional commercial-grade ${type} creative for social media.

BRAND CONTEXT:
- Brand: ${brand_name}
- Industry: ${industry}
- Audience: ${target_audience}
- Brand Tone: ${tone}
- Design Style: ${design_preference}
${goals ? `- Campaign Goal: ${goals}` : ""}

CONCEPT:
${idea}

CREATIVE DIRECTION:
${visual_direction}

${referenceBlock}

${productBlock}

${logoBlock}

${colorBlock}

${typeGuidance}

TECHNICAL SPECIFICATIONS:
- Camera Angle: Dynamic — slight low-angle for aspiration, eye-level for connection, overhead for flat-lay
- Lighting: Cinematic soft light with intentional highlights; golden-hour warmth or clean studio lighting
- Mood: ${tone} — emotionally resonant with ${target_audience}
- Composition: Rule of thirds; clear subject with negative space for caption overlay
- Background: Clean, uncluttered, complementary to brand palette; depth of field blur on non-essential elements
- Styling: Premium, contemporary, editorial quality — not over-processed
- Color Grading: Rich, cohesive, brand-aligned tones
- Texture: Subtle grain for authenticity; avoid hyper-smooth AI look
- Aspect Ratio: ${getAspectRatio(type)}
${feedbackBlock}
STRICT RULES:
- Do NOT include: text overlays, watermarks, logos, distorted faces, extra limbs
- Do NOT generate nsfw, violent, or inappropriate content
- Output a single high-quality photorealistic image`;

  logger.info("Prompt built", {
    type,
    idea: idea.substring(0, 60),
    prompt_length: prompt.length,
    has_references: references.length > 0,
    has_products: products.length > 0,
    has_feedback: !!feedback,
  });

  return prompt;
}

/**
 * Type-specific creative guidance.
 */
function getTypeGuidance(type) {
  const guidance = {
    static: `FORMAT: Single static image post
- Hero composition — one clear focal point
- Space for caption overlay (bottom or side)
- Bold, scroll-stopping visual impact`,
    carousel: `FORMAT: Carousel slide image
- Clean, consistent visual style across slides
- Each slide should work standalone AND as part of a series
- Use clear visual hierarchy with breathing room`,
    reel: `FORMAT: Video-style thumbnail / key frame
- Dynamic, motion-implied composition
- High energy, trend-aware aesthetic
- Vertical orientation, mobile-first framing`,
  };

  return guidance[type] || guidance.static;
}

/**
 * Get the recommended aspect ratio for the content type.
 */
function getAspectRatio(type) {
  const ratios = {
    static: "1:1 (Instagram Feed Square)",
    carousel: "1:1 or 4:5 (Instagram Carousel)",
    reel: "9:16 (Vertical / Reels / Stories)",
  };
  return ratios[type] || "1:1";
}

// Keep backward compatibility
function buildImagePrompt(input, post, feedback = null) {
  return buildPrompt(
    { ...post, type: post.post_type || post.type },
    {
      brand_name: input.brand_name,
      industry: input.industry,
      target_audience: input.target_audience,
    },
    [
      ...(input.references || []).map((url) => ({ type: "reference", file_url: url })),
      ...(input.product_images || []).map((url) => ({ type: "product", file_url: url })),
    ],
    feedback
  );
}

module.exports = { buildPrompt, buildImagePrompt };
