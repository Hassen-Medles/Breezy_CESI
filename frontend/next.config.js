/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5001/api/:path*', // adapte le port à celui de ton backend API
      },
      {
        source: '/auth/:path*',
        destination: 'http://localhost:5000/:path*', // adapte le port à celui de ton auth-service
      },
    ];
  },
};

module.exports = nextConfig;
