import { z } from "zod";
import mongoose from "mongoose";

// Validate MongoDB ObjectIds
const objectIdSchema = z.string().refine(
  (id) => mongoose.Types.ObjectId.isValid(id),
  "Invalid MongoDB ID",
);

// Validate creating or changing a vote
export const createVoteSchema = z.object({
  targetType: z.enum(["post", "comment"]),

  target: objectIdSchema,

  value: z.union([
    z.literal(1),
    z.literal(-1),
  ]),
}).strict();

// Validate identifying a post or comment
export const voteTargetSchema = z.object({
  targetType: z.enum(["post", "comment"]),
  targetId: objectIdSchema,
}).strict();