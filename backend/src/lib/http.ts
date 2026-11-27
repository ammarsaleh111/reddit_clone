import type { Request, RequestHandler } from "express";
import { AppError } from "./AppError.js";
import type { AuthContext } from "./dto.js";

/**
 * Forwards rejected promises to Express error middleware
 * (works on Express 4 and Express 5).
 */
export function asyncHandler(handler: RequestHandler): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

/**
 * Use inside controllers that sit behind `authenticate`.
 * Throws 401 if, for any reason, req.auth is missing.
 */
export function requireAuthContext(req: Request): AuthContext {
  const auth = req.auth;

  if (!auth) {
    throw new AppError(401, "Authentication required", "UNAUTHENTICATED");
  }

  return { userId: auth.userId, role: auth.role };
}