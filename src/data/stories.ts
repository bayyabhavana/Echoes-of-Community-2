import storyCommunity from "@/assets/story-community.jpg";
import storyMemories from "@/assets/story-memories.jpg";
import storyMarket from "@/assets/story-market.jpg";
import storyFestival from "@/assets/story-festival.jpg";
import storyLetters from "@/assets/story-letters.jpg";
import storyLibrary from "@/assets/story-library.jpg";
import type { Story } from "@/types/story";

export const stories: Story[] = [
  {
    id: "1",
    title: "Sunday Gatherings at Grandma's House",
    excerpt:
      "Every Sunday, three generations would gather around grandma's worn wooden table. The smell of fresh bread, the sound of laughter, and stories that connected us to our roots. These moments taught me that home isn't just a place—it's the people who fill it with love.",
    content:
      "Every Sunday, three generations would gather around grandma's worn wooden table. The smell of fresh bread, the sound of laughter, and stories that connected us to our roots. These moments taught me that home isn't just a place—it's the people who fill it with love.\n\nGrandma would start cooking before dawn, her kitchen filling with aromas that drifted through the entire house. We'd arrive one by one—first the early risers, then the teenagers still rubbing sleep from their eyes. By noon, the house was alive.\n\nThe table was always set for more than needed. 'You never know who might stop by,' she'd say. And someone always did. A neighbor, an old friend, sometimes a stranger who'd heard about Grandma's legendary hospitality.\n\nThese Sundays weren't just meals—they were rituals of belonging. In that crowded kitchen, between the clinking of dishes and overlapping conversations, I learned what community really means.",
    author: "Maria Santos",
    authorInitials: "MS",
    timeAgo: "2 hours ago",
    category: "Personal",
    image: storyCommunity,
    likes: 124,
    comments: 18,
    feltThisCount: 67,
    isAnonymous: false,
    hasAudio: false,
    location: { name: "Riverside District", lat: 40.73, lng: -73.99 },
    circle: "grandmas-kitchen",
  },
  {
    id: "2",
    title: "The Photo Album That Survived Three Wars",
    excerpt:
      "Hidden in a leather satchel, passed from mother to daughter, this album carries the faces of those who came before us. Each sepia photograph tells a story of resilience, love letters written in the margins, and the hope that someday, someone would remember.",
    content:
      "Hidden in a leather satchel, passed from mother to daughter, this album carries the faces of those who came before us. Each sepia photograph tells a story of resilience, love letters written in the margins, and the hope that someday, someone would remember.\n\nMy grandmother first wrapped the album in oilskin during the first war. My mother carried it across two borders during the second. I received it on a quiet Tuesday afternoon, still smelling of old leather and time.\n\nThe photographs are fragile now—edges curled, some faces faded beyond recognition. But I know each one. Grandma told me their names on those Sunday afternoons, creating a map of memory that no war could destroy.\n\nNow I'm digitizing them, but I keep the original album close. Some things need to be touched to be truly remembered.",
    author: "Elena Vasquez",
    authorInitials: "EV",
    timeAgo: "5 hours ago",
    category: "History",
    image: storyMemories,
    likes: 287,
    comments: 42,
    feltThisCount: 156,
    isAnonymous: false,
    hasAudio: true,
    location: { name: "Old Town", lat: 40.71, lng: -74.01 },
    circle: "lost-and-found",
  },
  {
    id: "3",
    title: "The Market That Keeps Our Community Alive",
    excerpt:
      "Every Saturday morning, our small town comes alive. Local farmers share their harvest, neighbors catch up over coffee, and children learn that community is built through small, consistent acts of showing up for each other.",
    content:
      "Every Saturday morning, our small town comes alive. Local farmers share their harvest, neighbors catch up over coffee, and children learn that community is built through small, consistent acts of showing up for each other.\n\nThe market started thirty years ago with three tables under a canvas tent. Now it stretches across the entire square, a patchwork of colors and voices that defines our Saturday mornings.\n\nMr. Kim still sells his famous kimchi from the same corner. The Rodriguez family brings fresh empanadas. Mrs. Thompson's jam has its own following. Each vendor isn't just selling—they're sharing a piece of themselves.\n\nFor newcomers, the market is the gateway to belonging. You start as a customer, but within weeks you're exchanging recipes, watching each other's children, and feeling the invisible threads that weave a community together.",
    author: "James Chen",
    authorInitials: "JC",
    timeAgo: "Yesterday",
    category: "Community",
    image: storyMarket,
    likes: 156,
    comments: 23,
    feltThisCount: 89,
    isAnonymous: false,
    hasAudio: false,
    location: { name: "Market Square", lat: 40.75, lng: -73.97 },
    circle: "street-corners",
  },
  {
    id: "4",
    title: "Dancing Through Generations: Our Festival Tradition",
    excerpt:
      "The drums start, and suddenly age doesn't matter. Grandmothers teach grandchildren the steps their grandmothers taught them. In these moments of celebration, we're not just preserving culture—we're living it, breathing it, becoming it.",
    content:
      "The drums start, and suddenly age doesn't matter. Grandmothers teach grandchildren the steps their grandmothers taught them. In these moments of celebration, we're not just preserving culture—we're living it, breathing it, becoming it.\n\nOur annual festival has been running for over a century. The dances change slightly each generation—a new flourish here, a modern beat there—but the heart remains the same. Movement as language. Rhythm as memory.\n\nI remember my first dance at age five, held in my grandmother's arms, her feet guiding mine. Now I lead the children's group, watching their faces light up with the same wonder I felt.\n\nLast year, a teenager created a fusion piece—traditional steps set to electronic music. Some elders frowned, but my grandmother smiled. 'That's how traditions survive,' she whispered. 'They dance with the times.'",
    author: "Priya Sharma",
    authorInitials: "PS",
    timeAgo: "2 days ago",
    category: "Culture",
    image: storyFestival,
    likes: 312,
    comments: 56,
    feltThisCount: 198,
    isAnonymous: false,
    hasAudio: true,
    location: { name: "Cultural Center", lat: 40.76, lng: -73.98 },
    circle: "first-days",
  },
  {
    id: "5",
    title: "Letters Never Sent: A Father's Silent Love",
    excerpt:
      "After he passed, I found a drawer full of letters addressed to me. Birthday wishes, congratulations, apologies—all the words he couldn't say out loud. Some love speaks loudest in silence.",
    content:
      "After he passed, I found a drawer full of letters addressed to me. Birthday wishes, congratulations, apologies—all the words he couldn't say out loud. Some love speaks loudest in silence.\n\nThe drawer was in his old desk, the one he sat at every evening after dinner. I always assumed he was doing bills. Instead, he was writing to me.\n\nThere were forty-three letters spanning twenty years. Each one started the same way: 'Dear David, I wanted to tell you...' Some were a single paragraph. Others filled pages.\n\nThe birthday letter from my sixteenth year is my favorite. He wrote about the day I was born, how he held me and promised to be brave—not for himself, but for me. He kept that promise in the only way he knew how.\n\nI've started writing letters of my own now. Not to send. Just to say the things that are hardest to speak.",
    author: "David Park",
    authorInitials: "DP",
    timeAgo: "3 days ago",
    category: "Personal",
    image: storyLetters,
    likes: 428,
    comments: 89,
    feltThisCount: 312,
    isAnonymous: false,
    hasAudio: false,
    location: { name: "Memorial Garden", lat: 40.72, lng: -74.0 },
    circle: "unspoken-words",
  },
  {
    id: "6",
    title: "How Our Neighborhood Library Changed Everything",
    excerpt:
      "It started with a little free library in Mrs. Thompson's front yard. Now we have book clubs, story hours, and a community that reads together. Sometimes the smallest gestures create the biggest waves.",
    content:
      "It started with a little free library in Mrs. Thompson's front yard. Now we have book clubs, story hours, and a community that reads together. Sometimes the smallest gestures create the biggest waves.\n\nMrs. Thompson built it from an old mailbox, painted it sky blue, and filled it with her favorite novels. Within a week, neighbors were adding their own books. Within a month, someone suggested a reading group.\n\nNow we have three book clubs, a children's story hour every Wednesday, and a quarterly 'blind date with a book' event that brings together the most unlikely readers.\n\nBut the real magic happens in the quiet moments—when a teenager discovers their first beloved author, when an elderly neighbor finds a friend through shared literary taste, when a child writes their first story and leaves it in the little library for someone to find.\n\nMrs. Thompson just wanted to share her books. She ended up building a community.",
    author: "Sarah Johnson",
    authorInitials: "SJ",
    timeAgo: "4 days ago",
    category: "Community",
    image: storyLibrary,
    likes: 198,
    comments: 34,
    feltThisCount: 124,
    isAnonymous: false,
    hasAudio: false,
    location: { name: "Elm Street", lat: 40.74, lng: -73.96 },
    circle: "street-corners",
  },
  {
    id: "7",
    title: "The Sound of Rain on a Tin Roof",
    excerpt:
      "There's a melody in the rain that only those who grew up with tin roofs understand. It's the sound of childhood, of safety, of knowing that no matter how loud the storm, you're sheltered by something honest and imperfect.",
    content:
      "There's a melody in the rain that only those who grew up with tin roofs understand. It's the sound of childhood, of safety, of knowing that no matter how loud the storm, you're sheltered by something honest and imperfect.\n\nWe didn't have much, but we had that roof. My mother would hum along with the rain, turning storms into concerts. My brother would drum on the floor, adding percussion to nature's symphony.\n\nI live in a modern apartment now with proper insulation and silent windows. When it rains, I barely notice. Sometimes I play recordings of rain on tin, and for a few minutes, I'm seven years old again, safe and warm, listening to my mother hum.",
    author: "Anonymous Storyteller",
    authorInitials: "AS",
    timeAgo: "5 days ago",
    category: "Personal",
    image: storyCommunity,
    likes: 267,
    comments: 45,
    feltThisCount: 234,
    isAnonymous: true,
    hasAudio: true,
    location: { name: "Riverside District", lat: 40.73, lng: -73.99 },
    circle: "unspoken-words",
  },
];
