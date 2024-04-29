/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
        port: '',
        pathname: '**'
      }
    ]
  }
}

const withNextIntl = require('next-intl/plugin')(
  './i18n.ts'
)

module.exports = withNextIntl(nextConfig)
