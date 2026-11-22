
import type { RequestHandler } from "express";

import {
  castVote,
  removeVote,
  getVoteSummary,
} from "./vote.service.js";

import {
  createVoteSchema,
  voteTargetSchema,
} from "./vote.validation.js";

// Create a vote or update an existing vote.
export const castVoteController: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    const parsed = createVoteSchema.safeParse(req.body);

    if (!parsed.success) {
      return next(parsed.error);
    }

    const { targetType, target, value } = parsed.data;

    const vote = await castVote({
      userId: req.auth!.userId,
      targetType,
      targetId: target,
      value,
    });

    res.status(200).json({
      success: true,
      message: "Vote saved successfully",
      data: vote,
    });
  } catch (error) {
    next(error);
  }
};

// Remove the current user's vote.
export const removeVoteController: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    const parsed = voteTargetSchema.safeParse(req.params);

    if (!parsed.success) {
      return next(parsed.error);
    }

    const { targetType, targetId } = parsed.data;

    const result = await removeVote(
      req.auth!.userId,
      targetType,
      targetId,
    );

    res.status(200).json({
      success: true,
      message: result.removed
        ? "Vote removed successfully"
        : "You have not voted on this target",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// Get the total score and current user's vote.
export const getVoteSummaryController: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    const parsed = voteTargetSchema.safeParse(req.params);

    if (!parsed.success) {
      return next(parsed.error);
    }

    const { targetType, targetId } = parsed.data;

    const summary = await getVoteSummary(
      req.auth!.userId,
      targetType,
      targetId,
    );

    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    next(error);
  }
};
