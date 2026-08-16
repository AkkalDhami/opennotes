import { NextRequest, NextResponse } from "next/server"
import { eq, and, ne } from "drizzle-orm"

import { db, users } from "@/db"
import { getCurrentUser } from "@/lib/auth/get-current-user"
import { validateRequest } from "@/lib/validate-request"
import { UpdateProfileSchema } from "@/validations/auth"
import { uploadToImageKit } from "@/services/imagekit.service"
import { randomUUID } from "node:crypto"
import imagekitClient from "@/configs/imagekit"

const MAX_FILE_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "You must be signed in.",
        },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const avatarUrl = formData.get("avatarUrl")

    const result = validateRequest(UpdateProfileSchema, {
      name: formData.get("name"),
      username: formData.get("username"),
      bio: formData.get("bio"),
    })

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid data received.",
        },
        { status: 400 }
      )
    }

    const { name, username, bio } = result.data

    if (avatarUrl) {
      if (!(avatarUrl instanceof File)) {
        return NextResponse.json(
          {
            success: false,
            message: "No image provided",
          },
          { status: 400 }
        )
      }

      if (!ALLOWED_TYPES.includes(avatarUrl.type)) {
        return NextResponse.json(
          {
            success: false,
            message: "Only JPEG, PNG, WEBP, or GIF images are allowed",
          },
          { status: 400 }
        )
      }

      if (avatarUrl.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          {
            success: false,
            message: "Image must be smaller than 5MB",
          },
          { status: 400 }
        )
      }

      const buffer = Buffer.from(await avatarUrl.arrayBuffer())

      const { url, fileId } = await uploadToImageKit(buffer, {
        folder: "avatars",
        fileName: `${user.id}-${randomUUID()}`,
      })

      await db
        .update(users)
        .set({ avatarUrl: url, avatarId: fileId })
        .where(eq(users.id, user.id))

      if (user.avatarId) {
        await imagekitClient.files.delete(user.avatarId)
      }
    }

    const existingUser = await db
      .select({
        id: users.id,
      })
      .from(users)
      .where(and(eq(users.username, username), ne(users.id, user.id)))
      .limit(1)

    if (existingUser.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Username is already taken.",
        },
        { status: 409 }
      )
    }

    try {
      const [updatedUser] = await db
        .update(users)
        .set({
          name,
          username,
          bio: bio || null,
        })
        .where(eq(users.id, user.id))
        .returning({
          id: users.id,
          name: users.name,
          username: users.username,
          bio: users.bio,
          email: users.email,
          role: users.role,
        })

      if (!updatedUser) {
        return NextResponse.json(
          {
            success: false,
            message: "User not found.",
          },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        message: "Profile updated successfully.",
        data: updatedUser,
      })
    } catch (error) {
      console.error("[PATCH /api/profile]", error)
      // PostgreSQL unique constraint violation
      if ((error as Error & { code?: string })?.code === "23505") {
        return NextResponse.json(
          {
            success: false,
            message: "Username is already taken.",
          },
          { status: 409 }
        )
      }

      throw error
    }
  } catch (error) {
    console.error("[PATCH /api/profile]", error)

    return NextResponse.json(
      {
        success: false,
        message: "Unable to update profile.",
      },
      { status: 500 }
    )
  }
}
