
import mongoose from "mongoose";

import { Vote } from "../../models/Vote.js";
import { Post } from "../../models/Post.js";
import { Comment } from "../../models/Comment.js";
import { AppError } from "../../lib/AppError.js";

type TargetType = "post" | "comment";

interface CastVoteInput {
  userId: string;
  targetType: TargetType;
  targetId: string;
  value: 1 | -1;
}

// Check that the post or comment exists and has not been deleted.
async function ensureTargetExists(
  targetType: TargetType,
  targetId: string,
) {
  const target =
    targetType === "post"
      ? await Post.findOne({
          _id: targetId,
          deletedAt: null,
        }).select("_id")
      : await Comment.findOne({
          _id: targetId,
          deletedAt: null,
        }).select("_id");

  if (!target) {
    throw new AppError(404, `${targetType} not found`);
  }
}

// 1. Create a vote or update the user's existing vote.
export async function castVote(input: CastVoteInput) {
  const { userId, targetType, targetId, value } = input;

  await ensureTargetExists(targetType, targetId);

  const vote = await Vote.findOneAndUpdate(
    {
      user: userId,
      targetType,
      target: targetId,
    },
    {
      $set: { value },
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
    },
  );

  return vote;
}

// 2. Remove the user's vote from a post or comment.
export async function removeVote(
  userId: string,
  targetType: TargetType,
  targetId: string,
) {
  await ensureTargetExists(targetType, targetId);

  const result = await Vote.deleteOne({
    user: userId,
    targetType,
    target: targetId,
  });

  return {
    removed: result.deletedCount > 0,
  };
}

// 3. Get the total score, upvotes, and downvotes.
export async function getVoteScore(
  targetType: TargetType,
  targetId: string,
) {
  await ensureTargetExists(targetType, targetId);

  const targetObjectId = new mongoose.Types.ObjectId(targetId);

  const result = await Vote.aggregate([
    {
      $match: {
        targetType,
        target: targetObjectId,
      },
    },
    {
      $group: {
        _id: null,
        score: { $sum: "$value" },
        upvotes: {
          $sum: {
            $cond: [{ $eq: ["$value", 1] }, 1, 0],
          },
        },
        downvotes: {
          $sum: {
            $cond: [{ $eq: ["$value", -1] }, 1, 0],
          },
        },
      },
    },
  ]);

  // If nobody has voted, MongoDB returns an empty array.
  return result[0] ?? {
    score: 0,
    upvotes: 0,
    downvotes: 0,
  };
}

// 4. Find the current user's vote on a target.
export async function getUserVote(
  userId: string,
  targetType: TargetType,
  targetId: string,
) {
  await ensureTargetExists(targetType, targetId);

  const vote = await Vote.findOne({
    user: userId,
    targetType,
    target: targetId,
  }).select("value");

  // 0 means the user has not voted.
  return vote?.value ?? 0;
}

// 5. Get the score and the current user's vote together.
export async function getVoteSummary(
  userId: string,
  targetType: TargetType,
  targetId: string,
) {
  const [score, userVote] = await Promise.all([
    getVoteScore(targetType, targetId),
    getUserVote(userId, targetType, targetId),
  ]);

  return {
    ...score,
    userVote,
  };
}
