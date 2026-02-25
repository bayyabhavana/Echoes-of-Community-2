import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import Index from "./pages/Index";
import LoginPage from "./pages/LoginPage";
import StoriesPage from "./pages/StoriesPage";
import StoryDetailPage from "./pages/StoryDetailPage";
import ShareStoryPage from "./pages/ShareStoryPage";
import EditStoryPage from "./pages/EditStoryPage";
import CircleDetailPage from "./pages/CircleDetailPage";
import StoryCirclesPage from "./pages/StoryCirclesPage";
import AdminModeration from "./pages/AdminModeration";

import MapViewPage from "./pages/MapViewPage";
import BookmarksPage from "./pages/BookmarksPage";
import ProfilePage from "./pages/ProfilePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/stories" element={<StoriesPage />} />
            <Route path="/story/:id" element={<StoryDetailPage />} />
            <Route path="/share" element={<ShareStoryPage />} />
            <Route path="/edit-story/:id" element={<EditStoryPage />} />
            <Route path="/circle/:id" element={<CircleDetailPage />} />
            <Route path="/circles" element={<StoryCirclesPage />} />

            <Route path="/map" element={<MapViewPage />} />
            <Route path="/bookmarks" element={<BookmarksPage />} />
            <Route path="/profile/:id" element={<ProfilePage />} />
            <Route path="/admin/moderation" element={<AdminModeration />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

