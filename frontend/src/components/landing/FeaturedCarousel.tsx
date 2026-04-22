"use client";

import React from "react";
import { Carousel, Card } from "@/components/ui/apple-cards-carousel";

const DummyContent = () => (
  <div className="space-y-4">
    <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
      <span className="font-semibold text-white">
        Your brand DNA drives everything.
      </span>{" "}
      Brandvertise reads your tone, audience, and goals to generate content that
      sounds like you — every single time, across every platform.
    </p>
    <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
      No prompting. No guesswork. Just on-brand output at scale.
    </p>
  </div>
);

const data = [
  {
    category: "AI Generation",
    title: "Generate on-brand posts in seconds.",
    src: "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?q=80&w=3556&auto=format&fit=crop",
    content: <DummyContent />,
  },
  {
    category: "Scheduling",
    title: "Auto-schedule across all channels.",
    src: "https://images.unsplash.com/photo-1531554694128-c4c6665f59c2?q=80&w=3387&auto=format&fit=crop",
    content: <DummyContent />,
  },
  {
    category: "Brand DNA",
    title: "One setup. Infinite consistency.",
    src: "https://images.unsplash.com/photo-1713869791518-a770879e60dc?q=80&w=2333&auto=format&fit=crop",
    content: <DummyContent />,
  },
  {
    category: "Visual AI",
    title: "Images that match your aesthetic.",
    src: "https://images.unsplash.com/photo-1599202860130-f600f4948364?q=80&w=2515&auto=format&fit=crop",
    content: <DummyContent />,
  },
  {
    category: "Analytics",
    title: "Know what works before you post.",
    src: "https://images.unsplash.com/photo-1602081957921-9137a5d6eaee?q=80&w=2793&auto=format&fit=crop",
    content: <DummyContent />,
  },
  {
    category: "Agents",
    title: "Website, branding kit, pitch decks.",
    src: "https://images.unsplash.com/photo-1511984804822-e16ba72f5848?q=80&w=2048&auto=format&fit=crop",
    content: <DummyContent />,
  },
  {
    category: "Platforms",
    title: "Instagram, LinkedIn, TikTok & more.",
    src: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=2674&auto=format&fit=crop",
    content: <DummyContent />,
  },
  {
    category: "Assets",
    title: "Every asset stored and searchable.",
    src: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?q=80&w=2656&auto=format&fit=crop",
    content: <DummyContent />,
  },
];

export default function FeaturedCarousel() {
  const cards = data.map((card, index) => (
    <Card key={card.src} card={card} index={index} />
  ));

  return (
    <section
      style={{
        background: "#050505",
        paddingTop: 80,
        paddingBottom: 80,
        overflow: "hidden",
      }}
    >
      {/* Section header */}
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "0 24px",
          marginBottom: 48,
        }}
      >
        <p
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--ai-color)",
            marginBottom: 12,
          }}
        >
          Everything in one platform
        </p>
        <h2
          style={{
            fontSize: "clamp(28px, 4vw, 52px)",
            fontWeight: 900,
            letterSpacing: "-0.03em",
            color: "#ffffff",
            lineHeight: 1.05,
            maxWidth: 600,
            margin: 0,
          }}
        >
          Built for brands that{" "}
          <em
            className="highlight"
            style={{
              background: "linear-gradient(90deg, #00d4ff, #7c3aed)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            move fast.
          </em>
        </h2>
      </div>

      {/* Auto-scrolling carousel */}
      <Carousel items={cards} autoScrollSpeed={0.55} />
    </section>
  );
}
