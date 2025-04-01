import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve.alias.canvas = false
    config.resolve.alias.encoding = false
    return config
  },
  // output: "export",
  eslint: {
    ignoreDuringBuilds: true, // Skip ESLint errors in builds
  },
};

export default nextConfig;
