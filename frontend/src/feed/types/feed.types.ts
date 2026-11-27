export type FeedMode = "for-you" | "following" | "explore";
export type FeedSort = "popular" | "latest" | "oldest";
export type VoteValue = 1 | -1 | 0;

export interface FeedAuthor {
  _id: string;
  username: string;
  avatar: string | null;
}

export interface FeedCommunity {
  _id: string;
  name: string;
  normalizedName: string;
  description?: string;
  icon: string | null;
  membersCount?: number;
  unreadCount?: number;
  isMember?: boolean;
}

export interface FeedPost {
  _id: string;
  author: FeedAuthor;
  community: FeedCommunity;
  title: string;
  tag?: string;
  type: "text" | "link";
  body: string | null;
  url: string | null;
  linkDomain?: string | null;
  score: number;
  commentsCount: number;
  userVote: VoteValue;
  isSaved?: boolean;
  createdAt: string;
}

export interface FeedComment {
  _id: string;
  post: string;
  author: {
    _id: string;
    username: string;
    avatar: string | null;
  };
  body: string;
  score: number;
  userVote: VoteValue;
  createdAt: string;
}