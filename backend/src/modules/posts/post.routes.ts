import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { optionalAuthenticate } from "../../middleware/optionalAuthenticate.js";
import { requireTrustedOrigin } from "../../middleware/requireTrustedOrigin.js";
import {
  createPostController,
  deletePostController,
  getFeedController,
  getPostController,
  listCommunityPostsController,
  updatePostController,
} from "./post.controller.js";

// Mounted at /api/v1, so these are full paths below that prefix.
const router = Router();

router.get("/feed", optionalAuthenticate, getFeedController);

router.post(
  "/communities/:name/posts",
  authenticate,
  requireTrustedOrigin,
  createPostController,
);
router.get(
  "/communities/:name/posts",
  optionalAuthenticate,
  listCommunityPostsController,
);

router.get("/posts/:postId", optionalAuthenticate, getPostController);
router.patch(
  "/posts/:postId",
  authenticate,
  requireTrustedOrigin,
  updatePostController,
);
router.delete(
  "/posts/:postId",
  authenticate,
  requireTrustedOrigin,
  deletePostController,
);

export default router;