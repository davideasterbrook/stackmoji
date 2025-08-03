import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: false,
  output: 'export',  // Enable static HTML export
  images: {
    unoptimized: true  // Required for static export
  },
  trailingSlash: true,  // Add trailing slash to URLs, which helps with static hosting
  
  // Performance optimizations
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['react', 'react-dom']
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: false
};

export default nextConfig;
