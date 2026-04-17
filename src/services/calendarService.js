/**
 * Content Strategy Engine — Calendar Service
 * Generates structured content calendars via OpenAI and persists to Firestore.
 */
const OpenAI = require("openai");
const { db, initialized } = require("../config/firebase");
const config = require("../config");
const logger = require("../utils/logger");
const { v4: uuidv4 } = require("uuid");

const openai = new OpenAI({ apiKey: config.openai.apiKey });

const CALENDAR_COLLECTION = "content_calendars";
const POSTS_COLLECTION = "posts";

/**
 * Generate a content calendar for a brand and persist to Firestore.
 */
async function generateCalendar(userId, brandId, planType = "free") {
  const numPosts = config.plans[planType]?.calendarPosts || 7;

  // Fetch brand data
  let brand;
  if (initialized) {
    const brandDoc = await db.collection("brands").doc(brandId).get();
    if (!brandDoc.exists) throw new Error("Brand not found");
    brand = { id: brandDoc.id, ...brandDoc.data() };
    if (brand.user_id !== userId) throw new Error("Unauthorized brand access");
  } else {
    brand = {
      id: brandId,
      brand_name: "Test Brand",
      industry: "Tech",
      target_audience: "Developers",
      goals: "Awareness",
      tone: "Professional",
      design_preference: "modern",
      competitor_data: "",
    };
  }

  // Call OpenAI
  const calendar = await callOpenAICalendar(brand, numPosts);

  // Persist calendar + posts
  const calendarId = initialized
    ? await persistCalendar(userId, brandId, planType, calendar)
    : uuidv4();

  logger.info("Calendar generated and persisted", {
    calendarId,
    totalPosts: calendar.length,
  });

  return {
    calendar_id: calendarId,
    total_posts: calendar.length,
    posts: calendar,
  };
}

/**
 * Call OpenAI to generate the calendar content.
 */
async function callOpenAICalendar(brand, numPosts) {
  const systemPrompt = `You are a senior social media strategist and creative director.
Your job is to create detailed, platform-ready content calendars.
Always respond with valid JSON only — no markdown, no code fences, no extra text.`;

  const userPrompt = `Create a ${numPosts}-post social media content calendar for:

Brand Name: ${brand.brand_name}
Industry: ${brand.industry}
Target Audience: ${brand.target_audience}
Campaign Goals: ${brand.goals}
Brand Tone: ${brand.tone || "professional"}
Design Preference: ${brand.design_preference || "modern"}
${brand.competitor_data ? `Competitor Context: ${brand.competitor_data}` : ""}

Return a JSON array with exactly ${numPosts} objects. Each object:
{
  "day": "Day N",
  "type": "static | carousel | reel",
  "idea": "One-line concept",
  "caption": "Full ready-to-post caption with emojis and hashtags",
  "visual_direction": "Detailed visual direction (lighting, mood, composition, colors, props, camera angle)",
  "product_tag": "Product or service to feature (if applicable)"
}

Rules:
- Mix types: roughly 40% static, 30% carousel, 30% reel
- Captions must feel natural, engaging, and on-brand
- Visual directions must be highly descriptive for AI image generation
- Make it specific to the industry — no generic filler
- Each post should build on the previous one for campaign cohesion`;

  logger.info("Calling OpenAI for content calendar", {
    brand: brand.brand_name,
    numPosts,
  });

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.8,
    response_format: { type: "json_object" },
  });

  const rawContent = response.choices[0].message.content;

  logger.info("OpenAI calendar response received", {
    usage: response.usage,
    finish_reason: response.choices[0].finish_reason,
  });

  return parseCalendarResponse(rawContent);
}

/**
 * Normalize OpenAI JSON response into a consistent array.
 */
function parseCalendarResponse(raw) {
  const parsed = JSON.parse(raw);
  let calendar;

  if (Array.isArray(parsed)) {
    calendar = parsed;
  } else {
    const keys = ["calendar", "posts", "content_calendar", "content"];
    for (const key of keys) {
      if (parsed[key] && Array.isArray(parsed[key])) {
        calendar = parsed[key];
        break;
      }
    }
    if (!calendar) {
      const firstArr = Object.values(parsed).find((v) => Array.isArray(v));
      if (firstArr) calendar = firstArr;
    }
    if (!calendar && parsed.day && parsed.type) {
      calendar = [parsed];
    }
  }

  if (!Array.isArray(calendar) || calendar.length === 0) {
    throw new Error("Failed to parse calendar from OpenAI response");
  }

  return calendar.map((post) => ({
    day: post.day || "Day ?",
    type: normalizeType(post.type || post.post_type),
    idea: post.idea || "",
    caption: post.caption || "",
    visual_direction: post.visual_direction || "",
    product_tag: post.product_tag || "",
  }));
}

function normalizeType(type) {
  const t = (type || "static").toLowerCase().trim();
  if (t.includes("reel") || t.includes("video")) return "reel";
  if (t.includes("carousel")) return "carousel";
  return "static";
}

/**
 * Persist calendar and posts to Firestore.
 */
async function persistCalendar(userId, brandId, planType, posts) {
  const calendarRef = db.collection(CALENDAR_COLLECTION).doc();
  const calendarId = calendarRef.id;

  const calendarData = {
    user_id: userId,
    brand_id: brandId,
    plan: planType,
    total_posts: posts.length,
    approved: false,
    created_at: new Date().toISOString(),
  };

  const batch = db.batch();
  batch.set(calendarRef, calendarData);

  for (const post of posts) {
    const postRef = db.collection(POSTS_COLLECTION).doc();
    batch.set(postRef, {
      calendar_id: calendarId,
      day: post.day,
      type: post.type,
      idea: post.idea,
      caption: post.caption,
      visual_direction: post.visual_direction,
      product_tag: post.product_tag,
      prompt: "",
      output_urls: [],
      status: "pending",
      regeneration_count: 0,
      created_at: new Date().toISOString(),
    });
  }

  await batch.commit();
  return calendarId;
}

/**
 * Get calendar with its posts.
 */
async function getCalendar(calendarId, userId) {
  if (!initialized) return null;

  const calDoc = await db
    .collection(CALENDAR_COLLECTION)
    .doc(calendarId)
    .get();
  if (!calDoc.exists) return null;

  const calData = calDoc.data();
  if (calData.user_id !== userId) return null;

  const postsSnap = await db
    .collection(POSTS_COLLECTION)
    .where("calendar_id", "==", calendarId)
    .orderBy("created_at", "asc")
    .get();

  const posts = postsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

  return { id: calDoc.id, ...calData, posts };
}

/**
 * Update calendar — approve or edit posts.
 */
async function updateCalendar(calendarId, userId, updates) {
  if (!initialized) return null;

  const calendar = await getCalendar(calendarId, userId);
  if (!calendar) return null;

  const batch = db.batch();

  if (updates.approved !== undefined) {
    batch.update(db.collection(CALENDAR_COLLECTION).doc(calendarId), {
      approved: updates.approved,
    });
  }

  if (updates.posts && Array.isArray(updates.posts)) {
    for (const postUpdate of updates.posts) {
      const { post_id, ...fields } = postUpdate;
      if (!post_id) continue;

      const allowedFields = ["idea", "caption", "visual_direction", "type"];
      const filtered = {};
      for (const key of allowedFields) {
        if (fields[key] !== undefined) filtered[key] = fields[key];
      }

      if (Object.keys(filtered).length > 0) {
        batch.update(db.collection(POSTS_COLLECTION).doc(post_id), filtered);
      }
    }
  }

  await batch.commit();
  logger.info("Calendar updated", { calendarId });
  return getCalendar(calendarId, userId);
}

module.exports = {
  generateCalendar,
  getCalendar,
  updateCalendar,
};
