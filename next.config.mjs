/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Supabase Storage (uploads), Unsplash (seed), Wikimedia (city landmarks).
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "https", hostname: "commons.wikimedia.org" },
    ],
  },
  experimental: {
    // Server Actions are stable in 14, kept explicit for clarity.
    serverActions: { bodySizeLimit: "4mb" },
  },
};
export default nextConfig;