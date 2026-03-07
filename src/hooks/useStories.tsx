import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Story } from "@/types/story";

const API_BASE = "/api";

// Fetch all stories
export function useStories() {
    const query = useQuery({
        queryKey: ["stories"],
        queryFn: async () => {
            const response = await fetch(`${API_BASE}/stories`);
            if (!response.ok) throw new Error("Failed to fetch stories");
            return response.json() as Promise<Story[]>;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    const queryClient = useQueryClient();

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const token = localStorage.getItem("echoes_token");
            const response = await fetch(`${API_BASE}/stories/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error("Failed to delete story");
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["stories"] });
            queryClient.invalidateQueries({ queryKey: ["user-stories"] });
        },
    });

    const updateStory = async (id: string, updatedData: Partial<Story>) => {
        console.log("Updating story via API not yet fully implemented for all fields");
    };

    return {
        stories: query.data || [],
        isLoading: query.isLoading,
        error: query.error,
        deleteStory: deleteMutation.mutate,
        updateStory,
        refreshStories: () => queryClient.invalidateQueries({ queryKey: ["stories"] }),
    };
}

export const fetchUserStories = async (userId: string) => {
    const response = await fetch(`${API_BASE}/users/${userId}/stories`);
    if (!response.ok) throw new Error("Failed to fetch user stories");
    return response.json() as Promise<Story[]>;
};

// Fetch stories for a specific user
export function useUserStories(userId: string | undefined) {
    return useQuery({
        queryKey: ["user-stories", userId],
        queryFn: () => userId ? fetchUserStories(userId) : Promise.reject("No user ID"),
        enabled: !!userId,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}
