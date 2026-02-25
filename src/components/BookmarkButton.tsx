import { Bookmark } from "lucide-react";
import { useBookmarks } from "@/hooks/useBookmarks";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

interface BookmarkButtonProps {
  storyId: string;
}

export default function BookmarkButton({ storyId }: BookmarkButtonProps) {
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const active = isBookmarked(storyId);
  const { toast } = useToast();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleBookmark(storyId);
    toast({
      description: active
        ? "Removed from your reflections"
        : "Saved for personal reflection ✨",
      duration: 2000,
    });
  };

  return (
    <motion.button
      whileTap={{ scale: 0.85 }}
      onClick={handleClick}
      className={`rounded-full p-1 transition-colors ${
        active
          ? "text-bookmark-active"
          : "text-muted-foreground hover:text-bookmark"
      }`}
      title={active ? "Remove bookmark" : "Save for reflection"}
    >
      <Bookmark
        className="h-4 w-4"
        fill={active ? "currentColor" : "none"}
      />
    </motion.button>
  );
}
