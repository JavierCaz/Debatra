import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  productionBrowserSourceMaps: true,

  webpack: (config, { dev, isServer }) => {
    if (dev) {
      config.devtool = "eval-source-map";
    }

    return config;
  },
};

export default nextConfig;
