import type { NextConfig } from "next";
import path from "path";
import os from "os";

const isDev = process.env.NODE_ENV !== "production";

// On dev: keep build output on local disk to avoid issues on external volumes
const localDist = path.join(os.homedir(), ".brandvertise-next");

const nextConfig: NextConfig = {
  ...(isDev ? { distDir: localDist } : {}),
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? "",
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
