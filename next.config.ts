import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  typedRoutes: true,
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
