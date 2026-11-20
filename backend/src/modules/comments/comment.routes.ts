import { Router } from "express";

import { authenticate } from "../../middleware/authenticate.js";
import { requireTrustedOrigin } from "../../middleware/requireTrustedOrigin.js";

import {
  createCommentController,
  getPostCommentsController,
  getCommentRepliesController,
  getCommentController,
  updateCommentController,
  deleteCommentController,
} from "./comment.controller.js";

const router = Router();

// Create a comment or reply (requires login)
router.post("/", authenticate, requireTrustedOrigin, createCommentController);

// Get top-level comments for a post (public)
router.get("/posts/:postId", getPostCommentsController);

// Get replies to a comment (public)
router.get("/:id/replies", getCommentRepliesController);

// Get one comment (public)
router.get("/:id", getCommentController);

// Edit a comment (requires login)
router.patch("/:id", authenticate, requireTrustedOrigin, updateCommentController);

// Delete a comment (requires login)
router.delete("/:id", authenticate, requireTrustedOrigin, deleteCommentController);

export default router;