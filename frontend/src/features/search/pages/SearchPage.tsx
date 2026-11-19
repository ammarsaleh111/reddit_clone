import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  BadgeCheck,
  Check,
  ExternalLink,
  Eye,
  FileText,
  Globe,
  MessageSquare,
  Network,
  Search,
  Terminal,
  Users,
  Wrench,
  X,
} from "lucide-react";

type SearchTab = "posts" | "communities" | "users";
type SortOption = "relevance" | "popular" | "latest" | "oldest";

interface SearchPost {
  id: string;
  community: string;
  author: string;
  timeAgo: string;
  orderIndex: number;
  badge: string;
  badgeVariant: "tertiary" | "secondary" | "neutral";
  title: string;
  excerpt: string;
  votes: number;
  comments: number;
  views: string;
  repo?: {
    url: string;
    meta: string;
    version: string;
  };
}

interface SearchCommunity {
  id: string;
  prefix: string;
  name: string;
  peers: string;
  online: string;
  description: string;
  joined: boolean;
}

interface SearchUser {
  id: string;
  name: string;
  username: string;
  rep: string;
  bio: string;
  initials: string;
  following: boolean;
}

const MOCK_SEARCH_POSTS: SearchPost[] = [
  {
    id: "p1",
    community: "c/programming",
    author: "marcus_sys",
    timeAgo: "3 days ago",
    orderIndex: 2,
    badge: "Deep Dive",
    badgeVariant: "tertiary",
    title:
      "Distributed Consensus algorithms compared: Raft vs Paxos in real-world high-throughput clusters",
    excerpt:
      "Evaluating log replication latency, election jitter under ungraceful split-brain partitions, and write amplification during quorum recovery across 128 geo-distributed nodes under continuous failure injection.",
    votes: 1482,
    comments: 88,
    views: "24.6k views",
  },
  {
    id: "p2",
    community: "c/distributed",
    author: "niklas_core",
    timeAgo: "1 week ago",
    orderIndex: 3,
    badge: "Code Repository",
    badgeVariant: "secondary",
    title:
      "Implementing a minimal Raft consensus engine in Rust from scratch with formal TLA+ specifications",
    excerpt:
      "Zero external dependencies except tokio. Features fully deterministic state machine fuzzing, dynamic membership transition (joint consensus), and snapshot log compaction tested over millions of injected network drops.",
    votes: 740,
    comments: 49,
    views: "14.2k views",
    repo: {
      url: "github.com/raft-tla/raft-engine-rs",
      meta: "Rust • 1.9k stars • MIT License • Passing 420 formal proofs",
      version: "v0.8.2",
    },
  },
  {
    id: "p3",
    community: "c/devops",
    author: "elena_dev",
    timeAgo: "2 days ago",
    orderIndex: 1,
    badge: "Incident Postmortem",
    badgeVariant: "neutral",
    title:
      "etcd leader election failover under partition: diagnosing Raft heartbeat timeouts in Kubernetes",
    excerpt:
      "A comprehensive breakdown of an AWS cross-AZ latency spike that triggered cascading follower step-downs. We analyze p99 disk commit latencies, Linux cgroup throttling on kube-apiserver, and tuned election timeout configs.",
    votes: 520,
    comments: 34,
    views: "8.9k views",
  },
];

const INITIAL_COMMUNITIES: SearchCommunity[] = [
  {
    id: "c1",
    prefix: "d/",
    name: "c/distributed",
    peers: "18.4k peers",
    online: "120 online",
    description:
      "Fault-tolerant storage engines, consensus protocols, replication logs, and geo-distributed architectures.",
    joined: false,
  },
  {
    id: "c2",
    prefix: "p/",
    name: "c/programming",
    peers: "142.1k peers",
    online: "2.4k online",
    description:
      "Systems programming, language internals, compilers, and high-performance software architecture.",
    joined: false,
  },
  {
    id: "c3",
    prefix: "k/",
    name: "c/kernel",
    peers: "32.8k peers",
    online: "410 online",
    description:
      "Operating system internals, eBPF subsystems, memory allocators, and scheduler tuning.",
    joined: true,
  },
];

const INITIAL_USERS: SearchUser[] = [
  {
    id: "u1",
    name: "Niklas Lindqvist",
    username: "niklas_core",
    rep: "4.8k rep",
    bio: "Distributed storage engineer working on formal verification and deterministic simulation testing.",
    initials: "NL",
    following: false,
  },
  {
    id: "u2",
    name: "Elena Rostova",
    username: "elena_dev",
    rep: "9.1k rep",
    bio: "Staff infrastructure engineer & systems programmer. Researching distributed consensus internals.",
    initials: "ER",
    following: false,
  },
  {
    id: "u3",
    name: "Dr. David K.",
    username: "d_klein",
    rep: "3.2k rep",
    bio: "Database researcher focused on transactional storage engines and quorum replication.",
    initials: "DK",
    following: false,
  },
];

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlQuery = searchParams.get("q");
  const urlTab = searchParams.get("tab");

  const inputRef = useRef<HTMLInputElement>(null);
  const [localQuery, setLocalQuery] = useState<string | null>(null);
  const query = localQuery !== null ? localQuery : urlQuery ?? "";

  const initialTab: SearchTab =
    urlTab === "communities" || urlTab === "users" ? urlTab : "posts";
  const [activeTab, setActiveTab] = useState<SearchTab>(initialTab);
  const [sortBy, setSortBy] = useState<SortOption>("relevance");
  const [communities, setCommunities] =
    useState<SearchCommunity[]>(INITIAL_COMMUNITIES);
  const [users, setUsers] = useState<SearchUser[]>(INITIAL_USERS);
  const [upvotedIds, setUpvotedIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (
        event.key === "Escape" &&
        document.activeElement === inputRef.current
      ) {
        setLocalQuery("");
        setSearchParams({});
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [setSearchParams]);

  function updateQuery(nextValue: string) {
    setLocalQuery(nextValue);
    if (nextValue.trim()) {
      setSearchParams({ q: nextValue });
    } else {
      setSearchParams({});
    }
  }

  const normalizedQuery = query.trim().toLowerCase();
  const queryWords = normalizedQuery.split(/\s+/).filter(Boolean);

  const filteredPosts = MOCK_SEARCH_POSTS.filter((post) => {
    if (!normalizedQuery) return true;
    const haystack =
      `${post.title} ${post.excerpt} ${post.community} ${post.author}`.toLowerCase();
    return queryWords.every((word) => haystack.includes(word));
  }).sort((a, b) => {
    if (sortBy === "popular") return b.votes - a.votes;
    if (sortBy === "latest") return a.orderIndex - b.orderIndex;
    if (sortBy === "oldest") return b.orderIndex - a.orderIndex;
    return 0;
  });

  const filteredCommunities = communities.filter((com) => {
    if (!normalizedQuery) return true;
    const haystack = `${com.name} ${com.description}`.toLowerCase();
    return queryWords.every((word) => haystack.includes(word));
  });

  const filteredUsers = users.filter((usr) => {
    if (!normalizedQuery) return true;
    const haystack =
      `${usr.name} ${usr.username} ${usr.bio}`.toLowerCase();
    return queryWords.every((word) => haystack.includes(word));
  });

  function toggleJoinCommunity(id: string) {
    setCommunities((prev) =>
      prev.map((c) => (c.id === id ? { ...c, joined: !c.joined } : c))
    );
  }

  function toggleFollowUser(id: string) {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, following: !u.following } : u))
    );
  }

  function toggleUpvote(id: string) {
    setUpvotedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <div className="min-h-screen bg-[#0B0D12] text-[#F3F4F8] antialiased">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-[#252B38] bg-[#10131B]/90 px-4 backdrop-blur-xl lg:px-6">
        <div className="flex items-center gap-3">
          <Link
            to="/profile"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#252B38] bg-[#151923] text-[#A0A6B5] transition hover:border-[#8B7CFF] hover:text-[#F3F4F8]"
          >
            <ArrowLeft size={15} />
          </Link>
          <span className="text-sm font-bold tracking-tight text-[#F3F4F8]">
            Nexus
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/profile"
            className="rounded-lg border border-[#252B38] bg-[#151923] px-3.5 py-1.5 text-xs font-medium text-[#F3F4F8] transition hover:border-[#8B7CFF]"
          >
            Profile
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-[#8B7CFF]/10 blur-3xl" />
        <div className="pointer-events-none absolute right-10 top-20 h-80 w-80 rounded-full bg-[#5948C8]/10 blur-3xl" />

        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {/* Search Header */}
          <section className="relative z-10 flex flex-col gap-4">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#A0A6B5]">
              <Globe size={14} className="text-[#8B7CFF]" />
              <span>Global Search</span>
              <span className="text-[#252B38]">/</span>
              <span className="text-[#8B7CFF]">Posts, Communities & Users</span>
            </div>

            <div className="relative w-full rounded-xl border border-[#252B38] bg-[#151923] transition focus-within:border-[#8B7CFF]">
              <div className="flex items-center gap-3 px-4 py-3">
                <Search size={20} className="shrink-0 text-[#8B7CFF]" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => updateQuery(e.target.value)}
                  placeholder="Search posts, communities, or users..."
                  className="w-full bg-transparent text-base font-medium text-[#F3F4F8] placeholder:text-[#737B8D] focus:outline-none"
                />
                <div className="flex shrink-0 items-center gap-2">
                  {query && (
                    <button
                      type="button"
                      onClick={() => {
                        updateQuery("");
                        inputRef.current?.focus();
                      }}
                      title="Clear query"
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-[#A0A6B5] transition hover:bg-[#1B2030] hover:text-[#F3F4F8]"
                    >
                      <X size={15} />
                    </button>
                  )}
                  <kbd className="hidden items-center gap-1 rounded bg-[#1B2030] px-2 py-0.5 font-mono text-[10px] text-[#A0A6B5] sm:inline-flex">
                    ESC
                  </kbd>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 px-1">
              <p className="text-xs text-[#A0A6B5]">
                Found{" "}
                <span className="font-semibold text-[#F3F4F8]">
                  {filteredPosts.length} posts
                </span>
                ,{" "}
                <span className="font-semibold text-[#F3F4F8]">
                  {filteredCommunities.length} communities
                </span>
                , and{" "}
                <span className="font-semibold text-[#F3F4F8]">
                  {filteredUsers.length} users
                </span>
                {query.trim() && (
                  <>
                    {" "}
                    for{" "}
                    <span className="font-semibold text-[#8B7CFF]">
                      “{query.trim()}”
                    </span>
                  </>
                )}
              </p>
            </div>

            {/* Category Tabs */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setActiveTab("posts")}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition ${
                  activeTab === "posts"
                    ? "bg-[#292444] text-[#8B7CFF]"
                    : "text-[#A0A6B5] hover:bg-[#151923] hover:text-[#F3F4F8]"
                }`}
              >
                <FileText size={15} />
                <span>Posts</span>
                <span className="rounded-full bg-[#1B2030] px-2 py-0.5 font-mono text-[10px]">
                  {filteredPosts.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("communities")}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition ${
                  activeTab === "communities"
                    ? "bg-[#292444] text-[#8B7CFF]"
                    : "text-[#A0A6B5] hover:bg-[#151923] hover:text-[#F3F4F8]"
                }`}
              >
                <Users size={15} />
                <span>Communities</span>
                <span className="rounded-full bg-[#1B2030] px-2 py-0.5 font-mono text-[10px]">
                  {filteredCommunities.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("users")}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition ${
                  activeTab === "users"
                    ? "bg-[#292444] text-[#8B7CFF]"
                    : "text-[#A0A6B5] hover:bg-[#151923] hover:text-[#F3F4F8]"
                }`}
              >
                <Wrench size={15} />
                <span>Users</span>
                <span className="rounded-full bg-[#1B2030] px-2 py-0.5 font-mono text-[10px]">
                  {filteredUsers.length}
                </span>
              </button>
            </div>
          </section>

          {/* Main 12-Col Layout */}
          <div className="mt-6 grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
            {/* Left / Center Column */}
            <div className="flex flex-col gap-4 lg:col-span-8">
              <div className="flex w-full flex-wrap items-center justify-between gap-2 rounded-xl border border-[#252B38] bg-[#151923] p-2.5">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="px-2 text-[10px] font-semibold uppercase tracking-wider text-[#737B8D]">
                    Sort:
                  </span>
                  {(
                    [
                      { id: "relevance", label: "Relevance" },
                      { id: "popular", label: "Popular" },
                      { id: "latest", label: "Latest" },
                      { id: "oldest", label: "Oldest" },
                    ] as const
                  ).map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setSortBy(option.id)}
                      className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                        sortBy === option.id
                          ? "bg-[#1B2030] text-[#8B7CFF]"
                          : "text-[#A0A6B5] hover:bg-[#1B2030]/60 hover:text-[#F3F4F8]"
                      }`}
                    >
                      <span>{option.label}</span>
                      {sortBy === option.id && <Check size={12} />}
                    </button>
                  ))}
                </div>
              </div>

              {activeTab === "posts" && (
                <div className="flex flex-col gap-4">
                  {filteredPosts.length > 0 ? (
                    filteredPosts.map((post) => {
                      const isUpvoted = Boolean(upvotedIds[post.id]);
                      const displayVotes = post.votes + (isUpvoted ? 1 : 0);

                      return (
                        <article
                          key={post.id}
                          className="group flex gap-4 rounded-xl border border-[#252B38] bg-[#151923] p-5 transition hover:border-[#8B7CFF]/40"
                        >
                          <div className="flex h-fit shrink-0 flex-col items-center gap-1 rounded-lg border border-[#252B38] bg-[#10131B] px-2 py-1.5">
                            <button
                              type="button"
                              onClick={() => toggleUpvote(post.id)}
                              title="Upvote"
                              className={`flex h-7 w-7 items-center justify-center rounded transition ${
                                isUpvoted
                                  ? "bg-[#292444] text-[#8B7CFF]"
                                  : "text-[#A0A6B5] hover:bg-[#1B2030] hover:text-[#8B7CFF]"
                              }`}
                            >
                              <ArrowUp size={15} />
                            </button>
                            <span className="font-mono text-xs font-bold text-[#F3F4F8]">
                              {displayVotes.toLocaleString()}
                            </span>
                            <button
                              type="button"
                              title="Downvote"
                              className="flex h-7 w-7 items-center justify-center rounded text-[#A0A6B5] transition hover:bg-[#F16B75]/15 hover:text-[#F16B75]"
                            >
                              <ArrowDown size={15} />
                            </button>
                          </div>

                          <div className="flex min-w-0 flex-grow flex-col gap-1.5">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded bg-[#1B2030] px-2 py-0.5 font-mono text-[11px] font-semibold text-[#8B7CFF]">
                                {post.community}
                              </span>
                              <span className="text-xs text-[#737B8D]">•</span>
                              <span className="text-[11px] text-[#A0A6B5]">
                                Posted by{" "}
                                <Link
                                  to={`/u/${post.author}`}
                                  className="font-medium text-[#F3F4F8] hover:underline"
                                >
                                  @{post.author}
                                </Link>
                              </span>
                              <span className="text-xs text-[#737B8D]">•</span>
                              <span className="text-[11px] text-[#737B8D]">
                                {post.timeAgo}
                              </span>
                              <span
                                className={`ml-auto flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-semibold ${
                                  post.badgeVariant === "tertiary"
                                    ? "bg-[#292444] text-[#8B7CFF]"
                                    : post.badgeVariant === "secondary"
                                      ? "bg-[#1B2030] text-[#A397FF]"
                                      : "bg-[#1B2030] text-[#A0A6B5]"
                                }`}
                              >
                                {post.badgeVariant === "tertiary" && (
                                  <BadgeCheck size={12} />
                                )}
                                <span>{post.badge}</span>
                              </span>
                            </div>

                            <h3 className="pt-1 text-base font-semibold leading-snug text-[#F3F4F8] transition-colors group-hover:text-[#8B7CFF]">
                              {post.title}
                            </h3>

                            <p className="line-clamp-2 text-xs leading-relaxed text-[#A0A6B5]">
                              {post.excerpt}
                            </p>

                            {post.repo && (
                              <div className="mt-1.5 flex items-center justify-between rounded-lg border border-[#252B38] bg-[#10131B] p-3">
                                <div className="flex min-w-0 items-center gap-3">
                                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#1B2030] text-[#8B7CFF]">
                                    <Terminal size={16} />
                                  </div>
                                  <div className="flex min-w-0 flex-col">
                                    <span className="flex items-center gap-1 truncate font-mono text-xs font-semibold text-[#F3F4F8]">
                                      {post.repo.url}
                                      <ExternalLink
                                        size={12}
                                        className="text-[#737B8D]"
                                      />
                                    </span>
                                    <span className="truncate text-[11px] text-[#737B8D]">
                                      {post.repo.meta}
                                    </span>
                                  </div>
                                </div>
                                <span className="hidden rounded bg-[#1B2030] px-2 py-0.5 font-mono text-[10px] text-[#A0A6B5] sm:inline-block">
                                  {post.repo.version}
                                </span>
                              </div>
                            )}

                            <div className="mt-1 flex items-center justify-between pt-2 text-[11px] text-[#737B8D]">
                              <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1.5 text-[#A0A6B5]">
                                  <MessageSquare size={13} />
                                  <span>{post.comments} comments</span>
                                </span>
                              </div>
                              <span className="flex items-center gap-1">
                                <Eye size={13} />
                                <span>{post.views}</span>
                              </span>
                            </div>
                          </div>
                        </article>
                      );
                    })
                  ) : (
                    <div className="rounded-xl border border-[#252B38] bg-[#151923] p-8 text-center text-xs text-[#737B8D]">
                      No posts match your search query.
                    </div>
                  )}
                </div>
              )}

              {activeTab === "communities" && (
                <div className="flex flex-col gap-3">
                  {filteredCommunities.length > 0 ? (
                    filteredCommunities.map((com) => (
                      <div
                        key={com.id}
                        className="flex items-center justify-between gap-4 rounded-xl border border-[#252B38] bg-[#151923] p-5 transition hover:border-[#8B7CFF]/40"
                      >
                        <div className="flex min-w-0 items-center gap-3.5">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#292444] font-mono text-sm font-bold text-[#8B7CFF]">
                            {com.prefix}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm font-semibold text-[#F3F4F8]">
                                {com.name}
                              </span>
                              <span className="text-xs text-[#737B8D]">
                                {com.peers} • {com.online}
                              </span>
                            </div>
                            <p className="mt-1 truncate text-xs text-[#A0A6B5]">
                              {com.description}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleJoinCommunity(com.id)}
                          className={`shrink-0 rounded-lg px-4 py-1.5 text-xs font-semibold transition ${
                            com.joined
                              ? "border border-[#252B38] bg-[#1B2030] text-[#A0A6B5] hover:text-[#F3F4F8]"
                              : "bg-[#8B7CFF] text-[#151923] hover:bg-[#A397FF]"
                          }`}
                        >
                          {com.joined ? "Joined" : "+ Join"}
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-xl border border-[#252B38] bg-[#151923] p-8 text-center text-xs text-[#737B8D]">
                      No communities match your search query.
                    </div>
                  )}
                </div>
              )}

              {activeTab === "users" && (
                <div className="flex flex-col gap-3">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((usr) => (
                      <div
                        key={usr.id}
                        className="flex items-center justify-between gap-4 rounded-xl border border-[#252B38] bg-[#151923] p-5 transition hover:border-[#8B7CFF]/40"
                      >
                        <Link
                          to={`/u/${usr.username}`}
                          className="flex min-w-0 items-center gap-3.5"
                        >
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#1B2030] text-sm font-bold text-[#8B7CFF]">
                            {usr.initials}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-[#F3F4F8] hover:text-[#8B7CFF]">
                                {usr.name}
                              </span>
                              <span className="font-mono text-xs text-[#737B8D]">
                                @{usr.username} • {usr.rep}
                              </span>
                            </div>
                            <p className="mt-0.5 truncate text-xs text-[#A0A6B5]">
                              {usr.bio}
                            </p>
                          </div>
                        </Link>
                        <button
                          type="button"
                          onClick={() => toggleFollowUser(usr.id)}
                          className={`shrink-0 rounded-lg px-4 py-1.5 text-xs font-semibold transition ${
                            usr.following
                              ? "border border-[#252B38] bg-[#1B2030] text-[#F3F4F8]"
                              : "bg-[#292444] text-[#8B7CFF] hover:bg-[#8B7CFF] hover:text-[#151923]"
                          }`}
                        >
                          {usr.following ? "Following" : "Follow"}
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-xl border border-[#252B38] bg-[#151923] p-8 text-center text-xs text-[#737B8D]">
                      No users match your search query.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Sidebar */}
            <aside className="flex flex-col gap-6 lg:col-span-4">
              <div className="flex flex-col gap-3.5 rounded-xl border border-[#252B38] bg-[#151923] p-4">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm font-semibold text-[#F3F4F8]">
                    <Network size={16} className="text-[#8B7CFF]" />
                    <span>Communities</span>
                  </span>
                  <span className="rounded bg-[#1B2030] px-2 py-0.5 font-mono text-[10px] text-[#737B8D]">
                    {communities.length}
                  </span>
                </div>

                {communities.map((com) => (
                  <div
                    key={com.id}
                    className="flex items-center justify-between gap-2 rounded-lg border border-[#252B38] bg-[#10131B] p-2.5"
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#292444] font-mono text-xs font-bold text-[#8B7CFF]">
                        {com.prefix}
                      </div>
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate font-mono text-xs font-semibold text-[#F3F4F8]">
                          {com.name}
                        </span>
                        <span className="text-[11px] text-[#737B8D]">
                          {com.peers} • {com.online}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleJoinCommunity(com.id)}
                      className={`shrink-0 rounded-lg px-3 py-1.5 text-[11px] font-semibold transition ${
                        com.joined
                          ? "border border-[#252B38] bg-[#1B2030] text-[#A0A6B5] hover:text-[#F3F4F8]"
                          : "bg-[#8B7CFF] text-[#151923] hover:bg-[#A397FF]"
                      }`}
                    >
                      {com.joined ? "Joined" : "+ Join"}
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => setActiveTab("communities")}
                  className="pt-1 text-center text-xs font-medium text-[#8B7CFF] hover:underline"
                >
                  View all {communities.length} communities →
                </button>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}