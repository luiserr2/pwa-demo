/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['typeorm', 'pg'],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('pg-native', 'better-sqlite3', 'sqlite3', 'mysql', 'mysql2', 'oracledb', 'mssql', 'mongodb');
    }
    return config;
  },
};

export default nextConfig;
