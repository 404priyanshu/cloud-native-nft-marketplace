import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ["127.0.0.1"],
  images: {
    remotePatterns: [
      {
        // Allow images from any S3 bucket (local dev + production)
        protocol: "https",
        hostname: "**.amazonaws.com",
      },
      {
        // Allow images from localhost (dev)
        protocol: "http",
        hostname: "localhost",
      },
    ],
  },
  // Transpile workspace packages if needed
  transpilePackages: ["@blockforge/shared"],
};

export default nextConfig;
