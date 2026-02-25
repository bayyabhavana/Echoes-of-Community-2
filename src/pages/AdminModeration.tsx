import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ModerationList from "@/components/ModerationList";
import { ShieldAlert } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";

export default function AdminModeration() {
    const { user, isLoading } = useAuth();

    if (isLoading) return null;

    // Direct check for admin role
    if (!user || user.role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 container py-10">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-primary/10 rounded-full">
                            <ShieldAlert className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold font-serif">Content Moderation</h1>
                            <p className="text-muted-foreground">Review and approve community stories and media</p>
                        </div>
                    </div>

                    <ModerationList />
                </div>
            </main>
            <Footer />
        </div>
    );
}
