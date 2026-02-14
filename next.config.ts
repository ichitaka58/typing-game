import type { NextConfig } from "next";

const workerBase = process.env.WORKER_API_BASE;

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: "/api/:path",
        destination: `${workerBase}/:path*`,
      },
    ];
  }
};

export default nextConfig;
