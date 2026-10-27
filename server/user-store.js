function normalizeEmail(email) {
    return typeof email === 'string' ? email.trim().toLowerCase() : '';
}

export function mergeUsers(remoteUsers, localUsers) {
    const localById = new Map(
        localUsers
            .filter(user => user.id !== undefined && user.id !== null)
            .map(user => [String(user.id), user])
    );
    const localByEmail = new Map(
        localUsers
            .map(user => [normalizeEmail(user.email), user])
            .filter(([email]) => email)
    );
    const mergedUsers = remoteUsers.map(remoteUser => {
        const localUser = localById.get(String(remoteUser.id))
            || localByEmail.get(normalizeEmail(remoteUser.email));
        return localUser ? { ...remoteUser, ...localUser } : remoteUser;
    });
    const knownIds = new Set(mergedUsers.map(user => String(user.id)));
    const knownEmails = new Set(mergedUsers.map(user => normalizeEmail(user.email)).filter(Boolean));

    for (const localUser of localUsers) {
        const email = normalizeEmail(localUser.email);
        const id = String(localUser.id);
        if (!knownIds.has(id) && (!email || !knownEmails.has(email))) {
            mergedUsers.push(localUser);
            knownIds.add(id);
            if (email) knownEmails.add(email);
        }
    }

    return mergedUsers;
}

export { normalizeEmail };
