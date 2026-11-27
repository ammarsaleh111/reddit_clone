import type { ReactNode } from "react";
import type {
  FeedCommunity,
  FeedMode,
} from "../../feed/types/feed.types";
import { LeftSidebar } from "./LeftSidebar";
import { Navbar } from "./Navbar";
import { RightSidebar } from "../../feed/components/RightSidebar";

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
  onOpenCreatePost?: () => void;
  onOpenCreateCommunity?: () => void;
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
  onOpenCreatePost,
  onOpenCreateCommunity,
  children,
}: AppLayoutProps) {
  return (
    <div className="nexus-shell">
      <LeftSidebar
        activeMode={activeMode}
        selectedCommunity={selectedCommunity}
        communities={communities}
        onSelectMode={(mode) => {
          onSelectCommunity(null);
          onSelectMode(mode);
        }}
        onSelectCommunity={(name) => onSelectCommunity(name)}
        onOpenCreateCommunity={onOpenCreateCommunity}
      />

      <main className="nexus-main">
        <Navbar
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          onOpenCreatePost={onOpenCreatePost}
        />
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