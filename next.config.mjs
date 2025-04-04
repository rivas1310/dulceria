import { hostname } from "os";

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  // Añadimos la configuración de webpack
  webpack: (config, { isServer }) => {
    config.ignoreWarnings = [{ module: /react-server-dom-webpack/ }];
    return config;
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Configuración de API
  api: {
    bodyParser: {
      sizeLimit: '8mb',
    },
  },
  experimental: {
    serverActions: true,
  }
};

export default nextConfig;