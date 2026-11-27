import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { AppError } from "../lib/AppError.js";
import { isDuplicateKeyError, isDuplicateOnField } from "../lib/mongoErrors.js";

const V1_PREFIX = "/api/v1";

function isV1Request(originalUrl: string): boolean {
  return (
    originalUrl === V1_PREFIX ||
    originalUrl.startsWith(`${V1_PREFIX}/`) ||
    originalUrl.startsWith(`${V1_PREFIX}?`)
  );
}

const DEFAULT_CODES: Record<number, string> = {
  400: "VALIDATION_ERROR",
  401: "UNAUTHENTICATED",
  403: "FORBIDDEN",
  404: "NOT_FOUND",
  409: "CONFLICT",
  429: "RATE_LIMITED",
  502: "AI_UNAVAILABLE",
};

function defaultCodeFor(status: number): string {
  return DEFAULT_CODES[status] ?? "INTERNAL_ERROR";
}

function toDetails(error: ZodError): Array<{ field: string; message: string }> {
  return error.issues.map((issue) => {
    const path = issue.path.map(String).join(".");
    const keys = (issue as { keys?: unknown }).keys;

    return {
      field: path || (Array.isArray(keys) ? keys.join(", ") : "body"),
      message: issue.message,
    };
  });
}

function isBodyParseError(error: unknown): boolean {
  return (
    error instanceof SyntaxError &&
    (error as { status?: unknown }).status === 400
  );
}

export const errorHandler: ErrorRequestHandler = (
  error: unknown,
  req,
  res,
  _next,
) => {
  const v1 = isV1Request(req.originalUrl);

  // ---------------------------------------------------------------
  // API Contract v2.0 format: { error: { code, message, details? } }
  // ---------------------------------------------------------------
  if (v1) {
    if (error instanceof ZodError) {
      res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Request validation failed.",
          details: toDetails(error),
        },
      });
      return;
    }

    if (error instanceof AppError) {
      const code = error.code ?? defaultCodeFor(error.statusCode);

      res.status(error.statusCode).json({
        error: {
          code,
          message: error.message,
          ...(code === "VALIDATION_ERROR" && error.details
            ? { details: error.details }
            : {}),
        },
      });
      return;
    }

    if (isBodyParseError(error)) {
      res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Request body is not valid JSON.",
          details: [{ field: "body", message: "Malformed JSON" }],
        },
      });
      return;
    }

    if (isDuplicateKeyError(error)) {
      if (isDuplicateOnField(error, "normalizedName")) {
        res.status(409).json({
          error: {
            code: "COMMUNITY_NAME_TAKEN",
            message: "That community name is already taken.",
          },
        });
        return;
      }

      res.status(409).json({
        error: {
          code: "CONFLICT",
          message: "This value already exists.",
        },
      });
      return;
    }

    console.error("Unexpected API error:", error);

    res.status(500).json({
      error: {
        code: "INTERNAL_ERROR",
        message: "Internal server error",
      },
    });
    return;
  }

  // ---------------------------------------------------------------
  // Legacy format for existing routes (/api/auth, /api/comments, ...)
  // ---------------------------------------------------------------
  if (error instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: error.issues.map(issue => ({
        path: issue.path.map(String).join("."),
        message: issue.message,
      })),
    });
    return;
  }

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
    return;
  }

  if (isDuplicateKeyError(error)) {
    res.status(409).json({
      success: false,
      message: "Email or username is already registered",
    });
    return;
  }

  console.error("Unexpected API error:", error);

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};