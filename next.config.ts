import type { NextConfig } from "next";
import {hostname} from "node:os";

const nextConfig: NextConfig = {
  /* config options here */

    cacheComponents: true,

    images: {
        remotePatterns: [
            {
            protocol: 'https',
            hostname: 'res.cloudinary.com',
            }
        ]
    }
};

export default nextConfig;
