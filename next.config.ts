import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  headers: async () => {
    return [
      {
        source: "/",
        headers: [
          {
            key: "CDN-Cache-Control",
            value: "max-age=10, stale-while-revalidate=60",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
