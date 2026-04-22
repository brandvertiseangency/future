"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

// ── Props ─────────────────────────────────────────────────────────────────────
interface TextRevealProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  delay?: number;        // base delay before animation starts
  stagger?: number;      // per-character stagger in seconds
  inView?: boolean;
  /** 
   * Pass a CSS linear-gradient string to paint the whole word
   * with a smooth gradient via background-clip: text.
   * e.g. "linear-gradient(90deg, #ff6ec7, #ff9a3c, #ffe93c, #6bff6b, #3cc8ff)"
   */
  gradientCss?: string;
}

// ── Component ─────────────────────────────────────────────────────────────────
export function TextReveal({
  text,
  className,
  style,
  delay = 0,
  stagger = 0.05,
  inView = true,
  gradientCss,
}: TextRevealProps) {
  const chars = text.split("");
  const [mounted, setMounted] = useState(false);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { if (!inView) setRevealed(false); }, [inView]);

  // SSR / pre-mount: render plain white text so there's zero layout shift or flash
  if (!mounted) {
    return (
      <span className={className} style={{ color: "#ffffff", ...style }} aria-label={text}>
        {text}
      </span>
    );
  }

  const gradientStyle: React.CSSProperties = gradientCss
    ? {
        background: gradientCss,
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        backgroundSize: "200% 100%",
      }
    : {};

  return (
    /*
     * Container: inline-block so it sits inline inside the <h1>.
     * position:relative so children can be absolutely stacked.
     * Width is determined ONLY by the white-text layer (normal flow).
     */
    <span
      className={className}
      aria-label={text}
      style={{
        position: "relative",
        display: "inline-block",
        ...style,
      }}
    >
      {/* ── Layer 1 (normal flow): white text — always present to size the box ── */}
      <motion.span
        aria-hidden
        animate={revealed ? { opacity: 1 } : { opacity: 0 }}
        initial={{ opacity: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{ display: "block", color: "#ffffff", whiteSpace: "nowrap" }}
      >
        {text}
      </motion.span>

      {/* ── Layer 2 (absolute): gradient chars that reveal one-by-one ── */}
      <motion.span
        aria-hidden
        animate={revealed ? { opacity: 0 } : { opacity: 1 }}
        initial={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "block",
          whiteSpace: "nowrap",
          ...gradientStyle,
        }}
      >
        {chars.map((char, i) => {
          const isSpace = char === " ";
          const isLast = i === chars.length - 1;
          return (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 22, filter: "blur(12px)" }}
              animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
              transition={{
                delay: delay + i * stagger,
                duration: 0.55,
                ease: [0.16, 1, 0.3, 1],
              }}
              onAnimationComplete={() => {
                if (isLast && inView) setRevealed(true);
              }}
              style={{
                display: "inline-block",
                whiteSpace: isSpace ? "pre" : "normal",
              }}
            >
              {isSpace ? "\u00A0" : char}
            </motion.span>
          );
        })}
      </motion.span>
    </span>
  );
}
