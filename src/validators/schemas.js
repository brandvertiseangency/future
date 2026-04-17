/**
 * Joi validation schemas for all API endpoints.
 */
const Joi = require("joi");

const brandCreate = Joi.object({
  brand_name: Joi.string().trim().min(1).max(100).required(),
  industry: Joi.string().trim().min(1).max(100).required(),
  target_audience: Joi.string().trim().min(1).max(500).required(),
  goals: Joi.string().trim().min(1).max(1000).required(),
  tone: Joi.string().trim().max(200).default("professional and engaging"),
  color_style: Joi.string().trim().max(200).optional(),
  design_preference: Joi.string()
    .trim()
    .max(500)
    .default("modern and minimal"),
  competitor_data: Joi.string().trim().max(1000).optional(),
});

const calendarGenerate = Joi.object({
  brand_id: Joi.string().trim().required(),
  plan_type: Joi.string()
    .valid("free", "standard", "premium")
    .default("free"),
});

const calendarUpdate = Joi.object({
  calendar_id: Joi.string().trim().required(),
  approved: Joi.boolean().optional(),
  posts: Joi.array()
    .items(
      Joi.object({
        post_id: Joi.string().trim().required(),
        idea: Joi.string().trim().optional(),
        caption: Joi.string().trim().optional(),
        visual_direction: Joi.string().trim().optional(),
        type: Joi.string().valid("static", "carousel", "reel").optional(),
      })
    )
    .optional(),
});

const generateCreatives = Joi.object({
  calendar_id: Joi.string().trim().required(),
});

const postRegenerate = Joi.object({
  post_id: Joi.string().trim().required(),
  feedback: Joi.string().trim().min(1).max(2000).required(),
});

const schedulePosts = Joi.object({
  calendar_id: Joi.string().trim().required(),
  profile_ids: Joi.array().items(Joi.string().trim()).min(1).required(),
  schedule_times: Joi.object().pattern(
    Joi.string(),
    Joi.string().isoDate()
  ).optional(),
});

const createOrder = Joi.object({
  plan: Joi.string().valid("standard", "premium").required(),
});

const verifyPayment = Joi.object({
  razorpay_order_id: Joi.string().required(),
  razorpay_payment_id: Joi.string().required(),
  razorpay_signature: Joi.string().required(),
});

module.exports = {
  brandCreate,
  calendarGenerate,
  calendarUpdate,
  generateCreatives,
  postRegenerate,
  schedulePosts,
  createOrder,
  verifyPayment,
};
