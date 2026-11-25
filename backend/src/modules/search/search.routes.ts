import { Router } from "express";

import {
  searchCommunitiesController,
  searchUsersController,
} from "./search.controller.js";

const router = Router();

// Search for communities.
router.get("/communities", searchCommunitiesController);

// Search for users.
router.get("/users", searchUsersController);

export default router;