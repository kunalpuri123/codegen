const nextConfig = {
  reactStrictMode: false,
  images: {
    domains: ["s3://prepmate/Screenshot 2025-04-06 at 5.47.26 PM.png"], // ✅ Add the allowed image domain
  },
  webpack(config) {
    // Set fallback for `fs` module to prevent errors
    config.resolve.fallback = { fs: false };

    return config;
  },
};

export default nextConfig;
