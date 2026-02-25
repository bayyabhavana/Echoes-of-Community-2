export type StoryCategory = "Personal" | "Community" | "History" | "Culture";

export interface StoryLocation {
  name: string;
  lat: number;
  lng: number;
}

export interface Story {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  authorInitials: string;
  timeAgo: string;
  category: StoryCategory;
  images: string[];
  likes: number;
  comments: number;
  feltThisCount: number;
  isAnonymous: boolean;
  hasAudio: boolean;
  hasVideo: boolean;
  location?: StoryLocation;
  circle?: string;
  audioUrl?: string;
  videoUrl?: string;
  language?: string;
  status: "pending" | "approved" | "rejected";
}


export interface StoryCircle {
  id: string;
  name: string;
  description: string;
  storyCount: number;
  icon: string;
  gradient: string;
}

export interface WritingPrompt {
  id: string;
  text: string;
  category: "sensory" | "emotional" | "relational" | "temporal";
}
