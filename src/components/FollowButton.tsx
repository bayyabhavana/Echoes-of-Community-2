import { UserPlus, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFollowUser, useUnfollowUser } from '@/hooks/useUserProfile';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface FollowButtonProps {
    userId: string;
    isFollowing: boolean;
    variant?: 'default' | 'outline';
}

export default function FollowButton({ userId, isFollowing, variant = 'default' }: FollowButtonProps) {
    const { user } = useAuth();
    const followMutation = useFollowUser();
    const unfollowMutation = useUnfollowUser();

    const handleClick = async () => {
        if (!user) {
            toast.error('Please login to follow users');
            return;
        }

        try {
            if (isFollowing) {
                await unfollowMutation.mutateAsync(userId);
                toast.success('Unfollowed successfully');
            } else {
                await followMutation.mutateAsync(userId);
                toast.success('Following successfully');
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to update follow status');
        }
    };

    const isLoading = followMutation.isPending || unfollowMutation.isPending;

    return (
        <Button
            onClick={handleClick}
            disabled={isLoading}
            variant={isFollowing ? 'outline' : variant}
            size="sm"
            className="gap-2"
        >
            {isLoading ? (
                <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    {isFollowing ? 'Unfollowing...' : 'Following...'}
                </>
            ) : (
                <>
                    {isFollowing ? (
                        <>
                            <UserCheck className="h-4 w-4" />
                            Following
                        </>
                    ) : (
                        <>
                            <UserPlus className="h-4 w-4" />
                            Follow
                        </>
                    )}
                </>
            )}
        </Button>
    );
}
