/** @type {import('next').NextConfig} */
const nextConfig = {
  // Receipt photos (GCash / bank transfer) up to 5 MB are sent through a server action.
  experimental: { serverActions: { bodySizeLimit: '6mb' } },
};
export default nextConfig;
