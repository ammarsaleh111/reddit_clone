export interface UserProfile {
  id: string;
  username: string;
  avatar: string | null;
  bio: string | null;
  role: "USER";
  createdAt: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isFollowing?: boolean;
}

export interface ProfilePost {
  id: string;
  title: string;
  body: string;
  communityName: string;
  votesCount: number;
  commentsCount: number;
  createdAt: string;
}

export interface ProfileComment {
  id: string;
  body: string;
  postId: string;
  postTitle: string;
  communityName: string;
  createdAt: string;
}

export interface ProfileCommunity {
  id: string;
  name: string;
  description: string;
  membersCount: number;
  role: "MEMBER" | "ADMIN";
}
