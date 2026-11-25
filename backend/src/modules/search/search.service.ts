import { Community } from "../../models/Community.js";
import { User } from "../../models/User.js";

// Escape special regular expression characters in the search term.
function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

interface SearchInput {
  q: string;
  page: number;
  limit: number;
}

// Search communities by name, normalized name, or description.
export async function searchCommunities(input: SearchInput) {
  const { q, page, limit } = input;
  const skip = (page - 1) * limit;
  const searchTerm = escapeRegex(q);

  const filter = {
    $or: [
      { name: { $regex: searchTerm, $options: "i" } },
      { normalizedName: { $regex: searchTerm, $options: "i" } },
      { description: { $regex: searchTerm, $options: "i" } },
    ],
  };

  const [communities, total] = await Promise.all([
    Community.find(filter)
      .select("name description icon creator createdAt")
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit)
      .populate("creator", "username avatar"),

    Community.countDocuments(filter),
  ]);

  return {
    communities,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// Search users by username.
export async function searchUsers(input: SearchInput) {
  const { q, page, limit } = input;
  const skip = (page - 1) * limit;
  const searchTerm = escapeRegex(q);

  const filter = {
    username: { $regex: searchTerm, $options: "i" },
    status: "active" as const,
  };

  const [users, total] = await Promise.all([
    User.find(filter)
      .select("username avatar bio createdAt")
      .sort({ username: 1 })
      .skip(skip)
      .limit(limit),

    User.countDocuments(filter),
  ]);

  return {
    users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}