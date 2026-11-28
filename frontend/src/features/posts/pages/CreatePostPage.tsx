import { type FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Compass,
  Eye,
  LayoutGrid,
  Link2,
  Plus,
  Settings,
  Users,
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import {
  createPost,
  fetchCommunities,
} from "../../../feed/services/feedService";
import type { FeedCommunity } from "../../../feed/types/feed.types";

export default function CreatePostPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [communities, setCommunities] = useState<FeedCommunity[]>([]);
  const [communityName, setCommunityName] = useState<string>(
    searchParams.get("community") || "programming"
  );
  const [title, setTitle] = useState<string>("");
  const [body, setBody] = useState<string>("");
  const [url, setUrl] = useState<string>("");
  const [showPreview, setShowPreview] = useState<boolean>(false);

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetchCommunities().then((items) => {
      if (!active) return;
      setCommunities(items);
      const requested = searchParams.get("community");
      if (requested && items.some((c) => c.normalizedName === requested)) {
        setCommunityName(requested);
      } else if (items.length > 0) {
        setCommunityName((prev) =>
          items.some((c) => c.normalizedName === prev)
            ? prev
            : items[0].normalizedName
        );
      }
    });
    return () => {
      active = false;
    };
  }, [searchParams]);

  const selectedCommunity =
    communities.find((c) => c.normalizedName === communityName) ??
    communities[0];

  function validateForm(): string | null {
    if (!isAuthenticated || !user) {
      return "Please sign in first to publish a post.";
    }

    const trimmedTitle = title.trim();
    if (trimmedTitle.length < 1 || trimmedTitle.length > 300) {
      return "Title must be between 1 and 300 characters.";
    }

    const trimmedBody = body.trim();
    if (trimmedBody.length > 20000) {
      return "Post body cannot exceed 20,000 characters.";
    }

    const trimmedUrl = url.trim();
    if (trimmedUrl && !/^https?:\/\//i.test(trimmedUrl)) {
      return "URL must start with http:// or https://.";
    }

    return null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMessage(null);

    const validationError = validateForm();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    const authorId =
      (user as { _id?: string; id?: string })._id ||
      (user as { _id?: string; id?: string }).id ||
      "local-user";

    setSubmitting(true);
    try {
      await createPost({
        communityId: selectedCommunity?._id || "",
        communityName: selectedCommunity?.name || communityName,
        title: title.trim(),
        body: body.trim() || undefined,
        url: url.trim() || undefined,
        author: {
          _id: authorId,
          username: user!.username,
          avatar: user!.avatar ?? null,
        },
      });

      navigate("/");
    } catch {
      setErrorMessage("Could not publish post. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0B0D12] text-[#F3F4F8] antialiased">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[#252B38] bg-[#10131B]/90 px-4 backdrop-blur-xl lg:px-6">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#292444] font-mono text-xs font-bold text-[#8B7CFF]">
              N
            </span>
            <span className="text-sm font-bold tracking-tight">Nexus</span>
          </Link>
          <span className="hidden items-center gap-1.5 rounded-full border border-[#35C98A]/30 bg-[#35C98A]/10 px-2.5 py-0.5 font-mono text-[11px] text-[#35C98A] sm:inline-flex">
            <span className="h-1.5 w-1.5 rounded-full bg-[#35C98A]" />
            {isAuthenticated ? `@${user?.username}` : "Guest"}
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/"
            className="flex items-center gap-1.5 rounded-lg border border-[#252B38] bg-[#151923] px-3 py-1.5 text-xs text-[#A0A6B5] hover:border-[#373F50] hover:text-[#F3F4F8]"
          >
            <ArrowLeft size={14} />
            <span>Back to Feed</span>
          </Link>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1440px]">
        {/* Left Sidebar */}
        <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-60 shrink-0 flex-col justify-between border-r border-[#252B38] bg-[#10131B] p-4 lg:flex">
          <div className="space-y-6">
            <nav className="space-y-1">
              <Link
                to="/"
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-[#A0A6B5] hover:bg-[#151923] hover:text-[#F3F4F8]"
              >
                <Compass size={15} /> Explore / Search
              </Link>
              <Link
                to="/profile"
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-[#A0A6B5] hover:bg-[#151923] hover:text-[#F3F4F8]"
              >
                <LayoutGrid size={15} /> Profile
              </Link>
              <div className="flex items-center gap-2.5 rounded-lg bg-[#292444] px-3 py-2 text-xs font-semibold text-[#F3F4F8]">
                <Plus size={15} className="text-[#8B7CFF]" /> Create Post
              </div>
            </nav>

            <div>
              <p className="px-3 font-mono text-[10px] font-semibold uppercase tracking-wider text-[#737B8D]">
                Communities
              </p>
              <div className="mt-2 space-y-1">
                {communities.map((comm) => {
                  const active = comm.normalizedName === communityName;
                  return (
                    <button
                      key={comm._id}
                      type="button"
                      onClick={() => setCommunityName(comm.normalizedName)}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-left text-xs transition ${
                        active
                          ? "bg-[#292444] font-semibold text-[#8B7CFF]"
                          : "text-[#A0A6B5] hover:bg-[#151923] hover:text-[#F3F4F8]"
                      }`}
                    >
                      <span>c/{comm.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-2 border-t border-[#252B38] pt-3">
            <Link
              to="/settings"
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-[#A0A6B5] hover:bg-[#151923]"
            >
              <Settings size={15} /> Settings
            </Link>
            {user && (
              <div className="flex items-center gap-2 px-3 pt-1 text-xs text-[#737B8D]">
                <Users size={13} />
                <span className="truncate">@{user.username}</span>
              </div>
            )}
          </div>
        </aside>

        {/* Main Composer */}
        <main className="min-w-0 flex-1 px-4 py-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <p className="font-mono text-[11px] uppercase tracking-wider text-[#8B7CFF]">
              Workspace / New Submission
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#F3F4F8]">
              Create a Submission
            </h1>
            <p className="mt-1 text-sm text-[#A0A6B5]">
              Publish a discussion, attach an external link, or include both in one post.
            </p>

            {!isAuthenticated && (
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E9B45B]/40 bg-[#E9B45B]/10 px-4 py-3 text-xs text-[#F3F4F8]">
                <span>
                  You are browsing as a guest. Sign in to submit a post to a
                  community.
                </span>
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="rounded-lg bg-[#8B7CFF] px-3 py-1.5 font-semibold text-[#151923] hover:bg-[#A397FF]"
                >
                  Sign In
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              {/* Target Community */}
              <section className="rounded-2xl border border-[#252B38] bg-[#151923] p-5">
                <label
                  htmlFor="community-select"
                  className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-[#737B8D]"
                >
                  Target Community
                </label>
                <select
                  id="community-select"
                  value={communityName}
                  onChange={(e) => setCommunityName(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-[#252B38] bg-[#1B2030] px-3.5 py-2.5 text-sm text-[#F3F4F8] focus:border-[#8B7CFF] focus:outline-none"
                >
                  {communities.map((comm) => (
                    <option key={comm._id} value={comm.normalizedName}>
                      c/{comm.name}
                      {comm.membersCount
                        ? ` (${comm.membersCount.toLocaleString()} members)`
                        : ""}
                    </option>
                  ))}
                </select>
                {selectedCommunity?.description && (
                  <p className="mt-1.5 text-xs text-[#737B8D]">
                    {selectedCommunity.description}
                  </p>
                )}
              </section>

              {/* Unified Title + Body + Link Card */}
              <section className="space-y-4 rounded-2xl border border-[#252B38] bg-[#151923] p-5">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <label
                      htmlFor="post-title"
                      className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#737B8D]"
                    >
                      Title *
                    </label>
                    <span className="font-mono text-xs text-[#737B8D]">
                      {title.length} / 300
                    </span>
                  </div>
                  <input
                    id="post-title"
                    type="text"
                    maxLength={300}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Write a clear, descriptive title..."
                    className="mt-2 w-full rounded-xl border border-[#252B38] bg-[#1B2030] px-4 py-3 text-sm font-medium text-[#F3F4F8] placeholder-[#737B8D] focus:border-[#8B7CFF] focus:outline-none"
                  />
                </div>

                {/* Merged Body */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label
                      htmlFor="post-body"
                      className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#737B8D]"
                    >
                      Body (optional)
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-[#737B8D]">
                        {body.length} / 20,000
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowPreview((prev) => !prev)}
                        className="inline-flex items-center gap-1 rounded-lg border border-[#252B38] bg-[#1B2030] px-2.5 py-1 text-xs text-[#A0A6B5] hover:text-[#F3F4F8]"
                      >
                        <Eye size={13} />
                        {showPreview ? "Edit" : "Preview"}
                      </button>
                    </div>
                  </div>

                  {showPreview ? (
                    <div className="min-h-40 whitespace-pre-wrap rounded-xl border border-[#252B38] bg-[#10131B] p-4 text-sm leading-relaxed text-[#F3F4F8]">
                      {body.trim() || "Nothing to preview yet."}
                    </div>
                  ) : (
                    <textarea
                      id="post-body"
                      rows={6}
                      maxLength={20000}
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      placeholder="Share details, context, code snippets, or commentary..."
                      className="w-full rounded-xl border border-[#252B38] bg-[#1B2030] p-4 text-sm leading-relaxed text-[#F3F4F8] placeholder-[#737B8D] focus:border-[#8B7CFF] focus:outline-none"
                    />
                  )}
                </div>

                {/* Merged Optional Link */}
                <div>
                  <label
                    htmlFor="post-url"
                    className="inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-[#737B8D]"
                  >
                    <Link2 size={13} />
                    <span>Attach Link (optional — http:// or https://)</span>
                  </label>
                  <input
                    id="post-url"
                    type="url"
                    maxLength={2048}
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com/article"
                    className="mt-2 w-full rounded-xl border border-[#252B38] bg-[#1B2030] px-4 py-3 font-mono text-sm text-[#F3F4F8] placeholder-[#737B8D] focus:border-[#8B7CFF] focus:outline-none"
                  />
                </div>

                {errorMessage && (
                  <p role="alert" className="text-xs font-medium text-[#F16B75]">
                    {errorMessage}
                  </p>
                )}

                <div className="flex items-center justify-end gap-3 border-t border-[#252B38] pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setTitle("");
                      setBody("");
                      setUrl("");
                      setErrorMessage(null);
                    }}
                    className="rounded-xl border border-[#252B38] bg-[#1B2030] px-4 py-2.5 text-xs font-semibold text-[#A0A6B5] hover:text-[#F3F4F8]"
                  >
                    Clear
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-xl bg-[#8B7CFF] px-5 py-2.5 text-xs font-semibold text-[#151923] transition hover:bg-[#A397FF] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submitting ? "Publishing..." : "Publish Post"}
                  </button>
                </div>
              </section>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
