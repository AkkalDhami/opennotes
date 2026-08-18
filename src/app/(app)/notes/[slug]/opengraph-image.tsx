import { ImageResponse } from "next/og"
import { eq } from "drizzle-orm"

import { db, notes, users } from "@/db"
import { APP_NAME } from "@/constants/app.constants"

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
      contributorName: users.name,
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
          fontSize: 48,
          fontWeight: 700,
        }}
      >
        Note Not Found
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
        padding: "70px",
        background: "#ffffff",
        color: "#111827",
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: 30,
          fontWeight: 700,
        }}
      >
        {APP_NAME}
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 24,
            color: "#6b7280",
            marginBottom: 20,
          }}
        >
          {note.subject} · {note.grade}
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 58,
            fontWeight: 800,
            lineHeight: 1.1,
            maxWidth: 1000,
          }}
        >
          {note.title}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          fontSize: 24,
          color: "#6b7280",
        }}
      >
        Shared by {note.contributorName ?? "OpenNotes contributor"}
      </div>
    </div>,
    size
  )
}
