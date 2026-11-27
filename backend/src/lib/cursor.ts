import { z } from "zod";
import { AppError } from "./AppError.js";

const BASE64URL_PATTERN = /^[A-Za-z0-9_-]+$/;
const MAX_CURSOR_LENGTH = 500;

export const cursorIdSchema = z.string().regex(/^[a-f0-9]{24}$/);

export const cursorDateSchema = z
  .string()
  .refine((value) => !Number.isNaN(Date.parse(value)), "Invalid date");

interface CursorSchema<T> {
  safeParse(data: unknown): { success: true; data: T } | { success: false };
}

export function invalidCursorError(): AppError {
  return new AppError(400, "The cursor is not valid.", "INVALID_CURSOR");
}

export function encodeCursor(payload: Record<string, unknown>): string {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

export function decodeCursor<T>(raw: string, schema: CursorSchema<T>): T {
  if (
    raw.length === 0 ||
    raw.length > MAX_CURSOR_LENGTH ||
    !BASE64URL_PATTERN.test(raw)
  ) {
    throw invalidCursorError();
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(Buffer.from(raw, "base64url").toString("utf8"));
  } catch {
    throw invalidCursorError();
  }

  const result = schema.safeParse(parsed);

  if (!result.success) {
    throw invalidCursorError();
  }

  return result.data;
}