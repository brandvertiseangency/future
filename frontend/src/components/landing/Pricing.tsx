"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { fadeUpVariants, staggerContainer, EASE } from "@/lib/motion";

const CheckIcon = () => (
  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const plans = [
  {
    name: "Starter",
    badge: "Basic",
    price: "₹999",
    period: "/mo",
    tagline: "Perfect for solopreneurs and early-stage brands.",
    features: [
      "1 Brand Profile",
      "30 AI posts/month",
      "Instagram & LinkedIn",
      "Basic Analytics",
    ],
    cta: "Start Free Trial",
    highlighted: false,
  },
  {
    name: "Growth",
    badge: "Most Popular",
    price: "₹2,999",
    period: "/mo",
    tagline: "Built for growing brands that need more firepower.",
    features: [
      "5 Brand Profiles",
      "200 AI posts/month",
      "All 5 platforms",
      "Advanced Analytics",
      "Custom Brand Kit",
    ],
    cta: "Start Free Trial",
    highlighted: true,
  },
];

export default function Pricing() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      id="pricing"
      style={{ padding: "120px 0", background: "#050505" }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px" }}>
        <motion.div
          initial="hidden"
          animate={isInView ? "show" : "hidden"}
          variants={staggerContainer}
          style={{ marginBottom: 64, textAlign: "center" }}
        >
          <motion.span variants={fadeUpVariants} className="section-tag">
            Pricing Plans
          </motion.span>
          <motion.h2
            variants={fadeUpVariants}
            style={{
              fontSize: "clamp(32px, 4.5vw, 56px)",
              fontWeight: 800,
              lineHeight: 1.08,
              color: "#ffffff",
              letterSpacing: "-0.04em",
              margin: 0,
            }}
          >
            Simple, transparent pricing.
          </motion.h2>
          <motion.p
            variants={fadeUpVariants}
            style={{ fontSize: 16, color: "rgba(255,255,255,0.45)", marginTop: 12 }}
          >
            Start free for 14 days. No credit card required.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          animate={isInView ? "show" : "hidden"}
          variants={staggerContainer}
          className="pricing-grid"
          style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14, maxWidth: 820, margin: "0 auto" }}
        >
          {plans.map((plan, idx) => (
            <motion.div
              key={plan.name}
              variants={fadeUpVariants}
              whileHover={{ y: -8 }}
              transition={{ duration: 0.3, ease: EASE }}
              style={{
                background: plan.highlighted ? "#0f0f0f" : "#0d0d0d",
                border: plan.highlighted ? "1px solid rgba(255,255,255,0.2)" : "1px solid rgba(255,255,255,0.07)",
                borderRadius: 20,
                padding: "36px 32px",
                display: "flex",
                flexDirection: "column",
                gap: 24,
                position: "relative",
                boxShadow: plan.highlighted ? "0 0 60px rgba(255,255,255,0.04), 0 32px 80px rgba(0,0,0,0.5)" : "none",
              }}
            >
              {/* Popular badge */}
              {plan.highlighted && (
                <div
                  style={{
                    position: "absolute",
                    top: -1,
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "#ffffff",
                    color: "#000000",
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    padding: "4px 14px",
                    borderRadius: "0 0 10px 10px",
                  }}
                >
                  Most Popular
                </div>
              )}

              {/* Plan name */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: plan.highlighted ? 12 : 0 }}>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: "#ffffff", margin: 0, letterSpacing: "-0.02em" }}>{plan.name}</h3>
                {!plan.highlighted && (
                  <span
                    style={{
                      background: "rgba(255,255,255,0.07)",
                      color: "rgba(255,255,255,0.5)",
                      fontSize: 11,
                      fontWeight: 600,
                      padding: "3px 10px",
                      borderRadius: 999,
                      letterSpacing: "0.04em",
                    }}
                  >
                    {plan.badge}
                  </span>
                )}
              </div>

              {/* Price */}
              <div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                  <span style={{ fontSize: 52, fontWeight: 800, color: "#ffffff", letterSpacing: "-0.04em", lineHeight: 1 }}>
                    {plan.price}
                  </span>
                  <span style={{ fontSize: 15, color: "rgba(255,255,255,0.35)" }}>{plan.period}</span>
                </div>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 6, lineHeight: 1.6 }}>{plan.tagline}</p>
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: "rgba(255,255,255,0.06)" }} />

              {/* Features */}
              <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 11 }}>
                {plan.features.map((f) => (
                  <li key={f} style={{ fontSize: 14, color: "rgba(255,255,255,0.65)", display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ color: "rgba(255,255,255,0.6)", flexShrink: 0, display: "flex" }}>
                      <CheckIcon />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <a
                href="#"
                style={{ marginTop: "auto" }}
                className={plan.highlighted ? "btn-primary" : "btn-outline"}
              >
                {plan.cta}
              </a>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 639px) {
          .pricing-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
