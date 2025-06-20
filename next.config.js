const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Suas outras configurações do Next.js aqui...
  reactStrictMode: true,

  // Configurações para melhor compatibilidade com SSR
  experimental: {
    // Melhorar hidratação
    optimizePackageImports: ['@tanstack/react-query', 'next-themes'],
  },

  // Configurações de webpack para resolver problemas de hidratação
  webpack: (config, { isServer }) => {
    // Evitar problemas com módulos que dependem de APIs do browser
    if (isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }

    return config
  },
}

module.exports = withBundleAnalyzer(nextConfig)
