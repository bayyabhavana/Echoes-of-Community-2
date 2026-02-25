import { Heart, MessageCircle, Share2, Headphones, Trash2, Edit2, MapPin, Video, MoreVertical, Edit } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "react-i18next";
import type { Story } from "@/types/story";
import FeltThisButton from "./FeltThisButton";
import BookmarkButton from "./BookmarkButton";
import { motion } from "framer-motion";
import { useInteractions } from "@/hooks/useInteractions";
import { useAuth } from "@/hooks/useAuth";
import { useStories } from "@/hooks/useStories";
import { useToast } from "@/hooks/use-toast";
import { handleShare } from "@/utils/share";
import { storyCircles } from "@/data/storyCircles";



const categoryColors: Record<string, string> = {
  Personal: "bg-story-personal/10 text-story-personal",
  Community: "bg-story-community/10 text-story-community",
  History: "bg-story-history/10 text-story-history",
  Culture: "bg-story-culture/10 text-story-culture",
};

interface StoryCardProps {
  story: Story;
  index?: number;
}

export default function StoryCard({ story, index = 0 }: StoryCardProps) {
  const { t } = useTranslation();
  const { likes, comments, userLiked, toggleLike, addComment } = useInteractions(story.id, story.likes, story.comments);
  const { user } = useAuth();
  const { deleteStory } = useStories();
  const { toast } = useToast();
  const navigate = useNavigate();

  const isOwner = story.id.includes("-") && !story.isAnonymous; // Heuristic for user-uploaded stories (UUID vs simple id)

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this story?")) {
      deleteStory(story.id);
      toast({
        title: "Story deleted",
        description: "Your story has been removed from the archive.",
      });
    }
  };

  const onShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleShare(story);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/edit-story/${story.id}`);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: (index || 0) * 0.1 }}
      className="group relative flex flex-col overflow-hidden rounded-xl bg-card story-card-shadow transition-all duration-300"
    >
      <Link to={`/story/${story.id}`} className="block">
        <div className="relative aspect-[16/10] overflow-hidden">
          {story.hasVideo && story.videoUrl ? (
            <video
              src={story.videoUrl}
              poster={story.images?.[0]}
              muted
              autoPlay
              loop
              playsInline
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <img
              src={story.images?.[0]}
              alt={story.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          )}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            {story.location && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  navigate(`/map?location=${encodeURIComponent(story.location.name)}`);
                }}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-card/90 text-primary backdrop-blur-sm transition-transform hover:scale-110"
                title={t("stories.view_on_map", { location: story.location.name })}
              >
                <MapPin className="h-4 w-4" />
              </button>
            )}
            {story.hasAudio && (
              <div className="flex items-center gap-1.5 rounded-full bg-card/90 px-2.5 py-1 text-xs font-medium text-audio-accent backdrop-blur-sm">
                <Headphones className="h-3 w-3" />
                {t("stories.badge_audio")}
              </div>
            )}
            {story.hasVideo && (
              <div className="flex items-center gap-1.5 rounded-full bg-card/90 px-2.5 py-1 text-xs font-medium text-primary backdrop-blur-sm">
                <Video className="h-3 w-3" />
                {t("stories.badge_video")}
              </div>
            )}
            {story.language && (
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-card/90 text-[10px] font-bold uppercase text-muted-foreground backdrop-blur-sm">
                {story.language}
              </div>
            )}
          </div>
          <div className="absolute top-3 right-3 opacity-0 transition-opacity group-hover:opacity-100">
            {user && (user.id === "user-1" || story.author === user.name) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8 rounded-full bg-card/90 backdrop-blur-sm"
                    onClick={(e) => e.preventDefault()}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleEdit}>
                    <Edit className="mr-2 h-4 w-4" />
                    <span>{t("stories.edit_story")}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      deleteStory(story.id);
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Delete Story</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              {story.isAnonymous ? "🌿" : story.authorInitials}
            </div>
            <div>
              <p className="text-sm font-medium">
                {story.isAnonymous ? "Anonymous Storyteller" : story.author}
              </p>
              <p className="text-xs text-muted-foreground">{story.timeAgo}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {story.circle && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  navigate(`/circle/${story.circle}`);
                }}
                className="rounded-full bg-secondary/50 px-2.5 py-0.5 text-xs font-medium hover:bg-secondary transition-colors"
                title={`Part of the ${storyCircles.find(c => c.id === story.circle)?.name} circle`}
              >
                {storyCircles.find(c => c.id === story.circle)?.icon} {storyCircles.find(c => c.id === story.circle)?.name}
              </button>
            )}
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${categoryColors[story.category]}`}
            >
              {t(`stories.categories.${story.category}`)}
            </span>

          </div>
        </div>

        <Link to={`/story/${story.id}`}>
          <h3 className="mb-1.5 text-lg font-semibold leading-snug transition-colors group-hover:text-primary">
            {story.title}
          </h3>
        </Link>

        <p className="mb-4 flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-3">
          {story.excerpt}
        </p>

        <div className="flex items-center justify-between border-t border-border/50 pt-3">
          <div className="flex items-center gap-3">
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleLike(); }}
              className={`flex items-center gap-1 text-xs transition-colors ${userLiked ? 'text-primary font-medium' : 'text-muted-foreground hover:text-primary'}`}
            >
              <Heart className={`h-3.5 w-3.5 ${userLiked ? 'fill-current' : ''}`} />
              {likes}
            </button>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate(`/story/${story.id}#comment-section`); }}
              className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-primary"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              {comments}
            </button>
            <button
              onClick={onShare}
              className="text-muted-foreground transition-colors hover:text-primary"
              title="Share story"
            >
              <Share2 className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <FeltThisButton storyId={story.id} count={story.feltThisCount} />
            <BookmarkButton storyId={story.id} />
          </div>
        </div>
      </div>
    </motion.article>

  );
}
