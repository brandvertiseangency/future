import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

// Keep build cache on local macOS home disk to avoid issues on external volumes.
// Use REAL_HOME or HOME to get the actual user home (not a sandboxed temp path).
const homeDir = process.env.REAL_HOME ?? process.env.HOME ?? "/tmp";
const localDist = `${homeDir}/.brandvertise-next`;

const nextConfig: NextConfig = {
  ...(isDev ? { distDir: localDist } : {}),
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? "",
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
