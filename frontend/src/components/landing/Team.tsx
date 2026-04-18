"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { fadeUpVariants, staggerContainer, EASE } from "@/lib/motion";

const LinkedInIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const team = [
  { name: "Arjun Kapoor", role: "CEO & Co-Founder", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80", wide: true },
  { name: "Neha Verma", role: "CTO & Co-Founder", img: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&q=80", wide: false },
  { name: "Rohan Desai", role: "Head of Design", img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80", wide: false },
  { name: "Meera Iyer", role: "Head of Growth", img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80", wide: false },
  { name: "Vikram Singh", role: "Lead Engineer", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80", wide: false },
  { name: "Priya Nair", role: "Brand Strategist", img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80", wide: true },
];

export default function Team() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      id="team"
      style={{ padding: "120px 0", background: "#050505" }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px" }}>
        <motion.div
          initial="hidden"
          animate={isInView ? "show" : "hidden"}
          variants={staggerContainer}
          style={{ marginBottom: 64, textAlign: "center" }}
        >
          <motion.span variants={fadeUpVariants} className="section-tag">Our Team</motion.span>
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
            Meet the people behind the product.
          </motion.h2>
        </motion.div>

        <motion.div
          initial="hidden"
          animate={isInView ? "show" : "hidden"}
          variants={staggerContainer}
          className="team-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 14,
          }}
        >
          {team.map((m) => (
            <motion.div
              key={m.name}
              variants={fadeUpVariants}
              whileHover={{ y: -6, borderColor: "rgba(255,255,255,0.16)" }}
              transition={{ duration: 0.3, ease: EASE }}
              style={{
                background: "#0d0d0d",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 20,
                overflow: "hidden",
                gridColumn: m.wide ? "span 2" : "span 1",
              }}
            >
              <img
                src={m.img}
                alt={m.name}
                style={{
                  width: "100%",
                  height: m.wide ? 300 : 210,
                  objectFit: "cover",
                  objectPosition: "top",
                  display: "block",
                }}
              />
              <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#ffffff", letterSpacing: "-0.01em" }}>{m.name}</p>
                  <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{m.role}</p>
                </div>
                <a
                  href="#"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    border: "1px solid rgba(255,255,255,0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "rgba(255,255,255,0.4)",
                    textDecoration: "none",
                    transition: "border-color 0.2s, color 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLAnchorElement;
                    el.style.borderColor = "rgba(255,255,255,0.3)";
                    el.style.color = "#ffffff";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLAnchorElement;
                    el.style.borderColor = "rgba(255,255,255,0.1)";
                    el.style.color = "rgba(255,255,255,0.4)";
                  }}
                >
                  <LinkedInIcon />
                </a>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 767px) {
          .team-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .team-grid > div { grid-column: span 1 !important; }
        }
        @media (max-width: 479px) {
          .team-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
