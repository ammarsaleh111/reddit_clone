
import { Router } from "express";

import { authenticate } from "../../middleware/authenticate.js";
import { requireTrustedOrigin } from "../../middleware/requireTrustedOrigin.js";

import {
  castVoteController,
  removeVoteController,
  getVoteSummaryController,
} from "./vote.controller.js";

const router = Router();

// Create a vote or update an existing vote.
router.post(
  "/",
  authenticate,
  requireTrustedOrigin,
  castVoteController,
);

// Remove the current user's vote.
router.delete(
  "/:targetType/:targetId",
  authenticate,
  requireTrustedOrigin,
  removeVoteController,
);

// Get the score and current user's vote.
router.get(
  "/:targetType/:targetId",
  authenticate,
  getVoteSummaryController,
);

export default router;
