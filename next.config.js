/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/supabase/:path*',
        destination: 'https://ezncqwoxblmatlexxfvr.supabase.co/:path*'
      }
    ]
  }
}

module.exports = nextConfig
