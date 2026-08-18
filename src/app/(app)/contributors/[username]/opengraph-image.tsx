import { ImageResponse } from "next/og"
import { db, users } from "@/db"
import { eq } from "drizzle-orm"
import { APP_NAME } from "@/constants/app.constants"
import Image from "next/image"

export const runtime = "nodejs"

interface OpenGraphImageProps {
  params: Promise<{
    username: string
  }>
}

export const alt = `${APP_NAME} contributor`
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = "image/png"

export default async function OpenGraphImage({ params }: OpenGraphImageProps) {
  const { username } = await params

  const [contributor] = await db
    .select({
      name: users.name,
      username: users.username,
      bio: users.bio,
      avatarUrl: users.avatarUrl,
    })
    .from(users)
    .where(eq(users.username, username))
    .limit(1)

  if (!contributor) {
    return new ImageResponse(
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
          color: "#111827",
          fontSize: 48,
          fontWeight: 700,
        }}
      >
        Contributor Not Found
      </div>,
      size
    )
  }

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "64px",
        background: "#ffffff",
        color: "#111827",
      }}
    >
      {/* Brand */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          fontSize: 30,
          fontWeight: 800,
          color: "#111827",
        }}
      >
        {APP_NAME}
      </div>

      {/* Contributor */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 32,
        }}
      >
        {/* Avatar */}
        <div
          style={{
            width: 150,
            height: 150,
            borderRadius: 9999,
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#f3f4f6",
            border: "4px solid #e5e7eb",
            flexShrink: 0,
          }}
        >
          {contributor.avatarUrl ? (
            <Image
              src={contributor.avatarUrl ?? ""}
              width={150}
              height={150}
              alt={contributor.name ?? ""}
              style={{
                objectFit: "cover",
              }}
            />
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                height: "100%",
                fontSize: 64,
                fontWeight: 700,
                color: "#6b7280",
              }}
            >
              {contributor.name?.charAt(0).toUpperCase() ?? "?"}
            </div>
          )}
        </div>

        {/* Identity */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            maxWidth: 850,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 24,
              color: "#6b7280",
              fontWeight: 600,
            }}
          >
            Contributor
          </div>

          <div
            style={{
              display: "flex",
              fontSize: 52,
              fontWeight: 800,
              letterSpacing: "-1px",
            }}
          >
            {contributor.name}
          </div>

          <div
            style={{
              display: "flex",
              fontSize: 28,
              color: "#6b7280",
            }}
          >
            @{contributor.username}
          </div>

          {contributor.bio && (
            <div
              style={{
                display: "flex",
                marginTop: 8,
                fontSize: 22,
                color: "#4b5563",
                lineHeight: 1.4,
              }}
            >
              {contributor.bio.length > 120
                ? `${contributor.bio.slice(0, 120)}…`
                : contributor.bio}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: "2px solid #e5e7eb",
          paddingTop: 24,
          fontSize: 22,
          color: "#6b7280",
        }}
      >
        <div style={{ display: "flex" }}>
          Share knowledge. Help students learn.
        </div>

        <div
          style={{
            display: "flex",
            fontWeight: 700,
            color: "#111827",
          }}
        >
          {APP_NAME}
        </div>
      </div>
    </div>,
    size
  )
}
