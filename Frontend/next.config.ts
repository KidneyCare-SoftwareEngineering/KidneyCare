import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['profile.line-scdn.net'],
  },
  eslint: {
    ignoreDuringBuilds: false, 
  },
};

export default nextConfig;
