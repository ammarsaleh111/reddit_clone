import type { Types } from "mongoose";
import { User } from "../models/User.js";

export interface AuthContext {
  userId: string;
  role: string;
}

export interface UserRefDto {
  id: string;
  username: string;
  avatarUrl: string | null;
}

export interface CommunityRefDto {
  id: string;
  name: string;
  iconUrl: string | null;
}

interface UserLike {
  _id: Types.ObjectId;
  username: string;
  avatarUrl?: string | null;
  avatar?: string | null;
}

export function uniqueObjectIds(ids: Types.ObjectId[]): Types.ObjectId[] {
  const seen = new Map<string, Types.ObjectId>();

  for (const id of ids) {
    seen.set(id.toString(), id);
  }

  return [...seen.values()];
}

export function toUserRef(user: UserLike | null | undefined): UserRefDto | null {
  if (!user) {
    return null;
  }

  return {
    id: user._id.toString(),
    username: user.username,
    avatarUrl: user.avatarUrl ?? user.avatar ?? null,
  };
}

export function toCommunityRef(community: {
  _id: Types.ObjectId;
  name: string;
  icon?: string | null;
}): CommunityRefDto {
  return {
    id: community._id.toString(),
    name: community.name,
    iconUrl: community.icon ?? null,
  };
}

/** Batch-loads UserRef objects. Missing / deleted users are simply absent from the map. */
export async function loadUserRefs(
  ids: Types.ObjectId[],
): Promise<Map<string, UserRefDto>> {
  const result = new Map<string, UserRefDto>();
  const unique = uniqueObjectIds(ids);

  if (unique.length === 0) {
    return result;
  }

  const users = (await User.find({ _id: { $in: unique } })
    .select("username avatar avatarUrl")
    .lean()) as unknown as UserLike[];

  for (const user of users) {
    const ref = toUserRef(user);

    if (ref) {
      result.set(ref.id, ref);
    }
  }

  return result;
}