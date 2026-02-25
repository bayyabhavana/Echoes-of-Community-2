import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { storyCircles } from "@/data/storyCircles";
import { useStories } from "@/hooks/useStories";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StoryCard from "@/components/StoryCard";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

export default function CircleDetailPage() {
    const { t } = useTranslation();
    const { id } = useParams();
    const { stories } = useStories();

    const circle = storyCircles.find((c) => c.id === id);
    const circleStories = stories.filter((s) => s.circle === id);

    if (!circle) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <div className="container py-20 text-center">
                    <h1 className="text-2xl font-bold">{t("circles.not_found")}</h1>
                    <Link to="/circles" className="mt-4 inline-block text-primary hover:underline">
                        {t("circles.back")}
                    </Link>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main>
                <div className={`bg-gradient-to-br ${circle.gradient} py-16 md:py-24`}>
                    <div className="container">
                        <Link
                            to="/circles"
                            className="mb-8 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            {t("circles.back")}
                        </Link>
                        <div className="max-w-3xl">
                            <span className="text-5xl">{circle.icon}</span>
                            <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl font-serif">
                                {circle.name}
                            </h1>
                            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
                                {circle.description}
                            </p>
                            <div className="mt-6 flex items-center gap-4">
                                <span className="rounded-full bg-background/50 backdrop-blur-sm px-4 py-1 text-sm font-medium">
                                    {t("circles.reflections_shared", { count: circleStories.length })}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container py-12 md:py-16">
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold font-serif">{t("circles.reflections_title")}</h2>
                        <p className="text-muted-foreground">{t("circles.reflections_subtitle")}</p>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {circleStories.map((story, i) => (
                            <StoryCard key={story.id} story={story} index={i} />
                        ))}
                    </div>

                    {circleStories.length === 0 && (
                        <div className="py-20 text-center">
                            <p className="text-muted-foreground">{t("circles.empty")}</p>
                            <Link to="/share" className="mt-4 inline-block text-primary hover:underline">
                                {t("circles.empty_cta")}
                            </Link>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
