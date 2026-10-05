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
      },
      // Preview deployment of the Sanity offer redesign
      {
        source: "/",
        destination: "/sanity",
        missing: [{ type: "host", value: "vibefixer.tonik.com" }],
        permanent: false,
      },
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
