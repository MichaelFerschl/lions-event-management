const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@lions-hub/database'],
  outputFileTracingRoot: path.join(__dirname, '../../'),
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
    outputFileTracingIncludes: {
      '/*': ['./node_modules/.prisma/**/*'],
    },
  },
};

module.exports = nextConfig;
