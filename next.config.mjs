/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  skipTrailingSlashRedirect: true,
  transpilePackages: ['@react-pdf/renderer'],
  experimental: {
    // Bound worker concurrency on deployment hosts with limited memory.
    cpus: 2,
    webpackBuildWorker: true,
    webpackMemoryOptimizations: true,
  },
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
};

export default nextConfig;
