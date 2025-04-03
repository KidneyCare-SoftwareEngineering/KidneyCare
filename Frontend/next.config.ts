import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['profile.line-scdn.net'],
  },
  eslint: {
    ignoreDuringBuilds: true, 
  },
  env: {
    NEXT_PUBLIC_API: process.env.NEXT_PUBLIC_API,
  },
  reactStrictMode: true,
  compiler: {
    styledComponents: true,
  },
  sassOptions: {
    implementation: 'sass-embedded',
  },
};


export default nextConfig;
