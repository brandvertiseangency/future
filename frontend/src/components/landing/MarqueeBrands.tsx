"use client";

const brands = ["Notion", "Linear", "Stripe", "Vercel", "Figma", "Loom", "Raycast", "Resend", "Clerk", "Neon", "Turso", "PlanetScale"];
const doubled = [...brands, ...brands];

export default function MarqueeBrands() {
  return (
    <div
      style={{
        padding: "36px 0",
        background: "#050505",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        overflow: "hidden",
      }}
    >
      <p
        style={{
          textAlign: "center",
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.22)",
          marginBottom: 22,
        }}
      >
        Trusted by fast-growing brands worldwide
      </p>
      <div
        style={{
          position: "relative",
          display: "flex",
          overflow: "hidden",
          maskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
        }}
      >
        <div
          className="animate-marquee"
          style={{ display: "flex", gap: 60, alignItems: "center", whiteSpace: "nowrap", width: "max-content" }}
        >
          {doubled.map((b, i) => (
            <span
              key={i}
              style={{
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: "-0.01em",
                color: "rgba(255,255,255,0.18)",
                userSelect: "none",
              }}
            >
              {b}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
