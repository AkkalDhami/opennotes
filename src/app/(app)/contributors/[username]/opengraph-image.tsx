/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from "next/og"
import { eq } from "drizzle-orm"

import { db, users } from "@/db"
import { APP_NAME } from "@/constants/app.constants"

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
          background: "#fcfaed",
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

  const initials =
    contributor.name
      ?.split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "?"

  const bio =
    contributor.bio && contributor.bio.length > 140
      ? `${contributor.bio.slice(0, 140)}…`
      : contributor.bio

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        overflow: "hidden",
        background: "#fcfaed",
        color: "#111827",
        padding: "52px 60px",
      }}
    >
      {/* Decorative background */}
      <div
        style={{
          position: "absolute",
          width: 420,
          height: 420,
          right: -100,
          top: -130,
          borderRadius: 9999,
          background: "#e5f1e5",
          opacity: 0.8,
        }}
      />

      <div
        style={{
          position: "absolute",
          width: 300,
          height: 300,
          right: -40,
          bottom: -170,
          borderRadius: 9999,
          background: "#dceee5",
          opacity: 0.7,
        }}
      />

      {/* Main layout */}
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              fontSize: 30,
              fontWeight: 800,
              letterSpacing: "-0.04em",
            }}
          >
            {APP_NAME}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "11px 18px",
              borderRadius: 999,
              background: "#e8f2e7",
              color: "#315b45",
              fontSize: 18,
              fontWeight: 700,
            }}
          >
            <div
              style={{
                width: 9,
                height: 9,
                borderRadius: 999,
                background: "#4f8b63",
              }}
            />
            Contributor
          </div>
        </div>

        {/* Content */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 38,
            marginTop: 20,
          }}
        >
          {/* Avatar */}
          <div
            style={{
              width: 168,
              height: 168,
              borderRadius: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              background: "#e8eee8",
              border: "7px solid #ffffff",
              boxShadow: "0 8px 30px rgba(17, 24, 39, 0.12)",
              overflow: "hidden",
            }}
          >
            {contributor.avatarUrl ? (
              <img
                src={contributor.avatarUrl}
                width={168}
                height={168}
                alt={contributor.name}
                style={{
                  width: "168px",
                  height: "168px",
                  objectFit: "cover",
                }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 58,
                  fontWeight: 800,
                  color: "#315b45",
                }}
              >
                {initials}
              </div>
            )}
          </div>

          {/* Identity */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              maxWidth: 650,
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 20,
                fontWeight: 700,
                color: "#6b7280",
                marginBottom: 9,
              }}
            >
              Knowledge contributor
            </div>

            <div
              style={{
                display: "flex",
                fontSize: 58,
                lineHeight: 1.05,
                fontWeight: 800,
                letterSpacing: "-0.045em",
              }}
            >
              {contributor.name}
            </div>

            <div
              style={{
                display: "flex",
                fontSize: 25,
                color: "#6b7280",
                marginTop: 9,
              }}
            >
              @{contributor.username}
            </div>

            {bio && (
              <div
                style={{
                  display: "flex",
                  fontSize: 21,
                  lineHeight: 1.4,
                  color: "#4b5563",
                  marginTop: 20,
                  maxWidth: 620,
                }}
              >
                {bio}
              </div>
            )}
          </div>

          {/* Right decorative note card */}
          <div
            style={{
              position: "absolute",
              right: 20,
              top: 45,
              width: 225,
              height: 270,
              display: "flex",
              flexDirection: "column",
              padding: "25px",
              borderRadius: 22,
              background: "rgba(255,255,255,0.88)",
              border: "1px solid #e1e8df",
              boxShadow: "0 18px 45px rgba(49, 91, 69, 0.10)",
              transform: "rotate(4deg)",
            }}
          >
            {/* Fake document icon */}
            <div
              style={{
                width: 45,
                height: 45,
                borderRadius: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#e8f2e7",
                color: "#315b45",
                fontSize: 25,
                fontWeight: 800,
              }}
            >
              N
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
                marginTop: 24,
              }}
            >
              <div
                style={{
                  width: 145,
                  height: 12,
                  borderRadius: 99,
                  background: "#dce5df",
                }}
              />

              <div
                style={{
                  width: 175,
                  height: 12,
                  borderRadius: 99,
                  background: "#edf1ed",
                }}
              />

              <div
                style={{
                  width: 125,
                  height: 12,
                  borderRadius: 99,
                  background: "#edf1ed",
                }}
              />

              <div
                style={{
                  width: 160,
                  height: 12,
                  borderRadius: 99,
                  background: "#edf1ed",
                }}
              />
            </div>

            <div
              style={{
                display: "flex",
                marginTop: "auto",
                fontSize: 16,
                fontWeight: 700,
                color: "#6b7280",
              }}
            >
              Shared knowledge
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid #dfe5df",
            paddingTop: 22,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 18,
              color: "#6b7280",
            }}
          >
            Share knowledge. Help students learn.
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 18,
              fontWeight: 700,
              color: "#315b45",
            }}
          >
            {APP_NAME}
          </div>
        </div>
      </div>
    </div>,
    size
  )
}
