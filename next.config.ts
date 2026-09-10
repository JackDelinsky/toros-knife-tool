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
  /**
   * The dev server no longer pins a host, so it answers on `localhost`, on
   * `127.0.0.1`, and on the machine's LAN address. Next blocks cross-origin
   * requests to dev-only assets by default, and it treats those as different
   * origins from the one it started on — which silently killed HMR for anyone
   * who typed the IP instead of the name. Development only; it has no effect
   * on a production build.
   */
  allowedDevOrigins: ["127.0.0.1", "localhost", "0.0.0.0"],
};

export default nextConfig;
