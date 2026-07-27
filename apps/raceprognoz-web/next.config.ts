import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "raceprognoz-parser", 
    "cheerio",
    "playwright",
    "playwright-core",
  ],
  allowedDevOrigins: ["192.168.1.2"],
  outputFileTracingRoot: path.join(__dirname, "../../"),
   outputFileTracingIncludes: {
    "/*": [
      "node_modules/playwright-core/**",
    ],
  },
};

export default nextConfig;
