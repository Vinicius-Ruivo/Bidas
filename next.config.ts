import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  /* Evita que o build use lockfile fora desta pasta (comum no Windows). */
  outputFileTracingRoot: projectRoot,
};

export default nextConfig;
