"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { fadeUpVariants, staggerContainer, EASE } from "@/lib/motion";

const BrainIcon = () => (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611l-1.594.267a9 9 0 01-2.985.018l-.214-.027" />
  </svg>
);

const ZapIcon = () => (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
  </svg>
);

const GlobeIcon = () => (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
  </svg>
);

const platforms = ["Instagram", "LinkedIn", "Twitter/X", "Facebook", "Pinterest", "TikTok", "YouTube", "Instagram", "LinkedIn", "Twitter/X"];

export default function Features() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      id="features"
      style={{ padding: "120px 0", background: "#050505" }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px" }}>
        {/* Header */}
        <motion.div
          initial="hidden"
          animate={isInView ? "show" : "hidden"}
          variants={staggerContainer}
          style={{ marginBottom: 64 }}
        >
          <motion.span variants={fadeUpVariants} className="section-tag">
            Why Brandvertise?
          </motion.span>
          <motion.h2
            variants={fadeUpVariants}
            style={{
              fontSize: "clamp(32px, 4.5vw, 56px)",
              fontWeight: 800,
              lineHeight: 1.08,
              color: "#ffffff",
              letterSpacing: "-0.04em",
              maxWidth: 600,
              margin: 0,
            }}
          >
            Why the <em className="accent">fastest growing</em> teams choose us.
          </motion.h2>
        </motion.div>

        {/* Bento grid */}
        <motion.div
          initial="hidden"
          animate={isInView ? "show" : "hidden"}
          variants={staggerContainer}
          className="bento-outer"
          style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 14 }}
        >
          {/* 2×2 left grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.4fr 1fr",
              gridTemplateRows: "auto auto",
              gap: 14,
            }}
          >
            {/* Card 1 — tall left */}
            <motion.div
              variants={fadeUpVariants}
              whileHover={{ y: -6 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="gradient-border"
              style={{
                gridRow: "span 2",
                padding: 32,
                display: "flex",
                flexDirection: "column",
                gap: 20,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: "rgba(255,255,255,0.07)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "rgba(255,255,255,0.7)",
                }}
              >
                <BrainIcon />
              </div>
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: "#ffffff", marginBottom: 10, letterSpacing: "-0.02em" }}>
                  Brand Intelligence
                </h3>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.75 }}>
                  Upload your brand kit once. AI learns your voice, colors and messaging — used in every piece of content forever.
                </p>
              </div>
              <div style={{ marginTop: "auto" }}>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>Content Performance</p>
                <svg width="100%" height="72" viewBox="0 0 240 72" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {[18, 36, 26, 54, 46, 68, 60, 72].map((h, i) => (
                    <rect key={i} x={i * 30 + 2} y={72 - h} width={22} height={h} rx={4}
                      fill={i === 7 ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.1)"} />
                  ))}
                </svg>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
                  <span style={{ fontSize: 28, fontWeight: 800, color: "#ffffff", letterSpacing: "-0.04em" }}>+80%</span>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 11px", borderRadius: 999, background: "rgba(0,212,255,0.12)", border: "1px solid rgba(0,212,255,0.25)", color: "#67e8f9", alignSelf: "flex-end", marginBottom: 3 }}>engagement lift</span>
                </div>
              </div>
            </motion.div>

            {/* Card 2 — top right */}
            <motion.div
              variants={fadeUpVariants}
              whileHover={{ y: -6 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="gradient-border"
              style={{
                padding: 28,
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: "rgba(255,255,255,0.07)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "rgba(255,255,255,0.7)",
                }}
              >
                <ZapIcon />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: "#ffffff", letterSpacing: "-0.02em" }}>AI Creative Generation</h3>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.65 }}>
                Generate polished visuals and captions in seconds.
              </p>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: "auto" }}>
                {[
                  { label: "10x faster", style: { background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.25)", color: "#93c5fd" } },
                  { label: "99.9% uptime", style: { background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.25)", color: "#6ee7b7" } },
                  { label: "2x ROI", style: { background: "rgba(0,212,255,0.12)", border: "1px solid rgba(0,212,255,0.25)", color: "#67e8f9" } },
                ].map((pill) => (
                  <span
                    key={pill.label}
                    style={{
                      borderRadius: 999,
                      padding: "3px 11px",
                      fontSize: 11,
                      fontWeight: 600,
                      ...pill.style,
                    }}
                  >
                    {pill.label}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Card 3 — bottom left */}
            <motion.div
              variants={fadeUpVariants}
              whileHover={{ y: -6 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="gradient-border"
              style={{
                padding: 28,
                display: "flex",
                flexDirection: "column",
                gap: 14,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: "rgba(255,255,255,0.07)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "rgba(255,255,255,0.7)",
                }}
              >
                <GlobeIcon />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: "#ffffff", letterSpacing: "-0.02em" }}>Multi-Platform Publish</h3>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.65 }}>
                Instagram, LinkedIn, Twitter/X, Facebook, Pinterest — one hub.
              </p>
              <div style={{ overflow: "hidden", maskImage: "linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)" }}>
                <div className="animate-marquee-logos" style={{ display: "flex", gap: 10, width: "max-content" }}>
                  {[...platforms, ...platforms].map((item, i) => (
                    <span
                      key={i}
                      style={{
                        whiteSpace: "nowrap",
                        fontSize: 12,
                        fontWeight: 500,
                        color: "rgba(255,255,255,0.45)",
                        border: "1px solid rgba(255,255,255,0.09)",
                        borderRadius: 999,
                        padding: "3px 11px",
                      }}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Side panel */}
          <motion.div
            variants={fadeUpVariants}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="bento-side gradient-border"
            style={{
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <img
              src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&q=80"
              alt="Expert team"
              className="img-cinematic"
              style={{ width: "100%", height: 220, objectFit: "cover", borderRadius: "20px 20px 0 0", border: "none" }}
            />
            <div style={{ padding: "28px" }}>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: "#ffffff", marginBottom: 10, letterSpacing: "-0.02em" }}>
                Scale with our expert team
              </h3>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, marginBottom: 20 }}>
                World-class AI engineers and brand strategists behind every feature.
              </p>
              <a href="#pricing" className="btn-primary" style={{ fontSize: 13, padding: "10px 20px" }}>
                Get Started
              </a>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 1023px) {
          .bento-outer { grid-template-columns: 1fr !important; }
          .bento-side { display: none !important; }
        }
        @media (max-width: 639px) {
          .bento-outer > div:first-child { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
