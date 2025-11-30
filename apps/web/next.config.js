/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@lions-hub/database'],
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
};

module.exports = nextConfig;
