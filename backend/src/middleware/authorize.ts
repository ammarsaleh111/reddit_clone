
import type { RequestHandler } from "express";
import { AppError } from "../lib/AppError.js";

type Role = "user" | "super_admin";

export function authorize(...roles: Role[]): RequestHandler {
  return (req, _res, next) => {
    if (!req.auth) {
      return next(new AppError(401, "Authentication required"));
    }

    if (!roles.includes(req.auth.role)) {
      return next(new AppError(403, "Access denied"));
    }

    next();
  };
}
