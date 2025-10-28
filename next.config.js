/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Development - Local backend
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/uploads/**',
      },
      // Production - Vercel backend
      {
        protocol: 'https',
        hostname: 'jyoti4nepal-backend.vercel.app',
        pathname: '/uploads/**',
      },
    ],
  },
};

module.exports = nextConfig;