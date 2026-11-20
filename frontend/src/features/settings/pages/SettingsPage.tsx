import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BadgeCheck,
  Eye,
  KeyRound,
  Lock,
  LogOut,
  Save,
  Shield,
  User,
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { getApiErrorMessage } from "../../../services/authservices";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [logoutError, setLogoutError] = useState<string | null>(null);

  async function handleLogout() {
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (error) {
      setLogoutError(getApiErrorMessage(error, "Unable to sign out. Please try again."));
    }
  }

  return (
    <div className="min-h-screen bg-[#0b0e16] text-[#e0e2ee] antialiased">
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-[#474554]/30 bg-[#10131b]/85 px-6 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <Link
            to="/profile"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#474554]/40 bg-[#181b24] text-[#c8c4d6] hover:border-[#c7bfff]"
          >
            <ArrowLeft size={16} />
          </Link>
          <span className="text-base font-semibold tracking-tight">Nexus</span>
          <span className="rounded bg-[#484264] px-1.5 py-0.5 text-[10px] font-semibold text-[#b8b0d8]">
            SETTINGS
          </span>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-lg bg-[#1c1f28] px-3.5 py-1.5 text-xs text-[#c8c4d6] hover:text-[#ffb4ab]"
        >
          <LogOut size={14} /> Sign out
        </button>
      </header>
      {logoutError && (
        <p role="alert" className="mx-auto max-w-[1240px] px-4 pt-4 text-xs text-[#ffb4ab] lg:px-8">
          {logoutError}
        </p>
      )}

      <main className="mx-auto max-w-[1240px] px-4 py-8 lg:px-8">
        <div className="mb-8">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#c8c4d6]">
            Nexus / Settings
          </div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Profile & Security Parameters
          </h1>
          <p className="mt-2 text-sm text-[#c8c4d6]">
            Your account data is read from the authenticated backend session.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <nav className="flex flex-col gap-1 rounded-xl bg-[#181b24] p-1.5 lg:sticky lg:top-20 lg:col-span-3 lg:self-start">
            {[
              ["#public-profile", "Public Profile", User],
              ["#account-info", "Account Info", BadgeCheck],
              ["#password-auth", "Account & Security", Shield],
              ["#privacy-data", "Preferences & Reading", Eye],
            ].map(([href, label, Icon]) => {
              const SectionIcon = Icon as typeof User;
              return (
                <a
                  key={href as string}
                  href={href as string}
                  className="flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium text-[#c8c4d6] hover:bg-[#272a32] hover:text-[#e0e2ee]"
                >
                  <SectionIcon size={16} /> {label as string}
                </a>
              );
            })}
          </nav>

          <div className="flex flex-col gap-8 lg:col-span-9">
            <section id="public-profile" className="rounded-xl bg-[#181b24] p-6">
              <div className="flex items-center gap-2">
                <User size={19} className="text-[#c7bfff]" />
                <h2 className="text-lg font-semibold">Public Profile Identity</h2>
              </div>
              <p className="mt-1 text-xs text-[#c8c4d6]">
                Profile editing will be enabled when the backend profile update endpoint exists.
              </p>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <label className="text-xs text-[#c8c4d6]">
                  Username
                  <input
                    value={user?.username ?? ""}
                    readOnly
                    className="mt-2 w-full rounded-lg bg-[#1c1f28] px-3.5 py-2.5 font-mono text-sm text-[#e0e2ee] outline-none"
                  />
                </label>
                <label className="text-xs text-[#c8c4d6]">
                  Bio
                  <textarea
                    value={user?.bio ?? ""}
                    readOnly
                    rows={2}
                    className="mt-2 w-full resize-none rounded-lg bg-[#1c1f28] px-3.5 py-2.5 text-sm text-[#e0e2ee] outline-none"
                  />
                </label>
              </div>
              <button
                type="button"
                disabled
                className="mt-5 flex items-center gap-2 rounded-lg bg-[#272a32] px-4 py-2 text-xs font-semibold text-[#928f9f]"
              >
                <Save size={14} /> Save Profile Changes (API unavailable)
              </button>
            </section>

            <section id="account-info" className="rounded-xl bg-[#181b24] p-6">
              <div className="flex items-center gap-2">
                <BadgeCheck size={19} className="text-[#c7bfff]" />
                <h2 className="text-lg font-semibold">Account Information</h2>
              </div>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="rounded-lg bg-[#1c1f28] p-4">
                  <p className="text-[11px] uppercase tracking-wider text-[#c8c4d6]">Email</p>
                  <p className="mt-2 text-sm text-[#e0e2ee]">{user?.email}</p>
                </div>
                <div className="rounded-lg bg-[#1c1f28] p-4">
                  <p className="text-[11px] uppercase tracking-wider text-[#c8c4d6]">Role</p>
                  <p className="mt-2 font-mono text-sm text-[#c7bfff]">{user?.role}</p>
                </div>
              </div>
            </section>

            <section id="password-auth" className="rounded-xl bg-[#181b24] p-6">
              <div className="flex items-center gap-2">
                <KeyRound size={19} className="text-[#c7bfff]" />
                <h2 className="text-lg font-semibold">Password & Authentication</h2>
              </div>
              <p className="mt-2 text-sm text-[#c8c4d6]">
                Password and session management endpoints are not implemented yet.
              </p>
              <button
                type="button"
                disabled
                className="mt-5 flex items-center gap-2 rounded-lg bg-[#272a32] px-4 py-2 text-xs font-semibold text-[#928f9f]"
              >
                <Lock size={14} /> Change Password (Unavailable)
              </button>
            </section>

            <section id="privacy-data" className="rounded-xl bg-[#181b24] p-6">
              <div className="flex items-center gap-2">
                <Eye size={19} className="text-[#c7bfff]" />
                <h2 className="text-lg font-semibold">Privacy & Data</h2>
              </div>
              <p className="mt-2 text-sm text-[#c8c4d6]">
                Privacy preferences and activity data APIs are not implemented yet.
              </p>
              <div className="mt-5 rounded-lg bg-[#1c1f28] p-4 text-xs text-[#928f9f]">
                No preference changes are being saved locally or presented as persistent.
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
