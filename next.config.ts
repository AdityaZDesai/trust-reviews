import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    loader: 'default',
    domains: ['vercel.app'],
  },
};

export default nextConfig;
