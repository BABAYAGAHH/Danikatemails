import type { NextConfig } from "next";

const isWindows = process.platform === "win32";

const nextConfig: NextConfig = {
  ...(isWindows ? { distDir: ".next-app" } : {}),
  typedRoutes: true
};

export default nextConfig;
