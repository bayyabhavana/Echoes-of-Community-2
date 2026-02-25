import type { WritingPrompt } from "@/types/story";

export const writingPrompts: WritingPrompt[] = [
  {
    id: "1",
    text: "What sounds do you remember from that moment?",
    category: "sensory",
  },
  {
    id: "2",
    text: "What was the light like? Morning sun? Candlelight? Streetlamps?",
    category: "sensory",
  },
  {
    id: "3",
    text: "Was there a particular smell that brings you back to this memory?",
    category: "sensory",
  },
  {
    id: "4",
    text: "What were your hands doing while this happened?",
    category: "sensory",
  },
  {
    id: "5",
    text: "How did this moment make you feel? Not what you thought—what you felt.",
    category: "emotional",
  },
  {
    id: "6",
    text: "If you could whisper something to your past self in this moment, what would it be?",
    category: "emotional",
  },
  {
    id: "7",
    text: "What part of this story do you still carry with you today?",
    category: "emotional",
  },
  {
    id: "8",
    text: "Who was there with you? What did their presence mean?",
    category: "relational",
  },
  {
    id: "9",
    text: "Was there someone who never knew how much this moment meant to you?",
    category: "relational",
  },
  {
    id: "10",
    text: "Who would you want to share this memory with?",
    category: "relational",
  },
  {
    id: "11",
    text: "How old were you? What season was it?",
    category: "temporal",
  },
  {
    id: "12",
    text: "What happened just before this moment? What came after?",
    category: "temporal",
  },
  {
    id: "13",
    text: "Is this a memory you return to often, or one that surprised you just now?",
    category: "temporal",
  },
];
