import { User, MapPin, Globe, Calendar, Edit, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import FollowButton from './FollowButton';
import { format } from 'date-fns';

interface ProfileHeaderProps {
    user: {
        id: string;
        name: string;
        email: string;
        bio?: string;
        avatar?: string;
        location?: string;
        website?: string;
        followersCount?: number;
        followingCount?: number;
        joinedDate?: string;
        followers?: string[];
    };
    currentUserId?: string;
    onEditProfile?: () => void;
    onShowFollowers?: () => void;
    onShowFollowing?: () => void;
    onShareProfile?: () => void;
}

export default function ProfileHeader({
    user,
    currentUserId,
    onEditProfile,
    onShowFollowers,
    onShowFollowing,
    onShareProfile,
}: ProfileHeaderProps) {
    const isOwnProfile = currentUserId === user.id;
    const isFollowing = user.followers?.includes(currentUserId || '') || false;

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className="border-b border-border/50 bg-background">
            <div className="container max-w-4xl py-8">
                <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                    {/* Avatar */}
                    <Avatar className="h-32 w-32 md:h-40 md:w-40 border-4 border-border">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback className="text-3xl font-semibold bg-primary/10 text-primary">
                            {getInitials(user.name)}
                        </AvatarFallback>
                    </Avatar>

                    {/* Profile Info */}
                    <div className="flex-1 space-y-4 w-full">
                        {/* Name and Actions */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold">{user.name}</h1>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>

                            {isOwnProfile ? (
                                <div className="flex gap-2 w-full sm:w-auto">
                                    <Button onClick={onEditProfile} variant="outline" className="gap-2 flex-1 sm:flex-initial">
                                        <Edit className="h-4 w-4" />
                                        Edit Profile
                                    </Button>
                                    <Button onClick={onShareProfile} variant="outline" className="gap-2 flex-1 sm:flex-initial">
                                        <Share2 className="h-4 w-4" />
                                        Share
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex gap-2 w-full sm:w-auto">
                                    <FollowButton userId={user.id} isFollowing={isFollowing} />
                                    <Button onClick={onShareProfile} variant="outline" size="icon">
                                        <Share2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Stats */}
                        <div className="flex gap-6 text-sm">
                            <button
                                onClick={onShowFollowers}
                                className="hover:text-primary transition-colors"
                            >
                                <span className="font-semibold">{user.followersCount || 0}</span>{' '}
                                <span className="text-muted-foreground">followers</span>
                            </button>
                            <button
                                onClick={onShowFollowing}
                                className="hover:text-primary transition-colors"
                            >
                                <span className="font-semibold">{user.followingCount || 0}</span>{' '}
                                <span className="text-muted-foreground">following</span>
                            </button>
                        </div>

                        {/* Bio */}
                        {user.bio && (
                            <p className="text-sm whitespace-pre-wrap">{user.bio}</p>
                        )}

                        {/* Additional Info */}
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            {user.location && (
                                <div className="flex items-center gap-1.5">
                                    <MapPin className="h-4 w-4" />
                                    <span>{user.location}</span>
                                </div>
                            )}
                            {user.website && (
                                <div className="flex items-center gap-1.5">
                                    <Globe className="h-4 w-4" />
                                    <a
                                        href={user.website.startsWith('http') ? user.website : `https://${user.website}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hover:text-primary hover:underline"
                                    >
                                        {user.website}
                                    </a>
                                </div>
                            )}
                            {user.joinedDate && (
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="h-4 w-4" />
                                    <span>Joined {format(new Date(user.joinedDate), 'MMMM yyyy')}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
