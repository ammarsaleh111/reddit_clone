
import type { RequestHandler } from "express";
import { Session } from "../models/Sessions.js";
import { User } from "../models/User.js";
import { COOKIE_NAME, hashToken } from "../lib/session.js";
import { AppError } from "../lib/AppError.js";

export const authenticate: RequestHandler = async (
  req,
  _res,
  next,
) => {
  try {
    const token = req.cookies?.[COOKIE_NAME];

    if (typeof token !== "string" ||
        !/^[a-f0-9]{64}$/.test(token)) {
      throw new AppError(401, "Authentication required");
    }

    const session = await Session.findOne({
      tokenHash: hashToken(token),
      expiresAt: { $gt: new Date() },
    });

    if (!session) {
      throw new AppError(401, "Invalid or expired session");
    }

    const user = await User.findById(session.userId);

    if (!user || user.status !== "active") {
      await Session.deleteOne({ _id: session._id });
      throw new AppError(401, "Session is no longer valid");
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
