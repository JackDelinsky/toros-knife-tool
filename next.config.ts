import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

/** Absolute project root — prevents Next from picking up ~/package-lock.json as workspace root */
const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: {
    root: projectRoot,
  },
  outputFileTracingRoot: projectRoot,
};

export default nextConfig;
