/**
 * EDIT_WINDOW_SECONDS: 0 / unset / invalid = unlimited (default).
 * 300 = authors may edit for 5 minutes after creation.
 */
export function getEditWindowSeconds(): number {
  const raw = Number(process.env.EDIT_WINDOW_SECONDS ?? 0);

  if (!Number.isFinite(raw) || raw <= 0) {
    return 0;
  }

  return Math.floor(raw);
}