import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "keemi-spaces-1.sgp1.cdn.digitaloceanspaces.com",
      },
    ],
  },
};

export default nextConfig;
