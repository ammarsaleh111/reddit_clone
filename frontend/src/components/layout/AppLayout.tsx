import { useState, type ReactNode } from "react";
import { Menu } from "lucide-react";
import type {
  FeedCommunity,
  FeedMode,
} from "../../feed/types/feed.types";
import { LeftSidebar } from "./LeftSidebar";
import { Navbar } from "./Navbar";
import { RightSidebar } from "./RightSidebar";

interface AppLayoutProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  activeMode: FeedMode;
  selectedCommunity: string | null;
  communities: FeedCommunity[];
  joinedIds: Record<string, boolean>;
  postCount: number;
  onSelectMode: (mode: FeedMode) => void;
  onSelectCommunity: (normalizedName: string | null) => void;
  onToggleJoin: (communityId: string) => void;
  children: ReactNode;
}

export function AppLayout({
  searchQuery,
  onSearchChange,
  activeMode,
  selectedCommunity,
  communities,
  joinedIds,
  postCount,
  onSelectMode,
  onSelectCommunity,
  onToggleJoin,
  children,
}: AppLayoutProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="nexus-shell">
      {mobileNavOpen && (
        <div
          onClick={() => setMobileNavOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 80,
            background: "rgba(0, 0, 0, 0.6)",
          }}
        />
      )}

      <div className={mobileNavOpen ? "nexus-sidebar is-open" : "nexus-sidebar"}>
        <LeftSidebar
          activeMode={activeMode}
          selectedCommunity={selectedCommunity}
          communities={communities}
          onSelectMode={(mode) => {
            onSelectCommunity(null);
            onSelectMode(mode);
            setMobileNavOpen(false);
          }}
          onSelectCommunity={(name) => {
            onSelectCommunity(name);
            setMobileNavOpen(false);
          }}
        />
      </div>

      <main className="nexus-main">
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <button
            type="button"
            aria-label="Open navigation menu"
            className="nexus-mobile-menu-btn"
            onClick={() => setMobileNavOpen((prev) => !prev)}
            style={{
              alignItems: "center",
              justifyContent: "center",
              padding: "0.55rem",
              borderRadius: "0.5rem",
              border: "1px solid var(--color-border)",
              background: "var(--color-surface)",
              color: "var(--color-content)",
            }}
          >
            <Menu size={18} />
          </button>

          <div style={{ flex: 1, minWidth: 0 }}>
            <Navbar
              searchQuery={searchQuery}
              onSearchChange={onSearchChange}
            />
          </div>
        </div>

        <div style={{ display: "grid", gap: "1rem" }}>{children}</div>
      </main>

      <RightSidebar
        communities={communities}
        joinedIds={joinedIds}
        postCount={postCount}
        onToggleJoin={onToggleJoin}
        onSelectCommunity={(name) => onSelectCommunity(name)}
      />
    </div>
  );
}