/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Supabase Storage + Unsplash placeholders used in seed data.
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  experimental: {
    // Server Actions are stable in 14, kept explicit for clarity.
    serverActions: { bodySizeLimit: "4mb" },
  },
};
export default nextConfig;