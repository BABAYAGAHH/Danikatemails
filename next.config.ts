import type { NextConfig } from "next";

const isWindows = process.platform === "win32";

const nextConfig: NextConfig = {
  ...(isWindows ? { distDir: ".next-app" } : {}),
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL ?? process.env.AUTH_URL
  },
  typedRoutes: true
};

export default nextConfig;
