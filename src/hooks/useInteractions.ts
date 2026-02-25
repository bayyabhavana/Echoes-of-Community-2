import { useState, useCallback, useEffect } from "react";

export interface Comment {
    id: string;
    author: string;
    text: string;
    timestamp: string;
}

interface InteractionData {
    likes: number;
    comments: number | Comment[]; // Store count or array for migration
    userLiked: boolean;
}

const STORAGE_KEY = "echoes_interactions";

export function useInteractions(storyId: string, initialLikes: number, initialComments: number) {
    const [data, setData] = useState<InteractionData>(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        const interactions = stored ? JSON.parse(stored) : {};
        const storyData = interactions[storyId] || {
            likes: initialLikes,
            comments: initialComments,
            userLiked: false
        };

        // Migration: If comments is a number, turn it into an empty array or keep it if we want to show static count + new comments
        // Actually, let's store new comments separately and add them to the initial count
        if (typeof storyData.comments === 'number') {
            storyData.comments = [];
        }

        return storyData;
    });

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        const interactions = stored ? JSON.parse(stored) : {};
        interactions[storyId] = data;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(interactions));
    }, [data, storyId]);

    const toggleLike = useCallback(() => {
        setData(prev => ({
            ...prev,
            likes: prev.userLiked ? prev.likes - 1 : prev.likes + 1,
            userLiked: !prev.userLiked
        }));
    }, []);

    const addComment = useCallback((author: string, text: string) => {
        const newComment: Comment = {
            id: crypto.randomUUID(),
            author,
            text,
            timestamp: "Just now"
        };

        setData(prev => ({
            ...prev,
            comments: Array.isArray(prev.comments) ? [newComment, ...prev.comments] : [newComment]
        }));
    }, []);

    const commentList = Array.isArray(data.comments) ? data.comments : [];
    const totalComments = initialComments + commentList.length;

    return {
        likes: data.likes,
        comments: totalComments,
        commentList,
        userLiked: data.userLiked,
        toggleLike,
        addComment
    };
}
