import { useState, useEffect } from "react";
import { writingPrompts } from "@/data/writingPrompts";
import { Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface WritingPromptsProps {
  onInsert?: (text: string) => void;
}

export default function WritingPrompts({ onInsert }: WritingPromptsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % writingPrompts.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const prompt = writingPrompts[currentIndex];

  return (
    <div className="rounded-xl border border-border/50 bg-accent/30 p-4">
      <div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <Sparkles className="h-3.5 w-3.5 text-primary" />
        Gentle memory prompt
      </div>
      <AnimatePresence mode="wait">
        <motion.button
          key={prompt.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.4 }}
          onClick={() => onInsert?.(prompt.text)}
          className="text-left text-sm italic text-foreground/80 hover:text-primary transition-colors"
        >
          "{prompt.text}"
        </motion.button>
      </AnimatePresence>
      <div className="mt-3 flex gap-1">
        {writingPrompts.slice(0, 6).map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i === currentIndex % 6 ? "bg-primary" : "bg-border"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
