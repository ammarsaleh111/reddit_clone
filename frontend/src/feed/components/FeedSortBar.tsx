import { Clock, Flame, History, LayoutList } from "lucide-react";
import type { FeedMode, FeedSort } from "../types/feed.types";

interface FeedSortBarProps {
  title: string;
  subtitle: string;
  mode: FeedMode;
  sort: FeedSort;
  compactView: boolean;
  onModeChange: (mode: FeedMode) => void;
  onSortChange: (sort: FeedSort) => void;
  onToggleCompact: () => void;
}

const SORT_OPTIONS: { id: FeedSort; label: string; icon: typeof Flame }[] = [
  { id: "popular", label: "Popular", icon: Flame },
  { id: "latest", label: "Latest", icon: Clock },
  { id: "oldest", label: "Oldest", icon: History },
];

export function FeedSortBar({
  title,
  subtitle,
  mode,
  sort,
  compactView,
  onModeChange,
  onSortChange,
  onToggleCompact,
}: FeedSortBarProps) {
  return (
    <section className="nexus-card" style={{ padding: "1.25rem 1.5rem" }}>
      <div className="nexus-label" style={{ color: "var(--color-accent)" }}>
        ● Live Pulse
      </div>
      <h1 className="nexus-title" style={{ margin: "0.35rem 0 0" }}>
        {title}
      </h1>
      <p className="nexus-body" style={{ margin: "0.25rem 0 1rem" }}>
        {subtitle}
      </p>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
          flexWrap: "wrap",
          paddingTop: "0.875rem",
          borderTop: "1px solid var(--color-border)",
        }}
      >
        {/* Feed Mode Tabs */}
        <nav aria-label="Feed Sources" style={{ display: "flex", gap: "1.25rem" }}>
          {(["for-you", "following"] as FeedMode[]).map((tab) => {
            const active = mode === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => onModeChange(tab)}
                style={{
                  padding: "0.25rem 0 0.5rem",
                  border: "none",
                  borderBottom: active
                    ? "2px solid var(--color-accent)"
                    : "2px solid transparent",
                  background: "transparent",
                  color: active
                    ? "var(--color-accent-hover)"
                    : "var(--color-content-muted)",
                  fontSize: "0.875rem",
                  fontWeight: active ? 600 : 500,
                }}
              >
                {tab === "for-you" ? "For You" : "Following"}
              </button>
            );
          })}
        </nav>

        {/* Sort Pills */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.25rem",
            padding: "0.25rem",
            borderRadius: "0.5rem",
            background: "var(--color-canvas)",
            border: "1px solid var(--color-border)",
          }}
        >
          {SORT_OPTIONS.map(({ id, label, icon: Icon }) => {
            const active = sort === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onSortChange(id)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  padding: "0.35rem 0.65rem",
                  border: "none",
                  borderRadius: "0.375rem",
                  background: active
                    ? "var(--color-accent-subdued)"
                    : "transparent",
                  color: active
                    ? "var(--color-accent-hover)"
                    : "var(--color-content-muted)",
                  fontSize: "0.75rem",
                  fontWeight: active ? 600 : 500,
                }}
              >
                <Icon size={13} />
                <span>{label}</span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={onToggleCompact}
            title="Toggle compact view"
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "0.35rem 0.5rem",
              border: "none",
              borderRadius: "0.375rem",
              background: compactView
                ? "var(--color-accent-subdued)"
                : "transparent",
              color: compactView
                ? "var(--color-accent-hover)"
                : "var(--color-content-muted)",
            }}
          >
            <LayoutList size={14} />
          </button>
        </div>
      </div>
    </section>
  );
}