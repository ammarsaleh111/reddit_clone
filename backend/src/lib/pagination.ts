import { z } from "zod";

export const limitSchema = z.coerce.number().int().min(1).max(50).default(20);

export const cursorQuerySchema = z.string().optional();

export interface PageInfo {
  limit: number;
  hasMore: boolean;
  nextCursor: string | null;
}

export function emptyPage(limit: number): PageInfo {
  return { limit, hasMore: false, nextCursor: null };
}

/**
 * `rows` must contain up to limit + 1 items. Slices to `limit`
 * and builds the cursor from the last returned item.
 */
export function buildPage<T>(
  rows: T[],
  limit: number,
  makeCursor: (last: T) => string,
): { items: T[]; page: PageInfo } {
  const hasMore = rows.length > limit;
  const items = hasMore ? rows.slice(0, limit) : rows;
  const last = items[items.length - 1];

  return {
    items,
    page: {
      limit,
      hasMore,
      nextCursor: hasMore && last !== undefined ? makeCursor(last) : null,
    },
  };
}