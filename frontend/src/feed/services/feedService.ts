import axios from "axios";
import api from "../../services/api";
import type {
  FeedComment,
  FeedCommunity,
  FeedMode,
  FeedPost,
  FeedSort,
  VoteValue,
} from "../types/feed.types";

const LOCAL_POSTS_KEY = "nexus_local_posts";
const LOCAL_COMMUNITIES_KEY = "nexus_local_communities";
const LOCAL_COMMENTS_KEY = "nexus_local_comments";

const DEFAULT_SEED_COMMUNITIES: FeedCommunity[] = [
  {
    _id: "comm-programming",
    name: "programming",
    normalizedName: "programming",
    description: "Software engineering, algorithms, systems, and code.",
    icon: null,
    membersCount: 142890,
  },
  {
    _id: "comm-devops",
    name: "devops",
    normalizedName: "devops",
    description: "Containers, CI/CD, cloud infrastructure, and automation.",
    icon: null,
    membersCount: 92410,
  },
  {
    _id: "comm-webdev",
    name: "webdev",
    normalizedName: "webdev",
    description: "Frontend, backend, APIs, and modern web architecture.",
    icon: null,
    membersCount: 118500,
  },
  {
    _id: "comm-linux",
    name: "linux",
    normalizedName: "linux",
    description: "Linux distros, kernel, shell workflows, and open source.",
    icon: null,
    membersCount: 84150,
  },
  {
    _id: "comm-design",
    name: "design",
    normalizedName: "design",
    description: "UI/UX systems, typography, dark interfaces, and product craft.",
    icon: null,
    membersCount: 53200,
  },
];

function readStorage<T>(key: string): T[] {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function writeStorage<T>(key: string, items: T[]): void {
  try {
    sessionStorage.setItem(key, JSON.stringify(items));
  } catch {
    // Ignore storage quota errors
  }
}

function getLocalPosts(): FeedPost[] {
  return readStorage<FeedPost>(LOCAL_POSTS_KEY);
}

function getLocalCommunities(): FeedCommunity[] {
  return readStorage<FeedCommunity>(LOCAL_COMMUNITIES_KEY);
}

function getLocalComments(postId: string): FeedComment[] {
  return readStorage<FeedComment>(LOCAL_COMMENTS_KEY).filter(
    (c) => c.post === postId
  );
}

interface PostsApiResponse {
  success: boolean;
  data: {
    posts: FeedPost[];
  };
}

interface CommunitiesSearchResponse {
  success: boolean;
  data: {
    communities: FeedCommunity[];
  };
}

export interface FetchPostsResult {
  posts: FeedPost[];
  apiUnavailable: boolean;
}

export interface CreatePostPayload {
  communityId: string;
  communityName: string;
  title: string;
  type?: "text" | "link";
  body?: string;
  url?: string;
  tag?: string;
  author: {
    _id: string;
    username: string;
    avatar: string | null;
  };
}

function applyLocalFilters(
  posts: FeedPost[],
  params: { sort: FeedSort; community?: string; q?: string }
): FeedPost[] {
  let filtered = [...posts];

  if (params.community) {
    filtered = filtered.filter(
      (p) => p.community.normalizedName === params.community
    );
  }

  if (params.q) {
    const query = params.q.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.title.toLowerCase().includes(query) ||
        (p.body && p.body.toLowerCase().includes(query)) ||
        (p.url && p.url.toLowerCase().includes(query)) ||
        p.community.name.toLowerCase().includes(query) ||
        p.author.username.toLowerCase().includes(query)
    );
  }

  if (params.sort === "popular") {
    filtered.sort((a, b) => b.score - a.score);
  } else if (params.sort === "latest") {
    filtered.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } else if (params.sort === "oldest") {
    filtered.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }

  return filtered;
}

export async function createCommunity(payload: {
  name: string;
  description: string;
}): Promise<FeedCommunity> {
  const cleanName = payload.name.replace(/^c\//i, "").trim();
  const normalizedName = cleanName.toLowerCase().replace(/[^a-z0-9_]/g, "");

  const saveLocalCommunity = (): FeedCommunity => {
    const comm: FeedCommunity = {
      _id: `comm-${Date.now()}`,
      name: cleanName,
      normalizedName,
      description: payload.description.trim(),
      icon: null,
      membersCount: 1,
    };
    writeStorage(LOCAL_COMMUNITIES_KEY, [comm, ...getLocalCommunities()]);
    return comm;
  };

  try {
    const response = await api.post<{
      success: boolean;
      data: { community: FeedCommunity };
    }>("/communities", {
      name: cleanName,
      description: payload.description.trim(),
    });
    return response.data.data.community;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return saveLocalCommunity();
    }
    throw error;
  }
}

export async function toggleCommunityMembership(
  communityId: string,
  join: boolean
): Promise<void> {
  if (communityId.startsWith("comm-")) return;
  try {
    if (join) {
      await api.post(`/communities/${communityId}/join`);
    } else {
      await api.delete(`/communities/${communityId}/join`);
    }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return;
    }
    throw error;
  }
}

export async function fetchPostThread(postId: string): Promise<{
  post: FeedPost | null;
  comments: FeedComment[];
}> {
  const localPost = getLocalPosts().find((p) => p._id === postId) ?? null;
  const localComments = getLocalComments(postId);

  if (postId.startsWith("local-")) {
    return { post: localPost, comments: localComments };
  }

  try {
    const [postRes, commentsRes] = await Promise.all([
      api.get<{ success: boolean; data: { post: FeedPost } }>(`/posts/${postId}`),
      api.get<{ success: boolean; data: { comments: FeedComment[] } }>(
        `/posts/${postId}/comments`
      ),
    ]);
    return {
      post: postRes.data.data.post,
      comments: [...localComments, ...(commentsRes.data.data.comments ?? [])],
    };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return { post: localPost, comments: localComments };
    }
    throw error;
  }
}

export async function addCommentToPost(payload: {
  postId: string;
  body: string;
  author: { _id: string; username: string; avatar: string | null };
}): Promise<FeedComment> {
  const buildLocalComment = (): FeedComment => {
    const comment: FeedComment = {
      _id: `comment-${Date.now()}`,
      post: payload.postId,
      author: payload.author,
      body: payload.body,
      score: 1,
      userVote: 1,
      createdAt: new Date().toISOString(),
    };

    const existingComments = readStorage<FeedComment>(LOCAL_COMMENTS_KEY);
    writeStorage(LOCAL_COMMENTS_KEY, [comment, ...existingComments]);

    const updatedPosts = getLocalPosts().map((p) =>
      p._id === payload.postId
        ? { ...p, commentsCount: p.commentsCount + 1 }
        : p
    );
    writeStorage(LOCAL_POSTS_KEY, updatedPosts);

    return comment;
  };

  if (payload.postId.startsWith("local-")) {
    return buildLocalComment();
  }

  try {
    const response = await api.post<{
      success: boolean;
      data: { comment: FeedComment };
    }>(`/posts/${payload.postId}/comments`, { body: payload.body });
    return response.data.data.comment;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return buildLocalComment();
    }
    throw error;
  }
}

export async function fetchFeedPosts(params: {
  mode: FeedMode;
  sort: FeedSort;
  community?: string;
  q?: string;
}): Promise<FetchPostsResult> {
  const localPosts = applyLocalFilters(getLocalPosts(), params);

  try {
    const response = await api.get<PostsApiResponse>("/posts", { params });
    const remotePosts = response.data.data.posts ?? [];
    return {
      posts: [...localPosts, ...remotePosts],
      apiUnavailable: false,
    };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return {
        posts: localPosts,
        apiUnavailable: getLocalPosts().length === 0,
      };
    }
    throw error;
  }
}

export async function fetchCommunities(): Promise<FeedCommunity[]> {
  const localComms = getLocalCommunities();
  try {
    const response = await api.get<CommunitiesSearchResponse>(
      "/search/communities",
      { params: { q: "c", limit: 10 } }
    );
    const remoteComms = response.data.data.communities ?? [];
    const merged = [...localComms, ...remoteComms];
    return merged.length > 0 ? merged : DEFAULT_SEED_COMMUNITIES;
  } catch {
    return localComms.length > 0 ? localComms : DEFAULT_SEED_COMMUNITIES;
  }
}

export async function createPost(payload: CreatePostPayload): Promise<FeedPost> {
  const normalized = payload.communityName
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "");

  const cleanBody = payload.body?.trim() || null;
  const cleanUrl = payload.url?.trim() || null;
  const resolvedType =
    payload.type ?? (cleanUrl && !cleanBody ? "link" : "text");

  const buildLocalPost = (): FeedPost => {
    const post: FeedPost = {
      _id: `local-${Date.now()}`,
      author: payload.author,
      community: {
        _id: payload.communityId || `comm-${normalized}`,
        name: payload.communityName,
        normalizedName: normalized,
        icon: null,
      },
      title: payload.title,
      tag: payload.tag || undefined,
      type: resolvedType,
      body: cleanBody,
      url: cleanUrl,
      score: 1,
      commentsCount: 0,
      userVote: 1,
      createdAt: new Date().toISOString(),
    };
    writeStorage(LOCAL_POSTS_KEY, [post, ...getLocalPosts()]);
    return post;
  };

  if (!payload.communityId || payload.communityId.startsWith("comm-")) {
    return buildLocalPost();
  }

  try {
    const response = await api.post<{
      success: boolean;
      data: { post: FeedPost };
    }>("/posts", {
      community: payload.communityId,
      title: payload.title,
      type: resolvedType,
      body: cleanBody ?? undefined,
      url: cleanUrl ?? undefined,
      tag: payload.tag || undefined,
    });
    return response.data.data.post;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return buildLocalPost();
    }
    throw error;
  }
}

export async function voteOnPost(
  postId: string,
  value: VoteValue
): Promise<void> {
  if (postId.startsWith("local-")) {
    const updated = getLocalPosts().map((post) => {
      if (post._id !== postId) return post;
      const delta = value - post.userVote;
      return { ...post, score: post.score + delta, userVote: value };
    });
    writeStorage(LOCAL_POSTS_KEY, updated);
    return;
  }

  try {
    if (value === 0) {
      await api.delete(`/votes/post/${postId}`);
    } else {
      await api.post("/votes", {
        targetType: "post",
        target: postId,
        value,
      });
    }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return;
    }
    throw error;
  }
}