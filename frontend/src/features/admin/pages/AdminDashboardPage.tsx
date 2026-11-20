import { Link } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  Gauge,
  MessageSquare,
  Shield,
  Users,
} from "lucide-react";

const unavailableSections = [
  {
    title: "Platform Users",
    description: "User lists, status changes, and moderation actions require admin APIs.",
    icon: Users,
  },
  {
    title: "Platform Analytics",
    description: "Registration, post, comment, and activity metrics are not available yet.",
    icon: Gauge,
  },
  {
    title: "Communities and Reports",
    description: "Community moderation and report queues require backend endpoints.",
    icon: MessageSquare,
  },
  {
    title: "Audit Logs",
    description: "Audit log export is unavailable until an admin audit API is implemented.",
    icon: FileText,
  },
];

export default function AdminDashboardPage() {
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
            ADMIN
          </span>
        </div>
        <Link
          to="/profile"
          className="rounded-lg bg-[#1c1f28] px-3.5 py-1.5 text-xs font-medium text-[#e0e2ee] hover:bg-[#272a32]"
        >
          User Dashboard
        </Link>
      </header>

      <main className="mx-auto flex w-full max-w-[1600px] flex-col gap-8 p-6 lg:p-8">
        <section className="relative overflow-hidden rounded-xl bg-[#181b24] p-6 lg:p-8">
          <div className="pointer-events-none absolute -right-16 -top-16 h-80 w-80 rounded-full bg-[#c7bfff]/5 blur-3xl" />
          <div className="relative">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-3xl font-semibold tracking-tight">Super Admin Console</h1>
              <span className="flex items-center gap-1.5 rounded-full bg-[#1c1f28] px-2.5 py-1 text-[11px] font-medium text-[#c8c4d6]">
                <span className="h-2 w-2 rounded-full bg-[#e9b45b]" />
                Data unavailable
              </span>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-[#c8c4d6]">
              <Shield size={14} className="text-[#c7bfff]" />
              <span>Access is enforced by the backend super_admin role.</span>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {unavailableSections.map(({ title, description, icon: Icon }) => (
            <div key={title} className="flex min-h-44 flex-col rounded-xl bg-[#181b24] p-6">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#272a32] text-[#c7bfff]">
                <Icon size={16} />
              </div>
              <h2 className="mt-5 text-sm font-semibold">{title}</h2>
              <p className="mt-2 text-xs leading-relaxed text-[#928f9f]">{description}</p>
            </div>
          ))}
        </section>

        <section className="rounded-xl bg-[#181b24] p-6 lg:p-8">
          <h2 className="text-xl font-semibold tracking-tight">Not implemented yet</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#c8c4d6]">
            The backend currently exposes authentication endpoints only. No fabricated
            users, analytics, reports, moderation results, or audit events are shown here.
            Add protected admin routes before populating this dashboard.
          </p>
        </section>
      </main>
    </div>
  );
}
