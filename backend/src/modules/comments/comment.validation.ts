
import { z } from "zod";
import mongoose from "mongoose";

const objectIdSchema = z.string().refine(
  (id) => mongoose.Types.ObjectId.isValid(id),
  "Invalid MongoDB ID",
);

// Creating a comment or reply
export const createCommentSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Comment cannot be empty")
    .max(10000, "Comment cannot exceed 10,000 characters"),

  post: objectIdSchema,

  parent: objectIdSchema.optional(),
}).strict();

// Editing a comment
export const updateCommentSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Comment cannot be empty")
    .max(10000, "Comment cannot exceed 10,000 characters"),
}).strict();

// Validating IDs in URLs
export const commentIdSchema = z.object({
  id: objectIdSchema,
});

export const postIdSchema = z.object({
  postId: objectIdSchema,
});

// Pagination
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
