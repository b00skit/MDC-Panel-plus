import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  env: {},
  i18n: {
    locales: ['en', 'es', 'sl'],
    defaultLocale: 'en',
  },
};

export default nextConfig;
