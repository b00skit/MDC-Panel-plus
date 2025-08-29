import type {NextConfig} from 'next';
import config from './data/config.json';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  env: {
    NEXT_PUBLIC_BETA_ENABLED: config.BETA_ENABLED,
    NEXT_PUBLIC_BETA_CODE: config.BETA_CODE,
  }
};

export default nextConfig;
