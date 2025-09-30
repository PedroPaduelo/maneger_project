import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  // Configuração para Docker - standalone output
  output: 'standalone',
  // 禁用 Next.js 热重载，由 nodemon 处理重编译
  reactStrictMode: false,
  // Configuração explícita do diretório de saída para Vercel
  distDir: '.next',
  webpack: (config, { dev }) => {
    if (dev) {
      // 禁用 webpack 的热模块替换
      config.watchOptions = {
        ignored: ['**/*'], // 忽略所有文件变化
      };
    }
    return config;
  },
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
