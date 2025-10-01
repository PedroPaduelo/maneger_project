import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: true,
    eslint: {
    // 构建时忽略ESLint错误
    ignoreDuringBuilds: true,
  },
  // Otimizações para Docker
  experimental: {
    // Habilitar otimizações de imagem
    optimizePackageImports: ['lucide-react', '@radix-ui/react-*'],
  },
  // Comprimir imagens
  images: {
    formats: ['image/webp', 'image/avif'],
  },
};

export default nextConfig;
