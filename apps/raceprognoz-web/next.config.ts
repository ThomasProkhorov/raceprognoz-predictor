import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  serverExternalPackages: ["raceprognoz-parser", "cheerio"],
  allowedDevOrigins: ["192.168.1.2"],
  turbopack: {
    root: path.join(__dirname, ".."),
  },
};

export default nextConfig;
