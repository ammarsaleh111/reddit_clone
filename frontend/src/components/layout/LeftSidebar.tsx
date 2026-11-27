import { useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import {
  ChevronDown,
  ChevronRight,
  Compass,
  Hexagon,
  Home,
  Plus,
  Settings,
  Users,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import type {
  FeedCommunity,
  FeedMode,
} from "../../feed/types/feed.types";


interface LeftSidebarProps {
  activeMode: FeedMode;
  selectedCommunity: string | null;
  communities: FeedCommunity[];
  onSelectMode: (mode: FeedMode) => void;
  onSelectCommunity: (normalizedName: string) => void;
  onOpenCreateCommunity?: () => void;
}

const NAV_ITEMS: { id: FeedMode; label: string; icon: typeof Home }[] = [
  { id: "for-you", label: "Home", icon: Home },
  { id: "explore", label: "Explore", icon: Compass },
  { id: "following", label: "Following", icon: Users },
];

export function LeftSidebar({
  activeMode,
  selectedCommunity,
  communities,
  onSelectMode,
  onSelectCommunity,
  onOpenCreateCommunity,
}: LeftSidebarProps) {
  const { user, isAuthenticated } = useAuth();
  const [communitiesOpen, setCommunitiesOpen] = useState(true);

  const navBtnStyle = (isActive: boolean): CSSProperties => ({
    display: "flex",
    alignItems: "center",
    gap: "0.625rem",
    width: "100%",
    padding: "0.55rem 0.875rem",
    borderRadius: "0.5rem",
    border: "none",
    background: isActive ? "var(--color-accent-subdued)" : "transparent",
    color: isActive ? "var(--color-accent-hover)" : "var(--color-content-muted)",
    fontSize: "0.875rem",
    fontWeight: isActive ? 600 : 500,
    textAlign: "left",
  });

  return (
    <aside
      aria-label="Primary navigation"
      className="nexus-sidebar"
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        height: "100vh",
        overflowY: "auto",
      }}
    >
      <div>
        {/* Brand */}
        <Link
          to="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.625rem",
            height: "4rem",
            padding: "0 1.25rem",
            borderBottom: "1px solid var(--color-border)",
            textDecoration: "none",
            color: "var(--color-content)",
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
            <Hexagon size={17} />
          </span>
          <span style={{ fontSize: "1.0625rem", fontWeight: 600 }}>Nexus</span>
          <span
            style={{
              padding: "0.125rem 0.375rem",
              borderRadius: "0.25rem",
              background: "var(--color-accent-subdued)",
              color: "var(--color-accent-hover)",
              fontSize: "0.6875rem",
              fontWeight: 600,
            }}
          >
            PRO
          </span>
        </Link>

        {/* Primary Feed Modes */}
        <nav style={{ padding: "1rem", display: "grid", gap: "0.25rem" }}>
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const isActive = !selectedCommunity && activeMode === id;
            return (
              <button
                key={id}
                type="button"
                aria-current={isActive ? "page" : undefined}
                onClick={() => onSelectMode(id)}
                style={navBtnStyle(isActive)}
              >
                <Icon size={18} />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>

        {/* My Communities */}
        <div style={{ padding: "0 1rem 1rem" }}>
          <button
            type="button"
            onClick={() => setCommunitiesOpen((prev) => !prev)}
            className="nexus-label"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              padding: "0.375rem 0.875rem",
              border: "none",
              background: "transparent",
            }}
          >
            <span>My Communities</span>
            {communitiesOpen ? (
              <ChevronDown size={14} />
            ) : (
              <ChevronRight size={14} />
            )}
          </button>

          {communitiesOpen && (
            <div style={{ marginTop: "0.375rem", display: "grid", gap: "0.25rem" }}>
              {communities.map((comm) => {
                const isSelected = selectedCommunity === comm.normalizedName;
                return (
                  <button
                    key={comm._id}
                    type="button"
                    onClick={() => onSelectCommunity(comm.normalizedName)}
                    style={{
                      ...navBtnStyle(isSelected),
                      justifyContent: "space-between",
                      padding: "0.45rem 0.875rem",
                    }}
                  >
                    <span>c/{comm.name}</span>
                    {comm.unreadCount ? (
                      <span
                        style={{
                          padding: "0.1rem 0.4rem",
                          borderRadius: "0.25rem",
                          background: "var(--color-surface)",
                          color: "var(--color-content-muted)",
                          fontSize: "0.6875rem",
                        }}
                      >
                        {comm.unreadCount}
                      </span>
                    ) : null}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={onOpenCreateCommunity}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  width: "100%",
                  marginTop: "0.25rem",
                  padding: "0.5rem 0.875rem",
                  border: "none",
                  borderRadius: "0.5rem",
                  background: "transparent",
                  color: "var(--color-accent)",
                  fontSize: "0.75rem",
                  fontWeight: 500,
                }}
              >
                <Plus size={15} />
                <span>Create Community</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Utility & User Card */}
      <div
        style={{
          padding: "1rem",
          borderTop: "1px solid var(--color-border)",
          display: "grid",
          gap: "0.375rem",
        }}
      >
        <Link
          to="/settings"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.625rem",
            padding: "0.45rem 0.875rem",
            borderRadius: "0.5rem",
            color: "var(--color-content-muted)",
            fontSize: "0.8125rem",
            textDecoration: "none",
          }}
        >
          <Settings size={16} />
          <span>Settings</span>
        </Link>

        {isAuthenticated && user ? (
          <Link
            to="/profile"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.625rem",
              marginTop: "0.375rem",
              paddingTop: "0.625rem",
              borderTop: "1px solid var(--color-border)",
              textDecoration: "none",
              color: "var(--color-content)",
            }}
          >
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.username}
                style={{
                  width: "2rem",
                  height: "2rem",
                  borderRadius: "9999px",
                  objectFit: "cover",
                }}
              />
            ) : (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "2rem",
                  height: "2rem",
                  borderRadius: "9999px",
                  background: "var(--color-accent-subdued)",
                  color: "var(--color-accent)",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
                }}
              >
                {user.username.slice(0, 2)}
              </span>
            )}
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: "0.8125rem",
                  fontWeight: 500,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {user.username}
              </div>
              <div style={{ fontSize: "0.6875rem", color: "var(--color-content-subdued)" }}>
                @{user.username}
              </div>
            </div>
          </Link>
        ) : (
          <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.375rem" }}>
            <Link
              to="/login"
              style={{
                flex: 1,
                padding: "0.45rem",
                borderRadius: "0.5rem",
                border: "1px solid var(--color-border)",
                background: "var(--color-surface)",
                color: "var(--color-content)",
                fontSize: "0.75rem",
                textAlign: "center",
                textDecoration: "none",
              }}
            >
              Sign In
            </Link>
            <Link
              to="/register"
              style={{
                flex: 1,
                padding: "0.45rem",
                borderRadius: "0.5rem",
                background: "var(--color-accent)",
                color: "var(--color-canvas)",
                fontSize: "0.75rem",
                fontWeight: 600,
                textAlign: "center",
                textDecoration: "none",
              }}
            >
              Join
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}
