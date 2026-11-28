import { Link } from "react-router-dom";
import type { FeedCommunity } from "../../feed/types/feed.types";

interface RightSidebarProps {
  communities: FeedCommunity[];
  joinedIds: Record<string, boolean>;
  postCount: number;
  onToggleJoin: (communityId: string) => void;
  onSelectCommunity: (normalizedName: string) => void;
}

export function RightSidebar({
  communities,
  joinedIds,
  onToggleJoin,
  onSelectCommunity,
}: RightSidebarProps) {
  return (
    <aside
      aria-label="Community directory and feed stats"
      style={{
        position: "sticky",
        top: "1rem",
        alignSelf: "start",
        display: "grid",
        gap: "1rem",
        paddingTop: "0.875rem",
      }}
    >
      

      {/* Top Communities */}
      <section className="nexus-card" style={{ padding: "1rem" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "0.75rem",
          }}
        >
          <span className="nexus-label">Top Communities</span>
          <Link
            to="/communities"
            style={{
              fontSize: "0.75rem",
              color: "var(--color-accent)",
              textDecoration: "none",
            }}
          >
            View all
          </Link>
        </div>

        <div style={{ display: "grid", gap: "0.625rem" }}>
          {communities.slice(0, 5).map((comm) => {
            const isJoined = Boolean(joinedIds[comm._id]);
            return (
              <div
                key={comm._id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "0.5rem",
                  minWidth: 0,
                }}
              >
                <button
                  type="button"
                  onClick={() => onSelectCommunity(comm.normalizedName)}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    textAlign: "left",
                    border: "none",
                    background: "transparent",
                    padding: 0,
                    color: "var(--color-content)",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.8125rem",
                      fontWeight: 600,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    c/{comm.name}
                  </div>
                  {comm.membersCount !== undefined && (
                    <div
                      style={{
                        fontSize: "0.6875rem",
                        color: "var(--color-content-muted)",
                      }}
                    >
                      {comm.membersCount.toLocaleString()} members
                    </div>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => onToggleJoin(comm._id)}
                  style={{
                    flexShrink: 0,
                    padding: "0.3rem 0.65rem",
                    borderRadius: "0.375rem",
                    border: isJoined
                      ? "1px solid var(--color-border)"
                      : "none",
                    background: isJoined
                      ? "var(--color-surface)"
                      : "var(--color-accent)",
                    color: isJoined
                      ? "var(--color-content)"
                      : "var(--color-canvas)",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                  }}
                >
                  {isJoined ? "Joined" : "Join"}
                </button>
              </div>
            );
          })}
        </div>
      </section>
    </aside>
  );
}