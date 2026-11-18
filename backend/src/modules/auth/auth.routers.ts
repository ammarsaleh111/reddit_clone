
import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import {
  register,
  login,
  logout,
  getMe,
} from "./auth.controller.js";
import { authenticate } from "../../middleware/authenticate.js";
import { requireTrustedOrigin } from "../../middleware/requireTrustedOrigin.js";

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many attempts. Try again later.",
  },
});

router.post(
  "/register",
  requireTrustedOrigin,
  authLimiter,
  register,
);

router.post(
  "/login",
  requireTrustedOrigin,
  authLimiter,
  login,
);

router.post(
  "/logout",
  requireTrustedOrigin,
  logout,
);

router.get("/me", authenticate, getMe);

export default router;
