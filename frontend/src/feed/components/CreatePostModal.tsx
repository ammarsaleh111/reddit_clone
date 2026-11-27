import { useState, type CSSProperties, type FormEvent } from "react";
import { FileText, Link2, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getApiErrorMessage } from "../../services/authservices";
import { createPost } from "../services/feedService";
import type { FeedCommunity, FeedPost } from "../types/feed.types";

interface CreatePostModalProps {
  isOpen: boolean;
  communities: FeedCommunity[];
  defaultCommunity?: string | null;
  onClose: () => void;
  onPostCreated: (post: FeedPost) => void;
}

export function CreatePostModal({
  isOpen,
  communities,
  defaultCommunity,
  onClose,
  onPostCreated,
}: CreatePostModalProps) {
  const { user } = useAuth();

  const [type, setType] = useState<"text" | "link">("text");
  const [communityInput, setCommunityInput] = useState(
    defaultCommunity || communities[0]?.name || "programming"
  );
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [url, setUrl] = useState("");
  const [tag, setTag] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const inputStyle: CSSProperties = {
    width: "100%",
    padding: "0.625rem 0.75rem",
    borderRadius: "0.5rem",
    border: "1px solid var(--color-border)",
    background: "var(--color-canvas)",
    color: "var(--color-content)",
    fontSize: "0.875rem",
  };

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return;
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    if (type === "link" && !url.trim()) {
      setError("URL is required for link posts.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const cleanCommName = communityInput.replace(/^c\//i, "").trim() || "general";
    const matchedComm = communities.find(
      (c) =>
        c.name.toLowerCase() === cleanCommName.toLowerCase() ||
        c.normalizedName === cleanCommName.toLowerCase()
    );

    try {
      const created = await createPost({
        communityId: matchedComm?._id ?? "",
        communityName: matchedComm?.name ?? cleanCommName,
        title: title.trim(),
        type,
        body: body.trim(),
        url: url.trim(),
        tag: tag.trim(),
        author: {
          _id: user.id,
          username: user.username,
          avatar: user.avatar ?? null,
        },
      });

      onPostCreated(created);
      setTitle("");
      setBody("");
      setUrl("");
      setTag("");
      onClose();
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to create post."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-post-title"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        background: "rgba(11, 13, 18, 0.8)",
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        className="nexus-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "34rem",
          padding: "1.5rem",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "1.25rem",
          }}
        >
          <h2 id="create-post-title" style={{ margin: 0, fontSize: "1.125rem", fontWeight: 600 }}>
            Create Post
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            style={{
              border: "none",
              background: "transparent",
              color: "var(--color-content-muted)",
              padding: "0.25rem",
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
          <button
            type="button"
            onClick={() => setType("text")}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.4rem",
              padding: "0.5rem",
              borderRadius: "0.5rem",
              border: "1px solid var(--color-border)",
              background:
                type === "text" ? "var(--color-accent-subdued)" : "var(--color-canvas)",
              color:
                type === "text" ? "var(--color-accent-hover)" : "var(--color-content-muted)",
              fontSize: "0.8125rem",
              fontWeight: 600,
            }}
          >
            <FileText size={15} /> Text Post
          </button>
          <button
            type="button"
            onClick={() => setType("link")}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.4rem",
              padding: "0.5rem",
              borderRadius: "0.5rem",
              border: "1px solid var(--color-border)",
              background:
                type === "link" ? "var(--color-accent-subdued)" : "var(--color-canvas)",
              color:
                type === "link" ? "var(--color-accent-hover)" : "var(--color-content-muted)",
              fontSize: "0.8125rem",
              fontWeight: 600,
            }}
          >
            <Link2 size={15} /> Link Post
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "0.875rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <div>
              <label className="nexus-label" style={{ display: "block", marginBottom: "0.35rem" }}>
                Community
              </label>
              {communities.length > 0 ? (
                <select
                  value={communityInput}
                  onChange={(e) => setCommunityInput(e.target.value)}
                  style={inputStyle}
                >
                  {communities.map((c) => (
                    <option key={c._id} value={c.name}>
                      c/{c.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={communityInput}
                  onChange={(e) => setCommunityInput(e.target.value)}
                  placeholder="programming"
                  style={inputStyle}
                />
              )}
            </div>

            <div>
              <label className="nexus-label" style={{ display: "block", marginBottom: "0.35rem" }}>
                Tag (Optional)
              </label>
              <input
                type="text"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                placeholder="Systems, Discussion..."
                style={inputStyle}
              />
            </div>
          </div>

          <div>
            <label className="nexus-label" style={{ display: "block", marginBottom: "0.35rem" }}>
              Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Write a clear, descriptive headline..."
              style={inputStyle}
            />
          </div>

          {type === "text" ? (
            <div>
              <label className="nexus-label" style={{ display: "block", marginBottom: "0.35rem" }}>
                Body
              </label>
              <textarea
                rows={4}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Share details, benchmarks, or context..."
                style={{ ...inputStyle, resize: "vertical" }}
              />
            </div>
          ) : (
            <div>
              <label className="nexus-label" style={{ display: "block", marginBottom: "0.35rem" }}>
                URL
              </label>
              <input
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
                style={inputStyle}
              />
            </div>
          )}

          {error && (
            <div style={{ color: "var(--color-danger)", fontSize: "0.8125rem" }}>
              {error}
            </div>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "0.625rem",
              marginTop: "0.5rem",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "0.5rem",
                border: "1px solid var(--color-border)",
                background: "transparent",
                color: "var(--color-content-muted)",
                fontSize: "0.8125rem",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: "0.5rem 1.125rem",
                borderRadius: "0.5rem",
                border: "none",
                background: "var(--color-accent)",
                color: "var(--color-canvas)",
                fontSize: "0.8125rem",
                fontWeight: 600,
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? "Publishing..." : "Publish Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
