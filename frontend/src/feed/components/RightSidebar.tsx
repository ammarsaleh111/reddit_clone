import { Link } from "react-router-dom";
import { Activity, Code2, ShieldCheck, TrendingUp } from "lucide-react";
import type { FeedCommunity } from "../types/feed.types";

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
  postCount,
  onToggleJoin,
  onSelectCommunity,
}: RightSidebarProps) {
  return (
    <aside
      aria-label="Contextual sidebar"
      className="nexus-context"
      style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
    >
      {/* Trending Hubs */}
      <section className="nexus-card" style={{ padding: "1.25rem" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "0.875rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <TrendingUp size={17} color="var(--color-accent)" />
            <h3 style={{ margin: 0, fontSize: "0.9375rem", fontWeight: 600 }}>
              Trending Hubs
            </h3>
          </div>
          <Link
            to="/search"
            style={{
              color: "var(--color-accent)",
              fontSize: "0.75rem",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            View All
          </Link>
        </div>

        {communities.length === 0 ? (
          <p className="nexus-body" style={{ margin: 0, fontSize: "0.75rem" }}>
            Communities appear here once created in the backend.
          </p>
        ) : (
          <div style={{ display: "grid", gap: "0.625rem" }}>
            {communities.slice(0, 4).map((comm) => {
              const isJoined = Boolean(joinedIds[comm._id] ?? comm.isMember);
              return (
                <div
                  key={comm._id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "0.5rem",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => onSelectCommunity(comm.normalizedName)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.625rem",
                      border: "none",
                      background: "transparent",
                      color: "var(--color-content)",
                      textAlign: "left",
                      padding: 0,
                    }}
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "2rem",
                        height: "2rem",
                        borderRadius: "0.5rem",
                        background: "var(--color-accent-subdued)",
                        color: "var(--color-accent)",
                      }}
                    >
                      <Code2 size={15} />
                    </span>
                    <div>
                      <div style={{ fontSize: "0.8125rem", fontWeight: 600 }}>
                        c/{comm.name}
                      </div>
                      <div
                        style={{
                          fontSize: "0.6875rem",
                          color: "var(--color-content-subdued)",
                        }}
                      >
                        {comm.membersCount
                          ? `${comm.membersCount.toLocaleString()} members`
                          : "Public hub"}
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => onToggleJoin(comm._id)}
                    style={{
                      padding: "0.3rem 0.65rem",
                      borderRadius: "0.375rem",
                      border: "1px solid var(--color-border)",
                      background: isJoined
                        ? "var(--color-accent-subdued)"
                        : "var(--color-surface-raised)",
                      color: isJoined
                        ? "var(--color-accent-hover)"
                        : "var(--color-content-muted)",
                      fontSize: "0.6875rem",
                      fontWeight: 600,
                    }}
                  >
                    {isJoined ? "Joined" : "Join"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Quality Standards */}
      <section className="nexus-card" style={{ padding: "1.25rem" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            marginBottom: "0.625rem",
          }}
        >
          <ShieldCheck size={17} color="var(--color-accent)" />
          <h3 style={{ margin: 0, fontSize: "0.9375rem", fontWeight: 600 }}>
            Quality Standards
          </h3>
        </div>
        <p className="nexus-body" style={{ margin: "0 0 0.75rem", fontSize: "0.75rem" }}>
          Nexus prioritizes high-signal engineering and rigorous civil critique
          over engagement optimization.
        </p>
        <ol
          style={{
            margin: 0,
            paddingLeft: "1.125rem",
            display: "grid",
            gap: "0.5rem",
            fontSize: "0.75rem",
            color: "var(--color-content-muted)",
            lineHeight: 1.45,
          }}
        >
          <li>
            <strong style={{ color: "var(--color-content)" }}>
              Data over dogma:
            </strong>{" "}
            Back claims with benchmarks or reproduction steps.
          </li>
          <li>
            <strong style={{ color: "var(--color-content)" }}>
              Format code properly:
            </strong>{" "}
            Use code fences with language identifiers.
          </li>
          <li>
            <strong style={{ color: "var(--color-content)" }}>
              Zero self-promotion spam:
            </strong>{" "}
            Disclose affiliation on personal tooling.
          </li>
        </ol>
      </section>

      {/* Nexus Pulse */}
      <section className="nexus-card" style={{ padding: "1.25rem" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "0.875rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Activity size={17} color="var(--color-accent)" />
            <h3 style={{ margin: 0, fontSize: "0.9375rem", fontWeight: 600 }}>
              Nexus Pulse
            </h3>
          </div>
          <span className="nexus-label" style={{ fontFamily: "var(--font-mono)" }}>
            LIVE
          </span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "0.625rem",
          }}
        >
          <div
            style={{
              padding: "0.75rem",
              borderRadius: "0.625rem",
              background: "var(--color-surface-raised)",
            }}
          >
            <div className="nexus-label">Loaded Posts</div>
            <div style={{ marginTop: "0.25rem", fontSize: "1.25rem", fontWeight: 600 }}>
              {postCount}
            </div>
          </div>
          <div
            style={{
              padding: "0.75rem",
              borderRadius: "0.625rem",
              background: "var(--color-surface-raised)",
            }}
          >
            <div className="nexus-label">Communities</div>
            <div style={{ marginTop: "0.25rem", fontSize: "1.25rem", fontWeight: 600 }}>
              {communities.length}
            </div>
          </div>
        </div>
      </section>
    </aside>
  );
}