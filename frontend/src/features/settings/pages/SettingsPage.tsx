import { useState, type ChangeEvent, type SubmitEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  BadgeCheck,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Cpu,
  Eye,
  ImagePlus,
  KeyRound,
  Laptop,
  Lock,
  LogOut,
  Monitor,
  Plus,
  Share2,
  Shield,
  Sliders,
  Terminal,
  Trash2,
  User,
  X,
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

const HEATMAP_LEVELS = [
  0, 1, 3, 0, 2, 3, 1, 0,
  3, 2, 3, 2, 0, 1, 3, 2,
  3, 0, 2, 3, 0, 1, 3, 3,
  0, 2, 3, 1, 0, 2, 3, 0,
];

export default function SettingsPage() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState(user?.username || "elena_dev");
  const [bio, setBio] = useState(
    user?.bio || "Systems programmer & distributed systems enthusiast."
  );
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [profileSaved, setProfileSaved] = useState(false);

  const [isPasswordOpen, setIsPasswordOpen] = useState(true);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwStatus, setPwStatus] = useState<string | null>(null);

  const [publicProfile, setPublicProfile] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(true);

  function handleAvatarFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setAvatar(reader.result);
      }
    };
    reader.readAsDataURL(file);
  }

  function handleSaveProfile(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanedUsername = username.trim().replace(/^@+/, "");
    if (!cleanedUsername) return;

    updateUser({
      username: cleanedUsername,
      bio: bio.trim(),
      avatar: avatar.trim() || null,
    });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  }

  function handleUpdatePassword(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!currentPassword || newPassword.length < 8 || newPassword !== confirmPassword) {
      setPwStatus("Please check all password fields (min. 8 characters and matching).");
      return;
    }
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPwStatus("Password updated successfully.");
  }

  function handleDeleteAccount() {
    const confirmed = window.confirm(
      `Warning: Are you certain you want to permanently delete @${user?.username || "elena_dev"} and all reputation nodes?`
    );
    if (confirmed) {
      logout();
      navigate("/login", { replace: true });
    }
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

        <Link
          to="/profile"
          className="rounded-lg bg-[#1c1f28] px-3.5 py-1.5 text-xs font-medium text-[#e0e2ee] hover:bg-[#272a32]"
        >
          User Dashboard
        </Link>
      </header>

      {/* Page Body */}
      <div className="relative mx-auto max-w-[1240px] px-4 py-8 lg:px-8">
        <div className="pointer-events-none absolute left-1/3 top-12 -z-10 h-96 w-96 rounded-full bg-[#c7bfff]/5 blur-3xl" />

        {/* Breadcrumb & Title Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-[#c8c4d6]">
              <span>Nexus</span>
              <ChevronRight size={13} />
              <span>Settings</span>
              <ChevronRight size={13} />
              <span className="text-[#c7bfff]">Profile & Security</span>
            </div>
            <div className="mt-1 flex items-center gap-3">
              <h1 className="text-3xl font-semibold tracking-tight text-[#e0e2ee]">
                Profile & Security Parameters
              </h1>
              <span className="rounded bg-[#272a32] px-2 py-0.5 text-[11px] font-semibold text-[#c7bfff]">
                L3 Verified
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start rounded-full bg-[#181b24] px-4 py-1.5 text-xs text-[#c8c4d6] md:self-auto">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#c7bfff] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#c7bfff]" />
            </span>
            <span>Session synced</span>
            <span className="font-mono text-[10px] text-[#c8c4d6]/40">12:44:02 UTC</span>
          </div>
        </div>

        {/* Main 12-Col Grid */}
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          {/* Left Sticky Rail */}
          <nav className="flex flex-col gap-3 lg:sticky lg:top-20 lg:col-span-3">
            <div className="flex flex-col gap-1 rounded-xl bg-[#181b24] p-1.5">
              <a
                href="#public-profile"
                className="flex items-center justify-between rounded-lg bg-[#272a32] px-3.5 py-2 text-sm font-semibold text-[#e0e2ee] shadow-sm"
              >
                <span className="flex items-center gap-2 text-[#c7bfff]">
                  <User size={16} />
                  <span className="text-[#e0e2ee]">Public Profile</span>
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-[#c7bfff]" />
              </a>

              <a
                href="#account-info"
                className="flex items-center justify-between rounded-lg px-3.5 py-2 text-sm font-medium text-[#c8c4d6] hover:bg-[#1c1f28] hover:text-[#e0e2ee]"
              >
                <span className="flex items-center gap-2">
                  <BadgeCheck size={16} />
                  <span>Account Info</span>
                </span>
              </a>

              <a
                href="#password-auth"
                className="flex items-center justify-between rounded-lg px-3.5 py-2 text-sm font-medium text-[#c8c4d6] hover:bg-[#1c1f28] hover:text-[#e0e2ee]"
              >
                <span className="flex items-center gap-2">
                  <Shield size={16} />
                  <span>Account & Security</span>
                </span>
              </a>

              <a
                href="#privacy-data"
                className="flex items-center justify-between rounded-lg px-3.5 py-2 text-sm font-medium text-[#c8c4d6] hover:bg-[#1c1f28] hover:text-[#e0e2ee]"
              >
                <span className="flex items-center gap-2">
                  <Sliders size={16} />
                  <span>Preferences & Reading</span>
                </span>
              </a>

              <a
                href="#connected-profiles"
                className="flex items-center justify-between rounded-lg px-3.5 py-2 text-sm font-medium text-[#c8c4d6] hover:bg-[#1c1f28] hover:text-[#e0e2ee]"
              >
                <span className="flex items-center gap-2">
                  <Share2 size={16} />
                  <span>Connected Accounts</span>
                </span>
                <span className="rounded bg-[#1c1f28] px-1.5 py-0.5 font-mono text-[10px] text-[#c8c4d6]">
                  2 ACTIVE
                </span>
              </a>

              <a
                href="#active-sessions"
                className="flex items-center justify-between rounded-lg px-3.5 py-2 text-sm font-medium text-[#c8c4d6] hover:bg-[#1c1f28] hover:text-[#e0e2ee]"
              >
                <span className="flex items-center gap-2">
                  <Monitor size={16} />
                  <span>Session Management</span>
                </span>
                <span className="h-2 w-2 rounded-full bg-[#8e7fff]" />
              </a>
            </div>

            {/* Security Score Card */}
            <div className="flex flex-col gap-2 rounded-xl bg-[#181b24] p-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#c8c4d6]">
                  Security Score
                </span>
                <span className="font-mono text-xs font-semibold text-[#c7bfff]">
                  96/100
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#272a32]">
                <div className="h-1.5 w-[96%] rounded-full bg-[#c7bfff]" />
              </div>
              <p className="text-xs text-[#c8c4d6]/80">
                Hardware key active. Cryptographic profile signatures bound.
              </p>
            </div>
          </nav>

          {/* Right Main Stream */}
          <main className="flex flex-col gap-8 lg:col-span-9">
            {/* SECTION 0: EDIT PUBLIC PROFILE (AVATAR, USERNAME, BIO) */}
            <form
              id="public-profile"
              onSubmit={handleSaveProfile}
              className="flex flex-col gap-5 rounded-xl bg-[#181b24] p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <User size={19} className="text-[#c7bfff]" />
                    <h2 className="text-lg font-semibold text-[#e0e2ee]">
                      Public Profile Identity
                    </h2>
                  </div>
                  <p className="mt-1 text-xs text-[#c8c4d6]">
                    Customize your avatar, public handle, and engineering bio displayed on your profile.
                  </p>
                </div>

                {profileSaved && (
                  <span className="flex items-center gap-1.5 rounded-full bg-[#35C98A]/15 px-3 py-1 text-xs font-medium text-[#35C98A]">
                    <CheckCircle2 size={14} />
                    <span>Saved to Profile</span>
                  </span>
                )}
              </div>

              {/* Avatar Row */}
              <div className="flex flex-col gap-4 rounded-lg bg-[#1c1f28] p-4 sm:flex-row sm:items-center">
                {avatar ? (
                  <img
                    src={avatar}
                    alt={username}
                    className="h-16 w-16 shrink-0 rounded-2xl border border-[#474554]/50 object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#272a32] text-xl font-bold uppercase text-[#c7bfff]">
                    {username.slice(0, 2) || "NX"}
                  </div>
                )}

                <div className="flex flex-1 flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-[#272a32] px-3 py-1.5 text-xs font-medium text-[#e0e2ee] hover:bg-[#32353d]">
                      <ImagePlus size={14} className="text-[#c7bfff]" />
                      <span>Upload Avatar</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarFileChange}
                        className="hidden"
                      />
                    </label>
                    {avatar && (
                      <button
                        type="button"
                        onClick={() => setAvatar("")}
                        className="rounded-lg px-2.5 py-1.5 text-xs text-[#c8c4d6] hover:text-[#ffb4ab]"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <input
                    type="url"
                    value={avatar.startsWith("data:") ? "" : avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    placeholder="Or paste an avatar image URL (https://...)"
                    className="w-full rounded-lg bg-[#181b24] px-3 py-1.5 text-xs text-[#e0e2ee] placeholder:text-[#928f9f] focus:outline-none focus:ring-1 focus:ring-[#c7bfff]"
                  />
                </div>
              </div>

              {/* Username & Bio Inputs */}
              <div className="grid grid-cols-1 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#c8c4d6]">
                    Username Handle
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-sm text-[#928f9f]">
                      @
                    </span>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="your_handle"
                      className="w-full rounded-lg bg-[#1c1f28] py-2 pl-8 pr-3.5 font-mono text-sm text-[#e0e2ee] placeholder:text-[#928f9f] focus:outline-none focus:ring-1 focus:ring-[#c7bfff]"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-[#c8c4d6]">
                      Bio
                    </label>
                    <span className="font-mono text-[11px] text-[#928f9f]">
                      {bio.length}/160
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    maxLength={160}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Write a short technical bio..."
                    className="w-full resize-none rounded-lg bg-[#1c1f28] p-3.5 text-sm leading-relaxed text-[#e0e2ee] placeholder:text-[#928f9f] focus:outline-none focus:ring-1 focus:ring-[#c7bfff]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-1">
                <Link
                  to="/profile"
                  className="rounded-lg bg-[#1c1f28] px-4 py-2 text-xs font-medium text-[#c8c4d6] hover:bg-[#272a32] hover:text-[#e0e2ee]"
                >
                  View Profile
                </Link>
                <button
                  type="submit"
                  className="rounded-lg bg-[#8e7fff] px-5 py-2 text-xs font-semibold text-[#24008c] hover:bg-[#c7bfff] hover:text-[#2a059b]"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>

            {/* SECTION 1: ACCOUNT INFORMATION */}
            <section
              id="account-info"
              className="flex flex-col gap-5 rounded-xl bg-[#181b24] p-6 shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BadgeCheck size={19} className="text-[#c7bfff]" />
                    <h2 className="text-lg font-semibold text-[#e0e2ee]">
                      Account Information
                    </h2>
                  </div>
                  <span className="font-mono text-[11px] text-[#c8c4d6]/60">
                    UID: {user?.id || "NX-88402-A"}
                  </span>
                </div>
                <p className="mt-1 text-xs text-[#c8c4d6]">
                  Core identifier mapping and communication pathways for multi-node notifications.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="flex flex-col gap-1.5 rounded-lg bg-[#1c1f28] p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#c8c4d6]">
                      Active Handle
                    </span>
                    <BadgeCheck size={15} className="text-[#c7bfff]" />
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="font-mono text-base font-semibold text-[#e0e2ee]">
                      @{user?.username || "elena_dev"}
                    </span>
                    <span className="rounded bg-[#272a32] px-2 py-0.5 font-mono text-[11px] text-[#c7bfff]">
                      Verified
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[#c8c4d6]/70">
                    Verified technical identity bound to your Nexus contributor profile.
                  </p>
                </div>

                <div className="flex flex-col gap-1.5 rounded-lg bg-[#1c1f28] p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#c8c4d6]">
                      Primary Email
                    </span>
                    <span className="flex items-center gap-1 rounded bg-[#272a32] px-2 py-0.5 font-mono text-[11px] text-[#8e7fff]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#8e7fff]" />
                      Verified
                    </span>
                  </div>
                  <span className="pt-1 text-base font-medium text-[#e0e2ee]">
                    {user?.email || "elena@systems.io"}
                  </span>
                  <div className="mt-auto flex items-center justify-between pt-2">
                    <span className="text-xs text-[#c8c4d6]/70">
                      Routing alerts & system digests
                    </span>
                    <button
                      type="button"
                      className="rounded-lg bg-[#272a32] px-3 py-1.5 text-[11px] font-semibold text-[#e0e2ee] hover:bg-[#32353d]"
                    >
                      Change Email
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 2: PASSWORD & AUTHENTICATION */}
            <section
              id="password-auth"
              className="flex flex-col gap-5 rounded-xl bg-[#181b24] p-6 shadow-sm"
            >
              <div>
                <div className="flex items-center gap-2">
                  <KeyRound size={19} className="text-[#c7bfff]" />
                  <h2 className="text-lg font-semibold text-[#e0e2ee]">
                    Password & Authentication
                  </h2>
                </div>
                <p className="mt-1 text-xs text-[#c8c4d6]">
                  Credentials, multi-factor challenges, and FIDO2 physical authenticators.
                </p>
              </div>

              <div className="overflow-hidden rounded-lg bg-[#1c1f28]">
                <button
                  type="button"
                  onClick={() => setIsPasswordOpen(!isPasswordOpen)}
                  className="flex w-full items-center justify-between p-4 text-left hover:bg-[#272a32]/40"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#272a32] text-[#e0e2ee]">
                      <Lock size={16} />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-[#e0e2ee]">
                        Change Password
                      </div>
                      <div className="text-xs text-[#c8c4d6]">
                        Last updated 42 days ago (Argon2id salted hash)
                      </div>
                    </div>
                  </div>
                  <ChevronDown
                    size={18}
                    className={`text-[#c8c4d6] transition-transform ${
                      isPasswordOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isPasswordOpen && (
                  <form onSubmit={handleUpdatePassword} className="flex flex-col gap-4 p-5 pt-0">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-medium text-[#c8c4d6]">
                          Current Password
                        </label>
                        <input
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="••••••••••••••••"
                          className="w-full rounded-lg bg-[#181b24] px-3.5 py-2 text-sm text-[#e0e2ee] placeholder:text-[#928f9f] focus:outline-none focus:ring-1 focus:ring-[#c7bfff]"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-medium text-[#c8c4d6]">
                          New Password
                        </label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Min. 16 chars"
                          className="w-full rounded-lg bg-[#181b24] px-3.5 py-2 text-sm text-[#e0e2ee] placeholder:text-[#928f9f] focus:outline-none focus:ring-1 focus:ring-[#c7bfff]"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-medium text-[#c8c4d6]">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Min. 16 chars"
                          className="w-full rounded-lg bg-[#181b24] px-3.5 py-2 text-sm text-[#e0e2ee] placeholder:text-[#928f9f] focus:outline-none focus:ring-1 focus:ring-[#c7bfff]"
                        />
                      </div>
                    </div>

                    {pwStatus && (
                      <p className="text-xs text-[#c7bfff]">{pwStatus}</p>
                    )}

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-2 text-[11px] text-[#c8c4d6]/70">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#c7bfff]" />
                        Requires uppercase, lowercase, numbers, and symbols
                      </div>
                      <button
                        type="submit"
                        className="rounded-lg bg-[#8e7fff] px-5 py-2 text-xs font-semibold text-[#24008c] hover:bg-[#c7bfff] hover:text-[#2a059b]"
                      >
                        Update Password
                      </button>
                    </div>
                  </form>
                )}
              </div>

              <div className="flex flex-col justify-between gap-4 rounded-lg bg-[#1c1f28] p-4 md:flex-row md:items-center">
                <div className="flex items-start gap-3.5">
                  <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-lg bg-[#484264] text-[#c7bfff]">
                    <Cpu size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[#e0e2ee]">
                        Hardware 2FA / WebAuthn
                      </span>
                      <span className="flex items-center gap-1 rounded bg-[#272a32] px-2 py-0.5 font-mono text-[11px] text-[#8e7fff]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#8e7fff]" />
                        Active
                      </span>
                    </div>
                    <p className="text-sm text-[#c8c4d6]">
                      YubiKey 5C NFC (Serial: #88219-FIDO2)
                    </p>
                    <p className="text-xs text-[#c8c4d6]/60">
                      Registered on Jan 14, 2024 via Chrome on macOS
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="flex items-center gap-1.5 self-start rounded-lg bg-[#272a32] px-3.5 py-2 text-xs font-medium text-[#e0e2ee] hover:bg-[#32353d] md:self-auto"
                >
                  <Plus size={15} />
                  <span>Add Backup Key</span>
                </button>
              </div>
            </section>

            {/* SECTION 3: CONNECTED DEVELOPER PROFILES */}
            <section
              id="connected-profiles"
              className="flex flex-col gap-5 rounded-xl bg-[#181b24] p-6 shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Share2 size={19} className="text-[#c7bfff]" />
                    <h2 className="text-lg font-semibold text-[#e0e2ee]">
                      Connected Developer Profiles
                    </h2>
                  </div>
                  <span className="text-[11px] font-semibold text-[#c8c4d6]/60">
                    Cryptographic Attestation
                  </span>
                </div>
                <p className="mt-1 text-xs text-[#c8c4d6]">
                  External code repositories and signature rings tied to your contributor index.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex flex-col justify-between gap-4 rounded-lg bg-[#1c1f28] p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#272a32] font-mono text-sm font-bold text-[#e0e2ee]">
                        gh
                      </div>
                      <div>
                        <div className="text-sm font-medium text-[#e0e2ee]">GitHub</div>
                        <div className="font-mono text-xs text-[#c7bfff]">
                          @{user?.username || "elena"}-systems
                        </div>
                      </div>
                    </div>
                    <span className="mt-1.5 h-2 w-2 rounded-full bg-[#8e7fff]" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#c8c4d6]/70">
                      Syncing commits & repositories
                    </span>
                    <button
                      type="button"
                      className="rounded-lg bg-[#272a32] px-3 py-1.5 text-[11px] font-semibold text-[#c8c4d6] hover:bg-[#93000a]/20 hover:text-[#ffb4ab]"
                    >
                      Disconnect
                    </button>
                  </div>
                </div>

                <div className="flex flex-col justify-between gap-4 rounded-lg bg-[#1c1f28] p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#272a32] text-[#e0e2ee]">
                        <Lock size={16} />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-[#e0e2ee]">
                          GPG Signing Key
                        </div>
                        <div className="font-mono text-xs text-[#e0e2ee]">
                          Key ID 0x8F9C31A7... Active
                        </div>
                      </div>
                    </div>
                    <span className="rounded bg-[#272a32] px-2 py-0.5 font-mono text-[10px] text-[#c7bfff]">
                      4096R
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#c8c4d6]/70">
                      Used for verifiable code patch proofs
                    </span>
                    <button
                      type="button"
                      className="rounded-lg bg-[#272a32] px-3 py-1.5 text-[11px] font-semibold text-[#e0e2ee] hover:bg-[#32353d]"
                    >
                      Replace Key
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 4: PRIVACY & DATA */}
            <section
              id="privacy-data"
              className="flex flex-col gap-5 rounded-xl bg-[#181b24] p-6 shadow-sm"
            >
              <div>
                <div className="flex items-center gap-2">
                  <Eye size={19} className="text-[#c7bfff]" />
                  <h2 className="text-lg font-semibold text-[#e0e2ee]">
                    Privacy & Data
                  </h2>
                </div>
                <p className="mt-1 text-xs text-[#c8c4d6]">
                  Control the visibility of your identity graph and public developer activity footprint.
                </p>
              </div>

              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between gap-4 rounded-lg bg-[#1c1f28] p-4">
                  <div>
                    <div className="text-sm font-medium text-[#e0e2ee]">
                      Public Profile Visibility
                    </div>
                    <div className="text-xs text-[#c8c4d6]">
                      Allow unauthenticated visitors and external web crawlers to read your posts and public bio.
                    </div>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={publicProfile}
                    onClick={() => setPublicProfile(!publicProfile)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors ${
                      publicProfile ? "bg-[#8e7fff]" : "bg-[#272a32]"
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full transition ${
                        publicProfile
                          ? "translate-x-5 bg-[#24008c]"
                          : "translate-x-0 bg-[#928f9f]"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between gap-4 rounded-lg bg-[#1c1f28] p-4">
                  <div>
                    <div className="text-sm font-medium text-[#e0e2ee]">
                      Show contribution heatmap on public profile
                    </div>
                    <div className="text-xs text-[#c8c4d6]">
                      Renders aggregated review cycles, technical discussions, and merged PR stats on your card.
                    </div>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={showHeatmap}
                    onClick={() => setShowHeatmap(!showHeatmap)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors ${
                      showHeatmap ? "bg-[#8e7fff]" : "bg-[#272a32]"
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full transition ${
                        showHeatmap
                          ? "translate-x-5 bg-[#24008c]"
                          : "translate-x-0 bg-[#928f9f]"
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2.5 rounded-lg bg-[#1c1f28] p-4">
                <div className="flex items-center justify-between text-[11px] font-semibold text-[#c8c4d6]">
                  <span>Public Activity Matrix Preview (Last 16 Weeks)</span>
                  <span className="font-mono text-[#c7bfff]">1,248 contributions</span>
                </div>
                <div className="overflow-x-auto pb-1">
                  <div className="grid min-w-[500px] grid-flow-col grid-rows-4 gap-1.5">
                    {HEATMAP_LEVELS.map((lvl, idx) => (
                      <div
                        key={idx}
                        className={`h-3 w-3 rounded-sm ${
                          lvl === 0
                            ? "bg-[#272a32]"
                            : lvl === 1
                              ? "bg-[#c7bfff]/30"
                              : lvl === 2
                                ? "bg-[#c7bfff]/70"
                                : "bg-[#c7bfff]"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 5: ACTIVE SESSIONS */}
            <section
              id="active-sessions"
              className="flex flex-col gap-5 rounded-xl bg-[#181b24] p-6 shadow-sm"
            >
              <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <Monitor size={19} className="text-[#c7bfff]" />
                    <h2 className="text-lg font-semibold text-[#e0e2ee]">
                      Active Sessions
                    </h2>
                  </div>
                  <p className="mt-1 text-xs text-[#c8c4d6]">
                    Devices and API clients holding active session tokens for this identity.
                  </p>
                </div>
                <button
                  type="button"
                  className="flex items-center gap-1.5 self-start rounded-lg bg-[#272a32] px-3.5 py-2 text-xs font-medium text-[#e0e2ee] hover:bg-[#32353d] md:self-auto"
                >
                  <LogOut size={15} />
                  <span>Revoke all other sessions</span>
                </button>
              </div>

              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between gap-4 rounded-lg bg-[#1c1f28] p-4">
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#272a32] text-[#c7bfff]">
                      <Laptop size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-[#e0e2ee]">
                          macOS Chrome 124
                        </span>
                        <span className="flex items-center gap-1 rounded bg-[#272a32] px-2 py-0.5 font-mono text-[10px] text-[#8e7fff]">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#8e7fff]" />
                          Active now
                        </span>
                      </div>
                      <span className="text-xs text-[#c8c4d6]">
                        Zurich, Switzerland — IP: 185.142.xx.xx
                      </span>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-medium text-[#c7bfff]">
                    This Device
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4 rounded-lg bg-[#1c1f28] p-4">
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#272a32] text-[#c8c4d6]">
                      <Terminal size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-[#e0e2ee]">
                          Linux workstation (Arch / Wayland)
                        </span>
                        <span className="font-mono text-xs text-[#c8c4d6]/60">
                          2 days ago
                        </span>
                      </div>
                      <span className="text-xs text-[#c8c4d6]">
                        Zurich, Switzerland — IP: 194.230.xx.xx
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    title="Terminate Session"
                    className="rounded-lg p-1.5 text-[#c8c4d6] hover:bg-[#272a32] hover:text-[#ffb4ab]"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            </section>

            {/* SECTION 6: DANGER ZONE */}
            <section className="relative flex flex-col gap-5 overflow-hidden rounded-xl bg-[#181b24] p-6 shadow-sm">
              <div className="pointer-events-none absolute right-0 top-0 h-48 w-48 rounded-full bg-[#93000a]/10 blur-2xl" />
              <div>
                <div className="flex items-center gap-2 text-[#ffb4ab]">
                  <AlertTriangle size={19} />
                  <h2 className="text-lg font-semibold">Danger Zone</h2>
                </div>
                <p className="mt-1 text-xs text-[#c8c4d6]">
                  Destructive operations that irreversibly purge cryptographic ledger records and author profiles.
                </p>
              </div>

              <div className="flex flex-col justify-between gap-5 rounded-lg bg-[#1c1f28] p-5 md:flex-row md:items-center">
                <div className="max-w-xl">
                  <h3 className="text-base font-semibold text-[#e0e2ee]">
                    Delete Account & Revoke Identifiers
                  </h3>
                  <p className="mt-1 text-xs text-[#c8c4d6]">
                    Permanently delete your account, published technical posts, and revoke all assigned reputation tokens. This operation is cryptographic, immediate, and completely irreversible.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  className="flex items-center gap-2 self-start whitespace-nowrap rounded-lg bg-[#93000a] px-4 py-2.5 text-xs font-semibold text-[#ffdad6] hover:bg-[#ffb4ab] hover:text-[#690005] md:self-auto"
                >
                  <Trash2 size={15} />
                  <span>Delete Account</span>
                </button>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}