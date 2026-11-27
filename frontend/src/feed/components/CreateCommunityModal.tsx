import { useState, type CSSProperties, type FormEvent } from "react";
import { Users, X } from "lucide-react";
import { getApiErrorMessage } from "../../services/authservices";
import { createCommunity } from "../services/feedService";
import type { FeedCommunity } from "../types/feed.types";

interface CreateCommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCommunityCreated: (community: FeedCommunity) => void;
}

export function CreateCommunityModal({
  isOpen,
  onClose,
  onCommunityCreated,
}: CreateCommunityModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
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
    const cleaned = name.replace(/^c\//i, "").trim();
    if (cleaned.length < 3) {
      setError("Community name must be at least 3 characters.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const created = await createCommunity({
        name: cleaned,
        description,
      });
      onCommunityCreated(created);
      setName("");
      setDescription("");
      onClose();
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to create community."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-community-title"
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
        style={{ width: "100%", maxWidth: "30rem", padding: "1.5rem" }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "1.25rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Users size={18} style={{ color: "var(--color-accent)" }} />
            <h2
              id="create-community-title"
              style={{ margin: 0, fontSize: "1.125rem", fontWeight: 600 }}
            >
              Create Community
            </h2>
          </div>
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

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "0.875rem" }}>
          <div>
            <label className="nexus-label" style={{ display: "block", marginBottom: "0.35rem" }}>
              Handle (c/name)
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. systems_engineering"
              style={inputStyle}
            />
          </div>

          <div>
            <label className="nexus-label" style={{ display: "block", marginBottom: "0.35rem" }}>
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What topics, benchmarks, or discussions belong here?"
              style={{ ...inputStyle, resize: "vertical" }}
            />
          </div>

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
              {submitting ? "Creating..." : "Create Community"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}