/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'localhost',
        pathname: '/**',
      },
    ],
  },

  // Modern build optimizations
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Turbopack configuration (default in Next.js 16)
  turbopack: {
    // Most apps don't need Turbopack config
    // This silences the "no turbopack config" warning
  },
}

module.exports = withBundleAnalyzer(nextConfig);
