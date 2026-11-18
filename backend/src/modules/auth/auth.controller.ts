
import type { Request, Response } from "express";
import { User } from "../../models/User.js";
import {
  registerSchema,
  loginSchema,
} from "./auth.validation.js";
import {
  registerUser,
  loginUser,
  toPublicUser,
} from "./auth.service.js";
import {
  COOKIE_NAME,
  createSession,
  setSessionCookie,
  clearSessionCookie,
  revokeSession,
} from "../../lib/session.js";
import { AppError } from "../../lib/AppError.js";

export async function register(req: Request,res: Response,) {
  const input = registerSchema.parse(req.body);
  const user = await registerUser(input);

  const token = await createSession(user.id);
  setSessionCookie(res, token);

  res.status(201).json({
    success: true,
    data: { user: toPublicUser(user) },
  });
}

export async function login(
  req: Request,
  res: Response,
) {
  const input = loginSchema.parse(req.body);
  const user = await loginUser(input);

  // Revoke the previous session.
  await revokeSession(req.cookies?.[COOKIE_NAME]);

  const token = await createSession(user.id);
  setSessionCookie(res, token);

  res.status(200).json({
    success: true,
    data: { user: toPublicUser(user) },
  });
}

export async function logout(
  req: Request,
  res: Response,
) {
  await revokeSession(req.cookies?.[COOKIE_NAME]);
  clearSessionCookie(res);

  res.status(204).send();
}

export async function getMe(
  req: Request,
  res: Response,
) {
  if (!req.auth) {
    throw new AppError(401, "Authentication required");
  }

  const user = await User.findById(req.auth.userId);

  if (!user || user.status !== "active") {
    throw new AppError(401, "Session is no longer valid");
  }

  res.status(200).json({
    success: true,
    data: { user: toPublicUser(user) },
  });
}
