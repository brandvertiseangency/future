import type { NextConfig } from "next";
import path from "path";

const isDev = process.env.NODE_ENV !== "production";

// Keep build cache on local macOS home disk to avoid issues on external volumes.
const homeDir = process.env.REAL_HOME ?? process.env.HOME ?? "/tmp";
const localDist = `${homeDir}/.brandvertise-next`;

const nextConfig: NextConfig = {
  ...(isDev ? { distDir: localDist } : {}),
  // Allow dev server to serve to local network (silences cross-origin warning)
  allowedDevOrigins: ["localhost", "127.0.0.1", "192.168.0.100"],
  // Silence "multiple lockfiles" workspace root warning
  outputFileTracingRoot: path.join(__dirname, "../"),
  // Do NOT override NEXT_PUBLIC_API_URL here — let .env.local or the real env var win.
  // api.ts falls back to http://localhost:4000 in local dev automatically.
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
