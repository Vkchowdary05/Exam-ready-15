/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Force dynamic rendering for all pages
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
}

export default nextConfig