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
    
    // Resolver el problema con Cloudinary
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
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
  },
  // Transpilación de módulos
  transpilePackages: ['next-cloudinary']
};

export default nextConfig;