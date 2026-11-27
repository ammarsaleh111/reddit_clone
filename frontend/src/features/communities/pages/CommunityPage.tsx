import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

type SortMode = "top" | "new" | "discussed";
type PostFilter = "all" | "text" | "link";

interface CommunityMeta {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  membersCount: number;
  onlineCount: number;
  rules: string[];
}

interface CommunityPost {
  id: string;
  community: string;
  title: string;
  type: "text" | "link";
  body?: string;
  url?: string;
  author: string;
  timeAgo: string;
  votes: number;
  commentsCount: number;
  flair: string;
}

const DEFAULT_COMMUNITIES: Record<string, CommunityMeta> = {
  programming: {
    slug: "programming",
    title: "c/programming",
    tagline: "Algorithms, systems, architecture & clean code",
    description:
      "Technical discussions, code walkthroughs, architecture trade-offs, and practical engineering notes across languages and runtimes.",
    membersCount: 142890,
    onlineCount: 1240,
    rules: [
      "Keep posts technical, accurate, and constructive.",
      "Include context or reproduction steps when asking for debugging help.",
      "No low-effort ragebait or unverified benchmark claims.",
    ],
  },
  devops: {
    slug: "devops",
    title: "c/devops",
    tagline: "Infrastructure, CI/CD, observability & reliability",
    description:
      "Production incidents, deployment pipelines, container orchestration, telemetry, and infrastructure-as-code practices.",
    membersCount: 92410,
    onlineCount: 830,
    rules: [
      "Redact secrets, tokens, and internal hostnames before sharing logs.",
      "Share postmortems and root causes clearly when discussing outages.",
      "Label vendor promos or sponsored guides transparently.",
    ],
  },
  linux: {
    slug: "linux",
    title: "c/linux",
    tagline: "Kernel internals, shell tooling & system administration",
    description:
      "Linux kernel behavior, systemd, networking, filesystems, performance profiling, and command-line workflows.",
    membersCount: 84150,
    onlineCount: 695,
    rules: [
      "Specify distro, kernel version, or tooling details when relevant.",
      "Avoid destructive shell commands without clear warnings.",
      "Stay focused on technical Linux topics.",
    ],
  },
  webdev: {
    slug: "webdev",
    title: "c/webdev",
    tagline: "Frontend systems, APIs, accessibility & performance",
    description:
      "Modern web applications, state management, routing, CSS architecture, browser behavior, and full-stack integration.",
    membersCount: 118500,
    onlineCount: 910,
    rules: [
      "Focus on practical engineering, UX, and performance trade-offs.",
      "Link to live demos or concise snippets when asking for UI feedback.",
      "Keep self-promotion helpful and relevant.",
    ],
  },
  design: {
    slug: "design",
    title: "c/design",
    tagline: "Design systems, typography, interaction & dark UI",
    description:
      "Interface hierarchy, component tokens, accessibility contrast, micro-interactions, and product design critique.",
    membersCount: 53200,
    onlineCount: 412,
    rules: [
      "Explain the user problem and constraints behind visual choices.",
      "Give actionable, respectful feedback.",
      "Credit original creators when sharing work.",
    ],
  },
};

const SAMPLE_POSTS: CommunityPost[] = [
  {
    id: "p-101",
    community: "programming",
    title: "Treaps vs. balanced BSTs when you need order statistics and priority updates",
    type: "text",
    body: "Combining heap priorities with binary search tree keys gives expected O(log n) split/merge and rank queries with much less pointer/rebalance boilerplate than red-black trees.",
    author: "nadia_k",
    timeAgo: "3h ago",
    votes: 184,
    commentsCount: 29,
    flair: "Data Structures",
  },
  {
    id: "p-102",
    community: "programming",
    title: "Deterministic state machines for async workflows in TypeScript",
    type: "link",
    url: "https://example.com/articles/deterministic-state-machines",
    author: "omar_h",
    timeAgo: "7h ago",
    votes: 129,
    commentsCount: 18,
    flair: "Architecture",
  },
  {
    id: "p-201",
    community: "devops",
    title: "Cutting CI build times in half with layer caching and artifact pruning",
    type: "text",
    body: "Separating dependency installation from application source layers and pinning cache keys dropped our pull-request pipeline from 11 minutes to 5 minutes.",
    author: "tareq_ops",
    timeAgo: "2h ago",
    votes: 215,
    commentsCount: 34,
    flair: "CI/CD",
  },
  {
    id: "p-202",
    community: "devops",
    title: "Structured error logs vs. raw stack traces during high-traffic incidents",
    type: "link",
    url: "https://example.com/guides/incident-observability",
    author: "salma_sre",
    timeAgo: "9h ago",
    votes: 96,
    commentsCount: 14,
    flair: "Observability",
  },
  {
    id: "p-301",
    community: "linux",
    title: "Inspecting socket states and retransmits quickly with ss and tcpdump",
    type: "text",
    body: "When a service looks healthy in process metrics but clients see timeouts, checking queue lengths and packet captures narrows down dropped packets fast.",
    author: "karim_sys",
    timeAgo: "5h ago",
    votes: 142,
    commentsCount: 21,
    flair: "Networking",
  },
];

const SIDEBAR_COMMUNITIES = ["programming", "devops", "webdev", "linux", "design"];

function getCommunityMeta(rawName?: string): CommunityMeta {
  const cleaned = (rawName || "programming").trim().toLowerCase().replace(/^c\//, "");
  const safeSlug = cleaned || "programming";

  if (DEFAULT_COMMUNITIES[safeSlug]) {
    return DEFAULT_COMMUNITIES[safeSlug];
  }

  return {
    slug: safeSlug,
    title: `c/${safeSlug}`,
    tagline: `Community discussions for c/${safeSlug}`,
    description: `Dedicated space for posts, questions, and shared resources in c/${safeSlug} (demo view while the communities API is pending).`,
    membersCount: 12400,
    onlineCount: 88,
    rules: [
      "Keep discussions relevant and respectful.",
      "Provide clear details in posts and questions.",
      "Follow community guidelines.",
    ],
  };
}

export default function CommunityPage() {
  const navigate = useNavigate();
  const { name } = useParams<{ name: string }>();

  const community = useMemo(() => getCommunityMeta(name), [name]);

  const [sortMode, setSortMode] = useState<SortMode>("top");
  const [postFilter, setPostFilter] = useState<PostFilter>("all");
  const [joinedBySlug, setJoinedBySlug] = useState<Record<string, boolean>>({
    programming: true,
    devops: true,
  });
  const [voteOffsets, setVoteOffsets] = useState<Record<string, number>>({});

  const isJoined = Boolean(joinedBySlug[community.slug]);

  const visiblePosts = useMemo(() => {
    const matching = SAMPLE_POSTS.filter((post) => {
      const sameCommunity = post.community === community.slug;
      const matchesType = postFilter === "all" || post.type === postFilter;
      return sameCommunity && matchesType;
    });

    const sourceList =
      matching.length > 0
        ? matching
        : SAMPLE_POSTS.slice(0, 2).filter(
            (post) => postFilter === "all" || post.type === postFilter,
          );

    const sorted = [...sourceList];
    if (sortMode === "top") {
      sorted.sort(
        (a, b) =>
          b.votes + (voteOffsets[b.id] ?? 0) - (a.votes + (voteOffsets[a.id] ?? 0)),
      );
    } else if (sortMode === "discussed") {
      sorted.sort((a, b) => b.commentsCount - a.commentsCount);
    }
    return sorted;
  }, [community.slug, postFilter, sortMode, voteOffsets]);

  const handleToggleJoin = () => {
    setJoinedBySlug((prev) => ({
      ...prev,
      [community.slug]: !prev[community.slug],
    }));
  };

  const handleVote = (postId: string, delta: 1 | -1) => {
    setVoteOffsets((prev) => {
      const current = prev[postId] ?? 0;
      const next = current === delta ? 0 : delta;
      return { ...prev, [postId]: next };
    });
  };

  return (
    <div className="min-h-screen bg-[#0B0D12] text-[#E6E8EE] flex">
      {/* Left Navigation Sidebar */}
      <aside className="w-64 shrink-0 border-r border-[#1F2433] bg-[#0E1118] p-4 flex flex-col justify-between">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Link to="/profile" className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-[#8B7CFF] text-[#0B0D12] font-bold flex items-center justify-center">
                N
              </div>
              <span className="font-semibold tracking-tight text-white">Nexus</span>
            </Link>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#171C28] text-[#9AA3B2] border border-[#252C3D]">
              Preview
            </span>
          </div>

          <nav className="space-y-1 text-sm">
            <Link
              to="/search"
              className="block rounded-lg px-3 py-2 text-[#A7B0C0] hover:bg-[#151923] hover:text-white transition"
            >
              Explore / Search
            </Link>
            <Link
              to="/profile"
              className="block rounded-lg px-3 py-2 text-[#A7B0C0] hover:bg-[#151923] hover:text-white transition"
            >
              Profile
            </Link>
            <button
              type="button"
              onClick={() => navigate("/submit")}
              className="w-full mt-2 rounded-lg bg-[#8B7CFF] hover:bg-[#7A6AF5] text-[#0B0D12] font-medium px-3 py-2 text-left transition cursor-pointer"
            >
              + Create Post
            </button>
          </nav>

          <div>
            <p className="px-3 text-xs font-semibold uppercase tracking-wider text-[#6E7787] mb-2">
              Communities
            </p>
            <div className="space-y-1 text-sm">
              {SIDEBAR_COMMUNITIES.map((slug) => {
                const active = slug === community.slug;
                return (
                  <Link
                    key={slug}
                    to={`/c/${slug}`}
                    className={`block rounded-lg px-3 py-1.5 transition ${
                      active
                        ? "bg-[#292444] text-[#B8AEFF] font-medium"
                        : "text-[#A7B0C0] hover:bg-[#151923] hover:text-white"
                    }`}
                  >
                    c/{slug}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-[#1F2433] bg-[#131722] p-3 text-xs text-[#8D96A6]">
          Demo community view — live community &amp; post endpoints are pending backend integration.
        </div>
      </aside>

      {/* Main Content + Right Info Rail */}
      <main className="flex-1 min-w-0 p-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Feed Column */}
          <div className="lg:col-span-2 space-y-5">
            {/* Community Header Card */}
            <section className="rounded-xl border border-[#1F2433] bg-[#151923] p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <div className="h-10 w-10 rounded-xl bg-[#241F3D] border border-[#3B3363] text-[#A99BFF] font-bold flex items-center justify-center text-lg">
                      c/
                    </div>
                    <div>
                      <h1 className="text-xl font-bold text-white">{community.title}</h1>
                      <p className="text-sm text-[#9AA3B2]">{community.tagline}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleToggleJoin}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition cursor-pointer ${
                      isJoined
                        ? "border border-[#343C52] bg-[#1C2130] text-white hover:bg-[#23293B]"
                        : "bg-[#8B7CFF] hover:bg-[#7A6AF5] text-[#0B0D12]"
                    }`}
                  >
                    {isJoined ? "Joined" : "Join Community"}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/submit")}
                    className="rounded-lg border border-[#2B3245] bg-[#10141D] hover:bg-[#191F2C] text-[#E6E8EE] px-3.5 py-2 text-sm font-medium transition cursor-pointer"
                  >
                    New Post
                  </button>
                </div>
              </div>

              <p className="mt-4 text-sm text-[#C3C9D4] leading-relaxed">
                {community.description}
              </p>
            </section>

            {/* Sort & Post Type Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#1F2433] bg-[#151923] px-4 py-3">
              <div className="flex items-center gap-1.5">
                {(
                  [
                    { id: "top", label: "Top" },
                    { id: "new", label: "New" },
                    { id: "discussed", label: "Most Discussed" },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSortMode(tab.id)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition cursor-pointer ${
                      sortMode === tab.id
                        ? "bg-[#292444] text-[#B8AEFF]"
                        : "text-[#9AA3B2] hover:bg-[#1C2130] hover:text-white"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1.5">
                {(
                  [
                    { id: "all", label: "All" },
                    { id: "text", label: "Text" },
                    { id: "link", label: "Links" },
                  ] as const
                ).map((filter) => (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() => setPostFilter(filter.id)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium transition cursor-pointer ${
                      postFilter === filter.id
                        ? "bg-[#8B7CFF] text-[#0B0D12]"
                        : "bg-[#10141D] text-[#9AA3B2] hover:text-white"
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Posts Feed */}
            <div className="space-y-3">
              {visiblePosts.map((post) => {
                const offset = voteOffsets[post.id] ?? 0;
                const displayVotes = post.votes + offset;

                return (
                  <article
                    key={post.id}
                    className="rounded-xl border border-[#1F2433] bg-[#151923] p-4 flex gap-3.5"
                  >
                    {/* Vote Box */}
                    <div className="flex flex-col items-center gap-1 rounded-lg bg-[#10141D] border border-[#1F2433] px-2 py-2 h-fit select-none">
                      <button
                        type="button"
                        onClick={() => handleVote(post.id, 1)}
                        aria-label="Upvote post"
                        className={`text-xs font-bold px-1.5 py-0.5 rounded cursor-pointer ${
                          offset === 1
                            ? "text-[#8B7CFF] bg-[#241F3D]"
                            : "text-[#8D96A6] hover:text-white"
                        }`}
                      >
                        ▲
                      </button>
                      <span className="text-xs font-semibold text-white">
                        {displayVotes}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleVote(post.id, -1)}
                        aria-label="Downvote post"
                        className={`text-xs font-bold px-1.5 py-0.5 rounded cursor-pointer ${
                          offset === -1
                            ? "text-rose-400 bg-rose-950/50"
                            : "text-[#8D96A6] hover:text-white"
                        }`}
                      >
                        ▼
                      </button>
                    </div>

                    {/* Post Body */}
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-[#8D96A6]">
                        <span className="font-medium text-[#B8AEFF]">c/{post.community}</span>
                        <span>•</span>
                        <span>Posted by u/{post.author}</span>
                        <span>•</span>
                        <span>{post.timeAgo}</span>
                        <span className="rounded-md bg-[#1B2030] border border-[#2A3247] px-2 py-0.5 text-[11px] text-[#C3C9D4]">
                          {post.flair}
                        </span>
                      </div>

                      <h2 className="text-base font-semibold text-white leading-snug">
                        {post.title}
                      </h2>

                      {post.type === "text" && post.body && (
                        <p className="text-sm text-[#B4BCCB] leading-relaxed">{post.body}</p>
                      )}

                      {post.type === "link" && post.url && (
                        <a
                          href={post.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-block text-xs text-[#9D8FFF] hover:underline break-all"
                        >
                          {post.url} ↗
                        </a>
                      )}

                      <div className="pt-1 flex items-center gap-4 text-xs text-[#9AA3B2]">
                        <span>{post.commentsCount} comments</span>
                        <span className="uppercase tracking-wide text-[11px] text-[#6E7787]">
                          {post.type === "link" ? "Link Post" : "Text Post"}
                        </span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          {/* Right Sidebar: Stats & Rules */}
          <aside className="space-y-4">
            <div className="rounded-xl border border-[#1F2433] bg-[#151923] p-4 space-y-3">
              <h3 className="text-sm font-semibold text-white">Community Stats</h3>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="rounded-lg bg-[#10141D] border border-[#1F2433] p-3">
                  <div className="text-lg font-bold text-white">
                    {community.membersCount.toLocaleString()}
                  </div>
                  <div className="text-xs text-[#8D96A6]">Members</div>
                </div>
                <div className="rounded-lg bg-[#10141D] border border-[#1F2433] p-3">
                  <div className="text-lg font-bold text-emerald-400">
                    {community.onlineCount.toLocaleString()}
                  </div>
                  <div className="text-xs text-[#8D96A6]">Online</div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-[#1F2433] bg-[#151923] p-4 space-y-3">
              <h3 className="text-sm font-semibold text-white">
                {community.title} Guidelines
              </h3>
              <ol className="space-y-2 text-xs text-[#B4BCCB] list-decimal list-inside">
                {community.rules.map((rule, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {rule}
                  </li>
                ))}
              </ol>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}