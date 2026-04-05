import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* Raiz do projeto no build (Vercel/Linux + Windows); evita confusão com lockfile fora da pasta. */
  outputFileTracingRoot: path.resolve(process.cwd()),
};

export default nextConfig;
