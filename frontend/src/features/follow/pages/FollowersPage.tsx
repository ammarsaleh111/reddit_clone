import { useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { ArrowLeft, UserCheck, UserPlus, Users } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

interface FollowUserItem {
  id: string;
  username: string;
  bio: string;
  isFollowing: boolean;
}

const INITIAL_FOLLOWERS: FollowUserItem[] = [
  {
    id: "user_002",
    username: "sarah_ops",
    bio: "Staff SRE @ Monolith. Kubernetes, eBPF observability, and zero-downtime migrations.",
    isFollowing: true,
  },
  {
    id: "user_003",
    username: "omar_kernel",
    bio: "Linux kernel contributor, Rust async runtimes, and lock-free data structures.",
    isFollowing: false,
  },
  {
    id: "user_004",
    username: "nadia_ml",
    bio: "ML Systems engineer optimizing distributed GPU training & inference pipelines.",
    isFollowing: true,
  },
];

const INITIAL_FOLLOWING: FollowUserItem[] = [
  {
    id: "user_002",
    username: "sarah_ops",
    bio: "Staff SRE @ Monolith. Kubernetes, eBPF observability, and zero-downtime migrations.",
    isFollowing: true,
  },
  {
    id: "admin_001",
    username: "superadmin",
    bio: "Nexus Platform Super Administrator & Core Maintainer.",
    isFollowing: true,
  },
];

export default function FollowersPage() {
  const { username } = useParams<{ username: string }>();
  const location = useLocation();
  const { user: currentUser, isAuthenticated } = useAuth();

  const isFollowingTab = location.pathname.endsWith("/following");
  const targetUsername = username || currentUser?.username || "alex_dev";

  const [usersList, setUsersList] = useState<FollowUserItem[]>(
    isFollowingTab ? INITIAL_FOLLOWING : INITIAL_FOLLOWERS
  );

  // تحديث القائمة عند التبديل بين تاب Followers وتاب Following
  const [lastMode, setLastMode] = useState(isFollowingTab);
  if (lastMode !== isFollowingTab) {
    setLastMode(isFollowingTab);
    setUsersList(isFollowingTab ? INITIAL_FOLLOWING : INITIAL_FOLLOWERS);
  }

  function handleToggleFollow(id: string) {
    if (!isAuthenticated) return;
    setUsersList((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isFollowing: !item.isFollowing } : item
      )
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0D12] px-4 py-8 text-white">
      <div className="mx-auto max-w-2xl">
        {/* Back Header */}
        <div className="mb-6 flex items-center gap-3">
          <Link
            to={`/u/${targetUsername}`}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#303646] bg-[#151923] text-[#9298A8] transition hover:border-[#8B7CFF] hover:text-white"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-lg font-bold">@{targetUsername}</h1>
            <p className="text-xs text-[#9298A8]">Network Connections</p>
          </div>
        </div>

        {/* Switch Tabs (Followers / Following) */}
        <div className="mb-5 grid grid-cols-2 rounded-xl border border-white/[0.08] bg-[#151923] p-1">
          <Link
            to={`/u/${targetUsername}/followers`}
            className={`rounded-lg py-2 text-center text-xs font-semibold transition ${
              !isFollowingTab
                ? "bg-[#8B7CFF] text-white"
                : "text-[#9298A8] hover:text-white"
            }`}
          >
            Followers ({INITIAL_FOLLOWERS.length})
          </Link>
          <Link
            to={`/u/${targetUsername}/following`}
            className={`rounded-lg py-2 text-center text-xs font-semibold transition ${
              isFollowingTab
                ? "bg-[#8B7CFF] text-white"
                : "text-[#9298A8] hover:text-white"
            }`}
          >
            Following ({INITIAL_FOLLOWING.length})
          </Link>
        </div>

        {/* Users List */}
        {usersList.length > 0 ? (
          <div className="space-y-3">
            {usersList.map((item) => {
              const isSelf =
                isAuthenticated &&
                currentUser?.username.toLowerCase() === item.username.toLowerCase();

              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 rounded-xl border border-white/[0.08] bg-[#151923] p-4"
                >
                  <Link
                    to={`/u/${item.username}`}
                    className="flex min-w-0 flex-1 items-center gap-3.5"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#1D2230] text-sm font-bold uppercase text-[#A397FF]">
                      {item.username.slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white hover:text-[#A397FF]">
                        @{item.username}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-[#9298A8]">
                        {item.bio}
                      </p>
                    </div>
                  </Link>

                  {isAuthenticated && !isSelf && (
                    <button
                      type="button"
                      onClick={() => handleToggleFollow(item.id)}
                      className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition ${
                        item.isFollowing
                          ? "border border-[#303646] bg-[#10131B] text-white hover:border-red-500/40 hover:text-red-400"
                          : "bg-[#8B7CFF] text-white hover:bg-[#A397FF]"
                      }`}
                    >
                      {item.isFollowing ? (
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
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-white/[0.06] bg-[#151923]/60 p-10 text-center text-xs text-[#9298A8]">
            <Users size={24} className="mx-auto mb-2 text-[#737B8D]" />
            No users in this list yet.
          </div>
        )}
      </div>
    </div>
  );
}