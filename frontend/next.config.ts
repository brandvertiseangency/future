import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Silence "multiple lockfiles" workspace root warning
  outputFileTracingRoot: path.join(__dirname, "../"),
  /**
   * Same-origin `/api/*` → Express backend. Set on Vercel when the frontend
   * project does not bundle the API (e.g. `BACKEND_ORIGIN=https://your-api.railway.app`).
   * If `NEXT_PUBLIC_API_URL` is set, `api.ts` calls that host directly and rewrites are unused.
   */
  async rewrites() {
    const raw =
      process.env.BACKEND_ORIGIN ||
      process.env.API_REWRITE_TARGET ||
      process.env.NEXT_PUBLIC_API_URL ||
      ""
    const backend = raw.trim().replace(/\/$/, "")
    if (!backend) return []
    return [{ source: "/api/:path*", destination: `${backend}/api/:path*` }]
  },
  // Allow Firebase Google OAuth popups (removes COOP restriction in dev)
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Embedder-Policy", value: "unsafe-none" },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
        pathname: "/design-brandvertiseagency/**",
      },
    ],
  },
};

export default nextConfig;
