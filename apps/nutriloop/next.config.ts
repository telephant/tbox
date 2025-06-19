import type { NextConfig } from "next";

const deployment = process.env.NEXT_PUBLIC_DEPLOYMENT || 'vercel';

let nextConfig: NextConfig = {}
switch (deployment) {
  case 'vercel':
    nextConfig = {
      output: 'standalone',
    }
    break;
  case 'github':
    nextConfig = {
      output: 'export', // enable static export
      basePath: '/tbox', // use repository name as sub-path
      assetPrefix: '/tbox/',

      images: {
        unoptimized: true, // close image optimization
      },
    }
    break;
  case 'cloudflare':
    nextConfig = {
      output: 'export', // enable static export
      images: {
        unoptimized: true, // close image optimization
      },
    }
    break;
}

export default nextConfig;