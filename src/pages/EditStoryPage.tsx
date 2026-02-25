import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useStories } from "@/hooks/useStories";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ShareStoryForm from "@/components/ShareStoryForm";

export default function EditStoryPage() {
    const { id } = useParams();
    const { stories } = useStories();
    const story = stories.find((s) => s.id === id);

    if (!story) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <div className="container py-20 text-center">
                    <h1 className="text-2xl font-bold">Story not found</h1>
                    <Link to="/stories" className="mt-4 inline-block text-primary hover:underline">
                        Back to stories
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="container py-12">
                <div className="mx-auto max-w-2xl">
                    <Link
                        to={`/story/${id}`}
                        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to story
                    </Link>

                    <div className="mb-10">
                        <h1 className="mb-2 text-4xl font-bold tracking-tight">Edit Your Story</h1>
                        <p className="text-lg text-muted-foreground">
                            Refine your reflection and continue the conversation.
                        </p>
                    </div>

                    <ShareStoryForm initialData={story} isEditing={true} />
                </div>
            </main>
            <Footer />
        </div>
    );
}
