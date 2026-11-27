import { useEffect, useRef, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onOpenCreatePost?: () => void;
}

export function Navbar({
  searchQuery,
  onSearchChange,
  onOpenCreatePost,
}: NavbarProps) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;
      if (!isTyping && event.key === "/") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  }

  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "1rem",
        marginBottom: "1.5rem",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{ position: "relative", flex: 1, maxWidth: "28rem" }}
      >
        <Search
          size={16}
          style={{
            position: "absolute",
            left: "0.875rem",
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--color-content-subdued)",
            pointerEvents: "none",
          }}
        />
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search posts, communities, users... (Press /)"
          aria-label="Search posts, communities, users"
          style={{
            width: "100%",
            height: "2.5rem",
            padding: "0 2.25rem 0 2.5rem",
            borderRadius: "0.625rem",
            border: "1px solid var(--color-border)",
            background: "var(--color-surface)",
            color: "var(--color-content)",
            fontSize: "0.875rem",
          }}
        />
        {searchQuery ? (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            aria-label="Clear search"
            style={{
              position: "absolute",
              right: "0.625rem",
              top: "50%",
              transform: "translateY(-50%)",
              border: "none",
              background: "transparent",
              color: "var(--color-content-subdued)",
              fontSize: "0.75rem",
            }}
          >
            ✕
          </button>
        ) : (
          <span
            style={{
              position: "absolute",
              right: "0.625rem",
              top: "50%",
              transform: "translateY(-50%)",
              padding: "0.1rem 0.4rem",
              borderRadius: "0.25rem",
              border: "1px solid var(--color-border)",
              background: "var(--color-surface-raised)",
              color: "var(--color-content-subdued)",
              fontFamily: "var(--font-mono)",
              fontSize: "0.6875rem",
            }}
          >
            /
          </span>
        )}
      </form>

      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            padding: "0.3rem 0.65rem",
            borderRadius: "9999px",
            border: "1px solid var(--color-border)",
            background: "var(--color-surface)",
            color: "var(--color-content-muted)",
            fontSize: "0.6875rem",
            fontWeight: 600,
          }}
        >
          <span
            style={{
              width: "0.45rem",
              height: "0.45rem",
              borderRadius: "9999px",
              background: "var(--color-success)",
            }}
          />
          Online
        </span>

        {isAuthenticated ? (
          <button
            type="button"
            onClick={onOpenCreatePost}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              height: "2.375rem",
              padding: "0 0.9rem",
              borderRadius: "0.625rem",
              border: "none",
              background: "var(--color-accent)",
              color: "var(--color-canvas)",
              fontSize: "0.8125rem",
              fontWeight: 600,
            }}
          >
            <Plus size={16} />
            <span>Create Post</span>
          </button>
        ) : (
          <Link
            to="/login"
            style={{
              display: "inline-flex",
              alignItems: "center",
              height: "2.375rem",
              padding: "0 0.9rem",
              borderRadius: "0.625rem",
              background: "var(--color-accent)",
              color: "var(--color-canvas)",
              fontSize: "0.8125rem",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
}