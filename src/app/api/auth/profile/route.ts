import { NextRequest, NextResponse } from "next/server"
import { eq, and, ne } from "drizzle-orm"

import { db, users } from "@/db"
import { getCurrentUser } from "@/lib/auth/get-current-user"
import { validateRequest } from "@/lib/validate-request"
import { UpdateProfileSchema } from "@/validations/auth"

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

    const body = await request.json()

    const name = typeof body.name === "string" ? body.name.trim() : ""

    const username =
      typeof body.username === "string"
        ? body.username.trim().toLowerCase()
        : ""

    const bio = typeof body.bio === "string" ? body.bio.trim() : ""

    const result = validateRequest(UpdateProfileSchema, body)

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid data received.",
        },
        { status: 400 }
      )
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
