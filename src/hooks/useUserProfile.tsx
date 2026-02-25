import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface UserProfile {
    id: string;
    name: string;
    email: string;
    bio?: string;
    avatar?: string;
    location?: string;
    website?: string;
    followers?: string[];
    following?: string[];
    followersCount?: number;
    followingCount?: number;
    joinedDate?: string;
}

interface UpdateProfileData {
    bio?: string;
    avatar?: string;
    location?: string;
    website?: string;
}

const API_BASE = '/api';

// Fetch user profile
export const useUserProfile = (userId: string | undefined) => {
    return useQuery({
        queryKey: ['user', userId],
        queryFn: async () => {
            if (!userId) throw new Error('User ID is required');

            const response = await fetch(`${API_BASE}/users/${userId}`);

            if (!response.ok) {
                throw new Error('Failed to fetch user profile');
            }

            return response.json() as Promise<UserProfile>;
        },
        enabled: !!userId,
    });
};

// Update user profile
export const useUpdateProfile = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ userId, data }: { userId: string; data: UpdateProfileData }) => {
            const token = localStorage.getItem('echoes_token');

            const response = await fetch(`${API_BASE}/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to update profile');
            }

            return response.json() as Promise<UserProfile>;
        },
        onSuccess: (data, variables) => {
            // Update the cache
            queryClient.setQueryData(['user', variables.userId], data);

            // Update the auth user cache if it's the current user
            const storedUser = localStorage.getItem('echoes_user');
            if (storedUser) {
                const user = JSON.parse(storedUser);
                if (user.id === variables.userId) {
                    localStorage.setItem('echoes_user', JSON.stringify({ ...user, ...data }));
                }
            }
        },
    });
};

// Follow user
export const useFollowUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (userId: string) => {
            const token = localStorage.getItem('echoes_token');

            const response = await fetch(`${API_BASE}/users/${userId}/follow`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to follow user');
            }

            return response.json();
        },
        onSuccess: (_, userId) => {
            // Invalidate queries to refetch updated data
            queryClient.invalidateQueries({ queryKey: ['user', userId] });

            // Get current user ID and invalidate their profile too
            const storedUser = localStorage.getItem('echoes_user');
            if (storedUser) {
                const user = JSON.parse(storedUser);
                queryClient.invalidateQueries({ queryKey: ['user', user.id] });
            }
        },
    });
};

// Unfollow user
export const useUnfollowUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (userId: string) => {
            const token = localStorage.getItem('echoes_token');

            const response = await fetch(`${API_BASE}/users/${userId}/unfollow`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to unfollow user');
            }

            return response.json();
        },
        onSuccess: (_, userId) => {
            // Invalidate queries to refetch updated data
            queryClient.invalidateQueries({ queryKey: ['user', userId] });

            // Get current user ID and invalidate their profile too
            const storedUser = localStorage.getItem('echoes_user');
            if (storedUser) {
                const user = JSON.parse(storedUser);
                queryClient.invalidateQueries({ queryKey: ['user', user.id] });
            }
        },
    });
};

// Fetch followers list
export const useFollowers = (userId: string | undefined) => {
    return useQuery({
        queryKey: ['followers', userId],
        queryFn: async () => {
            if (!userId) throw new Error('User ID is required');

            const response = await fetch(`${API_BASE}/users/${userId}/followers`);

            if (!response.ok) {
                throw new Error('Failed to fetch followers');
            }

            return response.json() as Promise<UserProfile[]>;
        },
        enabled: !!userId,
    });
};

// Fetch following list
export const useFollowing = (userId: string | undefined) => {
    return useQuery({
        queryKey: ['following', userId],
        queryFn: async () => {
            if (!userId) throw new Error('User ID is required');

            const response = await fetch(`${API_BASE}/users/${userId}/following`);

            if (!response.ok) {
                throw new Error('Failed to fetch following');
            }

            return response.json() as Promise<UserProfile[]>;
        },
        enabled: !!userId,
    });
};
