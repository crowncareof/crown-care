import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Supabase Storage
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      // Cloudinary (kept as fallback)
      { protocol: "https", hostname: "res.cloudinary.com" },
      // Unsplash (dev placeholder images)
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
    ],
  },
  experimental: {
    optimizePackageImports: ["framer-motion", "@supabase/supabase-js"],
  },
};

export default nextConfig;
