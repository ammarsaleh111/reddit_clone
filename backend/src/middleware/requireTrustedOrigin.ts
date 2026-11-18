
import type { RequestHandler } from "express";
import { env } from "../config/env.js";
import { AppError } from "../lib/AppError.js";

const trustedOrigins = new Set([
  new URL(env.CLIENT_URL).origin,
]);

export const requireTrustedOrigin: RequestHandler = (
  req,
  _res,
  next,
) => {
  const origin = req.get("origin");

  if (!origin || !trustedOrigins.has(origin)) {
    return next(new AppError(403, "Untrusted request origin"));
  }

  next();
};
