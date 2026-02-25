import { useFeltThis } from "@/hooks/useFeltThis";
import { motion, AnimatePresence } from "framer-motion";

interface FeltThisButtonProps {
  storyId: string;
  count: number;
}

export default function FeltThisButton({ storyId, count }: FeltThisButtonProps) {
  const { hasFeltThis, toggleFeltThis } = useFeltThis();
  const active = hasFeltThis(storyId);

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFeltThis(storyId);
      }}
      className={`group/felt flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium transition-all ${
        active
          ? "bg-felt-this-active/15 text-felt-this-active felt-this-glow"
          : "text-muted-foreground hover:bg-felt-this/10 hover:text-felt-this"
      }`}
      title="I felt this too"
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={active ? "active" : "inactive"}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="text-sm"
        >
          {active ? "🤝" : "🫂"}
        </motion.span>
      </AnimatePresence>
      <span>{active ? count + 1 : count}</span>
    </button>
  );
}
