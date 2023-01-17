/** @type {import('next').NextConfig} */
const path = require('path');
const nextConfig = {
  reactStrictMode: false,
  resolve: {
    modules: [path.resolve(__dirname, 'src'), 'node_modules'],
  },
}

module.exports = nextConfig

module.exports = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  }
}