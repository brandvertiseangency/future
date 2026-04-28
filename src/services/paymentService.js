/**
 * Payment Service — Razorpay integration.
 */
const Razorpay = require("razorpay");
const crypto = require("crypto");
const config = require("../config");
const logger = require("../utils/logger");
const userService = require("./userService");

let razorpay = null;

function getRazorpay() {
  if (razorpay) return razorpay;

  if (!config.razorpay.keyId || !config.razorpay.keySecret) {
    logger.warn("Razorpay not configured");
    return null;
  }

  razorpay = new Razorpay({
    key_id: config.razorpay.keyId,
    key_secret: config.razorpay.keySecret,
  });

  return razorpay;
}

/**
 * Plan pricing (in paise — Indian currency smallest unit).
 */
const PLAN_PRICING = {
  standard: {
    amount: 99900, // ₹999
    currency: "INR",
    credits: config.credits.standard,
    description: "Brandvertise Standard Plan — 100 credits",
  },
  premium: {
    amount: 249900, // ₹2,499
    currency: "INR",
    credits: config.credits.premium,
    description: "Brandvertise Premium Plan — 500 credits",
  },
};

/**
 * Create a Razorpay order.
 */
async function createOrder(uid, plan) {
  const rz = getRazorpay();
  if (!rz) {
    throw new Error("Payment system not configured");
  }

  const pricing = PLAN_PRICING[plan];
  if (!pricing) {
    throw new Error(`Invalid plan: ${plan}`);
  }

  const order = await rz.orders.create({
    amount: pricing.amount,
    currency: pricing.currency,
    receipt: `brandvertise_${uid}_${Date.now()}`,
    notes: {
      user_id: uid,
      plan,
      credits: pricing.credits.toString(),
    },
  });

  logger.info("Razorpay order created", {
    orderId: order.id,
    plan,
    amount: pricing.amount,
  });

  return {
    order_id: order.id,
    amount: pricing.amount,
    currency: pricing.currency,
    plan,
    credits: pricing.credits,
    description: pricing.description,
    key_id: config.razorpay.keyId,
  };
}

/**
 * Verify Razorpay payment signature and upgrade user.
 */
async function verifyPayment(uid, { razorpay_order_id, razorpay_payment_id, razorpay_signature }) {
  const rz = getRazorpay();
  if (!rz) {
    throw new Error("Payment system not configured");
  }

  // Verify signature
  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", config.razorpay.keySecret)
    .update(body)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    logger.error("Payment signature verification failed", {
      uid,
      orderId: razorpay_order_id,
    });
    throw new Error("Payment verification failed — invalid signature");
  }

  // Fetch order to get plan details
  const order = await rz.orders.fetch(razorpay_order_id);
  const plan = order.notes?.plan;
  const credits = parseInt(order.notes?.credits, 10) || 0;

  if (!plan || !credits) {
    throw new Error("Invalid order metadata");
  }

  // Upgrade user
  await userService.upgradePlan(uid, plan);

  logger.info("Payment verified & user upgraded", {
    uid,
    plan,
    credits,
    paymentId: razorpay_payment_id,
  });

  return {
    verified: true,
    plan,
    credits,
    payment_id: razorpay_payment_id,
    order_id: razorpay_order_id,
  };
}

/**
 * Handle Razorpay webhook events.
 */
async function handleWebhook(body, signature, rawBody) {
  if (!config.razorpay.webhookSecret) {
    logger.warn("Webhook secret not configured");
    return { handled: false };
  }

  // Verify webhook signature
  const payloadForSignature = rawBody || JSON.stringify(body);
  const expectedSig = crypto
    .createHmac("sha256", config.razorpay.webhookSecret)
    .update(payloadForSignature)
    .digest("hex");

  if (expectedSig !== signature) {
    throw new Error("Webhook signature mismatch");
  }

  const event = body.event;
  logger.info("Razorpay webhook received", { event });

  if (event === "payment.captured") {
    const payment = body.payload.payment.entity;
    const uid = payment.notes?.user_id;
    const plan = payment.notes?.plan;

    if (uid && plan) {
      await userService.upgradePlan(uid, plan);
      logger.info("User upgraded via webhook", { uid, plan });
    }
  }

  return { handled: true, event };
}

module.exports = {
  createOrder,
  verifyPayment,
  handleWebhook,
  PLAN_PRICING,
};
