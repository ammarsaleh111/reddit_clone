import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

type TopicCategory =
  | "all"
  | "systems"
  | "devops"
  | "languages"
  | "databases"
  | "frontend"
  | "security";

type DirectorySort = "active" | "members" | "growth";

interface GuildItem {
  slug: string;
  name: string;
  badge?: string;
  topic: Exclude<TopicCategory, "all">;
  topicLabel: string;
  tagline: string;
  description: string;
  members: number;
  growthPct: number;
  tagPill: string;
  featured?: boolean;
}

const GUILDS: GuildItem[] = [
  {
    slug: "programming",
    name: "c/programming",
    badge: "FLAGSHIP GUILD",
    topic: "languages",
    topicLabel: "Languages & Compilers",
    tagline: "Algorithms, concurrency & core engineering",
    description:
      "Algorithmic paradigms, concurrent execution models, and foundational software engineering practices.",
    members: 142890,
    growthPct: 26,
    tagPill: "Active discussions",
    featured: true,
  },
  {
    slug: "devops",
    name: "c/devops",
    topic: "devops",
    topicLabel: "DevOps & SRE",
    tagline: "Infrastructure & Observability",
    description:
      "Kubernetes topology, distributed traces, immutable bare-metal infra, and reliability engineering.",
    members: 92410,
    growthPct: 19,
    tagPill: "High uptime",
    featured: true,
  },
  {
    slug: "linux",
    name: "c/linux",
    topic: "systems",
    topicLabel: "Systems & Kernel",
    tagline: "Kernel Internals & Systems",
    description:
      "eBPF instrumentation, VFIO driver architecture, cgroup v2 tuning, and low-level system diagnostics.",
    members: 84150,
    growthPct: 24,
    tagPill: "Kernel & CLI",
    featured: true,
  },
  {
    slug: "rust-systems",
    name: "c/rust-systems",
    topic: "systems",
    topicLabel: "Systems & Kernel",
    tagline: "Memory safety & async runtimes",
    description:
      "Bare metal, concurrency, async runtimes, and memory safety abstractions without garbage collection overhead.",
    members: 68400,
    growthPct: 31,
    tagPill: "Active discussions",
  },
  {
    slug: "databases",
    name: "c/databases",
    topic: "databases",
    topicLabel: "Databases",
    tagline: "Storage engines & query execution",
    description:
      "Storage engines, LSM trees, consensus protocols, transaction isolation, and distributed SQL performance.",
    members: 61200,
    growthPct: 22,
    tagPill: "Research & internals",
  },
  {
    slug: "distributed",
    name: "c/distributed",
    topic: "devops",
    topicLabel: "DevOps & SRE",
    tagline: "Consensus, replication & fault tolerance",
    description:
      "Raft, Paxos, vector clocks, CRDTs, cluster synchronization, and trade-offs in high-throughput services.",
    members: 44900,
    growthPct: 28,
    tagPill: "High signal",
  },
  {
    slug: "webdev",
    name: "c/webdev",
    topic: "frontend",
    topicLabel: "Frontend & Design Systems",
    tagline: "Web architecture & UI performance",
    description:
      "Modern frontend architecture, bundle performance budgets, browser engine parsing, and rendering pipelines.",
    members: 118500,
    growthPct: 17,
    tagPill: "Community choice",
  },
  {
    slug: "security",
    name: "c/security",
    topic: "security",
    topicLabel: "Security",
    tagline: "Exploitation, crypto & hardening",
    description:
      "Binary exploitation, modern cryptography, zero-trust network boundaries, and hardware vulnerability auditing.",
    members: 54700,
    growthPct: 21,
    tagPill: "Deep technical",
  },
  {
    slug: "compilers",
    name: "c/compilers",
    topic: "languages",
    topicLabel: "Languages & Compilers",
    tagline: "Parsing, IR passes & codegen",
    description:
      "LLVM backend passes, register allocation, abstract syntax tree design, SSA transformation, and JIT engines.",
    members: 38600,
    growthPct: 25,
    tagPill: "Deep technical",
  },
];

const TOPIC_TABS: { id: TopicCategory; label: string }[] = [
  { id: "all", label: "All" },
  { id: "systems", label: "Systems & Kernel" },
  { id: "devops", label: "DevOps & SRE" },
  { id: "languages", label: "Languages & Compilers" },
  { id: "databases", label: "Databases" },
  { id: "frontend", label: "Frontend & Design Systems" },
  { id: "security", label: "Security" },
];

const FASTEST_GROWING = [
  { slug: "rust-systems", label: "c/rust-systems", members: "68.4k members", delta: "+31%" },
  { slug: "distributed", label: "c/distributed", members: "44.9k members", delta: "+28%" },
  { slug: "programming", label: "c/programming", members: "142.9k members", delta: "+26%" },
  { slug: "compilers", label: "c/compilers", members: "38.6k members", delta: "+25%" },
];

export default function ExploreCommunitiesPage() {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<TopicCategory>("all");
  const [sortBy, setSortBy] = useState<DirectorySort>("active");
  const [joinedMap, setJoinedMap] = useState<Record<string, boolean>>({
    programming: true,
    linux: true,
    databases: true,
    webdev: true,
  });

  const toggleJoin = (slug: string) => {
    setJoinedMap((prev) => ({
      ...prev,
      [slug]: !prev[slug],
    }));
  };

  const featuredGuilds = useMemo(
    () => GUILDS.filter((guild) => guild.featured),
    [],
  );

  const filteredGuilds = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const matches = GUILDS.filter((guild) => {
      const matchesTopic =
        selectedTopic === "all" || guild.topic === selectedTopic;
      const matchesQuery =
        !q ||
        guild.name.toLowerCase().includes(q) ||
        guild.tagline.toLowerCase().includes(q) ||
        guild.description.toLowerCase().includes(q) ||
        guild.topicLabel.toLowerCase().includes(q);
      return matchesTopic && matchesQuery;
    });

    const sorted = [...matches];
    if (sortBy === "members") {
      sorted.sort((a, b) => b.members - a.members);
    } else if (sortBy === "growth") {
      sorted.sort((a, b) => b.growthPct - a.growthPct);
    } else {
      sorted.sort(
        (a, b) =>
          b.members * 0.6 +
          b.growthPct * 1200 -
          (a.members * 0.6 + a.growthPct * 1200),
      );
    }

    return sorted;
  }, [searchQuery, selectedTopic, sortBy]);

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
              to="/communities"
              className="block rounded-lg px-3 py-2 bg-[#292444] text-[#B8AEFF] font-medium"
            >
              Explore Communities
            </Link>
            <Link
              to="/search"
              className="block rounded-lg px-3 py-2 text-[#A7B0C0] hover:bg-[#151923] hover:text-white transition"
            >
              Global Search
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
              My Communities
            </p>
            <div className="space-y-1 text-sm">
              {GUILDS.slice(0, 5).map((guild) => (
                <Link
                  key={guild.slug}
                  to={`/c/${guild.slug}`}
                  className="flex items-center justify-between rounded-lg px-3 py-1.5 text-[#A7B0C0] hover:bg-[#151923] hover:text-white transition"
                >
                  <span>{guild.name}</span>
                  {joinedMap[guild.slug] && (
                    <span className="h-1.5 w-1.5 rounded-full bg-[#8B7CFF]" />
                  )}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-[#1F2433] bg-[#131722] p-3 text-xs text-[#8D96A6]">
          Demo directory — live community endpoints are pending backend integration.
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Page Header */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#9D8FFF]">
                Guild Directory &amp; Topology
              </p>
              <h1 className="text-2xl font-bold text-white mt-1">
                Explore Communities
              </h1>
              <p className="text-sm text-[#9AA3B2] mt-1">
                Discover specialized engineering guilds, system architectures, and peer-moderated hubs.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/submit")}
              className="rounded-lg bg-[#8B7CFF] hover:bg-[#7A6AF5] text-[#0B0D12] font-medium px-4 py-2 text-sm transition cursor-pointer"
            >
              + Create Post
            </button>
          </div>

          {/* Search, Sort & Topic Filter Bar */}
          <section className="rounded-xl border border-[#1F2433] bg-[#151923] p-4 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search communities by topic, name, or architecture..."
                className="flex-1 rounded-lg bg-[#0E121B] border border-[#252C3D] px-3.5 py-2 text-sm text-white placeholder-[#6E7787] focus:outline-none focus:border-[#8B7CFF]"
              />

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as DirectorySort)}
                aria-label="Sort communities"
                className="rounded-lg bg-[#0E121B] border border-[#252C3D] px-3 py-2 text-sm text-[#E6E8EE] focus:outline-none focus:border-[#8B7CFF]"
              >
                <option value="active">Sorted by: Most Active</option>
                <option value="members">Sorted by: Most Members</option>
                <option value="growth">Sorted by: Fastest Growing</option>
              </select>
            </div>

            <div className="flex flex-wrap gap-2">
              {TOPIC_TABS.map((tab) => {
                const active = selectedTopic === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSelectedTopic(tab.id)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition cursor-pointer ${
                      active
                        ? "bg-[#8B7CFF] text-[#0B0D12]"
                        : "bg-[#10141D] text-[#A7B0C0] border border-[#202636] hover:text-white"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Featured Engineering Hubs */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-white">
                Featured Engineering Hubs
              </h2>
              <span className="text-xs uppercase tracking-wider text-[#6E7787]">
                Top Velocity Nodes
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {featuredGuilds.map((guild) => {
                const isJoined = Boolean(joinedMap[guild.slug]);
                return (
                  <div
                    key={guild.slug}
                    className="rounded-xl border border-[#23293B] bg-[#151923] p-4 flex flex-col justify-between gap-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <Link
                            to={`/c/${guild.slug}`}
                            className="text-base font-bold text-white hover:text-[#B8AEFF] transition"
                          >
                            {guild.name}
                          </Link>
                          <p className="text-xs text-[#9AA3B2]">{guild.tagline}</p>
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleJoin(guild.slug)}
                          className={`rounded-lg px-3 py-1 text-xs font-medium transition cursor-pointer ${
                            isJoined
                              ? "bg-[#1D2333] text-[#C3C9D4] border border-[#303952]"
                              : "bg-[#8B7CFF] text-[#0B0D12] hover:bg-[#7A6AF5]"
                          }`}
                        >
                          {isJoined ? "Joined" : "+ Join"}
                        </button>
                      </div>

                      <p className="text-xs text-[#B4BCCB] leading-relaxed">
                        {guild.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#1F2433] text-xs">
                      <span className="font-semibold text-white">
                        {guild.members.toLocaleString()} members
                      </span>
                      <span className="text-emerald-400 font-medium">
                        +{guild.growthPct}% velocity
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Directory Grid + Right Rail */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <section className="lg:col-span-2 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-white">
                  Engineering Guilds Directory
                </h2>
                <span className="text-xs text-[#8D96A6]">
                  Showing {filteredGuilds.length} of {GUILDS.length} guilds
                </span>
              </div>

              {filteredGuilds.length === 0 ? (
                <div className="rounded-xl border border-[#1F2433] bg-[#151923] p-6 text-center space-y-2">
                  <p className="text-sm font-medium text-white">
                    No matching communities found
                  </p>
                  <p className="text-xs text-[#8D96A6]">
                    Try clearing your search filter or switching topic categories.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredGuilds.map((guild) => {
                    const isJoined = Boolean(joinedMap[guild.slug]);
                    return (
                      <div
                        key={guild.slug}
                        className="rounded-xl border border-[#1F2433] bg-[#151923] p-4 flex flex-col justify-between gap-3"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <Link
                              to={`/c/${guild.slug}`}
                              className="text-sm font-bold text-white hover:text-[#B8AEFF] transition"
                            >
                              {guild.name}
                            </Link>
                            <button
                              type="button"
                              onClick={() => toggleJoin(guild.slug)}
                              className={`rounded-md px-2.5 py-1 text-xs font-medium transition cursor-pointer ${
                                isJoined
                                  ? "bg-[#1D2333] text-[#C3C9D4] border border-[#303952]"
                                  : "bg-[#8B7CFF] text-[#0B0D12] hover:bg-[#7A6AF5]"
                              }`}
                            >
                              {isJoined ? "Joined" : "+ Join"}
                            </button>
                          </div>

                          <p className="text-xs text-[#B4BCCB] leading-relaxed">
                            {guild.description}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-[#1F2433] text-xs">
                          <span className="text-[#9AA3B2]">
                            {guild.members.toLocaleString()} members
                          </span>
                          <span className="rounded bg-[#1B2030] border border-[#293146] px-2 py-0.5 text-[11px] text-[#C3C9D4]">
                            {guild.tagPill}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Right Sidebar */}
            <aside className="space-y-4">
              <div className="rounded-xl border border-[#1F2433] bg-[#151923] p-4 space-y-3">
                <h3 className="text-sm font-semibold text-white">
                  Fastest Growing
                </h3>
                <div className="space-y-2.5 text-xs">
                  {FASTEST_GROWING.map((item, idx) => (
                    <Link
                      key={item.slug}
                      to={`/c/${item.slug}`}
                      className="flex items-center justify-between rounded-lg bg-[#10141D] border border-[#1F2433] px-3 py-2 hover:border-[#2E364D] transition"
                    >
                      <div>
                        <div className="font-semibold text-white">
                          {idx + 1}. {item.label}
                        </div>
                        <div className="text-[#8D96A6]">{item.members}</div>
                      </div>
                      <span className="font-semibold text-emerald-400">
                        {item.delta}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-[#1F2433] bg-[#151923] p-4 space-y-2">
                <h3 className="text-sm font-semibold text-white">
                  Guild Governance
                </h3>
                <p className="text-xs text-[#9AA3B2] leading-relaxed">
                  Communities in Nexus organize discussions by technical domain and link directly into topic feeds and post creation.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}