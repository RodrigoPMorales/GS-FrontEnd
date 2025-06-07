/** @type {import('next').NextConfig} */
const nextConfig = {
  // Garantir que as variáveis de ambiente sejam carregadas corretamente
  env: {
    API_BASE_URL: process.env.API_BASE_URL,
  },
  
  // Configurações experimentais se necessário
  experimental: {
    // Garantir que as variáveis de ambiente sejam acessíveis
    serverComponentsExternalPackages: [],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
