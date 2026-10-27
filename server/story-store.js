export function mergeStories(remoteStories, localStories) {
    const mergedStories = [...remoteStories];
    const knownIds = new Set(
        remoteStories
            .filter(story => story.id !== undefined && story.id !== null)
            .map(story => String(story.id))
    );

    for (const localStory of localStories) {
        const id = localStory.id === undefined || localStory.id === null
            ? null
            : String(localStory.id);
        if (id === null || !knownIds.has(id)) {
            mergedStories.push(localStory);
            if (id !== null) knownIds.add(id);
        }
    }

    return mergedStories.sort(
        (a, b) => new Date(b.timestamp || b.createdAt).getTime() - new Date(a.timestamp || a.createdAt).getTime()
    );
}

export function toSupabaseStory(story) {
    const allowedKeys = [
        'id', 'title', 'content', 'excerpt', 'author', 'authorId', 'authorInitials',
        'timeAgo', 'category', 'images', 'image', 'isAnonymous', 'hasAudio', 'hasVideo',
        'status', 'language', 'timestamp', 'likes', 'comments', 'felt_this_count',
        'feltthiscount'
    ];
    return Object.fromEntries(
        Object.entries(story).filter(([key]) => allowedKeys.includes(key))
    );
}
