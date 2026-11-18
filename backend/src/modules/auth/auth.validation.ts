
import { z } from "zod";

export const registerSchema = z.object({
  username: z.string()
    .trim()
    .min(3)
    .max(30)
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can contain letters, numbers, and underscores only",
    )
    .transform(value => value.toLowerCase()),

  email: z.email()
    .trim()
    .transform(value => value.toLowerCase()),

  password: z.string()
    .min(8)
    .max(128),
}).strict();

export const loginSchema = z.object({
  email: z.email()
    .trim()
    .transform(value => value.toLowerCase()),

  password: z.string().min(8).max(128),
}).strict();

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
