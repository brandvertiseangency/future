"use client";

import React, {
  useEffect,
  useRef,
  useState,
  createContext,
  useContext,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Context ──────────────────────────────────────────────────────────────────
interface CarouselContextType {
  onCardClose: (index: number) => void;
  currentIndex: number;
}
const CarouselContext = createContext<CarouselContextType>({
  onCardClose: () => {},
  currentIndex: 0,
});
export const useCarousel = () => useContext(CarouselContext);

// ─── Types ────────────────────────────────────────────────────────────────────
export interface CardData {
  src: string;
  title: string;
  category: string;
  content: React.ReactNode;
}

// ─── Blur Image (graceful load) ───────────────────────────────────────────────
export const BlurImage = ({
  src,
  alt,
  className,
  style,
}: {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
}) => {
  const [loaded, setLoaded] = useState(false);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      onLoad={() => setLoaded(true)}
      className={cn(
        "transition-[filter] duration-500 object-cover w-full h-full",
        loaded ? "blur-0" : "blur-sm",
        className
      )}
      style={style}
    />
  );
};

// ─── Expanded card overlay ─────────────────────────────────────────────────────
export const CardExpanded = ({
  card,
  onClose,
}: {
  card: CardData;
  onClose: () => void;
}) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center"
        style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 32 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 32 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-[90vw] max-w-3xl max-h-[85vh] overflow-y-auto rounded-3xl"
          style={{
            background: "#0a0a0a",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full flex items-center justify-center
                       bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X size={16} className="text-white" />
          </button>

          {/* Hero image */}
          <div className="w-full h-72 overflow-hidden rounded-t-3xl">
            <BlurImage src={card.src} alt={card.title} className="object-cover" />
          </div>

          <div className="p-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--ai-color)] mb-2">
              {card.category}
            </p>
            <h3 className="text-2xl font-bold text-white mb-6">{card.title}</h3>
            <div className="text-[var(--text-2)]">{card.content}</div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ─── Individual Card ──────────────────────────────────────────────────────────
export const Card = ({
  card,
  index,
}: {
  card: CardData;
  index: number;
}) => {
  const [open, setOpen] = useState(false);
  const { onCardClose, currentIndex } = useCarousel();

  useEffect(() => {
    if (!open) onCardClose(index);
  }, [open, index, onCardClose]);

  return (
    <>
      {open && (
        <CardExpanded card={card} onClose={() => setOpen(false)} />
      )}

      <motion.button
        onClick={() => setOpen(true)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="relative z-10 rounded-3xl overflow-hidden flex-shrink-0 cursor-pointer group"
        style={{
          width: 320,
          height: 420,
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {/* Image */}
        <div className="absolute inset-0">
          <BlurImage
            src={card.src}
            alt={card.title}
            className="group-hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)",
          }}
        />

        {/* Top accent line */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(0,212,255,0.4), transparent)",
          }}
        />

        {/* Text */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-left">
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-2"
            style={{ color: "rgba(0,212,255,0.8)" }}
          >
            {card.category}
          </p>
          <h3
            className="text-lg font-bold text-white leading-snug"
            style={{ letterSpacing: "-0.02em" }}
          >
            {card.title}
          </h3>
        </div>
      </motion.button>
    </>
  );
};

// ─── Carousel (auto-scrolling) ────────────────────────────────────────────────
export const Carousel = ({
  items,
  autoScrollSpeed = 0.6,
}: {
  items: React.ReactNode[];
  autoScrollSpeed?: number;
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const pausedRef = useRef(false);
  const posRef = useRef(0);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-scroll via rAF
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const step = () => {
      if (!pausedRef.current) {
        posRef.current += autoScrollSpeed;
        // Seamless loop: when we've scrolled half the duplicated list, reset
        const half = track.scrollWidth / 2;
        if (posRef.current >= half) posRef.current -= half;
        track.style.transform = `translateX(-${posRef.current}px)`;
      }
      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [autoScrollSpeed]);

  const handleMouseEnter = () => { pausedRef.current = true; };
  const handleMouseLeave = () => { pausedRef.current = false; };

  // Duplicate items for seamless infinite loop
  const doubled = [...items, ...items];

  return (
    <CarouselContext.Provider
      value={{
        onCardClose: (i) => setCurrentIndex(i),
        currentIndex,
      }}
    >
      <div
        className="relative w-full overflow-hidden"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Left fade */}
        <div
          className="absolute left-0 top-0 bottom-0 w-24 z-20 pointer-events-none"
          style={{ background: "linear-gradient(to right, #050505, transparent)" }}
        />
        {/* Right fade */}
        <div
          className="absolute right-0 top-0 bottom-0 w-24 z-20 pointer-events-none"
          style={{ background: "linear-gradient(to left, #050505, transparent)" }}
        />

        {/* Scrolling track — no scrollbar, driven by rAF */}
        <div className="w-full overflow-hidden py-6">
          <div
            ref={trackRef}
            className="flex gap-5 w-max"
            style={{ willChange: "transform" }}
          >
            {doubled.map((item, i) => (
              <div key={i} className="flex-shrink-0">
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </CarouselContext.Provider>
  );
};
