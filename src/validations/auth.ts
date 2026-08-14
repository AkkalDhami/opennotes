import { z } from "zod"

export const UpdateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long").trim(),
  username: z
    .string()
    .min(2, "Username must be at least 2 characters long")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Username can only contain lowercase letters, numbers, and hyphens."
    )
    .trim().lowercase(),
  bio: z.string().max(220, "Bio cannot exceed 220 characters").trim().optional(),
})

export type UpdateProfileType = z.infer<typeof UpdateProfileSchema>
