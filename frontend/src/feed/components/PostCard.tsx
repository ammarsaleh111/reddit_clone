import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Bookmark,
  Check,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Share2,
  Terminal,
} from "lucide-react";
import type { FeedPost, VoteValue } from "../types/feed.types";

interface PostCardProps {
  post: FeedPost;
  isJoined: boolean;
  compactView?: boolean;
  onVote: (postId: string, nextVote: VoteValue) => void;
  onToggleJoin: (communityId: string) => void;
  onSelectCommunity: (normalizedName: string) => void;
  onOpenPost?: (postId: string) => void;
}

export function PostCard({
  post,
  isJoined,
  compactView = false,
  onVote,
  onToggleJoin,
  onSelectCommunity,
  onOpenPost,
}: PostCardProps) {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(Boolean(post.isSaved));

  const formattedDate = new Date(post.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  function handleVoteClick(direction: 1 | -1) {
    const nextVote: VoteValue = post.userVote === direction ? 0 : direction;
    onVote(post._id, nextVote);
  }

  async function handleShare() {
    const url = `${window.location.origin}/post/${post._id}`;
    await navigator.clipboard?.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  const domain =
    post.linkDomain ||
    (post.url ? post.url.replace(/^https?:\/\/(www\.)?/, "").split("/")[0] : "");

  return (
    <article className="nexus-card" style={{ padding: "1.25rem" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "0.75rem",
          marginBottom: "0.75rem",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            flexWrap: "wrap",
            fontSize: "0.75rem",
            color: "var(--color-content-subdued)",
          }}
        >
          <button
            type="button"
            onClick={() => onSelectCommunity(post.community.normalizedName)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
              padding: "0.2rem 0.55rem",
              border: "none",
              borderRadius: "0.375rem",
              background: "var(--color-accent-subdued)",
              color: "var(--color-accent-hover)",
              fontSize: "0.75rem",
              fontWeight: 500,
            }}
          >
            <Terminal size={12} />
            <span>c/{post.community.name}</span>
          </button>

          <span>•</span>

          <Link
            to={`/u/${post.author.username}`}
            style={{
              color: "var(--color-content-muted)",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            u/{post.author.username}
          </Link>

          <span>•</span>
          <time>{formattedDate}</time>

          {post.tag && (
            <span
              style={{
                padding: "0.15rem 0.45rem",
                borderRadius: "0.25rem",
                background: "var(--color-surface-raised)",
                color: "var(--color-accent)",
              }}
            >
              {post.tag}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => onToggleJoin(post.community._id)}
          style={{
            padding: "0.3rem 0.7rem",
            borderRadius: "0.375rem",
            border: "1px solid var(--color-border)",
            background: isJoined
              ? "var(--color-accent-subdued)"
              : "var(--color-surface-raised)",
            color: isJoined
              ? "var(--color-accent-hover)"
              : "var(--color-content-muted)",
            fontSize: "0.75rem",
            fontWeight: 600,
          }}
        >
          {isJoined ? "Joined" : "Join"}
        </button>
      </div>

      {/* Title & Body */}
      <Link
        to={`/post/${post._id}`}
        state={{ post }}
        onClick={() => onOpenPost?.(post._id)}
        style={{
          display: "block",
          textDecoration: "none",
          color: "inherit",
          marginBottom: "0.875rem",
        }}
      >
        <h2
          style={{
            margin: "0 0 0.4rem",
            fontSize: "1.125rem",
            fontWeight: 600,
            lineHeight: 1.35,
            color: "var(--color-content)",
          }}
        >
          {post.title}
        </h2>

        {!compactView && post.type === "text" && post.body && (
          <p className="nexus-body" style={{ margin: 0 }}>
            {post.body}
          </p>
        )}
      </Link>

      {/* External Link Preview */}
      {post.type === "link" && post.url && (
        <a
          href={post.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "0.75rem",
            padding: "0.75rem 1rem",
            marginBottom: "0.875rem",
            borderRadius: "0.75rem",
            border: "1px solid var(--color-border)",
            background: "var(--color-canvas)",
            textDecoration: "none",
          }}
        >
          <div style={{ minWidth: 0 }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.25rem",
                color: "var(--color-accent)",
                fontSize: "0.75rem",
                fontWeight: 600,
              }}
            >
              {domain} <ArrowUpRight size={13} />
            </span>
            <div
              style={{
                marginTop: "0.2rem",
                fontSize: "0.8125rem",
                color: "var(--color-content-muted)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {post.url}
            </div>
          </div>
        </a>
      )}

      {/* Action Footer */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "0.75rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              borderRadius: "0.5rem",
              border: "1px solid var(--color-border)",
              background:
                post.userVote === 1
                  ? "var(--color-accent-subdued)"
                  : "var(--color-surface-raised)",
            }}
          >
            <button
              type="button"
              onClick={() => handleVoteClick(1)}
              aria-label="Upvote"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.25rem",
                padding: "0.35rem 0.6rem",
                border: "none",
                background: "transparent",
                color:
                  post.userVote === 1
                    ? "var(--color-accent-hover)"
                    : "var(--color-content)",
                fontSize: "0.75rem",
                fontWeight: 600,
              }}
            >
              <ChevronUp size={15} />
              <span>{post.score.toLocaleString()}</span>
            </button>
            <button
              type="button"
              onClick={() => handleVoteClick(-1)}
              aria-label="Downvote"
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "0.35rem 0.45rem",
                border: "none",
                background: "transparent",
                color:
                  post.userVote === -1
                    ? "var(--color-danger)"
                    : "var(--color-content-muted)",
              }}
            >
              <ChevronDown size={15} />
            </button>
          </div>

          <Link
            to={`/post/${post._id}`}
            state={{ post }}
            onClick={() => onOpenPost?.(post._id)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              padding: "0.4rem 0.7rem",
              borderRadius: "0.5rem",
              border: "1px solid var(--color-border)",
              background: "var(--color-surface-raised)",
              color: "var(--color-content-muted)",
              fontSize: "0.75rem",
              textDecoration: "none",
            }}
          >
            <MessageSquare size={14} />
            <span>{post.commentsCount} comments</span>
          </Link>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
          <button
            type="button"
            onClick={handleShare}
            title="Share discussion"
            style={{
              padding: "0.4rem",
              border: "none",
              borderRadius: "0.5rem",
              background: "transparent",
              color: copied ? "var(--color-success)" : "var(--color-content-muted)",
            }}
          >
            {copied ? <Check size={15} /> : <Share2 size={15} />}
          </button>
          <button
            type="button"
            onClick={() => setSaved((prev) => !prev)}
            title="Bookmark"
            style={{
              padding: "0.4rem",
              border: "none",
              borderRadius: "0.5rem",
              background: "transparent",
              color: saved ? "var(--color-accent)" : "var(--color-content-muted)",
            }}
          >
            <Bookmark size={15} />
          </button>
        </div>
      </div>
    </article>
  );
}