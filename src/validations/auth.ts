import { z } from "zod"

export const UpdateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters.")
    .max(80, "Name must be at most 80 characters."),
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters.")
    .max(30, "Username must be at most 30 characters.")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores."
    )
    .transform((value) => value.toLowerCase()),
  bio: z
    .string()
    .max(220, "Bio cannot exceed 220 characters")
    .trim()
    .optional()
    .or(z.literal("")),
  avatarUrl: z.string().optional(),
})

export type UpdateProfileType = z.infer<typeof UpdateProfileSchema>
