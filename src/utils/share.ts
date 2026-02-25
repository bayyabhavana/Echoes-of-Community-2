import { toast } from "sonner";

export async function handleShare(story: { title: string; id: string }) {
    const shareData = {
        title: story.title,
        text: `Check out this story on Echoes: ${story.title}`,
        url: `${window.location.origin}/story/${story.id}`,
    };

    try {
        if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
            await navigator.share(shareData);
        } else {
            await navigator.clipboard.writeText(shareData.url);
            toast.success("Link copied to clipboard! 📋");
        }
    } catch (err) {
        if ((err as Error).name !== "AbortError") {
            console.error("Error sharing:", err);
            // Fallback to clipboard if share fails for other reasons
            await navigator.clipboard.writeText(shareData.url);
            toast.success("Link copied to clipboard! 📋");
        }
    }
}
