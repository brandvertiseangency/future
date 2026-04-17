"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { fadeUpVariants, staggerContainer, EASE } from "@/lib/motion";

const CheckIcon = () => (
  <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const platforms = ["IG", "LI", "X", "FB", "PIN", "TK", "YT", "EM", "ADS", "SEO"];

const services = [
  {
    category: "AI Strategy",
    title: "AI Brand Strategy",
    desc: "Personalised content strategy built around your goals, industry and competitors. Updated monthly by AI.",
    bullets: ["Competitor analysis", "Monthly content calendar", "Platform-specific strategy"],
  },
  {
    category: "Content",
    title: "Content Marketing",
    desc: "Blogs, carousels, infographics, reel scripts — all generated on-brand and on-time without manual effort.",
    platforms: platforms,
  },
  {
    category: "Growth",
    title: "Performance Optimisation",
    desc: "AI continuously analyses what performs best and refines your content mix to maximise reach and conversions.",
    stat: { value: "3.8×", change: "+280%", label: "Average ROAS" },
    personImg: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&q=80",
  },
];

export default function Services() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      id="services"
      style={{ padding: "120px 0", background: "#050505" }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px" }}>
        <motion.div
          initial="hidden"
          animate={isInView ? "show" : "hidden"}
          variants={staggerContainer}
          style={{ marginBottom: 64, textAlign: "center" }}
        >
          <motion.span variants={fadeUpVariants} className="section-tag">Our Services</motion.span>
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
            Unlock your brand&apos;s true potential.
          </motion.h2>
        </motion.div>

        <motion.div
          initial="hidden"
          animate={isInView ? "show" : "hidden"}
          variants={staggerContainer}
          className="services-grid"
          style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}
        >
          {/* Card A */}
          <motion.div
            variants={fadeUpVariants}
            whileHover={{ y: -6, borderColor: "rgba(255,255,255,0.16)" }}
            transition={{ duration: 0.3, ease: EASE }}
            style={{
              background: "#0d0d0d",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 20,
              padding: 32,
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <span className="section-tag" style={{ marginBottom: 0, fontSize: 10 }}>{services[0].category}</span>
            <h4 style={{ fontSize: 20, fontWeight: 700, color: "#ffffff", margin: 0, letterSpacing: "-0.02em" }}>{services[0].title}</h4>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.75, margin: 0 }}>{services[0].desc}</p>
            <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 10, marginTop: "auto" }}>
              {services[0].bullets!.map((b) => (
                <li key={b} style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", display: "flex", alignItems: "center", gap: 9 }}>
                  <span style={{ color: "rgba(255,255,255,0.5)", display: "flex" }}><CheckIcon /></span>
                  {b}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Card B */}
          <motion.div
            variants={fadeUpVariants}
            whileHover={{ y: -6, borderColor: "rgba(255,255,255,0.16)" }}
            transition={{ duration: 0.3, ease: EASE }}
            style={{
              background: "#0d0d0d",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 20,
              padding: 32,
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <span className="section-tag" style={{ marginBottom: 0, fontSize: 10 }}>{services[1].category}</span>
            <h4 style={{ fontSize: 20, fontWeight: 700, color: "#ffffff", margin: 0, letterSpacing: "-0.02em" }}>{services[1].title}</h4>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.75, margin: 0 }}>{services[1].desc}</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8, marginTop: "auto" }}>
              {services[1].platforms!.map((label, i) => (
                <div
                  key={i}
                  style={{
                    width: "100%",
                    aspectRatio: "1",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 10,
                    fontWeight: 700,
                    color: "rgba(255,255,255,0.4)",
                    letterSpacing: "0.04em",
                  }}
                >
                  {label}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Card C */}
          <motion.div
            variants={fadeUpVariants}
            whileHover={{ y: -6, borderColor: "rgba(255,255,255,0.16)" }}
            transition={{ duration: 0.3, ease: EASE }}
            style={{
              background: "#0d0d0d",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 20,
              padding: 32,
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <span className="section-tag" style={{ marginBottom: 0, fontSize: 10 }}>{services[2].category}</span>
            <h4 style={{ fontSize: 20, fontWeight: 700, color: "#ffffff", margin: 0, letterSpacing: "-0.02em" }}>{services[2].title}</h4>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.75, margin: 0 }}>{services[2].desc}</p>
            <div
              style={{
                marginTop: "auto",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 14,
                padding: "20px 24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <p style={{ fontSize: 44, fontWeight: 800, color: "#ffffff", margin: 0, lineHeight: 1, letterSpacing: "-0.04em" }}>{services[2].stat!.value}</p>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 6 }}>{services[2].stat!.label}</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
                <span
                  style={{
                    background: "rgba(16,185,129,0.12)",
                    color: "#10b981",
                    fontSize: 12,
                    fontWeight: 600,
                    padding: "3px 10px",
                    borderRadius: 999,
                    border: "1px solid rgba(16,185,129,0.25)",
                  }}
                >
                  {services[2].stat!.change}
                </span>
                <img
                  src={services[2].personImg}
                  alt="Client"
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "1px solid rgba(255,255,255,0.12)",
                  }}
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 767px) {
          .services-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 1023px) and (min-width: 768px) {
          .services-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </section>
  );
}
