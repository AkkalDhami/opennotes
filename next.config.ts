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
    ]
  },
}

export default nextConfig
