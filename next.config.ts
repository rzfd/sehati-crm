import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["voyageai", "pdf-parse", "mammoth"],
};

export default nextConfig;
