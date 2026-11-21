import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Security
  poweredByHeader: false,

  // Turbopack configuration
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
