import { useState, useEffect } from "react";
import { Check, X, Clock, MessageSquare, User, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import type { Story } from "@/types/story";
import { Link } from "react-router-dom";

export default function ModerationList() {
    const [stories, setStories] = useState<Story[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const fetchStories = async () => {
        setIsLoading(true);
        const token = localStorage.getItem("echoes_token");
        try {
            const response = await fetch("/api/admin/stories", {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setStories(data);
            }
        } catch (error) {
            console.error("Failed to fetch stories for moderation:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStories();
    }, []);

    const handleStatusUpdate = async (id: string, status: "approved" | "rejected") => {
        const token = localStorage.getItem("echoes_token");
        try {
            const response = await fetch(`/api/admin/stories/${id}/status`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });

            if (response.ok) {
                toast({
                    title: `Story ${status}`,
                    description: `The story has been ${status} successfully.`
                });
                fetchStories();
            } else {
                toast({
                    title: "Failed to update status",
                    description: "An error occurred while updating the story status.",
                    variant: "destructive"
                });
            }
        } catch (error) {
            console.error("Status update error:", error);
        }
    };

    const pendingStories = stories.filter(s => s.status === "pending");

    if (isLoading) return <div className="text-center py-10">Loading stories...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold font-serif">Pending Approval ({pendingStories.length})</h2>
                <Button variant="outline" size="sm" onClick={fetchStories}>Refresh</Button>
            </div>

            {pendingStories.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed rounded-xl text-muted-foreground">
                    No stories pending moderation. ✨
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {pendingStories.map((story) => (
                        <Card key={story.id} className="overflow-hidden">
                            <div className="flex flex-col md:flex-row">
                                {story.images && story.images.length > 0 && (
                                    <div className="md:w-48 h-32 md:h-auto overflow-hidden">
                                        <img src={story.images[0]} alt={story.title} className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle className="text-xl">{story.title}</CardTitle>
                                                <CardDescription className="flex items-center gap-2 mt-1">
                                                    <User className="h-3 w-3" /> {story.author} • <Clock className="h-3 w-3" /> {story.timeAgo}
                                                </CardDescription>
                                            </div>
                                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200">Pending</Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pb-2">
                                        <p className="text-sm line-clamp-2 text-muted-foreground">{story.excerpt}</p>
                                    </CardContent>
                                    <CardFooter className="flex justify-between border-t bg-muted/30 pt-3">
                                        <div className="flex gap-2">
                                            <Link to={`/story/${story.id}`}>
                                                <Button variant="ghost" size="sm" className="gap-2">
                                                    <Eye className="h-4 w-4" /> View Full
                                                </Button>
                                            </Link>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                className="gap-2"
                                                onClick={() => handleStatusUpdate(story.id, "rejected")}
                                            >
                                                <X className="h-4 w-4" /> Reject
                                            </Button>
                                            <Button
                                                variant="default"
                                                size="sm"
                                                className="gap-2 bg-green-600 hover:bg-green-700"
                                                onClick={() => handleStatusUpdate(story.id, "approved")}
                                            >
                                                <Check className="h-4 w-4" /> Approve
                                            </Button>
                                        </div>
                                    </CardFooter>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {stories.filter(s => s.status !== "pending").length > 0 && (
                <div className="mt-12">
                    <h3 className="text-xl font-bold mb-4">Past Actions</h3>
                    <div className="space-y-2">
                        {stories.filter(s => s.status !== "pending").map(story => (
                            <div key={story.id} className="flex items-center justify-between p-3 border rounded-lg bg-card">
                                <div className="flex items-center gap-3">
                                    <Badge variant={story.status === "approved" ? "default" : "destructive"}>
                                        {story.status}
                                    </Badge>
                                    <span className="font-medium">{story.title}</span>
                                </div>
                                <span className="text-xs text-muted-foreground">Author: {story.author}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
