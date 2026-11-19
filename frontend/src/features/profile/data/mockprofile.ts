import type {
  ProfileComment,
  ProfileCommunity,
  ProfilePost,
  UserProfile,
} from "../types/profile.types";

export const MOCK_PROFILES: Record<string, UserProfile> = {
  alex_dev: {
    id: "user_001",
    username: "alex_dev",
    avatar: null,
    bio: "Systems programmer & distributed consensus enthusiast. Building low-latency engines in Rust and C++.",
    role: "USER",
    createdAt: "2026-09-14T10:30:00.000Z",
    followersCount: 148,
    followingCount: 64,
    postsCount: 2,
    isFollowing: false,
  },
  sarah_ops: {
    id: "user_002",
    username: "sarah_ops",
    avatar: null,
    bio: "Staff SRE @ Monolith. Kubernetes, eBPF observability, and zero-downtime migrations.",
    role: "USER",
    createdAt: "2026-08-02T14:15:00.000Z",
    followersCount: 312,
    followingCount: 91,
    postsCount: 1,
    isFollowing: true,
  },
  superadmin: {
    id: "admin_001",
    username: "superadmin",
    avatar: null,
    bio: "Nexus Platform Super Administrator & Core Maintainer.",
    role: "SUPER_ADMIN",
    createdAt: "2026-01-01T00:00:00.000Z",
    followersCount: 1420,
    followingCount: 12,
    postsCount: 1,
    isFollowing: false,
  },
};

export const MOCK_POSTS_BY_USER: Record<string, ProfilePost[]> = {
  alex_dev: [
    {
      id: "post_101",
      title: "Why Raft Consensus Fails Under Asymmetric Network Partitions",
      body: "A deep dive into pre-vote extensions, leader leases, and how split-brain scenarios degrade tail latency in production clusters.",
      communityName: "c/distributed-systems",
      votesCount: 142,
      commentsCount: 38,
      createdAt: "2026-11-16T09:20:00.000Z",
    },
    {
      id: "post_102",
      title: "Zero-Copy Ring Buffers in Modern Linux Kernels (io_uring)",
      body: "Benchmarking syscall overhead reduction when batching 10k concurrent socket reads using shared memory submission queues.",
      communityName: "c/kernel-internals",
      votesCount: 97,
      commentsCount: 19,
      createdAt: "2026-11-12T18:45:00.000Z",
    },
  ],
  sarah_ops: [
    {
      id: "post_201",
      title: "Debugging Memory Leaks in Go Microservices with pprof & eBPF",
      body: "Step-by-step trace of how an unclosed HTTP response body caused a 14GB RSS spike over 48 hours.",
      communityName: "c/devops-sre",
      votesCount: 215,
      commentsCount: 44,
      createdAt: "2026-11-15T11:00:00.000Z",
    },
  ],
  superadmin: [
    {
      id: "post_001",
      title: "Welcome to Nexus v2.4 — Engineering Discourse Guidelines",
      body: "High-signal technical discussions only. Please include reproducible benchmarks or architecture diagrams where applicable.",
      communityName: "c/announcements",
      votesCount: 530,
      commentsCount: 84,
      createdAt: "2026-10-01T12:00:00.000Z",
    },
  ],
};

export const MOCK_COMMENTS_BY_USER: Record<string, ProfileComment[]> = {
  alex_dev: [
    {
      id: "comm_501",
      body: "Enabling the PreVote flag in etcd completely eliminated unnecessary election storms during our last AZ flap.",
      postId: "post_201",
      postTitle: "Debugging Memory Leaks in Go Microservices with pprof & eBPF",
      communityName: "c/devops-sre",
      createdAt: "2026-11-17T14:10:00.000Z",
    },
  ],
};

export const MOCK_COMMUNITIES_BY_USER: Record<string, ProfileCommunity[]> = {
  alex_dev: [
    {
      id: "com_1",
      name: "c/distributed-systems",
      description: "Consensus algorithms, replication, storage engines, and fault tolerance.",
      membersCount: 42800,
      role: "ADMIN",
    },
    {
      id: "com_2",
      name: "c/kernel-internals",
      description: "Linux kernel development, eBPF, memory management, and device drivers.",
      membersCount: 29150,
      role: "MEMBER",
    },
  ],
};