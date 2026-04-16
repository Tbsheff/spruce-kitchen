/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  serverExternalPackages: ["better-auth", "postgres", "drizzle-orm"],
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Externalize Node.js-specific packages for server environment
      config.externals = config.externals || [];
      config.externals.push("better-auth", "postgres", "drizzle-orm");
    }
    return config;
  },
};

export default nextConfig;
