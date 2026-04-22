"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

// ─── Card data ────────────────────────────────────────────────────────────────
// Each card: bg colour (placeholder tint), aspect, label, accent
// Replace `bg` with a real <img src=...> when screenshots are ready.

type CardShape = "portrait" | "landscape" | "square";

interface CardItem {
  shape: CardShape;
  bg: string;
  label: string;
  sub: string;
  accent: string;
}

// 8 columns — alternating scroll speeds  ↑fast / ↑slow / ↑fastest / ↑medium …
const COLS: CardItem[][] = [
  // col 0
  [
    { shape: "portrait",  bg: "#0f0f0f", label: "Brand DNA",        sub: "Identity",   accent: "#00d4ff" },
    { shape: "landscape", bg: "#111",    label: "Calendar View",    sub: "Scheduling", accent: "#10b981" },
    { shape: "portrait",  bg: "#0f0f0f", label: "Instagram Post",   sub: "Generate",   accent: "#f59e0b" },
    { shape: "square",    bg: "#111",    label: "Asset Library",    sub: "Assets",     accent: "#00d4ff" },
    { shape: "landscape", bg: "#0f0f0f", label: "Analytics Panel",  sub: "Insights",   accent: "#10b981" },
  ],
  // col 1
  [
    { shape: "landscape", bg: "#111",    label: "Dashboard",        sub: "Overview",   accent: "#f59e0b" },
    { shape: "portrait",  bg: "#0f0f0f", label: "TikTok Clip",      sub: "Generate",   accent: "#00d4ff" },
    { shape: "square",    bg: "#111",    label: "Branding Kit",     sub: "Agents",     accent: "#10b981" },
    { shape: "portrait",  bg: "#0f0f0f", label: "Story Template",   sub: "Generate",   accent: "#f59e0b" },
    { shape: "landscape", bg: "#111",    label: "Scheduler",        sub: "Calendar",   accent: "#00d4ff" },
  ],
  // col 2
  [
    { shape: "portrait",  bg: "#0f0f0f", label: "LinkedIn Post",    sub: "Generate",   accent: "#10b981" },
    { shape: "square",    bg: "#111",    label: "Pitch Deck",        sub: "Agents",     accent: "#f59e0b" },
    { shape: "landscape", bg: "#0f0f0f", label: "Generate Panel",   sub: "AI",         accent: "#00d4ff" },
    { shape: "portrait",  bg: "#111",    label: "Reel Cover",       sub: "Generate",   accent: "#10b981" },
    { shape: "square",    bg: "#0f0f0f", label: "Brand Palette",    sub: "Identity",   accent: "#f59e0b" },
  ],
  // col 3
  [
    { shape: "square",    bg: "#111",    label: "Twitter/X Post",   sub: "Generate",   accent: "#00d4ff" },
    { shape: "landscape", bg: "#0f0f0f", label: "Website Builder",  sub: "Agents",     accent: "#10b981" },
    { shape: "portrait",  bg: "#111",    label: "Pinterest Pin",    sub: "Generate",   accent: "#f59e0b" },
    { shape: "landscape", bg: "#0f0f0f", label: "Onboarding",       sub: "Setup",      accent: "#00d4ff" },
    { shape: "portrait",  bg: "#111",    label: "Facebook Ad",      sub: "Generate",   accent: "#10b981" },
  ],
  // col 4
  [
    { shape: "landscape", bg: "#0f0f0f", label: "Content Plan",     sub: "Strategy",   accent: "#f59e0b" },
    { shape: "portrait",  bg: "#111",    label: "Threads Post",     sub: "Generate",   accent: "#00d4ff" },
    { shape: "square",    bg: "#0f0f0f", label: "Credit Usage",     sub: "Billing",    accent: "#10b981" },
    { shape: "landscape", bg: "#111",    label: "Notification Hub", sub: "Settings",   accent: "#f59e0b" },
    { shape: "portrait",  bg: "#0f0f0f", label: "YouTube Thumb",    sub: "Generate",   accent: "#00d4ff" },
  ],
  // col 5
  [
    { shape: "portrait",  bg: "#111",    label: "Reel Script",      sub: "Agents",     accent: "#10b981" },
    { shape: "landscape", bg: "#0f0f0f", label: "Post Preview",     sub: "Review",     accent: "#f59e0b" },
    { shape: "square",    bg: "#111",    label: "Hashtag Set",      sub: "Generate",   accent: "#00d4ff" },
    { shape: "portrait",  bg: "#0f0f0f", label: "Carousel Slide",   sub: "Generate",   accent: "#10b981" },
    { shape: "landscape", bg: "#111",    label: "Profile Settings", sub: "Account",    accent: "#f59e0b" },
  ],
  // col 6
  [
    { shape: "square",    bg: "#0f0f0f", label: "Brand Logo",       sub: "Identity",   accent: "#00d4ff" },
    { shape: "portrait",  bg: "#111",    label: "Story Ad",         sub: "Generate",   accent: "#10b981" },
    { shape: "landscape", bg: "#0f0f0f", label: "Team Collab",      sub: "Workspace",  accent: "#f59e0b" },
    { shape: "square",    bg: "#111",    label: "Font Pair",        sub: "Identity",   accent: "#00d4ff" },
    { shape: "portrait",  bg: "#0f0f0f", label: "Presentation",     sub: "Agents",     accent: "#10b981" },
  ],
  // col 7
  [
    { shape: "landscape", bg: "#111",    label: "Post Analytics",   sub: "Insights",   accent: "#f59e0b" },
    { shape: "portrait",  bg: "#0f0f0f", label: "UGC Template",     sub: "Generate",   accent: "#00d4ff" },
    { shape: "landscape", bg: "#111",    label: "Auto Publish",     sub: "Scheduling", accent: "#10b981" },
    { shape: "portrait",  bg: "#0f0f0f", label: "Brand Voice",      sub: "Identity",   accent: "#f59e0b" },
    { shape: "square",    bg: "#111",    label: "Caption AI",       sub: "Generate",   accent: "#00d4ff" },
  ],
];

// ─── Speed for each column (how many px it travels over 1000px of scroll) ────
// Odd columns go slower (positive = travel down relative = appear to scroll up slower)
// Even columns go faster — creates the layered depth
const SPEEDS = [-120, -40, -160, -60, -140, -30, -100, -70];

// ─── Starting Y offsets so columns are staggered ──────────────────────────────
const INIT_Y = [0, -60, 30, -100, 20, -80, 50, -40];

// ─── Dimensions per shape ─────────────────────────────────────────────────────
const DIMS: Record<CardShape, { w: number; h: number; radius: number }> = {
  portrait:  { w: 200, h: 300, radius: 16 },
  landscape: { w: 300, h: 188, radius: 14 },
  square:    { w: 220, h: 220, radius: 16 },
};

// ─── Single placeholder card ──────────────────────────────────────────────────
function GalleryCard({ card }: { card: CardItem }) {
  const { w, h, radius } = DIMS[card.shape];

  return (
    <div
      style={{
        width: w,
        height: h,
        borderRadius: radius,
        background: card.bg,
        border: "1px solid rgba(255,255,255,0.07)",
        flexShrink: 0,
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        transition: "border-color 0.2s",
      }}
    >
      {/* Top shimmer line */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 1,
        background: `linear-gradient(90deg, transparent, ${card.accent}50, transparent)`,
      }} />

      {/* Subtle radial glow behind icon */}
      <div style={{
        position: "absolute", inset: 0,
        background: `radial-gradient(ellipse at 50% 40%, ${card.accent}0a 0%, transparent 65%)`,
      }} />

      {/* Dot grid */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.055) 1px, transparent 1px)",
        backgroundSize: "22px 22px",
      }} />

      {/* Icon placeholder */}
      <div style={{
        position: "relative", zIndex: 2,
        width: 38, height: 38, borderRadius: 11,
        background: `${card.accent}14`,
        border: `1px solid ${card.accent}28`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke={card.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
          style={{ opacity: 0.65 }}>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      </div>

      {/* Labels */}
      <div style={{ position: "relative", zIndex: 2, textAlign: "center" }}>
        <p style={{
          margin: 0, fontSize: 12, fontWeight: 600,
          color: "rgba(255,255,255,0.55)", letterSpacing: "0.01em",
          lineHeight: 1.3,
        }}>
          {card.label}
        </p>
        <p style={{
          margin: "3px 0 0", fontSize: 10, fontWeight: 500,
          color: "rgba(255,255,255,0.2)", letterSpacing: "0.07em",
          textTransform: "uppercase",
        }}>
          {card.sub}
        </p>
      </div>

      {/* Bottom accent */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, transparent, ${card.accent}25, transparent)`,
      }} />
    </div>
  );
}

// ─── One parallax column ──────────────────────────────────────────────────────
function ParallaxCol({ cards, speed, initY }: { cards: CardItem[]; speed: number; initY: number }) {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1400], [initY, initY + speed]);

  // Double the cards for a seamless tall column
  const doubled = [...cards, ...cards];

  return (
    <motion.div style={{ display: "flex", flexDirection: "column", gap: 14, y, willChange: "transform" }}>
      {doubled.map((card, i) => (
        <GalleryCard key={`${card.label}-${i}`} card={card} />
      ))}
    </motion.div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function ParallaxGallery() {
  return (
    <section style={{
      background: "#050505",
      position: "relative",
      overflow: "hidden",
      height: 700,
    }}>

      {/* ── Edge fades ── */}
      {[
        { top: 0, left: 0, right: 0, height: 140, background: "linear-gradient(to bottom, #050505, transparent)" },
        { bottom: 0, left: 0, right: 0, height: 200, background: "linear-gradient(to top, #050505, transparent)" },
        { top: 0, left: 0, bottom: 0, width: 120, background: "linear-gradient(to right, #050505, transparent)" },
        { top: 0, right: 0, bottom: 0, width: 120, background: "linear-gradient(to left, #050505, transparent)" },
      ].map((s, i) => (
        <div key={i} style={{ position: "absolute", zIndex: 10, pointerEvents: "none", ...s }} />
      ))}

      {/* ── Column track ── */}
      <div style={{
        display: "flex",
        gap: 14,
        padding: "0 14px",
        height: "100%",
        alignItems: "flex-start",
        justifyContent: "center",
        overflow: "hidden",
      }}>
        {COLS.map((col, i) => (
          <ParallaxCol key={i} cards={col} speed={SPEEDS[i]} initY={INIT_Y[i]} />
        ))}
      </div>
    </section>
  );
}
