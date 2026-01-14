/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable React Strict Mode to prevent double socket connections
  reactStrictMode: false,
  
  // Optimize production builds
  swcMinify: true,
  
  // Enable static export for Capacitor mobile builds
  output: process.env.CAPACITOR_BUILD === 'true' ? 'export' : undefined,
  
  // Trailing slash for static export compatibility
  trailingSlash: process.env.CAPACITOR_BUILD === 'true',
  
  // Reduce bundle size by enabling modular imports
  modularizeImports: {
    '@mui/icons-material': {
      transform: '@mui/icons-material/{{member}}',
    },
    '@mui/material': {
      transform: '@mui/material/{{member}}',
    },
    'react-icons': {
      transform: 'react-icons/{{member}}',
    },
  },
  
  // Compiler optimizations
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  
  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    // Disable image optimization for static export
    unoptimized: process.env.CAPACITOR_BUILD === 'true',
  },
  
  // Headers for caching static assets
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|png|webp|avif|woff|woff2)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
