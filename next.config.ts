/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        // ONLY the subdomain + .supabase.co goes in hostname
        hostname: 'rvinrzxeetertylulqkx.supabase.co',
        port: '',
        // The path portion starts after the .co
        // Use `/storage/v1/s3/**` so it matches everything in that folder
        pathname: '/storage/v1/s3/**',
      },
    ],
  },
};

module.exports = nextConfig;
