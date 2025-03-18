import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['profile.line-scdn.net'],
  },
  eslint: {
    ignoreDuringBuilds: true, 
  },
};

export default nextConfig;
