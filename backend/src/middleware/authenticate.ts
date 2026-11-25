import type { RequestHandler } from "express";
import { Session } from "../models/Sessions.js";
import { User } from "../models/User.js";
import { COOKIE_NAME, hashToken } from "../lib/session.js";
import { AppError } from "../lib/AppError.js";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export const authenticate: RequestHandler = async (
  req,
  _res,
  next,
) => {
  try {
    const token = req.cookies?.[COOKIE_NAME];

    if (typeof token !== "string" ||
        !/^[a-f0-9]{64}$/.test(token)) {
      throw new AppError(401, "Authentication required", "UNAUTHENTICATED");
    }

    const session = await Session.findOne({
      tokenHash: hashToken(token),
      expiresAt: { $gt: new Date() },
    });

    if (!session) {
      throw new AppError(401, "Invalid or expired session", "UNAUTHENTICATED");
    }

    const user = await User.findById(session.userId);
    const status: string | undefined = user?.status;

    // Banned (or unknown) accounts lose their session.
    // Suspended accounts may stay logged in and read.
    if (!user || (status !== "active" && status !== "suspended")) {
      await Session.deleteOne({ _id: session._id });
      throw new AppError(401, "Session is no longer valid", "UNAUTHENTICATED");
    }

    // Suspended accounts cannot write (POST / PUT / PATCH / DELETE).
    if (status === "suspended" && !SAFE_METHODS.has(req.method)) {
      throw new AppError(
        403,
        "Your account is suspended.",
        "ACCOUNT_SUSPENDED",
      );
    }

    req.auth = {
      userId: user.id,
      role: user.role,
    };

    next();
  } catch (error) {
    next(error);
  }
};