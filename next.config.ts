import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Um lockfile fora do projeto faz o Turbopack inferir a raiz errada.
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
