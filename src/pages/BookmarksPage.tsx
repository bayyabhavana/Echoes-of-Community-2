import { useBookmarks } from "@/hooks/useBookmarks";
import { useStories } from "@/hooks/useStories";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StoryCard from "@/components/StoryCard";
import { Bookmark, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

export default function BookmarksPage() {
  const { t } = useTranslation();
  const { bookmarkedIds } = useBookmarks();
  const { stories } = useStories();
  const saved = stories.filter((s) => bookmarkedIds.has(s.id));

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-10 lg:py-16">
        <div className="mb-12 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4"
          >
            <Bookmark className="h-4 w-4 fill-current" />
            {t("bookmarks.badge")}
          </motion.div>
          <h1 className="text-3xl font-bold tracking-tight md:text-5xl font-serif">{t("bookmarks.title")}</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t("bookmarks.subtitle")}
          </p>
        </div>

        {saved.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {saved.map((story, i) => (
              <StoryCard key={story.id} story={story} index={i} />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-border/50 rounded-3xl bg-accent/5 backdrop-blur-sm"
          >
            <div className="relative mb-6">
              <Bookmark className="h-16 w-16 text-muted-foreground/20" />
              <Sparkles className="absolute -top-1 -right-1 h-6 w-6 text-primary/40" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight font-serif">{t("bookmarks.empty_title")}</h2>
            <p className="mt-2 text-muted-foreground max-w-sm">
              {t("bookmarks.empty_subtitle")}
            </p>
            <Button asChild size="lg" className="mt-8 rounded-full px-8 flex items-center gap-2">
              <Link to="/stories">
                {t("bookmarks.explore_cta")}
              </Link>
            </Button>
          </motion.div>
        )}
      </main>
      <Footer />
    </div>
  );
}

