/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['swiper'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'cdn.dooca.store' },
    ],
  },
}

module.exports = nextConfig
