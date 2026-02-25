import { useState } from "react";
import type { StoryCategory } from "@/types/story";
import { useStories } from "@/hooks/useStories";
import StoryCard from "./StoryCard";
import { useTranslation } from "react-i18next";

const categories: (StoryCategory | "All")[] = [
  "All",
  "Personal",
  "Community",
  "History",
  "Culture",
];

interface StoriesGridProps {
  limit?: number;
}

export default function StoriesGrid({ limit }: StoriesGridProps) {
  const { t } = useTranslation();
  const [active, setActive] = useState<StoryCategory | "All">("All");
  const { stories, isLoading } = useStories();

  const filtered =
    active === "All" ? stories : stories.filter((s) => s.category === active);
  const display = limit ? filtered.slice(0, limit) : filtered;

  if (isLoading) {
    return (
      <section className="py-12 md:py-16">
        <div className="container">
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <span className="ml-3 text-muted-foreground">Loading stories...</span>
          </div>
        </div>
      </section>
    );
  }


  return (
    <section className="py-12 md:py-16">
      <div className="container">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold md:text-3xl font-serif">{t("stories.title")}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("stories.subtitle")}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${active === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-accent"
                  }`}
              >
                {t(`stories.categories.${cat}`)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {display.map((story, i) => (
            <StoryCard key={story.id} story={story} index={i} />
          ))}
        </div>

        {display.length === 0 && (
          <p className="py-16 text-center text-muted-foreground">
            {t("stories.empty")} {t("stories.empty_cta")}
          </p>
        )}
      </div>
    </section>
  );
}
