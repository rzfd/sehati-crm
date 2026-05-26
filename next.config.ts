import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output → image Docker ramping (server + node_modules minimal saja).
  output: "standalone",
  serverExternalPackages: ["voyageai", "pdf-parse", "mammoth", "web-push"],
};

export default nextConfig;
