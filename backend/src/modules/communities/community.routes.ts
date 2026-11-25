import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { optionalAuthenticate } from "../../middleware/optionalAuthenticate.js";
import { requireTrustedOrigin } from "../../middleware/requireTrustedOrigin.js";
import {
  createCommunityController,
  getCommunityController,
  joinCommunityController,
  leaveCommunityController,
  listCommunitiesController,
} from "./community.controller.js";

const router = Router();

router.get("/", optionalAuthenticate, listCommunitiesController);
router.post("/", authenticate, requireTrustedOrigin, createCommunityController);
router.get("/:name", optionalAuthenticate, getCommunityController);
router.put(
  "/:name/membership",
  authenticate,
  requireTrustedOrigin,
  joinCommunityController,
);
router.delete(
  "/:name/membership",
  authenticate,
  requireTrustedOrigin,
  leaveCommunityController,
);

export default router;