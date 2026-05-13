import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://user-service:3001/:path*",
      },
    ];
  },
};

export default nextConfig;
