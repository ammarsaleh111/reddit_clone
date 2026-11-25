import type { RequestHandler } from "express";
import { Session } from "../models/Sessions.js";
import { User } from "../models/User.js";
import { COOKIE_NAME, hashToken } from "../lib/session.js";

/**
 * For Public endpoints. Attaches req.auth when a valid session cookie
 * for an active (or suspended, read-only) user exists. Otherwise it
 * silently continues as a guest (req.auth stays unset).
 */
export const optionalAuthenticate: RequestHandler = async (
  req,
  _res,
  next,
) => {
  try {
    const token = req.cookies?.[COOKIE_NAME];

    if (typeof token !== "string" || !/^[a-f0-9]{64}$/.test(token)) {
      next();
      return;
    }

    const session = await Session.findOne({
      tokenHash: hashToken(token),
      expiresAt: { $gt: new Date() },
    });

    if (!session) {
      next();
      return;
    }

    const user = await User.findById(session.userId);
    const status: string | undefined = user?.status;

    if (user && (status === "active" || status === "suspended")) {
      req.auth = {
        userId: user.id,
        role: user.role,
      };
    }

    next();
  } catch {
    // Treat any lookup failure as "guest". The route's own queries will
    // surface a real database outage with a proper error.
    next();
  }
};