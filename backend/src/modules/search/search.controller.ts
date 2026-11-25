import type { RequestHandler } from "express";

import {
  searchCommunities,
  searchUsers,
} from "./search.service.js";

import { searchQuerySchema } from "./search.validation.js";

// Search for communities.
export const searchCommunitiesController: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    const parsed = searchQuerySchema.safeParse(req.query);

    if (!parsed.success) {
      return next(parsed.error);
    }

    const result = await searchCommunities(parsed.data);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// Search for users.
export const searchUsersController: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    const parsed = searchQuerySchema.safeParse(req.query);

    if (!parsed.success) {
      return next(parsed.error);
    }

    const result = await searchUsers(parsed.data);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};