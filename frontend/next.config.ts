import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://auth-service:3001/:path*",
      },
    ];
  },
};

export default nextConfig;
