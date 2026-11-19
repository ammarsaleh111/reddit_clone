import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Ban,
  Bot,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  Eye,
  FileText,
  Gavel,
  Gauge,
  KeyRound,
  MessageSquare,
  RefreshCw,
  Search,
  Shield,
  ShieldCheck,
  Sliders,
  UserCog,
  UserPlus,
  Users,
} from "lucide-react";

type UserStatus = "Active" | "Suspended" | "Banned";
type StatusFilter = "All Users" | UserStatus;

interface ManagedUser {
  id: string;
  name: string;
  username: string;
  email: string;
  joinedDate: string;
  status: UserStatus;
  roles: string[];
  initials: string;
  isBot?: boolean;
}

const INITIAL_USERS: ManagedUser[] = [
  {
    id: "u-01",
    name: "Elena Rostova",
    username: "elena_dev",
    email: "elena@nexus.internal",
    joinedDate: "Oct 2021",
    status: "Active",
    roles: ["Admin", "Mod"],
    initials: "ER",
  },
  {
    id: "u-02",
    name: "Niklas Lindqvist",
    username: "niklas_core",
    email: "niklas@sys.io",
    joinedDate: "Jan 2023",
    status: "Active",
    roles: ["Member"],
    initials: "NC",
  },
  {
    id: "u-03",
    name: "spambot_9921",
    username: "spam_auto_trap",
    email: "temp@throwaway.net",
    joinedDate: "10m ago",
    status: "Banned",
    roles: ["Member"],
    initials: "SB",
    isBot: true,
  },
  {
    id: "u-04",
    name: "crypto_promoter",
    username: "xcoin_official",
    email: "marketing@xcoin.xyz",
    joinedDate: "Yesterday",
    status: "Suspended",
    roles: ["Member"],
    initials: "CP",
  },
  {
    id: "u-05",
    name: "Sarah Koenig",
    username: "sarah_k",
    email: "sarah@kernel.org",
    joinedDate: "Mar 2022",
    status: "Active",
    roles: ["Guild Steward"],
    initials: "SK",
  },
];

export default function AdminDashboardPage() {
  const [users, setUsers] = useState<ManagedUser[]>(INITIAL_USERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All Users");
  const [purgeFeedback, setPurgeFeedback] = useState<string | null>(null);
  const [exportFeedback, setExportFeedback] = useState<string | null>(null);
  const [lockedCommunities, setLockedCommunities] = useState<Record<string, boolean>>({});

  const filteredUsers = users.filter((usr) => {
    const matchesStatus =
      statusFilter === "All Users" || usr.status === statusFilter;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      usr.name.toLowerCase().includes(q) ||
      usr.username.toLowerCase().includes(q) ||
      usr.email.toLowerCase().includes(q) ||
      usr.roles.some((r) => r.toLowerCase().includes(q));
    return matchesStatus && matchesSearch;
  });

  function updateUserStatus(id: string, nextStatus: UserStatus) {
    setUsers((prev) =>
      prev.map((usr) => (usr.id === id ? { ...usr, status: nextStatus } : usr))
    );
  }

  function handlePurgeCache() {
    setPurgeFeedback("Purging Edge Nodes...");
    setTimeout(() => {
      setPurgeFeedback("Purged (180ms)");
      setTimeout(() => setPurgeFeedback(null), 2000);
    }, 700);
  }

  function handleExportLog() {
    setExportFeedback("Archiving CSV...");
    setTimeout(() => {
      setExportFeedback("Export Ready");
      setTimeout(() => setExportFeedback(null), 2000);
    }, 800);
  }

  function toggleCommunityLock(name: string) {
    setLockedCommunities((prev) => ({ ...prev, [name]: !prev[name] }));
  }

  return (
    <div className="min-h-screen bg-[#0b0e16] text-[#e0e2ee] antialiased">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-[#474554]/30 bg-[#10131b]/85 px-6 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <Link
            to="/profile"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#474554]/40 bg-[#181b24] text-[#c8c4d6] hover:border-[#c7bfff] hover:text-white"
          >
            <ArrowLeft size={16} />
          </Link>
          <span className="text-base font-semibold tracking-tight text-[#e0e2ee]">
            Nexus
          </span>
          <span className="rounded bg-[#484264] px-1.5 py-0.5 text-[10px] font-semibold text-[#b8b0d8]">
            PRO
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-1.5 rounded-full border border-[#474554]/30 bg-[#1c1f28] px-3 py-1 text-[11px] font-medium text-[#c8c4d6] sm:flex">
            <span className="h-2 w-2 rounded-full bg-[#8e7fff]" />
            <span>Network 99.98%</span>
          </div>
          <Link
            to="/profile"
            className="rounded-lg bg-[#1c1f28] px-3.5 py-1.5 text-xs font-medium text-[#e0e2ee] hover:bg-[#272a32]"
          >
            User Dashboard
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto flex w-full max-w-[1600px] flex-col gap-8 p-6 lg:p-8">
        {/* 1. Admin Dashboard Header */}
        <div className="relative flex flex-col justify-between gap-6 overflow-hidden rounded-xl bg-[#181b24] p-6 shadow-xl md:flex-row md:items-center lg:p-8">
          <div className="pointer-events-none absolute -right-16 -top-16 h-80 w-80 rounded-full bg-[#c7bfff]/5 blur-3xl" />

          <div className="z-10 flex flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-3xl font-semibold tracking-tight text-[#e0e2ee]">
                Super Admin Console
              </h1>
              <div className="flex items-center gap-1.5 rounded-full bg-[#1c1f28] px-2.5 py-1 text-[11px] font-medium text-[#c8c4d6]">
                <span className="h-2 w-2 animate-pulse rounded-full bg-[#8e7fff]" />
                <span className="text-[#e0e2ee]">System Healthy</span>
                <span className="text-[#928f9f]">·</span>
                <span className="text-[#928f9f]">Node 01-US-East</span>
              </div>
              <span className="rounded bg-[#272a32] px-2 py-0.5 text-[11px] font-semibold text-[#c7bfff]">
                Uptime 99.98%
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-[#c8c4d6]">
              <Shield size={14} className="text-[#c7bfff]" />
              <span className="font-medium text-[#e4dfff]">
                Super Admin Privileges: Full Root Access
              </span>
              <span className="text-[#928f9f]">|</span>
              <span className="text-[#928f9f]">
                Session Authenticated · Ephemeral Token 0x8F9C...
              </span>
            </div>
          </div>

          {/* Quick Platform Actions */}
          <div className="z-10 flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleExportLog}
              className="flex items-center gap-1.5 rounded-lg bg-[#1c1f28] px-4 py-2 text-xs font-medium text-[#e0e2ee] shadow-sm transition hover:bg-[#272a32]"
            >
              <Download size={15} />
              <span>{exportFeedback || "Export Audit Log"}</span>
            </button>

            <button
              type="button"
              onClick={handlePurgeCache}
              className="flex items-center gap-1.5 rounded-lg bg-[#1c1f28] px-4 py-2 text-xs font-medium text-[#e0e2ee] shadow-sm transition hover:bg-[#272a32]"
            >
              {purgeFeedback?.includes("180ms") ? (
                <CheckCircle2 size={15} className="text-[#35C98A]" />
              ) : (
                <RefreshCw
                  size={15}
                  className={purgeFeedback ? "animate-spin" : ""}
                />
              )}
              <span>{purgeFeedback || "Purge Cache"}</span>
            </button>

            <button
              type="button"
              className="flex items-center gap-1.5 rounded-lg bg-[#8e7fff] px-4 py-2 text-xs font-semibold text-[#24008c] shadow-md transition hover:bg-[#c7bfff]"
            >
              <Sliders size={15} />
              <span>System Config</span>
            </button>
          </div>
        </div>

        {/* 2. Platform Vital KPI Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* KPI 1 */}
          <div className="flex flex-col justify-between rounded-xl bg-[#181b24] p-6 shadow-lg transition hover:bg-[#1c1f28]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#928f9f]">
                Total Registered Users
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#272a32] text-[#c7bfff]">
                <Users size={16} />
              </div>
            </div>
            <div className="my-4">
              <div className="text-3xl font-semibold tracking-tight text-[#e0e2ee]">
                142,850
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-[11px]">
                <span className="font-medium text-[#8e7fff]">+840 today</span>
                <span className="text-[#928f9f]">·</span>
                <span className="text-[#c8c4d6]">+6.4% MoM</span>
              </div>
            </div>
            <div className="h-1 w-full overflow-hidden rounded-full bg-[#32353d]">
              <div className="h-full w-[76%] rounded-full bg-[#8e7fff]" />
            </div>
          </div>

          {/* KPI 2 */}
          <div className="flex flex-col justify-between rounded-xl bg-[#181b24] p-6 shadow-lg transition hover:bg-[#1c1f28]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#928f9f]">
                Active Communities
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#272a32] text-[#c9c1ea]">
                <MessageSquare size={16} />
              </div>
            </div>
            <div className="my-4">
              <div className="text-3xl font-semibold tracking-tight text-[#e0e2ee]">
                1,480
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-[11px]">
                <span className="font-medium text-[#c9c1ea]">
                  12 pending approval
                </span>
                <span className="text-[#928f9f]">·</span>
                <span className="text-[#c8c4d6]">+28 new this week</span>
              </div>
            </div>
            <div className="h-1 w-full overflow-hidden rounded-full bg-[#32353d]">
              <div className="h-full w-[64%] rounded-full bg-[#c9c1ea]" />
            </div>
          </div>

          {/* KPI 3 */}
          <div className="flex flex-col justify-between rounded-xl bg-[#181b24] p-6 shadow-lg transition hover:bg-[#1c1f28]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#928f9f]">
                Discussions & Posts
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#272a32] text-[#e4dfff]">
                <FileText size={16} />
              </div>
            </div>
            <div className="my-4">
              <div className="text-3xl font-semibold tracking-tight text-[#e0e2ee]">
                684,210
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-[11px]">
                <span className="font-medium text-[#8e7fff]">+3,120 today</span>
                <span className="text-[#928f9f]">·</span>
                <span className="text-[#c8c4d6]">42.1k/wk avg</span>
              </div>
            </div>
            <div className="h-1 w-full overflow-hidden rounded-full bg-[#32353d]">
              <div className="h-full w-[88%] rounded-full bg-[#8e7fff]" />
            </div>
          </div>

          {/* KPI 4 */}
          <div className="flex flex-col justify-between rounded-xl bg-[#181b24] p-6 shadow-lg transition hover:bg-[#1c1f28]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#928f9f]">
                Comments & Replies
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#272a32] text-[#c7bfff]">
                <MessageSquare size={16} />
              </div>
            </div>
            <div className="my-4">
              <div className="text-3xl font-semibold tracking-tight text-[#e0e2ee]">
                2,419,800
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-[11px]">
                <span className="font-medium text-[#c7bfff]">+14.8k today</span>
                <span className="text-[#928f9f]">·</span>
                <span className="text-[#c8c4d6]">3.53 replies/post</span>
              </div>
            </div>
            <div className="h-1 w-full overflow-hidden rounded-full bg-[#32353d]">
              <div className="h-full w-[92%] rounded-full bg-[#c7bfff]" />
            </div>
          </div>
        </div>

        {/* 3. Platform Growth & Activity Velocity Chart */}
        <div className="flex flex-col gap-6 rounded-xl bg-[#181b24] p-6 shadow-xl lg:p-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold tracking-tight text-[#e0e2ee]">
                  Platform Growth & Activity Velocity
                </h2>
                <span className="rounded bg-[#1c1f28] px-2 py-0.5 text-[11px] font-medium text-[#c8c4d6]">
                  Rolling 30D
                </span>
              </div>
              <p className="mt-1 text-sm text-[#c8c4d6]">
                Cross-referencing net user registrations against published post volume.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-5 text-xs text-[#c8c4d6]">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-[#8e7fff]" />
                <span>New Users (DAU 42.6k)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-[#c9c1ea]" />
                <span>Posts Created</span>
              </div>
            </div>
          </div>

          {/* Telemetry Strip Banner */}
          <div className="grid grid-cols-1 gap-4 rounded-lg bg-[#1c1f28] p-4 md:grid-cols-3">
            <div className="flex items-center gap-3.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#272a32] text-[#c7bfff]">
                <Gauge size={18} />
              </div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#928f9f]">
                  P99 Edge Latency
                </div>
                <div className="text-base font-semibold text-[#e0e2ee]">
                  38ms{" "}
                  <span className="text-xs font-normal text-[#8e7fff]">
                    (-4ms delta)
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#272a32] text-[#c7bfff]">
                <ShieldCheck size={18} />
              </div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#928f9f]">
                  Spam Auto-Filter Rate
                </div>
                <div className="text-base font-semibold text-[#e0e2ee]">
                  99.4%{" "}
                  <span className="text-xs font-normal text-[#c8c4d6]">
                    2,110 trapped
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#272a32] text-[#c7bfff]">
                <Activity size={18} />
              </div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#928f9f]">
                  Ingress Throughput
                </div>
                <div className="text-base font-semibold text-[#e0e2ee]">
                  1,820 req/s{" "}
                  <span className="text-xs font-normal text-[#928f9f]">
                    Peak 2.4k
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Vector Visual Graph */}
          <div className="relative flex h-72 w-full flex-col justify-end overflow-hidden rounded-lg bg-[#0b0e16] p-4 sm:h-80">
            <svg
              className="h-full w-full"
              fill="none"
              preserveAspectRatio="none"
              viewBox="0 0 900 240"
            >
              <defs>
                <linearGradient id="primaryAreaGrad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#8e7fff" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#8e7fff" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient
                  id="secondaryAreaGrad"
                  x1="0"
                  x2="0"
                  y1="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#c9c1ea" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#c9c1ea" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              <line
                stroke="#32353d"
                strokeDasharray="4 4"
                strokeWidth="1"
                x1="0"
                x2="900"
                y1="40"
                y2="40"
              />
              <line
                stroke="#32353d"
                strokeDasharray="4 4"
                strokeWidth="1"
                x1="0"
                x2="900"
                y1="100"
                y2="100"
              />
              <line
                stroke="#32353d"
                strokeDasharray="4 4"
                strokeWidth="1"
                x1="0"
                x2="900"
                y1="160"
                y2="160"
              />
              <line
                stroke="#32353d"
                strokeWidth="1"
                x1="0"
                x2="900"
                y1="220"
                y2="220"
              />

              <path
                d="M0,190 C60,185 120,165 180,140 C240,115 300,135 360,110 C420,85 480,105 540,80 C600,55 660,70 720,45 C780,25 840,40 900,20 L900,220 L0,220 Z"
                fill="url(#primaryAreaGrad)"
              />
              <path
                d="M0,190 C60,185 120,165 180,140 C240,115 300,135 360,110 C420,85 480,105 540,80 C600,55 660,70 720,45 C780,25 840,40 900,20"
                stroke="#8e7fff"
                strokeLinecap="round"
                strokeWidth="2.5"
              />

              <path
                d="M0,210 C70,200 140,190 210,180 C280,170 350,150 420,135 C490,120 560,130 630,110 C700,90 770,85 840,70 L900,60 L900,220 L0,220 Z"
                fill="url(#secondaryAreaGrad)"
              />
              <path
                d="M0,210 C70,200 140,190 210,180 C280,170 350,150 420,135 C490,120 560,130 630,110 C700,90 770,85 840,70 L900,60"
                stroke="#c9c1ea"
                strokeDasharray="3 3"
                strokeLinecap="round"
                strokeWidth="2"
              />

              <circle cx="360" cy="110" fill="#c7bfff" r="4" />
              <circle cx="720" cy="45" fill="#c7bfff" r="4" />
              <circle cx="900" cy="20" fill="#c7bfff" r="4" />
            </svg>

            <div className="mt-1 flex items-center justify-between border-t border-[#272a32]/40 pt-2 text-[11px] font-medium text-[#928f9f]">
              <span>Day 1 (May 01)</span>
              <span>Day 7</span>
              <span>Day 14 (Mid-Month Peak)</span>
              <span>Day 21</span>
              <span>Day 28</span>
              <span className="font-medium text-[#c7bfff]">Today (Live)</span>
            </div>
          </div>
        </div>

        {/* 4. User Management & Privilege Control Table */}
        <div className="flex flex-col gap-6 rounded-xl bg-[#181b24] p-6 shadow-xl lg:p-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-[#e0e2ee]">
                User Management & Privilege Control
              </h2>
              <p className="mt-1 text-sm text-[#c8c4d6]">
                Real-time catalog of all registered credentials, roles, and automated trust scores.
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="rounded bg-[#1c1f28] px-2.5 py-1 text-[11px] font-medium text-[#c8c4d6]">
                142,850 Total Profiles
              </span>
              <button
                type="button"
                className="flex items-center gap-1.5 rounded-lg bg-[#1c1f28] px-3.5 py-1.5 text-xs font-medium text-[#e0e2ee] hover:bg-[#272a32]"
              >
                <UserPlus size={14} />
                <span>Manual Provision</span>
              </button>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div className="relative max-w-lg flex-1">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#928f9f]"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by username, email, ID, or IP hash..."
                className="h-10 w-full rounded-lg bg-[#1c1f28] pl-10 pr-4 text-sm text-[#e0e2ee] placeholder:text-[#928f9f] focus:bg-[#272a32] focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {(["All Users", "Active", "Suspended", "Banned"] as StatusFilter[]).map(
                (tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setStatusFilter(tab)}
                    className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition ${
                      statusFilter === tab
                        ? "bg-[#8e7fff] text-[#24008c] shadow-sm"
                        : "bg-[#1c1f28] text-[#c8c4d6] hover:bg-[#272a32] hover:text-[#e0e2ee]"
                    }`}
                  >
                    {tab}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Table View */}
          <div className="w-full overflow-x-auto rounded-lg bg-[#0b0e16]">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-[#1c1f28] text-[11px] font-semibold uppercase tracking-wider text-[#928f9f]">
                  <th className="w-12 px-4 py-3 text-center">
                    <input type="checkbox" className="rounded bg-[#32353d]" />
                  </th>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Joined Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Roles</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#272a32]/30 text-sm">
                {filteredUsers.map((usr) => (
                  <tr
                    key={usr.id}
                    className={`group transition-colors hover:bg-[#1c1f28] ${
                      usr.status === "Banned" ? "bg-[#93000a]/10" : ""
                    }`}
                  >
                    <td className="px-4 py-3.5 text-center">
                      <input type="checkbox" className="rounded bg-[#32353d]" />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold ${
                            usr.isBot
                              ? "bg-[#93000a] text-[#ffb4ab]"
                              : "bg-[#484264] text-[#b8b0d8]"
                          }`}
                        >
                          {usr.isBot ? <Bot size={16} /> : usr.initials}
                        </div>
                        <div className="flex flex-col">
                          <Link
                            to={`/u/${usr.username}`}
                            className={`font-semibold transition-colors ${
                              usr.status === "Banned"
                                ? "text-[#ffb4ab]"
                                : "text-[#e0e2ee] group-hover:text-[#c7bfff]"
                            }`}
                          >
                            {usr.name}
                          </Link>
                          <span className="text-[11px] text-[#928f9f]">
                            @{usr.username}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs text-[#c8c4d6]">
                      {usr.email}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-[#c8c4d6]">
                      {usr.joinedDate}
                    </td>
                    <td className="px-4 py-3.5">
                      {usr.status === "Active" && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#272a32] px-2.5 py-0.5 text-[11px] font-medium text-[#e0e2ee]">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#35C98A]" />
                          Active
                        </span>
                      )}
                      {usr.status === "Banned" && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#93000a] px-2.5 py-0.5 text-[11px] font-medium text-[#ffb4ab]">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#F16B75]" />
                          Banned
                        </span>
                      )}
                      {usr.status === "Suspended" && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E9B45B]/15 px-2.5 py-0.5 text-[11px] font-medium text-[#E9B45B]">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#E9B45B]" />
                          Suspended
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap items-center gap-1">
                        {usr.roles.map((role) => (
                          <span
                            key={role}
                            className={`rounded px-1.5 py-0.5 text-[11px] font-semibold ${
                              role === "Admin"
                                ? "bg-[#8e7fff] text-[#24008c]"
                                : role === "Guild Steward"
                                  ? "bg-[#484264] text-[#b8b0d8]"
                                  : "bg-[#32353d] text-[#c8c4d6]"
                            }`}
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {usr.status === "Banned" ? (
                          <button
                            type="button"
                            onClick={() => updateUserStatus(usr.id, "Active")}
                            className="rounded bg-[#1c1f28] px-2.5 py-1 text-[11px] font-medium text-[#c7bfff] hover:bg-[#272a32]"
                          >
                            Unban
                          </button>
                        ) : usr.status === "Suspended" ? (
                          <>
                            <button
                              type="button"
                              onClick={() => updateUserStatus(usr.id, "Active")}
                              className="rounded bg-[#1c1f28] px-2.5 py-1 text-[11px] font-medium text-[#e0e2ee] hover:bg-[#272a32]"
                            >
                              Restore
                            </button>
                            <button
                              type="button"
                              onClick={() => updateUserStatus(usr.id, "Banned")}
                              className="rounded bg-[#93000a]/40 px-2.5 py-1 text-[11px] font-medium text-[#ffb4ab] hover:bg-[#93000a]"
                            >
                              Ban Perm
                            </button>
                          </>
                        ) : (
                          <>
                            <Link
                              to={`/u/${usr.username}`}
                              title="View Profile"
                              className="rounded p-1.5 text-[#c8c4d6] hover:bg-[#272a32] hover:text-white"
                            >
                              <Eye size={15} />
                            </Link>
                            <button
                              type="button"
                              title="Quick Suspend"
                              onClick={() => updateUserStatus(usr.id, "Suspended")}
                              className="rounded p-1.5 text-[#c8c4d6] hover:bg-[#272a32] hover:text-[#ffb4ab]"
                            >
                              <Ban size={15} />
                            </button>
                            <button
                              type="button"
                              title="Edit Permissions"
                              className="rounded p-1.5 text-[#c8c4d6] hover:bg-[#272a32] hover:text-white"
                            >
                              <UserCog size={15} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Row */}
          <div className="flex flex-col justify-between gap-3 text-[11px] text-[#c8c4d6] sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <span>
                Showing <strong>1-{filteredUsers.length}</strong> of 142,850 users
              </span>
              <span className="text-[#928f9f]">·</span>
              <span className="text-[#928f9f]">Bulk Action:</span>
              <button
                type="button"
                className="rounded bg-[#1c1f28] px-2.5 py-1 text-[#e0e2ee] hover:bg-[#272a32]"
              >
                Export Selected
              </button>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled
                className="flex h-8 w-8 items-center justify-center rounded bg-[#1c1f28] text-[#928f9f] disabled:opacity-40"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded bg-[#8e7fff] font-medium text-[#24008c]"
              >
                1
              </button>
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded bg-[#1c1f28] text-[#e0e2ee] hover:bg-[#272a32]"
              >
                2
              </button>
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded bg-[#1c1f28] text-[#e0e2ee] hover:bg-[#272a32]"
              >
                3
              </button>
              <span className="px-1 text-[#928f9f]">...</span>
              <button
                type="button"
                className="flex h-8 w-12 items-center justify-center rounded bg-[#1c1f28] text-[#e0e2ee] hover:bg-[#272a32]"
              >
                28,570
              </button>
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded bg-[#1c1f28] text-[#e0e2ee] hover:bg-[#272a32]"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* 5. Community Oversight & Security Audit Stream */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Left Card: Community Oversight */}
          <div className="flex flex-col gap-5 rounded-xl bg-[#181b24] p-6 shadow-xl lg:p-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold text-[#e0e2ee]">
                    Community Oversight
                  </h2>
                  <span className="rounded bg-[#1c1f28] px-2 py-0.5 text-[11px] font-medium text-[#c7bfff]">
                    High Velocity
                  </span>
                </div>
                <p className="mt-1 text-sm text-[#c8c4d6]">
                  Real-time health status, moderator allocation, and administrative controls.
                </p>
              </div>
              <button
                type="button"
                className="rounded-lg bg-[#1c1f28] p-2 text-[#c8c4d6] hover:bg-[#272a32] hover:text-white"
              >
                <RefreshCw size={15} />
              </button>
            </div>

            <div className="flex flex-col gap-3.5">
              {/* c/programming */}
              <div className="flex flex-col gap-2.5 rounded-lg bg-[#1c1f28] p-4 transition hover:bg-[#272a32]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#8e7fff] font-bold text-[#24008c]">
                      cp
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-base font-medium text-[#e0e2ee]">
                          c/programming
                        </span>
                        <span
                          className={`h-2 w-2 rounded-full ${
                            lockedCommunities["c/programming"]
                              ? "bg-[#F16B75]"
                              : "bg-[#35C98A]"
                          }`}
                        />
                      </div>
                      <span className="text-[11px] text-[#928f9f]">
                        84,120 members · 4,210 online
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      className="rounded bg-[#32353d] px-2.5 py-1 text-[11px] font-medium text-[#e0e2ee] hover:bg-[#363942]"
                    >
                      Audit
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleCommunityLock("c/programming")}
                      className="rounded bg-[#32353d] px-2.5 py-1 text-[11px] font-medium text-[#c8c4d6] hover:bg-[#93000a] hover:text-[#ffb4ab]"
                    >
                      {lockedCommunities["c/programming"] ? "Unlock" : "Lock"}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 border-t border-[#272a32]/50 pt-2 text-[11px]">
                  <span className="text-[#c8c4d6]">
                    Growth: <strong className="text-[#8e7fff]">+8.4% /wk</strong>
                  </span>
                  <span className="text-[#c8c4d6]">
                    Mods: <strong className="text-[#e0e2ee]">14 active</strong>
                  </span>
                  <span className="text-[#c8c4d6]">
                    Queue: <strong className="text-[#35C98A]">0 backlogged</strong>
                  </span>
                </div>
              </div>

              {/* c/devops */}
              <div className="flex flex-col gap-2.5 rounded-lg bg-[#1c1f28] p-4 transition hover:bg-[#272a32]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#484264] font-bold text-[#b8b0d8]">
                      cd
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-base font-medium text-[#e0e2ee]">
                          c/devops
                        </span>
                        <span
                          className={`h-2 w-2 rounded-full ${
                            lockedCommunities["c/devops"]
                              ? "bg-[#F16B75]"
                              : "bg-[#35C98A]"
                          }`}
                        />
                      </div>
                      <span className="text-[11px] text-[#928f9f]">
                        32,800 members · 1,480 online
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      className="rounded bg-[#32353d] px-2.5 py-1 text-[11px] font-medium text-[#e0e2ee] hover:bg-[#363942]"
                    >
                      Audit
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleCommunityLock("c/devops")}
                      className="rounded bg-[#32353d] px-2.5 py-1 text-[11px] font-medium text-[#c8c4d6] hover:bg-[#93000a] hover:text-[#ffb4ab]"
                    >
                      {lockedCommunities["c/devops"] ? "Unlock" : "Lock"}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 border-t border-[#272a32]/50 pt-2 text-[11px]">
                  <span className="text-[#c8c4d6]">
                    Growth: <strong className="text-[#8e7fff]">+12.1% /wk</strong>
                  </span>
                  <span className="text-[#c8c4d6]">
                    Mods: <strong className="text-[#e0e2ee]">6 active</strong>
                  </span>
                  <span className="text-[#c8c4d6]">
                    Queue: <strong className="text-[#35C98A]">2 flagged</strong>
                  </span>
                </div>
              </div>

              {/* c/webdev */}
              <div className="flex flex-col gap-2.5 rounded-lg bg-[#1c1f28] p-4 transition hover:bg-[#272a32]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#32353d] font-bold text-[#c8c4d6]">
                      cw
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-base font-medium text-[#e0e2ee]">
                          c/webdev
                        </span>
                        <span className="h-2 w-2 rounded-full bg-[#E9B45B]" />
                      </div>
                      <span className="text-[11px] text-[#928f9f]">
                        51,900 members · Low mod coverage
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      className="rounded bg-[#32353d] px-2.5 py-1 text-[11px] font-medium text-[#e0e2ee] hover:bg-[#363942]"
                    >
                      Assign Mod
                    </button>
                    <button
                      type="button"
                      className="rounded bg-[#32353d] px-2.5 py-1 text-[11px] font-medium text-[#c8c4d6] hover:bg-[#93000a] hover:text-[#ffb4ab]"
                    >
                      Archive
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 border-t border-[#272a32]/50 pt-2 text-[11px]">
                  <span className="text-[#c8c4d6]">
                    Growth: <strong className="text-[#8e7fff]">+4.3% /wk</strong>
                  </span>
                  <span className="text-[#c8c4d6]">
                    Mods: <strong className="text-[#E9B45B]">2 active</strong>
                  </span>
                  <span className="text-[#c8c4d6]">
                    Queue: <strong className="text-[#E9B45B]">14 queued</strong>
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#1c1f28] py-2.5 text-xs font-medium text-[#e0e2ee] hover:bg-[#272a32]"
            >
              <span>Manage All 1,480 Communities</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Right Card: Security & Automated Audit Stream */}
          <div className="flex flex-col gap-5 rounded-xl bg-[#181b24] p-6 shadow-xl lg:p-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold text-[#e0e2ee]">
                    Security & Automated Audit Stream
                  </h2>
                  <span className="rounded bg-[#1c1f28] px-2 py-0.5 text-[11px] font-medium text-[#c7bfff]">
                    Real-time
                  </span>
                </div>
                <p className="mt-1 text-sm text-[#c8c4d6]">
                  Continuous platform event journal and algorithmic protection triggers.
                </p>
              </div>
              <span className="h-2.5 w-2.5 animate-ping rounded-full bg-[#8e7fff]" />
            </div>

            <div className="flex flex-col gap-3">
              {/* Event 1 */}
              <div className="flex items-start gap-3.5 rounded-lg bg-[#1c1f28] p-4">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#93000a]/30 text-[#ffb4ab]">
                  <Shield size={15} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#e0e2ee]">
                      IP Range Rate-Limited
                    </span>
                    <span className="text-[11px] text-[#928f9f]">2m ago</span>
                  </div>
                  <p className="mt-1 truncate text-xs text-[#c8c4d6]">
                    Subnet 194.26.29.0/24 exceeded 1,200 POST/min threshold. Automatic 24h throttle enacted.
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="rounded bg-[#32353d] px-1.5 py-0.5 font-mono text-[11px] text-[#928f9f]">
                      RULE_ID_4091
                    </span>
                    <button
                      type="button"
                      className="text-[11px] font-medium text-[#c7bfff] hover:underline"
                    >
                      Inspect Trace
                    </button>
                  </div>
                </div>
              </div>

              {/* Event 2 */}
              <div className="flex items-start gap-3.5 rounded-lg bg-[#1c1f28] p-4">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#32353d] text-[#c7bfff]">
                  <KeyRound size={15} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#e0e2ee]">
                      Automated Token Refresh
                    </span>
                    <span className="text-[11px] text-[#928f9f]">18m ago</span>
                  </div>
                  <p className="mt-1 text-xs text-[#c8c4d6]">
                    Global JWT rotation completed across 4 regional edge clusters with zero dropped connections.
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="rounded bg-[#32353d] px-1.5 py-0.5 font-mono text-[11px] text-[#928f9f]">
                      SYS_AUTH_ROTATE
                    </span>
                    <span className="text-[11px] text-[#c8c4d6]">
                      Validated 100%
                    </span>
                  </div>
                </div>
              </div>

              {/* Event 3 */}
              <div className="flex items-start gap-3.5 rounded-lg bg-[#1c1f28] p-4">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#93000a]/30 text-[#ffb4ab]">
                  <Gavel size={15} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#e0e2ee]">
                      Community c/crypto Suspended
                    </span>
                    <span className="text-[11px] text-[#928f9f]">1h ago</span>
                  </div>
                  <p className="mt-1 text-xs text-[#c8c4d6]">
                    Automated ban for malicious affiliate link farming and synthetic engagement ring detection.
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="rounded bg-[#32353d] px-1.5 py-0.5 font-mono text-[11px] text-[#928f9f]">
                      POLICY_LINKFARM
                    </span>
                    <button
                      type="button"
                      className="text-[11px] font-medium text-[#ffb4ab] hover:underline"
                    >
                      Review Enforcement
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-auto flex items-center justify-between pt-2 text-[11px]">
              <span className="text-[#928f9f]">
                Log pipeline: 4.8MB/sec written to immutable cold storage
              </span>
              <button
                type="button"
                className="flex items-center gap-1 font-medium text-[#c7bfff] hover:underline"
              >
                <span>Live Stream</span>
                <ExternalLink size={12} />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}