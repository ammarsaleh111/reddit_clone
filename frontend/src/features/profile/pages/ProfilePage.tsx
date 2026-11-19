import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Calendar,
  Compass,
  Edit3,
  Flame,
  Globe,
  Home,
  LayoutGrid,
  Link2,
  LogOut,
  MapPin,
  MessageSquare,
  MoreHorizontal,
  Search,
  Settings,
  Share2,
  Shield,
  Terminal,
  TrendingUp,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import {
  MOCK_COMMENTS_BY_USER,
  MOCK_COMMUNITIES_BY_USER,
  MOCK_POSTS_BY_USER,
  MOCK_PROFILES,
} from "../data/mockprofile";
import type { UserProfile } from "../types/profile.types";

type ActiveTab = "overview" | "posts" | "comments" | "communities";

const DEFAULT_COMMUNITIES = [
  {
    id: "c-prog",
    name: "c/programming",
    role: "Member",
    description: "Systems programming, language internals, and architecture.",
    membersCount: 148000,
  },
  {
    id: "c-devops",
    name: "c/devops",
    role: "Member",
    description: "Infrastructure, containers, CI/CD, and reliability.",
    membersCount: 92000,
  },
  {
    id: "c-linux",
    name: "c/linux",
    role: "Member",
    description: "Linux environments, kernel tooling, and open-source systems.",
    membersCount: 84000,
  },
  {
    id: "c-webdev",
    name: "c/webdev",
    role: "Member",
    description: "Modern web engineering, TypeScript, and frontend architecture.",
    membersCount: 210000,
  },
];

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");
  const [sortMode, setSortMode] = useState<"newest" | "top">("newest");
  const [followOverrides, setFollowOverrides] = useState<Record<string, boolean>>({});
  const [authBanner, setAuthBanner] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [headerSearch, setHeaderSearch] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const targetUsername = username || currentUser?.username || "alex_dev";
  const isOwnProfile =
    isAuthenticated &&
    currentUser?.username.toLowerCase() === targetUsername.toLowerCase();

  const baseProfile: UserProfile | undefined =
    isOwnProfile && currentUser
      ? {
          id: currentUser.id,
          username: currentUser.username,
          avatar: currentUser.avatar,
          bio: currentUser.bio,
          role: currentUser.role,
          createdAt: currentUser.createdAt,
          followersCount:
            MOCK_PROFILES[currentUser.username.toLowerCase()]?.followersCount ?? 1420,
          followingCount:
            MOCK_PROFILES[currentUser.username.toLowerCase()]?.followingCount ?? 84,
          postsCount:
            MOCK_POSTS_BY_USER[currentUser.username.toLowerCase()]?.length ?? 0,
        }
      : MOCK_PROFILES[targetUsername.toLowerCase()];

  if (!baseProfile) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0B0D12] px-4 text-[#F3F4F8]">
        <div className="w-full max-w-md rounded-2xl border border-[#252B38] bg-[#151923] p-8 text-center">
          <h1 className="text-xl font-semibold">User Not Found</h1>
          <p className="mt-2 text-sm text-[#A0A6B5]">
            No user exists with the handle{" "}
            <span className="font-mono text-[#F3F4F8]">@{targetUsername}</span>.
          </p>
          <Link
            to="/profile"
            className="mt-6 inline-block rounded-lg bg-[#8B7CFF] px-5 py-2.5 text-sm font-semibold text-[#151923] hover:bg-[#A397FF]"
          >
            Back to Profile
          </Link>
        </div>
      </div>
    );
  }

  const isFollowing =
    followOverrides[baseProfile.username] ?? Boolean(baseProfile.isFollowing);
  const displayedFollowers =
    baseProfile.followersCount +
    (followOverrides[baseProfile.username] === undefined
      ? 0
      : followOverrides[baseProfile.username]
        ? 1
        : -1);

  const rawPosts = MOCK_POSTS_BY_USER[baseProfile.username.toLowerCase()] || [];
  const posts =
    sortMode === "top"
      ? [...rawPosts].sort((a, b) => b.votesCount - a.votesCount)
      : rawPosts;
  const comments = MOCK_COMMENTS_BY_USER[baseProfile.username.toLowerCase()] || [];
  const userCommunities =
    MOCK_COMMUNITIES_BY_USER[baseProfile.username.toLowerCase()];
  const communities =
    userCommunities && userCommunities.length > 0
      ? userCommunities
      : DEFAULT_COMMUNITIES;

  function handleHeaderSearchSubmit(e: FormEvent) {
    e.preventDefault();
    const q = headerSearch.trim();
    navigate(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
  }

  function handleToggleFollow() {
    if (!isAuthenticated) {
      setAuthBanner(true);
      return;
    }
    setFollowOverrides((prev) => ({
      ...prev,
      [baseProfile!.username]: !isFollowing,
    }));
  }

  function handleCopyProfileLink() {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  }

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  const formattedDate = new Date(baseProfile.createdAt).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-[#0B0D12] text-[#F3F4F8] antialiased">
      {/* Top Global Header */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[#252B38] bg-[#10131B]/90 px-4 backdrop-blur-xl lg:px-6">
        <div className="flex items-center gap-6">
          <Link to="/profile" className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#292444] font-mono text-xs font-bold text-[#8B7CFF]">
              N
            </span>
            <span className="text-sm font-bold tracking-tight text-[#F3F4F8]">
              Nexus
            </span>
          </Link>

          {/* Global Search Input */}
          <form
            onSubmit={handleHeaderSearchSubmit}
            className="hidden w-80 items-center justify-between rounded-lg border border-[#252B38] bg-[#151923] px-3 py-1.5 text-xs transition focus-within:border-[#8B7CFF] md:flex lg:w-96"
          >
            <div className="flex flex-1 items-center gap-2">
              <Search size={14} className="shrink-0 text-[#8B7CFF]" />
              <input
                ref={searchInputRef}
                type="text"
                value={headerSearch}
                onChange={(e) => setHeaderSearch(e.target.value)}
                placeholder="Search posts, communities, and users..."
                className="w-full bg-transparent text-[#F3F4F8] placeholder-[#737B8D] outline-none"
              />
            </div>
            <kbd className="rounded bg-[#1B2030] px-1.5 py-0.5 font-mono text-[10px] text-[#A0A6B5]">
              /
            </kbd>
          </form>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/search"
            aria-label="Open Search"
            className="flex items-center gap-1.5 rounded-lg border border-[#252B38] bg-[#151923] px-3 py-1.5 text-xs text-[#A0A6B5] hover:border-[#8B7CFF] hover:text-[#F3F4F8] md:hidden"
          >
            <Search size={14} />
          </Link>

          {isAuthenticated ? (
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-lg border border-[#252B38] bg-[#151923] px-3 py-1.5 text-xs text-[#A0A6B5] transition hover:border-[#F16B75]/50 hover:text-[#F16B75]"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          ) : (
            <Link
              to="/login"
              className="rounded-lg bg-[#8B7CFF] px-3.5 py-1.5 text-xs font-semibold text-[#151923] hover:bg-[#A397FF]"
            >
              Sign In
            </Link>
          )}
        </div>
      </header>

      {/* Main Layout */}
      <div className="mx-auto flex max-w-[1440px]">
        {/* Left Navigation Sidebar */}
        <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-60 shrink-0 flex-col justify-between border-r border-[#252B38] bg-[#10131B] p-4 lg:flex">
          <div className="space-y-6">
            <nav className="space-y-1">
              <Link
                to="/search"
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-[#A0A6B5] transition hover:bg-[#151923] hover:text-[#F3F4F8]"
              >
                <Home size={15} />
                <span>For You</span>
              </Link>

              <Link
                to={`/u/${baseProfile.username}/following`}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-[#A0A6B5] transition hover:bg-[#151923] hover:text-[#F3F4F8]"
              >
                <Users size={15} />
                <span>Following</span>
              </Link>

              <Link
                to="/profile"
                className="flex items-center gap-2.5 rounded-lg bg-[#292444] px-3 py-2 text-xs font-semibold text-[#F3F4F8]"
              >
                <LayoutGrid size={15} className="text-[#8B7CFF]" />
                <span>Profile</span>
              </Link>

              <Link
                to="/search?tab=communities"
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-[#A0A6B5] transition hover:bg-[#151923] hover:text-[#F3F4F8]"
              >
                <Compass size={15} />
                <span>Communities</span>
              </Link>
            </nav>

            <div>
              <div className="px-3 text-[10px] font-semibold uppercase tracking-wider text-[#737B8D]">
                My Communities
              </div>
              <div className="mt-2 space-y-1">
                {communities.map((item) => (
                  <Link
                    key={item.id}
                    to="/search?tab=communities"
                    className="flex items-center justify-between rounded-lg px-3 py-1.5 text-xs text-[#A0A6B5] transition hover:bg-[#151923] hover:text-[#F3F4F8]"
                  >
                    <span className="truncate font-mono">{item.name}</span>
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#8B7CFF]" />
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2 border-t border-[#252B38] pt-3">
            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-[#8B7CFF] transition hover:bg-[#292444]"
              >
                <Shield size={15} />
                <span>Super Admin Console</span>
              </Link>
            )}

            <Link
              to="/settings"
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-[#A0A6B5] transition hover:bg-[#151923] hover:text-[#F3F4F8]"
            >
              <Settings size={15} />
              <span>Settings</span>
            </Link>

            {isAuthenticated && currentUser && (
              <Link
                to="/profile"
                className="mt-2 flex items-center gap-2.5 rounded-xl border border-[#252B38] bg-[#151923] p-2.5 transition hover:bg-[#1B2030]"
              >
                {currentUser.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.username}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1B2030] text-xs font-bold uppercase text-[#8B7CFF]">
                    {currentUser.username.slice(0, 2)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-semibold text-[#F3F4F8]">
                    {currentUser.username}
                  </div>
                  <div className="truncate font-mono text-[10px] text-[#737B8D]">
                    @{currentUser.username}
                  </div>
                </div>
              </Link>
            )}
          </div>
        </aside>

        {/* Main Profile Stream */}
        <main className="min-w-0 flex-1 px-4 py-6 lg:px-8">
          {authBanner && !isAuthenticated && (
            <div className="mb-5 flex items-center justify-between rounded-xl border border-[#8B7CFF]/40 bg-[#292444] p-4 text-xs">
              <span className="text-[#F3F4F8]">
                Sign in or register to follow users on Nexus.
              </span>
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="rounded-lg bg-[#8B7CFF] px-3 py-1.5 font-semibold text-[#151923] hover:bg-[#A397FF]"
                >
                  Sign In
                </Link>
                <button
                  type="button"
                  onClick={() => setAuthBanner(false)}
                  className="px-2 py-1 text-[#A0A6B5] hover:text-[#F3F4F8]"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {/* Profile Header Card & Account Statistics */}
          <section className="rounded-2xl border border-[#252B38] bg-[#151923] p-6">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <div className="relative shrink-0">
                  {baseProfile.avatar ? (
                    <img
                      src={baseProfile.avatar}
                      alt={baseProfile.username}
                      className="h-20 w-20 rounded-full border-2 border-[#8B7CFF]/50 object-cover"
                    />
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-[#8B7CFF]/50 bg-[#1B2030] text-2xl font-bold uppercase text-[#8B7CFF]">
                      {baseProfile.username.slice(0, 2)}
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-xl font-bold tracking-tight text-[#F3F4F8]">
                      {baseProfile.username}
                    </h1>
                    {baseProfile.role === "SUPER_ADMIN" && (
                      <span className="rounded bg-[#292444] px-2 py-0.5 font-mono text-[10px] font-semibold text-[#8B7CFF]">
                        SUPER ADMIN
                      </span>
                    )}
                  </div>

                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-[#737B8D]">
                    <span className="font-mono text-[#A0A6B5]">
                      @{baseProfile.username}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      Joined {formattedDate}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin size={12} />
                      UTC+2
                    </span>
                  </div>

                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#A0A6B5]">
                    {baseProfile.bio || "Community member on Nexus."}
                  </p>

                  <div className="mt-3.5 flex flex-wrap items-center gap-4 text-xs">
                    <Link
                      to={`/u/${baseProfile.username}/followers`}
                      className="text-[#A0A6B5] hover:text-[#F3F4F8]"
                    >
                      <strong className="font-bold text-[#F3F4F8]">
                        {displayedFollowers.toLocaleString()}
                      </strong>{" "}
                      Followers
                    </Link>

                    <Link
                      to={`/u/${baseProfile.username}/following`}
                      className="text-[#A0A6B5] hover:text-[#F3F4F8]"
                    >
                      <strong className="font-bold text-[#F3F4F8]">
                        {baseProfile.followingCount.toLocaleString()}
                      </strong>{" "}
                      Following
                    </Link>

                    <span className="hidden text-[#252B38] sm:inline">|</span>

                    <span className="flex items-center gap-1 text-[#737B8D]">
                      <Link2 size={13} className="text-[#8B7CFF]" />
                      <span className="font-mono">{baseProfile.username}.dev</span>
                    </span>

                    <span className="flex items-center gap-1 text-[#737B8D]">
                      <Globe size={13} className="text-[#8B7CFF]" />
                      <span className="font-mono">
                        github.com/{baseProfile.username}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start">
                {isOwnProfile ? (
                  <Link
                    to="/settings/profile"
                    className="flex items-center gap-1.5 rounded-lg border border-[#252B38] bg-[#1B2030] px-3.5 py-2 text-xs font-semibold text-[#F3F4F8] transition hover:border-[#8B7CFF]"
                  >
                    <Edit3 size={14} className="text-[#8B7CFF]" />
                    <span>Edit Profile</span>
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={handleToggleFollow}
                    className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold transition ${
                      isFollowing
                        ? "border border-[#252B38] bg-[#1B2030] text-[#F3F4F8] hover:border-[#F16B75]/50 hover:text-[#F16B75]"
                        : "bg-[#8B7CFF] text-[#151923] hover:bg-[#A397FF]"
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <UserCheck size={14} />
                        <span>Following</span>
                      </>
                    ) : (
                      <>
                        <UserPlus size={14} />
                        <span>Follow</span>
                      </>
                    )}
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleCopyProfileLink}
                  title="Copy profile link"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#252B38] bg-[#1B2030] text-[#A0A6B5] hover:text-[#F3F4F8]"
                >
                  <Share2 size={14} />
                </button>

                <Link
                  to="/settings"
                  title="Settings"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#252B38] bg-[#1B2030] text-[#A0A6B5] hover:text-[#F3F4F8]"
                >
                  <MoreHorizontal size={14} />
                </Link>
              </div>
            </div>

            {copiedLink && (
              <p className="mt-2 text-right font-mono text-[11px] text-[#35C98A]">
                Profile link copied
              </p>
            )}

            {/* Account Statistics Strip */}
            <div className="mt-6 grid grid-cols-2 gap-3 rounded-xl border border-[#252B38] bg-[#10131B] p-4 sm:grid-cols-4">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-[#737B8D]">
                  Total Posts
                </div>
                <div className="mt-1 font-mono text-2xl font-bold text-[#F3F4F8]">
                  {posts.length}
                </div>
              </div>

              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-[#737B8D]">
                  Total Comments
                </div>
                <div className="mt-1 font-mono text-2xl font-bold text-[#F3F4F8]">
                  {comments.length}
                </div>
              </div>

              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-[#737B8D]">
                  Joined Communities
                </div>
                <div className="mt-1 font-mono text-2xl font-bold text-[#F3F4F8]">
                  {communities.length}
                </div>
              </div>

              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-[#737B8D]">
                  Followers
                </div>
                <div className="mt-1 font-mono text-2xl font-bold text-[#F3F4F8]">
                  {displayedFollowers.toLocaleString()}
                </div>
              </div>
            </div>
          </section>

          {/* Profile Activity Tabs & Sort Controls */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setActiveTab("overview")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  activeTab === "overview"
                    ? "bg-[#292444] text-[#8B7CFF]"
                    : "text-[#A0A6B5] hover:bg-[#151923] hover:text-[#F3F4F8]"
                }`}
              >
                <LayoutGrid size={13} />
                <span>Overview</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("posts")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  activeTab === "posts"
                    ? "bg-[#292444] text-[#8B7CFF]"
                    : "text-[#A0A6B5] hover:bg-[#151923] hover:text-[#F3F4F8]"
                }`}
              >
                <span>Posts</span>
                <span className="rounded bg-[#1B2030] px-1.5 py-0.5 font-mono text-[10px]">
                  {posts.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("comments")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  activeTab === "comments"
                    ? "bg-[#292444] text-[#8B7CFF]"
                    : "text-[#A0A6B5] hover:bg-[#151923] hover:text-[#F3F4F8]"
                }`}
              >
                <span>Comments</span>
                <span className="rounded bg-[#1B2030] px-1.5 py-0.5 font-mono text-[10px]">
                  {comments.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("communities")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  activeTab === "communities"
                    ? "bg-[#292444] text-[#8B7CFF]"
                    : "text-[#A0A6B5] hover:bg-[#151923] hover:text-[#F3F4F8]"
                }`}
              >
                <span>Communities</span>
                <span className="rounded bg-[#1B2030] px-1.5 py-0.5 font-mono text-[10px]">
                  {communities.length}
                </span>
              </button>
            </div>

            <div className="flex rounded-lg border border-[#252B38] bg-[#151923] p-0.5 text-[11px]">
              <button
                type="button"
                onClick={() => setSortMode("newest")}
                className={`rounded-md px-2.5 py-1 font-medium ${
                  sortMode === "newest"
                    ? "bg-[#1B2030] text-[#F3F4F8]"
                    : "text-[#737B8D]"
                }`}
              >
                Latest
              </button>
              <button
                type="button"
                onClick={() => setSortMode("top")}
                className={`rounded-md px-2.5 py-1 font-medium ${
                  sortMode === "top"
                    ? "bg-[#1B2030] text-[#F3F4F8]"
                    : "text-[#737B8D]"
                }`}
              >
                Popular
              </button>
            </div>
          </div>

          {/* Main Content & Right Contextual Column */}
          <div className="mt-5 grid grid-cols-1 gap-6 xl:grid-cols-12">
            <div className="space-y-6 xl:col-span-8">
              {(activeTab === "overview" || activeTab === "posts") && (
                <section className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="flex items-center gap-2 text-sm font-semibold text-[#F3F4F8]">
                      <Flame size={15} className="text-[#8B7CFF]" />
                      <span>Posts</span>
                    </h2>
                    {activeTab === "overview" && posts.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setActiveTab("posts")}
                        className="text-xs font-medium text-[#8B7CFF] hover:underline"
                      >
                        View all {posts.length} posts →
                      </button>
                    )}
                  </div>

                  {posts.length > 0 ? (
                    posts.map((post) => (
                      <article
                        key={post.id}
                        className="rounded-xl border border-[#252B38] bg-[#151923] p-5 transition hover:border-[#8B7CFF]/50"
                      >
                        <div className="flex items-center gap-2 text-[11px] text-[#737B8D]">
                          <span className="rounded bg-[#1B2030] px-2 py-0.5 font-mono font-semibold text-[#8B7CFF]">
                            {post.communityName}
                          </span>
                          <span>•</span>
                          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                        </div>
                        <h3 className="mt-2 text-base font-semibold text-[#F3F4F8]">
                          {post.title}
                        </h3>
                        <p className="mt-1.5 text-xs leading-relaxed text-[#A0A6B5]">
                          {post.body}
                        </p>
                        <div className="mt-4 flex items-center gap-5 text-[11px] text-[#737B8D]">
                          <span className="flex items-center gap-1 font-mono text-[#8B7CFF]">
                            <TrendingUp size={13} />
                            {post.votesCount}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare size={13} />
                            {post.commentsCount} comments
                          </span>
                        </div>
                      </article>
                    ))
                  ) : (
                    <div className="rounded-xl border border-[#252B38] bg-[#151923] p-8 text-center text-xs text-[#737B8D]">
                      No posts published by @{baseProfile.username} yet. Preview
                      other profiles like{" "}
                      <Link
                        to="/u/alex_dev"
                        className="text-[#8B7CFF] hover:underline"
                      >
                        @alex_dev
                      </Link>{" "}
                      or{" "}
                      <Link
                        to="/u/sarah_ops"
                        className="text-[#8B7CFF] hover:underline"
                      >
                        @sarah_ops
                      </Link>
                      .
                    </div>
                  )}
                </section>
              )}

              {activeTab === "comments" && (
                <section className="space-y-3">
                  {comments.length > 0 ? (
                    comments.map((comment) => (
                      <article
                        key={comment.id}
                        className="rounded-xl border border-[#252B38] bg-[#151923] p-5"
                      >
                        <div className="flex items-center gap-2 text-[11px] text-[#737B8D]">
                          <span>Commented on</span>
                          <span className="font-medium text-[#F3F4F8]">
                            {comment.postTitle}
                          </span>
                          <span>in</span>
                          <span className="font-mono text-[#8B7CFF]">
                            {comment.communityName}
                          </span>
                        </div>
                        <p className="mt-2 rounded-lg border border-[#252B38] bg-[#10131B] p-3 text-xs leading-relaxed text-[#F3F4F8]">
                          "{comment.body}"
                        </p>
                      </article>
                    ))
                  ) : (
                    <div className="rounded-xl border border-[#252B38] bg-[#151923] p-8 text-center text-xs text-[#737B8D]">
                      No comments by @{baseProfile.username} yet.
                    </div>
                  )}
                </section>
              )}

              {activeTab === "communities" && (
                <section className="grid gap-3 sm:grid-cols-2">
                  {communities.map((com) => (
                    <div
                      key={com.id}
                      className="rounded-xl border border-[#252B38] bg-[#151923] p-5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-sm font-semibold text-[#8B7CFF]">
                          {com.name}
                        </span>
                        <span className="rounded bg-[#1B2030] px-2 py-0.5 text-[10px] font-medium text-[#A0A6B5]">
                          {com.role}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-[#737B8D]">
                        {com.description}
                      </p>
                      <div className="mt-3 font-mono text-[11px] text-[#A0A6B5]">
                        {com.membersCount.toLocaleString()} members
                      </div>
                    </div>
                  ))}
                </section>
              )}
            </div>

            {/* Right Contextual Column: Joined Communities */}
            <aside className="space-y-6 xl:col-span-4">
              <div className="rounded-2xl border border-[#252B38] bg-[#151923] p-5">
                <div className="flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-[#F3F4F8]">
                    <Terminal size={15} className="text-[#8B7CFF]" />
                    <span>Joined Communities</span>
                  </h3>
                  <Link
                    to="/search?tab=communities"
                    className="text-xs font-medium text-[#8B7CFF] hover:underline"
                  >
                    Browse
                  </Link>
                </div>

                <div className="mt-4 space-y-3">
                  {communities.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between rounded-lg border border-[#252B38] bg-[#10131B] px-3 py-2.5"
                    >
                      <div>
                        <div className="font-mono text-xs font-semibold text-[#F3F4F8]">
                          {c.name}
                        </div>
                        <div className="text-[11px] text-[#737B8D]">
                          {c.membersCount.toLocaleString()} members
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Link
                  to="/search?tab=communities"
                  className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg border border-[#252B38] bg-[#1B2030] py-2 text-xs font-semibold text-[#F3F4F8] transition hover:border-[#8B7CFF]"
                >
                  <Compass size={14} className="text-[#8B7CFF]" />
                  <span>Explore Communities</span>
                </Link>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}