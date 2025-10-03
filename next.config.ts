import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ⚠️ Only keep this if you want static export (no SSR, no API routes)
  output: "export",

  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "placehold.co", pathname: "/**" },
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      { protocol: "https", hostname: "picsum.photos", pathname: "/**" },
      { protocol: "https", hostname: "lh3.googleusercontent.com", pathname: "/**" },
    ],
  },

  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.externals = [...(config.externals || []), "handlebars"];
    }
    return config;
  },
};

export default nextConfig;

