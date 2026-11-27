import { useState } from "react";
import { RotateCcw } from "lucide-react";
import type {
  FeedMode,
  FeedPost,
  FeedSort,
  VoteValue,
} from "../types/feed.types";
import { FeedSortBar } from "./FeedSortBar";
import { PostCard } from "./PostCard";

interface FeedProps {
  title: string;
  subtitle: string;
  mode: FeedMode;
  sort: FeedSort;
  posts: FeedPost[];
  joinedIds: Record<string, boolean>;
  isLoading: boolean;
  apiUnavailable: boolean;
  errorMessage: string | null;
  hasActiveFilters: boolean;
  onModeChange: (mode: FeedMode) => void;
  onSortChange: (sort: FeedSort) => void;
  onVote: (postId: string, nextVote: VoteValue) => void;
  onToggleJoin: (communityId: string) => void;
  onSelectCommunity: (normalizedName: string) => void;
  onResetFilters: () => void;
  onOpenPost?: (postId: string) => void;
}

export function Feed({
  title,
  subtitle,
  mode,
  sort,
  posts,
  joinedIds,
  isLoading,
  apiUnavailable,
  errorMessage,
  hasActiveFilters,
  onModeChange,
  onSortChange,
  onVote,
  onToggleJoin,
  onSelectCommunity,
  onResetFilters,
  onOpenPost,
}: FeedProps) {
  const [compactView, setCompactView] = useState(false);

  return (
    <>
      <FeedSortBar
        title={title}
        subtitle={subtitle}
        mode={mode}
        sort={sort}
        compactView={compactView}
        onModeChange={onModeChange}
        onSortChange={onSortChange}
        onToggleCompact={() => setCompactView((prev) => !prev)}
      />

      {hasActiveFilters && (
        <div
          className="nexus-card"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0.65rem 1rem",
            fontSize: "0.75rem",
            color: "var(--color-content-muted)",
          }}
        >
          <span>Showing filtered stream results</span>
          <button
            type="button"
            onClick={onResetFilters}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.3rem",
              border: "none",
              background: "transparent",
              color: "var(--color-accent)",
              fontWeight: 600,
            }}
          >
            <RotateCcw size={12} /> Reset filters
          </button>
        </div>
      )}

      {isLoading ? (
        <div
          className="nexus-card"
          style={{ padding: "2rem", textAlign: "center", color: "var(--color-content-muted)" }}
        >
          Loading discussion stream...
        </div>
      ) : errorMessage ? (
        <div
          role="alert"
          className="nexus-card"
          style={{
            padding: "1.5rem",
            borderColor: "var(--color-danger)",
            color: "var(--color-danger)",
            textAlign: "center",
            fontSize: "0.875rem",
          }}
        >
          {errorMessage}
        </div>
      ) : posts.length === 0 ? (
        <div
          className="nexus-card"
          style={{ padding: "2.5rem 1.5rem", textAlign: "center" }}
        >
          <p style={{ margin: 0, fontWeight: 600 }}>
            No discussions in this stream yet
          </p>
          <p className="nexus-body" style={{ margin: "0.4rem 0 0", fontSize: "0.8125rem" }}>
            {apiUnavailable
              ? "Waiting for GET /api/posts to be mounted on the backend."
              : "No posts matched the active filter."}
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "1rem" }}>
          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              isJoined={Boolean(
                joinedIds[post.community._id] ?? post.community.isMember
              )}
              compactView={compactView}
              onVote={onVote}
              onToggleJoin={onToggleJoin}
              onSelectCommunity={onSelectCommunity}
              onOpenPost={onOpenPost}
            />
          ))}
        </div>
      )}
    </>
  );
}