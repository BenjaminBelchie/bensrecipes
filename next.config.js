import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV !== "production",
  register: false,
  additionalPrecacheEntries: [
    "/offline",
    "/manifest.webmanifest",
    "/logo.png",
    "/favicon.ico",
    "/apple-icon.png",
    "/icons/icon-192.png",
    "/icons/icon-512.png",
    "/icons/maskable-192.png",
    "/icons/maskable-512.png",
  ].map((url) => ({
    url,
    revision: process.env.VERCEL_GIT_COMMIT_SHA ?? String(Date.now()),
  })),
  exclude: [/\/splash\//, /\/sw\.js$/, /\.map$/, /apple-startup-images\.json$/],
});

/** @type {import("next").NextConfig} */
const config = {
  experimental: {
    viewTransition: true,
  },
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
    ];
  },
  images: {
    imageSizes: [32, 48, 64, 96, 128, 256, 384, 960],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "cdn.shadcnstudio.com",
      },
      {
        protocol: "https",
        hostname: "festive-butterfly-687.eu-west-1.convex.cloud",
      },
      {
        protocol: "https",
        hostname: "confident-lemur-543.eu-west-1.convex.cloud",
      },
    ],
  },
};

export default withSerwist(config);
