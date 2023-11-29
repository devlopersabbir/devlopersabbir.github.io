/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https" && "http",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

module.exports = nextConfig;
