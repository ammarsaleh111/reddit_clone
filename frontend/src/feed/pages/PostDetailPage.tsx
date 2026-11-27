import { useEffect, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ExternalLink, MessageSquare, Send } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getApiErrorMessage } from "../../services/authservices";
import { addCommentToPost, fetchPostThread } from "../services/feedService";
import type { FeedComment, FeedPost } from "../types/feed.types";

export default function PostDetailPage() {
  const { postId = "" } = useParams<{ postId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const statePost = (location.state as { post?: FeedPost } | null)?.post ?? null;

  const [post, setPost] = useState<FeedPost | null>(statePost);
  const [comments, setComments] = useState<FeedComment[]>([]);
  const [commentBody, setCommentBody] = useState("");
  const [loading, setLoading] = useState(!statePost);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetchPostThread(postId)
      .then((res) => {
        if (!active) return;
        if (res.post) setPost(res.post);
        setComments(res.comments);
      })
      .catch((err) => {
        if (active) setError(getApiErrorMessage(err, "Unable to load thread."));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [postId]);

  async function handleCommentSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isAuthenticated || !user) {
      navigate("/login");
      return;
    }
    if (!commentBody.trim()) return;

    setSubmitting(true);
    setError(null);
    try {
      const created = await addCommentToPost({
        postId,
        body: commentBody.trim(),
        author: {
          _id: user.id,
          username: user.username,
          avatar: user.avatar ?? null,
        },
      });
      setComments((prev) => [created, ...prev]);
      setPost((prev) =>
        prev ? { ...prev, commentsCount: prev.commentsCount + 1 } : prev
      );
      setCommentBody("");
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to post comment."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--color-canvas)",
        color: "var(--color-content)",
        padding: "2rem 1rem",
      }}
    >
      <div style={{ maxWidth: "48rem", margin: "0 auto", display: "grid", gap: "1.25rem" }}>
        <div>
          <Link
            to="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              color: "var(--color-content-muted)",
              textDecoration: "none",
              fontSize: "0.875rem",
            }}
          >
            <ArrowLeft size={16} /> Back to Feed
          </Link>
        </div>

        {loading ? (
          <div className="nexus-card" style={{ padding: "2rem", textAlign: "center" }}>
            Loading discussion...
          </div>
        ) : !post ? (
          <div className="nexus-card" style={{ padding: "2rem", textAlign: "center" }}>
            <h2 style={{ marginTop: 0 }}>Post not found</h2>
            <p style={{ color: "var(--color-content-muted)", fontSize: "0.875rem" }}>
              This post may have been removed or hasn't been persisted to the backend yet.
            </p>
          </div>
        ) : (
          <>
            <article className="nexus-card" style={{ padding: "1.5rem" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontSize: "0.75rem",
                  color: "var(--color-content-muted)",
                  marginBottom: "0.625rem",
                }}
              >
                <span style={{ fontWeight: 600, color: "var(--color-accent)" }}>
                  c/{post.community.name}
                </span>
                <span>•</span>
                <span>Posted by @{post.author.username}</span>
                {post.tag && (
                  <span
                    style={{
                      padding: "0.125rem 0.5rem",
                      borderRadius: "9999px",
                      background: "var(--color-accent-subdued)",
                      color: "var(--color-accent-hover)",
                      fontWeight: 600,
                    }}
                  >
                    {post.tag}
                  </span>
                )}
              </div>

              <h1 style={{ margin: "0 0 0.75rem", fontSize: "1.375rem", fontWeight: 600 }}>
                {post.title}
              </h1>

              {post.type === "text" && post.body && (
                <p
                  style={{
                    margin: 0,
                    lineHeight: 1.65,
                    color: "var(--color-content-muted)",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {post.body}
                </p>
              )}

              {post.type === "link" && post.url && (
                <a
                  href={post.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    color: "var(--color-accent-hover)",
                    fontSize: "0.875rem",
                  }}
                >
                  {post.url} <ExternalLink size={14} />
                </a>
              )}

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  marginTop: "1.25rem",
                  paddingTop: "0.875rem",
                  borderTop: "1px solid var(--color-border)",
                  fontSize: "0.8125rem",
                  color: "var(--color-content-muted)",
                }}
              >
                <span>Score: {post.score}</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                  <MessageSquare size={15} /> {comments.length} Comments
                </span>
              </div>
            </article>

            {/* Add Comment Box */}
            <form
              onSubmit={handleCommentSubmit}
              className="nexus-card"
              style={{ padding: "1.25rem", display: "grid", gap: "0.75rem" }}
            >
              <label className="nexus-label">
                {isAuthenticated ? `Comment as @${user?.username}` : "Sign in to join the thread"}
              </label>
              <textarea
                rows={3}
                value={commentBody}
                onChange={(e) => setCommentBody(e.target.value)}
                placeholder="Write a thoughtful reply..."
                style={{
                  width: "100%",
                  padding: "0.625rem 0.75rem",
                  borderRadius: "0.5rem",
                  border: "1px solid var(--color-border)",
                  background: "var(--color-canvas)",
                  color: "var(--color-content)",
                  fontSize: "0.875rem",
                  resize: "vertical",
                }}
              />
              {error && (
                <div style={{ color: "var(--color-danger)", fontSize: "0.8125rem" }}>
                  {error}
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    padding: "0.5rem 1rem",
                    borderRadius: "0.5rem",
                    border: "none",
                    background: "var(--color-accent)",
                    color: "var(--color-canvas)",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                  }}
                >
                  <Send size={14} /> {submitting ? "Posting..." : "Post Comment"}
                </button>
              </div>
            </form>

            {/* Comments List */}
            <div style={{ display: "grid", gap: "0.75rem" }}>
              {comments.length === 0 ? (
                <div
                  className="nexus-card"
                  style={{
                    padding: "1.5rem",
                    textAlign: "center",
                    color: "var(--color-content-muted)",
                    fontSize: "0.875rem",
                  }}
                >
                  No comments yet. Start the discussion above.
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment._id} className="nexus-card" style={{ padding: "1rem 1.25rem" }}>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--color-content-muted)",
                        marginBottom: "0.4rem",
                      }}
                    >
                      <strong style={{ color: "var(--color-content)" }}>
                        @{comment.author.username}
                      </strong>
                    </div>
                    <p style={{ margin: 0, fontSize: "0.875rem", lineHeight: 1.55 }}>
                      {comment.body}
                    </p>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}