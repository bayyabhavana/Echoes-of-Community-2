import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "echoes-felt-this";

export function useFeltThis() {
  const [feltIds, setFeltIds] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...feltIds]));
  }, [feltIds]);

  const toggleFeltThis = useCallback((storyId: string) => {
    setFeltIds((prev) => {
      const next = new Set(prev);
      if (next.has(storyId)) {
        next.delete(storyId);
      } else {
        next.add(storyId);
      }
      return next;
    });
  }, []);

  const hasFeltThis = useCallback(
    (storyId: string) => feltIds.has(storyId),
    [feltIds]
  );

  return { feltIds, toggleFeltThis, hasFeltThis };
}
