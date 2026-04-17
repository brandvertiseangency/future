/**
 * Payment Routes — Razorpay integration.
 */
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const validate = require("../middleware/validate");
const schemas = require("../validators/schemas");
const paymentService = require("../services/paymentService");
const logger = require("../utils/logger");

/**
 * GET /payment/plans
 * Get available plans and pricing.
 */
router.get("/plans", (req, res) => {
  const plans = Object.entries(paymentService.PLAN_PRICING).map(
    ([name, info]) => ({
      plan: name,
      amount: info.amount / 100, // Convert paise to rupees
      currency: info.currency,
      credits: info.credits,
      description: info.description,
    })
  );

  res.json({ plans });
});

/**
 * POST /payment/create-order
 * Create a Razorpay order for plan upgrade.
 */
router.post(
  "/create-order",
  authMiddleware,
  validate(schemas.createOrder),
  async (req, res) => {
    try {
      const { plan } = req.body;
      const order = await paymentService.createOrder(req.user.uid, plan);
      res.json({ message: "Order created.", order });
    } catch (err) {
      logger.error("Create order failed", { error: err.message });
      res.status(500).json({ error: "Failed to create order.", details: err.message });
    }
  }
);

/**
 * POST /payment/verify
 * Verify payment and upgrade plan.
 */
router.post(
  "/verify",
  authMiddleware,
  validate(schemas.verifyPayment),
  async (req, res) => {
    try {
      const result = await paymentService.verifyPayment(req.user.uid, req.body);
      res.json({ message: "Payment verified. Plan upgraded!", ...result });
    } catch (err) {
      logger.error("Payment verification failed", { error: err.message });
      res.status(400).json({ error: "Payment verification failed.", details: err.message });
    }
  }
);

/**
 * POST /payment/webhook
 * Razorpay webhook handler.
 */
router.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  try {
    const signature = req.headers["x-razorpay-signature"];
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    const result = await paymentService.handleWebhook(body, signature);
    res.json(result);
  } catch (err) {
    logger.error("Webhook handling failed", { error: err.message });
    res.status(400).json({ error: "Webhook failed." });
  }
});

module.exports = router;
