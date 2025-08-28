import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  env: {
    NEXT_PUBLIC_BETA_ENABLED: process.env.BETA_ENABLED,
    NEXT_PUBLIC_BETA_CODE: process.env.BETA_CODE,
  }
};

export default nextConfig;
