import type { NextConfig } from "next";

const staticExport = process.env.BUILD_STATIC === "1";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  ...(staticExport ? { output: "export" as const } : {}),
  ...(!staticExport ? {
    async rewrites() {
      return [{ source: "/_AMapService/:path*", destination: "/api/amap-proxy/:path*" }];
    },
  } : {}),
};

export default nextConfig;
