import { Types, type PipelineStage } from "mongoose";
import { z } from "zod";
import { Comment } from "../../models/Comment.js";
import { Community } from "../../models/Community.js";
import { CommunityMember } from "../../models/CommunityMember.js";
import { Post } from "../../models/Post.js";
import { Vote } from "../../models/Vote.js";
import { AppError } from "../../lib/AppError.js";
import {
  cursorDateSchema,
  cursorIdSchema,
  decodeCursor,
  encodeCursor,
} from "../../lib/cursor.js";
import {
  loadUserRefs,
  toCommunityRef,
  uniqueObjectIds,
  type AuthContext,
  type CommunityRefDto,
  type UserRefDto,
} from "../../lib/dto.js";
import { getEditWindowSeconds } from "../../lib/editWindow.js";
import { buildPage, emptyPage, type PageInfo } from "../../lib/pagination.js";
import { findCommunityByName } from "../communities/community.service.js";
import type {
  CommunityPostsQuery,
  CreatePostInput,
  FeedQuery,
  UpdatePostInput,
} from "./post.validation.js";

// ---------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------

type PostSort = "popular" | "latest" | "oldest";
type VoteValue = -1 | 0 | 1;

interface PostLean {
  _id: Types.ObjectId;
  author: Types.ObjectId;
  community: Types.ObjectId;
  title: string;
  type: "text" | "link";
  body: string | null;
  url: string | null;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface PostViewerDto {
  vote: VoteValue;
  isAuthor: boolean;
  canEdit: boolean;
  editableUntil: string | null;
  canDelete: boolean;
}

export interface PostSummaryDto {
  id: string;
  type: "text" | "link";
  title: string;
  bodyPreview: string | null;
  url: string | null;
  urlDomain: string | null;
  community: CommunityRefDto;
  author: UserRefDto | null;
  score: number;
  commentCount: number;
  createdAt: string;
  editedAt: string | null;
  viewer: PostViewerDto | null;
}

export interface PostDto {
  id: string;
  type: "text" | "link";
  title: string;
  body: string | null;
  url: string | null;
  urlDomain: string | null;
  community: CommunityRefDto;
  author: UserRefDto | null;
  score: number;
  commentCount: number;
  createdAt: string;
  editedAt: string | null;
  viewer: PostViewerDto | null;
}

interface CommunityInfo {
  ref: CommunityRefDto;
  creatorId: string;
}

interface HydrationContext {
  auth: AuthContext | undefined;
  authors: Map<string, UserRefDto>;
  communities: Map<string, CommunityInfo>;
  commentCounts: Map<string, number>;
  scores: Map<string, number>;
  viewerVotes: Map<string, VoteValue>;
}

interface ListPostsArgs {
  baseFilter: Record<string, unknown>;
  sort: PostSort;
  limit: number;
  cursor: string | undefined;
  auth: AuthContext | undefined;
}

// ---------------------------------------------------------------------
// Cursors
// ---------------------------------------------------------------------

const popularCursorSchema = z
  .object({
    k: z.literal("popular"),
    s: z.number().int(),
    c: cursorDateSchema,
    i: cursorIdSchema,
  })
  .strict();

const timeCursorSchema = z
  .object({
    k: z.enum(["latest", "oldest"]),
    c: cursorDateSchema,
    i: cursorIdSchema,
  })
  .strict();

// ---------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------

const OBJECT_ID_PATTERN = /^[a-f0-9]{24}$/i;

function notFound(message: string): AppError {
  return new AppError(404, message, "NOT_FOUND");
}

function extractDomain(url: string | null): string | null {
  if (!url) {
    return null;
  }

  try {
    return new URL(url).hostname.replace(/^www\./i, "");
  } catch {
    return null;
  }
}

function isEditWindowOpen(createdAt: Date): boolean {
  const windowSeconds = getEditWindowSeconds();

  if (windowSeconds === 0) {
    return true;
  }

  return Date.now() <= createdAt.getTime() + windowSeconds * 1000;
}

function toVoteValue(value: number): VoteValue {
  if (value === 1) return 1;
  if (value === -1) return -1;
  return 0;
}

// ---------------------------------------------------------------------
// Batched look-ups (no N+1)
// ---------------------------------------------------------------------

async function getPostScores(
  postIds: Types.ObjectId[],
): Promise<Map<string, number>> {
  const scores = new Map<string, number>();

  if (postIds.length === 0) {
    return scores;
  }

  const rows = await Vote.aggregate<{ _id: Types.ObjectId; score: number }>([
    { $match: { targetType: "post", target: { $in: postIds } } },
    { $group: { _id: "$target", score: { $sum: "$value" } } },
  ]);

  for (const row of rows) {
    scores.set(row._id.toString(), row.score);
  }

  return scores;
}

async function getCommentCounts(
  postIds: Types.ObjectId[],
): Promise<Map<string, number>> {
  const counts = new Map<string, number>();

  if (postIds.length === 0) {
    return counts;
  }

  const rows = await Comment.aggregate<{ _id: Types.ObjectId; count: number }>([
    { $match: { post: { $in: postIds }, deletedAt: null } },
    { $group: { _id: "$post", count: { $sum: 1 } } },
  ]);

  for (const row of rows) {
    counts.set(row._id.toString(), row.count);
  }

  return counts;
}

async function getViewerVotes(
  userId: string,
  postIds: Types.ObjectId[],
): Promise<Map<string, VoteValue>> {
  const votes = new Map<string, VoteValue>();

  if (postIds.length === 0) {
    return votes;
  }

  const rows = (await Vote.find({
    user: userId,
    targetType: "post",
    target: { $in: postIds },
  })
    .select("target value")
    .lean()) as unknown as Array<{ target: Types.ObjectId; value: number }>;

  for (const row of rows) {
    votes.set(row.target.toString(), toVoteValue(row.value));
  }

  return votes;
}

async function loadCommunityInfo(
  communityIds: Types.ObjectId[],
): Promise<Map<string, CommunityInfo>> {
  const result = new Map<string, CommunityInfo>();
  const unique = uniqueObjectIds(communityIds);

  if (unique.length === 0) {
    return result;
  }

  const rows = (await Community.find({ _id: { $in: unique } })
    .select("name icon creator")
    .lean()) as unknown as Array<{
    _id: Types.ObjectId;
    name: string;
    icon: string | null;
    creator: Types.ObjectId;
  }>;

  for (const row of rows) {
    result.set(row._id.toString(), {
      ref: toCommunityRef(row),
      creatorId: row.creator.toString(),
    });
  }

  return result;
}

async function buildContext(
  rows: PostLean[],
  auth: AuthContext | undefined,
  scores: Map<string, number>,
): Promise<HydrationContext> {
  const postIds = rows.map((row) => row._id);

  const [authors, communities, commentCounts, viewerVotes] = await Promise.all([
    loadUserRefs(rows.map((row) => row.author)),
    loadCommunityInfo(rows.map((row) => row.community)),
    getCommentCounts(postIds),
    auth
      ? getViewerVotes(auth.userId, postIds)
      : Promise.resolve(new Map<string, VoteValue>()),
  ]);

  return { auth, authors, communities, commentCounts, scores, viewerVotes };
}

// ---------------------------------------------------------------------
// DTO mappers
// ---------------------------------------------------------------------

function buildViewer(row: PostLean, ctx: HydrationContext): PostViewerDto | null {
  const auth = ctx.auth;

  if (!auth) {
    return null;
  }

  const windowSeconds = getEditWindowSeconds();
  const isAuthor = row.author.toString() === auth.userId;
  const communityInfo = ctx.communities.get(row.community.toString());
  const isCommunityCreator = communityInfo?.creatorId === auth.userId;

  return {
    vote: ctx.viewerVotes.get(row._id.toString()) ?? 0,
    isAuthor,
    canEdit: isAuthor && isEditWindowOpen(row.createdAt),
    editableUntil:
      windowSeconds > 0
        ? new Date(row.createdAt.getTime() + windowSeconds * 1000).toISOString()
        : null,
    canDelete: isAuthor || isCommunityCreator || auth.role === "admin",
  };
}

function commonFields(row: PostLean, ctx: HydrationContext) {
  const id = row._id.toString();
  const communityInfo = ctx.communities.get(row.community.toString());
  const isLink = row.type === "link";

  return {
    id,
    url: isLink ? (row.url ?? null) : null,
    urlDomain: isLink ? extractDomain(row.url) : null,
    community:
      communityInfo?.ref ??
      ({ id: row.community.toString(), name: "unknown", iconUrl: null } as CommunityRefDto),
    author: ctx.authors.get(row.author.toString()) ?? null,
    score: ctx.scores.get(id) ?? 0,
    commentCount: ctx.commentCounts.get(id) ?? 0,
    createdAt: row.createdAt.toISOString(),
    editedAt:
      row.updatedAt.getTime() > row.createdAt.getTime()
        ? row.updatedAt.toISOString()
        : null,
    viewer: buildViewer(row, ctx),
  };
}

function toPostSummary(row: PostLean, ctx: HydrationContext): PostSummaryDto {
  const common = commonFields(row, ctx);

  return {
    id: common.id,
    type: row.type,
    title: row.title,
    bodyPreview: row.type === "text" && row.body ? row.body.slice(0, 300) : null,
    url: common.url,
    urlDomain: common.urlDomain,
    community: common.community,
    author: common.author,
    score: common.score,
    commentCount: common.commentCount,
    createdAt: common.createdAt,
    editedAt: common.editedAt,
    viewer: common.viewer,
  };
}

function toPost(row: PostLean, ctx: HydrationContext): PostDto {
  const common = commonFields(row, ctx);

  return {
    id: common.id,
    type: row.type,
    title: row.title,
    body: row.type === "text" ? (row.body ?? null) : null,
    url: common.url,
    urlDomain: common.urlDomain,
    community: common.community,
    author: common.author,
    score: common.score,
    commentCount: common.commentCount,
    createdAt: common.createdAt,
    editedAt: common.editedAt,
    viewer: common.viewer,
  };
}

async function hydrateSinglePost(
  row: PostLean,
  auth: AuthContext | undefined,
): Promise<PostDto> {
  const scores = await getPostScores([row._id]);
  const ctx = await buildContext([row], auth, scores);

  return toPost(row, ctx);
}

// ---------------------------------------------------------------------
// Post look-ups
// ---------------------------------------------------------------------

async function findLivePostLean(postId: string): Promise<PostLean> {
  if (!OBJECT_ID_PATTERN.test(postId)) {
    throw notFound("Post not found.");
  }

  const row = await Post.findOne({ _id: postId, deletedAt: null }).lean();

  if (!row) {
    throw notFound("Post not found.");
  }

  return row as unknown as PostLean;
}

async function findLivePostDoc(postId: string) {
  if (!OBJECT_ID_PATTERN.test(postId)) {
    throw notFound("Post not found.");
  }

  const doc = await Post.findOne({ _id: postId, deletedAt: null });

  if (!doc) {
    throw notFound("Post not found.");
  }

  return doc;
}

// ---------------------------------------------------------------------
// Shared list query (feed + community posts)
// ---------------------------------------------------------------------

async function listPosts(
  args: ListPostsArgs,
): Promise<{ data: PostSummaryDto[]; page: PageInfo }> {
  const { baseFilter, sort, limit, cursor, auth } = args;

  // ---- popular: score desc, createdAt desc, _id desc -----------------
  if (sort === "popular") {
    const cur =
      cursor === undefined ? null : decodeCursor(cursor, popularCursorSchema);

    const stages: Array<Record<string, unknown>> = [
      { $match: baseFilter },
      {
        $lookup: {
          from: Vote.collection.name,
          let: { postId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$targetType", "post"] },
                    { $eq: ["$target", "$$postId"] },
                  ],
                },
              },
            },
            { $group: { _id: null, total: { $sum: "$value" } } },
          ],
          as: "voteTotals",
        },
      },
      {
        $addFields: {
          score: { $ifNull: [{ $arrayElemAt: ["$voteTotals.total", 0] }, 0] },
        },
      },
      { $project: { voteTotals: 0 } },
    ];

    if (cur) {
      const cursorDate = new Date(cur.c);
      const cursorId = new Types.ObjectId(cur.i);

      stages.push({
        $match: {
          $or: [
            { score: { $lt: cur.s } },
            { score: cur.s, createdAt: { $lt: cursorDate } },
            { score: cur.s, createdAt: cursorDate, _id: { $lt: cursorId } },
          ],
        },
      });
    }

    stages.push(
      { $sort: { score: -1, createdAt: -1, _id: -1 } },
      { $limit: limit + 1 },
    );

    const rows = await Post.aggregate<PostLean & { score: number }>(
      stages as unknown as PipelineStage[],
    );

    const { items, page } = buildPage(rows, limit, (last) =>
      encodeCursor({
        k: "popular",
        s: last.score,
        c: last.createdAt.toISOString(),
        i: last._id.toHexString(),
      }),
    );

    const scores = new Map<string, number>();
    for (const item of items) {
      scores.set(item._id.toString(), item.score);
    }

    const ctx = await buildContext(items, auth, scores);

    return { data: items.map((row) => toPostSummary(row, ctx)), page };
  }

  // ---- latest / oldest -----------------------------------------------
  const cur =
    cursor === undefined ? null : decodeCursor(cursor, timeCursorSchema);

  if (cur && cur.k !== sort) {
    throw new AppError(400, "The cursor is not valid.", "INVALID_CURSOR");
  }

  const filter: Record<string, unknown> = { ...baseFilter };

  if (cur) {
    const cursorDate = new Date(cur.c);
    const cursorId = new Types.ObjectId(cur.i);
    const direction = sort === "latest" ? "$lt" : "$gt";

    filter.$or = [
      { createdAt: { [direction]: cursorDate } },
      { createdAt: cursorDate, _id: { [direction]: cursorId } },
    ];
  }

  const sortSpec: Record<string, 1 | -1> =
    sort === "latest" ? { createdAt: -1, _id: -1 } : { createdAt: 1, _id: 1 };

  const rows = (await Post.find(filter as never)
    .sort(sortSpec)
    .limit(limit + 1)
    .lean()) as unknown as PostLean[];

  const { items, page } = buildPage(rows, limit, (last) =>
    encodeCursor({
      k: sort,
      c: last.createdAt.toISOString(),
      i: last._id.toHexString(),
    }),
  );

  const scores = await getPostScores(items.map((row) => row._id));
  const ctx = await buildContext(items, auth, scores);

  return { data: items.map((row) => toPostSummary(row, ctx)), page };
}

// ---------------------------------------------------------------------
// 10. GET /feed
// ---------------------------------------------------------------------

export async function getFeed(
  query: FeedQuery,
  auth: AuthContext | undefined,
): Promise<{ data: PostSummaryDto[]; page: PageInfo }> {
  const { tab, sort, limit, cursor } = query;

  const baseFilter: Record<string, unknown> = { deletedAt: null };

  if (tab === "following") {
    if (!auth) {
      return { data: [], page: emptyPage(limit) };
    }

    const memberships = (await CommunityMember.find({ user: auth.userId })
      .select("community")
      .lean()) as unknown as Array<{ community: Types.ObjectId }>;

    if (memberships.length === 0) {
      return { data: [], page: emptyPage(limit) };
    }

    baseFilter.community = {
      $in: uniqueObjectIds(memberships.map((membership) => membership.community)),
    };
  }

  return listPosts({ baseFilter, sort, limit, cursor, auth });
}

// ---------------------------------------------------------------------
// 11. GET /communities/:name/posts
// ---------------------------------------------------------------------

export async function listCommunityPosts(
  name: string,
  query: CommunityPostsQuery,
  auth: AuthContext | undefined,
): Promise<{ data: PostSummaryDto[]; page: PageInfo }> {
  const community = await findCommunityByName(name);

  return listPosts({
    baseFilter: { deletedAt: null, community: community._id },
    sort: query.sort,
    limit: query.limit,
    cursor: query.cursor,
    auth,
  });
}

// ---------------------------------------------------------------------
// 6. POST /communities/:name/posts
// ---------------------------------------------------------------------

export async function createPost(
  name: string,
  auth: AuthContext,
  input: CreatePostInput,
): Promise<PostDto> {
  const community = await findCommunityByName(name);

  const created = await Post.create({
    author: auth.userId,
    community: community._id,
    title: input.title.trim(),
    type: input.type,
    body: input.type === "text" ? (input.body ?? null) : null,
    url: input.type === "link" ? (input.url ?? null) : null,
  });

  const row = created.toObject() as unknown as PostLean;

  // A brand-new post has no votes and no comments.
  const ctx = await buildContext([row], auth, new Map<string, number>());

  return toPost(row, ctx);
}

// ---------------------------------------------------------------------
// 7. GET /posts/:postId
// ---------------------------------------------------------------------

export async function getPost(
  postId: string,
  auth: AuthContext | undefined,
): Promise<PostDto> {
  const row = await findLivePostLean(postId);

  return hydrateSinglePost(row, auth);
}

// ---------------------------------------------------------------------
// 8. PATCH /posts/:postId
// ---------------------------------------------------------------------

export async function updatePost(
  postId: string,
  auth: AuthContext,
  input: UpdatePostInput,
): Promise<PostDto> {
  const post = await findLivePostDoc(postId);
  const current = post.toObject() as unknown as PostLean;

  if (current.author.toString() !== auth.userId) {
    throw new AppError(403, "You can only edit your own posts.", "FORBIDDEN");
  }

  if (!isEditWindowOpen(current.createdAt)) {
    throw new AppError(
      403,
      "The time limit for editing this post has passed.",
      "EDIT_WINDOW_EXPIRED",
    );
  }

  const details: Array<{ field: string; message: string }> = [];

  if (input.body !== undefined && current.type !== "text") {
    details.push({
      field: "body",
      message: "Body can only be edited on text posts.",
    });
  }

  if (input.url !== undefined && current.type !== "link") {
    details.push({
      field: "url",
      message: "URL can only be edited on link posts.",
    });
  }

  if (details.length > 0) {
    throw new AppError(
      400,
      "Request validation failed.",
      "VALIDATION_ERROR",
      details,
    );
  }

  if (input.title !== undefined) {
    post.set("title", input.title);
  }

  if (input.body !== undefined) {
    post.set("body", input.body);
  }

  if (input.url !== undefined) {
    post.set("url", input.url);
  }

  await post.save(); // Mongoose timestamps bump updatedAt when something changed.

  const updated = post.toObject() as unknown as PostLean;

  return hydrateSinglePost(updated, auth);
}

// ---------------------------------------------------------------------
// 9. DELETE /posts/:postId (soft delete)
// ---------------------------------------------------------------------

export async function deletePost(
  postId: string,
  auth: AuthContext,
): Promise<void> {
  const post = await findLivePostDoc(postId);
  const current = post.toObject() as unknown as PostLean;

  const community = (await Community.findById(current.community)
    .select("creator")
    .lean()) as unknown as { creator: Types.ObjectId } | null;

  const isAuthor = current.author.toString() === auth.userId;
  const isCommunityCreator = community?.creator.toString() === auth.userId;
  const isAdmin = auth.role === "admin";

  if (!isAuthor && !isCommunityCreator && !isAdmin) {
    throw new AppError(
      403,
      "You are not allowed to delete this post.",
      "FORBIDDEN",
    );
  }

  post.set("deletedAt", new Date());
  await post.save();
}