import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "echoes-bookmarks";

export function useBookmarks() {
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...bookmarkedIds]));
  }, [bookmarkedIds]);

  const toggleBookmark = useCallback((storyId: string) => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(storyId)) {
        next.delete(storyId);
      } else {
        next.add(storyId);
      }
      return next;
    });
  }, []);

  const isBookmarked = useCallback(
    (storyId: string) => bookmarkedIds.has(storyId),
    [bookmarkedIds]
  );

  return { bookmarkedIds, toggleBookmark, isBookmarked };
}
