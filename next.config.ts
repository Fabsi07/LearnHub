import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.dirname(fileURLToPath(import.meta.url)),
  webpack: (config, { dev }) => {
    if (dev) {
      const windowsIgnored =
        process.platform === "win32"
          ? [
              "C:/DumpStack.log.tmp",
              "C:/hiberfil.sys",
              "C:/pagefile.sys",
              "C:/swapfile.sys",
            ]
          : [];

      config.watchOptions = {
        ...config.watchOptions,
        ignored: [
          "**/.git/**",
          "**/.next/**",
          "**/node_modules/**",
          ...windowsIgnored,
        ],
      };
    }

    return config;
  },
};

export default nextConfig;
