import { Types, type PipelineStage } from "mongoose";
import { z } from "zod";
import { Community } from "../../models/Community.js";
import { CommunityMember } from "../../models/CommunityMember.js";
import { AppError } from "../../lib/AppError.js";
import {
  cursorDateSchema,
  cursorIdSchema,
  decodeCursor,
  encodeCursor,
} from "../../lib/cursor.js";
import {
  loadUserRefs,
  uniqueObjectIds,
  type AuthContext,
  type UserRefDto,
} from "../../lib/dto.js";
import { buildPage, emptyPage, type PageInfo } from "../../lib/pagination.js";
import { isDuplicateKeyError } from "../../lib/mongoErrors.js";
import type {
  CreateCommunityInput,
  ListCommunitiesQuery,
} from "./community.validation.js";

// ---------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------

export interface CommunityLean {
  _id: Types.ObjectId;
  name: string;
  normalizedName: string;
  description: string;
  icon: string | null;
  creator: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface CommunityDto {
  id: string;
  name: string;
  description: string;
  iconUrl: string | null;
  creator: UserRefDto | null;
  memberCount: number;
  createdAt: string;
  viewer: {
    isMember: boolean;
    isCreator: boolean;
    canModerate: boolean;
  } | null;
}

export interface MembershipResultDto {
  isMember: boolean;
  memberCount: number;
}

// ---------------------------------------------------------------------
// Cursors
// ---------------------------------------------------------------------

const popularCursorSchema = z
  .object({
    k: z.literal("popular"),
    m: z.number().int().min(0),
    c: cursorDateSchema,
    i: cursorIdSchema,
  })
  .strict();

const latestCursorSchema = z
  .object({
    k: z.literal("latest"),
    c: cursorDateSchema,
    i: cursorIdSchema,
  })
  .strict();

const alphabeticalCursorSchema = z
  .object({
    k: z.literal("alphabetical"),
    n: z.string().max(100),
    i: cursorIdSchema,
  })
  .strict();

// ---------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------

function notFound(message: string): AppError {
  return new AppError(404, message, "NOT_FOUND");
}

export async function findCommunityByName(name: string): Promise<CommunityLean> {
  const normalizedName = name.trim().toLowerCase();

  const community =
    normalizedName.length > 0
      ? await Community.findOne({ normalizedName }).lean()
      : null;

  if (!community) {
    throw notFound("Community not found.");
  }

  return community as unknown as CommunityLean;
}

async function getMemberCounts(
  communityIds: Types.ObjectId[],
): Promise<Map<string, number>> {
  const counts = new Map<string, number>();

  if (communityIds.length === 0) {
    return counts;
  }

  const rows = await CommunityMember.aggregate<{
    _id: Types.ObjectId;
    count: number;
  }>([
    { $match: { community: { $in: communityIds } } },
    { $group: { _id: "$community", count: { $sum: 1 } } },
  ]);

  for (const row of rows) {
    counts.set(row._id.toString(), row.count);
  }

  return counts;
}

async function getMembershipSet(
  userId: string,
  communityIds: Types.ObjectId[],
): Promise<Set<string>> {
  if (communityIds.length === 0) {
    return new Set();
  }

  const memberships = (await CommunityMember.find({
    user: userId,
    community: { $in: communityIds },
  })
    .select("community")
    .lean()) as unknown as Array<{ community: Types.ObjectId }>;

  return new Set(memberships.map((membership) => membership.community.toString()));
}

async function hydrateCommunities(
  rows: CommunityLean[],
  auth: AuthContext | undefined,
  knownCounts?: Map<string, number>,
): Promise<CommunityDto[]> {
  if (rows.length === 0) {
    return [];
  }

  const ids = rows.map((row) => row._id);

  const [creators, counts, memberSet] = await Promise.all([
    loadUserRefs(rows.map((row) => row.creator)),
    knownCounts ? Promise.resolve(knownCounts) : getMemberCounts(ids),
    auth ? getMembershipSet(auth.userId, ids) : Promise.resolve(new Set<string>()),
  ]);

  return rows.map((row) => {
    const id = row._id.toString();
    const isCreator = auth ? row.creator.toString() === auth.userId : false;

    return {
      id,
      name: row.name,
      description: row.description ?? "",
      iconUrl: row.icon ?? null,
      creator: creators.get(row.creator.toString()) ?? null,
      memberCount: counts.get(id) ?? 0,
      createdAt: row.createdAt.toISOString(),
      viewer: auth
        ? {
            isMember: memberSet.has(id),
            isCreator,
            canModerate: isCreator,
          }
        : null,
    };
  });
}

async function countMembers(communityId: Types.ObjectId): Promise<number> {
  return CommunityMember.countDocuments({ community: communityId });
}

// ---------------------------------------------------------------------
// 1. GET /communities
// ---------------------------------------------------------------------

export async function listCommunities(
  query: ListCommunitiesQuery,
  auth: AuthContext | undefined,
): Promise<{ data: CommunityDto[]; page: PageInfo }> {
  const { sort, limit, cursor } = query;
  const joined = query.joined === "true";

  if (joined && !auth) {
    throw new AppError(
      401,
      "You must be logged in to list joined communities.",
      "UNAUTHENTICATED",
    );
  }

  // Decode first so a bad cursor is always reported.
  const popularCursor =
    sort === "popular" && cursor !== undefined
      ? decodeCursor(cursor, popularCursorSchema)
      : null;
  const latestCursor =
    sort === "latest" && cursor !== undefined
      ? decodeCursor(cursor, latestCursorSchema)
      : null;
  const alphabeticalCursor =
    sort === "alphabetical" && cursor !== undefined
      ? decodeCursor(cursor, alphabeticalCursorSchema)
      : null;

  const baseMatch: Record<string, unknown> = {};

  if (joined && auth) {
    const memberships = (await CommunityMember.find({ user: auth.userId })
      .select("community")
      .lean()) as unknown as Array<{ community: Types.ObjectId }>;

    if (memberships.length === 0) {
      return { data: [], page: emptyPage(limit) };
    }

    baseMatch._id = {
      $in: uniqueObjectIds(memberships.map((membership) => membership.community)),
    };
  }

  // ---- popular: memberCount desc, createdAt desc, _id desc -----------
  if (sort === "popular") {
    const stages: Array<Record<string, unknown>> = [
      { $match: baseMatch },
      {
        $lookup: {
          from: CommunityMember.collection.name,
          let: { communityId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$community", "$$communityId"] } } },
            { $count: "total" },
          ],
          as: "memberTotals",
        },
      },
      {
        $addFields: {
          memberCount: {
            $ifNull: [{ $arrayElemAt: ["$memberTotals.total", 0] }, 0],
          },
        },
      },
      { $project: { memberTotals: 0 } },
    ];

    if (popularCursor) {
      const cursorDate = new Date(popularCursor.c);
      const cursorId = new Types.ObjectId(popularCursor.i);

      stages.push({
        $match: {
          $or: [
            { memberCount: { $lt: popularCursor.m } },
            { memberCount: popularCursor.m, createdAt: { $lt: cursorDate } },
            {
              memberCount: popularCursor.m,
              createdAt: cursorDate,
              _id: { $lt: cursorId },
            },
          ],
        },
      });
    }

    stages.push(
      { $sort: { memberCount: -1, createdAt: -1, _id: -1 } },
      { $limit: limit + 1 },
    );

    const rows = await Community.aggregate<CommunityLean & { memberCount: number }>(
      stages as unknown as PipelineStage[],
    );

    const { items, page } = buildPage(rows, limit, (last) =>
      encodeCursor({
        k: "popular",
        m: last.memberCount,
        c: last.createdAt.toISOString(),
        i: last._id.toHexString(),
      }),
    );

    const counts = new Map<string, number>();
    for (const item of items) {
      counts.set(item._id.toString(), item.memberCount);
    }

    return { data: await hydrateCommunities(items, auth, counts), page };
  }

  // ---- latest: createdAt desc, _id desc ------------------------------
  if (sort === "latest") {
    const filter: Record<string, unknown> = { ...baseMatch };

    if (latestCursor) {
      const cursorDate = new Date(latestCursor.c);
      const cursorId = new Types.ObjectId(latestCursor.i);

      filter.$or = [
        { createdAt: { $lt: cursorDate } },
        { createdAt: cursorDate, _id: { $lt: cursorId } },
      ];
    }

    const rows = (await Community.find(filter as never)
      .sort({ createdAt: -1, _id: -1 })
      .limit(limit + 1)
      .lean()) as unknown as CommunityLean[];

    const { items, page } = buildPage(rows, limit, (last) =>
      encodeCursor({
        k: "latest",
        c: last.createdAt.toISOString(),
        i: last._id.toHexString(),
      }),
    );

    return { data: await hydrateCommunities(items, auth), page };
  }

  // ---- alphabetical: normalizedName asc, _id asc ---------------------
  const filter: Record<string, unknown> = { ...baseMatch };

  if (alphabeticalCursor) {
    const cursorId = new Types.ObjectId(alphabeticalCursor.i);

    filter.$or = [
      { normalizedName: { $gt: alphabeticalCursor.n } },
      { normalizedName: alphabeticalCursor.n, _id: { $gt: cursorId } },
    ];
  }

  const rows = (await Community.find(filter as never)
    .sort({ normalizedName: 1, _id: 1 })
    .limit(limit + 1)
    .lean()) as unknown as CommunityLean[];

  const { items, page } = buildPage(rows, limit, (last) =>
    encodeCursor({
      k: "alphabetical",
      n: last.normalizedName,
      i: last._id.toHexString(),
    }),
  );

  return { data: await hydrateCommunities(items, auth), page };
}

// ---------------------------------------------------------------------
// 2. POST /communities
// ---------------------------------------------------------------------

export async function createCommunity(
  userId: string,
  input: CreateCommunityInput,
): Promise<CommunityDto> {
  const name = input.name.trim();
  const normalizedName = name.toLowerCase();

  const existing = await Community.exists({ normalizedName });

  if (existing) {
    throw new AppError(
      409,
      "That community name is already taken.",
      "COMMUNITY_NAME_TAKEN",
    );
  }

  let created: CommunityLean;

  try {
    const community = await Community.create({
      name,
      normalizedName,
      description: input.description.trim(),
      icon: input.iconUrl ?? null,
      creator: userId,
    });

    created = community.toObject() as unknown as CommunityLean;

    try {
      await CommunityMember.create({
        user: userId,
        community: community._id,
        joinedAt: new Date(),
      });
    } catch (error) {
      // Keep creation atomic from the caller's perspective without requiring
      // replica-set transactions: remove the community if membership fails.
      await Community.deleteOne({ _id: community._id });
      throw error;
    }
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw new AppError(
        409,
        "That community name is already taken.",
        "COMMUNITY_NAME_TAKEN",
      );
    }
    throw error;
  }

  const [dto] = await hydrateCommunities([created], {
    userId,
    role: "user",
  });

  // Creator is always the first member and the moderator.
  return {
    ...dto,
    memberCount: 1,
    viewer: { isMember: true, isCreator: true, canModerate: true },
  };
}

// ---------------------------------------------------------------------
// 3. GET /communities/:name
// ---------------------------------------------------------------------

export async function getCommunity(
  name: string,
  auth: AuthContext | undefined,
): Promise<CommunityDto> {
  const community = await findCommunityByName(name);
  const [dto] = await hydrateCommunities([community], auth);

  return dto;
}

// ---------------------------------------------------------------------
// 4. PUT /communities/:name/membership
// ---------------------------------------------------------------------

export async function joinCommunity(
  name: string,
  userId: string,
): Promise<MembershipResultDto> {
  const community = await findCommunityByName(name);

  try {
    await CommunityMember.updateOne(
      { user: userId, community: community._id },
      {
        $setOnInsert: {
          user: userId,
          community: community._id,
          joinedAt: new Date(),
        },
      },
      { upsert: true },
    );
  } catch (error) {
    // Two simultaneous joins: the unique index rejects the loser.
    // The membership exists, so the operation is still a success.
    if (!isDuplicateKeyError(error)) {
      throw error;
    }
  }

  return {
    isMember: true,
    memberCount: await countMembers(community._id),
  };
}

// ---------------------------------------------------------------------
// 5. DELETE /communities/:name/membership
// ---------------------------------------------------------------------

export async function leaveCommunity(
  name: string,
  userId: string,
): Promise<MembershipResultDto> {
  const community = await findCommunityByName(name);

  if (community.creator.toString() === userId) {
    throw new AppError(
      409,
      "The creator cannot leave their own community.",
      "CREATOR_CANNOT_LEAVE",
    );
  }

  await CommunityMember.deleteOne({ user: userId, community: community._id });

  return {
    isMember: false,
    memberCount: await countMembers(community._id),
  };
}
