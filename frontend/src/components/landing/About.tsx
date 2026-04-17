"use client";

import { useEffect, useRef } from "react";

export default function About() {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.1 }
    );
    ref.current?.querySelectorAll(".fade-up").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      id="about"
      style={{ padding: "120px 0", background: "#080808" }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px" }}>
        <div
          className="fade-up about-grid"
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}
        >
          {/* Left image */}
          <div style={{ position: "relative" }}>
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80"
              alt="Our mission"
              style={{
                width: "100%",
                height: 480,
                objectFit: "cover",
                borderRadius: 20,
                border: "1px solid rgba(255,255,255,0.08)",
                filter: "brightness(0.9) sepia(0.1)",
              }}
            />
            {/* Warm tint overlay */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: 20,
                background: "rgba(245,210,150,0.06)",
                pointerEvents: "none",
              }}
            />
          </div>

          {/* Right content */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <span className="section-tag">About Us</span>
            <h3
              style={{
                fontSize: "clamp(28px, 4vw, 44px)",
                fontWeight: 700,
                color: "#ffffff",
                letterSpacing: "-0.03em",
                lineHeight: 1.15,
                margin: 0,
              }}
            >
              We&apos;re building the future of brand marketing.
            </h3>
            <p
              style={{
                fontSize: 17,
                color: "rgba(255,255,255,0.55)",
                lineHeight: 1.75,
                margin: 0,
              }}
            >
              Brandvertise was founded with a single mission: make world-class brand marketing accessible to every business, not just the ones with agency budgets. We combine generative AI with deep brand intelligence to create content that actually converts.
            </p>
            <p
              style={{
                fontSize: 17,
                color: "rgba(255,255,255,0.55)",
                lineHeight: 1.75,
                margin: 0,
              }}
            >
              Our team of former engineers from Google, Razorpay, and Ogilvy built a platform that doesn&apos;t just automate — it thinks, adapts, and grows with your brand.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 8 }}>
              <a href="#features" className="btn-primary">See Our Features</a>
              <a href="#team" className="btn-outline">Meet the Team</a>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 767px) {
          .about-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
        }
      `}</style>
    </section>
  );
}
