/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    // En dev local, proxy /api et /auth vers les bons ports
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/api/:path*',
          destination: 'http://localhost:5001/api/:path*',
        },
        {
          source: '/auth/:path*',
          destination: 'http://localhost:5000/:path*',
        },
      ];
    }
    // En prod Docker, laisse Nginx gérer le proxy
    return [];
  },
};

module.exports = nextConfig;
