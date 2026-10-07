/** @type {import('next').NextConfig} */
export default {
  output: 'standalone',
  images: { formats: ['image/avif', 'image/webp'] },
  serverExternalPackages: ['pg', 'sharp'],
};
