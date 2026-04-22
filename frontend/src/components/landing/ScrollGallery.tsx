"use client";

// ─── Auto-scrolling 9:16 masonry gallery ─────────────────────────────────────

const IMAGES = [
  "https://res.cloudinary.com/dcyn6md7x/image/upload/v1776780178/Generated_Image_April_21_2026_-_6_52PM_u0fcyb.jpg",
  "https://res.cloudinary.com/dcyn6md7x/image/upload/v1776780175/Generated_Image_April_21_2026_-_6_48PM_zwsgek.jpg",
  "https://res.cloudinary.com/dcyn6md7x/image/upload/v1776780177/Generated_Image_April_21_2026_-_6_49PM_viceqr.jpg",
  "https://res.cloudinary.com/dcyn6md7x/image/upload/v1776780176/Generated_Image_April_21_2026_-_6_47PM_g5bnxl.jpg",
  "https://res.cloudinary.com/dcyn6md7x/image/upload/v1776780174/Generated_Image_April_21_2026_-_6_40PM_wzyi9p.jpg",
  "https://res.cloudinary.com/dcyn6md7x/image/upload/v1776780174/Generated_Image_April_21_2026_-_6_46PM_cqc2pq.jpg",
  "https://res.cloudinary.com/dcyn6md7x/image/upload/v1776780175/Generated_Image_April_21_2026_-_6_39PM_rsdugh.jpg",
  "https://res.cloudinary.com/dcyn6md7x/image/upload/v1776780174/Generated_Image_April_21_2026_-_6_42PM_fypdfe.jpg",
  "https://res.cloudinary.com/dcyn6md7x/image/upload/v1776780171/Generated_Image_April_21_2026_-_6_32PM_pa05ud.jpg",
  "https://res.cloudinary.com/dcyn6md7x/image/upload/v1776780170/Generated_Image_April_21_2026_-_6_27PM_ywwyy9.jpg",
  "https://res.cloudinary.com/dcyn6md7x/image/upload/v1776780170/Generated_Image_April_21_2026_-_6_30PM_nkk8af.jpg",
  "https://res.cloudinary.com/dcyn6md7x/image/upload/v1776780169/Generated_Image_April_21_2026_-_6_36PM_em54t7.jpg",
  "https://res.cloudinary.com/dcyn6md7x/image/upload/v1776780168/Generated_Image_April_21_2026_-_6_35PM_ztn4ae.jpg",
  "https://res.cloudinary.com/dcyn6md7x/image/upload/v1776780169/Generated_Image_April_21_2026_-_6_25PM_ynrlfo.jpg",
  "https://res.cloudinary.com/dcyn6md7x/image/upload/v1776780168/Generated_Image_April_21_2026_-_6_26PM_jojegl.jpg",
  "https://res.cloudinary.com/dcyn6md7x/image/upload/v1776780166/Ecommerce_w0qvex.jpg",
];

// Split into 3 rows, distribute evenly
const chunk = (arr: string[], size: number) => {
  const result: string[][] = [];
  for (let i = 0; i < arr.length; i += size) result.push(arr.slice(i, i + size));
  return result;
};

const ROWS = chunk(IMAGES, Math.ceil(IMAGES.length / 3));
// Speeds: row 0 left, row 1 right, row 2 left (faster)
const ROW_CONFIG = [
  { direction: "left",  duration: 40 },
  { direction: "right", duration: 55 },
  { direction: "left",  duration: 32 },
];

// Card: 9:16 → width 160, height 285
const CARD_W = 160;
const CARD_H = 285;
const GAP = 12;

interface RowProps {
  images: string[];
  direction: "left" | "right";
  duration: number;
}

function ScrollRow({ images, direction, duration }: RowProps) {
  // Triple the images so the loop is seamless at all viewport widths
  const tripled = [...images, ...images, ...images];
  const trackW = images.length * (CARD_W + GAP);
  const animName = direction === "left" ? "scroll-left" : "scroll-right";

  return (
    <div style={{ overflow: "hidden", width: "100%" }}>
      <div
        style={{
          display: "flex",
          gap: GAP,
          width: "max-content",
          animation: `${animName} ${duration}s linear infinite`,
          willChange: "transform",
          // The keyframe moves exactly one set of images
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ["--track-w" as any]: `${trackW + GAP}px`,
        }}
      >
        {tripled.map((src, i) => (
          <div
            key={i}
            style={{
              width: CARD_W,
              height: CARD_H,
              borderRadius: 14,
              overflow: "hidden",
              flexShrink: 0,
              background: "#111",
            }}
          >
            <img
              src={src}
              alt=""
              loading="lazy"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
                pointerEvents: "none",
                userSelect: "none",
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ScrollGallery() {
  return (
    <section
      style={{
        background: "#000000",
        position: "relative",
        overflow: "hidden",
        paddingTop: 0,
        paddingBottom: 0,
      }}
    >
      <style>{`
        @keyframes scroll-left {
          0%   { transform: translateX(0); }
          100% { transform: translateX(calc(-1 * var(--track-w))); }
        }
        @keyframes scroll-right {
          0%   { transform: translateX(calc(-1 * var(--track-w))); }
          100% { transform: translateX(0); }
        }
      `}</style>

      {/* Left fade */}
      <div style={{
        position: "absolute", top: 0, left: 0, bottom: 0, width: 160, zIndex: 10,
        background: "linear-gradient(to right, #000000 0%, transparent 100%)",
        pointerEvents: "none",
      }} />
      {/* Right fade */}
      <div style={{
        position: "absolute", top: 0, right: 0, bottom: 0, width: 160, zIndex: 10,
        background: "linear-gradient(to left, #000000 0%, transparent 100%)",
        pointerEvents: "none",
      }} />

      {/* Rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: GAP, padding: `${GAP}px 0` }}>
        {ROWS.map((row, i) => (
          <ScrollRow
            key={i}
            images={row}
            direction={(ROW_CONFIG[i]?.direction ?? "left") as "left" | "right"}
            duration={ROW_CONFIG[i]?.duration ?? 40}
          />
        ))}
      </div>
    </section>
  );
}
