import { useState, useEffect, useCallback } from "react";
import { stories as staticStories } from "@/data/stories";
import type { Story } from "@/types/story";

export function useStories() {
    const [stories, setStories] = useState<Story[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const refreshStories = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch("/api/stories");
            if (response.ok) {
                const data = await response.json();
                // Merge API stories with static ones if needed, or just use API
                // For this implementation, we favor the API (which should include merged data if initialized correctly)
                setStories(data.length > 0 ? data : staticStories);
            } else {
                setStories(staticStories);
            }
        } catch (error) {
            console.error("Failed to fetch stories:", error);
            setStories(staticStories);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshStories();
    }, [refreshStories]);

    const deleteStory = useCallback(async (id: string) => {
        const token = localStorage.getItem("echoes_token");
        try {
            const response = await fetch(`/api/stories/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            if (response.ok) {
                refreshStories();
            }
        } catch (error) {
            console.error("Failed to delete story:", error);
        }
    }, [refreshStories]);

    const updateStory = useCallback(async (id: string, updatedData: Partial<Story>) => {
        // Updated logic would ideally go to API too, for now we keep it consistent
        // In a full implementation, we'd have a PUT /api/stories/:id
        console.log("Updating story via API not yet fully implemented for all fields");
    }, []);

    return { stories, deleteStory, updateStory, refreshStories, isLoading };
}
