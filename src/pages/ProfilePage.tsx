import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile, useFollowers, useFollowing } from '@/hooks/useUserProfile';
import ProfileHeader from '@/components/ProfileHeader';
import UserListDialog from '@/components/UserListDialog';
import EditProfileDialog from '@/components/EditProfileDialog';
import ShareProfileDialog from '@/components/ShareProfileDialog';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Loader2 } from 'lucide-react';
import { useStories } from '@/hooks/useStories';
import StoryCard from '@/components/StoryCard';

export default function ProfilePage() {
    const { id } = useParams<{ id: string }>();
    const { user: currentUser } = useAuth();
    const { data: profileUser, isLoading, error } = useUserProfile(id);
    const { data: followers, isLoading: followersLoading } = useFollowers(id);
    const { data: following, isLoading: followingLoading } = useFollowing(id);

    const [showFollowers, setShowFollowers] = useState(false);
    const [showFollowing, setShowFollowing] = useState(false);
    const [showEditProfile, setShowEditProfile] = useState(false);
    const [showShareProfile, setShowShareProfile] = useState(false);

    const { stories: allStories, isLoading: storiesLoading } = useStories();
    const userStories = allStories.filter(s => s.author === profileUser.name);

    if (isLoading) {
        return (
            <>
                <Header />
                <div className="min-h-screen flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
                <Footer />
            </>
        );
    }

    if (error || !profileUser) {
        return (
            <>
                <Header />
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold mb-2">User Not Found</h2>
                        <p className="text-muted-foreground">
                            The profile you're looking for doesn't exist.
                        </p>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />
            <div className="min-h-screen bg-background">
                <ProfileHeader
                    user={profileUser}
                    currentUserId={currentUser?.id}
                    onEditProfile={() => setShowEditProfile(true)}
                    onShowFollowers={() => setShowFollowers(true)}
                    onShowFollowing={() => setShowFollowing(true)}
                    onShareProfile={() => setShowShareProfile(true)}
                />

                <div className="container max-w-4xl py-12">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold font-serif">Stories & Posts</h2>
                        <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
                            {userStories.length} {userStories.length === 1 ? 'Post' : 'Posts'}
                        </span>
                    </div>

                    {storiesLoading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
                        </div>
                    ) : userStories.length === 0 ? (
                        <div className="text-center py-20 border-2 border-dashed rounded-2xl bg-muted/30">
                            <p className="text-muted-foreground mb-2">No stories or posts yet.</p>
                            {currentUser?.id === profileUser.id && (
                                <button
                                    onClick={() => window.location.href = '/share'}
                                    className="text-primary font-medium hover:underline"
                                >
                                    Share your first story
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {userStories.map((story, index) => (
                                <StoryCard key={story.id} story={story} index={index} />
                            ))}
                        </div>
                    )}
                </div>

                {/* Dialogs */}
                <UserListDialog
                    open={showFollowers}
                    onOpenChange={setShowFollowers}
                    title="Followers"
                    users={followers || []}
                    isLoading={followersLoading}
                    currentUserFollowing={currentUser?.following || []}
                />

                <UserListDialog
                    open={showFollowing}
                    onOpenChange={setShowFollowing}
                    title="Following"
                    users={following || []}
                    isLoading={followingLoading}
                    currentUserFollowing={currentUser?.following || []}
                />

                <EditProfileDialog
                    open={showEditProfile}
                    onOpenChange={setShowEditProfile}
                    userId={profileUser.id}
                    currentData={{
                        bio: profileUser.bio,
                        avatar: profileUser.avatar,
                        location: profileUser.location,
                        website: profileUser.website,
                    }}
                />

                <ShareProfileDialog
                    open={showShareProfile}
                    onOpenChange={setShowShareProfile}
                    userId={profileUser.id}
                    userName={profileUser.name}
                />
            </div>
            <Footer />
        </>
    );
}
