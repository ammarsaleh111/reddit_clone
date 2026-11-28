import { Search, X } from "lucide-react";

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export function Navbar({ searchQuery, onSearchChange }: NavbarProps) {
  return (
    <header
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: "0.75rem",
        padding: "0.875rem 0",
        marginBottom: "0.5rem",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      <div
        style={{
          position: "relative",
          flex: "1 1 16rem",
          minWidth: 0,
        }}
      >
        <Search
          size={16}
          style={{
            position: "absolute",
            left: "0.85rem",
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--color-content-muted)",
            pointerEvents: "none",
          }}
        />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search posts, communities, or authors..."
          aria-label="Search posts, communities, or authors"
          style={{
            width: "100%",
            padding: "0.55rem 2.25rem 0.55rem 2.4rem",
            borderRadius: "0.5rem",
            border: "1px solid var(--color-border)",
            background: "var(--color-surface)",
            color: "var(--color-content)",
            fontSize: "0.875rem",
          }}
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            aria-label="Clear search"
            style={{
              position: "absolute",
              right: "0.6rem",
              top: "50%",
              transform: "translateY(-50%)",
              border: "none",
              background: "transparent",
              color: "var(--color-content-muted)",
              padding: "0.2rem",
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            <X size={14} />
          </button>
        )}
      </div>
    </header>
  );
}