import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, MessageCircle, Share2, MapPin, Trash2, Edit2, ChevronRight, Bookmark } from "lucide-react";
import { useTranslation } from "react-i18next";


import { useStories } from "@/hooks/useStories";
import { useInteractions } from "@/hooks/useInteractions";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FeltThisButton from "@/components/FeltThisButton";
import BookmarkButton from "@/components/BookmarkButton";
import AudioPlayer from "@/components/AudioPlayer";
import CommentSection from "@/components/CommentSection";
import { handleShare } from "@/utils/share";
import { storyCircles } from "@/data/storyCircles";



const categoryColors: Record<string, string> = {
  Personal: "bg-story-personal/10 text-story-personal",
  Community: "bg-story-community/10 text-story-community",
  History: "bg-story-history/10 text-story-history",
  Culture: "bg-story-culture/10 text-story-culture",
};

export default function StoryDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const { stories, deleteStory } = useStories();
  const story = stories.find((s) => s.id === id);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const { likes, comments, commentList, userLiked, toggleLike, addComment } = useInteractions(
    story?.id || "",
    story?.likes || 0,
    story?.comments || 0
  );

  if (!story) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold">{t("stories.story_not_found")}</h1>
          <Link to="/stories" className="mt-4 inline-block text-primary hover:underline">
            {t("stories.back_to_stories")}
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = story.id.includes("-") && !story.isAnonymous;

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this story?")) {
      deleteStory(story.id);
      toast({
        title: "Story deleted",
        description: "Your story has been removed from the archive.",
      });
      navigate("/stories");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container max-w-3xl py-8">
        <div className="mb-6 flex items-center justify-between">
          <Link to="/stories" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            {t("stories.back_to_stories")}
          </Link>
          {isOwner && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(`/edit-story/${story.id}`)}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              >
                <Edit2 className="h-3.5 w-3.5" />
                {t("stories.edit_story")}
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
                {t("stories.delete_story")}
              </button>
            </div>
          )}
        </div>

        <div className="mb-8 space-y-4">
          <div className="relative aspect-[2/1] overflow-hidden rounded-2xl bg-muted shadow-lg">
            <img
              src={story.images?.[0] || "https://placehold.co/800x400/312e81/ffffff?text=Echoes+of+Community"}
              alt={story.title}
              className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
            />
          </div>

          {story.images && story.images.length > 1 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {story.images.slice(1).map((img, idx) => (
                <div key={idx} className="relative aspect-square overflow-hidden rounded-xl bg-muted shadow-md group">
                  <img
                    src={img}
                    alt={`${story.title} image ${idx + 2}`}
                    className="h-full w-full object-cover transition-all duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              {story.isAnonymous ? "🌿" : story.authorInitials}
            </div>
            <div>
              <p className="font-medium">{story.isAnonymous ? "Anonymous Storyteller" : story.author}</p>
              <p className="text-xs text-muted-foreground">{story.timeAgo}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {story.circle && (
              <Link
                to={`/circle/${story.circle}`}
                className="rounded-full bg-secondary/50 px-3 py-1 text-xs font-medium hover:bg-secondary transition-colors"
              >
                {storyCircles.find(c => c.id === story.circle)?.icon} {storyCircles.find(c => c.id === story.circle)?.name}
              </Link>
            )}
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${categoryColors[story.category]}`}>
              {t(`stories.categories.${story.category}`)}
            </span>
          </div>
        </div>


        <h1 className="mb-4 text-3xl font-bold leading-tight md:text-4xl font-serif">{story.title}</h1>

        {story.location && (
          <Link
            to={`/map?location=${encodeURIComponent(story.location.name)}`}
            className="mb-6 inline-flex items-center gap-2 rounded-full bg-accent/50 px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-primary transition-all group"
          >
            <MapPin className="h-4 w-4 transition-transform group-hover:scale-110" />
            <span className="font-medium">{story.location.name}</span>
            <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        )}


        {story.hasVideo && (
          <div className="mb-8 overflow-hidden rounded-2xl bg-black shadow-xl aspect-video">
            <video
              src={story.videoUrl}
              controls
              autoPlay
              playsInline
              className="h-full w-full object-contain"
              poster={story.images?.[0]}
            />
          </div>
        )}

        {story.hasAudio && (
          <div className="mb-6">
            <p className="mb-2 text-sm font-medium text-muted-foreground">🎧 {t("stories.listen_audio")}</p>
            <AudioPlayer audioUrl={story.audioUrl} />
          </div>
        )}

        <article className="prose prose-warm max-w-none">
          {story.content.split("\n\n").map((p, i) => (
            <p key={i} className="mb-4 leading-relaxed text-foreground/85">{p}</p>
          ))}
        </article>

        <div className="mt-8 flex items-center justify-between border-t border-border/50 pt-4">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleLike}
              className={`flex items-center gap-1.5 text-sm transition-colors ${userLiked ? 'text-primary font-medium' : 'text-muted-foreground hover:text-primary'}`}
            >
              <Heart className={`h-4 w-4 ${userLiked ? 'fill-current' : ''}`} />
              {likes}
            </button>
            <button
              onClick={() => {
                document.getElementById('comment-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
            >
              <MessageCircle className="h-4 w-4" /> {comments}
            </button>
            <button
              onClick={() => handleShare(story)}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
            >
              <Share2 className="h-4 w-4" />
              {t("stories.share_action")}
            </button>
          </div>
          <div className="flex items-center gap-3">
            <FeltThisButton storyId={story.id} count={story.feltThisCount} />
            <BookmarkButton storyId={story.id} />
          </div>
        </div>

        <div id="comment-section">
          <CommentSection
            comments={commentList}
            onAddComment={addComment}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
