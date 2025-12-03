const path = require('path');
const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

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

module.exports = withNextIntl(nextConfig);
