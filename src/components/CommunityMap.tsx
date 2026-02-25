import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { MapPin, ChevronRight } from "lucide-react";
import { useStories } from "@/hooks/useStories";
import { motion } from "framer-motion";

const categoryColors: Record<string, string> = {
  Personal: "bg-story-personal",
  History: "bg-story-history",
  Community: "bg-story-community",
  Culture: "bg-story-culture",
};

export default function CommunityMap() {
  const { stories } = useStories();

  // Dynamically derive locations from stories
  const dynamicLocations = useMemo(() => {
    const locMap = new Map<string, { name: string; storyCount: number; category: string }>();

    stories.forEach(story => {
      if (story.location?.name) {
        const existing = locMap.get(story.location.name);
        if (existing) {
          existing.storyCount++;
        } else {
          locMap.set(story.location.name, {
            name: story.location.name,
            storyCount: 1,
            category: story.category
          });
        }
      }
    });

    return Array.from(locMap.values());
  }, [stories]);

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-accent/30 p-8 md:p-12 min-h-[500px] border border-border/50">
        {/* Background texture for map feel */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Dynamic markers */}
        <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {dynamicLocations.map((loc, i) => {
            const storiesAtLocation = stories.filter(
              (s) => s.location?.name === loc.name
            );
            const colorClass = categoryColors[loc.category] || "bg-primary";

            return (
              <motion.div
                key={loc.name}
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
                className="group relative flex flex-col rounded-xl border border-border/50 bg-card/95 p-5 shadow-sm backdrop-blur-sm transition-all hover:story-card-shadow hover:-translate-y-1"
              >
                <div className="flex items-start gap-4">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${colorClass}/10 ring-4 ring-background`}>
                    <MapPin className={`h-5 w-5`} style={{ color: `hsl(var(--primary))` }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold leading-tight group-hover:text-primary transition-colors">{loc.name}</h3>
                    <p className="text-xs font-medium text-muted-foreground mt-0.5">
                      {loc.storyCount} {loc.storyCount === 1 ? "reflection" : "reflections"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  {storiesAtLocation.slice(0, 3).map((s) => (
                    <Link
                      key={s.id}
                      to={`/story/${s.id}`}
                      className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors"
                    >
                      <div className="h-1 w-1 rounded-full bg-primary/40" />
                      <span className="truncate">{s.title}</span>
                      <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
                    </Link>
                  ))}
                  {storiesAtLocation.length > 3 && (
                    <p className="text-[10px] text-muted-foreground/60 italic pl-3">
                      + {storiesAtLocation.length - 3} more stories at this spot
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}

          {dynamicLocations.length === 0 && (
            <div className="col-span-full py-20 text-center">
              <p className="text-muted-foreground">Shadows found no stories with locations yet.</p>
              <Link to="/share" className="mt-4 inline-block text-primary hover:underline font-medium">
                Add the first marker to our map
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

