import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactCompiler: true,
  serverExternalPackages: ["pino", "pino-pretty", "pdf-parse", "pdfjs-dist"],
};

export default nextConfig;
