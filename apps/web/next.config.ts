import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  transpilePackages: ["@creator/db", "@creator/ledger", "@creator/shared"],
  experimental: {
    externalDir: true,
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
