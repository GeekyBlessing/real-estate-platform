/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Placeholder allowlist. Replace with the S3 or CloudFront host
    // from Section 12 of the architecture once media storage is live.
    remotePatterns: [],
  },
};

export default nextConfig;
