import type { NextConfig } from 'next';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import path from 'path';

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  env: {},
  webpack: (config) => {
    config.plugins = config.plugins || [];
    config.plugins.push(
      new CopyWebpackPlugin({
        patterns: [
          {
            from: path.resolve(__dirname, 'data'),
            to: path.resolve(__dirname, 'public/data'),
          },
        ],
      })
    );

    return config;
  },
};

export default nextConfig;
