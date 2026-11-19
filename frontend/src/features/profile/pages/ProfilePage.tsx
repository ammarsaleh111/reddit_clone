import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Calendar,
  Compass,
  Edit3,
  LayoutGrid,
  LogOut,
  Search,
  Settings,
  Share2,
  Shield,
  Users,
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { getApiErrorMessage } from "../../../services/authservices";

type ActiveTab = "overview" | "posts" | "comments" | "communities";

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");
  const [copiedLink, setCopiedLink] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  const isOwnProfile =
    Boolean(user) &&
    (!username || user?.username.toLowerCase() === username.toLowerCase());

  if (!isOwnProfile || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0B0D12] px-4 text-[#F3F4F8]">
        <div className="w-full max-w-md rounded-2xl border border-[#252B38] bg-[#151923] p-8 text-center">
          <h1 className="text-xl font-semibold">Profile unavailable</h1>
          <p className="mt-2 text-sm text-[#A0A6B5]">
            Public profile APIs are not implemented yet. Sign in to view your own
            account profile.
          </p>
          <Link
            to={isAuthenticated ? "/profile" : "/login"}
            className="mt-6 inline-block rounded-lg bg-[#8B7CFF] px-5 py-2.5 text-sm font-semibold text-[#151923]"
          >
            {isAuthenticated ? "View My Profile" : "Sign In"}
          </Link>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(user.createdAt).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });

  async function handleCopyProfileLink() {
    await navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    window.setTimeout(() => setCopiedLink(false), 2000);
  }

  async function handleLogout() {
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (error) {
      setLogoutError(getApiErrorMessage(error, "Unable to sign out. Please try again."));
    }
  }

  return (
    <div className="min-h-screen bg-[#0B0D12] text-[#F3F4F8] antialiased">
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[#252B38] bg-[#10131B]/90 px-4 backdrop-blur-xl lg:px-6">
        <Link to="/profile" className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#292444] font-mono text-xs font-bold text-[#8B7CFF]">
            N
          </span>
          <span className="text-sm font-bold tracking-tight">Nexus</span>
        </Link>
        <div className="flex items-center gap-2.5">
          <Link
            to="/search"
            className="flex items-center gap-1.5 rounded-lg border border-[#252B38] bg-[#151923] px-3 py-1.5 text-xs text-[#A0A6B5]"
          >
            <Search size={14} />
            <span className="hidden sm:inline">Search</span>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-lg border border-[#252B38] bg-[#151923] px-3 py-1.5 text-xs text-[#A0A6B5] hover:border-[#F16B75]/50 hover:text-[#F16B75]"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>
      {logoutError && (
        <p role="alert" className="mx-auto max-w-[1440px] px-4 pt-4 text-xs text-[#F16B75] lg:px-8">
          {logoutError}
        </p>
      )}

      <div className="mx-auto flex max-w-[1440px]">
        <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-60 shrink-0 flex-col justify-between border-r border-[#252B38] bg-[#10131B] p-4 lg:flex">
          <nav className="space-y-1">
            <Link
              to="/search"
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-[#A0A6B5] hover:bg-[#151923] hover:text-[#F3F4F8]"
            >
              <Compass size={15} /> For You
            </Link>
            <Link
              to={`/u/${user.username}/following`}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-[#A0A6B5] hover:bg-[#151923] hover:text-[#F3F4F8]"
            >
              <Users size={15} /> Following
            </Link>
            <Link
              to="/profile"
              className="flex items-center gap-2.5 rounded-lg bg-[#292444] px-3 py-2 text-xs font-semibold"
            >
              <LayoutGrid size={15} className="text-[#8B7CFF]" /> Profile
            </Link>
          </nav>
          <div className="space-y-2 border-t border-[#252B38] pt-3">
            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-[#8B7CFF] hover:bg-[#292444]"
              >
                <Shield size={15} /> Super Admin Console
              </Link>
            )}
            <Link
              to="/settings"
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-[#A0A6B5] hover:bg-[#151923]"
            >
              <Settings size={15} /> Settings
            </Link>
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-6 lg:px-8">
          <section className="rounded-2xl border border-[#252B38] bg-[#151923] p-6">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
              <div className="flex gap-4">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className="h-20 w-20 rounded-full border-2 border-[#8B7CFF]/50 object-cover"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-[#8B7CFF]/50 bg-[#1B2030] text-2xl font-bold uppercase text-[#8B7CFF]">
                    {user.username.slice(0, 2)}
                  </div>
                )}
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-xl font-bold">{user.username}</h1>
                    {user.role === "SUPER_ADMIN" && (
                      <span className="rounded bg-[#292444] px-2 py-0.5 font-mono text-[10px] font-semibold text-[#8B7CFF]">
                        SUPER ADMIN
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-[#737B8D]">
                    <span className="font-mono text-[#A0A6B5]">@{user.username}</span>
                    <span>•</span>
                    <Calendar size={12} />
                    Joined {formattedDate}
                  </div>
                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#A0A6B5]">
                    {user.bio || "No bio has been added yet."}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  to="/settings/profile"
                  className="flex items-center gap-1.5 rounded-lg border border-[#252B38] bg-[#1B2030] px-3.5 py-2 text-xs font-semibold hover:border-[#8B7CFF]"
                >
                  <Edit3 size={14} className="text-[#8B7CFF]" /> Edit Profile
                </Link>
                <button
                  type="button"
                  onClick={handleCopyProfileLink}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#252B38] bg-[#1B2030] text-[#A0A6B5]"
                  title="Copy profile link"
                >
                  <Share2 size={14} />
                </button>
              </div>
            </div>
            {copiedLink && (
              <p className="mt-2 text-right font-mono text-[11px] text-[#35C98A]">
                Profile link copied
              </p>
            )}
            <div className="mt-6 grid grid-cols-2 gap-3 rounded-xl border border-[#252B38] bg-[#10131B] p-4 sm:grid-cols-4">
              {["Total Posts", "Total Comments", "Joined Communities", "Followers"].map(
                (label) => (
                  <div key={label}>
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-[#737B8D]">
                      {label}
                    </div>
                    <div className="mt-1 font-mono text-2xl font-bold text-[#F3F4F8]">
                      —
                    </div>
                  </div>
                ),
              )}
            </div>
          </section>

          <div className="mt-6 flex flex-wrap items-center gap-1.5">
            {(["overview", "posts", "comments", "communities"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize ${
                  activeTab === tab
                    ? "bg-[#292444] text-[#8B7CFF]"
                    : "text-[#A0A6B5] hover:bg-[#151923]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="mt-5 rounded-xl border border-[#252B38] bg-[#151923] p-8 text-center">
            <p className="text-sm font-semibold text-[#F3F4F8]">
              {activeTab === "overview"
                ? "No activity to display"
                : `${activeTab[0].toUpperCase()}${activeTab.slice(1)} data is not available yet`}
            </p>
            <p className="mt-2 text-xs text-[#737B8D]">
              Profile activity APIs are not implemented in the backend.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
