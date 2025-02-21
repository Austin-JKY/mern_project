import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  source: "/api/:path*",
  destination: "http://localhost:5001/api/:path*",
};

export default nextConfig;
