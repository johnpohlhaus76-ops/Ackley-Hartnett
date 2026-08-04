/** @type {import('next').NextConfig} */
const nextConfig = {
  // Image Optimization
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "logo.clearbit.com" },
      { protocol: "https", hostname: "**.googleapis.com" },
    ],
    formats: ['image/avif', 'image/webp'],
  },

  // Performance & Compression
  compress: true,
  poweredByHeader: false,

  // Security headers
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        { key: 'X-XSS-Protection', value: '1; mode=block' },
      ],
    },
  ],

  // Experimental features for speed
  experimental: {
    optimizePackageImports: ['lucide-react'],
    isrMemoryCacheSize: 52 * 1024 * 1024, // 52MB ISR cache
  },
};

export default nextConfig;
