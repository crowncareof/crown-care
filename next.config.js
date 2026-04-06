/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'via.placeholder.com' },
    ],
  },
  serverExternalPackages: ['@prisma/client', 'bcryptjs'],
  allowedDevOrigins: ['192.168.3.216'],
};

module.exports = nextConfig;
