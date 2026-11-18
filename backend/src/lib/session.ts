
import { randomBytes, createHash } from "node:crypto";
import type { Response } from "express";
import { Session } from "../models/Sessions.js";

export const COOKIE_NAME = "community.sid";

const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("hex");

  await Session.create({
    userId,
    tokenHash: hashToken(token),
    expiresAt: new Date(Date.now() + SESSION_DURATION_MS),
  });

  return token;
}

export function setSessionCookie(res: Response, token: string) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_MS,
  });
}

export function clearSessionCookie(res: Response) {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
}

export async function revokeSession(token?: string) {
  if (!token) return;

  await Session.deleteOne({
    tokenHash: hashToken(token),
  });
}
