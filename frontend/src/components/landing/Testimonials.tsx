"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { fadeUpVariants, staggerContainer } from "@/lib/motion";

const featured = {
  quote: "Brandvertise AI completely replaced our social media agency. We went from spending ₹50k/month on a designer to ₹2,999 — and our engagement doubled in 60 days. It doesn't just generate content, it generates the right content, every time.",
  name: "Priya Sharma",
  title: "Founder, Bloom Beauty Co.",
  img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80",
  stars: 5,
};

const textTestimonials = [
  { name: "Rahul Mehta", role: "CMO, TechScale SaaS", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80", quote: "We use it for 8 client brands. The brand intelligence is genuinely impressive — it doesn't generate generic content, it sounds like each individual brand.", stars: 5 },
  { name: "Aisha Khan", role: "Director, Wanderlust Agency", img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&q=80", quote: "The white-label dashboard on the Agency plan is a game changer. Our clients think we have a 10-person design team. We have Brandvertise AI and one junior manager.", stars: 5 },
];

const videoTestimonials = [
  { name: "Vikram Nair", role: "E-commerce Lead, Spice Trail", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&q=80" },
  { name: "Sneha Patel", role: "Personal Brand Coach", img: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&q=80" },
];

const Stars = ({ count }: { count: number }) => (
  <div style={{ display: "flex", gap: 3 }}>
    {Array.from({ length: count }).map((_, i) => (
      <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill="#e8e0d0">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ))}
  </div>
);

export default function Testimonials() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      id="testimonials"
      style={{ padding: "120px 0", background: "#050505" }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px" }}>
        <motion.div
          initial="hidden"
          animate={isInView ? "show" : "hidden"}
          variants={staggerContainer}
          style={{ marginBottom: 64, textAlign: "center" }}
        >
          <motion.span variants={fadeUpVariants} className="section-tag">Testimonials</motion.span>
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
            Stories of real growth.
          </motion.h2>
        </motion.div>

        <motion.div
          initial="hidden"
          animate={isInView ? "show" : "hidden"}
          variants={staggerContainer}
        >
          {/* Featured hero testimonial */}
          <motion.div
            variants={fadeUpVariants}
            whileHover={{ borderColor: "rgba(255,255,255,0.15)" }}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto",
              gap: 40,
              alignItems: "center",
              marginBottom: 14,
              background: "#0d0d0d",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 20,
              padding: 36,
            }}
            className="feat-card"
          >
            <div>
              <Stars count={featured.stars} />
              <blockquote
                style={{
                  fontSize: 19,
                  fontWeight: 500,
                  color: "#ffffff",
                  lineHeight: 1.65,
                  margin: "16px 0",
                  fontStyle: "normal",
                  letterSpacing: "-0.01em",
                }}
              >
                &ldquo;{featured.quote}&rdquo;
              </blockquote>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#ffffff", margin: 0 }}>{featured.name}</p>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 3 }}>{featured.title}</p>
            </div>
            <img
              src={featured.img}
              alt={featured.name}
              className="feat-img"
              style={{
                width: 110,
                height: 110,
                borderRadius: "50%",
                objectFit: "cover",
                border: "1px solid rgba(255,255,255,0.12)",
                flexShrink: 0,
              }}
            />
          </motion.div>

          {/* 2x2 grid */}
          <div
            className="testi-grid"
            style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}
          >
            {textTestimonials.map((t) => (
              <motion.div
                key={t.name}
                variants={fadeUpVariants}
                whileHover={{ y: -6, borderColor: "rgba(255,255,255,0.15)" }}
                style={{
                  background: "#0d0d0d",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 20,
                  padding: 28,
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                }}
              >
                <Stars count={t.stars} />
                <blockquote
                  style={{
                    fontSize: 14,
                    color: "rgba(255,255,255,0.65)",
                    lineHeight: 1.75,
                    margin: 0,
                    flex: 1,
                    letterSpacing: "-0.01em",
                  }}
                >
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: "auto" }}>
                  <img
                    src={t.img}
                    alt={t.name}
                    style={{ width: 38, height: 38, borderRadius: "50%", objectFit: "cover", border: "1px solid rgba(255,255,255,0.09)" }}
                  />
                  <div>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#ffffff" }}>{t.name}</p>
                    <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.38)" }}>{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}

            {videoTestimonials.map((v) => (
              <motion.div
                key={v.name}
                variants={fadeUpVariants}
                whileHover={{ y: -6, borderColor: "rgba(255,255,255,0.15)" }}
                style={{
                  background: "#0d0d0d",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 20,
                  overflow: "hidden",
                  cursor: "pointer",
                  position: "relative",
                }}
              >
                <img
                  src={v.img}
                  alt={v.name}
                  style={{ width: "100%", height: 180, objectFit: "cover", display: "block" }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 180,
                    background: "rgba(0,0,0,0.45)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      background: "rgba(255,255,255,0.12)",
                      border: "1px solid rgba(255,255,255,0.35)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
                <div style={{ padding: "14px 20px" }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#ffffff" }}>{v.name}</p>
                  <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.38)" }}>{v.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 767px) {
          .testi-grid { grid-template-columns: 1fr !important; }
          .feat-img { display: none !important; }
          .feat-card { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
