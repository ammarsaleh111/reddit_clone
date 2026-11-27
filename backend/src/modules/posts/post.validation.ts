import { z } from "zod";
import { cursorQuerySchema, limitSchema } from "../../lib/pagination.js";

function isHttpUrl(value: string): boolean {
  try {
    const protocol = new URL(value).protocol;
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}

const titleSchema = z
  .string()
  .trim()
  .min(1, "Title is required.")
  .max(300, "Title must be at most 300 characters.");

const bodySchema = z
  .string()
  .trim()
  .min(1, "Body is required.")
  .max(20000, "Body must be at most 20,000 characters.");

const urlSchema = z
  .string()
  .trim()
  .max(2048, "URL must be at most 2,048 characters.")
  .refine(isHttpUrl, "URL must be a valid http:// or https:// link.");

export const createPostSchema = z
  .object({
    type: z.enum(["text", "link"]),
    title: titleSchema,
    body: bodySchema.nullable().optional(),
    url: urlSchema.nullable().optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.type === "text") {
      if (data.body === undefined || data.body === null) {
        ctx.addIssue({
          code: "custom",
          path: ["body"],
          message: "Body is required for text posts.",
        });
      }

      if (data.url !== undefined && data.url !== null) {
        ctx.addIssue({
          code: "custom",
          path: ["url"],
          message: "URL is not allowed on text posts.",
        });
      }
    } else {
      if (data.url === undefined || data.url === null) {
        ctx.addIssue({
          code: "custom",
          path: ["url"],
          message: "URL is required for link posts.",
        });
      }

      if (data.body !== undefined && data.body !== null) {
        ctx.addIssue({
          code: "custom",
          path: ["body"],
          message: "Body is not allowed on link posts.",
        });
      }
    }
  });

export const updatePostSchema = z
  .object({
    title: titleSchema.optional(),
    body: bodySchema.optional(),
    url: urlSchema.optional(),
  })
  .strict()
  .refine(
    (data) => Object.values(data).some((value) => value !== undefined),
    "At least one field must be provided.",
  );

export const feedQuerySchema = z
  .object({
    tab: z.enum(["for-you", "following"]).default("for-you"),
    sort: z.enum(["popular", "latest", "oldest"]).default("popular"),
    limit: limitSchema,
    cursor: cursorQuerySchema,
  })
  .strict();

export const communityPostsQuerySchema = z
  .object({
    sort: z.enum(["popular", "latest", "oldest"]).default("popular"),
    limit: limitSchema,
    cursor: cursorQuerySchema,
  })
  .strict();

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type FeedQuery = z.infer<typeof feedQuerySchema>;
export type CommunityPostsQuery = z.infer<typeof communityPostsQuerySchema>;