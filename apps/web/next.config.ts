import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  transpilePackages: ["@creator/db", "@creator/ledger", "@creator/shared"],
  experimental: {
    externalDir: true,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@creator/db": path.resolve(__dirname, "../../packages/db/src"),
      "@creator/ledger": path.resolve(__dirname, "../../packages/ledger/src"),
      "@creator/shared": path.resolve(__dirname, "../../packages/shared/src"),
    };
    return config;
  },
};

export default nextConfig;
