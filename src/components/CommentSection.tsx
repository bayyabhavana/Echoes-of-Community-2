import { useState } from "react";
import { Send, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import type { Comment } from "@/hooks/useInteractions";

interface CommentSectionProps {
    comments: Comment[];
    onAddComment: (author: string, text: string) => void;
}

export default function CommentSection({ comments, onAddComment }: CommentSectionProps) {
    const [newComment, setNewComment] = useState("");
    const { user } = useAuth();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        onAddComment(user?.name || "Guest", newComment.trim());
        setNewComment("");
    };

    return (
        <div className="mt-12 space-y-8 border-t border-border/50 pt-8">
            <div>
                <h3 className="text-xl font-bold">Comments ({comments.length})</h3>
                <p className="text-sm text-muted-foreground">Share your thoughts with the community</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <Textarea
                    placeholder={user ? "Write a comment..." : "Sign in to comment as yourself, or post as Guest..."}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={3}
                    className="resize-none"
                />
                <div className="flex justify-between items-center">
                    <p className="text-xs text-muted-foreground">
                        {user ? `Posting as ${user.name}` : "Posting as Guest"}
                    </p>
                    <Button type="submit" size="sm" className="gap-2" disabled={!newComment.trim()}>
                        <Send className="h-4 w-4" />
                        Post Comment
                    </Button>
                </div>
            </form>

            <div className="space-y-6">
                {comments.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-xl">
                        No comments yet. Be the first to share your reflection! ✨
                    </p>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="flex gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                                {comment.author.split(" ").map(n => n[0]).join("")}
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-sm">{comment.author}</span>
                                    <span className="text-xs text-muted-foreground">• {comment.timestamp}</span>
                                </div>
                                <p className="text-sm text-foreground/80 leading-relaxed">
                                    {comment.text}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
