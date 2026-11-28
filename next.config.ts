import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  typedRoutes: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  redirects() {
    return [
      {
        source: "/admin",
        destination: "/admin/dashboard",
        permanent: true,
      },
      {
        source: "/profile",
        destination: "/profile/dashboard",
        permanent: true,
      },
    ]
  },
}

export default nextConfig
