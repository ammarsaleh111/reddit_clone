import { z } from "zod";
import { cursorQuerySchema, limitSchema } from "../../lib/pagination.js";

function isHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

export const createCommunitySchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(3, "Name must be at least 3 characters.")
      .max(21, "Name must be at most 21 characters.")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Name may contain only letters, digits and underscores.",
      ),
    description: z
      .string()
      .trim()
      .min(1, "Description is required.")
      .max(500, "Description must be at most 500 characters."),
    iconUrl: z
      .string()
      .trim()
      .max(500, "Icon URL must be at most 500 characters.")
      .refine(isHttpsUrl, "Icon URL must be a valid https:// link.")
      .nullable()
      .optional(),
  })
  .strict();

export const listCommunitiesQuerySchema = z
  .object({
    sort: z.enum(["popular", "latest", "alphabetical"]).default("popular"),
    joined: z.enum(["true", "false"]).default("false"),
    limit: limitSchema,
    cursor: cursorQuerySchema,
  })
  .strict();

export type CreateCommunityInput = z.infer<typeof createCommunitySchema>;
export type ListCommunitiesQuery = z.infer<typeof listCommunitiesQuerySchema>;