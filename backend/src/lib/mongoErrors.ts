export function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === 11000
  );
}

export function isDuplicateOnField(error: unknown, field: string): boolean {
  if (!isDuplicateKeyError(error)) {
    return false;
  }

  const candidate = error as {
    keyPattern?: Record<string, unknown>;
    keyValue?: Record<string, unknown>;
    message?: string;
  };

  if (candidate.keyPattern && field in candidate.keyPattern) {
    return true;
  }

  if (candidate.keyValue && field in candidate.keyValue) {
    return true;
  }

  return typeof candidate.message === "string" && candidate.message.includes(field);
}