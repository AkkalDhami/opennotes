import { SITE_URL } from "@/constants/app.constants"
import { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/dashboard/",
          "/signin",
          "/upload",
          "/profile/",
          "/api/",
        ],
      },
    ],

    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
