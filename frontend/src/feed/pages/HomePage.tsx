import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "../../components/layout/AppLayout";
import { useAuth } from "../../context/AuthContext";
import { getApiErrorMessage } from "../../services/authservices";
import { Feed } from "../components/Feed";
import {
  fetchCommunities,
  fetchFeedPosts,
  toggleCommunityMembership,
  voteOnPost,
} from "../services/feedService";
import type {
  FeedCommunity,
  FeedMode,
  FeedPost,
  FeedSort,
  VoteValue,
} from "../types/feed.types";

const MODE_COPY: Record<FeedMode, { title: string; subtitle: string }> = {
  "for-you": {
    title: "For You",
    subtitle:
      "Curated discussions, engineering deep-dives, and updates across all public communities.",
  },
  explore: {
    title: "Explore",
    subtitle:
      "Discover active technical channels, rising benchmarks, and network-wide threads.",
  },
  following: {
    title: "Following",
    subtitle:
      "Recent posts from authors and communities you follow across Nexus.",
  },
};

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [communities, setCommunities] = useState<FeedCommunity[]>([]);
  const [joinedIds, setJoinedIds] = useState<Record<string, boolean>>({});
  const [activeMode, setActiveMode] = useState<FeedMode>("for-you");
  const [sort, setSort] = useState<FeedSort>("popular");
  const [selectedCommunity, setSelectedCommunity] = useState<string | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [apiUnavailable, setApiUnavailable] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetchCommunities().then((items) => {
      if (active) setCommunities(items);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setErrorMessage(null);

    fetchFeedPosts({
      mode: activeMode,
      sort,
      community: selectedCommunity ?? undefined,
      q: searchQuery.trim() || undefined,
    })
      .then((result) => {
        if (!active) return;
        setPosts(result.posts);
        setApiUnavailable(result.apiUnavailable);
      })
      .catch((err) => {
        if (!active) return;
        setErrorMessage(getApiErrorMessage(err, "Unable to load feed."));
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [activeMode, sort, selectedCommunity, searchQuery]);

  async function handleVote(postId: string, nextVote: VoteValue) {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const previous = posts;
    setPosts((current) =>
      current.map((post) => {
        if (post._id !== postId) return post;
        const delta = nextVote - post.userVote;
        return { ...post, score: post.score + delta, userVote: nextVote };
      })
    );

    try {
      await voteOnPost(postId, nextVote);
    } catch (err) {
      setPosts(previous);
      setErrorMessage(getApiErrorMessage(err, "Failed to update vote."));
    }
  }

  async function handleToggleJoin(communityId: string) {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const nextJoined = !joinedIds[communityId];
    setJoinedIds((prev) => ({
      ...prev,
      [communityId]: nextJoined,
    }));

    try {
      await toggleCommunityMembership(communityId, nextJoined);
    } catch (err) {
      setJoinedIds((prev) => ({
        ...prev,
        [communityId]: !nextJoined,
      }));
      setErrorMessage(getApiErrorMessage(err, "Failed to update membership."));
    }
  }

  function handleResetFilters() {
    setSelectedCommunity(null);
    setSearchQuery("");
    setActiveMode("for-you");
  }

  function handleOpenCommunity(normalizedName: string | null) {
    if (!normalizedName) {
      setSelectedCommunity(null);
      return;
    }
    navigate(`/c/${normalizedName}`);
  }

  const activeCommunity = communities.find(
    (c) => c.normalizedName === selectedCommunity
  );

  const headerTitle = selectedCommunity
    ? `c/${activeCommunity?.name ?? selectedCommunity}`
    : MODE_COPY[activeMode].title;

  const headerSubtitle = selectedCommunity
    ? activeCommunity?.description ||
      "Channel discussions, benchmarks, and architectural threads."
    : MODE_COPY[activeMode].subtitle;

  return (
    <AppLayout
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      activeMode={activeMode}
      selectedCommunity={selectedCommunity}
      communities={communities}
      joinedIds={joinedIds}
      postCount={posts.length}
      onSelectMode={setActiveMode}
      onSelectCommunity={handleOpenCommunity}
      onToggleJoin={handleToggleJoin}
    >
      <Feed
        title={headerTitle}
        subtitle={headerSubtitle}
        mode={activeMode}
        sort={sort}
        posts={posts}
        joinedIds={joinedIds}
        isLoading={isLoading}
        apiUnavailable={apiUnavailable}
        errorMessage={errorMessage}
        hasActiveFilters={Boolean(selectedCommunity || searchQuery.trim())}
        onModeChange={setActiveMode}
        onSortChange={setSort}
        onVote={handleVote}
        onToggleJoin={handleToggleJoin}
        onSelectCommunity={(name) => navigate(`/c/${name}`)}
        onResetFilters={handleResetFilters}
      />
    </AppLayout>
  );
}