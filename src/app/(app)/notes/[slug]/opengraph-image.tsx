/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from "next/og"
import { eq } from "drizzle-orm"

import { db, notes, users } from "@/db"
import { APP_NAME } from "@/constants/app.constants"
import { slugToTitle } from "@/utils/slug"

export const runtime = "edge"

export const alt = APP_NAME
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = "image/png"

interface Props {
  params: Promise<{
    slug: string
  }>
}

export default async function OpenGraphImage({ params }: Props) {
  const { slug } = await params

  const [note] = await db
    .select({
      title: notes.title,
      subject: notes.subject,
      grade: notes.grade,
      educationLevel: notes.educationLevel,
      course: notes.course,
      contributorName: users.name,
      contributorUsername: users.username,
      contributorAvatar: users.avatarUrl,
    })
    .from(notes)
    .innerJoin(users, eq(notes.contributorId, users.id))
    .where(eq(notes.slug, slug))
    .limit(1)

  if (!note) {
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
        Note Not Found
      </div>,
      size
    )
  }

  const initials =
    note.contributorName
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "?"

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: "52px 60px",
        background: "#fcfaed",
        color: "#111827",
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
            letterSpacing: "-0.03em",
          }}
        >
          {APP_NAME}
        </div>

        <div
          style={{
            display: "flex",
            padding: "10px 18px",
            borderRadius: 999,
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            fontSize: 18,
            fontWeight: 600,
            color: "#6b7280",
          }}
        >
          Notes
        </div>
      </div>

      {/* Main content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          justifyContent: "center",
          maxWidth: 1080,
        }}
      >
        {/* Metadata */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: 20,
            fontWeight: 600,
            color: "#6b7280",
            marginBottom: 22,
          }}
        >
          {slugToTitle(note.educationLevel)}
          <span style={{ margin: "0 10px", color: "#d1d5db" }}>•</span>
          {slugToTitle(note.course)}
          <span style={{ margin: "0 10px", color: "#d1d5db" }}>•</span>
          {slugToTitle(note.subject)}
          <span style={{ margin: "0 10px", color: "#d1d5db" }}>•</span>
          {slugToTitle(note.grade).toUpperCase()}
        </div>

        {/* Title */}
        <div
          style={{
            display: "flex",
            fontSize: 62,
            fontWeight: 800,
            lineHeight: 1.08,
            letterSpacing: "-0.045em",
            maxWidth: 1050,
          }}
        >
          {note.title}
        </div>
      </div>

      {/* Contributor */}
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
          }}
        >
          {note.contributorAvatar ? (
            <img
              src={note.contributorAvatar}
              width="52"
              height="52"
              style={{
                borderRadius: 999,
                objectFit: "cover",
              }}
              alt={note.contributorName}
            />
          ) : (
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 999,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#111827",
                color: "#ffffff",
                fontSize: 18,
                fontWeight: 700,
              }}
            >
              {initials}
            </div>
          )}

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginLeft: 14,
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 19,
                fontWeight: 700,
              }}
            >
              {note.contributorName}
            </div>

            <div
              style={{
                display: "flex",
                fontSize: 16,
                color: "#6b7280",
                marginTop: 3,
              }}
            >
              @{note.contributorUsername}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 18,
            fontWeight: 600,
            color: "#6b7280",
          }}
        >
          Shared on OpenNotes
        </div>
      </div>
    </div>,
    size
  )
}
