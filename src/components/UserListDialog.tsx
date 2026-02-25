import { useState } from 'react';
import { X } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Link } from 'react-router-dom';
import FollowButton from './FollowButton';
import { useAuth } from '@/hooks/useAuth';

interface UserListItem {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    bio?: string;
}

interface UserListDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    users: UserListItem[];
    isLoading?: boolean;
    currentUserFollowing?: string[];
}

export default function UserListDialog({
    open,
    onOpenChange,
    title,
    users,
    isLoading,
    currentUserFollowing = [],
}: UserListDialogProps) {
    const { user: currentUser } = useAuth();

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>

                <ScrollArea className="max-h-[400px] pr-4">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                        </div>
                    ) : users.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No users found
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {users.map((user) => {
                                const isCurrentUser = currentUser?.id === user.id;
                                const isFollowing = currentUserFollowing.includes(user.id);

                                return (
                                    <div
                                        key={user.id}
                                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors"
                                    >
                                        <Link
                                            to={`/profile/${user.id}`}
                                            onClick={() => onOpenChange(false)}
                                            className="flex items-center gap-3 flex-1 min-w-0"
                                        >
                                            <Avatar className="h-12 w-12 border-2 border-border">
                                                <AvatarImage src={user.avatar} alt={user.name} />
                                                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                                    {getInitials(user.name)}
                                                </AvatarFallback>
                                            </Avatar>

                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold truncate">{user.name}</p>
                                                {user.bio ? (
                                                    <p className="text-sm text-muted-foreground truncate">{user.bio}</p>
                                                ) : (
                                                    <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                                                )}
                                            </div>
                                        </Link>

                                        {!isCurrentUser && (
                                            <FollowButton
                                                userId={user.id}
                                                isFollowing={isFollowing}
                                                variant="outline"
                                            />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
