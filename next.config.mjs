/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  experimental: {
    serverComponentsExternalPackages: ['typeorm', 'pg'],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push(
        'pg-native',
        'better-sqlite3',
        'sqlite3',
        'mysql',
        'mysql2',
        'oracledb',
        'mssql',
        'mongodb'
      );
    }
    return config;
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

export default nextConfig;
