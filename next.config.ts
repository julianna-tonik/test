import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["three"],
  redirects() {
    return [
      {
        source: "/vibe-fixer",
        destination: "/",
        has: [
          {
            type: "host",
            value: "vibefixer.tonik.com",
          }
        ],
        permanent: true,
      }
    ]
  },
  rewrites() {
    return {
      // from vibefixer.tonik.com to /vibe-fixer path
      fallback: [
        {
          source: "/:path*",
          destination: "/vibe-fixer",
          has: [
            {
              type: "host",
              value: "vibefixer.tonik.com",
            },
          ],
        },
      ],
    };
  },
  /* config options here */
};

export default nextConfig;
