import { Link } from "react-router-dom";
import { storyCircles } from "@/data/storyCircles";
import { stories } from "@/data/stories";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function StoryCirclesPage() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-10">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold md:text-4xl font-serif">{t("circles.title")}</h1>
          <p className="mt-2 text-muted-foreground">
            {t("circles.subtitle")}
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {storyCircles.map((circle, i) => {
            const circleStories = stories.filter((s) => s.circle === circle.id);
            return (
              <Link key={circle.id} to={`/circle/${circle.id}`}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`group h-full rounded-xl bg-gradient-to-br ${circle.gradient} p-6 transition-all hover:story-card-shadow border border-border/30`}
                >
                  <span className="text-3xl">{circle.icon}</span>
                  <h3 className="mt-3 text-lg font-semibold font-serif">{circle.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                    {circle.description}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">
                      {t("circles.stories_count", { count: circleStories.length })}
                    </span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                  </div>
                  {circleStories.length > 0 && (
                    <div className="mt-3 space-y-1 border-t border-border/30 pt-3">
                      {circleStories.slice(0, 2).map((s) => (
                        <div
                          key={s.id}
                          className="block truncate text-xs text-muted-foreground group-hover:text-primary transition-colors"
                        >
                          • {s.title}
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              </Link>
            );
          })}
        </div>

      </main>
      <Footer />
    </div>
  );
}
