const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Suas outras configurações do Next.js aqui...
  reactStrictMode: true,
}

module.exports = withBundleAnalyzer(nextConfig)
