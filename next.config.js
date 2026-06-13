/** @type {import("next").NextConfig} */
const config = {
  experimental: {
    viewTransition: true,
  },
  images: {
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
      }
    ],
  },
};

export default config;
